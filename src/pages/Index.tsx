import { useState, useEffect } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { ResumeForm } from "@/components/ResumeForm";
import { Navigation } from "@/components/Navigation";
import { Profile } from "@/components/Profile";
import { Settings } from "@/components/Settings";
import { useAuth } from "@/hooks/useAuth";
import { ResumeData } from "@/hooks/useResumes";
import { Toaster } from "@/components/ui/toaster";

type AppState = "auth" | "dashboard" | "form";

const Index = () => {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("dashboard");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingResumeId, setEditingResumeId] = useState<string | undefined>();
  const [aiGeneratedData, setAIGeneratedData] = useState<ResumeData | undefined>();

  useEffect(() => {
    if (user) {
      setAppState("dashboard");
    }
  }, [user]);

  const handleCreateNew = () => {
    setEditingResumeId(undefined);
    setAIGeneratedData(undefined);
    setAppState("form");
    setActiveTab("create");
  };

  const handleEditResume = (id: string) => {
    setEditingResumeId(id);
    setAIGeneratedData(undefined);
    setAppState("form");
    setActiveTab("create");
  };

  const handleAIGenerate = (resumeData: ResumeData) => {
    setEditingResumeId(undefined);
    setAIGeneratedData(resumeData);
    setAppState("form");
    setActiveTab("create");
  };

  const handleCancelForm = () => {
    setEditingResumeId(undefined);
    setAIGeneratedData(undefined);
    setAppState("dashboard");
    setActiveTab("dashboard");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "dashboard") {
      setAppState("dashboard");
    } else if (tab === "create") {
      setAppState("form");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation - Desktop */}
        <div className="hidden md:block w-64 border-r border-border/50 bg-card/50">
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ResumeBuilder
            </h2>
          </div>
          <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {appState === "dashboard" && (
            <Dashboard 
              onCreateNew={handleCreateNew}
              onEditResume={handleEditResume}
              onAIGenerate={handleAIGenerate}
            />
          )}
          
          {appState === "form" && (
            <ResumeForm
              onCancel={handleCancelForm}
              editingId={editingResumeId}
              aiGeneratedData={aiGeneratedData}
            />
          )}

          {activeTab === "profile" && <Profile />}

          {activeTab === "settings" && <Settings />}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
