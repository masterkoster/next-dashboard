'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface WindImpactPoint {
  distanceNm: number;
  cumulativeImpactGallons: number;
  impactDollars?: number;
}

interface WindImpactGraphProps {
  data: WindImpactPoint[];
  currentDistanceNm: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  fuelPricePerGallon?: number;
}

// Animated path component
function AnimatedLine({ 
  points, 
  progress, 
  color 
}: { 
  points: string; 
  progress: number; 
  color: string;
}) {
  const [dashOffset, setDashOffset] = useState(0);
  
  useEffect(() => {
    // Calculate path length
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', points);
    const length = path.getTotalLength?.() || 1000;
    
    setDashOffset(length * (1 - progress));
  }, [progress, points]);
  
  return (
    <path
      d={points}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: '1000',
        strokeDashoffset: dashOffset,
        transition: 'stroke-dashoffset 0.1s ease-out'
      }}
    />
  );
}

export default function WindImpactGraph({
  data,
  currentDistanceNm,
  isPlaying,
  onPlayPause,
  fuelPricePerGallon = 6.0
}: WindImpactGraphProps) {
  const [hoveredPoint, setHoveredPoint] = useState<WindImpactPoint | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Calculate graph dimensions
  const width = 280;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 25, left: 10 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  // Calculate scales
  const maxDistance = useMemo(() => Math.max(...data.map(d => d.distanceNm), 100), [data]);
  const maxImpact = useMemo(() => {
    const max = Math.max(...data.map(d => Math.abs(d.cumulativeImpactGallons)));
    return Math.max(max, 1); // Minimum 1 gallon range
  }, [data]);
  
  // Scale functions
  const xScale = (d: number) => padding.left + (d / maxDistance) * graphWidth;
  const yScale = (g: number) => padding.top + graphHeight / 2 - (g / maxImpact) * (graphHeight / 2);
  
  // Generate path
  const linePath = useMemo(() => {
    if (data.length === 0) return '';
    
    return data.map((point, i) => {
      const x = xScale(point.distanceNm);
      const y = yScale(point.cumulativeImpactGallons);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  }, [data, maxDistance, maxImpact]);
  
  // Current progress (0-1)
  const currentProgress = maxDistance > 0 ? currentDistanceNm / maxDistance : 0;
  
  // Animate the line drawing when playing
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setAnimatedProgress(prev => {
          if (prev >= currentProgress) {
            return prev;
          }
          return Math.min(prev + 0.02, currentProgress);
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setAnimatedProgress(currentProgress);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentProgress]);
  
  // Current impact value
  const currentImpact = useMemo(() => {
    const point = data.find(d => d.distanceNm >= currentDistanceNm);
    return point || data[data.length - 1] || { distanceNm: 0, cumulativeImpactGallons: 0 };
  }, [data, currentDistanceNm]);
  
  // Color based on impact
  const impactColor = currentImpact.cumulativeImpactGallons >= 0 
    ? '#ef4444' // Red for negative (headwind = more fuel)
    : '#22c55e'; // Green for positive (tailwind = less fuel)
  
  // Calculate zero line Y position
  const zeroY = yScale(0);
  
  return (
    <div className="bg-slate-800/90 rounded-lg p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-300">💨 Wind Impact</div>
        <button
          onClick={onPlayPause}
          className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
      
      {/* Graph */}
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="overflow-visible">
          {/* Zero line (expected) */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          
          {/* Impact line */}
          {linePath && (
            <AnimatedLine
              points={linePath}
              progress={animatedProgress}
              color={impactColor}
            />
          )}
          
          {/* Current position dot */}
          {animatedProgress > 0 && (
            <circle
              cx={xScale(currentDistanceNm)}
              cy={yScale(currentImpact.cumulativeImpactGallons)}
              r="4"
              fill={impactColor}
              stroke="white"
              strokeWidth="2"
            />
          )}
          
          {/* X-axis labels */}
          <text x={padding.left} y={height - 5} fill="#64748b" fontSize="8">0 NM</text>
          <text x={width / 2} y={height - 5} fill="#64748b" fontSize="8" textAnchor="middle">{Math.round(maxDistance / 2)} NM</text>
          <text x={width - padding.right} y={height - 5} fill="#64748b" fontSize="8" textAnchor="end">{Math.round(maxDistance)} NM</text>
          
          {/* Y-axis label */}
          <text x={padding.left + 5} y={padding.top + 8} fill="#64748b" fontSize="7">+</text>
          <text x={padding.left + 5} y={zeroY - 5} fill="#64748b" fontSize="7" textAnchor="middle">0</text>
          <text x={padding.left + 5} y={height - padding.bottom - 5} fill="#64748b" fontSize="7">-</text>
        </svg>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-xs">
        <div>
          <span className="text-slate-400">Distance: </span>
          <span className="text-white font-medium">{Math.round(currentDistanceNm)} NM</span>
        </div>
        <div>
          <span className="text-slate-400">Impact: </span>
          <span 
            className="font-medium"
            style={{ color: impactColor }}
          >
            {currentImpact.cumulativeImpactGallons >= 0 ? '+' : ''}
            {currentImpact.cumulativeImpactGallons.toFixed(1)} gal
          </span>
        </div>
        <div>
          <span className="text-slate-400">$ </span>
          <span 
            className="font-medium"
            style={{ color: impactColor }}
          >
            {currentImpact.cumulativeImpactGallons >= 0 ? '+' : ''}
            ${(currentImpact.cumulativeImpactGallons * fuelPricePerGallon).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate mock wind impact data
export function generateWindImpactData(
  trackPoints: { lat: number; lon: number }[],
  averageWind: number = 0 // knots headwind (+), tailwind (-)
): WindImpactPoint[] {
  if (trackPoints.length < 2) return [];
  
  const data: WindImpactPoint[] = [];
  let totalDistance = 0;
  let cumulativeImpact = 0;
  
  // Simple distance calculation (Haversine would be better but this works for demo)
  for (let i = 1; i < trackPoints.length; i++) {
    const lat1 = trackPoints[i - 1].lat;
    const lon1 = trackPoints[i - 1].lon;
    const lat2 = trackPoints[i].lat;
    const lon2 = trackPoints[i].lon;
    
    // Simple approximate distance
    const dLat = lat2 - lat1;
    const dLon = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
    const distanceNm = Math.sqrt(dLat * dLat + dLon * dLon) * 60; // Rough conversion
    
    totalDistance += distanceNm;
    
    // Wind impact: headwind increases fuel burn, tailwind decreases
    // Assume 10 gallons/hour per 10 knots wind difference
    const windImpactPerNm = averageWind / 60; // Simplified
    cumulativeImpact += windImpactPerNm * distanceNm;
    
    data.push({
      distanceNm: Math.round(totalDistance),
      cumulativeImpactGallons: Math.round(cumulativeImpact * 10) / 10
    });
  }
  
  return data;
}
