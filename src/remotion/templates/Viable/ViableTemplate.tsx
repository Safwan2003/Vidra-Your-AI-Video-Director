import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { fade } from '@remotion/transitions/fade';
import { VideoPlan, VideoScene } from '../../../../types';
import { AudioHandler } from '../../components/AudioHandler';

// Import Scenes
import { Slot1Problem } from './scenes/Slot_1_Problem';
import { Slot2Transition } from './scenes/Slot_2_Transition';
import { Slot3Hero } from './scenes/Slot_3_Hero';
import { Slot4Features } from './scenes/Slot_4_Features';
import { Slot5Trust } from './scenes/Slot_5_Trust';
import { Slot6Outro } from './scenes/Slot_6_Outro';

// Scene Renderer
// Scene Renderer
const SceneRenderer = ({ scene, brand, globalDesign }: { scene: VideoScene, brand: any, globalDesign?: any }) => {

    // Apply Global Fonts and Colors
    const containerStyle: React.CSSProperties = {
        fontFamily: globalDesign?.bodyFont || 'Inter',
        width: '100%',
        height: '100%',
        color: globalDesign?.textColor || '#ffffff'
    };

    const commonProps = {
        accentColor: globalDesign?.accentColor || globalDesign?.primaryColor || brand.accentColor,
        primaryColor: globalDesign?.primaryColor || brand.accentColor,
        secondaryColor: globalDesign?.secondaryColor,
        backgroundColor: globalDesign?.backgroundColor,
        borderRadius: globalDesign?.borderRadius,
        headingFont: globalDesign?.headingFont || 'Inter',
        bodyFont: globalDesign?.bodyFont || 'Inter',
        animationSpeed: globalDesign?.animationSpeed || 'medium'
    };

    let content;

    switch (scene.type) {
        case 'kinetic_typo':
        case 'title_card': // New type mapped to simple text
            content = <Slot1Problem
                brandName={brand.name}
                accentColor={commonProps.accentColor}
                tagline={scene.subText || scene.mainText || "Title Scene"}
                screenshotUrl={scene.screenshotUrl} // Optional bg
            />;
            break;

        case 'slot_transition':
            content = <Slot2Transition
                headline={scene.mainText || "Transition"}
                subheadline={scene.subText || ""}
                accentColor={commonProps.accentColor}
            />;
            break;

        case 'device_showcase':
        case 'image_full': // New type mapped to hero/device
            content = <Slot3Hero
                screenUrl={scene.screenshotUrl}
                screenshotUrl={scene.screenshotUrl}
                title={scene.mainText}
                productName={brand.name}
                accentColor={commonProps.accentColor}
                features={scene.features}
            />;
            break;

        case 'bento_grid':
            // Prefer editor features, fallback to bentoItems
            const features = (scene.features && scene.features.length > 0) ? scene.features : (scene.bentoItems?.map(item => ({
                title: item.title || 'Feature',
                description: item.content || 'Description',
                icon: 'star'
            })) || []);

            content = <Slot4Features
                features={features}
                sectionTitle={scene.mainText || "Key Features"}
                accentColor={commonProps.accentColor}
            />;
            break;

        case 'social_proof':
            const feedbacks = scene.mainText ? [
                { text: scene.mainText, urgency: 'Low' as const, icon: '⭐' },
                { text: scene.subText || "Great service!", urgency: 'High' as const, icon: '🚀' }
            ] : [];

            content = <Slot5Trust
                feedbacks={feedbacks}
                accentColor={commonProps.accentColor}
            />;
            break;

        case 'cta_finale':
            content = <Slot6Outro
                brandName={brand.name}
                ctaText={scene.ctaText || scene.mainText || "Get Started"}
                ctaUrl={scene.ctaUrl || scene.domain || "viable.com"}
                accentColor={commonProps.accentColor}
            />;
            break;

        default:
            content = <AbsoluteFill style={{ background: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Unknown Scene Type: {scene.type}</div>
            </AbsoluteFill>;
    }

    return <div style={containerStyle}>{content}</div>;
};

interface ViableReactTemplateProps {
    plan: VideoPlan;
}

export const ViableTemplate: React.FC<ViableReactTemplateProps> = ({ plan }) => {
    // Defaults
    const brand = {
        name: plan?.brandName || 'Viable',
        accentColor: plan?.brandColor || '#9333ea',
    };

    const scenes = plan?.scenes || [];

    // Fallback if no plan (Dev mode) - 60 seconds total
    const effectiveScenes = scenes.length > 0 ? scenes : [
        { id: 1, duration: 8, type: 'kinetic_typo', title: 'Problem' },
        { id: 2, duration: 7, type: 'slot_transition', title: 'Solution' },
        { id: 3, duration: 12, type: 'device_showcase', title: 'Hero' },
        { id: 4, duration: 12, type: 'bento_grid', title: 'Features' },
        { id: 5, duration: 10, type: 'social_proof', title: 'Trust' },
        { id: 6, duration: 11, type: 'cta_finale', title: 'Outro' }
    ] as VideoScene[];

    // Calculate total duration
    const totalDurationSeconds = effectiveScenes.reduce((sum, scene) => sum + (scene.duration || 5), 0);
    const totalDurationFrames = totalDurationSeconds * 30;

    // Debug logging
    console.log('📊 ViableTemplate Duration Analysis:');
    console.log(`   Total Scenes: ${effectiveScenes.length}`);
    console.log(`   Scene Durations:`, effectiveScenes.map(s => `${s.type}: ${s.duration}s`));
    console.log(`   Total Duration: ${totalDurationSeconds}s (${totalDurationFrames} frames)`);

    // Transitions
    const stiffSpring = springTiming({ config: { damping: 200, stiffness: 200, mass: 1 }, durationInFrames: 35 });
    const panLeft = slide({ direction: 'from-right' });
    const panUp = slide({ direction: 'from-bottom' });

    return (
        <AbsoluteFill style={{ background: plan.globalDesign?.backgroundStyle === 'video' ? 'transparent' : '#071a14' }}>
            <AudioHandler scenes={effectiveScenes} audioTrack={null} />

            <TransitionSeries>
                {effectiveScenes.map((scene, index) => (
                    <React.Fragment key={scene.id || index}>
                        <TransitionSeries.Sequence durationInFrames={Math.max(1, Math.floor((scene.duration || 5) * 30))}>
                            <SceneRenderer scene={scene} brand={brand} globalDesign={plan.globalDesign} />
                        </TransitionSeries.Sequence>

                        {/* Transitions between scenes */}
                        {index < effectiveScenes.length - 1 && (
                            <TransitionSeries.Transition
                                presentation={index === 0 ? panUp : panLeft}
                                timing={stiffSpring}
                            />
                        )}
                    </React.Fragment>
                ))}
            </TransitionSeries>
        </AbsoluteFill>
    );
};
