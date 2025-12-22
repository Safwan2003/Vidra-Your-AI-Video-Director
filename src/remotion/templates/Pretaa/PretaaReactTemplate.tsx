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
import { VideoScene, VideoPlan, ThemeType } from '../../../../types';
import { getThemeStyles, ThemeStyles } from './components/ThemeEngine';

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

import { PretaaFloatingElements } from './components/FloatingElements';

// Map generic scenes to components
const SceneRenderer = ({ scene, brand, themeStyles: globalThemeStyles }: { scene: VideoScene, brand: any, themeStyles: ThemeStyles }) => {
    // Determine theme for this scene
    const themeStyles = scene.theme ? getThemeStyles(scene.theme, brand.accentColor) : globalThemeStyles;

    // Helper to detect scene context
    const title = (scene.title || '').toLowerCase();
    const type = scene.type;

    let content: React.ReactNode;

    // 1. INTRO
    if (scene.id === 1) {
        content = <PretaaSlot1Intro
            title={scene.mainText || scene.title}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
            themeStyles={themeStyles}
        />;
    }

    // 2. PROBLEM (High Energy Text)
    else if (scene.id === 2) {
        content = <PretaaSlot2Problem
            title={scene.mainText}
            subText={scene.subText}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
            themeStyles={themeStyles}
        />;
    }

    // 6. CTA / JOURNEY (Final Text) - Check ID 6 carefully as it moved
    else if (scene.id === 6 && type !== 'device_showcase') {
        content = <PretaaSlot5CTA
            title={scene.mainText}
            backgroundColor={scene.backgroundColor}
            mainTextColor={scene.mainTextColor}
            themeStyles={themeStyles}
        />;
    } else {
        switch (scene.id) {
            // 3. SOLUTION
            case 3:
                content = <PretaaSlot3Solution
                    solutionText={scene.mainText}
                    screenshotUrl={scene.screenshotUrl}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            // 4. FEATURES
            case 4:
                // Prefer editor features, fallback to bentoItems
                const features = (scene.features && scene.features.length > 0) ? scene.features : (scene.bentoItems?.map(item => ({
                    title: item.title || 'Feature',
                    description: item.content || 'Description', // Map content to description
                    icon: item.icon || 'star'
                })) || []);

                content = (
                    <PretaaSlot4Features
                        features={features}
                        backgroundColor={scene.backgroundColor}
                        mainTextColor={scene.mainTextColor}
                        themeStyles={themeStyles}
                    />
                );
                break;

            // 5. SOCIAL PROOF
            case 5:
                content = <PretaaSlot6Review
                    quote={scene.mainText}
                    author={scene.subText}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            // 6. DEMO (Device Showcase)
            case 6:
                content = <PretaaSlot3Solution
                    solutionText={scene.mainText}
                    screenshotUrl={scene.mobileScreenshotUrl || scene.screenshotUrl}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            // 7. VISION / DEVICE SHOWCASE
            case 7:
                content = <PretaaSlot7Outro
                    ctaText={scene.mainText || "The Future"}
                    ctaUrl={scene.ctaUrl || scene.domain}
                    screenshotUrl={scene.screenshotUrl}
                    mobileScreenshotUrl={scene.mobileScreenshotUrl}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            // 8. SATISFACTION / RENEWAL
            case 8:
                content = <PretaaSlot_8_Satisfaction
                    brandColor={brand?.accentColor}
                    notificationText={scene.notificationText || scene.mainText}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            // 9. FINAL CTA
            case 9: // For Scene 9 specifically
                content = <PretaaSlot_9_Final
                    brandName={brand.name}
                    domain={scene.domain || "pretaa.com"}
                    ctaText={scene.ctaText}
                    backgroundColor={scene.backgroundColor}
                    mainTextColor={scene.mainTextColor}
                    themeStyles={themeStyles}
                />;
                break;

            default:
                // Generic Fallback
                content = (
                    <GenericIntro
                        brandColor={brand?.accentColor}
                        bubbles={[scene.title || "Scene", scene.type]}
                    />
                );
        }
    }

    return (
        <AbsoluteFill>
            {content}
            <PretaaFloatingElements elements={scene.elements} />
        </AbsoluteFill>
    );
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
        theme: 'glassmorphism' as ThemeType,
        scenes: [
            {
                id: 1, type: 'slot_transition', duration: 10, title: 'Intro', mainText: 'Welcome', elements: [
                    { type: 'notification', text: 'New Lead: John Doe', position: { top: '20%', left: '80%' }, delay: 20 },
                    { type: 'feature_badge', text: 'AI Powered', position: { top: '30%', left: '20%' }, delay: 40, color: '#10b981' }
                ]
            },
            {
                id: 2, type: 'kinetic_typo', duration: 10, title: 'Problem', mainText: 'Wasting Resources?', elements: [
                    { type: 'stat_card', label: 'Churn Rate', value: '24%', position: { top: '70%', left: '15%' }, delay: 30, color: '#ef4444' },
                    { type: 'stat_card', label: 'LTV', value: '$1.2k', position: { top: '75%', left: '85%' }, delay: 50 }
                ]
            },
            { id: 3, type: 'device_showcase', duration: 10, title: 'Solution', mainText: 'Solved' },
            { id: 4, type: 'bento_grid', duration: 7, title: 'Features' },
            { id: 5, type: 'social_proof', duration: 6, title: 'Review' },
            { id: 6, type: 'cta_finale', duration: 7, title: 'Demo' },
            { id: 7, type: 'flat_screenshot', duration: 6, title: 'Vision' },
            { id: 8, type: 'isometric_illustration', duration: 7, title: 'Satisfaction' },
            { id: 9, type: 'cta_finale', duration: 7, title: 'Final CTA' }
        ] as VideoScene[]
    };

    const effectiveScenes = effectivePlan.scenes;
    const effectiveBrand = {
        accentColor: effectivePlan.globalDesign?.primaryColor || effectivePlan.brandColor || '#3b82f6',
        name: effectivePlan.brandName || 'Pretaa'
    };

    const effectiveTheme: ThemeType = effectivePlan.theme || 'modern';
    const themeStyles = getThemeStyles(effectiveTheme, effectiveBrand.accentColor);

    // Calculate total duration
    const totalDurationSeconds = effectiveScenes.reduce((sum, scene) => sum + (scene.duration || 5), 0);
    const totalDurationFrames = totalDurationSeconds * 30;

    // Debug logging
    console.log('📊 PretaaTemplate Duration Analysis:');
    console.log(`   Total Scenes: ${effectiveScenes.length}`);
    console.log(`   Scene Durations:`, effectiveScenes.map(s => `${s.type}: ${s.duration}s`));
    console.log(`   Total Duration: ${totalDurationSeconds}s (${totalDurationFrames} frames)`);

    return (
        <AbsoluteFill style={{
            background: plan.globalDesign?.backgroundColor || themeStyles.background,
            fontFamily: plan.globalDesign?.bodyFont || 'Inter',
            color: plan.globalDesign?.textColor || '#ffffff'
        }}>
            <AudioHandler scenes={effectiveScenes} audioTrack="https://res.cloudinary.com/ds5317tui/video/upload/v1734341907/Corporate_Upbeat_Background_Music_For_Videos_royalty_free_No_Copyright_Content_t4f9tp.mp3" />

            <TransitionSeries>
                {effectiveScenes.map((scene, index) => (
                    <React.Fragment key={scene.id || index}>
                        <TransitionSeries.Sequence durationInFrames={Math.max(1, Math.floor((scene.duration || 5) * 30))}>
                            <SceneRenderer scene={scene} brand={effectiveBrand} themeStyles={themeStyles} />
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

