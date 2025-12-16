import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

// Import React-based Pretaa scenes
import { PretaaSlot1Intro } from './scenes/PretaaSlot_1_Intro';
import { PretaaSlot2Problem } from './scenes/PretaaSlot_2_Problem';
import { PretaaSlot3Solution } from './scenes/PretaaSlot_3_Solution';
import { PretaaSlot4Features } from './scenes/PretaaSlot_4_Features';
import { PretaaSlot5CTA } from './scenes/PretaaSlot_5_CTA';
import { PretaaSlot6Review } from './scenes/PretaaSlot_6_Review';
import { PretaaSlot7Outro } from './scenes/PretaaSlot_7_Outro';
import { PretaaSlot8Satisfaction } from './scenes/PretaaSlot_8_Satisfaction';
import { PretaaSlot9Final } from './scenes/PretaaSlot_9_Final';

// Scene Durations (frames at 30fps)
const T = {
    INTRO: 150,      // 5s
    PROBLEM: 210,    // 7s
    SOLUTION: 240,   // 8s
    FEATURES: 210,   // 7s
    CTA: 210,        // 7s (Journey)
    REVIEW: 180,     // 6s (Stars)
    OUTRO: 210,      // 7s (App Interface)
    SATISFACTION: 180, // 6s (Smiley)
    FINAL: 210       // 7s (End Card)
};

// ... (Interface Code Unchanged until Render) ...

// Pretaa Template Data Interface
export interface PretaaTemplateData {
    brand: {
        name: string;
        logoUrl?: string;
        accentColor?: string;
        tagline?: string;
    };
    copy: {
        headline?: string;
        subheadline?: string;
        problem?: string;
        solution?: string;
        features?: { title: string; subtitle: string; icon?: string }[];
    };
    cta?: {
        text?: string;
        url?: string;
    };
    assets?: {
        productImage?: string;
        screenshot?: string;
    };
}

interface PretaaReactTemplateProps extends Partial<PretaaTemplateData> { }

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

export const PretaaReactTemplate: React.FC<PretaaReactTemplateProps> = (props) => {
    // ... params ...
    const { brand, copy, cta, assets } = props;

    // ... defaults ...
    const accentColor = brand?.accentColor || '#3b82f6';
    const ctaText = cta?.text || 'Get Started';
    const brandName = brand?.name || 'pretaa';

    // ... transitions ...
    const snapSpring = springTiming({
        config: { damping: 25, stiffness: 300, mass: 0.8 },
        durationInFrames: 20,
    });
    const slideLeft = slide({ direction: 'from-right' });
    const slideDown = slide({ direction: 'from-top' });
    const crossFade = fade();

    return (
        <AbsoluteFill>
            <TransitionSeries>
                {/* ... sequences ... */}
                {/* 1. INTRO */}
                <TransitionSeries.Sequence durationInFrames={T.INTRO}>
                    <PretaaSlot1Intro />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={slideLeft} timing={snapSpring} />

                {/* 2. PROBLEM */}
                <TransitionSeries.Sequence durationInFrames={T.PROBLEM}>
                    <PretaaSlot2Problem />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={slideLeft} timing={snapSpring} />

                {/* 3. SOLUTION */}
                <TransitionSeries.Sequence durationInFrames={T.SOLUTION}>
                    <PretaaSlot3Solution solutionText={brand?.name} />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={slideLeft} timing={snapSpring} />

                {/* 4. FEATURES */}
                <TransitionSeries.Sequence durationInFrames={T.FEATURES}>
                    <PretaaSlot4Features />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={crossFade} timing={snapSpring} />

                {/* 5. JOURNEY (CTA Slot previously) */}
                <TransitionSeries.Sequence durationInFrames={T.CTA}>
                    <PretaaSlot5CTA />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={slideLeft} timing={snapSpring} />

                {/* 6. REVIEW */}
                <TransitionSeries.Sequence durationInFrames={T.REVIEW}>
                    <PretaaSlot6Review />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={crossFade} timing={snapSpring} />

                {/* 7. OUTRO (App Interface) */}
                <TransitionSeries.Sequence durationInFrames={T.OUTRO}>
                    <PretaaSlot7Outro ctaText={ctaText} />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={crossFade} timing={snapSpring} />

                {/* 8. SATISFACTION */}
                <TransitionSeries.Sequence durationInFrames={T.SATISFACTION}>
                    <PretaaSlot8Satisfaction />
                </TransitionSeries.Sequence>
                <TransitionSeries.Transition presentation={slideDown} timing={snapSpring} />

                {/* 9. FINAL */}
                <TransitionSeries.Sequence durationInFrames={T.FINAL}>
                    <PretaaSlot9Final brandName={brandName} />
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* Global Final Polish Layer */}
            <CinematicOverlay />
        </AbsoluteFill>
    );
};
