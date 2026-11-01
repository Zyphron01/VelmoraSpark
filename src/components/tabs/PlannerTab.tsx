'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Sparkles, Check, X, Leaf, Accessibility,
  ChevronDown, ChevronUp, Loader2, Globe, Palette,
  Users2, ThumbsUp, ShieldCheck, Heart
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { formatINR } from '@/lib/utils';
import type { PlanSuggestion } from '@/types/event';

type Language = 'en' | 'hi' | 'kn';

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
};

const LANG_PLACEHOLDERS: Record<Language, string> = {
  en: 'e.g. "Add a live ghazal performance for 30 mins after dinner with low-decibel seating..."',
  hi: 'जैसे "रात के खाने के बाद 30 मिनट के लिए लाइव गज़ल शो एवं वरिष्ठ नागरिकों हेतु शांत बैठक व्यवस्था..."',
  kn: 'ಉದಾ. "ರಾತ್ರಿ ಊಟದ ನಂತರ 30 ನಿಮಿಷ ಲೈವ್ ಸಂಗೀತ ಹಾಗೂ ಹಿರಿಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಆಸನ ವ್ಯವಸ್ಥೆ..."',
};

import { HeroBanner } from '@/components/planner/HeroBanner';
import { ChooseCelebrationStyleSection, CelebrationStyle } from '@/components/planner/PlanStyleCard';
import { WhatIfSimulator } from '@/components/planner/WhatIfSimulator';
import { triggerCelebrationMoment } from '@/components/ui/CelebrationMoment';

// ─── Suggestion Card with Collaborative Voting ───────────────────────────────

