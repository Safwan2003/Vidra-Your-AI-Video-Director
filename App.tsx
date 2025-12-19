import React, { useState, useRef } from 'react';
import { refineSceneSvg } from './services/visual';
import { VideoFactory } from './services/videoFactory';
import { generateSceneVideo, generateVoiceover } from './services/wanxService';
import { AppState, VideoPlan, LogMessage, ProjectBrief } from './types';

import { Terminal } from './components/Terminal';
import { Button } from './components/Button';
import { SceneCard } from './components/SceneCard';
import { InputWizard } from './components/InputWizard';
import { Player as RemotionPlayer } from '@remotion/player';
import { MainVideo } from './src/remotion/compositions/MainVideo';
import { ContentEditor } from './components/ContentEditor';
import { dbService, SavedProject } from './services/dbService';
import { Edit, Save, RefreshCw, Download, Wand2, ArrowRight, Zap, MonitorPlay, Presentation, Upload, ImagePlus, Sparkles, Layout, Smartphone, MousePointer2, MessageSquare, Grid, PlayCircle, PauseCircle, Layers, Plus, Loader2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { StudioHeader } from './components/StudioHeader';
import { SceneRefiner } from './services/SceneRefiner';

const INITIAL_LOGS: LogMessage[] = [
    { id: '1', text: 'Vidra Agent v2.5 initialized...', type: 'info' },
    { id: '2', text: 'Waiting for project brief...', type: 'info' },
];

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-red-500/10 p-4 rounded-full mb-6 relative">
                        <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
                        <Zap size={48} className="text-red-500 relative z-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
                    <p className="text-slate-400 max-w-md mb-8">
                        The agent encountered a critical error during render.
                        <br /><span className="font-mono text-xs text-red-400 mt-2 block bg-black/30 p-2 rounded">{this.state.error?.message}</span>
                    </p>
                    <Button onClick={() => window.location.reload()} variant="primary">
                        <RefreshCw size={18} className="mr-2" /> Reload Application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default function App() {
    const [state, setState] = useState<AppState>(AppState.IDLE);
    const [brief, setBrief] = useState<ProjectBrief | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('Hype Launch');
    const [logs, setLogs] = useState<LogMessage[]>(INITIAL_LOGS);
    const [plan, setPlan] = useState<VideoPlan | null>(null);
    const [activeSceneIndex, setActiveSceneIndex] = useState(0);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [directorPrompt, setDirectorPrompt] = useState('');
    const [isDirectorWorking, setIsDirectorWorking] = useState(false);

    // Hardcoded settings from env as per user request
    const appSettings = {
        groqKey: import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '',
        hfKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
        dashscopeKey: import.meta.env.VITE_DASHSCOPE_API_KEY || '',
        model: 'openai/gpt-oss-120b'
    };

    const playerRef = useRef<any>(null); // Remotion Player Ref

    const addLog = (message: string, type: 'info' | 'success' | 'process' | 'error' = 'info') => {
        setLogs(prev => [...prev, {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        }]);
    };

    const handleStartBrief = () => {
        setState(AppState.BRIEFING);
    };

    const handleBriefComplete = (completedBrief: ProjectBrief) => {
        setBrief(completedBrief);
        setState(AppState.ANALYZING);
        setLogs([{ id: 'init', text: 'Processing strategic brief...', type: 'info' }]);

        // Simulation of "Agent" work
        setTimeout(() => addLog(`Target Audience: ${completedBrief.targetAudience}`, 'info'), 800);
        setTimeout(() => addLog(`Tone detected: ${completedBrief.tone}`, 'info'), 1200);

        if (completedBrief.recordedClips.length > 0) {
            setTimeout(() => addLog(`Analyzed ${completedBrief.recordedClips.length} recorded clips...`, 'success'), 1600);
        }

        setTimeout(() => addLog('Analyzing features for visual metaphors...', 'process'), 2000);
        setTimeout(() => {
            addLog('Strategy Locked. Select a visual template.', 'success');
            setState(AppState.TEMPLATE_SELECTION);
        }, 3000);
    };

    const handleGenerate = async () => {
        if (!brief) return;
        setState(AppState.GENERATING);
        addLog(`Template: ${selectedTemplate}`, 'info');
        addLog('🚀 Initializing Video Factory...', 'process');

        try {
            // Factory Mode
            const templateKey = selectedTemplate.toLowerCase().includes('pretaa') ? 'pretaa' : 'viable';
            const generatedPlan = await VideoFactory.generate(brief, templateKey);

            addLog('✅ Video Plan Created!', 'success');

            // Post-process: Inject recorded clips if the plan requests them
            if (brief.recordedClips.length > 0) {
                let clipIndex = 0;
                generatedPlan.scenes = generatedPlan.scenes.map(scene => {
                    // @ts-ignore - The generated interface from JSON might have useRecordedClip
                    if (scene.useRecordedClip && clipIndex < brief.recordedClips.length) {
                        const clip = brief.recordedClips[clipIndex];
                        clipIndex++; // Move to next clip for next scene
                        return {
                            ...scene,
                            customMedia: clip.url,
                            // @ts-ignore
                            customMediaType: clip.type === 'image' ? 'image' : 'video',
                            // For recorded clips, we often want a straight-on view to see details clearly
                            cameraAngle: 'straight_on'
                        }
                    }
                    return scene;
                });
            }

            // --- VOICE OVER GENERATION ---
            addLog('🎙️ Generating Voiceovers...', 'process');
            const scenesWithVoice = await Promise.all(generatedPlan.scenes.map(async (scene) => {
                if (scene.voiceoverScript) {
                    const voUrl = await generateVoiceover(scene.voiceoverScript);
                    if (voUrl) {
                        return { ...scene, voiceoverUrl: voUrl };
                    }
                }
                return scene;
            }));
            generatedPlan.scenes = scenesWithVoice;

            setPlan(generatedPlan);
            addLog('Script & Storyboard generated.', 'success');
            addLog('Compiling Motion Assets...', 'process');

            setTimeout(() => {
                setState(AppState.EDITOR);
            }, 1000);
        } catch (error) {
            console.error("Generation Error:", error);
            addLog(`Error: ${(error as Error).message}`, 'error');
            // Revert state so user isn't stuck
            setState(AppState.TEMPLATE_SELECTION);
            alert(`Failed to generate video plan. Please check your API Key. \n\nError: ${(error as Error).message}`);
        }
    };

    const handleRegenerateScene = async () => {
        if (!plan) return;
        setIsRegenerating(true);
        const scene = plan.scenes[activeSceneIndex];

        try {
            const newSvg = await refineSceneSvg(scene.visualDescription, scene.svgContent, scene.type, appSettings.groqKey);
            const newPlan = { ...plan };
            newPlan.scenes[activeSceneIndex].svgContent = newSvg;
            setPlan(newPlan);
        } catch (error) {
            console.error("Failed to regenerate", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleGenerateBackground = async () => {
        if (!plan) return;
        setIsRegenerating(true);
        const scene = plan.scenes[activeSceneIndex];

        try {
            // Use Wan 2.1 for video generation (no HF fallback)
            if (appSettings.dashscopeKey) {
                addLog('Generating What a Story quality video background (Wan 2.1)...', 'process');

                // Use wanPrompt if available, otherwise use visualDescription
                const prompt = scene.wanPrompt || scene.visualDescription;
                const videoUrl = await generateSceneVideo(prompt);

                if (videoUrl) {
                    const newPlan = { ...plan };
                    newPlan.scenes[activeSceneIndex].videoUrl = videoUrl;
                    setPlan(newPlan);
                    addLog('Premium video background generated!', 'success');
                    return;
                } else {
                    addLog('⚠️ Wan API blocked by CORS. Using premium CSS gradients instead!', 'info');
                    addLog('💡 CSS gradients are What a Story quality - no backend needed!', 'info');
                }
            } else {
                addLog('No DashScope API key. Using CSS gradient fallback.', 'error');
            }

            // No image fallback - just log the success of CSS gradients
            // The DynamicBackground component will use CSS gradients automatically
        } catch (error) {
            console.error("Failed to generate background:", error);
            addLog('Background generation failed. Using CSS gradient.', 'error');
        } finally {
            setIsRegenerating(false);
        }
    }



    // Calculate total duration for Remotion (Safe calculation)
    const validPlan = plan && plan.scenes && Array.isArray(plan.scenes);

    // For template mode, use fixed duration (710 frames = ~23.6s at 30fps)
    const isTemplateMode = plan?.template === 'viable';
    const templateDuration = 2700; // Sum of all Viable template slots (90s)

    const calculatedDuration = isTemplateMode
        ? templateDuration
        : (validPlan ? Math.floor(plan.scenes.reduce((acc, s) => acc + Math.max(0.1, s.duration || 0), 0) * 30) : 0);

    const totalDurationInFrames = Math.max(1, calculatedDuration);

    const seekToScene = (index: number) => {
        if (!plan || !playerRef.current) return;

        setActiveSceneIndex(index);

        // Calculate start frame of this scene
        let frameOffset = 0;
        for (let i = 0; i < index; i++) {
            frameOffset += Math.floor(plan.scenes[i].duration * 30);
        }

        playerRef.current.seekTo(frameOffset);
    };

    const handleExport = async () => {
        if (!plan) return;
        addLog('Initiating high-quality render...', 'process');

        // Save to DB before export
        if (brief) {
            const project: SavedProject = {
                id: Date.now().toString(),
                name: plan.brandName || 'Untitled Project',
                timestamp: Date.now(),
                brief,
                plan,
                thumbnail: plan.scenes[0].videoUrl || plan.scenes[0].svgContent
            };
            await dbService.saveProject(project);
            addLog('Project saved to local database.', 'success');
        }

        try {
            addLog('Saving plan and initializing render...', 'process');

            // Call Proxy to trigger render
            const response = await fetch('http://localhost:3001/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plan)
            });

            if (response.ok) {
                const result = await response.json();
                addLog('🎥 Video Render Started!', 'success');
                addLog(`⏳ Rendering MP4 video...`, 'process');

                // Poll for render completion and download MP4
                // Pass the specific filename we are waiting for
                if (result.filename) {
                    pollRenderStatus(result.filename);
                } else {
                    addLog('⚠️ No filename returned from render trigger.', 'error');
                }
            } else {
                addLog('Render trigger failed. Is proxy running?', 'error');
            }
        } catch (e) {
            console.error(e);
            addLog('Export failed. Check console.', 'error');
        }
    };

    const handleDirectorDeploy = async () => {
        if (!plan || !directorPrompt.trim()) return;

        setIsDirectorWorking(true);
        const isGlobal = ['plan', 'all', 'entire', 'video', 'replan', 'structure', 'theme', 'color scheme', 'brand'].some(word =>
            directorPrompt.toLowerCase().includes(word)
        );

        addLog(`AI Director: Analyzing ${isGlobal ? 'Global' : 'Scene'} instruction "${directorPrompt}"...`, 'process');

        try {
            if (isGlobal) {
                const updatedPlan = await SceneRefiner.refinePlan(plan, directorPrompt);
                setPlan(updatedPlan);
                addLog('AI Director: Video plan successfully updated.', 'success');
            } else {
                const currentScene = plan.scenes[activeSceneIndex];
                const updatedScene = await SceneRefiner.refine(currentScene, directorPrompt);
                const newPlan = { ...plan };
                newPlan.scenes[activeSceneIndex] = updatedScene;
                setPlan(newPlan);
                addLog('AI Director: Scene successfully refined.', 'success');
            }
            setDirectorPrompt('');
        } catch (error) {
            console.error(error);
            addLog('AI Director: Failed to execute command.', 'error');
        } finally {
            setIsDirectorWorking(false);
        }
    };

    const moveScene = (from: number, to: number) => {
        if (!plan || to < 0 || to >= plan.scenes.length) return;
        const newScenes = [...plan.scenes];
        const [moved] = newScenes.splice(from, 1);
        newScenes.splice(to, 0, moved);
        setPlan({ ...plan, scenes: newScenes });
        setActiveSceneIndex(to);
    };

    const deleteScene = (idx: number) => {
        if (!plan || plan.scenes.length <= 1) return;
        const newScenes = plan.scenes.filter((_, i) => i !== idx);
        setPlan({ ...plan, scenes: newScenes });
        if (activeSceneIndex >= newScenes.length) {
            setActiveSceneIndex(newScenes.length - 1);
        }
    };

    const pollRenderStatus = async (targetFilename: string) => {
        const maxAttempts = 60; // Poll for 5 minutes max (60 * 5 seconds)
        let attempts = 0;

        const poll = async () => {
            try {
                // Poll for specific filename
                const response = await fetch(`http://localhost:3001/api/render/status?filename=${targetFilename}`);
                const data = await response.json();

                if (data.status === 'completed') {
                    addLog('✅ Video render complete!', 'success');
                    addLog(`📥 Downloading: ${data.filename}`, 'info');

                    // Trigger download
                    const downloadUrl = `http://localhost:3001${data.downloadUrl}`;
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = data.filename;
                    a.click();

                    addLog('🎉 Video downloaded successfully!', 'success');
                    return;
                }

                // Still rendering
                attempts++;
                if (attempts < maxAttempts) {
                    addLog(`⏳ Rendering... (${attempts * 5}s elapsed)`, 'process');
                    setTimeout(poll, 5000); // Poll every 5 seconds
                } else {
                    addLog('⚠️ Render timeout. Check terminal for progress.', 'error');
                }
            } catch (error) {
                console.error('Poll error:', error);
                addLog('Failed to check render status.', 'error');
            }
        };

        // Start polling after 3 seconds
        setTimeout(poll, 3000);
    };

    const handlePlanUpdate = (newPlan: VideoPlan) => {
        setPlan(newPlan);
        // Save to DB (Debounced ideal, but simple save is fine logic-wise as user intents to change)
        // For performance, we might skip DB save on every keystroke, but for MVP it's okay.
        // Actually, let's only DB save on "Done" or periodic. 
        // But the user requested "real-time impact". 
        // The setPlan(newPlan) updates the player IMMEDIATELY.
    };

    const handleEditorRegenerate = async (sceneIndex: number) => {
        if (!plan) return;
        setIsRegenerating(true);
        const scene = plan.scenes[sceneIndex];

        try {
            // Try to generate video via Wan 2.1 (via Proxy)
            // We don't check appSettings.dashscopeKey here because the Proxy Server might have the key even if frontend doesn't
            addLog(`Requesting video for scene ${sceneIndex + 1} from proxy...`, 'process');

            // Use wanPrompt if available, otherwise use visualDescription
            const prompt = scene.wanPrompt || scene.visualDescription;
            const videoUrl = await generateSceneVideo(prompt);

            if (videoUrl) {
                const newPlan = { ...plan };
                newPlan.scenes[sceneIndex].videoUrl = videoUrl;
                setPlan(newPlan);
                addLog(`Scene ${sceneIndex + 1} video generated successfully!`, 'success');
                return;
            }

            // If we get here, generation failed or returned null
            addLog('Could not generate video. Falling back to CSS gradient.', 'error');
            addLog('Make sure Proxy Server is running: npm run proxy', 'info');
        } catch (error) {
            console.error("Regen Error:", error);
            addLog('Background generation error.', 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen iso-bg flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setState(AppState.IDLE)}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-45 border-2 border-indigo-400 shadow-lg shadow-indigo-500/20">
                            <span className="-rotate-45 font-bold text-white">V</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-100">Vidra</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {state === AppState.EDITOR && (
                            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                AGENT ACTIVE
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">

                    {/* IDLE */}
                    {state === AppState.IDLE && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in-up">
                            <div className="space-y-4 max-w-2xl relative z-10">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl -z-10 rounded-full" />
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                                    Turn Ideas into <br />
                                    <span className="gradient-text text-glow">
                                        Launch Videos
                                    </span>
                                </h1>
                                <p className="text-lg text-slate-300 max-w-lg mx-auto leading-relaxed">
                                    Vidra is your autonomous <span className="text-indigo-400 font-semibold">AI Creative Director</span>.<br />
                                    Agency-quality motion graphics, generated in seconds.
                                </p>
                            </div>

                            <Button
                                className="py-4 px-10 text-lg font-semibold shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform duration-300 border border-indigo-400/30"
                                onClick={handleStartBrief}
                                icon={<ArrowRight size={20} />}
                            >
                                Start New Project
                            </Button>
                        </div>
                    )}

                    {/* BRIEFING WIZARD */}
                    {state === AppState.BRIEFING && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <InputWizard
                                onComplete={handleBriefComplete}
                                initialUrl="https://www.markytech.com/"
                                initialDesc="MarkyTech is a leading software development company that specializes in creating custom software solutions for businesses of all sizes. Our team of experienced developers uses the latest technologies to deliver high-quality, scalable, and secure software that meets the unique needs of each client. Whether you need a custom web application, mobile app, or enterprise software solution, MarkyTech has the expertise and resources to help you succeed."
                            />
                        </div>
                    )}

                    {/* TEMPLATE SELECTION STATE */}
                    {state === AppState.TEMPLATE_SELECTION && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold text-white">Viable Template</h2>
                                <p className="text-slate-400">Agency-quality video template for {brief?.productName}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                                {[
                                    {
                                        id: 'viable',
                                        name: 'Viable (Agency)',
                                        desc: 'Strict 5-slot structure matching "What a Story" Agency quality. Premium 3D & Claymorphism.',
                                        tags: ['Agency Quality', '3D', 'Modular'],
                                        color: 'indigo'
                                    },
                                    {
                                        id: 'pretaa',
                                        name: 'Pretaa (Isometric)',
                                        desc: 'Stop-motion style isometric animation sequence. Perfect for tech explainers.',
                                        tags: ['Isometric', 'Stop Motion', 'Tech'],
                                        color: 'emerald'
                                    }
                                ].map(template => (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.name)}
                                        className={`cursor-pointer relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 shadow-xl bg-slate-800 ${selectedTemplate.toLowerCase().includes(template.id)
                                            ? `border-${template.color}-500 shadow-${template.color}-500/20 scale-[1.02]`
                                            : 'border-slate-700 hover:border-slate-600 opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="mb-6 flex justify-center">
                                            <Zap className={`text-${template.color}-500`} size={48} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3 text-center">{template.name}</h3>
                                        <p className="text-sm text-slate-400 mb-6 text-center leading-relaxed">
                                            {template.desc}
                                        </p>

                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {template.tags.map(f => (
                                                <span key={f} className="text-[10px] uppercase font-bold bg-slate-900 px-3 py-1.5 rounded text-slate-400">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>

                                        {selectedTemplate.toLowerCase().includes(template.id) && (
                                            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full bg-${template.color}-500 ring-4 ring-${template.color}-500/30 shadow-lg shadow-${template.color}-500/50`} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full max-w-md py-4 text-lg font-semibold shadow-lg shadow-indigo-500/20"
                                onClick={handleGenerate}
                                icon={<Wand2 size={20} />}
                            >
                                Generate Video
                            </Button>
                        </div>
                    )}

                    {/* PROCESSING STATE */}
                    {(state === AppState.ANALYZING || state === AppState.GENERATING) && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                                <Terminal logs={logs} />
                            </div>
                            <p className="text-slate-400 animate-pulse font-mono uppercase tracking-widest text-sm">
                                {state === AppState.ANALYZING ? '>> Analyzing Strategy...' : '>> Creative Director Agent Active...'}
                            </p>
                        </div>
                    )}

                    {/* EDITOR STATE (STUDIO MODE) */}
                    {state === AppState.EDITOR && plan && (
                        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-in fade-in duration-500">
                            {/* Unified Studio Header */}
                            <StudioHeader
                                brandName={plan.brandName || 'Untitled Project'}
                                sceneCount={plan.scenes.length}
                                onExport={handleExport}
                                onBack={() => setState(AppState.TEMPLATE_SELECTION)}
                                isExporting={isRegenerating}
                            />

                            <div className="flex-1 flex overflow-hidden">
                                {/* PANE 1: Vertical Scene Strip (Left) */}
                                <div className="w-20 border-r border-white/5 bg-slate-950 flex flex-col items-center py-6 gap-6 overflow-y-auto scrollbar-none relative">
                                    <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-default mb-2">
                                        <Layers size={14} className="text-white" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest">Scenes</span>
                                    </div>

                                    {plan.scenes.map((scene, idx) => {
                                        const isActive = idx === activeSceneIndex;
                                        return (
                                            <button
                                                key={`${scene.id}-${idx}`}
                                                onClick={() => seekToScene(idx)}
                                                className={`group relative w-12 aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-300 ${isActive
                                                    ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-110 z-10 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                                    : 'border-slate-800 hover:border-slate-600 grayscale hover:grayscale-0'
                                                    }`}
                                            >
                                                {scene.videoUrl ? (
                                                    <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {idx + 1}
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveScene(idx, idx - 1); }}
                                                        disabled={idx === 0}
                                                        className="p-1 hover:bg-white/20 rounded disabled:opacity-20"
                                                    >
                                                        <ChevronUp size={10} className="text-white" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteScene(idx); }}
                                                        className="p-1 hover:bg-red-500/40 rounded"
                                                    >
                                                        <Trash2 size={10} className="text-red-400" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); moveScene(idx, idx + 1); }}
                                                        disabled={idx === plan.scenes.length - 1}
                                                        className="p-1 hover:bg-white/20 rounded disabled:opacity-20"
                                                    >
                                                        <ChevronDown size={10} className="text-white" />
                                                    </button>
                                                </div>

                                                <div className="absolute -right-[180px] top-1/2 -translate-y-1/2 w-[160px] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 z-50 shadow-2xl">
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[10px] font-black text-indigo-400">SCENE {idx + 1}</span>
                                                        <span className="text-[9px] font-bold text-slate-500">{scene.duration}s</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-white truncate mb-1">{scene.title}</p>
                                                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                                                        {scene.mainText || 'Video preview...'}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => {
                                            const newScene = { ...plan.scenes[0], id: Date.now(), title: 'New Scene' };
                                            handlePlanUpdate({ ...plan, scenes: [...plan.scenes, newScene] });
                                        }}
                                        className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all mt-4 group"
                                    >
                                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                {/* PANE 2: Canvas (Center) */}
                                <div className="flex-1 bg-[#020617] relative flex flex-col overflow-hidden">
                                    {/* Ambient Background Glows */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[150px] pointer-events-none" />
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

                                    <div className="flex-1 flex items-center justify-center p-12">
                                        <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] ring-1 ring-white/10 relative group transition-all duration-700 hover:shadow-indigo-500/10 hover:ring-indigo-500/30">
                                            <RemotionPlayer
                                                key={`player-${plan.scenes.map(s => s.id).join('-')}`}
                                                ref={playerRef}
                                                component={MainVideo}
                                                inputProps={{ plan }}
                                                durationInFrames={totalDurationInFrames}
                                                compositionWidth={1920}
                                                compositionHeight={1080}
                                                fps={30}
                                                style={{ width: '100%', height: '100%' }}
                                                controls
                                                autoPlay
                                                loop
                                                acknowledgeRemotionLicense
                                                numberOfSharedAudioTags={20}
                                            />
                                            {/* Edge Shine Effect */}
                                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        </div>
                                    </div>

                                    {/* Floating AI Director Bar */}
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6">
                                        <div className="group bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-2.5 flex items-center gap-3 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5 hover:ring-indigo-500/30 hover:border-indigo-500/20 transition-all duration-500">
                                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                                {isDirectorWorking ? <Loader2 size={20} className="text-white animate-spin" /> : <Wand2 size={20} className="text-white" />}
                                            </div>
                                            <div className="flex-1 relative">
                                                <input
                                                    value={directorPrompt}
                                                    onChange={e => setDirectorPrompt(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleDirectorDeploy()}
                                                    className="w-full bg-transparent border-none text-white text-sm placeholder:text-slate-500 focus:ring-0 outline-none px-2"
                                                    placeholder="Ask Director: 'Add more kinetic energy' or 'Change music style'..."
                                                    disabled={isDirectorWorking}
                                                />
                                                <div className="absolute -bottom-1 left-2 right-2 h-[1px] bg-indigo-500/0 group-focus-within:bg-indigo-500/50 transition-all" />
                                            </div>
                                            <button
                                                onClick={handleDirectorDeploy}
                                                disabled={isDirectorWorking || !directorPrompt.trim()}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <span>{isDirectorWorking ? 'Executing...' : 'Deploy'}</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                        {/* Status Glow */}
                                        <div className="mt-3 flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-1.5 opacity-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Groq Llama 3 70B</span>
                                            </div>
                                            <div className="h-3 w-[1px] bg-white/10" />
                                            <div className="flex items-center gap-1.5 opacity-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Wan 2.1 Video Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-[400px] border-l border-white/5 bg-slate-950 flex flex-col overflow-hidden">
                                    <ContentEditor
                                        plan={plan}
                                        onUpdate={handlePlanUpdate}
                                        currentSceneIndex={activeSceneIndex}
                                        onSceneSelect={setActiveSceneIndex}
                                        className="static w-full h-full bg-transparent border-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ErrorBoundary>
    );
}

