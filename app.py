# app.py

import streamlit as st
from core.utils import setup_api_keys, setup_dashscope, get_generated_paths
from agents.storyboard_manager import create_storyboard_with_autogen
from agents.video_agent import generate_video_scene
from agents.audio_agent import generate_storyboard_audio
from core.editor import assemble_storyboard_video
import os

# --- Page Config ---
st.set_page_config(
    page_title="VIDRA: AI Video Strategist",
    page_icon="🎬",
    layout="wide"
)

# --- Main App ---
st.title("🎬 VIDRA: AI-Powered Video Generator")
st.markdown("Define your goal and audience, and let the AI strategist plan and create your video.")

# --- Sidebar for Inputs ---
with st.sidebar:
    st.header("1. Narrative & Goal")
    video_goal = st.selectbox(
        "Select Video Goal", 
        ["Product/Feature Launch", "Explainer Video", "Benefits Showcase"], 
        index=0 # Product/Feature Launch
    )
    target_audience = st.text_input("Target Audience", "Young adults aged 18-35, active lifestyle, social media users")
    product_description = st.text_input("Product Description", "Refreshing energy drink can with a vibrant, modern design")
    brand_tone = st.text_input("Brand Tone", "Bold, energetic, and exhilarating")

    st.header("2. Visual Assets")
    uploaded_files = st.file_uploader(
        "Upload Images or Video Clips (e.g., for Problem, Solution, CTA)", 
        type=["png", "jpg", "jpeg", "mp4"],
        accept_multiple_files=True
    )

    st.header("3. Video Options")
    aspect_ratio = st.selectbox("Aspect Ratio", ["16:9", "9:16", "1:1"], index=0)
    num_scenes = st.slider("Number of Scenes", min_value=2, max_value=5, value=3, help="How many scenes in your video?")

    st.header("4. Music Options")
    use_music = st.checkbox("Generate Background Music", True)
    music_backend = st.selectbox("Music Generation Backend", ["auto", "musicgen", "synth"], index=0, help="'auto' uses GPU if available, otherwise falls back to faster synth.")
    music_quality = st.selectbox("Music Generation Quality", ["balanced", "fast", "high"], index=0)
    music_model = st.text_input("Music Generation Model", "facebook/musicgen-small")

    st.header("5. Brand Kit (Optional)")
    brand_logo_file = st.file_uploader("Upload Brand Logo (PNG)", type=["png"])
    brand_font_file = st.file_uploader("Upload Custom Font (TTF/OTF)", type=["ttf", "otf"])

    generate_button = st.button("Generate Full Video", use_container_width=True)

# --- Main Content Area ---
if generate_button:
    # --- Ensure all necessary directories exist ---
    os.makedirs("brand_assets", exist_ok=True)
    os.makedirs("user_assets", exist_ok=True)
    generated_paths = get_generated_paths()
    
    # Setup API keys
    with st.spinner("Setting up API keys and Dashscope..."):
        setup_api_keys()
        setup_dashscope()
    
    # Save uploaded assets
    asset_map = {}
    if uploaded_files:
        st.info(f"📁 Processing {len(uploaded_files)} uploaded file(s)...")
        for i, file in enumerate(uploaded_files):
            file_ext = os.path.splitext(file.name)[1]
            asset_key = f"image_{i}" if file_ext.lower() in ['.png', '.jpg', '.jpeg'] else f"video_{i}"
            asset_path = os.path.join("user_assets", f"{asset_key}{file_ext}")
            with open(asset_path, "wb") as f:
                f.write(file.getbuffer())
            asset_map[asset_key] = asset_path
            st.success(f"✅ Saved: {asset_key}")
    
    # Save brand assets
    brand_logo_path = None
    brand_font_path = None
    if brand_logo_file:
        brand_logo_path = os.path.join("brand_assets", "logo.png")
        with open(brand_logo_path, "wb") as f:
            f.write(brand_logo_file.getbuffer())
        st.success("✅ Brand logo saved")
    
    if brand_font_file:
        brand_font_path = os.path.join("brand_assets", f"custom_font{os.path.splitext(brand_font_file.name)[1]}")
        with open(brand_font_path, "wb") as f:
            f.write(brand_font_file.getbuffer())
        st.success("✅ Custom font saved")
    
    # Step 1: AI Director Planning
    st.header("🤖 Step 1: AI Director Planning")
    with st.spinner("AI Director is planning the video storyboard..."):
        num_assets = len(uploaded_files) if uploaded_files else 0
        
        # Show asset info
        if num_assets > 0:
            st.info(f"📸 Using {num_assets} uploaded image(s) - will be reused consistently across scenes")
        else:
            st.warning("⚠️ No images uploaded - AI will generate videos from text descriptions (less consistent)")
        
        storyboard_plan = create_storyboard_with_autogen(
            goal=video_goal,
            target_audience=target_audience,
            product_desc=product_description,
            num_assets=num_assets,
            asset_map=asset_map
        )
        
        if not storyboard_plan:
            st.error("❌ Storyboard planning failed. Please check the logs.")
            st.stop()
    
    st.success("✅ Storyboard plan created!")
    with st.expander("📋 View Storyboard Plan", expanded=True):
        st.json(storyboard_plan)
    
    # Step 2: Generate Videos for Each Scene
    st.header("🎥 Step 2: Generating Video Scenes")
    video_urls = []
    for i, scene in enumerate(storyboard_plan['scenes']):
        scene_num = i + 1
        with st.spinner(f"Generating Scene {scene_num}/{len(storyboard_plan['scenes'])}..."):
            video_url = generate_video_scene(scene, asset_map, aspect_ratio)
            if video_url:
                video_urls.append(video_url)
                st.success(f"✅ Scene {scene_num} generated")
            else:
                st.error(f"❌ Scene {scene_num} generation failed")
                st.stop()
    
    # Step 3: Generate Audio
    st.header("🎙️ Step 3: Generating Audio")
    with st.spinner("Generating voiceover and background music..."):
        audio_result = generate_storyboard_audio(
            storyboard_plan,
            use_music=use_music,
            music_backend=music_backend,
            music_quality=music_quality,
            music_model=music_model
        )
        
        if not audio_result or not audio_result['voiceover_path']:
            st.error("❌ Audio generation failed")
            st.stop()
    
    st.success("✅ Audio generated!")
    
    # Step 4: Assemble Final Video
    st.header("🎞️ Step 4: Assembling Final Video")
    with st.spinner("Assembling all scenes into final video..."):
        final_video_path = assemble_storyboard_video(
            storyboard_plan=storyboard_plan,
            video_urls=video_urls,
            voiceover_path=audio_result['voiceover_path'],
            music_path=audio_result.get('music_path'),
            full_word_timings=audio_result['word_timings'],
            output_filename=f"{product_description.replace(' ', '_')}_storyboard.mp4",
            brand_logo_path=brand_logo_path,
            brand_font_path=brand_font_path
        )
        
        if not final_video_path:
            st.error("❌ Video assembly failed")
            st.stop()
    
    # Success!
    st.balloons()
    st.success("🎉 Video Generation Complete!")
    
    # Display the final video
    st.video(final_video_path)
    
    # Download button
    with open(final_video_path, "rb") as f:
        st.download_button(
            label="📥 Download Video",
            data=f,
            file_name=os.path.basename(final_video_path),
            mime="video/mp4"
        )
