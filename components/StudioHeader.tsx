import React from 'react';
import {
    Play,
    Share2,
    Download,
    CheckCircle2,
    Clock,
    Layout,
    Wand2,
    MonitorPlay,
    Settings,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { Button } from './Button';

interface StudioHeaderProps {
    brandName: string;
    sceneCount: number;
    currentTime?: string;
    onExport: () => void;
    onBack?: () => void;
    isExporting?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
    brandName,
    sceneCount,
    onExport,
    onBack,
    isExporting
}) => {
    return (
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-[60]">
            <div className="flex items-center gap-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    <div className="w-px h-4 bg-slate-800" />
                </button>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">{brandName}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Layout size={10} />
                            {sceneCount} Scenes
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Live Studio Active</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="secondary"
                    className="bg-slate-900/50 border-white/5 hover:bg-slate-800 py-1.5 h-auto text-xs font-bold"
                >
                    <Share2 size={14} className="mr-2" /> Share
                </Button>

                <Button
                    onClick={onExport}
                    disabled={isExporting}
                    className="bg-indigo-600 hover:bg-indigo-500 py-1.5 h-auto text-xs font-bold shadow-lg shadow-indigo-500/20 border-none"
                >
                    {isExporting ? (
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="animate-spin" /> Rendering...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Download size={14} /> Export Video
                        </div>
                    )}
                </Button>
            </div>
        </header>
    );
};
