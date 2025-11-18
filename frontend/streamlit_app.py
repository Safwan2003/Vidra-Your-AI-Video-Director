import streamlit as st
import requests
import time
import os
from pathlib import Path

st.set_page_config(
    page_title="VIDRA - AI Video Generator",
    page_icon="🎬",
    layout="wide"
)

st.title("🎬 VIDRA - AI Video Generator")
st.markdown("### Transform your ideas into stunning videos with AI")

# Sidebar with info
with st.sidebar:
    st.header("ℹ️ About VIDRA")
    st.markdown("""
    **VIDRA** is an AI-powered video generation system that creates videos from text prompts.
    
    **Process:**
    1. 📝 Create storyboard
    2. 🖼️ Generate images
    3. 🎬 Animate scenes
    4. 🎵 Add voice & music
    5. ✂️ Edit final video
    
    **Tips:**
    - Be specific in your prompt
    - First video takes 8-12 minutes
    - Shorter videos are faster
    """)
    
    st.markdown("---")
    st.markdown("**System Status:**")
    
    # Check backend connection
    try:
        response = requests.get("http://localhost:8000/", timeout=2)
        if response.status_code == 200:
            st.success("✅ Backend Online")
        else:
            st.error("❌ Backend Error")
    except:
        st.error("❌ Backend Offline")

# Main input form
st.markdown("---")
col1, col2 = st.columns([2, 1])

with col1:
    with st.form("video_generation_form"):
        prompt = st.text_area(
            "📝 Enter your video prompt:",
            "A peaceful sunrise over mountains with birds flying across a golden sky",
            height=100,
            help="Describe the video you want to create. Be specific about scenes, mood, and actions."
        )
        
        col_a, col_b = st.columns(2)
        with col_a:
            style = st.selectbox(
                "🎨 Select video style:",
                ["cinematic", "anime", "cartoon", "realistic"],
                index=0,
                help="Choose the visual style for your video"
            )
        with col_b:
            duration = st.slider(
                "⏱️ Duration (seconds):",
                min_value=10,
                max_value=60,
                value=30,
                step=10,
                help="Longer videos take more time to generate"
            )
        
        submitted = st.form_submit_button("🚀 Generate Video", use_container_width=True)

with col2:
    st.markdown("### 📊 Expected Time")
    scenes = duration // 8
    estimated_time = scenes * 2 + 5  # Rough estimate
    st.metric("Scenes", scenes)
    st.metric("Est. Time", f"{estimated_time}-{estimated_time+5} min")
    st.info(f"💡 Your video will have ~{scenes} scenes")

