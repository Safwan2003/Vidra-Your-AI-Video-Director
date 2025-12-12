import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const start = async () => {
    console.log('🎬 Starting Video Render...');

    // 1. Bundle the Remotion project
    // The entry point is the file calling registerRoot()
    const entryPoint = path.join(process.cwd(), 'src', 'remotion', 'index.ts');

    console.log('📦 Bundling project...');
    const bundled = await bundle({
        entryPoint,
        // CRITICAL: Serve the "public" folder so staticFile() works correctly
        publicDir: path.join(process.cwd(), 'public'),
    });

    // 2. Read the "Plan" input (In a real app, this comes from the DB or API)
    // For this MVP, we might need a way to pass the plan. 
    // We'll mock it or read from a temp file 'latest-plan.json' if it exists.
    let inputProps = {};
    try {
        const planPath = path.join(process.cwd(), 'latest-plan.json');
        if (fs.existsSync(planPath)) {
            const planData = fs.readFileSync(planPath, 'utf8');
            inputProps = { plan: JSON.parse(planData) };
            console.log('📄 Using latest-plan.json');
        } else {
            console.warn('⚠️ No latest-plan.json found. Rendering with default props.');
        }
    } catch (e) {
        console.error('Error reading plan:', e);
    }

    // 3. Select the composition
    const compositionId = 'MainVideo';

    console.log(`🎥 Fetching composition ${compositionId}...`);
    const composition = await selectComposition({
        serveUrl: bundled,
        id: compositionId,
        inputProps,
    });

    // 4. Render the video
    // Use a fixed name or timestamp? Timestamp is safer for now.
    const outputLocation = path.join(process.cwd(), 'out', `Vidra_Render_${Date.now()}.mp4`);
    console.log(`🚀 Rendering to ${outputLocation}...`);

    // Ensure output dir exists
    if (!fs.existsSync(path.dirname(outputLocation))) {
        fs.mkdirSync(path.dirname(outputLocation), { recursive: true });
    }

    await renderMedia({
        composition,
        serveUrl: bundled,
        codec: 'h264',
        outputLocation,
        inputProps,
        // Optimize for speed/quality
        concurrency: os.cpus().length,
    });

    console.log('✅ Render done!');
};

start();
