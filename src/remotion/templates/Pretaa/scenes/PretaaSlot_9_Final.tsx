import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Shimmer Effect Component
const Shimmer = ({ delay }: any) => {
    const frame = useCurrentFrame();
    // Sweep from left to right
    const left = interpolate(frame, [delay, delay + 20], [-100, 200], { extrapolateRight: 'clamp' });
    const opacity = interpolate(frame, [delay, delay + 20], [0.5, 0]);

    if (frame < delay) return null;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            transform: `skewX(-20deg) translateX(${left}%)`,
            opacity,
            pointerEvents: 'none'
        }} />
    );
};

export const PretaaSlot9Final = ({ brandName = "pretaa", ctaText = "Contact Us Today", url = "pretaa.com", accentColor = "#1e1b4b" }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 15], [0, 1]);
    // Logo "Slam" effect: Scales down from 2x to 1x with heavy damping
    const scale = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 200, mass: 2 } });
    const logoScale = interpolate(scale, [0, 1], [1.5, 1]);

    const buttonY = spring({ frame: frame - 20, fps, config: { damping: 10, stiffness: 100 } });

    // Continuous Pulse for Button
    const pulse = Math.sin(frame * 0.05) * 0.03 + 1; // 3% scale breath

    return (
        <AbsoluteFill style={{
            background: '#f8fafc',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 50, overflow: 'hidden'
        }}>

            {/* Background Spotlights */}
            <div style={{
                position: 'absolute', top: -300, width: 1000, height: 1000,
                background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)',
                opacity: 0.8
            }} />

            {/* Logo Container */}
            <div style={{ position: 'relative', overflow: 'hidden', padding: '10px 40px' }}>
                <h1 style={{
                    fontSize: 180, color: accentColor, fontWeight: 900, margin: 0,
                    letterSpacing: '-8px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    transform: `scale(${logoScale})`,
                    opacity,
                    textShadow: '0 30px 60px rgba(0,0,0,0.1)'
                }}>
                    {brandName}
                </h1>
                {/* Logo Shimmer */}
                <Shimmer delay={35} />
            </div>

            {/* CTA Button */}
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                <button style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white', border: 'none',
                    padding: '24px 80px', fontSize: 26, fontWeight: 700, borderRadius: 16,
                    cursor: 'pointer',
                    opacity: interpolate(frame, [20, 30], [0, 1]),
                    transform: `translateY(${(1 - buttonY) * 50}px) scale(${pulse})`,
                    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}>
                    {ctaText}
                </button>
                {/* Button Shimmer */}
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden',
                    transform: `translateY(${(1 - buttonY) * 50}px) scale(${pulse})` // Mask must follow button
                }}>
                    <Shimmer delay={60} />
                </div>
            </div>

            {/* URL */}
            <div style={{
                fontSize: 22, color: '#64748b', fontWeight: 600,
                marginTop: 0,
                opacity: interpolate(frame, [30, 50], [0, 1]),
                letterSpacing: '1px'
            }}>
                {url}
            </div>

        </AbsoluteFill>
    );
};
