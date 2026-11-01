'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/app-store';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  dataSource?: 'demo_preset' | 'neon_database';
  isLiveModel?: boolean;
  isError?: boolean;
}

export function ChatPanel() {
  const { event, organizerKey, isOrganizer, dbSource } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const messageCounter = useRef(1);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        dbSource === 'neon'
          ? `Namaste! 🙏 I am your Velmora AI Celebration Concierge for "${event.title}", powered by Gemini and grounded in your live Neon PostgreSQL database.\n\nAsk me about budget allocation, contingency buffers, dietary breakdowns, vendor risks, or schedule delay cascades.`
          : `Namaste! 🙏 I am your Velmora AI Celebration Concierge for "${event.title}", operating in Demo Mode grounded strictly in approved synthetic event records.\n\nAsk me about budget allocation, contingency buffers, dietary breakdowns, vendor risks, or schedule delay cascades.`,
      timestamp: 'Just now',
      model: 'grounded-operational-engine',
      dataSource: dbSource === 'neon' ? 'neon_database' : 'demo_preset',
    },
  ]);

  const quickPrompts = [
    'How much contingency buffer is left?',
    'Any vendor delays or risks?',
    'What is our dietary count (Jain/Vegan)?',
    'How are we tracking against total budget?',
  ];

  const handleSendPrompt = useCallback(
    async (promptText: string) => {
      if (!promptText.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: `u-${messageCounter.current++}`,
        sender: 'user',
        text: promptText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);
      setLastFailedPrompt(null);

      // Resolve organizer authorization token from state or localStorage
      const token =
        organizerKey ||
        (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${event.id}`) : null);

      if (!token && !isOrganizer) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${messageCounter.current++}`,
            sender: 'assistant',
            text: '🔒 Organizer Authentication Required\n\nThe AI Concierge requires a verified organizer session to query event operations and database metrics. Please ensure you are verified as an organizer in the header or via your event key.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isError: true,
          },
        ]);
        return;
      }

      try {
        // Construct history (exclude error messages and initial welcome)
        const historyPayload = messages
          .filter((m) => !m.isError && m.id !== 'welcome')
          .slice(-6)
          .map((m) => ({
            sender: m.sender,
            text: m.text,
          }));

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            eventId: event.id,
            prompt: promptText.trim(),
            history: historyPayload,
            language: 'en',
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errorMessage =
            data?.error ||
            (res.status === 401
              ? 'Organizer session expired or invalid. Please re-authenticate.'
              : res.status === 429
              ? 'Rate limit exceeded. Please wait a minute before querying again.'
              : res.status === 503
              ? 'AI Concierge service is currently unavailable. Ensure GEMINI_API_KEY is configured in .env.local.'
              : `Operational query failed (HTTP ${res.status}).`);

          setLastFailedPrompt(promptText.trim());
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${messageCounter.current++}`,
              sender: 'assistant',
              text: `⚠️ ${errorMessage}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isError: true,
            },
          ]);
        } else if (data.success && data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${messageCounter.current++}`,
              sender: 'assistant',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              model: data.model || 'grounded-operational-engine',
              dataSource: data.dataSource || (dbSource === 'neon' ? 'neon_database' : 'demo_preset'),
              isLiveModel: data.isLiveModel,
            },
          ]);
        } else {
          throw new Error('Malformed AI response from server.');
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Unable to connect to Velmora AI Concierge.';
        setLastFailedPrompt(promptText.trim());
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${messageCounter.current++}`,
            sender: 'assistant',
            text: `⚠️ Network error: ${errorMsg}. Please check your connection and try again.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isError: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [dbSource, event.id, isOrganizer, isTyping, messages, organizerKey]
  );

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        id="open-ai-chat-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open Velmora AI Concierge"
        className="fixed bottom-20 right-5 z-40 p-3.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--cta)] text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-108 active:scale-95 flex items-center gap-2 group border border-white/20"
      >
        <Sparkles size={18} className="animate-pulse text-amber-200" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide">AI Concierge</span>
      </button>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full max-w-md h-full bg-[var(--card)] text-[var(--ink)] shadow-2xl flex flex-col z-10 border-l border-[var(--border-subtle)]"
            >
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                      Celebration AI Concierge
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTyping ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                      <p className="text-[10px] text-[var(--stone-500)] font-medium">
                        {isTyping
                          ? 'Consulting Operational Engine...'
                          : dbSource === 'neon'
                          ? 'AI Ready • Neon Grounded'
                          : 'AI Ready • Demo Grounded'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--stone-500)] hover:text-[var(--ink)] hover:bg-[var(--card)] transition-colors"
                  aria-label="Close Concierge Panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                        msg.sender === 'user'
                          ? 'bg-[var(--cta)] text-white'
                          : msg.isError
                          ? 'bg-rose-500 text-white'
                          : 'bg-[var(--primary)] text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User size={12} />
                      ) : msg.isError ? (
                        <AlertCircle size={12} />
                      ) : (
                        <Sparkles size={11} />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-[var(--primary)] text-white shadow-xs rounded-tr-xs'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60 shadow-2xs rounded-tl-xs'
                          : 'bg-[var(--ivory)] text-[var(--ink)] border border-[var(--border-subtle)] shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                      <div className="flex items-center justify-between gap-2 text-[9px] opacity-75 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                        <span>
                          {msg.model ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              {msg.dataSource === 'neon_database' ? 'Neon DB' : 'Demo Synthetic'} · {msg.model}
                            </span>
                          ) : (
                            ''
                          )}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Shimmer */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-[var(--stone-500)] p-2">
                    <Bot size={14} className="animate-spin text-[var(--primary)]" />
                    <span>Connecting to Gemini & analyzing live database metrics...</span>
                  </div>
                )}

                {/* Retry prompt if last failed */}
                {lastFailedPrompt && !isTyping && (
                  <div className="flex justify-end pr-8">
                    <button
                      onClick={() => handleSendPrompt(lastFailedPrompt)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--cta)] hover:underline"
                    >
                      <RefreshCw size={12} />
                      Retry last query
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg)]/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--stone-500)] mb-1.5">
                  Suggested Questions:
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {quickPrompts.map((p, i) => (
                    <button
                      key={i}
                      disabled={isTyping}
                      onClick={() => handleSendPrompt(p)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--card)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border-subtle)] text-[var(--ink)] transition-colors shrink-0 disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--card)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    disabled={isTyping}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask concierge about budget, guests, vendors..."
                    className="flex-1 input text-xs py-2 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg)] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2 rounded-xl bg-[var(--primary)] text-white disabled:opacity-40 hover:bg-[var(--cta)] transition-colors shadow-xs"
                    aria-label="Send query"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
