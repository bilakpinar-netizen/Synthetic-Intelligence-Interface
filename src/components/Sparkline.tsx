import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  fillColor?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  data,
  color = '#3b82f6',
  fillColor,
  className = '',
  width = 120,
  height = 36
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  // Map values to coordinates
  const padding = 2;
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    // Curve interpolation
    const prev = points[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = cpX1;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  // Closed shape for background area gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  // Generate unique gradient ID to avoid namespace collisions
  const gradId = React.useId();

  return (
    <svg
      id="sparkline-svg"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      
      {/* Sparkline Gradient Fill */}
      <path d={areaD} fill={`url(#${gradId})`} />
      
      {/* Sparkline Core Outline */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Interactive Pulsing end dot */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}
