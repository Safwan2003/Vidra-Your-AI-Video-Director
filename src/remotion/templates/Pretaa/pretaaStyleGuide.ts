// Pretaa Template - Professional Style Guide
import { Easing } from 'remotion';

export const createPretaaColorPalette = (accentColor: string) => ({
    // Background - Dark tech theme
    background: {
        start: '#0f172a',  // Slate 900
        mid: '#1e293b',    // Slate 800
        end: '#334155'     // Slate 700
    },

    // Accent Colors (tech blue/purple)
    accent: {
        primary: accentColor,
        light: `${accentColor}dd`,
        glow: `${accentColor}60`,
        subtle: `${accentColor}20`,
        dark: `${accentColor}cc`
    },

    // Isometric Grid Colors
    grid: {
        primary: 'rgba(59, 130, 246, 0.1)',   // Blue
        secondary: 'rgba(139, 92, 246, 0.1)', // Purple
        lines: 'rgba(255, 255, 255, 0.05)'
    },

    // Glass/Card Elements
    glass: {
        background: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        blur: 16,
        shadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    },

    // Typography
    text: {
        primary: '#f8fafc',    // Slate 50
        secondary: '#cbd5e1',  // Slate 300
        accent: accentColor,
        muted: '#64748b'       // Slate 500
    },

    // Isometric Cube Colors
    cube: {
        top: accentColor,
        left: `${accentColor}cc`,
        right: `${accentColor}99`
    }
});

export const PRETAA_COLORS = createPretaaColorPalette('#3b82f6');

export const PRETAA_TYPOGRAPHY = {
    fontFamily: "'Space Grotesk', 'Inter', -apple-system, sans-serif",

    sizes: {
        hero: { size: 88, weight: 800, letterSpacing: '-2px' },
        headline: { size: 64, weight: 700, letterSpacing: '-1.5px' },
        title: { size: 48, weight: 700, letterSpacing: '-1px' },
        subtitle: { size: 24, weight: 600, letterSpacing: '0' },
        body: { size: 16, weight: 500, letterSpacing: '0.3px' },
        small: { size: 12, weight: 600, letterSpacing: '1px' }
    }
};

export const PRETAA_ANIMATIONS = {
    spring: {
        // Snappier springs for geometric feel
        snap: { damping: 25, mass: 0.8, stiffness: 250 },
        bounce: { damping: 12, mass: 0.6, stiffness: 180 },
        smooth: { damping: 20, mass: 1.0, stiffness: 120 },
        cube: { damping: 18, stiffness: 150 }
    },
    easing: {
        entrance: Easing.out(Easing.cubic),
        exit: Easing.in(Easing.cubic),
        bounce: Easing.out(Easing.back(1.5))
    },

    stagger: {
        letters: 2,    // Faster letter stagger
        cubes: 8,      // Isometric cubes
        cards: 12,     // Feature cards
        elements: 6    // UI elements
    },

    // Isometric rotation angles (degrees)
    isometric: {
        rotateX: 35.264,  // Standard isometric angle
        rotateY: 45,
        rotateZ: 0
    }
};

export const PRETAA_EFFECTS = {
    // Neon glow for tech aesthetic
    neonGlow: (color: string, intensity = 0.6) =>
        `0 0 20px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, ` +
        `0 0 40px ${color}${Math.round(intensity * 0.5 * 255).toString(16).padStart(2, '0')}`,

    // Isometric shadow
    isoShadow: (color: string) =>
        `4px 4px 0 ${color}20, 8px 8px 0 ${color}10`,

    // Card shadow with depth
    cardShadow: (color: string) =>
        `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px ${color}15`,

    // Grid pattern background
    gridPattern: (color: string) =>
        `repeating-linear-gradient(0deg, ${color}05 0px, transparent 1px, transparent 40px), ` +
        `repeating-linear-gradient(90deg, ${color}05 0px, transparent 1px, transparent 40px)`,

    // Gradient for isometric faces
    isoGradient: (color: string, face: 'top' | 'left' | 'right') => {
        switch (face) {
            case 'top':
                return `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
            case 'left':
                return `linear-gradient(225deg, ${color}cc 0%, ${color}99 100%)`;
            case 'right':
                return `linear-gradient(315deg, ${color}99 0%, ${color}66 100%)`;
        }
    }
};

// Isometric transform helper
export const isometricTransform = (x: number, y: number, z: number) => {
    const { rotateX, rotateY } = PRETAA_ANIMATIONS.isometric;
    return `
        translateX(${x}px) 
        translateY(${y}px) 
        translateZ(${z}px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
    `;
};
