# src/editor.py

import os
import time
import requests

# MOVIEPY v2.0 FIX (Robust Import)
try:
    from moviepy import VideoFileClip, AudioFileClip, CompositeVideoClip, ImageClip, TextClip
    from moviepy.audio.AudioClip import CompositeAudioClip, AudioClip
    from moviepy.video.compositing.concatenate import concatenate_videoclips, concatenate_audioclips
    from moviepy.video.fx import all as vfx
    print("✅ Loaded MoviePy v2.0+")
except ImportError:
    from moviepy.editor import (
        VideoFileClip, AudioFileClip, CompositeVideoClip, ImageClip, 
        CompositeAudioClip, concatenate_videoclips, concatenate_audioclips, vfx, TextClip, AudioClip
    )
    print("✅ Loaded MoviePy v1.x")

from core.utils import get_generated_paths

def parse_overlay_style(style_str):
    """Parse overlay_style free text into dict: position, bg_rgba, text_rgba, padding.
    Recognizes tokens: top, bottom, center; dark, light, white, black; semi-transparent.
    Returns defaults if parsing fails.
    """
    style = style_str.lower() if style_str else ""
    position = 'bottom'
    if 'top' in style: position = 'top'
    elif 'center' in style: position = 'center'
    # Background color logic
    bg = (0,0,0,180)  # semi-transparent dark
    if 'light' in style: bg = (255,255,255,180)
    if 'white' in style and 'badge' in style: bg = (255,255,255,200)
    if 'semi-transparent' not in style:
        # If not specified, and dark present
        if 'dark' in style: bg = (0,0,0,200)
    # Text color
    text_color = (255,255,255,255)
    if 'black text' in style: text_color = (0,0,0,255)
    if 'white text' in style: text_color = (255,255,255,255)
    padding = 20
    return {
        'position': position,
        'bg': bg,
        'text_color': text_color,
        'padding': padding
    }

def create_kinetic_text_clips(word_timings_for_scene, kinetic_typography_data, overlay_style_str, video_width, video_height, font_path=None, scene_start_offset=0):
    """
    Generates a list of animated TextClips for AI-driven kinetic typography.
    """
    kinetic_clips = []
    style = parse_overlay_style(overlay_style_str)

    font_size = 70
    font = "Arial-Bold"
    if font_path and os.path.exists(font_path):
        font = font_path

    base_y_pos = 0.8 * video_height
    if style['position'] == 'top':
        base_y_pos = 0.1 * video_height
    elif style['position'] == 'center':
        base_y_pos = 0.5 * video_height

    # Group words by line (simple implementation)
    # A more advanced version would measure text width to decide when to wrap
    lines = [kinetic_typography_data] 

    for line_num, line_words in enumerate(lines):
        for i, word_data in enumerate(line_words):
            word_text = word_data['word']
            anim_style = word_data.get('animation_style', 'fade')
            color = word_data.get('color', 'white')

            # Find timing for this word
            timing = next((wt for wt in word_timings_for_scene if wt['word'] == word_text and abs(wt['start'] - (scene_start_offset + i * 0.5)) < 0.5), None)
            if not timing: continue

            word_start = timing['start'] - scene_start_offset
            word_end = timing['end'] - scene_start_offset
            duration = max(0.1, word_end - word_start)

            word_clip = TextClip(
                word_text,
                fontsize=font_size,
                color=color,
                font=font,
                method='caption'
            )

            # Apply Animations
            anim_duration = min(0.3, duration / 2)

            if anim_style == 'pop':
                word_clip = word_clip.set_start(word_start).set_duration(duration)
                word_clip = word_clip.fx(vfx.resize, lambda t: 1 + 0.5 * (1 - t/anim_duration) if t < anim_duration else 1)
                word_clip = word_clip.fx(vfx.fadein, anim_duration)
            elif anim_style == 'grow':
                word_clip = word_clip.set_start(word_start).set_duration(duration)
                word_clip = word_clip.fx(vfx.resize, lambda t: 0.5 + 0.5 * (t/anim_duration) if t < anim_duration else 1)
                word_clip = word_clip.fx(vfx.fadein, anim_duration)
            elif anim_style == 'slide_in':
                # Slide from left
                word_clip = word_clip.set_start(word_start).set_duration(duration)
                width = word_clip.w
                word_clip = word_clip.set_position(lambda t: (min(video_width / 2 - width / 2, t * (video_width/2)), base_y_pos) )
            else: # fade
                word_clip = word_clip.set_start(word_start).set_duration(duration)
                word_clip = word_clip.fx(vfx.fadein, anim_duration)
            
            word_clip = word_clip.fx(vfx.fadeout, anim_duration)
            
            # Simple layout (center each word for now)
            kinetic_clips.append(word_clip.set_position('center', base_y_pos))
            
    return kinetic_clips


