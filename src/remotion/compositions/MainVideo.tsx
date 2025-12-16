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

    // --- TEMPLATE ROUTER ---

    // 1. Viable Template
    if (templateName === 'viable') {
        // Fallback data if templateData is missing
        const data = plan.templateData || {
            brand: { name: 'Viable' },
            colors: { background: plan.brandColor || '#0f172a', accent: '#6366f1' },
            copy: { headline: 'Default Headline' }
        };

        return (
            <ViableTemplate
                {...data}
                colors={data.colors || { background: plan.brandColor || '#0f172a', accent: '#6366f1', secondary: '#fb923c' }}
            />
        );
    }

    // 2. Pretaa Template
    if (templateName === 'pretaa') {
        // Construct fallback data from generic plan if specific templateData is missing
        // This handles cases where Director generates 8 generic scenes but we want to force the Template look.
        const fallbackData = {
            brand: {
                name: plan.topic || "Brand Name",
                accentColor: plan.brandColor || "#3b82f6",
                tagline: "Your Vision, Realized"
            },
            copy: {
                headline: "Revolutionary Platform",
                subheadline: "The future is here.",
                problem: "Fragmented tools hold you back.",
                solution: "One unified ecosystem.",
                features: [
                    { title: "Speed", subtitle: "Real-time sync", icon: "⚡" },
                    { title: "Security", subtitle: "Enterprise grade", icon: "🔒" },
                    { title: "Scale", subtitle: "Global reach", icon: "🌍" }
                ]
            },
            cta: {
                text: "Get Started",
                url: "pretaa.com"
            }
        };

        const data = plan.templateData || fallbackData;

        return <PretaaReactTemplate {...data} />;
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
