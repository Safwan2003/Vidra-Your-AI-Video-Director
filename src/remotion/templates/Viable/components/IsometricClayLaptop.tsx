import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface IsometricClayLaptopProps {
  screenContent?: React.ReactNode;
  scale?: number;
  rotation?: [number, number, number];
}

export const IsometricClayLaptop: React.FC<IsometricClayLaptopProps> = ({
  screenContent,
  scale = 1,
  rotation = [0.3, -0.4, 0]
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const group = useRef<THREE.Group>(null);

  // Clay Material - warm beige, matte
  const clayMaterial = new THREE.MeshStandardMaterial({
    color: '#e8d5c4',
    roughness: 0.8,
    metalness: 0.1,
  });

  // Gentle floating animation
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 0.5) * 0.1;
  });

  // Opening animation
  const openProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic
  });

  // Lid rotation: -90 (closed) to -15 (open) degrees in radians
  const lidRotation = interpolate(openProgress, [0, 1], [Math.PI / 2, -0.2]); // Start closed, rotate open

  return (
    <group ref={group} scale={scale} rotation={rotation} dispose={null}>
      {/* Base */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[3, 0.2, 2]} />
        <primitive object={clayMaterial} />
        <meshStandardMaterial color="#e8d5c4" roughness={0.8} />
      </mesh>

      {/* Lid Group (Pivots at the back) */}
      <group position={[0, 0, -0.9]} rotation={[lidRotation, 0, 0]}>
        {/* Lid Body */}
        <mesh position={[0, 1, 0]}> {/* Shift visual geometry so pivot is at bottom */}
          <boxGeometry args={[3, 2, 0.1]} />
          <primitive object={clayMaterial} />
          <meshStandardMaterial color="#e8d5c4" roughness={0.8} />
        </mesh>

        {/* Screen Bezel/Inner */}
        <mesh position={[0, 1, 0.06]}>
          <planeGeometry args={[2.8, 1.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>

        {/* HTML Screen Content */}
        <group position={[0, 1, 0.07]} rotation={[0, 0, 0]}>
          {screenContent ? (
            <Html
              transform
              occlude
              position={[0, 0, 0]}
              style={{
                width: '1000px', // High res mapped to plane
                height: '642px', // Aspect ratio ~2.8/1.8
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
              scale={0.28} // Scale down HTML to fit geometry
            >
              {screenContent}
            </Html>
          ) : (
            // Default glow if no content
            <mesh>
              <planeGeometry args={[2.8, 1.8]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          )}
        </group>
      </group>

      {/* Simple Keyboard representation */}
      <group position={[0, 0.01, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[2.6, 1.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
      </group>

    </group>
  );
};
