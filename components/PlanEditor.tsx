import React, { useState, useEffect } from 'react';
import { VideoPlan, VideoScene } from '../types';
import { Button } from './Button';
import { X, Check, RefreshCw, Wand2, ArrowUp, ArrowDown, Sparkles, LayoutTemplate, Layers, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ARCHETYPES, NARRATIVE_FRAMEWORKS } from '../src/constants';

interface PlanEditorProps {
    plan: VideoPlan;
    onUpdate: (newPlan: VideoPlan) => void;
    onClose: () => void;
    onRegenerateVisual: (sceneIndex: number) => void;
    isRegenerating: boolean;
    className?: string;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({
    plan,
    onUpdate,
    onClose,
    onRegenerateVisual,
    isRegenerating,
    className
}) => {
    // We keep local state for inputs to avoid stuttering, but sync regularly
    const [localPlan, setLocalPlan] = useState<VideoPlan>(plan);
    const [expandedScene, setExpandedScene] = useState<number | null>(0);

    // Sync from parent if plan changes externally (e.g. regen)
    useEffect(() => {
        setLocalPlan(plan);
    }, [plan]);

    const handleSceneUpdate = (index: number, field: keyof VideoScene, value: any) => {
        const newScenes = [...localPlan.scenes];
        newScenes[index] = { ...newScenes[index], [field]: value };
        const newPlan = { ...localPlan, scenes: newScenes };
        setLocalPlan(newPlan);
        onUpdate(newPlan); // Real-time update
    };

    const handleGlobalUpdate = (field: keyof VideoPlan, value: any) => {
        const newPlan = { ...localPlan, [field]: value };
        setLocalPlan(newPlan);
        onUpdate(newPlan);
    };

    const moveScene = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === localPlan.scenes.length - 1) return;

