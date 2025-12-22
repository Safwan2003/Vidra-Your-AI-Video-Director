import { ThemeType } from '../../../../../types';

export interface ThemeStyles {
    card: React.CSSProperties;
    heading: React.CSSProperties;
    text: React.CSSProperties;
    accent: string;
    background: string;
    borderRadius: number;
    springConfig: { damping: number; stiffness: number; mass: number };
}

export const getThemeStyles = (theme: ThemeType = 'modern', brandColor: string = '#3b82f6'): ThemeStyles => {
    switch (theme) {
        case 'glassmorphism':
            return {
                card: {
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
                    borderRadius: 24,
                },
                heading: { fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b' },
                text: { color: '#475569' },
                accent: brandColor,
                background: `radial-gradient(at 0% 0%, ${brandColor}33 0, transparent 50%), radial-gradient(at 50% 0%, #ffffff 0, transparent 50%), radial-gradient(at 100% 0%, ${brandColor}22 0, transparent 50%)`,
                borderRadius: 24,
                springConfig: { damping: 20, stiffness: 100, mass: 1 },
            };

        case 'punchy_saas':
            return {
                card: {
                    background: '#ffffff',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    borderRadius: 32,
                },
                heading: { fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '-0.05em', color: '#0f172a' },
                text: { fontWeight: 500, color: '#334155' },
                accent: brandColor,
                background: `linear-gradient(135deg, ${brandColor}11 0%, #f8fafc 100%)`,
                borderRadius: 32,
                springConfig: { damping: 12, stiffness: 200, mass: 0.5 },
            };

        case 'neo_brutalism':
            return {
                card: {
                    background: '#ffffff',
                    border: '4px solid #000000',
                    boxShadow: '8px 8px 0px 0px #000000',
                    borderRadius: 0,
                },
                heading: { fontWeight: 900, color: '#000000', textTransform: 'uppercase' as const },
                text: { fontWeight: 700, color: '#000000' },
                accent: brandColor,
                background: `linear-gradient(90deg, #f1f5f9 2px, transparent 2px) 0 0 / 40px 40px, linear-gradient(#f1f5f9 2px, transparent 2px) 0 0 / 40px 40px, #ffffff`,
                borderRadius: 0,
                springConfig: { damping: 5, stiffness: 300, mass: 1 },
            };

        case 'minimalist':
            return {
                card: {
                    background: 'transparent',
                    border: '1px solid #e5e5e5',
                    boxShadow: 'none',
                    borderRadius: 0,
                },
                heading: { fontWeight: 300, color: '#171717', letterSpacing: '0.1em' },
                text: { fontWeight: 400, color: '#404040', lineHeight: 1.6 },
                accent: brandColor,
                background: '#ffffff',
                borderRadius: 0,
                springConfig: { damping: 30, stiffness: 50, mass: 2 },
            };

        case 'modern':
        default:
            return {
                card: {
                    background: '#ffffff',
                    borderRadius: 16,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                heading: { fontWeight: 700, color: '#1e293b' },
                text: { color: '#64748b' },
                accent: brandColor,
                background: '#f8fafc',
                borderRadius: 16,
                springConfig: { damping: 20, stiffness: 100, mass: 1 },
            };
    }
};
