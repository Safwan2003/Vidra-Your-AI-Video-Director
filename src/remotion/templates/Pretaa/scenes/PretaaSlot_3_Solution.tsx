import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Animated Letter Reveal
const AnimatedLetter = ({ letter, index, delay, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
    const translateY = interpolate(frame, [delay, delay + 15], [20, 0], { easing: Easing.out(Easing.cubic) });
    const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

    return (
        <span style={{
            display: 'inline-block',
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            color,
            marginRight: 2 // letter-spacing adjustment
        }}>
            {letter}
        </span>
    );
};

// Logo Stroke Animation (SVG simulated)
const LogoStroke = ({ active, color }: any) => {
    const frame = useCurrentFrame();
    if (!active) return null;

    // Simulate drawing the 'p' or first letter stroke
    const draw = interpolate(frame, [10, 30], [200, 0], { extrapolateRight: 'clamp' });

    return (
        <svg width="200" height="200" viewBox="0 0 100 100" style={{ position: 'absolute', left: '42%', top: '40%' }}>
            {/* Abstract curved stroke representing the brand mark entrance */}
            <path
                d="M 20 80 Q 50 10 80 80"
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray="200"
                strokeDashoffset={draw}
                strokeLinecap="round"
                transform="rotate(-15 50 50)"
            />
        </svg>
    );
};


export const PretaaSlot3Solution = ({
    solutionText = "pretaa",
    tagline = "The Solution Is Here",
    accentColor = "#1e1b4b" // Dark Navy from reference
}) => {
    const frame = useCurrentFrame();

    // Split text for animation
    const letters = solutionText.split('');
    const midPoint = Math.floor(letters.length / 2);

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Background Ambience (consistent with Scenes 1 & 2) */}
            <AbsoluteFill>
                <div style={{
                    position: 'absolute', top: '20%', left: '10%',
                    width: 700, height: 700, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)',
                    filter: 'blur(100px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '20%', right: '10%',
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.05), transparent 70%)',
                    filter: 'blur(100px)'
                }} />
            </AbsoluteFill>

            {/* Logo Text Container */}
            <div style={{
                textAlign: 'center', zIndex: 10, position: 'relative'
            }}>
                <h1 style={{
                    fontSize: 160, fontWeight: 800, color: accentColor,
                    margin: 0, letterSpacing: '-6px', fontFamily: 'sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {letters.map((char, i) => (
                        <AnimatedLetter
                            key={i}
                            letter={char}
                            index={i}
                            delay={25 + i * 4}
                            color={accentColor}
                        />
                    ))}
                </h1>

                {/* Subtitle / Tagline Fade In */}
                <div style={{
                    marginTop: 40,
                    fontSize: 32, fontWeight: 600, color: '#64748b',
                    letterSpacing: '4px', textTransform: 'uppercase',
                    opacity: interpolate(frame, [60, 90], [0, 1]),
                    transform: `translateY(${interpolate(frame, [60, 90], [20, 0])}px)`
                }}>
                    {tagline}
                </div>
            </div>

            {/* Flash Effect on Reveal */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'white',
                opacity: interpolate(frame, [25, 35, 60], [0, 0.6, 0]),
                pointerEvents: 'none',
                mixBlendMode: 'overlay'
            }} />

        </AbsoluteFill>
    );
};
