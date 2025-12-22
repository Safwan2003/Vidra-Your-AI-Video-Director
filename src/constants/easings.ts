// Professional Easing Curves for "What a Story" Quality Animations

export const EASINGS = {
  // Smooth, professional easing (most common)
  smooth: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
  
  // Bounce effect (playful, attention-grabbing)
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  
  // Elastic (dynamic, energetic)
  elastic: [0.87, 0, 0.13, 1] as [number, number, number, number],
  
  // Anticipation (pulls back before moving forward)
  anticipate: [0.36, 0, 0.66, -0.56] as [number, number, number, number],
  
  // Ease out (fast start, slow end)
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  
  // Ease in (slow start, fast end)
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  
  // Ease in-out (slow start and end)
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  // Sharp (quick, snappy)
  sharp: [0.4, 0, 0.6, 1] as [number, number, number, number],
  
  // Overshoot (goes past target, then settles)
  overshoot: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

// Animation Duration Presets (in seconds)
export const DURATIONS = {
  instant: 0.1,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2,
};

// Stagger Delays (in frames at 30fps)
export const STAGGER_DELAYS = {
  tight: 3,    // 0.1s
  normal: 5,   // 0.167s
  loose: 8,    // 0.267s
  veryLoose: 12, // 0.4s
};

/**
 * Cubic Bezier interpolation for smooth animations
 * @param t - Progress (0 to 1)
 * @param p0 - Start value
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End value
 */
export function cubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}

/**
 * Apply easing curve to interpolation
 * @param frame - Current frame
 * @param inputRange - [start frame, end frame]
 * @param outputRange - [start value, end value]
 * @param easing - Cubic bezier curve [x1, y1, x2, y2]
 */
export function smoothInterpolate(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing: [number, number, number, number] = EASINGS.smooth
): number {
  const [startFrame, endFrame] = inputRange;
  const [startValue, endValue] = outputRange;

  // Clamp frame to input range
  const clampedFrame = Math.max(startFrame, Math.min(endFrame, frame));

  // Calculate linear progress (0 to 1)
  const linearProgress = (clampedFrame - startFrame) / (endFrame - startFrame);

  // Apply cubic bezier easing
  const [x1, y1, x2, y2] = easing;
  const easedProgress = cubicBezier(linearProgress, 0, y1, y2, 1);

  // Interpolate output value
  return startValue + (endValue - startValue) * easedProgress;
}
