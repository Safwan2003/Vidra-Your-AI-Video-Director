import React, { useState } from 'react';
import { AlignLeft, Image as ImageIcon, Volume2, Sparkles, ChevronDown, ChevronRight, Clock, Layout, MonitorPlay, MousePointerClick } from 'lucide-react';
import { VideoScene } from '../types';

interface SceneEditorFormProps {
    scene: VideoScene;
    sceneIndex: number;
    onUpdate: (updates: Partial<VideoScene>) => void;
    onRegenerateVoice?: () => void;
}

const AccordionSection = ({
    title,
    icon: Icon,
    children,
    isOpen,
    onToggle,
    summary
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    summary?: string;
}) => (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-all duration-300 hover:border-slate-700">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 text-left group"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-300'}`}>
                    <Icon size={16} />
                </div>
                <div>
                    <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {title}
                    </span>
                    {summary && !isOpen && (
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{summary}</p>
                    )}
                </div>
            </div>
            {isOpen ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} className="text-slate-600" />}
        </button>

        {isOpen && (
            <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-4 pt-2 border-t border-slate-800/50">
                    {children}
                </div>
            </div>
        )}
    </div>
);

export const SceneEditorForm: React.FC<SceneEditorFormProps> = ({
    scene,
    sceneIndex,
    onUpdate,
    onRegenerateVoice,
}) => {
    // Default to 'content' open as it's the most edited
    const [openSection, setOpenSection] = useState<'config' | 'content' | 'visuals' | 'audio'>('content');

    const toggle = (section: typeof openSection) => {
        setOpenSection(openSection === section ? 'config' : section);
    };

    return (
        <div className="space-y-3 pb-20">
            {/* Quick Config */}
            <AccordionSection
                title="Scene Config"
                icon={Layout}
                isOpen={openSection === 'config'}
                onToggle={() => toggle('config')}
                summary={`${scene.duration}s • ${scene.type}`}
            >
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Type</label>
                        <select
                            value={scene.type}
                            onChange={(e) => onUpdate({ type: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                            <option value="kinetic_typo">Kinetic Typo</option>
                            <option value="device_showcase">Device Showcase</option>
                            <option value="bento_grid">Bento Grid</option>
                            <option value="social_proof">Social Proof</option>
                            <option value="cta_finale">CTA Finale</option>
                            <option value="slot_intro">Intro</option>
                            <option value="slot_transition">Transition</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                            <Clock size={10} /> Duration
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min={2}
                                max={15}
                                value={scene.duration}
                                onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
                                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                            />
                            <span className="text-xs font-mono text-indigo-400 w-6 text-right">{scene.duration}s</span>
                        </div>
                    </div>
                </div>
            </AccordionSection>

            {/* Content */}
            <AccordionSection
                title="Text & Copy"
                icon={AlignLeft}
                isOpen={openSection === 'content'}
                onToggle={() => toggle('content')}
                summary={scene.mainText || 'No title set'}
            >
                <div>
                    <input
                        type="text"
                        value={scene.mainText || ''}
                        onChange={(e) => onUpdate({ mainText: e.target.value, title: e.target.value })}
                        placeholder="Headline..."
                        className="w-full bg-transparent border-b border-slate-700 px-1 py-2 text-lg font-bold text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-0 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Description</label>
                    <textarea
                        value={scene.subText || ''}
                        onChange={(e) => onUpdate({ subText: e.target.value })}
                        rows={4}
                        placeholder="Add supporting text here..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-3 text-sm text-slate-300 placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                    />
                </div>
                {scene.type === 'cta_finale' && (
                    <div>
                        <label className="text-[10px] uppercase font-bold text-indigo-400/80 tracking-wider mb-1.5 flex items-center gap-1">
                            <MousePointerClick size={12} /> CTA Button Content
                        </label>
                        <input
                            type="text"
                            value={scene.ctaText || ''}
                            onChange={(e) => onUpdate({ ctaText: e.target.value })}
                            className="w-full bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-2 text-white text-sm"
                            placeholder="e.g. Get Started"
                        />
                    </div>
                )}
            </AccordionSection>

            {/* Visuals */}
            <AccordionSection
                title="Visual Assets"
                icon={ImageIcon}
                isOpen={openSection === 'visuals'}
                onToggle={() => toggle('visuals')}
                summary={scene.screenshotUrl ? 'Asset Linked' : 'No assets'}
            >
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-slate-400 mb-2 block">Background / Media URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={scene.screenshotUrl || ''}
                                onChange={(e) => onUpdate({ screenshotUrl: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Mini Preview of Asset */}
                    {scene.screenshotUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group bg-slate-950 bg-[url('https://transparenttextures.com/patterns/dark-matter.png')]">
                            <img src={scene.screenshotUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">Preview</div>
                        </div>
                    )}

                    {!scene.screenshotUrl && (
                        <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-800 rounded-lg text-slate-600 bg-slate-900/30">
                            <MonitorPlay size={20} className="mb-2 opacity-50" />
                            <span className="text-[10px]">No media selected</span>
                        </div>
                    )}
                </div>
            </AccordionSection>

            {/* Voiceover */}
            <AccordionSection
                title="Voiceover"
                icon={Volume2}
                isOpen={openSection === 'audio'}
                onToggle={() => toggle('audio')}
                summary={scene.voiceoverScript ? `${scene.voiceoverScript.split(' ').length} words` : 'Empty'}
            >
                <textarea
                    value={scene.voiceoverScript || ''}
                    onChange={(e) => onUpdate({ voiceoverScript: e.target.value })}
                    rows={5}
                    placeholder="Write your script here..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-3 text-sm font-mono text-slate-400 focus:text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                />

                {onRegenerateVoice && (
                    <button
                        onClick={onRegenerateVoice}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles size={12} />
                        Generate Voice
                    </button>
                )}
            </AccordionSection>
        </div>
    );
};
