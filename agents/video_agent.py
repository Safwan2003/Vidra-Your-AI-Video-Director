# agents/video_agent.py

import os
import time
import requests
from http import HTTPStatus
from dashscope import VideoSynthesis
from core.utils import require_endpoint

def _poll_for_video_result(task_id):
    """Generic polling function for any Dashscope video task."""
    start_time = time.time()
    api_key = os.environ.get('DASHSCOPE_API_KEY')
    poll_url = f"https://dashscope-intl.aliyuncs.com/api/v1/tasks/{task_id}"
    headers = {"Authorization": f"Bearer {api_key}"}

    while True:
        elapsed = int(time.time() - start_time)
        if elapsed > 900:  # 15 min timeout
            print("❌ Timeout waiting for video generation.")
            return None
        
        try:
            response = requests.get(poll_url, headers=headers, timeout=30)
            response.raise_for_status()
            result = response.json()
        except requests.RequestException as e:
            print(f"⚠️ Polling connection issue: {e}. Retrying in 10s...")
            time.sleep(10)
            continue

        task_status = result.get('output', {}).get('task_status', 'UNKNOWN')
        print(f"   Status: {task_status} ({elapsed}s elapsed)")

        if task_status == 'SUCCEEDED':
            # The output key can vary, so we search for it
            video_url = None
            for key in ['video_url', 'video_urls']:
                if key in result.get('output', {}):
                    raw_url = result['output'][key]
                    # The API sometimes returns a list, sometimes a string
                    video_url = raw_url[0] if isinstance(raw_url, list) else raw_url
                    break
            
            if video_url:
                print(f"✅ Video Generated: {video_url}")
                return video_url
            else:
                print(f"❌ Generation Succeeded but no video URL found in output: {result}")
                return None
                
        if task_status in ['FAILED', 'CANCELED']:
            msg = result.get('output', {}).get('message', 'Unknown error')
            print(f"❌ Generation Failed: {msg}")
            return None
            
        time.sleep(10)


def generate_video_scene(scene_plan, asset_map, aspect_ratio="16:9"):
    """
    Generates a single video scene based on the director's plan.
    Can handle image-to-video, text-to-video, and video passthrough.
    """
    if not require_endpoint():
        return None

    visual_type = scene_plan.get('visual_type', 'i2v')
    asset_query = scene_plan.get('asset_query')
    visual_prompt = scene_plan.get('visual_prompt')
    duration_s = scene_plan.get('duration_s', 4)

    # --- Passthrough for user-uploaded videos ---
    if visual_type == 'passthrough':
        video_path = asset_map.get(asset_query)
        if video_path and os.path.exists(video_path):
            print(f"✅ Using user-provided video: {video_path}")
            return video_path
        else:
            print(f"❌ Passthrough video not found for asset '{asset_query}'")
            return None

    # --- Stock video ---
    if visual_type == 'stock_video':
        print(f"⚠️ 'stock_video' is not supported in this version. Falling back to t2v.")
        visual_type = 't2v' # Fallback to text-to-video

    # --- AI Video Generation ---
    # Determine resolution from explicitly supported list for wan2.2 models
    if aspect_ratio == "16:9":
        size = "1280*720"
    elif aspect_ratio == "9:16":
        size = "720*1280"
    else: # 1:1
        size = "960*960"

    params = {
        'prompt': f"{asset_query}, {visual_prompt}",
        'negative_prompt': "distortion, morphing, blurry, text, human face, bad quality, low resolution",
        'size': size
    }

    if visual_type == 'i2v':
        model = 'wan2.1-i2v-plus' # Correct i2v model
        image_path = asset_map.get(asset_query)
        if not image_path or not os.path.exists(image_path):
            print(f"❌ Image asset not found for query '{asset_query}'")
            return None
        params['img_url'] = f"file://{os.path.abspath(image_path)}"
        print(f"🚀 Submitting Image-to-Video task (Model: {model}, Size: {size})...")

    elif visual_type == 't2v':
        model = 'wan2.1-t2v-plus' # User-specified model
        print(f"🚀 Submitting Text-to-Video task (Model: {model}, Size: {size})...")

    else:
        print(f"❌ Unsupported visual_type: {visual_type}")
        return None

    # --- Submit task to Dashscope ---
    try:
        response = VideoSynthesis.call(model=model, **params)
        if response.status_code != HTTPStatus.OK:
            print(f"❌ Submission Error: {response.message} (Code: {response.code})")
            return None
        
        task_id = response.output.task_id
        print(f"⏳ Task submitted (ID: {task_id}). Polling for result...")
        return _poll_for_video_result(task_id)

    except Exception as e:
        print(f"❌ Video generation task submission failed: {e}")
        import traceback; traceback.print_exc()
        return None


def generate_wan_video(*args, **kwargs):
    """[DEPRECATED] This function is kept for legacy compatibility."""
    print("⚠️ WARNING: `generate_wan_video` is deprecated. Use `generate_video_scene` instead.")
    # A simple passthrough to the new function for basic i2v.
    # This is a basic mapping and might not cover all old behaviors perfectly.
    scene_plan = {
        'visual_type': 'i2v',
        'asset_query': 'image_0', # Assume the first image
        'visual_prompt': kwargs.get('prompt', ''),
        'duration_s': kwargs.get('duration_s', 4)
    }
    asset_map = {'image_0': args[0]}
    return generate_video_scene(scene_plan, asset_map, kwargs.get('aspect_ratio', '16:9'))
