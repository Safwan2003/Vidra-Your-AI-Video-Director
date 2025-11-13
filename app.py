import gradio as gr
import os
import traceback

# Import the agent functions from the src directory
from src.storyboard_agent import run_storyboard_agent
from src.art_director_agent import run_art_director_agent
from src.animation_agent import run_animation_agent
from src.voiceover_agent import run_voiceover_agent
from src.editor_agent import run_editor_agent

# --- Main Orchestration Function ---

def generate_video(prompt):
    """
    This is the main function that orchestrates the AI Film Crew.
    """
    print("--- Video Generation Process Started ---")
    
    try:
        # 1. Storyboard Agent
        storyboard = run_storyboard_agent(prompt)
        
        video_clips = []
        audio_clips = []
        
        # 2. Generate assets for each scene
        for scene_data in storyboard.get("scenes", []):
            scene_number = scene_data['scene']
            script = scene_data['script']
            visual_prompt = scene_data['visual_prompt']
            motion_prompt = scene_data['motion_prompt']
            
            print(f"\n--- Processing Scene {scene_number} ---")
            
            # For this complete version, we will skip the Art Director agent
            # and feed the visual prompt directly to the Animation agent,
            # as AnimateDiff generates the image and animation in one step.
            # image_asset = run_art_director_agent(visual_prompt, scene_number)
            
            # Animation Agent
            # We combine visual and motion prompts for a richer animation input
            animation_prompt = f"{visual_prompt}, {motion_prompt}"
            video_asset = run_animation_agent(animation_prompt, scene_number)
            video_clips.append(video_asset)
            
            # Voiceover Agent
            audio_asset = run_voiceover_agent(script, scene_number)
            audio_clips.append(audio_asset)

        # 3. Editor Agent
        print("\n--- Finalizing Video ---")
        final_video_path = run_editor_agent(video_clips, audio_clips)
        
        print("--- Video Generation Process Finished ---")
        
        return final_video_path

    except Exception as e:
        print(f"!!! An error occurred during video generation: {e}")
        traceback.print_exc()
        # Optionally, return an error message to the user through Gradio
        # For now, we just print to the console and return None
        return None

# --- Gradio User Interface ---

with gr.Blocks(css="footer {display: none !important}") as demo:
    gr.Markdown("# Vidra: Your AI Video Director")
    gr.Markdown("Enter a prompt to generate a short, animated video. This may take several minutes as it involves multiple AI models.")
    
    with gr.Row():
        prompt_input = gr.Textbox(label="Your Video Idea", placeholder="e.g., A launch video for a new productivity app.", lines=3)
    
    generate_button = gr.Button("Generate Video")
    
    with gr.Row():
        video_output = gr.Video(label="Generated Video")

    generate_button.click(
        fn=generate_video,
        inputs=prompt_input,
        outputs=video_output
    )

if __name__ == "__main__":
    # share=True creates a public link.
    # In Colab, this is how you'll access the UI.
    demo.launch(share=True, debug=True)