import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './compositions/MainVideo';
import type { VideoPlan } from '../../types';

import { Test3DScene } from './3d/Test3DScene';
import { ViableTemplate } from './templates/Viable';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MainVideo"
                component={MainVideo}
                durationInFrames={300} // Default, will be calculated
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    plan: null as VideoPlan | null
                }}
                calculateMetadata={({ props }) => {
                    if (!props.plan) {
                        return { durationInFrames: 300 };
                    }
                    // Calculate actual duration from plan
                    const totalDuration = props.plan.scenes.reduce((acc, scene) => acc + scene.duration, 0);
                    return {
                        durationInFrames: Math.floor(totalDuration * 30)
                    };
                }}
            />
            <Composition
                id="Test3D"
                component={Test3DScene}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="ViableTemplate"
                component={ViableTemplate}
                durationInFrames={2700} // 90 Seconds (15+10+25+15+15+10)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    colors: { background: '#0f172a', accent: '#7c3aed', secondary: '#fb923c' },
                    assets: {
                        screenshotDashboard: '/dashboard.jpg',
                        isMobile: false
                    },
                    copy: {
                        problem: "CHAOS. NOISE. DATA OVERLOAD.",
                        solutionTooltip: "Revenue: +127%",
                        solutionNotification: "User Experience Optimized",
                        heroTitle: "The Solution",
                        features: [
                            { title: "Smart Analysis", subtitle: "AI-driven insights" },
                            { title: "Real-time", subtitle: "Instant updates" }
                        ]
                    },
                    trust: { logos: [] }
                } as any}
            />
        </>
    );
};
