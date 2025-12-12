import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const Slot6Outro: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 30], [0, 1]);
    const scale = spring({ frame, fps, from: 0.5, to: 1, config: { damping: 10, mass: 2 } });
    const rotateX = interpolate(frame, [0, 60], [20, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Premium Grey
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Centered
            perspective: '1000px'
        }}>
            {/* Background Pattern */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.3
            }} />

            <div style={{
                opacity,
                transform: `scale(${scale}) rotateX(${rotateX}deg)`,
                display: 'flex',
                alignItems: 'center',
                gap: '30px',
                zIndex: 10
            }}>
                {/* Logo Icon (Target) */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '30px',
                    background: '#9333ea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 20px 50px rgba(147, 51, 234, 0.4)'
                }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L2 22h20L12 2z" />
                    </svg>
                </div>

                {/* Text Logo */}
                <div style={{ fontSize: '100px', fontWeight: '900', color: '#1f2937', letterSpacing: '-4px' }}>
                    viable
                </div>
            </div>

            {/* CTA Subtitle */}
            <div style={{
                position: 'absolute', bottom: '150px',
                opacity: interpolate(frame, [30, 60], [0, 1]),
                fontSize: '24px', color: '#64748b', fontWeight: '600', letterSpacing: '1px'
            }}>
                Start your trial today
            </div>
        </AbsoluteFill>
    );
};
