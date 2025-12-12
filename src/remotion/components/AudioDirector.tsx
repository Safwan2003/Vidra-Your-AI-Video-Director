import React from 'react';
import { useVideoConfig, Sequence, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { AudioEvent } from '../../../types';

interface AudioDirectorProps {
    events?: AudioEvent[];
    masterVolume?: number;
    enableDucking?: boolean; // Lower music volume when voiceover plays
}

// Map of SFX types to their audio files for fallback handling
const SFX_FALLBACKS: Record<string, string[]> = {
    'whoosh': ['whoosh.mp3', 'swoosh.mp3', 'transition.mp3'],
    'swoosh': ['swoosh.mp3', 'whoosh.mp3', 'transition.mp3'],
    'pop': ['pop.mp3', 'click.mp3', 'blip.mp3'],
    'click': ['click.mp3', 'pop.mp3', 'blip.mp3'],
    'success': ['success.mp3', 'chime.mp3', 'ding.mp3'],
    'chime': ['chime.mp3', 'success.mp3', 'ding.mp3'],
    'notification': ['notification.mp3', 'chime.mp3', 'pop.mp3'],
    'reveal': ['reveal.mp3', 'whoosh.mp3', 'transition.mp3'],
    'transition': ['transition.mp3', 'whoosh.mp3', 'swoosh.mp3'],
    'celebration': ['celebration.mp3', 'confetti.mp3', 'success.mp3'],
    'confetti': ['confetti.mp3', 'celebration.mp3', 'pop.mp3'],
    'typing': ['typing.mp3', 'keyboard.mp3', 'click.mp3'],
    'data': ['data.mp3', 'blip.mp3', 'digital.mp3'],
    'impact': ['impact.mp3', 'hit.mp3', 'thud.mp3'],
    'rise': ['rise.mp3', 'build.mp3', 'transition.mp3'],
    'drop': ['drop.mp3', 'bass.mp3', 'impact.mp3'],
};

// Default SFX durations in frames (at 30fps)
const SFX_DURATIONS: Record<string, number> = {
    'whoosh': 30,
    'swoosh': 25,
    'pop': 15,
    'click': 10,
    'success': 45,
    'chime': 40,
    'notification': 35,
    'reveal': 50,
    'transition': 40,
    'celebration': 90,
    'confetti': 60,
    'typing': 60,
    'data': 30,
    'impact': 25,
    'rise': 60,
    'drop': 40,
};

// Get primary SFX file from event file name
const getSFXType = (fileName: string): string | undefined => {
    const baseName = fileName.replace('.mp3', '').toLowerCase();
    return Object.keys(SFX_FALLBACKS).find(key => baseName.includes(key));
};

export const AudioDirector: React.FC<AudioDirectorProps> = ({
    events,
    masterVolume = 1,
    enableDucking = false
}) => {
    const { durationInFrames, fps } = useVideoConfig();
    const frame = useCurrentFrame();

    // SFX Disabled temporarily as assets are missing from public/audio
    // if (!events || events.length === 0) return null;
    return null;

    return (
        <>
            {events.map((event, index) => {
                // Convert % frame to actual frame
                const startFrame = Math.floor((event.frame / 100) * durationInFrames);

                // Get SFX type for duration and fallback handling
                const sfxType = getSFXType(event.file);
                const sfxDuration = sfxType ? SFX_DURATIONS[sfxType] || 60 : 60;

                // Calculate volume with optional fade
                const eventVolume = event.volume ?? 0.6;
                const fadeInFrames = 3;
                const fadeOutFrames = 5;

                // Determine actual volume at current frame (for the Sequence)
                // Note: This is calculated but Audio component uses static volume
                // For true fades, we'd need to use Audio's volume callback

                const finalVolume = eventVolume * masterVolume;

                return (
                    <Sequence
                        key={`sfx-${index}-${event.file}`}
                        from={startFrame}
                        durationInFrames={sfxDuration}
                    >
                        <Audio
                            src={staticFile(`audio/${event.file}`)}
                            volume={(f) => {
                                // Fade in
                                if (f < fadeInFrames) {
                                    return interpolate(f, [0, fadeInFrames], [0, finalVolume]);
                                }
                                // Fade out
                                if (f > sfxDuration - fadeOutFrames) {
                                    return interpolate(
                                        f,
                                        [sfxDuration - fadeOutFrames, sfxDuration],
                                        [finalVolume, 0],
                                        { extrapolateRight: 'clamp' }
                                    );
                                }
                                return finalVolume;
                            }}
                        />
                    </Sequence>
                );
            })}
        </>
    );
};
