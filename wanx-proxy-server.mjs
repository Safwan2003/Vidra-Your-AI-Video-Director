// Simple Express proxy server for Wanx API
// This runs on Node.js (server-side) to bypass CORS restrictions

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';

const app = express();
app.use(cors()); // Allow all origins for development
app.use(express.json({ limit: '50mb' })); // Increase limit for large plans

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || process.env.VITE_DASHSCOPE_API_KEY || '';

if (!DASHSCOPE_API_KEY) {
    console.error('❌ ERROR: DASHSCOPE_API_KEY environment variable not set!');
    console.log('💡 Set it in your .env file or as an environment variable');
    process.exit(1);
} else {
    const maskedKey = DASHSCOPE_API_KEY.substring(0, 6) + '...' + DASHSCOPE_API_KEY.substring(DASHSCOPE_API_KEY.length - 4);
    console.log(`🔑 API Key loaded: ${maskedKey} (Length: ${DASHSCOPE_API_KEY.length})`);

    // Check for common issues
    if (DASHSCOPE_API_KEY.includes(' ')) {
        console.warn('⚠️ WARNING: API Key contains spaces! Check your .env file.');
    }
}

// Endpoint to generate Wan video
app.post('/api/wanx/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('🎬 Generating Wan video for prompt:', prompt.substring(0, 100) + '...');

        // Submit video generation task
        // Uses Standard API path on International Domain (since user has International key)
        const response = await fetch(
            'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-Async': 'enable'
                },
                body: JSON.stringify({
                    model: 'wan2.1-t2v-turbo',
                    input: {
                        prompt: prompt
                    },
                    parameters: {
                        size: "1280*720",
                        n: 1
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Wan API Error:', response.status, errorText);

            // Helpful hint regarding endpoints
            if (response.status === 401) {
                console.log('💡 Hint: 401 often means Key/Region mismatch.');
                console.log('   Current Endpoint: dashscope-intl (International)');
                console.log('   Ensure your key is for Singapore region.');
            }

            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        const taskId = data.output.task_id;
        console.log('✅ Task ID:', taskId);

        res.json({ taskId, status: 'PENDING' });

    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to check task status
app.get('/api/wanx/status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const response = await fetch(
            `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('❌ Status Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to trigger Remotion render
app.post('/api/render', async (req, res) => {
    try {
        const plan = req.body;
        if (!plan) return res.status(400).json({ error: 'No plan provided' });

        console.log('🎥 Received Render Request!');

        // 1. Save plan to latest-plan.json (for debugging mostly, but props are passed via file)
        const planPath = path.join(process.cwd(), 'latest-plan.json');
        await fs.writeFile(planPath, JSON.stringify(plan, null, 2));

        // 2. Generate Unique Filename to avoid collisions/caching
        const timestamp = Date.now();
        const renderId = `video-${timestamp}`;
        const outputFile = `out/${renderId}.mp4`;

        console.log(`🚀 Starting Remotion render: ${outputFile}`);

        // 3. Trigger render using Remotion CLI
        // Pass the plan as props directly or via file. Using file is safer for large JSON.
        // We output to a UNIQUE file.
        const renderCommand = `npx remotion render src/remotion/index.ts MainVideo ${outputFile} --props=./latest-plan.json`;

        const child = exec(renderCommand, { cwd: process.cwd() });

        if (child.stdout) {
            child.stdout.on('data', (data) => process.stdout.write(`[Render] ${data}`));
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => process.stderr.write(`[Render Err] ${data}`));
        }

        res.json({
            success: true,
            renderId: renderId,
            filename: `${renderId}.mp4`,
            message: 'Render started in background.',
        });

    } catch (error) {
        console.error('❌ Render Trigger Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint for TTS (Edge TTS)
import { EdgeTTS } from 'node-edge-tts';
import { v4 as uuidv4 } from 'uuid';

app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = 'en-US-ChristopherNeural' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`🗣️ TTS Generating: "${text.substring(0, 50)}..." (${voice})`);

        const tts = new EdgeTTS({
            voice: voice,
            lang: 'en-US',
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        });

        // Ensure public/voiceover exists
        const voiceDir = path.join(process.cwd(), 'public', 'voiceover');
        await fs.mkdir(voiceDir, { recursive: true });

        const filename = `${uuidv4()}.mp3`;
        const filePath = path.join(voiceDir, filename);

        await tts.ttsPromise(text, filePath);

        console.log(`✅ TTS Saved: ${filename}`);

        // Return relative path for frontend to use
        res.json({
            success: true,
            url: `/voiceover/${filename}`,
            filename: filename
        });

    } catch (error) {
        console.error('❌ TTS Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Endpoint to check render status (checks if SPECIFIC video file exists)
app.get('/api/render/status', async (req, res) => {
    try {
        const { filename } = req.query; // Client must request specific file

        if (!filename) {
            return res.status(400).json({ status: 'error', message: 'No filename specified' });
        }

        const outDir = path.join(process.cwd(), 'out');
        const filePath = path.join(outDir, filename.toString());

        // Check if file exists
        try {
            await fs.access(filePath);

            // File exists!
            res.json({
                status: 'completed',
                filename: filename,
                downloadUrl: `/api/render/download/${filename}`
            });

        } catch {
            // File doesn't exist yet -> Still rendering
            return res.json({
                status: 'pending',
                message: 'Render in progress...'
            });
        }

    } catch (error) {
        console.error('❌ Status Check Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to download rendered video
app.get('/api/render/download/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(process.cwd(), 'out', filename);

        // Security: ensure filename is just a basename (no path traversal)
        if (filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: 'Video file not found' });
        }

        // Get file stats for content-length
        const stats = await fs.stat(filePath);

        // Set headers for download
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', stats.size);

        // Stream the file
        const fileStream = (await import('fs')).createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('❌ Download Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('🚀 Wanx Proxy Server RUNNING!');
    console.log('🚀 ============================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('📝 Endpoints:');
    console.log(`   POST /api/wanx/generate - Generate video`);
    console.log(`   GET  /api/wanx/status/:taskId - Check status`);
    console.log(`   POST /api/render - Export/Render MP4`);
    console.log('');
    console.log('✅ Ready to accept requests from React app!');
    console.log('💡 Keep this terminal open while using Vidra');
    console.log('');
});
