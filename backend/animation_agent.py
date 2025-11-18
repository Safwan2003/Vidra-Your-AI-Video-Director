import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video
from PIL import Image
import os
import uuid

# Global variable to store the pipeline
_pipeline = None

def get_pipeline():
    """
    Lazy load the video generation pipeline.
    Uses Stable Video Diffusion (SVD) for image-to-video.
    """
    global _pipeline
    if _pipeline is None:
        print("Loading Stable Video Diffusion pipeline...")
        # Using SVD-XT (extended frames, better for 3-6 sec clips)
        _pipeline = StableVideoDiffusionPipeline.from_pretrained(
            "stabilityai/stable-video-diffusion-img2vid-xt",
            torch_dtype=torch.float16,
            variant="fp16"
        )
        
        # Move to GPU if available
        if torch.cuda.is_available():
            _pipeline = _pipeline.to("cuda")
            print("SVD Pipeline loaded on GPU!")
        else:
            print("Warning: GPU not available, using CPU (will be VERY slow)")
        
        # Enable memory optimizations
        _pipeline.enable_attention_slicing()
        _pipeline.enable_model_cpu_offload()
        
    return _pipeline

def animate_image(image_path: str, fps: int = 7, num_frames: int = 25):
    """
    Animates a given image using Stable Video Diffusion.
    
    Args:
        image_path: Local path to the input image
        fps: Frames per second for output video (default: 7)
        num_frames: Number of frames to generate (default: 25 = ~3.5 seconds at 7fps)
    
    Returns:
        Local file path to the generated video
    """
    print(f"Animating image: {image_path}")
    
    # Get the pipeline
    pipeline = get_pipeline()
    
    # Load and prepare image
    if os.path.exists(image_path):
        image = Image.open(image_path)
    else:
        print(f"Error: Image not found at {image_path}")
        return None
    
    # Resize to model requirements (1024x576 or closest)
    image = image.resize((1024, 576))
    
    # Generate video frames
    print(f"Generating {num_frames} frames at {fps} fps...")
    frames = pipeline(
        image=image,
        decode_chunk_size=8,  # Memory optimization
        num_frames=num_frames,  # ~3.5 seconds at 7fps
        motion_bucket_id=127,  # Motion intensity (0-255, 127=medium)
        noise_aug_strength=0.02  # Low noise for smooth animation
    ).frames[0]
    
    # Save video locally (in production, upload to R2/S3)
    output_dir = "outputs/videos"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{uuid.uuid4()}.mp4"
    filepath = os.path.join(output_dir, filename)
    
    # Export frames to video file
    export_to_video(frames, filepath, fps=fps)
    
    print(f"Video saved to: {filepath}")
    return filepath

def cleanup_pipeline():
    """
    Free GPU memory by deleting the pipeline.
    """
    global _pipeline
    if _pipeline is not None:
        del _pipeline
        _pipeline = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("SVD Pipeline cleaned up from memory")

if __name__ == '__main__':
    # Example usage
    # First generate an image, then animate it
    test_image_path = "outputs/images/test.png"
    if os.path.exists(test_image_path):
        video_path = animate_image(test_image_path)
        print(f"Generated video at: {video_path}")
    else:
        print("Please generate an image first using image_agent.py")
