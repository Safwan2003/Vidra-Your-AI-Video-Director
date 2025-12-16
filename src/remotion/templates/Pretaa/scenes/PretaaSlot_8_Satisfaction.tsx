import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Smiley Face Component
const SmileyFace = ({ delay }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
    const rotate = interpolate(frame, [delay, delay + 30], [-20, 0]);

    return (
        <div style={{
            width: 250, height: 250,
            background: 'white',
            borderRadius: '50%',
            boxShadow: '0 25px 60px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            position: 'relative',
            zIndex: 10
        }}>
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round">
                {/* Eyes */}
                <path d="M 35 40 L 35 45" />
                <path d="M 65 40 L 65 45" />
                {/* Smile */}
                <path d="M 30 65 Q 50 80 70 65" />
            </svg>

            {/* Orbit Ring */}
            <div style={{
                position: 'absolute', inset: -40,
                border: '2px dashed #cbd5e1',
                borderRadius: '50%',
                animation: 'spin 10s linear infinite' // Simulated via transform below
            }} />
        </div>
    );
};

// Notification Card
const RenewalCard = ({ x, y, delay, title, text }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({ frame: frame - delay, fps });
    const float = Math.sin((frame + delay) * 0.05) * 5;

    return (
        <div style={{
            position: 'absolute', left: x, top: y,
            transform: `translate(-50%, -50%) scale(${scale}) translateY(${float}px)`,
            background: 'white',
            padding: '24px',
            borderRadius: 20,
            boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
            maxWidth: 300,
            zIndex: 20
        }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 16, color: '#334155', lineHeight: 1.4 }}>{text}</div>
        </div>
    );
};

export const PretaaSlot8Satisfaction = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Ambient Background */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 800, height: 800,
                background: 'radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%)', // Subtle Green for success
                transform: 'translate(-50%, -50%)',
                filter: 'blur(100px)'
            }} />

            <SmileyFace delay={10} />

            <RenewalCard
                x="25%" y="45%" delay={20}
                title="RENEWAL"
                text="Cadman Inc. renewal date 03/29/22 is coming up in 14 days."
            />

            <RenewalCard
                x="75%" y="55%" delay={30}
                title="HAPPINESS"
                text="NPS Score increased by 20 points this quarter!"
            />

        </AbsoluteFill>
    );
};
