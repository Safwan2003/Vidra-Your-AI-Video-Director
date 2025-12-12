import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MousePointer2 } from 'lucide-react';
import { svgPathProperties } from 'svg-path-properties';
import { UIChoreography } from '../../../types';

interface CursorProps {
    start?: { x: number, y: number };
    end?: { x: number, y: number };
    durationInFrames?: number;
    clickAtFrame?: number;
    choreography?: UIChoreography;
}

export const Cursor: React.FC<CursorProps> = ({
    start = { x: 800, y: 800 },
    end = { x: 600, y: 450 },
    durationInFrames = 60,
    clickAtFrame = 45,
    choreography
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames: sceneDuration } = useVideoConfig();

    // --- AGENTIC LOGIC ---
    // If choreography is provided, it completely overrides the legacy start/end logic
    const agentPoint = useMemo(() => {
        if (!choreography || !choreography.cursorPath || !choreography.cursorPath.length) return null;

        const sorted = [...choreography.cursorPath].sort((a, b) => a.frame - b.frame);

        // Map % values (0-100) to actual pixels
        const frames = sorted.map(p => (p.frame / 100) * sceneDuration);
        const xValues = sorted.map(p => (p.x / 100) * width);
        const yValues = sorted.map(p => (p.y / 100) * height);

        const x = interpolate(frame, frames, xValues, {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
        });
        const y = interpolate(frame, frames, yValues, {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
        });

        return { x, y };
    }, [choreography, frame, width, height, sceneDuration]);

    // Check for "click" actions in choreography
    const agentClickActive = useMemo(() => {
        if (!choreography) return false;
        // Find if any click action just happened (within last 10 frames)
        return choreography.actions.some(action => {
            if (action.type !== 'click') return false;
            const actionFrame = (action.frame / 100) * sceneDuration;
            return frame >= actionFrame && frame < actionFrame + 10;
        });
    }, [choreography, frame, sceneDuration]);

    // --- LEGACY LOGIC ---
    const legacyPathD = useMemo(() => {
        const cx = (start.x + end.x) / 2 + (Math.random() > 0.5 ? 100 : -100);
        const cy = (start.y + end.y) / 2 - 100;
        return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
    }, [start.x, start.y, end.x, end.y]);

    const legacyProperties = useMemo(() => new svgPathProperties(legacyPathD), [legacyPathD]);

    // Determine Point
    let point = { x: 0, y: 0 };
    if (agentPoint) {
        point = agentPoint;
    } else {
        const length = legacyProperties.getTotalLength();
        const progress = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });
        point = legacyProperties.getPointAtLength(progress * length);
    }

    // Determine Click State
    const isClicking = choreography
        ? agentClickActive
        : (frame >= clickAtFrame && frame < clickAtFrame + 20);

    // Ripple Animation
    // For Agentic, we simplify ripple to just "exists" when clicking for now, or use modulo
    const rippleScale = isClicking ? 2.5 : 1;
    const rippleOpacity = isClicking ? interpolate(frame % 10, [0, 10], [0.8, 0]) : 0;

    // Click press effect
    const clickScale = isClicking ? 0.8 : 1;

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translateX(${point.x}px) translateY(${point.y}px)`,
                pointerEvents: 'none',
                zIndex: 100
            }}
        >
            {/* Ripple Effect */}
            {isClicking && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '-20px',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        transform: `scale(${rippleScale})`,
                        opacity: rippleOpacity
                    }}
                />
            )}

            {/* Cursor SVG */}
            <div style={{ transform: `scale(${clickScale})` }}>
                <MousePointer2
                    size={32}
                    className="text-white drop-shadow-md"
                    fill="black"
                    style={{
                        transform: 'rotate(-10deg)'
                    }}
                />
            </div>
        </div>
    );
};
