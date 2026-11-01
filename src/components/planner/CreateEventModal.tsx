'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  PartyPopper,
  Check,
  AlertCircle,
  Building,
  Utensils,
  Palette,
  Camera,
  Music,
} from 'lucide-react';
import { useApp, type CreateCustomEventInput } from '@/lib/app-store';
import type { EventCategory } from '@/types/event';
import { formatINR } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: { id: EventCategory; label: string; emoji: string; desc: string }[] = [
  { id: 'wedding', label: 'Wedding & Sangeet', emoji: '👑', desc: 'Mandap décor, catering, baraat ops' },
  { id: 'college_fest', label: 'College & Cultural Fest', emoji: '🎭', desc: 'Stage production, pro-night, student ops' },
  { id: 'milestone_birthday', label: 'Milestone Jubilee / Birthday', emoji: '✨', desc: 'Banquet, DJ, VIP hospitality' },
  { id: 'celebration', label: 'Family & Corporate Celebration', emoji: '🪔', desc: 'Gala dinners, award ceremonies' },
  { id: 'other', label: 'Bespoke Event', emoji: '🎉', desc: 'Custom gathering & run-of-show' },
];

const POPULAR_CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Jaipur', 'Hyderabad', 'Chennai', 'Pune', 'Goa'];
const GUEST_CHIPS = [100, 250, 500, 1000];
const BUDGET_CHIPS = [
  { label: '₹5L', value: 500000 },
  { label: '₹15L', value: 1500000 },
  { label: '₹35L', value: 3500000 },
  { label: '₹75L', value: 7500000 },
];

