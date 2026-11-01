'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap, CloudRain, UserX, Users, Power, RotateCcw,
  MessageCircle, AlertTriangle, ShieldCheck, ChevronDown,
  ChevronUp, Phone, Save
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { formatINR } from '@/lib/utils';
import type { StressScenario, TriggerType, BudgetLineItem } from '@/types/event';
import { RiskGauge } from '@/components/stress/RiskGauge';

const TRIGGER_ICONS: Record<TriggerType, React.ReactNode> = {
  monsoon_rain:        <CloudRain size={20} />,
  vendor_cancellation: <UserX size={20} />,
  guest_surge_20:      <Users size={20} />,
  power_sound_delay:   <Power size={20} />,
};

type ActionStepState = 'suggested' | 'in_progress' | 'completed';

interface SavedDecisionRecord {
  stepStates: Record<number, ActionStepState>;
  organizerNotes?: string;
  appliedAt?: string;
}

function ScenarioCard({
  scenario,
  eventBudget,
  contingencyRemaining,
  matchingVendor,
  onApply,
  onRevert,
  savedDecisions,
  onUpdateStepState,
}: {
  scenario: StressScenario;
  eventBudget: number;
  contingencyRemaining: number;
  matchingVendor?: BudgetLineItem;
  onApply: (id: string) => void;
  onRevert: (id: string) => void;
  savedDecisions?: SavedDecisionRecord;
  onUpdateStepState: (stepIndex: number, nextState: ActionStepState) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(scenario.applied);
  const icon = TRIGGER_ICONS[scenario.triggerType];

  // Calculate proportional financial impact on real event budget
  const budgetImpactPct = eventBudget > 0
    ? ((scenario.financialImpact / eventBudget) * 100).toFixed(1)
    : '0';

  const contingencyCovers = contingencyRemaining >= scenario.financialImpact;

  function buildBroadcastMessage() {
    return (
      `🚨 *Crisis Recovery Protocol Alert — ${scenario.title}*\n\n` +
      `📋 *Checklist & Status:*\n` +
      scenario.recoveryChecklist
        .map((item, i) => {
          const st = savedDecisions?.stepStates?.[i] || (scenario.applied ? 'in_progress' : 'suggested');
          const statusIcon = st === 'completed' ? '✅ [VERIFIED DONE]' : st === 'in_progress' ? '🔄 [IN PROGRESS]' : '⏳ [SUGGESTED]';
          return `${i + 1}. ${statusIcon} ${item}`;
        })
        .join('\n') +
      `\n\n⏱ Projected Schedule Shift: +${scenario.scheduleImpactMins} mins\n` +
      `💰 Budget Contingency Impact: ${formatINR(scenario.financialImpact)} (${budgetImpactPct}% of target)\n` +
      (matchingVendor
        ? `📞 Primary On-Record Vendor: ${matchingVendor.vendorName} (${matchingVendor.vendorPhone || 'No phone on file'})\n`
        : `⚠️ Alternate Vendor Status: Verification needed in Budget Tab\n`) +
      `\n_Prepared via Velmora Spark Crisis Recovery Protocol_`
    );
  }

  return (
    <div
      className={`rounded-[28px] overflow-hidden transition-all duration-300 border shadow-soft ${
        scenario.applied
          ? 'border-rose-500/60 ring-2 ring-rose-500/20 bg-[var(--card)]'
          : 'border-[var(--border-subtle)] bg-[var(--card)]'
      }`}
    >
      {/* Header Banner */}
      <div
        className={`p-5 sm:p-6 border-b transition-colors duration-300 ${
          scenario.applied
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500/20'
            : 'bg-[var(--surface)] border-[var(--border-subtle)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-300 ${
                scenario.applied
                  ? 'bg-rose-600 text-white scale-105 animate-pulse'
                  : 'bg-[var(--primary)] text-[var(--accent)]'
              }`}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  scenario.applied
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    : 'bg-[var(--card)] text-[var(--ink)] border-[var(--border-subtle)]'
                }`}>
                  {Math.round(scenario.probability * 100)}% Risk Probability
                </span>
                {scenario.scheduleImpactMins > 0 ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    +{scenario.scheduleImpactMins}m Timeline Shift
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[var(--stone-500)]">
                    Zero timeline delay
                  </span>
                )}
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug">
                {scenario.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {scenario.applied ? (
              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-600 text-white shadow-xs animate-pulse">
                <Zap size={12} /> PROTOCOL SIMULATED
              </div>
            ) : (
              <span className="text-[11px] font-semibold text-[var(--stone-500)] bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                Standby
              </span>
            )}

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-xl hover:bg-[var(--card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors cursor-pointer text-[var(--stone-500)]"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse recovery panel' : 'Expand recovery panel'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        {/* Real Data Financial Impact & Primary Vendor Linkage */}
        <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 bg-[var(--card)] border border-[var(--border-subtle)] shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--stone-500)]">
              <span>Financial Impact</span>
              <span>{budgetImpactPct}% of Total Budget</span>
            </div>
            <div className="font-serif text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              +{formatINR(scenario.financialImpact)}
            </div>
            <p className="text-[10px] text-[var(--stone-500)] mt-1">
              {contingencyCovers ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  ✓ Absorbed by remaining contingency buffer ({formatINR(contingencyRemaining)})
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  ⚠️ Exceeds remaining contingency reserve by {formatINR(scenario.financialImpact - contingencyRemaining)}
                </span>
              )}
            </p>
          </div>

          <div className="rounded-2xl p-3 bg-[var(--card)] border border-[var(--border-subtle)] shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--stone-500)]">
              Verified Primary / Backup Vendor
            </div>
            {matchingVendor ? (
              <div className="mt-1">
                <div className="text-xs font-bold text-[var(--ink)] truncate">
                  {matchingVendor.vendorName} ({matchingVendor.category})
                </div>
                <div className="text-[11px] text-[var(--primary)] font-mono flex items-center gap-1 mt-0.5">
                  <Phone size={10} />
                  {matchingVendor.vendorPhone || 'No emergency contact on file in Budget'}
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <div className="text-xs font-medium text-[var(--ink)]">
                  {scenario.backupVendorUsed}
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  Pre-vetted model estimate · Add verified alternate in Budget tab
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Step-by-Step Recovery Checklist Panel */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--stone-500)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[var(--primary)]" />
                Step-by-Step Action Protocol
              </h4>
              <span className="text-[10px] text-[var(--stone-400)]">
                Click any step badge to cycle: Suggested → In Progress → Verified Done
              </span>
            </div>

            <ol className="space-y-2.5">
              {scenario.recoveryChecklist.map((item, i) => {
                const stepState: ActionStepState =
                  savedDecisions?.stepStates?.[i] || (scenario.applied ? 'in_progress' : 'suggested');

                return (
                  <li
                    key={i}
                    className={`flex items-start justify-between gap-3 text-xs p-3 rounded-2xl border transition-all ${
                      stepState === 'completed'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/30 text-[var(--ink)]'
                        : stepState === 'in_progress'
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-500/30 text-[var(--ink)]'
                        : 'bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--stone-500)]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                          stepState === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : stepState === 'in_progress'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[var(--border-subtle)] text-[var(--stone-500)]'
                        }`}
                      >
                        {stepState === 'completed' ? '✓' : i + 1}
                      </div>
                      <span className={stepState === 'completed' ? 'line-through opacity-80' : 'font-medium'}>
                        {item}
                      </span>
                    </div>

                    {/* Interactive 3-way status pill */}
                    <button
                      onClick={() => {
                        const next: Record<ActionStepState, ActionStepState> = {
                          suggested: 'in_progress',
                          in_progress: 'completed',
                          completed: 'suggested',
                        };
                        onUpdateStepState(i, next[stepState]);
                      }}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border cursor-pointer transition-colors flex-shrink-0 ${
                        stepState === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-500/30'
                          : stepState === 'in_progress'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-500/30 animate-pulse'
                          : 'bg-[var(--card)] text-[var(--stone-500)] border-[var(--border-subtle)] hover:border-[var(--primary)]'
                      }`}
                      title="Click to cycle status"
                    >
                      {stepState === 'completed' ? 'Verified Done ✓' : stepState === 'in_progress' ? 'In Progress ⏳' : 'Suggested Action'}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Action Buttons & Explicit WhatsApp Communication */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {!scenario.applied ? (
                <button
                  id={`simulate-${scenario.id}`}
                  onClick={() => onApply(scenario.id)}
                  className="btn btn-primary text-xs py-2.5 px-4 rounded-full shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Zap size={14} /> Simulate &amp; Project Recovery
                </button>
              ) : (
                <button
                  id={`revert-${scenario.id}`}
                  onClick={() => onRevert(scenario.id)}
                  className="btn btn-ghost text-xs py-2 px-3.5 rounded-full border border-[var(--border-subtle)] text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} /> Revert Simulation
                </button>
              )}

              {/* Explicit WhatsApp Draft Button */}
              <a
                id={`broadcast-${scenario.id}`}
                href={`https://wa.me/?text=${encodeURIComponent(buildBroadcastMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-xs py-2.5 px-4 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 border-none shadow-xs flex items-center gap-2"
              >
                <MessageCircle size={14} /> Draft WhatsApp Alert ↗
              </a>
            </div>

            <div className="text-[10px] text-[var(--stone-400)] max-w-xs">
              * WhatsApp drafts open in a separate tab for manual review. Velmora Spark never sends messages automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StressTab() {
  const { scenarios, applyScenario, revertScenario, budget, event, contingencyBuffer, contingencyUsed } = useApp();

  const contingencyRemaining = contingencyBuffer - contingencyUsed;

  // Track interactive checklist decisions persisted in localStorage
  const [decisions, setDecisions] = useState<Record<string, SavedDecisionRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`velmora_crisis_decisions_${event.id}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load crisis decisions:', e);
      }
    }
    return {};
  });

  function handleUpdateStepState(scenarioId: string, stepIndex: number, nextState: ActionStepState) {
    setDecisions((prev) => {
      const cur = prev[scenarioId] || { stepStates: {} };
      const updated: SavedDecisionRecord = {
        ...cur,
        stepStates: {
          ...cur.stepStates,
          [stepIndex]: nextState,
        },
      };
      const allUpdated = { ...prev, [scenarioId]: updated };
      try {
        localStorage.setItem(`velmora_crisis_decisions_${event.id}`, JSON.stringify(allUpdated));
      } catch {}
      return allUpdated;
    });
  }

  const appliedCount = scenarios.filter((s) => s.applied).length;
  const totalFinancialImpact = scenarios
    .filter((s) => s.applied)
    .reduce((sum, s) => sum + s.financialImpact, 0);
  const totalScheduleImpact = scenarios
    .filter((s) => s.applied)
    .reduce((max, s) => Math.max(max, s.scheduleImpactMins), 0);

  // Link real budget line items to crisis scenarios
  const matchingVendors = useMemo(() => {
    const map: Record<TriggerType, BudgetLineItem | undefined> = {
      monsoon_rain: budget.find((b) => b.category.toLowerCase().includes('venue') || b.category.toLowerCase().includes('decor')),
      vendor_cancellation: budget.find((b) => b.category.toLowerCase().includes('cater') || b.category.toLowerCase().includes('photo')),
      guest_surge_20: budget.find((b) => b.category.toLowerCase().includes('cater') || b.category.toLowerCase().includes('f&b')),
      power_sound_delay: budget.find((b) => b.category.toLowerCase().includes('sound') || b.category.toLowerCase().includes('dj') || b.category.toLowerCase().includes('light')),
    };
    return map;
  }, [budget]);

  const atRiskVendors = budget.filter((b) => b.confirmationStatus === 'at_risk');

  return (
    <div className="animate-slide-up space-y-6">
      {/* Risk Speedometer Gauge */}
      <RiskGauge
        appliedCount={appliedCount}
        totalScenarios={scenarios.length}
        totalFinancialImpact={totalFinancialImpact}
        totalScheduleImpact={totalScheduleImpact}
      />

      {/* At-risk vendors alert */}
      {atRiskVendors.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-500/20">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-rose-600" />
          <div className="text-xs">
            <strong>Urgent Vendor Confirmation Alert:</strong>{' '}
            {atRiskVendors.map((v) => v.vendorName).join(', ')} {atRiskVendors.length === 1 ? 'is' : 'are'} AT RISK — confirmation not received.
            Switch to the Budget tab to dispatch follow-up communications.
          </div>
        </div>
      )}

      {/* Decision Persistence Badge */}
      <div className="flex items-center justify-between text-xs text-[var(--stone-500)] px-1">
        <span className="flex items-center gap-1.5 font-medium">
          <Save size={13} className="text-emerald-600" />
          Recovery decisions &amp; step checklists are persisted to your secured session
        </span>
        <span className="text-[10px] text-[var(--stone-400)]">
          Real Budget: {formatINR(event.totalBudget)}
        </span>
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            eventBudget={event.totalBudget}
            contingencyRemaining={contingencyRemaining}
            matchingVendor={matchingVendors[scenario.triggerType]}
            onApply={applyScenario}
            onRevert={revertScenario}
            savedDecisions={decisions[scenario.id]}
            onUpdateStepState={(stepIdx, nextSt) => handleUpdateStepState(scenario.id, stepIdx, nextSt)}
          />
        ))}
      </div>
    </div>
  );
}
