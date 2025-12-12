export const ARCHETYPES = {
    neo_glass: {
        name: "Neo-Glass",
        description: "Dark, premium, glowing edges, frosted glass UI elements.",
        colors: ['#0f172a', '#38bdf8', '#818cf8', '#ffffff'],
        particles: ['glow_orbs', 'digital_rain'],
        camera: "smooth, floating, cinematic orbit",
        prompt_modifier: "Cyberpunk aesthetic but clean for SaaS. Dark background. Glowing blue/purple accents. Glassmorphism everywhere."
    },
    kinetic_typo: {
        name: "Kinetic Typo",
        description: "High energy, massive text, fast cuts, glitch effects.",
        colors: ['#000000', '#ffffff', '#ef4444', '#fbbf24'],
        particles: ['speed_lines', 'confetti'],
        camera: "snappy, fast zooms, crash zooms",
        prompt_modifier: "Swiss design style. Giant bold typography. High contrast. Fast motion. Stomp graphics style."
    },
    isometric_world: {
        name: "Isometric World",
        description: "Clean, bright, 3D orthographic view, perfect geometry.",
        colors: ['#f8fafc', '#ec4899', '#6366f1', '#cbd5e1'],
        particles: ['floating_cubes', 'grid_lines'],
        camera: "isometric fixed angle, smooth pans",
        prompt_modifier: "3D Isometric render. Claymorphism or clean web 3D style. Soft shadows. Bright studio lighting."
    }
} as const;

export const NARRATIVE_FRAMEWORKS = {
    saas_standard: {
        name: "The SaaS Standard",
        beats: [
            { stage: "Hook", description: "The Problem / The 'Before' State. 4s max." },
            { stage: "Empathy", description: "Agitate the pain. Show why current solutions fail. 5s." },
            { stage: "Response", description: "Introduce the Product as the Hero. 3D Reveal. 5s." },
            { stage: "Overcome", description: "Key Feature/Benefit Blitz. Fast pace. 10s." },
            { stage: "Outcome", description: "The transformed 'After' state + CTA. 6s." }
        ]
    },
    hype_cycle: {
        name: "The Hype Cycle",
        beats: [
            { stage: "Hook", description: "Tease the future. glitched visuals. 3s." },
            { stage: "Empathy", description: "Build anticipation. 'Are you ready?'. 3s." },
            { stage: "Response", description: "DROP. The Product reveal with impact. 4s." },
            { stage: "Overcome", description: "Feature 1, Feature 2, Feature 3. Rapid fire. 12s." },
            { stage: "Outcome", description: "Social Proof / Trusted by / Join Now. 8s." }
        ]
    },
    visionary: {
        name: "The Visionary",
        beats: [
            { stage: "Hook", description: "The Old World. Monochromatic. 5s." },
            { stage: "Empathy", description: "The Shift in the market. 5s." },
            { stage: "Response", description: "Our Philosophy/Solution. 6s." },
            { stage: "Overcome", description: "How it works (High level). 8s." },
            { stage: "Outcome", description: "The Future is here. 6s." }
        ]
    }
} as const;
