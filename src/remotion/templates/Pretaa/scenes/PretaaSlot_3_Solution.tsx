import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';
import { Canvas } from '@react-three/fiber';
import { IsometricClayLaptop } from '../../Viable/components/IsometricClayLaptop';

// Animated Letter Reveal
const AnimatedLetter = ({ letter, index, delay, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
    const translateY = interpolate(frame, [delay, delay + 15], [20, 0], { easing: Easing.out(Easing.cubic) });
    const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });

    return (
        <span style={{
            display: 'inline-block',
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            color,
            marginRight: 2
        }}>
            {letter}
        </span>
    );
};

export const PretaaSlot3Solution = ({
    solutionText = "Solution",
    tagline = "The Solution Is Here",
    accentColor = "#1e1b4b",
    screenshotUrl
}: { solutionText?: string, tagline?: string, accentColor?: string, screenshotUrl?: string }) => {
    const frame = useCurrentFrame();

    // Split text for animation
    const letters = (solutionText || "Solution").split('');

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            overflow: 'hidden'
        }}>
            {/* Background Ambience */}
            <AbsoluteFill>
                <div style={{
                    position: 'absolute', top: '20%', left: '10%',
                    width: 700, height: 700, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)',
                    filter: 'blur(100px)'
                }} />
            </AbsoluteFill>

            {/* Logo Text Container - Moved Up */}
            <div style={{
                textAlign: 'center', zIndex: 10, position: 'absolute', top: '10%', width: '100%'
            }}>
                <h1 style={{
                    fontSize: 100, fontWeight: 800, color: accentColor,
                    margin: 0, letterSpacing: '-4px', fontFamily: 'sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {letters.map((char, i) => (
                        <AnimatedLetter
                            key={i}
                            letter={char}
                            index={i}
                            delay={10 + i * 4}
                            color={accentColor}
                        />
                    ))}
                </h1>
            </div>

            {/* 3D Laptop Display */}
            <div style={{
                position: 'absolute',
                top: '25%',
                width: '100%',
                height: '75%',
                zIndex: 20
            }}>
                <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <IsometricClayLaptop
                        scale={1.2}
                        screenContent={
                            screenshotUrl ? (
                                <img src={screenshotUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : undefined
                        }
                    />
                </Canvas>
            </div>
        </AbsoluteFill>
    );
};
