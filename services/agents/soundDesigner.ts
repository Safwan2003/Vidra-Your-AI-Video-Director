import { VideoGenerationState } from './state';
import { AudioEvent } from '../../types';

export const soundDesignerAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
    console.log('🎵 Sound Designer Agent: Adding audio events...');

    try {
        const audioEvents: AudioEvent[] = [];

        if (!state.scenes) {
            return { ...state, audioEvents: [] };
        }

        // Add SFX for each scene based on type
        state.scenes.forEach((scene, index) => {
            const sceneStartFrame = index * 30 * (scene.duration || 3); // Approximate frame offset

            // Transition whoosh (except first scene)
            if (index > 0) {
                audioEvents.push({
                    frame: 0, // Relative to scene
                    type: 'sfx',
                    file: 'whoosh.mp3',
                    volume: 0.5
                });
            }

            // Scene-specific SFX
            switch (scene.type) {
                case 'kinetic_text':
                    audioEvents.push({
                        frame: 10,
                        type: 'sfx',
                        file: 'digital_blip.mp3',
                        volume: 0.4
                    });
                    break;

                case 'ui_mockup':
                case 'device_showcase':
                    audioEvents.push({
                        frame: 20,
                        type: 'sfx',
                        file: 'click.mp3',
                        volume: 0.6
                    });
                    break;

                case 'data_visualization':
                    audioEvents.push({
                        frame: 15,
                        type: 'sfx',
                        file: 'pop.mp3',
                        volume: 0.5
                    });
                    break;

                case 'cta_finale':
                    audioEvents.push({
                        frame: 20,
                        type: 'sfx',
                        file: 'success.mp3',
                        volume: 0.7
                    });
                    break;
            }
        });

        console.log(`✅ Added ${audioEvents.length} audio events`);

        return {
            ...state,
            audioEvents: audioEvents
        };

    } catch (error) {
        console.error('❌ Sound Designer Agent Error:', error);
        return {
            ...state,
            errors: [...(state.errors || []), `SoundDesigner: ${(error as Error).message}`]
        };
    }
};
