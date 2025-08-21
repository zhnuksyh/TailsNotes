import { type User, type InsertUser, type Session, type InsertSession, type UploadedFile, type InsertFile, type Note, type InsertNote, type Quiz, type InsertQuiz, type SessionWithStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sessions
  getSession(id: string): Promise<Session | undefined>;
  getSessionsByUserId(userId: string): Promise<SessionWithStats[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined>;

  // Files
  getFile(id: string): Promise<UploadedFile | undefined>;
  getFilesBySessionId(sessionId: string): Promise<UploadedFile[]>;
  createFile(file: InsertFile): Promise<UploadedFile>;
  updateFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined>;

  // Notes
  getNotesBySessionId(sessionId: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;

  // Quizzes
  getQuizzesBySessionId(sessionId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, Session>;
  private files: Map<string, UploadedFile>;
  private notes: Map<string, Note>;
  private quizzes: Map<string, Quiz>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.files = new Map();
    this.notes = new Map();
    this.quizzes = new Map();

    // Create a demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "john_doe",
      email: "john.doe@university.edu",
      password: "demo-password",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByUserId(userId: string): Promise<SessionWithStats[]> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    return userSessions.map(session => {
      const sessionFiles = Array.from(this.files.values()).filter(f => f.sessionId === session.id);
      const sessionNotes = Array.from(this.notes.values()).filter(n => n.sessionId === session.id);
      const sessionQuizzes = Array.from(this.quizzes.values()).filter(q => q.sessionId === session.id);
      
      const quizQuestionsCount = sessionQuizzes.reduce((acc, quiz) => {
        return acc + (Array.isArray(quiz.questions) ? quiz.questions.length : 0);
      }, 0);

      return {
        ...session,
        filesCount: sessionFiles.length,
        notesCount: sessionNotes.length,
        quizQuestionsCount,
      };
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getFile(id: string): Promise<UploadedFile | undefined> {
    return this.files.get(id);
  }

  async getFilesBySessionId(sessionId: string): Promise<UploadedFile[]> {
    return Array.from(this.files.values()).filter(file => file.sessionId === sessionId);
  }

  async createFile(insertFile: InsertFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = {
      ...insertFile,
      id,
      status: "uploaded",
      createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async getNotesBySessionId(sessionId: string): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.sessionId === sessionId);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const note: Note = {
      ...insertNote,
      id,
      metadata: insertNote.metadata || null,
      createdAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async getQuizzesBySessionId(sessionId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.sessionId === sessionId);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = randomUUID();
    const quiz: Quiz = {
      ...insertQuiz,
      id,
      createdAt: new Date(),
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }
}

export const storage = new MemStorage();
