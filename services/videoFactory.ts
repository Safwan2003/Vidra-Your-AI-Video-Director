import { ProjectBrief, VideoPlan } from '../types';
import { getTemplateSchema } from './schemas';
import { groq, cleanJsonOutput } from './llm';
import { detectIndustry } from './utils';

export const VideoFactory = {
    /**
     * Generates a deterministic video plan based on the selected template schema.
     */
    generate: async (brief: ProjectBrief, templateId: 'viable' | 'pretaa'): Promise<VideoPlan> => {
        console.log(`🏭 VideoFactory: Manufacturing plan for ${templateId}...`);

        const schema = getTemplateSchema(templateId);

        // 1. Prepare Asset Context
        const assetsContext = brief.recordedClips?.length
            ? `USER ASSETS (Use these URLs where appropriate for 'screenshotUrl' or 'mobileScreenshotUrl'):\n${brief.recordedClips.map((c, i) => `Asset ${i + 1}: "${c.url}" (${c.type})`).join('\n')}`
            : "NO USER ASSETS PROVIDED.";

        // 2. Construct Prompt
        const prompt = `
            ${schema.systemPrompt}

            PRODUCT CONTEXT:
            Name: ${brief.productName}
            Description: ${brief.description}
            Audience: ${brief.targetAudience}
            Tone: ${brief.tone}
            CTA: ${brief.callToAction}
            INDUSTRY VISUALS: ${detectIndustry(brief.description)}

            ${assetsContext}

            IMPORTANT:
            - Stick EXACTLY to the JSON structure provided.
            - Ensure "voiceoverScript" is written for EVERY scene.
            - Use the USER ASSETS for screenshotUrl fields if they match the scene context (e.g. Dashboard, Mobile Demo).
        `;

        // 3. Call LLM
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5, // Lower temp for strict adherence
            });

            const raw = completion.choices[0]?.message?.content || '{}';
            const json = JSON.parse(cleanJsonOutput(raw));

            // 4. Post-Processing / Validation
            // Ensure ID and Duration are numbers
            const plan: VideoPlan = {
                brandName: json.brandName || brief.productName,
                brandColor: json.brandColor || '#6366f1',
                template: templateId,
                scenes: json.scenes.map((s: any, i: number) => ({
                    ...s,
                    id: i + 1,
                    duration: Number(s.duration) || 5,
                    // Normalize legacy fields if LLM hallucinated
                    mainText: s.mainText || s.title || s.headline,
                    subText: s.subText || s.subheadline,
                    // Ensure features array is safe
                    bentoItems: s.features ? s.features.map((f: any) => ({
                        title: f.title,
                        content: f.description || f.subtitle,
                        colSpan: 1, rowSpan: 1
                    })) : undefined
                }))
            };

            console.log(`✅ VideoFactory: Manufactured ${plan.scenes.length} scenes.`);
            return plan;

        } catch (error) {
            console.error("❌ VideoFactory Error:", error);
            throw new Error("Factory failed to generate plan: " + (error as Error).message);
        }
    }
};
