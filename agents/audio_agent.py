# src/audio.py

import asyncio
import os
import nest_asyncio
import replicate
import requests
from moviepy.editor import AudioFileClip, concatenate_audioclips
import edge_tts
from core.utils import get_generated_paths


nest_asyncio.apply()  # Fix for "event loop already running" in Jupyter

async def generate_audio_async(text, voice_style="en-US-ChristopherNeural", output_file="voiceover.mp3"):
    """Generates voiceover using edge-tts with dynamic voice selection and returns word timings."""
    print(f"🎙️ Generating Voiceover with {voice_style}...")
    
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

def generate_audio(text, voice_style="en-US-ChristopherNeural", output_file="voiceover.mp3"):
    """
    Synchronous wrapper for audio generation.
    Now supports dynamic voice selection from Director Agent and returns word timings.
    """
    return asyncio.run(generate_audio_async(text, voice_style, output_file))

def fetch_sfx(query, output_dir):
    """
    Fetches a sound effect from Freesound.org.
    """
    api_key = os.environ.get("FREESOUND_API_KEY")
    if not api_key:
        print(f"⚠️ FREESOUND_API_KEY not set. Skipping SFX for '{query}'.")
        return None

    print(f"🔊 Searching for SFX: '{query}'")
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

        print(f"   - Downloading '{sfx_name}'...")
        sfx_response = requests.get(sfx_url, stream=True)
        sfx_response.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in sfx_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"   - ✅ Saved SFX to {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ SFX fetch failed for '{query}': {e}")
        return None


def generate_music_with_replicate(prompt, duration, output_dir=".", output_filename="background_music.wav"):
    """
    Generates background music using a model on Replicate.
    """
    output_path = os.path.join(output_dir, output_filename)
    try:
        if not os.environ.get("REPLICATE_API_TOKEN"):
            print("⚠️ REPLICATE_API_TOKEN not set. Skipping music generation.")
            return None

        print(f"🎵 Generating background music via Replicate API: '{prompt}'...")
        
        output = replicate.run(
            "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
            input={"prompt_a": prompt}
        )
        
        music_url = output['audio']
        print(f"   ⏳ Downloading generated music from: {music_url}")

        response = requests.get(music_url, stream=True)
        response.raise_for_status()
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✅ Music saved to {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ Replicate music generation failed: {e}")
        return None

def generate_storyboard_audio(storyboard_plan, use_music=True, **kwargs):
    """
    Generates audio for a full storyboard using cloud APIs.
    """
    paths = get_generated_paths()
    scene_audio_clips = []
    full_word_timings = []
    total_duration = 0
    current_offset = 0

    # Generate voiceover and SFX for each scene
    sfx_cache = {} # Cache to avoid re-downloading the same SFX
    for i, scene in enumerate(storyboard_plan['scenes']):
        scene_audio_path = os.path.join(paths["audio"], f"voiceover_scene_{i+1}.mp3")
        
        audio_path, word_timings = generate_audio(
            text=scene['script'],
            voice_style=storyboard_plan['voice_style'],
            output_file=scene_audio_path
        )
        clip = AudioFileClip(audio_path)
        
        # Correlate kinetic typography data with word timings to fetch SFX
        kt_data = scene.get('kinetic_typography', [])
        for idx, timing_info in enumerate(word_timings):
            if idx < len(kt_data):
                sfx_prompt = kt_data[idx].get('sfx')
                if sfx_prompt:
                    if sfx_prompt in sfx_cache:
                        timing_info['sfx_path'] = sfx_cache[sfx_prompt]
                    else:
                        sfx_path = fetch_sfx(sfx_prompt, paths["audio"])
                        timing_info['sfx_path'] = sfx_path
                        sfx_cache[sfx_prompt] = sfx_path

        # Adjust word timings for the overall video timeline
        for wt in word_timings:
            wt['start'] += current_offset
            wt['end'] += current_offset
        full_word_timings.extend(word_timings)

        scene_audio_clips.append(clip)
        total_duration += clip.duration
        current_offset = total_duration

    # Concatenate voiceovers
    if not scene_audio_clips:
        return {"voiceover_path": None, "music_path": None, "word_timings": []}
    
    full_voiceover_clip = concatenate_audioclips(scene_audio_clips)
    full_voiceover_path = os.path.join(paths["audio"], "full_voiceover.mp3")
    full_voiceover_clip.write_audiofile(full_voiceover_path)

    # Generate background music
    music_path = None
    if use_music:
        music_path = generate_music_with_replicate(
            prompt=storyboard_plan['music_prompt'],
            duration=full_voiceover_clip.duration,
            output_dir=paths["audio"]
        )

    # Clean up individual scene clips
    for clip in scene_audio_clips:
        clip.close()
    
    return {
        "voiceover_path": full_voiceover_path,
        "music_path": music_path,
        "word_timings": full_word_timings
    }

