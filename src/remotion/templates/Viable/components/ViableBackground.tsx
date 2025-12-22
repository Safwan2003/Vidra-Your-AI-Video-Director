import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface ViableBackgroundProps {
    phase: 'chaos' | 'transition' | 'order';
}

export const ViableBackground: React.FC<ViableBackgroundProps> = ({ phase }) => {
    const frame = useCurrentFrame();

    // Color definitions from reference
    const chaosColors = {
        start: '#1a0a2e',
        end: '#2d1b3d',
        accent: '#ff3366'
    };

    const orderColors = {
        start: '#0a1628',
        end: '#1e3a5f',
        accent: '#4a90e2'
    };

    // Determine colors based on phase
    const colors = phase === 'chaos' ? chaosColors : orderColors;

    // Animated gradient shift
    const gradientShift = interpolate(frame, [0, 60], [0, 100], {
        extrapolateRight: 'clamp'
    });

    // Blob animation
    const blob1X = interpolate(frame, [0, 120], [20, 80], {
        extrapolateRight: 'mirror'
    });
    const blob1Y = interpolate(frame, [0, 100], [30, 70], {
        extrapolateRight: 'mirror'
    });

    const blob2X = interpolate(frame, [0, 150], [70, 30], {
        extrapolateRight: 'mirror'
    });
    const blob2Y = interpolate(frame, [0, 130], [60, 40], {
        extrapolateRight: 'mirror'
    });

    return (
        <AbsoluteFill>
            {/* Base Gradient */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`
            }} />

            {/* Animated Blobs */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* Blob 1 */}
                <div style={{
                    position: 'absolute',
                    left: `${blob1X}%`,
                    top: `${blob1Y}%`,
                    width: '600px',
                    height: '600px',
                    background: `radial-gradient(circle, ${colors.accent}33 0%, transparent 70%)`,
                    filter: 'blur(80px)',
                    transform: 'translate(-50%, -50%)'
                }} />

                {/* Blob 2 */}
                <div style={{
                    position: 'absolute',
                    left: `${blob2X}%`,
                    top: `${blob2Y}%`,
                    width: '500px',
                    height: '500px',
                    background: `radial-gradient(circle, ${colors.accent}22 0%, transparent 70%)`,
                    filter: 'blur(100px)',
                    transform: 'translate(-50%, -50%)'
                }} />
            </div>

            {/* Noise Texture Overlay */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0.03,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
                mixBlendMode: 'overlay'
            }} />
        </AbsoluteFill>
    );
};
