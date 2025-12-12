// src/remotion/templates/Viable/config.ts
// Modular Template Configuration
// This allows swapping intro/outro and customizing slot order

export interface TemplateSlotConfig {
    id: string;
    component: string; // Component name
    duration: number; // Duration in frames (30fps)
    enabled: boolean; // Can be toggled on/off
}

export interface ViableTemplateConfig {
    intro?: TemplateSlotConfig;
    slots: TemplateSlotConfig[];
    outro?: TemplateSlotConfig;
}

// Default Viable Template Configuration
export const DEFAULT_VIABLE_CONFIG: ViableTemplateConfig = {
    // Optional intro (can be swapped)
    intro: {
        id: 'brand_intro',
        component: 'BrandIntro',
        duration: 60, // 2 seconds
        enabled: false // Disabled by default
    },

    // Core slots (order can be changed)
    slots: [
        {
            id: 'problem',
            component: 'Slot1Problem',
            duration: 100, // ~3.3s
            enabled: true
        },
        {
            id: 'transition',
            component: 'Slot2Transition',
            duration: 40, // ~1.3s
            enabled: true
        },
        {
            id: 'hero',
            component: 'Slot3Hero',
            duration: 300, // 10s
            enabled: true
        },
        {
            id: 'features',
            component: 'Slot4Features',
            duration: 150, // 5s
            enabled: true
        },
        {
            id: 'trust',
            component: 'Slot5Trust',
            duration: 120, // 4s
            enabled: true
        }
    ],

    // Optional outro (can be swapped)
    outro: {
        id: 'cta',
        component: 'CTAOutro',
        duration: 90, // 3 seconds
        enabled: false // Disabled by default
    }
};

// Alternative configurations for different use cases
export const VIABLE_CONFIG_SHORT: ViableTemplateConfig = {
    slots: [
        { id: 'problem', component: 'Slot1Problem', duration: 60, enabled: true },
        { id: 'hero', component: 'Slot3Hero', duration: 180, enabled: true },
        { id: 'features', component: 'Slot4Features', duration: 120, enabled: true }
    ]
};

export const VIABLE_CONFIG_WITH_CTA: ViableTemplateConfig = {
    ...DEFAULT_VIABLE_CONFIG,
    outro: {
        id: 'cta',
        component: 'CTAOutro',
        duration: 90,
        enabled: true
    }
};
