import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

interface Slot2TransitionProps {
    headline?: string;
    subheadline?: string;
    accentColor?: string;
}

// Custom Icons matching the reference images
const AIIconSVG = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Central Square/Chip */}
        <rect x="35" y="35" width="30" height="30" rx="6" strokeWidth="3" />
        {/* Letter A */}
        <path d="M50 42 L42 60 M58 60 L50 42 M44 54 L56 54" strokeWidth="3" />

        {/* Circuit Nodes Top */}
        <path d="M50 35 L50 20" /> <circle cx="50" cy="16" r="3" fill="white" stroke="none" />
        <path d="M40 35 L35 25" /> <circle cx="33" cy="22" r="3" fill="white" stroke="none" />
        <path d="M60 35 L65 25" /> <circle cx="67" cy="22" r="3" fill="white" stroke="none" />

        {/* Circuit Nodes Bottom */}
        <path d="M50 65 L50 80" /> <circle cx="50" cy="84" r="3" fill="white" stroke="none" />
        <path d="M40 65 L35 75" /> <circle cx="33" cy="78" r="3" fill="white" stroke="none" />
        <path d="M60 65 L65 75" /> <circle cx="67" cy="78" r="3" fill="white" stroke="none" />

        {/* Circuit Nodes Left */}
        <path d="M35 50 L20 50" /> <circle cx="16" cy="50" r="3" fill="white" stroke="none" />
        <path d="M35 40 L25 35" /> <circle cx="22" cy="33" r="3" fill="white" stroke="none" />
        <path d="M35 60 L25 65" /> <circle cx="22" cy="67" r="3" fill="white" stroke="none" />

        {/* Circuit Nodes Right */}
        <path d="M65 50 L80 50" /> <circle cx="84" cy="50" r="3" fill="white" stroke="none" />
        <path d="M65 40 L75 35" /> <circle cx="78" cy="33" r="3" fill="white" stroke="none" />
        <path d="M65 60 L75 65" /> <circle cx="78" cy="67" r="3" fill="white" stroke="none" />
    </svg>
);

const NLPIconSVG = () => (
    <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Brain Profile Outline */}
        <path d="M55 30 C 50 25, 40 25, 35 35 C 30 35, 25 40, 25 50 C 25 65, 35 75, 50 75 C 55 75, 60 70, 60 65 L 60 45" />

        {/* Brain Internal Nodes */}
        <path d="M45 40 L55 50 L45 60" opacity="0.8" />
        <circle cx="45" cy="40" r="2" fill="white" />
        <circle cx="55" cy="50" r="2" fill="white" />
        <circle cx="45" cy="60" r="2" fill="white" />

        {/* Chat Bubbles coming out */}
        <path d="M65 35 H 85 V 50 H 75 L 65 55 V 35 Z" strokeWidth="2" />
        <path d="M68 40 H 82" opacity="0.6" strokeWidth="2" />
        <path d="M68 45 H 78" opacity="0.6" strokeWidth="2" />

        <path d="M70 60 H 90 V 75 H 80 L 70 80 V 60 Z" strokeWidth="2" />
        <path d="M73 65 H 87" opacity="0.6" strokeWidth="2" />
        <path d="M73 70 H 83" opacity="0.6" strokeWidth="2" />
    </svg>
);

const TechIcon = ({
    type,
    color,
    label,
    delay,
    frame,
    fps
}: {
    type: 'ai' | 'nlp',
    color: string,
    label: string,
    delay: number,
    frame: number,
    fps: number
}) => {
    const scale = spring({
        frame: frame - delay,
        fps,
        from: 0,
        to: 1,
        config: { damping: 14, stiffness: 90, mass: 1.2 }
    });

    const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const floatY = Math.sin((frame - delay) / 30) * 5;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', /* Increased gap */
            opacity, transform: `scale(${scale}) translateY(${floatY}px)`
        }}>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '40px'
            }}>
                {/* Text on Left for AI */}
                {type === 'ai' && (
                    <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '28px',
                        color: '#0f172a',
                        textAlign: 'right',
                        width: '200px',
                        lineHeight: '1.2'
                    }}>
                        {label.split(' ').map((word, i) => <div key={i}>{word}</div>)}
                    </div>
                )}

                {/* Icon Bubble */}
                <div style={{
                    width: '180px', height: '180px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color} 0%, ${color}ee 100%)`,
                    boxShadow: `0 25px 60px -15px ${color}60`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    border: '4px solid rgba(255,255,255,0.4)'
                }}>
                    <div style={{ width: '60%', height: '60%' }}>
                        {type === 'ai' ? <AIIconSVG /> : <NLPIconSVG />}
                    </div>
                </div>

                {/* Text on Right for NLP */}
                {type === 'nlp' && (
                    <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '28px',
                        color: '#0f172a',
                        textAlign: 'left',
                        width: '200px',
                        lineHeight: '1.2'
                    }}>
                        {label.split(' ').map((word, i) => <div key={i}>{word}</div>)}
                    </div>
                )}
            </div>

        </div>
    );
};

export const Slot2Transition: React.FC<Slot2TransitionProps> = ({
    headline = "Powered by Advanced AI",
    subheadline = "Understanding your customers at scale",
    accentColor = '#22c55e'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 2. CONTENT ANIMATION
    const showAI = 15;
    const showNLP = 45;
    const showConnection = 25;

    // Connection Arc Animation
    const arcLength = 400;
    const arcDraw = interpolate(frame - showConnection, [0, 30], [arcLength, 0], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic)
    });
    const arcOpacity = interpolate(frame - showConnection, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #fae8ff 100%)', // Soft Purple/Pink Gradient
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Subtle Gradient Glow spots */}
            <div style={{
                position: 'absolute', top: 0, right: 0, width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)'
            }} />

            {/* MAIN CONTENT CONTAINER */}
            <div style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>

                {/* CENTRAL GRAPHIC */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '100px' // Space for arc
                }}>

                    {/* Connecting Arc SVG - ABOSLUTE CENTERED */}
                    <svg style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '450px', height: '220px',
                        zIndex: 1,
                        opacity: arcOpacity
                    }}>
                        {/* Purple Infinity/S-Curve Path */}
                        <path
                            d="M 120 110 C 180 30, 270 190, 330 110"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={arcLength}
                            strokeDashoffset={arcDraw}
                        />
                        {/* Particle */}
                        <circle r="6" fill="#8b5cf6">
                            <animateMotion
                                dur="1.5s"
                                repeatCount="indefinite"
                                path="M 120 110 C 180 30, 270 190, 330 110"
                            />
                        </circle>
                    </svg>

                    {/* AI COMPONENT (Left) */}
                    <TechIcon
                        type="ai"
                        color="#ef4444"
                        label="Artificial Intelligence"
                        delay={showAI}
                        frame={frame} fps={fps}
                    />

                    {/* NLP COMPONENT (Right) */}
                    <TechIcon
                        type="nlp"
                        color="#f59e0b"
                        label="Natural Language Processing"
                        delay={showNLP}
                        frame={frame} fps={fps}
                    />

                </div>

            </div>
        </AbsoluteFill>
    );
};
