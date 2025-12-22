import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface PretaaSlot8SatisfactionProps {
    brandColor?: string;
    notificationText?: string;
    backgroundColor?: string;
    mainTextColor?: string;
}

import { ThemeStyles } from '../components/ThemeEngine';

export const PretaaSlot_8_Satisfaction: React.FC<PretaaSlot8SatisfactionProps & { themeStyles?: ThemeStyles }> = ({
    brandColor = '#3b82f6',
    notificationText,
    backgroundColor,
    mainTextColor,
    themeStyles
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 80 },
    });

    const pulse = Math.sin(frame / 20) * 0.05 + 1;
    const rotate = interpolate(frame, [0, 300], [0, 360]);

    return (
        <AbsoluteFill style={{ backgroundColor: backgroundColor || '#f8fafc' }}>
            {/* Soft Ambient Background Gradients */}
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    right: '30%',
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15), transparent 70%)', // Red tint from reference
                    filter: 'blur(60px)',
                    opacity: entrance,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '30%',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${brandColor}20, transparent 70%)`, // Blue tint
                    filter: 'blur(60px)',
                    opacity: entrance,
                }}
            />

            {/* Central Circle Container */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) scale(${entrance})`,
                    width: 400,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Thin Orbit Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -50,
                        borderRadius: '50%',
                        border: '1px solid #cbd5e1',
                        borderRightColor: 'transparent',
                        transform: `rotate(${rotate}deg)`,
                    }}
                />

                {/* Dotted Orbit Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: -50,
                        borderRadius: '50%',
                        border: '1px dotted #94a3b8',
                        opacity: 0.5,
                        transform: `rotate(-${rotate * 0.5}deg)`,
                    }}
                />

                {/* White Center Circle */}
                <div
                    style={{
                        width: 280,
                        height: 280,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `scale(${pulse})`,
                        zIndex: 10,
                    }}
                >
                    {/* Minimalist Smiley Face */}
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round">
                        {/* Eyes */}
                        <path d="M 30 40 L 30 40.01" strokeWidth="8" />
                        <path d="M 70 40 L 70 40.01" strokeWidth="8" />

                        {/* Smile */}
                        <path d="M 25 65 Q 50 90 75 65" />
                    </svg>
                </div>

                {/* Sparkling Particles */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 + frame) * (Math.PI / 180);
                    const radius = 180 + Math.sin(frame / 10 + i) * 20;
                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: i % 2 === 0 ? '#ef4444' : brandColor,
                                transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) scale(${interpolate(Math.sin(frame / 5 + i), [-1, 1], [0.5, 1])})`,
                                opacity: 0.6,
                            }}
                        />
                    );
                })}
            </div>

            {/* Notification Cards */}
            {/* Left Card */}
            <div
                style={{
                    position: 'absolute',
                    left: '15%',
                    top: '45%',
                    transform: `translateY(-50%) translateX(${(1 - entrance) * -50}px)`,
                    background: 'white',
                    padding: '20px 24px',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    width: 320,
                    opacity: entrance,
                    zIndex: 20,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>RENEWAL</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1' }}>Thu</span>
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                    {/* Dynamic or Default Text */}
                    {notificationText ? (
                        <span style={{ fontWeight: 600 }}>{notificationText}</span>
                    ) : (
                        <>
                            <span style={{ color: brandColor, fontWeight: 700 }}>Cadman Inc.</span> renewal date 03/29/22 is coming up in <span style={{ color: '#ef4444' }}>14 days</span>.
                        </>
                    )}
                </div>
            </div>

            {/* Right Card */}
            <div
                style={{
                    position: 'absolute',
                    right: '15%',
                    top: '38%',
                    transform: `translateY(-50%) translateX(${(1 - entrance) * 50}px)`,
                    background: 'white',
                    padding: '20px 24px',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    width: 320,
                    opacity: entrance,
                    zIndex: 5, // Behind the left card visually if they overlapped
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>RENEWAL</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1' }}>1m</span>
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                    <span style={{ color: brandColor, fontWeight: 700 }}>Mayer LTD</span> opt-out date is coming up in <span style={{ color: '#ef4444' }}>14 days</span>.
                </div>
            </div>
        </AbsoluteFill>
    );
};
