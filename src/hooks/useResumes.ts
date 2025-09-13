import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type ResumeData = {
  id?: string;
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
  template_type?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  is_public?: boolean;
};

export function useResumes() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setResumes(data?.map(item => ({
        ...item,
        personal_info: item.personal_info as any,
        education: item.education as any,
        experience: item.experience as any,
        skills: item.skills as any,
      })) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch resumes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (resumeData: ResumeData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        title: resumeData.title,
        personal_info: resumeData.personal_info,
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        template_type: resumeData.template_type || 'modern',
      };

      if (resumeData.id) {
        const { data, error } = await supabase
          .from('resumes')
          .update(payload)
          .eq('id', resumeData.id)
          .select()
          .single();

        if (error) throw error;
        
        setResumes(prev => prev.map(r => r.id === resumeData.id ? {
          ...data,
          personal_info: data.personal_info as any,
          education: data.education as any,
          experience: data.experience as any,
          skills: data.skills as any,
        } : r));
        toast({
          title: "Success",
          description: "Resume updated successfully",
        });
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        
        setResumes(prev => [{
          ...data,
          personal_info: data.personal_info as any,
          education: data.education as any,
          experience: data.experience as any,
          skills: data.skills as any,
        }, ...prev]);
        toast({
          title: "Success",
          description: "Resume created successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save resume",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResumes(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Resume deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    }
  };

  const generateResumeWithAI = async (prompt: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-builder', {
        body: { prompt, action: 'generate_resume' }
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate resume with AI",
        variant: "destructive",
      });
      throw error;
    }
  };

  const improveResumeWithAI = async (resumeData: ResumeData) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-builder', {
        body: { 
          prompt: JSON.stringify(resumeData), 
          action: 'improve_resume' 
        }
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to improve resume with AI",
        variant: "destructive",
      });
      throw error;
    }
  };

  const askAI = async (question: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-builder', {
        body: { 
          prompt: question, 
          action: 'answer_query' 
        }
      });

      if (error) throw error;

      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadResume = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (storageError) throw storageError;

      // Create resume record in database
      const resumeData = {
        user_id: user.id,
        title: `Uploaded Resume - ${file.name}`,
        personal_info: { name: '', email: '', phone: '', location: '', summary: '' },
        education: [],
        experience: [],
        skills: [],
        template_type: 'modern',
        file_path: storageData.path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      };

      const { data: dbData, error: dbError } = await supabase
        .from('resumes')
        .insert(resumeData)
        .select()
        .single();

      if (dbError) throw dbError;

      // Update local state
      setResumes(prev => [{
        ...dbData,
        personal_info: dbData.personal_info as any,
        education: dbData.education as any,
        experience: dbData.experience as any,
        skills: dbData.skills as any,
      }, ...prev]);

      toast({
        title: "Success",
        description: "Resume file uploaded and saved successfully",
      });

      return {
        ...dbData,
        personal_info: dbData.personal_info as any,
        education: dbData.education as any,
        experience: dbData.experience as any,
        skills: dbData.skills as any,
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload resume file",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    resumes,
    loading,
    saveResume,
    deleteResume,
    generateResumeWithAI,
    improveResumeWithAI,
    askAI,
    uploadResume,
    refetch: fetchResumes,
  };
}