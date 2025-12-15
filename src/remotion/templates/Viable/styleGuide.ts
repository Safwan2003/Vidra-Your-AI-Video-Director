// Viable Template - Visual Style Guide
// Dynamic color system - accent color comes from brand props

// Helper to generate color variants from an accent color
export const createColorPalette = (accentColor: string) => ({
    // Background Gradients (dark green theme)
    background: {
        start: '#071f18',
        mid: '#0a2920',
        end: '#0d3327'
    },

    // Accent Colors (derived from brand)
    accent: {
        primary: accentColor,
        light: `${accentColor}cc`,
        glow: `${accentColor}40`,
        subtle: `${accentColor}1a`
    },

    // Glass/UI Elements
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        blur: 20,
        shadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
    },

    // Typography
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.6)',
        accent: accentColor,
        muted: 'rgba(255, 255, 255, 0.4)'
    }
});

// Default palette with green accent
export const VIABLE_COLORS = createColorPalette('#22c55e');

export const VIABLE_TYPOGRAPHY = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    sizes: {
        hero: { size: 96, weight: 900, letterSpacing: '-3px' },
        headline: { size: 72, weight: 800, letterSpacing: '-2px' },
        title: { size: 56, weight: 800, letterSpacing: '-1px' },
        subtitle: { size: 28, weight: 600, letterSpacing: '0' },
        body: { size: 18, weight: 500, letterSpacing: '0' },
        small: { size: 14, weight: 600, letterSpacing: '1px' }
    }
};

export const VIABLE_ANIMATIONS = {
    spring: {
        gentle: { damping: 20, mass: 1.0, stiffness: 100 },
        snappy: { damping: 15, mass: 0.5, stiffness: 200 },
        bouncy: { damping: 10, mass: 0.8, stiffness: 150 },
        logo: { damping: 12, stiffness: 100 },
        card: { damping: 15, stiffness: 80 }
    },

    stagger: {
        letters: 3,   // frames between letters
        cards: 15,    // frames between cards
        elements: 10  // frames between elements
    }
};

export const VIABLE_EFFECTS = {
    glow: (color: string, intensity = 0.4) =>
        `0 0 60px ${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,

    cardShadow: (color: string) =>
        `0 20px 50px rgba(0, 0, 0, 0.3), 0 0 60px ${color}20`,

    gradientText: (color: string) =>
        `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
};
