import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion';
import { FloatingElement } from '../../../../types';

const FloatingItem = ({ element }: { element: FloatingElement }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const delay = element.delay || 0;
    const scrollFrame = frame - delay;

    // Animation logic
    const scale = spring({
        frame: scrollFrame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const yMove = Math.sin(frame / 30 + (parseInt(element.position.left) || 0)) * 10;
    const opacity = interpolate(scrollFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    if (frame < delay) return null;

    return (
        <div style={{
            position: 'absolute',
            top: element.position.top,
            left: element.position.left,
            transform: `translate(-50%, -50%) scale(${scale}) translateY(${yMove}px)`,
            opacity,
            zIndex: 100,
        }}>
            {element.type === 'notification' && (
                <div style={{
                    background: 'white',
                    padding: '12px 20px',
                    borderRadius: 16,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '1px solid #f1f5f9',
                    minWidth: 200,
                }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>NOTIFICATION</div>
                    <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{element.text}</div>
                </div>
            )}

            {element.type === 'stat_card' && (
                <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: 16,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    minWidth: 150,
                }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{element.label}</div>
                    <div style={{ fontSize: 24, color: element.color || '#3b82f6', fontWeight: 800 }}>{element.value}</div>
                </div>
            )}

            {element.type === 'feature_badge' && (
                <div style={{
                    background: element.color || '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                }}>
                    {element.text}
                </div>
            )}

            {element.type === 'testimonial_bubble' && (
                <div style={{
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: '20px 20px 20px 0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    maxWidth: 240,
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: '#334155',
                }}>
                    "{element.text}"
                </div>
            )}
        </div>
    );
};

export const PretaaFloatingElements = ({ elements }: { elements?: FloatingElement[] }) => {
    if (!elements || elements.length === 0) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {elements.map((el, idx) => (
                <FloatingItem key={idx} element={el} />
            ))}
        </AbsoluteFill>
    );
};
