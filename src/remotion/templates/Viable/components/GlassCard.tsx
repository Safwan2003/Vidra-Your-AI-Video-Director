import React from 'react';

export const GlassCard = ({ children, style, className, blur = 10, opacity = 0.5, borderRadius = 16, padding = 20 }: any) => (
    <div style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        borderRadius: borderRadius,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        padding: padding,
        ...style
    }} className={className}>
        {children}
    </div>
);

export const DarkGlassCard = ({ children, style, className }: any) => (
    <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        ...style
    }} className={className}>
        {children}
    </div>
);
