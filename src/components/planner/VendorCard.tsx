'use client';

import React, { useState } from 'react';
import { MessageCircle, Check, Phone, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import type { BudgetLineItem } from '@/types/event';
import { formatINR } from '@/lib/utils';

export function VendorCard({ item }: { item: BudgetLineItem }) {
  const [copied, setCopied] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  const variance = item.projectedFinalInvoice - item.quotedAmount;

  const buildWAMessage = () => {
    return encodeURIComponent(
      `Hello ${item.vendorName}! This is regarding ${item.category} for our upcoming celebration.\n` +
      `Current Confirmed Quote: ${formatINR(item.quotedAmount)}.\n` +
      `Paid Advance: ${formatINR(item.committedInstalments)}.\n` +
      `Please confirm team arrival & setup timing. Thank you! — Sent via Velmora Spark`
    );
  };

  const handleCopyPing = () => {
    navigator.clipboard.writeText(decodeURIComponent(buildWAMessage()));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-[28px] border border-[var(--border-subtle)] bg-[var(--card)] shadow-soft hover:shadow-hover hover:border-[var(--border-medium)] transition-all">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--surface)] text-[var(--ink)] border border-[var(--border-subtle)]">
              {item.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                item.confirmationStatus === 'confirmed_24h'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : item.confirmationStatus === 'pending_ping'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              {item.confirmationStatus === 'confirmed_24h'
                ? 'Confirmed 24h ✓'
                : item.confirmationStatus === 'pending_ping'
                ? 'Pending Ping'
                : 'At Risk ⚠️'}
            </span>
          </div>

          <h4 className="font-serif font-bold text-base text-[var(--ink)]">
            {item.vendorName}
          </h4>

          {item.vendorPhone && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--primary)] font-mono">
              <Phone size={11} />
              <a href={`tel:${item.vendorPhone}`} className="hover:underline">
                {item.vendorPhone}
              </a>
            </div>
          )}
        </div>

        {/* Financial Badges */}
        <div className="text-right">
          <div className="text-[10px] text-[var(--stone-400)] uppercase font-bold">
            Projected Invoice
          </div>
          <div className="font-serif text-lg font-bold text-[var(--ink)]">
            {formatINR(item.projectedFinalInvoice)}
          </div>
          <div className="text-[11px] text-[var(--stone-500)] mt-0.5">
            Quoted: {formatINR(item.quotedAmount)}
            {variance > 0 && <span className="text-rose-600 font-bold ml-1">(+{formatINR(variance)})</span>}
          </div>
        </div>
      </div>

      {/* Payment Progress Bar */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-[var(--stone-500)]">
            Disbursed: <strong className="text-[var(--success)]">{formatINR(item.committedInstalments)}</strong>
          </span>
          <span className="text-[var(--stone-400)] text-[11px]">
            {Math.round((item.committedInstalments / item.quotedAmount) * 100)}% Paid
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div
            className="h-full bg-[var(--success)] transition-all"
            style={{ width: `${Math.min(100, (item.committedInstalments / item.quotedAmount) * 100)}%` }}
          />
        </div>
      </div>

      {/* Quote-Challenge Tip Accordion */}
      {item.quoteChallengeTip && (
        <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setShowRationale((prev) => !prev)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} /> Quote-Challenge Rationale &amp; Savings
            </span>
            {showRationale ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showRationale && (
            <div className="mt-2.5 p-3 rounded-2xl bg-[var(--surface)] text-xs text-[var(--ink)] leading-relaxed border border-[var(--border-subtle)] animate-slide-up">
              {item.quoteChallengeTip}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 flex-wrap">
        {item.vendorPhone && (
          <a
            href={`https://wa.me/${item.vendorPhone.replace(/[^0-9]/g, '')}?text=${buildWAMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm text-xs py-1.5 px-3 rounded-full flex items-center gap-1.5 hover:border-[var(--primary)]"
          >
            <MessageCircle size={13} className="text-emerald-600" />
            <span>Send 2x/Day WhatsApp Ping</span>
          </a>
        )}

        {item.vendorPhone && (
          <button
            onClick={handleCopyPing}
            className="btn btn-ghost btn-sm text-xs py-1.5 px-2.5 rounded-full text-[var(--stone-500)] hover:text-[var(--ink)]"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[var(--success)] font-semibold">
                <Check size={12} /> Copied!
              </span>
            ) : (
              'Copy Text'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
