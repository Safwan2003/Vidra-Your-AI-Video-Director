import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// Premium Persona Bubble Component
const PersonaBubble: React.FC<{
    label: string;
    role: string;
    delay: number;
    x: number;
    y: number;
    color: string;
}> = ({ label, role, delay, x, y, color }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame: frame - delay,
        fps,
        from: 0,
        to: 1,
        config: { damping: 12, stiffness: 100 }
    });

    const floatY = Math.sin((frame - delay) / 30) * 8; // Slower float

    return (
        <div style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) scale(${scale}) translateY(${floatY}px)`,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 20px',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            zIndex: 10,
            border: '1px solid rgba(255,255,255,0.8)'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, #ffffff)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px'
            }}>
                {label.charAt(0)}
            </div>
            <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1f2937' }}>{label}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: color, textTransform: 'uppercase' }}>{role}</div>
            </div>
        </div>
    );
};

export const Slot1Problem: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Background Gradient Mesh */}
            <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '800px', height: '800px', background: '#e0f2fe', filter: 'blur(150px)', borderRadius: '50%', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '800px', height: '800px', background: '#ffe4e6', filter: 'blur(150px)', borderRadius: '50%', opacity: 0.6 }} />

            {/* Main Monitor Container (The "Chaos" Screen) */}
            <div style={{
                position: 'relative',
                width: '1100px',
                height: '650px',
                background: '#1e293b', // Dark mode for contrast
                borderRadius: '24px',
                boxShadow: '0 50px 100px -20px rgba(15, 23, 42, 0.5)',
                transform: `scale(${interpolate(frame, [0, 450], [0.95, 1])})`, // Slow zoom over 15s
                zIndex: 1,
                border: '8px solid #334155',
                overflow: 'hidden'
            }}>
                {/* Internal UI: The "Overload" Dashboard */}
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ width: '150px', height: '20px', background: '#334155', borderRadius: '4px' }} />
                        <div style={{ width: '40px', height: '40px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>99+</div>
                    </div>

                    {/* The Data Table (Simulating Volume) */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            background: '#0f172a',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            borderLeft: `4px solid ${i % 2 === 0 ? '#ef4444' : '#f59e0b'}` // Error/Warning colors
                        }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#334155' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ width: '60%', height: '10px', background: '#475569', borderRadius: '4px' }} />
                                <div style={{ width: '90%', height: '8px', background: '#334155', borderRadius: '4px' }} />
                            </div>
                            <div style={{
                                padding: '6px 12px',
                                background: i % 2 === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
                                fontSize: '12px', fontWeight: 'bold'
                            }}>
                                {i % 2 === 0 ? 'Urgent' : 'Review'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Red "Alert" Overlay - Pulsing */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'radial-gradient(circle, transparent 50%, rgba(239, 68, 68, 0.2) 100%)',
                    opacity: Math.abs(Math.sin(frame / 20)) * 0.5,
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Floating Personas "Speaking" - The Chaos */}
            <PersonaBubble label="Product Mgr" role="Needs Data" delay={15} x={15} y={30} color="#db2777" />
            <PersonaBubble label="Customer" role="Complaint" delay={30} x={85} y={25} color="#ef4444" />
            <PersonaBubble label="Marketing" role="Campaign" delay={45} x={10} y={70} color="#2563eb" />
            <PersonaBubble label="Support" role="Ticket #404" delay={60} x={90} y={65} color="#f59e0b" />
            <PersonaBubble label="Exec" role="Where's ROI?" delay={75} x={50} y={85} color="#059669" />

        </AbsoluteFill>
    );
};
