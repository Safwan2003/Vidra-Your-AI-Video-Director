import { groq } from './llm';
import { SceneType } from '../types';
import Groq from "groq-sdk";

export const refineSceneSvg = async (sceneDescription: string, currentSvg: string, type: SceneType, apiKey?: string): Promise<string> => {
    // Note: apiKey param is kept for compatibility but we use the shared client primarily.
    // If the app passes a specific key (from settings), we might want to use it.

    // Create specific client if key provided, else use shared
    const client = apiKey ? new Groq({ apiKey, dangerouslyAllowBrowser: true }) : groq;

    const prompt = `
    Refine this SVG for a ${type} scene.
    Description: "${sceneDescription}".
    Make it detailed, professional, and matching the description.
    Use What a Story style: clean, modern, vibrant gradients.
    Return ONLY the raw SVG string. No JSON, no Markdown.
    
    Current SVG:
    ${currentSvg}
    `;

    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        let content = completion.choices[0]?.message?.content || currentSvg;
        // Clean markdown if present
        content = content.replace(/```svg/g, '').replace(/```/g, '').trim();
        return content;
    } catch (error) {
        console.error("Refine SVG Error:", error);
        return currentSvg;
    }
};
