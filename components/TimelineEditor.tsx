import React from 'react';
import { Clock, Play } from 'lucide-react';
import { VideoScene } from '../types';

interface TimelineEditorProps {
    scenes: VideoScene[];
    currentSceneIndex: number;
    onSceneSelect: (index: number) => void;
    playheadPosition?: number; // Current playback position in seconds
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
    scenes,
    currentSceneIndex,
    onSceneSelect,
    playheadPosition = 0,
}) => {
    // Calculate total duration
    const totalDuration = scenes.reduce((acc, scene) => acc + (scene.duration || 5), 0);

    // Calculate cumulative start times
    const sceneTimes = scenes.map((scene, index) => {
        let startTime = 0;
        for (let i = 0; i < index; i++) {
            startTime += scenes[i].duration || 5;
        }
        return {
            startTime,
            duration: scene.duration || 5,
            endTime: startTime + (scene.duration || 5),
        };
    });

    // Calculate playhead position percentage
    const playheadPercent = (playheadPosition / totalDuration) * 100;

    return (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">Timeline</h3>
                    <span className="text-sm text-slate-400">({totalDuration}s total)</span>
                </div>
                <div className="text-xs text-slate-400">
                    {Math.floor(playheadPosition)}s / {totalDuration}s
                </div>
            </div>

            {/* Timeline Bars */}
            <div className="relative">
                {/* Scene Blocks */}
                <div className="flex gap-1 h-16 mb-2 relative">
                    {scenes.map((scene, index) => {
                        const widthPercent = ((scene.duration || 5) / totalDuration) * 100;
                        const isActive = index === currentSceneIndex;

                        return (
                            <button
                                key={`timeline-${scene.id}-${index}`}
                                onClick={() => onSceneSelect(index)}
                                className={`relative flex-shrink-0 rounded-lg transition-all group ${isActive
                                        ? 'ring-2 ring-indigo-500 bg-indigo-600'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                style={{ width: `${widthPercent}%` }}
                                title={`Scene ${index + 1}: ${scene.title || 'Untitled'} (${scene.duration}s)`}
                            >
                                {/* Scene Number */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                                    <span className="text-xs font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <span className="text-[10px] text-slate-300 truncate max-w-full px-1">
                                        {scene.duration}s
                                    </span>
                                </div>

                                {/* Hover Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {scene.title || `Scene ${index + 1}`}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Playhead Indicator */}
                {playheadPosition > 0 && (
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                        style={{ left: `${playheadPercent}%` }}
                    >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                        </div>
                    </div>
                )}

                {/* Time Markers */}
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0s</span>
                    <span>{Math.floor(totalDuration / 2)}s</span>
                    <span>{totalDuration}s</span>
                </div>
            </div>

            {/* Scene Details */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {scenes.map((scene, index) => (
                    <div
                        key={`detail-${scene.id}-${index}`}
                        className={`text-xs p-2 rounded border cursor-pointer transition-colors ${index === currentSceneIndex
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                        onClick={() => onSceneSelect(index)}
                    >
                        <div className="font-bold truncate">#{index + 1}</div>
                        <div className="truncate opacity-75">{scene.type}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
