import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { VideoScene } from '../../../types';
import { smoothInterpolate, EASINGS } from '../../constants/easings';

interface SocialProofSceneProps {
    scene: VideoScene;
    brandColor: string;
}

/**
 * Social Proof Scene
 * Display customer logos, testimonials, and metrics
 * "What a Story" quality social proof template
 */
export const SocialProofScene: React.FC<SocialProofSceneProps> = ({ scene, brandColor }) => {
    const frame = useCurrentFrame();

    // Mock data if not provided
    const logos = scene.customerLogos || [
        'Company A', 'Company B', 'Company C', 'Company D', 'Company E', 'Company F'
    ];

    const metrics = scene.metrics || [
        { value: '10,000+', label: 'Active Users' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9/5', label: 'Rating' },
    ];

    const testimonial = scene.testimonial || {
        quote: scene.mainText || "This product transformed our workflow completely.",
        author: "CEO, Tech Company"
    };

    return (
        <AbsoluteFill style={{ background: `linear-gradient(135deg, #0f172a, ${brandColor}20)` }}>
            {/* Title */}
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: `translateX(-50%) translateY(${interpolate(frame, [0, 15], [-50, 0], { extrapolateRight: 'clamp' })}px)`,
                    opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
                    fontSize: '48px',
                    fontWeight: 700,
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                {scene.title || 'Trusted by Industry Leaders'}
            </div>

            {/* Customer Logos Grid */}
            <div
                style={{
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '40px',
                }}
            >
                {logos.map((logo, index) => {
                    const delay = 20 + index * 5;
                    const progress = smoothInterpolate(
                        frame,
                        [delay, delay + 15],
                        [0, 1],
                        EASINGS.smooth
                    );

                    return (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                opacity: progress,
                                transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
                            }}
                        >
                            <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                                {logo}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Metrics */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    display: 'flex',
                    justifyContent: 'space-around',
                }}
            >
                {metrics.map((metric, index) => {
                    const delay = 50 + index * 8;
                    const progress = smoothInterpolate(
                        frame,
                        [delay, delay + 20],
                        [0, 1],
                        EASINGS.overshoot
                    );

                    // Animated counter effect
                    const animatedValue = metric.value.includes('+') || metric.value.includes('%')
                        ? metric.value
                        : metric.value;

                    return (
                        <div
                            key={index}
                            style={{
                                textAlign: 'center',
                                opacity: progress,
                                transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '56px',
                                    fontWeight: 800,
                                    background: `linear-gradient(135deg, ${brandColor}, #ffffff)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    marginBottom: '8px',
                                }}
                            >
                                {animatedValue}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 500 }}>
                                {metric.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Testimonial (if present) */}
            {testimonial && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '8%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '70%',
                        textAlign: 'center',
                        opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateRight: 'clamp' }),
                    }}
                >
                    <div style={{ color: 'white', fontSize: '20px', fontStyle: 'italic', marginBottom: '12px' }}>
                        "{testimonial.quote}"
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '16px' }}>
                        — {testimonial.author}
                    </div>
                </div>
            )}
        </AbsoluteFill>
    );
};
