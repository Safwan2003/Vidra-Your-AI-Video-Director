
import React, { useEffect, useState, useRef } from 'react';
import { VideoScene, CameraAngle, FloatingElement } from '../types';
import { MousePointer2, TrendingUp, Bell, CheckCircle, Zap, MessageCircle } from 'lucide-react';

interface PlayerProps {
    scene: VideoScene;
    isPlaying: boolean;
    onComplete: () => void;
    brandColor: string;
}

export const Player: React.FC<PlayerProps> = ({ scene, isPlaying, onComplete, brandColor }) => {
    const [progress, setProgress] = useState(0);
    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();
    const hasSpokenRef = useRef(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // --- ANIMATION LOOP ---
    const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = (time - startTimeRef.current) / 1000;
        const p = Math.min((elapsed / scene.duration) * 100, 100);
        setProgress(p);

        if (elapsed < scene.duration) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (isPlaying) onComplete();
        }
    };

    useEffect(() => {
        if (isPlaying) {
            startTimeRef.current = undefined;
            requestRef.current = requestAnimationFrame(animate);
            
            // Handle Custom Video Playback
            if (scene.customMediaType === 'video' && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
            }

            // TTS
            if (!hasSpokenRef.current) {
                const utterance = new SpeechSynthesisUtterance(scene.script);
                utterance.rate = 1.15; 
                utterance.pitch = 1.0;
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => 
                    v.name.includes('Google US English') || 
                    v.name.includes('Daniel')
                );
                if (preferredVoice) utterance.voice = preferredVoice;
                window.speechSynthesis.speak(utterance);
                hasSpokenRef.current = true;
            }

        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
            hasSpokenRef.current = false;
            
            if (videoRef.current) videoRef.current.pause();
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, scene]);

    useEffect(() => {
        setProgress(0);
        hasSpokenRef.current = false;
        window.speechSynthesis.cancel();
    }, [scene]);

    // --- 3D TRANSFORM HELPER ---
    const getRotationStyle = (angle?: CameraAngle) => {
        switch(angle) {
            case 'isometric_left': return { transform: 'rotateY(-25deg) rotateX(10deg) scale(0.9)' };
            case 'isometric_right': return { transform: 'rotateY(25deg) rotateX(10deg) scale(0.9)' };
            case 'cinematic_low': return { transform: 'rotateX(25deg) scale(0.95)' };
            case 'straight_on': return { transform: 'rotateY(0deg) rotateX(0deg)' };
            default: return { transform: 'rotateY(0deg) rotateX(0deg)' };
        }
    };

    // --- FLOATING WIDGET RENDERER ---
    const renderFloatingElement = (el: FloatingElement, idx: number) => {
        const delayStyle = { animationDelay: `${el.delay || 500}ms` };
        
        switch (el.type) {
            case 'stat_card':
                return (
                    <div key={idx} style={{ top: el.position.top, left: el.position.left, ...delayStyle }} 
                         className="absolute z-50 glass-panel rounded-lg p-3 flex items-center gap-3 animate-float-out origin-center shadow-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">{el.text}</p>
                            <p className="text-xl font-black text-white">{el.value}</p>
                        </div>
                    </div>
                );
            case 'notification':
                return (
                    <div key={idx} style={{ top: el.position.top, left: el.position.left, ...delayStyle }}
                         className="absolute z-50 glass-panel rounded-full py-2 px-4 flex items-center gap-2 animate-float-out shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <Bell size={12} fill="currentColor" />
                        </div>
                        <p className="text-sm font-medium text-white whitespace-nowrap">{el.text}</p>
                    </div>
                );
            case 'integration_icon':
                return (
                    <div key={idx} style={{ top: el.position.top, left: el.position.left, ...delayStyle }}
                         className="absolute z-40 w-12 h-12 bg-white rounded-xl shadow-2xl flex items-center justify-center animate-float-out">
                         {/* Placeholder for integration icons */}
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                    </div>
                );
            default: return null;
        }
    };

    const renderOrbitingIcons = () => {
        const icons = [<Zap />, <MessageCircle />, <TrendingUp />, <CheckCircle />];
        return (
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center transform-style-3d">
                <div className="w-[600px] h-[600px] border border-white/5 rounded-full absolute animate-spin duration-[20s]" style={{ transform: 'rotateX(70deg)'}}>
                     {icons.map((Icon, i) => (
                         <div key={i} className="absolute w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-white shadow-lg"
                              style={{ 
                                  top: '50%', left: '50%', 
                                  transform: `rotate(${i * 90}deg) translateX(300px) rotate(-${i * 90}deg) rotateX(-70deg)` // Counter rotate to keep upright
                              }}>
                             {Icon}
                         </div>
                     ))}
                </div>
            </div>
        )
    };

    // --- RENDERERS ---

    const renderKineticText = () => {
        const words = scene.mainText?.split(' ') || [];
        return (
            <div key={`kinetic-${scene.id}`} className="flex flex-col items-center justify-center text-center z-10 p-8 w-full perspective-[1000px]">
                <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-5 max-w-5xl leading-tight transform-style-3d">
                    {words.map((word, i) => {
                        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
                        const isHighlighted = scene.highlightedWords?.some(hw => cleanWord.toLowerCase().includes(hw.toLowerCase()));
                        
                        return (
                            <span 
                                key={i} 
                                style={{ animationDelay: `${i * 120}ms` }}
                                className={`
                                    text-6xl md:text-8xl font-black opacity-0 animate-word-reveal
                                    ${isHighlighted 
                                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 scale-110 inline-block transform drop-shadow-[0_10px_20px_rgba(99,102,241,0.5)]' 
                                        : 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]'}
                                `}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
                {scene.subText && (
                     <p className="mt-8 text-2xl md:text-3xl font-light text-slate-400 tracking-[0.2em] uppercase animate-slide-up animation-delay-500 opacity-0" style={{ animationFillMode: 'forwards' }}>
                        {scene.subText}
                    </p>
                )}
            </div>
        );
    };

    const renderUIMockup = () => {
        const rotation = getRotationStyle(scene.cameraAngle);

        return (
            <div key={`ui-${scene.id}`} className="relative w-full h-full flex items-center justify-center perspective-[2000px] overflow-visible">
                {/* 3D Transform Container */}
                <div 
                    className="relative w-full max-w-4xl transition-transform duration-1000 ease-out transform-style-3d"
                    style={rotation}
                >
                    {/* Floating Container */}
                    <div className="animate-float-slow transform-style-3d relative">
                        
                        {/* Shadow Plane */}
                        <div className="absolute -bottom-20 left-10 right-10 h-10 bg-black/40 blur-2xl rounded-[100%] transform rotateX(60deg)" />

                        {/* Floating Elements Layer (Parallax on top) */}
                        <div className="absolute inset-0 z-50 pointer-events-none transform translate-z-[50px]">
                             {scene.floatingElements?.map((el, i) => renderFloatingElement(el, i))}
                        </div>

                        {/* Main Interface */}
                        <div className="bg-slate-900 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-700/50 relative group backface-hidden ring-1 ring-white/10">
                            
                            {/* Header / Browser Chrome */}
                            <div className="bg-slate-900/90 backdrop-blur-md p-3 flex items-center gap-2 border-b border-white/5 relative z-10">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-black/40 px-6 py-1 rounded-md text-[10px] text-slate-400 font-mono w-64 text-center truncate flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                                        {window.location.host}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Content Window */}
                            <div className="bg-slate-950 aspect-[16/9] relative overflow-hidden">
                                 {/* Scroll Content OR Video */}
                                 <div className={`w-full ${scene.customMediaType === 'video' ? 'h-full' : 'animate-ui-scroll'}`}>
                                    {scene.customMedia ? (
                                        scene.customMediaType === 'video' ? (
                                            <video 
                                                ref={videoRef}
                                                src={scene.customMedia}
                                                className="w-full h-full object-cover"
                                                loop
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img 
                                                src={scene.customMedia} 
                                                alt="UI Screenshot" 
                                                className="w-full h-auto object-cover animate-fade-in"
                                            />
                                        )
                                    ) : (
                                        <div 
                                            className="w-full p-8"
                                            dangerouslySetInnerHTML={{ __html: scene.svgContent }}
                                            style={{ fill: 'currentColor' }} 
                                        />
                                    )}
                                 </div>
                                 
                                 {/* Cursor (Only if not video) */}
                                 {scene.customMediaType !== 'video' && (
                                     <div className="absolute z-30 top-1/2 left-1/2 w-8 h-8 pointer-events-none animate-cursor-move filter drop-shadow-xl">
                                        <MousePointer2 className="text-white fill-black" size={32} />
                                    </div>
                                 )}

                                 {/* Glass Sheen */}
                                <div className="absolute inset-0 z-20 pointer-events-none">
                                    <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] animate-sheen blur-sm" />
                                </div>
                                 
                                 {/* Inner Vignette */}
                                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Depth layers for 3D feel (Stack effect) */}
                        {scene.animationType === 'stack' && (
                             <div className="absolute top-4 left-4 -right-4 -bottom-4 bg-indigo-600/20 rounded-xl -z-10 blur-md transform translate-z-[-20px]" />
                        )}
                    </div>
                    
                    {/* Render Orbit if this is an ecosystem scene */}
                    {scene.visualDescription?.toLowerCase().includes('integration') && renderOrbitingIcons()}
                </div>
            </div>
        );
    };

    const renderIsometric = () => (
        <div key={`iso-${scene.id}`} className="relative w-full h-full flex items-center justify-center animate-iso-stack p-12 perspective-[1000px]">
             <div 
                className="w-full h-full max-h-[80%] animate-float-slow drop-shadow-[0_30px_60px_rgba(99,102,241,0.3)] transform-style-3d"
                dangerouslySetInnerHTML={{ __html: scene.svgContent }}
                style={{ color: brandColor, fill: brandColor }}
             />
             {/* Floor Reflection */}
             <div className="absolute bottom-20 w-64 h-8 bg-indigo-500/20 blur-3xl rounded-[100%] animate-pulse" />
        </div>
    );

    const renderBackgroundElements = () => {
        // If we have an AI generated background, use that instead of abstract orbs
        if (scene.backgroundUrl) {
            return (
                <div className="absolute inset-0 z-0">
                    <img 
                        src={scene.backgroundUrl} 
                        className="w-full h-full object-cover animate-pan-zoom opacity-60"
                        alt="AI Generated Background"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                </div>
            )
        }

        return (
            <>
                {/* Parallax Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-float-slow mix-blend-screen pointer-events-none transition-transform duration-[2000ms]" 
                     style={{ transform: isPlaying ? 'translateY(-20px)' : 'translateY(0)'}} />
                
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-float-reverse mix-blend-screen pointer-events-none" />
                
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] animate-float-slow delay-1000 mix-blend-screen pointer-events-none" />

                {/* Grid Floor */}
                <div className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-[3000ms]" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                     backgroundSize: '60px 60px',
                     transform: 'perspective(1000px) rotateX(40deg) scale(2) translateY(100px)',
                     maskImage: 'linear-gradient(to bottom, transparent, black)'
                 }} 
                />
            </>
        )
    }

    return (
        <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden shadow-2xl relative border border-slate-800 flex items-center justify-center group">
            {/* Dynamic Background Base */}
            <div className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-1000" 
                 style={{ 
                     background: scene.type === 'kinetic_text' 
                        ? `radial-gradient(circle at center, ${brandColor}22 0%, #0f172a 100%)` 
                        : 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
                 }} 
            />
            
            {renderBackgroundElements()}

            {/* Cinematic Overlays (The Tarka) */}
            <div className="absolute inset-0 pointer-events-none z-10 animate-film-grain opacity-30 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none z-10 animate-light-leak opacity-20 mix-blend-screen" />

            {/* Content Switcher */}
            <div className="w-full h-full flex items-center justify-center p-4 z-20">
                {scene.type === 'kinetic_text' && renderKineticText()}
                {scene.type === 'ui_mockup' && renderUIMockup()}
                {scene.type === 'isometric_illustration' && renderIsometric()}
            </div>

            {/* Cinematic Letterbox Bars (Optional Polish) */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-30" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-30" />

            {/* Captions / Subtitles (Only if not kinetic) */}
            {scene.type !== 'kinetic_text' && (
                <div className="absolute bottom-12 left-0 right-0 px-12 text-center z-40">
                    <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/5 shadow-2xl transform transition-all hover:scale-105">
                        <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow-lg tracking-wide">
                            {scene.script}
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            {/* REC Indicator */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-40 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
                 <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse shadow-[0_0_8px_red]' : 'bg-slate-500'}`} />
                 <span className="text-[10px] font-mono text-slate-300 font-medium tracking-wide">REC • 4K</span>
            </div>
        </div>
    );
};