        const newScenes = [...localPlan.scenes];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newScenes[index], newScenes[targetIndex]] = [newScenes[targetIndex], newScenes[index]];

        const newPlan = { ...localPlan, scenes: newScenes };
        setLocalPlan(newPlan);
        onUpdate(newPlan);
        setExpandedScene(targetIndex);
    };

    const duplicateScene = (index: number) => {
        const newScenes = [...localPlan.scenes];
        const duplicated = { ...newScenes[index], id: Date.now() };
        newScenes.splice(index + 1, 0, duplicated);

        const newPlan = { ...localPlan, scenes: newScenes };
        setLocalPlan(newPlan);
        onUpdate(newPlan);
        setExpandedScene(index + 1);
    };

    const deleteScene = (index: number) => {
        if (localPlan.scenes.length <= 1) return; // Keep at least 1 scene

        const newScenes = localPlan.scenes.filter((_, i) => i !== index);
        const newPlan = { ...localPlan, scenes: newScenes };
        setLocalPlan(newPlan);
        onUpdate(newPlan);
        setExpandedScene(null);
    };

    return (
        <div className={`bg-slate-900/90 backdrop-blur border-l border-slate-700 flex flex-col shadow-2xl h-full ${className}`}>

            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wand2 className="text-indigo-400" size={18} />
                        Director Mode
                    </h2>
                    <p className="text-slate-400 text-xs">Live Preview Active</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="primary" onClick={onClose} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Check size={16} className="mr-1" /> Done
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Brand Name</label>
                        <input
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-indigo-500"
                            value={localPlan.brandName}
                            onChange={(e) => handleGlobalUpdate('brandName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Color</label>
                        <div className="flex gap-1">
                            <input
                                type="color"
                                className="bg-transparent border-none w-8 h-8 cursor-pointer"
                                value={localPlan.brandColor}
                                onChange={(e) => handleGlobalUpdate('brandColor', e.target.value)}
                            />
                            <input
                                className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono"
                                value={localPlan.brandColor}
                                onChange={(e) => handleGlobalUpdate('brandColor', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Director Controls */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-indigo-400" />
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Director Controls</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <LayoutTemplate size={10} /> Archetype (Visual Style)
                            </label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-indigo-500 outline-none"
                                value={localPlan.archetype || 'isometric_world'}
                                onChange={(e) => handleGlobalUpdate('archetype', e.target.value)}
                            >
                                {Object.entries(ARCHETYPES).map(([key, value]) => (
                                    <option key={key} value={key}>{value.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Layers size={10} /> Narrative Framework
                            </label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-indigo-500 outline-none"
                                value={localPlan.narrativeFramework || 'saas_standard'}
                                onChange={(e) => handleGlobalUpdate('narrativeFramework', e.target.value)}
                            >
                                {Object.entries(NARRATIVE_FRAMEWORKS).map(([key, value]) => (
                                    <option key={key} value={key}>{value.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scene Breakdown</h3>
                    {localPlan.scenes.map((scene, idx) => (
                        <div key={`${scene.id}-${idx}`} className="bg-slate-800/40 rounded-lg border border-slate-700 overflow-hidden transition-all duration-200">
                            <div
                                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800 ${expandedScene === idx ? 'bg-slate-800' : ''}`}
                                onClick={() => setExpandedScene(expandedScene === idx ? null : idx)}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveScene(idx, 'up'); }}
                                            disabled={idx === 0}
                                            className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp size={12} className="text-slate-400" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveScene(idx, 'down'); }}
                                            disabled={idx === localPlan.scenes.length - 1}
                                            className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown size={12} className="text-slate-400" />
                                        </button>
                                    </div>
                                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white truncate max-w-[120px]">{scene.title || `Scene ${idx + 1}`}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase">{scene.type.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); duplicateScene(idx); }}
                                        className="p-1 hover:bg-slate-700 rounded"
                                        title="Duplicate scene"
                                    >
                                        <Copy size={12} className="text-slate-400" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteScene(idx); }}
                                        disabled={localPlan.scenes.length <= 1}
                                        className="p-1 hover:bg-red-900/50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Delete scene"
                                    >
                                        <Trash2 size={12} className="text-red-400" />
                                    </button>
                                    <ArrowDown size={14} className={`text-slate-500 transition-transform ${expandedScene === idx ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {expandedScene === idx && (
                                <div className="p-3 border-t border-slate-700 space-y-3 bg-slate-900/50 animate-fade-in">
                                    {/* Scene Title */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Scene Title</label>
                                        <input
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                                            value={scene.title || ''}
                                            onChange={(e) => handleSceneUpdate(idx, 'title', e.target.value)}
                                            placeholder="Enter scene title..."
                                        />
                                    </div>

                                    {/* Scene Type Selector */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Scene Type</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                                                value={scene.type}
                                                onChange={(e) => handleSceneUpdate(idx, 'type', e.target.value)}
                                            >
                                                <option value="kinetic_text">Kinetic Text</option>
                                                <option value="ui_mockup">UI Mockup</option>
                                                <option value="device_showcase">Device Showcase</option>
                                                <option value="isometric_illustration">Isometric 3D</option>
                                                <option value="data_visualization">Data Viz</option>
                                                <option value="cta_finale">CTA Finale</option>
                                                <option value="bento_grid">Bento Grid</option>
                                                <option value="device_cloud">Device Cloud</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Camera Angle</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                                                value={scene.cameraAngle || 'straight_on'}
                                                onChange={(e) => handleSceneUpdate(idx, 'cameraAngle', e.target.value)}
                                            >
                                                <option value="straight_on">Straight On</option>
                                                <option value="isometric_left">Isometric Left</option>
                                                <option value="isometric_right">Isometric Right</option>
                                                <option value="cinematic_low">Cinematic Low</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Voiceover Script */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Voiceover Script</label>
                                        <textarea
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 min-h-[60px]"
                                            value={scene.script}
                                            onChange={(e) => handleSceneUpdate(idx, 'script', e.target.value)}
                                        />
                                    </div>

                                    {/* Wan Prompt (for video generation) */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between items-center">
                                            <span>Wan Video Prompt</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => { e.stopPropagation(); onRegenerateVisual(idx); }}
                                                disabled={isRegenerating}
                                                className="h-5 text-[10px] px-2 py-0"
                                            >
                                                <RefreshCw size={10} className={`mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                                                Regen BG
                                            </Button>
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-2 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 min-h-[50px]"
                                            value={scene.wanPrompt || scene.visualDescription || ''}
                                            onChange={(e) => handleSceneUpdate(idx, 'wanPrompt', e.target.value)}
                                            placeholder="Describe the background video for Wan AI..."
                                        />
                                    </div>

                                    {scene.type === 'kinetic_text' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Main Text</label>
                                                <input
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                                    value={scene.mainText || ''}
                                                    onChange={(e) => handleSceneUpdate(idx, 'mainText', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-500">Sub Text</label>
                                                <input
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                                    value={scene.subText || ''}
                                                    onChange={(e) => handleSceneUpdate(idx, 'subText', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA Finale Specific Controls */}
                                    {scene.type === 'cta_finale' && (
                                        <div className="space-y-2 bg-indigo-900/10 border border-indigo-500/20 rounded p-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-indigo-400 uppercase">CTA Text</label>
                                                <input
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                                                    value={scene.ctaText || ''}
                                                    onChange={(e) => handleSceneUpdate(idx, 'ctaText', e.target.value)}
                                                    placeholder="Ready to transform your workflow?"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-indigo-400 uppercase">Button Text</label>
                                                <input
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                                                    value={scene.ctaButtonText || ''}
                                                    onChange={(e) => handleSceneUpdate(idx, 'ctaButtonText', e.target.value)}
                                                    placeholder="Get Started Free"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-indigo-400 uppercase">Logo URL (Optional)</label>
                                                <input
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                                    value={scene.logoUrl || ''}
                                                    onChange={(e) => handleSceneUpdate(idx, 'logoUrl', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Device Showcase Specific Controls */}
                                    {scene.type === 'device_showcase' && (
                                        <div className="space-y-1 bg-purple-900/10 border border-purple-500/20 rounded p-2">
                                            <label className="text-[10px] font-bold text-purple-400 uppercase">Device Type</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
                                                value={scene.deviceConfig?.deviceType || 'laptop'}
                                                onChange={(e) => handleSceneUpdate(idx, 'deviceConfig', { ...scene.deviceConfig, deviceType: e.target.value })}
                                            >
                                                <option value="laptop">Laptop</option>
                                                <option value="phone">Phone</option>
                                                <option value="tablet">Tablet</option>
                                                <option value="browser_window">Browser Window</option>
                                            </select>
                                        </div>
                                    )}


                                    <div className="grid grid-cols-2 gap-2 border-t border-slate-700/50 pt-2 mt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Camera Move</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-indigo-500 outline-none"
                                                value={scene.cameraMove || 'static'}
                                                onChange={(e) => handleSceneUpdate(idx, 'cameraMove', e.target.value)}
                                            >
                                                <option value="static">Static</option>
                                                <option value="orbit_smooth">Orbit Smooth (Isometric)</option>
                                                <option value="zoom_in_hero">Zoom In Hero (Device)</option>
                                                <option value="zoom_in_slow">Zoom In Slow</option>
                                                <option value="pan_right">Pan Right</option>
                                                <option value="dolly_zoom">Dolly Zoom (Dramatic)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Transition</label>
                                            <select
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-indigo-500 outline-none"
                                                value={scene.transition || 'none'}
                                                onChange={(e) => handleSceneUpdate(idx, 'transition', e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="zoom_through">Zoom Through (High Energy)</option>
                                                <option value="wipe_right">Wipe Right</option>
                                                <option value="fade">Fade</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Duration (sec)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-indigo-500 outline-none"
                                            value={scene.duration}
                                            step={0.5}
                                            onChange={(e) => handleSceneUpdate(idx, 'duration', parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
