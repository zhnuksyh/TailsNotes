import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  CloudUpload, 
  FolderOpen, 
  FileText, 
  X, 
  BookOpen,
  Brain,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface FileUploadProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  status: string;
  mimeType: string;
}

export default function FileUpload({ sessionId, onSessionCreated }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [processingStep, setProcessingStep] = useState<'upload' | 'choose' | 'notes' | 'quiz'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string>('');
  const [quizData, setQuizData] = useState<any>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get session files
  const { data: sessionFiles = [] } = useQuery({
    queryKey: ['/api/sessions', sessionId, 'files'],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${sessionId}/files`);
      return res.json();
    },
    enabled: !!sessionId,
  });

  // Query to get session notes
  const { data: sessionNotes = [] } = useQuery({
    queryKey: ['/api/sessions', sessionId, 'notes'],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${sessionId}/notes`);
      return res.json();
    },
    enabled: !!sessionId,
  });

  // Query to get session quizzes
  const { data: sessionQuizzes = [] } = useQuery({
    queryKey: ['/api/sessions', sessionId, 'quizzes'],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await apiRequest("GET", `/api/sessions/${sessionId}/quizzes`);
      return res.json();
    },
    enabled: !!sessionId,
  });

  // Effect to restore session state when sessionId changes
  useEffect(() => {
    if (sessionId && sessionFiles.length > 0) {
      setUploadedFile(sessionFiles[0]); // Set the first file
      
      // Check if we have existing notes or quizzes to determine the state
      if (sessionNotes.length > 0) {
        setGeneratedNotes(sessionNotes[0].content.replace(/^"|"$/g, '')); // Remove quotes if present
        setProcessingStep('notes');
        setShowNotesPanel(true);
      } else if (sessionQuizzes.length > 0) {
        setQuizData(sessionQuizzes[0]);
        setProcessingStep('quiz');
        setShowQuizPanel(true);
      } else {
        setProcessingStep('choose'); // Show choice if files exist but no generated content
      }
    } else if (sessionId) {
      // Session exists but no files, reset to upload state
      setProcessingStep('upload');
      setUploadedFile(null);
      setGeneratedNotes('');
      setQuizData(null);
      setShowNotesPanel(false);
      setShowQuizPanel(false);
    }
  }, [sessionId, sessionFiles, sessionNotes, sessionQuizzes]);

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest("POST", "/api/sessions", { title });
      return res.json();
    },
    onSuccess: (data) => {
      onSessionCreated(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
  });

  // Upload single file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, targetSessionId }: { file: File; targetSessionId: string }) => {
      const formData = new FormData();
      formData.append('files', file);
      
      const res = await fetch(`/api/sessions/${targetSessionId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.files && data.files.length > 0) {
        setUploadedFile(data.files[0]);
        setProcessingStep('choose');
      }
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload successful",
        description: "File uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  // Generate notes mutation
  const generateNotesMutation = useMutation({
    mutationFn: async ({ targetSessionId, fileId }: { targetSessionId: string; fileId: string }) => {
      const res = await apiRequest("POST", `/api/sessions/${targetSessionId}/generate-notes`, { fileId });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      setProcessingStep('notes');
      setIsGeneratingNotes(false);
      setShowNotesPanel(true);
      toast({
        title: "Notes generated",
        description: "Your study notes are ready!",
      });
    },
    onError: (error) => {
      setIsGeneratingNotes(false);
      toast({
        title: "Error generating notes",
        description: "There was an error generating your notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate quiz mutation
  const generateQuizMutation = useMutation({
    mutationFn: async ({ targetSessionId, fileId }: { targetSessionId: string; fileId: string }) => {
      const res = await apiRequest("POST", `/api/sessions/${targetSessionId}/generate-quiz`, { fileId });
      return res.json();
    },
    onSuccess: (data) => {
      setQuizData(data.quiz);
      setProcessingStep('quiz');
      setIsGeneratingQuiz(false);
      setShowQuizPanel(true);
      toast({
        title: "Quiz generated",
        description: "Your quiz is ready!",
      });
    },
    onError: (error) => {
      setIsGeneratingQuiz(false);
      toast({
        title: "Error generating quiz",
        description: "There was an error generating your quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    // Only allow one file
    if (files.length > 1) {
      toast({
        title: "Multiple files not allowed",
        description: "Please upload only one file at a time.",
        variant: "destructive",
      });
      return;
    }

    const file = files[0];
    if (!file) return;

    // Validate file
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!validTypes.includes(file.type) || file.size > 50 * 1024 * 1024) {
      toast({
        title: "Invalid file",
        description: "Please select a PDF or PowerPoint file under 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Create session if needed
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      setIsUploading(true);
      setUploadProgress(10);
      
      try {
        const newSession = await createSessionMutation.mutateAsync("New Learning Session");
        targetSessionId = newSession.id;
        setUploadProgress(30);
      } catch (error) {
        setIsUploading(false);
        return;
      }
    }

    // Upload file
    setIsUploading(true);
    setUploadProgress(50);

    try {
      await uploadFileMutation.mutateAsync({ file, targetSessionId: targetSessionId! });
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateNotes = async () => {
    if (!sessionId || !uploadedFile) return;
    
    setIsGeneratingNotes(true);
    try {
      await generateNotesMutation.mutateAsync({ 
        targetSessionId: sessionId, 
        fileId: uploadedFile.id 
      });
    } catch (error) {
      setIsGeneratingNotes(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!sessionId || !uploadedFile) return;
    
    setIsGeneratingQuiz(true);
    try {
      await generateQuizMutation.mutateAsync({ 
        targetSessionId: sessionId, 
        fileId: uploadedFile.id 
      });
    } catch (error) {
      setIsGeneratingQuiz(false);
    }
  };

  const handleBackToUpload = () => {
    setUploadedFile(null);
    setProcessingStep('upload');
    setGeneratedNotes('');
    setQuizData(null);
    setShowNotesPanel(false);
    setShowQuizPanel(false);
    setIsGeneratingNotes(false);
    setIsGeneratingQuiz(false);
  };

  const handleBackToChoose = () => {
    setProcessingStep('choose');
    setShowNotesPanel(false);
    setShowQuizPanel(false);
  };

  const getFileIcon = () => {
    if (!uploadedFile) return <FileText className="h-6 w-6 text-primary-foreground" />;
    
    if (uploadedFile.mimeType === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    return <FileText className="h-6 w-6 text-orange-500" />;
  };

  // Render upload step
  if (processingStep === 'upload') {
    return (
      <div className="space-y-6">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-poppins">Upload Your Slides</h2>
            <p className="text-muted-foreground font-helvetica">Drag and drop your file or click to browse</p>
          </div>
          
          <div 
            className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
              ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-primary/5'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-orange-yellow rounded-2xl flex items-center justify-center shadow-lg">
                  <CloudUpload className="text-primary-foreground h-8 w-8" />
                </div>
              </div>
              
              <div>
                <p className="text-lg font-medium text-foreground mb-2 font-poppins">Drop your file here</p>
                <p className="text-muted-foreground mb-4 font-helvetica">or click to browse from your computer</p>
                
                <Button 
                  className="bg-gradient-orange-yellow hover:hover:bg-primary/90 text-primary-foreground font-medium transition-all px-6 py-2"
                  type="button"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground font-helvetica">
                Supports PDF and PowerPoint files up to 50MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileSelect}
          />

          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render choice step
  if (processingStep === 'choose' && uploadedFile) {
    return (
      <div className="space-y-6">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-poppins">File Uploaded Successfully</h2>
            <p className="text-muted-foreground font-helvetica">What would you like to create?</p>
          </div>

          {/* File info */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              {getFileIcon()}
              <div className="flex-1">
                <p className="font-medium text-foreground">{uploadedFile.originalName}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToUpload}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleCreateNotes}
              disabled={isGeneratingNotes || isGeneratingQuiz}
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-orange-yellow hover:bg-primary/90 text-primary-foreground"
            >
              {isGeneratingNotes ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <BookOpen className="h-6 w-6" />
              )}
              <span className="font-medium">
                {isGeneratingNotes ? "Generating..." : "Create Notes"}
              </span>
            </Button>

            <Button
              onClick={handleCreateQuiz}
              disabled={isGeneratingNotes || isGeneratingQuiz}
              className="h-24 flex flex-col items-center justify-center space-y-2 bg-gradient-orange-yellow hover:bg-primary/90 text-primary-foreground"
            >
              {isGeneratingQuiz ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Brain className="h-6 w-6" />
              )}
              <span className="font-medium">
                {isGeneratingQuiz ? "Generating..." : "Create Quiz"}
              </span>
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleBackToUpload}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Upload Another File
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render notes step
  if (processingStep === 'notes') {
    return (
      <div className="space-y-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-poppins">Study Notes</h2>
            <Button
              variant="outline"
              onClick={handleBackToChoose}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-lg max-h-[70vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="prose prose-lg max-w-none notes-container">
                <style>{`
                  .notes-container h1, .notes-container h2, .notes-container h3 {
                    font-family: 'Poppins', sans-serif;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                  }
                  .notes-container h1 {
                    color: #1e3a8a;
                    background: #fef3c7;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    font-size: 1.5rem;
                  }
                  .notes-container h2 {
                    color: #ea580c;
                    background: #fed7aa;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    font-size: 1.25rem;
                  }
                  .notes-container h3 {
                    color: #16a34a;
                    background: #dcfce7;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 1.125rem;
                  }
                  .notes-container mark {
                    background: #fbbf24;
                    color: #1f2937;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                  }
                  .notes-container ul, .notes-container ol {
                    margin: 0.75rem 0;
                    padding-left: 1.5rem;
                  }
                  .notes-container li {
                    margin: 0.5rem 0;
                    line-height: 1.6;
                  }
                  .notes-container strong {
                    color: #7c2d12;
                    font-weight: 600;
                  }
                  .notes-container em {
                    color: #7c3aed;
                    font-style: italic;
                  }
                  .notes-container p {
                    margin: 0.75rem 0;
                    line-height: 1.7;
                    color: #374151;
                  }
                  .dark .notes-container p {
                    color: #d1d5db;
                  }
                  .dark .notes-container h1 {
                    color: #60a5fa;
                    background: #1e3a8a;
                  }
                  .dark .notes-container h2 {
                    color: #fb923c;
                    background: #9a3412;
                  }
                  .dark .notes-container h3 {
                    color: #4ade80;
                    background: #166534;
                  }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: generatedNotes }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render quiz step
  if (processingStep === 'quiz' && quizData) {
    return (
      <div className="space-y-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-poppins">Quiz</h2>
            <Button
              variant="outline"
              onClick={handleBackToChoose}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900 border border-border rounded-xl shadow-lg">
            <div className="p-6 space-y-6">
              {quizData.questions?.map((question: any, index: number) => (
                <QuizQuestion 
                  key={index} 
                  question={question} 
                  questionNumber={index + 1} 
                />
              ))}
              
              <div className="text-center pt-6 border-t border-border">
                <Button
                  className="bg-gradient-orange-yellow hover:bg-primary/90 text-primary-foreground px-8 py-3"
                  onClick={() => {
                    // Calculate score logic would go here
                    toast({
                      title: "Quiz completed!",
                      description: "Check your answers and explanations above.",
                    });
                  }}
                >
                  Submit Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Quiz Question Component
interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  questionNumber: number;
}

function QuizQuestion({ question, questionNumber }: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-4 text-lg">
        {questionNumber}. {question.question}
      </h3>
      
      <div className="space-y-3 mb-4">
        {question.options.map((option: string, optionIndex: number) => {
          let buttonClass = "flex items-center space-x-3 w-full p-3 text-left rounded-lg border transition-all ";
          
          if (showResult) {
            if (optionIndex === question.correctAnswer) {
              buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
            } else if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
              buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
            } else {
              buttonClass += "border-border bg-card text-muted-foreground";
            }
          } else {
            if (selectedAnswer === optionIndex) {
              buttonClass += "border-primary bg-primary/10 text-foreground";
            } else {
              buttonClass += "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground";
            }
          }

          return (
            <button
              key={optionIndex}
              className={buttonClass}
              onClick={() => handleAnswerSelect(optionIndex)}
              disabled={showResult}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedAnswer === optionIndex 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground'
              }`}>
                {selectedAnswer === optionIndex && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
              <span className="flex-1">{option}</span>
              {showResult && optionIndex === question.correctAnswer && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {showResult && optionIndex === selectedAnswer && optionIndex !== question.correctAnswer && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </button>
          );
        })}
      </div>

      {!showResult && selectedAnswer !== null && (
        <Button
          onClick={handleSubmit}
          className="bg-gradient-orange-yellow hover:bg-primary/90 text-primary-foreground"
        >
          Submit Answer
        </Button>
      )}

      {showResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          isCorrect 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className={`text-sm ${
            isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}