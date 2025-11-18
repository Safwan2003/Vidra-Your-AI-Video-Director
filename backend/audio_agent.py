import torch
try:
    from TTS.api import TTS
    HAS_XTTS = True
except ImportError:
    print("⚠️ Coqui TTS not available, using gTTS as fallback")
    from gtts import gTTS as gTTS_fallback
    HAS_XTTS = False

from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import os
import uuid
import numpy as np

# Global variables for models
_tts_model = None
_music_model = None

def get_tts_model():
    """
    Lazy load the TTS model.
    Uses XTTS v2 if available, otherwise falls back to gTTS.
    """
    global _tts_model
    if _tts_model is None and HAS_XTTS:
        print("Loading XTTS v2 model...")
        # XTTS v2 - supports multiple languages and voice cloning
        _tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
        
        if torch.cuda.is_available():
            _tts_model = _tts_model.to("cuda")
            print("TTS model loaded on GPU!")
        else:
            print("TTS model loaded on CPU")
    
    return _tts_model

def get_music_model():
    """
    Lazy load the MusicGen model.
    Uses Meta's MusicGen for background music generation.
    """
    global _music_model
    if _music_model is None:
        print("Loading MusicGen model...")
        # Using medium model (balance of quality and speed)
        # Options: small, medium, large
        _music_model = MusicGen.get_pretrained('facebook/musicgen-medium')
        _music_model.set_generation_params(duration=10)  # 10 second clips
        print("MusicGen model loaded!")
    
    return _music_model

def generate_voiceover(script: str, speaker_wav: str = None, language: str = "en"):
    """
    Generates a voiceover for a given script.
    Uses XTTS v2 if available, otherwise falls back to gTTS.
    
    Args:
        script: The text to convert to speech
        speaker_wav: Optional path to reference audio for voice cloning (XTTS only)
        language: Language code (en, es, fr, de, it, pt, etc.)
    
    Returns:
        Local file path to the generated audio
    """
    print(f"Generating voiceover for: '{script[:50]}...'")
    
    # Output path
    output_dir = "outputs/audio"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"voiceover_{uuid.uuid4()}.mp3" if not HAS_XTTS else f"voiceover_{uuid.uuid4()}.wav"
    filepath = os.path.join(output_dir, filename)
    
    try:
        if HAS_XTTS:
            # Use XTTS v2 for high-quality voice
            tts = get_tts_model()
            if speaker_wav and os.path.exists(speaker_wav):
                print(f"Using voice cloning with reference: {speaker_wav}")
                tts.tts_to_file(
                    text=script,
                    speaker_wav=speaker_wav,
                    language=language,
                    file_path=filepath
                )
            else:
                print("Using default XTTS voice")
                tts.tts_to_file(
                    text=script,
                    language=language,
                    file_path=filepath
                )
        else:
            # Use gTTS as fallback
            print("Using gTTS (Google Text-to-Speech)")
            tts = gTTS_fallback(text=script, lang=language, slow=False)
            tts.save(filepath)
        
        print(f"Voiceover saved to: {filepath}")
        return filepath
    
    except Exception as e:
        print(f"Error generating voiceover: {e}")
        return None

def generate_music(prompt: str, duration: int = 10, temperature: float = 1.0):
    """
    Generates background music based on a prompt using MusicGen.
    
    Args:
        prompt: Description of the music (e.g., "upbeat cinematic background music")
        duration: Length of music in seconds
        temperature: Sampling temperature (higher = more creative, lower = more predictable)
    
    Returns:
        Local file path to the generated audio
    """
    print(f"Generating music for: '{prompt}'")
    
    # Get MusicGen model
    model = get_music_model()
    model.set_generation_params(duration=duration, temperature=temperature)
    
    # Generate music
    print(f"Generating {duration}s of music...")
    descriptions = [prompt]
    wav = model.generate(descriptions, progress=True)
    
    # Save to file
    output_dir = "outputs/audio"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"music_{uuid.uuid4()}"
    filepath = os.path.join(output_dir, filename)
    
    # audio_write saves as filename.wav automatically
    audio_write(
        filepath, 
        wav[0].cpu(), 
        model.sample_rate, 
        strategy="loudness",
        loudness_compressor=True
    )
    
    final_path = filepath + ".wav"
    print(f"Music saved to: {final_path}")
    return final_path

def cleanup_models():
    """
    Free memory by deleting models.
    """
    global _tts_model, _music_model
    
    if _tts_model is not None:
        del _tts_model
        _tts_model = None
        print("TTS model cleaned up")
    
    if _music_model is not None:
        del _music_model
        _music_model = None
        print("MusicGen model cleaned up")
    
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

if __name__ == '__main__':
    # Example usage
    script = "Welcome to VIDRA, the AI-powered video generation system. Create amazing videos from simple text prompts."
    music_prompt = "upbeat cinematic background music"
    
    voiceover_path = generate_voiceover(script)
    music_path = generate_music(music_prompt, duration=15)
    
    print(f"Generated voiceover: {voiceover_path}")
    print(f"Generated music: {music_path}")
