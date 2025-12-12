import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';
import { CameraMove, CameraAngle, CameraChoreography, Keyframe } from '../../../types';

interface CameraProps {
    children: React.ReactNode;
    move?: CameraMove;
    angle?: CameraAngle;
    choreography?: CameraChoreography;
    useSpring?: boolean; // Enable spring physics for smoother motion
}

// Helper: Convert bezier array to Easing function
const getEasingFromKeyframe = (keyframe: Keyframe) => {
    if (keyframe.easing && keyframe.easing.length === 4) {
        return Easing.bezier(
            keyframe.easing[0],
            keyframe.easing[1],
            keyframe.easing[2],
            keyframe.easing[3]
        );
    }
    // Default smooth easing
    return Easing.bezier(0.25, 0.1, 0.25, 1);
};

// Helper: Convert AI % keyframes to frame numbers and values with per-keyframe easing
const useKeyframeInterpolation = (
    currentFrame: number,
    duration: number,
    keyframes?: Keyframe[],
    defaultValue: number = 0,
    useSpringPhysics: boolean = false,
    fps: number = 30
) => {
    return useMemo(() => {
        if (!keyframes || keyframes.length === 0) return defaultValue;

        // Sort by frame %
        const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

        // For spring physics, use the last keyframe as target
        if (useSpringPhysics && sorted.length > 0) {
            const targetValue = sorted[sorted.length - 1].value;
            const startValue = sorted[0].value;
            const springProgress = spring({
                frame: currentFrame,
                fps,
                config: {
                    damping: 15,
                    stiffness: 80,
                    mass: 1,
                },
            });
            return startValue + (targetValue - startValue) * springProgress;
        }

        // Standard interpolation with segments
        const inputRange = sorted.map(k => (k.frame / 100) * duration);
        const outputRange = sorted.map(k => k.value);

        // Find current segment and use its easing
        let currentEasing = Easing.bezier(0.25, 0.1, 0.25, 1);
        for (let i = 0; i < sorted.length - 1; i++) {
            const segmentStart = (sorted[i].frame / 100) * duration;
            const segmentEnd = (sorted[i + 1].frame / 100) * duration;
            if (currentFrame >= segmentStart && currentFrame <= segmentEnd) {
                currentEasing = getEasingFromKeyframe(sorted[i + 1]);
                break;
            }
        }

        return interpolate(currentFrame, inputRange, outputRange, {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: currentEasing
        });
    }, [currentFrame, duration, keyframes, defaultValue, useSpringPhysics, fps]);
};

