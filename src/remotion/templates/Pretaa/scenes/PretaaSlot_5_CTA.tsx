import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img } from 'remotion';

// Bezier Curve Logic
const getBezierPoint = (t: number, p0: any, p1: any, p2: any, p3: any) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;
    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;
    const x = ax * t * t * t + bx * t * t + cx * t + p0.x;
    const y = ay * t * t * t + by * t * t + cy * t + p0.y;
    return { x, y };
};

// Milestone Dot
const Milestone = ({ x, y, delay, active }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
    if (frame < delay) return null;
    return (
        <div style={{
            position: 'absolute', left: x, top: y,
            width: 16, height: 16, borderRadius: '50%',
            background: '#1e293b',
            transform: `translate(-50%, -50%) scale(${scale})`,
            zIndex: 5
        }} />
    );
};

// Notification Card with Timestamp
const JourneyCard = ({ x, y, text, title, sub, delay, direction = 'top' }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame: frame - delay, fps, config: { damping: 14 } });

    if (frame < delay) return null;

    return (
        <div style={{
            position: 'absolute', left: x, top: y,
            transform: `translate(-50%, ${direction === 'top' ? '-130%' : '30%'}) scale(${scale})`,
            zIndex: 4
        }}>
            <div style={{
                background: 'white', padding: '16px 20px', borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', minWidth: 260,
                display: 'flex', flexDirection: 'column', gap: 4,
                border: '1px solid #f1f5f9'
            }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{sub}</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 500 }}>Now</span>
                </div>

                {/* Title & Text */}
                <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, lineHeight: 1.3 }}>
                    <span style={{ color: '#3b82f6' }}>{title}</span> {text}
                </div>
            </div>

            {/* Dashed Connector */}
            <div style={{
                position: 'absolute', left: '50%',
                top: direction === 'top' ? '100%' : '0',
                height: 40, width: 0,
                borderLeft: '2px dashed #cbd5e1',
                transform: direction === 'top' ? 'translateY(-10px)' : 'translateY(-30px)',
                zIndex: -1
            }} />
        </div>
    );
};

export const PretaaSlot5CTA = ({ title }: { title?: string }) => {
    const frame = useCurrentFrame();

    // Path Points (Scaled to match 5(10).jpg wave)
    const p0 = { x: 0, y: 800 };
    const p1 = { x: 600, y: 800 };
    const p2 = { x: 1000, y: 300 };
    const p3 = { x: 1920, y: 300 };

    const progress = interpolate(frame, [10, 150], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
    const pos = getBezierPoint(progress, p0, p1, p2, p3);

    // Milestones
    const m1 = getBezierPoint(0.25, p0, p1, p2, p3); // Stuck
    const m2 = getBezierPoint(0.65, p0, p1, p2, p3); // Acquired

    return (
        <AbsoluteFill style={{ background: '#f8fafc', overflow: 'hidden' }}>
            {/* Ambient Gradients - Blue/Red spots */}
            <div style={{ position: 'absolute', top: -200, left: -200, width: 800, height: 800, background: 'rgba(239, 68, 68, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -200, right: -200, width: 1000, height: 1000, background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />

            {/* Path */}
            <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible' }}>
                <path d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 8" />
                <path d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`} fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="2000" strokeDashoffset={interpolate(progress, [0, 1], [2000, 0])} strokeLinecap="round" />
            </svg>

            {/* Milestones & Cards */}
            <Milestone x={m1.x} y={m1.y} delay={40} active={progress > 0.25} />
            <JourneyCard
                x={m1.x} y={m1.y} delay={45} direction="top" sub="ONBOARDING"
                title="Prospect is Stuck" text="Braun Inc is not yet operational. Avg is 15d."
            />

            <Milestone x={m2.x} y={m2.y} delay={90} active={progress > 0.65} />
            <JourneyCard
                x={m2.x} y={m2.y} delay={95} direction="top" sub="IN THE NEWS"
                title="Dynamite" text="has just been acquired by Long Game Capital Inc."
            />

            {/* Avatar Head moving */}
            <div style={{
                position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)', zIndex: 10
            }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <Img src="https://img.freepik.com/free-photo/young-woman-with-round-glasses-yellow-sweater_273609-7091.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};
