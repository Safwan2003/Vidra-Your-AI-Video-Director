// src/remotion/templates/Pretaa/config.ts

export interface PretaaSceneConfig {
    id: string; // "1", "2"...
    width: number; // usually 1080 or based on request
    height: number;
    frameCount: number; // Number of images in folder
    durationFrames: number; // Render duration (might be longer if slowed down)
    playbackFps: number; // Speed to play 
}

export const PRETAA_SCENES: PretaaSceneConfig[] = [
    { id: '1', width: 1080, height: 1080, frameCount: 65, durationFrames: 405, playbackFps: 5 },    // 13.5s
    { id: '2', width: 1080, height: 1080, frameCount: 31, durationFrames: 192, playbackFps: 5 },     // 6.4s
    { id: '3', width: 1080, height: 1080, frameCount: 23, durationFrames: 214, playbackFps: 4 },     // 7.1s
    { id: '4', width: 1080, height: 1080, frameCount: 26, durationFrames: 161, playbackFps: 5 },     // 5.3s
    { id: '5', width: 1080, height: 1080, frameCount: 23, durationFrames: 143, playbackFps: 5 },     // 4.7s
    { id: '6', width: 1080, height: 1080, frameCount: 18, durationFrames: 167, playbackFps: 3 },     // 5.5s
    { id: '7', width: 1080, height: 1080, frameCount: 168, durationFrames: 521, playbackFps: 10 },   // 17.3s
    { id: '8', width: 1080, height: 1080, frameCount: 74, durationFrames: 344, playbackFps: 6 },     // 11.4s
    { id: '9', width: 1080, height: 1080, frameCount: 24, durationFrames: 223, playbackFps: 3 },     // 7.4s
];

// Calculate start frames
export const getPretaaTimings = () => {
    let currentFrame = 0;
    return PRETAA_SCENES.map(scene => {
        const timing = { ...scene, startFrame: currentFrame };
        currentFrame += scene.durationFrames;
        return timing;
    });
};

export const PRETAA_TOTAL_DURATION = getPretaaTimings().reduce((acc, val) => acc + val.durationFrames, 0); 
