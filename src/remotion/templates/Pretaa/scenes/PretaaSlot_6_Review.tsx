import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const PretaaSlot6Review = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Scale animation for the star
    const scale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 100 } });
    const rotate = interpolate(frame, [10, 40], [-90, 0]);

    return (
        <AbsoluteFill style={{
            background: '#0f172a', // Deep Dark Blue
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Center Star - Double Outline Style */}
            <div style={{
                transform: `scale(${scale}) rotate(${rotate}deg)`,
                position: 'relative'
            }}>
                <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    {/* Outer Star */}
                    <path d="M50 2L61.2 36.6H98L69 58L80 93L50 72L20 93L31 58L2 36.6H38.8L50 2Z" fill="white" stroke="none" />

                    {/* Inner Outline - Creating the 'Star in Star' look by using stroke offset or a second path */}
                    {/* Actually the reference 6(10).jpg shows a WHITE FILLED STAR with a secondary stroke outline slightly offset or inside. 
                       Let's do a simple Filled White Star with a larger Stroke around it? 
                       Or actually a 'Star within a Star' outline? 
                       Looking at 6(10).jpg again... it's a White Star with an inner dark line? Or a double border.
                   */}
                    <path d="M50 15 L57 38 L82 38 L62 53 L70 77 L50 63 L30 77 L38 53 L18 38 L43 38 Z" fill="none" stroke="#0f172a" strokeWidth="2" />
                </svg>
            </div>
        </AbsoluteFill>
    );
};
