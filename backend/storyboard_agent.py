import json
import os
from openai import OpenAI

# Initialize OpenAI client (also works with Groq, OpenRouter, etc.)
def get_llm_client():
    """
    Returns an LLM client. Supports:
    - OpenAI (requires OPENAI_API_KEY)
    - Groq (free, fast - requires GROQ_API_KEY)
    - Local models via OpenAI-compatible API
    """
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
    
    if not api_key:
        print("Warning: No API key found. Using mock storyboard generation.")
        return None
    
    # Use Groq if GROQ_API_KEY is set (free, fast Llama models)
    if os.getenv("GROQ_API_KEY"):
        return OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
    else:
        # Use OpenAI
        return OpenAI(api_key=api_key)

def generate_storyboard(prompt: str, style: str, duration: int):
    """
    Generates a storyboard with scenes based on the user's prompt.
    Uses LLM (GPT-4o-mini or Llama via Groq) to create detailed scenes.
    
    Args:
        prompt: User's video description
        style: Visual style (cinematic, anime, cartoon, realistic)
        duration: Video duration in seconds
    
    Returns:
        Dict with scenes array containing scene details
    """
    client = get_llm_client()
    
    # Calculate number of scenes (each scene ~5-10 seconds)
    num_scenes = max(2, duration // 8)  # e.g., 60s = 7-8 scenes
    
    if client is None:
        # Fallback: Generate mock storyboard
        return generate_mock_storyboard(prompt, style, num_scenes)
    
    # Create prompt for LLM
    system_prompt = f"""You are a professional video storyboard creator. Generate a detailed storyboard for a {duration}-second video.

Create exactly {num_scenes} scenes. Each scene should have:
1. A vivid visual description suitable for image generation
2. A clear narration script that advances the story
3. Specific details about composition, lighting, and mood

Style: {style}

Return ONLY a JSON object in this exact format:
{{
  "scenes": [
    {{
      "id": 1,
      "description": "Detailed scene description for video context",
      "key_visual": "Specific visual prompt for image generation (composition, lighting, subjects, mood)",
      "script": "Narrator voiceover text for this scene (1-2 sentences)"
    }}
  ]
}}"""

    user_prompt = f"Create a storyboard for: {prompt}"
    
    try:
        print(f"Generating storyboard with LLM for: '{prompt}'")
        
        # Choose model based on client
        model = "llama-3.1-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o-mini"
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        # Parse JSON response
        content = response.choices[0].message.content
        
        # Extract JSON if wrapped in markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        storyboard = json.loads(content)
        print(f"✅ Storyboard generated with {len(storyboard['scenes'])} scenes")
        
        return storyboard
    
    except Exception as e:
        print(f"Error calling LLM: {e}")
        print("Falling back to mock storyboard generation")
        return generate_mock_storyboard(prompt, style, num_scenes)

def generate_mock_storyboard(prompt: str, style: str, num_scenes: int):
    """
    Fallback: Generate a mock storyboard without LLM.
    Used when no API key is available.
    """
    print(f"Generating mock storyboard with {num_scenes} scenes")
    
    scenes = []
    for i in range(1, num_scenes + 1):
        scene = {
            "id": i,
            "description": f"Scene {i}: {prompt} - Part {i} of {num_scenes}",
            "key_visual": f"A {style} style shot showing {prompt}, scene {i}, professional composition, dramatic lighting",
            "script": f"This is scene {i} of our story about {prompt}. Watch as the narrative unfolds."
        }
        scenes.append(scene)
    
    return {"scenes": scenes}

if __name__ == '__main__':
    # Example usage
    prompt = "A hero's journey to a mythical land with dragons and ancient castles"
    storyboard = generate_storyboard(prompt, "cinematic", 60)
    print(json.dumps(storyboard, indent=2))
