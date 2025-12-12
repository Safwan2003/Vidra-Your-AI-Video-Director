import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Video, StopCircle, Trash2, CheckCircle, Upload, Image as ImageIcon, Monitor, AlertCircle, RefreshCw, Lock, Tablet, Smartphone, Laptop } from 'lucide-react';

interface MediaCaptureProps {
    url?: string;
    onCaptureComplete: (blobUrl: string, type: 'video' | 'image') => void;
}

type Tab = 'record' | 'upload_video' | 'upload_image';
type DeviceMode = 'laptop' | 'tablet' | 'mobile';

export const MediaCapture: React.FC<MediaCaptureProps> = ({ url = 'https://example.com', onCaptureComplete }) => {
    const [activeTab, setActiveTab] = useState<Tab>('record');
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('laptop');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'video' | 'image'>('video');
    const [isRecording, setIsRecording] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIframeError(false);
        setPermissionError(false);
        setIframeKey(prev => prev + 1);
    }, [url]);

    const deviceStyles = {
        laptop: 'w-full aspect-video max-w-4xl',
        tablet: 'w-[768px] aspect-[3/4]',
        mobile: 'w-[375px] aspect-[9/16]'
    };

    const startRecording = async () => {
        setPermissionError(false);
        if (!navigator.mediaDevices?.getDisplayMedia) {
            setPermissionError(true);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } as any,
                audio: false,
                preferCurrentTab: true,
                selfBrowserSurface: 'include'
            } as any);

            // --- REGION CAPTURE LOGIC ---
            if (captureContainerRef.current && (window as any).CropTarget) {
                try {
                    const cropTarget = await (window as any).CropTarget.fromElement(captureContainerRef.current);
                    const [track] = stream.getVideoTracks();
                    if ((track as any).cropTo) {
                        await (track as any).cropTo(cropTarget);
                        console.log("Region Capture: Cropped to container successfully.");
                    }
                } catch (cropError) {
                    console.warn("Region Capture failed:", cropError);
                }
            }

            const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
                ? "video/webm; codecs=vp9"
                : "video/webm";

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const blobUrl = URL.createObjectURL(blob);
                setPreviewUrl(blobUrl);
                setPreviewType('video');
                onCaptureComplete(blobUrl, 'video');
                stream.getTracks().forEach(t => t.stop());
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

            stream.getVideoTracks()[0].onended = () => {
                if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            };
        } catch (err: any) {
            console.error("Capture Error:", err);
            setPermissionError(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state !== 'inactive') {
            mediaRecorderRef.current?.stop();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);

        if (file.type.startsWith('image/')) {
            setPreviewType('image');
            onCaptureComplete(blobUrl, 'image');
        } else {
            setPreviewType('video');
            onCaptureComplete(blobUrl, 'video');
        }
    };

    const triggerUpload = () => fileInputRef.current?.click();

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            {/* Tab Navigation */}
            <div className="flex justify-center">
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                    {[
                        { id: 'record', label: 'Record Screen', icon: Monitor },
                        { id: 'upload_video', label: 'Upload Video', icon: Upload },
                        { id: 'upload_image', label: 'Upload Image', icon: ImageIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as Tab);
                                setPreviewUrl(null);
                            }}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8">
                {activeTab === 'record' ? (
                    <div className="flex flex-col items-center gap-6 w-full h-full">
                        {/* Device Mode Switcher */}
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 mb-4">
                            {[
                                { id: 'laptop', icon: Laptop, label: 'Desktop' },
                                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                                { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setDeviceMode(mode.id as DeviceMode)}
                                    className={`p-2 rounded-md transition-all ${deviceMode === mode.id
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                    title={mode.label}
                                >
                                    <mode.icon size={20} />
                                </button>
                            ))}
                        </div>

                        {/* Capture Container with Iframe */}
                        <div
                            ref={captureContainerRef}
                            className={`relative bg-white transition-all duration-300 ease-in-out shadow-2xl rounded-lg overflow-hidden border-4 border-slate-800 ${deviceStyles[deviceMode]}`}
                        >
                            {iframeError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-2">
                                    <AlertCircle size={32} />
                                    <p>Unable to load preview</p>
                                    <Button onClick={() => setIframeKey(k => k + 1)} size="sm" variant="outline">
                                        <RefreshCw size={14} className="mr-1" /> Retry
                                    </Button>
                                </div>
                            ) : (
                                <iframe
                                    key={iframeKey}
                                    src={url}
                                    className="w-full h-full border-0"
                                    onError={() => setIframeError(true)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            )}

                            {/* Overlay during recording */}
                            {isRecording && (
                                <div className="absolute inset-0 border-4 border-red-500 animate-pulse pointer-events-none z-50 rounded-lg" />
                            )}
                        </div>

                        {/* Helper Text */}
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                            <Lock size={12} />
                            Select <strong>"This Tab"</strong> when asked to share screen for best results
                        </p>

                        {/* Controls */}
                        {!isRecording ? (
                            <Button
                                onClick={startRecording}
                                variant="primary"
                                className="group bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                icon={<div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                            >
                                Start Live Capture
                            </Button>
                        ) : (
                            <Button onClick={stopRecording} variant="secondary" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                <StopCircle size={18} className="mr-2" />
                                Stop Recording
                            </Button>
                        )}

                        {permissionError && (
                            <div className="absolute bottom-4 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/20 flex items-center gap-2">
                                <AlertCircle size={16} />
                                Please allow screen recording or try again.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-[450px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 m-4 rounded-xl bg-slate-800/30 animate-fade-in group hover:border-indigo-500/50 transition-colors">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={activeTab === 'upload_video' ? "video/*" : "image/*"}
                            onChange={handleFileUpload}
                        />
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                            {activeTab === 'upload_video' ? <Video size={32} className="text-indigo-400" /> : <ImageIcon size={32} className="text-pink-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {activeTab === 'upload_video' ? 'Upload Video Clip' : 'Upload Screenshot'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-8 text-center max-w-sm">
                            {activeTab === 'upload_video'
                                ? 'Drag and drop your MP4/WebM file here, or click to browse.'
                                : 'Upload a high-res PNG or JPG of your product interface.'}
                        </p>
                        <Button onClick={triggerUpload} variant="primary" className="py-3 px-8">
                            Select File
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
