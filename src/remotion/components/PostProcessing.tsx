import React from 'react';
import { AbsoluteFill } from 'remotion';

interface PostProcessingProps {
    children: React.ReactNode;
    intensity?: 'subtle' | 'medium' | 'strong';
}

export const PostProcessing: React.FC<PostProcessingProps> = ({ children, intensity = 'medium' }) => {
    // Intensity multipliers
    const intensityMap = {
        subtle: 0.5,
        medium: 1.0,
        strong: 1.5
    };
    const multiplier = intensityMap[intensity];

    return (
        <AbsoluteFill>
            {/* Main Content */}
            <AbsoluteFill style={{ zIndex: 1 }}>
                {children}
            </AbsoluteFill>

            {/* Bloom/Glow Effect Layer */}
            <AbsoluteFill
                style={{
                    zIndex: 2,
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                    opacity: 0.3 * multiplier
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        filter: `blur(${20 * multiplier}px) brightness(1.5)`,
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 60%)'
                    }}
                />
            </AbsoluteFill>

            {/* Chromatic Aberration (RGB Split) */}
            <AbsoluteFill
                style={{
                    zIndex: 3,
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                    opacity: 0.15 * multiplier
                }}
            >
                {/* Red channel offset */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: `${-2 * multiplier}px`,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at 10% 50%, rgba(255,0,0,0.1), transparent 30%)'
                    }}
                />
                {/* Blue channel offset */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: `${2 * multiplier}px`,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at 90% 50%, rgba(0,0,255,0.1), transparent 30%)'
                    }}
                />
            </AbsoluteFill>

            {/* Vignette (Enhanced) */}
            <AbsoluteFill
                style={{
                    zIndex: 4,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
                    opacity: 0.6 * multiplier
                }}
            />

            {/* Film Grain */}
            <AbsoluteFill
                style={{
                    zIndex: 5,
                    pointerEvents: 'none',
                    opacity: 0.08 * multiplier,
                    mixBlendMode: 'overlay'
                }}
            >
                <svg width="100%" height="100%">
                    <filter id="noise">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.9"
                            numOctaves="4"
                            stitchTiles="stitch"
                        />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noise)" />
                </svg>
            </AbsoluteFill>

            {/* Color Grading Overlay (What a Story style) */}
            <AbsoluteFill
                style={{
                    zIndex: 6,
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                    opacity: 0.15 * multiplier
                }}
            >
                {/* Lift shadows (add slight blue tint) */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(100,150,255,0.1), transparent 50%)'
                    }}
                />
                {/* Warm highlights */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(0deg, rgba(255,200,150,0.1), transparent 50%)'
                    }}
                />
            </AbsoluteFill>

            {/* Subtle Edge Glow */}
            <AbsoluteFill
                style={{
                    zIndex: 7,
                    pointerEvents: 'none',
                    boxShadow: `inset 0 0 ${100 * multiplier}px rgba(255,255,255,0.05)`
                }}
            />
        </AbsoluteFill>
    );
};
