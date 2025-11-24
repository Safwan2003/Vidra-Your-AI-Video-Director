# app.py

import streamlit as st
from core.utils import setup_api_keys, setup_dashscope, get_generated_paths
from agents.storyboard_manager import create_storyboard_with_autogen, STYLE_PRESETS
from agents.video_agent import generate_scenes_parallel
from agents.audio_agent import generate_storyboard_audio
from core.editor import assemble_storyboard_video
import os
import json
from datetime import datetime

# --- Page Config ---
st.set_page_config(
    page_title="VIDRA: AI Video Director",
    page_icon="🎬",
    layout="wide"
)

# --- Session State Management ---
if "storyboard" not in st.session_state:
    st.session_state.storyboard = None
if "asset_map" not in st.session_state:
    st.session_state.asset_map = {}
if "generated_video_paths" not in st.session_state:
    st.session_state.generated_video_paths = []

# --- Main App ---
st.title("🎬 VIDRA: AI-Powered Video Director")
st.markdown("Define your goal, choose a style, and let the AI direct your masterpiece.")

# --- Sidebar for Inputs ---
with st.sidebar:
    st.header("1. Strategy & Style")
    video_goal = st.selectbox(
        "Select Video Goal", 
        ["Product/Feature Launch", "Explainer Video", "Benefits Showcase", "Social Media Hype"], 
        index=0
    )
    
    # NEW: Style Selector
    style_names = ["✨ AI Auto-Select"] + list(STYLE_PRESETS.keys())
    selected_style = st.selectbox("Visual Style", style_names, index=0)
    
    style_desc = "The AI will choose the best style for your product." if selected_style == "✨ AI Auto-Select" else STYLE_PRESETS[selected_style]
    st.caption(f"✨ *{style_desc}*")

    target_audience = st.text_input("Target Audience", "Fitness enthusiasts, bodybuilders, health-conscious")
    product_description = st.text_input("Product Description", "Premium Whey Protein Powder, Chocolate flavor, sleek black tub with gold label")
    brand_tone = st.text_input("Brand Tone", "Strong, motivating, premium")

    st.header("2. Visual Assets")
    uploaded_files = st.file_uploader(
        "Upload Images or Video Clips", 
        type=["png", "jpg", "jpeg", "mp4"],
        accept_multiple_files=True
    )
    
    # Process assets immediately to populate session state
    if uploaded_files:
        os.makedirs("user_assets", exist_ok=True)
        for i, file in enumerate(uploaded_files):
            file_ext = os.path.splitext(file.name)[1]
            asset_key = f"image_{i}" if file_ext.lower() in ['.png', '.jpg', '.jpeg'] else f"video_{i}"
            asset_path = os.path.join("user_assets", f"{asset_key}{file_ext}")
            with open(asset_path, "wb") as f:
                f.write(file.getbuffer())
            st.session_state.asset_map[asset_key] = asset_path
        st.success(f"✅ Loaded {len(uploaded_files)} assets")

    st.header("3. Configuration")
    aspect_ratio = st.selectbox("Aspect Ratio", ["16:9", "9:16", "1:1"], index=0)
    num_scenes = st.slider("Number of Scenes", min_value=2, max_value=5, value=3)
    use_music = st.checkbox("Generate Background Music", True)

    st.header("4. Brand Kit")
    brand_logo_file = st.file_uploader("Upload Brand Logo (PNG)", type=["png"])
    brand_font_file = st.file_uploader("Upload Custom Font (TTF/OTF)", type=["ttf", "otf"])

    # Save brand assets
    if brand_logo_file:
        os.makedirs("brand_assets", exist_ok=True)
        with open(os.path.join("brand_assets", "logo.png"), "wb") as f: f.write(brand_logo_file.getbuffer())
    if brand_font_file:
        os.makedirs("brand_assets", exist_ok=True)
        with open(os.path.join("brand_assets", f"custom_font{os.path.splitext(brand_font_file.name)[1]}"), "wb") as f: f.write(brand_font_file.getbuffer())

# --- Workflow Step 1: Plan Storyboard ---
st.divider()
col1, col2 = st.columns([1, 3])

with col1:
    st.subheader("Step 1: Planning")
    if st.button("📝 Create Storyboard", use_container_width=True):
        with st.status("🤖 AI Director is planning your video...", expanded=True) as status:
            setup_api_keys()
            setup_dashscope()
            
            num_assets = len(st.session_state.asset_map)
            
            plan = create_storyboard_with_autogen(
                goal=video_goal,
                target_audience=target_audience,
                product_desc=product_description,
                num_scenes=num_scenes,
                num_assets=num_assets,
                asset_map=st.session_state.asset_map,
                brand_tone=brand_tone,
                style_preset=selected_style
            )
            
            if plan:
                st.session_state.storyboard = plan
                status.update(label="✅ Storyboard created!", state="complete")
            else:
                status.update(label="❌ Planning failed.", state="error")

