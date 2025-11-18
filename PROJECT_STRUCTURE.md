# 🎬 VIDRA - Complete Project Structure & Setup Guide

## 📁 Project Structure

```
vidra/
├── backend/                          # FastAPI + Celery Backend
│   ├── __init__.py
│   ├── main.py                       # FastAPI app + Celery tasks
│   ├── storyboard_agent.py          # LLM-based scene generation
│   ├── image_agent.py               # Stable Diffusion image generation
│   ├── animation_agent.py           # Stable Video Diffusion animation
│   ├── audio_agent.py               # XTTS voice + MusicGen music
│   ├── editor_agent.py              # FFmpeg video editing
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Backend documentation
│
├── frontend/                         # Streamlit UI
│   ├── streamlit_app.py             # Main UI application
│   └── requirements.txt             # Frontend dependencies
│
├── outputs/                          # Generated files (local storage)
│   ├── images/                      # Generated keyframe images
│   ├── videos/                      # Animated scene clips
│   ├── audio/                       # Voiceovers and music
│   └── final/                       # Final rendered videos
│
├── .env.example                      # Environment variables template
├── VIDRA_Colab_Notebook.ipynb       # Google Colab notebook
├── COLAB_SETUP_GUIDE.md             # Colab setup instructions
├── PROJECT_STRUCTURE.md             # This file
└── plan.txt                          # Original project plan
```

---

## 🚀 Complete Setup Instructions

### **Option 1: Google Colab (Recommended for MVP)**

#### ✅ **Best for:**
- Quick testing and demos
- No local GPU required
- Free GPU access (T4)
- Zero setup on your machine

#### 📋 **Steps:**

1. **Open the Colab Notebook:**
   - Upload `VIDRA_Colab_Notebook.ipynb` to Google Drive
   - Open with Google Colab
   - Enable GPU: Runtime → Change runtime type → T4 GPU

