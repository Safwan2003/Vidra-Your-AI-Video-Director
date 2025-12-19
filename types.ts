export type SceneType = 'kinetic_text' | 'ui_mockup' | 'isometric_illustration' | 'device_showcase' | 'data_visualization' | 'split_comparison' | 'cta_finale' | 'bento_grid' | 'device_cloud'
    | '3d_laptop_orbit' | '3d_phone_float' | 'exploded_ui_view' | 'floating_ui_layers' | 'social_proof' | 'flat_screenshot' | 'slot_transition' | 'kinetic_typo';

export type AnimationType = 'pop-up' | 'slide-in' | 'fade' | 'stack' | 'typewriter';
export type CameraAngle = 'isometric_left' | 'isometric_right' | 'cinematic_low' | 'straight_on';
export type CameraMove = 'zoom_in_slow' | 'zoom_out_fast' | 'pan_left' | 'pan_right' | 'static' | 'rack_focus' | 'orbit_smooth' | 'zoom_in_hero' | 'parallax_layers' | 'dolly_zoom' | 'macro_reveal' | 'static_hero';
export type TransitionType = 'cut' | 'fade' | 'wipe_right' | 'zoom_through';
export type TextEffectStyle = 'explode' | 'gradient_slide' | 'glitch' | 'typewriter' | 'stagger_up';
export type MediaType = 'image' | 'video';
export type DeviceType = 'laptop' | 'phone' | 'tablet' | 'browser_window';

// --- AGENTIC CORE TYPES ---

export interface Keyframe {
    frame: number;
    value: number;
    easing?: [number, number, number, number];
}

export interface Point3D {
    x: number; y: number; z: number;
}

export interface CameraChoreography {
    type: 'cinematic_path' | 'static_hero';
    path?: Point3D[];
    zoom?: Keyframe[];
    rotateX?: Keyframe[];
    rotateY?: Keyframe[];
    lookAt?: Point3D;
}

export interface UIChoreography {
    cursorPath: { frame: number; x: number; y: number }[];
    actions: { frame: number; type: string; x: number; y: number; payload?: string }[];
}

export interface AudioEvent {
    frame: number;
    type: 'sfx';
    file: 'click.mp3' | 'whoosh.mp3' | 'pop.mp3' | 'typing.mp3' | 'notification.mp3' | 'success.mp3' | 'swoosh.mp3' | 'digital_blip.mp3' | 'reveal.mp3';
    volume: number;
}

export interface FloatingElement {
    type: 'notification' | 'stat_card' | 'cursor_click' | 'integration_icon' | 'feature_badge' | 'testimonial_bubble' | 'progress_indicator';
    text?: string;
    icon?: string;
    value?: string;
    label?: string;
    position: { top: string; left: string };
    delay: number;
    animationStyle?: 'pop_in' | 'slide_up' | 'fade_scale' | 'bounce';
    color?: string;
}

export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'counter' | 'progress';
    title?: string;
    values: number[];
    labels?: string[];
    colors?: string[];
    targetValue?: number;
    unit?: string;
}

export interface DeviceConfig {
    deviceType: DeviceType;
    angle: 'isometric_left' | 'isometric_right' | 'front' | 'floating';
    screenContent: 'svg' | 'video' | 'screenshot';
    showCursor?: boolean;
    glowColor?: string;
    shadowIntensity?: 'light' | 'medium' | 'heavy';
}

export interface UIComponent {
    id: string;
    type: 'sidebar' | 'navbar' | 'hero_section' | 'card' | 'chart' | 'list_item';
    content?: string;
    position: { top?: string | number; left?: string | number; width?: string | number; height?: string | number };
    animation?: 'fade_in' | 'slide_from_left' | 'slide_from_bottom' | 'pop_in';
    zIndex?: number;
}

export interface BentoItem {
    id: string;
    content: string;
    colSpan: 1 | 2;
    rowSpan: 1 | 2;
    type: 'stat' | 'feature' | 'image' | 'code';
    title?: string;
    icon?: string;
    animationDelay?: number;
}

export interface Config3D {
    model: 'laptop_pro' | 'phone_15' | 'tablet';
    screenUrl?: string;
    orbitSpeed?: number;
    showUiOverlay?: boolean;
    cameraPath?: string;
}

// --- VIDEO SCENE (The Generic Block) ---
export interface VideoScene {
    id: number;
    type: SceneType;
    title: string;
    duration: number;

    // Core Content
    script?: string;
    mainText?: string;
    subText?: string;

