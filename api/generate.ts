import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Vercel Edge Function for generating prompts
export const config = {
  runtime: 'edge',
};

// Re-define the Persona type as it's not easily shared between frontend and api routes in this simple setup.
interface Persona {
    id: string;
    name: string;
    title: string;
    description: string;
    prompt: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set on server.");
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  try {
    const { persona, userTask } = (await req.json()) as { persona: Persona; userTask: string };

    if (!persona || !userTask) {
        return new Response(JSON.stringify({ error: 'Missing persona or userTask in request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const metaPrompt = `
You are a world-class prompt engineering expert. Your task is to take a user's goal and rewrite it into a detailed, structured prompt that conforms to the specifications of a target AI persona.

**Target AI Persona System Prompt:**
---
${persona.prompt}
---

**User's Goal:**
---
${userTask}
---

**Your Instructions:**
1.  Deeply analyze the user's goal to understand their true intent.
2.  Analyze the rules, format, roles, and directives defined in the "Target AI Persona System Prompt."
3.  Rewrite the user's goal into a new, complete, and highly-detailed prompt that is perfectly formatted FOR the target persona.
4.  The new prompt must fully incorporate the user's goal while strictly adhering to all formatting rules, role-playing instructions, and constraints of the target persona.
5.  IMPORTANT: Your entire output must be ONLY the final, rewritten prompt text. Do NOT output any explanation, conversation, or introductory phrases like "Here is the optimized prompt:". Your response should start directly with the content of the rewritten prompt.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: metaPrompt,
        config: {
            temperature: 0.5,
            topP: 0.95,
        }
    });

    const optimizedPrompt = response.text.trim();
    
    return new Response(JSON.stringify({ optimizedPrompt }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: `Failed to generate prompt: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
