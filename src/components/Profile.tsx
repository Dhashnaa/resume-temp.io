import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Calendar } from "lucide-react";

type ProfileData = {
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
};

export function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email || "",
          avatar_url: data.avatar_url || "",
          created_at: data.created_at,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">Profile</h1>
          <p className="text-muted-foreground text-lg">Manage your personal information and account settings</p>
        </div>
      
      <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
          <CardTitle className="flex items-center justify-center gap-2 relative z-10">
            <User className="h-6 w-6" />
            Profile Information
          </CardTitle>
          <CardDescription className="relative z-10 text-base">
            Manage your personal information and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
            <Avatar className="h-32 w-32 shadow-glow ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-white">
                {profile.full_name ? getInitials(profile.full_name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold mb-2">{profile.full_name || 'Your Name'}</h3>
              <p className="text-muted-foreground mb-4">Profile Picture</p>
              <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                Change Photo
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                  className="pl-10"
                />
              </div>
            </div>

            {profile.created_at && (
              <div>
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full bg-gradient-primary hover:opacity-90 shadow-elegant text-lg py-6"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card className="shadow-card border-0 bg-card/60 backdrop-blur-sm animate-fade-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <p className="text-3xl font-bold text-primary mb-1">0</p>
              <p className="text-sm text-muted-foreground">Resumes Created</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5">
              <p className="text-3xl font-bold text-accent mb-1">0</p>
              <p className="text-sm text-muted-foreground">Templates Used</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5">
              <p className="text-3xl font-bold text-success mb-1">0</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5">
              <p className="text-3xl font-bold text-secondary-foreground mb-1">0</p>
              <p className="text-sm text-muted-foreground">AI Improvements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}