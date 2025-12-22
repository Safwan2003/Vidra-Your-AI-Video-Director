// src/remotion/templates/Viable/config.ts
// Modular Template Configuration - 90 Second Video (6 Scenes)

export interface TemplateSlotConfig {
    id: string;
    component: string;
    durationSeconds: number;
    durationFrames: number; // At 30fps
    enabled: boolean;
}

export interface ViableTemplateConfig {
    totalDuration: number; // Total frames
    fps: number;
    scenes: TemplateSlotConfig[];
}

// Default Viable Template Configuration - 79 Seconds (1m 19s) at 30fps = 2370 frames
export const DEFAULT_VIABLE_CONFIG: ViableTemplateConfig = {
    totalDuration: 2370,
    fps: 30,
    scenes: [
        {
            id: 'intro',
            component: 'Slot1Problem',
            durationSeconds: 13,
            durationFrames: 390,
            enabled: true
        },
        {
            id: 'tagline',
            component: 'Slot2Transition',
            durationSeconds: 8,
            durationFrames: 240,
            enabled: true
        },
        {
            id: 'dashboard',
            component: 'Slot3Hero',
            durationSeconds: 22,
            durationFrames: 660,
            enabled: true
        },
        {
            id: 'features',
            component: 'Slot4Features',
            durationSeconds: 13,
            durationFrames: 390,
            enabled: true
        },
        {
            id: 'testimonials',
            component: 'Slot5Trust',
            durationSeconds: 13,
            durationFrames: 390,
            enabled: true
        },
        {
            id: 'cta',
            component: 'Slot6Outro',
            durationSeconds: 10,
            durationFrames: 300,
            enabled: true
        }
    ]
};

// Short version - 45 seconds
export const VIABLE_CONFIG_SHORT: ViableTemplateConfig = {
    totalDuration: 1350,
    fps: 30,
    scenes: [
        { id: 'intro', component: 'Slot1Problem', durationSeconds: 8, durationFrames: 240, enabled: true },
        { id: 'tagline', component: 'Slot2Transition', durationSeconds: 5, durationFrames: 150, enabled: true },
        { id: 'dashboard', component: 'Slot3Hero', durationSeconds: 15, durationFrames: 450, enabled: true },
        { id: 'features', component: 'Slot4Features', durationSeconds: 10, durationFrames: 300, enabled: true },
        { id: 'cta', component: 'Slot6Outro', durationSeconds: 7, durationFrames: 210, enabled: true }
    ]
};

// Calculate start frame for each scene
export const getSceneTimings = (config: ViableTemplateConfig) => {
    let currentFrame = 0;
    return config.scenes.filter(s => s.enabled).map(scene => {
        const timing = { ...scene, startFrame: currentFrame };
        currentFrame += scene.durationFrames;
        return timing;
    });
};
