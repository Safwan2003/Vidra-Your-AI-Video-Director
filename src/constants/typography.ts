/**
 * Professional Typography System
 * Inspired by "What a Story" agency standards
 */

export const TYPOGRAPHY_SYSTEM = {
    // Bold, impactful headlines
    headline: {
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(48px, 8vw, 96px)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        textTransform: 'none' as const,
    },

    // Secondary headlines
    subheadline: {
        fontFamily: "'Poppins', 'Inter', sans-serif",
        fontWeight: 600,
        fontSize: 'clamp(32px, 5vw, 64px)',
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
    },

    // Body text
    body: {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: 'clamp(16px, 2vw, 24px)',
        lineHeight: 1.6,
        letterSpacing: '0',
    },

    // Accent text (CTAs, labels)
    accent: {
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        fontSize: 'clamp(20px, 3vw, 32px)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        lineHeight: 1.4,
    },

    // Small text (captions, metadata)
    caption: {
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        fontSize: 'clamp(12px, 1.5vw, 18px)',
        lineHeight: 1.5,
        letterSpacing: '0.02em',
    },
};

/**
 * Font Pairings for Different Tones
 */
export const FONT_PAIRINGS = {
    professional: {
        headline: "'Inter', sans-serif",
        body: "'Inter', sans-serif",
    },
    modern: {
        headline: "'Space Grotesk', sans-serif",
        body: "'Inter', sans-serif",
    },
    friendly: {
        headline: "'Poppins', sans-serif",
        body: "'Inter', sans-serif",
    },
    luxury: {
        headline: "'Playfair Display', serif",
        body: "'Inter', sans-serif",
    },
};

/**
 * Text Effects for Kinetic Typography
 */
export const TEXT_EFFECTS = {
    glow: {
        textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
    },
    subtle_shadow: {
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    strong_shadow: {
        textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
    neon: {
        textShadow: `
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 0 30px currentColor,
      0 0 40px currentColor
    `,
    },
    depth: {
        textShadow: `
      1px 1px 0 rgba(0, 0, 0, 0.1),
      2px 2px 0 rgba(0, 0, 0, 0.1),
      3px 3px 0 rgba(0, 0, 0, 0.1),
      4px 4px 0 rgba(0, 0, 0, 0.1)
    `,
    },
};

/**
 * Animation Presets for Text
 */
export const TEXT_ANIMATIONS = {
    stagger_up: {
        initial: { opacity: 0, y: 100 },
        animate: { opacity: 1, y: 0 },
        staggerDelay: 0.05, // seconds between each word
    },
    stagger_scale: {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        staggerDelay: 0.03,
    },
    fade_in: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        staggerDelay: 0.02,
    },
    slide_right: {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        staggerDelay: 0.04,
    },
    elastic_bounce: {
        initial: { opacity: 0, scale: 0, rotate: -10 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        staggerDelay: 0.06,
    },
};

/**
 * Google Fonts to Load
 */
export const GOOGLE_FONTS = [
    'Inter:400,500,600,700,800,900',
    'Space+Grotesk:400,500,600,700',
    'Poppins:400,500,600,700,800',
    'Playfair+Display:400,500,600,700,800',
];

/**
 * Font Loading URL
 */
export const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map(
    (font) => `family=${font}`
).join('&')}&display=swap`;
