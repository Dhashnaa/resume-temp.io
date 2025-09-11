import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Settings as SettingsIcon, Bell, Download, Trash2, LogOut } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState("pdf");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "Your data export will be ready shortly.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center mb-8 animate-fade-up">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">Customize your resume builder experience</p>
      </div>
      
      <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
          <CardTitle className="flex items-center justify-center gap-2 relative z-10 text-2xl">
            <SettingsIcon className="h-6 w-6" />
            Application Settings
          </CardTitle>
          <CardDescription className="relative z-10 text-base">
            Customize your resume builder experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-2">
            <Label>Theme Preference</Label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark/Light Mode</p>
                <p className="text-xs text-muted-foreground">
                  Toggle between dark and light themes
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications about resume updates
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-save</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically save changes as you type
                  </p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Settings */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Preferences
            </Label>
            
            <div>
              <Label htmlFor="format" className="text-sm">Default Download Format</Label>
              <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="docx">Word Document</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="shadow-card border-0 bg-card/60 backdrop-blur-sm animate-fade-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Management</CardTitle>
          <CardDescription className="text-base">
            Manage your account data and security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="w-full justify-start"
          >
            <Download className="mr-2 h-4 w-4" />
            Export My Data
          </Button>

          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <Separator />

          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            className="w-full justify-start"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground">
            This action cannot be undone. Please contact support for account deletion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}