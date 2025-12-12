import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// Simple pulsing circle component
const PulseCircle: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
    const frame = useCurrentFrame();
    const scale = (frame - delay) > 0 ? 1 + (Math.sin((frame - delay) / 10) * 0.1) : 0;
    const opacity = (frame - delay) > 0 ? 0.3 - (Math.abs(Math.sin((frame - delay) / 10)) * 0.1) : 0;

    return (
        <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '200px', height: '200px', borderRadius: '50%',
            border: `2px solid ${color}`, opacity, scale: scale
        }} />
    );
};

export const Slot2Transition: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const red = '#ef4444';
    const orange = '#f97316';

    const aiScale = spring({ frame, fps, config: { damping: 15 } });
    const nlpScale = spring({ frame: frame - 15, fps, config: { damping: 15 } });

    return (
        <AbsoluteFill style={{
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Connecting Beam */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '400px', height: '4px',
                background: `linear-gradient(90deg, ${red}, ${orange})`,
                opacity: 0.2
            }} />

            {/* Moving Particle on Beam */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '12px', height: '12px', borderRadius: '50%', background: '#7c3aed',
                boxShadow: '0 0 10px #7c3aed',
                transform: `translate(calc(-50% + ${Math.sin(frame / 20) * 200}px), -50%)`,
                zIndex: 5
            }} />

            <div style={{ display: 'flex', gap: '250px', zIndex: 10 }}>
                {/* AI Node */}
                <div style={{ transform: `scale(${aiScale})`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <PulseCircle color={red} delay={0} />
                    <div style={{
                        width: '140px', height: '140px', borderRadius: '50%',
                        background: 'white', border: `6px solid ${red}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 20px 40px ${red}30`, zIndex: 2
                    }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={red} strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><path d="M12 2v20 M2 12h20" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Artificial<br /><span style={{ color: red }}>Intelligence</span></div>
                </div>

                {/* NLP Node */}
                <div style={{ transform: `scale(${nlpScale})`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <PulseCircle color={orange} delay={15} />
                    <div style={{
                        width: '140px', height: '140px', borderRadius: '50%',
                        background: 'white', border: `6px solid ${orange}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 20px 40px ${orange}30`, zIndex: 2
                    }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={orange} strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>Natural<br /><span style={{ color: orange }}>Language</span></div>
                </div>
            </div>

        </AbsoluteFill>
    );
};
