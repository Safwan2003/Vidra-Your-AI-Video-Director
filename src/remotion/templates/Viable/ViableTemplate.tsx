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
const SceneRenderer = ({ scene, brand }: { scene: VideoScene, brand: any }) => {
    switch (scene.id) {
        // 1. PROBLEM
        case 1:
            return <Slot1Problem
                brandName={brand.name}
                accentColor={brand.accentColor}
                tagline={scene.subText || "The old way is broken."}
            // Assuming Slot1 accepts a main problem text prop, if not we'll allow it to use default or update logic
            // For now, passing brand info which it definitely takes.
            />;

        // 2. TRANSITION / INTRO
        case 2:
            return <Slot2Transition
                headline={scene.mainText || "There is a better way."}
                subheadline={scene.subText || "Introducing the future."}
                accentColor={brand.accentColor}
            />;

        // 3. HERO / DASHBOARD
        case 3:
            return <Slot3Hero
                screenUrl={scene.screenshotUrl}
                title={scene.mainText}
                productName={brand.name}
                accentColor={brand.accentColor}
            />;

        // 4. FEATURES
        case 4:
            // Convert bentoItems to features prop
            const features = scene.bentoItems?.map(item => ({
                title: item.title || 'Feature',
                subtitle: item.content || 'Description',
                icon: 'star'
            })) || [];

            return <Slot4Features
                features={features}
                sectionTitle={scene.mainText || "Powerful Features"}
                accentColor={brand.accentColor}
            />;

        // 5. TRUST / SOCIAL PROOF
        case 5:
            // Convert mainText/subText to feedback items
            const feedbacks = scene.mainText ? [
                { text: scene.mainText, urgency: 'Low' as const, icon: '⭐' },
                { text: scene.subText || "Great service!", urgency: 'High' as const, icon: '🚀' }
            ] : [];

            return <Slot5Trust
                feedbacks={feedbacks}
                accentColor={brand.accentColor}
            />;

        // 6. OUTRO
        case 6:
            return <Slot6Outro
                brandName={brand.name}
                ctaText={scene.ctaText || scene.mainText || "Get Started"}
                ctaUrl={scene.domain || "viable.com"}
                accentColor={brand.accentColor}
            />;

        default:
            return <AbsoluteFill style={{ background: 'red' }}>Unknown Scene {scene.id}</AbsoluteFill>
    }
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

    // Fallback if no plan (Dev mode)
    const effectiveScenes = scenes.length > 0 ? scenes : [
        { id: 1, duration: 5, type: 'kinetic_typo', title: 'Problem' },
        { id: 2, duration: 4, type: 'slot_transition', title: 'Solution' },
        { id: 3, duration: 6, type: 'device_showcase', title: 'Hero' },
        { id: 4, duration: 6, type: 'bento_grid', title: 'Features' },
        { id: 5, duration: 5, type: 'social_proof', title: 'Trust' },
        { id: 6, duration: 5, type: 'cta_finale', title: 'Outro' }
    ] as VideoScene[];

    // Transitions
    const stiffSpring = springTiming({ config: { damping: 200, stiffness: 200, mass: 1 }, durationInFrames: 35 });
    const panLeft = slide({ direction: 'from-right' });
    const panUp = slide({ direction: 'from-bottom' });

    return (
        <AbsoluteFill style={{ background: '#071a14' }}>
            <AudioHandler scenes={effectiveScenes} audioTrack={null} />

            <TransitionSeries>
                {effectiveScenes.map((scene, index) => (
                    <React.Fragment key={scene.id || index}>
                        <TransitionSeries.Sequence durationInFrames={Math.floor((scene.duration || 5) * 30)}>
                            <SceneRenderer scene={scene} brand={brand} />
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
