import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// INLINE COMPONENT TO FIX BUILD
const GlassCard = ({ children, style, className, blur = 30, opacity = 0.6, borderRadius = 32, padding = 60 }: any) => (
    <div style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderRadius: borderRadius,
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: `0 40px 80px -20px rgba(0,0,0,0.1)`,
        padding: padding,
        ...style
    }} className={className}>
        {children}
    </div>
);

interface Slot6OutroProps {
    brandName?: string;
    logoUrl?: string; // Optional custom logo image
    ctaText?: string;
    ctaUrl?: string;
    accentColor?: string;
}

// Custom Logo Component (Fallback)
const ViableTargetLogo = ({ progress, accentColor }: { progress: number, accentColor: string }) => {
    const centerScale = interpolate(progress, [0.5, 1], [0, 1], { extrapolateRight: 'clamp', easing: Easing.elastic(1) });
    const circle1Draw = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
    const circle2Draw = interpolate(progress, [0.2, 0.7], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <svg viewBox="0 0 120 120" style={{ height: '120px', width: '120px', overflow: 'visible' }}>
            <g transform="translate(60, 60)">
                <circle r="45" fill="none" stroke={accentColor} strokeWidth="8"
                    strokeDasharray={283} strokeDashoffset={283 * (1 - circle1Draw)}
                    transform="rotate(-90)" />
                <circle r="25" fill="none" stroke={accentColor} strokeWidth="8"
                    strokeDasharray={157} strokeDashoffset={157 * (1 - circle2Draw)}
                    transform="rotate(-90)" />
                <circle r="12" fill={accentColor} transform={`scale(${centerScale})`} />
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

    // 1. Scene Entrance (Background & Connector)
    const lineGrow = interpolate(frame, [0, 25], [0, 180], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const lineOp = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    // 2. Main Card Reveal
    const cardScale = spring({ frame: frame - 15, fps, from: 0.9, to: 1, config: { damping: 15 } });
    const cardOp = interpolate(frame, [15, 30], [0, 1]);

    // 3. Logo Animation
    const logoProgress = spring({ frame: frame - 25, fps, from: 0, to: 1, config: { damping: 14 } });

    // 4. CTA Entrance & Pulse
    const btnStart = 45;
    const btnY = interpolate(frame, [btnStart, btnStart + 20], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) });
    const btnOp = interpolate(frame, [btnStart, btnStart + 15], [0, 1], { extrapolateRight: 'clamp' });

    // Heartbeat loop
    const pulse = Math.sin((frame - btnStart - 40) / 10) * 0.02;
    const isPulsing = frame > btnStart + 40;
    const finalScale = isPulsing ? 1 + pulse : 1;

    // 5. URL Fade in
    const urlOp = interpolate(frame, [btnStart + 15, btnStart + 35], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Dynamic Background Blob */}
            <div style={{
                position: 'absolute', top: '-30%', left: '50%', transform: 'translate(-50%, 0)',
                width: '100%', height: '100%',
                background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, transparent 60%)`,
                pointerEvents: 'none'
            }} />

            {/* Decoration Circles */}
            <div style={{
                position: 'absolute', top: '10%', right: '10%',
                width: '300px', height: '300px',
                border: `1px solid ${accentColor}10`,
                borderRadius: '50%',
                transform: `scale(${1 + Math.sin(frame * 0.02) * 0.1})`,
            }} />

            {/* Central Glass Card */}
            <div style={{
                opacity: cardOp,
                transform: `scale(${cardScale})`,
                zIndex: 10
            }}>
                <GlassCard
                    blur={30} opacity={0.6} borderRadius={32} padding={60}
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        boxShadow: `0 40px 80px -20px ${accentColor}25, 0 0 0 1px rgba(255,255,255,0.8)`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '30px',
                        minWidth: '600px'
                    }}
                >
                    {/* Connector Line (Visually connecting from top of frame) */}
                    <div style={{
                        position: 'absolute', top: -100,
                        width: '2px',
                        background: `linear-gradient(180deg, transparent 0%, ${accentColor} 100%)`,
                        height: `${lineGrow}px`,
                        opacity: lineOp,
                    }} />

                    {/* Logo Area */}
                    <div style={{ transform: `scale(${logoProgress})` }}>
                        <ViableTargetLogo progress={logoProgress.valueOf()} accentColor={accentColor} />
                    </div>

                    {/* Brand Name */}
                    <h1 style={{
                        margin: 0,
                        fontSize: '56px', fontWeight: 900,
                        color: '#1e293b', letterSpacing: '-2px',
                        background: `linear-gradient(135deg, #1e293b 0%, ${accentColor} 100%)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        opacity: logoProgress
                    }}>
                        {brandName}
                    </h1>

                    {/* Primary CTA Button */}
                    <div style={{
                        opacity: btnOp,
                        transform: `translateY(${btnY}px) scale(${finalScale})`,
                        marginTop: '10px'
                    }}>
                        <button style={{
                            background: accentColor,
                            color: 'white',
                            border: 'none',
                            padding: '20px 48px',
                            borderRadius: '100px',
                            fontSize: '22px', fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: `0 20px 40px -10px ${accentColor}60, 0 2px 0 rgba(255,255,255,0.2) inset`,
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

                    {/* URL */}
                    <div style={{
                        fontSize: '18px', fontWeight: 600, color: '#64748b',
                        opacity: urlOp,
                        marginTop: '10px'
                    }}>
                        {ctaUrl}
                    </div>

                </GlassCard>
            </div>
        </AbsoluteFill>
    );
};
