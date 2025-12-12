import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Img, interpolate, spring } from 'remotion';
import { VideoScene } from '../../../types';

interface FlatScreenshotSceneProps {
    scene: VideoScene;
    brandColor?: string;
}

export const FlatScreenshotScene: React.FC<FlatScreenshotSceneProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Determine the image URL - supports customMedia, 3dConfig.screenUrl, or direct customMedia string
    const screenUrl = scene.customMedia && typeof scene.customMedia === 'string'
        ? scene.customMedia
        : (scene.customMedia as any)?.url || scene["3dConfig"]?.screenUrl;

    // Fallback if no image
    if (!screenUrl) {
        return (
            <AbsoluteFill className="bg-slate-900 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">No Screenshot Selected</div>
            </AbsoluteFill>
        );
    }

    // Animation Configurations
    const scale = interpolate(frame, [0, 100], [1, 1.05], { extrapolateRight: 'clamp' });
    const translateY = interpolate(frame, [0, 60], [20, 0], {
        extrpolateRight: 'clamp',
        easing: t => 1 - Math.pow(1 - t, 3)
    });

    // Intro opacity
    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill className="bg-slate-950 overflow-hidden">
            {/* Background Blur Effect */}
            <AbsoluteFill style={{ zIndex: 0 }}>
                <Img
                    src={screenUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'blur(40px) brightness(0.4)',
                        transform: 'scale(1.2)'
                    }}
                />
                <div className="absolute inset-0 bg-slate-950/40" />
            </AbsoluteFill>

            {/* Main Screenshot Container */}
            <AbsoluteFill className="flex items-center justify-center" style={{ zIndex: 10 }}>
                <div
                    style={{
                        width: '85%',
                        height: 'auto',
                        maxHeight: '85%',
                        position: 'relative',
                        opacity,
                        transform: `scale(${scale}) translateY(${translateY}px)`,
                    }}
                >
                    {/* Glow/Shadow behind */}
                    <div
                        className="absolute inset-0 bg-indigo-500/20 blur-2xl -z-10"
                        style={{ transform: 'scale(1.05)' }}
                    />

                    {/* The Screenshot Image */}
                    <Img
                        src={screenUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                            backgroundColor: '#1e293b' // Fallback bg if transparent
                        }}
                    />
                </div>

                {/* Text Overlay (Optional) */}
                {scene.mainText && (
                    <div
                        className="absolute bottom-12 left-0 right-0 text-center"
                        style={{
                            opacity: interpolate(frame, [10, 30], [0, 1]),
                            transform: `translateY(${interpolate(frame, [10, 30], [20, 0])}px)`
                        }}
                    >
                        <h2
                            className="text-4xl font-bold text-white drop-shadow-lg inline-block px-8 py-3 rounded-full backdrop-blur-md"
                            style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {scene.mainText}
                        </h2>
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
