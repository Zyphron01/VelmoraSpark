'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Layers, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatINR } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export interface CelebrationStyle {
  id: string;
  name: string;
  subtitle: string;
  totalCost: number;
  perPlate: number;
  riskScore: string;
  riskColor: string;
  savings: string;
  badge: string;
  tradeoffs: string[];
  keyHighlights: string[];
}

export const CELEBRATION_STYLES: CelebrationStyle[] = [
  {
    id: 'heritage',
    name: 'Signature Courtyard Heritage',
    subtitle: 'Classic royalty meets bespoke Indian craft',
    totalCost: 2800000,
    perPlate: 2400,
    riskScore: 'Low Risk (2/10)',
    riskColor: 'text-[var(--success)]',
    savings: 'Baseline Premium',
    badge: 'Royal Heritage',
    tradeoffs: ['Requires 6-hr earlier courtyard floral prep', 'Higher floral logistics complexity'],
    keyHighlights: ['Hammered brass lanterns & Mogra canopies', 'Live Shehnai & Sitar welcoming ensemble', '7-Course artisanal thali banquet'],
  },
  {
    id: 'smart_budget',
    name: 'High-Efficiency Smart Budget',
    subtitle: 'Cost-engineered without compromising elegance',
    totalCost: 2180000,
    perPlate: 1850,
    riskScore: 'Controlled (4/10)',
    riskColor: 'text-[var(--accent)]',
    savings: '-22% Cost Savings',
    badge: 'Smart Value',
    tradeoffs: ['Modular LED backdrop instead of fresh marigold curtain', 'Standardized 5-course seasonal menu'],
    keyHighlights: ['Direct farm-to-table bulk produce agreements', 'Pre-programmed DMX warm ambience wash', 'Optimized zero-leakage vendor contracts'],
  },
  {
    id: 'zero_waste',
    name: 'Intimate Zero-Waste Botanical',
    subtitle: '100% plastic-free, circular sustainability focus',
    totalCost: 2350000,
    perPlate: 2100,
    riskScore: 'Very Low (1/10)',
    riskColor: 'text-[var(--success)]',
    savings: 'Eco-Champion',
    badge: 'Zero-Waste',
    tradeoffs: ['Strictly seasonal locally sourced ingredients only', 'No artificial or imported cut flowers'],
    keyHighlights: ['Banana-fiber mandap & terracotta return favors', '100% compostable banana-leaf dining service', 'Surplus meal cold-chain distribution partnership'],
  },
];

interface PlanStyleCardProps {
  style: CelebrationStyle;
  isSelected: boolean;
  onSelect: (style: CelebrationStyle) => void;
}

export function PlanStyleCard({ style, isSelected, onSelect }: PlanStyleCardProps) {
  const [isShimmering, setIsShimmering] = useState(false);
  const { t } = useI18n();

  const handleSelect = () => {
    setIsShimmering(true);
    setTimeout(() => {
      setIsShimmering(false);
      onSelect(style);
      toast.success(`${t.actions.planUpdatedToast} ${style.name}`, {
        description: `Projected budget: ₹${style.totalCost.toLocaleString('en-IN')} (₹${style.perPlate}/plate)`,
        icon: <Sparkles size={16} className="text-[var(--accent)]" />,
      });
    }, 800);
  };

  return (
    <div
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      }}
      className={`relative p-5 sm:p-6 rounded-[28px] border transition-all duration-300 cursor-pointer flex flex-col justify-between jharokha-arch overflow-hidden ${
        isSelected
          ? 'bg-[var(--card)] border-[var(--marigold)] shadow-gold ring-2 ring-[var(--marigold)]/40 scale-[1.01]'
          : 'bg-[var(--card)]/90 border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:shadow-hover'
      }`}
    >
      {/* Decorative Jharokha Arch Crest */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-2 pointer-events-none flex justify-center items-start opacity-60">
        <svg width="100" height="8" viewBox="0 0 100 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0C18 0 26 7 50 7C74 7 82 0 100 0H0Z" fill="#FFAE34" fillOpacity="0.4" />
        </svg>
      </div>
      {/* 800ms Shimmer Overlay */}
      {isShimmering && (
        <div className="absolute inset-0 rounded-[28px] skeleton z-20 pointer-events-none opacity-80" />
      )}

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
              isSelected
                ? 'pill-gold-metallic'
                : 'bg-[var(--ivory)] text-[var(--ink)] border border-[var(--border-subtle)]'
            }`}
          >
            {style.badge}
          </span>
          <span className="text-[11px] font-mono font-bold text-[var(--primary)]">
            {style.savings}
          </span>
        </div>

        <h3 className="font-serif font-bold text-lg text-[var(--ink)] leading-snug mb-1">
          {style.name}
        </h3>
        <p className="text-xs text-[var(--stone-500)] mb-4">{style.subtitle}</p>

        {/* Financial Highlights */}
        <div className="p-3.5 rounded-2xl bg-[var(--ivory)] border border-[var(--border-subtle)] space-y-1.5 text-xs mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[var(--stone-500)]">Target Budget:</span>
            <strong className="font-serif text-sm text-[var(--ink)]">{formatINR(style.totalCost)}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--stone-500)]">Per-Plate Est:</span>
            <strong className="font-serif text-sm text-[var(--ink)]">₹{style.perPlate}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--stone-500)]">Operational Risk:</span>
            <strong className={`font-semibold ${style.riskColor}`}>{style.riskScore}</strong>
          </div>
        </div>

        {/* Highlights List */}
        <div className="space-y-2 mb-4 text-xs">
          <div>
            <span className="font-bold text-[var(--ink)] block mb-1 flex items-center gap-1">
              <Sparkles size={12} className="text-[var(--accent)]" /> Key Highlights:
            </span>
            <ul className="space-y-1 text-[var(--stone-500)] pl-1">
              {style.keyHighlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-[var(--primary)] font-bold">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <span className="font-semibold text-[var(--stone-400)] text-[11px] block mb-0.5">Trade-offs:</span>
            <p className="text-[11px] text-[var(--stone-500)] leading-tight">{style.tradeoffs.join(' · ')}</p>
          </div>
        </div>
      </div>

      {/* Select CTA Button */}
      <div
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mt-2 ${
          isSelected
            ? 'bg-[var(--primary)] text-white shadow-sm'
            : 'bg-[var(--ivory)] text-[var(--ink)] border border-[var(--border-subtle)] hover:bg-[var(--card)] hover:border-[var(--primary)]'
        }`}
      >
        {isSelected ? (
          <>
            <Check size={14} />
            <span>Active Celebration Style</span>
          </>
        ) : (
          <>
            <span>Choose This Style</span>
            <ChevronRight size={13} />
          </>
        )}
      </div>
    </div>
  );
}

export function ChooseCelebrationStyleSection({
  selectedId,
  onSelectStyle,
}: {
  selectedId: string;
  onSelectStyle: (style: CelebrationStyle) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft p-6 sm:p-7">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-[var(--ink)]">
              {t.chooseCelebrationStyle}
            </h2>
            <p className="text-xs text-[var(--stone-500)] mt-0.5">
              {t.planApproachesSub}
            </p>
          </div>
        </div>
        <span className="badge badge-sage text-[10px] font-bold py-1 px-3">
          <ShieldCheck size={12} className="inline mr-1" />
          Audited Cost Ceilings
        </span>
      </div>

      {/* 3 Columns Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CELEBRATION_STYLES.map((style) => (
          <PlanStyleCard
            key={style.id}
            style={style}
            isSelected={selectedId === style.id}
            onSelect={onSelectStyle}
          />
        ))}
      </div>
    </div>
  );
}
