import React from 'react';
import { Clock } from 'lucide-react';

interface DurationSliderProps {
    value: number; // Duration in seconds
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
}

export const DurationSlider: React.FC<DurationSliderProps> = ({
    value,
    onChange,
    min = 3,
    max = 10,
    label = 'Duration',
}) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{value}s</span>
                </div>
            </div>

            <div className="relative">
                {/* Slider Track */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={0.5}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value - min) / (max - min)) * 100}%, #334155 ${((value - min) / (max - min)) * 100}%, #334155 100%)`,
                    }}
                />

                {/* Min/Max Labels */}
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{min}s</span>
                    <span>{max}s</span>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2">
                {[3, 5, 6, 8, 10].map((preset) => (
                    <button
                        key={preset}
                        onClick={() => onChange(preset)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${value === preset
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {preset}s
                    </button>
                ))}
            </div>

            <style jsx>{`
                .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #6366f1;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #6366f1;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    );
};
