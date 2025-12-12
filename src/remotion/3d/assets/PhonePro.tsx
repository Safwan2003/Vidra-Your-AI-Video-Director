import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ScreenMaterial } from '../components/ScreenMaterial';
import { staticFile } from 'remotion';

interface PhoneProProps {
    screenTexture?: string | null; // URL to image/video texture, or null for solid color
    scale?: number;
}

export const PhonePro: React.FC<PhoneProProps> = ({
    screenTexture = null,
    scale = 1
}) => {
    // Robust fallback: If provided URL looks valid, use it; otherwise use null for solid color
    // Supports: local paths (/), web urls (http/https), and BLOB urls (blob:)
    const isLocal = screenTexture?.startsWith('/');
    const isWeb = screenTexture?.startsWith('http') || screenTexture?.startsWith('blob:');
    const validTexture = (screenTexture && (isLocal || isWeb))
        ? screenTexture
        : null;

    const groupRef = useRef<THREE.Group>(null);

    // iPhone 15 Pro style dimensions
    const phoneWidth = 0.8;
    const phoneHeight = 1.7;
    const phoneDepth = 0.08;
    const screenInset = 0.05;

    const bodyColor = "#1a1a1a"; // Titanium Black
    const screenBorderRadius = 0.15;

    return (
        <group ref={groupRef} scale={scale}>
            {/* Phone Body/Frame */}
            <mesh>
                <boxGeometry args={[phoneWidth, phoneHeight, phoneDepth]} />
                <meshStandardMaterial
                    color={bodyColor}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Camera Island (Dynamic Island style) */}
            <mesh position={[0, phoneHeight / 2 - 0.15, phoneDepth / 2 + 0.01]}>
                <boxGeometry args={[0.25, 0.08, 0.02]} />
                <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Screen (Active Display Area or Solid Color) */}
            <mesh position={[0, 0, phoneDepth / 2 + 0.005]}>
                <planeGeometry args={[phoneWidth - screenInset * 2, phoneHeight - screenInset * 2]} />
                {validTexture ? (
                    <ScreenMaterial url={validTexture} scrollSpeed={0.03} />
                ) : (
                    <meshStandardMaterial
                        color="#0a0a0a"
                        emissive="#1a1a1a"
                        emissiveIntensity={0.3}
                    />
                )}
            </mesh>

            {/* Side Buttons (Volume, Power) */}
            <mesh position={[-phoneWidth / 2 - 0.01, phoneHeight / 4, 0]}>
                <boxGeometry args={[0.02, 0.15, 0.04]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    );
};
