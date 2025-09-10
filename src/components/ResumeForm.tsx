import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Sparkles } from "lucide-react";
import { useResumes, ResumeData } from "@/hooks/useResumes";
import { useToast } from "@/components/ui/use-toast";

type FormData = {
  title: string;
  personal_info: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
};

const initialData: FormData = {
  title: "My Resume",
  personal_info: {
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  education: [{ school: "", degree: "", year: "" }],
  experience: [{ company: "", position: "", duration: "", description: "" }],
  skills: [],
};

type ResumeFormProps = {
  onCancel: () => void;
  initialData?: ResumeData;
  editingId?: string;
  aiGeneratedData?: ResumeData;
};

export function ResumeForm({ onCancel, initialData, editingId, aiGeneratedData }: ResumeFormProps) {
  const { saveResume, improveResumeWithAI } = useResumes();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialData ? {
    title: initialData.title,
    personal_info: initialData.personal_info,
    education: initialData.education,
    experience: initialData.experience,
    skills: initialData.skills,
  } : initialData);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aiGeneratedData) {
      setFormData({
        title: aiGeneratedData.title || "AI Generated Resume",
        personal_info: aiGeneratedData.personal_info,
        education: aiGeneratedData.education,
        experience: aiGeneratedData.experience,
        skills: aiGeneratedData.skills,
      });
    }
  }, [aiGeneratedData]);

  const updatePersonal = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", year: "" }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "", position: "", duration: "", description: "" }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const resumeData: ResumeData = {
        ...(editingId && { id: editingId }),
        ...formData,
      };
      await saveResume(resumeData);
      onCancel(); // Go back to dashboard after saving
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImproveWithAI = async () => {
    setLoading(true);
    try {
      const resumeData: ResumeData = {
        ...(editingId && { id: editingId }),
        ...formData,
      };
      const improvedData = await improveResumeWithAI(resumeData);
      setFormData({
        title: improvedData.title || formData.title,
        personal_info: improvedData.personal_info,
        education: improvedData.education,
        experience: improvedData.experience,
        skills: improvedData.skills,
      });
      toast({
        title: "Resume Improved!",
        description: "AI has enhanced your resume with better content and formatting.",
      });
    } catch (error) {
      console.error('Improve error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          {editingId ? "Edit Resume" : "Create Resume"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleImproveWithAI} variant="outline" disabled={loading}>
            <Sparkles className="h-4 w-4" />
            {loading ? "Improving..." : "Improve with AI"}
          </Button>
          <Button onClick={handleSave} variant="hero" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Resume"}
          </Button>
        </div>
      </div>

      {/* Resume Title */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>Resume Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Software Engineer Resume"
          />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.personal_info.name}
                onChange={(e) => updatePersonal("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.personal_info.email}
                onChange={(e) => updatePersonal("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.personal_info.phone}
                onChange={(e) => updatePersonal("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.personal_info.location}
                onChange={(e) => updatePersonal("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={formData.personal_info.summary}
              onChange={(e) => updatePersonal("summary", e.target.value)}
              placeholder="Brief summary of your professional background and key achievements..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button onClick={addEducation} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.education.map((edu, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Education {index + 1}</h4>
                {formData.education.length > 1 && (
                  <Button
                    onClick={() => removeEducation(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>School/University</Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                    placeholder="Stanford University"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(index, "year", e.target.value)}
                    placeholder="2020-2024"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button onClick={addExperience} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.experience.map((exp, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Experience {index + 1}</h4>
                {formData.experience.length > 1 && (
                  <Button
                    onClick={() => removeExperience(index)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    placeholder="Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, "position", e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, "duration", e.target.value)}
                    placeholder="Jan 2022 - Present"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, "description", e.target.value)}
                  placeholder="Describe your key responsibilities and achievements..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="animate-scale-in" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} variant="outline">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10 transition-smooth"
                onClick={() => removeSkill(index)}
              >
                {skill}
                <Trash2 className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}