function SuggestionCard({
  suggestion,
  onApprove,
  onReject,
}: {
  suggestion: PlanSuggestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [showRationale, setShowRationale] = useState(false);

  // Collaborative Stakeholder Voting State
  const [parentVote, setParentVote] = useState<'approved' | 'review'>('approved');
  const [coupleVote, setCoupleVote] = useState<'loved' | 'neutral'>('loved');
  const [logisticsVote, setLogisticsVote] = useState<'feasible' | 'risk'>('feasible');
  const consensusScore = (parentVote === 'approved' ? 1 : 0) + (coupleVote === 'loved' ? 1 : 0) + (logisticsVote === 'feasible' ? 1 : 0);

  const statusBorder = {
    pending: 'border-[var(--border-subtle)] hover:border-[var(--cta)]/40 bg-[var(--card)] shadow-soft',
    approved: 'border-[var(--success)]/30 bg-[#F4F9F5] dark:bg-[#15271A] shadow-soft border-l-4 border-l-[var(--success)]',
    rejected: 'border-[var(--border-subtle)] bg-[var(--card)]/60 opacity-60 border-l-4 border-l-rose-500',
  };

  return (
    <div className={`rounded-[24px] p-5 sm:p-6 border transition-all duration-300 ${statusBorder[suggestion.status]}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="badge badge-stone text-[10px] uppercase font-bold tracking-wider">{suggestion.phase}</span>
            {suggestion.status === 'approved' && (
              <span className="badge badge-sage font-semibold">✓ Approved to Ops</span>
            )}
            {suggestion.status === 'rejected' && (
              <span className="badge badge-crimson font-semibold">✗ Rejected</span>
            )}
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
              consensusScore === 3
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}>
              {consensusScore === 3 ? '★ 3/3 Consensus Achieved' : `${consensusScore}/3 Stakeholder Consensus`}
            </span>
          </div>

          <h3 className="font-serif font-bold text-[var(--ink)] text-base sm:text-lg leading-snug">{suggestion.title}</h3>
          <p className="text-xl sm:text-2xl font-serif font-bold text-[var(--cta)] mt-1">
            {formatINR(suggestion.estimatedCost)}
          </p>
        </div>

        {suggestion.status === 'pending' && (
          <div className="flex gap-2 flex-shrink-0 items-center">
            <button
              id={`approve-${suggestion.id}`}
              onClick={() => onApprove(suggestion.id)}
              className="btn btn-sage btn-sm rounded-full px-4 py-1.5 shadow-xs font-semibold flex items-center gap-1.5 transition-transform hover:scale-105"
              title="Approve and automatically add to Budget and Run Sheet"
            >
              <Check size={12} /> Approve
            </button>
            <button
              id={`reject-${suggestion.id}`}
              onClick={() => onReject(suggestion.id)}
              className="btn btn-crimson btn-sm rounded-full px-4 py-1.5 shadow-xs font-semibold flex items-center gap-1.5"
            >
              <X size={12} /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex gap-2 mt-2.5 flex-wrap">
        <span className="badge badge-sage text-[10px] py-0.5">
          <Leaf size={10} /> {suggestion.wasteImpact.length > 40 ? suggestion.wasteImpact.slice(0, 40) + '…' : suggestion.wasteImpact}
        </span>
        <span className="badge badge-terracotta text-[10px] py-0.5">
          <Accessibility size={10} /> {suggestion.accessibilityNote || 'Universal Accessibility'}
        </span>
      </div>

      {/* Collaborative Stakeholder Voting Bar */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] bg-[var(--surface)] -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-[24px]">
        <div className="flex items-center justify-between text-[11px] text-[var(--stone-500)] mb-2.5">
          <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
            <Users2 size={13} className="text-[var(--primary)]" /> Stakeholder Voting Consensus
          </span>
          <span className="text-[10px] text-[var(--stone-500)] hidden sm:inline">Simulate committee alignment</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Parents (Buyer) */}
          <button
            type="button"
            onClick={() => setParentVote((v) => (v === 'approved' ? 'review' : 'approved'))}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
              parentVote === 'approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            <ShieldCheck size={11} />
            Parents: {parentVote === 'approved' ? 'Approved ✓' : 'Review Needed ?'}
          </button>

          {/* Couple / Fest Lead */}
          <button
            type="button"
            onClick={() => setCoupleVote((v) => (v === 'loved' ? 'neutral' : 'loved'))}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
              coupleVote === 'loved'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-700 dark:text-rose-300'
                : 'bg-[var(--card)] border-[var(--border-subtle)] text-[var(--stone-500)]'
            }`}
          >
            <Heart size={11} />
            Couple: {coupleVote === 'loved' ? 'Loved It ❤️' : 'Considering'}
          </button>

          {/* Logistics Head */}
          <button
            type="button"
            onClick={() => setLogisticsVote((v) => (v === 'feasible' ? 'risk' : 'feasible'))}
            className={`px-3 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-all shadow-xs ${
              logisticsVote === 'feasible'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            <ThumbsUp size={11} />
            Logistics: {logisticsVote === 'feasible' ? 'Feasible ⚡' : 'High Risk ⚠️'}
          </button>
        </div>

        {/* Quote-Challenge Rationale Accordion */}
        <button
          onClick={() => setShowRationale((v) => !v)}
          className="mt-3.5 flex items-center justify-between w-full p-2.5 rounded-xl bg-[var(--card)] hover:bg-[var(--card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--primary)] transition-colors shadow-2xs"
        >
          <span className="flex items-center gap-1.5">
            <span>💡</span>
            <span>Quote-Challenge Rationale &amp; Vendor Counter-Offer</span>
          </span>
          {showRationale ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRationale && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] text-xs space-y-2 animate-fade-in shadow-xs">
            <p className="text-[var(--ink)] leading-relaxed font-sans">{suggestion.costRationale}</p>
            {suggestion.accessibilityNote && (
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[var(--success)] text-[11px]">
                <Accessibility size={13} className="shrink-0" />
                <span><strong>Accessibility Protocol:</strong> {suggestion.accessibilityNote}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Moodboard Component ───────────────────────────────────────────────────

function MoodboardPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const SWATCHES = [
    { hex: '#FAF7F2', name: 'Warm Cream', role: 'Canvas & Base Linen' },
    { hex: '#6B1D2A', name: 'Royal Crimson', role: 'Primary Heritage Accent' },
    { hex: '#C9A24B', name: 'Imperial Gold', role: 'Brass Urulis & Foil' },
    { hex: '#F2A33A', name: 'Marigold Amber', role: 'Fresh Garlands & Joy' },
    { hex: '#E4572E', name: 'Terracotta', role: 'Pottery & Direct CTAs' },
  ];

  return (
    <div className="rounded-[32px] p-5 sm:p-6 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--highlight)] flex items-center justify-center text-white shadow-xs">
            <Palette size={16} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] flex items-center gap-2">
              Theme &amp; Styling Direction Moodboard
              <span className="badge badge-terracotta text-[10px]">Kinfolk × Royal India</span>
            </h3>
            <p className="text-xs text-[var(--stone-500)] mt-0.5">Harmonized 5-swatch palette, lighting profile &amp; sustainable decor swaps</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-[var(--stone-500)]" /> : <ChevronDown size={16} className="text-[var(--stone-500)]" />}
      </button>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] animate-fade-in space-y-4">
          {/* Swatches */}
          <div>
            <div className="text-xs font-semibold text-[var(--ink)] mb-2.5">Curated Editorial Color Palette</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {SWATCHES.map((s) => (
                <div key={s.hex} className="p-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xs">
                  <div
                    className="h-12 w-full rounded-xl mb-2 shadow-inner border border-black/5"
                    style={{ backgroundColor: s.hex }}
                  />
                  <div className="font-mono text-[10px] text-[var(--ink)] font-semibold">{s.hex}</div>
                  <div className="text-xs font-semibold text-[var(--ink)] leading-tight">{s.name}</div>
                  <div className="text-[10px] text-[var(--stone-500)] leading-tight mt-0.5">{s.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floral & Fabric Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)]">
              <span className="font-serif font-bold text-[var(--ink)] block mb-1">🌿 Floral &amp; Botanical Direction</span>
              <p className="text-[var(--stone-500)] text-xs leading-relaxed">
                Golden Marigolds, Tuberose (Rajnigandha), and floating Lotus blossoms in vintage hammered brass Urulis. Zero imported synthetic cut flowers.
              </p>
            </div>
            <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)]">
              <span className="font-serif font-bold text-[var(--ink)] block mb-1">🕯️ Lighting &amp; Acoustic Profile</span>
              <p className="text-[var(--stone-500)] text-xs leading-relaxed">
                2700K warm filament ambient glow. Directional dining pin-spots with acoustic fabric baffles behind sound system to protect elderly conversation zones.
              </p>
            </div>
          </div>

          {/* Sustainable Decor Swaps */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs border border-emerald-500/20">
            <span className="font-bold block mb-1.5 flex items-center gap-1.5">
              <Leaf size={14} className="text-emerald-600 dark:text-emerald-400" /> High-Craft Sustainable Swaps
            </span>
            <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
              <li><strong>Decor:</strong> Reusable brass Diya trees replace single-use polystyrene foam structures (saves ~45 kg plastic).</li>
              <li><strong>Rangoli:</strong> Organic fresh rose &amp; marigold petal geometry replaces chemical powders.</li>
              <li><strong>Favors:</strong> Hand-turned terracotta spice jars filled with organic hill cardamom in cotton potlis.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Planner Tab Main ─────────────────────────────────────────────────────────

export default function PlannerTab() {
  const { suggestions, setSuggestions, approveSuggestion, rejectSuggestion, preset, setBudget, setCatering } = useApp();
  const [selectedStyleId, setSelectedStyleId] = useState('heritage');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleSelectStyle = (style: CelebrationStyle) => {
    setSelectedStyleId(style.id);
    setCatering((prev) => ({
      ...prev,
      perPlateCost: style.perPlate,
      recommendedPlates: prev.p90PeakTurnout,
    }));
    setBudget((prev) =>
      prev.map((b, i) => {
        if (i === 0) {
          return {
            ...b,
            quotedAmount: Math.round(style.totalCost * 0.42),
            projectedFinalInvoice: Math.round(style.totalCost * 0.44),
          };
        }
        return b;
      })
    );
  };

  const handleVoice = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.webkitSpeechRecognition || win.SpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const r = new SpeechRecognitionAPI();
    r.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    r.continuous = false;
    r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      setPrompt((prev) => prev + ' ' + (e.results?.[0]?.[0]?.transcript || ''));
      setIsListening(false);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  }, [isListening, language]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language, preset }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        const newSuggestions: PlanSuggestion[] = data.suggestions.map(
          (s: Omit<PlanSuggestion, 'id' | 'status'>, i: number) => ({
            ...s,
            id: `ai-${Date.now()}-${i}`,
            status: 'pending' as const,
          })
        );
        setSuggestions((prev) => [...newSuggestions, ...prev]);
        setPrompt('');
      } else {
        setAiError('No suggestions returned. Try a different prompt.');
      }
    } catch {
      setAiError('Could not reach AI. Check your connection or API key.');
    } finally {
      setIsLoading(false);
    }
  }

  const approved = suggestions.filter((s) => s.status === 'approved');
  const pending = suggestions.filter((s) => s.status === 'pending');
  const rejected = suggestions.filter((s) => s.status === 'rejected');

  return (
    <div className="animate-slide-up space-y-6">
      {/* Editorial Hero Banner with Progress Rings */}
      <HeroBanner />

      {/* Curated Celebration Styles (Rubric Differentiator) */}
      <ChooseCelebrationStyleSection
        selectedId={selectedStyleId}
        onSelectStyle={handleSelectStyle}
      />

      {/* What-If Financial & Turnout Stress Simulator */}
      <WhatIfSimulator />

      {/* AI Theme & Styling Moodboard */}
      <MoodboardPanel />

      {/* AI Intake Bar */}
      <div className="rounded-[32px] p-5 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--ink)]">AI Event Operations Co-Planner</h3>
              <p className="text-xs text-[var(--stone-500)] mt-0.5">Describe your celebration idea to generate instant operational plans</p>
            </div>
          </div>
          <span className="badge badge-terracotta text-[10px] font-bold py-1 px-3">
            Trilingual Engine
          </span>
        </div>

        {/* Language Pills */}
        <div className="flex gap-2 mb-3 items-center">
          <Globe size={14} className="text-[var(--stone-500)]" />
          {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
            <button
              key={lang}
              id={`lang-${lang}`}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                language === lang
                  ? 'bg-[var(--primary)] text-white font-semibold shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-subtle)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>

        {/* Text input + voice + send */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              id="ai-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder={LANG_PLACEHOLDERS[language]}
              rows={2}
              className="input resize-none pr-10 text-xs sm:text-sm rounded-2xl bg-[var(--surface)] border-[var(--border-subtle)] text-[var(--ink)]"
            />
            {isListening && (
              <div className="absolute right-3 top-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              id="voice-input-btn"
              onClick={handleVoice}
              className={`btn btn-sm ${isListening ? 'btn-primary' : 'btn-ghost'} h-auto px-3.5 py-2.5 rounded-2xl`}
              title="Voice input in English, Hindi, or Kannada"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              id="generate-suggestions-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="btn btn-primary btn-sm h-auto px-3.5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-sm"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          </div>
        </div>
        {aiError && <p className="text-xs text-rose-500 mt-2">{aiError}</p>}
        <p className="text-[11px] text-[var(--stone-500)] mt-2.5">
          Tip: Press Ctrl+Enter to submit · Speak in English, Hindi, or Kannada
        </p>
      </div>

      {/* Suggestion Cards with Stakeholder Voting */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--stone-500)] px-1">
          <span className="font-serif font-bold text-base text-[var(--ink)]">Celebration Operations Pipeline</span>
          <span className="badge badge-stone text-[11px]">{suggestions.length} Items</span>
        </div>

        {[...approved, ...pending, ...rejected].length === 0 && (
          <div className="text-center py-12 text-[var(--stone-500)] rounded-[32px] border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30 text-[var(--primary)]" />
            <p className="text-sm">No suggestions yet. Describe your celebration idea above to generate instant operational plans.</p>
          </div>
        )}
        {[...approved, ...pending, ...rejected].map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onApprove={(id) => {
              approveSuggestion(id);
              triggerCelebrationMoment('approve', 'Approved to Operations 🌸');
            }}
            onReject={rejectSuggestion}
          />
        ))}
      </div>
    </div>
  );
}
