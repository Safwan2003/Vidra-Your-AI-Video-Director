
export const detectIndustry = (description: string): string => {
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
