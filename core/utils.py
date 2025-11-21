# src/utils.py

import os
import socket
import dashscope

def setup_api_keys():
    """
    Load API keys from a .env file.

    Raises:
        ValueError: If the API keys are not found in the environment.
    """
    from dotenv import load_dotenv
    load_dotenv()

    dashscope_api_key = os.getenv("DASHSCOPE_API_KEY")
    groq_api_key = os.getenv("GROQ_API_KEY")
    pexels_api_key = os.getenv("PEXELS_API_KEY")

    if not all([dashscope_api_key, groq_api_key, pexels_api_key]):
        raise ValueError("API keys for Dashscope, Groq, and Pexels must be set in a .env file.")

    os.environ['DASHSCOPE_API_KEY'] = dashscope_api_key
    os.environ['GROQ_API_KEY'] = groq_api_key
    os.environ['PEXELS_API_KEY'] = pexels_api_key
    
    print("✅ API Keys configured from .env file.")

def setup_dashscope():
    """Set up the dashscope API key and base URL."""
    dashscope.api_key = os.environ.get('DASHSCOPE_API_KEY')
    dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'
    print("✅ Endpoint set to International (Singapore).")

def check_endpoint(host="dashscope-intl.aliyuncs.com", timeout=5):
    """Return True if DNS resolves and TCP connect succeeds to host:443."""
    try:
        ip = socket.gethostbyname(host)
        with socket.create_connection((ip, 443), timeout=timeout):
            return True
    except Exception:
        return False

def require_endpoint():
    """Check for endpoint connectivity and print a message if it fails."""
    if not check_endpoint():
        print("❌ Network/DNS issue: Cannot resolve or reach dashscope-intl.aliyuncs.com:443")
        print("   Suggestions: \\n   - Check internet connectivity\\n   - Disable restrictive VPN/Firewall\\n   - Try: ping dashscope-intl.aliyuncs.com\\n   - If persistent, test from another network")
        return False
    return True

def get_generated_paths():
    """
    Returns a dictionary of paths for generated content and ensures directories exist.
    """
    base_dir = "generated_content"
    audio_dir = os.path.join(base_dir, "audio")
    video_temp_dir = os.path.join(base_dir, "video_temp")
    final_videos_dir = os.path.join(base_dir, "final_videos")

    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(video_temp_dir, exist_ok=True)
    os.makedirs(final_videos_dir, exist_ok=True)

    return {
        "base": base_dir,
        "audio": audio_dir,
        "video_temp": video_temp_dir,
        "final_videos": final_videos_dir
    }

def extract_last_frame(video_path, output_path):
    """
    Extracts the last frame of a video and saves it as an image.
    
    Args:
        video_path (str): Path to the input video file.
        output_path (str): Path to save the extracted image.
        
    Returns:
        str: The path to the saved image, or None if failed.
    """
    from moviepy.editor import VideoFileClip
    try:
        print(f"🖼️ Extracting last frame from {video_path}...")
        with VideoFileClip(video_path) as clip:
            # Capture the very last frame
            # We subtract a tiny amount to ensure we don't go out of bounds
            last_frame_time = max(0, clip.duration - 0.1)
            clip.save_frame(output_path, t=last_frame_time)
        
        if os.path.exists(output_path):
            print(f"✅ Last frame saved to {output_path}")
            return output_path
        else:
            print(f"❌ Failed to save last frame to {output_path}")
            return None
    except Exception as e:
        print(f"❌ Error extracting last frame: {e}")
        return None
