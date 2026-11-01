'use client';

import React, { useState, useRef } from 'react';
import {
  MessageCircle,
  X,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Calendar,
  MapPin,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import { useApp } from '@/lib/app-store';

export type CardTemplate = 'royal_crimson' | 'saffron_carnivale' | 'midnight_emerald' | 'temple_sandalwood';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES: Record<
  CardTemplate,
  {
    name: string;
    badge: string;
    bg: string;
    border: string;
    accent: string;
    pillBg: string;
    titleColor: string;
    goldStop1: string;
    goldStop2: string;
  }
> = {
  royal_crimson: {
    name: 'Royal Rajputana',
    badge: 'Royal Crimson & Gold',
    bg: 'linear-gradient(145deg, #2D0B14 0%, #17040A 60%, #360E18 100%)',
    border: '#FFAE34',
    accent: '#FFAE34',
    pillBg: 'rgba(255, 174, 52, 0.15)',
    titleColor: '#FFFDF5',
    goldStop1: '#FFE29F',
    goldStop2: '#FFAE34',
  },
  saffron_carnivale: {
    name: 'Aarohan Carnivale',
    badge: 'Electric Saffron & Indigo',
    bg: 'linear-gradient(145deg, #1A0E2E 0%, #0C0617 60%, #2A1347 100%)',
    border: '#F59E0B',
    accent: '#F59E0B',
    pillBg: 'rgba(245, 158, 11, 0.18)',
    titleColor: '#FFFBEB',
    goldStop1: '#FDE68A',
    goldStop2: '#F59E0B',
  },
  midnight_emerald: {
    name: 'Golden Jubilee',
    badge: 'Midnight Emerald & Jade',
    bg: 'linear-gradient(145deg, #062319 0%, #03120D 60%, #0C3829 100%)',
    border: '#34D399',
    accent: '#34D399',
    pillBg: 'rgba(52, 211, 153, 0.16)',
    titleColor: '#ECFDF5',
    goldStop1: '#A7F3D0',
    goldStop2: '#34D399',
  },
  temple_sandalwood: {
    name: 'Temple Kalyanam',
    badge: 'Kanjeevaram & Sandalwood',
    bg: 'linear-gradient(145deg, #32140A 0%, #1A0803 60%, #441A0D 100%)',
    border: '#F97316',
    accent: '#F97316',
    pillBg: 'rgba(249, 115, 22, 0.18)',
    titleColor: '#FFF7ED',
    goldStop1: '#FED7AA',
    goldStop2: '#F97316',
  },
};

export function WhatsAppShareCardModal({ isOpen, onClose }: Props) {
  const { event, runSheet } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('royal_crimson');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC key
  React.useEffect(() => {
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

  const currentTpl = TEMPLATES[selectedTemplate];

  // Key milestones
  const topSchedule = runSheet.slice(0, 4);

  // Generate WhatsApp formatted text
  const generateWhatsAppText = () => {
    const divider = '═════════════════════════';
    const scheduleItems = topSchedule
      .map((item) => `⏱️ *${item.currentTime}* — ${item.title} (${item.owner})`)
      .join('\n');

    return `✨ *${event.title.toUpperCase()}* ✨
_${event.category.replace('_', ' ').toUpperCase()} · OFFICIAL CELEBRATION DIGEST_
${divider}
📅 *Date:* ${event.date}
📍 *Venue:* ${event.city}
👥 *Confirmed Guests:* ${event.confirmedRsvpCount} / ${event.invitedCount}
${divider}
🔔 *RUN-OF-SHOW SCHEDULE & CUES:*
${scheduleItems}
${divider}
🛡️ *Real-Time Ops:* Coordinated via Velmora Spark
🔗 *Guest RSVP & Updates:* http://localhost:3000/invite/${event.id}`;
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Robust fallback for headless / unfocused browser contexts
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {}
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Render HTML card directly to high-resolution downloadable PNG
  const handleDownloadCard = () => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    if (selectedTemplate === 'royal_crimson') {
      bgGrad.addColorStop(0, '#2D0B14');
      bgGrad.addColorStop(0.6, '#17040A');
      bgGrad.addColorStop(1, '#3B0E1B');
    } else if (selectedTemplate === 'saffron_carnivale') {
      bgGrad.addColorStop(0, '#1A0E2E');
      bgGrad.addColorStop(0.6, '#0C0617');
      bgGrad.addColorStop(1, '#2A1347');
    } else if (selectedTemplate === 'midnight_emerald') {
      bgGrad.addColorStop(0, '#062319');
      bgGrad.addColorStop(0.6, '#03120D');
      bgGrad.addColorStop(1, '#0C3829');
    } else {
      bgGrad.addColorStop(0, '#32140A');
      bgGrad.addColorStop(0.6, '#1A0803');
      bgGrad.addColorStop(1, '#441A0D');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Gold Double Hairline Border
    ctx.strokeStyle = currentTpl.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(55, 55, width - 110, height - 110);

    // Header Emblem
    ctx.fillStyle = currentTpl.accent;
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨  VELMORA SPARK  ✨', width / 2, 130);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('OFFICIAL CELEBRATION OPS CARD', width / 2, 175);

    // Event Title
    ctx.font = 'bold 58px serif';
    ctx.fillStyle = currentTpl.titleColor;
    ctx.fillText(event.title, width / 2, 270);

    // Category Badge
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = currentTpl.accent;
    ctx.fillText(`• ${event.category.toUpperCase().replace('_', ' ')} •`, width / 2, 325);

    // Date & Venue Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(100, 370, width - 200, 140);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(100, 370, width - 200, 140);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`📅  Date: ${event.date}     📍  Venue: ${event.city}`, width / 2, 435);
    ctx.font = '26px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`👥  Confirmed Attendance: ${event.confirmedRsvpCount} of ${event.invitedCount} Guests`, width / 2, 480);

    // Schedule Section Heading
    ctx.font = 'bold 36px serif';
    ctx.fillStyle = currentTpl.accent;
    ctx.fillText('MASTER RUN-OF-SHOW SCHEDULE', width / 2, 580);

    // Timeline items
    let curY = 660;
    topSchedule.forEach((item) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(100, curY - 45, width - 200, 110);
      ctx.strokeStyle = 'rgba(255, 174, 52, 0.25)';
      ctx.strokeRect(100, curY - 45, width - 200, 110);

      // Time pill
      ctx.fillStyle = currentTpl.accent;
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.currentTime, 130, curY + 20);

      // Title & Owner
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(item.title, 310, curY + 5);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Lead Coordinator: ${item.owner}  ·  Status: Active Cue`, 310, curY + 45);

      curY += 135;
    });

    // Footer Seal
    ctx.textAlign = 'center';
    ctx.font = 'italic 26px serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Coordinated via Velmora Spark · Royal Event Operations Platform', width / 2, height - 120);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Velmora-${event.title.replace(/\s+/g, '_')}-WhatsAppCard.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      {/* ── Fixed Floating Exit Cross Button (Always Visible Regardless of Scroll) ── */}
      <button
        onClick={onClose}
        aria-label="Close WhatsApp card modal"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-80 w-12 h-12 rounded-full bg-[#2A0E1A]/95 hover:bg-[#5C142A] text-amber-200 hover:text-white border-2 border-amber-400/70 flex items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.9),0_0_15px_rgba(255,174,52,0.4)] backdrop-blur-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-200 text-amber-300 group-hover:text-white" />
      </button>

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold-300/40 bg-[#1A0B1A] shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Sticky Modal Header (Never scrolls out of view) */}
        <div className="sticky top-0 z-30 -mx-5 -mt-5 sm:-mx-8 sm:-mt-8 px-5 py-4 sm:px-8 bg-[#1A0B1A]/95 backdrop-blur-md border-b border-gold-300/20 flex items-center justify-between rounded-t-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle size={22} />
            </div>
            <div>
              <h2 id="wa-modal-title" className="font-serif text-lg sm:text-2xl font-bold text-amber-100 flex items-center gap-2">
                WhatsApp Broadcast & Share Card
                <Sparkles size={16} className="text-amber-400 shrink-0" />
              </h2>
              <p className="text-xs text-amber-200/70 hidden sm:block">
                Share visual celebration cards & instant formatted broadcasts directly to family, sponsors & coordinators.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-rose-900/40 text-amber-200 hover:text-rose-200 border border-amber-400/30 hover:border-rose-400/50 flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
          >
            <X size={16} />
            <span>Close</span>
          </button>
        </div>

        {/* Template Selector Row */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Palette size={14} /> Select Visual Card Template
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(TEMPLATES) as CardTemplate[]).map((key) => {
              const tpl = TEMPLATES[key];
              const isSelected = selectedTemplate === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/15 shadow-md shadow-amber-500/10 ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <strong className="block text-xs font-serif text-white">{tpl.name}</strong>
                  <span className="text-[10px] text-amber-200/60 block truncate">{tpl.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Visual Card Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
              Visual Card Preview (Ready to Share & Download)
            </span>
            <button
              onClick={onClose}
              className="text-[11px] text-amber-200/70 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X size={12} /> Exit Preview
            </button>
          </div>

          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border shadow-2xl transition-all"
            style={{
              background: currentTpl.bg,
              borderColor: currentTpl.border,
            }}
          >
            {/* Corner Decorative Filigrees */}
            <div className="absolute top-2 left-2 text-amber-300/40 text-xs font-serif">❖</div>
            <div className="absolute top-2 right-2 text-amber-300/40 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 left-2 text-amber-300/40 text-xs font-serif">❖</div>
            <div className="absolute bottom-2 right-2 text-amber-300/40 text-xs font-serif">❖</div>

            {/* Inner Content */}
            <div className="relative z-10 text-center space-y-4">
              {/* Crest Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-300/30 text-[11px] font-serif uppercase tracking-widest text-amber-300" style={{ background: currentTpl.pillBg }}>
                <Sparkles size={12} /> Velmora Spark · Celebration Operations
              </div>

              {/* Title */}
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight" style={{ color: currentTpl.titleColor }}>
                  {event.title}
                </h3>
                <span className="text-xs uppercase font-medium tracking-wider text-amber-200/80">
                  {event.category.replace('_', ' ')} · Official Broadcast Card
                </span>
              </div>

              {/* Event Metadata Strip */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap py-2.5 px-4 rounded-xl bg-black/30 border border-white/10 text-xs text-amber-100">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-400" /> {event.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-amber-400" /> {event.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" /> {event.confirmedRsvpCount} Attending
                </span>
              </div>

              {/* Live Run-of-Show Snapshot */}
              <div className="space-y-2 text-left pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 block text-center">
                  Live Master Timeline & Cue Sheet
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {topSchedule.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2.5"
                    >
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-amber-300 bg-amber-400/10 border border-amber-300/20 whitespace-nowrap">
                        {item.currentTime}
                      </span>
                      <div className="min-w-0">
                        <strong className="block text-xs font-medium text-white truncate">{item.title}</strong>
                        <span className="text-[10px] text-amber-200/60 block truncate">
                          Lead: {item.owner}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portal link hint */}
              <p className="text-[11px] text-amber-200/60 pt-2 border-t border-white/10">
                Digital Guest Portal & Run Sheet: <span className="text-amber-300 font-mono">velmoraspark.in/invite/{event.id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 flex-wrap border-t border-gold-300/20">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyText}
              className="btn btn-ghost px-4 py-2.5 rounded-full border border-gold-300/30 text-amber-200 hover:text-white hover:bg-white/5 text-xs flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-400" /> Copied WhatsApp Text!
                </>
              ) : (
                <>
                  <Copy size={15} /> Copy Formatted Text
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCard}
              className="btn btn-ghost px-4 py-2.5 rounded-full border border-gold-300/30 text-amber-200 hover:text-white hover:bg-white/5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} /> Download Card (PNG)
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-rose-950/40 text-amber-200 hover:text-rose-200 border border-white/10 hover:border-rose-400/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X size={15} /> Exit Card
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="btn btn-primary px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs border-none shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={15} /> Share to WhatsApp Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
