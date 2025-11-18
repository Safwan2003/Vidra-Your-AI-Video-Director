# 🎯 VIDRA - Quick Start Guide

## Get Started in 3 Steps:

### 📱 **Step 1: Choose Your Setup**

#### **Option A: Google Colab (Easiest - Recommended)**
Perfect for: Testing, demos, no local GPU needed
- ✅ Free GPU (T4)
- ✅ No installation needed
- ✅ Ready in 15 minutes

**→ [Open `VIDRA_Colab_Notebook.ipynb`](./VIDRA_Colab_Notebook.ipynb)**

---

#### **Option B: Local Machine (Advanced)**
Perfect for: Production, custom setup, you have GPU
- ⚙️ Requires: Python 3.9+, NVIDIA GPU (8GB+), Redis, FFmpeg
- 📖 Guide: See `PROJECT_STRUCTURE.md` → "Option 2: Local Setup"

---

### 🔑 **Step 2: Get FREE API Key**

You need ONE API key for storyboard generation:

**Recommended: Groq (FREE)**
1. Go to: https://console.groq.com
2. Sign up (free)
3. Create new API key
4. Copy the key

*Alternative: OpenAI ($0.15/1M tokens)*

---

### 🚀 **Step 3: Generate Your First Video**

#### **Using Colab:**
1. Upload `VIDRA_Colab_Notebook.ipynb` to Google Colab
2. Enable GPU: Runtime → Change runtime type → T4 GPU
3. Run Cell 5 and paste your API key
4. Run all cells
5. Click the ngrok URL
6. Enter prompt: "A peaceful sunrise over mountains"
7. Wait 8-12 minutes
8. Download your video!

#### **Using Local:**
1. Start Redis, FastAPI, Celery, Streamlit (see PROJECT_STRUCTURE.md)
2. Open http://localhost:8501
3. Enter prompt and generate

---

## 📊 What to Expect

**Video Generation Time:**
- 30-second video: 8-12 minutes (Colab free GPU)
- 60-second video: 15-20 minutes

**Process:**
1. 📝 Storyboard (10s) - AI creates scene plan
2. 🖼️ Images (2-3min) - Generates keyframes
3. 🎬 Animation (6-8min) - Animates scenes
4. 🎵 Audio (30s) - Voice + music
5. ✂️ Edit (20s) - Final video

---

## 💡 Example Prompts

Try these to get started:

**Cinematic:**
- "A hero's journey through a mystical forest at sunset"
- "Futuristic city with flying cars and neon lights"
- "Peaceful beach with waves and seagulls at golden hour"

**Anime:**
- "Magical girl transformation sequence with sparkles"
- "Dragon flying over ancient Japanese temple"
- "Cute robot exploring a colorful candy world"

**Business:**
- "Modern office with diverse team collaborating"
- "Product showcase with smooth camera movements"
- "Tech startup workspace with innovation vibes"

---

## 🆘 Need Help?

**Quick Fixes:**

| Problem | Solution |
|---------|----------|
| No GPU detected | Enable GPU in Colab runtime settings |
| Backend offline | Check if FastAPI is running on port 8000 |
| Out of memory | Use 30s videos instead of 60s |
| Slow generation | First video is slower (models loading) |

**Full Documentation:**
- 📖 `PROJECT_STRUCTURE.md` - Complete setup guide
- 🚀 `COLAB_SETUP_GUIDE.md` - Colab detailed instructions
- 📋 `plan.txt` - Original project plan

---

## 💰 Cost

**Total: $0** (using free tier)
- Groq API: FREE
- Google Colab GPU: FREE (12h sessions)
- All AI models: FREE (open-source)

---

**Ready? Open the Colab notebook and create your first video! 🎬**
