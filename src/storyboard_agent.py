import json
import ollama

def run_storyboard_agent(prompt: str) -> dict:
    """
    Storyboard Agent: Uses Ollama to generate a structured JSON storyboard.
    """
    print(f"Storyboard Agent: Requesting storyboard from Ollama for prompt: '{prompt}'")
    
    system_prompt = """
    You are an expert video director and scriptwriter. Your task is to create a detailed storyboard in JSON format for a short, 2-scene animated marketing video.
    The video should be engaging and professional.
    
    The JSON object must have a top-level key "scenes" which is an array of 2 scene objects.
    Each object in the "scenes" array must have the following keys:
    - "scene": (integer) The scene number (1 or 2).
    - "script": (string) The voiceover script for this scene. Keep it concise, 1-2 sentences.
    - "visual_prompt": (string) A detailed description for an AI image generator (like Stable Diffusion) for this scene's visual. Be descriptive about style, characters, and setting.
    - "motion_prompt": (string) A detailed description for an AI animation generator (like AnimateDiff) for how the visual should animate. Describe a simple, short (2-3 second) animation. e.g., "A slow zoom in", "The character waves".
    
    Ensure the JSON is valid and properly formatted. Do not include any text or markdown formatting before or after the JSON object.
    """
    
    try:
        response = ollama.chat(
            model='llama3', # Assuming llama3 is pulled.
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ],
            format='json'
        )
        
        content = response['message']['content']
        storyboard = json.loads(content)
        
        print("Storyboard Agent: Successfully generated storyboard from Ollama.")
        # Basic validation
        if "scenes" not in storyboard or not isinstance(storyboard["scenes"], list):
            raise ValueError("Storyboard is missing 'scenes' array.")
            
        return storyboard
        
    except json.JSONDecodeError as e:
        print(f"Storyboard Agent Error: Failed to parse JSON from Ollama response: {e}")
        print(f"Ollama response content: {content}")
        raise
    except Exception as e:
        print(f"Storyboard Agent Error: An unexpected error occurred with Ollama: {e}")
        raise
