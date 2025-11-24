# src/editor.py

import os
import time
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

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

def create_text_image_with_pil(text, font_path, font_size, color, stroke_color, stroke_width, shadow_color=None, shadow_offset=(0,0), blur_radius=0):
    """
    Creates a transparent image with text using Pillow, supporting Shadows and Glows.
    """
    try:
        # Load font
        try:
            font = ImageFont.truetype(font_path, font_size)
        except:
            font = ImageFont.load_default()

        # Calculate text size
        dummy_img = Image.new('RGBA', (1, 1))
        draw = ImageDraw.Draw(dummy_img)
        bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        
        # Add padding for shadow/glow
        padding = int(max(abs(shadow_offset[0]), abs(shadow_offset[1])) + blur_radius * 2 + 20)
        width = text_w + padding * 2
        height = text_h + padding * 2
        
        # Create base image
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        
        # Draw Shadow / Glow
        if shadow_color:
            shadow_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            shadow_draw = ImageDraw.Draw(shadow_layer)
            # Draw shadow text
            shadow_x = padding + shadow_offset[0]
            shadow_y = padding + shadow_offset[1]
            shadow_draw.text((shadow_x, shadow_y), text, font=font, fill=shadow_color, stroke_width=stroke_width+2, stroke_fill=shadow_color)
            
            if blur_radius > 0:
                shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur_radius))
            
            img = Image.alpha_composite(img, shadow_layer)

        # Draw Main Text
        draw = ImageDraw.Draw(img)
        draw.text((padding, padding), text, font=font, fill=color, stroke_fill=stroke_color, stroke_width=stroke_width)
        
        return np.array(img)
        
    except Exception as e:
        print(f"❌ PIL Text Generation failed: {e}")
        return None

