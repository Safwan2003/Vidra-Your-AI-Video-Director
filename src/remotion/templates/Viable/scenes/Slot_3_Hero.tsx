import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Img, interpolate, spring } from 'remotion';

interface Slot3HeroProps {
    screenUrl: string;
}

export const Slot3Hero: React.FC<Slot3HeroProps> = ({ screenUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Smoother, slower animation for the long 25s hold
    const cardScale = spring({
        frame: frame - 15,
        fps,
        from: 0.9,
        to: 1,
        config: { damping: 100, stiffness: 200, mass: 3 } // Cinematic slow settle
    });

    const cardOpacity = interpolate(frame, [0, 45], [0, 1]); // Slower fade in
    const floatY = Math.sin(frame / 60) * 8; // Gentle float

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)', // Lighter, cleaner purple
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1200px',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glows */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', width: '400px', height: '400px', background: '#e9d5ff', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', background: '#ddd6fe', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.6 }} />

            {/* The Main "Think Tank" Card - Made Larger & Premium */}
            <div style={{
                position: 'relative',
                width: '1100px', // Detailed, wide layout
                height: '650px',
                background: 'rgba(255, 255, 255, 0.90)', // High opacity glass
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                boxShadow: '0 50px 100px -20px rgba(124, 58, 237, 0.35)', // Deep purple shadow
                padding: '48px',
                zIndex: 10,
                transform: `scale(${cardScale}) translateY(${floatY}px) rotateX(2deg)`,
                opacity: cardOpacity,
                display: 'flex',
                alignItems: 'stretch',
                gap: '40px',
                border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
                {/* Left: Interactive Data Story */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '30px' }}>

                    {/* Header */}
                    <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <div style={{ fontSize: '56px', fontWeight: '800', color: '#111827', letterSpacing: '-2px', lineHeight: 1.1 }}>
                            The Feedback<br /><span style={{ color: '#7c3aed' }}>Verdict</span>
                        </div>
                    </div>

                    {/* AI Insight Block */}
                    <div style={{
                        background: '#f9fafb', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #7c3aed'
                    }}>
                        <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Analysis</div>
                        <div style={{ fontSize: '22px', lineHeight: '1.5', color: '#374151', fontWeight: '500' }}>
                            "User retention is dropping due to a <span style={{ background: '#fecaca', padding: '0 6px', borderRadius: '4px', color: '#991b1b', fontWeight: '700' }}>critical bug</span> in the notification system introduced Monday."
                        </div>
                    </div>

                    {/* Metrics Row */}
                    <div style={{ display: 'flex', gap: '50px', marginTop: '10px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Impact Score</div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444' }}>98/100</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Affected Users</div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: '#1f2937' }}>12.5k</div>
                        </div>
                    </div>
                </div>

                {/* Right: Product Hero Shot (The Screenshot) */}
                <div style={{
                    flex: 1.3, // Wider than text for visual impact
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.1)',
                    border: '6px solid white',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Use the user's screen URL */}
                    {screenUrl ? (
                        <Img src={screenUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '40px' }}>📷</div>
                            <div>Product Screenshot</div>
                        </div>
                    )}

                    {/* "Flash" Glint Effect */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                        transform: `translateX(${interpolate(frame, [0, 100], [-100, 200])}%)`,
                        pointerEvents: 'none'
                    }} />

                    {/* Interactive Cursor Simulation */}
                    <div style={{
                        position: 'absolute',
                        top: '40%',
                        left: '40%',
                        transform: `translate(${Math.sin(frame / 40) * 30}px, ${Math.cos(frame / 40) * 20}px)`,
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="black" stroke="white" strokeWidth="1">
                            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.45.45 0 0 0 .32-.77L6.18 2.45a.45.45 0 0 0-.68.76z" />
                        </svg>
                    </div>

                    {/* Alert Badge Overlay */}
                    <div style={{
                        position: 'absolute', bottom: '30px', left: '30px',
                        background: 'rgba(0,0,0,0.85)', color: 'white',
                        padding: '10px 20px', borderRadius: '16px',
                        fontSize: '15px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 15px #ef4444' }} />
                        <div>Live Incident Detected</div>
                    </div>
                </div>
            </div>

        </AbsoluteFill>
    );
};
