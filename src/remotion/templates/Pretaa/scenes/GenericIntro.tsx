import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Img, random } from 'remotion';

// --- Subcomponents (Kept the same for visual consistency) ---

const ConfusionParticles = ({ x, y, delay, colors }: any) => {
    const frame = useCurrentFrame();
    const particles = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            angle: random(`a-${i}`) * Math.PI * 2,
            speed: random(`s-${i}`) * 5 + 2,
            size: random(`z-${i}`) * 1.5 + 1,
            char: ['?', '!', '#', '*'][Math.floor(random(`c-${i}`) * 4)],
            color: colors[Math.floor(random(`col-${i}`) * colors.length)]
        })), [colors]
    );

    if (frame < delay) return null;

    return (
        <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, zIndex: 20 }}>
            {particles.map((p, i) => {
                const t = frame - delay;
                const opacity = interpolate(t, [0, 20], [1, 0]);
                const scale = interpolate(t, [0, 5, 20], [0, 1.2, 0]);
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        transform: `translate(${Math.cos(p.angle) * t * p.speed}px, ${Math.sin(p.angle) * t * p.speed}px) scale(${scale})`,
                        fontSize: p.size * 10,
                        fontWeight: 900,
                        color: p.color,
                        opacity
                    }}>
                        {p.char}
                    </div>
                );
            })}
        </div>
    );
};

const StressLine = ({ x1, y1, x2, y2, delay, color }: any) => {
    const frame = useCurrentFrame();
    const sx1 = x1 * 19.2, sy1 = y1 * 10.8, sx2 = x2 * 19.2, sy2 = y2 * 10.8;
    const cx = (sx1 + sx2) / 2, cy = (sy1 + sy2) / 2 + 60;
    const draw = interpolate(frame, [delay, delay + 30], [1000, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
    const stress = (frame - delay - 30) % 60;
    const stressOffset = interpolate(stress, [0, 60], [1000, -1000]);

    return (
        <svg style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible', zIndex: 1 }}>
            <path d={`M ${sx1} ${sy1} Q ${cx} ${cy} ${sx2} ${sy2}`} fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="10 10" strokeDashoffset={draw} strokeLinecap="round" />
            {frame > delay + 30 && (
                <path d={`M ${sx1} ${sy1} Q ${cx} ${cy} ${sx2} ${sy2}`} fill="none" stroke={color} strokeWidth="4" strokeDasharray="40 1000" strokeDashoffset={stressOffset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
            )}
        </svg>
    );
};

const Avatar = ({ x, y, color, delay, imgSrc }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
    const talking = Math.sin((frame + delay) * 0.8) * 0.03 + 1;

    return (
        <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 160, height: 160, transform: `translate(-50%, -50%) scale(${scale * talking})`, zIndex: 10 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: `5px solid ${color}`, position: 'relative' }}>
                    {imgSrc ? <Img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
                </div>
            </div>
        </div>
    );
};

const ChatBubble = ({ x, y, text, delay, direction = 'left', active = false, color }: any) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 180 } });

    if (frame < delay) return null;

    return (
        <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(${direction === 'left' ? '0' : '-100%'}, -50%) scale(${scale})`, transformOrigin: direction === 'left' ? 'center left' : 'center right', zIndex: 15 }}>
            <div style={{ background: active ? '#fef2f2' : 'white', border: active ? `2px solid ${color}` : 'none', padding: '18px 36px', borderRadius: '28px', borderTopLeftRadius: direction === 'left' ? '4px' : '28px', borderTopRightRadius: direction === 'right' ? '4px' : '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10, color: active ? color : '#334155' }}>
                <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '2px', fontFamily: 'monospace' }}>{text}</span>
            </div>
            <ConfusionParticles x={direction === 'left' ? 100 : 0} y={50} delay={delay + 5} colors={[color, '#f59e0b', '#64748b']} />
        </div>
    );
};

// --- Main Component ---

interface GenericIntroProps {
    brandColor: string;
    avatars?: string[]; // Array of URLs
    bubbles?: string[]; // Array of text strings
}

export const GenericIntro: React.FC<GenericIntroProps> = ({
    brandColor = '#ef4444',
    avatars = [],
    bubbles = ['@#*!?', '$$$!!', '?? %', '#!@', '...']
}) => {
    // Default avatar placeholders if not provided
    const safeAvatars = [
        avatars[0] || 'https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg',
        avatars[1] || 'https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg',
        avatars[2] || 'https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-neck_23-2148160166.jpg',
        avatars[3] || 'https://img.freepik.com/free-photo/young-woman-with-round-glasses-yellow-sweater_273609-7091.jpg'
    ];

    return (
        <AbsoluteFill style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', overflow: 'hidden' }}>
            <AbsoluteFill>
                <div style={{ position: 'absolute', top: -200, right: -200, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${brandColor}10, transparent 70%)`, filter: 'blur(100px)' }} />
                <div style={{ position: 'absolute', bottom: -150, left: -150, width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)', filter: 'blur(100px)' }} />
            </AbsoluteFill>

            {/* Connecting Lines */}
            <StressLine x1={25} y1={50} x2={45} y2={30} delay={20} color={brandColor} />
            <StressLine x1={45} y1={30} x2={65} y2={35} delay={25} color={brandColor} />
            <StressLine x1={65} y1={35} x2={75} y2={60} delay={28} color={brandColor} />
            <StressLine x1={25} y1={50} x2={75} y2={60} delay={30} color={brandColor} />

            {/* Avatars */}
            <Avatar x={25} y={50} color='#fbbf24' delay={10} imgSrc={safeAvatars[0]} />
            <Avatar x={45} y={30} color={brandColor} delay={15} imgSrc={safeAvatars[1]} />
            <Avatar x={65} y={35} color='#3b82f6' delay={12} imgSrc={safeAvatars[2]} />
            <Avatar x={75} y={60} color='#ec4899' delay={18} imgSrc={safeAvatars[3]} />

            {/* Bubbles - Using provided text or defaults */}
            <ChatBubble x={25} y={35} text={bubbles[0]} dir='left' delay={35} active color={brandColor} />
            <ChatBubble x={52} y={18} text={bubbles[1]} dir='left' delay={45} active color={brandColor} />
            <ChatBubble x={72} y={22} text={bubbles[2]} dir='right' delay={50} color={brandColor} />
            <ChatBubble x={82} y={48} text={bubbles[3]} dir='right' delay={55} active color={brandColor} />
            <ChatBubble x={38} y={65} text={bubbles[4]} dir='right' delay={60} color={brandColor} />

        </AbsoluteFill>
    );
};
