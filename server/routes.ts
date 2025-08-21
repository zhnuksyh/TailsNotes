import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertSessionSchema, insertFileSchema } from "@shared/schema";
import { generateNotesFromText, generateQuizFromText } from "./services/openai";
import { processFile, saveUploadedFile } from "./services/fileProcessor";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and PowerPoint files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  // Get current user (demo endpoint)
  app.get("/api/user", async (req, res) => {
    try {
      // For demo, return the demo user
      const user = await storage.getUser("demo-user-1");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const userId = "demo-user-1"; // For demo
      const sessions = await storage.getSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error getting sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { title } = req.body;
      const userId = "demo-user-1"; // For demo

      const sessionData = insertSessionSchema.parse({
        userId,
        title: title || "New Learning Session",
      });

      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Upload files to session
  app.post("/api/sessions/:sessionId/upload", upload.array('files', 10), async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Verify session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const uploadedFiles = [];

      for (const file of files) {
        try {
          // Save file to disk
          const filePath = await saveUploadedFile(file, UPLOAD_DIR);
          
          // Create file record
          const fileData = insertFileSchema.parse({
            sessionId,
            filename: path.basename(filePath),
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          });

          const uploadedFile = await storage.createFile(fileData);
          uploadedFiles.push(uploadedFile);

          // Update file status to processing
          await storage.updateFile(uploadedFile.id, { status: "processing" });
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          // Continue with other files
        }
      }

      res.json({ 
        message: "Files uploaded successfully", 
        files: uploadedFiles 
      });

      // Process files in background
      processFilesInBackground(uploadedFiles, UPLOAD_DIR);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Get session files
  app.get("/api/sessions/:sessionId/files", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = await storage.getFilesBySessionId(sessionId);
      res.json(files);
    } catch (error) {
      console.error("Error getting files:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get session notes
  app.get("/api/sessions/:sessionId/notes", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const notes = await storage.getNotesBySessionId(sessionId);
      res.json(notes);
    } catch (error) {
      console.error("Error getting notes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get session quizzes
  app.get("/api/sessions/:sessionId/quizzes", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const quizzes = await storage.getQuizzesBySessionId(sessionId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error getting quizzes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Process files and generate content
  app.post("/api/sessions/:sessionId/process", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { generateNotes = true, generateQuiz = true } = req.body;

      // Get session files
      const files = await storage.getFilesBySessionId(sessionId);
      
      if (files.length === 0) {
        return res.status(400).json({ error: "No files found for this session" });
      }

      res.json({ message: "Processing started", sessionId });

      // Process in background
      processSessionContent(sessionId, files, UPLOAD_DIR, { generateNotes, generateQuiz });
    } catch (error) {
      console.error("Error processing session:", error);
      res.status(500).json({ error: "Failed to process session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background processing functions
async function processFilesInBackground(files: any[], uploadDir: string) {
  for (const file of files) {
    try {
      const filePath = path.join(uploadDir, file.filename);
      await processFile(filePath, file.originalName, file.mimeType, file.size);
      
      // Update file status to completed
      await storage.updateFile(file.id, { status: "completed" });
    } catch (error) {
      console.error(`Error processing file ${file.filename}:`, error);
      await storage.updateFile(file.id, { status: "error" });
    }
  }
}

async function processSessionContent(
  sessionId: string, 
  files: any[], 
  uploadDir: string, 
  options: { generateNotes: boolean; generateQuiz: boolean }
) {
  try {
    let combinedContent = '';
    
    // Process all files and combine content
    for (const file of files) {
      try {
        const filePath = path.join(uploadDir, file.filename);
        const processed = await processFile(filePath, file.originalName, file.mimeType, file.size);
        combinedContent += `\n\n=== Content from ${file.originalName} ===\n${processed.text}`;
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
      }
    }

    if (!combinedContent.trim()) {
      console.error('No content extracted from files');
      return;
    }

    // Generate notes if requested
    if (options.generateNotes) {
      try {
        const generatedNotes = await generateNotesFromText(combinedContent, 'Combined Session Content');
        
        await storage.createNote({
          sessionId,
          content: JSON.stringify(generatedNotes),
          metadata: { 
            type: 'ai-generated',
            generatedAt: new Date().toISOString(),
            source: 'openai'
          }
        });
      } catch (error) {
        console.error('Error generating notes:', error);
      }
    }

    // Generate quiz if requested
    if (options.generateQuiz) {
      try {
        const generatedQuiz = await generateQuizFromText(combinedContent, 'Combined Session Content');
        
        await storage.createQuiz({
          sessionId,
          title: generatedQuiz.title,
          questions: generatedQuiz.questions
        });
      } catch (error) {
        console.error('Error generating quiz:', error);
      }
    }
  } catch (error) {
    console.error('Error in background processing:', error);
  }
}
