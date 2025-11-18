import subprocess
import os
import uuid
import json
from pathlib import Path

def create_final_video(storyboard: dict):
    """
    Combines all the assets into a final video using FFmpeg.
    
    Process:
    1. Concatenate all scene videos
    2. Add voiceover audio
    3. Mix in background music
    4. Apply crossfade transitions (optional)
    5. Export final MP4
    
    Args:
        storyboard: Dict containing scenes, voiceover_url, music_url
    
    Returns:
        Local file path to the final video
    """
    print("Starting final video editing process...")
    print(json.dumps(storyboard, indent=2))
    
    # Prepare output directory
    output_dir = "outputs/final"
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Create file list for concatenation
    concat_file = os.path.join(output_dir, f"concat_{uuid.uuid4()}.txt")
    with open(concat_file, 'w') as f:
        for scene in storyboard["scenes"]:
            video_path = scene.get("video_url")
            if video_path and os.path.exists(video_path):
                # FFmpeg concat format
                f.write(f"file '{os.path.abspath(video_path)}'\n")
    
    # Step 2: Concatenate video clips
    temp_video = os.path.join(output_dir, f"temp_concat_{uuid.uuid4()}.mp4")
    print("Concatenating video clips...")
    
    concat_cmd = [
        'ffmpeg',
        '-f', 'concat',
        '-safe', '0',
        '-i', concat_file,
        '-c', 'copy',
        temp_video,
        '-y'  # Overwrite output
    ]
    
    try:
        subprocess.run(concat_cmd, check=True, capture_output=True)
        print(f"Videos concatenated: {temp_video}")
    except subprocess.CalledProcessError as e:
        print(f"Error concatenating videos: {e.stderr.decode()}")
        return None
    
    # Step 3: Add audio (voiceover + music)
    final_filename = f"final_video_{uuid.uuid4()}.mp4"
    final_path = os.path.join(output_dir, final_filename)
    
    voiceover = storyboard.get("voiceover_url")
    music = storyboard.get("music_url")
    
    # Build FFmpeg command for audio mixing
    print("Adding audio tracks...")
    
    if voiceover and music and os.path.exists(voiceover) and os.path.exists(music):
        # Mix voiceover + background music
        audio_cmd = [
            'ffmpeg',
            '-i', temp_video,           # Input video
            '-i', voiceover,            # Input voiceover
            '-i', music,                # Input music
            '-filter_complex',
            '[1:a]volume=1.0[voice];'   # Voiceover at 100%
            '[2:a]volume=0.3[music];'   # Music at 30% (background)
            '[voice][music]amix=inputs=2:duration=first[audio]',  # Mix audio
            '-map', '0:v',              # Map video from first input
            '-map', '[audio]',          # Map mixed audio
            '-c:v', 'copy',             # Copy video codec (no re-encode)
            '-c:a', 'aac',              # Encode audio as AAC
            '-b:a', '192k',             # Audio bitrate
            '-shortest',                # Match shortest stream duration
            final_path,
            '-y'
        ]
    elif voiceover and os.path.exists(voiceover):
        # Only voiceover
        audio_cmd = [
            'ffmpeg',
            '-i', temp_video,
            '-i', voiceover,
            '-map', '0:v',
            '-map', '1:a',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            final_path,
            '-y'
        ]
    elif music and os.path.exists(music):
        # Only music
        audio_cmd = [
            'ffmpeg',
            '-i', temp_video,
            '-i', music,
            '-filter_complex', '[1:a]volume=0.5[audio]',
            '-map', '0:v',
            '-map', '[audio]',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-shortest',
            final_path,
            '-y'
        ]
    else:
        # No audio, just copy video
        print("Warning: No audio files found, using video only")
        subprocess.run(['cp', temp_video, final_path], check=True)
        return final_path
    
    try:
        subprocess.run(audio_cmd, check=True, capture_output=True)
        print(f"✅ Final video created: {final_path}")
        
        # Cleanup temp files
        os.remove(concat_file)
        os.remove(temp_video)
        
        return final_path
    
    except subprocess.CalledProcessError as e:
        print(f"Error adding audio: {e.stderr.decode()}")
        return temp_video  # Return video without audio as fallback

def add_transitions(video_paths: list, output_path: str, transition_duration: float = 0.5):
    """
    Advanced: Add crossfade transitions between clips.
    This is optional for MVP but improves quality.
    
    Args:
        video_paths: List of video file paths
        output_path: Output file path
        transition_duration: Duration of crossfade in seconds
    """
    # This requires more complex FFmpeg filter chains
    # Implement if needed for better quality
    pass

if __name__ == '__main__':
    # Example usage
    example_storyboard = {
        "scenes": [
            {
                "id": 1,
                "description": "Scene 1",
                "key_visual": "Visual 1",
                "script": "Script 1",
                "image_url": "outputs/images/test1.png",
                "video_url": "outputs/videos/test1.mp4"
            },
            {
                "id": 2,
                "description": "Scene 2",
                "key_visual": "Visual 2",
                "script": "Script 2",
                "image_url": "outputs/images/test2.png",
                "video_url": "outputs/videos/test2.mp4"
            }
        ],
        "voiceover_url": "outputs/audio/voiceover.wav",
        "music_url": "outputs/audio/music.wav"
    }
    
    final_video_path = create_final_video(example_storyboard)
    print(f"Generated final video: {final_video_path}")
