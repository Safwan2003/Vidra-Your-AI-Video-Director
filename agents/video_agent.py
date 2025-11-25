# agents/video_agent.py

import os
import time
import requests
import concurrent.futures
from http import HTTPStatus
from dashscope import VideoSynthesis
from core.utils import require_endpoint

def _get_api_key(status=None):
    api_key = os.environ.get('DASHSCOPE_API_KEY')
    if not api_key:
        msg = "❌ DASHSCOPE_API_KEY not found."
        if status: status.update(label=msg, state="error")
        print(msg)
        return None
    return api_key

def submit_video_task(scene_plan, asset_map, aspect_ratio="16:9", last_frame_path=None, style_preset="Cinematic"):
    """
    Submits a video generation task to Dashscope and returns the task_id.
    Does NOT wait for completion.
    """
    if not require_endpoint():
        return {"error": "Cannot reach endpoint"}

    visual_type = scene_plan.get('visual_type', 'i2v')
    asset_query = scene_plan.get('asset_query')
    visual_prompt = scene_plan.get('visual_prompt')

    # --- Passthrough ---
    if visual_type == 'passthrough':
        video_path = asset_map.get(asset_query)
        if video_path and os.path.exists(video_path):
            return {"status": "SUCCEEDED", "video_url": video_path, "is_passthrough": True}
        return {"error": f"Passthrough video not found: {asset_query}"}

    # --- Setup Params ---
    if aspect_ratio == "16:9": size = "1280*720"
    elif aspect_ratio == "9:16": size = "720*1280"
    else: size = "960*960"

    params = {
        'prompt': f"{asset_query}, {visual_prompt}",
    }
    # --- Style-Specific Prompt Tuning ---
    negative_prompt = "distortion, morphing, blurry, text, human face, bad quality, low resolution"
    
    if style_preset == "SaaS Explainer":
        # Force 2D Vector Style
        if "flat" not in params['prompt'].lower():
            params['prompt'] += ", flat 2d vector art, clean lines, minimalist, corporate memphis, adobe illustrator style, no gradients"
        negative_prompt += ", photorealistic, 3d render, shading, shadows, bokeh, depth of field, realistic texture, noise, grain"
    
    elif style_preset == "Corporate 2D":
        # Strict 2D Vector Style (WhatAStory.agency look)
        if "flat" not in params['prompt'].lower():
            params['prompt'] += ", flat 2d vector art, corporate memphis style, clean lines, solid colors, minimal, motion graphics, behance, dribbble, vector illustration, no gradients, flat design"
        negative_prompt += ", photorealistic, 3d, shading, shadows, gradients, texture, noise, grain, detail, realistic, bokeh, depth of field, complex background"

    params['negative_prompt'] = negative_prompt
    params['size'] = size

    # Continuity / Image Setup
    image_path = None
    if last_frame_path and os.path.exists(last_frame_path):
        visual_type = 'i2v'
        image_path = last_frame_path
        params['prompt'] = f"Continuing from previous scene: {visual_prompt}"
    elif visual_type == 'i2v':
        image_path = asset_map.get(asset_query)
        if not image_path or not os.path.exists(image_path):
            return {"error": f"Image asset not found: {asset_query}"}

    # Model Selection - Using Wan 2.5 for better illustration/anime style support
    if visual_type == 'i2v':
        model = 'wan2.5-i2v-preview'
        params['img_url'] = f"file://{os.path.abspath(image_path)}"
    elif visual_type == 't2v':
        model = 'wan2.5-t2v-preview'
    else:
        return {"error": f"Unsupported visual_type: {visual_type}"}

    # Submit
    try:
        print(f"🚀 Submitting task for {visual_type} (Model: {model})...")
        response = VideoSynthesis.call(model=model, **params)
        if response.status_code != HTTPStatus.OK:
            return {"error": f"Submission Error: {response.message}"}
        
        return {"task_id": response.output.task_id, "status": "PENDING"}
    except Exception as e:
        return {"error": f"Submission Exception: {str(e)}"}

