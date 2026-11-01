'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, MessageCircle, X, Check, Plus, Accessibility,
  ExternalLink, Copy, UserCheck, Clock, ShieldAlert,
  Search, RefreshCw
} from 'lucide-react';
import { useApp } from '@/lib/app-store';
import type { Guest, DietaryType, AccessibilityTag } from '@/types/event';

const DIETARY_LABELS: Record<DietaryType, { label: string; color: string; bg: string }> = {
  standard:  { label: 'Standard',    color: 'text-[var(--ink)]',  bg: 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700' },
  jain:      { label: 'Jain (No Root Veg)', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30' },
  vegan:     { label: 'Pure Vegan 🌱', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-500/30' },
  nut_free:  { label: 'Nut-Free ⚠️', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/30' },
};

const ACCESSIBILITY_LABELS: Record<AccessibilityTag, string> = {
  wheelchair_ramp:    '♿ Wheelchair Ramp',
  ground_floor_room:  '🏠 Ground-Floor Room',
  elderly_seating:    '🪑 Elderly Seating',
  low_decibel_zone:   '🔕 Low-Decibel Zone',
};

// ─── RSVP Invite Preview Modal ────────────────────────────────────────────────

function InviteModal({ guest, eventTitle, onClose }: { guest: Guest; eventTitle: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const msg =
    `🎉 *You're warmly invited!*\n\n` +
    `*${eventTitle}*\n\n` +
    `Dear ${guest.name},\n\n` +
    `We would be deeply honored to celebrate this special milestone with you! 🙏\n\n` +
    `*Quick RSVP (no app download required):*\n` +
    `✅ YES, I will attend\n` +
    `❌ Regrets, cannot make it\n` +
    `🍽 Dietary preference: ${DIETARY_LABELS[guest.dietary].label}\n\n` +
    (guest.accessibilityTags.length > 0
      ? `♿ Accessibility / Mobility requests: ${guest.accessibilityTags.map((t) => ACCESSIBILITY_LABELS[t]).join(', ')}\n\n`
      : '') +
    `_Curated by Velmora Spark — Modern Celebration Architecture_`;

  const waLink = `https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="max-w-md w-full p-6 sm:p-7 rounded-[32px] border border-[var(--border-subtle)] bg-[var(--card)] shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)]">WhatsApp Invite Generator</h3>
              <p className="text-xs text-[var(--stone-500)]">Ready-to-send personalized zero-install invitation</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm p-1.5 rounded-full hover:bg-[var(--surface)]"><X size={18} /></button>
        </div>

        {/* Guest chip */}
        <div className="flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] mb-3.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[var(--terracotta-muted)] text-[var(--primary)] font-serif font-bold flex items-center justify-center text-xs flex-shrink-0">
              {guest.name[0]}
            </div>
            <span className="font-semibold text-[var(--ink)] truncate">{guest.name}</span>
            <span className="text-[var(--stone-500)] text-[11px] truncate font-mono">({guest.phone})</span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${DIETARY_LABELS[guest.dietary].bg} ${DIETARY_LABELS[guest.dietary].color} flex-shrink-0`}>
            {DIETARY_LABELS[guest.dietary].label}
          </span>
        </div>

        {/* WhatsApp Chat Bubble Mockup */}
        <div className="rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-[#DCF8C6]/40 dark:bg-[#12381F]/40 text-[var(--ink)] border border-[#25D366]/30 shadow-2xs mb-5">
          {msg}
        </div>

        <div className="flex gap-2.5">
          <a
            id={`open-wa-${guest.id}`}
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex-1 justify-center py-2.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white border-none shadow-xs rounded-full flex items-center gap-2"
          >
            <MessageCircle size={16} /> Open in WhatsApp
          </a>
          <button
            id={`copy-invite-${guest.id}`}
            onClick={handleCopy}
            className={`btn text-xs py-2.5 px-4 rounded-full transition-all border flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                : 'btn-ghost border-[var(--border-subtle)]'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-700" /> Copied! ✓
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Script
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Guest Form ───────────────────────────────────────────────────────────

function AddGuestForm({ onAdd }: { onAdd: (g: Guest) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dietary, setDietary] = useState<DietaryType>('standard');
  const [tags, setTags] = useState<AccessibilityTag[]>([]);
  const [plusOnes, setPlusOnes] = useState(0);

  function toggleTag(tag: AccessibilityTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function handleAdd() {
    if (!name.trim() || !phone.trim()) return;
    onAdd({
      id: `g-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`,
      dietary,
      accessibilityTags: tags,
      rsvpStatus: 'pending',
      plusOnes,
    });
    setName(''); setPhone(''); setDietary('standard'); setTags([]); setPlusOnes(0);
  }

  return (
    <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
      <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] mb-4 flex items-center gap-2">
        <Plus size={16} className="text-[var(--primary)]" /> Add New Guest to Register
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
        <input
          id="guest-name"
          className="input rounded-2xl bg-[var(--surface)] text-xs sm:text-sm"
          placeholder="Guest Full Name (e.g., Ramesh Sharma)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          id="guest-phone"
          className="input rounded-2xl bg-[var(--surface)] text-xs sm:text-sm font-mono"
          placeholder="Phone Number (e.g., 9876543210)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <div className="text-xs font-semibold text-[var(--ink)] mb-2">Dietary Preference</div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(DIETARY_LABELS) as DietaryType[]).map((d) => (
            <button
              key={d}
              id={`dietary-${d}`}
              type="button"
              onClick={() => setDietary(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                dietary === d
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border-subtle)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {DIETARY_LABELS[d].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs font-semibold text-[var(--ink)] mb-2 flex items-center gap-1.5">
          <Accessibility size={13} className="text-[var(--primary)]" /> Accessibility &amp; Special Seating Requests
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(ACCESSIBILITY_LABELS) as AccessibilityTag[]).map((tag) => (
            <button
              key={tag}
              id={`acc-tag-${tag}`}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                tags.includes(tag)
                  ? 'bg-[var(--terracotta-muted)] text-[var(--primary)] border-[var(--primary)] font-semibold'
                  : 'bg-[var(--surface)] text-[var(--stone-500)] border-[var(--border-subtle)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {ACCESSIBILITY_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-[var(--ink)]">Plus-ones:</span>
          <button
            type="button"
            onClick={() => setPlusOnes(Math.max(0, plusOnes - 1))}
            className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--ink)] font-bold flex items-center justify-center hover:bg-[var(--card-hover)]"
          >
            −
          </button>
          <span className="font-serif font-bold text-sm text-[var(--ink)] w-6 text-center">{plusOnes}</span>
          <button
            type="button"
            onClick={() => setPlusOnes(plusOnes + 1)}
            className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--ink)] font-bold flex items-center justify-center hover:bg-[var(--card-hover)]"
          >
            +
          </button>
        </div>
        <button
          id="add-guest-btn"
          type="button"
          onClick={handleAdd}
          className="btn btn-primary btn-sm rounded-full px-5 py-2 text-xs shadow-xs"
          disabled={!name.trim() || !phone.trim()}
        >
          <Plus size={14} /> Add Guest
        </button>
      </div>
    </div>
  );
}

// ─── RSVP Tab Main ────────────────────────────────────────────────────────────

export default function RSVPTab() {
  const { guests, setGuests, event, addGuest, syncDatabaseGuests, isDbSyncing } = useApp();
  const [previewGuest, setPreviewGuest] = useState<Guest | null>(null);
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | DietaryType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const pending = guests.filter((g) => g.rsvpStatus === 'pending');

  const totalHeadcount = guests.reduce((s, g) => s + 1 + g.plusOnes, 0);
  const dietaryCounts = {
    jain: guests.filter((g) => g.dietary === 'jain').length,
    vegan: guests.filter((g) => g.dietary === 'vegan').length,
    nut_free: guests.filter((g) => g.dietary === 'nut_free').length,
    standard: guests.filter((g) => g.dietary === 'standard').length,
  };
  const accessibilityCount = guests.filter((g) => g.accessibilityTags.length > 0).length;

  // Real-time Filtered Guests computation
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || g.name.toLowerCase().includes(q) || g.phone.includes(q);
      const matchesDietary = dietaryFilter === 'all' || g.dietary === dietaryFilter;
      const matchesStatus = statusFilter === 'all' || g.rsvpStatus === statusFilter;
      return matchesSearch && matchesDietary && matchesStatus;
    });
  }, [guests, searchQuery, dietaryFilter, statusFilter]);

  async function toggleRsvp(id: string) {
    const target = guests.find((g) => g.id === id);
    if (!target) return;
    const newStatus = target.rsvpStatus === 'confirmed' ? 'pending' : 'confirmed';

    // Optimistic local update
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, rsvpStatus: newStatus } : g))
    );

    // Database update if organizer key is cached
    try {
      const key = localStorage.getItem(`velmora_key_${event.id}`);
      if (key) {
        await fetch(`/api/events/${event.id}/guests/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({ rsvpStatus: newStatus }),
        });
      }
    } catch (err) {
      console.warn('Failed to update guest in database:', err);
    }
  }

  async function removeGuest(id: string) {
    setGuests((prev) => prev.filter((g) => g.id !== id));

    try {
      const key = localStorage.getItem(`velmora_key_${event.id}`);
      if (key) {
        await fetch(`/api/events/${event.id}/guests/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${key}`,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to delete guest from database:', err);
    }
  }

  function handleCopyGuestInvite(guest: Guest) {
    const msg =
      `🎉 *You're warmly invited!*\n\n` +
      `*${event.title}*\n\n` +
      `Dear ${guest.name},\n` +
      `Please confirm your attendance: reply YES or NO.\n` +
      `Dietary: ${DIETARY_LABELS[guest.dietary].label}\n` +
      `https://velmora.app/invite/${event.id}`;
    navigator.clipboard.writeText(msg);
    setCopiedGuestId(guest.id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  }

  function handleClearFilters() {
    setSearchQuery('');
    setDietaryFilter('all');
    setStatusFilter('all');
  }

  return (
    <div className="animate-slide-up space-y-6">
      {previewGuest && (
        <InviteModal
          guest={previewGuest}
          eventTitle={event.title}
          onClose={() => setPreviewGuest(null)}
        />
      )}

      {/* Live Guest RSVP Link Banner */}
      <div className="rounded-[32px] p-6 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="badge badge-terracotta text-[10px] font-bold uppercase tracking-wider mb-2">
            Zero-Install Mobile Portal
          </span>
          <h3 className="font-serif font-bold text-lg text-[var(--ink)]">Live Trilingual Guest Invitation &amp; RSVP Card</h3>
          <p className="text-xs text-[var(--stone-500)] mt-0.5">Instant attendee submissions in English, Hindi, and Kannada with live database sync.</p>
        </div>
        <a
          id="open-live-guest-invite"
          href={`/invite/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary text-xs py-2.5 px-5 rounded-full flex items-center gap-2 shadow-xs hover:scale-[1.02] transition-transform"
        >
          <span>Open Live Guest Page</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          { label: 'Total Headcount', value: totalHeadcount, icon: <Users size={18} />, color: 'text-[var(--ink)]' },
          { label: 'Confirmed (Attending)', value: confirmed.length, icon: <UserCheck size={18} />, color: 'text-[var(--success)]' },
          { label: 'Awaiting Response', value: pending.length, icon: <Clock size={18} />, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Accessibility Priority', value: accessibilityCount, icon: <ShieldAlert size={18} />, color: 'text-[var(--primary)]' },
        ].map((s) => (
          <div key={s.label} className="rounded-[28px] p-5 text-center border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--primary)] mx-auto flex items-center justify-center mb-2">
              {s.icon}
            </div>
            <div className={`font-serif text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-[var(--stone-500)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dietary matrix */}
      <div className="rounded-[32px] p-6 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)]">Kitchen Dietary Split Breakdown</h3>
          <span className="badge badge-stone text-xs">Audited for Buffet Prep</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'jain' as DietaryType, label: 'Jain (No Root Veg)', count: dietaryCounts.jain, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-500/20' },
            { key: 'vegan' as DietaryType, label: 'Pure Vegan 🌱', count: dietaryCounts.vegan, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-500/20' },
            { key: 'nut_free' as DietaryType, label: 'Nut-Free / Allergy ⚠️', count: dietaryCounts.nut_free, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-500/20' },
            { key: 'standard' as DietaryType, label: 'Standard Banquet', count: dietaryCounts.standard, color: 'text-[var(--ink)]', bg: 'bg-[var(--surface)]', border: 'border-[var(--border-subtle)]' },
          ].map((item) => (
            <div key={item.key} className={`rounded-2xl p-3.5 text-center border ${item.border} ${item.bg}`}>
              <div className={`font-serif text-2xl font-bold ${item.color}`}>{item.count}</div>
              <div className="text-xs font-semibold text-[var(--ink)] mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add guest */}
      <AddGuestForm onAdd={addGuest} />

      {/* Guest table */}
      <div className="rounded-[32px] p-6 sm:p-7 border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--terracotta-muted)] text-[var(--primary)] flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
                Celebration Guest Register ({guests.length})
              </h3>
              <p className="text-xs text-[var(--stone-500)]">
                {confirmed.length} Confirmed · {pending.length} Pending
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sync-db-guests-btn"
              type="button"
              onClick={() => syncDatabaseGuests()}
              disabled={isDbSyncing}
              className="btn btn-ghost btn-sm text-xs py-1.5 px-3 rounded-full border border-[var(--border-subtle)] flex items-center gap-1.5 text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              title="Sync guest register with live Neon PostgreSQL database"
            >
              <RefreshCw size={13} className={isDbSyncing ? 'animate-spin text-[var(--primary)]' : ''} />
              <span>{isDbSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>
          </div>
        </div>

        {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="space-y-3 mb-5 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)]">
          {/* Row 1: Search input */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--stone-400)]" />
              <input
                id="search-guests-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests by name or phone..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--card)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--stone-400)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--stone-400)] hover:text-[var(--ink)]"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {(searchQuery || dietaryFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm text-xs py-1.5 px-3 rounded-full text-[var(--primary)] hover:bg-[var(--terracotta-muted)] transition-colors flex items-center gap-1"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>

          {/* Row 2: Dietary & Status Filter Chips */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
            {/* Dietary filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[var(--stone-400)] uppercase tracking-wider mr-1">Diet:</span>
              {(['all', 'standard', 'jain', 'vegan', 'nut_free'] as const).map((d) => {
                const count = d === 'all' ? guests.length : dietaryCounts[d];
                const isSelected = dietaryFilter === d;
                return (
                  <button
                    key={d}
                    id={`filter-dietary-${d}`}
                    type="button"
                    onClick={() => setDietaryFilter(d)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all border ${
                      isSelected
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold shadow-xs'
                        : 'bg-[var(--card)] text-[var(--ink)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    {d === 'all' ? 'All' : d === 'jain' ? 'Jain' : d === 'vegan' ? 'Vegan 🌱' : d === 'nut_free' ? 'Nut-Free ⚠️' : 'Standard'} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[var(--stone-400)] uppercase tracking-wider mr-1">Status:</span>
              {(['all', 'confirmed', 'pending'] as const).map((s) => {
                const count = s === 'all' ? guests.length : s === 'confirmed' ? confirmed.length : pending.length;
                const isSelected = statusFilter === s;
                return (
                  <button
                    key={s}
                    id={`filter-status-${s}`}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all border ${
                      isSelected
                        ? 'bg-[var(--success)] text-white border-[var(--success)] font-semibold shadow-xs'
                        : 'bg-[var(--card)] text-[var(--ink)] border-[var(--border-subtle)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    {s === 'all' ? 'All' : s === 'confirmed' ? 'Confirmed' : 'Pending'} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Guest List Render ───────────────────────────────────────────── */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border-subtle)]">
              <Users size={32} className="mx-auto text-[var(--stone-400)] mb-2 opacity-50" />
              <h4 className="font-serif font-bold text-sm text-[var(--ink)] mb-1">No matching guests found</h4>
              <p className="text-xs text-[var(--stone-500)] mb-4">
                No guests in the register match your search query or active filter criteria.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-ghost btn-sm text-xs rounded-full border border-[var(--border-subtle)] px-4 py-1.5"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredGuests.map((guest) => {
              const isCopied = copiedGuestId === guest.id;
              return (
                <div
                  key={guest.id}
                  className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center gap-4 flex-wrap justify-between hover:border-[var(--primary)]/40 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--terracotta-muted)] text-[var(--primary)] font-serif font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {guest.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-sm text-[var(--ink)]">{guest.name}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${DIETARY_LABELS[guest.dietary]?.bg || 'bg-stone-100'} ${DIETARY_LABELS[guest.dietary]?.color || 'text-stone-800'}`}>
                          {DIETARY_LABELS[guest.dietary]?.label || guest.dietary}
                        </span>
                        {guest.accessibilityTags.map((tag) => (
                          <span key={tag} className="badge badge-terracotta text-[10px] font-medium">
                            {ACCESSIBILITY_LABELS[tag] || tag}
                          </span>
                        ))}
                        {guest.plusOnes > 0 && (
                          <span className="badge badge-stone text-[10px] font-bold">
                            +{guest.plusOnes} guest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--stone-500)] mt-1 font-mono">{guest.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id={`rsvp-toggle-${guest.id}`}
                      onClick={() => toggleRsvp(guest.id)}
                      className={`btn btn-sm text-xs py-1.5 px-3.5 rounded-full transition-all ${
                        guest.rsvpStatus === 'confirmed'
                          ? 'bg-[var(--success)] text-white hover:opacity-90'
                          : 'btn-ghost text-[var(--stone-500)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {guest.rsvpStatus === 'confirmed' ? <Check size={12} className="inline mr-1" /> : null}
                      {guest.rsvpStatus === 'confirmed' ? 'Confirmed' : 'Mark Confirmed'}
                    </button>

                    <button
                      id={`copy-guest-invite-${guest.id}`}
                      onClick={() => handleCopyGuestInvite(guest)}
                      className={`btn btn-sm text-xs py-1.5 px-3 rounded-full transition-all ${
                        isCopied ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold' : 'btn-ghost text-[var(--stone-500)] border border-[var(--border-subtle)] hover:bg-[var(--card)]'
                      }`}
                      title="Quick Copy WhatsApp Text"
                    >
                      {isCopied ? 'Copied! ✓' : 'Copy'}
                    </button>

                    <button
                      id={`invite-${guest.id}`}
                      onClick={() => setPreviewGuest(guest)}
                      className="btn btn-secondary btn-sm text-xs py-1.5 px-3 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 border-none flex items-center gap-1.5"
                      title="Generate WhatsApp Card"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      id={`remove-${guest.id}`}
                      onClick={() => removeGuest(guest.id)}
                      className="btn btn-ghost btn-sm p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full"
                      title="Remove guest"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
