/**
 * Comprehensive Animation Library
 * Professional animation presets for "What a Story" quality videos
 */

import { interpolate, Easing } from 'remotion';
import { EASINGS, smoothInterpolate } from '../constants/easings';

export interface AnimationConfig {
    name: string;
    description: string;
    apply: (frame: number, startFrame?: number, duration?: number) => React.CSSProperties;
}

/**
 * Text Animations
 */
export const TEXT_ANIMATIONS: Record<string, AnimationConfig> = {
    fadeInUp: {
        name: 'Fade In Up',
        description: 'Fade in while sliding up',
        apply: (frame, startFrame = 0, duration = 20) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.smooth);
            return {
                opacity: progress,
                transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
            };
        },
    },

    scaleIn: {
        name: 'Scale In',
        description: 'Scale from small to full size',
        apply: (frame, startFrame = 0, duration = 15) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.overshoot);
            return {
                opacity: progress,
                transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
            };
        },
    },

    slideInLeft: {
        name: 'Slide In Left',
        description: 'Slide in from the left',
        apply: (frame, startFrame = 0, duration = 20) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.smooth);
            return {
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-100, 0])}px)`,
            };
        },
    },

    bounceIn: {
        name: 'Bounce In',
        description: 'Bounce in with elastic effect',
        apply: (frame, startFrame = 0, duration = 25) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.elastic);
            return {
                opacity: progress,
                transform: `scale(${interpolate(progress, [0, 1], [0, 1])})`,
            };
        },
    },

    typewriter: {
        name: 'Typewriter',
        description: 'Character-by-character reveal',
        apply: (frame, startFrame = 0, duration = 30) => {
            const progress = (frame - startFrame) / duration;
            return {
                opacity: 1,
                // Note: Actual typewriter effect needs to be implemented in component
                // This just provides the timing
            };
        },
    },
};

/**
 * Element Animations
 */
export const ELEMENT_ANIMATIONS: Record<string, AnimationConfig> = {
    fadeIn: {
        name: 'Fade In',
        description: 'Simple fade in',
        apply: (frame, startFrame = 0, duration = 15) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.smooth);
            return {
                opacity: progress,
            };
        },
    },

    popIn: {
        name: 'Pop In',
        description: 'Pop in with overshoot',
        apply: (frame, startFrame = 0, duration = 20) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.overshoot);
            return {
                opacity: progress,
                transform: `scale(${interpolate(progress, [0, 1], [0, 1])})`,
            };
        },
    },

    slideInRight: {
        name: 'Slide In Right',
        description: 'Slide in from the right',
        apply: (frame, startFrame = 0, duration = 20) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.smooth);
            return {
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [100, 0])}px)`,
            };
        },
    },

    rotateIn: {
        name: 'Rotate In',
        description: 'Rotate and scale in',
        apply: (frame, startFrame = 0, duration = 20) => {
            const progress = smoothInterpolate(frame, [startFrame, startFrame + duration], [0, 1], EASINGS.smooth);
            return {
                opacity: progress,
                transform: `rotate(${interpolate(progress, [0, 1], [-180, 0])}deg) scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
            };
        },
    },
};

/**
 * Background Animations
 */
export const BACKGROUND_ANIMATIONS: Record<string, AnimationConfig> = {
    gradientShift: {
        name: 'Gradient Shift',
        description: 'Animated gradient background',
        apply: (frame) => {
            const hue = (frame * 2) % 360;
            return {
                background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 70%, 50%))`,
            };
        },
    },

    pulse: {
        name: 'Pulse',
        description: 'Pulsing opacity effect',
        apply: (frame) => {
            const opacity = 0.5 + Math.sin(frame * 0.1) * 0.3;
            return {
                opacity,
            };
        },
    },

    parallax: {
        name: 'Parallax',
        description: 'Parallax movement',
        apply: (frame, startFrame = 0, speed = 1) => {
            const offset = (frame - startFrame) * speed;
            return {
                transform: `translateX(${offset}px)`,
            };
        },
    },
};

/**
 * Transition Animations
 */
export const TRANSITION_ANIMATIONS: Record<string, AnimationConfig> = {
    crossfade: {
        name: 'Crossfade',
        description: 'Smooth crossfade transition',
        apply: (frame, startFrame = 0, duration = 15) => {
            const progress = (frame - startFrame) / duration;
            return {
                opacity: Math.max(0, Math.min(1, progress)),
            };
        },
    },

    wipeRight: {
        name: 'Wipe Right',
        description: 'Wipe from left to right',
        apply: (frame, startFrame = 0, duration = 15) => {
            const progress = (frame - startFrame) / duration;
            return {
                clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
            };
        },
    },

    zoomThrough: {
        name: 'Zoom Through',
        description: 'Zoom in transition',
        apply: (frame, startFrame = 0, duration = 15) => {
            const progress = (frame - startFrame) / duration;
            const scale = 1 + progress * 2;
            return {
                transform: `scale(${scale})`,
                opacity: Math.max(0, 1 - progress),
            };
        },
    },
};

/**
 * Helper function to apply animation
 */
export function applyAnimation(
    animationName: string,
    frame: number,
    startFrame: number = 0,
    duration: number = 20
): React.CSSProperties {
    const animation =
        TEXT_ANIMATIONS[animationName] ||
        ELEMENT_ANIMATIONS[animationName] ||
        BACKGROUND_ANIMATIONS[animationName] ||
        TRANSITION_ANIMATIONS[animationName];

    if (!animation) {
        console.warn(`Animation "${animationName}" not found`);
        return {};
    }

    return animation.apply(frame, startFrame, duration);
}

/**
 * Get all available animations
 */
export function getAllAnimations() {
    return {
        text: Object.keys(TEXT_ANIMATIONS),
        element: Object.keys(ELEMENT_ANIMATIONS),
        background: Object.keys(BACKGROUND_ANIMATIONS),
        transition: Object.keys(TRANSITION_ANIMATIONS),
    };
}
