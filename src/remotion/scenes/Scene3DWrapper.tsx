import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SceneContainer } from '../3d/SceneContainer';
import { LaptopPro } from '../3d/assets/LaptopPro';
import { PhonePro } from '../3d/assets/PhonePro';
import { VideoScene } from '../../../types';
import { useCurrentFrame } from 'remotion';
import { useFrame } from '@react-three/fiber';

interface Scene3DWrapperProps {
    scene: VideoScene;
}

// Internal component to handle per-frame logic inside the Canvas
const Choreographer: React.FC<{ scene: VideoScene }> = ({ scene }) => {
    const frame = useCurrentFrame();
    const groupRef = React.useRef<any>();

    useFrame(({ camera }) => {
        if (!groupRef.current) return;

        const orbitSpeed = scene["3dConfig"]?.orbitSpeed || 0.5;
        const cameraPath = scene["3dConfig"]?.cameraPath;
        const cameraMove = scene.cameraMove;

        // Camera Choreography based on Director's instructions
        if (cameraPath === 'macro_to_wide' || cameraMove === 'macro_reveal') {
            // "The Macro Reveal": Start zoomed in on screen, pull back to show full device
            const progress = Math.min(frame / 90, 1); // 3 seconds at 30fps

            // Start position: Close to screen
            const startZ = 2;
            const startY = 1;

            // End position: Wide shot
            const endZ = 5;
            const endY = 2;

            // Smooth easing (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);

            camera.position.z = startZ + (endZ - startZ) * eased;
            camera.position.y = startY + (endY - startY) * eased;
            camera.lookAt(0, 0, 0);
        } else if (cameraMove === 'orbit_smooth') {
            // Smooth orbit around the device
            groupRef.current.rotation.y = frame * (0.01 * orbitSpeed);
        } else if (cameraMove === 'static_hero') {
            // Static hero shot - no movement, just perfect framing
            camera.position.set(0, 2, 5);
            camera.lookAt(0, 0, 0);
        } else {
            // Default: gentle rotation
            groupRef.current.rotation.y = frame * (0.005 * orbitSpeed);
        }
    });

    // Select model based on config or type
    const renderModel = () => {
        const modelType = scene["3dConfig"]?.model || 'laptop_pro';
        const screenUrl = scene["3dConfig"]?.screenUrl || scene.customMedia as string;

        switch (modelType) {
            case 'phone_15':
                return <PhonePro screenTexture={screenUrl} scale={1.2} />;
            case 'laptop_pro':
            default:
                return <LaptopPro screenTexture={screenUrl} />;
        }
    };

    return (
        <group ref={groupRef}>
            {renderModel()}
        </group>
    );
};

export const Scene3DWrapper: React.FC<Scene3DWrapperProps> = ({ scene }) => {
    return (
        <AbsoluteFill>
            <SceneContainer>
                <Choreographer scene={scene} />
            </SceneContainer>

            {/* Overlay Layer (Text/UI) */}
            <AbsoluteFill className="pointer-events-none flex flex-col items-center justify-center">
                {/* Only show main text if it's explicitly requested to overlay 3D */}
                {scene.mainText && (
                    <div className="text-white text-6xl font-bold drop-shadow-lg text-center mt-[400px]">
                        {scene.mainText}
                    </div>
                )}
                {scene.subText && (
                    <div className="text-slate-200 text-3xl mt-4 font-light drop-shadow-md">
                        {scene.subText}
                    </div>
                )}
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
