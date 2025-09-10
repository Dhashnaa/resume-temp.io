import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, MessageCircle, Upload, Wand2 } from "lucide-react";
import { useResumes, ResumeData } from "@/hooks/useResumes";
import { useToast } from "@/components/ui/use-toast";

type AIAssistantProps = {
  onResumeGenerated?: (resumeData: ResumeData) => void;
};

export function AIAssistant({ onResumeGenerated }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'chat' | 'upload'>('generate');
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const { generateResumeWithAI, improveResumeWithAI, askAI, uploadResume } = useResumes();
  const { toast } = useToast();

  const handleGenerateResume = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const resumeData = await generateResumeWithAI(prompt);
      onResumeGenerated?.(resumeData);
      setPrompt("");
      toast({
        title: "Success!",
        description: "AI-generated resume is ready for editing",
      });
    } catch (error) {
      console.error('Generate resume error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    
    try {
      const response = await askAI(question);
      setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
      setQuestion("");
    } catch (error) {
      console.error('Ask AI error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setLoading(true);
    
    try {
      await uploadResume(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'improve', label: 'Improve', icon: Wand2 },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'upload', label: 'Upload', icon: Upload },
  ];

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Resume Assistant
        </CardTitle>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1"
              >
                <Icon className="h-4 w-4 mr-1" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Generate Resume with AI</h4>
              <p className="text-sm text-muted-foreground">
                Describe your background, skills, and experience to generate a professional resume
              </p>
            </div>
            <Textarea
              placeholder="Example: I am a software engineer with 5 years of experience in React, Node.js, and Python. I have worked at tech startups and led multiple projects..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleGenerateResume}
              disabled={loading || !prompt.trim()}
              className="w-full"
              variant="hero"
            >
              {loading ? "Generating..." : "Generate Resume"}
            </Button>
          </div>
        )}

        {activeTab === 'improve' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Improve Existing Resume</h4>
              <p className="text-sm text-muted-foreground">
                Select a resume from your dashboard to improve it with AI suggestions
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-muted-foreground">
                Go to your dashboard and click "Improve with AI" on any resume
              </p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Ask AI Assistant</h4>
              <p className="text-sm text-muted-foreground">
                Get career advice, resume tips, and answers to your questions
              </p>
            </div>
            
            {chatHistory.length > 0 && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Ask about resume writing, career advice, interview tips..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button 
                onClick={handleAskQuestion}
                disabled={loading || !question.trim()}
              >
                {loading ? "..." : "Ask"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Upload Resume File</h4>
              <p className="text-sm text-muted-foreground">
                Upload your existing resume (PDF or Word) for storage and analysis
              </p>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to upload or drag and drop your resume file
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <Button 
                onClick={() => document.getElementById('resume-upload')?.click()}
                disabled={loading}
                variant="outline"
              >
                {loading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
            
            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Badge variant="secondary">{uploadedFile.name}</Badge>
                <span className="text-sm text-muted-foreground">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}