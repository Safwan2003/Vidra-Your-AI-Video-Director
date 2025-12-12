import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, spring } from 'remotion';
import { VideoScene, ChartData } from '../../../types';

interface DataVisualizationSceneProps {
    scene: VideoScene;
    brandColor: string;
}

// Animated Counter Component
const AnimatedCounter: React.FC<{
    value: number;
    unit?: string;
    color: string;
    frame: number;
    fps: number;
}> = ({ value, unit, color, frame, fps }) => {
    const progress = spring({
        frame,
        fps,
        config: { damping: 30, stiffness: 80 },
    });

    const currentValue = Math.floor(value * progress);

    return (
        <div style={{ textAlign: 'center' }}>
            <span
                style={{
                    fontSize: 72,
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                {currentValue.toLocaleString()}{unit}
            </span>
        </div>
    );
};

// Animated Bar Chart Component
const AnimatedBarChart: React.FC<{
    data: ChartData;
    frame: number;
    fps: number;
    brandColor: string;
}> = ({ data, frame, fps, brandColor }) => {
    const maxValue = Math.max(...data.values);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 300, justifyContent: 'center' }}>
            {data.values.map((value, index) => {
                const delay = index * 8;
                const barProgress = spring({
                    frame: frame - delay,
                    fps,
                    config: { damping: 15, stiffness: 100 },
                });
                const heightPercent = (value / maxValue) * 100 * Math.max(0, barProgress);
                const barColor = data.colors?.[index] || brandColor;

                return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div
                            style={{
                                width: 60,
                                height: `${heightPercent * 2.5}px`,
                                background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}88 100%)`,
                                borderRadius: 8,
                                boxShadow: `0 4px 20px ${barColor}40`,
                                transition: 'height 0.1s ease-out',
                            }}
                        />
                        {data.labels?.[index] && (
                            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
                                {data.labels[index]}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Animated Line Chart Component
const AnimatedLineChart: React.FC<{
    data: ChartData;
    frame: number;
    fps: number;
    brandColor: string;
}> = ({ data, frame, fps, brandColor }) => {
    const progress = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: 'clamp' });
    const maxValue = Math.max(...data.values);
    const width = 400;
    const height = 200;
    const padding = 20;

    const points = data.values.map((value, index) => {
        const x = padding + (index / (data.values.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value / maxValue) * (height - padding * 2));
        return { x, y };
    });

    const pathD = points
        .slice(0, Math.ceil(points.length * progress))
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                    key={i}
                    x1={padding}
                    x2={width - padding}
                    y1={padding + (height - padding * 2) * ratio}
                    y2={padding + (height - padding * 2) * ratio}
                    stroke="#334155"
                    strokeWidth={1}
                />
            ))}

            {/* Line path */}
            <path
                d={pathD}
                fill="none"
                stroke={brandColor}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Gradient fill under line */}
            <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={brandColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={brandColor} stopOpacity={0} />
                </linearGradient>
            </defs>
            {pathD && (
                <path
                    d={`${pathD} L ${points[Math.floor(points.length * progress) - 1]?.x || padding} ${height - padding} L ${padding} ${height - padding} Z`}
                    fill="url(#lineGradient)"
                />
            )}

            {/* Data points */}
            {points.slice(0, Math.ceil(points.length * progress)).map((p, i) => (
                <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill={brandColor}
                    stroke="white"
                    strokeWidth={2}
                />
            ))}
        </svg>
    );
};

// Animated Pie Chart Component
const AnimatedPieChart: React.FC<{
    data: ChartData;
    frame: number;
    fps: number;
    brandColor: string;
}> = ({ data, frame, fps, brandColor }) => {
    const progress = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: 'clamp' });
    const total = data.values.reduce((a, b) => a + b, 0);
    const radius = 100;
    const center = 120;

    let accumulatedAngle = -90;

    return (
        <svg width={240} height={240}>
            {data.values.map((value, index) => {
                const sliceAngle = (value / total) * 360 * progress;
                const startAngle = accumulatedAngle;
                const endAngle = startAngle + sliceAngle;
                accumulatedAngle = endAngle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = center + radius * Math.cos(startRad);
                const y1 = center + radius * Math.sin(startRad);
                const x2 = center + radius * Math.cos(endRad);
                const y2 = center + radius * Math.sin(endRad);

                const largeArc = sliceAngle > 180 ? 1 : 0;
                const sliceColor = data.colors?.[index] || brandColor;

                return (
                    <path
                        key={index}
                        d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={sliceColor}
                        stroke="#0f172a"
                        strokeWidth={2}
                    />
                );
            })}
            {/* Center circle for donut effect */}
            <circle cx={center} cy={center} r={50} fill="#0f172a" />
        </svg>
    );
};

// Progress Bar Component
const AnimatedProgress: React.FC<{
    data: ChartData;
    frame: number;
    fps: number;
    brandColor: string;
}> = ({ data, frame, fps, brandColor }) => {
    const progress = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
    const targetValue = data.targetValue || data.values[0] || 75;

    return (
        <div style={{ width: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{data.title}</span>
                <span style={{ color: brandColor, fontSize: 18, fontWeight: 700 }}>
                    {Math.round(targetValue * progress)}{data.unit || '%'}
                </span>
            </div>
            <div style={{ height: 16, background: '#334155', borderRadius: 8, overflow: 'hidden' }}>
                <div
                    style={{
                        height: '100%',
                        width: `${targetValue * progress}%`,
                        background: `linear-gradient(90deg, ${brandColor}, ${brandColor}cc)`,
                        borderRadius: 8,
                        boxShadow: `0 0 20px ${brandColor}60`,
                    }}
                />
            </div>
        </div>
    );
};

export const DataVisualizationScene: React.FC<DataVisualizationSceneProps> = ({
    scene,
    brandColor
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Scene entry/exit animation
    const containerOpacity = interpolate(
        frame,
        [0, 15, durationInFrames - 15, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Ensure chartData is an array to prevent crashes if AI generates a single object
    const rawChartData = scene.chartData;
    const chartData = Array.isArray(rawChartData)
        ? rawChartData
        : (rawChartData ? [rawChartData] : []);

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a', opacity: containerOpacity }}>
            {/* Background gradient */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(ellipse at 50% 50%, ${brandColor}15 0%, transparent 50%),
                                 linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`,
                }}
            />

            {/* Title */}
            {scene.mainText && (
                <div
                    style={{
                        position: 'absolute',
                        top: 80,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                    }}
                >
                    <h1
                        style={{
                            fontSize: 48,
                            fontWeight: 800,
                            background: `linear-gradient(135deg, white, #94a3b8)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0,
                        }}
                    >
                        {scene.mainText}
                    </h1>
                </div>
            )}

            {/* Charts Container */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {chartData.map((chart, index) => (
                    <div key={index}>
                        {chart.type === 'counter' && (
                            <AnimatedCounter
                                value={chart.targetValue || chart.values[0] || 0}
                                unit={chart.unit}
                                color={chart.colors?.[0] || brandColor}
                                frame={frame}
                                fps={fps}
                            />
                        )}
                        {chart.type === 'bar' && (
                            <AnimatedBarChart data={chart} frame={frame} fps={fps} brandColor={brandColor} />
                        )}
                        {chart.type === 'line' && (
                            <AnimatedLineChart data={chart} frame={frame} fps={fps} brandColor={brandColor} />
                        )}
                        {chart.type === 'pie' && (
                            <AnimatedPieChart data={chart} frame={frame} fps={fps} brandColor={brandColor} />
                        )}
                        {chart.type === 'progress' && (
                            <AnimatedProgress data={chart} frame={frame} fps={fps} brandColor={brandColor} />
                        )}
                    </div>
                ))}
            </div>

            {/* Subtitle */}
            {scene.subText && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 80,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                    }}
                >
                    <p style={{ fontSize: 20, color: '#94a3b8', margin: 0 }}>
                        {scene.subText}
                    </p>
                </div>
            )}
        </AbsoluteFill>
    );
};
