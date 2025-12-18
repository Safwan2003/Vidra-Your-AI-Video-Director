import React from 'react';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, GripVertical, Play } from 'lucide-react';
import { VideoScene } from '../types';

interface SceneManagementProps {
    scenes: VideoScene[];
    currentSceneIndex: number;
    onSceneSelect: (index: number) => void;
    onAddScene: () => void;
    onDeleteScene: (index: number) => void;
    onDuplicateScene: (index: number) => void;
    onMoveScene: (fromIndex: number, toIndex: number) => void;
}

export const SceneManagement: React.FC<SceneManagementProps> = ({
    scenes,
    currentSceneIndex,
    onSceneSelect,
    onAddScene,
    onDeleteScene,
    onDuplicateScene,
    onMoveScene,
}) => {
    const canMoveUp = currentSceneIndex > 0;
    const canMoveDown = currentSceneIndex < scenes.length - 1;

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">Scenes</h3>
                    <span className="text-xs text-slate-500">{scenes.length} total</span>
                </div>
                <button
                    onClick={onAddScene}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} />
                    Add Scene
                </button>
            </div>

            {/* Scene List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {scenes.map((scene, index) => {
                    const isActive = index === currentSceneIndex;

                    return (
                        <div
                            key={`scene-mgmt-${scene.id}-${index}`}
                            className={`group relative rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                        >
                            {/* Main Scene Card */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => onSceneSelect(index)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Drag Handle */}
                                    <div className="text-slate-500 mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical size={16} />
                                    </div>

                                    {/* Scene Number Badge */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isActive
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-700 text-slate-300'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    {/* Scene Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-white truncate">
                                                {scene.title || 'Untitled Scene'}
                                            </span>
                                            {isActive && (
                                                <Play size={12} className="text-indigo-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="truncate">{scene.type}</span>
                                            <span>•</span>
                                            <span>{scene.duration}s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Show on Active) */}
                            {isActive && (
                                <div className="flex items-center gap-1 px-4 pb-3 pt-1">
                                    {/* Move Up */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (canMoveUp) onMoveScene(index, index - 1);
                                        }}
                                        disabled={!canMoveUp}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        title="Move Up"
                                    >
                                        <ChevronUp size={14} />
                                    </button>

                                    {/* Move Down */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (canMoveDown) onMoveScene(index, index + 1);
                                        }}
                                        disabled={!canMoveDown}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        title="Move Down"
                                    >
                                        <ChevronDown size={14} />
                                    </button>

                                    <div className="flex-1" />

                                    {/* Duplicate */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDuplicateScene(index);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-all"
                                        title="Duplicate"
                                    >
                                        <Copy size={14} />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (scenes.length > 1) {
                                                onDeleteScene(index);
                                            } else {
                                                alert('Cannot delete the last scene');
                                            }
                                        }}
                                        disabled={scenes.length === 1}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
