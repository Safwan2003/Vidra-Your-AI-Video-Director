# 🎬 VIDRA Backend

FastAPI + Celery backend for AI-powered video generation.

## 🏗️ Architecture

```
FastAPI (REST API) → Redis Queue → Celery Workers → 5 AI Agents
```

### **Components:**

1. **FastAPI** - REST API server
   - `/generate_video` - Submit video generation request
   - `/status/{task_id}` - Check task progress
   - `/` - Health check

2. **Redis** - Message broker for Celery

3. **Celery Workers** - Execute video generation pipeline

4. **5 AI Agents** - Sequential processing:
   - 📝 Storyboard Agent (LLM)
   - 🖼️ Image Agent (Stable Diffusion)
   - 🎬 Animation Agent (SVD)
   - 🎵 Audio Agent (XTTS + MusicGen)
   - ✂️ Editor Agent (FFmpeg)

---

## 🚀 Quick Start

### **Prerequisites:**

```bash
# Python 3.9+
python --version

# Redis (for task queue)
redis-server --version

# FFmpeg (for video editing)
ffmpeg -version

# NVIDIA GPU (optional but recommended)
nvidia-smi
```

### **Installation:**

```bash
# 1. Navigate to project root
cd vidra/

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Configure environment
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env and add your API key:
# GROQ_API_KEY=your-key-here (FREE from https://console.groq.com)

# 5. Create output directories
mkdir outputs\images outputs\videos outputs\audio outputs\final
```

---

## 🎯 Running the Backend

You need **3 separate terminals** running simultaneously:

### **Terminal 1: Redis Server**

```bash
# Start Redis
redis-server

# Test connection:
redis-cli ping  # Should return: PONG
```

### **Terminal 2: Celery Worker**

```bash
# Navigate to project root
cd vidra/

# Start Celery worker
celery -A backend.main.celery_app worker --loglevel=info --pool=solo

# Notes:
# - Use --pool=solo on Windows
# - Remove --pool=solo on Linux for better performance
# - First run will download AI models (~15-20GB)
```

### **Terminal 3: FastAPI Server**

```bash
# Navigate to project root
cd vidra/

# Start FastAPI
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Server will be available at:
# http://localhost:8000
```

---

## 📡 API Endpoints

### **1. Health Check**

```bash
GET http://localhost:8000/

Response:
{
  "message": "Welcome to VIDRA FastAPI backend!"
}
```

### **2. Generate Video**

```bash
POST http://localhost:8000/generate_video
Content-Type: application/json

{
  "prompt": "A peaceful sunrise over mountains with birds flying",
  "style": "cinematic",
  "duration": 30
}

Response:
{
  "message": "Video generation started",
  "task_id": "abc123-def456-..."
}
```

**Styles:** `cinematic`, `anime`, `cartoon`, `realistic`  
**Duration:** 10-120 seconds

### **3. Check Status**

```bash
GET http://localhost:8000/status/{task_id}

Response:
{
  "state": "PROGRESS",
  "status": "Generating images...",
  "result": {
    "storyboard": { ... }
  }
}
```

**States:**
- `PENDING` - Task queued
- `STARTED` - Storyboard generation
- `PROGRESS` - Images/Animation/Audio/Editing
- `SUCCESS` - Video ready
- `FAILURE` - Error occurred

---

## 🤖 Agent Details

### **1. Storyboard Agent** (`storyboard_agent.py`)

Converts text prompt into structured scene breakdown.

**Model:** Llama 3.1 70B (Groq) or GPT-4o-mini (OpenAI)

**Input:**
```python
prompt = "A hero's journey"
style = "cinematic"
duration = 30
```

**Output:**
```json
{
  "scenes": [
    {
      "id": 1,
      "description": "Hero standing on mountain top",
      "key_visual": "Epic wide shot, cinematic lighting, hero silhouette",
      "script": "Our journey begins at the peak of destiny."
    }
  ]
}
```

### **2. Image Agent** (`image_agent.py`)

Generates keyframe images for each scene.

**Model:** Stable Diffusion 3 Medium (default)

**Features:**
- 1024x576 resolution (16:9)
- Style-aware prompting
- GPU-optimized inference
- Local file storage

**Output:** `outputs/images/{uuid}.png`

### **3. Animation Agent** (`animation_agent.py`)

Animates static keyframes into video clips.

**Model:** Stable Video Diffusion XT

**Features:**
- 25 frames @ 7fps (~3.5 seconds)
- Smooth motion generation
- Memory-optimized processing

**Output:** `outputs/videos/{uuid}.mp4`

