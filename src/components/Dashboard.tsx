import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  Calendar,
  Sparkles,
  Bot
} from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import { AIAssistant } from "./AIAssistant";

type DashboardProps = {
  onCreateNew: () => void;
  onEditResume: (id: string) => void;
  onAIGenerate: (resumeData: any) => void;
};

export function Dashboard({ onCreateNew, onEditResume, onAIGenerate }: DashboardProps) {
  const { resumes, loading, deleteResume, improveResumeWithAI } = useResumes();
  const [showAI, setShowAI] = useState(false);

  const handleImproveWithAI = async (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;

    try {
      const improvedResume = await improveResumeWithAI(resume);
      onAIGenerate(improvedResume);
    } catch (error) {
      console.error('Failed to improve resume:', error);
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
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            My Resumes
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your professional resumes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAI(!showAI)} variant="outline">
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button onClick={onCreateNew} variant="hero">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </div>
      </div>

      {showAI && (
        <AIAssistant onResumeGenerated={onAIGenerate} />
      )}

      {resumes.length === 0 ? (
        <Card className="text-center p-8 animate-scale-in">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first resume or use AI to get started
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={onCreateNew} variant="hero">
              <Plus className="h-4 w-4" />
              Create Resume
            </Button>
            <Button onClick={() => setShowAI(true)} variant="outline">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="animate-scale-in hover:shadow-elegant transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{resume.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">{resume.template_type || 'modern'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => onEditResume(resume.id!)}
                    variant="outline" 
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleImproveWithAI(resume.id!)}
                    variant="outline" 
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Improve
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <Button 
                  onClick={() => deleteResume(resume.id!)}
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}