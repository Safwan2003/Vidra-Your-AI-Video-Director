import Groq from "groq-sdk";
import { VideoPlan, SceneType, ProjectBrief } from "../types";

// Initialize Groq Client
const getGroqClient = (apiKey: string) => {
  return new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
};

// What a Story Style Guidelines


// Probabilistic scene type selection
const selectSceneTypes = (clipCount: number) => {
  const hook = Math.random() > 0.4 ? 'kinetic_text' : 'device_showcase';
  const empathy = Math.random() > 0.5 ? 'ui_mockup' : (Math.random() > 0.6 ? 'data_visualization' : 'device_showcase');
  const response = 'device_showcase'; // Always showcase for response
  const overcome = Math.random() > 0.6 ? 'data_visualization' : 'device_showcase';
  const finale = 'cta_finale';

  return { hook, empathy, response, overcome, finale };
};

// Industry-specific context injection
const detectIndustry = (description: string): string => {
  const lower = description.toLowerCase();

  if (lower.match(/fintech|payment|banking|finance|crypto|trading/)) {
    return "Fintech: Include currency symbols ($, €), graph visualizations, security badges, transaction flows";
  }
  if (lower.match(/health|medical|doctor|patient|clinic|hospital/)) {
    return "Healthcare: Add medical icons (heart, pulse), HIPAA badges, patient data visualizations, trust elements";
  }
  if (lower.match(/ecommerce|shop|store|retail|cart|product/)) {
    return "E-commerce: Show shopping carts, product cards, reviews/stars, checkout flows, inventory";
  }
  if (lower.match(/productivity|task|project|collaboration|team/)) {
    return "Productivity: Display task lists, calendars, team avatars, notification badges, progress trackers";
  }
  if (lower.match(/education|learning|course|student|teacher/)) {
    return "Education: Include book icons, progress bars, certificates, student profiles, lesson modules";
  }
  if (lower.match(/analytics|data|insight|dashboard|metric/)) {
    return "Analytics: Emphasize charts, graphs, KPI cards, data tables, trend lines, heatmaps";
  }

  return "Generic SaaS: Use versatile icons, clean dashboards, generic metric visualizations";
};



import { ARCHETYPES, NARRATIVE_FRAMEWORKS } from "../src/constants";

