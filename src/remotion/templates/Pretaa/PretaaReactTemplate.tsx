import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

// Generic Components
import { GenericIntro } from './scenes/GenericIntro';
import { GenericFeatures } from './scenes/GenericFeatures';
import { AudioHandler } from '../../components/AudioHandler';

// Types
import { VideoScene, VideoPlan } from '../../../../types';

// Map generic scenes to components
// Import Original Slots (Restoring Visuals)
import { PretaaSlot1Intro } from './scenes/PretaaSlot_1_Intro';
import { PretaaSlot2Problem } from './scenes/PretaaSlot_2_Problem';
import { PretaaSlot3Solution } from './scenes/PretaaSlot_3_Solution';
import { PretaaSlot4Features } from './scenes/PretaaSlot_4_Features';
import { PretaaSlot5CTA } from './scenes/PretaaSlot_5_CTA';
import { PretaaSlot6Review } from './scenes/PretaaSlot_6_Review';
import { PretaaSlot7Outro } from './scenes/PretaaSlot_7_Outro'; // Is actually multi-device showcase
import { PretaaSlot_8_Satisfaction } from './scenes/PretaaSlot_8_Satisfaction';
import { PretaaSlot_9_Final } from './scenes/PretaaSlot_9_Final';

// Map generic scenes to components
const SceneRenderer = ({ scene, brand }: { scene: VideoScene, brand: any }) => {
    // Helper to detect scene context
    const title = (scene.title || '').toLowerCase();
    const type = scene.type;

    // 1. INTRO
    if (scene.id === 1) {
        return <PretaaSlot1Intro
            title={scene.mainText || scene.title}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
        />;
    }

    // 2. PROBLEM (High Energy Text)
    if (scene.id === 2) {
        return <PretaaSlot2Problem
            title={scene.mainText}
            subText={scene.subText}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
        />;
    }

    // 6. CTA / JOURNEY (Final Text) - Check ID 6 carefully as it moved
    if (scene.id === 6 && type !== 'device_showcase') {
        return <PretaaSlot5CTA
            title={scene.mainText}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
        />;
    }

    switch (scene.id) {
        // 3. SOLUTION
        case 3:
            return <PretaaSlot3Solution
                solutionText={scene.mainText}
                screenshotUrl={scene.screenshotUrl}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        // 4. FEATURES
        case 4:
            // Prefer editor features, fallback to bentoItems
            const features = (scene.features && scene.features.length > 0) ? scene.features : (scene.bentoItems?.map(item => ({
                title: item.title || 'Feature',
                description: item.content || 'Description', // Map content to description
                icon: item.icon || 'star'
            })) || []);

            return (
                <PretaaSlot4Features
                    features={features}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                />
            );

        // 5. SOCIAL PROOF
        case 5:
            return <PretaaSlot6Review
                quote={scene.mainText}
                author={scene.subText}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        // 6. DEMO (Device Showcase)
        case 6:
            return <PretaaSlot3Solution
                solutionText={scene.mainText}
                screenshotUrl={scene.mobileScreenshotUrl || scene.screenshotUrl}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        // 7. VISION / DEVICE SHOWCASE
        case 7:
            return <PretaaSlot7Outro
                ctaText={scene.mainText || "The Future"}
                ctaUrl={scene.ctaUrl || scene.domain}
                screenshotUrl={scene.screenshotUrl}
                mobileScreenshotUrl={scene.mobileScreenshotUrl}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        // 8. SATISFACTION / RENEWAL
        case 8:
            return <PretaaSlot_8_Satisfaction
                brandColor={brand?.accentColor}
                notificationText={scene.notificationText || scene.mainText}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        // 9. FINAL CTA
        case 9: // For Scene 9 specifically
            return <PretaaSlot_9_Final
                brandName={brand.name}
                domain={scene.domain || "pretaa.com"}
                ctaText={scene.ctaText}
                backgroundColor={scene.backgroundColor}
                mainTextColor={scene.mainTextColor}
            />;

        default:
            // Generic Fallback
            return (
                <GenericIntro
                    brandColor={brand?.accentColor}
                    bubbles={[scene.title || "Scene", scene.type]}
                />
            );
    }
};

// Pretaa Template Props - NOW DYNAMIC
interface PretaaReactTemplateProps {
    plan: VideoPlan;
    [key: string]: unknown;
}

// Cinematic Global Overlay
const CinematicOverlay = () => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 1000 }}>
            {/* Vignette */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.3) 120%)'
            }} />
            {/* Noise Grain */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                opacity: 0.04,
                mixBlendMode: 'overlay'
            }} />
        </AbsoluteFill>
    );
};

export const PretaaReactTemplate: React.FC<PretaaReactTemplateProps> = ({ plan }) => {
    // defaults
    const brand = {
        accentColor: plan?.brandColor || '#3b82f6',
        name: plan?.brandName || 'Pretaa'
    };

    const scenes = plan?.scenes || [];

    // ... transitions ...
    const snapSpring = springTiming({
        config: { damping: 25, stiffness: 300, mass: 0.8 },
        durationInFrames: 20,
    });
    const slideLeft = slide({ direction: 'from-right' });
    const crossFade = fade();

    // Fallback Data if Plan is Missing (Restores "Old" Look by default)
    const effectivePlan = (plan && scenes.length > 0) ? plan : {
        brandName: 'Pretaa',
        brandColor: '#3b82f6',
        scenes: [
            { id: 1, type: 'slot_transition', duration: 10, title: 'Intro', mainText: 'Welcome' },
            { id: 2, type: 'kinetic_typo', duration: 10, title: 'Problem', mainText: 'Wasting Resources?' },
            { id: 3, type: 'device_showcase', duration: 10, title: 'Solution', mainText: 'Solved' },
            { id: 4, type: 'bento_grid', duration: 7, title: 'Features' },
            { id: 5, type: 'social_proof', duration: 6, title: 'Review' },
            { id: 6, type: 'cta_finale', duration: 7, title: 'Demo' },
            { id: 7, type: 'flat_screenshot', duration: 6, title: 'Vision' },
            { id: 8, type: 'isometric_illustration', duration: 7, title: 'Satisfaction' },
            { id: 9, type: 'cta_finale', duration: 7, title: 'Final CTA' }
            // Total: 9 scenes, 60s
        ] as VideoScene[]
    };

    const effectiveScenes = effectivePlan.scenes;
    const effectiveBrand = {
        accentColor: effectivePlan.brandColor || '#3b82f6',
        name: effectivePlan.brandName || 'Pretaa'
    };

    return (
        <AbsoluteFill>
            <AudioHandler scenes={effectiveScenes} audioTrack="https://res.cloudinary.com/ds5317tui/video/upload/v1734341907/Corporate_Upbeat_Background_Music_For_Videos_royalty_free_No_Copyright_Content_t4f9tp.mp3" />

            <TransitionSeries>
                {effectiveScenes.map((scene, index) => (
                    <React.Fragment key={scene.id || index}>
                        <TransitionSeries.Sequence durationInFrames={Math.max(1, Math.floor((scene.duration || 5) * 30))}>
                            <SceneRenderer scene={scene} brand={effectiveBrand} />
                        </TransitionSeries.Sequence>

                        {/* Add transition between scenes (except the last one) */}
                        {index < scenes.length - 1 && (
                            <TransitionSeries.Transition
                                presentation={index % 2 === 0 ? slideLeft : crossFade}
                                timing={snapSpring}
                            />
                        )}
                    </React.Fragment>
                ))}
            </TransitionSeries>

            <CinematicOverlay />


        </AbsoluteFill>
    );
};

