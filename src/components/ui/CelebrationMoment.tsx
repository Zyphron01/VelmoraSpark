'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationDetail {
  type?: string;
  message?: string;
}

export function CelebrationMoment() {
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState('');
  const cooldownRef = useRef(false);

  useEffect(() => {
    const handleCelebration = (e: Event) => {
      // Cooldown / Debounce: prevent accidental overlapping animations
      if (cooldownRef.current) return;
      cooldownRef.current = true;

      const customEvent = e as CustomEvent<CelebrationDetail>;
      const isLock = customEvent.detail?.type === 'lock';
      setTitle(customEvent.detail?.message || (isLock ? 'Celebration Plan Locked ✨' : 'Approved to Operations 🌸'));
      setActive(true);

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Canvas Confetti with festive Indian celebration palette (disabled on reduced motion)
      if (!prefersReducedMotion) {
        try {
          confetti({
            particleCount: isLock ? 90 : 45,
            spread: isLock ? 100 : 70,
            origin: { y: 0.7 },
            colors: ['#FFE29F', '#FFAE34', '#ED9A12', '#9E1C28', '#F59E0B', '#3D7A5A'],
            disableForReducedMotion: true,
          });
        } catch {}
      }

      const timer = setTimeout(() => {
        setActive(false);
        cooldownRef.current = false;
      }, 2200);

      return () => {
        clearTimeout(timer);
        cooldownRef.current = false;
      };
    };

    window.addEventListener('velmora:celebration', handleCelebration);
    return () => window.removeEventListener('velmora:celebration', handleCelebration);
  }, []);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-24 sm:pb-32 animate-fade-in"
    >
      {/* Auspicious Diya Ambient Light Glow */}
      <div className="absolute bottom-16 w-80 h-80 rounded-full bg-gradient-to-t from-[#FFAE34]/35 via-[#ED9A12]/15 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Diya & Auspicious Banner */}
      <div className="relative z-10 flex flex-col items-center animate-bounce-subtle">
        {/* Animated Diya SVG */}
        <div className="relative mb-3 flex justify-center items-center">
          {/* Flame Glow */}
          <div className="absolute -top-3 w-6 h-8 bg-amber-400 rounded-full blur-xs animate-pulse opacity-90" />
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Flame */}
            <path
              d="M24 2C22 7 19 11 19 15C19 18 21.2 20 24 20C26.8 20 29 18 29 15C29 11 26 7 24 2Z"
              fill="url(#diyaFlame)"
            />
            {/* Brass Oil Lamp Base */}
            <path
              d="M6 20C9 28 16 32 24 32C32 32 39 28 42 20C36 24 30 25 24 25C18 25 12 24 6 20Z"
              fill="url(#diyaBrass)"
            />
            {/* Stand Base */}
            <ellipse cx="24" cy="33" rx="8" ry="2" fill="#C9A24B" />
            <defs>
              <linearGradient id="diyaFlame" x1="24" y1="2" x2="24" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF7D6" />
                <stop offset="0.4" stopColor="#FFAE34" />
                <stop offset="1" stopColor="#E4572E" />
              </linearGradient>
              <linearGradient id="diyaBrass" x1="6" y1="20" x2="42" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE29F" />
                <stop offset="0.5" stopColor="#C9A24B" />
                <stop offset="1" stopColor="#8A6B29" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Auspicious Banner Badge */}
        <div className="px-4 py-2 rounded-full bg-[#2D080E]/90 text-[#FFE29F] border border-[#FFE29F]/40 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-serif font-bold tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFAE34] animate-ping" />
          <span>{title}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Dispatch celebration event
 */
export function triggerCelebrationMoment(type: 'approve' | 'lock', message?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('velmora:celebration', {
        detail: { type, message },
      })
    );
  }
}