def check_task_status(task_id):
    """Checks status of a single task."""
    api_key = _get_api_key()
    if not api_key: return {"status": "FAILED", "error": "No API Key"}

    url = f"https://dashscope-intl.aliyuncs.com/api/v1/tasks/{task_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        task_status = result.get('output', {}).get('task_status', 'UNKNOWN')
        
        if task_status == 'SUCCEEDED':
            output = result.get('output', {})
            video_url = output.get('video_url') or (output.get('video_urls')[0] if output.get('video_urls') else None)
            return {"status": "SUCCEEDED", "video_url": video_url}
            
        elif task_status in ['FAILED', 'CANCELED']:
            msg = result.get('output', {}).get('message', 'Unknown error')
            return {"status": "FAILED", "error": msg}
            
        return {"status": task_status} # PENDING, RUNNING
        
    except Exception as e:
        return {"status": "UNKNOWN", "error": str(e)}

def generate_scenes_parallel(storyboard_plan, asset_map, aspect_ratio="16:9", status_container=None):
    """
    Generates all scenes in parallel.
    Updates a Streamlit status container if provided.
    """
    scenes = storyboard_plan['scenes']
    style_preset = storyboard_plan.get('style_preset', 'Cinematic')
    tasks = {} # scene_index -> task_info
    results = [None] * len(scenes)
    
    # 1. Submit all tasks
    if status_container: status_container.write("🚀 Submitting all video generation tasks...")
    
    for i, scene in enumerate(scenes):
        # Handle continuity: If scene N depends on N-1, we might need to wait?
        # For now, parallelization assumes NO continuity dependency for speed, 
        # OR we only parallelize independent scenes.
        # The original code had continuity logic. If we want parallel, we sacrifice continuity 
        # derived from the *generated* video of the previous scene.
        # However, we can still use continuity if we have the *source* image.
        # If 'start_from_previous_end' is true, we technically can't parallelize that step 
        # until the previous one is done.
        # Compromise: We will parallelize all scenes. If a scene requested continuity, 
        # we check if we can fulfill it (unlikely if parallel). We'll log a warning and proceed without it.
        
        if scene.get('start_from_previous_end'):
            print(f"⚠️ Scene {i+1} requested continuity, but parallel generation skips this to save time.")
        
        task_info = submit_video_task(scene, asset_map, aspect_ratio, style_preset=style_preset)
        tasks[i] = task_info
        
        if task_info.get('error'):
            print(f"❌ Scene {i+1} failed to submit: {task_info['error']}")
            results[i] = None
        elif task_info.get('is_passthrough'):
            print(f"✅ Scene {i+1} is passthrough.")
            results[i] = task_info['video_url']
            del tasks[i] # No polling needed
        else:
            print(f"⏳ Scene {i+1} submitted (ID: {task_info['task_id']})")

    # 2. Poll Loop
    active_tasks = tasks.copy()
    start_time = time.time()
    
    while active_tasks:
        if time.time() - start_time > 900: # 15 min timeout
            print("❌ Global timeout reached.")
            break
            
        completed_indices = []
        for i, info in active_tasks.items():
            task_id = info['task_id']
            status_res = check_task_status(task_id)
            
            current_status = status_res['status']
            
            # Update UI log
            if status_container:
                # We can't easily update specific lines in a status container without keeping track of elements.
                # For now, we just print to console/logs.
                pass

            print(f"Scene {i+1}: {current_status}")
            
            if current_status == 'SUCCEEDED':
                results[i] = status_res['video_url']
                completed_indices.append(i)
                if status_container: status_container.write(f"✅ Scene {i+1} Ready!")
            elif current_status == 'FAILED':
                print(f"❌ Scene {i+1} Failed: {status_res.get('error')}")
                completed_indices.append(i)
                if status_container: status_container.write(f"❌ Scene {i+1} Failed.")
        
        for i in completed_indices:
            del active_tasks[i]
            
        if active_tasks:
            time.sleep(5) # Wait before next poll cycle

    return results

# Legacy wrapper for backward compatibility if needed
def generate_video_scene(scene_plan, asset_map, aspect_ratio="16:9", status=None, last_frame_path=None, style_preset="Cinematic"):
    """Legacy synchronous wrapper."""
    task = submit_video_task(scene_plan, asset_map, aspect_ratio, last_frame_path, style_preset=style_preset)
    if task.get('error'):
        if status: status.update(label=f"Error: {task['error']}", state="error")
        return None
    if task.get('is_passthrough'):
        return task['video_url']
    
    task_id = task['task_id']
    if status: status.update(label=f"Polling task {task_id}...")
    
    # Simple poll loop
    while True:
        res = check_task_status(task_id)
        if res['status'] == 'SUCCEEDED':
            return res['video_url']
        if res['status'] == 'FAILED':
            if status: status.update(label=f"Failed: {res.get('error')}", state="error")
            return None
        time.sleep(5)
