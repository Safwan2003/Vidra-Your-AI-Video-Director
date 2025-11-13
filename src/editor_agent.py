import ffmpeg
import os

def run_editor_agent(video_clips: list[str], audio_clips: list[str]) -> str:
    """
    Editor Agent: Uses ffmpeg-python to combine video and audio clips.
    """
    print("Editor Agent: Assembling final video from generated clips...")
    
    if not video_clips or not audio_clips:
        raise ValueError("Editor Agent Error: No video or audio clips provided.")
        
    if len(video_clips) != len(audio_clips):
        raise ValueError("Editor Agent Error: Mismatch between number of video and audio clips.")

    try:
        video_inputs = [ffmpeg.input(clip) for clip in video_clips]
        audio_inputs = [ffmpeg.input(clip) for clip in audio_clips]
        
        # Prepare individual video-audio pairs
        paired_clips = []
        for i in range(len(video_clips)):
            v = video_inputs[i].video
            a = audio_inputs[i].audio
            # Ensure video has a compatible pixel format and even dimensions
            v = ffmpeg.filter(v, 'format', 'yuv420p')
            v = ffmpeg.filter(v, 'scale', 'trunc(iw/2)*2', 'trunc(ih/2)*2')
            paired_clips.append(v)
            paired_clips.append(a)

        # Concatenate all video and audio streams
        # [0:v] [1:a] [2:v] [3:a] ... concat=n=N:v=1:a=1 [v] [a]
        num_clips = len(video_clips)
        concatenated = ffmpeg.concat(*paired_clips, v=1, a=1).node
        
        final_video = concatenated[0]
        final_audio = concatenated[1]

        # --- Save the Final Video ---
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "final_video.mp4")
        
        stream = ffmpeg.output(final_video, final_audio, output_path, acodec='aac', vcodec='libx264')
        # Overwrite output file if it exists
        stream = ffmpeg.overwrite_output(stream)
        
        print("Editor Agent: Running ffmpeg to generate final video...")
        ffmpeg.run(stream, quiet=True)
        
        print(f"Editor Agent: Final video saved to {output_path}")
        return output_path

    except ffmpeg.Error as e:
        print("Editor Agent ffmpeg Error:")
        print(f"Stdout: {e.stdout.decode('utf8')}")
        print(f"Stderr: {e.stderr.decode('utf8')}")
        raise
    except Exception as e:
        print(f"Editor Agent Error: An unexpected error occurred: {e}")
        raise