# --- Workflow Step 2: Edit & Generate ---
if st.session_state.storyboard:
    with col2:
        st.subheader("Step 2: Review & Edit")
        
        # --- Storyboard Editor ---
        with st.expander("✏️ Edit Storyboard (Click to Expand)", expanded=True):
            sb = st.session_state.storyboard
            
            # Global Settings
            sb['music_prompt'] = st.text_input("Music Prompt", sb.get('music_prompt', ''))
            
            # Scene Editor
            updated_scenes = []
            for i, scene in enumerate(sb['scenes']):
                st.markdown(f"**Scene {i+1}**")
                c1, c2 = st.columns([1, 2])
                with c1:
                    scene['script'] = st.text_area(f"Script (Scene {i+1})", scene.get('script', ''), height=100)
                with c2:
                    scene['visual_prompt'] = st.text_area(f"Visual Prompt (Scene {i+1})", scene.get('visual_prompt', ''), height=100)
                
                # Advanced options
                with st.popover(f"⚙️ Advanced (Scene {i+1})"):
                    scene['duration_s'] = st.slider(f"Duration (s)", 3, 5, scene.get('duration_s', 4), key=f"dur_{i}")
                    scene['visual_type'] = st.selectbox(f"Type", ["i2v", "t2v", "passthrough"], index=["i2v", "t2v", "passthrough"].index(scene.get('visual_type', 't2v')), key=f"type_{i}")
                
                st.divider()
                updated_scenes.append(scene)
            
            sb['scenes'] = updated_scenes
            sb['scenes'] = updated_scenes
            st.session_state.storyboard = sb
            
            # Save Project Button
            st.download_button(
                "💾 Save Project (JSON)", 
                data=json.dumps(st.session_state.storyboard, indent=2), 
                file_name=f"vidra_project_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )

        # --- Generation Button ---
        if st.button("🚀 Generate Video (Parallel)", type="primary", use_container_width=True):
            
            # 1. Video Generation
            with st.status("🎥 Generating Scenes & Audio...", expanded=True) as status:
                setup_api_keys()
                setup_dashscope()
                paths = get_generated_paths() # Ensure directories exist
                
                # Parallel Video
                video_results = generate_scenes_parallel(
                    storyboard_plan=st.session_state.storyboard,
                    asset_map=st.session_state.asset_map,
                    aspect_ratio=aspect_ratio,
                    status_container=status
                )
                
                # Download/Process Videos
                video_paths = []
                for i, res in enumerate(video_results):
                    if res and res.startswith("http"):
                        # Download logic
                        import requests
                        path = os.path.join(paths["video_temp"], f"scene_{i+1}.mp4")
                        with open(path, 'wb') as f: f.write(requests.get(res).content)
                        video_paths.append(path)
                    elif res:
                        video_paths.append(res)
                    else:
                        status.write(f"❌ Scene {i+1} failed.")
                        st.stop()
                
                # 2. Audio Generation
                status.write("🎙️ Generating Audio...")
                audio_res = generate_storyboard_audio(st.session_state.storyboard, use_music, status=status)
                
                # 3. Assembly
                # 3. Assembly
                status.write("🎞️ Assembling Final Video...")
                brand_logo = os.path.join("brand_assets", "logo.png") if brand_logo_file else None
                brand_font = None # Logic for font path if needed
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_filename = f"vidra_output_{timestamp}.mp4"
                
                final_path = assemble_storyboard_video(
                    storyboard_plan=st.session_state.storyboard,
                    video_urls=video_paths,
                    voiceover_path=audio_res['voiceover_path'],
                    music_path=audio_res.get('music_path'),
                    full_word_timings=audio_res['word_timings'],
                    brand_logo_path=brand_logo,
                    output_filename=output_filename,
                    status=status
                )
                
                if final_path:
                    status.update(label="✅ Video Complete!", state="complete")
                    st.balloons()
                    
                    # Display
                    st.video(final_path)
                    with open(final_path, "rb") as f:
                        st.download_button("📥 Download Video", f, file_name="vidra_masterpiece.mp4")
                else:
                    status.update(label="❌ Assembly failed.", state="error")

else:
    with col2:
        st.info("👈 Start by creating a storyboard in Step 1.")
