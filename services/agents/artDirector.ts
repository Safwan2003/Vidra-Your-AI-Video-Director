import { VideoGenerationState } from './state';
import { ARCHETYPES } from '../../src/constants';

export const artDirectorAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
    console.log('🎨 Art Director Agent: Selecting visual style and colors...');

    try {
        // Determine archetype based on tone
        const isHype = state.brief.tone === 'Hype';
        const isCorporate = state.brief.tone === 'Professional';

        let archetypeKey: keyof typeof ARCHETYPES = 'isometric_world';
        if (isHype) archetypeKey = 'kinetic_typo';
        else if (isCorporate) archetypeKey = 'neo_glass';

        const archetype = ARCHETYPES[archetypeKey];

        // Extract brand color from brief or use archetype default
        const brandColor = state.brief.description.match(/#[0-9A-Fa-f]{6}/)?.[0] || archetype.colors[1];

        const visualAssets = {
            colorPalette: archetype.colors,
            brandColor: brandColor,
            particles: archetype.particles,
            fontFamily: 'Inter, sans-serif'
        };

        console.log(`✅ Selected ${archetype.name} archetype with ${visualAssets.colorPalette.length} colors`);

        return {
            ...state,
            archetype: archetypeKey,
            visualAssets: visualAssets as any
        };

    } catch (error) {
        console.error('❌ Art Director Agent Error:', error);
        return {
            ...state,
            errors: [...(state.errors || []), `ArtDirector: ${(error as Error).message}`]
        };
    }
};
