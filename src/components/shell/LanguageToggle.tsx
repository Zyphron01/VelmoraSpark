'use client';

import React from 'react';
import { useI18n, type Language } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const options: { code: Language; label: string; fontClass: string }[] = [
    { code: 'en', label: 'EN', fontClass: 'font-sans' },
    { code: 'hi', label: 'हिंदी', fontClass: 'font-devanagari' },
    { code: 'kn', label: 'ಕನ್ನಡ', fontClass: 'font-kannada' },
  ];

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="flex items-center p-0.5 rounded-full border border-[var(--border-subtle)] bg-[var(--card)]/90 backdrop-blur-xs shadow-xs"
    >
      {options.map((opt) => {
        const isSelected = language === opt.code;
        return (
          <button
            key={opt.code}
            id={`lang-btn-${opt.code}`}
            onClick={() => setLanguage(opt.code)}
            aria-pressed={isSelected}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${opt.fontClass} ${
              isSelected
                ? 'bg-[var(--primary)] text-white shadow-xs scale-102'
                : 'text-[var(--ink)]/70 hover:text-[var(--ink)] hover:bg-[var(--bg)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
