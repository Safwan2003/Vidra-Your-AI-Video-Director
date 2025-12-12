import { VideoGenerationState } from './state';
import { scriptwriterAgent } from './scriptwriter';
import { directorAgent } from './director';
import { artDirectorAgent } from './artDirector';
import { soundDesignerAgent } from './soundDesigner';
import { criticAgent } from './critic';
import { VideoPlan, ProjectBrief } from '../../types';

/**
 * Lightweight agent orchestrator (no LangGraph dependency)
 * Runs agents sequentially with quality loop
 */
export class AgentOrchestrator {
    private maxRefinements = 2;

    async runPipeline(brief: ProjectBrief, templateMode: 'generic' | 'viable' = 'generic'): Promise<VideoPlan> {
        let state: VideoGenerationState = {
            brief,
            template: templateMode,
            refinementCount: 0,
            errors: []
        };

        console.log('🚀 Starting Multi-Agent Video Generation...');
        console.log(`📋 Product: ${brief.productName}`);

        // Run agents in sequence
        state = await this.runAgent('Scriptwriter', scriptwriterAgent, state);
        state = await this.runAgent('Art Director', artDirectorAgent, state);
        state = await this.runAgent('Director', directorAgent, state);
        state = await this.runAgent('Sound Designer', soundDesignerAgent, state);

        // Quality loop
        let refinementAttempts = 0;
        while (refinementAttempts < this.maxRefinements) {
            state = await this.runAgent('Critic', criticAgent, state);

            if (!state.needsRefinement) {
                break; // Quality is good!
            }

            console.log(`🔄 Quality below threshold (${((state.qualityScore || 0) * 100).toFixed(0)}%), refining...`);
            refinementAttempts++;

            // Re-run agents
            state = await this.runAgent('Art Director', artDirectorAgent, state);
            state = await this.runAgent('Director', directorAgent, state);
            state = await this.runAgent('Sound Designer', soundDesignerAgent, state);
        }

        // Assemble final video plan
        const videoPlan = this.assemblePlan(state);

        console.log(`✅ Video plan generated with quality score: ${((state.qualityScore || 0) * 100).toFixed(0)}%`);
        console.log(`📊 Scenes: ${videoPlan.scenes.length}`);

        if (state.errors && state.errors.length > 0) {
            console.warn('⚠️ Errors encountered:', state.errors);
        }

        return videoPlan;
    }

    private async runAgent(
        name: string,
        agent: (state: VideoGenerationState) => Promise<VideoGenerationState>,
        state: VideoGenerationState
    ): Promise<VideoGenerationState> {
        try {
            return await agent(state);
        } catch (error) {
            console.error(`❌ ${name} Agent Error:`, error);
            return {
                ...state,
                errors: [...(state.errors || []), `${name}: ${(error as Error).message}`]
            };
        }
    }

    private assemblePlan(state: VideoGenerationState): VideoPlan {
        console.log('📦 Assembling final video plan...');

        const basePlan = {
            brandName: state.brief.productName,
            brandColor: (state.visualAssets as any)?.brandColor || '#6366f1',
            template: state.template || 'generic',
            archetype: 'isometric_world',
            narrativeFramework: 'saas_standard',
            scenes: state.scenes || []
        };

        // If template mode, include templateData
        if (state.template === 'viable' && state.templateData) {
            return {
                ...basePlan,
                templateData: state.templateData
            };
        }

        return basePlan;
    }
}

// Main function to generate video plan using multi-agent system
export const generateVideoPlanWithAgents = async (brief: ProjectBrief, templateMode: 'generic' | 'viable' = 'generic'): Promise<VideoPlan> => {
    console.log('🚀 Starting Agent Graph execution...');

    // Initialize State
    let state: VideoGenerationState = {
        brief,
        template: templateMode,
        errors: [],
        qualityScore: 0,
        refinementCount: 0
    };

    // Delegate execution to Orchestrator
    const orchestrator = new AgentOrchestrator();
    return orchestrator.runPipeline(brief, templateMode);
};
