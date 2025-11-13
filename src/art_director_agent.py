import torch
from diffusers import DiffusionPipeline
from PIL import Image
import os

# Global variable to hold the pipeline, so it's not reloaded every time.
# This is a simple form of caching.
pipeline = None

def run_art_director_agent(prompt: str, scene_number: int) -> str:
    """
    Art Director Agent: Uses Stable Diffusion to generate an image for a scene.
    """
    global pipeline
    
    print(f"Art Director Agent: Generating image for scene {scene_number} with prompt: '{prompt}'")

    # --- Model and Pipeline Setup ---
    # Load the pipeline only if it hasn't been loaded yet.
    if pipeline is None:
        print("Art Director Agent: Loading Stable Diffusion XL model...")
        print("This may take a while and download several gigabytes on the first run.")
        
        pipeline = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True
        )
        pipeline.to("cuda")
        print("Art Director Agent: Stable Diffusion XL model loaded.")

    # --- Image Generation ---
    try:
        print("Art Director Agent: Generating image...")
        image: Image.Image = pipeline(prompt=prompt).images[0]
        
        # --- Save the Image ---
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        image_path = os.path.join(output_dir, f"scene_{scene_number}_image.png")
        
        image.save(image_path)
        print(f"Art Director Agent: Image for scene {scene_number} saved to {image_path}")
        
        return image_path
        
    except Exception as e:
        print(f"Art Director Agent Error: An unexpected error occurred: {e}")
        raise
