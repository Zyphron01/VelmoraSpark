'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

interface CurtainOpeningProps {
  onComplete?: () => void;
}

// Versioned key ensures user sees the realistic curtain when opening the site
const STORAGE_KEY = 'velmora_curtain_dismissed_v4';

export function CurtainOpening({ onComplete }: CurtainOpeningProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const skipButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Restore keyboard focus when overlay unmounts
  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
      try {
        previousActiveElement.current.focus();
      } catch {}
    } else {
      const main = document.querySelector('main');
      if (main instanceof HTMLElement) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    }
  }, []);

  // Initialize realistic curtain sequence
  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let endTimer: NodeJS.Timeout;

    // Check reduced-motion preference: bypass completely if user requested reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsRendered(false);
      onComplete?.();
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const forceReplay = urlParams.has('replay') || urlParams.has('curtain') || urlParams.has('entrance');
      const dismissed = sessionStorage.getItem(STORAGE_KEY);

      // If user previously dismissed the curtain in this tab and didn't request replay, bypass
      if (dismissed === 'true' && !forceReplay) {
        setIsRendered(false);
        onComplete?.();
        return;
      }

      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        previousActiveElement.current = document.activeElement;
      }

      // Allow 1.3 seconds of royal poise to admire the majestic velvet before parting
      openTimer = setTimeout(() => {
        setIsOpen(true);
      }, 1300);

      // Complete parting and unmount gracefully
      endTimer = setTimeout(() => {
        setIsRendered(false);
        restoreFocus();
        onComplete?.();
      }, 3000);
    } catch {
      setIsRendered(false);
      onComplete?.();
    }

    return () => {
      clearTimeout(openTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete, restoreFocus]);

  // Focus skip button when rendered for instant keyboard & screen-reader access
  useEffect(() => {
    if (isRendered && skipButtonRef.current) {
      skipButtonRef.current.focus();
    }
  }, [isRendered]);

  // Listen for replay event
  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const handleReplay = () => {
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        previousActiveElement.current = document.activeElement;
      }
      setIsRendered(true);
      setIsOpen(false);

      openTimer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      hideTimer = setTimeout(() => {
        setIsRendered(false);
        restoreFocus();
      }, 3300);
    };

    window.addEventListener('velmora:replay-curtain', handleReplay);
    return () => {
      window.removeEventListener('velmora:replay-curtain', handleReplay);
      clearTimeout(openTimer);
      clearTimeout(hideTimer);
    };
  }, [restoreFocus]);

  const handleSkip = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
    setIsOpen(true);
    setTimeout(() => {
      setIsRendered(false);
      restoreFocus();
      onComplete?.();
    }, 80);
  }, [onComplete, restoreFocus]);

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered, handleSkip]);

  if (!isRendered) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Grand Royal Ceremonial Entrance"
      onClick={() => {
        if (!isOpen) handleSkip();
      }}
      className={`fixed inset-0 z-50 flex overflow-hidden select-none transition-opacity duration-700 cursor-pointer ${
        isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      style={{
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
    >
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        Grand royal velvet ceremonial entrance active. Press Escape or Enter to skip directly to event operations.
      </div>

      {/* Accessible Skip Button (Prominent, High Contrast) */}
      <button
        ref={skipButtonRef}
        type="button"
        onClick={handleSkip}
        aria-label="Skip entrance animation and enter dashboard"
        className="pointer-events-auto absolute top-6 right-6 z-50 px-5 py-2.5 rounded-full bg-[#180308]/90 hover:bg-[#3D0A14] text-[#FFE29F] border-2 border-[#FFAE34]/70 text-xs font-bold backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#FFAE34] shadow-[0_4px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(255,174,52,0.4)] cursor-pointer"
      >
        <span>Skip Reveal</span>
        <X size={15} aria-hidden="true" className="text-[#FFAE34]" />
      </button>

      {/* ── Left Imperial Velvet Drapery Panel ── */}
      <div
        className={`w-1/2 h-full relative flex flex-col justify-between overflow-hidden transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{
          transform: isOpen ? 'translateX(-102%) scaleX(0.85)' : 'translateX(0) scaleX(1)',
          transformOrigin: 'left center',
          background: `
            radial-gradient(circle at 10% 30%, rgba(255,255,255,0.06) 0%, transparent 40%),
            linear-gradient(180deg, #1A0307 0%, #380812 25%, #4F0E1B 50%, #30060E 80%, #150205 100%)
          `,
          boxShadow: 'inset -25px 0 60px rgba(0,0,0,0.85), 15px 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Photorealistic Accordion Velvet Pleats (Sinusoidal Depth Folds) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                rgba(12, 2, 4, 0.95) 0px,
                rgba(28, 5, 10, 0.8) 25px,
                rgba(90, 18, 30, 0.45) 50px,
                rgba(135, 30, 48, 0.65) 70px,
                rgba(180, 50, 75, 0.4) 85px,
                rgba(135, 30, 48, 0.65) 100px,
                rgba(90, 18, 30, 0.45) 120px,
                rgba(28, 5, 10, 0.8) 145px,
                rgba(12, 2, 4, 0.95) 170px
              )
            `,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Velvet Satin Surface Luster (Subtle Glancing Angle Sheen) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 60px,
                rgba(255, 226, 159, 0.18) 75px,
                transparent 90px,
                transparent 170px
              )
            `,
          }}
        />

        {/* Center Edge Overlap Shadow (Right side of left curtain) */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />

        {/* Left Side Gather Tieback Rosette & Golden Cord */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE29F] via-[#FFAE34] to-[#C87A08] shadow-[0_4px_15px_rgba(0,0,0,0.7)] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-[#350A10] border border-[#FFE29F]/70 flex items-center justify-center text-[#FFE29F] text-xs">
              ✦
            </div>
          </div>
          {/* Hanging Braided Tassels */}
          <div className="flex flex-col gap-1 -ml-2 mt-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
            <div className="w-1.5 h-14 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
          </div>
        </div>

        {/* Bottom Gold Bullion Fringe */}
        <div className="relative z-10 w-full">
          <div className="h-3 w-full bg-gradient-to-r from-[#C87A08] via-[#FFAE34] to-[#FFE29F] shadow-sm" />
          <div
            className="h-10 w-full opacity-80"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #FFAE34 0px, #FFAE34 2px, transparent 2px, transparent 6px)',
            }}
          />
        </div>
      </div>

      {/* ── Right Imperial Velvet Drapery Panel ── */}
      <div
        className={`w-1/2 h-full relative flex flex-col justify-between overflow-hidden transition-all duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{
          transform: isOpen ? 'translateX(102%) scaleX(0.85)' : 'translateX(0) scaleX(1)',
          transformOrigin: 'right center',
          background: `
            radial-gradient(circle at 90% 30%, rgba(255,255,255,0.06) 0%, transparent 40%),
            linear-gradient(180deg, #1A0307 0%, #380812 25%, #4F0E1B 50%, #30060E 80%, #150205 100%)
          `,
          boxShadow: 'inset 25px 0 60px rgba(0,0,0,0.85), -15px 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Photorealistic Accordion Velvet Pleats */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                rgba(12, 2, 4, 0.95) 0px,
                rgba(28, 5, 10, 0.8) 25px,
                rgba(90, 18, 30, 0.45) 50px,
                rgba(135, 30, 48, 0.65) 70px,
                rgba(180, 50, 75, 0.4) 85px,
                rgba(135, 30, 48, 0.65) 100px,
                rgba(90, 18, 30, 0.45) 120px,
                rgba(28, 5, 10, 0.8) 145px,
                rgba(12, 2, 4, 0.95) 170px
              )
            `,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Velvet Satin Surface Luster */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 60px,
                rgba(255, 226, 159, 0.18) 75px,
                transparent 90px,
                transparent 170px
              )
            `,
          }}
        />

        {/* Center Edge Overlap Shadow (Left side of right curtain) */}
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-black/80 to-transparent pointer-events-none" />

        {/* Right Side Gather Tieback Rosette & Golden Cord */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center flex-row-reverse pointer-events-none z-20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFE29F] via-[#FFAE34] to-[#C87A08] shadow-[0_4px_15px_rgba(0,0,0,0.7)] flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full bg-[#350A10] border border-[#FFE29F]/70 flex items-center justify-center text-[#FFE29F] text-xs">
              ✦
            </div>
          </div>
          {/* Hanging Braided Tassels */}
          <div className="flex flex-col gap-1 -mr-2 mt-8">
            <div className="w-1.5 h-10 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
            <div className="w-1.5 h-14 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#FFAE34] to-[#ED9A12] rounded-full shadow-md" />
          </div>
        </div>

        {/* Bottom Gold Bullion Fringe */}
        <div className="relative z-10 w-full">
          <div className="h-3 w-full bg-gradient-to-r from-[#FFE29F] via-[#FFAE34] to-[#C87A08] shadow-sm" />
          <div
            className="h-10 w-full opacity-80"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #FFAE34 0px, #FFAE34 2px, transparent 2px, transparent 6px)',
            }}
          />
        </div>
      </div>

      {/* ── Grand Scalloped Imperial Velvet Valance / Pelmet (Fixed Stage Framing) ── */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none flex justify-around">
        <svg
          className="w-full h-16 sm:h-20 drop-shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="valanceVelvet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#180307" />
              <stop offset="50%" stopColor="#4A0C17" />
              <stop offset="90%" stopColor="#6E1624" />
              <stop offset="100%" stopColor="#30060E" />
            </linearGradient>
            <linearGradient id="valanceGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFE29F" />
              <stop offset="50%" stopColor="#FFAE34" />
              <stop offset="100%" stopColor="#ED9A12" />
            </linearGradient>
          </defs>

          {/* 5 Scalloped Velvet Swags */}
          <path
            d="
              M 0 0
              L 0 35
              Q 120 90, 240 35
              Q 360 90, 480 35
              Q 600 95, 720 35
              Q 840 90, 960 35
              Q 1080 90, 1200 35
              L 1200 0
              Z
            "
            fill="url(#valanceVelvet)"
          />

          {/* Gold Bullion Trim Outline */}
          <path
            d="
              M 0 35
              Q 120 90, 240 35
              Q 360 90, 480 35
              Q 600 95, 720 35
              Q 840 90, 960 35
              Q 1080 90, 1200 35
            "
            fill="none"
            stroke="url(#valanceGold)"
            strokeWidth="5"
          />

          {/* Secondary Delicate Gold Piping */}
          <path
            d="
              M 0 28
              Q 120 83, 240 28
              Q 360 83, 480 28
              Q 600 88, 720 28
              Q 840 83, 960 28
              Q 1080 83, 1200 28
            "
            fill="none"
            stroke="#FFE29F"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* ── Center Royal Monogram Seal Medallion ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: `translate(-50%, -50%) scale(${isOpen ? 1.4 : 1})`,
        }}
      >
        {/* Ornate Gold Sunburst Aura */}
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-radial from-[#FFAE34]/40 via-[#ED9A12]/15 to-transparent blur-xl animate-pulse" />

          {/* Concentric Double Gold Filigree Medallion */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-br from-[#FFE29F] via-[#FFAE34] to-[#C87A08] shadow-[0_0_50px_rgba(255,174,52,0.7),0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#3D0A14] via-[#24040A] to-[#140205] border-2 border-[#FFE29F]/80 flex flex-col items-center justify-center text-center p-3 shadow-inner">
              <Sparkles size={18} className="text-[#FFE29F] mb-1 animate-spin" style={{ animationDuration: '12s' }} />
              <span className="font-serif font-black text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFE29F] via-[#FFAE34] to-[#ED9A12] drop-shadow-sm">
                VS
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-[#FFE29F]/90 font-bold mt-0.5">
                Velmora Spark
              </span>
            </div>
          </div>
        </div>

        {/* Auspicious Blessing Inscription */}
        <div className="mt-4 text-center">
          <p className="font-serif text-[#FFE29F] font-bold text-base sm:text-lg tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2">
            <span>शुभ उत्सव</span>
            <span className="text-[#FFAE34]">·</span>
            <span>Grand Royal Entrance</span>
          </p>
          <span className="text-[10px] text-amber-200/70 tracking-widest uppercase block mt-1">
            Celebration Operations Unfolding
          </span>
          <span className="text-[10px] text-amber-300/90 tracking-wide inline-block mt-2 px-3.5 py-1 rounded-full bg-black/50 border border-amber-400/30 backdrop-blur-xs shadow-md">
            Click anywhere or press Esc to enter
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to trigger replay of curtain animation on demand
 */
export function replayCurtainEntrance() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('velmora:replay-curtain'));
  }
}
