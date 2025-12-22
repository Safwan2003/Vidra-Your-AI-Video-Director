import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Globe } from 'lucide-react';
import { isValidUrl, analyzeUrl, AnalysisResult } from '../services/urlAnalyzer';

interface URLInputProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
    className?: string;
}

export const URLInput: React.FC<URLInputProps> = ({ onAnalysisComplete, className }) => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'validating' | 'analyzing' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        // Validate URL format
        setStatus('validating');
        if (!isValidUrl(url)) {
            setStatus('error');
            setError('Invalid URL format. Please include http:// or https://');
            return;
        }

        // Analyze URL
        setStatus('analyzing');
        setError('');

        try {
            const result = await analyzeUrl(url);
            setStatus('success');
            onAnalysisComplete(result);
        } catch (err) {
            setStatus('error');
            setError((err as Error).message || 'Failed to analyze website');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                </div>

                <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                        setUrl(e.target.value);
                        setStatus('idle');
                        setError('');
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="https://yourproduct.com"
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={status === 'analyzing'}
                />

                {/* Status Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {status === 'validating' && (
                        <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    )}
                    {status === 'analyzing' && (
                        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                    {status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-400" />
                    )}
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={!url.trim() || status === 'analyzing'}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {status === 'analyzing' ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing website...
                    </>
                ) : (
                    <>
                        <Globe className="h-5 w-5" />
                        Analyze Website
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}

            {/* Status Messages */}
            {status === 'analyzing' && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <p className="text-sm text-indigo-300">
                        🔍 Extracting product information from website...
                    </p>
                </div>
            )}
        </div>
    );
};
