import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// Interfaces
interface SourceItem {
    id: string;
    title: string;
    subtitle?: string; // e.g. "Customer Experience"
    iconType: 'product' | 'star' | 'chat' | 'megaphone';
    color: string;
    x: number; // Horizontal position percent
}

// Icons
const Icons = {
    product: () => ( // T-shirt / Product Icon
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.4a2 2 0 0 0-1.93-1.4H5.55A2 2 0 0 0 3.62 3.4l-1.6 8A2 2 0 0 0 4 14h16a2 2 0 0 0 1.98-2.6l-1.6-8z" />
            <path d="M12 2v20" opacity="0.5" />
        </svg>
    ),
    star: () => ( // Customer Experience
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    chat: () => ( // Employee Engagement
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    ),
    megaphone: () => ( // Marketing
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    )
};

const DATA_SOURCES: SourceItem[] = [
    { id: 'prod', title: 'Product', iconType: 'product', color: '#ef4444', x: 20 },
    { id: 'cx', title: 'Customer', subtitle: 'Experience', iconType: 'star', color: '#f59e0b', x: 40 },
    { id: 'emp', title: 'Employee', subtitle: 'Engagement', iconType: 'chat', color: '#8b5cf6', x: 60 },
    { id: 'mkt', title: 'Marketing', iconType: 'megaphone', color: '#a855f7', x: 80 },
];

interface FeatureItem {
    title: string;
    subtitle?: string;
    icon?: string;
    color?: string;
}

interface Slot4FeaturesProps {
    features?: Array<{ title: string; description: string; subtitle?: string; color?: string; }>; // Expanded to match VideoScene
    sectionTitle?: string;
    accentColor?: string;
}

export const Slot4Features: React.FC<Slot4FeaturesProps> = ({
    features = [],
    sectionTitle,
    accentColor = '#a855f7'
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Default Fallback
    const defaultFeatures = [
        { id: 'prod', title: 'Product', iconType: 'product', color: '#ef4444', x: 20 },
        { id: 'cx', title: 'Customer', subtitle: 'Experience', iconType: 'star', color: '#f59e0b', x: 40 },
        { id: 'emp', title: 'Employee', subtitle: 'Engagement', iconType: 'chat', color: '#8b5cf6', x: 60 },
        { id: 'mkt', title: 'Marketing', iconType: 'megaphone', color: '#a855f7', x: 80 },
    ];

    // Merge/Map dynamic features to layout
    const displayItems = features.length > 0 ? features.map((f, i) => ({
        id: `feat-${i}`,
        title: f.title,
        subtitle: f.subtitle || f.description, // HANDLE BOTH CASES
        iconType: 'star', // Default icon for dynamic content for now
        color: f.color || accentColor,
        x: 20 + (i * 20) // Distribute: 20, 40, 60, 80...
    })) : defaultFeatures;

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)', // Light Purple/Pink plain BG
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '1200px' }}>

                {/* Section Title if provided */}
                {sectionTitle && (
                    <div style={{
                        position: 'absolute', top: '150px', width: '100%', textAlign: 'center',
                        fontSize: '40px', fontWeight: 800, color: '#1e293b', zIndex: 20
                    }}>
                        {sectionTitle}
                    </div>
                )}

                {/* SVG Connections Layer (Behind icons) */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                    {displayItems.map((item: any, i: number) => {
                        const startX = 600;
                        const startY = 1000;
                        const endX = (item.x / 100) * 1200;
                        const endY = 400;
                        const cp1X = startX;
                        const cp1Y = 800;
                        const cp2X = endX;
                        const cp2Y = 600;
                        const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
                        const pathDelay = 15 + i * 10;
                        const draw = interpolate(frame - pathDelay, [0, 40], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

                        return (
                            <g key={item.id}>
                                <path d={d} stroke={item.color} strokeWidth="12" fill="none" opacity="0.2" strokeLinecap="round"
                                    strokeDasharray={1500} strokeDashoffset={(1 - draw) * 1500} style={{ filter: 'blur(8px)' }} />
                                <path d={d} stroke={item.color} strokeWidth="6" fill="none" strokeLinecap="round"
                                    strokeDasharray={1500} strokeDashoffset={(1 - draw) * 1500} />
                                {draw > 0 && draw < 1 && (
                                    <circle r="6" fill="white" style={{ offsetPath: `path('${d}')`, offsetDistance: `${draw * 100}%` }} />
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Icons Layer */}
                {displayItems.map((item: any, i: number) => {
                    const delay = 40 + i * 8;
                    const scale = spring({ frame: frame - delay, fps, from: 0, to: 1, config: { damping: 12 } });
                    const yOffset = Math.sin((frame - delay) / 40) * 10;

                    const IconComp = Icons[item.iconType as keyof typeof Icons] || Icons.star;

                    return (
                        <div key={item.id} style={{
                            position: 'absolute',
                            left: `${item.x}%`,
                            top: '400px',
                            transform: `translate(-50%, -50%) translateY(${yOffset}px) scale(${scale})`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                            zIndex: 10
                        }}>
                            <div style={{
                                width: '100px', height: '100px',
                                borderRadius: '50%',
                                background: item.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 20px 40px -10px ${item.color}80`,
                                color: 'white'
                            }}>
                                <div style={{ width: '48px', height: '48px' }}>
                                    <IconComp />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', color: '#1e293b' }}>
                                <div style={{ fontSize: '20px', fontWeight: 700 }}>{item.title}</div>
                                {item.subtitle && (
                                    <div style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>{item.subtitle}</div>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        </AbsoluteFill>
    );
};
