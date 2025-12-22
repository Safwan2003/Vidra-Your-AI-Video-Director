import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface CTAOutroProps {
    brandName?: string;
    ctaText?: string;
    ctaUrl?: string;
}

export const CTAOutro: React.FC<CTAOutroProps> = ({
    brandName = "viable",
    ctaText = "Get Started Today",
    ctaUrl = "www.viable.com"
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Logo animation
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 12, mass: 0.5 }
    });

    const logoOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });

    // CTA animation
    const ctaOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
    const ctaY = spring({
        frame: frame - 30,
        fps,
        from: 35,
        to: 0,
        config: { damping: 15, stiffness: 100 }
    });

    // URL animation
    const urlOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: 'clamp' });

    // Button glow
    const glowIntensity = 0.35 + Math.sin(frame / 18) * 0.15;

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(180deg, #071f18 0%, #0a2920 50%, #0d3327 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '45px'
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                top: '35%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '700px',
                height: '700px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 60%)',
                filter: 'blur(100px)',
                borderRadius: '50%'
            }} />

            {/* Brand Logo/Name */}
            <div style={{
                transform: `scale(${logoScale})`,
                opacity: logoOpacity,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                zIndex: 10
            }}>
                {/* Logo Icon */}
                <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 45px rgba(34, 197, 94, 0.4)'
                }}>
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                        <path d="M4 5L12 19L20 5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div style={{
                    fontSize: '80px',
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-3px',
                    textShadow: '0 8px 30px rgba(34, 197, 94, 0.3)'
                }}>
                    {brandName}
                </div>
            </div>

            {/* CTA Button */}
            <div style={{
                opacity: ctaOpacity,
                transform: `translateY(${ctaY}px)`,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                padding: '22px 65px',
                borderRadius: '55px',
                fontSize: '26px',
                fontWeight: 800,
                color: 'white',
                boxShadow: `0 20px 55px rgba(34, 197, 94, ${glowIntensity})`,
                zIndex: 10
            }}>
                {ctaText} →
            </div>

            {/* URL */}
            <div style={{
                opacity: urlOpacity,
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 500,
                letterSpacing: '2px',
                zIndex: 10
            }}>
                {ctaUrl}
            </div>

            {/* Grid pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(34, 197, 94, 0.02) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};
