'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle, MessageCircle, TrendingUp,
  Leaf, Utensils, Phone, ShieldCheck, ChevronDown, ChevronUp, Copy, Check,
  Search, X, Tag
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { formatINR, formatINRFull, overrunPercent } from '@/lib/utils';
import type { BudgetLineItem } from '@/types/event';
import { BudgetDonutChart } from '@/components/budget/BudgetDonutChart';

function VendorRow({ item }: { item: BudgetLineItem }) {
  const [showTip, setShowTip] = useState(false);
  const [copied, setCopied] = useState(false);
  const overrun = overrunPercent(item.quotedAmount, item.projectedFinalInvoice);
  const isOverrun = overrun > 0;

  const statusConfig = {
    confirmed_24h: { label: 'Confirmed 24h ✓', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
    pending_ping:  { label: 'Pending Ping ⏳', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30' },
    at_risk:       { label: 'AT RISK ⚠️',     bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  };
  const sc = statusConfig[item.confirmationStatus];

  function buildWAMessage() {
    return encodeURIComponent(
      `Hi ${item.vendorName}! 👋\n\nThis is a 48-hour confirmation ping from Velmora Spark.\n\nCould you please confirm:\n✅ You are locked in for ${item.category} on the event date\n✅ Quoted amount: ${formatINRFull(item.quotedAmount)}\n✅ Any changes to the scope or cost\n\nPlease reply to confirm. Thank you! 🙏`
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(decodeURIComponent(buildWAMessage()));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`rounded-[28px] p-5 sm:p-6 border transition-all duration-300 bg-[var(--card)] shadow-soft hover:shadow-hover ${
      item.confirmationStatus === 'at_risk'
        ? 'border-l-4 border-l-rose-500 border-[var(--border-subtle)]'
        : 'border-[var(--border-subtle)]'
    }`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="badge badge-stone text-[10px] uppercase font-bold tracking-wider">{item.category}</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${sc.bg}`}>
              {sc.label}
            </span>
          </div>

          <h4 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug">{item.vendorName}</h4>

          {item.backupVendorName && item.backupVendorName !== 'TBD' && (
            <p className="text-xs text-[var(--stone-500)] mt-1">
              Backup Option: <span className="font-semibold text-[var(--ink)]">{item.backupVendorName}</span>{' '}
              <span className={item.backupVendorDelta < 0 ? 'text-[var(--success)] font-medium' : 'text-amber-600 font-medium'}>
                ({item.backupVendorDelta < 0 ? '' : '+'}{formatINR(item.backupVendorDelta)})
              </span>
            </p>
          )}

          {item.vendorPhone && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--primary)] font-mono">
              <Phone size={12} />
              <a href={`tel:${item.vendorPhone}`} className="hover:underline">
                {item.vendorPhone}
              </a>
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-[10px] uppercase font-bold text-[var(--stone-500)] tracking-wider">Projected Final</div>
          <div className={`font-serif text-lg sm:text-xl font-bold ${isOverrun ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--success)]'}`}>
            {formatINR(item.projectedFinalInvoice)}
            {isOverrun && <span className="text-xs ml-1 font-bold">+{overrun}%</span>}
          </div>
          <div className="text-[11px] text-[var(--stone-500)] mt-0.5">
            Quoted: {formatINR(item.quotedAmount)}
          </div>
        </div>
      </div>

      {/* Progress: committed / quoted / projected */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between text-xs text-[var(--stone-500)] mb-1.5">
          <span>Committed (Paid): <strong className="text-[var(--success)]">{formatINR(item.committedInstalments)}</strong></span>
          <span>Quoted Ceiling: <strong className="text-[var(--ink)]">{formatINR(item.quotedAmount)}</strong></span>
        </div>
        <div className="h-2 rounded-full overflow-hidden flex bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div
            className="h-full bg-[var(--success)] transition-all duration-500"
            style={{
              width: `${Math.min(100, (item.committedInstalments / item.projectedFinalInvoice) * 100)}%`,
            }}
          />
          <div
            className="h-full bg-stone-300 dark:bg-stone-700 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, ((item.quotedAmount - item.committedInstalments) / item.projectedFinalInvoice) * 100))}%`,
            }}
          />
          {isOverrun && (
            <div
              className="h-full bg-rose-500 animate-pulse"
              style={{
                width: `${Math.min(40, ((item.projectedFinalInvoice - item.quotedAmount) / item.projectedFinalInvoice) * 100)}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Overrun risk message */}
      {isOverrun && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{item.overrunRiskReason}</span>
        </div>
      )}

      {/* Quote challenge tip toggle */}
      <div className="mt-3.5">
        <button
          id={`tip-toggle-${item.id}`}
          onClick={() => setShowTip((v) => !v)}
          className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5 hover:underline"
        >
          <span>💡 Quote Challenge Tip</span>
          {showTip ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showTip && (
          <div className="mt-2 p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-xs text-[var(--ink)] animate-fade-in shadow-2xs font-sans">
            {item.quoteChallengeTip}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex-wrap">
        {item.vendorPhone && (
          <a
            id={`wa-ping-${item.id}`}
            href={`https://wa.me/${item.vendorPhone.replace(/[^0-9]/g, '')}?text=${buildWAMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm rounded-full text-xs"
            title="Opens pre-filled message in WhatsApp for manual review and dispatch"
          >
            <MessageCircle size={13} /> Draft WhatsApp Ping ↗
          </a>
        )}
        {item.vendorPhone && (
          <button
            id={`copy-ping-${item.id}`}
            onClick={handleCopy}
            className="btn btn-ghost btn-sm rounded-full text-xs"
          >
            {copied ? <Check size={13} className="text-[var(--success)]" /> : <Copy size={13} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Ping Script'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Plate Count Calculator ───────────────────────────────────────────────────

function PlateCountCalculator() {
  const { catering } = useApp();
  const [inviteCount, setInviteCount] = useState(catering.invitedCount);
  const [rsvpRate, setRsvpRate] = useState(Math.round((catering.rsvpConfirmed / catering.invitedCount) * 100));
  const [perPlate, setPerPlate] = useState(catering.perPlateCost);

  const calc = useMemo(() => {
    const rsvpConfirmed = Math.round(inviteCount * (rsvpRate / 100));
    const p50 = Math.round(rsvpConfirmed * 1.08); // some no-shows
    const p90 = Math.round(inviteCount * 0.9);    // 90% of invited
    const blind = Math.round(inviteCount * 1.15);
    const recommended = p90;
    const saved = (blind - recommended) * perPlate;
    const wasteKg = (blind - recommended) * 0.25; // ~0.25 kg per plate
    return { rsvpConfirmed, p50, p90, blind, recommended, saved, wasteKg };
  }, [inviteCount, rsvpRate, perPlate]);

  return (
    <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft mt-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center font-bold">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
              Auditable Buffet Plate-Count Calculator
            </h3>
            <p className="text-xs text-[var(--stone-500)] mt-0.5">
              Stochastic P50/P90 turnout modeling to prevent catering over-ordering and waste
            </p>
          </div>
        </div>
        <span className="badge badge-sage text-[10px] font-bold py-1 px-3">
          Zero Food Waste Target
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="invite-slider" className="text-xs font-semibold text-[var(--ink)]">
              Invited Guests
            </label>
            <span className="font-serif font-bold text-sm text-[var(--cta)] bg-[var(--terracotta-muted)] px-2.5 py-0.5 rounded-lg">
              {inviteCount}
            </span>
          </div>
          <input
            id="invite-slider"
            type="range" min={20} max={800} value={inviteCount}
            className="w-full"
            onChange={(e) => setInviteCount(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-[var(--stone-500)] mt-1 font-mono">
            <span>20</span>
            <span>800 guests</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="rsvp-slider" className="text-xs font-semibold text-[var(--ink)]">
              RSVP Confirmation Rate
            </label>
            <span className="font-serif font-bold text-sm text-[var(--cta)] bg-[var(--terracotta-muted)] px-2.5 py-0.5 rounded-lg">
              {rsvpRate}%
            </span>
          </div>
          <input
            id="rsvp-slider"
            type="range" min={30} max={100} value={rsvpRate}
            className="w-full"
            onChange={(e) => setRsvpRate(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-[var(--stone-500)] mt-1 font-mono">
            <span>30%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="perplate-slider" className="text-xs font-semibold text-[var(--ink)]">
              Per-Plate Cost
            </label>
            <span className="font-serif font-bold text-sm text-[var(--cta)] bg-[var(--terracotta-muted)] px-2.5 py-0.5 rounded-lg">
              ₹{perPlate}
            </span>
          </div>
          <input
            id="perplate-slider"
            type="range" min={100} max={3000} step={50} value={perPlate}
            className="w-full"
            onChange={(e) => setPerPlate(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-[var(--stone-500)] mt-1 font-mono">
            <span>₹100</span>
            <span>₹3,000</span>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-2xl p-4 text-center border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 shadow-2xs">
          <div className="text-[10px] text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider mb-1">Standard Blind Guess</div>
          <div className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400">{calc.blind}</div>
          <div className="text-[10px] text-[var(--stone-500)]">Invited + 15%</div>
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1.5">{formatINR(calc.blind * perPlate)}</div>
        </div>

        <div className="rounded-2xl p-4 text-center border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 shadow-2xs">
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider mb-1">P50 Expected</div>
          <div className="font-serif text-2xl font-bold text-amber-600 dark:text-amber-400">{calc.p50}</div>
          <div className="text-[10px] text-[var(--stone-500)]">RSVP Confirmed × 1.08</div>
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5">{formatINR(calc.p50 * perPlate)}</div>
        </div>

        <div className="rounded-2xl p-4 text-center border-2 border-[var(--success)] bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--success)]">P90 Safe Surge ✓</div>
          <div className="font-serif text-2xl font-bold text-[var(--success)]">{calc.p90}</div>
          <div className="text-[10px] font-medium text-[var(--success)]/90">Velmora Recommendation</div>
          <div className="text-xs font-bold text-[var(--success)] mt-1.5">{formatINR(calc.p90 * perPlate)}</div>
        </div>

        <div className="rounded-2xl p-4 text-center border-2 border-[var(--cta)] bg-[var(--terracotta-muted)] shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-[var(--cta)]">Net Savings</div>
          <div className="font-serif text-2xl font-bold text-[var(--cta)]">{formatINR(calc.saved)}</div>
          <div className="text-[10px] text-[var(--stone-500)]">vs Blind Guess</div>
          <div className="flex items-center justify-center gap-1 text-xs font-bold mt-1.5 text-[var(--success)]">
            <Leaf size={13} /> {calc.wasteKg.toFixed(1)} kg prevented
          </div>
        </div>
      </div>

      {/* Dietary splits */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <div className="text-xs font-semibold text-[var(--ink)] mb-3 flex items-center justify-between">
          <span>Dietary &amp; Seating Allocation (Auto-synced from RSVP)</span>
          <span className="text-[10px] text-[var(--stone-500)]">Audited by Kitchen Lead</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Jain Plates', count: catering.jainPlates, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500/20' },
            { label: 'Vegan Plates', count: catering.veganPlates, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-500/20' },
            { label: 'Allergy-Safe', count: catering.allergySafePlates, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500/20' },
            { label: 'Elderly Priority', count: catering.elderlySeatingCount, color: 'text-[var(--primary)]', bg: 'bg-[var(--terracotta-muted)]', border: 'border-[var(--primary)]/20' },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl p-3 text-center border ${item.border} ${item.bg}`}>
              <div className={`font-serif text-xl font-bold ${item.color}`}>{item.count}</div>
              <div className="text-xs font-semibold text-[var(--ink)]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Budget Tab Main ──────────────────────────────────────────────────────────

export default function BudgetTab() {
  const { budget, event, totalCommitted, totalProjected, contingencyBuffer, contingencyUsed } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vendorSearch, setVendorSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed_24h' | 'pending_ping' | 'at_risk'>('all');

  const totalQuoted = budget.reduce((s, b) => s + b.quotedAmount, 0);
  const overrunItems = budget.filter((b) => b.projectedFinalInvoice > b.quotedAmount);
  const bufferRemaining = contingencyBuffer - contingencyUsed;
  const budgetUsedPct = Math.min(100, (totalProjected / event.totalBudget) * 100);

  // Extract unique categories from actual database-backed budget items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(budget.map((b) => b.category)));
    return ['all', ...cats];
  }, [budget]);

  // Real-time filtered budget items
  const filteredBudget = useMemo(() => {
    return budget.filter((item) => {
      const q = vendorSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.vendorName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus =
        statusFilter === 'all' || item.confirmationStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [budget, selectedCategory, vendorSearch, statusFilter]);

  const filteredQuoted = filteredBudget.reduce((s, b) => s + b.quotedAmount, 0);

  function handleClearBudgetFilters() {
    setSelectedCategory('all');
    setVendorSearch('');
    setStatusFilter('all');
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: 'Total Budget', value: formatINR(event.totalBudget), sub: '100% target ceiling', color: 'text-[var(--ink)]' },
          { label: 'Total Quoted', value: formatINR(totalQuoted), sub: 'Sum of vendor quotes', color: 'text-[var(--ink)]' },
          { label: 'Committed (Paid)', value: formatINR(totalCommitted), sub: 'Disbursed advances', color: 'text-[var(--success)]' },
          {
            label: 'Projected Final',
            value: formatINR(totalProjected),
            sub: totalProjected > event.totalBudget ? `⚠️ +${overrunPercent(event.totalBudget, totalProjected)}% overrun` : '✓ Within budget target',
            color: totalProjected > event.totalBudget ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--success)]',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[28px] p-4 sm:p-5 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
            <div className="text-[10px] text-[var(--stone-500)] font-bold uppercase tracking-wider mb-1.5">{stat.label}</div>
            <div className={`font-serif text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[11px] text-[var(--stone-500)] mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Donut Allocation Chart */}
      <BudgetDonutChart items={budget} totalBudget={event.totalBudget} />

      {/* Proportional Invoice & Budget Bar */}
      <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)]">
                Committed vs. Projected Invoice Breakdown
              </h3>
              <p className="text-xs text-[var(--stone-500)] mt-0.5">
                Real-time disbursement vs. vendor quoted ceiling and buffer preservation
              </p>
            </div>
          </div>
          <span className="badge badge-stone text-xs font-semibold py-1 px-3">
            {budgetUsedPct.toFixed(1)}% of Target Budget
          </span>
        </div>

        {/* Multi-Segment Block Bar */}
        <div className="h-4 rounded-xl overflow-hidden flex bg-[var(--surface)] border border-[var(--border-subtle)] shadow-inner mb-4">
          <div
            style={{ width: `${Math.min(100, (totalCommitted / event.totalBudget) * 100)}%` }}
            className="bg-[var(--success)] h-full transition-all duration-700"
            title={`Committed (Paid): ${formatINR(totalCommitted)}`}
          />
          <div
            style={{ width: `${Math.max(0, Math.min(100 - (totalCommitted / event.totalBudget) * 100, ((totalQuoted - totalCommitted) / event.totalBudget) * 100))}%` }}
            className="bg-amber-500 h-full transition-all duration-700"
            title={`Pending Quoted: ${formatINR(Math.max(0, totalQuoted - totalCommitted))}`}
          />
          <div
            style={{ width: `${Math.max(0, Math.min(100, (bufferRemaining / event.totalBudget) * 100))}%` }}
            className="bg-[var(--primary)] h-full transition-all duration-700"
            title={`Contingency Buffer: ${formatINR(bufferRemaining)}`}
          />
          {totalProjected > event.totalBudget && (
            <div
              style={{ width: `${Math.min(30, ((totalProjected - event.totalBudget) / event.totalBudget) * 100)}%` }}
              className="bg-rose-600 h-full animate-pulse"
              title={`Budget Overrun: ${formatINR(totalProjected - event.totalBudget)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs flex-wrap items-center justify-between pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]" />
              <span>Paid: <strong>{formatINR(totalCommitted)}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pending: <strong>{formatINR(Math.max(0, totalQuoted - totalCommitted))}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              <span>Reserve: <strong>{formatINR(bufferRemaining)}</strong></span>
            </span>
            {totalProjected > event.totalBudget && (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>Overrun: +{formatINR(totalProjected - event.totalBudget)}</span>
              </span>
            )}
          </div>
          <span className="text-[var(--stone-500)] text-xs">Target Ceiling: {formatINR(event.totalBudget)}</span>
        </div>

        {/* Contingency meter */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              <span className="font-semibold text-xs text-[var(--ink)]">Crisis Contingency Reserve ({event.contingencyReservePercent}%)</span>
            </div>
            <span className={`badge ${bufferRemaining > 0 ? 'badge-sage' : 'badge-crimson'} font-semibold text-xs`}>
              {formatINR(bufferRemaining)} Remaining
            </span>
          </div>
          <div className="h-2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${Math.max(0, (bufferRemaining / contingencyBuffer) * 100)}%`,
                background: bufferRemaining > contingencyBuffer * 0.3 ? 'var(--success)' : 'var(--crimson)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Overrun Alert */}
      {overrunItems.length > 0 && (
        <div className="rounded-2xl p-4 flex items-start gap-3 text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-500/20">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>{overrunItems.length} vendor{overrunItems.length > 1 ? 's' : ''} with projected invoice overrun:</strong>{' '}
            {overrunItems.map((b) => b.vendorName).join(', ')}
          </div>
        </div>
      )}

      {/* ── Vendor Confirmation Radar & Category Filters ──────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--ink)] flex items-center gap-2">
              <CheckCircle size={18} className="text-[var(--primary)]" />
              48-Hour Vendor Confirmation Radar
            </h3>
            <p className="text-xs text-[var(--stone-500)] mt-0.5">
              Showing {filteredBudget.length} of {budget.length} contracts ({formatINR(filteredQuoted)} quoted)
            </p>
          </div>
          <span className="badge badge-stone text-xs">{budget.length} Total Contracts</span>
        </div>

        {/* Search & Category Filter Control Panel */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] space-y-3 mb-5">
          {/* Row 1: Search input */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--stone-400)]" />
              <input
                id="search-vendors-input"
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search vendors by name or scope..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--stone-400)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {vendorSearch && (
                <button
                  type="button"
                  onClick={() => setVendorSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--stone-400)] hover:text-[var(--ink)]"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {(vendorSearch || selectedCategory !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearBudgetFilters}
                className="btn btn-ghost btn-sm text-xs py-1.5 px-3 rounded-full text-[var(--primary)] hover:bg-[var(--terracotta-muted)] transition-colors flex items-center gap-1"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
            <span className="text-[11px] font-semibold text-[var(--stone-400)] uppercase tracking-wider mr-1">Category:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'all' ? budget.length : budget.filter((b) => b.category === cat).length;
              return (
                <button
                  key={cat}
                  id={`filter-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-all border ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold shadow-xs'
                      : 'bg-[var(--card)] text-[var(--ink)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Row 3: Confirmation Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] font-semibold text-[var(--stone-400)] uppercase tracking-wider mr-1">Radar:</span>
            {(['all', 'confirmed_24h', 'pending_ping', 'at_risk'] as const).map((st) => {
              const isSelected = statusFilter === st;
              const label =
                st === 'all'
                  ? 'All Status'
                  : st === 'confirmed_24h'
                  ? 'Confirmed 24h ✓'
                  : st === 'pending_ping'
                  ? 'Pending Ping ⏳'
                  : 'AT RISK ⚠️';
              const count = st === 'all' ? budget.length : budget.filter((b) => b.confirmationStatus === st).length;
              return (
                <button
                  key={st}
                  id={`filter-status-${st}`}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-all border ${
                    isSelected
                      ? st === 'at_risk'
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                        : st === 'confirmed_24h'
                        ? 'bg-[var(--success)] text-white border-[var(--success)] font-semibold shadow-xs'
                        : 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                      : 'bg-[var(--card)] text-[var(--stone-500)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtered Vendor Rows Render */}
        <div className="space-y-4">
          {filteredBudget.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border-subtle)]">
              <Tag size={32} className="mx-auto text-[var(--stone-400)] mb-2 opacity-50" />
              <h4 className="font-serif font-bold text-sm text-[var(--ink)] mb-1">No vendor contracts found</h4>
              <p className="text-xs text-[var(--stone-500)] mb-4">
                No vendors match your search query or selected category filter.
              </p>
              <button
                type="button"
                onClick={handleClearBudgetFilters}
                className="btn btn-ghost btn-sm text-xs rounded-full border border-[var(--border-subtle)] px-4 py-1.5"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredBudget.map((item) => (
              <VendorRow key={item.id} item={item} />
            ))
          )}
        </div>
      </div>

      {/* Plate count calculator */}
      <PlateCountCalculator />
    </div>
  );
}
