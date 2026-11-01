'use client';

import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { formatINR } from '@/lib/utils';

export function WhatIfSimulator() {
  const { event, totalProjected, contingencyBuffer } = useApp();

  const [guestSurgePct, setGuestSurgePct] = useState(10);
  const [vendorOverrunPct, setVendorOverrunPct] = useState(5);

  const baseGuests = event.invitedCount;
  const estimatedSurgeGuests = Math.round(baseGuests * (1 + guestSurgePct / 100));
  const plateDeltaCost = (estimatedSurgeGuests - baseGuests) * 1800;
  const vendorDeltaCost = Math.round((totalProjected * vendorOverrunPct) / 100);
  const simulatedTotal = totalProjected + plateDeltaCost + vendorDeltaCost;
  const simulatedDelta = simulatedTotal - event.totalBudget;

  return (
    <div className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center font-bold">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
              What-If Financial Stress Simulator
            </h3>
            <p className="text-xs text-[var(--stone-500)] mt-0.5">
              Simulate peak turnout surges and vendor cost variance against your contingency reserve
            </p>
          </div>
        </div>
        <span className="badge badge-amber text-[10px] font-bold py-1 px-3">
          Instant Stress Math
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-[var(--ivory)] border border-[var(--border-subtle)] mb-5">
        {/* Slider 1: Guest Surge */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="guest-surge-slider" className="text-xs font-bold text-[var(--ink)]">
              Guest Turnout Surge:
            </label>
            <span className="font-serif font-bold text-sm text-[var(--primary)] bg-[var(--card)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)]">
              +{guestSurgePct}% ({estimatedSurgeGuests} guests)
            </span>
          </div>
          <input
            id="guest-surge-slider"
            type="range"
            min={0}
            max={35}
            step={5}
            value={guestSurgePct}
            onChange={(e) => setGuestSurgePct(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-[var(--stone-400)] mt-1">
            <span>0% (Baseline)</span>
            <span>+35% Peak Surge</span>
          </div>
        </div>

        {/* Slider 2: Vendor Overrun Risk */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="vendor-variance-slider" className="text-xs font-bold text-[var(--ink)]">
              Vendor Price Drift Variance:
            </label>
            <span className="font-serif font-bold text-sm text-[var(--accent)] bg-[var(--card)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)]">
              +{vendorOverrunPct}% ({formatINR(vendorDeltaCost)})
            </span>
          </div>
          <input
            id="vendor-variance-slider"
            type="range"
            min={0}
            max={20}
            step={2}
            value={vendorOverrunPct}
            onChange={(e) => setVendorOverrunPct(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-[var(--stone-400)] mt-1">
            <span>0% (Locked Quotes)</span>
            <span>+20% High Variance</span>
          </div>
        </div>
      </div>

      {/* Simulation Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border-subtle)] text-center shadow-2xs">
          <div className="text-[10px] text-[var(--stone-400)] font-bold uppercase tracking-wider mb-1">
            Simulated Total Outlay
          </div>
          <div className="font-serif text-xl font-bold text-[var(--ink)]">
            {formatINR(simulatedTotal)}
          </div>
          <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
            +{formatINR(plateDeltaCost + vendorDeltaCost)} above projected
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border-subtle)] text-center shadow-2xs">
          <div className="text-[10px] text-[var(--stone-400)] font-bold uppercase tracking-wider mb-1">
            Contingency Absorption
          </div>
          <div
            className={`font-serif text-xl font-bold ${
              plateDeltaCost + vendorDeltaCost <= contingencyBuffer
                ? 'text-[var(--success)]'
                : 'text-[var(--crimson)]'
            }`}
          >
            {plateDeltaCost + vendorDeltaCost <= contingencyBuffer
              ? 'Absorbed ✓'
              : 'Deficit Alert ⚠️'}
          </div>
          <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
            Reserve buffer: {formatINR(contingencyBuffer)}
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border text-center shadow-2xs ${
            simulatedDelta <= 0
              ? 'bg-[var(--sage-muted)] border-[var(--success)]/30'
              : 'bg-[var(--crimson-muted)] border-[var(--crimson)]/30'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--ink)]">
            Net Budget Target Delta
          </div>
          <div
            className={`font-serif text-xl font-bold ${
              simulatedDelta <= 0 ? 'text-[var(--success)]' : 'text-[var(--crimson)]'
            }`}
          >
            {simulatedDelta <= 0
              ? `${formatINR(Math.abs(simulatedDelta))} Under Target`
              : `+${formatINR(simulatedDelta)} Overrun`}
          </div>
          <div className="text-[10px] text-[var(--stone-500)] mt-0.5">
            {simulatedDelta <= 0 ? 'Comfortably within budget' : 'Requires buffer authorization'}
          </div>
        </div>
      </div>
    </div>
  );
}
