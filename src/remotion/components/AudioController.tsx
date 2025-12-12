import React from 'react';
import { Audio, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoPlan, AudioEvent } from '../../../types';

interface AudioControllerProps {
    plan: VideoPlan;
    bgMusicVolume?: number;
}

export const AudioController: React.FC<AudioControllerProps> = ({ plan, bgMusicVolume = 0.2 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. Determine Total Duration for Loop
    const totalDuration = plan.scenes.reduce((acc, s) => acc + s.duration, 0);

    // 2. Flatten all SFX events relative to the timeline
    // This maps scene-level audio events to global timeline frames
    const globalSfxEvents = plan.scenes.reduce<{ event: AudioEvent; globalFrame: number }[]>((acc, scene, index) => {
        // Calculate start frame of this scene
        const startFrame = plan.scenes.slice(0, index).reduce((sum, s) => sum + (s.duration * 30), 0);

        if (scene.choreography?.audioEvents) {
            const sceneEvents = scene.choreography.audioEvents.map(evt => ({
                event: evt,
                globalFrame: startFrame + (evt.frame / 100) * (scene.duration * 30) // Convert % to frame
            }));
            return [...acc, ...sceneEvents];
        }
        return acc;
    }, []);

    return (
        <>
            {/* GLOBAL BACKGROUND MUSIC */}
            {/* Using a placeholder track for now - user can replace via 'customMedia' later */}
            <Audio
                src="https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3" // Placeholder: Replace with royalty-free energetic beat
                volume={bgMusicVolume}
                loop
            />

            {/* SCHEDULED SFX */}
            {globalSfxEvents.map((item, idx) => {
                // Audio component needs to be rendered, but we control start via 'startFrom' or conditional render?
                // Remotion <Audio> plays based on sequence. We use 'startFrom' or Sequence to place it.
                // Better approach: Use a mapped array of <Sequence> for each SFX.

                // Dynamic Asset Loading (Placeholder logic)
                const sfxAsset = getSfxUrl(item.event.file);

                return (
                    <Audio
                        key={`sfx-${idx}`}
                        src={sfxAsset}
                        volume={item.event.volume}
                        startFrom={Math.round(item.globalFrame)}
                        endAt={Math.round(item.globalFrame + 60)} // Play for 2 seconds max usually
                    />
                );
            })}
        </>
    );
};

// Helper to map abstract filenames to actual assets (hosted or local)
// For now, we will use some public CDNs or placeholders
const getSfxUrl = (filename: string): string => {
    const baseUrl = "https://assets.mixkit.co/active_storage/sfx";
    // Mapping to real Mixkit free assets (placeholders for demo)
    switch (filename) {
        case 'click.mp3': return "https://www.soundjay.com/buttons/sounds/button-16.mp3";
        case 'whoosh.mp3': return "https://www.soundjay.com/nature/sounds/wind-whoosh-1.mp3";
        case 'notificaiton.mp3': return "https://www.soundjay.com/buttons/sounds/beep-07.mp3";
        case 'success.mp3': return "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3";
        case 'type_text.mp3': return "https://www.soundjay.com/mechanical/sounds/typewriter-6.mp3";
        default: return "https://www.soundjay.com/buttons/sounds/button-30.mp3";
    }
};
