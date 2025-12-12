import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Video, StopCircle, Trash2, CheckCircle, ExternalLink, RefreshCw, AlertCircle, Lock, Upload, FileVideo } from 'lucide-react';

interface ScreenRecorderProps {
    url?: string;
    onRecordingComplete: (blobUrl: string) => void;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ url = 'https://example.com', onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [iframeError, setIframeError] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [key, setKey] = useState(0); // To force iframe reload
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIframeError(false);
        setPermissionError(false);
    }, [url]);

    const startRecording = async () => {
        setPermissionError(false);
        
        // Defensive check for API support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            console.warn("getDisplayMedia is not supported in this environment.");
            setPermissionError(true);
            return;
        }

        try {
            // We use getDisplayMedia to let the user select the capture area
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    mediaSource: 'screen',
                    // Attempt to influence aspect ratio for better mobile look, though browser support varies
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } as any,
                audio: false
            });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const blobUrl = URL.createObjectURL(blob);
                setPreviewUrl(blobUrl);
                onRecordingComplete(blobUrl);
                
                stream.getTracks().forEach(track => track.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Handle user clicking "Stop sharing" in browser UI
            stream.getVideoTracks()[0].onended = () => {
                if (mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
            };

        } catch (err: any) {
            console.error("Error starting screen capture:", err);
            // Handle permissions policy error specifically or generic denied error
            if (
                err.message?.includes('permissions policy') || 
                err.name === 'NotAllowedError' || 
                err.name === 'SecurityError'
            ) {
                setPermissionError(true);
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const resetRecording = () => {
        setPreviewUrl(null);
        setIsRecording(false);
        setPermissionError(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            setPreviewUrl(blobUrl);
            onRecordingComplete(blobUrl);
            setPermissionError(false);
        }
    };

    const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
        // We can't easily detect X-Frame-Options error from JS.
    };

    // If we have a captured video, show the preview player
    if (previewUrl) {
        return (
            <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 group shadow-2xl">
                    <video src={previewUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    
                    {/* Overlay Controls */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Button variant="ghost" onClick={resetRecording} className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                            <Trash2 size={16} className="mr-2"/> Retake
                        </Button>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                            <CheckCircle size={18} /> Captured Successfully
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-slate-500">
                    Preview of your recording. Click "Retake" to try again.
                </p>
            </div>
        );
    }

    // Virtual Browser Interface
    return (
        <div className="flex flex-col w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex-shrink-0">
            {/* Browser Toolbar */}
            <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-4 flex-shrink-0 relative z-20">
                {/* Traffic Lights */}
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>

                {/* Navigation Controls */}
                <div className="flex gap-2 text-slate-500">
                     <Button variant="ghost" className="p-1 h-auto" onClick={() => setKey(k => k + 1)}>
                        <RefreshCw size={14} />
                     </Button>
                </div>

                {/* Address Bar */}
                <div className="flex-1 bg-slate-900 h-8 rounded flex items-center px-3 gap-2 border border-slate-700">
                    <Lock size={12} className="text-emerald-500" />
                    <span className="text-xs text-slate-300 font-mono truncate select-all">{url}</span>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                    {isRecording ? (
                        <Button 
                            variant="primary" 
                            onClick={stopRecording}
                            className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 border-red-500 animate-pulse"
                        >
                            <StopCircle size={14} className="mr-1.5" /> Stop
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={startRecording}
                            className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 border-indigo-500"
                        >
                            <Video size={14} className="mr-1.5" /> Record
                        </Button>
                    )}
                </div>
            </div>

            {/* Browser Content Area */}
            <div className="flex-1 relative bg-white w-full">
                {/* Recording Border Overlay */}
                {isRecording && (
                    <div className="absolute inset-0 border-[4px] border-red-500 z-50 pointer-events-none animate-pulse-slow shadow-[inset_0_0_20px_rgba(239,68,68,0.5)]" />
                )}

                {/* ERROR STATE: Permission Blocked */}
                {permissionError && (
                    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <Lock size={32} className="text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Recording Restricted</h3>
                        <p className="text-slate-400 max-w-sm mb-6 text-sm">
                            The browser has blocked screen recording in this environment. <br/>
                            Don't worry, you can upload a video file instead.
                        </p>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="video/*"
                            onChange={handleFileUpload}
                        />
                        <Button 
                            variant="primary" 
                            onClick={() => fileInputRef.current?.click()}
                            icon={<Upload size={18}/>}
                        >
                            Upload Video File
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={() => setPermissionError(false)}
                            className="mt-4 text-xs text-slate-500"
                        >
                            Try Recording Again
                        </Button>
                    </div>
                )}

                {/* Iframe */}
                {!iframeError ? (
                    <iframe 
                        key={key}
                        src={url} 
                        className="w-full h-full border-none bg-white"
                        title="Live Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        onError={() => setIframeError(true)}
                        onLoad={handleIframeLoad}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 p-8 text-center">
                        <AlertCircle size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Unable to embed this website</h3>
                        <p className="max-w-xs mx-auto mt-2 mb-6">
                            This site (<b>{new URL(url).hostname}</b>) blocks embedding in other windows for security.
                        </p>
                        <Button 
                            variant="secondary" 
                            className="text-slate-600 bg-white border-slate-300 shadow-sm"
                            onClick={() => window.open(url, '_blank')}
                        >
                            <ExternalLink size={16} className="mr-2" /> Open in New Window
                        </Button>
                        <div className="mt-8 flex flex-col gap-2">
                             <p className="text-xs text-slate-400">
                                You can still record! Click "Record" above, then select the new tab.
                            </p>
                            <span className="text-xs text-slate-300">- OR -</span>
                             <Button 
                                variant="ghost" 
                                className="text-xs text-indigo-500" 
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileVideo size={12} className="mr-1"/> Upload existing video
                            </Button>
                             <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                )}
                
                {/* Fallback Overlay (Always visible if iframe is likely to fail or for better UX) */}
                {!permissionError && !iframeError && (
                     <div className="absolute bottom-4 right-4 z-40">
                        <Button 
                            variant="secondary" 
                            className="text-xs bg-slate-900/90 text-slate-300 backdrop-blur border-slate-700 shadow-xl"
                            onClick={() => setIframeError(true)}
                        >
                            Site not loading?
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};