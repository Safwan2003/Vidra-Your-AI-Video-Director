import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';

interface TerminalProps {
    logs: LogMessage[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full max-w-2xl bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden font-mono text-sm">
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs text-slate-400">vidra-agent — zsh</span>
            </div>
            <div className="p-4 h-64 overflow-y-auto space-y-2 scrollbar-hide">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 animate-fade-in-up">
                        <span className="text-slate-500 min-w-[20px]">{'>'}</span>
                        <span className={`
                            ${log.type === 'success' ? 'text-emerald-400' : ''}
                            ${log.type === 'process' ? 'text-indigo-400 animate-pulse' : ''}
                            ${log.type === 'info' ? 'text-slate-300' : ''}
                        `}>
                            {log.text}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};