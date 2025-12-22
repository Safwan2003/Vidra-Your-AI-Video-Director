import React from 'react';
import { Img, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

// --- DEVICE GEOMETRY & STYLES ---

const LaptopFrame = ({ children, scale = 1 }: any) => {
    return (
        <div style={{
            transform: `scale(${scale})`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.3))'
        }}>
            {/* Screen Bezel */}
            <div style={{
                width: 800, height: 500,
                background: '#1e293b',
                borderRadius: '24px 24px 0 0',
                padding: '12px 12px 0 12px',
                boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.1)',
                position: 'relative'
            }}>
                {/* Camera Dot */}
                <div style={{
                    position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                    width: 6, height: 6, borderRadius: '50%', background: '#334155'
                }} />

                {/* Screen Content Area */}
                <div style={{
                    width: '100%', height: '100%',
                    background: 'white',
                    borderRadius: '16px 16px 0 0',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {children}
                </div>
            </div>

            {/* Base/Hinge */}
            <div style={{
                width: 960, height: 28,
                background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)',
                borderRadius: '0 0 24px 24px',
                position: 'relative',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}>
                {/* Hinge Indent top */}
                <div style={{ position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)', width: 120, height: 5, background: '#cbd5e1', borderRadius: '0 0 8px 8px' }} />
            </div>
        </div>
    );
};

const MobileFrame = ({ children, scale = 1 }: any) => {
    return (
        <div style={{
            transform: `scale(${scale})`,
            width: 320, height: 640,
            background: '#1e293b', // Dark frame
            borderRadius: 48,
            padding: 12,
            boxShadow: '0 40px 80px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.1)',
            position: 'relative'
        }}>
            {/* Dynamic Island / Notch */}
            <div style={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                width: 80, height: 24, borderRadius: 12, background: 'black', zIndex: 20
            }} />

            {/* Screen Area */}
            <div style={{
                width: '100%', height: '100%',
                background: 'white',
                borderRadius: 36,
                overflow: 'hidden',
                position: 'relative'
            }}>
                {children}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

interface DeviceFrameProps {
    src: string;
    type?: 'laptop' | 'mobile' | 'auto';
    scale?: number;
    delay?: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ src, type = 'auto', scale = 1, delay = 0 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Auto-detect type based on image aspect ratio? 
    // Not possible without loading image dimensions first. We will assume 'mobile' default if auto.
    const deviceType = type === 'auto' ? 'mobile' : type;

    // Entrance Animation
    const entrance = spring({
        frame: frame - delay,
        fps,
        config: { damping: 14, stiffness: 100 }
    });

    const tilt = interpolate(entrance, [0, 1], [15, 0]); // Tilt up effect

    // Scroll Animation (Auto-scroll down)
    const scrollY = interpolate(frame, [delay + 30, delay + 150], [0, -30], {
        extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)
    }); // Subtle scroll for preview

    // Content Wrapper
    const Content = (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Img
                src={src}
                style={{
                    width: '100%',
                    height: 'auto', // Allow height to grow for scrolling
                    position: 'absolute', top: 0, left: 0,
                    transform: `translateY(${scrollY}%)`
                }}
            />
        </div>
    );

    return (
        <div style={{
            transform: `perspective(1000px) rotateX(${tilt}deg) translateY(${(1 - entrance) * 100}px)`,
            opacity: interpolate(frame, [delay, delay + 10], [0, 1]),
            display: 'flex', justifyContent: 'center'
        }}>
            {deviceType === 'laptop' ? (
                <LaptopFrame scale={scale}>{Content}</LaptopFrame>
            ) : (
                <MobileFrame scale={scale}>{Content}</MobileFrame>
            )}
        </div>
    );
};
