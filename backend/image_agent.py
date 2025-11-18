import torch
from diffusers import StableDiffusion3Pipeline
from PIL import Image
import os
import uuid

# Global variable to store the pipeline (loaded once)
_pipeline = None

def get_pipeline():
    """
    Lazy load the image generation pipeline.
    Uses Stable Diffusion 3 for high-quality images.
    """
    global _pipeline
    if _pipeline is None:
        print("Loading Stable Diffusion 3 pipeline...")
        # For MVP: Using SD3 Medium (smaller, faster)
        # Alternative: "stabilityai/stable-diffusion-xl-base-1.0" or "black-forest-labs/FLUX.1-dev"
        _pipeline = StableDiffusion3Pipeline.from_pretrained(
            "stabilityai/stable-diffusion-3-medium-diffusers",
            torch_dtype=torch.float16,
            use_safetensors=True
        )
        
        # Move to GPU if available
        if torch.cuda.is_available():
            _pipeline = _pipeline.to("cuda")
            print("Pipeline loaded on GPU!")
        else:
            print("Warning: GPU not available, using CPU (will be slow)")
        
        # Enable memory optimizations
        _pipeline.enable_attention_slicing()
        
    return _pipeline

def generate_image(scene_description: str, style: str):
    """
    Generates an image for a given scene description using Stable Diffusion 3.
    
    Args:
        scene_description: Description of the scene to generate
        style: Art style (cinematic, anime, cartoon, realistic)
    
    Returns:
        Local file path to the generated image
    """
    print(f"Generating image for: '{scene_description}' in a {style} style.")
    
    # Get the pipeline
    pipeline = get_pipeline()
    
    # Enhance prompt with style
    style_prompts = {
        "cinematic": "cinematic lighting, professional photography, 8k uhd, masterpiece",
        "anime": "anime style, studio quality, vibrant colors, detailed illustration",
        "cartoon": "cartoon style, colorful, playful, vector art",
        "realistic": "photorealistic, high detail, professional photograph"
    }
    
    full_prompt = f"{scene_description}, {style_prompts.get(style, 'high quality, detailed')}"
    
    # Negative prompt to avoid unwanted elements
    negative_prompt = "blurry, low quality, distorted, ugly, bad anatomy, text, watermark"
    
    # Generate image
    print(f"Prompt: {full_prompt}")
    image = pipeline(
        prompt=full_prompt,
        negative_prompt=negative_prompt,
        num_inference_steps=28,  # Balanced speed/quality (increase for better quality)
        guidance_scale=7.5,
        height=576,  # 16:9 aspect ratio
        width=1024
    ).images[0]
    
    # Save locally (in production, upload to R2/S3)
    output_dir = "outputs/images"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{uuid.uuid4()}.png"
    filepath = os.path.join(output_dir, filename)
    image.save(filepath)
    
    print(f"Image saved to: {filepath}")
    return filepath

def cleanup_pipeline():
    """
    Free GPU memory by deleting the pipeline.
    Call this if you need to load other models.
    """
    global _pipeline
    if _pipeline is not None:
        del _pipeline
        _pipeline = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("Pipeline cleaned up from memory")

if __name__ == '__main__':
    # Example usage
    description = "A hero standing on a mountain top at sunset"
    image_path = generate_image(description, "cinematic")
    print(f"Generated image at: {image_path}")
