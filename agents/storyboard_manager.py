# agents/storyboard_manager.py

import os
import json
from groq import Groq
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

# --- STYLE PRESETS ---
STYLE_PRESETS = {
    "Cinematic": "Arri Alexa, Anamorphic lens, 2.39:1 aspect ratio, Film grain, Color graded, High dynamic range, Volumetric lighting, 8k resolution.",
    "Tech Minimalist": "Clean, Apple-style advertisement, Soft studio lighting, White/Grey background, Sharp focus, 85mm lens, High key lighting, Modern, Sleek.",
    "High Energy": "Dynamic camera movement, Fast cuts, Vibrant saturation, GoPro Hero style, Wide angle 16mm, Motion blur, Action-packed, High contrast.",
    "Luxury": "Golden hour, Soft focus, Bokeh, Warm tones, Slow motion, Elegant, Expensive texture, Macro details, Leica lens.",
    "Cyberpunk": "Neon lights, Night time, Wet streets, Blue and Pink color palette, Futuristic, Glow effects, High contrast, Blade Runner style.",
    "TV Commercial": "High Key lighting, Bright, Sharp focus, Super clean, White background, 8k, Product photography style, Studio lighting, Commercial look.",
    "SaaS Explainer": "Flat vector art, corporate memphis style, solid colors, no gradients, clean lines, Adobe Illustrator style, 2D animation, minimalist, high contrast, vibrant colors, no shadows, no shading, no bokeh, no photorealism.",
    "Corporate 2D": "Flat 2D vector art, corporate memphis style, clean lines, solid colors, minimal, motion graphics, behance, dribbble, vector illustration, no gradients, flat design."
}

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