2. **Get API Key (FREE):**
   - Go to [Groq Console](https://console.groq.com)
   - Sign up (free)
   - Create API key
   - Copy the key

3. **Upload Project:**
   - Zip your vidra folder → `vidra.zip`
   - Upload to Colab (use folder icon 📁)

4. **Run All Cells:**
   - Cell 1-4: Setup and installation
   - Cell 5: Paste your Groq API key
   - Cell 6-9: Start services
   - Cell 9 gives you public URL

5. **Access VIDRA:**
   - Click the ngrok URL from Cell 9
   - Enter your prompt and generate!

**⏱️ Expected Time:** 15 minutes setup, 8-12 minutes per video

---

### **Option 2: Local Setup (With GPU)**

#### ✅ **Best for:**
- You have a GPU (NVIDIA with 8GB+ VRAM)
- Production deployment
- Persistent storage

#### 📋 **Steps:**

1. **Prerequisites:**
   ```bash
   # Python 3.9+
   python --version
   
   # CUDA Toolkit (for GPU)
   nvidia-smi
   
   # Redis
   # Windows: Download from https://redis.io/download
   # Linux: sudo apt-get install redis-server
   
   # FFmpeg
   # Windows: Download from https://ffmpeg.org
   # Linux: sudo apt-get install ffmpeg
   ```

2. **Clone/Download Project:**
   ```bash
   cd C:\Users\DELL\OneDrive\Desktop\vidra
   ```

3. **Create Virtual Environment:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   ```

4. **Install Dependencies:**
   ```bash
   # Backend
   pip install -r backend/requirements.txt
   
   # Frontend
   pip install -r frontend/requirements.txt
   ```

5. **Configure Environment:**
   ```bash
   # Copy example env file
   copy .env.example .env  # Windows
   # cp .env.example .env  # Linux/Mac
   
   # Edit .env and add your API key
   notepad .env  # Add GROQ_API_KEY or OPENAI_API_KEY
   ```

6. **Create Output Directories:**
   ```bash
   mkdir outputs\images outputs\videos outputs\audio outputs\final
   ```

7. **Start Redis:**
   ```bash
   # Windows: Start redis-server.exe
   redis-server
   
   # Linux: 
   # sudo service redis-server start
   ```

8. **Start Backend (3 terminals):**

   **Terminal 1 - FastAPI:**
   ```bash
   cd C:\Users\DELL\OneDrive\Desktop\vidra
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   **Terminal 2 - Celery Worker:**
   ```bash
   cd C:\Users\DELL\OneDrive\Desktop\vidra
   celery -A backend.main.celery_app worker --loglevel=info --pool=solo
   ```

   **Terminal 3 - Streamlit:**
   ```bash
   cd C:\Users\DELL\OneDrive\Desktop\vidra
   streamlit run frontend/streamlit_app.py
   ```

9. **Access VIDRA:**
   - Open browser: http://localhost:8501
   - Enter prompt and generate!

**⚠️ Note:** On Windows, use `--pool=solo` for Celery. On Linux, you can omit it.

---

## 🔧 Architecture Overview

### **System Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  Streamlit UI → User enters prompt, style, duration         │
└──────────────────────┬──────────────────────────────────────┘
                       │ POST /generate_video
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│  - Validates input                                          │
│  - Creates Celery task                                      │
│  - Returns task_id                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ Push to Redis Queue
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   CELERY WORKER                             │
│  Executes 5 agents sequentially:                           │
│                                                             │
│  1. 📝 Storyboard Agent (CPU)                              │
│     - LLM generates scene breakdown                        │
│     - Creates scripts and descriptions                     │
│                                                             │
│  2. 🖼️ Image Agent (GPU)                                   │
│     - Stable Diffusion 3 / FLUX                            │
│     - Generates keyframe for each scene                    │
│                                                             │
│  3. 🎬 Animation Agent (GPU)                               │
│     - Stable Video Diffusion                               │
│     - Animates each keyframe (3-6 sec)                     │
│                                                             │
│  4. 🎵 Audio Agent (CPU)                                   │
│     - XTTS: Text-to-speech voiceover                       │
│     - MusicGen: Background music                           │
│                                                             │
│  5. ✂️ Editor Agent (CPU)                                  │
│     - FFmpeg: Concatenate videos                           │
│     - Mix audio tracks                                     │
│     - Export final MP4                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ Save to ./outputs/final/
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOCAL FILE STORAGE                        │
│  outputs/                                                   │
│  ├── images/      (PNG files)                              │
│  ├── videos/      (MP4 clips)                              │
│  ├── audio/       (WAV files)                              │
│  └── final/       (Final MP4)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ Return file path
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    STREAMLIT UI                             │
│  - Polls /status/{task_id}                                 │
│  - Displays progress                                        │
│  - Shows final video                                        │
│  - Download button                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Details

### **1. Storyboard Agent** (`storyboard_agent.py`)
- **Model:** GPT-4o-mini (OpenAI) or Llama 3.1 70B (Groq - FREE)
- **Input:** User prompt, style, duration
- **Output:** JSON with scenes (description, key_visual, script)
- **Runtime:** 5-10 seconds
- **Resource:** CPU only

### **2. Image Agent** (`image_agent.py`)
- **Model:** Stable Diffusion 3 Medium (default)
  - Alternative: FLUX.1-dev (better quality)
  - Alternative: SDXL (faster)
- **Input:** Scene description + style
- **Output:** 1024x576 PNG image
- **Runtime:** 30-45 seconds per image (GPU)
- **Resource:** GPU (6-8GB VRAM)

### **3. Animation Agent** (`animation_agent.py`)
- **Model:** Stable Video Diffusion XT
- **Input:** Keyframe image
- **Output:** 3.5 second MP4 clip (25 frames @ 7fps)
- **Runtime:** 60-90 seconds per clip (GPU)
- **Resource:** GPU (8-10GB VRAM)

### **4. Audio Agent** (`audio_agent.py`)
- **TTS Model:** XTTS v2 (multilingual)
- **Music Model:** MusicGen Medium
- **Input:** Script text + music prompt
- **Output:** voiceover.wav + music.wav
- **Runtime:** 20-30 seconds total
- **Resource:** CPU (GPU optional, faster)

### **5. Editor Agent** (`editor_agent.py`)
- **Tool:** FFmpeg
- **Input:** All video clips + audio files
- **Process:**
  1. Concatenate video clips
  2. Mix voiceover (100%) + music (30%)
  3. Sync audio to video
  4. Export final MP4
- **Runtime:** 15-20 seconds
- **Resource:** CPU

---

## 📊 Performance Benchmarks

### **Google Colab (Free T4 GPU):**

| Task | Time | Notes |
|------|------|-------|
| Storyboard | 5-10s | Depends on LLM API |
| Images (4 scenes) | 2-3 min | ~40s per image |
| Animation (4 scenes) | 6-8 min | ~90s per clip |
| Audio | 30s | Voiceover + music |
| Editing | 20s | FFmpeg rendering |
| **Total (30s video)** | **9-12 min** | First run slower (model loading) |

### **Local RTX 3090 (24GB VRAM):**

| Task | Time |
|------|------|
| Storyboard | 3-5s |
| Images (4 scenes) | 1-2 min |
| Animation (4 scenes) | 4-5 min |
| Audio | 20s |
| Editing | 15s |
| **Total (30s video)** | **6-8 min** |

---

## 💾 Storage Requirements

### **Per 30-second Video:**
- Images: 4 x 2MB = 8MB
- Video clips: 4 x 15MB = 60MB
- Audio: 2MB (voice) + 1MB (music) = 3MB
- Final video: ~25MB
- **Total: ~96MB per video**

### **Google Colab Free Tier:**
- Storage: 15GB (Google Drive)
- Runtime: 12 hours max
- GPU: Limited usage (depends on availability)

---

## 🔑 API Keys & Costs

### **LLM for Storyboard (Required):**

| Provider | Model | Cost | Speed | Quality |
|----------|-------|------|-------|---------|
| **Groq** ✅ | Llama 3.1 70B | FREE | Very Fast | Excellent |
| OpenAI | GPT-4o-mini | $0.15/1M tokens | Fast | Excellent |
| OpenAI | GPT-4 | $5/1M tokens | Slower | Best |

**Recommendation:** Use Groq (free + fast)

### **AI Models (All Free/Open-Source):**
- ✅ Stable Diffusion 3: Free
- ✅ Stable Video Diffusion: Free
- ✅ XTTS v2: Free
- ✅ MusicGen: Free
- ✅ FFmpeg: Free

**Total MVP Cost: $0** (using Groq + open-source models)

---

## 🐛 Troubleshooting

### **Common Issues:**

#### 1. **"CUDA out of memory"**
**Solution:**
- Use smaller models (SD XL instead of FLUX)
- Reduce resolution (512x288 instead of 1024x576)
- Lower num_frames (15 instead of 25)
- Enable model offloading in `.env`

#### 2. **"Celery worker not picking up tasks"**
**Solution:**
- Check Redis is running: `redis-cli ping` (should return PONG)
- Restart Celery worker
- On Windows, use `--pool=solo` flag

#### 3. **"Models taking forever to download"**
**Solution:**
- First run downloads 15-20GB of models
- Use stable internet connection
- Models are cached for subsequent runs

#### 4. **"FFmpeg not found"**
**Solution:**
- Install FFmpeg system-wide
- Add to PATH environment variable
- Test: `ffmpeg -version`

#### 5. **"Streamlit shows 'Backend Offline'"**
**Solution:**
- Ensure FastAPI is running on port 8000
- Check: http://localhost:8000 in browser
- Look for errors in FastAPI terminal

---

## 🚀 Deployment Options

### **For Production:**

1. **GPU Server:**
   - RunPod: $0.20/hr for RTX 3090
   - Vast.ai: $0.15/hr spot instances
   - Lambda Labs: $0.50/hr A100

2. **Cloud Storage:**
   - Cloudflare R2: $0.015/GB (cheaper than S3)
   - AWS S3: $0.023/GB
   - Google Cloud Storage: $0.020/GB

3. **Backend Hosting:**
   - Railway: $5/month + usage
   - Render: Free tier available
   - DigitalOcean: $12/month droplet

4. **Frontend:**
   - Streamlit Cloud: Free (public repos)
   - Vercel: Free tier
   - Netlify: Free tier

---

## 📈 Next Steps (Post-MVP)

### **Phase 1: Optimization**
- [ ] Model caching and preloading
- [ ] Parallel scene generation
- [ ] Video quality improvements
- [ ] Progress streaming (WebSockets)

### **Phase 2: Features**
- [ ] Scene regeneration
- [ ] Custom voice cloning
- [ ] Music style selection
- [ ] Template library
- [ ] Video editing (trim, adjust)

### **Phase 3: Production**
- [ ] User authentication
- [ ] Database (PostgreSQL)
- [ ] Cloud storage integration
- [ ] Payment system
- [ ] Usage analytics

### **Phase 4: Scale**
- [ ] Multi-GPU support
- [ ] Kubernetes deployment
- [ ] CDN for video delivery
- [ ] Background job queue optimization

---

## 📞 Support

### **Resources:**
- Project Plan: `plan.txt`
- Colab Guide: `COLAB_SETUP_GUIDE.md`
- Backend Docs: `backend/README.md`

### **Model Documentation:**
- [Stable Diffusion 3](https://huggingface.co/stabilityai/stable-diffusion-3-medium-diffusers)
- [Stable Video Diffusion](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt)
- [XTTS v2](https://github.com/coqui-ai/TTS)
- [MusicGen](https://github.com/facebookresearch/audiocraft)

---

**Made with ❤️ by the VIDRA team | November 2025**
