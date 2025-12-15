import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img } from 'remotion';

// --- Types & Interfaces ---
interface Slot3HeroProps {
    productName?: string; // Optional
    accentColor?: string;
    screenUrl?: string; // INPUT: Dynamic Screenshot
}

// --- Sub-Components ---

// 1. Sidebar Item
const SidebarItem = ({
    icon, label, badge, active = false, delay
}: { icon: string, label: string, badge?: string, active?: boolean, delay: number }) => {
    const frame = useCurrentFrame();
    // Safe standard easing
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
    const x = interpolate(frame, [delay, delay + 15], [-10, 0], { easing: Easing.out(Easing.quad) });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', marginBottom: '4px',
            borderRadius: '6px',
            background: active ? 'rgba(147, 51, 234, 0.08)' : 'transparent',
            opacity, transform: `translateX(${x}px)`
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {active && <div style={{ width: '0', height: '0', borderLeft: '5px solid #9333ea', borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />}
                <span style={{ fontSize: '13px', fontWeight: active ? 600 : 500, color: active ? '#9333ea' : '#475569' }}>{label}</span>
            </div>
            {badge && (
                <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                    background: badge === 'Severe' ? '#fee2e2' : badge === 'High' ? '#ffedd5' : badge === 'Low' ? '#f1f5f9' : '#f1f5f9',
                    color: badge === 'Severe' ? '#ef4444' : badge === 'High' ? '#f97316' : badge === 'Low' ? '#94a3b8' : '#64748b',
                    border: badge === 'Severe' ? '1px solid #fecaca' : 'none'
                }}>{badge}</span>
            )}
        </div>
    );
};

// 2. Animated Counter
const AnimatedCounter = ({ value, suffix = '', color, delay }: { value: number, suffix?: string, color: string, delay: number }) => {
    const frame = useCurrentFrame();
    // Safe standard easing for count up
    const progress = interpolate(frame, [delay, delay + 40], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic) // Standard cubic easing
    });
    const currentVal = Math.floor(progress * value);

    return (
        <span style={{ color }}>
            {currentVal}{suffix}
        </span>
    );
};

// 3. Weekly Volume Area Chart
const AdvancedChart = ({ width, height, color, delay }: { width: number, height: number, color: string, delay: number }) => {
    const frame = useCurrentFrame();

    const d = `M 0,${height} L 0,${height * 0.4} Q ${width * 0.2},${height * 0.8} ${width * 0.4},${height * 0.6} T ${width * 0.7},${height * 0.7} T ${width},${height * 0.2} L ${width},${height} Z`;
    const lineD = `M 0,${height * 0.4} Q ${width * 0.2},${height * 0.8} ${width * 0.4},${height * 0.6} T ${width * 0.7},${height * 0.7} T ${width},${height * 0.2}`;

    // Safe standard easing
    const draw = interpolate(frame, [delay, delay + 60], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic)
    });
    const opacity = interpolate(frame, [delay, delay + 20], [0, 1]);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="advChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
            </defs>
            <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#e2e8f0" strokeDasharray="4" />
            <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#e2e8f0" strokeDasharray="4" />
            <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#e2e8f0" strokeDasharray="4" />
            <g style={{ transform: `scaleX(${draw})`, transformOrigin: 'left' }}>
                <path d={d} fill="url(#advChartGrad)" opacity={opacity} />
                <path d={lineD} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
            </g>
        </svg>
    );
};


