'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-store';

interface Props {
  className?: string;
}

export function Festive3DMiniatureScene({ className = '' }: Props) {
  const { event, preset, themeTemplate } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;
    const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (media) {
      frameId = requestAnimationFrame(() => {
        setIsReducedMotion(media.matches);
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!media || media.matches || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const yNorm = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Subdued, elegant 3D tilt
      setTilt({
        x: Math.max(-12, Math.min(12, -yNorm * 18)),
        y: Math.max(-12, Math.min(12, xNorm * 22)),
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    const node = containerRef.current;
    if (node) {
      window.addEventListener('mousemove', handleMouseMove);
      node.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (node) node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const isFest = themeTemplate === 'carnivale' || preset === 'fest' || event.category === 'college_fest';
  const isJubilee = themeTemplate === 'jubilee' || preset === 'birthday';
  const isKalyanam = themeTemplate === 'kalyanam';

  const spotlightGradient = isFest
    ? 'radial-gradient(circle, rgba(245,158,11,0.32) 0%, rgba(99,102,241,0.22) 55%, transparent 75%)'
    : isJubilee
    ? 'radial-gradient(circle, rgba(52,211,153,0.30) 0%, rgba(20,83,45,0.25) 50%, transparent 75%)'
    : isKalyanam
    ? 'radial-gradient(circle, rgba(249,115,22,0.32) 0%, rgba(120,53,15,0.25) 50%, transparent 75%)'
    : 'radial-gradient(circle, rgba(237,154,18,0.34) 0%, rgba(158,43,62,0.24) 50%, transparent 75%)';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ perspective: '1100px' }}
    >
      {/* 3D Transform Root */}
      <div
        className="w-full h-full relative transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isReducedMotion
            ? 'none'
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* ─── LAYER 1: Deep Background Glow & Festive Sky (-60px Z) ───────── */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-65"
          style={{ transform: 'translateZ(-60px)' }}
        >
          {/* Ambient Royal Radial Spotlight */}
          <div
            className="w-[480px] h-[320px] rounded-full blur-3xl"
            style={{
              background: spotlightGradient,
            }}
          />

          {/* Miniature Star Sparkles */}
          <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <g fill="#FFE29F">
              <circle cx="15%" cy="25%" r="1.5" className="animate-pulse" />
              <circle cx="85%" cy="30%" r="1.8" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <circle cx="70%" cy="18%" r="1.2" className="animate-pulse" style={{ animationDelay: '2s' }} />
              <circle cx="28%" cy="75%" r="1.4" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
              <circle cx="80%" cy="82%" r="1.6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            </g>
          </svg>
        </div>

        {/* ─── LAYER 2: 3D Miniature Palace Arches & Pavilion (-20px Z) ─────── */}
        <div
          className="absolute inset-x-0 bottom-0 top-0 flex justify-between items-end px-6 sm:px-12 opacity-85"
          style={{ transform: 'translateZ(-20px)' }}
        >
          {/* Left Miniature Jharokha Pavilion Pillar */}
          <div className="relative w-28 sm:w-36 h-48 sm:h-64 flex flex-col items-center justify-end">
            {/* Scalloped Arch Crest */}
            <svg viewBox="0 0 100 120" className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              <defs>
                <linearGradient id="miniatureArchGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE29F" />
                  <stop offset="45%" stopColor="#FFAE34" />
                  <stop offset="100%" stopColor="#8C5E09" />
                </linearGradient>
                <linearGradient id="miniaturePillarShade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#351624" />
                  <stop offset="50%" stopColor="#4A1D31" />
                  <stop offset="100%" stopColor="#220B16" />
                </linearGradient>
              </defs>

              {/* Miniature Dome (Chhatri) */}
              <path d="M50 5 C45 25 25 35 20 48 L80 48 C75 35 55 25 50 5 Z" fill="url(#miniatureArchGold)" opacity="0.9" />
              <circle cx="50" cy="5" r="3.5" fill="#FFE29F" />

              {/* Jharokha Window Cavity */}
              <path
                d="M26 48 L26 95 C26 95 35 105 50 105 C65 105 74 95 74 95 L74 48 C74 48 64 56 50 56 C36 56 26 48 26 48 Z"
                fill="url(#miniaturePillarShade)"
                stroke="url(#miniatureArchGold)"
                strokeWidth="1.5"
              />

              {/* Warm Diya Glow inside window */}
              <circle cx="50" cy="84" r="8" fill="#F59E0B" opacity="0.6" className="animate-pulse" />
              <circle cx="50" cy="84" r="3" fill="#FFFBEB" />

              {/* Base plinth */}
              <rect x="18" y="96" width="64" height="12" rx="3" fill="url(#miniatureArchGold)" opacity="0.8" />
            </svg>

            {/* Hanging Marigold Toran Swag */}
            <div className="absolute top-14 -right-10 w-24 h-8 flex justify-between items-center opacity-75">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            </div>
          </div>

          {/* Right Miniature Jharokha Pavilion Pillar */}
          <div className="relative w-28 sm:w-36 h-48 sm:h-64 flex flex-col items-center justify-end">
            <svg viewBox="0 0 100 120" className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
              <path d="M50 5 C45 25 25 35 20 48 L80 48 C75 35 55 25 50 5 Z" fill="url(#miniatureArchGold)" opacity="0.9" />
              <circle cx="50" cy="5" r="3.5" fill="#FFE29F" />

              <path
                d="M26 48 L26 95 C26 95 35 105 50 105 C65 105 74 95 74 95 L74 48 C74 48 64 56 50 56 C36 56 26 48 26 48 Z"
                fill="url(#miniaturePillarShade)"
                stroke="url(#miniatureArchGold)"
                strokeWidth="1.5"
              />

              <circle cx="50" cy="84" r="8" fill="#F59E0B" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
              <circle cx="50" cy="84" r="3" fill="#FFFBEB" />

              <rect x="18" y="96" width="64" height="12" rx="3" fill="url(#miniatureArchGold)" opacity="0.8" />
            </svg>

            {/* Hanging Brass Bell */}
            <div className="absolute top-16 -left-4 w-6 h-10 flex flex-col items-center animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="w-0.5 h-4 bg-amber-400" />
              <div className="w-4 h-4 rounded-b-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_6px_#FFAE34]" />
            </div>
          </div>
        </div>

        {/* ─── LAYER 3: 3D Miniature Foreground Diyas & Brass Urli (+25px Z) ─ */}
        <div
          className="absolute inset-x-0 bottom-1 flex justify-between items-end px-8 sm:px-20 pointer-events-none"
          style={{ transform: 'translateZ(25px)' }}
        >
          {/* Left 3D Miniature Glowing Diya */}
          <div className="relative flex flex-col items-center">
            {/* Flickering Diya Flame */}
            <div className="relative w-4 h-6 mb-[-3px] flex items-center justify-center">
              {/* Outer Golden Aura */}
              <div className="absolute w-12 h-12 rounded-full bg-amber-500/35 blur-md animate-pulse" />
              {/* Mid Saffron Flame */}
              <div
                className="w-3.5 h-5 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-100 animate-pulse"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 70%, 75% 100%, 25% 100%, 0% 70%)',
                  animationDuration: '1.2s',
                }}
              />
              {/* Inner White Wick Core */}
              <div className="absolute w-1.5 h-2.5 rounded-full bg-white opacity-90" />
            </div>

            {/* Terracotta / Brass Diya Base */}
            <div className="w-9 h-3.5 rounded-b-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 shadow-[0_4px_10px_rgba(0,0,0,0.6)] border-t border-amber-300/40" />
          </div>

          {/* Center 3D Miniature Floating Brass Urli */}
          <div className="hidden md:flex flex-col items-center opacity-85">
            <div className="relative flex items-center justify-center">
              {/* Brass Urli Rim */}
              <div className="w-24 h-7 rounded-full bg-gradient-to-b from-[#FFAE34] to-[#78350F] p-0.5 shadow-[0_6px_14px_rgba(0,0,0,0.7)] flex items-center justify-center">
                {/* Water Surface with Rose & Jasmine Petals */}
                <div className="w-full h-full rounded-full bg-gradient-to-r from-[#2A0E18] via-[#4A1525] to-[#2A0E18] flex items-center justify-around px-2 overflow-hidden relative">
                  {/* Floating Jasmine */}
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-50 shadow-[0_0_4px_#FFFBEB]" />
                  {/* Center Floating Tea Light Diya */}
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_8px_#F59E0B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                  {/* Floating Rose Petal */}
                  <span className="w-2.5 h-2 rounded-full bg-rose-600 shadow-[0_0_4px_#E11D48]" />
                </div>
              </div>
            </div>
            {/* Plinth shadow */}
            <div className="w-16 h-1.5 rounded-full bg-black/40 blur-xs mt-0.5" />
          </div>

          {/* Right 3D Miniature Glowing Diya */}
          <div className="relative flex flex-col items-center">
            {/* Flickering Diya Flame */}
            <div className="relative w-4 h-6 mb-[-3px] flex items-center justify-center">
              <div
                className="absolute w-12 h-12 rounded-full bg-amber-500/35 blur-md animate-pulse"
                style={{ animationDelay: '0.6s' }}
              />
              <div
                className="w-3.5 h-5 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-100 animate-pulse"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 70%, 75% 100%, 25% 100%, 0% 70%)',
                  animationDuration: '1.4s',
                  animationDelay: '0.4s',
                }}
              />
              <div className="absolute w-1.5 h-2.5 rounded-full bg-white opacity-90" />
            </div>

            {/* Terracotta / Brass Diya Base */}
            <div className="w-9 h-3.5 rounded-b-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 shadow-[0_4px_10px_rgba(0,0,0,0.6)] border-t border-amber-300/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
