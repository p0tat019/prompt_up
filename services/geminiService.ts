import { Persona } from '../types';

/**
 * Generates an optimized prompt by calling the backend API.
 *
 * @param persona The AI persona to use for optimization.
 * @param userTask The user's rough task description.
 * @returns The optimized prompt as a string.
 */
export const generateOptimizedPrompt = async (persona: Persona, userTask: string): Promise<string> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ persona, userTask }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Use the error message from the API, or a default one
            const errorMessage = data?.error || `API responded with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return data.optimizedPrompt;
    } catch (error) {
        console.error("Error calling backend API:", error);
        // Re-throw a more user-friendly error
        throw new Error("API 통신에 실패했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.");
    }
};
