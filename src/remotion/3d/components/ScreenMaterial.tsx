import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface ScreenMaterialProps {
    url: string;
    scrollSpeed?: number;
    intensity?: number;
}

export const ScreenMaterial: React.FC<ScreenMaterialProps> = ({
    url,
    scrollSpeed = 0.05,
    intensity = 1.0
}) => {
    // Load texture
    const texture = useTexture(url);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

    // Initial texture settings to fit screen
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1); // Start with 1:1, we might adjust based on aspect ratio

    useFrame((state, delta) => {
        if (texture) {
            // Scroll the texture vertically to simulate reading/browsing
            // Offset Y moves the texture up/down
            texture.offset.y -= scrollSpeed * delta;
        }
    });

    return (
        <meshPhysicalMaterial
            ref={materialRef}
            map={texture}
            emissiveMap={texture}
            emissive="white"
            emissiveIntensity={intensity}
            roughness={0.2}
            metalness={0.1}
            clearcoat={1.0}        // Glass overlay effect
            clearcoatRoughness={0.1}
        />
    );
};
