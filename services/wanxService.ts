
import { VideoScene } from '../types';

const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || '';
// Using local proxy server to bypass CORS
const PROXY_URL = 'http://localhost:3001/api/wanx';

interface WanxTaskResponse {
    taskId: string;
    status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
}

interface WanxStatusResponse {
    output: {
        task_id: string;
        task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
        video_url?: string;
        code?: string;
        message?: string;
    };
}

export const generateSceneVideo = async (sceneDescription: string, style: string = 'Cinematic'): Promise<string | null> => {
    // Enhanced Prompt Engineering for "What a Story" style
    const prompt = `Professional 3D motion graphics background, seamless loop, ${sceneDescription}, ${style}, isometric view, soft diffused lighting, octane render, 4k resolution, minimal abstract geometry, no text, no watermark, fluid motion, high end corporate video style, clean background for UI overlay`;

    console.log("✨ Wanx Service: Submitting task via proxy server...");
    console.log("📝 Prompt:", prompt);

    let taskId: string;

    try {
        // 1. Submit task via proxy
        const response = await fetch(`${PROXY_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("❌ Proxy Error:", error);
            console.log("💡 Make sure proxy server is running: npm run proxy");
            return null;
        }

        const data: WanxTaskResponse = await response.json();
        taskId = data.taskId;
        console.log("✅ Wanx Task ID:", taskId);

    } catch (error: any) {
        if (error.message === 'Failed to fetch') {
            console.error('❌ Cannot connect to proxy server');
            console.log('💡 Start the proxy server in a new terminal:');
            console.log('   1. cd d:\\agents\\vidra---isometric-video-agent');
            console.log('   2. npm install express cors openai');
            console.log('   3. npm run proxy');
            return null;
        }

        console.error('❌ Wanx Service Error:', error);
        return null;
    }

    // 2. Poll for status via proxy
    const MAX_RETRIES = 60; // 5 seconds * 60 = 5 minutes max
    const POLLING_INTERVAL = 5000; // 5 seconds

    for (let i = 0; i < MAX_RETRIES; i++) {
        await new Promise(r => setTimeout(r, POLLING_INTERVAL));

        try {
            const response = await fetch(`${PROXY_URL}/status/${taskId}`);

            if (!response.ok) {
                console.error("⚠️ Polling Failed:", response.status);
                continue;
            }

            const data: WanxStatusResponse = await response.json();
            const status = data.output.task_status;

            console.log(`⏳ Wanx Status (${i + 1}/${MAX_RETRIES}):`, status);

            if (status === 'SUCCEEDED') {
                if (data.output.video_url) {
                    console.log("🎉 Wanx Success! Video URL:", data.output.video_url);
                    return data.output.video_url;
                }
            } else if (status === 'FAILED' || status === 'UNKNOWN') {
                console.error("❌ Wanx Task Failed:", data.output.message || "Unknown error");
                return null;
            }
            // If RUNNING or PENDING, continue loop
        } catch (error) {
            console.error("⚠️ Polling Error:", error);
        }
    }

    console.error("⏱️ Wanx Timeout - task took longer than 5 minutes");
    return null;
};

// --- VOICE OVER SERVICE ---
export const generateVoiceover = async (text: string, voice: string = 'en-US-ChristopherNeural'): Promise<string | null> => {
    try {
        console.log(`🗣️ Requesting Voiceover: "${text.substring(0, 30)}..."`);
        const response = await fetch('http://localhost:3001/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice })
        });

        if (!response.ok) {
            console.error('❌ TTS Error:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.url; // Returns relative path: /voiceover/uuid.mp3
    } catch (error) {
        console.error('❌ Voiceover Generation Failed:', error);
        return null;
    }
};
