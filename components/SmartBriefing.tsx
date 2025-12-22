import React, { useState } from 'react';
import { URLInput } from './URLInput';
import { AnalysisResult } from '../services/urlAnalyzer';
import { ProjectBrief } from '../types';
import { ArrowRight, ArrowLeft, Sparkles, Edit3 } from 'lucide-react';
import { Button } from './Button';

interface SmartBriefingProps {
    onComplete: (brief: ProjectBrief, template: 'viable' | 'pretaa') => void;
    onBack?: () => void;
}

type Step = 'method' | 'url-input' | 'analysis-review' | 'refinement' | 'template-selection';

export const SmartBriefing: React.FC<SmartBriefingProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState<Step>('method');
    const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('url');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [brief, setBrief] = useState<Partial<ProjectBrief>>({
        tone: 'Professional',
        duration: 60,
        platform: 'Web',
    });

    // Step 1: Method Selection
    const renderMethodSelection = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">How would you like to start?</h2>
                <p className="text-slate-400">Choose the fastest way to create your video</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* URL Method */}
                <button
                    onClick={() => {
                        setInputMethod('url');
                        setStep('url-input');
                    }}
                    className="group p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border-2 border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all text-left"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-lg group-hover:scale-110 transition-transform">
                            <Sparkles className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">🔗 Analyze Website URL</h3>
                            <p className="text-slate-300 text-sm mb-3">
                                Paste your product URL and let AI extract everything automatically
                            </p>
                            <div className="flex items-center gap-2 text-xs text-indigo-300">
                                <span className="px-2 py-1 bg-indigo-500/20 rounded">Fastest</span>
                                <span className="px-2 py-1 bg-indigo-500/20 rounded">Recommended</span>
                            </div>
                        </div>
                    </div>
                </button>

                {/* Manual Method */}
                <button
                    onClick={() => {
                        setInputMethod('manual');
                        setStep('refinement');
                    }}
                    className="group p-6 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-700 hover:border-slate-600 rounded-xl transition-all text-left"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-700/50 rounded-lg group-hover:scale-110 transition-transform">
                            <Edit3 className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">✍️ Manual Entry</h3>
                            <p className="text-slate-300 text-sm mb-3">
                                Fill out the details yourself for full control
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="px-2 py-1 bg-slate-700/50 rounded">More Control</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            )}
        </div>
    );

    // Step 2: URL Input
    const renderUrlInput = () => (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Enter Your Product URL</h2>
                <p className="text-slate-400">We'll analyze your website and extract all the details</p>
            </div>

            <URLInput
                onAnalysisComplete={(result) => {
                    setAnalysis(result);
                    setBrief({
                        ...brief,
                        productName: result.productName,
                        description: result.description,
                        tone: result.suggestedTone,
                        callToAction: result.suggestedCTA,
                    });
                    setStep('analysis-review');
                }}
            />

            <button
                onClick={() => setStep('method')}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
                <ArrowLeft size={16} />
                Back
            </button>
        </div>
    );

    // Step 3: Analysis Review
    const renderAnalysisReview = () => (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">✨ Analysis Complete!</h2>
                <p className="text-slate-400">Review and adjust the extracted information</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
                <div>
                    <label className="text-sm text-slate-400 block mb-2">Product Name</label>
                    <input
                        type="text"
                        value={brief.productName || ''}
                        onChange={(e) => setBrief({ ...brief, productName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-400 block mb-2">Description</label>
                    <textarea
                        value={brief.description || ''}
                        onChange={(e) => setBrief({ ...brief, description: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Industry</label>
                        <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300">
                            {analysis?.industry}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Suggested Tone</label>
                        <div className="px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300">
                            {analysis?.suggestedTone}
                        </div>
                    </div>
                </div>

                {analysis?.keyFeatures && analysis.keyFeatures.length > 0 && (
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Key Features</label>
                        <div className="space-y-2">
                            {analysis.keyFeatures.map((feature, i) => (
                                <div key={i} className="px-4 py-2 bg-slate-900 rounded-lg text-slate-300 text-sm">
                                    • {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep('url-input')}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <button
                    onClick={() => setStep('refinement')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    Continue
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    // Step 4: Refinement
    const renderRefinement = () => (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Refine Your Brief</h2>
                <p className="text-slate-400">Add final details for your video</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
                <div>
                    <label className="text-sm text-slate-400 block mb-2">Target Audience</label>
                    <input
                        type="text"
                        value={brief.targetAudience || ''}
                        onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })}
                        placeholder="e.g., Startup founders, Enterprise teams"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-400 block mb-2">Tone</label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['Professional', 'Friendly', 'Hype', 'Luxury'] as const).map((tone) => (
                            <button
                                key={tone}
                                onClick={() => setBrief({ ...brief, tone })}
                                className={`py-3 rounded-lg font-medium transition-all ${brief.tone === tone
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                            >
                                {tone}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-sm text-slate-400 block mb-2">Call to Action</label>
                    <input
                        type="text"
                        value={brief.callToAction || ''}
                        onChange={(e) => setBrief({ ...brief, callToAction: e.target.value })}
                        placeholder="e.g., Start Free Trial"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(inputMethod === 'url' ? 'analysis-review' : 'method')}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <button
                    onClick={() => setStep('template-selection')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    Choose Template
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    // Step 5: Template Selection
    const renderTemplateSelection = () => (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Template</h2>
                <p className="text-slate-400">Select the style that best fits your product</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Viable */}
                <button
                    onClick={() => onComplete(brief as ProjectBrief, 'viable')}
                    className="group p-6 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-700 hover:border-indigo-500 rounded-xl transition-all text-left"
                >
                    <h3 className="text-2xl font-bold text-white mb-3">Viable</h3>
                    <p className="text-slate-300 text-sm mb-4">
                        Professional SaaS template. Perfect for dashboards, B2B tools, and data-driven products.
                    </p>
                    <div className="text-xs text-slate-400 space-y-1">
                        <div>✓ 6 scenes (60 seconds)</div>
                        <div>✓ Feature highlights</div>
                        <div>✓ Social proof</div>
                    </div>
                </button>

                {/* Pretaa */}
                <button
                    onClick={() => onComplete(brief as ProjectBrief, 'pretaa')}
                    className="group p-6 bg-slate-800/50 hover:bg-slate-800/70 border-2 border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left"
                >
                    <h3 className="text-2xl font-bold text-white mb-3">Pretaa</h3>
                    <p className="text-slate-300 text-sm mb-4">
                        Isometric visual-first template. Ideal for mobile apps, consumer products, and visual storytelling.
                    </p>
                    <div className="text-xs text-slate-400 space-y-1">
                        <div>✓ 9 scenes (90 seconds)</div>
                        <div>✓ Mobile-first design</div>
                        <div>✓ Isometric visuals</div>
                    </div>
                </button>
            </div>

            <button
                onClick={() => setStep('refinement')}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
                <ArrowLeft size={16} />
                Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                {step === 'method' && renderMethodSelection()}
                {step === 'url-input' && renderUrlInput()}
                {step === 'analysis-review' && renderAnalysisReview()}
                {step === 'refinement' && renderRefinement()}
                {step === 'template-selection' && renderTemplateSelection()}
            </div>
        </div>
    );
};
