import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SceneContainer } from './SceneContainer';
import { LaptopPro } from './assets/LaptopPro';
import { useThree, useFrame } from '@react-three/fiber';

const RotatingLaptop = () => {
    const frame = useCurrentFrame();
    const group = React.useRef<any>();

    useFrame(() => {
        if (group.current) {
            group.current.rotation.y = frame * 0.02; // Spin it
        }
    });

    return (
        <group ref={group}>
            <LaptopPro />
        </group>
    );
};

export const Test3DScene: React.FC = () => {
    return (
        <SceneContainer>
            <RotatingLaptop />
        </SceneContainer>
    );
};
