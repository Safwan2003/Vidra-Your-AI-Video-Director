
import React from 'react';
import { VideoScene } from '../types';
import { Type, LayoutTemplate, Box } from 'lucide-react';

interface SceneCardProps {
    scene: VideoScene;
    isActive: boolean;
    onClick: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, isActive, onClick }) => {
    
    const getIcon = () => {
        switch(scene.type) {
            case 'kinetic_text': return <Type size={14} />;
            case 'ui_mockup': return <LayoutTemplate size={14} />;
            case 'isometric_illustration': return <Box size={14} />;
        }
    };

    const getTypeLabel = () => {
        switch(scene.type) {
            case 'kinetic_text': return 'Text';
            case 'ui_mockup': return 'UI Mockup';
            case 'isometric_illustration': return 'Iso';
        }
    };

    return (
        <div 
            onClick={onClick}
            className={`
                group relative p-4 rounded-xl cursor-pointer border transition-all duration-200
                ${isActive 
                    ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`
                        flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider
                        ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}
                    `}>
                        {getIcon()}
                        {getTypeLabel()}
                    </span>
                    <span className="text-xs font-mono text-slate-500">#{scene.id}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{scene.duration}s</span>
            </div>
            
            <p className="text-sm font-medium text-slate-200 mb-1 line-clamp-1">{scene.title}</p>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                "{scene.script}"
            </p>
            
            {/* Mini Visual Indicator */}
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
        </div>
    );
};
