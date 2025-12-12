import React from 'react';
import { AbsoluteFill } from 'remotion';

interface GlassCardProps {
    children: React.ReactNode;
    blur?: number;
    opacity?: number;
    borderRadius?: number;
    padding?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Glassmorphism Card Component
 * Professional frosted glass effect for "What a Story" quality
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    blur = 10,
    opacity = 0.1,
    borderRadius = 16,
    padding = 24,
    className = '',
    style = {},
}) => {
    return (
        <div
            className={className}
            style={{
                background: `rgba(255, 255, 255, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                borderRadius: `${borderRadius}px`,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: `${padding}px`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Dark Glass Card (for dark backgrounds)
 */
export const DarkGlassCard: React.FC<GlassCardProps> = ({
    children,
    blur = 12,
    opacity = 0.15,
    borderRadius = 16,
    padding = 24,
    className = '',
    style = {},
}) => {
    return (
        <div
            className={className}
            style={{
                background: `rgba(15, 23, 42, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                borderRadius: `${borderRadius}px`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: `${padding}px`,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

/**
 * Glassmorphism Overlay (full screen)
 */
export const GlassOverlay: React.FC<{
    children: React.ReactNode;
    blur?: number;
    opacity?: number;
}> = ({ children, blur = 20, opacity = 0.05 }) => {
    return (
        <AbsoluteFill
            style={{
                background: `rgba(255, 255, 255, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
            }}
        >
            {children}
        </AbsoluteFill>
    );
};
