import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { VideoScene } from '../../../types';

interface SceneProps {
    scene: VideoScene;
    brandColor: string;
}

export const IsometricScene: React.FC<SceneProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();

    const scale = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const rotate = interpolate(frame, [0, 300], [0, 10]);

    return (
        <AbsoluteFill className="bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl" style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`
            }}>
                <div
                    dangerouslySetInnerHTML={{ __html: scene.svgContent }}
                    style={{ fill: brandColor }}
                    className="drop-shadow-[0_20px_50px_rgba(99,102,241,0.4)]"
                />
            </div>

            {/* Overlay Text */}
            <div className="absolute bottom-10 left-0 right-0 text-center">
                <h2 className="text-4xl font-bold text-white drop-shadow-xl">{scene.script}</h2>
            </div>
        </AbsoluteFill>
    );
};
