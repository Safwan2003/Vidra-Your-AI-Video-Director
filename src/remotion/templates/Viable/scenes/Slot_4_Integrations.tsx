import React, { useRef, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';

// Real Integration Partners for "Viable"
const APPS = [
    { label: "Zendesk", color: "#03363d", bg: "#f0fdf4", pos: [2, 1, 0] },
    { label: "Gong", color: "#8b5cf6", bg: "#f5f3ff", pos: [-2, 2, 1] },
    { label: "Salesforce", color: "#00a1e0", bg: "#f0f9ff", pos: [3, -1, 2] },
    { label: "Slack", color: "#e01e5a", bg: "#fff1f2", pos: [-3, -1, -1] },
    { label: "Intercom", color: "#1f1f1f", bg: "#f9fafb", pos: [0, 2, -2] },
    { label: "Jira", color: "#0052cc", bg: "#eff6ff", pos: [-1.5, -2, 1.5] },
    { label: "HubSpot", color: "#ff7a59", bg: "#fff7ed", pos: [1.5, -1.5, -1] },
    { label: "Typeform", color: "#262627", bg: "#fafafa", pos: [2.5, 1.5, -2] }
];

const NetworkCloud = () => {
    const group = useRef<THREE.Group>(null);
    const frame = useCurrentFrame();

    useFrame(() => {
        if (group.current) {
            group.current.rotation.y = frame * 0.002; // Very slow drift
        }
    });

    // Generate dynamic connections
    const connections = useMemo(() => {
        const lines: any[] = [];
        APPS.forEach((app, i) => {
            APPS.forEach((other, j) => {
                if (i < j && Math.random() > 0.6) { // Random connections
                    lines.push({ start: app.pos, end: other.pos });
                }
            });
        });
        return lines;
    }, []);

    return (
        <group ref={group}>
            {/* Connecting Lines */}
            {connections.map((line, i) => (
                <Line
                    key={i}
                    points={[line.start, line.end]}
                    color="#9ca3af"
                    opacity={0.2}
                    transparent
                    lineWidth={1}
                />
            ))}

            {/* App Nodes */}
            {APPS.map((app, i) => {
                return (
                    <group key={i} position={app.pos as [number, number, number]}>
                        <Html transform>
                            <div style={{
                                width: '120px', height: '120px',
                                background: app.bg,
                                borderRadius: '28px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                                border: `2px solid ${app.color}20`,
                                animation: `float ${3 + i}s ease-in-out infinite`
                            }}>
                                <div style={{
                                    fontSize: '48px', fontWeight: '900', color: app.color,
                                    textShadow: `0 4px 10px ${app.color}40`
                                }}>
                                    {app.label[0]}
                                </div>
                                <div style={{ fontSize: '12px', marginTop: '6px', fontWeight: '700', color: '#64748b' }}>
                                    {app.label}
                                </div>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

export const Slot4Integrations: React.FC = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}>
            {/* Background Title */}
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                <div style={{
                    fontSize: '250px', fontWeight: '900', color: '#64748b',
                    opacity: 0.03, letterSpacing: '-15px', lineHeight: 0.8, textAlign: 'center'
                }}>
                    DATA<br />SOURCES
                </div>
            </AbsoluteFill>

            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={1} />
                <Environment preset="city" />
                <NetworkCloud />
            </Canvas>
        </AbsoluteFill>
    );
};
