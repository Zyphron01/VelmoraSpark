'use client';

import React from 'react';
import { Moon, Sparkles } from 'lucide-react';

export function ThemeToggle() {
  return (
    <div
      aria-label="Royal Festive Dark"
      title="Royal Festive Dark Mode (Active)"
      className="h-8 px-2.5 rounded-full flex items-center gap-1.5 border border-gold-300/30 bg-[#221226]/80 text-amber-300 text-xs shadow-xs font-serif select-none"
    >
      <Moon size={13} className="text-amber-400" />
      <span className="hidden sm:inline text-[11px] font-sans text-amber-200/90 font-medium flex items-center gap-1">
        Royal Dark <Sparkles size={10} className="text-amber-400 inline" />
      </span>
    </div>
  );
}
