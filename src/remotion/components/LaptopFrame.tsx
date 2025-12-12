import React from 'react';
import { AbsoluteFill } from 'remotion';

export const LaptopFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative w-[1200px] aspect-video group transform-style-3d">
            {/* Lid (Screen) */}
            <div className="absolute inset-0 bg-slate-900 rounded-2xl border-[12px] border-slate-800 shadow-2xl overflow-hidden transform-style-3d">
                {/* Camera Hole */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-50 flex justify-center items-center">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full border border-slate-700" />
                </div>

                {/* Screen Content (The Children) */}
                <div className="w-full h-full bg-black relative overflow-hidden">
                    {children}
                </div>

                {/* Screen Gloss */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-40 mix-blend-overlay" />
            </div>

            {/* Base (Keyboard Area - Simplified 3D Perspective) */}
            <div
                className="absolute -bottom-8 left-[-5%] w-[110%] h-[40px] bg-slate-700 rounded-b-3xl transform origin-top rotate-x-90 shadow-xl"
                style={{
                    transform: 'translateZ(-10px) rotateX(-80deg)' // Tilted base for depth
                }}
            >
                <div className="absolute inset-x-20 top-0 h-2 bg-slate-900/50 rounded-b-lg" /> {/* Hinge Shadow */}
            </div>

            {/* Logo/Branding on bottom bezel */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold tracking-widest uppercase z-50">
                VIDRA
            </div>
        </div>
    );
};
