import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// --- ICONS ---
const Icons = {
    Back: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>,
    ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
};

// --- BACKGROUND DASHBOARD (Blurred) ---
const DashboardBackground = () => {
    // Structural representation of the blurred dashboard
    return (
        <div style={{
            position: 'absolute', top: '10%', bottom: '10%', left: '5%', right: '35%',
            background: '#f8fafc',
            borderRadius: 24,
            boxShadow: '0 50px 100px rgba(0,0,0,0.2)',
            display: 'flex', overflow: 'hidden',
            filter: 'blur(3px)', opacity: 0.8,
            transform: 'perspective(1000px) rotateY(5deg) scale(0.95)'
        }}>
            {/* Sidebar */}
            <div style={{ width: 220, background: '#3b82f6', padding: 30, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ width: 80, height: 20, background: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ width: '100%', height: 12, background: i === 2 ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: 4, opacity: i === 2 ? 1 : 0.6 }} />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 150, height: 24, background: '#cbd5e1', borderRadius: 4 }} />
                    <div style={{ width: 100, height: 24, background: '#e2e8f0', borderRadius: 4 }} />
                </div>
                {/* Data Grid Rows */}
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: 20 }}>
                        <div style={{ flex: 1, height: 40, background: '#f1f5f9', borderRadius: 8 }} />
                        <div style={{ flex: 1, height: 40, background: '#f1f5f9', borderRadius: 8 }} />
                        <div style={{ flex: 1, height: 40, background: '#f1f5f9', borderRadius: 8 }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- FOREGROUND PHONE CARD ---
const PhoneCard = ({ delay }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const y = spring({ frame: frame - delay, fps, config: { damping: 15 } });

    return (
        <div style={{
            position: 'absolute', right: '12%', top: '50%',
            transform: `translate(0, calc(-50% + ${(1 - y) * 100}px))`,
            width: 380, height: 720,
            background: 'white', borderRadius: 48,
            boxShadow: '0 40px 120px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            border: '8px solid white',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* Status Bar Area */}
            <div style={{ height: 40, display: 'flex', justifyContent: 'space-between', padding: '14px 24px 0', fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                <div>9:41</div>
                <div>Signal</div>
            </div>

            {/* App Header */}
            <div style={{ padding: '10px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 600, fontSize: 16 }}>
                    <Icons.Back /> Back
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: '12px 0 8px', color: '#0f172a' }}>Mayer LTD.</h1>
                <span style={{
                    background: '#1e1b4b', color: 'white',
                    padding: '6px 16px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.5px'
                }}>
                    PROSPECT
                </span>
            </div>

            {/* Info Grid */}
            <div style={{
                padding: '24px',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 12px'
            }}>
                <InfoField label="Primary Contact" value="Jaylon Calzoni" />
                <InfoField label="Company Rating" value={<Icons.Alert />} isIcon />
                <InfoField label="Industry" value="Distribution" />
                <InfoField label="Expected Close" value="06/06/21" />
                <InfoField label="Potential ARR" value="$120,000" bold />
                <InfoField label="Employees" value="1,200" />
            </div>

            <div style={{ height: 1, background: '#f1f5f9', margin: '0 24px' }} />

            {/* Action List */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ListItem text="Note" count={1} />
                <ListItem text="Launched" count={1} />
                <ListItem text="Timeline" />
                <ListItem text="Opportunities" count={2} />
            </div>

            {/* Home Indicator */}
            <div style={{ marginTop: 'auto', alignSelf: 'center', width: 120, height: 5, background: '#e2e8f0', borderRadius: 3, marginBottom: 10 }} />
        </div>
    );
};

const InfoField = ({ label, value, bold, isIcon }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: isIcon ? 20 : 16, color: bold ? '#0f172a' : '#334155', fontWeight: bold ? 800 : 600 }}>
            {value}
        </div>
    </div>
);

const ListItem = ({ text, count }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#334155' }}>
            {text} {count !== undefined && <span style={{ color: '#ef4444' }}>({count})</span>}
        </div>
        <Icons.ChevronRight />
    </div>
);

// --- PIPELINE NOTIFICATION FLOATING ---
const PipelineNotification = ({ delay }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
    const y = interpolate(frame, [delay, delay + 20], [20, 0], { easing: Easing.out(Easing.cubic) });

    return (
        <div style={{
            position: 'absolute', left: '15%', top: '65%',
            background: 'white', padding: '24px', borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            width: 400, opacity, transform: `translateY(${y}px)`,
            zIndex: 10
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>PIPELINE</span>
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>Thu</span>
            </div>
            <div style={{ fontSize: 18, color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
                <strong style={{ color: '#2563eb' }}>MayerLTD</strong> seems stuck in Technical Review. Avg is 13d. This is at 27d.
            </div>
        </div>
    );
};

export const PretaaSlot7Outro = ({ ctaText }: any) => {
    return (
        <AbsoluteFill style={{
            background: '#0f172a', // Dark background
            overflow: 'hidden',
            perspective: '1000px'
        }}>
            {/* Ambient Background Glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 10% 20%, rgba(37,99,235,0.15), transparent 60%)' }} />

            <DashboardBackground />
            <PhoneCard delay={15} />
            <PipelineNotification delay={40} />

        </AbsoluteFill>
    );
};
