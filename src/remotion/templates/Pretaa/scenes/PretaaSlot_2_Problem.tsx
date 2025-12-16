import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Elegant Curve Arrow showing trend
const TrendArrow = ({ progress }: any) => {
    const pathLength = 1000;
    const dashOffset = interpolate(progress, [0, 1], [pathLength, 0]);

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
                <linearGradient id="arrowGrad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {/* The Curve */}
            <path
                d="M 500 900 Q 1200 850 1200 200"
                fill="none"
                stroke="url(#arrowGrad)"
                strokeWidth="4"
                strokeDasharray="12 12"
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                filter="url(#glow)"
            />
            {/* Arrow Head */}
            <g transform="translate(1200, 200) rotate(-10)">
                <path
                    d="M -20 20 L 0 0 L 20 20"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: interpolate(progress, [0.9, 1], [0, 1]) }}
                />
            </g>
        </svg>
    );
};

// 3D Glassy Clock
const GlassClock = ({ scale }: any) => {
    const frame = useCurrentFrame();

    return (
        <div style={{
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.8)',
            position: 'absolute',
            left: '50%', top: '45%',
            transform: `translate(-50%, -50%) scale(${scale})`,
            boxShadow: '0 30px 60px rgba(0,0,0,0.15), inset 0 0 20px rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Clock Face Markers */}
            {[0, 90, 180, 270].map((deg, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: i % 2 === 0 ? 4 : 20, height: i % 2 === 0 ? 20 : 4,
                    background: '#64748b',
                    borderRadius: 4,
                    transform: `translate(-50%, -50%) rotate(${deg}deg) translate(0, -110px)`
                }} />
            ))}

            {/* Hour Hand */}
            <div style={{
                position: 'absolute', top: '25%', left: '50%',
                width: 8, height: '25%', background: '#334155',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${frame * 3}deg)`,
                borderRadius: 4,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }} />

            {/* Minute Hand */}
            <div style={{
                position: 'absolute', top: '15%', left: '50%',
                width: 6, height: '35%', background: '#ef4444', // Red urgent hand
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${frame * 15}deg)`,
                borderRadius: 4,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }} />

            {/* Center Cap */}
            <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                border: '2px solid white',
                position: 'relative', zIndex: 10,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} />
        </div>
    );
};

// Floating Glass Currency Card
const GlassMoney = ({ delay }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
    const float = Math.sin((frame - delay) * 0.05) * 10;
    const rotate = Math.cos((frame - delay) * 0.03) * 5;

    return (
        <div style={{
            position: 'absolute',
            left: '60%', top: '60%',
            transform: `translate(-50%, -50%) scale(${scale}) translateY(${float}px) rotate(${rotate}deg)`,
            zIndex: 20,
        }}>
            <div style={{
                width: 140, height: 140,
                borderRadius: 35, // Soft square instead of circle for variety
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    fontSize: 80, fontWeight: 300, color: '#334155',
                    fontFamily: 'serif' // Elegant serif for Currency
                }}>
                    $
                </div>
            </div>
            {/* Small accent dot */}
            <div style={{ position: 'absolute', top: -10, right: -10, width: 30, height: 30, background: '#ef4444', borderRadius: '50%', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)' }} />
        </div>
    );
};

export const PretaaSlot2Problem = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const arrowProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const clockScale = spring({ frame, fps, config: { damping: 14 } });

    // Warning Pulse Background
    const pulse = Math.sin(frame * 0.1) * 0.1 + 0.9;

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            overflow: 'hidden'
        }}>
            {/* Red Background Flare (Problem Indication) - Pulsing */}
            <div style={{
                position: 'absolute', top: '20%', left: '30%',
                width: 800, height: 800, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)',
                filter: 'blur(80px)',
                opacity: interpolate(frame, [0, 30], [0, 1]) * pulse
            }} />

            {/* Dotted Trend Arrow */}
            <TrendArrow progress={arrowProgress} />

            {/* Glass Clock Icon */}
            <GlassClock scale={clockScale} />

            {/* Glass Money Icon */}
            <GlassMoney delay={15} />

            {/* Title Text */}
            <div style={{
                position: 'absolute', width: '100%', top: '12%', textAlign: 'center',
                opacity: interpolate(frame, [20, 40], [0, 1]),
                transform: `translateY(${interpolate(frame, [20, 40], [20, 0])}px)`
            }}>
                <h2 style={{
                    fontSize: 72, color: '#1e293b', margin: 0, fontWeight: 800,
                    letterSpacing: '-2px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                    Wasting Resources?
                </h2>
            </div>
        </AbsoluteFill>
    );
};
