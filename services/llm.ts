import Groq from "groq-sdk";

export const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Helper for cleaning JSON from LLM responses
export const cleanJsonOutput = (content: string): string => {
    let cleaned = content.trim();

    // Try to extract JSON object first
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    // Try to extract JSON array
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    // Determine which comes first and is valid
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket &&
        (firstBrace === -1 || firstBracket < firstBrace)) {
        // Array comes first or object doesn't exist
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // Object exists and comes first
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
};
