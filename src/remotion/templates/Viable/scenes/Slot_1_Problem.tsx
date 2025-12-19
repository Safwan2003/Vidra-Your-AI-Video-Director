import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img } from 'remotion';

interface Slot1ProblemProps {
    brandName?: string;
    logoUrl?: string;
    tagline?: string;
    accentColor?: string;
    screenshotUrl?: string;
}

// Icon components for the floating widgets
const AppStoreIcon = () => (
    <svg viewBox="0 0 24 24" fill="#007aff" width="100%" height="100%">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3.5H7.5l4.5-5.5 4.5 5.5h-3.5v3.5H11z" fill="white" />
        <circle cx="12" cy="12" r="10" stroke="none" fill="#007aff" />
        <path d="M14.5 16l-5-7 1.75-2.25L16 13.5z" fill="white" opacity="0.8" />
        <path d="M7 13.5l2.25 3 2.25-3z" fill="white" />
        <path d="M16.5 7.5L12 13.5 10 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
); // Simply using colored circles with letters for standard logos if we don't have SVGs

const LogoWidget = ({ color, letter, icon }: { color: string, letter?: string, icon?: React.ReactNode }) => (
    <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
        {icon ? icon : (
            <div style={{
                width: '70%', height: '70%',
                borderRadius: '50%',
                background: color,
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '32px'
            }}>
                {letter}
            </div>
        )}
    </div>
);

