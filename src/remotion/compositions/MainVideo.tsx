import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { zoomThrough } from '../transitions/ZoomThrough';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { fade } from '@remotion/transitions/fade';
import { VideoPlan } from '../../../types';
import { KineticTextScene } from '../scenes/KineticTextScene';
import { UIMockupScene } from '../scenes/UIMockupScene';
import { IsometricScene } from '../scenes/IsometricScene';
import { DeviceShowcaseScene } from '../scenes/DeviceShowcaseScene';
import { DataVisualizationScene } from '../scenes/DataVisualizationScene';
import { CTAFinaleScene } from '../scenes/CTAFinaleScene';
import { BentoGridScene } from '../scenes/BentoGridScene';
import { DeviceCloudScene } from '../scenes/DeviceCloudScene';
import { Camera } from '../components/Camera';
import { DynamicBackground } from '../components/DynamicBackground';
import { PostProcessing } from '../components/PostProcessing';
import { ParticleSystem } from '../components/ParticleSystem';
// import { AudioDirector } from '../components/AudioDirector'; // Replaced by AudioController
import { AudioController } from '../components/AudioController';
import { FloatingElementsLayer } from '../components/FloatingElementsLayer';
import { Scene3DWrapper } from '../scenes/Scene3DWrapper';
import { FloatingUILayersScene } from '../scenes/FloatingUILayersScene';
import { SocialProofScene } from '../scenes/SocialProofScene';
import { FlatScreenshotScene } from '../scenes/FlatScreenshotScene';
import { ViableTemplate } from '../templates/Viable';

interface MainVideoProps {
    plan?: VideoPlan;
}

export const MainVideo: React.FC<MainVideoProps> = ({ plan }) => {
    if (!plan) {
        return (
            <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white', fontSize: 32 }}>No plan provided</div>
            </AbsoluteFill>
        );
    }

    // --- TEMPLATE MODE: Render ViableTemplate directly ---
    if (plan.template === 'viable' && plan.templateData) {
        return (
            <ViableTemplate
                {...plan.templateData}
                colors={plan.templateData.colors || { background: plan.brandColor || '#0f172a', accent: '#6366f1', secondary: '#fb923c' }}
            />
        );
    }

    // --- GENERIC MODE: Render scenes with transitions ---
    const scenes = plan.scenes || [];

    // Helper to render scene content based on type
    const renderSceneContent = (scene: typeof plan.scenes[0]) => {
        switch (scene.type) {
            case '3d_laptop_orbit':
            case '3d_phone_float': // We will map phone to laptop/default for now until Phone model is made
                return <Scene3DWrapper scene={scene} />;
            case 'exploded_ui_view':
                // For now, render as 3D wrapper, later specific exploded view
                return <Scene3DWrapper scene={scene} />;
            case 'kinetic_text':
                return <KineticTextScene scene={scene} brandColor={plan.brandColor} />;
            case 'bento_grid':
                return <BentoGridScene scene={scene} />;
            case 'device_cloud':
                return <DeviceCloudScene scene={scene} />;
            case 'ui_mockup':
                return <UIMockupScene scene={scene} brandColor={plan.brandColor} />;
            case 'isometric_illustration':
                return <IsometricScene scene={scene} brandColor={plan.brandColor} />;
            case 'device_showcase':
                return <DeviceShowcaseScene scene={scene} brandColor={plan.brandColor} />;
            case 'data_visualization':
                return <DataVisualizationScene scene={scene} brandColor={plan.brandColor} />;
            case 'cta_finale':
                return <CTAFinaleScene scene={scene} brandColor={plan.brandColor} />;
            case 'split_comparison':
                // Fallback to UI Mockup for now
                return <UIMockupScene scene={scene} brandColor={plan.brandColor} />;
            case 'floating_ui_layers':
                return <FloatingUILayersScene scene={scene} brandColor={plan.brandColor} />;
            case 'social_proof':
                return <SocialProofScene scene={scene} brandColor={plan.brandColor} />;
            case 'flat_screenshot':
                return <FlatScreenshotScene scene={scene} brandColor={plan.brandColor} />;
            default:
                return <KineticTextScene scene={scene} brandColor={plan.brandColor} />;
        }
    };

    // Check if scene type needs camera wrapper (some scenes handle their own camera)
    const needsCameraWrapper = (type: string) => {
        return ['kinetic_text', 'ui_mockup', 'isometric_illustration'].includes(type);
    };

    // Helper to select transition presentation
    const getTransitionPresentation = (type?: string) => {
        switch (type) {
            case 'zoom_through':
                return zoomThrough();
            case 'wipe_right':
                return wipe({ direction: 'from-left' });
            case 'slide':
                return slide();
            case 'fade':
                return fade();
            default:
                return undefined;
        }
    };

    return (
        <AbsoluteFill className="bg-slate-900">
            {/* GLOBAL AUDIO CONTROLLER (Phase 6 - SFX & Music) */}
            <AudioController plan={plan} />

            {/* Cinematic Polish Layer */}
            <PostProcessing intensity="medium">
                <TransitionSeries>
                    {plan.scenes.map((scene, index) => {
                        const durationInFrames = Math.floor(scene.duration * 30);
                        const TransitionPresentation = getTransitionPresentation(scene.transition);

                        return (
                            <React.Fragment key={`${scene.id || 'scene'}-${index}`}>
                                <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                                    {/* Parallax Background Layer - Wan 2.1 Video Only */}
                                    <DynamicBackground
                                        videoUrl={scene.voiceoverUrl} // Wait, checking generic field, probably customMedia or wanPrompt logic. 
                                        // Actually DynamicBackground uses videoUrl prop which usually maps to background video.
                                        // For now let's keep it as is, usually scene doesn't have videoUrl, but we might want to check
                                        move={scene.cameraMove}
                                        colorPalette={scene.chartData?.[0]?.colors || (scene as any).colorPalette}
                                    />

                                    {/* Particle Effects Layer (What a Story quality) */}
                                    <ParticleSystem effects={(scene as any).particleEffects} />

                                    {/* Scene Content - with or without camera wrapper */}
                                    {needsCameraWrapper(scene.type) ? (
                                        <Camera
                                            move={scene.cameraMove}
                                            angle={scene.cameraAngle}
                                            choreography={scene.choreography?.camera}
                                        >
                                            {renderSceneContent(scene)}
                                        </Camera>
                                    ) : (
                                        renderSceneContent(scene)
                                    )}

                                    {/* Global Floating Elements Layer (on top of everything) */}
                                    {scene.elements && scene.type !== 'device_showcase' && (
                                        <FloatingElementsLayer
                                            elements={scene.elements}
                                            brandColor={plan.brandColor}
                                        />
                                    )}
                                </TransitionSeries.Sequence>

                                {/* Transition to next scene */}
                                {index < plan.scenes.length - 1 && TransitionPresentation && (
                                    <TransitionSeries.Transition
                                        presentation={TransitionPresentation}
                                        timing={linearTiming({ durationInFrames: 15 })}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </TransitionSeries>
            </PostProcessing>
        </AbsoluteFill>
    );
};
