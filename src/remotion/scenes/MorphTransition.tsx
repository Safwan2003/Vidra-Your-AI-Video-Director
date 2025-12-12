import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { VideoScene } from '../../../types';
import { smoothInterpolate, EASINGS } from '../../constants/easings';

interface MorphTransitionProps {
    fromScene: VideoScene;
    toScene: VideoScene;
    brandColor: string;
}

/**
 * Morph Transition Scene
 * Smooth morphing transition between scenes
 * "What a Story" quality transition effect
 */
export const MorphTransition: React.FC<MorphTransitionProps> = ({ fromScene, toScene, brandColor }) => {
    const frame = useCurrentFrame();
    const duration = 30; // 1 second at 30fps

    // Morph progress (0 to 1)
    const morphProgress = smoothInterpolate(frame, [0, duration], [0, 1], EASINGS.smooth);

    // Shape morph effect (circle to square)
    const borderRadius = interpolate(morphProgress, [0, 1], [50, 0]);
    const scale = interpolate(morphProgress, [0, 0.5, 1], [1, 1.2, 1]);

    // Color morph
    const fromColor = fromScene.chartData?.[0]?.colors?.[0] || brandColor;
    const toColor = toScene.chartData?.[0]?.colors?.[0] || brandColor;

    // Opacity crossfade
    const fromOpacity = interpolate(morphProgress, [0, 0.5], [1, 0]);
    const toOpacity = interpolate(morphProgress, [0.5, 1], [0, 1]);

    // Particle dispersion effect
    const particles = Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = interpolate(morphProgress, [0.3, 0.7], [0, 300]);
        const particleOpacity = interpolate(morphProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: particleOpacity,
        };
    });

    return (
        <AbsoluteFill style={{ background: '#0f172a' }}>
            {/* From Scene (fading out) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: fromOpacity,
                }}
            >
                <div
                    style={{
                        width: '400px',
                        height: '400px',
                        background: fromColor,
                        borderRadius: `${borderRadius}%`,
                        transform: `scale(${scale})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 700,
                    }}
                >
                    {fromScene.mainText}
                </div>
            </div>

            {/* Particle dispersion */}
            {morphProgress > 0.3 && morphProgress < 0.7 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {particles.map((particle, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: brandColor,
                                transform: `translate(${particle.x}px, ${particle.y}px)`,
                                opacity: particle.opacity,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* To Scene (fading in) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: toOpacity,
                }}
            >
                <div
                    style={{
                        width: '400px',
                        height: '400px',
                        background: toColor,
                        borderRadius: `${100 - borderRadius}%`,
                        transform: `scale(${2 - scale})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 700,
                    }}
                >
                    {toScene.mainText}
                </div>
            </div>

            {/* Liquid effect overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 50% 50%, ${brandColor}40, transparent 70%)`,
                    opacity: interpolate(morphProgress, [0.4, 0.5, 0.6], [0, 1, 0]),
                    filter: 'blur(40px)',
                }}
            />
        </AbsoluteFill>
    );
};
