'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { BudgetLineItem } from '@/types/event';
import { formatINR } from '@/lib/utils';

const PALETTE = [
  '#6B1D2A', // Royal Crimson
  '#C9A24B', // Imperial Gold
  '#F2A33A', // Marigold Amber
  '#E4572E', // Terracotta
  '#2E6F40', // Royal Sage
  '#8B4513', // Warm Sienna
  '#D97706', // Ochre
];

interface BudgetDonutChartProps {
  items: BudgetLineItem[];
  totalBudget: number;
}

export function BudgetDonutChart({ items, totalBudget }: BudgetDonutChartProps) {
  const chartData = items.map((item, index) => ({
    name: item.category,
    vendor: item.vendorName,
    value: item.projectedFinalInvoice,
    color: PALETTE[index % PALETTE.length],
  }));

  const totalProjected = items.reduce((sum, item) => sum + item.projectedFinalInvoice, 0);

  return (
    <div className="rounded-[32px] p-6 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
            Category Allocation Breakdown
          </h3>
          <p className="text-xs text-[var(--stone-500)] mt-0.5">
            Visual distribution of vendor contracts &amp; projected commitments
          </p>
        </div>
        <span className="badge badge-stone text-[11px] font-semibold">
          {items.length} Expense Categories
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="lg:col-span-5 h-[240px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="var(--card)"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-2xl p-3 bg-[var(--surface)] border border-[var(--border-subtle)] shadow-xl text-xs">
                        <div className="font-serif font-bold text-[var(--ink)]">{data.name}</div>
                        <div className="text-[11px] text-[var(--stone-500)]">{data.vendor}</div>
                        <div className="text-sm font-bold text-[var(--primary)] mt-1">
                          {formatINR(data.value)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold text-[var(--stone-500)] tracking-wider">
              Projected
            </span>
            <span className="font-serif text-lg font-bold text-[var(--ink)] leading-tight">
              {formatINR(totalProjected)}
            </span>
            <span className="text-[10px] text-[var(--stone-500)]">
              of {formatINR(totalBudget)}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {chartData.map((item) => {
            const pct = Math.round((item.value / totalProjected) * 100);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:bg-[var(--card-hover)] transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-[var(--ink)] truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-[var(--stone-500)] truncate">
                      {item.vendor}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-xs font-bold text-[var(--ink)]">
                    {formatINR(item.value)}
                  </div>
                  <div className="text-[10px] text-[var(--stone-500)] font-medium">
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
