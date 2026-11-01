'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wallet, Zap, Users, CalendarClock } from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { useI18n } from '@/lib/i18n';
import type { TabId } from '@/types/event';

export function TabBar() {
  const { activeTab, setActiveTab, executiveView } = useApp();
  const { t } = useI18n();

  const tabs: { id: TabId; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'planner', label: t.tabs.planner, shortLabel: 'Planner', icon: <Sparkles size={15} /> },
    { id: 'budget', label: t.tabs.budget, shortLabel: 'Budget', icon: <Wallet size={15} /> },
    { id: 'stress', label: t.tabs.stress, shortLabel: 'Stress Radar', icon: <Zap size={15} /> },
    { id: 'rsvp', label: t.tabs.rsvps, shortLabel: 'RSVPs', icon: <Users size={15} /> },
    { id: 'command', label: t.tabs.command, shortLabel: 'Run Sheet', icon: <CalendarClock size={15} /> },
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <nav
        role="tablist"
        aria-label="Celebration operations tabs"
        className={`relative flex items-center gap-1.5 p-1.5 rounded-2xl border transition-all min-w-max md:min-w-0 ${
          executiveView
            ? 'bg-black/30 border-white/10'
            : 'bg-[var(--card)]/90 border-[var(--border-subtle)] shadow-xs'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                isActive
                  ? 'text-white'
                  : executiveView
                  ? 'text-white/60 hover:text-white hover:bg-white/5'
                  : 'text-[var(--ink)]/70 hover:text-[var(--ink)] hover:bg-[var(--bg)]/60'
              }`}
            >
              {tab.icon}
              <span className="text-xs sm:text-sm font-semibold">{tab.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[#8E2B3E] shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
