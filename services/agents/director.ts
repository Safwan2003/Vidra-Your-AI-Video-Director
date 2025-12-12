import { groq, cleanJsonOutput } from '../llm';
import { VideoGenerationState } from './state';
import { ARCHETYPES } from '../../src/constants';
import { detectIndustry } from '../utils';
import { VideoScene, ViableTemplateData } from '../../types';

export const directorAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
  console.log('🎥 Director Agent: Creating choreography...');

  try {
    // --- TEMPLATE MODE: VIABLE (6 Scenes, 90s) ---
    if (state.template === 'viable') {
      console.log('🏗️ Director: Generating data for "Viable" Template (90s Extended)...');

      // 1. Gather Assets
      const assetsContext = state.brief.recordedClips && state.brief.recordedClips.length > 0
        ? `AVAILABLE SCREENSHOTS:\n${state.brief.recordedClips.map((c, i) => `"${c.url}"`).join('\n')}`
        : `NO ASSETS provided. Use placeholder URLs.`;

      // 2. Prompt for Template Content
      const prompt = `
            You are filling the "Viable" Video Template for: ${state.brief.productName}.
            Description: ${state.brief.description}
            
            ${assetsContext}

            The template has 6 FIXED SCENES (90 Seconds Total - Cinematic Pacing). Fill the schema:
            
            1. PROBLEM: Punchy hook text.
            2. RESULT: Stats for the large dashboard card.
            3. INTEGRATIONS: 4-5 Software names.
            4. FEATURES: 3 items.

            OUTPUT JSON SCHEMA:
            {
                "assets": {
                    "screenshotDashboard": "url"
                },
                "copy": {
                    "problem": "HOOK TEXT",
                    "solutionTooltip": "STAT",
                    "solutionNotification": "ALERT",
                    "heroTitle": "TITLE",
                    "features": [ { "title": "T1", "subtitle": "S1" } ]
                },
                "trust": { "logos": ["A", "B", "C", "D"] },
                "colors": { "background": "#0f172a", "accent": "#7c3aed", "secondary": "#fb923c" }
            }
        `;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const templateData = JSON.parse(cleanJsonOutput(raw)) as ViableTemplateData;

      // 3. Construct Dummy Scenes for Duration (Match ViableTemplate.tsx T constants)
      // 450 + 300 + 750 + 450 + 450 + 300 = 2700 frames (90s)
      const scenes: VideoScene[] = [
        { id: 1, type: 'slot_transition', title: 'Problem', duration: 15 },
        { id: 2, type: 'slot_transition', title: 'Mechanism', duration: 10 },
        { id: 3, type: 'slot_transition', title: 'Result', duration: 25 },
        { id: 4, type: 'slot_transition', title: 'Integrations', duration: 15 },
        { id: 5, type: 'slot_transition', title: 'Features', duration: 15 },
        { id: 6, type: 'slot_transition', title: 'Outro', duration: 10 },
      ];

      return {
        ...state,
        templateData,
        scenes
      };
    }

    // ... Legacy Generic Mode ...
    const industry = detectIndustry(state.brief.description);
    const archetypeKey = (state.archetype || 'isometric_world') as keyof typeof ARCHETYPES;
    const visualStyle = ARCHETYPES[archetypeKey] || ARCHETYPES.isometric_world;

    const scripts = state.beatScripts || [];
    const scriptContext = scripts.length > 0
      ? `USE THESE SCRIPTS FOR THE 8 SCENES:\n${scripts.map((s, i) => `Scene ${i + 1}: "${s}"`).join('\n')}`
      : `SCRIPT: ${state.script}`;

    // Prepare user assets context
    const userAssets = state.brief.recordedClips || [];
    const assetsContext = userAssets.length > 0
      ? `AVAILABLE USER ASSETS (Use these for 'screenUrl' in 3dConfig):\n${userAssets.map((a, i) => `- Asset ${i + 1}: "${a.url}" (${a.description})`).join('\n')}`
      : `NO USER ASSETS AVAILABLE. Do NOT include 'screenUrl' in 3dConfig - the device will show a solid color screen instead.`;

    const prompt = `
You are Vidra, the AI Director specializing in high-end isometric motion graphics.

PROJECT CONTEXT:
PRODUCT: ${state.brief.productName}
DESCRIPTION: ${state.brief.description}
TARGET AUDIENCE: ${state.brief.targetAudience}
TONE: ${state.brief.tone}
INDUSTRY: ${industry}

${assetsContext}

visualStyle: ${visualStyle.name}

REQUIRED OUTPUT:
Create exactly 8 scenes matching the script rhythm.
${scriptContext}

JSON SCHEMA:
{
  "scenes": [
    {
      "id": 1,
      "type": "kinetic_text" | "ui_mockup" | "3d_laptop_orbit" | "3d_phone_float" | "exploded_ui_view" | "bento_grid" | "floating_ui_layers" | "social_proof" | "data_visualization" | "cta_finale" | "flat_screenshot",
      "title": "Scene title",
      "script": "${scripts[0]}", 
      "duration": 5,
      "visualDescription": "Technical description",
      "transition": "cut",
      "mainText": "HERO COPY",
      "3dConfig": { "model": "laptop_pro", "screenUrl": "OPTIONAL" }
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    const content = cleanJsonOutput(rawContent);
    const parsed = JSON.parse(content);

    // Ensure IDs
    const scenes = (parsed.scenes || []).map((s: any, i: number) => ({ ...s, id: Date.now() + i }));

    return {
      ...state,
      scenes,
      cameraWork: { type: 'cinematic_path' }
    };
  } catch (error) {
    console.error('❌ Director Agent Error:', error);
    return {
      ...state,
      errors: [...(state.errors || []), `Director: ${(error as Error).message} `]
    };
  }
};
