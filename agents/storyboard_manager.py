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
    Uses a multi-step AI workflow to generate a coherent storyboard.

    Args:
        goal (str): The primary goal of the video.
        target_audience (str): The intended audience.
        product_desc (str): A description of the product.
        num_assets (int): The number of visual assets provided by the user.
        asset_map (dict): A map of asset keys to their local paths.

    Returns:
        dict: The final, refined storyboard plan as a dictionary, or None if failed.
    """
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable not set!")

    client = Groq(api_key=groq_api_key)

    # --- Get Image Descriptions if assets are available ---
    image_descriptions = get_image_descriptions(asset_map)

    # --- Step 1: High-Level Strategy ---
    print("🎯 Step 1: Marketing Strategist planning narrative structure...")
    
    strategist_system = f"""You are a high-level marketing strategist.
Based on the video goal, target_audience, and available assets, decide on the narrative structure.
Output a short message defining the structure.

IMPORTANT: The user has {num_assets} visual asset(s) uploaded. Plan scenes accordingly:
- If 1 asset: Plan 2-3 scenes focusing on that asset
- If 2-3 assets: Plan 3-4 scenes, one per asset
- If 4+ assets: Plan 4-5 scenes

Examples:
- For 'Explainer Video': "Plan a 4-scene video: 1. Problem, 2. Solution, 3. How it Works, 4. CTA."
- For 'Product/Feature Launch' with 1 asset: "Plan a 3-scene video: 1. Intrigue (use asset), 2. Reveal (use asset), 3. Benefit/CTA."

The user's goal is: '{goal}'.
The target audience is: '{target_audience}'.
Available assets: {num_assets}
Provide ONLY the structural plan, no JSON yet."""

    try:
        strategy_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": strategist_system},
                {"role": "user", "content": f"Create a narrative structure for this video."}
            ],
            temperature=0.7,
            max_tokens=300
        )
        narrative_structure = strategy_response.choices[0].message.content
        print(f"📋 Narrative Structure: {narrative_structure}\n")
    except Exception as e:
        print(f"❌ Error in strategist step: {e}")
        return None

    # --- Step 2: Creative Director Creates Storyboard ---
    print("🎨 Step 2: Creative Director generating detailed storyboard...")
    
    director_system = """You are a world-class Creative Director specializing in AI-generated video and kinetic typography.
Generate a complete, detailed storyboard optimized for high-impact marketing videos.
Ensure the JSON is perfectly formatted. Do not add any text before or after the JSON block.

The JSON structure MUST be:
{
  "music_prompt": "<string>",
  "voice_style": "<string> One of [en-US-ChristopherNeural, en-US-AriaNeural, en-US-GuyNeural, en-US-JennyNeural]",
  "overlay_style": "<string> e.g. 'bottom semi-transparent dark badge white text'",
  "scenes": [
    {
      "scene": <integer>,
      "script": "<string> Voiceover for the scene (5-15 words)",
      "visual_type": "<string> One of ['i2v', 't2v']",
      "asset_query": "<string> For 'i2v', an asset name. For 't2v', a detailed prompt.",
      "visual_prompt": "<string> Camera motion for Wan 2.2 model.",
      "overlay_text": "<string> This is now DEPRECATED, use kinetic_typography instead. Keep as empty string: ''",
      "kinetic_typography": [
        {
            "word": "<string>",
            "animation_style": "<string> One of ['fade', 'pop', 'slide_in', 'grow']",
            "color": "<string> 'white' or a highlight color like '#FFD700'",
            "sfx": "<string|null> A short description of a sound effect for power words, e.g., 'a subtle whoosh' or 'a sharp click'. Null for other words."
        }
      ],
      "duration_s": <integer> [3, 4, 5],
      "transition_to_next_scene": "<string|null> Description of the transition, e.g., 'crossfade', 'zoom_blur', 'wipe_left'. Null for the last scene."
    }
  ]
}

**Kinetic Typography and SFX Rules:**
1.  **Analyze the Script:** For each scene, break the `script` into individual words.
2.  **Identify Power Words:** Find the 1-2 most impactful words (verbs, adjectives, key features).
3.  **Assign Animations & SFX:**
    *   For **power words**, use dynamic animations like 'pop' or 'grow', give them a highlight color, AND assign a descriptive `sfx` prompt.
    *   For **other words**, use a subtle 'fade' animation, the default text color, and set `sfx` to `null`.
4.  **Populate the List:** Create an entry in the `kinetic_typography` list for every single word in the script.

**Transition Rules:**
- Choose a transition that matches the narrative flow. 'crossfade' is a safe default.
- Use more creative transitions like 'zoom_blur' for high-energy moments.
- The `transition_to_next_scene` for the VERY LAST scene MUST be `null`.

**Example:**
"script": "Feel the powerful, raw energy."
"kinetic_typography": [
    { "word": "Feel", "animation_style": "fade", "color": "white", "sfx": null },
    { "word": "the", "animation_style": "fade", "color": "white", "sfx": null },
    { "word": "powerful,", "animation_style": "grow", "color": "#FFD700", "sfx": "a deep bass swell" },
    { "word": "raw", "animation_style": "pop", "color": "white", "sfx": "a sharp crackle" },
    { "word": "energy.", "animation_style": "grow", "color": "#FFD700", "sfx": "an electric hum" }
],
"transition_to_next_scene": "zoom_blur"


**CRITICAL PROMPT OPTIMIZATION RULES (for 'i2v'/'t2v'):**
-   **Camera:** Use smooth movements like "Slow push in", "Gentle pan right", "Orbital rotation clockwise".
-   **Lighting & Atmosphere:** Use descriptive terms like "Dramatic lighting", "Soft natural lighting", "Vibrant studio lighting".
-   **Visual Context:** If provided with image descriptions, use them to create more relevant and creative `visual_prompt`s.
-   **Avoid:** "Fast cuts", "morphing", "text appearing" (we handle text).

