import React, { useState } from 'react';
import { FileText, Clock, Palette, Volume2, Sparkles } from 'lucide-react';
import { VideoScene } from '../types';
import { DurationSlider } from './DurationSlider';

interface TabbedSceneEditorProps {
    scene: VideoScene;
    sceneIndex: number;
    onUpdate: (updates: Partial<VideoScene>) => void;
    onRegenerateVoice?: () => void;
}

type Tab = 'content' | 'timing' | 'visual' | 'audio';

export const TabbedSceneEditor: React.FC<TabbedSceneEditorProps> = ({
    scene,
    sceneIndex,
    onUpdate,
    onRegenerateVoice,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('content');

    const tabs = [
        { id: 'content' as Tab, label: 'Content', icon: FileText },
        { id: 'timing' as Tab, label: 'Timing', icon: Clock },
        { id: 'visual' as Tab, label: 'Visual', icon: Palette },
        { id: 'audio' as Tab, label: 'Audio', icon: Volume2 },
    ];

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Scene Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Scene #{sceneIndex + 1}</h3>
                        <p className="text-xs text-slate-400">{scene.type} • {scene.duration}s</p>
                    </div>
                </div>
            </div>

            {/* Tab Headers */}
            <div className="flex border-b border-slate-800 bg-slate-900/50">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 relative ${isActive
                                    ? 'text-white bg-slate-800'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6 bg-slate-950">
                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <>
                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Scene Title
                            </label>
                            <input
                                type="text"
                                value={scene.title || ''}
                                onChange={(e) => onUpdate({ title: e.target.value })}
                                placeholder="Enter scene title..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Main Text / Headline
                            </label>
                            <input
                                type="text"
                                value={scene.mainText || ''}
                                onChange={(e) => onUpdate({ mainText: e.target.value })}
                                placeholder="Enter main text..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <div className="text-xs text-slate-500 mt-2">
                                {(scene.mainText || '').length} characters
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Sub Text / Description
                            </label>
                            <textarea
                                value={scene.subText || ''}
                                onChange={(e) => onUpdate({ subText: e.target.value })}
                                placeholder="Enter sub text..."
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                            />
                        </div>

                        {scene.type === 'cta_finale' && (
                            <div>
                                <label className="text-sm font-semibold text-white block mb-3">
                                    Call to Action Text
                                </label>
                                <input
                                    type="text"
                                    value={scene.ctaText || ''}
                                    onChange={(e) => onUpdate({ ctaText: e.target.value })}
                                    placeholder="e.g., Get Started"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        )}
                    </>
                )}

                {/* TIMING TAB */}
                {activeTab === 'timing' && (
                    <>
                        <DurationSlider
                            value={scene.duration || 5}
                            onChange={(value) => onUpdate({ duration: value })}
                            min={3}
                            max={10}
                            label="Scene Duration"
                        />

                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Scene Type
                            </label>
                            <select
                                value={scene.type}
                                onChange={(e) => onUpdate({ type: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value="kinetic_typo">Kinetic Typography</option>
                                <option value="device_showcase">Device Showcase</option>
                                <option value="bento_grid">Bento Grid</option>
                                <option value="social_proof">Social Proof</option>
                                <option value="cta_finale">CTA Finale</option>
                                <option value="slot_intro">Intro</option>
                                <option value="slot_transition">Transition</option>
                            </select>
                        </div>

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                            <div className="text-sm text-indigo-300">
                                💡 <strong>Tip:</strong> Shorter scenes (3-5s) work best for high-energy content. Longer scenes (6-10s) are better for detailed explanations.
                            </div>
                        </div>
                    </>
                )}

                {/* VISUAL TAB */}
                {activeTab === 'visual' && (
                    <>
                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Screenshot URL
                            </label>
                            <input
                                type="url"
                                value={scene.screenshotUrl || ''}
                                onChange={(e) => onUpdate({ screenshotUrl: e.target.value })}
                                placeholder="https://example.com/screenshot.png"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {scene.screenshotUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-700">
                                <img
                                    src={scene.screenshotUrl}
                                    alt="Scene screenshot"
                                    className="w-full h-auto"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Background Video URL (Wanx)
                            </label>
                            <input
                                type="url"
                                value={scene.videoUrl || ''}
                                onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                                placeholder="https://example.com/video.mp4"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </>
                )}

                {/* AUDIO TAB */}
                {activeTab === 'audio' && (
                    <>
                        <div>
                            <label className="text-sm font-semibold text-white block mb-3">
                                Voiceover Script
                            </label>
                            <textarea
                                value={scene.voiceoverScript || ''}
                                onChange={(e) => onUpdate({ voiceoverScript: e.target.value })}
                                placeholder="Enter voiceover script..."
                                rows={6}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm transition-all"
                            />
                            <div className="text-xs text-slate-500 mt-2">
                                {(scene.voiceoverScript || '').split(' ').filter(Boolean).length} words
                            </div>
                        </div>

                        {scene.voiceoverUrl && (
                            <div>
                                <label className="text-sm font-semibold text-white block mb-3">
                                    Current Voiceover
                                </label>
                                <audio
                                    src={scene.voiceoverUrl}
                                    controls
                                    className="w-full rounded-xl"
                                />
                            </div>
                        )}

                        {onRegenerateVoice && (
                            <button
                                onClick={onRegenerateVoice}
                                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 font-medium"
                            >
                                <Volume2 size={16} />
                                Regenerate Voiceover
                            </button>
                        )}

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <div className="text-sm text-amber-300">
                                ⚠️ <strong>Note:</strong> Regenerating voiceover will use TTS credits. Make sure your script is finalized before regenerating.
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
