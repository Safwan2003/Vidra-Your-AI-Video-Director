import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import soundfile as sf
import os

# Global variables for caching models
processor = None
model = None
vocoder = None
embeddings_dataset = None

def run_voiceover_agent(script: str, scene_number: int) -> str:
    """
    Voiceover Agent: Uses SpeechT5 to generate a voiceover for a scene.
    """
    global processor, model, vocoder, embeddings_dataset
    
    print(f"Voiceover Agent: Generating audio for scene {scene_number} with script: '{script}'")

    # --- Model and Pipeline Setup ---
    if processor is None:
        print("Voiceover Agent: Loading SpeechT5 models...")
        print("This may take a moment on the first run.")
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
        model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts").to(device)
        vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan").to(device)
        
        # Load xvector containing speaker's voice characteristics from a dataset
        embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
        
        print("Voiceover Agent: SpeechT5 models loaded.")

    # --- Audio Generation ---
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        inputs = processor(text=script, return_tensors="pt").to(device)
        
        # A specific speaker embedding from the dataset
        speaker_embeddings = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0).to(device)
        
        speech = model.generate_speech(inputs["input_ids"], speaker_embeddings, vocoder=vocoder)
        
        # --- Save the Audio ---
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        audio_path = os.path.join(output_dir, f"scene_{scene_number}_audio.wav")
        
        sf.write(audio_path, speech.cpu().numpy(), samplerate=16000)
        print(f"Voiceover Agent: Audio for scene {scene_number} saved to {audio_path}")
        
        return audio_path
        
    except Exception as e:
        print(f"Voiceover Agent Error: An unexpected error occurred: {e}")
        raise
