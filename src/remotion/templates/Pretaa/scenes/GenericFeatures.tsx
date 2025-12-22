import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Blurred Phone Mockup Background
const PhoneBackdrop = ({ delay, xOffset }: any) => {
    const frame = useCurrentFrame();

    // Slight floating movement
    const y = Math.sin((frame + delay) * 0.03) * 10;

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${y}px))`,
            width: 300, height: 600,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            borderRadius: 40,
            border: '2px solid rgba(255,255,255,0.1)',
            filter: 'blur(4px)', // Glassy blur
            display: 'flex', flexDirection: 'column', gap: 15, padding: 20
        }}>
            <div style={{ width: '40%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
            <div style={{ width: '100%', height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: 15 }} />
            <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 10 }} />
            <div style={{ width: '80%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
            <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
        </div>
    );
};

// Crisp Foreground Widget
const FeatureWidget = ({ x, y, delay, title, text, action, accentColor = '#3b82f6' }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({ frame: frame - delay, fps, config: { damping: 14 } });
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);

    return (
        <div style={{
            position: 'absolute', left: x, top: y,
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity,
            zIndex: 10
        }}>
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: 24,
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                minWidth: 320,
                display: 'flex', flexDirection: 'column', gap: 12
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{title}</div>
                </div>

                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                    {text}
                </div>

                {action && (
                    <div style={{ fontSize: 14, color: accentColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {action} <span>→</span>
                    </div>
                )}
            </div>
        </div>
    );
};

interface GenericFeaturesProps {
    features: Array<{
        title: string;
        description: string;
        action?: string;
    }>;
    accentColor?: string;
}

export const GenericFeatures: React.FC<GenericFeaturesProps> = ({
    features = [],
    accentColor = '#3b82f6'
}) => {
    // Default features if none provided
    const safeFeatures = features.length > 0 ? features : [
        { title: 'Feature 1', description: 'Description of feature 1.', action: 'Explore' },
        { title: 'Feature 2', description: 'Description of feature 2.', action: 'Details' }
    ];

    return (
        <AbsoluteFill style={{ background: '#0f172a', overflow: 'hidden' }}>
            <PhoneBackdrop xOffset={-350} delay={0} />
            <PhoneBackdrop xOffset={0} delay={20} />
            <PhoneBackdrop xOffset={350} delay={40} />

            {safeFeatures.map((feat, index) => (
                <FeatureWidget
                    key={index}
                    x={index % 2 === 0 ? "50%" : "60%"} // Stagger position slightly for variety
                    y={index === 0 ? "40%" : "65%"}
                    delay={30 + (index * 20)}
                    title={feat.title}
                    text={feat.description}
                    action={feat.action}
                    accentColor={accentColor}
                />
            ))}
        </AbsoluteFill>
    );
};
