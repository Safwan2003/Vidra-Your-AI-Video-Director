import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

interface Slot6OutroProps {
    brandName?: string;
    logoUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    accentColor?: string;
}

// Custom Viable Logo (Purple Target + Text)
const ViableTargetLogo = ({ progress }: { progress: number }) => {
    const primary = '#9333ea'; // Purple
    const centerScale = interpolate(progress, [0.5, 1], [0, 1], { extrapolateRight: 'clamp', easing: Easing.elastic(1) });
    const circle1Draw = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
    const circle2Draw = interpolate(progress, [0.2, 0.7], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <svg viewBox="0 0 400 120" style={{ height: '110px', overflow: 'visible' }}>
            <g transform="translate(60, 60)">
                <circle r="45" fill="none" stroke={primary} strokeWidth="12"
                    strokeDasharray={283} strokeDashoffset={283 * (1 - circle1Draw)}
                    transform="rotate(-90)" />
                <circle r="25" fill="none" stroke={primary} strokeWidth="12"
                    strokeDasharray={157} strokeDashoffset={157 * (1 - circle2Draw)}
                    transform="rotate(-90)" />
                <circle r="10" fill={primary} transform={`scale(${centerScale})`} />
            </g>
            <g transform="translate(130, 80)">
                <text fontFamily="sans-serif" fontWeight="800" fontSize="80" fill={primary} style={{ letterSpacing: '-2px' }}>
                    v
                    <tspan dx="-2">i</tspan>
                    <tspan dx="-2">a</tspan>
                    <tspan dx="-2">b</tspan>
                    <tspan dx="-2">l</tspan>
                    <tspan dx="-2">e</tspan>
                </text>
            </g>
        </svg>
    );
};

export const Slot6Outro: React.FC<Slot6OutroProps> = ({
    brandName = "Viable",
    ctaText = "Start your free trial",
    ctaUrl = "askviable.com",
    accentColor = '#9333ea'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. Connector Line (Anchors the scene)
    const lineGrow = interpolate(frame, [0, 20], [0, 100], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const lineOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    // 2. Logo Animation
    const logoStart = 15;
    const logoProgress = spring({ frame: frame - logoStart, fps, from: 0, to: 1, config: { damping: 14 } });

    // 3. CTA Entrance & Pulse
    const btnStart = 35;
    const btnScale = spring({ frame: frame - btnStart, fps, from: 0, to: 1, config: { stiffness: 120, damping: 15 } });
    // Gentle heartbeat loop after entrance
    const pulse = Math.sin((frame - btnStart - 40) / 10) * 0.03;
    const isPulsing = frame > btnStart + 40;
    const finalScale = isPulsing ? 1 + pulse : btnScale;

    // 4. URL Fade
    const urlOp = interpolate(frame, [btnStart + 10, btnStart + 30], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(180deg, #fdf4ff 0%, #fae8ff 100%)', // Clean light purple gradient
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Dynamic Background Blob */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%',
                width: '60%', height: '60%',
                background: 'radial-gradient(circle, rgba(147,51,234,0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: `rotate(${frame * 0.2}deg) scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
                pointerEvents: 'none'
            }} />

            {/* Central Content Stack */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '50px',
                position: 'relative', zIndex: 10
            }}>

                {/* Connector Line from Top */}
                <div style={{
                    position: 'absolute', top: -150,
                    width: '2px', height: '150px',
                    background: `linear-gradient(180deg, transparent 0%, ${accentColor} 100%)`,
                    height: `${lineGrow}px`,
                    opacity: lineOp,
                }} />

                {/* Logo with Anchor Point */}
                <div style={{ transform: `scale(${logoProgress})` }}>
                    <ViableTargetLogo progress={logoProgress.valueOf()} />
                </div>

                {/* Primary CTA Button */}
                <div style={{ transform: `scale(${finalScale})` }}>
                    <button style={{
                        background: '#9333ea', // Primary Solid for maximum contrast "Good" look
                        color: 'white',
                        border: 'none',
                        padding: '22px 64px',
                        borderRadius: '100px',
                        fontSize: '26px', fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 20px 50px -10px rgba(147, 51, 234, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.5) inset',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        letterSpacing: '0.5px'
                    }}>
                        {ctaText}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* URL - Clean & Simple */}
                <div style={{
                    fontSize: '22px', fontWeight: 700, color: '#7e22ce',
                    opacity: urlOp,
                    transform: `translateY(${interpolate(frame, [btnStart + 10, btnStart + 30], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })}px)`
                }}>
                    {ctaUrl}
                </div>

            </div>
        </AbsoluteFill>
    );
};
