import { ProjectBrief, VideoPlan, VideoScene, AudioEvent, ViableTemplateData } from '../../types';


// State that flows through the agent graph
export interface VideoGenerationState {
    // Input
    brief: ProjectBrief;

    // Intermediate outputs
    script?: string;
    beatScripts?: string[];
    scenes?: VideoScene[];
    archetype?: string; // e.g. 'neo_glass'
    cameraWork?: any;
    visualAssets?: {
        colorPalette: string[];
        brandColor?: string;
        accentColor?: string;
        logoUrl?: string;
        fontFamily?: string;
    };
    audioEvents?: AudioEvent[];

    // Template Mode Support
    template?: 'generic' | 'viable';
    templateData?: ViableTemplateData;

    // Final output
    videoPlan?: VideoPlan;

    // Quality control
    qualityScore?: number;
    needsRefinement?: boolean;
    refinementCount?: number;

    // Error handling
    errors?: string[];
}

// Agent response type
export interface AgentResponse {
    state: VideoGenerationState;
    shouldContinue: boolean;
}
