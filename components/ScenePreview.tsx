import React from 'react';
import { VideoScene } from '../types';
import { Eye } from 'lucide-react';

interface ScenePreviewProps {
    scene: VideoScene;
    sceneIndex: number;
    brandColor?: string;
}

export const ScenePreview: React.FC<ScenePreviewProps> = ({ scene, sceneIndex, brandColor }) => {
    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Eye size={16} className="text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Live Preview</h4>
                </div>
                <span className="text-xs text-slate-500">Scene #{sceneIndex + 1}</span>
            </div>

            {/* Preview Canvas */}
            <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        background: `linear-gradient(135deg, ${brandColor || '#3498db'} 0%, #1a1a2e 100%)`
                    }}
                />

                {/* Screenshot/Video Background */}
                {scene.screenshotUrl && (
                    <img
                        src={scene.screenshotUrl}
                        alt="Scene background"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}

                {/* Content Overlay */}
                <div className="relative z-10 text-center px-12 py-8 max-w-3xl">
                    {/* Main Text */}
                    {scene.mainText && (
                        <h1
                            className="text-4xl font-bold mb-4 leading-tight"
                            style={{ color: brandColor || '#3498db' }}
                        >
                            {scene.mainText}
                        </h1>
                    )}

                    {/* Sub Text */}
                    {scene.subText && (
                        <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                            {scene.subText}
                        </p>
                    )}

                    {/* CTA Button (if CTA scene) */}
                    {scene.type === 'cta_finale' && scene.ctaText && (
                        <button
                            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
                            style={{ backgroundColor: brandColor || '#3498db' }}
                        >
                            {scene.ctaText}
                        </button>
                    )}

                    {/* Scene Type Badge */}
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-slate-800/80 backdrop-blur-sm text-xs text-slate-300 rounded-full border border-slate-700">
                            {scene.type}
                        </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-slate-800/80 backdrop-blur-sm text-xs text-slate-300 rounded-full border border-slate-700">
                            {scene.duration}s
                        </span>
                    </div>
                </div>

                {/* Grid Overlay (subtle) */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="w-full h-full" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }} />
                </div>
            </div>

            {/* Preview Info */}
            <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Updates in real-time</span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </span>
                </div>
            </div>
        </div>
    );
};
