import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { VideoScene } from '../../../types';
import { Camera } from '../components/Camera';
import { DeviceMockup } from '../components/DeviceMockup';
import { FloatingElementsLayer } from '../components/FloatingElementsLayer';
import { DynamicBackground } from '../components/DynamicBackground';
import { Cursor } from '../components/Cursor';

interface DeviceShowcaseSceneProps {
    scene: VideoScene;
    brandColor: string;
}

export const DeviceShowcaseScene: React.FC<DeviceShowcaseSceneProps> = ({
    scene,
    brandColor
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Default device config if not provided
    const deviceConfig = scene.deviceConfig || {
        deviceType: 'laptop' as const,
        angle: 'isometric_left' as const,
        screenContent: 'svg' as const,
        showCursor: false,
        glowColor: brandColor,
        shadowIntensity: 'medium' as const,
    };

    // Scene title animation
    const titleOpacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
            {/* 1. Dynamic Background (Upgraded) */}
            <DynamicBackground
                colors={scene.colorPalette || [brandColor, '#4f46e5', '#0f172a']}
                speed="medium"
            />

            {/* 2. Hero Device Container with "Breathing" Float + Dynamic Camera Movement */}
            <Camera
                move={scene.cameraMove}
                choreography={scene.choreography?.camera}
                angle={scene.cameraAngle || 'isometric_left'}
            >
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    perspective: '1000px', // Enhance 3D effect
                }}>
                    {/* Independent Breathing Animation */}
                    <div style={{
                        transform: `
                        translateY(${Math.sin(frame * 0.03) * 15}px) 
                        rotateX(${Math.sin(frame * 0.02) * 2}deg)
                    `,
                        position: 'relative',
                    }}>
                        {/* Premium Back Glow */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '120%',
                            height: '120%',
                            background: `radial-gradient(circle, ${brandColor}40 0%, transparent 70%)`,
                            filter: 'blur(60px)',
                            zIndex: -1,
                        }} />

                        {/* Device Layer */}
                        <DeviceMockup
                            config={deviceConfig}
                            svgContent={scene.svgContent}
                            videoUrl={scene.videoUrl}
                            brandColor={brandColor}
                        />

                        {/* Dynamic Reflection/Shadow */}
                        <div style={{
                            position: 'absolute',
                            bottom: -40,
                            left: '10%',
                            width: '80%',
                            height: '20px',
                            background: 'black',
                            filter: 'blur(20px)',
                            opacity: 0.4 + Math.sin(frame * 0.03) * 0.1, // Pulse shadow with float
                            transform: `scaleX(${1 - Math.sin(frame * 0.03) * 0.05})`
                        }} />
                    </div>
                </AbsoluteFill>
            </Camera>

            {/* 3. Floating Elements Layer (Parallax handled component-side) */}
            <FloatingElementsLayer
                elements={scene.floatingElements}
                brandColor={brandColor}
            />

            {/* 4. Cursor Layer (if enabled) */}
            {deviceConfig.showCursor && scene.choreography?.ui && (
                <Cursor choreography={scene.choreography.ui} />
            )}

            {/* 5. Scene Title Overlay (Cinematic) */}
            {scene.subText && (
                <AbsoluteFill style={{
                    justifyContent: 'flex-end',
                    paddingBottom: 80,
                    alignItems: 'center',
                    pointerEvents: 'none'
                }}>
                    <div
                        style={{
                            opacity: titleOpacity,
                            transform: `translateY(${titleY}px)`,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(10px)',
                            padding: '12px 24px',
                            borderRadius: '30px',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: 24,
                                fontWeight: 600,
                                color: 'white',
                                margin: 0,
                                letterSpacing: '0.02em',
                            }}
                        >
                            {scene.subText}
                        </h2>
                    </div>
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
