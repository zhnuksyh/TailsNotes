import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  CloudUpload, 
  FolderOpen, 
  FileText, 
  File, 
  X, 
  Check, 
  Loader2,
  Sparkles 
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [generateNotes, setGenerateNotes] = useState(true);
  const [generateQuiz, setGenerateQuiz] = useState(true);
  const [processingFocus, setProcessingFocus] = useState("comprehensive");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: async ({ files, targetSessionId }: { files: File[]; targetSessionId: string }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
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
      setUploadedFiles(data.files);
      toast({
        title: "Files uploaded successfully",
        description: `${data.files.length} file(s) uploaded and ready for processing.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Process files mutation
  const processFilesMutation = useMutation({
    mutationFn: async ({ targetSessionId, options }: { targetSessionId: string; options: any }) => {
      const res = await apiRequest("POST", `/api/sessions/${targetSessionId}/process`, options);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Processing started",
        description: "Your files are being processed. This may take a few minutes.",
      });
      setIsProcessing(true);
      // In a real app, you'd poll for status or use websockets
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "Processing complete",
          description: "Your notes and quizzes are ready!",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      }, 5000);
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
    // Validate files
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select PDF or PowerPoint files under 50MB.",
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

    // Upload files
    setIsUploading(true);
    setUploadProgress(50);

    try {
      await uploadFilesMutation.mutateAsync({ files: validFiles, targetSessionId: targetSessionId! });
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

  const handleProcessFiles = async () => {
    if (!sessionId || uploadedFiles.length === 0) {
      toast({
        title: "No files to process",
        description: "Please upload files first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await processFilesMutation.mutateAsync({
        targetSessionId: sessionId,
        options: { generateNotes, generateQuiz }
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your files.",
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(files => files.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <File className="h-6 w-6 text-primary-foreground" />;
    }
    return <FileText className="h-6 w-6 text-primary-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 font-poppins">Upload Your Slides</h2>
            <p className="text-muted-foreground font-helvetica">Drag and drop your files or click to browse</p>
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
                <p className="text-lg font-medium text-foreground mb-2 font-poppins">Drop your files here</p>
                <p className="text-muted-foreground mb-4 font-helvetica">or click to browse from your computer</p>
                
                <Button 
                  className="bg-gradient-orange-yellow hover:hover:bg-primary/90 text-primary-foreground font-medium transition-all px-6 py-2"
                  type="button"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.ppt,.pptx" 
                  multiple 
                  onChange={handleFileSelect}
                />
              </div>
              
              <div className="text-sm text-muted-foreground font-helvetica">
                <p>Supported: PDF, PowerPoint (.ppt, .pptx)</p>
                <p>Max size: 50MB per file</p>
              </div>
            </div>
          </div>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-8">
              <Progress value={uploadProgress} className="mb-3" />
              <p className="text-sm text-muted-foreground text-center font-helvetica">Uploading and processing your files...</p>
            </div>
          )}
          
          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-foreground mb-4 font-poppins">Uploaded Files</h3>
              
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-orange rounded-xl flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground font-poppins">{file.originalName}</p>
                        <p className="text-sm text-muted-foreground font-helvetica">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'completed' && (
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full flex items-center gap-1 font-poppins">
                          <Check className="h-3 w-3" />
                          Processed
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 p-1"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Processing Options */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 p-4 bg-card border border-border rounded-xl">
              <h3 className="font-semibold text-foreground mb-4 font-poppins">Processing Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="generateNotes" 
                    checked={generateNotes}
                    onCheckedChange={(checked) => setGenerateNotes(checked === true)}
                  />
                  <Label htmlFor="generateNotes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-poppins">
                    Generate Notes
                    <p className="text-xs text-muted-foreground mt-1 font-helvetica">Create structured notes from your content</p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="generateQuiz" 
                    checked={generateQuiz}
                    onCheckedChange={(checked) => setGenerateQuiz(checked === true)}
                  />
                  <Label htmlFor="generateQuiz" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-poppins">
                    Create Quizzes
                    <p className="text-xs text-muted-foreground mt-1 font-helvetica">Generate interactive quiz questions</p>
                  </Label>
                </div>
              </div>
              
              <div className="mb-6">
                <Label className="text-sm font-medium text-foreground mb-2 block font-poppins">
                  Processing Focus
                </Label>
                <Select value={processingFocus} onValueChange={setProcessingFocus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                    <SelectItem value="key-concepts">Key Concepts Only</SelectItem>
                    <SelectItem value="quick-summary">Quick Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Deep-dive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-gradient-orange-yellow hover:hover:bg-primary/90 text-primary-foreground font-medium transition-all py-3"
                  onClick={handleProcessFiles}
                  disabled={isProcessing || uploadedFiles.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Process with AI
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={clearAllFiles}
                  disabled={isProcessing}
                  className="border-border text-muted-foreground hover:text-foreground font-helvetica"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