### **4. Audio Agent** (`audio_agent.py`)

Generates voiceover and background music.

**Models:**
- Voice: XTTS v2 (multilingual TTS)
- Music: MusicGen Medium

**Features:**
- Natural voice synthesis
- Context-aware music generation
- WAV format output

**Output:**
- `outputs/audio/voiceover_{uuid}.wav`
- `outputs/audio/music_{uuid}.wav`

### **5. Editor Agent** (`editor_agent.py`)

Combines all assets into final video.

**Tool:** FFmpeg

**Process:**
1. Concatenate video clips
2. Mix voiceover (100%) + music (30%)
3. Sync audio to video
4. Export final MP4

**Output:** `outputs/final/final_video_{uuid}.mp4`

---

## 🔧 Configuration

Edit `.env` file to customize:

```bash
# LLM API (choose one)
GROQ_API_KEY=your-groq-key        # FREE, recommended
OPENAI_API_KEY=your-openai-key    # Paid, alternative

# Redis
REDIS_URL=redis://localhost:6379/0

# Models (optional, defaults work well)
IMAGE_MODEL=stabilityai/stable-diffusion-3-medium-diffusers
ANIMATION_MODEL=stabilityai/stable-video-diffusion-img2vid-xt

# Performance
IMAGE_INFERENCE_STEPS=28           # Lower = faster, less quality
VIDEO_NUM_FRAMES=25                # Lower = shorter clips
TORCH_DTYPE=float16                # float16 or float32
```

---

## 📊 Performance

### **GPU Requirements:**

| Task | VRAM | Speed (T4 GPU) |
|------|------|----------------|
| Storyboard | - | 5-10s |
| Image (per scene) | 6GB | 40-50s |
| Animation (per scene) | 8GB | 80-100s |
| Audio | - | 20-30s |
| Editing | - | 15-20s |

**Total:** 8-12 minutes for 30-second video (4 scenes)

### **Optimization Tips:**

1. **Reduce resolution:**
   ```python
   IMAGE_WIDTH=768
   IMAGE_HEIGHT=432
   ```

2. **Fewer inference steps:**
   ```python
   IMAGE_INFERENCE_STEPS=20  # Default: 28
   ```

3. **Shorter clips:**
   ```python
   VIDEO_NUM_FRAMES=15  # Default: 25
   ```

4. **Enable model offloading:**
   ```python
   ENABLE_MODEL_OFFLOAD=true
   ```

---

## 🐛 Troubleshooting

### **"CUDA out of memory"**

```bash
# Solution 1: Enable model offloading
ENABLE_MODEL_OFFLOAD=true

# Solution 2: Use smaller models
IMAGE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# Solution 3: Reduce resolution
IMAGE_WIDTH=512
IMAGE_HEIGHT=288
```

### **"Celery worker not processing tasks"**

```bash
# Check Redis connection
redis-cli ping

# Restart Celery worker
# Windows:
celery -A backend.main.celery_app worker --loglevel=info --pool=solo

# Linux:
celery -A backend.main.celery_app worker --loglevel=info
```

### **"Models downloading slowly"**

First run downloads 15-20GB of models:
- Stable Diffusion 3: ~6GB
- Stable Video Diffusion: ~8GB
- XTTS: ~2GB
- MusicGen: ~3GB

Models are cached in `~/.cache/huggingface/`

### **"FFmpeg not found"**

```bash
# Windows: Download from https://ffmpeg.org
# Add to PATH environment variable

# Linux:
sudo apt-get install ffmpeg

# Test:
ffmpeg -version
```

---

## 🧪 Testing

### **Test Storyboard Agent:**

```bash
python backend/storyboard_agent.py
```

### **Test Image Agent:**

```bash
python backend/image_agent.py
```

### **Test Full Pipeline:**

```bash
# Start all services first, then:
curl -X POST http://localhost:8000/generate_video \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test video","style":"cinematic","duration":10}'
```

---

## 📦 Dependencies

See `requirements.txt` for complete list. Key packages:

- **fastapi** - Web framework
- **celery** - Task queue
- **redis** - Message broker
- **torch** - Deep learning framework
- **diffusers** - Stable Diffusion models
- **transformers** - Model loading
- **TTS** - Voice synthesis
- **audiocraft** - Music generation

---

## 📚 Further Reading

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Celery Docs](https://docs.celeryq.dev/)
- [Diffusers Docs](https://huggingface.co/docs/diffusers/)
- [FFmpeg Guide](https://ffmpeg.org/documentation.html)

---

**Need help? See `PROJECT_STRUCTURE.md` for complete setup guide.**
