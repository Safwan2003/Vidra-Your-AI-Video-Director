import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface CTAOutroProps {
    brandName: string;
    ctaText?: string;
    ctaUrl?: string;
}

export const CTAOutro: React.FC<CTAOutroProps> = ({
    brandName,
    ctaText = "Get Started Today",
    ctaUrl = "www.example.com"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Spring animation for logo
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 12, mass: 0.5 }
    });

    // Fade in CTA text
    const ctaOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
    const ctaY = interpolate(frame, [20, 40], [30, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px'
        }}>
            {/* Brand Logo/Name */}
            <div style={{
                transform: `scale(${logoScale})`,
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center'
            }}>
                {brandName}
            </div>

            {/* CTA Button */}
            <div style={{
                opacity: ctaOpacity,
                transform: `translateY(${ctaY}px)`,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                padding: '20px 60px',
                borderRadius: '50px',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
            }}>
                {ctaText}
            </div>

            {/* URL */}
            <div style={{
                opacity: ctaOpacity,
                fontSize: '24px',
                color: '#94a3b8',
                fontFamily: 'monospace'
            }}>
                {ctaUrl}
            </div>
        </AbsoluteFill>
    );
};
