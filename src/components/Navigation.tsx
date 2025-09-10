import { FileText, Settings, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavigationProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Resumes", icon: FileText },
    { id: "create", label: "Create", icon: Plus },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50 px-4 py-2 z-50 md:relative md:border-t-0 md:border-r md:bg-transparent md:backdrop-blur-none md:px-6 md:py-6">
      <div className="flex justify-around items-center md:flex-col md:gap-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(id)}
            className={`flex flex-col gap-1 h-auto py-2 px-3 md:flex-row md:w-full md:justify-start transition-smooth ${
              activeTab === id ? "shadow-card" : ""
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </Button>
        ))}
        <div className="md:mt-auto">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}