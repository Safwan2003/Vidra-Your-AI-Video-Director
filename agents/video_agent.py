# agents/video_agent.py

import os
import time
import requests
from http import HTTPStatus
from dashscope import VideoSynthesis
from core.utils import require_endpoint

def _poll_for_video_result(task_id, status=None):
    """Generic polling function for any Dashscope video task."""
    start_time = time.time()
    api_key = os.environ.get('DASHSCOPE_API_KEY')
    if not api_key:
        if status: status.update(label="❌ DASHSCOPE_API_KEY not found.", state="error")
        print("❌ DASHSCOPE_API_KEY not found.")
        return None
        
    poll_url = f"https://dashscope-intl.aliyuncs.com/api/v1/tasks/{task_id}"
    headers = {"Authorization": f"Bearer {api_key}"}

    while True:
        elapsed = int(time.time() - start_time)
        if elapsed > 900:  # 15 min timeout
            message = "❌ Timeout waiting for video generation."
            if status: status.update(label=message, state="error")
            print(message)
            return None
        
        try:
            response = requests.get(poll_url, headers=headers, timeout=30)
            response.raise_for_status()
            result = response.json()
        except requests.RequestException as e:
            message = f"⚠️ Polling connection issue: {e}. Retrying in 10s..."
            if status: status.update(label=message)
            print(message)
            time.sleep(10)
            continue

        task_status = result.get('output', {}).get('task_status', 'UNKNOWN')
        status_message = f"Status: {task_status} ({elapsed}s elapsed)"
        if status: status.update(label=status_message)
        print(f"   {status_message}")

        if task_status == 'SUCCEEDED':
            video_url = None
            output_data = result.get('output', {})
            # The API returns 'video_urls' for t2v and 'video_url' for i2v
            if 'video_urls' in output_data:
                video_url = output_data['video_urls'][0] if output_data['video_urls'] else None
            elif 'video_url' in output_data:
                video_url = output_data['video_url']

            if video_url:
                if status: status.update(label="✅ Video URL received. Ready for download.")
                print(f"✅ Video Generated: {video_url}")
                return video_url
            else:
                message = f"❌ Generation Succeeded but no video URL found in output: {result}"
                if status: status.update(label=message, state="error")
                print(message)
                return None
                
        if task_status in ['FAILED', 'CANCELED']:
            msg = result.get('output', {}).get('message', 'Unknown error')
            message = f"❌ Generation Failed: {msg}"
            if status: status.update(label=message, state="error")
            print(message)
            return None
            
        time.sleep(10)


def generate_video_scene(scene_plan, asset_map, aspect_ratio="16:9", status=None, last_frame_path=None):
    """
    Generates a single video scene based on the director's plan.
    Can handle image-to-video, text-to-video, and video passthrough.
    
    Args:
        scene_plan (dict): The scene definition from the storyboard.
        asset_map (dict): Map of asset names to file paths.
        aspect_ratio (str): Video aspect ratio.
        status (st.status): Streamlit status object for updates.
        last_frame_path (str, optional): Path to the last frame of the previous scene, used for continuity.
    """
    if not require_endpoint():
        if status:
            status.update(label="❌ Cannot reach video generation endpoint", state="error")
        return None

    visual_type = scene_plan.get('visual_type', 'i2v')
    asset_query = scene_plan.get('asset_query')
    visual_prompt = scene_plan.get('visual_prompt')

    # --- Passthrough for user-uploaded videos ---
    if visual_type == 'passthrough':
        video_path = asset_map.get(asset_query)
        if video_path and os.path.exists(video_path):
            message = f"✅ Using user-provided video: {video_path}"
            if status: status.update(label=message)
            print(message)
            return video_path
        else:
            message = f"❌ Passthrough video not found for asset '{asset_query}'"
            if status: status.update(label=message, state="error")
            print(message)
            return None

    # --- Stock video ---
    if visual_type == 'stock_video':
        message = "⚠️ 'stock_video' not supported. Falling back to t2v."
        if status: status.update(label=message)
        print(message)
        visual_type = 't2v'

    # --- AI Video Generation ---
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

    # Override for continuity if last_frame_path is provided
    if last_frame_path and os.path.exists(last_frame_path):
        print(f"🔄 CONTINUITY MODE: Using last frame from previous scene as input.")
        visual_type = 'i2v' # Force i2v
        image_path = last_frame_path
        params['prompt'] = f"Continuing from previous scene: {visual_prompt}" # Adjust prompt context
    
    elif visual_type == 'i2v':
        image_path = asset_map.get(asset_query)
    
    else:
        image_path = None

    if visual_type == 'i2v':
        model = 'wan2.1-i2v-plus'
        
        if not image_path or not os.path.exists(image_path):
            message = f"❌ Image asset not found for query '{asset_query}'"
            if status: status.update(label=message, state="error")
            print(message)
            return None
            
        params['img_url'] = f"file://{os.path.abspath(image_path)}"
        message = f"🚀 Submitting Image-to-Video task (Model: {model}, Size: {size})..."
        if status: status.update(label=message)
        print(message)

    elif visual_type == 't2v':
        model = 'wan2.1-t2v-plus'
        message = f"🚀 Submitting Text-to-Video task (Model: {model}, Size: {size})..."
        if status: status.update(label=message)
        print(message)

    else:
        message = f"❌ Unsupported visual_type: {visual_type}"
        if status: status.update(label=message, state="error")
        print(message)
        return None

    # --- Submit task to Dashscope ---
    try:
        response = VideoSynthesis.call(model=model, **params)
        if response.status_code != HTTPStatus.OK:
            message = f"❌ Submission Error: {response.message} (Code: {response.code})"
            if status: status.update(label=message, state="error")
            print(message)
            return None
        
        task_id = response.output.task_id
        message = f"⏳ Task submitted (ID: {task_id}). Polling for result..."
        if status: status.update(label=message)
        print(message)
        return _poll_for_video_result(task_id, status)

    except Exception as e:
        message = f"❌ Video generation task submission failed: {e}"
        if status: status.update(label=message, state="error")
        print(message)
        import traceback; traceback.print_exc()
        return None


def generate_wan_video(*args, **kwargs):
    """[DEPRECATED] This function is kept for legacy compatibility."""
    print("⚠️ WARNING: `generate_wan_video` is deprecated. Use `generate_video_scene` instead.")
    status = kwargs.get('status')
    scene_plan = {
        'visual_type': 'i2v',
        'asset_query': 'image_0', # Assume the first image
        'visual_prompt': kwargs.get('prompt', ''),
    }
    asset_map = {'image_0': args[0]}
    return generate_video_scene(scene_plan, asset_map, kwargs.get('aspect_ratio', '16:9'), status=status)
