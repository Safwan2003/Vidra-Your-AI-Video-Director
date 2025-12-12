import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { ParticleEffect } from '../../../types';

interface ParticleSystemProps {
    effects?: ParticleEffect[];
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ effects }) => {
    const frame = useCurrentFrame();

    if (!effects || effects.length === 0) return null;

    return (
        <AbsoluteFill className="pointer-events-none z-20">
            {effects.map((effect, effectIndex) => {
                const particleCount = effect.density === 'high' ? 30 : effect.density === 'medium' ? 20 : 10;

                switch (effect.type) {
                    case 'floating_dots':
                        return (
                            <React.Fragment key={`floating-${effectIndex}`}>
                                {[...Array(particleCount)].map((_, i) => {
                                    const yOffset = interpolate(
                                        frame,
                                        [0, 90],
                                        [0, -150],
                                        { extrapolateRight: 'wrap' }
                                    );
                                    const xSway = Math.sin((frame + i * 10) * 0.05) * 20;

                                    return (
                                        <div
                                            key={i}
                                            className="absolute rounded-full"
                                            style={{
                                                width: `${3 + (i % 4)}px`,
                                                height: `${3 + (i % 4)}px`,
                                                left: `${(i * 7 + 10) % 90}%`,
                                                top: `${(i * 13 + 20) % 100}%`,
                                                backgroundColor: effect.color,
                                                opacity: 0.2 + (i % 3) * 0.15,
                                                transform: `translate(${xSway}px, ${yOffset + (i * 5)}px)`,
                                                filter: 'blur(1px)',
                                                boxShadow: `0 0 10px ${effect.color}40`
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'light_rays':
                        return (
                            <React.Fragment key={`rays-${effectIndex}`}>
                                {[...Array(Math.min(particleCount, 8))].map((_, i) => {
                                    const opacity = interpolate(
                                        frame,
                                        [i * 15, i * 15 + 30, i * 15 + 60],
                                        [0, 0.3, 0],
                                        { extrapolateRight: 'wrap' }
                                    );

                                    return (
                                        <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                width: '2px',
                                                height: '100%',
                                                left: `${10 + i * 12}%`,
                                                top: 0,
                                                background: `linear-gradient(180deg, transparent, ${effect.color}, transparent)`,
                                                opacity,
                                                transform: `rotate(${-15 + i * 5}deg)`,
                                                transformOrigin: 'top center',
                                                filter: 'blur(2px)'
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'glow_orbs':
                        return (
                            <React.Fragment key={`orbs-${effectIndex}`}>
                                {[...Array(Math.min(particleCount, 12))].map((_, i) => {
                                    const scale = interpolate(
                                        frame,
                                        [i * 10, i * 10 + 30, i * 10 + 60],
                                        [1, 1.3, 1],
                                        { extrapolateRight: 'wrap' }
                                    );
                                    const opacity = interpolate(
                                        frame,
                                        [i * 10, i * 10 + 30, i * 10 + 60],
                                        [0.1, 0.3, 0.1],
                                        { extrapolateRight: 'wrap' }
                                    );

                                    return (
                                        <div
                                            key={i}
                                            className="absolute rounded-full"
                                            style={{
                                                width: `${60 + (i % 3) * 20}px`,
                                                height: `${60 + (i % 3) * 20}px`,
                                                left: `${(i * 11 + 5) % 85}%`,
                                                top: `${(i * 17 + 10) % 80}%`,
                                                background: `radial-gradient(circle, ${effect.color}, transparent 70%)`,
                                                opacity,
                                                transform: `scale(${scale})`,
                                                filter: 'blur(30px)',
                                                mixBlendMode: 'screen'
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'sparkles':
                        return (
                            <React.Fragment key={`sparkles-${effectIndex}`}>
                                {[...Array(particleCount)].map((_, i) => {
                                    const appearFrame = (i * 5) % 90;
                                    const opacity = interpolate(
                                        frame,
                                        [appearFrame, appearFrame + 5, appearFrame + 15],
                                        [0, 1, 0],
                                        { extrapolateRight: 'wrap' }
                                    );
                                    const scale = interpolate(
                                        frame,
                                        [appearFrame, appearFrame + 5, appearFrame + 15],
                                        [0, 1, 0.5],
                                        { extrapolateRight: 'wrap' }
                                    );

                                    return (
                                        <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                left: `${(i * 7 + 15) % 90}%`,
                                                top: `${(i * 11 + 10) % 85}%`,
                                                opacity,
                                                transform: `scale(${scale}) rotate(${frame * 2}deg)`
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12">
                                                <path
                                                    d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z"
                                                    fill={effect.color}
                                                    style={{ filter: `drop-shadow(0 0 3px ${effect.color})` }}
                                                />
                                            </svg>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'confetti':
                        return (
                            <React.Fragment key={`confetti-${effectIndex}`}>
                                {[...Array(particleCount * 2)].map((_, i) => {
                                    const startX = 10 + (i * 17) % 80;
                                    const startY = -10;
                                    const fallSpeed = 2 + (i % 5);
                                    const swayAmplitude = 30 + (i % 3) * 20;
                                    const swayFrequency = 0.02 + (i % 4) * 0.01;
                                    const rotation = frame * (5 + (i % 10));

                                    const yPos = startY + (frame * fallSpeed * 0.5);
                                    const xSway = Math.sin(frame * swayFrequency + i) * swayAmplitude;
                                    const opacity = yPos > 120 ? 0 : 1;

                                    const colors = [effect.color, effect.secondaryColor || '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
                                    const confettiColor = colors[i % colors.length];
                                    const isCircle = i % 3 === 0;

                                    return (
                                        <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                left: `${startX}%`,
                                                top: `${yPos}%`,
                                                width: isCircle ? 8 : 12,
                                                height: isCircle ? 8 : 6,
                                                backgroundColor: confettiColor,
                                                borderRadius: isCircle ? '50%' : 2,
                                                transform: `translateX(${xSway}px) rotate(${rotation}deg)`,
                                                opacity,
                                                boxShadow: `0 2px 4px rgba(0,0,0,0.2)`
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'connection_lines':
                        // Network visualization - nodes connected by lines
                        const nodes = [...Array(Math.min(particleCount, 8))].map((_, i) => ({
                            x: 15 + (i * 13) % 70,
                            y: 20 + (i * 17) % 60,
                            id: i
                        }));

                        return (
                            <React.Fragment key={`connections-${effectIndex}`}>
                                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                                    {/* Connection lines */}
                                    {nodes.map((node, i) =>
                                        nodes.slice(i + 1).filter((_, j) => j < 2).map((target, j) => {
                                            const lineProgress = interpolate(
                                                frame,
                                                [i * 10, i * 10 + 30],
                                                [0, 1],
                                                { extrapolateRight: 'clamp' }
                                            );
                                            const lineOpacity = interpolate(
                                                frame,
                                                [i * 10, i * 10 + 20],
                                                [0, 0.4],
                                                { extrapolateRight: 'clamp' }
                                            );

                                            const x1 = `${node.x}%`;
                                            const y1 = `${node.y}%`;
                                            const x2 = `${node.x + (target.x - node.x) * lineProgress}%`;
                                            const y2 = `${node.y + (target.y - node.y) * lineProgress}%`;

                                            return (
                                                <line
                                                    key={`${i}-${j}`}
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke={effect.color}
                                                    strokeWidth={1}
                                                    opacity={lineOpacity}
                                                />
                                            );
                                        })
                                    )}
                                </svg>
                                {/* Nodes */}
                                {nodes.map((node, i) => {
                                    const nodeOpacity = interpolate(
                                        frame,
                                        [i * 8, i * 8 + 15],
                                        [0, 1],
                                        { extrapolateRight: 'clamp' }
                                    );
                                    const pulse = 1 + Math.sin((frame + i * 10) * 0.1) * 0.2;

                                    return (
                                        <div
                                            key={i}
                                            className="absolute rounded-full"
                                            style={{
                                                left: `${node.x}%`,
                                                top: `${node.y}%`,
                                                width: 12,
                                                height: 12,
                                                backgroundColor: effect.color,
                                                opacity: nodeOpacity,
                                                transform: `translate(-50%, -50%) scale(${pulse})`,
                                                boxShadow: `0 0 20px ${effect.color}80`
                                            }}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        );

                    case 'data_streams':
                        // Flowing data visualization
                        return (
                            <React.Fragment key={`streams-${effectIndex}`}>
                                {[...Array(Math.min(particleCount, 6))].map((_, streamIndex) => {
                                    const streamX = 10 + streamIndex * 15;

                                    return (
                                        <React.Fragment key={streamIndex}>
                                            {[...Array(8)].map((_, dotIndex) => {
                                                const dotOffset = (frame * 3 + dotIndex * 15) % 120;
                                                const dotOpacity = interpolate(
                                                    dotOffset,
                                                    [0, 20, 100, 120],
                                                    [0, 0.8, 0.8, 0],
                                                    { extrapolateRight: 'clamp' }
                                                );

                                                return (
                                                    <div
                                                        key={`${streamIndex}-${dotIndex}`}
                                                        className="absolute rounded-full"
                                                        style={{
                                                            left: `${streamX}%`,
                                                            top: `${dotOffset}%`,
                                                            width: 4,
                                                            height: 4,
                                                            backgroundColor: effect.color,
                                                            opacity: dotOpacity,
                                                            boxShadow: `0 0 8px ${effect.color}`
                                                        }}
                                                    />
                                                );
                                            })}
                                            {/* Stream line */}
                                            <div
                                                className="absolute"
                                                style={{
                                                    left: `${streamX}%`,
                                                    top: 0,
                                                    width: 1,
                                                    height: '100%',
                                                    background: `linear-gradient(180deg, transparent 0%, ${effect.color}20 20%, ${effect.color}20 80%, transparent 100%)`,
                                                    opacity: 0.5
                                                }}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        );

                    default:
                        return null;
                }
            })}
        </AbsoluteFill>
    );
};
