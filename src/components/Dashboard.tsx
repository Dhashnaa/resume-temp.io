import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  Calendar,
  Sparkles,
  Bot,
  Upload,
  Loader2
} from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { AIAssistant } from "./AIAssistant";
import { FileUpload } from "./FileUpload";

type DashboardProps = {
  onCreateNew: () => void;
  onEditResume: (id: string) => void;
  onAIGenerate: (resumeData: any) => void;
};

export function Dashboard({ onCreateNew, onEditResume, onAIGenerate }: DashboardProps) {
  const { resumes, loading, deleteResume, improveResumeWithAI } = useResumes();
  const [showAI, setShowAI] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImproveWithAI = async (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;

    setImprovingId(resumeId);
    try {
      const improvedResume = await improveResumeWithAI(resume);
      onAIGenerate(improvedResume);
      toast({
        title: "Success",
        description: "Resume improved with AI successfully!",
      });
    } catch (error) {
      console.error('Failed to improve resume:', error);
      toast({
        title: "Error",
        description: "Failed to improve resume with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-up">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Resumes
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create and manage your professional resumes
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowAI(!showAI)} 
              variant="outline"
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
            <Button 
              onClick={() => setShowUpload(true)} 
              variant="outline"
              className="hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <Button 
              onClick={onCreateNew} 
              className="bg-gradient-primary hover:opacity-90 shadow-elegant"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Resume
            </Button>
          </div>
        </div>

      {showAI && (
        <AIAssistant onResumeGenerated={onAIGenerate} />
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Upload Resume</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowUpload(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-4">
              <FileUpload 
                onUploadSuccess={(resumeData) => {
                  setShowUpload(false);
                  onAIGenerate(resumeData);
                }}
              />
            </div>
          </div>
        </div>
      )}

        {resumes.length === 0 ? (
          <Card className="text-center p-12 shadow-card border-0 bg-card/50 backdrop-blur-sm animate-scale-in">
            <div className="mx-auto w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
              <FileText className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No resumes yet</h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Create your first resume or use AI to get started with professional templates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onCreateNew} 
                className="bg-gradient-primary hover:opacity-90 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Resume
              </Button>
              <Button 
                onClick={() => setShowAI(true)} 
                variant="outline"
                className="px-6 py-3"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate with AI
              </Button>
              <Button 
                onClick={() => setShowUpload(true)} 
                variant="outline"
                className="px-6 py-3"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Resume
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((resume, index) => (
              <Card 
                key={resume.id} 
                className="group hover:shadow-elegant transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                        {resume.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {resume.template_type || 'modern'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => onEditResume(resume.id!)}
                        variant="outline" 
                        size="sm"
                        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleImproveWithAI(resume.id!)}
                        variant="outline" 
                        size="sm"
                        className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                        disabled={improvingId === resume.id}
                      >
                        {improvingId === resume.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        AI Improve
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 hover:bg-secondary hover:text-secondary-foreground transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 hover:bg-success hover:text-success-foreground transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                    <Button 
                      onClick={() => deleteResume(resume.id!)}
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}