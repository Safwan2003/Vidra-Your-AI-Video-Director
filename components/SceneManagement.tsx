import React from 'react';
import {
    Plus, Trash2, Copy, ChevronUp, ChevronDown, GripVertical,
    Type, Smartphone, LayoutGrid, MessageSquareQuote, MousePointerClick, Clapperboard, Film,
    Sparkles
} from 'lucide-react';
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

const getSceneIcon = (type: string) => {
    switch (type) {
        case 'kinetic_typo': return <Type size={14} />;
        case 'device_showcase': return <Smartphone size={14} />;
        case 'bento_grid': return <LayoutGrid size={14} />;
        case 'social_proof': return <MessageSquareQuote size={14} />;
        case 'cta_finale': return <MousePointerClick size={14} />;
        case 'slot_intro': return <Clapperboard size={14} />;
        case 'slot_transition': return <Film size={14} />;
        default: return <Sparkles size={14} />;
    }
};

const getSceneLabel = (type: string) => {
    switch (type) {
        case 'kinetic_typo': return 'Typography';
        case 'device_showcase': return 'Showcase';
        case 'bento_grid': return 'Bento Grid';
        case 'social_proof': return 'Testimonial';
        case 'cta_finale': return 'Call to Action';
        case 'slot_intro': return 'Intro';
        case 'slot_transition': return 'Transition';
        default: return 'Scene';
    }
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
    return (
        <div className="h-full flex flex-col">
            {/* Action Bar */}
            <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Sequence ({scenes.length})
                </span>
                <button
                    onClick={onAddScene}
                    className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide"
                >
                    <Plus size={12} />
                    Add
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {scenes.map((scene, index) => {
                    const isActive = index === currentSceneIndex;
                    const Icon = getSceneIcon(scene.type);

                    return (
                        <div
                            key={`scene-${scene.id}-${index}`}
                            onClick={() => onSceneSelect(index)}
                            className={`group relative rounded-xl border transition-all cursor-pointer ${isActive
                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                                }`}
                        >
                            <div className="p-3 flex items-start gap-3">
                                {/* Leading Icon */}
                                <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400'
                                    }`}>
                                    {getSceneIcon(scene.type)}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`text-xs font-semibold truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                                            }`}>
                                            {index + 1}. {getSceneLabel(scene.type)}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-600">
                                            {scene.duration}s
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate pr-4">
                                        {scene.title || scene.mainText || 'Untitled'}
                                    </p>
                                </div>
                            </div>

                            {/* Hover/Active Actions Overlay */}
                            <div className={`absolute right-2 top-2 bottom-2 flex flex-col justify-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onMoveScene(index, index - 1); }}
                                        disabled={index === 0}
                                        className="p-1 hover:text-white text-slate-500 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronUp size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onMoveScene(index, index + 1); }}
                                        disabled={index === scenes.length - 1}
                                        className="p-1 hover:text-white text-slate-500 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronDown size={12} />
                                    </button>
                                    <div className="w-px h-3 bg-slate-700 mx-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDuplicateScene(index); }}
                                        className="p-1 hover:text-indigo-400 text-slate-500 transition-colors"
                                    >
                                        <Copy size={12} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteScene(index); }}
                                        className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
