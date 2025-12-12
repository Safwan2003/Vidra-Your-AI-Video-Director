import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Easing } from 'remotion';

interface GradientBackgroundProps {
    colors: string[];
    type?: 'linear' | 'radial' | 'mesh';
    animated?: boolean;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
    colors,
    type = 'linear',
    animated = true
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        easing: Easing.bezier(0.33, 1, 0.68, 1),
        extrapolateRight: 'clamp'
    });

    // Ensure we have at least 2 colors
    const gradientColors = colors.length >= 2 ? colors : ['#667eea', '#764ba2'];

    if (type === 'radial') {
        const centerX = animated ? interpolate(progress, [0, 1], [30, 70]) : 50;
        const centerY = animated ? interpolate(progress, [0, 1], [50, 50]) : 50;

        return (
            <AbsoluteFill
                style={{
                    background: `radial-gradient(circle at ${centerX}% ${centerY}%, ${gradientColors.join(', ')})`,
                    filter: 'blur(40px)',
                    opacity: 0.9
                }}
            />
        );
    }

    if (type === 'mesh') {
        // Mesh gradient effect (multiple radial gradients)
        return (
            <AbsoluteFill>
                {gradientColors.map((color, i) => {
                    const x = animated
                        ? interpolate(progress, [0, 1], [20 + i * 30, 30 + i * 25])
                        : 20 + i * 30;
                    const y = animated
                        ? interpolate(progress, [0, 1], [20 + i * 25, 30 + i * 30])
                        : 20 + i * 25;

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `radial-gradient(circle at ${x}% ${y}%, ${color}, transparent 50%)`,
                                filter: 'blur(60px)',
                                opacity: 0.6,
                                mixBlendMode: 'screen'
                            }}
                        />
                    );
                })}
            </AbsoluteFill>
        );
    }

    // Linear gradient (default)
    const angle = animated ? interpolate(progress, [0, 1], [0, 45]) : 0;

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${angle}deg, ${gradientColors.join(', ')})`,
                filter: 'blur(40px)',
                opacity: 0.9
            }}
        />
    );
};