export const generateVideoPlan = async (brief: ProjectBrief, template: string, apiKey: string, model: string): Promise<VideoPlan> => {
  const groq = getGroqClient(apiKey);

  // 1. Creative Director Agent: Select Strategy
  // Analyze brief to pick Archetype and Framework
  const isHype = brief.tone === 'Hype' || brief.targetAudience.includes('Gen Z');
  const isCorporate = brief.tone === 'Professional' || brief.description.toLowerCase().includes('enterprise') || brief.description.toLowerCase().includes('corporate');

  let selectedArchetype: keyof typeof ARCHETYPES = 'isometric_world';
  let selectedFramework: keyof typeof NARRATIVE_FRAMEWORKS = 'saas_standard';

  if (isHype) {
    selectedArchetype = 'kinetic_typo';
    selectedFramework = 'hype_cycle';
  } else if (isCorporate) {
    selectedArchetype = 'neo_glass';
    selectedFramework = 'visionary';
  }

  const visualStyle = ARCHETYPES[selectedArchetype];
  const narrative = NARRATIVE_FRAMEWORKS[selectedFramework];

  // 3. Detect Industry
  const industryContext = detectIndustry(brief.description);

  console.log(`🤖 Creative Director: Selected ${visualStyle.name} + ${narrative.name}`);

  // Check if we have recorded footage
  const clipCount = brief.recordedClips?.length || 0;
  const recordingContext = clipCount > 0
    ? `USER HAS PROVIDED ${clipCount} RECORDED CLIPS. You MUST incorporate them using 'customMedia'.`
    : '';

  const systemPrompt = `
    You are Vidra, the AI Creative Director at "What a Story" Agency.
    
    MISSION: Create a JSON Video Plan.
    
    CREATIVE STRATEGY (STRICT ENFORCEMENT):
    - **Visual Archetype**: "${visualStyle.name}"
      - Style: ${visualStyle.prompt_modifier}
      - Camera: ${visualStyle.camera}
      - Particles: ${visualStyle.particles.join(', ')}
    
    - **Narrative Framework**: "${narrative.name}"
      - Beat 1: ${narrative.beats[0].stage} - ${narrative.beats[0].description}
      - Beat 2: ${narrative.beats[1].stage} - ${narrative.beats[1].description}
      - Beat 3: ${narrative.beats[2].stage} - ${narrative.beats[2].description}
      - Beat 4: ${narrative.beats[3].stage} - ${narrative.beats[3].description}
      - Beat 5: ${narrative.beats[4].stage} - ${narrative.beats[4].description}

    CHOREOGRAPHY RULES (The "Vidra Flow"):
    1. **Transition Chain**: Scenes must flow into each other.
       - Use 'transition': 'zoom_through' when moving from a macro view to a device screen.
       - Use 'transition': 'wipe_right' for rapid comparisons.
    2. **Energy Control & Camera (STRICTLY ENFORCED)**:
       - **Hook**: High Energy. MUST use 'cameraMove': 'zoom_in_hero' or 'orbit_smooth'.
       - **Solution**: Hero Moment. MUST use 'cameraMove': 'orbit_smooth' with 2.5D Device Float.
       - **Features**: Fast Paced. Use 'slide' or 'pan_right' for momentum.
    3. **Camera Choreography Compatibility**:
       - 'orbit_smooth': BEST for Isometric Scenes & Devices.
       - 'zoom_in_hero': BEST for Product Reveal.
       - 'dolly_zoom': Use sparsely for dramatic effect.

    REQUIRED JSON OUTPUT:
    - Return a 'VideoPlan' object.
    - 'scenes' array MUST contain exactly 5 objects matching this schema:
      {
        "id": number,
        "type": "kinetic_text" | "ui_mockup" | "device_showcase" | "isometric_illustration" | "data_visualization" | "cta_finale",
        "title": "string",
        "script": "string",
        "duration": number,
        "visualDescription": "string",
        "wanPrompt": "string",
        "transition": "zoom_through" | "wipe_right" | "fade",
        "cameraMove": "orbit_smooth" | "zoom_in_hero" | "dolly_zoom" | "pan_left" | "pan_right",
        "mainText": "string (REQUIRED for kinetic_text scenes - e.g. 'THE SHIFT')",
        "subText": "string (Optional subtitle - e.g. 'Is Happening Now')",
        "choreography": {
             "camera": { "type": "cinematic_path" },
             "audioEvents": [
                 { "frame": 10, "type": "sfx", "file": "whoosh.mp3", "volume": 0.5 },
                 { "frame": 50, "type": "sfx", "file": "click.mp3", "volume": 0.8 }
             ],
             "ui": {
                 "actions": [{ "frame": 50, "type": "click", "x": 50, "y": 50 }]
             }
        },
        "uiComponents": [
             { "id": "sidebar", "type": "sidebar", "content": "<svg>...</svg>", "position": { "top": "0", "left": "0", "width": "20%", "height": "100%" }, "animation": "slide_from_left", "zIndex": 10 },
             { "id": "card1", "type": "card", "content": "<svg>...</svg>", "position": { "top": "20%", "left": "30%", "width": "40%", "height": "50%" }, "animation": "pop_in", "zIndex": 20 }
        ]
      }
    - IMPORTANT: For 'ui_mockup' scenes, you MUST generate 'uiComponents' to create a layered 3D effect.
    - **UI COMPONENT EXAMPLES (Use these SVG patterns):**
      - **Sidebar**: \`<svg width="100%" height="100%" viewBox="0 0 200 800"><rect width="200" height="800" fill="#1e293b" /><rect x="20" y="40" width="160" height="40" rx="8" fill="#334155" /><rect x="20" y="100" width="30" height="30" rx="4" fill="#64748b" /><rect x="60" y="105" width="100" height="20" rx="4" fill="#475569" /></svg>\`
      - **Navbar**: \`<svg width="100%" height="100%" viewBox="0 0 800 60"><rect width="800" height="60" fill="#ffffff" /><circle cx="40" cy="30" r="15" fill="#3b82f6" /><rect x="600" y="15" width="100" height="30" rx="15" fill="#f1f5f9" /></svg>\`
      - **Hero Card**: \`<svg width="100%" height="100%" viewBox="0 0 400 300"><rect width="400" height="300" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" /><rect x="20" y="20" width="100" height="20" rx="4" fill="#e2e8f0" /><rect x="20" y="60" width="360" height="150" rx="8" fill="#f8fafc" /><circle cx="350" cy="35" r="15" fill="#ef4444" opacity="0.2" /></svg>\`
      - **Floating Badge**: \`<svg width="100%" height="100%" viewBox="0 0 200 60"><rect width="200" height="60" rx="30" fill="#3b82f6" /><text x="100" y="38" font-family="sans-serif" font-size="24" text-anchor="middle" fill="white" font-weight="bold">Verified</text></svg>\`

    - **BENTO GRID RULES (Phase 7):**
      - Use 'bento_grid' for "features" or "summary" beats.
      - 'bentoItems' MUST contain 3-5 items.
      - Mix different spans: colSpan: 2 for hero stats, colSpan: 1 for small icons.
      - **Bento Item Examples:**
        - **Stat**: { "id": "stat1", "type": "stat", "colSpan": 1, "rowSpan": 1, "content": "<h3>99%</h3><p>Uptime</p>" }
        - **Feature**: { "id": "feat1", "type": "feature", "colSpan": 2, "rowSpan": 2, "content": "<svg>...</svg><h3>Real-time Sync</h3>" }
    - **DEVICE CLOUD RULES:**
      - Use 'device_cloud' for "ecosystem", "omnichannel", or "platform" beats.
      - Use when the script mentions "Available everywhere" or "All your devices".
      - The 'visualDescription' should describe the floating devices.

    - **AUDIO INTELLIGENCE (STRICT):**
      - EVERY 'ui_mockup' scene MUST have consistent SFX.
      - If a component appears ('pop_in'), add type: 'sfx', file: 'pop.mp3', frame: 0.
      - If a Transition happens, add type: 'sfx', file: 'whoosh.mp3', frame: 0.
      - If an action clicks, add type: 'sfx', file: 'click.mp3', frame: 50.

    - Include 'archetype': '\${selectedArchetype}'
    - Include 'narrativeFramework': '\${selectedFramework}'
    - 'wanPrompt' must be optimized for the "\${visualStyle.name}" style.
  `;

  const userPrompt = `
    PROJECT BRIEF:
  - Product: ${brief.productName}
  - Description: ${brief.description}
  - Tone: ${brief.tone}
  - CTA: ${brief.callToAction}
  - Industry: ${industryContext}
    
    ${recordingContext}

    GENERATE NOW.JSON ONLY.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      model: model || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    else if (cleanedContent.startsWith('```')) cleanedContent = cleanedContent.replace(/```\n?/g, '');

    let parsed = JSON.parse(cleanedContent) as any;

    // Normalization: Check if the LLM wrapped the plan in a root object key
    if (parsed.VideoPlan) parsed = parsed.VideoPlan;
    else if (parsed.videoPlan) parsed = parsed.videoPlan;
    else if (parsed.plan) parsed = parsed.plan;

    parsed = parsed as VideoPlan;

    // Fail-safe: Ensure archetype/framework are set if LLM forgot
    if (!parsed.archetype) parsed.archetype = selectedArchetype;
    if (!parsed.narrativeFramework) parsed.narrativeFramework = selectedFramework;
    if (!parsed.brandColor) parsed.brandColor = visualStyle.colors[1];

    // Auto-fix layout colors and missing fields if needed
    if (parsed.scenes && Array.isArray(parsed.scenes)) {
      parsed.scenes.forEach((scene, index) => {
        if (!scene.title) scene.title = `Scene ${index + 1}`;
        if (!scene.type) scene.type = 'kinetic_text'; // Safe default
        if (!scene.colorPalette) scene.colorPalette = [...visualStyle.colors];
        if (!scene.particleEffects) scene.particleEffects = [{ type: visualStyle.particles[0] as any, density: 'medium', color: visualStyle.colors[2] }];

        // Auto-inject default Audio Choreography if missing (Phase 6)
        if (!scene.choreography) scene.choreography = {};
        if (!scene.choreography.audioEvents) {
          const events: any[] = [];
          // Add transition whoosh at start (except scene 1)
          if (index > 0) events.push({ frame: 0, type: 'sfx', file: 'whoosh.mp3', volume: 0.5 });
          // Add click/type for UI scenes
          if (scene.type === 'ui_mockup' || scene.type === 'device_showcase') {
            events.push({ frame: 20, type: 'sfx', file: 'click.mp3', volume: 0.6 });
          }
          // Add impact for Kinetic Text
          if (scene.type === 'kinetic_text') {
            events.push({ frame: 10, type: 'sfx', file: 'digital_blip.mp3', volume: 0.4 });
            // Fallback for missing text
            if (!scene.mainText) scene.mainText = scene.title?.toUpperCase() || "HEADLINE";
            if (!scene.subText) scene.subText = "Subtitle goes here";
          }
          scene.choreography.audioEvents = events;
        }
      });
    } else {
      console.error("❌ Generated plan missing 'scenes' array:", parsed);
      parsed.scenes = []; // Fallback to empty array to prevent crash
    }

    return parsed;

  } catch (error) {
    console.error("Groq Generation Error:", error);
    throw error;
  }
};


export const refineSceneSvg = async (sceneDescription: string, currentSvg: string, type: SceneType, apiKey: string): Promise<string> => {
  const groq = getGroqClient(apiKey);
  const prompt = `
    Refine this SVG for a ${type} scene.
    Description: "${sceneDescription}".
    Make it detailed, professional, and matching the description.
    Use What a Story style: clean, modern, vibrant gradients.
    Return ONLY the raw SVG string. No JSON, no Markdown.
    
    Current SVG:
    ${currentSvg}
    `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    let content = completion.choices[0]?.message?.content || currentSvg;
    // Clean markdown if present
    content = content.replace(/```svg/g, '').replace(/```/g, '').trim();
    return content;
  } catch (error) {
    console.error("Refine SVG Error:", error);
    return currentSvg;
  }
};
