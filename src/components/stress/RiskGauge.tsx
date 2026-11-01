'use client';

import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskGaugeProps {
  appliedCount: number;
  totalScenarios: number;
  totalFinancialImpact: number;
  totalScheduleImpact: number;
}

export function RiskGauge({
  appliedCount,
  totalScenarios,
  totalFinancialImpact,
  totalScheduleImpact,
}: RiskGaugeProps) {
  // Calculate risk score: 15% baseline + 25% per applied scenario up to 100%
  const riskPercent = Math.min(100, Math.max(12, 12 + appliedCount * 28));

  // Determine label and colors
  let level = 'Low Vulnerability';
  let badgeColor = 'badge-sage';
  let strokeColor = '#2E6F40';

  if (riskPercent > 70) {
    level = 'Critical Emergency Mode';
    badgeColor = 'badge-crimson';
    strokeColor = '#B91C1C';
  } else if (riskPercent > 35) {
    level = 'Elevated Contingency Active';
    badgeColor = 'badge-amber';
    strokeColor = '#D97706';
  }

  // Semi-circle SVG math
  const radius = 64;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (riskPercent / 100) * circumference;

  return (
    <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-[var(--ink)] flex items-center gap-2">
            {appliedCount > 0 ? (
              <ShieldAlert size={20} className="text-rose-500 animate-pulse" />
            ) : (
              <ShieldCheck size={20} className="text-[var(--success)]" />
            )}
            Celebration Risk &amp; Resilience Meter
          </h3>
          <p className="text-xs text-[var(--stone-500)] mt-0.5">
            Real-time sensitivity analysis across weather, vendor no-shows, and crowd surges
          </p>
        </div>
        <span className={`badge ${badgeColor} text-xs font-bold py-1 px-3.5`}>
          {level}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Semi Circle Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
            <svg className="w-44 h-44 -rotate-180" viewBox="0 0 160 160">
              {/* Background Arch */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Active Meter Arch */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute bottom-1 flex flex-col items-center pointer-events-none text-center">
              <span className="font-serif text-3xl font-bold text-[var(--ink)] leading-none">
                {riskPercent}%
              </span>
              <span className="text-[10px] text-[var(--stone-500)] font-semibold uppercase tracking-wider mt-1">
                Risk Score
              </span>
            </div>
          </div>

          <div className="flex justify-between w-44 text-[10px] text-[var(--stone-400)] font-mono mt-1 px-1">
            <span>0% Safe</span>
            <span>100% Extreme</span>
          </div>
        </div>

        {/* Resilience Metrics */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-center shadow-2xs">
            <div className="text-[10px] text-[var(--stone-500)] uppercase font-bold tracking-wider mb-1">
              Active Crises
            </div>
            <div className={`font-serif text-2xl font-bold ${appliedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--success)]'}`}>
              {appliedCount} <span className="text-xs text-[var(--stone-400)] font-sans">/ {totalScenarios}</span>
            </div>
            <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
              {appliedCount === 0 ? 'All systems nominal' : 'Protocols active'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-center shadow-2xs">
            <div className="text-[10px] text-[var(--stone-500)] uppercase font-bold tracking-wider mb-1">
              Contingency Drain
            </div>
            <div className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{Math.round(totalFinancialImpact / 1000)}k
            </div>
            <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
              From backup contracts
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-center shadow-2xs">
            <div className="text-[10px] text-[var(--stone-500)] uppercase font-bold tracking-wider mb-1">
              Timeline Delay
            </div>
            <div className="font-serif text-2xl font-bold text-[var(--primary)]">
              +{totalScheduleImpact}m
            </div>
            <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
              Run sheet cascade
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
