# src/audio.py

import asyncio
import os
import nest_asyncio
import numpy as np
import scipy.io.wavfile
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration
from moviepy.editor import AudioFileClip, concatenate_audioclips
import edge_tts
from core.utils import get_generated_paths


nest_asyncio.apply()  # Fix for "event loop already running" in Jupyter

# --- VOICE LIBRARY ---
VOICE_LIBRARY = {
    "male_energetic": "en-US-GuyNeural",
    "male_calm": "en-US-ChristopherNeural",
    "male_authoritative": "en-US-DavisNeural",
    "female_energetic": "en-US-JennyNeural",
    "female_calm": "en-US-AriaNeural",
    "female_friendly": "en-US-SaraNeural"
}

# --- MUSIC LIBRARY ---
MUSIC_LIBRARY = {
    "upbeat": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "epic": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "calm": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "energetic": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "corporate": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "motivational": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
}

async def generate_audio_async(text, voice_style="en-US-ChristopherNeural", output_file="voiceover.mp3", status=None):
    """Generates voiceover using edge-tts with dynamic voice selection and returns word timings."""
    message = f"🎙️ Generating voiceover with {voice_style}..."
    if status: status.update(label=message)
    print(message)
    
    communicate = edge_tts.Communicate(text, voice_style)
    word_timings = []
    
    # Stream the audio and capture word boundaries
    with open(output_file, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                # Extract word timing information
                word = chunk.get("text", "")
                offset = chunk.get("offset", 0) / 10000000  # Convert to seconds
                duration = chunk.get("duration", 0) / 10000000
                word_timings.append({
                    "word": word,
                    "start": offset,
                    "end": offset + duration,
                    "sfx_path": None # Placeholder for SFX
                })
    
    print(f"✅ Voiceover saved to {output_file}")
    if word_timings:
        print(f"✅ Word timings extracted ({len(word_timings)} words)")
    
    return output_file, word_timings

def generate_audio(text, voice_style="en-US-ChristopherNeural", output_file="voiceover.mp3", status=None):
    """
    Synchronous wrapper for audio generation.
    """
    return asyncio.run(generate_audio_async(text, voice_style, output_file, status))

def fetch_sfx(query, output_dir, status=None):
    """
    Fetches a sound effect from Freesound.org.
    """
    api_key = os.environ.get("FREESOUND_API_KEY")
    if not api_key:
        message = f"⚠️ FREESOUND_API_KEY not set. Skipping SFX for '{query}'."
        if status: status.update(label=message)
        print(message)
        return None

    message = f"🔊 Searching for SFX: '{query}'"
    if status: status.update(label=message)
    print(message)
    url = "https://freesound.org/apiv2/search/text/"
    params = {
        "query": query,
        "token": api_key,
        "filter": "duration:[0 TO 3]", # 0 to 3 seconds
        "sort": "rating_desc",
        "fields": "id,name,previews"
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get("results")

        if not results:
            print(f"   - No results found for '{query}'")
            return None

        sfx_id = results[0]['id']
        sfx_name = results[0]['name']
        sfx_url = results[0]['previews']['preview-hq-mp3']
        
        output_filename = f"sfx_{sfx_id}_{query.replace(' ', '_')}.mp3"
        output_path = os.path.join(output_dir, output_filename)

        if os.path.exists(output_path):
            print(f"   - Using cached SFX: {output_filename}")
            return output_path

        message = f"   - Downloading '{sfx_name}'..."
        if status: status.update(label=message)
        print(message)
        sfx_response = requests.get(sfx_url, stream=True)
        sfx_response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in sfx_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"   - ✅ Saved SFX to {output_path}")
        return output_path

    except Exception as e:
        message = f"❌ SFX fetch failed for '{query}': {e}"
        if status: status.update(label=message, state="error")
        print(message)
        return None


def download_stock_music(prompt="upbeat", duration=10, output_dir=".", output_filename="background_music.mp3"):
    """
    Downloads a high-quality royalty-free stock track from the music library.
    """
    # Detect mood from prompt
    mood = "upbeat"  # Default
    prompt_lower = prompt.lower()
    
    if "epic" in prompt_lower or "dramatic" in prompt_lower:
        mood = "epic"
    elif "calm" in prompt_lower or "relaxing" in prompt_lower or "soft" in prompt_lower:
        mood = "calm"
    elif "energetic" in prompt_lower or "high energy" in prompt_lower or "intense" in prompt_lower:
        mood = "energetic"
    elif "corporate" in prompt_lower or "professional" in prompt_lower:
        mood = "corporate"
    elif "motivational" in prompt_lower or "inspiring" in prompt_lower:
        mood = "motivational"
    
    stock_url = MUSIC_LIBRARY.get(mood, MUSIC_LIBRARY["upbeat"])
    print(f"🎵 Downloading '{mood}' stock music for '{prompt}'...")
    
    output_path = os.path.join(output_dir, output_filename)
    
    try:
        import requests
        response = requests.get(stock_url, stream=True)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"✅ Stock music saved to {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Stock music download failed: {e}")
        return None