export function CreateEventModal({ isOpen, onClose }: Props) {
  const { createCustomEvent, setActiveTab } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EventCategory>('wedding');
  const [date, setDate] = useState(() => {
    // Default to 45 days in future
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [city, setCity] = useState('Bengaluru');
  const [invitedCount, setInvitedCount] = useState<number>(250);
  const [totalBudget, setTotalBudget] = useState<number>(1850000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real-time dynamic budget preview (5 categories summing to 100%)
  const venue = Math.round(totalBudget * 0.35);
  const catering = Math.round(totalBudget * 0.30);
  const decor = Math.round(totalBudget * 0.15);
  const media = Math.round(totalBudget * 0.10);
  const entertainment = totalBudget - (venue + catering + decor + media);

  // Form validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name || name.trim().length < 3) {
      errs.name = 'Celebration name must be at least 3 characters.';
    }
    if (!date) {
      errs.date = 'Please select a valid event date.';
    }
    if (!city || city.trim().length < 2) {
      errs.city = 'Please specify a host city.';
    }
    if (!invitedCount || invitedCount < 10) {
      errs.invitedCount = 'Minimum expected guest count is 10.';
    } else if (invitedCount > 50000) {
      errs.invitedCount = 'Maximum guest count is 50,000.';
    }
    if (!totalBudget || totalBudget < 25000) {
      errs.totalBudget = 'Minimum sanctioned budget is ₹25,000.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const input: CreateCustomEventInput = {
        name: name.trim(),
        category,
        date,
        city: city.trim(),
        invitedCount: Number(invitedCount),
        totalBudget: Number(totalBudget),
      };

      const result = createCustomEvent(input);
      if (result.success) {
        setActiveTab('planner');
        onClose();
      }
    } catch (err) {
      console.error('Failed to create custom celebration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gold-300/40 bg-[#1A0B1A] text-amber-100 shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 -mx-5 -mt-5 sm:-mx-8 sm:-mt-8 px-5 py-4 sm:px-8 bg-[#1A0B1A]/95 backdrop-blur-md border-b border-gold-300/20 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <PartyPopper size={22} />
            </div>
            <div>
              <h2 id="create-event-modal-title" className="font-serif text-lg sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
                Plan Your Celebration
                <Sparkles size={16} className="text-amber-400 shrink-0" />
              </h2>
              <p className="text-xs text-amber-200/70">
                Create a bespoke event with live budget allocations, catering math & timeline operations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close creation dialog"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-900/60 text-amber-200 hover:text-white border border-white/20 hover:border-rose-400 flex items-center justify-center cursor-pointer transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Event Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>Celebration Name</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav & Meera's Sangeet & Reception"
              className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-sm text-white placeholder-amber-200/40 focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-500 focus:ring-rose-500/40'
                  : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/30'
              }`}
            />
            {errors.name && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.name}
              </span>
            )}
          </div>

          {/* 2. Event Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Celebration Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/30 shadow-md'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{cat.emoji}</span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-white">{cat.label}</strong>
                      <span className="text-[10px] text-amber-200/60 block truncate">{cat.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Date & City (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Calendar size={13} />
                <span>Date</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.date
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
              {errors.date && (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.date}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <MapPin size={13} />
                <span>Host City</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Jaipur"
                className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-sm text-white placeholder-amber-200/40 focus:outline-none focus:ring-2 transition-all ${
                  errors.city
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
              {/* City quick chips */}
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {POPULAR_CITIES.slice(0, 4).map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCity(c)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-amber-400/20 text-amber-200/80 hover:text-amber-200 border border-white/10"
                  >
                    {c}
                  </button>
                ))}
              </div>
              {errors.city && (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.city}
                </span>
              )}
            </div>
          </div>

          {/* 4. Expected Guest Count */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Users size={13} />
                <span>Expected Guest Count</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                {invitedCount.toLocaleString('en-IN')} Guests
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="50000"
                step="10"
                value={invitedCount}
                onChange={(e) => setInvitedCount(Math.max(0, parseInt(e.target.value) || 0))}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-black/40 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.invitedCount
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
              <div className="flex items-center gap-1">
                {GUEST_CHIPS.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setInvitedCount(g)}
                    className={`text-xs px-2.5 py-2 rounded-xl border transition-all ${
                      invitedCount === g
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200 font-bold'
                        : 'border-white/10 bg-white/5 text-amber-200/70 hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {errors.invitedCount && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.invitedCount}
              </span>
            )}
          </div>

          {/* 5. Total Sanctioned Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <IndianRupee size={13} />
                <span>Total Sanctioned Budget (INR)</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-sm font-serif font-bold text-emerald-400">
                {formatINR(totalBudget)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="25000"
                max="500000000"
                step="50000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(0, parseInt(e.target.value) || 0))}
                className={`flex-1 px-4 py-2.5 rounded-xl bg-black/40 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  errors.totalBudget
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/30'
                }`}
              />
              <div className="flex items-center gap-1">
                {BUDGET_CHIPS.map((b) => (
                  <button
                    type="button"
                    key={b.value}
                    onClick={() => setTotalBudget(b.value)}
                    className={`text-xs px-2.5 py-2 rounded-xl border transition-all ${
                      totalBudget === b.value
                        ? 'border-amber-400 bg-amber-400/20 text-amber-200 font-bold'
                        : 'border-white/10 bg-white/5 text-amber-200/70 hover:bg-white/10'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            {errors.totalBudget && (
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.totalBudget}
              </span>
            )}
          </div>

          {/* 6. Dynamic Budget Breakdown Preview (Totaling 100%) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 uppercase tracking-wider">
                Dynamic Cost Allocation (100% Ceilings)
              </span>
              <span className="text-amber-200/70">
                Per-Plate Target: ~{formatINR(Math.round(catering / Math.max(1, invitedCount)))}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <Building size={14} className="mx-auto mb-1 text-amber-400" />
                <span className="text-amber-200/70 block text-[9px] uppercase">Venue (35%)</span>
                <strong className="text-white block font-serif">{formatINR(venue)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <Utensils size={14} className="mx-auto mb-1 text-amber-400" />
                <span className="text-amber-200/70 block text-[9px] uppercase">Catering (30%)</span>
                <strong className="text-white block font-serif">{formatINR(catering)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <Palette size={14} className="mx-auto mb-1 text-amber-400" />
                <span className="text-amber-200/70 block text-[9px] uppercase">Décor (15%)</span>
                <strong className="text-white block font-serif">{formatINR(decor)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <Camera size={14} className="mx-auto mb-1 text-amber-400" />
                <span className="text-amber-200/70 block text-[9px] uppercase">Media (10%)</span>
                <strong className="text-white block font-serif">{formatINR(media)}</strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
                <Music size={14} className="mx-auto mb-1 text-amber-400" />
                <span className="text-amber-200/70 block text-[9px] uppercase">Show (10%)</span>
                <strong className="text-white block font-serif">{formatINR(entertainment)}</strong>
              </div>
            </div>
          </div>

          {/* Submission and Transparency Footer */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gold-300/20 flex-wrap">
            <span className="text-[11px] text-amber-200/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Saved privately in this browser session
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-amber-200 text-xs font-semibold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Sparkles size={15} />
                <span>Launch Celebration Workspace</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
