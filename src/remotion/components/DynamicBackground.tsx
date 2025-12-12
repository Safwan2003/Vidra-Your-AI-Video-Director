import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Easing, Video, spring } from 'remotion';
import { CameraMove } from '../../../types';

interface DynamicBackgroundProps {
    videoUrl?: string;
    move?: CameraMove;
    colorPalette?: string[]; // What a Story color palette
    style?: 'gradient' | 'mesh' | 'aurora'; // Background style option
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
    videoUrl,
    move = 'static',
    colorPalette,
    style = 'mesh' // Default to premium mesh style
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();

    // VIDEO BACKGROUND (WAN 2.1 - What a Story Quality)
    if (videoUrl) {
        return (
            <AbsoluteFill className="bg-slate-900 overflow-hidden z-0">
                <Video
                    src={videoUrl}
                    className="w-full h-full object-cover opacity-90"
                    style={{
                        filter: 'brightness(0.7) contrast(1.3) saturate(1.2)' // Enhanced cinematic look
                    }}
                    loop
                    muted
                />
                {/* Subtle overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            </AbsoluteFill>
        );
    }

    // Use color palette if provided, otherwise use default professional palette
    const colors = colorPalette && colorPalette.length >= 2
        ? colorPalette
        : ['#667eea', '#764ba2', '#4facfe']; // Default professional palette

    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        easing: Easing.bezier(0.33, 1, 0.68, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Smooth spring progress for organic movement
    const smoothProgress = spring({
        frame,
        fps,
        config: { damping: 30, stiffness: 40 },
    });

    // Animated gradient positions for mesh effect
    const meshOffset1 = Math.sin(frame * 0.02) * 20;
    const meshOffset2 = Math.cos(frame * 0.015) * 25;
    const meshOffset3 = Math.sin(frame * 0.025 + Math.PI) * 15;

    // Gradient mesh blob positions
    const blob1X = 30 + meshOffset1;
    const blob1Y = 40 + Math.cos(frame * 0.02) * 15;
    const blob2X = 70 + meshOffset2;
    const blob2Y = 60 + Math.sin(frame * 0.018) * 20;
    const blob3X = 50 + meshOffset3;
    const blob3Y = 30 + Math.cos(frame * 0.022) * 10;

    // AURORA STYLE - Northern lights effect
    if (style === 'aurora') {
        const auroraWave1 = Math.sin(frame * 0.03) * 30;
        const auroraWave2 = Math.cos(frame * 0.025) * 40;

        return (
            <AbsoluteFill className="overflow-hidden z-0" style={{ backgroundColor: '#0a0a1a' }}>
                {/* Aurora bands */}
                {[...Array(5)].map((_, i) => {
                    const bandY = 20 + i * 15 + Math.sin(frame * 0.02 + i) * 10;
                    const bandOpacity = 0.2 + Math.sin(frame * 0.03 + i * 0.5) * 0.1;
                    return (
                        <div
                            key={i}
                            className="absolute"
                            style={{
                                left: '-10%',
                                right: '-10%',
                                top: `${bandY}%`,
                                height: '30%',
                                background: `linear-gradient(90deg, 
                                    transparent, 
                                    ${colors[i % colors.length]}40 ${20 + auroraWave1}%, 
                                    ${colors[(i + 1) % colors.length]}60 50%, 
                                    ${colors[i % colors.length]}40 ${80 + auroraWave2}%, 
                                    transparent
                                )`,
                                filter: 'blur(40px)',
                                opacity: bandOpacity,
                                transform: `skewY(${5 + Math.sin(frame * 0.01 + i) * 3}deg)`,
                            }}
                        />
                    );
                })}

                {/* Stars */}
                {[...Array(50)].map((_, i) => {
                    const twinkle = Math.sin(frame * 0.1 + i * 0.5) * 0.3 + 0.5;
                    return (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: 1 + (i % 3),
                                height: 1 + (i % 3),
                                left: `${(i * 17) % 100}%`,
                                top: `${(i * 23) % 100}%`,
                                opacity: twinkle * 0.6,
                            }}
                        />
                    );
                })}
            </AbsoluteFill>
        );
    }

    // MESH STYLE - Premium gradient mesh (default)
    return (
        <AbsoluteFill className="overflow-hidden z-0" style={{ backgroundColor: '#0f172a' }}>

            {/* 1. Deep Background Base */}
            <AbsoluteFill style={{
                background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
            }} />

            {/* 2. Animated gradient mesh blobs (Softer, larger) */}
            <div
                className="absolute rounded-full"
                style={{
                    width: '90%',
                    height: '90%',
                    left: `${blob1X}%`,
                    top: `${blob1Y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${colors[0]}50 0%, transparent 60%)`,
                    filter: 'blur(120px)',
                    mixBlendMode: 'screen'
                }}
            />
            <div
                className="absolute rounded-full"
                style={{
                    width: '80%',
                    height: '80%',
                    left: `${blob2X}%`,
                    top: `${blob2Y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${colors[1]}40 0%, transparent 60%)`,
                    filter: 'blur(140px)',
                    mixBlendMode: 'screen'
                }}
            />
            <div
                className="absolute rounded-full"
                style={{
                    width: '70%',
                    height: '70%',
                    left: `${blob3X}%`,
                    top: `${blob3Y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${colors[2] || colors[0]}30 0%, transparent 60%)`,
                    filter: 'blur(130px)',
                    mixBlendMode: 'screen'
                }}
            />

            {/* 3. Volumetric God Rays (Rotating Conic Gradients) */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `conic-gradient(from ${frame * 0.2}deg at 50% 50%, transparent 0deg, ${colors[0]}20 20deg, transparent 40deg, transparent 100deg, ${colors[1]}20 140deg, transparent 160deg)`,
                    filter: 'blur(60px)',
                    transform: `scale(1.5)`,
                }}
            />

            {/* 4. Floating Dust Particles (Subtle) */}
            {[...Array(20)].map((_, i) => {
                const x = (i * 23 + frame * 0.05) % 100;
                const y = (i * 37 - frame * 0.08) % 100;
                const size = 1 + (i % 3);
                return (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: size,
                            height: size,
                            opacity: 0.2 + (Math.sin(frame * 0.05 + i) * 0.1),
                            boxShadow: `0 0 ${size * 2}px white`
                        }}
                    />
                );
            })}

            {/* 5. Noise Grain Texture Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    opacity: 0.07,
                    mixBlendMode: 'overlay',
                }}
            />

            {/* 6. Cinematic Vignette (Stronger edges) */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(15, 23, 42, 0.4) 80%, rgba(15, 23, 42, 0.9) 100%)',
                }}
            />
        </AbsoluteFill>
    );
};
