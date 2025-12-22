import { ProjectBrief, VideoPlan, IndustryType, BrandPersonality } from '../types';
import { getTemplateSchema } from './schemas';
import { groq, cleanJsonOutput } from './llm';
import { detectIndustry } from './utils';

// Industry Detection Logic
function detectIndustryContext(brief: ProjectBrief): BrandPersonality {
    const description = brief.description.toLowerCase();
    const productName = brief.productName.toLowerCase();
    const combined = `${description} ${productName}`;

    // Industry keyword mapping
    const industryMap: Record<IndustryType, string[]> = {
        saas: ['dashboard', 'platform', 'software', 'cloud', 'automation', 'analytics', 'crm', 'saas'],
        fintech: ['payment', 'banking', 'finance', 'crypto', 'wallet', 'transaction', 'invest'],
        ecommerce: ['shop', 'store', 'ecommerce', 'marketplace', 'product', 'cart', 'checkout'],
        healthcare: ['health', 'medical', 'patient', 'doctor', 'clinic', 'wellness', 'care'],
        education: ['learn', 'education', 'course', 'student', 'teach', 'training', 'school'],
        entertainment: ['game', 'music', 'video', 'stream', 'media', 'content', 'entertainment'],
        productivity: ['task', 'productivity', 'workflow', 'collaboration', 'project', 'team'],
        security: ['security', 'protect', 'encrypt', 'safe', 'privacy', 'shield', 'defense'],
        ai_ml: ['ai', 'machine learning', 'ml', 'neural', 'model', 'predict', 'intelligence'],
        other: []
    };

    // Detect industry
    let detectedIndustry: IndustryType = 'other';
    for (const [industry, keywords] of Object.entries(industryMap)) {
        if (keywords.some(keyword => combined.includes(keyword))) {
            detectedIndustry = industry as IndustryType;
            break;
        }
    }

    // Map tone from brief
    const toneMap: Record<string, any> = {
        professional: 'professional',
        casual: 'friendly',
        formal: 'professional',
        playful: 'playful',
        luxury: 'luxury',
        minimal: 'minimal',
        bold: 'bold'
    };
    const tone = toneMap[brief.tone?.toLowerCase()] || 'professional';

    // Derive target emotion from industry
    const emotionMap: Record<IndustryType, any> = {
        saas: 'trust',
        fintech: 'trust',
        ecommerce: 'excitement',
        healthcare: 'calm',
        education: 'curiosity',
        entertainment: 'excitement',
        productivity: 'urgency',
        security: 'trust',
        ai_ml: 'curiosity',
        other: 'trust'
    };

    // Visual metaphors by industry
    const metaphorMap: Record<IndustryType, string> = {
        saas: 'efficiency dashboard',
        fintech: 'security shield',
        ecommerce: 'growth rocket',
        healthcare: 'caring hands',
        education: 'learning journey',
        entertainment: 'spotlight stage',
        productivity: 'streamlined workflow',
        security: 'fortress protection',
        ai_ml: 'neural network',
        other: 'innovation'
    };

    return {
        industry: detectedIndustry,
        tone,
        targetEmotion: emotionMap[detectedIndustry],
        visualMetaphor: metaphorMap[detectedIndustry]
    };
}

export const VideoFactory = {
    /**
     * Generates a deterministic video plan based on the selected template schema.
     */
    generate: async (brief: ProjectBrief, templateId: 'viable' | 'pretaa'): Promise<VideoPlan> => {
        console.log(`🏭 VideoFactory: Manufacturing plan for ${templateId}...`);

        const schema = getTemplateSchema(templateId);
        const industryContext = detectIndustryContext(brief);

        // 1. Prepare Asset Context
        const assetsContext = brief.recordedClips?.length
            ? `USER ASSETS (Use these URLs where appropriate for 'screenshotUrl' or 'mobileScreenshotUrl'):\n${brief.recordedClips.map((c, i) => `Asset ${i + 1}: "${c.url}" (${c.type})`).join('\n')}`
            : "NO USER ASSETS PROVIDED.";

        // 2. Enhanced Prompt Construction
        const prompt = `
            ${schema.systemPrompt}

            PRODUCT CONTEXT:
            Name: ${brief.productName}
            Description: ${brief.description}
            Audience: ${brief.targetAudience}
            CTA: ${brief.callToAction}
            
            DETECTED INDUSTRY PROFILE:
            Industry: ${industryContext.industry}
            Tone: ${industryContext.tone}
            Target Emotion: ${industryContext.targetEmotion}
            Visual Metaphor: ${industryContext.visualMetaphor}
            
            DESIGN CONSTRAINTS:
            - Use "${industryContext.tone}" tone throughout all scenes
            - Emphasize "${industryContext.targetEmotion}" emotion in visuals and pacing
            - Incorporate "${industryContext.visualMetaphor}" metaphor where appropriate
            - Follow industry best practices for ${industryContext.industry}

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
                globalDesign: json.globalDesign ? {
                    headingFont: json.globalDesign.headingFont || 'Inter',
                    bodyFont: json.globalDesign.bodyFont || json.globalDesign.headingFont || 'Inter',
                    primaryColor: json.globalDesign.primaryColor || json.brandColor || '#6366f1',
                    secondaryColor: json.globalDesign.secondaryColor || '#cbd5e1',
                    accentColor: json.globalDesign.accentColor || json.globalDesign.primaryColor || '#6366f1',
                    backgroundColor: json.globalDesign.backgroundColor || '#0a0a0a',
                    textColor: json.globalDesign.textColor || '#ffffff',
                    borderRadius: json.globalDesign.borderRadius || 'medium',
                    transitionStyle: json.globalDesign.transitionStyle || 'slide',
                    animationSpeed: json.globalDesign.animationSpeed || 'medium',
                    backgroundStyle: json.globalDesign.backgroundStyle || 'gradient',
                    personality: json.globalDesign.personality || industryContext
                } : undefined,
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

            // Debug: Log actual scene durations from LLM
            console.log('🎬 VideoFactory Generated Plan:');
            console.log('   Scenes:', plan.scenes.length);
            console.log('   Durations:', plan.scenes.map(s => `${s.type}: ${s.duration}s`));
            console.log('   Total:', plan.scenes.reduce((sum, s) => sum + (s.duration || 0), 0), 'seconds');

            console.log(`✅ VideoFactory: Manufactured ${plan.scenes.length} scenes.`);
            return plan;

        } catch (error) {
            console.error("❌ VideoFactory Error:", error);
            throw new Error("Factory failed to generate plan: " + (error as Error).message);
        }
    }
};