if submitted:
    st.markdown("---")
    st.info("🚀 Sending request to backend...")
    
    try:
        # Make a request to the FastAPI backend
        response = requests.post(
            "http://localhost:8000/generate_video",
            json={"prompt": prompt, "style": style, "duration": duration},
            timeout=10
        )
        response.raise_for_status()

        task_info = response.json()
        task_id = task_info.get("task_id")
        
        st.success(f"✅ Video generation started!")
        st.code(f"Task ID: {task_id}", language=None)

        # Create UI elements for status updates
        st.markdown("### 📊 Generation Progress")
        
        progress_container = st.container()
        with progress_container:
            progress_bar = st.progress(0)
            status_placeholder = st.empty()
            progress_text = st.empty()
        
        storyboard_container = st.container()
        
        # Progress mapping
        percentage_map = {
            "PENDING": 5,
            "STARTED": 15,
            "PROGRESS": 50,
            "SUCCESS": 100,
            "FAILURE": 0
        }

        # Polling loop
        poll_count = 0
        max_polls = 600  # 20 minutes max (2s intervals)
        
        while poll_count < max_polls:
            time.sleep(2)
            poll_count += 1
            
            try:
                status_response = requests.get(
                    f"http://localhost:8000/status/{task_id}",
                    timeout=5
                )
                status_response.raise_for_status()
                status_data = status_response.json()
            except Exception as e:
                st.error(f"Error checking status: {e}")
                time.sleep(5)
                continue

            current_state = status_data.get("state")
            current_status_message = status_data.get("status", "Processing...")
            result = status_data.get("result")

            # Calculate progress percentage
            percentage_completed = percentage_map.get(current_state, 0)
            
            # More granular progress for PROGRESS state
            if current_state == "PROGRESS":
                if "image" in current_status_message.lower():
                    percentage_completed = 30
                elif "animat" in current_status_message.lower():
                    percentage_completed = 60
                elif "audio" in current_status_message.lower():
                    percentage_completed = 85
                elif "edit" in current_status_message.lower():
                    percentage_completed = 95
            
            # Update UI
            progress_bar.progress(percentage_completed / 100)
            
            # Status with emoji
            status_emoji = {
                "PENDING": "⏳",
                "STARTED": "🚀",
                "PROGRESS": "⚙️",
                "SUCCESS": "✅",
                "FAILURE": "❌"
            }.get(current_state, "🔄")
            
            status_placeholder.info(f"{status_emoji} **{current_state}**: {current_status_message}")
            progress_text.text(f"Progress: {percentage_completed}%")

            # Display storyboard if available
            if result and "storyboard" in result:
                with storyboard_container:
                    st.markdown("---")
                    st.subheader("📋 Generated Storyboard")
                    
                    # Show audio files if available
                    cols = st.columns(2)
                    if result["storyboard"].get("voiceover_url"):
                        with cols[0]:
                            vo_path = result["storyboard"]["voiceover_url"]
                            if os.path.exists(vo_path):
                                st.audio(vo_path, format="audio/wav")
                                st.caption("🎤 Voiceover")
                    
                    if result["storyboard"].get("music_url"):
                        with cols[1]:
                            music_path = result["storyboard"]["music_url"]
                            if os.path.exists(music_path):
                                st.audio(music_path, format="audio/wav")
                                st.caption("🎵 Background Music")
                    
                    st.markdown("### 🎬 Scenes")
                    
                    # Display scenes in a grid
                    for i, scene in enumerate(result["storyboard"]["scenes"]):
                        with st.expander(f"Scene {scene['id']}: {scene.get('key_visual', 'Scene')[:50]}...", expanded=(i==0)):
                            col1, col2 = st.columns([1, 2])
                            
                            with col1:
                                # Show image if available
                                if scene.get("image_url") and os.path.exists(scene["image_url"]):
                                    st.image(scene["image_url"], use_column_width=True)
                                
                                # Show video if available
                                if scene.get("video_url") and os.path.exists(scene["video_url"]):
                                    st.video(scene["video_url"])
                            
                            with col2:
                                st.markdown(f"**📝 Description:**")
                                st.write(scene.get("description", "N/A"))
                                st.markdown(f"**🎭 Script:**")
                                st.info(scene.get("script", "N/A"))

            # Check for completion
            if current_state == "SUCCESS":
                progress_bar.progress(1.0)
                st.balloons()
                st.success("🎉 Video generation completed successfully!")
                
                # Display final video
                if result and result.get("final_video_url"):
                    final_path = result["final_video_url"]
                    if os.path.exists(final_path):
                        st.markdown("---")
                        st.markdown("## 🎬 Final Video")
                        st.video(final_path)
                        
                        # Download button
                        with open(final_path, "rb") as f:
                            st.download_button(
                                label="⬇️ Download Video",
                                data=f,
                                file_name=f"vidra_{task_id}.mp4",
                                mime="video/mp4",
                                use_container_width=True
                            )
                    else:
                        st.warning(f"Video file not found at: {final_path}")
                
                break
                
            elif current_state == "FAILURE":
                st.error(f"❌ Video generation failed: {current_status_message}")
                break
        
        if poll_count >= max_polls:
            st.error("⏰ Generation timed out. Please try again with a shorter video.")

    except requests.exceptions.ConnectionError:
        st.error("❌ Could not connect to the FastAPI backend.")
        st.info("Please ensure the backend is running at http://localhost:8000")
        st.code("uvicorn backend.main:app --host 0.0.0.0 --port 8000", language="bash")
    except requests.exceptions.Timeout:
        st.error("⏰ Request timed out. The backend might be overloaded.")
    except requests.exceptions.RequestException as e:
        st.error(f"❌ An error occurred: {e}")
        st.info("Please check the backend logs for details.")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: gray;'>
        <p>Made with ❤️ by the VIDRA team | Powered by AI</p>
        <p><small>Using: Stable Diffusion 3, Stable Video Diffusion, XTTS, MusicGen, FFmpeg</small></p>
    </div>
    """,
    unsafe_allow_html=True
)
