import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import { Environment, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import React, { Suspense } from "react";

interface SceneContainerProps {
    children: React.ReactNode;
    cameraPosition?: [number, number, number];
    fov?: number;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
    children,
    cameraPosition = [0, 0, 5],
    fov = 50
}) => {
    return (
        <AbsoluteFill>
            <ThreeCanvas
                shadows
                width={1920}
                height={1080}
                gl={{
                    alpha: true,
                    antialias: true,
                    preserveDrawingBuffer: true,
                }}
            >
                {/* Global Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1.5}
                    castShadow
                />

                {/* Studio Environment */}
                <Environment preset="studio" />

                {/* Camera */}
                <PerspectiveCamera
                    makeDefault
                    position={cameraPosition}
                    fov={fov}
                />

                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </ThreeCanvas>
        </AbsoluteFill>
    );
};
