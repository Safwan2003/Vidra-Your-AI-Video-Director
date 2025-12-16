import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img } from 'remotion';

// INLINE COMPONENT TO FIX BUILD
const GlassCard = ({ children, style, className, blur = 20, opacity = 0.85, borderRadius = 24, padding = 0 }: any) => (
    <div style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderRadius: borderRadius,
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: `0 50px 100px -20px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)`,
        padding: padding,
        ...style
    }} className={className}>
        {children}
    </div>
);

// --- Types & Interfaces ---
interface Slot3HeroProps {
    productName?: string;
    accentColor?: string;
    screenUrl?: string; // INPUT: Dynamic Screenshot
    title?: string;
    stats?: { label: string; value: string; suffix?: string; isPrimary?: boolean }[];
}

// --- Sub-Components ---
const SidebarItem = ({
    icon, label, badge, active = false, delay, accentColor
}: { icon: string, label: string, badge?: string, active?: boolean, delay: number, accentColor: string }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
    const x = interpolate(frame, [delay, delay + 15], [-10, 0], { easing: Easing.out(Easing.quad) });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', marginBottom: '6px',
            borderRadius: '8px',
            background: active ? `${accentColor}15` : 'transparent', // 15 = roughly 8% opacity hex
            borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
            opacity, transform: `translateX(${x}px)`,
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? accentColor : '#64748b'
                }}>{label}</span>
            </div>
            {badge && (
                <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                    background: badge === 'Severe' ? '#fef2f2' : badge === 'High' ? '#fff7ed' : '#f1f5f9',
                    color: badge === 'Severe' ? '#ef4444' : badge === 'High' ? '#f97316' : '#94a3b8',
                    boxShadow: badge === 'Severe' ? '0 0 0 1px #fecaca' : 'none'
                }}>{badge}</span>
            )}
        </div>
    );
};

// 2. Animated Counter with smoother easing
const AnimatedCounter = ({ value, suffix = '', color, delay }: { value: number, suffix?: string, color: string, delay: number }) => {
    const frame = useCurrentFrame();
    const progress = interpolate(frame, [delay, delay + 50], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.exp) // Smoother "landing"
    });
    const currentVal = Math.floor(progress * value);

    return (
        <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
            {currentVal}{suffix}
        </span>
    );
};

// 3. Weekly Volume Area Chart - Now wrapped in a container that supports Glass/Shadow better
const AdvancedChart = ({ width, height, color, delay }: { width: number, height: number, color: string, delay: number }) => {
    const frame = useCurrentFrame();

    const d = `M 0,${height} L 0,${height * 0.4} Q ${width * 0.2},${height * 0.8} ${width * 0.4},${height * 0.6} T ${width * 0.7},${height * 0.7} T ${width},${height * 0.2} L ${width},${height} Z`;
    const lineD = `M 0,${height * 0.4} Q ${width * 0.2},${height * 0.8} ${width * 0.4},${height * 0.6} T ${width * 0.7},${height * 0.7} T ${width},${height * 0.2}`;

    const draw = interpolate(frame, [delay, delay + 60], [0, 1], {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic)
    });
    const opacity = interpolate(frame, [delay, delay + 20], [0, 1]);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="advChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pos => (
                <line key={pos} x1="0" y1={height * pos} x2={width} y2={height * pos} stroke="#e2e8f0" strokeDasharray="4" opacity={0.5} />
            ))}

            <g style={{ transform: `scaleX(${draw})`, transformOrigin: 'left' }}>
                <path d={d} fill="url(#advChartGrad)" opacity={opacity} />
                <path d={lineD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                {/* End Point Dot */}
                {draw > 0.9 && (
                    <circle cx={width} cy={height * 0.2} r="4" fill={color} stroke="white" strokeWidth="2" />
                )}
            </g>
        </svg>
    );
};


