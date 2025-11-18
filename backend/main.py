from fastapi import FastAPI
from pydantic import BaseModel
from celery import Celery

# Initialize FastAPI app
app = FastAPI()

# Initialize Celery
celery_app = Celery(
    "vidra_tasks",
    broker="redis://localhost:6379/0",  # Replace with your Redis broker URL
    backend="redis://localhost:6379/0"   # Replace with your Redis backend URL
)

class VideoRequest(BaseModel):
    prompt: str
    style: str = "cinematic"
    duration: int = 60 # seconds

from backend.storyboard_agent import generate_storyboard
from backend.image_agent import generate_image
from backend.animation_agent import animate_image
from backend.audio_agent import generate_voiceover, generate_music
from backend.editor_agent import create_final_video

@celery_app.task(bind=True)
def generate_video_task(self, prompt: str, style: str, duration: int):
    """
    Celery task to generate a video.
    Phase 6: Final Editor
    
    Args:
        prompt: User's video description
        style: Visual style
        duration: Duration in seconds
    """
    self.update_state(state='STARTED', meta={'status': 'Generating storyboard...'})
    print(f"Received video generation request for prompt: {prompt}")
    print(f"Style: {style}, Duration: {duration}s")

    # 1. Storyboard Agent
    storyboard = generate_storyboard(prompt, style, duration)
    self.update_state(state='PROGRESS', meta={'status': 'Storyboard generated.', 'storyboard': storyboard})

    # 2. Image Generation Agent
    self.update_state(state='PROGRESS', meta={'status': 'Generating images...', 'storyboard': storyboard})
    for i, scene in enumerate(storyboard["scenes"]):
        self.update_state(state='PROGRESS', meta={'status': f'Generating image for scene {i+1}/{len(storyboard["scenes"])}...', 'storyboard': storyboard})
        scene["image_url"] = generate_image(scene["key_visual"], style)
        self.update_state(state='PROGRESS', meta={'status': f'Image for scene {i+1} generated.', 'storyboard': storyboard})

    self.update_state(state='PROGRESS', meta={'status': 'All images generated.', 'storyboard': storyboard})

    # 3. Animation Agent
    self.update_state(state='PROGRESS', meta={'status': 'Animating scenes...', 'storyboard': storyboard})
    for i, scene in enumerate(storyboard["scenes"]):
        self.update_state(state='PROGRESS', meta={'status': f'Animating scene {i+1}/{len(storyboard["scenes"])}...', 'storyboard': storyboard})
        scene["video_url"] = animate_image(scene["image_url"])
        self.update_state(state='PROGRESS', meta={'status': f'Animation for scene {i+1} generated.', 'storyboard': storyboard})
    
    self.update_state(state='PROGRESS', meta={'status': 'All scenes animated.', 'storyboard': storyboard})

    # 4. Audio Agent
    self.update_state(state='PROGRESS', meta={'status': 'Generating audio...', 'storyboard': storyboard})
    storyboard["voiceover_url"] = generate_voiceover(" ".join([scene["script"] for scene in storyboard["scenes"]]))
    storyboard["music_url"] = generate_music(f"{style} background music")
    self.update_state(state='PROGRESS', meta={'status': 'Audio generated.', 'storyboard': storyboard})

    # 5. Editor Agent
    self.update_state(state='PROGRESS', meta={'status': 'Editing video...'})
    final_video_url = create_final_video(storyboard)
    self.update_state(state='PROGRESS', meta={'status': 'Final video created.', 'storyboard': storyboard, 'final_video_url': final_video_url})

    return {"status": "completed", "message": f"Video for '{prompt}' generated successfully!", "storyboard": storyboard, "final_video_url": final_video_url}

@app.post("/generate_video")
async def generate_video(video_request: VideoRequest):
    # Pass individual parameters instead of Pydantic model (Celery serialization fix)
    task = generate_video_task.delay(
        video_request.prompt,
        video_request.style,
        video_request.duration
    )
    return {"message": "Video generation started", "task_id": task.id}

@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    task = celery_app.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'status': task.info.get('status', 'Processing...'),
            'result': task.info.get('result', None)
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        # Something went wrong in the backend
        response = {
            'state': task.state,
            'status': str(task.info),  # this is the exception raised
        }
    return response

@app.get("/")
def read_root():
    return {"message": "Welcome to VIDRA FastAPI backend!"}
