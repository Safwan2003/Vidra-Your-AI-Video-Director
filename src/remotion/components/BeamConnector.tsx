import React from 'react';
import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

interface Point {
    x: number;
    y: number;
}

interface BeamConnectorProps {
    start: Point;
    end: Point;
    color?: string;
    delay?: number;
    duration?: number;
}

export const BeamConnector: React.FC<BeamConnectorProps> = ({
    start,
    end,
    color = '#3b82f6',
    delay = 0,
    duration = 30
}) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Calculate progress (0 to 1)
    const progress = interpolate(frame - delay, [0, duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    // Gradient ID
    const gradientId = `beam-gradient-${x1}-${y1}-${x2}-${y2}`;

    // Calculate length for dashoffset animation
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 15 // Between UI layers
            }}
        >
            <defs>
                <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
                    <stop offset="0%" stopColor={color} stopOpacity="0" />
                    <stop offset="50%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Base Line (faint) */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeOpacity="0.1"
                strokeWidth="2"
                strokeDasharray="4 4"
            />

            {/* Animated Beam Pulse */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`url(#${gradientId})`}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={length}
                strokeDashoffset={length * (1 - progress)} // This logic needs refinement for a "shooting" beam
                style={{
                    // Better approach: Move the line or mask it
                    // Let's us mask approach for a shooting beam
                }}
            />

            {/* Simple Moving Dot */}
            <circle r="3" fill="white" filter="url(#glow)">
                <animateMotion
                    dur={`${duration / 30}s`}
                    repeatCount="indefinite"
                    path={`M${x1},${y1} L${x2},${y2}`}
                    begin={`${delay / 30}s`}
                />
            </circle>

        </svg>
    );
};
