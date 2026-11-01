'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';
import { toast } from 'sonner';
import { Lock, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/app-store';
import { useI18n } from '@/lib/i18n';
import { triggerCelebrationMoment } from '@/components/ui/CelebrationMoment';

export function StickyActionBar() {
  const { event, totalProjected, contingencyBuffer, contingencyUsed } = useApp();
  const { t } = useI18n();
  const [locked, setLocked] = useState(false);

  const bufferRemaining = contingencyBuffer - contingencyUsed;

  const handleLockPlan = () => {
    setLocked(true);
    triggerCelebrationMoment('lock', 'Celebration Plan Locked ✨');

    // Fire marigold, rose and gold celebratory petal confetti
    try {
      const colors = ['#F2A33A', '#9E2B3E', '#C9A24B', '#5E8C6A', '#E4572E'];
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.9 },
        colors,
        shapes: ['circle'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 250);
    } catch {
      // Graceful fallback
    }

    toast.success('Operational Plan Locked (Session Preview)', {
      description: `${event.title} baseline frozen for current session at ₹${totalProjected.toLocaleString('en-IN')}`,
      icon: <CheckCircle2 className="text-[var(--success)]" size={18} />,
    });
  };

  return (
    <aside aria-label="Plan confirmation bar" className="fixed bottom-[60px] md:bottom-0 left-0 right-0 z-30 md:z-40 p-2.5 sm:p-4 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] shadow-2xl transition-all">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Summary Metrics with Animated Numbers */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--stone-400)]">
              {t.metrics.projectedFinal}
            </div>
            <div className="font-serif font-bold text-lg sm:text-2xl text-[var(--primary)]">
              ₹
              <CountUp
                end={totalProjected}
                duration={1.2}
                separator=","
                preserveValue
              />
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-[var(--border-subtle)]" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ivory)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--ink)]">
              <Users size={13} className="text-[var(--primary)]" />
              <span>
                <strong>{event.confirmedRsvpCount}</strong> / {event.invitedCount} {t.metrics.guests}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--sage-muted)] border border-[var(--success)]/20 text-xs font-semibold text-[var(--success)]">
              <span>🛡 Buffer: ₹{bufferRemaining.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            id="lock-plan-cta-btn"
            onClick={handleLockPlan}
            className={`btn btn-cta text-sm py-2.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 flex items-center gap-2 ${
              locked ? 'bg-[var(--success)] ring-2 ring-[var(--success)]/40' : ''
            }`}
          >
            {locked ? (
              <>
                <CheckCircle2 size={16} />
                <span>Plan Locked ✓</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <Sparkles size={14} className="text-amber-200 animate-pulse" />
                <span>{t.actions.lockPlan}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
