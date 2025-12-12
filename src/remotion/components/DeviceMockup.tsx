import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Img } from 'remotion';
import { DeviceConfig } from '../../../types';

interface DeviceMockupProps {
    config: DeviceConfig;
    svgContent?: string;
    videoUrl?: string;
    screenshotUrl?: string;
    brandColor: string;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
    config,
    svgContent,
    videoUrl,
    screenshotUrl,
    brandColor
}) => {
    const frame = useCurrentFrame();

    // Animation values
    const entryProgress = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
    const floatY = Math.sin(frame / 20) * 5;
    const rotateY = config.angle === 'isometric_left' ? -15 : config.angle === 'isometric_right' ? 15 : 0;
    const rotateX = config.angle === 'floating' ? 5 : 10;

    // Entry animation
    const entryScale = interpolate(entryProgress, [0, 1], [0.8, 1]);
    const entryOpacity = interpolate(entryProgress, [0, 1], [0, 1]);
    const entryY = interpolate(entryProgress, [0, 1], [50, 0]);

    // Glow intensity
    const glowPulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.5, 1]);

    // Device dimensions based on type
    const getDimensions = () => {
        switch (config.deviceType) {
            case 'phone':
                return { width: 280, height: 560, borderRadius: 32, bezel: 8 };
            case 'tablet':
                return { width: 600, height: 450, borderRadius: 24, bezel: 12 };
            case 'browser_window':
                return { width: 900, height: 540, borderRadius: 12, bezel: 0 };
            case 'laptop':
            default:
                return { width: 800, height: 500, borderRadius: 16, bezel: 20 };
        }
    };

    const dims = getDimensions();

    // Shadow styles based on intensity
    const getShadowStyle = () => {
        const base = config.shadowIntensity || 'medium';
        switch (base) {
            case 'light':
                return '0 10px 40px rgba(0,0,0,0.2)';
            case 'heavy':
                return '0 30px 80px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3)';
            case 'medium':
            default:
                return '0 20px 60px rgba(0,0,0,0.35), 0 8px 25px rgba(0,0,0,0.2)';
        }
    };

    return (
        <AbsoluteFill className="flex items-center justify-center">
            <div
                style={{
                    transform: `
                        perspective(1200px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        translateY(${entryY + floatY}px)
                        scale(${entryScale})
                    `,
                    opacity: entryOpacity,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Device Frame */}
                <div
                    style={{
                        width: dims.width,
                        height: dims.height,
                        borderRadius: dims.borderRadius,
                        background: config.deviceType === 'browser_window'
                            ? 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)'
                            : 'linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
                        padding: dims.bezel,
                        boxShadow: getShadowStyle(),
                        position: 'relative',
                    }}
                >
                    {/* Browser Chrome (for browser_window type) */}
                    {config.deviceType === 'browser_window' && (
                        <div
                            style={{
                                height: 36,
                                background: 'linear-gradient(180deg, #404040 0%, #2d2d2d 100%)',
                                borderRadius: `${dims.borderRadius}px ${dims.borderRadius}px 0 0`,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 12px',
                                gap: 8,
                            }}
                        >
                            {/* Traffic lights */}
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                            {/* URL bar */}
                            <div
                                style={{
                                    flex: 1,
                                    height: 24,
                                    background: '#1a1a1a',
                                    borderRadius: 6,
                                    marginLeft: 20,
                                }}
                            />
                        </div>
                    )}

                    {/* Screen */}
                    <div
                        style={{
                            width: '100%',
                            height: config.deviceType === 'browser_window' ? 'calc(100% - 36px)' : '100%',
                            borderRadius: config.deviceType === 'browser_window'
                                ? `0 0 ${dims.borderRadius - 4}px ${dims.borderRadius - 4}px`
                                : dims.borderRadius - dims.bezel / 2,
                            overflow: 'hidden',
                            background: '#0f172a',
                            position: 'relative',
                        }}
                    >
                        {/* Screen Content */}
                        {config.screenContent === 'svg' && svgContent && (
                            <div
                                style={{ width: '100%', height: '100%' }}
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                            />
                        )}
                        {config.screenContent === 'screenshot' && screenshotUrl && (
                            <Img
                                src={screenshotUrl}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                        {config.screenContent === 'video' && videoUrl && (
                            <video
                                src={videoUrl}
                                autoPlay
                                muted
                                loop
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}

                        {/* Screen Glow Effect */}
                        {config.glowColor && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: -20,
                                    background: `radial-gradient(ellipse at center, ${config.glowColor}${Math.round(glowPulse * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                }}
                            />
                        )}

                        {/* Screen Reflection */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                                pointerEvents: 'none',
                            }}
                        />
                    </div>

                    {/* Laptop Base (only for laptop) */}
                    {config.deviceType === 'laptop' && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: -20,
                                left: '10%',
                                right: '10%',
                                height: 20,
                                background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
                                borderRadius: '0 0 8px 8px',
                                transform: 'perspective(200px) rotateX(-10deg)',
                            }}
                        />
                    )}

                    {/* Phone Notch (only for phone) */}
                    {config.deviceType === 'phone' && (
                        <div
                            style={{
                                position: 'absolute',
                                top: dims.bezel + 4,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 80,
                                height: 24,
                                background: '#000',
                                borderRadius: 12,
                            }}
                        />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};
