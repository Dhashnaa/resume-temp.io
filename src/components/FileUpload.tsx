import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";

type FileUploadProps = {
  onUploadSuccess: (resumeData: any) => void;
};

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadResume } = useResumes();
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadResume(file);
      
      toast({
        title: "Upload successful",
        description: "Your resume has been uploaded and processed.",
      });

      // Pass the AI-generated resume data to parent component
      onUploadSuccess(result);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload and process your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Existing Resume
        </CardTitle>
        <CardDescription>
          Upload your existing resume (PDF, Word, or text file) and we'll help you improve it with AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Processing your resume...</p>
                <p className="text-sm text-muted-foreground">
                  Our AI is analyzing and extracting information from your file.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {dragActive ? "Drop your resume here" : "Drag and drop your resume"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <Button onClick={handleButtonClick} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports PDF, Word documents, and text files (max 10MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-primary">Drop to upload</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}