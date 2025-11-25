
import os
import numpy as np
try:
    from moviepy import ImageClip, CompositeVideoClip
    from moviepy.video.compositing.concatenate import concatenate_videoclips
except ImportError:
    from moviepy.editor import ImageClip, CompositeVideoClip, concatenate_videoclips
from core.editor import create_kinetic_text_clips, apply_transition

def create_color_clip(size, color, duration=2):
    # Create a solid color image
    w, h = size
    img = np.zeros((h, w, 3), dtype=np.uint8)
    img[:] = color
    return ImageClip(img).set_duration(duration)

def verify_features():
    print("🧪 Starting verification of 2D features...")
    
    # 1. Setup
    size = (1280, 720)
    clip1 = create_color_clip(size, (255, 0, 0), 3) # Red
    clip2 = create_color_clip(size, (0, 0, 255), 3) # Blue
    
    # 2. Test Transition (Slide Left)
    print("Testing 'slide_left' transition...")
    transition_clip = apply_transition(clip1, clip2, "slide_left", duration=1.0)
    
    # 3. Test Text Animation (Typewriter)
    print("Testing 'typewriter' text animation...")
    word_timings = [{'word': 'Hello', 'start': 0.5, 'end': 1.5}, {'word': 'World', 'start': 1.5, 'end': 2.5}]
    kinetic_data = [
        {'word': 'Hello', 'animation_style': 'typewriter', 'color': 'white'},
        {'word': 'World', 'animation_style': 'pop_bounce', 'color': 'yellow'}
    ]
    
    text_clips = create_kinetic_text_clips(
        word_timings, kinetic_data, "bottom", size[0], size[1], 
        style_preset="SaaS Explainer"
    )
    
    # 4. Assemble
    print("Assembling test video...")
    # Note: Transition logic in verify script is simplified. 
    # In app, we append transition clip.
    final_clips = [clip1, transition_clip, clip2]
    
    # Overlay text on clip1
    if text_clips:
        clip1_with_text = CompositeVideoClip([clip1] + text_clips).set_duration(clip1.duration)
        final_clips[0] = clip1_with_text
        
    final_video = concatenate_videoclips(final_clips, method="compose")
    
    output_path = "test_2d_features.mp4"
    final_video.write_videofile(output_path, fps=24)
    
    if os.path.exists(output_path):
        print(f"✅ Verification successful! Video saved to {output_path}")
    else:
        print("❌ Verification failed: Output file not created.")

if __name__ == "__main__":
    verify_features()
