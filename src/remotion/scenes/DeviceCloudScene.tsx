import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { VideoScene } from '../../../types';
import { DynamicBackground } from '../components/DynamicBackground';
import { Camera } from '../components/Camera';
import { LaptopFrame } from '../components/LaptopFrame'; // Assuming we reuse this, or generic DeviceFrame
import { LucideIcon } from 'lucide-react'; // Placeholder if we need icons

interface DeviceCloudSceneProps {
    scene: VideoScene;
}

// Simple Phone Mockup for the Cloud
const PhoneMockup: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
    <div style={style} className="relative rounded-[2rem] border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-black rounded-b-xl z-20"></div>
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 animate-pulse"></div>
        </div>
    </div>
);

export const DeviceCloudScene: React.FC<DeviceCloudSceneProps> = ({ scene }) => {
    const frame = useCurrentFrame();

    // Animate camera orbit
    // We'll simulate 3D orbit by moving elements in 2.5D space (Projected)
    // Or simpler: Use the Camera component which already handles orbit if we tell it to.

    // Let's manually arrange a "Cloud" of devices in 3D space
    // and rotate the container.

    const rotation = interpolate(frame, [0, 300], [0, 45]);

    return (
        <AbsoluteFill className="bg-slate-950">
            <DynamicBackground type="mesh_gradient" colorPalette={['#0f172a', '#334155', '#475569']} />

            <Camera move="orbit_smooth">
                <AbsoluteFill className="flex justify-center items-center" style={{ perspective: '1000px' }}>

                    {/* Transforming Container */}
                    <div className="relative w-[800px] h-[600px]" style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${rotation}deg) rotateX(10deg)`
                    }}>

                        {/* Center Laptop (Hero) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]"
                            style={{ transform: 'translateZ(0px)' }}>
                            <LaptopFrame>
                                <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white font-bold">HERO APP</div>
                            </LaptopFrame>
                        </div>

                        {/* Floating Phones (Satellites) */}
                        <div className="absolute top-0 left-0 w-32 h-64"
                            style={{ transform: 'translateZ(100px) translateX(-50px) translateY(50px)' }}>
                            <PhoneMockup style={{ width: '100%', height: '100%' }} />
                        </div>

                        <div className="absolute bottom-20 right-0 w-32 h-64"
                            style={{ transform: 'translateZ(50px) translateX(100px)' }}>
                            <PhoneMockup style={{ width: '100%', height: '100%' }} />
                        </div>

                        <div className="absolute top-10 right-20 w-48 h-32 bg-white/10 backdrop-blur rounded-lg border border-white/20"
                            style={{ transform: 'translateZ(-100px) rotateY(-15deg)' }}>
                            {/* Tablet/Card */}
                        </div>

                    </div>

                </AbsoluteFill>
            </Camera>
        </AbsoluteFill>
    );
};
