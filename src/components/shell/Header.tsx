'use client';

import React, { useState } from 'react';
import {
  Sparkles, ChevronDown, Check,
  RotateCcw, FileText, Zap,
  Eye, EyeOff, MessageCircle, X, Settings
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { PRESETS, type PresetKey } from '@/lib/demo-data';
import { formatINR } from '@/lib/utils';
import type { TabId } from '@/types/event';
import { LanguageToggle } from '@/components/shell/LanguageToggle';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { TabBar } from '@/components/shell/TabBar';
import { replayCurtainEntrance } from '@/components/ui/CurtainOpening';
import { WhatsAppShareCardModal } from '@/components/shared/WhatsAppShareCardModal';

interface HeaderProps {
  tabs?: { id: TabId; label: string; icon: React.ReactNode; shortLabel: string }[];
  onOpenBrief: () => void;
  onCopyBrief: () => void;
  copied: boolean;
}

export default function Header({ onOpenBrief, onCopyBrief, copied }: HeaderProps) {
  const {
    preset, setPreset,
    event,
    setActiveTab,
    executiveView, setExecutiveView,
    totalProjected, contingencyBuffer, contingencyUsed,
    dbSource, isOrganizer, isDbSyncing,
    customEvents, switchToCustomEvent, setShowCreateModal,
  } = useApp();

  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [showWACardModal, setShowWACardModal] = useState(false);

  const bufferRemaining = contingencyBuffer - contingencyUsed;
  const bufferPct = Math.max(0, Math.min(100, (bufferRemaining / contingencyBuffer) * 100));
  const overrunPct = totalProjected > event.totalBudget
    ? Math.round(((totalProjected - event.totalBudget) / event.totalBudget) * 100)
    : 0;

  function handleLaunchDemoMode() {
    setPreset('wedding');
    setDemoModeActive(true);
    setActiveTab('planner');
    setTimeout(() => setDemoModeActive(false), 4000);
  }

  // Label configuration based on actual data source
  const statusBadge = isDbSyncing ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
      <span>Syncing Neon...</span>
    </span>
  ) : dbSource === 'neon' ? (
    isOrganizer ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Neon: Organizer Verified ✓</span>
        <span className="sm:hidden">Neon Live ✓</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="hidden sm:inline">Neon: Live Event (Read-Only)</span>
        <span className="sm:hidden">Read-Only</span>
      </span>
    )
  ) : dbSource === 'local_custom' ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/40">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span className="hidden sm:inline">👑 Custom Celebration (Saved in Browser)</span>
      <span className="sm:hidden">👑 Custom</span>
    </span>
  ) : dbSource === 'error' ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      <span>Event Not Found (404)</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--surface)] text-[var(--stone-500)] border border-[var(--border-subtle)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FFAE34]" />
      <span className="hidden sm:inline">Demo Workspace (Local Sandbox)</span>
      <span className="sm:hidden">Demo</span>
    </span>
  );

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-300 ${
        executiveView
          ? 'bg-[#1C1917]/95 border-white/10 text-[#FAF7F2]'
          : 'bg-[var(--card)]/90 border-[var(--border-subtle)] text-[var(--ink)] shadow-2xs'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Row 1: Brand & Top Level Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-terracotta to-[#A84320] flex items-center justify-center shadow-md shadow-terracotta/20 ring-1 ring-white/30 shrink-0">
              <Sparkles size={16} className="text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-espresso truncate" style={{ color: executiveView ? '#FAF7F2' : 'var(--ink)' }}>
                  Velmora Spark
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta inline-block shrink-0" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-sans tracking-wide text-muted uppercase font-medium truncate" style={{ color: executiveView ? 'rgba(250,247,242,0.6)' : 'var(--stone-400)' }}>
                Dream it. Plan it. Celebrate it.
              </p>
            </div>

            {/* Status Badge */}
            <div className="shrink-0 ml-1">
              {statusBadge}
            </div>
          </div>

          {/* Controls: Desktop Inline, Mobile Compact */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Create Event Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Create a custom celebration"
            >
              <Sparkles size={12} className="text-black" />
              <span className="hidden sm:inline">+ Create Event</span>
              <span className="sm:hidden">+ Event</span>
            </button>

            {/* Event Preset Switcher */}
            <div className="relative">
              <button
                id="preset-switcher"
                onClick={() => setShowPresetMenu((v) => !v)}
                className="btn btn-secondary btn-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--card)] shadow-2xs hover:border-[var(--primary)]"
              >
                <span className="text-sm">{PRESETS[preset]?.emoji || '👑'}</span>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold leading-tight">{event.isCustom ? event.title : PRESETS[preset]?.label}</div>
                  <div className="text-[9px] text-[var(--stone-400)] leading-none">{formatINR(event.totalBudget)} · {event.city}</div>
                </div>
                <ChevronDown size={12} className="text-[var(--stone-400)]" />
              </button>

              {/* Preset Dropdown */}
              {showPresetMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPresetMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 w-72 sm:w-80 bg-[var(--card)] text-[var(--ink)] border border-[var(--border-subtle)] rounded-2xl p-2.5 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
                    {/* Saved Custom Events Section */}
                    {customEvents.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-[var(--border-subtle)]">
                        <div className="px-3 py-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                            👑 My Custom Events
                          </span>
                          <span className="badge badge-stone text-[9px]">{customEvents.length} Saved</span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {customEvents.map((ce) => {
                            const isCurrent = event.id === ce.id;
                            return (
                              <button
                                key={ce.id}
                                onClick={() => {
                                  switchToCustomEvent(ce.id);
                                  setShowPresetMenu(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                                  isCurrent
                                    ? 'bg-amber-500/15 border-amber-500 text-[var(--ink)] font-bold ring-1 ring-amber-500/30'
                                    : 'bg-[var(--surface)] border-[var(--border-subtle)] hover:border-amber-400'
                                }`}
                              >
                                <div className="truncate min-w-0 pr-2">
                                  <strong className="block truncate font-serif">{ce.title}</strong>
                                  <span className="text-[9px] text-[var(--stone-400)] block">
                                    {ce.city} · {formatINR(ce.totalBudget)}
                                  </span>
                                </div>
                                {isCurrent && (
                                  <span className="badge badge-sage text-[8px] shrink-0">Active</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--stone-400)]">Curated Event Presets</span>
                      <span className="badge badge-stone text-[9px]">3 Formats</span>
                    </div>

                    <div className="space-y-1.5">
                      {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                        const p = PRESETS[key];
                        const isCurrent = !event.isCustom && preset === key;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setPreset(key);
                              setShowPresetMenu(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                              isCurrent
                                ? 'bg-[var(--surface)] border-[var(--primary)] shadow-xs ring-1 ring-[var(--primary)]'
                                : 'bg-[var(--card)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                            }`}
                          >
                            <span className="text-xl p-1 rounded-lg bg-[var(--surface)] shrink-0">{p.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-serif font-bold text-xs text-[var(--ink)]">{p.label}</span>
                                {isCurrent && (
                                  <span className="badge badge-sage text-[8px] flex items-center gap-0.5">
                                    <Check size={9} /> Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--stone-400)] mt-0.5 truncate">{p.subtitle}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Launch Modal Action */}
                    <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={() => {
                          setShowPresetMenu(false);
                          setShowCreateModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>+ Plan Custom Event</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Desktop-Only Tools */}
            <div className="hidden md:flex items-center gap-2">
              <button
                id="launch-interactive-demo"
                onClick={handleLaunchDemoMode}
                className={`btn btn-sm px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1 transition-all ${
                  demoModeActive
                    ? 'bg-amber text-espresso ring-2 ring-amber/50 animate-bounce'
                    : 'bg-gradient-to-r from-amber/20 to-terracotta/20 text-terracotta border border-terracotta/30 hover:border-terracotta hover:bg-terracotta hover:text-white'
                }`}
                title="Launch guided demo mode"
              >
                <Zap size={12} className="text-amber fill-amber" />
                <span>{demoModeActive ? '⚡ Active' : '⚡ Demo'}</span>
              </button>

              <button
                id="executive-brief-btn"
                onClick={onOpenBrief}
                className="btn btn-secondary btn-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-[var(--border-subtle)] bg-[var(--card)] shadow-2xs hover:border-[var(--primary)]"
                title="Executive Summary Brief"
              >
                <FileText size={13} className="text-terracotta" />
                <span className="hidden lg:inline text-xs">Executive Brief</span>
              </button>

              <button
                id="header-wa-card-btn"
                onClick={() => setShowWACardModal(true)}
                className="btn btn-secondary btn-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 shadow-2xs hover:border-emerald-400 cursor-pointer"
                title="Open WhatsApp Broadcast & Share Card"
              >
                <MessageCircle size={13} className="text-emerald-400" />
                <span className="hidden xl:inline text-xs font-medium">WhatsApp Card</span>
              </button>

              <button
                id="header-replay-curtain-btn"
                onClick={() => replayCurtainEntrance()}
                className="btn btn-secondary btn-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-500/30 bg-amber-950/20 text-amber-300 shadow-2xs hover:border-amber-400 cursor-pointer"
                title="Replay Theatrical Royal Velvet Curtain Reveal"
              >
                <Sparkles size={13} className="text-[#FFAE34]" />
                <span className="hidden xl:inline text-xs font-medium">Royal Curtain</span>
              </button>

              <button
                id="exec-view-toggle"
                onClick={() => setExecutiveView((v) => !v)}
                className={`btn btn-sm px-2.5 py-1.5 rounded-xl ${executiveView ? 'btn-primary' : 'btn-ghost'}`}
                title="Toggle Parent/Sponsor View"
              >
                {executiveView ? <Eye size={13} /> : <EyeOff size={13} />}
                <span className="hidden lg:inline text-xs">Exec Mode</span>
              </button>

              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Mobile Overflow Menu Button (<md) */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowMobileMenu((v) => !v)}
                aria-label="Open secondary controls menu"
                className="p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--surface)] shadow-2xs"
              >
                {showMobileMenu ? <X size={16} /> : <Settings size={16} />}
              </button>

              {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-[var(--card)] text-[var(--ink)] border border-[var(--border-subtle)] rounded-2xl p-3 shadow-2xl animate-slide-up space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--stone-400)]">Controls & Settings</span>
                      <ThemeToggle />
                    </div>

                    <div>
                      <div className="text-[10px] text-[var(--stone-400)] font-medium mb-1.5">Language / भाषा</div>
                      <LanguageToggle />
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                      <button
                        onClick={() => {
                          onOpenBrief();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-[var(--surface)] text-[var(--ink)]"
                      >
                        <FileText size={14} className="text-[var(--primary)]" />
                        <span>Executive Brief (1-Pager)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowWACardModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-[var(--surface)] text-[var(--ink)]"
                      >
                        <MessageCircle size={14} className="text-emerald-400" />
                        <span>WhatsApp Broadcast Card</span>
                      </button>

                      <button
                        onClick={() => {
                          onCopyBrief();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-[var(--surface)] text-[var(--ink)]"
                      >
                        <Check size={14} className="text-emerald-400" />
                        <span>{copied ? 'WhatsApp Text Copied! ✓' : 'Copy WhatsApp Text'}</span>
                      </button>

                      <button
                        onClick={() => {
                          replayCurtainEntrance();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-[var(--surface)] text-[var(--stone-500)]"
                      >
                        <RotateCcw size={14} className="text-[#FFAE34]" />
                        <span>Replay Royal Entrance</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Projected Financial Pill & Buffer Pill */}
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metallic Gold Projected Financial Pill */}
            <div className="financial-pill shadow-xs">
              <span className="text-[#350A10]/75 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Projected</span>
              <span className="text-[#350A10] font-black text-xs font-mono">
                {formatINR(totalProjected)}
              </span>
              {overrunPct > 0 && (
                <span className="badge badge-crimson text-[9px]">+{overrunPct}%</span>
              )}
            </div>

            {/* Buffer pill */}
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold border"
              style={{
                background: bufferPct > 30 ? 'var(--sage-muted)' : 'var(--crimson-muted)',
                borderColor: bufferPct > 30 ? 'rgba(46,111,64,0.2)' : 'rgba(185,28,28,0.2)',
                color: bufferPct > 30 ? 'var(--sage)' : 'var(--crimson)',
              }}
            >
              <span>🛡</span>
              <span>{formatINR(bufferRemaining)} buffer</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--stone-400)]">
            <span>Budget: <strong className="text-[var(--ink)] font-mono">{formatINR(event.totalBudget)}</strong></span>
          </div>
        </div>

        {/* Desktop-Only TabBar (Hidden on mobile <md to avoid duplicate navigation with MobileBottomNav) */}
        <div className="hidden md:block mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <TabBar />
        </div>
      </div>

      {/* Visual WhatsApp Share Card Modal */}
      <WhatsAppShareCardModal
        isOpen={showWACardModal}
        onClose={() => setShowWACardModal(false)}
      />
    </header>
  );
}
