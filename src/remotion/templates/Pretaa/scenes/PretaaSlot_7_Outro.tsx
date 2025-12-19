import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface PretaaSlot7OutroProps {
    ctaText?: string;
    ctaUrl?: string; // Target URL
    screenshotUrl?: string;
    mobileScreenshotUrl?: string;
    backgroundColor?: string;
    mainTextColor?: string;
}

export const PretaaSlot7Outro: React.FC<PretaaSlot7OutroProps> = ({
    ctaText = 'Get Started',
    ctaUrl,
    screenshotUrl,
    mobileScreenshotUrl,
    backgroundColor,
    mainTextColor
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrance = spring({
        frame,
        fps,
        config: { damping: 20, stiffness: 80 },
    });

    const phoneFloat = Math.sin(frame / 30) * 8;
    const desktopFloat = Math.sin((frame + 15) / 30) * 6;

    return (
        <AbsoluteFill style={{ backgroundColor: backgroundColor || '#1e293b' }}>
            {/* Gradient Background */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 40%, #3b82f620, transparent 60%)',
                }}
            />

            {/* Desktop/Dashboard Mockup (Left) */}
            <div
                style={{
                    position: 'absolute',
                    left: '8%',
                    top: '50%',
                    transform: `translateY(calc(-50% + ${desktopFloat}px)) scale(${entrance * 0.9})`,
                    width: '45%',
                    aspectRatio: '16/10',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    opacity: entrance,
                }}
            >
                {/* Desktop UI Content: Image or Default Mockup */}
                <div style={{ width: '100%', height: '100%', background: '#0f172a', position: 'relative' }}>

                    {screenshotUrl ? (
                        <img
                            src={screenshotUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt="Desktop Dashboard"
                        />
                    ) : (
                        // Default Fallback Mockup
                        <>
                            {/* Sidebar */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '25%',
                                background: '#3b82f6',
                                padding: 20,
                            }}>
                                <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>OVERVIEW</div>
                                {['Home', 'Projects', 'Analytics', 'Team', 'Settings'].map((item, i) => (
                                    <div key={i} style={{
                                        color: i === 1 ? 'white' : 'rgba(255,255,255,0.6)',
                                        fontSize: 11,
                                        padding: '8px 0',
                                        fontWeight: i === 1 ? 600 : 400,
                                    }}>
                                        {item}
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Area */}
                            <div style={{
                                position: 'absolute',
                                left: '25%',
                                right: 0,
                                top: 0,
                                bottom: 0,
                                background: '#1e293b',
                                padding: 20,
                            }}>
                                {/* Header */}
                                <div style={{ marginBottom: 15 }}>
                                    <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Projects</div>
                                </div>

                                {/* Cards */}
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{
                                        background: '#334155',
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 10,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div>
                                            <div style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>Project {i + 1}</div>
                                            <div style={{ color: '#94a3b8', fontSize: 9, marginTop: 4 }}>In Progress</div>
                                        </div>
                                        <div style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            fontSize: 8,
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                        }}>
                                            View
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Phone Mockup (Right) */}
            <div
                style={{
                    position: 'absolute',
                    right: '12%',
                    top: '50%',
                    transform: `translateY(calc(-50% + ${phoneFloat}px)) scale(${entrance})`,
                    width: '280px',
                    height: '560px',
                    borderRadius: 36,
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 8px #1a1a1a, 0 0 0 10px rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    opacity: entrance,
                    background: '#000',
                }}
            >
                {/* Phone Screen Content: Image or Default Mockup */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'white',
                    position: 'relative',
                    padding: mobileScreenshotUrl ? 0 : '50px 20px 20px',
                }}>
                    {mobileScreenshotUrl ? (
                        <img
                            src={mobileScreenshotUrl}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt="Mobile App"
                        />
                    ) : (
                        // Default Fallback Mockup
                        <>
                            {/* Status Bar */}
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                left: 20,
                                right: 20,
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 11,
                                color: '#000',
                            }}>
                                <span>9:41</span>
                                <span>📶 🔋</span>
                            </div>

                            {/* Back Button */}
                            <div style={{ color: '#3b82f6', fontSize: 12, marginBottom: 15 }}>← Back</div>

                            {/* Header */}
                            <div style={{ marginBottom: 20 }}>
                                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#000' }}>Mayer LTD.</h2>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#3b82f6',
                                    color: 'white',
                                    fontSize: 9,
                                    padding: '3px 8px',
                                    borderRadius: 12,
                                    marginTop: 8,
                                }}>
                                    PROSPECT
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div style={{ marginBottom: 20 }}>
                                {[
                                    { label: 'Primary Contact', value: 'Jaylon Calzoni' },
                                    { label: 'Industry', value: 'Distribution' },
                                    { label: 'Potential MRR', value: '$120,000' },
                                    { label: 'Close Date', value: '06/06/21' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px 0',
                                        borderBottom: i < 3 ? '1px solid #e5e7eb' : 'none',
                                    }}>
                                        <span style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</span>
                                        <span style={{ fontSize: 11, color: '#000', fontWeight: 600 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div style={{ marginTop: 20 }}>
                                {['Note (1)', 'Launched (1)', 'Timeline', 'Opportunities (2)'].map((tab, i) => (
                                    <div key={i} style={{
                                        fontSize: 12,
                                        color: i === 0 ? '#000' : '#6b7280',
                                        padding: '8px 0',
                                        fontWeight: i === 0 ? 600 : 400,
                                    }}>
                                        {tab}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Notch */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 120,
                    height: 28,
                    background: '#000',
                    borderRadius: '0 0 16px 16px',
                    pointerEvents: 'none',
                }} />
            </div>

            {/* Notification Card Overlay */}
            <div
                style={{
                    position: 'absolute',
                    left: '18%',
                    top: '30%',
                    transform: `translateY(${(1 - entrance) * 30}px)`,
                    opacity: entrance,
                    background: 'white',
                    borderRadius: 16,
                    padding: '16px 20px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    minWidth: 300,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>PIPELINE</span>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>Thu</span>
                </div>
                <div style={{ fontSize: 13, color: '#000', lineHeight: 1.5 }}>
                    <span style={{ color: '#3b82f6', fontWeight: 700 }}>MayerLTD</span> seems stuck in Technical Review. Avg is 13d. This is at 27d.
                </div>
            </div>

            {/* CTA Text */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '50%',
                    transform: `translateX(-50%) translateY(${(1 - entrance) * 20}px)`,
                    opacity: entrance,
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                }}
            >
                <h2 style={{
                    fontSize: 48,
                    fontWeight: 900,
                    color: mainTextColor || 'white',
                    margin: 0,
                    textShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}>
                    {ctaText}
                </h2>
                {ctaUrl && (
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 20px',
                        borderRadius: 20,
                        color: '#94a3b8',
                        fontSize: 14,
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                    }}>
                        {ctaUrl}
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};
