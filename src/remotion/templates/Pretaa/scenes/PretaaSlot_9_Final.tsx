import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface PretaaSlot9FinalProps {
    brandName?: string;
    brandColor?: string;
    ctaText?: string;
    domain?: string;
    backgroundColor?: string;
    mainTextColor?: string;
}

export const PretaaSlot_9_Final: React.FC<PretaaSlot9FinalProps> = ({
    brandName = 'pretaa',
    brandColor = '#3b82f6',
    ctaText = 'Contact Us Today',
    domain = 'pretaa.com',
    backgroundColor,
    mainTextColor
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 80 },
    });

    const buttonScale = spring({
        frame: frame - 15,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const pulse = Math.sin(frame / 30) * 0.03 + 1;

    return (
        <AbsoluteFill style={{ backgroundColor: backgroundColor || '#f8fafc' }}>
            {/* Background Gradients from Ref */}
            <div
                style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.8,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 600,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.8,
                }}
            />

            {/* Content Container */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 50,
                zIndex: 10,
            }}>
                {/* Logo / Brand Name */}
                <div style={{
                    transform: `translateY(${(1 - entrance) * 50}px)`,
                    opacity: entrance,
                }}>
                    <h1 style={{
                        fontSize: 120,
                        fontWeight: 900,
                        color: mainTextColor || '#1e1b4b', // Dark navy text from ref
                        letterSpacing: '-0.05em',
                        lineHeight: 1,
                        margin: 0,
                    }}>
                        {brandName.toLowerCase()}
                    </h1>
                </div>

                {/* CTA Button */}
                <div style={{
                    transform: `scale(${Math.max(0, buttonScale)})`,
                }}>
                    <button style={{
                        background: '#1d4ed8', // Strong blue button
                        color: 'white',
                        border: 'none',
                        padding: '24px 60px',
                        fontSize: 28,
                        fontWeight: 500,
                        borderRadius: 12,
                        boxShadow: '0 10px 30px rgba(29, 78, 216, 0.3)',
                        transform: `scale(${pulse})`,
                    }}>
                        {ctaText}
                    </button>
                </div>

                {/* Domain Name */}
                <div style={{
                    transform: `translateY(${(1 - interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })) * 20}px)`,
                    opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' }),
                }}>
                    <p style={{
                        fontSize: 20,
                        color: '#475569',
                        margin: 0,
                        fontWeight: 500,
                    }}>
                        {domain}
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
