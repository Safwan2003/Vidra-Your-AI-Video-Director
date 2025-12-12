import { spring } from 'remotion';

export const staggerChildren = (frame: number, index: number, fps: number, delayPerChild = 5) => {
    const delay = index * delayPerChild;
    const t = frame - delay;

    // Spring config can be adjusted
    const scale = spring({
        frame: t,
        fps,
        config: { damping: 15, mass: 0.5 }
    });

    // Opacity fade in
    const opacity = t >= 0 ? Math.min(t / 10, 1) : 0;

    return { scale, opacity, translateY: (1 - scale) * 20 };
};