    // Visual Configs
    transition?: TransitionType;
    cameraMove?: CameraMove;
    choreography?: {
        camera?: CameraChoreography;
        ui?: UIChoreography;
        audioEvents?: AudioEvent[];
    };

    // Component Specifics
    elements?: FloatingElement[];
    dataVisualization?: ChartData;
    deviceConfig?: DeviceConfig;
    uiComponents?: UIComponent[];
    bentoItems?: BentoItem[];
    "3dConfig"?: Config3D;

    // Assets
    customMedia?: { type: 'image' | 'video', url: string } | string;
    customerLogos?: string[];
    metrics?: Array<{ value: string; label: string }>;

    // Director Mode / Generative Fields
    visualDescription?: string;
    wanPrompt?: string;
    voiceoverScript?: string; // specific voiceover script if different from main script
    backgroundColor?: string;
    mainTextColor?: string;
    svgContent?: string; // Generated SVG content
    videoUrl?: string; // Generated video URL (e.g. from Wan)
    ctaText?: string;
    ctaButtonText?: string;
    logoUrl?: string;
    screenshotUrl?: string;
    mobileScreenshotUrl?: string;
    domain?: string;
    notificationText?: string;
    features?: Array<{ title: string; description: string; icon?: string }>; // For feature lists/widgets
    ctaUrl?: string; // Specific destination URL for CTAs

    // Legacy
    animationType?: AnimationType;
    voice?: string; // AI Voice model (e.g. en-US-ChristopherNeural)
    voiceoverUrl?: string;
}

// ---TEMPLATES ---

// Viable Template Schema (6 Scenes - 90 Seconds)
export interface ViableTemplateData {
    audioTrack?: string;

    // Brand/Theme (can be extracted from product URL)
    brand: {
        name: string;
        logoUrl?: string;
        accentColor?: string; // Primary brand color (e.g. '#22c55e')
        tagline?: string;
    };

    // Visual Assets
    assets: {
        screenshotDashboard?: string;  // Main product screenshot
        screenshotMobile?: string;
        screenshotFeature1?: string;
        screenshotFeature2?: string;
    };

    // Copy/Content
    copy: {
        headline?: string;        // Scene 2 main headline
        subheadline?: string;     // Scene 2 subtitle
        featuresTitle?: string;   // Scene 4 header
        features?: { title: string; subtitle: string; icon?: string }[];
    };

    // Social Proof
    trust?: {
        testimonial?: {
            quote: string;
            author: string;
            role: string;
            company?: string;
            avatarUrl?: string;
        };
        logos?: string[];  // Trust logos (clients, integrations)
    };

    // CTA
    cta?: {
        text?: string;   // CTA button text
        url?: string;    // Website URL
    };
}

// Pretaa Template Schema (5 Scenes - Isometric Tech Style)
export interface PretaaTemplateData {
    brand: {
        name: string;
        logoUrl?: string;
        accentColor?: string;
        tagline?: string;
    };
    copy: {
        headline?: string;
        subheadline?: string;
        problem?: string;
        solution?: string;
        features?: { title: string; subtitle: string; icon?: string }[];
    };
    cta?: {
        text?: string;
        url?: string;
    };
    assets?: {
        productImage?: string;
        screenshot?: string;
    };
}

// --- PLAN & BRIEF ---
export interface VideoPlan {
    brandName: string;
    brandColor: string;
    template?: 'generic' | 'viable' | 'pretaa'; // Select implementation
    templateData?: ViableTemplateData | PretaaTemplateData; // Data for the specific template
    archetype?: string;
    narrativeFramework?: string;
    scenes: VideoScene[]; // Generic scenes (used if template='generic')
}

export interface RecordedClip {
    id: string;
    url: string;
    description: string;
    type: 'video' | 'image';
}

export interface ProjectBrief {
    productName: string;
    description: string;
    targetAudience: string;
    tone: 'Hype' | 'Professional' | 'Friendly' | 'Luxury';
    duration: number;
    platform: 'Web' | 'Mobile' | 'Social';
    callToAction: string;
    recordedClips?: RecordedClip[];
    assets?: string[];
}

export enum AppState {
    IDLE = 'IDLE',
    BRIEFING = 'BRIEFING',
    ANALYZING = 'ANALYZING',
    TEMPLATE_SELECTION = 'TEMPLATE_SELECTION',
    GENERATING = 'GENERATING',
    EDITOR = 'EDITOR',
    ERROR = 'ERROR'
}

export interface LogMessage {
    id: string;
    text?: string;
    message?: string;
    type: 'info' | 'success' | 'process' | 'error';
    timestamp?: string;
}
