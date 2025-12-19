import React, { useState, useEffect } from 'react';
import { SceneRefiner } from '../services/SceneRefiner';
import {
    X, Save, Layout, Type, Image as ImageIcon, Volume2,
    Smartphone, Monitor, MousePointer2, Move3d, Zap, Layers,
    Palette, ArrowRight, Grid, MessageSquare, Laptop, Code, Sparkles, Loader2,
    Music, Eye, EyeOff, PlayCircle, PauseCircle, Wand2
} from 'lucide-react';
import { VideoScene } from '../types';
import { AssetLibrary } from './AssetLibrary';
import { Player } from './Player';

interface SceneDetailModalProps {
    scene: VideoScene;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updates: Partial<VideoScene>) => void;
    onRegenerateVoice?: () => void;
    isRegeneratingVoice?: boolean;
}

// Helper Component for AI Text Inputs
const MagicInput: React.FC<{
    label: string;
    value: string;
    onChange: (val: string) => void;
    multiline?: boolean;
    placeholder?: string;
    description?: string;
    onRewriteStart?: () => void;
    onRewriteEnd?: () => void;
}> = ({ label, value, onChange, multiline, placeholder, description, onRewriteStart, onRewriteEnd }) => {
    const [isRewriting, setIsRewriting] = useState(false);

    const handleRewrite = async () => {
        if (!value.trim()) return;
        setIsRewriting(true);
        if (onRewriteStart) onRewriteStart();
        try {
            const rewritten = await SceneRefiner.rewriteText(value);
            onChange(rewritten);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRewriting(false);
            if (onRewriteEnd) onRewriteEnd();
        }
    };

    return (
        <div className="space-y-2 group">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {/* Icon can be passed or generic */}
                    {label}
                </label>
                {value.trim() && (
                    <button
                        onClick={handleRewrite}
                        disabled={isRewriting}
                        className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                        title="Rewrite with AI"
                    >
                        {isRewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        {isRewriting ? 'Magic...' : 'Magic Rewrite'}
                    </button>
                )}
            </div>

            {multiline ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={3}
                    className={`w-full bg-slate-950 border ${isRewriting ? 'border-indigo-500 animate-pulse' : 'border-slate-800'} rounded-lg px-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all`}
                    placeholder={placeholder}
                    disabled={isRewriting}
                />
            ) : (
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full bg-slate-950 border ${isRewriting ? 'border-indigo-500 animate-pulse' : 'border-slate-800'} rounded-lg px-4 py-3 text-lg font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all`}
                    placeholder={placeholder}
                    disabled={isRewriting}
                />
            )}
            {description && <p className="text-[10px] text-slate-600">{description}</p>}
        </div>
    );
}

export const SceneDetailModal: React.FC<SceneDetailModalProps> = ({
    scene,
    isOpen,
    onClose,
    onUpdate,
    onRegenerateVoice,
    isRegeneratingVoice
}) => {
    // Tab State
    const [activeTab, setActiveTab] = useState<'content' | 'visual' | 'audio' | 'advanced' | 'code'>('content');

    // JSON / AI State
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [localJson, setLocalJson] = useState(JSON.stringify(scene, null, 2));
    const [aiInstruction, setAiInstruction] = useState('');
    const [isRefining, setIsRefining] = useState(false);

    // Preview State
    const [showPreview, setShowPreview] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    // Asset Library State
    const [showAssetLib, setShowAssetLib] = useState(false);
    const [assetTargetField, setAssetTargetField] = useState<'screenshotUrl' | 'mobileScreenshotUrl' | 'logoUrl' | null>(null);

    // Sync local JSON when scene changes (if not editing code)
    useEffect(() => {
        if (activeTab !== 'code') {
            setLocalJson(JSON.stringify(scene, null, 2));
        }
    }, [scene, activeTab]);

    // Derived Scene for Preview (Real-time updates)
    const getPreviewScene = () => {
        try {
            return activeTab === 'code' ? JSON.parse(localJson) : scene;
        } catch {
            return scene; // Fallback if JSON is invalid
        }
    };
    const previewScene = getPreviewScene();

    // Handlers
    const handleJsonChange = (val: string) => {
        setLocalJson(val);
        try {
            const parsed = JSON.parse(val);
            // We do NOT call onUpdate here to avoid flooding updates, 
            // but previewScene derives from localJson so it updates instantly.
            setJsonError(null);
        } catch (e) {
            setJsonError((e as Error).message);
        }
    };

    const handleAiRefine = async () => {
        if (!aiInstruction.trim()) return;
        setIsRefining(true);
        try {
            const updated = await SceneRefiner.refine(scene, aiInstruction);
            onUpdate(updated);
            setLocalJson(JSON.stringify(updated, null, 2));
            setAiInstruction('');
        } catch (e) {
            alert('AI Refinement failed');
        } finally {
            setIsRefining(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        onUpdate({ [field]: value });
    };

    const handleOpenAssetLib = (field: 'screenshotUrl' | 'mobileScreenshotUrl' | 'logoUrl') => {
        setAssetTargetField(field);
        setShowAssetLib(true);
    };

    const handleAssetSelect = (url: string) => {
        if (assetTargetField) {
            handleInputChange(assetTargetField, url);
        }
        setShowAssetLib(false);
        setAssetTargetField(null);
    };

    if (!isOpen) return null;

    // Helper to determine if scene supports dual screens
    const supportsDualScreens = ['cta_finale', 'device_showcase', 'slot_transition', 'vision'].includes(scene.type) || scene.id === 6 || scene.id === 7;

    // Helper to render asset inputs
    const renderAssetInput = (label: string, field: 'screenshotUrl' | 'mobileScreenshotUrl' | 'logoUrl', icon: React.ReactNode) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {icon} {label}
            </label>
            <div className="flex gap-2 group relative">
                <input
                    value={(scene as any)[field] || ''}
                    onChange={e => handleInputChange(field, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="https://..."
                />
                <button
                    onClick={() => handleOpenAssetLib(field)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center justify-center"
                    title="Choose from Library"
                >
                    <ImageIcon size={16} />
                </button>
            </div>
            {(scene as any)[field] && (
                <div className={`mt-2 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 relative group-hover:border-indigo-500/50 transition-colors ${field === 'mobileScreenshotUrl' ? 'w-24 aspect-[9/16]' : 'w-48 aspect-video'}`}>
                    <img src={(scene as any)[field]} className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Container: Wider for Preview */}
            <div className={`relative w-full ${showPreview ? 'max-w-6xl' : 'max-w-3xl'} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh] transition-all`}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Layout className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Edit Scene Details</h2>
                            <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                                {scene.type.toUpperCase().replace('_', ' ')} • {scene.duration}s
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Preview Toggle */}
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showPreview ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                        >
                            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>

                        <div className="h-6 w-px bg-slate-800 mx-2" />

                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>


                {/* Main Body: Split View */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Panel: Editor */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 bg-slate-900">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 overflow-x-auto">
                            {[
                                { id: 'content', label: 'Content', icon: Type },
                                { id: 'visual', label: 'Visuals', icon: ImageIcon },
                                { id: 'audio', label: 'Audio', icon: Volume2 },
                                { id: 'advanced', label: 'Advanced', icon: Zap },
                                { id: 'code', label: 'Code & AI', icon: Code },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-indigo-500 text-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {/* @ts-ignore */}
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Editor Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">

                            {/* CONTENT TAB */}
                            {activeTab === 'content' && (
                                <div className="space-y-6">
                                    <MagicInput
                                        label="Headline / Title"
                                        value={scene.mainText || scene.title || ''}
                                        onChange={val => onUpdate({ mainText: val, title: val })}
                                        placeholder="Enter main headline..."
                                    />

                                    <MagicInput
                                        label="Subtitle / Description"
                                        value={scene.subText || ''}
                                        onChange={val => onUpdate({ subText: val })}
                                        multiline
                                        placeholder="Enter supporting text..."
                                    />

                                    {(scene.type === 'cta_finale' || scene.ctaText || scene.id === 6 || scene.id === 9) && (
                                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl space-y-3">
                                            <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                                <MousePointer2 size={16} />
                                                <span className="text-xs font-bold uppercase">Call to Action</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-1 block">Button Text</label>
                                                    <input
                                                        value={scene.ctaText || scene.ctaButtonText || ''}
                                                        onChange={e => onUpdate({ ctaText: e.target.value, ctaButtonText: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                                                        placeholder="e.g. Try For Free"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 mb-1 block">Destination URL</label>
                                                    <input
                                                        value={scene.ctaUrl || ''}
                                                        onChange={e => onUpdate({ ctaUrl: e.target.value })}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                                                        placeholder="example.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {scene.type === 'social_proof' && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                <MessageSquare size={14} /> Testimonial Author
                                            </label>
                                            <input
                                                placeholder="e.g. Jane Doe, CEO of TechCorp"
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white"
                                                value={scene.subText || ''} // Reusing subText for author often
                                                onChange={e => onUpdate({ subText: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {/* DYNAMIC FEATURE LIST EDITOR */}
                                    {(scene.features || ['bento_grid', 'device_cloud', 'split_comparison', 'slot_features'].includes(scene.type) || scene.id === 4) && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Grid size={14} /> Feature Points
                                                </label>
                                                <button
                                                    onClick={() => {
                                                        const newFeatures = [...(scene.features || []), { title: 'New Feature', description: '' }];
                                                        onUpdate({ features: newFeatures });
                                                    }}
                                                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                >
                                                    + Add Item
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {(scene.features || []).map((feature, idx) => (
                                                    <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 group hover:border-slate-700 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <input
                                                                value={feature.title}
                                                                onChange={e => {
                                                                    const newFeatures = [...(scene.features || [])];
                                                                    newFeatures[idx] = { ...feature, title: e.target.value };
                                                                    onUpdate({ features: newFeatures });
                                                                }}
                                                                className="bg-transparent text-sm font-bold text-white outline-none w-full placeholder:text-slate-600"
                                                                placeholder="Feature Title"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newFeatures = scene.features?.filter((_, i) => i !== idx);
                                                                    onUpdate({ features: newFeatures });
                                                                }}
                                                                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                        <input
                                                            value={feature.description}
                                                            onChange={e => {
                                                                const newFeatures = [...(scene.features || [])];
                                                                newFeatures[idx] = { ...feature, description: e.target.value };
                                                                onUpdate({ features: newFeatures });
                                                            }}
                                                            className="bg-transparent text-xs text-slate-400 w-full outline-none placeholder:text-slate-700"
                                                            placeholder="Short benefit description..."
                                                        />
                                                    </div>
                                                ))}
                                                {(!scene.features || scene.features.length === 0) && (
                                                    <div className="text-center py-4 border-2 border-dashed border-slate-800 rounded-lg text-xs text-slate-600">
                                                        No features added yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VISUAL TAB */}
                            {activeTab === 'visual' && (
                                <div className="space-y-6">
                                    {renderAssetInput('Desktop / Main Screen', 'screenshotUrl', <Laptop size={14} />)}
                                    {supportsDualScreens && renderAssetInput('Mobile App Screen', 'mobileScreenshotUrl', <Smartphone size={14} />)}
                                    <div className="pt-4 border-t border-slate-800">
                                        {renderAssetInput('Brand Logo', 'logoUrl', <ImageIcon size={14} />)}
                                    </div>
                                </div>
                            )}

                            {/* AUDIO TAB */}
                            {activeTab === 'audio' && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voiceover Script</label>
                                            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                                                {(scene.voiceoverScript || '').split(' ').length} words
                                            </span>
                                        </div>
                                        <textarea
                                            value={scene.voiceoverScript || ''}
                                            onChange={e => onUpdate({ voiceoverScript: e.target.value })}
                                            rows={8}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
                                            placeholder="Enter script for AI voice..."
                                        />
                                    </div>

                                    {onRegenerateVoice && (
                                        <button
                                            onClick={onRegenerateVoice}
                                            disabled={isRegeneratingVoice}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isRegeneratingVoice ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                            {isRegeneratingVoice ? 'Generating AI Voice...' : 'Generate AI Voiceover'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* ADVANCED TAB */}
                            {activeTab === 'advanced' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timing & Camera</label>

                                        <div>
                                            <label className="mb-2 block text-xs text-slate-500">Duration (seconds)</label>
                                            <input
                                                type="number"
                                                value={scene.duration}
                                                onChange={e => onUpdate({ duration: Number(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                                            />
                                        </div>

                                        <div className="p-4 bg-slate-800/30 rounded-lg text-sm text-slate-400">
                                            <p>Advanced camera movement and 3D configuration options coming soon to this panel.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CODE & AI TAB */}
                            {activeTab === 'code' && (
                                <div className="space-y-6 h-full flex flex-col">
                                    {/* AI Copilot Section */}
                                    <div className="p-4 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl space-y-3">
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Sparkles size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">AI Director's Assistant</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                value={aiInstruction}
                                                onChange={e => setAiInstruction(e.target.value)}
                                                placeholder="e.g. 'Make the duration 8s and write a punchier headline'"
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                onKeyDown={e => e.key === 'Enter' && handleAiRefine()}
                                            />
                                            <button
                                                onClick={handleAiRefine}
                                                disabled={isRefining || !aiInstruction}
                                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all"
                                            >
                                                {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                                Refine
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500">
                                            The AI will analyze the current scene JSON and intelligently update properties to match your request.
                                        </p>
                                    </div>

                                    {/* JSON Editor */}
                                    <div className="flex-1 flex flex-col min-h-[300px]">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                                            <span>Scene Configuration (JSON)</span>
                                            {jsonError && <span className="text-red-400">{jsonError}</span>}
                                        </label>
                                        <textarea
                                            value={localJson}
                                            onChange={e => handleJsonChange(e.target.value)}
                                            className={`flex-1 w-full bg-[#0d1117] border ${jsonError ? 'border-red-500' : 'border-slate-800'} rounded-lg p-4 font-mono text-xs text-green-400 outline-none resize-none leading-relaxed scrollbar-thin scrollbar-thumb-slate-700`}
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Live Preview */}
                    {showPreview && (
                        <div className="w-[40%] bg-black/50 border-l border-slate-800 flex flex-col transition-all duration-300">
                            <div className="flex items-center justify-between p-4 border-b border-slate-800">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="text-white hover:text-indigo-400 transition-colors"
                                    >
                                        {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[length:16px_16px]">
                                <div className="w-full aspect-video shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-700">
                                    <Player
                                        scene={previewScene}
                                        isPlaying={isPlaying}
                                        onComplete={() => setIsPlaying(false)}
                                        brandColor="#3b82f6"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                                Previewing {scene.type} • Updates in real-time
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Asset Library Modal Overlay */}
            <AssetLibrary
                isOpen={showAssetLib}
                onClose={() => setShowAssetLib(false)}
                onSelect={handleAssetSelect}
                initialTab={assetTargetField === 'mobileScreenshotUrl' ? 'screenshot_mobile' : assetTargetField === 'logoUrl' ? 'logo' : 'screenshot_desktop'}
            />
        </div>
    );
};
