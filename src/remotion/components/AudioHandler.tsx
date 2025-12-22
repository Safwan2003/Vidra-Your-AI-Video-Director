import React from 'react';
import { Audio, Sequence, useVideoConfig } from 'remotion';
import { VideoScene } from '../../../types';

interface AudioHandlerProps {
    audioTrack?: string;
    scenes: VideoScene[];
}

export const AudioHandler: React.FC<AudioHandlerProps> = ({ audioTrack, scenes }) => {
    const { fps } = useVideoConfig();

    return (
        <>
            {/* Background Music */}
            {audioTrack && (
                <Audio
                    src={audioTrack}
                    loop
                    volume={0.15} // Low volume background
                />
            )}

            {/* Voiceovers per Scene - Using Sequence for isolation */}
            {scenes.map((scene, index) => {
                if (!scene.voiceoverUrl) return null;

                // Calculate start frame for this scene
                let startFrame = 0;
                for (let i = 0; i < index; i++) {
                    startFrame += Math.floor((scenes[i].duration || 5) * fps);
                }

                const durationInFrames = Math.floor((scene.duration || 5) * fps);

                return (
                    <Sequence
                        key={`vo-seq-${scene.id}-${index}`}
                        from={startFrame}
                        durationInFrames={durationInFrames}
                    >
                        <Audio
                            src={scene.voiceoverUrl}
                            volume={1}
                        />
                    </Sequence>
                );
            })}
        </>
    );
};
