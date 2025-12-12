import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, Img, Video } from 'remotion';
import { VideoScene, FloatingElement, UIComponent } from '../../../types';
import { MousePointer2 } from 'lucide-react';
import { Camera } from '../components/Camera';
import { LaptopFrame } from '../components/LaptopFrame';
import { Cursor } from '../components/Cursor';
import { DynamicBackground } from '../components/DynamicBackground';

interface SceneProps {
    scene: VideoScene;
    brandColor: string;
}

export const UIMockupScene: React.FC<SceneProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // 3D Tilt Logic - REMOVED for Quality Overhaul (Handled by Camera now)
    // const tiltX = interpolate(frame, [0, 150], [10, -5], { extrapolateRight: 'clamp' });
    // const tiltY = interpolate(frame, [0, 150], [-15, 15], { extrapolateRight: 'clamp' });
    // const scale = interpolate(frame, [0, 150], [0.8, 1], { extrapolateRight: 'clamp' });

    // Floating Elements Animation
    const renderFloatingElement = (el: FloatingElement, idx: number) => {
        const delay = el.delay ? el.delay / 30 : idx * 10; // Convert roughly to frames

        const y = interpolate(frame - delay, [0, 30], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
            <div
                key={idx}
                style={{
                    opacity,
                    transform: `translate(${el.position.left}, ${el.position.top}) translateY(${y}px) translateZ(80px)`,
                    position: 'absolute',
                }}
                className="bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4"
            >
                {el.icon && <div className="w-8 h-8 rounded bg-indigo-500/20" />}
                <div>
                    <div className="text-xs text-slate-400 uppercase font-bold">{el.text}</div>
                    {el.value && <div className="text-xl font-bold text-white">{el.value}</div>}
                </div>
            </div>
        );
    };

    return (
        <AbsoluteFill className="bg-gray-900 perspective-[2000px] overflow-hidden">
            {/* 1. Dynamic Background (Unified) */}
            <DynamicBackground
                colors={scene.colorPalette || [brandColor, '#4f46e5', '#0f172a']}
                speed="slow"
            />

            {/* Main 3D Container - Wrapped in Camera for Agency Quality Choreography */}
            <Camera
                move={scene.cameraMove}
                choreography={scene.choreography?.camera}
                angle={scene.cameraAngle || 'isometric_right'} // Default to a nice angle
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transformStyle: 'preserve-3d',
                    // transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})` // Removed manual transform
                }}>
                    {/* 3D Laptop Wrap */}
                    <LaptopFrame>
                        {/* Browser Header */}
                        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-inner" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-inner" />
                        </div>

                        {/* Content */}
                        <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                            {(() => {
                                // Defensive check for customMedia being an object (AI hallucination or data error)
                                const rawMedia = scene.customMedia;
                                // @ts-ignore
                                const mediaSrc = typeof rawMedia === 'object' ? rawMedia?.url || rawMedia?.src || '' : rawMedia;

                                const isVideo = (scene.customMediaType === 'video') ||
                                    (typeof mediaSrc === 'string' && !!mediaSrc.match(/\.(mp4|webm|mov)$/i));

                                if (isVideo && mediaSrc) {
                                    return <Video src={mediaSrc} className="w-full h-full object-cover opacity-90" />;
                                } else if (mediaSrc) {
                                    return <Img src={mediaSrc} className="w-full h-full object-cover opacity-90" />;
                                } else if (scene.uiComponents && scene.uiComponents.length > 0) {
                                    return (
                                        /* Decomposed UI Rendering (Phase 2 - Exploded 3D) */
                                        <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                                            {/* Beam Connectors Layer */}
                                            {scene.uiComponents.map((comp, idx) => {
                                                if (idx === 0) return null;
                                                const prev = scene.uiComponents![idx - 1];
                                                // Calculate centers approximate (simplified for now)
                                                // Assuming percentage strings '20%' converted to numbers roughly
                                                const x1 = parseFloat(prev.position.left);
                                                const y1 = parseFloat(prev.position.top) + parseFloat(prev.position.height) / 2;
                                                const x2 = parseFloat(comp.position.left);
                                                const y2 = parseFloat(comp.position.top) + parseFloat(comp.position.height) / 2;

                                                return (
                                                    <div key={`beam-${idx}`} style={{ transform: 'translateZ(10px)', width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' }}>
                                                        {/* Beam Connector: Thicker, Brighter, Faster */}
                                                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                                            {/* Glow effect underlay */}
                                                            <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#3b82f6" strokeWidth="6" strokeOpacity="0.2" strokeLinecap="round" />
                                                            {/* Main beam */}
                                                            <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#60a5fa" strokeWidth="3" strokeDasharray="6 6" strokeOpacity="0.8" />
                                                            {/* Travelling Pulse */}
                                                            <circle r="4" fill="#ffffff" filter="drop-shadow(0 0 4px #3b82f6)">
                                                                <animateMotion
                                                                    dur="1.5s"
                                                                    repeatCount="indefinite"
                                                                    path={`M${x1 * width / 100},${y1 * height / 100} L${x2 * width / 100},${y2 * height / 100}`}
                                                                /* 
                                                                   Note: SVG percentage coordinates in path data are tricky/not supported in animateMotion. 
                                                                   We need absolute coordinates for the path if possible, or use a different animation technique.
                                                                   Since we are inside a 3D transform, using screen coordinates is hard.
                                                                   Simplified approach: Animate a line percentage or just use CSS keyframes on a div if SVG path is hard.
                                                                   Let's stick to the visual line for now and skip the complex dot animation if it risks breaking.
                                                                   Actually, let's use a simpler CSS animation on the circle.
                                                                */
                                                                />
                                                                {/* Fallback Pulse Dot using CSS Motion Path is safer if SVG coords are mixed */}
                                                            </circle>
                                                            {/* Simple Dot at both ends */}
                                                            <circle cx={`${x1}%`} cy={`${y1}%`} r="3" fill="#60a5fa" />
                                                            <circle cx={`${x2}%`} cy={`${y2}%`} r="3" fill="#60a5fa" />
                                                        </svg>
                                                    </div>
                                                );
                                            })}

                                            {scene.uiComponents.map((comp, idx) => {
                                                // ... (existing mapping code)
                                                // Staggered Animation & 3D Layering
                                                const delay = idx * 10;
                                                const opacity = interpolate(frame - delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                                                // Exploded View Z-Index mapping
                                                const zDepth = (idx + 1) * 15;

                                                let initialTransform = '';
                                                if (comp.animation === 'slide_from_left') {
                                                    const x = interpolate(frame - delay, [0, 20], [-50, 0], { extrapolateRight: 'clamp' });
                                                    initialTransform = `translateX(${x}px)`;
                                                } else if (comp.animation === 'slide_from_bottom') {
                                                    const y = interpolate(frame - delay, [0, 20], [50, 0], { extrapolateRight: 'clamp' });
                                                    initialTransform = `translateY(${y}px)`;
                                                } else if (comp.animation === 'pop_in') {
                                                    const s = interpolate(frame - delay, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });
                                                    initialTransform = `scale(${s})`;
                                                }

                                                // Compose 3D Transform
                                                const transform = `${initialTransform} translateZ(${zDepth}px)`;

                                                return (
                                                    <div
                                                        key={comp.id}
                                                        style={{
                                                            position: 'absolute',
                                                            top: comp.position.top,
                                                            left: comp.position.left,
                                                            width: comp.position.width,
                                                            height: comp.position.height,
                                                            zIndex: comp.zIndex,
                                                            opacity,
                                                            transform,
                                                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', // Deeper shadow for pop
                                                            background: 'rgba(255,255,255,0.05)',     // More visible glass
                                                            backdropFilter: 'blur(10px)',             // Stronger blur
                                                            border: '1px solid rgba(255,255,255,0.2)', // Crisper border
                                                            borderRadius: '12px'
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: comp.content }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                } else {
                                    return (
                                        /* Fallback to single SVG */
                                        <div dangerouslySetInnerHTML={{ __html: scene.svgContent }} className="w-full p-8 opacity-90" />
                                    );
                                }
                            })()}

                            {/* Advanced Cursor Animation */}
                            {scene.customMediaType !== 'video' && (
                                <Cursor
                                    start={{ x: 1000, y: 800 }}
                                    end={{ x: 600, y: 450 }} // Approximate center of a 1200x675 screen
                                    durationInFrames={60}
                                    clickAtFrame={45}
                                    choreography={scene.choreography?.ui}
                                />
                            )}
                        </div>

                        {/* Gloss Sheen (Reflection) */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.05) 50%, transparent 55%)',
                                mixBlendMode: 'overlay'
                            }}
                        />
                    </LaptopFrame>

                    {/* Floating Elements popping out */}
                    <div className="absolute inset-0 pointer-events-none transform-style-3d">
                        {scene.floatingElements?.map((el, i) => renderFloatingElement(el, i))}
                    </div>

                </div >
            </Camera>
        </AbsoluteFill >
    );
};
