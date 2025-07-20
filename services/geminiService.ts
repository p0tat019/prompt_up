
import { GoogleGenAI } from "@google/genai";
import { Persona } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an optimized prompt using Gemini.
 *
 * @param persona The AI persona to use for optimization.
 * @param userTask The user's rough task description.
 * @returns The optimized prompt as a string.
 */
export const generateOptimizedPrompt = async (persona: Persona, userTask: string): Promise<string> => {
    
    const model = ai.models['gemini-2.5-flash'];
    
    // This is the "meta-prompt" that instructs Gemini on how to perform the transformation.
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

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: metaPrompt,
            config: {
                temperature: 0.5,
                topP: 0.95,
            }
        });
        
        return result.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};
