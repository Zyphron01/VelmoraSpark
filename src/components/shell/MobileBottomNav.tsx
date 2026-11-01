'use client';

import React from 'react';
import { Sparkles, Wallet, Zap, Users, CalendarClock } from 'lucide-react';
import { useApp } from '@/lib/app-store';
import type { TabId } from '@/types/event';

interface MobileTab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const MOBILE_TABS: MobileTab[] = [
  { id: 'planner', label: 'Planner', icon: <Sparkles size={18} /> },
  { id: 'budget',  label: 'Budget',  icon: <Wallet size={18} /> },
  { id: 'stress',  label: 'Stress',  icon: <Zap size={18} /> },
  { id: 'rsvp',    label: 'RSVPs',   icon: <Users size={18} /> },
  { id: 'command', label: 'Run Sheet', icon: <CalendarClock size={18} /> },
];

export function MobileBottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 h-[60px] md:hidden bg-[var(--card)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] shadow-[0_-4px_20px_rgba(43,26,23,0.06)] flex items-center justify-around px-1 select-none"
    >
      {MOBILE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 h-full min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors relative ${
              isActive
                ? 'text-[var(--primary)] font-bold'
                : 'text-[var(--stone-400)] hover:text-[var(--ink)] font-medium'
            }`}
          >
            {/* Active Pill Indicator Bar */}
            {isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-[var(--primary)] rounded-full animate-fade-in" />
            )}

            <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </div>

            <span className="text-[10px] tracking-tight leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

