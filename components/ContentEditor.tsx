import React, { useState } from 'react';
import { VideoPlan, VideoScene } from '../types';
import { SceneManagement } from './SceneManagement';
import { TabbedSceneEditor } from './TabbedSceneEditor';
import { ScenePreview } from './ScenePreview';
import { Save, Undo, Redo, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { generateVoiceover } from '../services/wanxService';

interface ContentEditorProps {
    plan: VideoPlan;
    onUpdate: (newPlan: VideoPlan) => void;
    onClose: () => void;
    className?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
    plan,
    onUpdate,
    onClose,
    className
}) => {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [history, setHistory] = useState<VideoPlan[]>([plan]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showBrandSection, setShowBrandSection] = useState(true);

    // Undo/Redo Management
    const pushHistory = (newPlan: VideoPlan) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newPlan);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onUpdate(newPlan);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            onUpdate(history[newIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            onUpdate(history[newIndex]);
        }
    };

    // Brand Updates
    const handleBrandUpdate = (field: 'brandName' | 'brandColor', value: string) => {
        const newPlan = { ...plan, [field]: value };
        pushHistory(newPlan);
    };

    // Scene Updates
    const handleSceneUpdate = (updates: Partial<VideoScene>) => {
        const newScenes = [...plan.scenes];
        newScenes[currentSceneIndex] = { ...newScenes[currentSceneIndex], ...updates };
        pushHistory({ ...plan, scenes: newScenes });
    };

    // Scene Management
    const handleAddScene = () => {
        const newScene: VideoScene = {
            id: plan.scenes.length + 1,
            type: 'kinetic_typo' as any,
            title: 'New Scene',
            duration: 5,
            mainText: '',
            subText: '',
            voiceoverScript: '',
        };
        pushHistory({ ...plan, scenes: [...plan.scenes, newScene] });
        setCurrentSceneIndex(plan.scenes.length);
    };

    const handleDeleteScene = (index: number) => {
        if (plan.scenes.length === 1) {
            alert('Cannot delete the last scene');
            return;
        }
        const newScenes = plan.scenes.filter((_, i) => i !== index);
        pushHistory({ ...plan, scenes: newScenes });
        if (currentSceneIndex >= newScenes.length) {
            setCurrentSceneIndex(newScenes.length - 1);
        }
    };

    const handleDuplicateScene = (index: number) => {
        const sceneToDuplicate = { ...plan.scenes[index] };
        sceneToDuplicate.id = plan.scenes.length + 1;
        sceneToDuplicate.title = `${sceneToDuplicate.title} (Copy)`;
        const newScenes = [
            ...plan.scenes.slice(0, index + 1),
            sceneToDuplicate,
            ...plan.scenes.slice(index + 1),
        ];
        pushHistory({ ...plan, scenes: newScenes });
    };

    const handleMoveScene = (fromIndex: number, toIndex: number) => {
        const newScenes = [...plan.scenes];
        const [movedScene] = newScenes.splice(fromIndex, 1);
        newScenes.splice(toIndex, 0, movedScene);
        pushHistory({ ...plan, scenes: newScenes });
        setCurrentSceneIndex(toIndex);
    };

    // Voiceover Regeneration
    const handleRegenerateVoice = async () => {
        const scene = plan.scenes[currentSceneIndex];
        if (!scene.voiceoverScript) {
            alert('Please add a voiceover script first');
            return;
        }

        setIsRegenerating(true);
        try {
            const voiceUrl = await generateVoiceover(scene.voiceoverScript);
            if (voiceUrl) {
                handleSceneUpdate({ voiceoverUrl: voiceUrl });
            }
        } catch (error) {
            console.error('Voiceover generation failed:', error);
            alert('Failed to generate voiceover. Please try again.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    const totalDuration = plan.scenes.reduce((acc, scene) => acc + (scene.duration || 5), 0);

    return (
        <div className={`fixed inset-0 bg-slate-950 z-50 overflow-hidden ${className}`}>
            <div className="h-full flex flex-col">
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-8 py-5 shadow-2xl">
                    <div className="flex items-center justify-between max-w-[1800px] mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-indigo-500/30 animate-pulse">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                                    Director Studio
                                </h2>
                                <p className="text-xs text-slate-400 font-medium">{plan.scenes.length} scenes • {totalDuration}s total</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                                title="Undo"
                            >
                                <Undo size={18} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                                title="Redo"
                            >
                                <Redo size={18} />
                            </button>

                            <div className="w-px h-6 bg-slate-700/50" />

                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 font-semibold"
                            >
                                <Save size={18} />
                                Save & Close
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Optimized for Laptop */}
                <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
                    {/* Left Sidebar - 340px for better proportions */}
                    <div className="w-[340px] bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col shadow-2xl">
                        {/* Brand Section */}
                        <div className="border-b border-slate-800/50">
                            <button
                                onClick={() => setShowBrandSection(!showBrandSection)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-all"
                            >
                                <span className="text-sm font-bold text-white">Brand Settings</span>
                                {showBrandSection ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>

                            {showBrandSection && (
                                <div className="px-6 pb-6 space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-2 font-medium">Brand Name</label>
                                        <input
                                            type="text"
                                            value={plan.brandName || ''}
                                            onChange={(e) => handleBrandUpdate('brandName', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
                                            placeholder="Enter brand name..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-2 font-medium">Brand Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={plan.brandColor || '#3498db'}
                                                onChange={(e) => handleBrandUpdate('brandColor', e.target.value)}
                                                className="w-12 h-11 rounded-xl cursor-pointer border-2 border-slate-700/50 shadow-lg"
                                            />
                                            <input
                                                type="text"
                                                value={plan.brandColor || '#3498db'}
                                                onChange={(e) => handleBrandUpdate('brandColor', e.target.value)}
                                                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scene List */}
                        <div className="flex-1 overflow-hidden">
                            <SceneManagement
                                scenes={plan.scenes}
                                currentSceneIndex={currentSceneIndex}
                                onSceneSelect={setCurrentSceneIndex}
                                onAddScene={handleAddScene}
                                onDeleteScene={handleDeleteScene}
                                onDuplicateScene={handleDuplicateScene}
                                onMoveScene={handleMoveScene}
                            />
                        </div>
                    </div>

                    {/* Right Panel - Scene Editor with Live Preview */}
                    <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
                        <div className="p-10 max-w-5xl space-y-6">
                            {/* Live Preview */}
                            <ScenePreview
                                scene={plan.scenes[currentSceneIndex]}
                                sceneIndex={currentSceneIndex}
                                brandColor={plan.brandColor}
                            />

                            {/* Scene Editor */}
                            <TabbedSceneEditor
                                scene={plan.scenes[currentSceneIndex]}
                                sceneIndex={currentSceneIndex}
                                onUpdate={handleSceneUpdate}
                                onRegenerateVoice={isRegenerating ? undefined : handleRegenerateVoice}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
