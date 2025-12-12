import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { ScreenMaterial } from '../components/ScreenMaterial';
import { staticFile } from 'remotion';

interface LaptopProProps {
    screenTexture?: string | null; // URL to image/video texture, or null for solid color
    scale?: number;
}

export const LaptopPro: React.FC<LaptopProProps> = ({
    screenTexture = null,
    scale = 1
}) => {
    // Robust fallback: If provided URL looks valid, use it; otherwise use null for solid color
    // Supports: local paths (/), web urls (http/https), and BLOB urls (blob:)
    const isLocal = screenTexture?.startsWith('/');
    const isWeb = screenTexture?.startsWith('http') || screenTexture?.startsWith('blob:');

    // If no texture or invalid texture, use null to show solid color screen
    const validTexture = (screenTexture && (isLocal || isWeb))
        ? screenTexture
        : null;

    const groupRef = useRef<THREE.Group>(null);
    const lidRef = useRef<THREE.Group>(null);

    // Simple procedural laptop
    // Bottom Chassis
    // Screen Lid
    // Screen Display (Textured or Solid Color)

    const chassisColor = "#1e293b"; // Dark slate/Macbook Space Grey

    return (
        <group ref={groupRef} scale={scale}>
            {/* Chassis Base */}
            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[3, 0.1, 2]} />
                <meshStandardMaterial color={chassisColor} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Hint of trackpad */}
            <mesh position={[0, -0.04, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.6]} />
                <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Lid Group (Pivots at the back) */}
            <group ref={lidRef} position={[0, 0, -1]} rotation={[Math.PI / 8, 0, 0]}> {/* Opened slightly */}
                {/* Lid Back/Shell - Offset so pivot works */}
                <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[3, 2, 0.1]} />
                    <meshStandardMaterial color={chassisColor} metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Active Screen Area (The "Live" Content or Solid Color) */}
                <mesh position={[0, 1, 0.06]}>
                    <planeGeometry args={[2.8, 1.8]} />
                    {validTexture ? (
                        <ScreenMaterial url={validTexture} />
                    ) : (
                        <meshStandardMaterial
                            color="#1e293b"
                            emissive="#334155"
                            emissiveIntensity={0.2}
                        />
                    )}
                </mesh>

                {/* Screen Glow Effect (when texture is present) */}
                {validTexture && (
                    <mesh position={[0, 1, 0.05]}>
                        <planeGeometry args={[3, 2]} />
                        <meshBasicMaterial
                            color="#6366f1"
                            transparent
                            opacity={0.1}
                        />
                    </mesh>
                )}
            </group>
        </group>
    );
};
