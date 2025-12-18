import React from 'react';
import { AbsoluteFill } from 'remotion';
import { VideoPlan } from '../../../types';
import { ViableTemplate } from '../templates/Viable';
import { PretaaReactTemplate } from '../templates/Pretaa';

interface MainVideoProps {
    plan?: VideoPlan;
}

export const MainVideo: React.FC<MainVideoProps> = ({ plan }) => {
    if (!plan) {
        return (
            <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white', fontSize: 32 }}>No plan provided</div>
            </AbsoluteFill>
        );
    }

    const templateName = plan.template?.toLowerCase();


    // 1. Viable Template
    if (templateName === 'viable') {
        return <ViableTemplate plan={plan} />;
    }

    // 2. Pretaa Template
    if (templateName === 'pretaa') {
        return <PretaaReactTemplate plan={plan} />;
    }

    // Fallback if no template matches
    return (
        <AbsoluteFill style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <h1 style={{ fontSize: 40, color: '#000' }}>Template Not Found: {plan.template}</h1>
            <p style={{ fontSize: 24, color: '#666' }}>
                Please select 'viable' or 'pretaa' in your video plan.
            </p>
        </AbsoluteFill>
    );
};
