import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, action } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    
    switch (action) {
      case 'generate_resume':
        systemPrompt = `You are an expert resume writer. Create a professional resume based on the user's input. Return a JSON object with the following structure:
        {
          "personal_info": {
            "name": "string",
            "email": "string", 
            "phone": "string",
            "location": "string",
            "summary": "string"
          },
          "education": [
            {
              "school": "string",
              "degree": "string", 
              "year": "string"
            }
          ],
          "experience": [
            {
              "company": "string",
              "position": "string",
              "duration": "string", 
              "description": "string"
            }
          ],
          "skills": ["skill1", "skill2", "skill3"]
        }
        Make the content professional, relevant, and compelling. Use the user's input to fill in accurate details.`;
        break;
        
      case 'improve_resume':
        systemPrompt = `You are an expert resume consultant. Analyze the provided resume and suggest improvements. Return a JSON object with the improved resume in the same format, focusing on:
        - Stronger action words
        - Quantified achievements
        - Better formatting
        - Industry-relevant keywords
        - Professional language`;
        break;
        
      case 'answer_query':
        systemPrompt = `You are a helpful career advisor and resume expert. Answer the user's question about resumes, career advice, or job searching with professional, actionable advice.`;
        break;
        
      default:
        systemPrompt = 'You are a helpful assistant that provides career and resume advice.';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    let parsedResult = result;
    if (action !== 'answer_query') {
      try {
        parsedResult = JSON.parse(result);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from AI');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      result: parsedResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-resume-builder function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});