import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { fade } from '@remotion/transitions/fade';
import { ViableTemplateData } from '../../../types';

// Import Scenes
import { Slot1Problem } from './scenes/Slot_1_Problem';
import { Slot2Transition } from './scenes/Slot_2_Transition';
import { Slot3Hero } from './scenes/Slot_3_Hero';
import { Slot4Features } from './scenes/Slot_4_Features';
import { Slot5Trust } from './scenes/Slot_5_Trust';
import { Slot6Outro } from './scenes/Slot_6_Outro';

// Scene Durations (frames at 30fps) - Tuned for pacing
const T = {
    SCENE_1: 450, // 15s - Problem/Chaos
    SCENE_2: 300, // 10s - Solution Intro
    SCENE_3: 600, // 20s - Product Showcase (Tightened)
    SCENE_4: 450, // 15s - Data Flow
    SCENE_5: 450, // 15s - Feedback Cloud
    SCENE_6: 300, // 10s - Outro
};

// Props interface
interface ViableTemplateProps extends Partial<ViableTemplateData> {
    colors?: { background: string; accent: string; secondary: string };
    assets?: { screenshotDashboard?: string };
    copy?: {
        problem?: string;
        solutionTooltip?: string;
        features?: { title: string; subtitle: string; icon?: string }[];
        headline?: string;
        subheadline?: string;
        featuresTitle?: string;
    };
    trust?: {
        logos?: string[];
        testimonial?: { quote: string; author: string; role: string; company?: string; avatarUrl?: string };
    };
    cta?: { text?: string; url?: string };
    brand?: { name?: string; logoUrl?: string; accentColor?: string; tagline?: string };
}

export const ViableTemplate: React.FC<ViableTemplateProps> = (props) => {
    // Extract brand info
    const brandName = props.brand?.name || '';
    const logoUrl = props.brand?.logoUrl || props.assets?.logoUrl;
    const accentColor = props.brand?.accentColor || props.colors?.accent || '#9333ea'; // Deep Purple default
    const tagline = props.brand?.tagline || '';

    // Extract copy
    const headline = props.copy?.headline || '';
    const subheadline = props.copy?.subheadline || '';
    const featuresTitle = props.copy?.featuresTitle || '';
    const features = props.copy?.features || [];

    // Extract assets
    const screenUrl = props.assets?.screenshotDashboard;

    // Extract trust 
    const testimonial = props.trust?.testimonial;
    const logos = props.trust?.logos || [];

    // Extract CTA
    const ctaText = props.cta?.text || '';
    const ctaUrl = props.cta?.url || '';

    // --- PREMIUM TRANSITION CONFIGS ---

    // 1. Snappy Material Design Spring
    const stiffSpring = springTiming({
        config: { damping: 200, stiffness: 200, mass: 1 },
        durationInFrames: 35, // ~1.2s smooth
    });

    // 2. Bouncy/Playful Spring
    const bounceSpring = springTiming({
        config: { damping: 15, stiffness: 120, mass: 0.8 },
        durationInFrames: 40,
    });

    // Transitions
    const panUp = slide({ direction: 'from-bottom' });
    const panLeft = slide({ direction: 'from-right' });
    const wipeIn = wipe({ direction: 'from-right' });
    const crossFade = fade();

    return (
        <AbsoluteFill style={{ background: '#071a14' }}>
            <TransitionSeries>

                {/* 1. REALITY: Problem/Chaos */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_1}>
                    <Slot1Problem
                        brandName={brandName}
                        logoUrl={logoUrl}
                        tagline={tagline}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

                {/* T1: Slide Up - implies "Rising above" the chaos to the solution */}
                <TransitionSeries.Transition
                    presentation={panUp}
                    timing={stiffSpring}
                />

                {/* 2. SOLUTION: AI Tech Intro */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_2}>
                    <Slot2Transition
                        headline={headline}
                        subheadline={subheadline}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

                {/* T2: Wipe/Slide Left - "Next Chapter" feel, moving into the product */}
                <TransitionSeries.Transition
                    presentation={panLeft}
                    timing={stiffSpring}
                />

                {/* 3. PRODUCT: Dashboard Showcase */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_3}>
                    <Slot3Hero
                        screenUrl={screenUrl}
                        productName={brandName}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

                {/* T3: Pan Left - Continuing the lateral journey through data */}
                <TransitionSeries.Transition
                    presentation={panLeft}
                    timing={stiffSpring}
                />

                {/* 4. MECHANISM: Data Inputs (Flow) */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_4}>
                    <Slot4Features
                        features={features}
                        sectionTitle={featuresTitle}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

                {/* T4: Pan Left - Smooth flow into details */}
                <TransitionSeries.Transition
                    presentation={panLeft}
                    timing={stiffSpring}
                />

                {/* 5. DEEP DIVE: Feedback Cloud */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_5}>
                    <Slot5Trust
                        testimonial={testimonial}
                        logos={logos}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

                {/* T5: Wipe - A clean sweep to clear the complexity for the simple CTA */}
                <TransitionSeries.Transition
                    presentation={wipeIn}
                    timing={stiffSpring}
                />

                {/* 6. RESOLUTION: Brand Outro */}
                <TransitionSeries.Sequence durationInFrames={T.SCENE_6}>
                    <Slot6Outro
                        brandName={brandName}
                        logoUrl={logoUrl}
                        ctaText={ctaText}
                        ctaUrl={ctaUrl}
                        accentColor={accentColor}
                    />
                </TransitionSeries.Sequence>

            </TransitionSeries>
        </AbsoluteFill>
    );
};
