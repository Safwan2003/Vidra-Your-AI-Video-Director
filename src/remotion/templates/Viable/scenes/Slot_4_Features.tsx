import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { DarkGlassCard } from '../../../components/GlassCard';
import { staggerChildren } from '../../../utils/stagger';

interface Slot4FeaturesProps {
    features: { title: string, subtitle: string, icon?: string }[];
}

export const Slot4Features: React.FC<Slot4FeaturesProps> = ({ features }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill className="p-20 flex flex-wrap gap-8 justify-center items-center">
            {features.map((feature, i) => {
                const { opacity, translateY } = staggerChildren(frame, i, fps);

                return (
                    <DarkGlassCard
                        key={i}
                        className="flex flex-col text-white"
                        style={{
                            width: '400px',
                            height: '250px',
                            opacity,
                            transform: `translateY(${translateY}px)`,
                        }}
                    >
                        <div className="text-3xl font-bold mb-2">{feature.title}</div>
                        <div className="text-xl text-slate-300">{feature.subtitle}</div>
                    </DarkGlassCard>
                );
            })}
        </AbsoluteFill>
    );
};
