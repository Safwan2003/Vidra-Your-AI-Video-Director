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
        : `NO ASSETS provided. Leave screenshot URLs empty.`;

      // 2. Extract brand colors from Art Director (or defaults)
      const visualAssets = state.visualAssets;
      const brandColor = visualAssets?.brandColor || '#9333ea';
      const accentColor = visualAssets?.accentColor || '#f472b6';

      const industry = detectIndustry(state.brief.description);

      // 3. Prompt for Template Content with NEW schema
      const prompt = `
            You are an elite Copywriter & Creative Director.
            Fill the "Viable" Video Template for: ${state.brief.productName}.
            
            CONTEXT:
            Description: ${state.brief.description}
            Target Audience: ${state.brief.targetAudience}
            Tone: ${state.brief.tone}
            Industry: ${industry}
            
            ${assetsContext}

            The template has 6 SCENES. Generate specific, high-converting copy:
            
            1. BRAND INFO: Company name, tagline
            2. HEADLINE: Punchy hook for the hero scene.
            3. FEATURES: 6 specific features containing 1-2 word titles and short subtitles.
            4. TRUST: A realistic testimonial relevant to ${industry}.
            5. CTA: Strong action verb.

            OUTPUT JSON SCHEMA (use exactly this structure):
            {
                "brand": {
                    "name": "${state.brief.productName}",
                    "accentColor": "${brandColor}",
                    "secondaryColor": "${accentColor}",
                    "tagline": "SHORT TAGLINE - 5 words max"
                },
                "assets": {
                    "screenshotDashboard": "${state.brief.recordedClips?.[0]?.url || ''}"
                },
                "copy": {
                    "headline": "MAIN HEADLINE - 6-8 words that hook the viewer",
                    "subheadline": "SHORT SUBTITLE - 4-5 words",
                    "featuresTitle": "Why ${state.brief.productName}?",
                    "features": [
                        { "title": "Feature 1", "subtitle": "One line description", "icon": "🚀" },
                        { "title": "Feature 2", "subtitle": "One line description", "icon": "⚡" },
                        { "title": "Feature 3", "subtitle": "One line description", "icon": "🔗" },
                        { "title": "Feature 4", "subtitle": "One line description", "icon": "🔒" },
                        { "title": "Feature 5", "subtitle": "One line description", "icon": "👥" },
                        { "title": "Feature 6", "subtitle": "One line description", "icon": "📊" }
                    ]
                },
                "trust": {
                    "testimonial": {
                        "quote": "A compelling customer testimonial quote - 20-30 words",
                        "author": "Customer Name",
                        "role": "Job Title",
                        "company": "Company Name"
                    },
                    "logos": []
                },
                "cta": {
                    "text": "${state.brief.callToAction || 'Get Started'}",
                    "url": "www.example.com"
                }
            }
            
            CRITICAL: Return ONLY valid JSON, no explanations.
        `;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const templateData = JSON.parse(cleanJsonOutput(raw)) as ViableTemplateData;

      // Force inject the colors to match Art Director selection
      if (templateData.brand) {
        templateData.brand.accentColor = brandColor;
        // Note: ViableTemplateData might need 'secondaryColor' in its type definition if used in scenes
      }

      // 4. Construct Dummy Scenes for Duration (Match ViableTemplate.tsx T constants)
      // 450 + 300 + 750 + 450 + 450 + 300 = 2700 frames (90s)
      const scenes: VideoScene[] = [
        { id: 1, type: 'slot_transition', title: 'Logo Intro', duration: 15 },
        { id: 2, type: 'slot_transition', title: 'Tagline', duration: 10 },
        { id: 3, type: 'slot_transition', title: 'Dashboard', duration: 25 },
        { id: 4, type: 'slot_transition', title: 'Features', duration: 15 },
        { id: 5, type: 'slot_transition', title: 'Testimonials', duration: 15 },
        { id: 6, type: 'slot_transition', title: 'CTA', duration: 10 },
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