def apply_transition(clip1, clip2, transition_name, duration=0.5):
    """Applies a named transition between two clips."""
    print(f"  Applying transition: {transition_name}")
    if transition_name == 'wipe_left':
        return CompositeVideoClip([clip1, clip2.set_position(lambda t: (-(clip2.w * t / duration), 'center'))]).subclip(0, clip1.duration)
    
    if transition_name == 'zoom_blur':
        # This is a more complex effect, simplified here
        return vfx.fadeout(clip1, duration).fx(vfx.fadein, duration)

    # Default to crossfade
    return vfx.fadein(clip2, duration)


def assemble_storyboard_video(storyboard_plan, video_urls, voiceover_path, music_path, full_word_timings, output_filename="final_storyboard.mp4", brand_logo_path=None, brand_font_path=None):
    """
    Assembles a multi-scene video from a storyboard plan with transitions and animated text.
    """
    try:
        paths = get_generated_paths()
        
        # Download all video clips with retry logic
        scene_video_paths = []
        for i, url in enumerate(video_urls):
            # Check if it's a local file path (from Pexels or passthrough)
            if os.path.exists(url):
                scene_video_paths.append(url)
                print(f"✅ Using local video for Scene {i+1}: {url}")
                continue

            path = os.path.join(paths["video_temp"], f"temp_scene_{i+1}.mp4")
            print(f"📥 Downloading Scene {i+1} from {url}...")
            
            max_retries = 5
            downloaded = False
            for attempt in range(max_retries):
                try:
                    session = requests.Session()
                    adapter = requests.adapters.HTTPAdapter(
                        max_retries=requests.adapters.Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
                    )
                    session.mount('https://', adapter)
                    
                    timeout_seconds = 180 + (attempt * 60)
                    print(f"   Attempt {attempt+1}/{max_retries} with {timeout_seconds}s timeout...")
                    
                    response = session.get(url, stream=True, timeout=timeout_seconds)
                    response.raise_for_status()
                    
                    with open(path, "wb") as f:
                        total_bytes = 0
                        for chunk in response.iter_content(chunk_size=32768):
                            if chunk:
                                f.write(chunk)
                                total_bytes += len(chunk)
                    
                    if os.path.exists(path) and os.path.getsize(path) > 1000:
                        print(f"✅ Scene {i+1} downloaded successfully ({total_bytes} bytes)")
                        downloaded = True
                        break
                    else:
                        if os.path.exists(path): os.remove(path)
                        raise ValueError("Downloaded file is too small")
                        
                except (requests.exceptions.Timeout, requests.exceptions.ConnectionError, ValueError, Exception) as e:
                    if os.path.exists(path): os.remove(path)
                    if attempt < max_retries - 1:
                        wait_time = 5 + (attempt * 5)
                        print(f"⚠️ Download attempt {attempt+1} failed: {e}. Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        print(f"❌ Failed to download scene {i+1} after {max_retries} attempts")
                        raise
            
            if not downloaded:
                raise Exception(f"Failed to download scene {i+1}")
                
            scene_video_paths.append(path)

        # Create composed video clips for each scene
        clips_with_text = []
        scene_start_time = 0.0 # Track the cumulative time for word timing offset

        for i, scene_data in enumerate(storyboard_plan['scenes']):
            video_clip = VideoFileClip(scene_video_paths[i])
            
            word_timings_for_scene = [
                wt for wt in full_word_timings
                if wt['start'] >= scene_start_time and wt['end'] <= scene_start_time + video_clip.duration
            ]

            all_scene_elements = [video_clip]

            kinetic_data = scene_data.get('kinetic_typography')
            if kinetic_data and word_timings_for_scene:
                print(f"🔤 Generating AI Kinetic Text for Scene {i+1}...")
                kinetic_clips = create_kinetic_text_clips(
                    word_timings_for_scene,
                    kinetic_data,
                    storyboard_plan['overlay_style'],
                    video_width=video_clip.w,
                    video_height=video_clip.h,
                    font_path=brand_font_path,
                    scene_start_offset=scene_start_time
                )
                all_scene_elements.extend(kinetic_clips)
            
            composed_clip = CompositeVideoClip(all_scene_elements)
            clips_with_text.append(composed_.set_duration(video_clip.duration))
            
            scene_start_time += video_clip.duration

        # Add transitions
        final_clips = []
        if clips_with_text:
            final_clips.append(clips_with_text[0])
            for i in range(len(clips_with_text) - 1):
                clip1 = final_clips[-1]
                clip2 = clips_with_text[i+1]
                transition_name = storyboard_plan['scenes'][i].get('transition_to_next_scene', 'crossfade')
                
                transition_clip = apply_transition(clip1, clip2, transition_name)
                final_clips.append(transition_clip)

        if not final_clips:
            print("❌ No clips to assemble.")
            return None

        final_video_track = concatenate_videoclips(final_clips, method="compose")
        
        video_duration = final_video_track.duration
        print(f"📏 Total video duration: {video_duration:.2f}s")

        # Prepare audio
        full_voiceover_clip = AudioFileClip(voiceover_path)
        
        if full_voiceover_clip.duration < video_duration:
            # Properly pad with silence using concatenation
            silence_duration = video_duration - full_voiceover_clip.duration
            silence_clip = AudioClip(
                make_frame=lambda t: [0, 0],  # Stereo silence
                duration=silence_duration,
                fps=full_voiceover_clip.fps
            )
            full_voiceover_clip = concatenate_audioclips([full_voiceover_clip, silence_clip])
        elif full_voiceover_clip.duration > video_duration:
            full_voiceover_clip = full_voiceover_clip.subclip(0, video_duration) # Trim
        
        # Start with the voiceover as the base
        audio_layers = [full_voiceover_clip]

        # Add music if available
        if music_path and os.path.exists(music_path):
            music_clip = AudioFileClip(music_path).volumex(0.2)
            if music_clip.duration < video_duration:
                loops_needed = int(video_duration / music_clip.duration) + 1
                music_clip = concatenate_audioclips([music_clip] * loops_needed).subclip(0, video_duration)
            else:
                music_clip = music_clip.subclip(0, video_duration)
            audio_layers.insert(0, music_clip) # Insert music at the bottom layer

        # Add SFX
        sfx_clips = []
        for wt in full_word_timings:
            if wt.get('sfx_path') and os.path.exists(wt['sfx_path']):
                sfx_clip = (AudioFileClip(wt['sfx_path'])
                            .set_start(wt['start'])
                            .volumex(0.5))
                sfx_clips.append(sfx_clip)
        
        if sfx_clips:
            print(f"🔊 Adding {len(sfx_clips)} sound effects to the mix.")
            audio_layers.extend(sfx_clips)

        final_audio = CompositeAudioClip(audio_layers)
        final_video_track = final_video_track.set_audio(final_audio)

        if brand_logo_path and os.path.exists(brand_logo_path):
            logo_clip = (ImageClip(brand_logo_path)
                         .set_duration(final_video_track.duration)
                         .resize(width=int(final_video_track.w * 0.1))
                         .set_position(('right', 'bottom'), relative=False)
                         .set_opacity(0.7))
            final_video_track = CompositeVideoClip([final_video_track, logo_clip])
        
        print("🎞️ Rendering Final Storyboard Video...")
        final_video_track_output_path = os.path.join(paths["final_videos"], output_filename)
        final_video_track.write_videofile(
            final_video_track_output_path, 
            codec="libx264", 
            audio_codec="aac", 
            fps=24,
            threads=max(1, os.cpu_count() - 1)
        )

        print(f"🚀 STORYBOARD VIDEO READY: {final_video_track_output_path}")
        return final_video_track_output_path

    except Exception as e:
        print(f"❌ Storyboard Assembly Error: {e}")
        import traceback; traceback.print_exc()
        return None

