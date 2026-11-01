'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarClock, RotateCcw, MessageCircle, CheckCircle,
  Clock, Zap, AlertCircle, Phone, Radio, Users, Check,
  Search, X, AlertTriangle
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import type { RunSheetItem, RunSheetStatus } from '@/types/event';
import { WhatsAppShareCardModal } from '@/components/shared/WhatsAppShareCardModal';

const STATUS_CONFIG: Record<RunSheetStatus, { label: string; badgeClass: string }> = {
  completed: {
    label: 'Done ✓',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold',
  },
  live: {
    label: 'LIVE NOW',
    badgeClass: 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs animate-pulse font-extrabold',
  },
  upcoming: {
    label: 'Upcoming',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold',
  },
  delayed: {
    label: 'DELAYED ⚠️',
    badgeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold animate-ping-slow',
  },
};

function RunSheetRow({
  item,
  onDelay,
  onStatusChange,
}: {
  item: RunSheetItem;
  onDelay: (id: string, mins: number) => void;
  onStatusChange: (id: string, status: RunSheetStatus) => void;
}) {
  const sc = STATUS_CONFIG[item.status];
  const isActive = item.status === 'live' || item.status === 'upcoming' || item.status === 'delayed';

  return (
    <div className="relative pl-14 pb-5 last:pb-0">
      {/* Timeline Node */}
      <div className="absolute left-0 top-0 flex flex-col items-center" style={{ width: 44 }}>
        <button
          onClick={() => {
            const nextStatus: Record<RunSheetStatus, RunSheetStatus> = {
              upcoming: 'live',
              live: 'completed',
              delayed: 'completed',
              completed: 'upcoming',
            };
            onStatusChange(item.id, nextStatus[item.status]);
          }}
          title={`Click to cycle task status (currently ${item.status})`}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center z-10 border shadow-xs transition-all cursor-pointer hover:scale-105 ${
            item.status === 'completed'
              ? 'bg-[var(--success)] border-[var(--success)] text-white'
              : item.status === 'live'
              ? 'bg-[var(--primary)] border-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20 scale-105'
              : item.status === 'delayed'
              ? 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-500/20'
              : 'bg-[var(--card)] border-[var(--border-subtle)] text-[var(--stone-400)] hover:border-[var(--primary)]'
          }`}
        >
          {item.status === 'completed' ? (
            <CheckCircle size={18} />
          ) : item.status === 'live' ? (
            <Zap size={18} />
          ) : item.status === 'delayed' ? (
            <AlertCircle size={18} />
          ) : (
            <Clock size={18} />
          )}
        </button>
        {/* Connector line */}
        <div className="w-0.5 flex-1 bg-[var(--border-subtle)] mt-2" style={{ minHeight: 24 }} />
      </div>

      {/* Card */}
      <div
        className={`p-5 rounded-[28px] border transition-all duration-300 shadow-soft hover:shadow-hover ${
          item.status === 'live'
            ? 'border-l-4 border-l-[var(--primary)] border-[var(--primary)]/40 bg-[var(--card)]'
            : item.status === 'delayed'
            ? 'border-l-4 border-l-rose-600 border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
            : 'border-[var(--border-subtle)] bg-[var(--card)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-serif text-base sm:text-lg font-bold text-[var(--ink)]">{item.title}</span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${sc.badgeClass}`}>
                {sc.label}
              </span>
              {item.delayMins > 0 && (
                <span className="badge badge-crimson text-[10px] font-bold">
                  +{item.delayMins}m Cascade Shift
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--stone-500)] flex-wrap">
              <span className="bg-[var(--surface)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-xl">
                <strong className="text-[var(--ink)] font-mono font-semibold">{item.currentTime}</strong>
                {item.delayMins > 0 && (
                  <span className="text-[var(--stone-400)] line-through ml-1.5 font-mono text-[11px]">{item.baseTime}</span>
                )}
                {' '}· {item.durationMins}m run
              </span>
              <span className="flex items-center gap-1 font-medium text-[var(--ink)]">
                <Users size={13} className="text-[var(--primary)]" /> {item.owner}
              </span>

              {/* Dependency Indicator */}
              {item.dependencyNote ? (
                <span className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-xl border border-amber-500/20 font-medium">
                  🔗 {item.dependencyNote}
                </span>
              ) : (
                <span className="text-[10px] text-[var(--stone-400)] italic">
                  No upstream dependencies
                </span>
              )}
            </div>

            {/* Vendor contact status */}
            <div className="mt-2.5 flex items-center gap-3 flex-wrap text-xs">
              {item.vendorPhone ? (
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-[var(--primary)]" />
                  <a
                    href={`tel:${item.vendorPhone}`}
                    className="text-xs text-[var(--primary)] font-mono font-medium hover:underline"
                  >
                    {item.vendorPhone}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg border border-amber-500/20">
                  <AlertTriangle size={11} />
                  <span>Missing coordinator phone contact</span>
                </div>
              )}
            </div>
          </div>

          {/* Time-shift cascade controls */}
          {isActive && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--stone-500)] mr-1">Cascade:</span>
              <button
                id={`delay15-${item.id}`}
                onClick={() => onDelay(item.id, 15)}
                className="btn btn-sm text-xs py-1.5 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-bold rounded-full transition-colors cursor-pointer"
                title="Add 15-minute delay cascade downstream"
              >
                +15m
              </button>
              <button
                id={`delay30-${item.id}`}
                onClick={() => onDelay(item.id, 30)}
                className="btn btn-sm text-xs py-1.5 px-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold rounded-full transition-colors cursor-pointer"
                title="Add 30-minute delay cascade downstream"
              >
                +30m
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommandTab() {
  const { runSheet, cascadeDelay, resetSchedule, event, saveRunSheetItem } = useApp();
  const [broadcastCopied, setBroadcastCopied] = useState(false);
  const [showWACardModal, setShowWACardModal] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'all' | RunSheetStatus>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract distinct owners dynamically from persisted timeline items
  const distinctOwners = useMemo(() => {
    const set = new Set<string>();
    runSheet.forEach((r) => {
      if (r.owner && r.owner.trim().length > 0) {
        set.add(r.owner.trim());
      }
    });
    return Array.from(set).sort();
  }, [runSheet]);

  // Filtered timeline records
  const filteredRunSheet = useMemo(() => {
    return runSheet.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // 2. Owner Filter
      if (ownerFilter !== 'all' && item.owner !== ownerFilter) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOwner = item.owner.toLowerCase().includes(q);
        const matchDep = (item.dependencyNote || '').toLowerCase().includes(q);
        if (!matchTitle && !matchOwner && !matchDep) return false;
      }
      return true;
    });
  }, [runSheet, statusFilter, ownerFilter, searchQuery]);

  const totalDelay = Math.max(...runSheet.map((r) => r.delayMins), 0);
  const delayedCount = runSheet.filter((r) => r.delayMins > 0).length;
  const liveCount = runSheet.filter((r) => r.status === 'live').length;
  const upcomingCount = runSheet.filter((r) => r.status === 'upcoming').length;
  const completedCount = runSheet.filter((r) => r.status === 'completed').length;

  function handleStatusChange(id: string, status: RunSheetStatus) {
    saveRunSheetItem({ id, status });
  }

  function buildBroadcast() {
    const lines = [
      `📋 *Executive Run-of-Show Broadcast — ${event.title}*`,
      ``,
      `⏱ Overall cascade shift: ${totalDelay > 0 ? `+${totalDelay} minutes` : 'On schedule'}`,
      ``,
      ...runSheet.map(
        (r) =>
          `${r.currentTime} — ${r.title}${r.delayMins > 0 ? ` *(+${r.delayMins}m shift)* ⚠️` : ' ✓'}`
      ),
      ``,
      `_Please sync on-site teams and coordinators accordingly._`,
      `_Dispatched via Velmora Spark Executive Ops Control Center_`,
    ];
    return lines.join('\n');
  }

  function handleCopyBroadcast() {
    navigator.clipboard.writeText(buildBroadcast()).then(() => {
      setBroadcastCopied(true);
      setTimeout(() => setBroadcastCopied(false), 2500);
    });
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* Executive Control Center Hero */}
      <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--terracotta-muted)] text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider border border-[var(--primary)]/20">
                <Radio size={12} className="animate-pulse" /> LIVE OPS CENTER
              </span>
              <span className="text-xs text-[var(--stone-500)] font-mono">{event.date}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)] flex items-center gap-2.5">
              <CalendarClock size={24} className="text-[var(--primary)]" />
              Run-of-Show Master Timeline
            </h2>
            <p className="text-xs text-[var(--stone-500)] mt-1">
              Deterministic cascade scheduling · {event.title} · Live backend synchronized
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap items-center">
            {/* Reset */}
            {totalDelay > 0 && (
              <button
                id="reset-schedule-btn"
                onClick={() => resetSchedule()}
                className="btn btn-ghost text-xs py-2 px-3.5 border border-[var(--border-subtle)] text-[var(--ink)] hover:bg-[var(--surface)] flex items-center gap-1.5 rounded-full cursor-pointer"
              >
                <RotateCcw size={13} /> Reset Timeline
              </button>
            )}

            {/* Copy broadcast */}
            <button
              id="copy-broadcast-btn"
              onClick={handleCopyBroadcast}
              className={`btn text-xs py-2.5 px-4 rounded-full border flex items-center gap-2 transition-all cursor-pointer ${
                broadcastCopied
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                  : 'btn-ghost border-[var(--border-subtle)]'
              }`}
            >
              {broadcastCopied ? (
                <>
                  <Check size={14} className="text-emerald-700" /> Copied Brief! ✓
                </>
              ) : (
                <>
                  <MessageCircle size={14} /> Copy Timeline Brief
                </>
              )}
            </button>

            {/* WhatsApp Broadcast Card */}
            <button
              id="wa-broadcast-btn"
              onClick={() => setShowWACardModal(true)}
              className="btn btn-primary text-xs py-2.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer font-medium"
            >
              <MessageCircle size={14} /> WhatsApp Broadcast Card
            </button>
          </div>
        </div>

        {/* Ops Status Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--stone-400)] block">Timeline Shift</span>
            <strong className={`font-serif text-lg ${totalDelay > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {totalDelay > 0 ? `+${totalDelay} mins` : 'On Schedule'}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--stone-400)] block">Live / Delayed Cues</span>
            <strong className="font-serif text-lg text-[var(--primary)]">{liveCount} live · {delayedCount} delayed</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--stone-400)] block">Upcoming Next</span>
            <strong className="font-serif text-lg text-[var(--ink)]">{upcomingCount} tasks</strong>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--stone-400)] block">Completed</span>
            <strong className="font-serif text-lg text-[var(--success)]">{completedCount} of {runSheet.length} done</strong>
          </div>
        </div>
      </div>

      {/* Interactive Coordinator & Status Filter Bar */}
      <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border-subtle)] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[var(--primary)] text-white shadow-xs font-bold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] hover:text-[var(--ink)]'
              }`}
            >
              All ({runSheet.length})
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'live'
                  ? 'bg-[var(--primary)] text-white shadow-xs font-bold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] hover:text-[var(--ink)]'
              }`}
            >
              ⚡ Live ({liveCount})
            </button>
            <button
              onClick={() => setStatusFilter('delayed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'delayed'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] hover:text-[var(--ink)]'
              }`}
            >
              ⚠️ Delayed ({delayedCount})
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] hover:text-[var(--ink)]'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] hover:text-[var(--ink)]'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {/* Owner Dropdown & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Owner filter */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--stone-500)]">
              <Users size={14} className="text-[var(--stone-400)]" />
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--ink)] rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                aria-label="Filter by task coordinator"
              >
                <option value="all">All Coordinators ({distinctOwners.length})</option>
                {distinctOwners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner} ({runSheet.filter((r) => r.owner === owner).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--stone-400)]" />
              <input
                type="text"
                placeholder="Search cues & notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] text-xs rounded-xl text-[var(--ink)] placeholder:text-[var(--stone-400)] w-36 sm:w-48 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--stone-400)] hover:text-[var(--ink)]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(statusFilter !== 'all' || ownerFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--stone-500)] flex-wrap">
            <span>Filtering showing {filteredRunSheet.length} of {runSheet.length} cues</span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setOwnerFilter('all');
                setSearchQuery('');
              }}
              className="text-[var(--primary)] font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Run Sheet Timeline List */}
      {filteredRunSheet.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[var(--card)] border border-[var(--border-subtle)] text-[var(--stone-500)] space-y-3">
          <CalendarClock size={32} className="mx-auto text-[var(--stone-400)]" />
          <h3 className="font-serif font-bold text-lg text-[var(--ink)]">No run-of-show cues found</h3>
          <p className="text-xs max-w-sm mx-auto">
            {runSheet.length === 0
              ? 'Your master timeline is currently empty. Add items in the Planner or Co-Planner tab to build your operational run sheet.'
              : 'No cues matched your active coordinator or status filters. Try clearing your filters.'}
          </p>
          {(statusFilter !== 'all' || ownerFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setOwnerFilter('all');
                setSearchQuery('');
              }}
              className="btn btn-sm btn-ghost rounded-full border border-[var(--border-subtle)] text-xs font-semibold"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredRunSheet.map((item) => (
            <RunSheetRow
              key={item.id}
              item={item}
              onDelay={(id, mins) => cascadeDelay(id, mins)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Visual WhatsApp Share Card Modal */}
      <WhatsAppShareCardModal
        isOpen={showWACardModal}
        onClose={() => setShowWACardModal(false)}
      />
    </div>
  );
}