def create_kinetic_text_clips(word_timings_for_scene, kinetic_typography_data, overlay_style_str, video_width, video_height, font_path=None, scene_start_offset=0, style_preset="Cinematic"):
    """
    Generates a list of animated TextClips for AI-driven kinetic typography with proper animations.
    """
    kinetic_clips = []
    style = parse_overlay_style(overlay_style_str)

    # Larger font for impact
    font_size = 100
    font = "Arial-Bold"
    if font_path and os.path.exists(font_path):
        font = font_path

    # --- STYLE-AWARE TYPOGRAPHY ---
    # Override defaults based on style_preset
    text_color_override = None
    stroke_color_override = 'black'
    shadow_color = "black"
    shadow_offset = (5, 5)
    blur_radius = 0
    
    if style_preset == "Cyberpunk":
        font = "Impact" 
        text_color_override = "#39ff14" # Neon Green
        stroke_color_override = "#ff00ff" # Neon Pink stroke
        shadow_color = "#39ff14" # Green Glow
        shadow_offset = (0, 0)
        blur_radius = 15 # Strong Glow
    elif style_preset == "Luxury":
        font = "Times-New-Roman-Bold" 
        text_color_override = "#ffd700" # Gold
        stroke_color_override = "black"
        shadow_color = "black"
        shadow_offset = (4, 4)
        blur_radius = 5 # Soft Shadow
    elif style_preset == "High Energy":
        font = "Arial-Black"
        text_color_override = "yellow"
        stroke_color_override = "red"
        shadow_color = "black"
        shadow_offset = (8, 8) # Hard drop shadow
        blur_radius = 0
    elif style_preset == "TV Commercial":
        font = "Arial-Bold"
        text_color_override = "#333333" 
        stroke_color_override = "white" 
        shadow_color = "rgba(0,0,0,0.3)" # Subtle shadow
        shadow_offset = (3, 3)
        blur_radius = 2
    # ------------------------------

    # Position based on style
    base_y_pos = int(0.5 * video_height) # Default to Center for better integration
    if style['position'] == 'top':
        base_y_pos = int(0.2 * video_height)
    elif style['position'] == 'bottom':
        base_y_pos = int(0.8 * video_height)

    print(f"🔤 Creating {len(kinetic_typography_data)} kinetic text animations...")

    for i, word_data in enumerate(kinetic_typography_data):
        word_text = word_data['word']
        anim_style = word_data.get('animation_style', 'fade')
        # Normalize style variants from storyboard (e.g., 'slide' -> 'slide_in')
        if anim_style == 'slide':
            anim_style = 'slide_in'
        
        # Apply style overrides
        color = text_color_override if text_color_override else word_data.get('color', 'white')
        stroke_col = stroke_color_override

        # Match word timing (fuzzy match by word text)
        timing = None
        for wt in word_timings_for_scene:
            # Remove punctuation for matching
            wt_word_clean = wt['word'].strip('.,!?;:').lower()
            word_text_clean = word_text.strip('.,!?;:').lower()
            if wt_word_clean == word_text_clean:
                timing = wt
                break
        
        if not timing:
            print(f"  ⚠️ No timing found for word: '{word_text}'")
            continue

        word_start = max(0, timing['start'] - scene_start_offset)
        word_end = max(word_start + 0.1, timing['end'] - scene_start_offset)
        duration = word_end - word_start

        # Create text clip using PIL (Robust fallback)
        try:
            # Generate text image with PRO effects
            txt_img_array = create_text_image_with_pil(
                word_text, 
                font if font.endswith(".ttf") or font.endswith(".otf") else "arial.ttf", 
                font_size, 
                color, 
                stroke_col, 
                4,
                shadow_color=shadow_color,
                shadow_offset=shadow_offset,
                blur_radius=blur_radius
            )
            
            if txt_img_array is not None:
                word_clip = ImageClip(txt_img_array).set_start(word_start).set_duration(duration)
            else:
                # Fallback to MoviePy TextClip if PIL fails (unlikely)
                word_clip = TextClip(
                    word_text,
                    fontsize=font_size,
                    color=color,
                    font=font,
                    stroke_color=stroke_col,
                    stroke_width=4,
                    method='label'
                ).set_start(word_start).set_duration(duration)
                
        except Exception as e:
            print(f"  ⚠️ Failed to create TextClip for '{word_text}': {e}")
            continue

        # Animation duration
        anim_in = min(0.25, duration / 3)
        anim_out = min(0.25, duration / 3)

        # Apply animation based on style
        if anim_style == 'pop':
            # Scale with OVERSHOOT (Bounce)
            def pop_scale(t):
                if t < anim_in:
                    progress = t / anim_in
                    # Overshoot formula: goes to 1.2 then settles at 1.0
                    return 1.0 + 0.2 * np.sin(progress * np.pi) 
                return 1.0
            word_clip = word_clip.resize(pop_scale)
            word_clip = word_clip.crossfadein(anim_in).crossfadeout(anim_out)
            
        elif anim_style == 'grow':
            # Smooth Ease-Out Grow
            def grow_scale(t):
                if t < anim_in:
                    p = t / anim_in
                    return 0.5 + 0.5 * (1 - (1 - p) * (1 - p)) # Quadratic Ease Out
                return 1.0
            word_clip = word_clip.resize(grow_scale)
            word_clip = word_clip.crossfadein(anim_in).crossfadeout(anim_out)
            
        elif anim_style == 'slide_in':
            # Slide with Ease-Out
            def slide_pos(t):
                if t < anim_in:
                    p = t / anim_in
                    ease_p = 1 - (1 - p) * (1 - p) # Quadratic Ease Out
                    offset = (1 - ease_p) * (video_width / 2)
                    return (video_width / 2 + offset, base_y_pos)
                return ('center', base_y_pos)
            word_clip = word_clip.set_position(slide_pos)
            word_clip = word_clip.crossfadein(anim_in).crossfadeout(anim_out)
            
        elif anim_style == 'glitch':
            # Random position jitter + opacity flicker
            import random
            def glitch_pos(t):
                if t < duration:
                    jitter_x = random.randint(-5, 5)
                    jitter_y = random.randint(-5, 5)
                    return (video_width / 2 + jitter_x - word_clip.w/2, base_y_pos + jitter_y)
                return ('center', base_y_pos)
            
            word_clip = word_clip.set_position(glitch_pos)
            # Flicker opacity
            word_clip = word_clip.fl_image(lambda image, t: image if random.random() > 0.2 else image * 0)

        elif anim_style == 'typewriter':
            # Reveal text character by character (simulated by masking or just simple reveal)
            # MoviePy TextClip doesn't support dynamic text content easily without re-rendering.
            # Simpler approach: Masking from left to right.
            def typewriter_mask(t):
                if t < anim_in:
                    return 1 # Full mask (visible) - wait, mask logic in moviepy is complex.
                    # Let's stick to a simple opacity fade for now, or just use the 'pop' effect as fallback
                    # until we implement a proper mask.
                return 1
            # Fallback to pop for now as typewriter requires CompositeVideoClip of individual letters
            word_clip = word_clip.resize(lambda t: min(1, t/anim_in) if t < anim_in else 1)

        else:  # fade (default)
            word_clip = word_clip.set_position(('center', base_y_pos))
            word_clip = word_clip.crossfadein(anim_in).crossfadeout(anim_out)

        # Center position if not already set by animation
        if anim_style != 'slide_in':
            word_clip = word_clip.set_position(('center', base_y_pos))
        
        kinetic_clips.append(word_clip)
    
    print(f"  ✅ Created {len(kinetic_clips)} kinetic text clips")
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


