'use client';

import React from 'react';
import { Sparkles, Calendar, MapPin, Users, HeartHandshake, Crown, RotateCcw, Plus } from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { formatINR } from '@/lib/utils';
import { StatRing } from './StatRing';
import { EventCountdown } from './EventCountdown';
import { Festive3DMiniatureScene } from './Festive3DMiniatureScene';

export function HeroBanner() {
  const {
    event,
    setPreset,
    setShowCreateModal,
    dbSource,
    totalCommitted,
    totalProjected,
    contingencyBuffer,
    contingencyUsed,
  } = useApp();

  const bufferRemaining = contingencyBuffer - contingencyUsed;
  const budgetAllocationPct = Math.min(100, Math.round((totalProjected / event.totalBudget) * 100));
  const rsvpRate = Math.min(100, Math.round((event.confirmedRsvpCount / event.invitedCount) * 100));
  const isCustom = event.isCustom || dbSource === 'local_custom';

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft p-6 sm:p-8 transition-all jharokha-arch">
      {/* Decorative Jharokha Arch Top Silhouette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-3 pointer-events-none flex justify-center items-start opacity-70">
        <svg width="180" height="12" viewBox="0 0 180 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0C30 0 45 10 90 10C135 10 150 0 180 0H0Z" fill="url(#jharokhaGold)" fillOpacity="0.4" />
          <circle cx="90" cy="5" r="2.5" fill="#FFAE34" />
          <defs>
            <linearGradient id="jharokhaGold" x1="0" y1="0" x2="180" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFE29F" />
              <stop offset="0.5" stopColor="#FFAE34" />
              <stop offset="1" stopColor="#ED9A12" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Decorative SVG Mandala Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236B1D2A' fill-rule='evenodd'%3E%3Cpath d='M60 0c33.137 0 60 26.863 60 60s-26.863 60-60 60S0 93.137 0 60 26.863 0 60 0zm0 10C32.386 10 10 32.386 10 60s22.386 50 50 50 50-22.386 50-50S87.614 10 60 10zm0 15c19.33 0 35 15.67 35 35s-15.67 35-35 35-35-15.67-35-35 15.67-35 35-35z' fill-opacity='0.6'/%3E%3Ccircle cx='60' cy='60' r='18'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial Gold Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full radial-gold-glow pointer-events-none opacity-60" />

      {/* 3D Festive Miniature Scene with Interactive Depth & Glowing Diyas */}
      <Festive3DMiniatureScene />

      <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap lg:flex-nowrap">
        {/* Left: Event Details */}
        <div className="flex-1 min-w-[280px]">
          {/* Dual Entry Banner Option Strip */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            {isCustom ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge badge-terracotta text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 py-1 px-3">
                  <Crown size={12} className="text-amber-400" />
                  👑 Custom Celebration · Saved in this browser
                </span>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 border border-white/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus size={12} />
                  <span>New Event</span>
                </button>
                <button
                  onClick={() => setPreset('wedding')}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-amber-200/80 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RotateCcw size={11} />
                  <span>← Back to Demo Wedding</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-sm px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-amber-400/40"
                >
                  <Crown size={14} className="text-black" />
                  <span>👑 Create My Event</span>
                </button>
                <span className="badge badge-stone text-[10px] font-medium flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  ✨ Exploring Preset Demo ({event.activeWhatsappGroupsReplaced} Groups Consolidated)
                </span>
              </div>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--ink)] leading-tight mb-2">
            {event.title}
          </h1>

          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--stone-500)] flex-wrap mb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={14} className="text-[var(--primary)]" />
              {event.date}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-[var(--primary)]" />
              {event.city}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Users size={14} className="text-[var(--primary)]" />
              {event.invitedCount} Invited ({event.confirmedRsvpCount} Confirmed)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-[var(--ivory)] border border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--stone-400)] block text-[10px] uppercase font-bold tracking-wider">Sanctioned Budget</span>
              <strong className="font-serif text-sm text-[var(--ink)]">{formatINR(event.totalBudget)}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[var(--ivory)] border border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--stone-400)] block text-[10px] uppercase font-bold tracking-wider">Committed Paid</span>
              <strong className="font-serif text-sm text-[var(--success)]">{formatINR(totalCommitted)}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl pill-gold-metallic text-xs">
              <span className="text-[#350A10]/80 block text-[10px] uppercase font-bold tracking-wider">Projected Final</span>
              <strong className="font-serif text-sm text-[#350A10]">{formatINR(totalProjected)}</strong>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[var(--ivory)] border border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--stone-400)] block text-[10px] uppercase font-bold tracking-wider">Contingency Reserve</span>
              <strong className="font-serif text-sm text-[var(--primary)]">{formatINR(bufferRemaining)}</strong>
            </div>
          </div>

          {/* Live Dynamic Countdown to Persisted Event Date */}
          <EventCountdown dateString={event.date} className="mt-4 max-w-md" />
        </div>

        {/* Right: Circular Stat Rings */}
        <div className="flex items-center gap-6 sm:gap-8 p-4 rounded-2xl bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border-subtle)] shadow-xs">
          <StatRing
            value={budgetAllocationPct}
            max={100}
            label="Budget Used"
            sublabel={`${formatINR(totalProjected)}`}
            color="var(--primary)"
          />
          <div className="w-px h-12 bg-[var(--border-subtle)]" />
          <StatRing
            value={rsvpRate}
            max={100}
            label="RSVP Rate"
            sublabel={`${event.confirmedRsvpCount}/${event.invitedCount}`}
            color="var(--success)"
          />
          <div className="hidden sm:block w-px h-12 bg-[var(--border-subtle)]" />
          <div className="hidden sm:flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center font-serif font-bold text-lg mb-1">
              <HeartHandshake size={20} />
            </div>
            <span className="text-[11px] font-bold text-[var(--ink)] block">Operations</span>
            <span className="text-[10px] text-[var(--success)] font-semibold block">100% Prepared</span>
          </div>
        </div>
      </div>
    </div>
  );
}
