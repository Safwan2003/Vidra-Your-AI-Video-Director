import React, { useMemo } from 'react';
import { TransitionPresentation } from '@remotion/transitions';
import { AbsoluteFill, interpolate, Easing } from 'remotion';

export type ZoomThroughProps = {
    // No specific props needed for now
};

export const zoomThrough = (props?: ZoomThroughProps): TransitionPresentation<ZoomThroughProps> => {
    return {
        component: (componentProps) => {
            const { children, presentationProgress } = componentProps;

            // Assume children is [exiting, entering]
            // We need to render them with specific transforms
            const childrenArray = React.Children.toArray(children);
            const exiting = childrenArray[0];
            const entering = childrenArray[1];

            // 1. Exiting Scene: Zooms in towards camera until it disappears (scale 1 -> 5, opacity 1 -> 0)
            const exitScale = interpolate(presentationProgress, [0, 1], [1, 5], { easing: Easing.bezier(0.8, 0, 1, 1) });
            const exitOpacity = interpolate(presentationProgress, [0, 0.8], [1, 0]);

            // 2. Entering Scene: Zooms in from distance (scale 0.2 -> 1, opacity 0 -> 1)
            const enterScale = interpolate(presentationProgress, [0, 1], [0.2, 1], { easing: Easing.out(Easing.cubic) });
            const enterOpacity = interpolate(presentationProgress, [0, 0.5], [0, 1]);

            return (
                <AbsoluteFill>
                    {/* Exiting Scene */}
                    <AbsoluteFill style={{
                        transform: `scale(${exitScale})`,
                        opacity: exitOpacity,
                        zIndex: 1
                    }}>
                        {exiting}
                    </AbsoluteFill>

                    {/* Entering Scene */}
                    <AbsoluteFill style={{
                        transform: `scale(${enterScale})`,
                        opacity: enterOpacity,
                        zIndex: 2
                    }}>
                        {entering}
                    </AbsoluteFill>

                    {/* Motion Blur / Speed lines overlay could go here */}
                </AbsoluteFill>
            );
        },
        props: props || {},
    };
};