// --- Main Component ---
export const Slot3Hero: React.FC<Slot3HeroProps> = ({
    accentColor = '#8b5cf6', // Violet default
    screenUrl,
    title = "Inaccurate & delayed notifications",
    stats
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Container 3D Entrance - Smoother Spring
    const entrance = spring({ frame, fps, from: 0.85, to: 1, config: { mass: 0.8, damping: 15 } });
    const tiltY = interpolate(frame, [0, 150], [-5, -2], { easing: Easing.inOut(Easing.sin) });
    const tiltX = interpolate(frame, [0, 150], [2, 1], { easing: Easing.inOut(Easing.sin) });
    const shadowOpacity = interpolate(frame, [0, 30], [0, 0.5]);

    const hasScreen = screenUrl && screenUrl.length > 5;

    // Default Stats if none provided
    const displayStats = stats || [
        { label: 'Datapoints Analyzed', value: '116', isPrimary: false },
        { label: 'Above Average', value: '22', suffix: '.0%', isPrimary: false },
    ];

    return (
        <AbsoluteFill style={{
            background: `radial-gradient(circle at 50% 30%, #f8fafc 0%, #e2e8f0 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            perspective: '2000px'
        }}>

            {/* Ambient Back Glow */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '800px', height: '600px',
                background: accentColor,
                opacity: 0.15,
                filter: 'blur(120px)',
                zIndex: 0
            }} />

            {/* Main Application Window */}
            <div style={{
                width: '1280px', height: '760px',
                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${entrance})`,
                transformStyle: 'preserve-3d',
                position: 'relative',
                zIndex: 2
            }}>
                {/* The Window "Chrome" + Content */}
                <GlassCard
                    blur={20}
                    opacity={0.85}
                    borderRadius={24}
                    padding={0}
                    style={{
                        width: '100%', height: '100%',
                        boxShadow: `0 50px 100px -20px rgba(0,0,0,${0.2 * shadowOpacity}), 0 0 0 1px rgba(255,255,255,0.5)`,
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column'
                    }}
                >

                    {/* 1. Browser/App Header */}
                    <div style={{
                        height: '48px',
                        background: 'rgba(255,255,255,0.5)',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 24px'
                    }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
                        </div>
                        {/* Fake URL Bar */}
                        <div style={{
                            flex: 1, margin: '0 40px', height: '28px',
                            background: 'rgba(0,0,0,0.03)', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>analytics.viable.com/dashboard</span>
                        </div>
                        <div style={{ width: '40px' }} /> {/* Spacer */}
                    </div>

                    {/* 2. DYNAMIC CONTENT SWITCHER */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#fdf4ff' }}>
                        {hasScreen ? (
                            <div style={{ width: '100%', height: '100%' }}>
                                <Img
                                    src={screenUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                                />
                                {/* Overlay Cursor Animation would go here */}
                            </div>
                        ) : (
                            // OPTION B: Rebuilt Mock UI with Glass Components
                            <div style={{ display: 'flex', height: '100%' }}>
                                {/* SIDEBAR */}
                                <div style={{
                                    width: '260px',
                                    background: 'rgba(255,255,255,0.6)',
                                    borderRight: '1px solid rgba(0,0,0,0.04)',
                                    padding: '30px 20px',
                                    display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{
                                        paddingLeft: '10px', marginBottom: '40px',
                                        fontWeight: 800, fontSize: '24px',
                                        color: accentColor, fontFamily: 'Inter, sans-serif'
                                    }}>viable</div>

                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', paddingLeft: '10px', letterSpacing: '0.5px' }}>REPORTS</div>
                                    <SidebarItem icon="" label="Overview" badge="" delay={5} accentColor={accentColor} />
                                    <SidebarItem icon="" label="Complaints" badge="Severe" delay={15} active={true} accentColor={accentColor} />
                                    <SidebarItem icon="" label="Feedback" badge="12" delay={25} accentColor={accentColor} />

                                </div>

                                {/* MAIN DASHBOARD AREA */}
                                <div style={{ flex: 1, padding: '40px', background: 'white' }}>

                                    {/* Glass Card "Showcase" */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%', height: '100%',
                                        borderRadius: '24px',
                                        // Complex Gradient Background for the "Card"
                                        background: `linear-gradient(135deg, ${accentColor}10 0%, #fff 100%)`,
                                        border: `1px solid ${accentColor}20`,
                                        padding: '40px',
                                        display: 'flex', flexDirection: 'column'
                                    }}>
                                        {/* Decorative Blob */}
                                        <div style={{
                                            position: 'absolute', top: -50, right: -50,
                                            width: '400px', height: '400px',
                                            borderRadius: '50%',
                                            background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
                                            pointerEvents: 'none'
                                        }} />

                                        {/* Header Title */}
                                        <div style={{ marginBottom: '50px', position: 'relative', zIndex: 2 }}>
                                            <h1 style={{
                                                fontSize: '48px', fontWeight: 800,
                                                color: '#1e293b', lineHeight: 1.1,
                                                marginBottom: '16px'
                                            }}>
                                                {title.split(' ')[0]} <br />
                                                <span style={{ color: accentColor }}>{title.split(' ').slice(1).join(' ')}</span>
                                            </h1>
                                            <div style={{ width: '60px', height: '6px', background: accentColor, borderRadius: '4px' }} />
                                        </div>

                                        {/* Stats Grid */}
                                        <div style={{ display: 'flex', gap: '60px', marginBottom: '50px', position: 'relative', zIndex: 2 }}>
                                            {displayStats.map((stat, i) => (
                                                <div key={i}>
                                                    <div style={{ fontSize: '56px', fontWeight: 800, color: '#0f172a', letterSpacing: '-2px' }}>
                                                        <AnimatedCounter value={parseInt(stat.value)} suffix={stat.suffix} color="#0f172a" delay={20 + (i * 10)} />
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {stat.label}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Severity Badge (constant for this template) */}
                                            <div>
                                                <div style={{
                                                    background: '#fef2f2', color: '#ef4444',
                                                    padding: '8px 16px', borderRadius: '12px',
                                                    fontSize: '32px', fontWeight: 800,
                                                    border: '1px solid #fecaca',
                                                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
                                                }}>
                                                    Severe
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginTop: '8px', opacity: 0.8 }}>Status</div>
                                            </div>
                                        </div>

                                        {/* Bottom Chart Area - Wrapped in Glass Card for extra depth */}
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <GlassCard
                                                blur={0} opacity={0.5} borderRadius={16} padding={24}
                                                style={{
                                                    height: '100%', background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                    <div style={{ fontWeight: 700, color: '#334155' }}>Engagement Trend</div>
                                                    <div style={{ fontWeight: 600, color: accentColor, fontSize: '13px', background: `${accentColor}10`, padding: '4px 8px', borderRadius: '6px' }}>+12.5%</div>
                                                </div>
                                                <div style={{ height: 'calc(100% - 40px)' }}>
                                                    <AdvancedChart width={700} height={200} color={accentColor} delay={30} />
                                                </div>
                                            </GlassCard>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </AbsoluteFill>
    );
};