export const Camera: React.FC<CameraProps> = ({
    children,
    move = 'static',
    angle = 'straight_on',
    choreography,
    useSpring: useSpringProp = false
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames, fps } = useVideoConfig();

    // 1. Initial Angle Setup (Legacy Support)
    let initialRotateX = 0;
    let initialRotateY = 0;
    let initialScale = 1;

    // Only apply presets if no detailed choreography overrides them later
    switch (angle) {
        case 'isometric_left': initialRotateX = 10; initialRotateY = 15; initialScale = 0.9; break;
        case 'isometric_right': initialRotateX = 10; initialRotateY = -15; initialScale = 0.9; break;
        case 'cinematic_low': initialRotateX = 25; initialScale = 1.1; break;
        case 'straight_on': default: initialRotateX = 0; initialRotateY = 0; initialScale = 1; break;
    }

    // 2. Agentic Choreography (Priority)
    const agentZoom = useKeyframeInterpolation(frame, durationInFrames, choreography?.zoom, 0, useSpringProp, fps);
    const agentRotX = useKeyframeInterpolation(frame, durationInFrames, choreography?.rotateX, initialRotateX, useSpringProp, fps);
    const agentRotY = useKeyframeInterpolation(frame, durationInFrames, choreography?.rotateY, initialRotateY, useSpringProp, fps);

    // 3. Legacy Move Logic (Fallback) with improved easing
    const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        easing: Easing.bezier(0.33, 1, 0.68, 1), // Smooth ease-out
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
    });

    // Smooth spring progress for smoother legacy animations
    const smoothProgress = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 60 },
        durationInFrames: durationInFrames,
    });

    let legacyTransform = '';
    let blur = 0;
    let parallaxLayers: { transform: string; zIndex: number }[] = [];

    if (!choreography) {
        switch (move) {
            case 'orbit_smooth': {
                // Smoother orbit with spring physics
                const orbitAngle = smoothProgress * 360;
                const orbitX = Math.sin(orbitAngle * Math.PI / 180) * 50;
                const orbitY = Math.cos(orbitAngle * Math.PI / 180) * 15;
                legacyTransform = `translate(${orbitX}px, ${orbitY}px) rotateY(${orbitAngle * 0.1}deg)`;
                break;
            }
            case 'zoom_in_hero': {
                // Buttery smooth hero zoom with spring
                const heroZ = interpolate(smoothProgress, [0, 0.7, 1], [0, 250, 300]);
                const s = interpolate(smoothProgress, [0, 1], [1, 1.3]);
                legacyTransform = `translateZ(${heroZ}px) scale(${s})`;
                break;
            }
            case 'parallax_layers': {
                // Enhanced parallax with multiple layer effects
                const baseZ = interpolate(smoothProgress, [0, 1], [0, 100]);
                const baseY = interpolate(smoothProgress, [0, 1], [0, -30]);
                legacyTransform = `translateZ(${baseZ}px) translateY(${baseY}px)`;

                // Create parallax depth data for potential use
                parallaxLayers = [
                    { transform: `translateZ(${baseZ * 0.5}px) translateY(${baseY * 0.3}px)`, zIndex: 0 },
                    { transform: `translateZ(${baseZ}px) translateY(${baseY}px)`, zIndex: 1 },
                    { transform: `translateZ(${baseZ * 1.5}px) translateY(${baseY * 1.5}px)`, zIndex: 2 },
                ];
                break;
            }
            case 'dolly_zoom': {
                // Hitchcock dolly zoom effect with smooth easing
                const dZ = interpolate(smoothProgress, [0, 1], [0, -150]);
                const dS = interpolate(smoothProgress, [0, 1], [1, 1.5]);
                legacyTransform = `translateZ(${dZ}px) scale(${dS})`;
                break;
            }
            case 'zoom_in_slow':
                legacyTransform = `translateZ(${interpolate(smoothProgress, [0, 1], [0, 200])}px)`;
                break;
            case 'zoom_out_fast':
                legacyTransform = `translateZ(${interpolate(progress, [0, 1], [100, -100])}px)`;
                break;
            case 'pan_left':
                legacyTransform = `translateX(${interpolate(smoothProgress, [0, 1], [0, -100])}px) rotateY(${interpolate(smoothProgress, [0, 1], [0, 5])}deg)`;
                break;
            case 'pan_right':
                legacyTransform = `translateX(${interpolate(smoothProgress, [0, 1], [0, 100])}px) rotateY(${interpolate(smoothProgress, [0, 1], [0, -5])}deg)`;
                break;
            case 'rack_focus':
                blur = interpolate(frame, [0, 20], [10, 0], { extrapolateRight: 'clamp' });
                legacyTransform = `scale(${interpolate(smoothProgress, [0, 1], [1, 1.05])})`;
                break;
            default:
                break;
        }
    }

    // 4. Construct Final Transform
    let finalTransform = '';

    if (choreography) {
        finalTransform = `rotateX(${agentRotX}deg) rotateY(${agentRotY}deg) translateZ(${agentZoom}px)`;
    } else {
        finalTransform = `scale(${initialScale}) rotateX(${initialRotateX}deg) rotateY(${initialRotateY}deg) ${legacyTransform}`;
    }

    return (
        <AbsoluteFill
            style={{
                perspective: '2000px',
                backgroundColor: 'transparent'
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: finalTransform,
                    filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    transition: 'transform 0.05s ease-out' // Micro-smoothing
                }}
            >
                {/* Cinematic Drift Container - Always moving slightly */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    transform: `
                        rotateX(${Math.sin(frame * 0.01) * 0.5}deg) 
                        rotateY(${Math.cos(frame * 0.015) * 0.5}deg)
                        translateZ(${Math.sin(frame * 0.02) * 10}px)
                    `,
                    transformStyle: 'preserve-3d'
                }}>
                    {children}
                </div>
            </div>
        </AbsoluteFill>
    );
};
