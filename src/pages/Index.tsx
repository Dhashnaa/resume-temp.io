import { useState } from "react";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { ResumeForm } from "@/components/ResumeForm";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";

type AppState = "auth" | "dashboard" | "form";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("auth");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAppState("dashboard");
  };

  const handleCreateNew = () => {
    setAppState("form");
    setActiveTab("create");
  };

  const handleEditResume = (id: string) => {
    setAppState("form");
    setActiveTab("create");
  };

  const handleSaveResume = (data: any) => {
    // Here you would save to Supabase
    console.log("Saving resume:", data);
    setAppState("dashboard");
    setActiveTab("dashboard");
  };

  const handleCancelForm = () => {
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

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
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
            />
          )}
          
          {appState === "form" && (
            <ResumeForm
              onSave={handleSaveResume}
              onCancel={handleCancelForm}
            />
          )}

          {activeTab === "profile" && (
            <Card className="p-8 text-center animate-fade-up">
              <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
              <p className="text-muted-foreground">
                Connect to Supabase to enable user profiles and authentication.
              </p>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="p-8 text-center animate-fade-up">
              <h2 className="text-2xl font-bold mb-4">App Settings</h2>
              <p className="text-muted-foreground">
                Theme toggle and other settings available in the navigation.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Index;
