import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Key, Zap, Layers, Save } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
}

export interface AppSettings {
    geminiKey: string;
    model: 'gemini-2.0-flash-exp' | 'gemini-1.5-pro';
    useV2V: boolean;
    v2vProvider: 'runway' | 'replicate' | 'none';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [settings, setSettings] = useState<AppSettings>({
        geminiKey: localStorage.getItem('VIDRA_GEMINI_KEY') || import.meta.env.VITE_GEMINI_API_KEY || '',
        model: 'gemini-2.0-flash-exp',
        useV2V: false,
        v2vProvider: 'none'
    });

    useEffect(() => {
        const savedKey = localStorage.getItem('VIDRA_GEMINI_KEY');
        if (savedKey) setSettings(s => ({ ...s, geminiKey: savedKey }));
    }, []);

    const handleSave = () => {
        localStorage.setItem('VIDRA_GEMINI_KEY', settings.geminiKey);
        onSave(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Key size={18} className="text-indigo-400" /> API Configuration
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Gemini Key */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Gemini API Key</label>
                        <input
                            type="password"
                            className="w-full bg-slate-950 text-white px-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            placeholder="AIzaSy..."
                            value={settings.geminiKey}
                            onChange={(e) => setSettings(s => ({ ...s, geminiKey: e.target.value }))}
                        />
                        <p className="text-[10px] text-slate-500">
                            Required for the "Director" agent. Key is stored locally in your browser.
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                            <Zap size={14} /> AI Model
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setSettings(s => ({ ...s, model: 'gemini-2.0-flash-exp' }))}
                                className={`px-3 py-2 rounded border text-xs font-semibold transition-all ${settings.model === 'gemini-2.0-flash-exp'
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Gemini 2.0 Flash (Fast)
                            </button>
                            <button
                                onClick={() => setSettings(s => ({ ...s, model: 'gemini-1.5-pro' }))}
                                className={`px-3 py-2 rounded border text-xs font-semibold transition-all ${settings.model === 'gemini-1.5-pro'
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                Gemini 1.5 Pro (Smart)
                            </button>
                        </div>
                    </div>

                    {/* Experimental V2V Options */}
                    <div className="space-y-2 pt-4 border-t border-slate-800">
                        <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                            <Layers size={14} /> External Polish (V2V)
                        </label>
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 opacity-50 cursor-not-allowed">
                            <span className="text-sm text-slate-400">Enable Cloud Rendering</span>
                            <div className="w-8 h-4 bg-slate-600 rounded-full relative">
                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Currently disabled. Uses local "Agency Polish" engine instead.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                    <Button onClick={handleSave} className="w-full">
                        <Save size={16} className="mr-2" /> Save Settings
                    </Button>
                </div>
            </div>
        </div>
    );
};
