import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './compositions/MainVideo';
import type { VideoPlan } from '../../types';


import { ViableTemplate } from './templates/Viable';
import { PretaaReactTemplate } from './templates/Pretaa';

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
                    const videoProps = props as { plan: VideoPlan };
                    if (!videoProps.plan || !videoProps.plan.scenes) {
                        return { durationInFrames: 300 };
                    }
                    // Calculate actual duration from plan (in seconds, then convert to frames)
                    const totalDurationSeconds = videoProps.plan.scenes.reduce((acc, scene) => acc + Number(scene.duration || 5), 0);
                    const totalDurationFrames = Math.max(30, Math.floor(totalDurationSeconds * 30)); // Convert seconds to frames (30 FPS)

                    console.log(`🎬 MainVideo Duration: ${totalDurationSeconds}s = ${totalDurationFrames} frames`);

                    return {
                        durationInFrames: totalDurationFrames
                    };
                }}
            />

            <Composition
                id="ViableTemplate"
                component={ViableTemplate}
                durationInFrames={2370} // 79 Seconds (1m 19s)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    brand: {
                        name: 'viable',
                        accentColor: '#22c55e',
                        tagline: 'AI-Powered Customer Insights'
                    },
                    assets: {
                        screenshotDashboard: ''
                    },
                    copy: {
                        headline: 'Transform Your Feedback Into Action',
                        subheadline: 'Powered by Advanced AI',
                        featuresTitle: 'Everything You Need',
                        features: [
                            { title: 'Smart Analysis', subtitle: 'AI-powered insights from your customer feedback', icon: '🧠' },
                            { title: 'Real-time Sync', subtitle: 'Instant updates across all your platforms', icon: '⚡' },
                            { title: 'Deep Integration', subtitle: 'Connect with 100+ popular tools seamlessly', icon: '🔗' },
                            { title: 'Secure & Private', subtitle: 'Enterprise-grade security for your data', icon: '🔒' },
                            { title: 'Team Collaboration', subtitle: 'Work together in real-time with your team', icon: '👥' },
                            { title: 'Custom Reports', subtitle: 'Generate beautiful reports in seconds', icon: '📊' }
                        ]
                    },
                    trust: {
                        testimonial: {
                            quote: 'This product transformed how we understand our customers. We cut analysis time by 90%.',
                            author: 'Sarah Johnson',
                            role: 'VP of Product',
                            company: 'TechCorp'
                        },
                        logos: []
                    },
                    cta: {
                        text: 'Get Started Today',
                        url: 'www.viable.com'
                    }
                } as any}
            />
            <Composition
                id="PretaaTemplate"
                component={PretaaReactTemplate}
                durationInFrames={2000} // ~66 seconds (9 scenes + buffer)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    plan: {
                        brandName: 'Pretaa AI',
                        brandColor: '#ef4444',
                        scenes: [
                            {
                                id: 1,
                                type: 'kinetic_text',
                                duration: 150,
                                mainText: 'Hello World',
                                subText: 'This is Dynamic'
                            },
                            {
                                id: 2,
                                type: 'bento_grid',
                                duration: 200,
                                bentoItems: [
                                    { title: 'Feature One', content: 'It works!' },
                                    { title: 'Feature Two', content: 'Fully Generic' }
                                ]
                            }
                        ]
                    } as any
                }}
            />
        </>
    );
};
