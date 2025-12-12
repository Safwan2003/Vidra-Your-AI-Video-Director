import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { VideoScene } from '../../../types';
import { DarkGlassCard } from '../components/GlassCard';
import { smoothInterpolate, EASINGS } from '../../constants/easings';
import { staggerChildren } from '../utils/stagger';

interface FloatingUILayersProps {
    scene: VideoScene;
    brandColor: string;
}

/**
 * Floating UI Layers Scene
 * Multiple UI panels floating in 3D space with parallax movement
 * "What a Story" quality scene type
 */
export const FloatingUILayersScene: React.FC<FloatingUILayersProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();

    // Create mock UI components if not provided
    const uiComponents = scene.uiComponents || [
        { id: '1', type: 'card', content: scene.mainText || 'Feature 1', position: { top: '20%', left: '10%', width: '30%', height: '25%' }, zIndex: 3, animation: 'slide_from_left' },
        { id: '2', type: 'card', content: scene.subText || 'Feature 2', position: { top: '50%', left: '50%', width: '35%', height: '30%' }, zIndex: 2, animation: 'slide_from_bottom' },
        { id: '3', type: 'card', content: 'Feature 3', position: { top: '15%', left: '60%', width: '28%', height: '20%' }, zIndex: 1, animation: 'fade_in' },
    ];

    // Stagger the components
    const staggeredComponents = staggerChildren(uiComponents, frame, 8);

    return (
        <AbsoluteFill style={{ background: `linear-gradient(135deg, ${brandColor}15, #0f172a)` }}>
            {/* Parallax Background Layers */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.1), transparent 70%)',
                    transform: `translateX(${interpolate(frame, [0, 90], [-20, 20])}px)`,
                }}
            />

            {/* Floating UI Components */}
            {staggeredComponents.map((component, index) => {
                if (!component.isVisible) return null;

                // Calculate parallax based on z-index (depth)
                const depth = component.zIndex || 1;
                const parallaxX = interpolate(frame, [0, 90], [0, -10 * depth]);
                const parallaxY = interpolate(frame, [0, 90], [0, 5 * depth]);

                // Animation based on type
                let opacity = 1;
                let translateY = 0;
                let translateX = 0;
                let scale = 1;

                const progress = smoothInterpolate(
                    frame,
                    [component.startFrame, component.startFrame + 20],
                    [0, 1],
                    EASINGS.smooth
                );

                switch (component.animation) {
                    case 'slide_from_left':
                        translateX = interpolate(progress, [0, 1], [-100, 0]);
                        opacity = progress;
                        break;
                    case 'slide_from_bottom':
                        translateY = interpolate(progress, [0, 1], [100, 0]);
                        opacity = progress;
                        break;
                    case 'fade_in':
                        opacity = progress;
                        scale = interpolate(progress, [0, 1], [0.8, 1]);
                        break;
                    case 'pop_in':
                        scale = smoothInterpolate(frame, [component.startFrame, component.startFrame + 15], [0, 1], EASINGS.bounce);
                        opacity = progress;
                        break;
                }

                // Floating animation (subtle up/down)
                const floatY = Math.sin((frame + index * 20) * 0.05) * 10;

                return (
                    <div
                        key={component.id}
                        style={{
                            position: 'absolute',
                            top: component.position.top,
                            left: component.position.left,
                            width: component.position.width,
                            height: component.position.height,
                            transform: `
                translate(${translateX + parallaxX}px, ${translateY + parallaxY + floatY}px)
                scale(${scale})
              `,
                            opacity,
                            zIndex: component.zIndex,
                        }}
                    >
                        <DarkGlassCard blur={15} opacity={0.2} padding={24}>
                            <div style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>
                                {component.content}
                            </div>
                        </DarkGlassCard>
                    </div>
                );
            })}

            {/* Main Title (if present) */}
            {scene.mainText && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '50%',
                        transform: `translateX(-50%) translateY(${interpolate(frame, [60, 80], [50, 0], { extrapolateRight: 'clamp' })}px)`,
                        opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: 'clamp' }),
                        fontSize: '48px',
                        fontWeight: 700,
                        color: 'white',
                        textAlign: 'center',
                        maxWidth: '80%',
                    }}
                >
                    {scene.mainText}
                </div>
            )}
        </AbsoluteFill>
    );
};
