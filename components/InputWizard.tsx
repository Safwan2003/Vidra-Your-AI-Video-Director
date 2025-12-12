
import React, { useState } from 'react';
import { ProjectBrief, RecordedClip } from '../types';
import { Button } from './Button';
import { ArrowRight, Target, Sparkles, Megaphone, Globe, ArrowLeft, MonitorPlay, Trash2 } from 'lucide-react';
import { MediaCapture } from './MediaCapture';

interface InputWizardProps {
    onComplete: (brief: ProjectBrief) => void;
    initialUrl?: string;
    initialDesc?: string;
}

export const InputWizard: React.FC<InputWizardProps> = ({ onComplete, initialUrl = '', initialDesc = '' }) => {
    const [step, setStep] = useState(1);
    const [brief, setBrief] = useState<ProjectBrief>({
        url: initialUrl || 'https://www.markytech.com/',
        productName: 'Marky Tech',
        description: initialDesc || 'A leading technology company providing tailored digital solutions including web development, digital marketing, and IT consulting to elevate businesses.',
        targetAudience: 'Business owners and startups looking for digital transformation',
        tone: 'Professional',
        recordedClips: [],
        callToAction: 'Elevate Your Business Today'
    });

    const updateBrief = (key: keyof ProjectBrief, value: any) => {
        setBrief(prev => ({ ...prev, [key]: value }));
    };

    const addRecordedClip = (url: string, description: string, type: 'video' | 'image') => {
        setBrief(prev => ({
            ...prev,
            recordedClips: [
                ...(prev.recordedClips || []),
                {
                    id: Date.now().toString(),
                    url,
                    description,
                    type
                } as RecordedClip
            ]
        }));
    };

    const removeRecordedClip = (index: number) => {
        setBrief(prev => ({
            ...prev,
            recordedClips: (prev.recordedClips || []).filter((_, i) => i !== index)
        }));
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">The Essentials</h2>
                <p className="text-slate-400">What are we promoting today?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Product URL</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={brief.url}
                            onChange={e => updateBrief('url', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Product Name</label>
                    <input
                        type="text"
                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={brief.productName}
                        onChange={e => updateBrief('productName', e.target.value)}
                        placeholder="e.g. Vidra"
                    />
                </div>
            </div>
            <Button className="w-full py-3" onClick={() => setStep(2)}>Next: Strategy <ArrowRight size={16} className="ml-2" /></Button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">The Strategy</h2>
                <p className="text-slate-400">Who is this for and how should it feel?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                        <Target size={14} /> Target Audience
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={brief.targetAudience}
                        onChange={e => updateBrief('targetAudience', e.target.value)}
                        placeholder="e.g. CTOs of Startups"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                        <Sparkles size={14} /> Tone of Voice
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Hype', 'Professional', 'Friendly', 'Luxury'].map((t) => (
                            <div
                                key={t}
                                onClick={() => updateBrief('tone', t)}
                                className={`cursor - pointer px - 4 py - 3 rounded - lg border text - center text - sm font - medium transition - all ${brief.tone === t
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                    } `}
                            >
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" className="w-1/3" onClick={() => setStep(1)}><ArrowLeft size={16} className="mr-2" /> Back</Button>
                <Button className="w-2/3" onClick={() => setStep(3)}>Next: Live Capture <ArrowRight size={16} className="ml-2" /></Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MonitorPlay className="text-indigo-400" />
                    Live Capture (Optional)
                </h3>
                <p className="text-slate-400">
                    Record your screen or upload assets. You can add multiple clips to showcase different features.
                </p>

                {/* List of Recorded Clips */}
                {brief.recordedClips && brief.recordedClips.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {brief.recordedClips.map((clip, idx) => (
                            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                                {clip.type === 'video' ? (
                                    <video src={clip.url} className="w-full h-24 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <img src={clip.url} alt="clip" className="w-full h-24 object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm">
                                    <p className="text-[10px] text-white truncate">Clip {idx + 1}</p>
                                </div>
                                <button
                                    onClick={() => removeRecordedClip(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <MediaCapture
                    url={brief.url}
                    onCaptureComplete={(url, type) => addRecordedClip(url, `Feature Demo ${brief.recordedClips?.length ? brief.recordedClips.length + 1 : 1} `, type)}
                />

                <div className="space-y-2 max-w-lg mx-auto mt-6">
                    <label className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2">
                        <Megaphone size={14} /> Final Call to Action
                    </label>
                    <input
                        type="text"
                        className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={brief.callToAction}
                        onChange={e => updateBrief('callToAction', e.target.value)}
                        placeholder="e.g. Start your free trial"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button variant="primary" onClick={() => onComplete(brief)} className="flex-1">
                        {brief.recordedClips && brief.recordedClips.length > 0 ? `Finish(${brief.recordedClips.length} Clips)` : 'Skip & Finish'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl transition-all duration-500
            ${step === 3 ? 'w-full max-w-5xl' : 'w-full max-w-lg'}
`}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step === i ? 'bg-indigo-500' : 'bg-slate-700'} `} />
                ))}
            </div>
        </div>
    );
};
