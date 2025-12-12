# Running Wan Proxy Server

## Quick Start

**Open a NEW terminal** and run:

```bash
cd d:\agents\vidra---isometric-video-agent
npm run proxy
```

Keep this terminal open! You should see:

```
🚀 ============================================
🚀 Wanx Proxy Server RUNNING!
🚀 ============================================
📍 URL: http://localhost:3001
📝 Endpoints:
   POST /api/wanx/generate - Generate video
   GET  /api/wanx/status/:taskId - Check status

✅ Ready to accept requests from React app!
💡 Keep this terminal open while using Vidra
```

## Now You Can:

1. **Keep proxy server running** (new terminal)
2. **Keep dev server running** (existing terminal with `npm run dev`)
3. **Click "Regen BG"** in Vidra - it will now generate real Wan videos! 🎉

## What to Expect:

- First request: ~30-60 seconds to generate video
- Console will show progress: PENDING → RUNNING → SUCCEEDED
- Video URL will be returned and displayed in your scene

## Troubleshooting:

**Error: "Cannot connect to proxy server"**
- Make sure proxy is running: `npm run proxy`
- Check it's on port 3001

**Error: "DASHSCOPE_API_KEY not set"**
- Check your `.env` file has `DASHSCOPE_API_KEY=sk-xxx`
- Restart the proxy server after adding the key

**Videos taking too long:**
- Normal! Wan generation takes 30-60 seconds per scene
- You'll see progress in the proxy terminal
- CSS gradients are instant if you want to skip waiting
