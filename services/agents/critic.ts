import { VideoGenerationState } from './state';

export const criticAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
    console.log('🔍 Critic Agent: Evaluating video plan quality...');

    const issues: string[] = [];
    let score = 100;

    // --- TEMPLATE MODE VALIDATION ---
    if (state.template === 'viable') {
        // Validate templateData
        if (!state.templateData) {
            issues.push('No template data generated');
            score -= 50;
        } else {
            // Validate NEW 6-Scene Schema Structure
            // 1. Assets
            if (!state.templateData.assets?.screenshotDashboard && !state.templateData.assets?.screenshotMobile) {
                // Warning only, as it might use defaults
                console.warn('⚠️ Template missing specific dashboard screenshot asset');
            }

            // 2. Copy Fields
            if (!state.templateData.copy) {
                issues.push('Template data missing "copy" section');
                score -= 30;
            } else {
                if (!state.templateData.copy.problem) {
                    issues.push('Missing "copy.problem"');
                    score -= 10;
                }
                if (!state.templateData.copy.features || state.templateData.copy.features.length === 0) {
                    issues.push('Missing "copy.features"');
                    score -= 10;
                }
            }

            // 3. Trust/Integrations
            if (!state.templateData.trust?.logos || state.templateData.trust.logos.length === 0) {
                issues.push('Missing "trust.logos"');
                score -= 10;
            }
        }

        // Validate Scenes for Timeline (Crucial for "Scenes: 0" bug prevention)
        if (!state.scenes || state.scenes.length === 0) {
            issues.push('No scenes array generated (timeline will be empty)');
            score -= 40;
        }

        const qualityScore = Math.max(0, Math.min(100, score)) / 100;
        const needsRefinement = qualityScore < 0.8;

        if (issues.length > 0) {
            console.warn('⚠️ Template quality issues:', issues.join(', '));
        }

        console.log(`✅ Template Quality Score: ${(qualityScore * 100).toFixed(0)}%`);

        return {
            ...state,
            qualityScore,
            needsRefinement,
            errors: [...(state.errors || []), ...issues]
        };
    }

    // --- GENERIC MODE VALIDATION (LEGACY) ---
    // Check for script
    if (!state.script && !state.beatScripts) {
        issues.push('No script generated');
        score -= 20;
    }

    // Check for scenes
    if (!state.scenes || state.scenes.length === 0) {
        issues.push('No scenes generated');
        score -= 30;
    } else {
        // Check scene quality
        const scenesWithoutType = state.scenes.filter(s => !s.type);
        if (scenesWithoutType.length > 0) {
            issues.push(`${scenesWithoutType.length} scenes missing type`);
            score -= 10;
        }

        const scenesWithoutDuration = state.scenes.filter(s => !s.duration || s.duration <= 0);
        if (scenesWithoutDuration.length > 0) {
            issues.push(`${scenesWithoutDuration.length} scenes missing duration`);
            score -= 10;
        }
    }

    // Check for visual assets
    if (!state.visualAssets || !state.visualAssets.colorPalette) {
        issues.push('No color palette');
        score -= 10;
    }

    // Check for audio events
    if (!state.audioEvents || state.audioEvents.length === 0) {
        issues.push('No audio events');
        score -= 10;
    }

    // Normalize score
    const qualityScore = Math.max(0, Math.min(100, score)) / 100;

    // Determine if refinement is needed
    const needsRefinement = qualityScore < 0.7;

    if (issues.length > 0) {
        console.warn('⚠️ Quality issues found:', issues.join(', '));
    }

    console.log(`✅ Quality Score: ${(qualityScore * 100).toFixed(0)}%`);

    return {
        ...state,
        qualityScore,
        needsRefinement,
        errors: [...(state.errors || []), ...issues]
    };
};