def generate_background_music(prompt="upbeat electronic", duration=10, output_dir=".", 
                             output_filename="background_music.wav", 
                             backend="auto", quality="fast", model="facebook/musicgen-small"):
    """
    Generates background music using MusicGen (GPU/CPU) or synthetic fallback.
    
    Args:
        backend: "auto", "musicgen", or "synthetic"
        quality: "fast", "balanced", "high" (only for musicgen)
        model: MusicGen model to use
    """
    output_path = os.path.join(output_dir, output_filename)
    
    # Auto-detect backend
    if backend == "auto":
        backend = "musicgen" if torch.cuda.is_available() else "stock"
        if backend == "stock":
            print("⚡ No GPU detected. Using High-Quality Stock Music fallback.")
    
    # Stock Fallback
    if backend == "stock":
        return download_stock_music(prompt, duration, output_dir, output_filename)
    
    # MusicGen (GPU or CPU)
    print(f"🎵 Generating music with MusicGen ({model}, quality={quality})...")
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        processor = AutoProcessor.from_pretrained(model)
        model_obj = MusicgenForConditionalGeneration.from_pretrained(model).to(device)
        
        # Quality settings
        if quality == "fast":
            max_new_tokens = 256
        elif quality == "balanced":
            max_new_tokens = 512
        else:  # high
            max_new_tokens = 1024
        
        inputs = processor(text=[prompt], padding=True, return_tensors="pt").to(device)
        
        print(f"   Generating on {device.upper()} (tokens={max_new_tokens})...")
        audio_values = model_obj.generate(**inputs, max_new_tokens=max_new_tokens)
        
        audio_np = audio_values[0, 0].cpu().numpy()
        sample_rate = model_obj.config.audio_encoder.sampling_rate
        
        # Extend or trim to match duration
        expected_samples = int(sample_rate * duration)
        if len(audio_np) < expected_samples:
            audio_np = np.tile(audio_np, int(np.ceil(expected_samples / len(audio_np))))[:expected_samples]
        else:
            audio_np = audio_np[:expected_samples]
        
        audio_stereo = np.column_stack([audio_np, audio_np])
        scipy.io.wavfile.write(output_path, sample_rate, (audio_stereo * 32767).astype(np.int16))
        
        print(f"✅ MusicGen music saved to {output_path}")
        return output_path
        
    except Exception as e:
        print(f"❌ MusicGen failed: {e}. Falling back to Stock Music...")
        return download_stock_music(prompt, duration, output_dir, output_filename)


def generate_storyboard_audio(storyboard_plan, use_music=True, status=None, **kwargs):
    """
    Generates audio for a full storyboard using cloud APIs.
    """
    paths = get_generated_paths()
    scene_audio_clips = []
    full_word_timings = []
    total_duration = 0
    current_offset = 0

    sfx_cache = {} 
    num_scenes = len(storyboard_plan['scenes'])
    for i, scene in enumerate(storyboard_plan['scenes']):
        if status: status.update(label=f"Generating voiceover for scene {i+1}/{num_scenes}...")
        scene_audio_path = os.path.join(paths["audio"], f"voiceover_scene_{i+1}.mp3")
        
        audio_path, word_timings = generate_audio(
            text=scene['script'],
            voice_style=storyboard_plan['voice_style'],
            output_file=scene_audio_path,
            status=status
        )
        clip = AudioFileClip(audio_path)
        
        kt_data = scene.get('kinetic_typography', [])
        for idx, timing_info in enumerate(word_timings):
            if idx < len(kt_data):
                sfx_prompt = kt_data[idx].get('sfx')
                if sfx_prompt:
                    if sfx_prompt in sfx_cache:
                        timing_info['sfx_path'] = sfx_cache[sfx_prompt]
                    else:
                        if status: status.update(label=f"Fetching SFX: '{sfx_prompt}'...")
                        sfx_path = fetch_sfx(sfx_prompt, paths["audio"], status)
                        timing_info['sfx_path'] = sfx_path
                        sfx_cache[sfx_prompt] = sfx_path

        for wt in word_timings:
            wt['start'] += current_offset
            wt['end'] += current_offset
        full_word_timings.extend(word_timings)

        scene_audio_clips.append(clip)
        total_duration += clip.duration
        current_offset = total_duration

    if not scene_audio_clips:
        return {"voiceover_path": None, "music_path": None, "word_timings": []}
    
    if status: status.update(label="Concatenating voiceovers...")
    full_voiceover_clip = concatenate_audioclips(scene_audio_clips)
    full_voiceover_path = os.path.join(paths["audio"], "full_voiceover.mp3")
    full_voiceover_clip.write_audiofile(full_voiceover_path, logger=None)
    if status: status.update(label="Voiceover track finalized.")

    music_path = None
    if use_music:
        music_path = generate_background_music(
            prompt=storyboard_plan['music_prompt'],
            duration=full_voiceover_clip.duration,
            output_dir=paths["audio"],
            **kwargs
        )

    for clip in scene_audio_clips:
        clip.close()
    
    return {
        "voiceover_path": full_voiceover_path,
        "music_path": music_path,
        "word_timings": full_word_timings
    }

