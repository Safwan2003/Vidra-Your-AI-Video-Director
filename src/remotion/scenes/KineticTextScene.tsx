import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Easing } from 'remotion';
import { VideoScene } from '../../../types';
import { Camera } from '../components/Camera';
import { DynamicBackground } from '../components/DynamicBackground';

interface SceneProps {
    scene: VideoScene;
    brandColor: string;
}

export const KineticTextScene: React.FC<SceneProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Split text into words for individual animation
    const words = useMemo(() => scene.mainText?.split(' ') || [], [scene.mainText]);

    // Get gradient colors from scene palette or use brand color
    const gradientColors = scene.colorPalette && scene.colorPalette.length >= 2
        ? scene.colorPalette
        : [brandColor, '#ffffff'];

    // Dynamic background pulse associated with the beat (simulated)
    const bgScale = interpolate(frame, [0, 15, 30], [1, 1.2, 1], { extrapolateRight: 'clamp' });
    const bgOpacity = interpolate(frame, [0, 10], [0, 0.4]);

    return (
        <AbsoluteFill className="bg-slate-900 overflow-hidden">
            {/* 1. Dynamic Background (Unified) */}
            <DynamicBackground
                colors={scene.colorPalette || [brandColor, '#4f46e5', '#0f172a']}
                speed="fast" // Energetic for kinetic text
            />

            {/* 2. Virtual Camera for Movement */}
            <Camera
                move={scene.cameraMove}
                choreography={scene.choreography?.camera}
            >
                <AbsoluteFill className="flex items-center justify-center">
                    {/* Kinetic Type Container */}
                    <div className="relative z-10 flex flex-wrap justify-center content-center max-w-[90%] gap-4 px-4 text-center">
                        {words.map((word, i) => {
                            const delay = i * 4; // Faster staggering
                            const effect = scene.textEffects?.find(e =>
                                word.toLowerCase().includes(e.word.toLowerCase())
                            )?.style || 'stagger_up';

                            // Base interpolation defaults
                            let scale = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateRight: 'clamp', easing: Easing.back(1.5) }); // Elastic pop
                            let opacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
                            let y = 0;
                            let x = 0;
                            let rotate = 0;
                            let textShadow = '0 20px 50px rgba(0,0,0,0.6)'; // Deeper shadow

                            // Gradient text style (What a Story quality)
                            const gradientStyle = {
                                background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            };

                            // Effect-specific overrides
                            if (effect === 'explode') {
                                scale = interpolate(frame - delay, [0, 5, 15], [0, 2, 1], { extrapolateRight: 'clamp', easing: Easing.elastic(1) });
                                opacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
                                rotate = interpolate(frame - delay, [0, 15], [0, 360], { extrapolateRight: 'clamp' });
                            } else if (effect === 'glitch') {
                                x = (frame - delay) % 10 < 2 ? (Math.random() - 0.5) * 20 : 0;
                                opacity = (frame - delay) % 10 < 2 ? 0.7 : 1;
                            } else if (effect === 'gradient_slide') {
                                x = interpolate(frame - delay, [0, 15], [-100, 0], { extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
                            } else {
                                // Default stagger_up with elastic
                                y = interpolate(frame - delay, [0, 10], [100, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) });
                            }

                            return (
                                <span
                                    key={i}
                                    className="font-black tracking-tighter"
                                    style={{
                                        fontSize: '15vmin', // Massive responsive text
                                        lineHeight: 0.9,
                                        ...gradientStyle,
                                        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
                                        opacity,
                                        textShadow,
                                        display: 'inline-block',
                                        filter: `drop-shadow(0 0 30px ${gradientColors[0]}50)`
                                    }}
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </div>

                    {/* Subtext (if present) */}
                    {scene.subText && (
                        <div
                            className="absolute bottom-16 text-3xl font-bold text-slate-300 tracking-widest uppercase"
                            style={{
                                opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: 'clamp' }),
                                transform: `translateY(${interpolate(frame, [20, 30], [50, 0], { extrapolateRight: 'clamp' })}px)`,
                                letterSpacing: '0.2em'
                            }}
                        >
                            {scene.subText}
                        </div>
                    )}
                </AbsoluteFill>
            </Camera>
        </AbsoluteFill>
    );
};
