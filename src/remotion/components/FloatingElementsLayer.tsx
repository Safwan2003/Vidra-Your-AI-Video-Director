import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { FloatingElement } from '../../../types';
import { TrendingUp, Bell, Zap, CheckCircle, Users, Star, MessageCircle, Slack, Github, Trello } from 'lucide-react';

interface FloatingElementsLayerProps {
    elements?: FloatingElement[];
    brandColor: string;
}

const IconMap: { [key: string]: React.FC<{ size: number; color: string }> } = {
    TrendingUp,
    Bell,
    Zap,
    CheckCircle,
    Users,
    Star,
    MessageCircle,
    Slack,
    Github,
    Trello,
    Lightbulb: Zap, // Map to Zap as fallback
};

export const FloatingElementsLayer: React.FC<FloatingElementsLayerProps> = ({
    elements = [],
    brandColor
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!elements || elements.length === 0) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {elements.map((element, index) => {
                // Calculate delay in frames
                const delayFrames = Math.floor((element.delay || 0) / (1000 / fps));
                const elementFrame = frame - delayFrames;

                // Skip if not yet visible
                if (elementFrame < 0) return null;

                // Animation based on style
                let opacity = 0;
                let scale = 0;
                let translateY = 0;
                let translateX = 0;

                const animStyle = element.animationStyle || 'pop_in';

                switch (animStyle) {
                    case 'pop_in':
                        scale = spring({
                            frame: elementFrame,
                            fps,
                            config: { damping: 12, stiffness: 200 },
                        });
                        opacity = interpolate(elementFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
                        break;

                    case 'slide_up':
                        translateY = interpolate(elementFrame, [0, 20], [30, 0], { extrapolateRight: 'clamp' });
                        opacity = interpolate(elementFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
                        scale = 1;
                        break;

                    case 'fade_scale':
                        scale = interpolate(elementFrame, [0, 20], [0.8, 1], { extrapolateRight: 'clamp' });
                        opacity = interpolate(elementFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
                        break;

                    case 'bounce':
                        scale = spring({
                            frame: elementFrame,
                            fps,
                            config: { damping: 8, stiffness: 300 },
                        });
                        opacity = interpolate(elementFrame, [0, 5], [0, 1], { extrapolateRight: 'clamp' });
                        break;

                    default:
                        scale = spring({ frame: elementFrame, fps, config: { damping: 12 } });
                        opacity = interpolate(elementFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
                }

                // Subtle float animation after entry
                const floatOffset = elementFrame > 20 ? Math.sin((elementFrame - 20) / 25) * 3 : 0;

                // Get icon component
                const IconComponent = element.icon ? IconMap[element.icon] : null;
                const accentColor = element.color || brandColor;

                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: element.position?.top || '50%',
                            left: element.position?.left || '50%',
                            transform: `translate(-50%, -50%) translateY(${translateY + floatOffset}px) translateX(${translateX}px) scale(${scale})`,
                            opacity,
                        }}
                    >
                        {/* Stat Card */}
                        {element.type === 'stat_card' && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.95)',
                                    borderRadius: 16,
                                    padding: '16px 24px',
                                    boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1), 0 0 20px ${accentColor}30`,
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    minWidth: 100,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 800,
                                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {element.value || element.text}
                                </span>
                                {element.label && (
                                    <span style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                                        {element.label}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Notification */}
                        {element.type === 'notification' && (
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    maxWidth: 200,
                                }}
                            >
                                {IconComponent && (
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            background: `${accentColor}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconComponent size={18} color={accentColor} />
                                    </div>
                                )}
                                <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                                    {element.text}
                                </span>
                            </div>
                        )}

                        {/* Integration Icon */}
                        {element.type === 'integration_icon' && (
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 14,
                                    background: 'white',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {IconComponent && <IconComponent size={28} color={accentColor} />}
                            </div>
                        )}

                        {/* Feature Badge */}
                        {element.type === 'feature_badge' && (
                            <div
                                style={{
                                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                                    borderRadius: 20,
                                    padding: '8px 16px',
                                    boxShadow: `0 4px 15px ${accentColor}40`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <CheckCircle size={14} color="white" />
                                <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>
                                    {element.text}
                                </span>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        {element.type === 'progress_indicator' && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.95)',
                                    borderRadius: 12,
                                    padding: '12px 20px',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                    minWidth: 120,
                                }}
                            >
                                <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                                    {element.label || 'Progress'}
                                </div>
                                <div
                                    style={{
                                        height: 6,
                                        background: '#e5e5e5',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${Math.min(100, interpolate(elementFrame, [0, 40], [0, parseInt(element.value || '75')]))}%`,
                                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
                                            borderRadius: 3,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Testimonial Bubble */}
                        {element.type === 'testimonial_bubble' && (
                            <div
                                style={{
                                    background: 'white',
                                    borderRadius: 16,
                                    padding: '14px 18px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    maxWidth: 180,
                                    position: 'relative',
                                }}
                            >
                                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={12} color="#FFB800" fill="#FFB800" />
                                    ))}
                                </div>
                                <span style={{ fontSize: 12, color: '#333', lineHeight: 1.4 }}>
                                    "{element.text}"
                                </span>
                            </div>
                        )}

                        {/* Cursor Click Effect */}
                        {element.type === 'cursor_click' && (
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${accentColor}60 0%, transparent 70%)`,
                                    animation: 'pulse 0.6s ease-out',
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
