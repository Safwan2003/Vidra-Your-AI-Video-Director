import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion';
import { VideoScene } from '../../../types';

interface CTAFinaleSceneProps {
    scene: VideoScene;
    brandColor: string;
}

export const CTAFinaleScene: React.FC<CTAFinaleSceneProps> = ({
    scene,
    brandColor
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Get colors from palette
    const primaryColor = scene.colorPalette?.[0] || brandColor;
    const secondaryColor = scene.colorPalette?.[1] || '#ffffff';

    // Logo animation
    const logoScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });
    const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

    // Main text animation
    const textDelay = 15;
    const textProgress = spring({
        frame: frame - textDelay,
        fps,
        config: { damping: 15, stiffness: 80 },
    });
    const textY = interpolate(textProgress, [0, 1], [40, 0]);

    // Subtext animation
    const subtextDelay = 25;
    const subtextOpacity = interpolate(frame - subtextDelay, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const subtextY = interpolate(frame - subtextDelay, [0, 20], [20, 0], { extrapolateRight: 'clamp' });

    // CTA Button animation
    const buttonDelay = 40;
    const buttonScale = spring({
        frame: frame - buttonDelay,
        fps,
        config: { damping: 10, stiffness: 150 },
    });
    const buttonPulse = 1 + Math.sin((frame - buttonDelay) / 10) * 0.02;

    // Background glow pulse
    const glowPulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.3, 0.6]);

    // Confetti particles
    const renderConfetti = () => {
        const particles = [];
        const confettiColors = [primaryColor, secondaryColor, '#FFD700', '#FF6B6B', '#4ECDC4'];

        for (let i = 0; i < 50; i++) {
            const delay = 50 + i * 2;
            if (frame < delay) continue;

            const particleFrame = frame - delay;
            const startX = 50 + (Math.random() - 0.5) * 20;
            const startY = 30;
            const endX = startX + (Math.random() - 0.5) * 100;
            const fallSpeed = 2 + Math.random() * 3;
            const rotation = particleFrame * (10 + Math.random() * 10);
            const opacity = interpolate(particleFrame, [0, 10, 60], [0, 1, 0], { extrapolateRight: 'clamp' });

            particles.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${interpolate(particleFrame, [0, 100], [startX, endX])}%`,
                        top: `${startY + particleFrame * fallSpeed * 0.3}%`,
                        width: 8 + Math.random() * 8,
                        height: 8 + Math.random() * 8,
                        background: confettiColors[i % confettiColors.length],
                        borderRadius: Math.random() > 0.5 ? '50%' : 2,
                        transform: `rotate(${rotation}deg)`,
                        opacity,
                    }}
                />
            );
        }
        return particles;
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
            {/* Animated gradient background */}
            <AbsoluteFill
                style={{
                    background: `
                        radial-gradient(ellipse at 50% 40%, ${primaryColor}${Math.round(glowPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 50%),
                        radial-gradient(ellipse at 30% 70%, ${secondaryColor}20 0%, transparent 40%),
                        radial-gradient(ellipse at 70% 80%, ${primaryColor}15 0%, transparent 35%),
                        linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
                    `,
                }}
            />

            {/* Confetti Layer */}
            <AbsoluteFill style={{ overflow: 'hidden' }}>
                {renderConfetti()}
            </AbsoluteFill>

            {/* Content Container */}
            <AbsoluteFill className="flex flex-col items-center justify-center">
                {/* Logo */}
                {scene.logoUrl && (
                    <div
                        style={{
                            transform: `scale(${logoScale})`,
                            opacity: logoOpacity,
                            marginBottom: 30,
                        }}
                    >
                        <Img
                            src={scene.logoUrl}
                            style={{ width: 120, height: 120, objectFit: 'contain' }}
                        />
                    </div>
                )}

                {/* Main Text / Brand Name */}
                <div
                    style={{
                        transform: `translateY(${textY}px) scale(${textProgress})`,
                        opacity: textProgress,
                        textAlign: 'center',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 80,
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: `0 0 60px ${primaryColor}40`,
                            margin: 0,
                            letterSpacing: '-2px',
                        }}
                    >
                        {scene.mainText || scene.ctaText}
                    </h1>
                </div>

                {/* Subtext / Tagline */}
                <div
                    style={{
                        opacity: subtextOpacity,
                        transform: `translateY(${subtextY}px)`,
                        marginTop: 16,
                        textAlign: 'center',
                    }}
                >
                    <p
                        style={{
                            fontSize: 28,
                            color: '#94a3b8',
                            margin: 0,
                            fontWeight: 500,
                        }}
                    >
                        {scene.subText}
                    </p>
                </div>

                {/* CTA Button */}
                {scene.ctaButtonText && (
                    <div
                        style={{
                            transform: `scale(${Math.max(0, buttonScale) * buttonPulse})`,
                            marginTop: 50,
                        }}
                    >
                        <button
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                color: 'white',
                                border: 'none',
                                padding: '20px 50px',
                                fontSize: 22,
                                fontWeight: 700,
                                borderRadius: 50,
                                cursor: 'pointer',
                                boxShadow: `0 10px 40px ${primaryColor}50, 0 0 0 4px ${primaryColor}20`,
                                transition: 'transform 0.2s',
                            }}
                        >
                            {scene.ctaButtonText}
                        </button>
                    </div>
                )}
            </AbsoluteFill>

            {/* Light rays emanating from center */}
            <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
                {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * 360;
                    const rayOpacity = interpolate(frame, [30, 50], [0, 0.1], { extrapolateRight: 'clamp' });
                    const rayLength = interpolate(frame, [30, 60], [0, 150], { extrapolateRight: 'clamp' });

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: 4,
                                height: `${rayLength}%`,
                                background: `linear-gradient(180deg, ${primaryColor}00 0%, ${primaryColor} 100%)`,
                                transformOrigin: 'top center',
                                transform: `rotate(${angle}deg)`,
                                opacity: rayOpacity,
                            }}
                        />
                    );
                })}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