def create_storyboard_with_autogen(goal, target_audience, product_desc, num_scenes, num_assets, asset_map, brand_tone="", style_preset="Cinematic", run_coherence_check=True, min_coherence_score=6):
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

    # --- VISUAL POLISH: Force TV Commercial style for Launches to avoid "dark" videos ---
    if "launch" in goal.lower() and style_preset == "Cinematic":
        print("💡 Switching style to 'TV Commercial' for brighter product showcase.")
        style_preset = "TV Commercial"
    # ----------------------------------------------------------------------------------

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

    # --- STEP 0: The Innovator (Agentic Creativity + Smart Selection) ---
    print("🧠 Step 0: Innovator generating creative concepts...")
    
    # Import voice library for selection
    from agents.audio_agent import VOICE_LIBRARY
    
    # Build style selection prompt if needed
    style_selection_prompt = ""
    if style_preset == "✨ AI Auto-Select":
        available_styles = list(STYLE_PRESETS.keys())
        style_selection_prompt = f"""
        
4. **Visual Style Selection**: Choose the BEST visual style from these options:
   {', '.join(available_styles)}
   
   Output format:
   SELECTED_STYLE: [Style Name]
"""
    
    # Build voice selection prompt
    available_voices = list(VOICE_LIBRARY.keys())
    voice_selection_prompt = f"""
    
5. **Voice Selection**: Choose the BEST voice for the narration based on:
   - Brand Tone: {brand_tone}
   - Target Audience: {target_audience}
   
   Available voices: {', '.join(available_voices)}
   
   Output format:
   SELECTED_VOICE: [Voice Key]
"""
    
    innovator_prompt = f"""You are the Visionary Creative Director.
    Your goal: Brainstorm 3 distinct, innovative concepts for a video.
    
    Goal: {goal}
    Product: {product_desc}
    Audience: {target_audience}
    Brand Tone: {brand_tone}
    
    Generate 3 Concepts:
    1. **The Emotional Hook**: Focus on feelings/story.
    2. **The High-Octane Hype**: Focus on speed/energy/visuals.
    3. **The Mystery/Tease**: Focus on curiosity/reveal.
    
    Then, SELECT the best one that fits the goal most uniquely.
    
    Output format:
    SELECTED_CONCEPT: [Name of Concept]
    CONCEPT_DETAILS: [Brief description of the creative direction, mood, and twist]
    {style_selection_prompt}
    {voice_selection_prompt}
    """
    
    creative_concept = "Standard Showcase" # Default
    selected_voice = "male_calm"  # Default
    
    try:
        innovator_response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": innovator_prompt}],
            temperature=0.9 # High temp for creativity
        )
        innovator_output = innovator_response.choices[0].message.content
        print(f"✨ Innovator Output:\n{innovator_output[:200]}...")
        
        # Parse concept
        if "SELECTED_CONCEPT:" in innovator_output:
            creative_concept = innovator_output.split("SELECTED_CONCEPT:")[1].split("\n")[0].strip()
            details = innovator_output.split("CONCEPT_DETAILS:")[1].strip() if "CONCEPT_DETAILS:" in innovator_output else ""
            creative_concept += f" - {details}"
            print(f"🚀 Selected Creative Concept: {creative_concept}")
        
        # Parse style if AI Auto-Select
        if style_preset == "✨ AI Auto-Select" and "SELECTED_STYLE:" in innovator_output:
            ai_selected_style = innovator_output.split("SELECTED_STYLE:")[1].split("\n")[0].strip()
            # Strip markdown formatting (**, *, etc.)
            ai_selected_style = ai_selected_style.replace("**", "").replace("*", "").strip()
            if ai_selected_style in STYLE_PRESETS:
                style_preset = ai_selected_style
                print(f"🎨 AI Selected Style: {style_preset}")
            else:
                style_preset = "Cinematic"  # Fallback
                print(f"⚠️ Invalid style '{ai_selected_style}', using Cinematic")
        
        # Parse voice
        if "SELECTED_VOICE:" in innovator_output:
            ai_selected_voice = innovator_output.split("SELECTED_VOICE:")[1].split("\n")[0].strip()
            # Strip markdown formatting (**, *, etc.)
            ai_selected_voice = ai_selected_voice.replace("**", "").replace("*", "").strip()
            if ai_selected_voice in VOICE_LIBRARY:
                selected_voice = ai_selected_voice
                print(f"🎙️ AI Selected Voice: {selected_voice} ({VOICE_LIBRARY[selected_voice]})")
            else:
                print(f"⚠️ Invalid voice '{ai_selected_voice}', using default")
            
    except Exception as e:
        print(f"⚠️ Innovator failed: {e}. Proceeding with standard concept.")

    # --- STEP 1: Marketing Strategist ---
    print("🤖 Step 1: Marketing Strategist planning narrative...")
    
    # Add explainer-specific instructions if goal is "Explainer Video"
    explainer_instructions = ""
    if "explainer" in goal.lower():
        explainer_instructions = """
        
**EXPLAINER VIDEO MODE ACTIVATED**:
This is an EXPLAINER VIDEO, not a product showcase. Follow this structure:
- **Scene 1 (Hook)**: Start with a QUESTION addressing the pain point ("Are you tired of X?")
- **Scene 2 (Problem)**: Agitate the problem ("Manual X wastes Y hours per week")
- **Scene 3 (Solution)**: Introduce the product as the solution ("Meet [Product]. The [category] that [benefit]")
- **Scene 4-5 (How/Benefits)**: Explain how it works or key benefits
- **Final Scene (CTA)**: Clear call to action ("Start your free trial today")

Use CONVERSATIONAL, EMPATHETIC language. Address the viewer directly ("You know that feeling when...").
Focus on BENEFITS, not features. Make it relatable and human.
"""
    
    strategist_prompt = f"""You are the Chief Marketing Strategist and Art Director.
Your goal: Define the Narrative Structure and the Visual Style Guide.

1. **Narrative**: Plan a video structure with exactly {num_scenes} scenes based on:
   - Goal: {goal}
   - Audience: {target_audience}
   - Product: {product_desc}
   - **Creative Concept (MANDATORY)**: {creative_concept} -> The video MUST follow this unique creative direction.
   {explainer_instructions}

2. **Psychographic Analysis (The "Marketing Brain")**:
   - **Persona**: Who is the viewer? (e.g., "Busy Mom", "Tech Bro", "Fitness Junkie").
   - **Pain Point**: What problem keeps them up at night?
   - **Desire**: What is their dream outcome?
   - **Voice**: What language do they speak? (e.g., "Slang/Emoji", "Professional/Concise", "Warm/Empathetic").

3. **Style Guide**: Define the "Look and Feel" to ensure "Real World" quality.
   - Lighting (e.g., "Golden hour", "Cyberpunk neon", "Soft studio").
   - Color Palette (e.g., "Teal and Orange", "High contrast B&W").
   - Atmosphere (e.g., "Foggy", "Clean", "Chaotic").
   - **Selected Style Preset**: {style_preset} ({STYLE_PRESETS.get(style_preset, "")}) -> YOU MUST INCORPORATE THIS INTO THE VISUAL STYLE.

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
    
    # Get actual voice style from library
    from agents.audio_agent import VOICE_LIBRARY
    voice_style_code = VOICE_LIBRARY.get(selected_voice, "en-US-ChristopherNeural")
    
    director_prompt = f"""You are the Creative Director.
