import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

export const PretaaSlot6Review = ({ quote, author }: { quote?: string, author?: string }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Star Animation (Background)
    const scale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 100 } });
    const rotate = interpolate(frame, [10, 300], [-90, 45]);

    // Text Animation
    const textOpacity = interpolate(frame, [20, 40], [0, 1]);
    const textY = interpolate(frame, [20, 40], [20, 0]);

    return (
        <AbsoluteFill style={{
            background: '#0f172a', // Deep Dark Blue
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Background Star Decoration */}
            <div style={{
                position: 'absolute',
                transform: `scale(${scale * 3}) rotate(${rotate}deg)`,
                opacity: 0.1
            }}>
                <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2">
                    <path d="M50 2L61.2 36.6H98L69 58L80 93L50 72L20 93L31 58L2 36.6H38.8L50 2Z" />
                </svg>
            </div>

            {/* Quote Content */}
            <div style={{
                zIndex: 10, textAlign: 'center', padding: '0 10%',
                opacity: textOpacity,
                transform: `translateY(${textY}px)`
            }}>
                <div style={{ fontSize: 100, color: '#3b82f6', marginBottom: -20, fontFamily: 'serif' }}>“</div>
                <h2 style={{
                    fontSize: 50, color: 'white', fontWeight: 600, fontStyle: 'italic',
                    lineHeight: 1.4, margin: '20px 0'
                }}>
                    {quote || "This product completely transformed our workflow. Highly recommended!"}
                </h2>

                <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#334155', overflow: 'hidden' }}>
                        <Img src="https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{author || "Sarah Jenkins"}</div>
                        <div style={{ color: '#94a3b8', fontSize: 16 }}>CEO, TechFlow</div>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