def assemble_storyboard_video(storyboard_plan, video_urls, voiceover_path, music_path, full_word_timings, output_filename="final_storyboard.mp4", brand_logo_path=None, brand_font_path=None, status=None):
    """
    Assembles a multi-scene video from a storyboard plan with transitions and animated text.
    """
    try:
        paths = get_generated_paths()
        
        # Download all video clips
        scene_video_paths = []
        num_urls = len(video_urls)
        for i, url in enumerate(video_urls):
            message = f"📥 Downloading Scene {i+1}/{num_urls}..."
            if status: status.update(label=message)
            print(message)

            if os.path.exists(url):
                scene_video_paths.append(url)
                print(f"✅ Using local video for Scene {i+1}: {url}")
                continue

            path = os.path.join(paths["video_temp"], f"temp_scene_{i+1}.mp4")
            
            try:
                # Use a session with retries for resilience
                session = requests.Session()
                adapter = requests.adapters.HTTPAdapter(
                    max_retries=requests.adapters.Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
                )
                session.mount('https://', adapter)
                
                response = session.get(url, stream=True, timeout=600)
                response.raise_for_status()
                
                total_size = 0
                with open(path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=32768):
                        if chunk:
                            f.write(chunk)
                            total_size += len(chunk)
                
                file_size = os.path.getsize(path) if os.path.exists(path) else 0
                if file_size > 1000:
                    print(f"✅ Scene {i+1} downloaded successfully ({file_size} bytes)")
                    scene_video_paths.append(path)
                else:
                    raise ValueError(f"Downloaded file is empty or too small ({file_size} bytes)")
                        
            except Exception as e:
                message = f"❌ Failed to download scene {i+1}: {e}"
                if status: status.update(label=message, state="error")
                print(message)
                raise

        # Create composed video clips for each scene
        if status: status.update(label="⚙️ Composing scenes with kinetic text...")
        clips_with_text = []
        scene_start_time = 0.0
        num_scenes = len(storyboard_plan['scenes'])
        for i, scene_data in enumerate(storyboard_plan['scenes']):
            if status: status.update(label=f"⚙️ Processing scene {i+1}/{num_scenes}...")
            video_clip = VideoFileClip(scene_video_paths[i])
            
            word_timings_for_scene = [
                wt for wt in full_word_timings
                if wt['start'] >= scene_start_time and wt['end'] <= scene_start_time + video_clip.duration + 0.1
            ]

            all_scene_elements = [video_clip]

            kinetic_data = scene_data.get('kinetic_typography')
            if kinetic_data and word_timings_for_scene:
                print(f"🔤 Generating AI Kinetic Text for Scene {i+1}...")
                kinetic_clips = create_kinetic_text_clips(
                    word_timings_for_scene, kinetic_data, storyboard_plan['overlay_style'],
                    video_clip.w, video_clip.h, brand_font_path, scene_start_time,
                    style_preset=storyboard_plan.get('style_preset', 'Cinematic')
                )
                all_scene_elements.extend(kinetic_clips)
            
            composed_clip = CompositeVideoClip(all_scene_elements).set_duration(video_clip.duration)
            clips_with_text.append(composed_clip)
            
            scene_start_time += video_clip.duration

        # Add transitions
        if status: status.update(label="✨ Applying transitions...")
        final_clips = []
        if clips_with_text:
            final_clips.append(clips_with_text[0])
            for i in range(len(clips_with_text) - 1):
                clip1 = final_clips[-1]
                clip2 = clips_with_text[i+1]
                transition_name = storyboard_plan['scenes'][i].get('transition_to_next_scene', 'crossfade')
                
                # We need a better way to handle transitions that shorten the clip
                transition_clip = apply_transition(clip1, clip2, transition_name)
                final_clips.append(transition_clip)

        if not final_clips:
            message = "❌ No clips to assemble."
            if status: status.update(label=message, state="error")
            print(message)
            return None

        final_video_track = concatenate_videoclips(final_clips, method="compose")
        video_duration = final_video_track.duration
        print(f"📏 Total video duration: {video_duration:.2f}s")

        # Prepare audio
        if status: status.update(label="🎶 Mixing final audio track...")
        full_voiceover_clip = AudioFileClip(voiceover_path)
        
        # Pad or trim voiceover to match video duration
        if full_voiceover_clip.duration < video_duration:
            silence = AudioClip(lambda t: [0,0], duration=video_duration - full_voiceover_clip.duration, fps=full_voiceover_clip.fps)
            full_voiceover_clip = concatenate_audioclips([full_voiceover_clip, silence])
        elif full_voiceover_clip.duration > video_duration:
            full_voiceover_clip = full_voiceover_clip.subclip(0, video_duration)
        
        audio_layers = [full_voiceover_clip]

        if music_path and os.path.exists(music_path):
            music_clip = AudioFileClip(music_path).volumex(0.2)
            if music_clip.duration < video_duration:
                # Loop by repeating the clip
                loops_needed = int(video_duration / music_clip.duration) + 1
                music_clip = concatenate_audioclips([music_clip] * loops_needed).subclip(0, video_duration)
            else:
                music_clip = music_clip.subclip(0, video_duration)
            audio_layers.insert(0, music_clip)

        sfx_clips = []
        for wt in full_word_timings:
            if wt.get('sfx_path') and os.path.exists(wt['sfx_path']):
                sfx_clip = (AudioFileClip(wt['sfx_path'])
                            .set_start(wt['start'])
                            .volumex(0.5))
                sfx_clips.append(sfx_clip)
        
        if sfx_clips:
            print(f"🔊 Adding {len(sfx_clips)} sound effects.")
            audio_layers.extend(sfx_clips)

        final_audio = CompositeAudioClip(audio_layers)
        final_video_track = final_video_track.set_audio(final_audio)

        # Add branding
        if brand_logo_path and os.path.exists(brand_logo_path):
            if status: status.update(label="🖼️ Adding brand logo...")
            logo_clip = (ImageClip(brand_logo_path)
                         .set_duration(final_video_track.duration)
                         .resize(height=int(final_video_track.h * 0.08)) # 8% of video height
                         .set_position(("right", "bottom"))
                         .set_opacity(0.8))
            final_video_track = CompositeVideoClip([final_video_track, logo_clip])
        
        message = "🎞️ Rendering final video... This may take a few minutes."
        if status: status.update(label=message)
        print(message)
        
        output_path = os.path.join(paths["final_videos"], output_filename)
        final_video_track.write_videofile(
            output_path, 
            codec="libx264", 
            audio_codec="aac", 
            fps=24,
            threads=max(1, os.cpu_count() - 1),
            logger='bar' # Progress bar
        )

        print(f"🚀 VIDEO READY: {output_path}")
        return output_path

    except Exception as e:
        message = f"❌ Assembly Error: {e}"
        if status: status.update(label=message, state="error")
        print(message)
        import traceback; traceback.print_exc()
        return None