Your goal: Break the Strategist's plan into specific scenes and output the FINAL JSON.

Strategy Plan:
{strategy_plan}

{asset_context}

For each scene, define:
- **Script**: Voiceover (5-15 words). MUST speak directly to the "Persona" defined above using their "Voice". Address their "Pain Point" or "Desire".
- **Action**: What happens?
- **Duration**: MUST be exactly 2 seconds (User Quota Constraint).
- **Visual Prompt**: Detailed cinematic description applying the Style Guide. Include:
  * Subject description
  * Camera Movement (Use 2D terms if SaaS Explainer: "Slide left", "Pan right", "Zoom in", "Static")
  * Render style ("Unreal Engine 5", "Octane Render", "8k", "Cinematic", "Photorealistic" OR "Flat Vector", "2D Illustration")
  * **MANDATORY**: Append these keywords to EVERY visual prompt: "{STYLE_PRESETS.get(style_preset, "")}"

**CRITICAL TYPOGRAPHY RULE**:
- You MUST generate a `kinetic_typography` array for EVERY scene.
- The array MUST have one entry per word in the script.
- Use animation styles: "pop", "grow", "slide_in", "fade".
- Use colors that match the visual style.

Rules:
- If using an uploaded image, use `visual_type='i2v'` and `asset_query='image_X'`.
- If generating from scratch, use `visual_type='t2v'` and asset_query with brief description.
- Scene 1 `start_from_previous_end` MUST be false.
- Duration MUST be between 2 and 8 seconds.

