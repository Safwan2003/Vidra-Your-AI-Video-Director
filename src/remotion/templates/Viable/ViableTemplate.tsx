import React from 'react';
import { AbsoluteFill, Sequence, Audio } from 'remotion';
import { ViableBackground } from './components/ViableBackground';

// Scenes
import { Slot1Problem } from './scenes/Slot_1_Problem';
import { Slot2Transition } from './scenes/Slot_2_Transition';
import { Slot3Hero } from './scenes/Slot_3_Hero';
import { Slot4Integrations } from './scenes/Slot_4_Integrations';
import { Slot5FeatCarousel } from './scenes/Slot_5_FeatCarousel';
import { Slot6Outro } from './scenes/Slot_6_Outro';

export interface ViableTemplateData {
    audioTrack?: string;
    colors: {
        background: string;
        accent: string;
        secondary: string;
    };
    assets: {
        logoUrl?: string;
        screenshotDashboard?: string; 
        screenshotMobile?: string;
        screenshotFeature1?: string;
        screenshotFeature2?: string;
    };
    copy: {
        problem: string;
        solutionTooltip: string;
        solutionNotification: string;
        heroTitle: string;
        features: { title: string, subtitle: string }[];
    };
    trust?: { logos: string[] };
}

// 90 Seconds Total (2700 frames @ 30fps)
// Pacing: Slower, cinematic
const T = {
    SCENE_1: 450, // Problem - 15s
    SCENE_2: 300,  // Process - 10s
    SCENE_3: 750, // Result (Hero) - 25s (Long dwell on product)
    SCENE_4: 450, // Integrations - 15s
    SCENE_5: 450, // Carousel - 15s
    SCENE_6: 300   // Outro - 10s
};

export const ViableTemplate: React.FC<ViableTemplateData> = ({
    audioTrack,
    colors = { background: '#0f172a', accent: '#7c3aed', secondary: '#fb923c' },
    assets = {},
    copy
}) => {
    
    return (
        <AbsoluteFill style={{ backgroundColor: colors.background }}>
            {audioTrack && <Audio src={audioTrack} />}

            {/* Scene 1: The Problem */}
            <Sequence from={0} durationInFrames={T.SCENE_1}>
                <Slot1Problem />
            </Sequence>

            {/* Scene 2: The Mechanism */}
            <Sequence from={T.SCENE_1} durationInFrames={T.SCENE_2}>
                <Slot2Transition />
            </Sequence>

            {/* Scene 3: The Result (Analysis Result) */}
            <Sequence from={T.SCENE_1 + T.SCENE_2} durationInFrames={T.SCENE_3}>
                <Slot3Hero screenUrl={assets.screenshotDashboard || ''} />
            </Sequence>

            {/* Scene 4: Integrations */}
            <Sequence from={T.SCENE_1 + T.SCENE_2 + T.SCENE_3} durationInFrames={T.SCENE_4}>
                <Slot4Integrations />
            </Sequence>

             {/* Scene 5: Features Carousel */}
            <Sequence from={T.SCENE_1 + T.SCENE_2 + T.SCENE_3 + T.SCENE_4} durationInFrames={T.SCENE_5}>
                <Slot5FeatCarousel />
            </Sequence>
            
             {/* Scene 6: Outro */}
            <Sequence from={T.SCENE_1 + T.SCENE_2 + T.SCENE_3 + T.SCENE_4 + T.SCENE_5} durationInFrames={T.SCENE_6}>
                <Slot6Outro />
            </Sequence>

        </AbsoluteFill>
    );
};
