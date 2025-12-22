import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img } from 'remotion';

// Blurred Phone Mockup Background
const PhoneBackdrop = ({ delay, xOffset }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

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
            {/* Skeletal UI lines */}
            <div style={{ width: '40%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
            <div style={{ width: '100%', height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: 15 }} />
            <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 10 }} />
            <div style={{ width: '80%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
            <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }} />
        </div>
    );
};

import { ThemeStyles } from '../components/ThemeEngine';

// Crisp Foreground Widget
const FeatureWidget = ({ x, y, delay, type, content, mainTextColor, themeStyles }: any) => {
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
                borderRadius: themeStyles?.borderRadius ?? 24,
                ...themeStyles?.card,
                minWidth: 320,
                display: 'flex', flexDirection: 'column', gap: 12
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                        fontSize: 20,
                        ...themeStyles?.heading,
                        color: themeStyles?.heading?.color || '#0f172a'
                    }}>{content.title}</div>
                    {type === 'cadman' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ fontSize: 10, background: '#1e293b', color: 'white', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>CUSTOMER</span>
                            <span style={{ fontSize: 10, background: '#86efac', color: '#14532d', padding: '4px 8px', borderRadius: 6, fontWeight: 700 }}>REVENUE</span>
                        </div>
                    )}
                </div>

                {/* Body Text */}
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>
                    {content.text}
                </div>

                {/* Action Link */}
                {content.action && (
                    <div style={{ fontSize: 14, color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {content.action} <span>→</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PretaaSlot4Features = ({
    features = [
        { title: "Cadman Inc.", description: "Renewal date 03/29/22 is coming up in 14 days." },
        { title: "Hustle Hint", description: "Send an email to customer service to find out what is going on.", icon: "Send email" }
    ],
    backgroundColor,
    mainTextColor,
    themeStyles
}: {
    features?: Array<{ title: string; description: string; icon?: string }>,
    backgroundColor?: string,
    mainTextColor?: string,
    themeStyles?: ThemeStyles
}) => {
    return (
        <AbsoluteFill style={{ background: backgroundColor || '#0f172a', overflow: 'hidden' }}>
            {/* Background Phones Layer */}
            <PhoneBackdrop xOffset={-350} delay={0} />
            <PhoneBackdrop xOffset={0} delay={20} />
            <PhoneBackdrop xOffset={350} delay={40} />

            {/* Foreground Widgets Layer - Dynamic */}
            {features.map((feature, i) => (
                <FeatureWidget
                    key={i}
                    x="50%"
                    y={`${40 + (i * 25)}%`} // Stagger vertically: 40%, 65%, 90%...
                    delay={30 + (i * 20)}
                    type={i === 0 ? "cadman" : "hustle"}
                    content={{
                        title: feature.title,
                        text: feature.description,
                        action: feature.icon // Using icon field as action text for now
                    }}
                    mainTextColor={mainTextColor}
                    themeStyles={themeStyles}
                />
            ))}
        </AbsoluteFill>
    );
};
