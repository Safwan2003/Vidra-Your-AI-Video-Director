// Viable Template - Visual Style Guide
// Extracted from "What a Story" Agency Reference Frames

export const VIABLE_COLORS = {
    // Background Gradients
    chaos: {
        start: '#1a0a2e', // Deep purple-black
        end: '#2d1b3d',   // Dark purple
        accent: '#ff3366' // Vibrant red for problem/chaos
    },
    order: {
        start: '#0a1628', // Deep navy
        end: '#1e3a5f',   // Medium blue
        accent: '#4a90e2' // Calm blue for solution
    },

    // 3D Materials
    clay: {
        base: '#e8d5c4',      // Warm beige/clay
        highlight: '#f5ebe0', // Light cream
        shadow: '#c4a68a',    // Darker tan
        roughness: 0.8,       // Matte finish
        metalness: 0.1        // Minimal shine
    },

    // UI Elements
    glass: {
        background: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.18)',
        blur: 20,
        shadow: '0 8px 32px rgba(0, 0, 0, 0.37)'
    },

    // Typography
    text: {
        primary: '#ffffff',
        secondary: '#b8c5d6',
        accent: '#ff3366',
        glow: 'rgba(255, 51, 102, 0.5)'
    }
};

export const VIABLE_TYPOGRAPHY = {
    // Font Stack
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    // Sizes (in px)
    hero: {
        size: 120,
        weight: 900,
        letterSpacing: '-0.04em',
        lineHeight: 0.9
    },
    problem: {
        size: 96,
        weight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.0
    },
    feature: {
        title: { size: 32, weight: 700 },
        subtitle: { size: 18, weight: 400 }
    }
};

export const VIABLE_ANIMATIONS = {
    // Spring Configs
    spring: {
        gentle: { damping: 20, mass: 1.0, stiffness: 100 },
        snappy: { damping: 15, mass: 0.5, stiffness: 200 },
        bouncy: { damping: 10, mass: 0.8, stiffness: 150 }
    },

    // Timing
    stagger: {
        text: 0.05,      // 50ms between letters
        cards: 0.1,      // 100ms between cards
        logos: 0.08      // 80ms between logos
    },

    // Easing
    easing: {
        smooth: [0.43, 0.13, 0.23, 0.96],
        elastic: [0.68, -0.55, 0.265, 1.55]
    }
};

export const VIABLE_CAMERA = {
    // 3D Camera Settings
    fov: 50,
    near: 0.1,
    far: 2000,

    // Positions
    hero: {
        position: [0, 2, 8],
        lookAt: [0, 0, 0],
        rotation: { x: -0.2, y: 0, z: 0 }
    },

    // Movement
    orbit: {
        speed: 0.3,
        radius: 8,
        height: 2
    }
};

export const VIABLE_LIGHTING = {
    // Three.js Lighting Setup
    ambient: {
        color: '#ffffff',
        intensity: 0.6
    },
    directional: {
        color: '#ffffff',
        intensity: 0.8,
        position: [5, 5, 5],
        castShadow: true
    },
    point: {
        color: '#4a90e2',
        intensity: 0.5,
        position: [-3, 3, 3]
    }
};

export const VIABLE_EFFECTS = {
    // Post-processing
    bloom: {
        strength: 0.3,
        radius: 0.5,
        threshold: 0.8
    },

    // Glitch (for problem scene)
    glitch: {
        duration: 0.1,
        strength: 0.3,
        frequency: 2
    },

    // Blur (for transitions)
    motionBlur: {
        samples: 8,
        intensity: 0.5
    }
};
