'use client';

import React from 'react';

interface StatRingProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export function StatRing({
  value,
  max,
  label,
  sublabel,
  size = 72,
  strokeWidth = 6,
  color = 'var(--primary)',
  trackColor = 'var(--border-subtle)',
}: StatRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif font-bold text-xs text-[var(--ink)]">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="mt-1.5">
        <span className="text-[11px] font-bold text-[var(--ink)] block">{label}</span>
        {sublabel && <span className="text-[10px] text-[var(--stone-400)] block">{sublabel}</span>}
      </div>
    </div>
  );
}