**CRITICAL ASSET RULES:**
-   If user uploaded images: Use `visual_type='i2v'` and `asset_query='image_0'`.
-   Use `visual_type='t2v'` for all other scenes.
-   **Set `overlay_text` to an empty string `""`.**
"""

    # Build available assets list and description context
    asset_instruction = ""
    if num_assets > 0:
        available_assets = ", ".join([f"image_{i}" for i in range(num_assets)])
        asset_instruction += f"\n\nAVAILABLE ASSETS (MUST USE THESE EXACT NAMES): {available_assets}\n"
        
        if image_descriptions:
            asset_instruction += "\nIMAGE CONTEXT:\n"
            for key, desc in image_descriptions.items():
                asset_instruction += f"- {key}: {desc}\n"
            asset_instruction += "\nUse this context to create more specific and creative visual prompts."

        asset_instruction += f"""
RULES:
- You have {num_assets} image(s) uploaded.
- For scenes showing the product, use visual_type='i2v' and asset_query='image_0'.
- For other scenes, use 't2v' with a descriptive prompt.
- DO NOT create custom names like 'outdoor_activity_image' or 'product_packshot'.
- ONLY use the exact names listed above.
- Create maximum {num_assets + 2} scenes."""
    else:
        asset_instruction = "\n\nNo images uploaded. Use visual_type='t2v' and provide a descriptive prompt in 'asset_query'."
    
    director_user = f"""Create a storyboard following this structure:
{narrative_structure}

Video Goal: {goal}
Target Audience: {target_audience}
Product: {product_desc}{asset_instruction}

Generate the complete storyboard JSON now, following all kinetic typography, SFX, transition, and asset rules."""

    try:
        director_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": director_system},
                {"role": "user", "content": director_user}
            ],
            temperature=0.8,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        storyboard_json = director_response.choices[0].message.content
        storyboard = json.loads(storyboard_json)
        print("✅ Initial storyboard with kinetic typography created\n")
    except Exception as e:
        print(f"❌ Error in director step: {e}")
        return None

    # --- Step 3: Supervisor Reviews and Refines ---
    print("🔍 Step 3: Continuity Supervisor reviewing storyboard...")
    
    supervisor_system = """You are a Technical Director. Review the JSON storyboard for quality and correctness.

Check for:
1.  **Kinetic Typography & Transitions:**
    *   Does the `kinetic_typography` list exist for each scene?
    *   Does it contain an object for **every** word in the `script`?
    *   Are `animation_style`, `color`, and `sfx` fields present?
    *   Is `transition_to_next_scene` present for all but the last scene?
    *   Is `overlay_text` an empty string `""`?
2.  **Asset Logic:**
    *   Is `visual_type` one of 'i2v' or 't2v'?
    *   Is `asset_query` correctly formatted for the `visual_type`?
3.  **General Structure:** Is the overall JSON valid?

If you find issues, provide SPECIFIC fixes.
**If everything is perfect, respond with ONLY "APPROVED".**"""

    try:
        supervisor_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": supervisor_system},
                {"role": "user", "content": f"Review this storyboard:\n{json.dumps(storyboard, indent=2)}"}
            ],
            temperature=0.6,
            max_tokens=500
        )
        feedback = supervisor_response.choices[0].message.content
        print(f"📝 Supervisor Feedback: {feedback}\n")
        
        # If not approved, refine once
        if "APPROVED" not in feedback.upper():
            print("🔄 Step 4: Creative Director refining based on feedback...")
            
            refine_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": director_system},
                    {"role": "user", "content": f"Here is your previous storyboard:\n{json.dumps(storyboard, indent=2)}\n\nSupervisor feedback:\n{feedback}\n\nRefine the storyboard, addressing this feedback. Return the complete, corrected JSON."}
                ],
                temperature=0.75,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            refined_json = refine_response.choices[0].message.content
            storyboard = json.loads(refined_json)
            print("✅ Storyboard refined\n")
    except Exception as e:
        print(f"⚠️ Warning in supervisor step: {e}. Using original storyboard.")

    # Validate and fix duration_s and asset_query in all scenes
    valid_assets = [f"image_{i}" for i in range(num_assets)] if num_assets > 0 else []
    
    for i, scene in enumerate(storyboard.get('scenes', [])):
        # Fix duration
        if 'duration_s' not in scene or scene['duration_s'] not in [3, 4, 5]:
            scene['duration_s'] = 4  # Default to 4 seconds
        
        # Fix asset_query if using i2v
        if scene.get('visual_type') == 'i2v' and num_assets > 0:
            asset_query = scene.get('asset_query', '')
            # If asset_query doesn't match pattern image_N, fix it
            if asset_query not in valid_assets:
                # Default to image_0 for consistency
                scene['asset_query'] = 'image_0'
                print(f"   ⚠️ Fixed scene {i+1}: Changed asset_query from '{asset_query}' to 'image_0'")
    
    # Limit scenes if too many for available assets
    max_scenes = max(3, num_assets + 2) if num_assets > 0 else 5
    if len(storyboard.get('scenes', [])) > max_scenes:
        storyboard['scenes'] = storyboard['scenes'][:max_scenes]
        print(f"   ⚠️ Limited to {max_scenes} scenes based on {num_assets} assets")
    
    print("="*60)
    print("✅ FINAL STORYBOARD READY")
    print("="*60)
    print(json.dumps(storyboard, indent=2))
    print("="*60)
    
    return storyboard
