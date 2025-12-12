import { groq, cleanJsonOutput } from '../llm';
import { detectIndustry } from '../utils';
import { VideoGenerationState } from './state';
import { NARRATIVE_FRAMEWORKS } from '../../src/constants';

export const scriptwriterAgent = async (state: VideoGenerationState): Promise<VideoGenerationState> => {
    console.log('🎬 Scriptwriter Agent: Generating voiceover scripts...');

    try {
        // Determine narrative framework
        const isHype = state.brief.tone === 'Hype';
        const framework = isHype ? NARRATIVE_FRAMEWORKS.hype_cycle : NARRATIVE_FRAMEWORKS.saas_standard;
        const industry = detectIndustry(state.brief.description);

        const prompt = `
You are an elite scriptwriter for "What a Story" agency, specializing in SaaS product launch videos.

PRODUCT: ${state.brief.productName}
DESCRIPTION: ${state.brief.description}
TARGET AUDIENCE: ${state.brief.targetAudience}
TONE: ${state.brief.tone}
CTA: ${state.brief.callToAction}
INDUSTRY: ${industry}

NARRATIVE FRAMEWORK: ${framework.name}
Create a compelling 60-90 second script following the "What a Story" standard:

STRUCTURE (8 Beats):

1. HOOK (5-8s): Grab attention immediately
   - Use a bold question, shocking stat, or relatable pain point
   - Examples: "What if {pain} was no longer a problem?", "{Statistic} of {audience} struggle with {problem}"
   - Keep it punchy: 3-7 words maximum

2. PROBLEM (10-15s): Identify the pain point
   - Make it relatable and specific
   - Use emotional language (frustrated, overwhelmed, stuck)
   - Short sentences for impact

3. AGITATION (8-12s): Amplify the cost
   - Quantify the impact (time wasted, money lost, opportunities missed)
   - Create urgency

4. SOLUTION REVEAL (5-8s): The "Hero" moment
   - Introduce ${state.brief.productName} as the answer
   - One powerful, memorable line
   - Examples: "Enter {Product}", "Introducing {Product}", "Meet {Product}"

5. FEATURE 1 - Speed/Automation (8-12s):
   - Focus on time-saving, efficiency, automation
   - Use active verbs: "Automate", "Accelerate", "Streamline"
   - Benefit-focused, not feature-focused

6. FEATURE 2 - Intelligence/Insight (8-12s):
   - Focus on smart insights, clarity, intelligence
   - Use words like: "Understand", "Analyze", "Predict"
   - Show the transformation

7. SOCIAL PROOF (5-8s):
   - Build credibility
   - Examples: "Trusted by {industry} leaders", "Join {number}+ teams"
   - Keep it brief but impactful

8. CTA (5-8s): Clear call to action
   - Use: ${state.brief.callToAction}
   - Add urgency if appropriate
   - Make it actionable and specific

WRITING RULES:
- Total: 130-150 words
- Sentence length: Under 15 words each
- Rhythm: Staccato for Beats 1-3 (short, punchy), Flow for Beats 5-6 (smoother)
- Tone: ${state.brief.tone} but professional and benefit-focused
- Avoid jargon unless targeting technical audience
- Use emotional triggers: frustration → relief → success

CRITICAL: Return ONLY a valid JSON array of 8 strings, one for each beat. No explanations, no markdown.
Example: ["Stop guessing. Start knowing.", "Your team drowns in data every day.", "Hours lost. Decisions delayed. Revenue at risk.", "Introducing Vidra.", "Instant insights. Automated reports. Zero manual work.", "AI that understands your business context.", "Trusted by Fortune 500 teams.", "Start your free trial today."]
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500
        });

        const rawContent = completion.choices[0]?.message?.content || '[]';
        const content = cleanJsonOutput(rawContent);

        let scripts: string[];
        try {
            scripts = JSON.parse(content);

            // Validate it's an array of strings
            if (!Array.isArray(scripts) || scripts.length === 0) {
                throw new Error('Invalid script format: expected non-empty array');
            }
        } catch (parseError) {
            console.warn('⚠️ Failed to parse AI response, using fallback script');
            console.warn('Raw response:', rawContent);

            // Fallback to a generic script based on the product
            scripts = [
                `${state.brief.productName}.`,
                `The challenge is real.`,
                `Time wasted. Opportunities missed.`,
                `Introducing ${state.brief.productName}.`,
                `Fast. Efficient. Powerful.`,
                `Smart insights. Clear results.`,
                `Trusted by innovators.`,
                state.brief.callToAction || 'Get started today.'
            ];
        }

        console.log(`✅ Generated ${scripts.length} scripts`);

        return {
            ...state,
            script: scripts.join(' '), // Combined script
            beatScripts: scripts
        };

    } catch (error) {
        console.error('❌ Scriptwriter Agent Error:', error);
        return {
            ...state,
            errors: [...(state.errors || []), `Scriptwriter: ${(error as Error).message}`]
        };
    }
};
