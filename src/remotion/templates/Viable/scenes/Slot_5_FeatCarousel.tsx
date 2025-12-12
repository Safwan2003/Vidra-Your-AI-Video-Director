import React, { useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Real "Voice of Customer" Feedback
const REVIEWS = [
    { text: "Love the new dark mode!", user: "Sarah J.", role: "Designer", stars: 5, color: "#10b981" },
    { text: "Notifications are broken.", user: "Mike T.", role: "DevOps", stars: 1, color: "#ef4444" },
    { text: "Pricing is a bit steep.", user: "Alex R.", role: "Manager", stars: 3, color: "#f59e0b" },
    { text: "Best analytics tool.", user: "Emily C.", role: "Growth", stars: 5, color: "#10b981" },
    { text: "Where is the API doc?", user: "David K.", role: "Engineer", stars: 2, color: "#ef4444" },
    { text: "Huge time saver for us.", user: "Lisa M.", role: "Product", stars: 5, color: "#10b981" },
];

const ReviewCarousel = () => {
    const group = useRef<THREE.Group>(null);
    const frame = useCurrentFrame();

    useFrame(() => {
        if (group.current) {
            group.current.rotation.y = frame * 0.003;
        }
    });

    return (
        <group ref={group}>
            {REVIEWS.map((review, i) => {
                const angle = (i / REVIEWS.length) * Math.PI * 2;
                const radius = 5.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = Math.sin(i * 1.5 + frame * 0.02) * 0.5;

                return (
                    <group key={i} position={[x, y, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
                        <Html transform position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
                            {/* Detailed Review Card */}
                            <div style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '16px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                width: '300px',
                                display: 'flex', flexDirection: 'column', gap: '12px'
                            }}>
                                {/* Header: User & Stars */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                            {review.user[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937' }}>{review.user}</div>
                                            <div style={{ fontSize: '10px', color: '#6b7280' }}>{review.role}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[...Array(5)].map((_, si) => (
                                            <div key={si} style={{ color: si < review.stars ? '#f59e0b' : '#e5e7eb', fontSize: '12px' }}>★</div>
                                        ))}
                                    </div>
                                </div>

                                {/* The Quote */}
                                <div style={{
                                    fontSize: '14px', lineHeight: '1.4', color: '#374151', fontStyle: 'italic',
                                    background: '#f9fafb', padding: '10px', borderRadius: '8px',
                                    borderLeft: `3px solid ${review.color}`
                                }}>
                                    "{review.text}"
                                </div>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

const UserSilhouette = () => {
    return (
        <group position={[0, -2, 0]}>
            {/* Simple visual proxy for "The User" */}
            <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
                <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <Html transform position={[0, 2.8, 0]} style={{ pointerEvents: 'none' }}>
                <div style={{
                    width: '150px', height: '350px',
                    background: 'linear-gradient(to bottom, #94a3b8, #cbd5e1)',
                    borderRadius: '100px',
                    opacity: 0.8, filter: 'blur(1px)'
                }} />
            </Html>
        </group>
    );
}

export const Slot5FeatCarousel: React.FC = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(to bottom, #f3f4f6 0%, #e5e7eb 100%)'
        }}>
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: '-350px' }}>
                <div style={{
                    fontSize: '32px', fontWeight: '800', color: '#1f2937',
                    textTransform: 'uppercase', letterSpacing: '2px'
                }}>
                    Real Customer Insights
                </div>
            </AbsoluteFill>

            <Canvas camera={{ position: [0, 1.5, 11], fov: 40 }}>
                <ambientLight intensity={1} />
                <Environment preset="studio" />

                <ReviewCarousel />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <UserSilhouette />
                </Float>

                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={15} blur={2} color="#334155" />
            </Canvas>
        </AbsoluteFill>
    );
};
