import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// Interfaces
interface Slot5TrustProps {
    logos?: string[]; 
    sectionTitle?: string;
    accentColor?: string;
}

// Sample Feedback Data based on Reference Images
const FEEDBACK_ITEMS = [
    { text: "Premium subscription is too expensive", urgency: 'Low', icon: '💎', xOffset: 0 },
    { text: "Shipping delays, Europe", urgency: 'High', icon: '🚨', xOffset: 20 },
    { text: "Users want more scheduling functionality", urgency: 'Low', icon: '📅', xOffset: -10 },
    { text: "Is there an Android app?", urgency: 'Low', icon: '❓', xOffset: 15 },
    { text: "Easy to use app, great features", urgency: 'Low', icon: '💜', xOffset: -20 },
    { text: "Watch and phone keep unpairing", urgency: 'High', icon: '⌚', xOffset: 10 },
    { text: "Can I export my data from the app?", urgency: 'Low', icon: '📤', xOffset: 0 },
    { text: "Users frustrated with app bugs", urgency: 'High', icon: '🐛', xOffset: -15 },
    { text: "Instrusive ads are annoying", urgency: 'High', icon: '📢', xOffset: 25 },
    { text: "Set up is very easy", urgency: 'Low', icon: '✨', xOffset: -5 },
];

export const Slot5Trust: React.FC<Slot5TrustProps> = ({
    accentColor = '#8b5cf6' 
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', // Very light purple backdrop
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            perspective: '2000px', // Deep perspective for 3D feel
            overflow: 'hidden'
        }}>
            
            {/* Central Subject Placeholder (Optional, can be removed if user wants just text, 
                but reference shows a person. We'll use a subtle silhouette or just focus on the ring) */}
            <div style={{
                position: 'absolute',
                width: '100px', height: '300px',
                background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)',
                borderRadius: '50px',
                opacity: 0.1, // Subtle ghost/placeholder
                filter: 'blur(20px)',
                zIndex: 0
            }} />

            {/* 3D Cylinder Container */}
            <div style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {FEEDBACK_ITEMS.map((item, i) => {
                    // Cylinder Logic
                    const totalItems = FEEDBACK_ITEMS.length;
                    const angleStep = (Math.PI * 2) / totalItems;
                    const currentAngle = angleStep * i + (frame / 200); // Rotate continuously
                    
                    const radius = 500; // Large radius
                    const x = Math.sin(currentAngle) * radius;
                    const z = Math.cos(currentAngle) * radius - 200; // Pull back slightly
                    
                    // Staggered Y Pattern (Helix-ish)
                    const y = (i % 3 - 1) * 120 + item.xOffset; // -120, 0, 120

                    // Opacity based on Z (fade back items)
                    const opacity = interpolate(z, [-700, 300], [0.2, 1]);
                    const scale = interpolate(z, [-700, 300], [0.6, 1]);
                    
                    // Entrance
                    const entrance = spring({ frame: frame - (i * 5), fps, from: 0, to: 1, config: { damping: 15 } });

                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale * entrance})`,
                            opacity: opacity * entrance,
                            background: 'white',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            minWidth: '280px',
                            border: item.urgency === 'High' ? '1px solid #fee2e2' : '1px solid white'
                        }}>
                             {/* Icon */}
                             <div style={{ fontSize: '20px' }}>{item.icon}</div>
                             
                             {/* Content */}
                             <div style={{ flex: 1 }}>
                                 <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                     {item.text}
                                 </div>
                             </div>

                             {/* Urgency Badge */}
                             <div style={{
                                 fontSize: '10px', fontWeight: 700,
                                 padding: '4px 8px', borderRadius: '8px',
                                 background: item.urgency === 'High' ? '#fee2e2' : '#f1f5f9',
                                 color: item.urgency === 'High' ? '#dc2626' : '#64748b',
                                 border: item.urgency === 'High' ? '1px solid #fecaca' : 'none'
                             }}>
                                 {item.urgency}
                             </div>
                        </div>
                    );
                })}
            </div>

        </AbsoluteFill>
    );
};
