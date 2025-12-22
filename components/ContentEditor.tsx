import React, { useState } from 'react';
import { VideoPlan, VideoScene } from '../types';
import { SceneManagement } from './SceneManagement';
import { SceneEditorForm } from './TabbedSceneEditor';
import { Save, X, Settings, ArrowRight, Layers, Maximize2, Wand2, Image, Video, Music, User, Globe, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { generateVoiceover, generateSceneVideo } from '../services/wanxService';
import { SceneDetailModal } from './SceneDetailModal';
import { SceneRefiner } from '../services/SceneRefiner';

interface ContentEditorProps {
    plan: VideoPlan;
    onUpdate: (newPlan: VideoPlan) => void;
    currentSceneIndex: number;
    onSceneSelect: (index: number) => void;
    className?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
    plan,
    onUpdate,
    currentSceneIndex,
    onSceneSelect,
    className
}) => {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isRewriting, setIsRewriting] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'visual' | 'audio' | 'code'>('content');

    // Update Helpers
    const handleSceneUpdate = (updates: Partial<VideoScene>) => {
        const newScenes = [...plan.scenes];
        newScenes[currentSceneIndex] = { ...newScenes[currentSceneIndex], ...updates };
        onUpdate({ ...plan, scenes: newScenes });
    };

    const handleRegenerateVoice = async () => {
        const scene = plan.scenes[currentSceneIndex];
        if (!scene.voiceoverScript) return alert('No script to generate voice for.');

        setIsRegenerating(true);
        try {
            const url = await generateVoiceover(scene.voiceoverScript);
            if (url) handleSceneUpdate({ voiceoverUrl: url });
        } catch (e) {
            console.error(e);
            alert('Voice generation failed.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleMagicRewrite = async (field: 'mainText' | 'subText') => {
        const scene = plan.scenes[currentSceneIndex];
        const textToRewrite = scene[field] || '';
        if (!textToRewrite) return;

        setIsRewriting(prev => ({ ...prev, [field]: true }));
        try {
            const rewritten = await SceneRefiner.rewriteText(textToRewrite);
            handleSceneUpdate({ [field]: rewritten });
        } catch (e) {
            console.error(e);
        } finally {
            setIsRewriting(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleRegenerateVideo = async () => {
        const scene = plan.scenes[currentSceneIndex];
        const prompt = scene.wanPrompt || scene.visualDescription;
        if (!prompt) return alert('No visual description to generate video from.');

        setIsRegenerating(true);
        try {
            const url = await generateSceneVideo(prompt);
            if (url) handleSceneUpdate({ videoUrl: url });
        } catch (e) {
            console.error(e);
            alert('Video generation failed.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const scene = plan.scenes[currentSceneIndex];

    return (
        <div className={`flex flex-col h-full bg-slate-950/50 backdrop-blur-xl ${className}`}>
            {/* Context Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        <h2 className="text-xs font-bold text-white uppercase tracking-widest">Scene Properties</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                        #{currentSceneIndex + 1}
                    </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5">
                    {(['content', 'design', 'visual', 'audio', 'code'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
                {activeTab === 'content' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Copy & Headlines</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs text-slate-400 font-medium">Main Headline</label>
                                        <button
                                            onClick={() => handleMagicRewrite('mainText')}
                                            disabled={isRewriting['mainText']}
                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold uppercase transition-colors"
                                        >
                                            {isRewriting['mainText'] ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            Magic Rewrite
                                        </button>
                                    </div>
                                    <input
                                        value={scene.mainText || ''}
                                        onChange={e => handleSceneUpdate({ mainText: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Enter headline..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-xs text-slate-400 font-medium">Subtext / Description</label>
                                        <button
                                            onClick={() => handleMagicRewrite('subText')}
                                            disabled={isRewriting['subText']}
                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold uppercase transition-colors"
                                        >
                                            {isRewriting['subText'] ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            Magic Rewrite
                                        </button>
                                    </div>
                                    <textarea
                                        value={scene.subText || ''}
                                        onChange={e => handleSceneUpdate({ subText: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Enter subtext..."
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Scene Configuration</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">Duration (sec)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0.5"
                                        value={scene.duration}
                                        onChange={e => handleSceneUpdate({ duration: Math.max(0.5, Number(e.target.value)) })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">Scene Title</label>
                                    <input
                                        value={scene.title}
                                        onChange={e => handleSceneUpdate({ title: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'design' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Global Brand Settings</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">Brand Name</label>
                                    <input
                                        value={plan.brandName || ''}
                                        onChange={e => onUpdate({ ...plan, brandName: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={plan.globalDesign?.primaryColor || plan.brandColor || '#6366f1'}
                                                onChange={e => onUpdate({
                                                    ...plan,
                                                    brandColor: e.target.value,
                                                    globalDesign: { ...plan.globalDesign!, primaryColor: e.target.value }
                                                })}
                                                className="w-8 h-8 rounded-lg border-0 p-0 bg-transparent cursor-pointer"
                                            />
                                            <input
                                                value={plan.globalDesign?.primaryColor || plan.brandColor || '#6366f1'}
                                                onChange={e => onUpdate({
                                                    ...plan,
                                                    brandColor: e.target.value,
                                                    globalDesign: { ...plan.globalDesign!, primaryColor: e.target.value }
                                                })}
                                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Secondary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={plan.globalDesign?.secondaryColor || '#cbd5e1'}
                                                onChange={e => onUpdate({
                                                    ...plan,
                                                    globalDesign: { ...plan.globalDesign!, secondaryColor: e.target.value }
                                                })}
                                                className="w-8 h-8 rounded-lg border-0 p-0 bg-transparent cursor-pointer"
                                            />
                                            <input
                                                value={plan.globalDesign?.secondaryColor || '#cbd5e1'}
                                                onChange={e => onUpdate({
                                                    ...plan,
                                                    globalDesign: { ...plan.globalDesign!, secondaryColor: e.target.value }
                                                })}
                                                className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Accent Color</label>
                                        <input
                                            type="color"
                                            value={plan.globalDesign?.accentColor || plan.globalDesign?.primaryColor || '#6366f1'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, accentColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-lg border-0 p-0 bg-transparent cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Background</label>
                                        <input
                                            type="color"
                                            value={plan.globalDesign?.backgroundColor || '#0a0a0a'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, backgroundColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-lg border-0 p-0 bg-transparent cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Text Color</label>
                                        <input
                                            type="color"
                                            value={plan.globalDesign?.textColor || '#ffffff'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, textColor: e.target.value }
                                            })}
                                            className="w-full h-10 rounded-lg border-0 p-0 bg-transparent cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Typography & Style</label>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Heading Font</label>
                                        <select
                                            value={plan.globalDesign?.headingFont || 'Inter'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, headingFont: e.target.value as any }
                                            })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                        >
                                            <option value="Inter">Inter (Clean)</option>
                                            <option value="Roboto">Roboto (Modern)</option>
                                            <option value="Playfair Display">Playfair Display (Serif)</option>
                                            <option value="Montserrat">Montserrat (Geometric)</option>
                                            <option value="Lato">Lato (Balanced)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Body Font</label>
                                        <select
                                            value={plan.globalDesign?.bodyFont || plan.globalDesign?.headingFont || 'Inter'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, bodyFont: e.target.value as any }
                                            })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                        >
                                            <option value="Inter">Inter (Clean)</option>
                                            <option value="Roboto">Roboto (Modern)</option>
                                            <option value="Playfair Display">Playfair Display (Serif)</option>
                                            <option value="Montserrat">Montserrat (Geometric)</option>
                                            <option value="Lato">Lato (Balanced)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Animation Speed</label>
                                        <select
                                            value={plan.globalDesign?.animationSpeed || 'medium'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, animationSpeed: e.target.value as any }
                                            })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                        >
                                            <option value="slow">Slow</option>
                                            <option value="medium">Medium</option>
                                            <option value="fast">Fast</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Corner Rounding</label>
                                        <select
                                            value={plan.globalDesign?.borderRadius || 'medium'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, borderRadius: e.target.value as any }
                                            })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                        >
                                            <option value="none">Square</option>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="full">Round</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1">Transition Style</label>
                                        <select
                                            value={plan.globalDesign?.transitionStyle || 'slide'}
                                            onChange={e => onUpdate({
                                                ...plan,
                                                globalDesign: { ...plan.globalDesign!, transitionStyle: e.target.value as any }
                                            })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
                                        >
                                            <option value="slide">Slide</option>
                                            <option value="fade">Fade</option>
                                            <option value="wipe">Wipe</option>
                                            <option value="zoom">Zoom</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'visual' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Principal Assets</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-2">
                                        <Image size={12} className="text-indigo-400" />
                                        Main Screenshot URL
                                    </label>
                                    <input
                                        value={scene.screenshotUrl || ''}
                                        onChange={e => handleSceneUpdate({ screenshotUrl: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-slate-300 focus:border-indigo-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                                {scene.mobileScreenshotUrl !== undefined && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-2">
                                            <Globe size={12} className="text-emerald-400" />
                                            Mobile App View
                                        </label>
                                        <input
                                            value={scene.mobileScreenshotUrl || ''}
                                            onChange={e => handleSceneUpdate({ mobileScreenshotUrl: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-slate-300 focus:border-indigo-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Cinematic Background</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">Wan 2.1 AI Prompt</label>
                                    <textarea
                                        value={scene.wanPrompt || scene.visualDescription || ''}
                                        onChange={e => handleSceneUpdate({ wanPrompt: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all resize-none"
                                        placeholder="Describe the background scene..."
                                    />
                                </div>
                                <button
                                    onClick={handleRegenerateVideo}
                                    disabled={isRegenerating}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                                    Regenerate AI Background
                                </button>
                                {scene.videoUrl && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase">AI Video Background Active</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'audio' && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                        <section>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Voice Configuration</label>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1 flex items-center gap-2">
                                        <User size={12} className="text-indigo-400" />
                                        Artist / Voice Model
                                    </label>
                                    <select
                                        value={scene.voice || 'en-US-ChristopherNeural'}
                                        onChange={e => handleSceneUpdate({ voice: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="en-US-ChristopherNeural">Christopher (Professional)</option>
                                        <option value="en-US-EricNeural">Eric (Energetic)</option>
                                        <option value="en-US-AvaNeural">Ava (Friendly)</option>
                                        <option value="en-GB-SoniaNeural">Sonia (British / Sophisticated)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium ml-1">Voiceover Script</label>
                                    <textarea
                                        value={scene.voiceoverScript || ''}
                                        onChange={e => handleSceneUpdate({ voiceoverScript: e.target.value })}
                                        rows={6}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-indigo-200 focus:border-indigo-500 outline-none transition-all leading-relaxed"
                                        placeholder="Write the script for the AI to speak..."
                                    />
                                    <button
                                        onClick={handleRegenerateVoice}
                                        disabled={isRegenerating}
                                        className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                        {isRegenerating ? 'Generating...' : 'Record AI Voiceover'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-white/5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Background Score</label>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                                        <Music size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">Corporate Upbeat</p>
                                        <p className="text-[10px] text-slate-500 uppercase">Standard License</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                    <Settings size={16} />
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="h-full animate-in fade-in slide-in-from-right-2 duration-300">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Scene JSON (God Mode)</label>
                        <textarea
                            value={JSON.stringify(scene, null, 2)}
                            onChange={e => {
                                try {
                                    handleSceneUpdate(JSON.parse(e.target.value));
                                } catch (err) { }
                            }}
                            className="w-full h-[500px] bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-emerald-400 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Save size={14} className="text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Changes Auto-saved</span>
                </div>
            </div>
        </div>
    );
};