Output Structure (VALID JSON ONLY):
{{
  "style_preset": "{style_preset}",
  "music_prompt": "...",
  "voice_style": "{voice_style_code}",
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
  "style_preset": "...",
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
        if duration != 2:
            print(f"⚠️ Scene {scene.get('scene')} duration {duration}s adjusted to 2s for quota.")
            scene['duration_s'] = 2
        
        # Auto-fix asset_query naming if needed
        asset_query = scene.get('asset_query', '')
        if asset_query and not asset_query.startswith('image_') and scene.get('visual_type') == 'i2v':
            # Try to find matching image
            for i in range(num_assets):
                if f"image_{i}" in asset_map:
                    scene['asset_query'] = f"image_{i}"
                    print(f"✅ Auto-fixed asset_query for scene {scene.get('scene')} to image_{i}")
                    break
    
    # Optional coherence check BEFORE refinement (raw AI output)
    if run_coherence_check:
        is_coherent, coherence_report = validate_storyboard_coherence(
            storyboard_json,
            client=client,
            model=model,
            goal=goal,
            target_audience=target_audience,
            product_desc=product_desc,
            brand_tone=brand_tone
        )
        if not is_coherent and coherence_report and coherence_report.get('score', 10) < min_coherence_score:
            print(f"⚠️ Coherence score {coherence_report.get('score')} < {min_coherence_score}. Attempting automatic improvement...")
            improved = improve_storyboard_json(
                original_json=storyboard_json,
                coherence_report=coherence_report,
                client=client,
                model=model,
                goal=goal,
                product_desc=product_desc,
                brand_tone=brand_tone
            )
            if improved:
                storyboard_json = improved
                print("✅ Storyboard improved for coherence.")
            else:
                print("⚠️ Automatic improvement failed; proceeding with original JSON.")

    # --- Contextual Refinement ---
    storyboard_json = refine_storyboard_context(
        storyboard_json,
        goal=goal,
        target_audience=target_audience,
        product_desc=product_desc,
        brand_tone=brand_tone,
        num_assets=num_assets
    )

    print("✅ Storyboard validation + contextual refinement complete")
    return storyboard_json


def validate_storyboard_coherence(storyboard_json, client, model, goal, target_audience, product_desc, brand_tone):
    """Use LLM to produce a coherence assessment of the storyboard.

    Returns (is_coherent: bool, report: dict | None)
    JSON schema of report:
    {
      "score": 0-10,
      "is_coherent": true/false,
      "issues": [..],
      "suggestions": [..],
      "strengths": [..]
    }
    """
    try:
        scenes = storyboard_json.get('scenes', [])
        compact_listing = "\n".join([
            f"Scene {s.get('scene')}: script='{s.get('script','')}' type={s.get('visual_type')}" for s in scenes
        ])
        prompt = f"""Evaluate this video storyboard for a product launch.
Goal: {goal}
Audience: {target_audience}
Product: {product_desc}
Tone: {brand_tone}

Scenes:\n{compact_listing}

Assess:
1. Narrative flow (logical progression)
2. Product positioning clarity
3. Consistency of tone & energy
4. Call-to-action effectiveness
5. Visual diversity and asset usage appropriateness

Return STRICT JSON ONLY:
{{
  "score": <number 0-10>,
  "is_coherent": <true|false>,
  "issues": ["..."],
  "suggestions": ["..."],
  "strengths": ["..."]
}}"""
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        content = response.choices[0].message.content
        start = content.find('{')
        end = content.rfind('}') + 1
        if start == -1 or end == 0:
            print("⚠️ Coherence response lacked JSON; skipping coherence check.")
            return True, None
        report = json.loads(content[start:end])
        print(f"🧪 Coherence score: {report.get('score')} / 10")
        if not report.get('is_coherent'):
            print("Issues:", report.get('issues'))
        return report.get('is_coherent', True), report
    except Exception as e:
        print(f"⚠️ Coherence validation failed: {e}")
        return True, None


def improve_storyboard_json(original_json, coherence_report, client, model, goal, product_desc, brand_tone):
    """Attempt automatic improvement of storyboard based on coherence issues.
    Returns improved JSON or None.
    """
    try:
        issues_text = "\n".join(coherence_report.get('issues', []))
        suggestions_text = "\n".join(coherence_report.get('suggestions', []))
        prompt = f"""Improve this storyboard JSON while preserving overall intent.
Goal: {goal}
Product: {product_desc}
Tone: {brand_tone}

Original JSON:
{json.dumps(original_json, indent=2)}

Issues:
{issues_text}

Suggestions:
{suggestions_text}

Rules:
- Keep number of scenes the same.
- Maintain duration_s within [2, 8].
- Preserve any image_0 usage for i2v scenes.
- Strengthen CTA clarity.
- Ensure each script is <= 8 words and product referenced at least once.
- Return ONLY valid JSON.
"""
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        content = response.choices[0].message.content
        start = content.find('{')
        end = content.rfind('}') + 1
        if start == -1 or end == 0:
            print("⚠️ Improvement response lacked JSON; aborting improvement.")
            return None
        improved = json.loads(content[start:end])
        return improved
    except Exception as e:
        print(f"⚠️ Storyboard improvement failed: {e}")
        return None


def refine_storyboard_context(storyboard_json, goal, target_audience, product_desc, brand_tone, num_assets):
    """Refine AI storyboard to ensure strong alignment with provided context."""

    if not storyboard_json or 'scenes' not in storyboard_json:
        return storyboard_json

    scenes = storyboard_json['scenes']
    if not isinstance(scenes, list):
        return storyboard_json

    product_handle = product_desc.split()[0] if product_desc else "Product"

    def _generate_kt_from_script(script):
        # Helper to generate kinetic typography from a script string
        words = script.replace(",", "").replace(".", "").replace("!", "").replace("?", "").split()
        kt = []
        animation_styles = ["pop", "grow", "slide_in"]
        colors = ["white", "cyan", "orange", "teal"]
        for i, word in enumerate(words):
            kt.append({
                "word": word,
                "animation_style": animation_styles[i % len(animation_styles)],
                "color": colors[i % len(colors)]
            })
        return kt

    # --- Phase 1: Structural & Asset Integrity ---
    
    # Assign phases based on number of scenes
    num_scenes = len(scenes)
    if num_scenes == 1:
        desired_structure = ["showcase"] # Single scene teaser
    elif num_scenes == 2:
        desired_structure = ["reveal", "cta"]  # For 2 scenes: focus on product + action
    elif num_scenes == 3:
        desired_structure = ["hook", "reveal", "cta"]  # Classic 3-act
    elif num_scenes == 4:
        desired_structure = ["hook", "reveal", "benefit", "cta"]
    else:  # 5+ scenes
        desired_structure = ["hook", "reveal", "benefit", "social_proof", "cta"]
    
    for idx, scene in enumerate(scenes):
        scene['phase'] = desired_structure[idx] if idx < len(desired_structure) else "extra"

    # CRITICAL: Enforce Anchor Image Continuity for Product Launches
    if num_assets > 0 and ("launch" in goal.lower() or "showcase" in goal.lower()):
        print(f"🔧 Product Launch/Showcase detected - Activating Anchor Image Continuity.")
        
        # Define camera moves for variety using the SAME image
        camera_moves = {
            'reveal': "Camera slowly pushes in, 50mm lens, shallow depth of field. Focus on product details.",
            'benefit': "Camera slowly pans right across the product, revealing sleek curves. Cinematic lighting.",
            'cta': "Camera orbits slowly around the product. Hero shot. High contrast, dramatic lighting.",
            'social_proof': None # Keep social proof as t2v (people using it)
        }

        for s_idx, scene in enumerate(scenes):
            phase = scene.get('phase', 'extra')
            
            # If this phase has a defined camera move for the anchor image
            if phase in camera_moves and camera_moves[phase]:
                scene['visual_type'] = 'i2v'
                scene['asset_query'] = 'image_0' # Always anchor to the main product image
                
                # Construct prompt: Camera Move + Product Desc + Style
                tone_desc = f", {brand_tone.lower()}" if brand_tone else ""
                base_prompt = f"{camera_moves[phase]} {product_desc}, professional studio lighting. Cinematic{tone_desc}, 8k, Octane Render, Photorealistic."
                
                # Append style preset if not already there (it might be added by Director, but we overwrite here so we must re-add)
                # Actually, the Director's prompt is overwritten here. We should try to preserve the style keywords if possible.
                # But for safety, let's just ensure the base quality is high.
                scene['visual_prompt'] = base_prompt
                print(f"   - Scene {s_idx+1} ({phase}): Anchored to image_0 with move '{camera_moves[phase][:20]}...'")

    # --- Phase 2: Content Refinement with Context ---

    if not storyboard_json.get('music_prompt'):
        storyboard_json['music_prompt'] = f"{brand_tone or 'Energetic'} upbeat modern launch soundtrack"

    for i, scene in enumerate(scenes):
        visual_prompt = scene.get('visual_prompt', '').strip()
        phase = scene.get('phase')
        
        # Get the AI-generated script
        ai_script = scene.get('script', '').strip()
        
        # Only use fallback templates if AI script is missing or too generic
        use_fallback = (
            not ai_script or 
            len(ai_script.split()) < 3 or  # Too short
            ai_script.lower() in ['...', 'tbd', 'placeholder']  # Placeholder text
        )
        
        if use_fallback:
            # Generate contextually appropriate fallback scripts
            product_name = product_handle.capitalize()
            if phase == 'reveal':
                script = f"Meet {product_name}. Your new energy."
            elif phase == 'hook' and i == 0:
                script = f"Ready to elevate your energy?"
            elif phase == 'benefit':
                script = f"Fuel your active lifestyle. Stay energized."
            elif phase == 'social_proof':
                script = f"Join {target_audience.split(',')[0]} who love it."
            elif phase == 'cta':
                script = f"Grab {product_name} today. Feel the rush."
            else:
                script = f"Experience {product_handle}."
            print(f"⚠️ Scene {i+1}: Using fallback script (AI script was: '{ai_script}')")
        else:
            # Keep the AI's creative script
            script = ai_script
            print(f"✅ Scene {i+1}: Preserving AI script: '{script[:50]}...'")


        # --- MARKETING INTELLIGENCE: Hook & CTA Optimization ---
        if phase == 'hook' or (i == 0 and phase == 'reveal'):
            # Rule: Hooks must be short (< 6 words) and punchy
            if len(script.split()) > 6:
                # Fallback to punchy defaults if AI wrote a novel
                script = f"Discover {product_handle}." if "discover" not in script.lower() else script
                print(f"⚡ Optimized Hook script: {script}")
            
            # Visual Boost for Hook
            if "dynamic" not in visual_prompt.lower():
                visual_prompt += ", dynamic camera movement, fast motion"

        if phase == 'cta':
            # Rule: CTA must start with a verb or be a clear command
            if not any(script.lower().startswith(v) for v in ['get', 'buy', 'grab', 'shop', 'visit', 'order', 'try']):
                 script = f"Try {product_handle} now."
                 print(f"⚡ Optimized CTA script: {script}")
        # -------------------------------------------------------

        # Ensure visual prompts include product description keywords for t2v scenes
        if scene.get('visual_type') == 't2v':
            # Make sure t2v scenes are contextually relevant
            if phase == 'benefit':
                visual_prompt = f"Dynamic montage of {target_audience} enjoying active lifestyle - running, cycling, gym workout. Quick cuts, energetic pacing. Bright natural lighting, 24mm wide lens. {brand_tone} atmosphere. Unreal Engine 5, 8k, Cinematic."
            elif phase == 'cta':
                visual_prompt = f"Eye-level shot of {product_desc} on display with blurred background of {target_audience} in action. Bokeh effect, 85mm lens, warm color grade. Call-to-action friendly. {brand_tone} vibe. Octane Render, 4k, Photorealistic."
            elif phase == 'social_proof':
                visual_prompt = f"Group of diverse {target_audience} sharing and enjoying {product_handle}, authentic social moment. Natural lighting, handheld camera feel, 35mm lens. {brand_tone} energy. Cinematic, 8k."

        # Inject brand tone into visual prompt if missing
        if brand_tone:
            tone_tokens = [t.strip() for t in brand_tone.split(',') if t.strip()]
            missing_tokens = [t for t in tone_tokens if t.lower() not in visual_prompt.lower()]
            if missing_tokens and visual_prompt:
                visual_prompt += f"; tone: {', '.join(missing_tokens[:2])}"

        # --- AUDIENCE TRIGGERS (The "Targeting Brain") ---
        audience_lower = target_audience.lower()
        if "gen z" in audience_lower or "tiktok" in audience_lower or "young" in audience_lower:
             if "pov" not in visual_prompt.lower():
                 visual_prompt += ", POV shot, held by hand, authentic, social media style"
                 print("🎯 Audience Trigger: Gen Z -> Applied POV style")
        elif "executive" in audience_lower or "business" in audience_lower:
             if "minimal" not in visual_prompt.lower():
                 visual_prompt += ", Minimalist, clean lines, premium office background, high key lighting"
                 print("🎯 Audience Trigger: Business -> Applied Minimalist style")
        elif "parent" in audience_lower or "family" in audience_lower:
             if "warm" not in visual_prompt.lower():
                 visual_prompt += ", Warm lighting, soft focus, cozy home atmosphere, golden hour"
                 print("🎯 Audience Trigger: Family -> Applied Warm style")
        # -------------------------------------------------

        # Set continuity flags
        scene['start_from_previous_end'] = i != 0

        # Clamp duration defensively
        if not (2 <= scene.get('duration_s', 4) <= 8):
            scene['duration_s'] = 4
        
        # --- Final step: Update script and regenerate kinetic typography ---
        scene['script'] = script
        scene['visual_prompt'] = visual_prompt
        scene['kinetic_typography'] = _generate_kt_from_script(script)

    # Final transition
    if scenes:
        scenes[-1]['transition_to_next_scene'] = 'none'

    storyboard_json['scenes'] = scenes
    # Ensure style_preset is set (if lost during parsing)
    if 'style_preset' not in storyboard_json:
         # Try to infer or default
         storyboard_json['style_preset'] = "Cinematic" 
    
    return storyboard_json
