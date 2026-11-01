'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface EventCountdownProps {
  dateString?: string;
  className?: string;
  compact?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: number; // 1 = concluded, 0 = active/future, -1 = today
  isValid: boolean;
}

function calculateTimeRemaining(dateStr?: string, currentMs?: number | null): TimeRemaining {
  if (!dateStr || typeof dateStr !== 'string' || !currentMs) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: 0, isValid: false };
  }

  const targetDate = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T17:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: 0, isValid: false };
  }

  const now = new Date(currentMs);
  const diffMs = targetDate.getTime() - now.getTime();

  const isSameDay =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isSameDay) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: -1, isValid: true };
  }

  if (diffMs < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: 1, isValid: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: 0, isValid: true };
}

export function EventCountdown({ dateString, className = '', compact = false }: EventCountdownProps) {
  // Deterministic 2-pass mounting to prevent React hydration mismatch (#418)
  const [mounted, setMounted] = useState(false);
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      setCurrentMs(Date.now());
      if (typeof window !== 'undefined' && window.matchMedia) {
        setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      }
    });

    const interval = setInterval(() => {
      setCurrentMs(Date.now());
    }, 1000);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
    };
  }, []);

  const timeLeft = useMemo(() => {
    if (!mounted || !currentMs) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: 0, isValid: false };
    }
    return calculateTimeRemaining(dateString, currentMs);
  }, [mounted, currentMs, dateString]);

  const accessibleLabel = useMemo(() => {
    if (!timeLeft.isValid) return 'Event date not set or invalid';
    if (timeLeft.isPast === -1) return 'Celebration is today!';
    if (timeLeft.isPast === 1) return 'Celebration concluded';
    return `${timeLeft.days} days, ${timeLeft.hours} hours, and ${timeLeft.minutes} minutes until the celebration`;
  }, [timeLeft]);

  // Initial SSR / Hydration skeleton: Identical on server and client initial render
  if (!mounted || currentMs === null) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-xs text-[var(--stone-500)] ${className}`}>
        <Clock size={13} className="text-[var(--primary)]" />
        <span className="font-medium">Calculating countdown...</span>
      </div>
    );
  }

  if (!timeLeft.isValid) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-xs text-[var(--stone-500)] ${className}`}>
        <Calendar size={13} className="text-[var(--stone-400)]" />
        <span className="font-medium">Date to be announced</span>
      </div>
    );
  }

  // Today Celebration State
  if (timeLeft.isPast === -1) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-xs ${className}`}
        aria-live="polite"
        aria-label={accessibleLabel}
      >
        <Sparkles size={14} className={`text-emerald-600 ${prefersReducedMotion ? '' : 'animate-pulse'}`} />
        <span>Celebration Day! Active Live Operations 🎉</span>
      </div>
    );
  }

  // Concluded State
  if (timeLeft.isPast === 1) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--stone-500)] text-xs font-medium ${className}`}
        aria-label={accessibleLabel}
      >
        <CheckCircle2 size={13} className="text-[var(--success)]" />
        <span>Celebration Concluded · Archived Records</span>
      </div>
    );
  }

  // Compact Mode (for headers or tight mobile rows)
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--terracotta-muted)] border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-mono font-bold ${className}`}
        aria-live="polite"
        aria-label={accessibleLabel}
      >
        <Clock size={12} className="text-[var(--primary)]" />
        <span>
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  // Full Standard Countdown Display
  return (
    <div
      className={`inline-flex items-center gap-3 p-3 rounded-2xl bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border-subtle)] shadow-2xs ${className}`}
      aria-label={accessibleLabel}
      role="timer"
    >
      <div className="flex items-center gap-1.5 text-xs text-[var(--stone-500)] font-medium mr-1 hidden sm:flex">
        <Clock size={14} className="text-[var(--primary)]" />
        <span>Celebration Countdown</span>
      </div>

      <div className="flex items-center gap-2 text-center font-mono">
        {/* Days */}
        <div className="flex flex-col items-center min-w-[36px] px-2 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <span className="font-bold text-sm text-[var(--ink)] leading-tight">{timeLeft.days}</span>
          <span className="text-[9px] text-[var(--stone-400)] font-sans uppercase">Days</span>
        </div>

        <span className="text-[var(--stone-300)] font-bold">:</span>

        {/* Hours */}
        <div className="flex flex-col items-center min-w-[36px] px-2 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <span className="font-bold text-sm text-[var(--ink)] leading-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-[var(--stone-400)] font-sans uppercase">Hrs</span>
        </div>

        <span className="text-[var(--stone-300)] font-bold">:</span>

        {/* Mins */}
        <div className="flex flex-col items-center min-w-[36px] px-2 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <span className="font-bold text-sm text-[var(--ink)] leading-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-[var(--stone-400)] font-sans uppercase">Min</span>
        </div>

        <span className="text-[var(--stone-300)] font-bold">:</span>

        {/* Secs */}
        <div className="flex flex-col items-center min-w-[36px] px-2 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          <span className="font-bold text-sm text-[var(--primary)] leading-tight">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[9px] text-[var(--stone-400)] font-sans uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
}
