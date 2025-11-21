# agents/storyboard_manager.py

import os
import json
from groq import Groq
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

def get_image_descriptions(asset_map):
    """
    Generates descriptions for images using a local BLIP model.
    """
    if not asset_map:
        return {}

    print("🖼️ Analyzing uploaded images with BLIP model...")
    descriptions = {}
    try:
        # Initialize model
        processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
        model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

        image_assets = {k: v for k, v in asset_map.items() if k.startswith('image')}
        for asset_key, image_path in image_assets.items():
            raw_image = Image.open(image_path).convert('RGB')
            
            # Unconditional captioning
            inputs = processor(raw_image, return_tensors="pt")
            out = model.generate(**inputs)
            caption = processor.decode(out[0], skip_special_tokens=True)
            
            descriptions[asset_key] = caption
            print(f"   - {asset_key}: {caption}")
        
        print("✅ Image analysis complete.")
        return descriptions

    except Exception as e:
        print(f"⚠️ BLIP model analysis failed: {e}. Proceeding without image descriptions.")
        return {}

def create_storyboard_with_autogen(goal, target_audience, product_desc, num_assets, asset_map):
    """
    Uses a 3-step AI workflow to generate a coherent storyboard.
    Workflow: Strategist → Director → Supervisor
    """
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable not set!")

    # Initialize Groq client
    client = Groq(api_key=groq_api_key)
    model = "llama-3.3-70b-versatile"

    # --- Context Setup ---
    image_descriptions = get_image_descriptions(asset_map)
    
    asset_context = f"User has uploaded {num_assets} visual assets.\n"
    if num_assets > 0:
        asset_context += "Available Assets (Use EXACTLY these names):\n"
        for i in range(num_assets):
            asset_context += f"- image_{i}\n"
        if image_descriptions:
            asset_context += "\nImage Analysis:\n"
            for key, desc in image_descriptions.items():
                asset_context += f"- {key}: {desc}\n"
    else:
        asset_context += "No assets uploaded. Use 't2v' for all scenes."

    # --- STEP 1: Marketing Strategist ---
    print("🤖 Step 1: Marketing Strategist planning narrative...")
    strategist_prompt = f"""You are the Chief Marketing Strategist and Art Director.
Your goal: Define the Narrative Structure and the Visual Style Guide.

1. **Narrative**: Plan a video structure (3-5 scenes) based on:
   - Goal: {goal}
   - Audience: {target_audience}
   - Product: {product_desc}

2. **Style Guide**: Define the "Look and Feel" to ensure "Real World" quality.
   - Lighting (e.g., "Golden hour", "Cyberpunk neon", "Soft studio").
   - Color Palette (e.g., "Teal and Orange", "High contrast B&W").
   - Atmosphere (e.g., "Foggy", "Clean", "Chaotic").

Output a clear plan. Do NOT write JSON."""

    try:
        strategist_response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": strategist_prompt}],
            temperature=0.7
        )
        strategy_plan = strategist_response.choices[0].message.content
        print("✅ Strategy plan created")
    except Exception as e:
        print(f"❌ Strategist failed: {e}")
        return None

    # --- STEP 2: Creative Director ---
    print("🤖 Step 2: Creative Director breaking down scenes...")
    director_prompt = f"""You are the Creative Director.
Your goal: Break the Strategist's plan into specific scenes and output the FINAL JSON.

Strategy Plan:
{strategy_plan}

{asset_context}

For each scene, define:
- **Script**: Voiceover (5-15 words).
- **Action**: What happens?
- **Duration**: MUST be 3, 4, or 5 seconds only.
- **Visual Prompt**: Detailed cinematic description applying the Style Guide. Include:
  * Subject description
  * Lighting (volumetric, rim light, softbox, etc.)
  * Camera (lens type like 85mm, movement like slow pan, angle like low angle)
  * Render style ("Unreal Engine 5", "Octane Render", "8k", "Cinematic", "Photorealistic")

Rules:
- If using an uploaded image, use `visual_type='i2v'` and `asset_query='image_X'`.
- If generating from scratch, use `visual_type='t2v'` and asset_query with brief description.
- Scene 1 `start_from_previous_end` MUST be false.
- Duration MUST be 3, 4, or 5 seconds.
- Generate kinetic_typography array with one entry per word in the script.

Output Structure (VALID JSON ONLY):
{{
  "music_prompt": "...",
  "voice_style": "en-US-ChristopherNeural",
  "scenes": [
    {{
      "scene": 1,
      "script": "...",
      "visual_type": "i2v",
      "asset_query": "image_0",
      "visual_prompt": "DETAILED CINEMATIC PROMPT",
      "start_from_previous_end": false,
      "kinetic_typography": [
        {{"word": "Amazing", "animation_style": "pop", "color": "white"}},
        {{"word": "Product", "animation_style": "grow", "color": "cyan"}}
      ],
      "duration_s": 4,
      "transition_to_next_scene": "crossfade"
    }}
  ]
}}

Return ONLY the JSON code block."""

    try:
        director_response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": director_prompt}],
            temperature=0.7
        )
        director_output = director_response.choices[0].message.content
        print("✅ Director plan created")
    except Exception as e:
        print(f"❌ Director failed: {e}")
        return None

    # --- STEP 3: Supervisor (Parse and Validate JSON) ---
    print("🤖 Step 3: Supervisor validating and parsing JSON...")
    
    # Extract JSON from director's response
    try:
        start = director_output.find('{')
        end = director_output.rfind('}') + 1
        if start != -1 and end != -1:
            json_str = director_output[start:end]
            storyboard_json = json.loads(json_str)
        else:
            raise ValueError("No JSON found in director output")
    except Exception as e:
        print(f"⚠️ Failed to parse JSON directly: {e}. Asking Supervisor to fix...")
        
        # Ask supervisor to fix the JSON
        supervisor_prompt = f"""You are the Technical Supervisor.
The Director's output has JSON errors. Extract and fix the JSON.

Director Output:
{director_output}

Return ONLY valid JSON matching this structure:
{{
  "music_prompt": "...",
  "voice_style": "en-US-ChristopherNeural",
  "scenes": [
    {{
      "scene": 1,
      "script": "...",
      "visual_type": "i2v",
      "asset_query": "image_0",
      "visual_prompt": "...",
      "start_from_previous_end": false,
      "kinetic_typography": [...],
      "duration_s": 4,
      "transition_to_next_scene": "crossfade"
    }}
  ]
}}"""
        
        try:
            supervisor_response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": supervisor_prompt}],
                temperature=0.3
            )
            supervisor_output = supervisor_response.choices[0].message.content
            
            start = supervisor_output.find('{')
            end = supervisor_output.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = supervisor_output[start:end]
                storyboard_json = json.loads(json_str)
            else:
                print("❌ Supervisor could not fix JSON")
                return None
        except Exception as e:
            print(f"❌ Supervisor failed: {e}")
            return None

    # --- Validation and Post-Processing ---
    print("✅ Storyboard JSON parsed. Validating...")
    
    # Validate and fix duration_s
    for scene in storyboard_json.get('scenes', []):
        duration = scene.get('duration_s', 4)
        if duration not in [3, 4, 5]:
            print(f"⚠️ Scene {scene.get('scene')} duration {duration}s invalid. Clamping to 4s.")
            scene['duration_s'] = 4
        
        # Auto-fix asset_query naming if needed
        asset_query = scene.get('asset_query', '')
        if asset_query and not asset_query.startswith('image_') and scene.get('visual_type') == 'i2v':
            # Try to find matching image
            for i in range(num_assets):
                if f"image_{i}" in asset_map:
                    scene['asset_query'] = f"image_{i}"
                    print(f"✅ Auto-fixed asset_query for scene {scene.get('scene')} to image_{i}")
                    break
    
    print("✅ Storyboard validation complete")
    return storyboard_json
