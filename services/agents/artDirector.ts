import { groq, cleanJsonOutput } from '../llm';
import { VideoGenerationState } from './state';
import { ARCHETYPES } from '../../src/constants';
import { detectIndustry } from '../utils';

export const artDirectorAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
    console.log('🎨 Art Director Agent: Selecting personalized visual style...');

    try {
        const industry = detectIndustry(state.brief.description);

        // Analyze Brand Identity & Colors via LLM
        const colorPrompt = `
        You are an Expert Art Director & Color Psychologist.
        Analyze this product and select the PERFECT color palette.

        PRODUCT: ${state.brief.productName}
        DESCRIPTION: ${state.brief.description}
        TONE: ${state.brief.tone}
        INDUSTRY: ${industry}

        Rules:
        1. If specific colors are mentioned in description (e.g. "our red logo"), USE THEM.
        2. Otherwise, use Color Psychology:
           - Fintech/Trust -> Deep Blues (#1e40af), Chase Blue (#1155cc)
           - AI/Future -> Electric Purples (#7c3aed), Neon (#f472b6)
           - Eco/Growth -> Emerald Greens (#10b981), Leaf (#15803d)
           - Energy/Youth -> Bright Orange (#f97316), Yellow (#eab308)
           - Luxury -> Black/Gold (#D4AF37), Charcoal (#1e293b)
        
        3. Select a "brandColor" (Primary Dominant) and an "accentColor" (Complementary/Highlight).

        OUTPUT JSON:
        {
            "brandColor": "#HEXCODE",
            "accentColor": "#HEXCODE",
            "reasoning": "Short explanation"
        }
        `;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: colorPrompt }],
            temperature: 0.5,
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const result = JSON.parse(cleanJsonOutput(raw));

        // Fallbacks just in case
        const brandColor = result.brandColor || '#9333ea';
        const accentColor = result.accentColor || '#f472b6';

        console.log(`🎨 Art Director: Selected ${brandColor} (Primary) & ${accentColor} (Accent). Reason: ${result.reasoning}`);

        // Decide Archetype logic (Keep existing logic but enhance it later if needed)
        const isHype = state.brief.tone === 'Hype';
        let archetypeKey: keyof typeof ARCHETYPES = isHype ? 'kinetic_typo' : 'neo_glass';
        const archetype = ARCHETYPES[archetypeKey];

        const visualAssets = {
            colorPalette: [brandColor, accentColor, '#ffffff', '#000000'], // Simple palette
            brandColor: brandColor,
            accentColor: accentColor,
            fontFamily: 'Inter, sans-serif'
        };

        return {
            ...state,
            archetype: archetypeKey,
            visualAssets: visualAssets as any
        };

    } catch (error) {
        console.error('❌ Art Director Agent Error:', error);
        // Fallback to safe defaults
        return {
            ...state,
            visualAssets: { brandColor: '#9333ea', accentColor: '#c084fc', colorPalette: ['#9333ea'] } as any
        };
    }
};
