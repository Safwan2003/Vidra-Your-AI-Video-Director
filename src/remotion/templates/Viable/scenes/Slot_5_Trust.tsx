import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface Slot5TrustProps {
    logos: string[]; // URLs
}

export const Slot5Trust: React.FC<Slot5TrustProps> = ({ logos }) => {
    const frame = useCurrentFrame();

    // Subtle drift
    const drift = interpolate(frame, [0, 100], [0, -50]);

    return (
        <AbsoluteFill className="bg-slate-950 flex flex-col items-center justify-center">
            <h2
                className="text-4xl font-bold text-white mb-16"
                style={{ opacity: Math.min(frame / 20, 1) }}
            >
                Trusted by Industry Leaders
            </h2>

            <div className="flex gap-16 items-center overflow-visible" style={{ transform: `translateX(${drift}px)` }}>
                {logos.map((logo, i) => (
                    <div
                        key={i}
                        className="bg-white/10 p-8 rounded-xl backdrop-blur-sm"
                        style={{
                            width: '200px',
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Placeholder for Logo */}
                        <div className="text-white font-mono">{logo}</div>
                    </div>
                ))}
            </div>
        </AbsoluteFill>
    );
};
