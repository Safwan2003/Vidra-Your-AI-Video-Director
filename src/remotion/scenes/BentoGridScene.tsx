import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { VideoScene, BentoItem } from '../../../types';
import { DynamicBackground } from '../components/DynamicBackground';
import { Camera } from '../components/Camera';

interface BentoGridSceneProps {
    scene: VideoScene;
}

const BentoCard: React.FC<{ item: BentoItem; delay: number }> = ({ item, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame: frame - delay,
        fps,
        config: { damping: 12, stiffness: 100 }
    });

    const opacity = interpolate(
        frame - delay,
        [0, 10],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl
                border border-white/10
                bg-white/5 backdrop-blur-xl
                shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                flex flex-col items-center justify-center
                group
            `}
            style={{
                gridColumn: `span ${item.colSpan}`,
                gridRow: `span ${item.rowSpan}`,
                transform: `scale(${scale})`,
                opacity: opacity,
                willChange: 'transform, opacity'
            }}
        >
            {/* Glass Highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div
                className="relative w-full h-full p-4 flex flex-col"
                dangerouslySetInnerHTML={{ __html: item.content }}
            />

            {/* Optional Title Label */}
            {item.title && (
                <div className="absolute bottom-4 left-4 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-white/80 text-xs font-medium tracking-wide font-sans">
                        {item.title}
                    </span>
                </div>
            )}
        </div>
    );
};

export const BentoGridScene: React.FC<BentoGridSceneProps> = ({ scene }) => {
    const items = scene.bentoItems || [];

    return (
        <AbsoluteFill className="bg-slate-950">
            {/* 1. Underlying Dynamic Background */}
            <DynamicBackground type="mesh_gradient" colorPalette={['#1e293b', '#0f172a', '#3b82f6', '#8b5cf6']} />

            {/* 2. Global Camera Move (gentle zoom/pan) */}
            <Camera move={scene.cameraMove || 'zoom_in_slow'}>
                <AbsoluteFill className="flex items-center justify-center p-12">

                    {/* 3. The Grid Container */}
                    <div
                        className="grid grid-cols-4 grid-rows-3 gap-6 w-full max-w-6xl aspect-video"
                        style={{
                            perspective: '2000px',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {items.map((item, index) => (
                            <BentoCard
                                key={item.id}
                                item={item}
                                delay={index * 5} // Staggered entrance
                            />
                        ))}
                    </div>

                    {/* 4. Scene Title Overlay (if any) */}
                    {scene.mainText && (
                        <div className="absolute top-10 left-0 w-full text-center z-50">
                            <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                                {scene.mainText}
                            </h2>
                        </div>
                    )}

                </AbsoluteFill>
            </Camera>
        </AbsoluteFill>
    );
};
