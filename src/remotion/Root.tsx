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
                durationInFrames={1800} // 60 seconds (9 scenes)
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    brand: {
                        name: 'TechCorp',
                        accentColor: '#3b82f6',
                        tagline: 'Innovation in Motion'
                    },
                    copy: {
                        headline: 'The Future is Here',
                        subheadline: 'Introducing AI-Powered Solutions',
                        problem: 'Traditional tools are slow and complex',
                        solution: 'Our platform automates everything',
                        features: [
                            { title: 'Fast', subtitle: '10x faster processing', icon: '⚡' },
                            { title: 'Smart', subtitle: 'AI-powered insights', icon: '🧠' },
                            { title: 'Secure', subtitle: 'Enterprise-grade security', icon: '🔒' }
                        ]
                    },
                    cta: {
                        text: 'Get Started Today'
                    }
                } as any}
            />
        </>
    );
};
