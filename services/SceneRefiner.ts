import { VideoScene } from '../types';
import { groq, cleanJsonOutput } from './llm';

export const SceneRefiner = {
    /**
     * Updates a single scene based on user instructions using LLM.
     */
    refine: async (scene: VideoScene, instruction: string): Promise<VideoScene> => {
        const prompt = `
            You are an expert Video Director AI.
            Update the following JSON Scene Object based on the User's Instruction.

            CURRENT SCENE JSON:
            ${JSON.stringify(scene, null, 2)}

            USER INSTRUCTION:
            "${instruction}"

            RULES:
            1. Return ONLY the valid JSON object. No markdown, no explanations.
            2. Keep the same 'id' and 'type' unless explicitly asked to change.
            3. You can modify text, duration, colors, features list, or advanced props like 'cameraMove'.
            4. You can update styling properties: 'backgroundColor' and 'mainTextColor'.
            5. If the user asks for "more punchy styling", adjust text fields or add a 'visualDescription'.
        `;

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });

            const raw = completion.choices[0]?.message?.content || '{}';
            const updatedScene = JSON.parse(cleanJsonOutput(raw));

            // Safety merge
            return { ...scene, ...updatedScene };
        } catch (error) {
            console.error("Refine Error:", error);
            throw error;
        }
    },

    /**
     * Updates an entire plan based on global instructions.
     */
    refinePlan: async (plan: any, instruction: string): Promise<any> => {
        const prompt = `
            You are an expert Creative Director AI.
            Update the following Video Plan JSON based on the User's Instruction.
            
            USER INSTRUCTION: "${instruction}"

            CURRENT PLAN JSON:
            ${JSON.stringify(plan, null, 2)}

            RULES:
            1. Return ONLY the valid JSON object. No markdown, no explanations.
            2. You can add, remove, or reorder scenes.
            3. You can change global brand properties (brandName, brandColor).
            4. You can update individual scene styling properties like 'backgroundColor' and 'mainTextColor' if the user asks for a color scheme change or brand update.
            5. If the user asks for a "better plan" or "replan", analyze the product and create a high-converting narrative.
            6. Ensure 'id's are unique and sequential.
            7. For each scene, ensure 'type' is one of the supported types: kinetic_text, ui_mockup, isometric_illustration, device_showcase, social_proof, cta_finale, etc.
        `;

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });

            const raw = completion.choices[0]?.message?.content || '{}';
            return JSON.parse(cleanJsonOutput(raw));
        } catch (error) {
            console.error("Refine Plan Error:", error);
            throw error;
        }
    },

    /**
     * Rewrites a specific piece of text based on style instructions.
     */
    rewriteText: async (text: string, style: string = "professional and punchy"): Promise<string> => {
        const prompt = `
            You are an expert Copywriter.
            Rewrite the following text to be more ${style}.
            Keep it concise and suitable for a video presentation.
            
            ORIGINAL TEXT: "${text}"
            
            Return ONLY the rewritten text. No quotes, no explanations.
        `;

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });

            return (completion.choices[0]?.message?.content || text).trim().replace(/^"|"$/g, '');
        } catch (error) {
            console.error("Rewrite Error:", error);
            return text; // Fallback to original
        }
    }
};