// --- Main Component ---
export const Slot3Hero: React.FC<Slot3HeroProps> = ({
    accentColor = '#9333ea',
    screenUrl
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Container 3D Entrance
    const entrance = spring({ frame, fps, from: 0.8, to: 1, config: { damping: 20 } });
    const tiltY = interpolate(frame, [0, 120], [-10, -5]);
    const tiltX = interpolate(frame, [0, 120], [5, 2]);

    // Simple validity check for screenUrl
    const hasScreen = screenUrl && screenUrl.length > 5;

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #e9d5ff 0%, #fae8ff 100%)', // Lighter purple background
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            perspective: '1500px'
        }}>

            {/* Main Application Window */}
            <div style={{
                width: '1200px', height: '700px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 40px 100px -20px rgba(88, 28, 135, 0.25), 0 0 0 1px rgba(0,0,0,0.02)',
                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${entrance})`,
                transformStyle: 'preserve-3d',
                display: 'flex',
                overflow: 'hidden'
            }}>

                {/* --- 1. DYNAMIC CONTENT SWITCHER --- */}
                {hasScreen ? (
                    // OPTION A: Provided Screenshot
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {/* Browser Header Bar for polish */}
                        <div style={{ height: '32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                        </div>
                        {/* The Image */}
                        <div style={{ height: 'calc(100% - 32px)', width: '100%' }}>
                            <Img
                                src={screenUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                                onError={(e) => {
                                    console.warn("Failed to load screenshot:", screenUrl);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* CURSOR INTERACTION SIMULATION (Pure Pointer) */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            pointerEvents: 'none'
                        }}>
                            {/* The Cursor */}
                            <div style={{
                                position: 'absolute',
                                transform: `translate(${interpolate(frame, [30, 60], [1200, 600], { easing: Easing.out(Easing.cubic) })}px, ${interpolate(frame, [30, 60], [800, 300], { easing: Easing.out(Easing.cubic) })}px)`,
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                            }}>
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19138L15.6499 12.3673H5.65376Z" fill="#1e293b" stroke="white" strokeWidth="2.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ) : (
                    // OPTION B: Fallback Mock UI (High Fidelity)
                    <>
                        {/* LEFT SIDEBAR (Navigation) */}
                        <div style={{
                            width: '240px', background: '#fdf4ff', // Very light purple tint
                            borderRight: '1px solid #f0abfc',
                            padding: '24px 16px',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            {/* Brand Mock */}
                            <div style={{ paddingLeft: '8px', marginBottom: '30px', fontWeight: 800, fontSize: '20px', color: '#7e22ce' }}>viable</div>

                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#a855f7', marginBottom: '10px', paddingLeft: '8px', letterSpacing: '0.5px' }}>REPORTS</div>
                            <SidebarItem icon="" label="Helpdesk & Chat Analysis" badge="Severe" delay={10} />
                            <SidebarItem icon="" label="Complaints" badge="Severe" delay={12} active={true} />
                            <SidebarItem icon="" label="Compliments" badge="Low" delay={14} />
                            <SidebarItem icon="" label="Requests" badge="Low" delay={16} />

                            <div style={{ height: '20px' }} />
                            <SidebarItem icon="" label="Questions" badge="Medium" delay={18} />
                            <SidebarItem icon="" label="Review Analysis" delay={20} />
                        </div>

                        {/* MAIN CONTENT AREA */}
                        <div style={{ flex: 1, background: '#fdf4ff', padding: '0', display: 'flex', flexDirection: 'column' }}>
                            {/* Inner Content Card - The "Showcase" */}
                            <div style={{
                                flex: 1, margin: '20px',
                                background: 'linear-gradient(160deg, #d8b4fe 0%, #e9d5ff 100%)', // Purple gradient card background from ref
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.1)',
                                padding: '40px',
                                color: '#1e1b4b',
                                display: 'flex', flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>

                                {/* Header */}
                                <div style={{ marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                                    <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '8px', lineHeight: '1.1' }}>
                                        Inaccurate & delayed <br />notifications
                                    </h1>
                                    <div style={{ width: '40px', height: '4px', background: '#9333ea', borderRadius: '4px' }} />
                                </div>

                                {/* Animated Stats Row */}
                                <div style={{ display: 'flex', gap: '60px', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                                    {/* Stat 1 */}
                                    <div>
                                        <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1' }}>
                                            <AnimatedCounter value={116} color="#1e1b4b" delay={20} />
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6 }}>Datapoints Analyzed</div>
                                    </div>
                                    {/* Stat 2 */}
                                    <div>
                                        <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: '1' }}>
                                            <AnimatedCounter value={22} suffix=".0%" color="#1e1b4b" delay={25} />
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6 }}>Above Average</div>
                                    </div>
                                    {/* Stat 3: Urgency */}
                                    <div>
                                        <div style={{
                                            fontSize: '32px', fontWeight: 800, color: '#dc2626',
                                            background: 'rgba(255,255,255,0.5)', padding: '0 10px', borderRadius: '8px',
                                            lineHeight: '1.4'
                                        }}>
                                            Severe
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.6, marginTop: '2px' }}>Urgency</div>
                                    </div>
                                </div>

                                {/* Chart Container - White Card at bottom */}
                                <div style={{
                                    flex: 1,
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                    position: 'relative', zIndex: 2
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#334155' }}>Weekly Volume</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Last 8 weeks</div>
                                    </div>
                                    <div style={{ height: '180px' }}>
                                        <AdvancedChart width={600} height={180} color="#9333ea" delay={30} />
                                    </div>
                                </div>

                                {/* Decorative background shapes for "Product" feel */}
                                <div style={{
                                    position: 'absolute', top: '-50px', right: '-50px',
                                    width: '300px', height: '300px',
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                                    borderRadius: '50%', pointerEvents: 'none'
                                }} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AbsoluteFill>
    );
};