export const Slot1Problem: React.FC<Slot1ProblemProps> = ({
    accentColor = '#22c55e',
    screenshotUrl
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. MONITOR ENTRANCE (Smooth 3D Swing)
    const monitorProgress = spring({
        frame: frame - 10,
        fps,
        from: 0,
        to: 1,
        config: { damping: 14, stiffness: 70, mass: 1.2 }
    });

    // Continuous hover for monitor
    const hoverY = Math.sin(frame / 60) * 8;
    const hoverRot = Math.sin(frame / 80) * 1.5;

    // 2. WIDGETS CONFIGURATION (Matches Reference)
    const widgets = [
        { id: 'appstore', icon: <LogoWidget color="#10b981" letter="A" />, label: null, x: 42, y: 30, size: 70, delay: 30 },
        { id: 'zendesk', icon: <LogoWidget color="#0f172a" letter="Z" />, label: null, x: 62, y: 25, size: 55, delay: 35 },
        { id: 'gong', icon: <LogoWidget color="#7c3aed" letter="G" />, label: null, x: 58, y: 65, size: 50, delay: 40 },
        { id: 'intercom', icon: <LogoWidget color="#2563eb" letter="I" />, label: null, x: 45, y: 75, size: 55, delay: 45 },
        { id: 'prod-mgr', icon: <LogoWidget color="#f59e0b" letter="PM" />, label: 'Product Manager', x: 25, y: 25, size: 80, delay: 50 },
        { id: 'voice-cust', icon: <LogoWidget color="#ec4899" letter="VC" />, label: 'Voice of the Customer', x: 15, y: 55, size: 85, delay: 60 },
        { id: 'cust-exp', icon: <LogoWidget color="#3b82f6" letter="CX" />, label: 'Customer Experience', x: 75, y: 35, size: 75, delay: 55 },
        { id: 'mkt-res', icon: <LogoWidget color="#ef4444" letter="MR" />, label: 'Marketing Research', x: 70, y: 60, size: 65, delay: 65 },
        { id: 'prod-ops', icon: <LogoWidget color="#8b5cf6" letter="PO" />, label: 'Product Operations', x: 30, y: 80, size: 70, delay: 70 },
    ];

    // 3. TABLE ROWS ANIMATION
    const rows = [1, 2, 3, 4, 5, 6];

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f0f4f8 0%, #dbeafe 100%)', // Lighter, cleaner office vibe
            perspective: '2000px',
            overflow: 'hidden'
        }}>
            {/* Realistic Blurred Office Background */}
            <Img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop"
                style={{
                    position: 'absolute',
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(8px) brightness(1.1)',
                    transform: 'scale(1.1)'
                }}
            />
            <AbsoluteFill style={{ background: 'rgba(255,255,255,0.7)' }} /> {/* Overlay to separate UI */}

            {/* MAIN 3D SCENE CONTAINER */}
            <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transformStyle: 'preserve-3d',
                transform: `translateY(${hoverY}px) rotateX(${hoverRot}deg)`
            }}>

                {/* 3D MONITOR */}
                <div style={{
                    width: '1000px', height: '600px',
                    position: 'relative',
                    transform: `scale(${monitorProgress}) rotateY(${interpolate(monitorProgress, [0, 1], [45, 0])}deg)`,
                    transformStyle: 'preserve-3d'
                }}>

                    {/* Monitor Shadow */}
                    <div style={{
                        position: 'absolute', top: '120%', left: '10%', width: '80%', height: '40px',
                        background: 'black', borderRadius: '50%',
                        filter: 'blur(30px)', opacity: 0.3,
                        transform: 'rotateX(60deg) scale(0.8)'
                    }} />

                    {/* Monitor Frame */}
                    <div style={{
                        width: '100%', height: '100%',
                        background: '#1e293b',
                        borderRadius: '24px',
                        padding: '24px',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        zIndex: 10
                    }}>
                        {/* Stand */}
                        <div style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            width: '200px', height: '60px',
                            background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
                            borderRadius: '0 0 16px 16px',
                            zIndex: -1
                        }} />

                        {/* Screen Content */}
                        <div style={{
                            width: '100%', height: '100%',
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                        }}>
                            {screenshotUrl ? (
                                <Img
                                    src={screenshotUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                /* DEFAULT TABLE UI */
                                <div style={{ padding: '40px' }}>
                                    {/* Header */}
                                    <div style={{
                                        display: 'flex', padding: '15px 0',
                                        borderBottom: `3px solid ${accentColor}30`, marginBottom: '20px'
                                    }}>
                                        {['Email', 'NPS', 'Channel', 'Feedback', 'Survey Results'].map((h, i) => (
                                            <div key={i} style={{
                                                flex: 1, fontWeight: 800, color: '#334155', fontSize: '18px',
                                                paddingLeft: '10px'
                                            }}>{h}</div>
                                        ))}
                                    </div>

                                    {/* Rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {rows.map((row, i) => {
                                            const rowDelay = i * 5 + 20;
                                            const rowOp = interpolate(frame - rowDelay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
                                            const rowX = interpolate(frame - rowDelay, [0, 15], [-20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

                                            if (frame < rowDelay) return null;

                                            return (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', opacity: rowOp, transform: `translateX(${rowX}px)`
                                                }}>
                                                    {[1, 2, 3, 4, 5].map((col, j) => (
                                                        <div key={j} style={{ flex: 1, paddingLeft: '10px' }}>
                                                            <div style={{
                                                                height: '12px', borderRadius: '6px',
                                                                background: col === 5 ? accentColor : '#e2e8f0',
                                                                opacity: col === 5 ? 0.3 : 1,
                                                                width: `${60 + Math.random() * 30}%`
                                                            }} />
                                                            {col === 4 && <div style={{ height: '12px', borderRadius: '6px', background: '#e2e8f0', width: '40%', marginTop: '6px' }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FLOATING WIDGETS (The "Chaos" Layer) */}
                <div style={{
                    position: 'absolute', inset: -100, pointerEvents: 'none',
                    transform: 'translateZ(150px)' // Push slightly forward in 3D
                }}>
                    {widgets.map((widget, i) => {
                        const d = widget.delay;
                        const wScale = spring({ frame: frame - d, fps, config: { damping: 12, stiffness: 100 } });
                        const wOp = interpolate(frame - d, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

                        // Floating motion relative to initial position
                        const floatX = Math.sin((frame + i * 100) / 40) * 15;
                        const floatY = Math.cos((frame + i * 100) / 50) * 15;

                        if (frame < d) return null;

                        return (
                            <div key={widget.id} style={{
                                position: 'absolute',
                                left: `${widget.x}%`, top: `${widget.y}%`,
                                transform: `translate3d(${floatX}px, ${floatY}px, 0) scale(${wScale})`,
                                opacity: wOp,
                                display: 'flex', flexDirection: 'column', alignItems: 'center'
                            }}>
                                {/* The Bubble Itself */}
                                <div style={{
                                    width: `${widget.size}px`, height: `${widget.size}px`,
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.95)',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,1)',
                                    backdropFilter: 'blur(10px)',
                                    padding: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {widget.icon}
                                </div>

                                {/* Label Token (if exists) */}
                                {widget.label && (
                                    <div style={{
                                        marginTop: '12px',
                                        background: 'white',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)',
                                        fontSize: '14px', fontWeight: 700, color: '#334155',
                                        whiteSpace: 'nowrap',
                                        opacity: interpolate(frame - d - 10, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
                                        transform: `translateY(${interpolate(frame - d - 10, [0, 10], [10, 0], { extrapolateRight: 'clamp' })}px)`
                                    }}>
                                        {widget.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
