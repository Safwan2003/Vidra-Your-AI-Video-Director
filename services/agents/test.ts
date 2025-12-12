import { generateVideoPlanWithAgents } from './graph';
import { ProjectBrief } from '../../types';

// Test the multi-agent system
async function testMultiAgentSystem() {
    console.log('🧪 Testing Multi-Agent Video Generation System...\n');

    const testBrief: ProjectBrief = {
        url: 'https://www.markytech.com/',
        productName: 'MarkyTech',
        description: 'A leading software development company that specializes in creating custom software solutions for businesses of all sizes.',
        targetAudience: 'Business Owners',
        tone: 'Professional',
        callToAction: 'Get Started Today',
        recordedClips: []
    };

    try {
        const videoPlan = await generateVideoPlanWithAgents(testBrief);

        console.log('\n✅ TEST PASSED!');
        console.log(`\n📊 Generated Video Plan:`);
        console.log(`   Brand: ${videoPlan.brandName}`);
        console.log(`   Color: ${videoPlan.brandColor}`);
        console.log(`   Scenes: ${videoPlan.scenes.length}`);

        videoPlan.scenes.forEach((scene, idx) => {
            console.log(`\n   Scene ${idx + 1}: ${scene.title}`);
            console.log(`      Type: ${scene.type}`);
            console.log(`      Duration: ${scene.duration}s`);
            console.log(`      Camera: ${scene.cameraMove || 'static'}`);
        });

        return videoPlan;

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        throw error;
    }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testMultiAgentSystem()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { testMultiAgentSystem };
