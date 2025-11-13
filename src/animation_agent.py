import torch
from diffusers import AnimateDiffPipeline, MotionAdapter, EulerDiscreteScheduler
from diffusers.utils import export_to_video
from huggingface_hub import hf_hub_download
import os

# Global variable to hold the pipeline for caching
pipeline = None

def run_animation_agent(prompt: str, scene_number: int) -> str:
    """
    Animation Agent: Uses AnimateDiff to generate a short video clip for a scene.
    """
    global pipeline
    
    print(f"Animation Agent: Generating clip for scene {scene_number} with prompt: '{prompt}'")

    # --- Model and Pipeline Setup ---
    if pipeline is None:
        print("Animation Agent: Loading AnimateDiff model...")
        print("This may take a while and download several gigabytes on the first run.")
        
        device = "cuda"
        dtype = torch.float16

        # The base model for image generation (similar to Stable Diffusion)
        stephen_model_id = "SG161222/Realistic_Vision_V5.1_noVAE"
        
        # The motion adapter that makes it a video model
        motion_adapter_id = "guoyww/animatediff-motion-adapter-v1-5-2"
        
        # Download the motion adapter
        motion_adapter_path = hf_hub_download(motion_adapter_id, "motion_adapter.bin")
        motion_adapter = MotionAdapter.from_pretrained(motion_adapter_id, torch_dtype=dtype)

        pipeline = AnimateDiffPipeline.from_pretrained(
            stephen_model_id,
            motion_adapter=motion_adapter,
            torch_dtype=dtype
        )
        scheduler = EulerDiscreteScheduler.from_config(
            pipeline.scheduler.config,
            timestep_spacing="trailing",
            beta_schedule="linear"
        )
        pipeline.scheduler = scheduler
        pipeline.enable_vae_slicing()
        pipeline.enable_model_cpu_offload()
        pipeline.to(device)
        print("Animation Agent: AnimateDiff model loaded.")

    # --- Video Generation ---
    try:
        print("Animation Agent: Generating frames...")
        output = pipeline(
            prompt=prompt,
            num_frames=16,
            guidance_scale=7.5,
            num_inference_steps=25,
        )
        frames = output.frames[0]
        
        # --- Save the Video ---
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        video_path = os.path.join(output_dir, f"scene_{scene_number}_clip.mp4")
        
        export_to_video(frames, video_path)
        print(f"Animation Agent: Clip for scene {scene_number} saved to {video_path}")
        
        return video_path
        
    except Exception as e:
        print(f"Animation Agent Error: An unexpected error occurred: {e}")
        raise
