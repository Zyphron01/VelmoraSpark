'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  EventPlan,
  PlanSuggestion,
  BudgetLineItem,
  CateringMathModel,
  StressScenario,
  RunSheetItem,
  Guest,
  TabId,
  RunSheetStatus,
  DietaryType,
  AccessibilityTag,
} from '@/types/event';
import { PRESETS, type PresetKey } from '@/lib/demo-data';
import { addMinutes } from '@/lib/utils';

const STORAGE_KEY = 'velmora_spark_state_v1';

// ─── Context Shape ────────────────────────────────────────────────────────────

export type FestiveThemeTemplate = 'rajputana' | 'carnivale' | 'jubilee' | 'kalyanam';

interface AppStore {
  preset: PresetKey;
  setPreset: (p: PresetKey) => void;
  themeTemplate: FestiveThemeTemplate;
  setThemeTemplate: (t: FestiveThemeTemplate) => void;

  event: EventPlan;
  setEvent: React.Dispatch<React.SetStateAction<EventPlan>>;
  suggestions: PlanSuggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<PlanSuggestion[]>>;
  budget: BudgetLineItem[];
  setBudget: React.Dispatch<React.SetStateAction<BudgetLineItem[]>>;
  catering: CateringMathModel;
  setCatering: React.Dispatch<React.SetStateAction<CateringMathModel>>;
  scenarios: StressScenario[];
  setScenarios: React.Dispatch<React.SetStateAction<StressScenario[]>>;
  runSheet: RunSheetItem[];
  setRunSheet: React.Dispatch<React.SetStateAction<RunSheetItem[]>>;
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;

  activeTab: TabId;
  setActiveTab: (t: TabId) => void;

  executiveView: boolean;
  setExecutiveView: React.Dispatch<React.SetStateAction<boolean>>;

  // Real Database Hydration & Auth State
  isDbSyncing: boolean;
  isOrganizer: boolean;
  dbSource: 'neon' | 'local_demo' | 'error';
  hydrationError: string | null;
  organizerKey: string | null;
  setOrganizerKey: (key: string | null) => void;

  // Derived financials
  totalCommitted: number;
  totalProjected: number;
  contingencyBuffer: number;
  contingencyUsed: number;

  // Actions
  approveSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  applyScenario: (id: string) => void;
  revertScenario: (id: string) => void;
  cascadeDelay: (fromId: string, extraMins: number) => Promise<void>;
  resetSchedule: () => Promise<void>;
  addGuest: (guest: Guest) => Promise<boolean>;
  updateGuestRecord: (guestId: string, updates: Partial<Guest>) => Promise<boolean>;
  deleteGuestRecord: (guestId: string) => Promise<boolean>;
  saveBudgetItem: (item: Partial<BudgetLineItem>) => Promise<boolean>;
  deleteBudgetItem: (itemId: string) => Promise<boolean>;
  saveRunSheetItem: (item: Partial<RunSheetItem>) => Promise<boolean>;
  deleteRunSheetItem: (itemId: string) => Promise<boolean>;
  refreshAllData: () => Promise<void>;
  resetDemoData: () => void;
  syncDatabaseGuests: () => Promise<void>;
}

const AppContext = createContext<AppStore | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPresetRaw] = useState<PresetKey>('wedding');

  const [eventData, setEvent] = useState<EventPlan>(PRESETS.wedding.event);
  const [suggestions, setSuggestions] = useState<PlanSuggestion[]>(PRESETS.wedding.suggestions);
  const [budget, setBudget] = useState<BudgetLineItem[]>(PRESETS.wedding.budget);
  const [baseCatering, setCatering] = useState<CateringMathModel>(PRESETS.wedding.catering);
  const [scenarios, setScenarios] = useState<StressScenario[]>(PRESETS.wedding.scenarios);
  const [runSheet, setRunSheet] = useState<RunSheetItem[]>(PRESETS.wedding.runSheet);
  const [guests, setGuests] = useState<Guest[]>(PRESETS.wedding.guests);

  const [activeTab, setActiveTab] = useState<TabId>('planner');
  const [executiveView, setExecutiveView] = useState(false);
  const [themeTemplate, setThemeTemplateState] = useState<FestiveThemeTemplate>('rajputana');
  const [isLoaded, setIsLoaded] = useState(false);

  const setThemeTemplate = useCallback((t: FestiveThemeTemplate) => {
    setThemeTemplateState(t);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-template', t);
    }
    try {
      localStorage.setItem('velmora_theme_template', t);
    } catch {}
  }, []);

  // Database hydration & authentication
  const [isDbSyncing, setIsDbSyncing] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [dbSource, setDbSource] = useState<'neon' | 'local_demo' | 'error'>('local_demo');
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [organizerKey, setOrganizerKeyState] = useState<string | null>(null);

  const setOrganizerKey = useCallback((key: string | null) => {
    setOrganizerKeyState(key);
    if (typeof window !== 'undefined') {
      const activeId = eventData.id || 'wedding-1';
      if (key) {
        localStorage.setItem(`velmora_key_${activeId}`, key);
      } else {
        localStorage.removeItem(`velmora_key_${activeId}`);
      }
    }
  }, [eventData.id]);

  // ─── Load Local Storage State on Mount ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.preset) setPresetRaw(parsed.preset);
          if (parsed.event) setEvent(parsed.event);
          if (parsed.suggestions) setSuggestions(parsed.suggestions);
          if (parsed.budget) setBudget(parsed.budget);
          if (parsed.catering) setCatering(parsed.catering);
          if (parsed.scenarios) setScenarios(parsed.scenarios);
          if (parsed.runSheet) setRunSheet(parsed.runSheet);
          if (parsed.guests) setGuests(parsed.guests);
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
        }

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const urlEventId = params.get('event');
          const urlKey = params.get('key');
          if (urlEventId) {
            setEvent((prev) => ({ ...prev, id: urlEventId }));
          }
          if (urlKey) {
            setOrganizerKeyState(urlKey);
          }
        }

        const activeId = eventData.id || 'wedding-1';
        const cachedKey = localStorage.getItem(`velmora_key_${activeId}`);
        if (cachedKey) {
          setOrganizerKeyState(cachedKey);
        }
      } catch (e) {
        console.warn('Failed to parse saved Velmora state:', e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [eventData.id]);

  // ─── Persist to LocalStorage on Change ──────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const state = {
        preset,
        event: eventData,
        suggestions,
        budget,
        baseCatering,
        scenarios,
        runSheet,
        guests,
        activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save Velmora state to localStorage:', e);
    }
  }, [isLoaded, preset, eventData, suggestions, budget, baseCatering, scenarios, runSheet, guests, activeTab]);

  // ─── Complete Real Database Hydration ───────────────────────────────────────
  const refreshAllData = useCallback(async () => {
    let targetEventId: string | null = null;
    let urlKey: string | null = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      targetEventId = params.get('event');
      urlKey = params.get('key');
    }

    const activeId = targetEventId || eventData.id || 'wedding-blr-2025';
    const DEMO_PRESET_IDS = new Set([
      'wedding-blr-2025',
      'aarohan-fest-2025',
      'milestone-50th-2025',
      ...Object.values(PRESETS).map((p) => p.event.id),
    ]);

    // 1. If activeId is a local demo preset and no URL event query was requested:
    // Pure Local Demo Workspace mode — DO NOT query Neon database!
    if (!targetEventId && DEMO_PRESET_IDS.has(activeId)) {
      setDbSource('local_demo');
      setIsOrganizer(true);
      setIsDbSyncing(false);
      setHydrationError(null);
      return;
    }

    // 2. Real Database Event Hydration (e.g. ?event=wedding-1)
    setIsDbSyncing(true);
    setHydrationError(null);

    const token =
      urlKey ||
      organizerKey ||
      (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${activeId}`) : null);

    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      // 1. Fetch event metadata from Neon
      const eventRes = await fetch(`/api/events/${activeId}`, { headers: authHeaders });

      if (eventRes.status === 404) {
        // Explicitly requested event does not exist in DB — report clear error
        setDbSource('error');
        setHydrationError(`Event '${activeId}' was not found in Neon database (HTTP 404).`);
        setIsOrganizer(false);
        setIsDbSyncing(false);
        return;
      }

      if (!eventRes.ok) {
        throw new Error(`Failed to fetch event: HTTP ${eventRes.status}`);
      }

      const eventJson = await eventRes.json();
      if (eventJson.success && eventJson.event) {
        const ev = eventJson.event;
        setEvent((prev) => ({
          ...prev,
          id: ev.id,
          title: ev.title || prev.title,
          category: ev.category || prev.category,
          date: ev.date || prev.date,
          city: ev.city || prev.city,
          totalBudget: ev.totalBudget !== undefined ? ev.totalBudget : prev.totalBudget,
          invitedCount: ev.invitedCount !== undefined ? ev.invitedCount : prev.invitedCount,
          contingencyReservePercent: ev.contingencyReservePercent !== undefined ? ev.contingencyReservePercent : prev.contingencyReservePercent,
        }));
        setIsOrganizer(Boolean(eventJson.isOrganizer));
        setDbSource('neon');
      }

      // If verified organizer, hydrate protected datasets (guests, budget, timeline)
      if (token && eventJson.isOrganizer) {
        // 2. Fetch real guests
        const guestsRes = await fetch(`/api/events/${activeId}/guests`, { headers: authHeaders });
        if (guestsRes.ok) {
          const guestsJson = await guestsRes.json();
          if (Array.isArray(guestsJson.guests) && guestsJson.guests.length > 0) {
            const dbGuests: Guest[] = guestsJson.guests.map((g: {
              id: string;
              name: string;
              phone: string;
              dietary?: string;
              accessibilityTags?: string[];
              rsvpStatus?: string;
              plusOnes?: number;
              notes?: string;
            }) => ({
              id: g.id,
              name: g.name,
              phone: g.phone,
              dietary: (g.dietary || 'standard') as DietaryType,
              accessibilityTags: (Array.isArray(g.accessibilityTags) ? g.accessibilityTags : []) as AccessibilityTag[],
              rsvpStatus: (g.rsvpStatus || 'confirmed') as 'confirmed' | 'pending' | 'declined',
              plusOnes: g.plusOnes || 0,
              notes: g.notes || '',
            }));
            setGuests(dbGuests);
          }
        }

        // 3. Fetch real budget items
        const budgetRes = await fetch(`/api/events/${activeId}/budget`, { headers: authHeaders });
        if (budgetRes.ok) {
          const budgetJson = await budgetRes.json();
          if (Array.isArray(budgetJson.budget) && budgetJson.budget.length > 0) {
            const dbBudget: BudgetLineItem[] = budgetJson.budget.map((b: {
              id: string;
              category: string;
              vendorName: string;
              quotedAmount: number;
              committedInstalments: number;
              projectedFinalInvoice: number;
              overrunRiskReason?: string;
              quoteChallengeTip?: string;
              backupVendorName?: string;
              backupVendorDelta?: number;
              confirmationStatus?: 'confirmed_24h' | 'pending_ping' | 'at_risk';
              vendorPhone?: string;
            }) => ({
              id: b.id,
              category: b.category,
              vendorName: b.vendorName,
              quotedAmount: b.quotedAmount,
              committedInstalments: b.committedInstalments,
              projectedFinalInvoice: b.projectedFinalInvoice,
              overrunRiskReason: b.overrunRiskReason || '',
              quoteChallengeTip: b.quoteChallengeTip || '',
              backupVendorName: b.backupVendorName || 'Pre-vetted Partner',
              backupVendorDelta: b.backupVendorDelta || 0,
              confirmationStatus: b.confirmationStatus || 'pending_ping',
              vendorPhone: b.vendorPhone || '',
            }));
            setBudget(dbBudget);
          }
        }

        // 4. Fetch real timeline records
        const timelineRes = await fetch(`/api/events/${activeId}/timeline`, { headers: authHeaders });
        if (timelineRes.ok) {
          const timelineJson = await timelineRes.json();
          if (Array.isArray(timelineJson.timeline) && timelineJson.timeline.length > 0) {
            const dbTimeline: RunSheetItem[] = timelineJson.timeline.map((t: {
              id: string;
              baseTime: string;
              currentTime?: string;
              durationMins: number;
              delayMins?: number;
              title: string;
              owner: string;
              vendorPhone?: string;
              dependencyNote?: string;
              status?: string;
            }) => ({
              id: t.id,
              baseTime: t.baseTime,
              currentTime: t.currentTime || t.baseTime,
              durationMins: t.durationMins,
              delayMins: t.delayMins || 0,
              title: t.title,
              owner: t.owner,
              vendorPhone: t.vendorPhone || '',
              dependencyNote: t.dependencyNote || '',
              status: (t.status || 'upcoming') as RunSheetStatus,
            }));
            setRunSheet(dbTimeline);
          }
        }
      }
    } catch (err: unknown) {
      console.warn('[Velmora Store] Error hydrating data from Neon:', err);
      setDbSource('error');
      setHydrationError(err instanceof Error ? err.message : 'Database connection error.');
    } finally {
      setIsDbSyncing(false);
    }
  }, [eventData.id, organizerKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAllData();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshAllData]);

  const syncDatabaseGuests = useCallback(async () => {
    await refreshAllData();
  }, [refreshAllData]);

  // ─── Actions & API Persistence ──────────────────────────────────────────────

  const addGuest = useCallback(
    async (guest: Guest): Promise<boolean> => {
      // Optimistic update
      setGuests((prev) => [guest, ...prev]);

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer) {
        try {
          const res = await fetch(`/api/events/${eventData.id}/guests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: guest.id,
              name: guest.name,
              phone: guest.phone,
              dietary: guest.dietary,
              accessibilityTags: guest.accessibilityTags,
              rsvpStatus: guest.rsvpStatus,
              plusOnes: guest.plusOnes,
              notes: guest.notes,
            }),
          });
          return res.ok;
        } catch (e) {
          console.warn('[Velmora Store] Failed to persist guest to database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const updateGuestRecord = useCallback(
    async (guestId: string, updates: Partial<Guest>): Promise<boolean> => {
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...updates } : g)));

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer) {
        try {
          const res = await fetch(`/api/events/${eventData.id}/guests/${guestId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });
          return res.ok;
        } catch (e) {
          console.warn('[Velmora Store] Failed to update guest in database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const deleteGuestRecord = useCallback(
    async (guestId: string): Promise<boolean> => {
      setGuests((prev) => prev.filter((g) => g.id !== guestId));

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer) {
        try {
          const res = await fetch(`/api/events/${eventData.id}/guests/${guestId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return res.ok;
        } catch (e) {
          console.warn('[Velmora Store] Failed to delete guest from database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const saveBudgetItem = useCallback(
    async (item: Partial<BudgetLineItem>): Promise<boolean> => {
      let isExisting = false;
      setBudget((prev) => {
        const idx = prev.findIndex((b) => b.id === item.id);
        if (idx >= 0) {
          isExisting = true;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...item } as BudgetLineItem;
          return copy;
        }
        return [item as BudgetLineItem, ...prev];
      });

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer && item.id) {
        try {
          if (isExisting) {
            const res = await fetch(`/api/events/${eventData.id}/budget/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });
            return res.ok;
          } else {
            const res = await fetch(`/api/events/${eventData.id}/budget`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });
            return res.ok;
          }
        } catch (e) {
          console.warn('[Velmora Store] Failed to persist budget item to database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const deleteBudgetItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      setBudget((prev) => prev.filter((b) => b.id !== itemId));

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer) {
        try {
          const res = await fetch(`/api/events/${eventData.id}/budget/${itemId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return res.ok;
        } catch (e) {
          console.warn('[Velmora Store] Failed to delete budget item from database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const saveRunSheetItem = useCallback(
    async (item: Partial<RunSheetItem>): Promise<boolean> => {
      let isExisting = false;
      setRunSheet((prev) => {
        const idx = prev.findIndex((r) => r.id === item.id);
        if (idx >= 0) {
          isExisting = true;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...item } as RunSheetItem;
          return copy;
        }
        return [...prev, item as RunSheetItem];
      });

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer && item.id) {
        try {
          if (isExisting) {
            const res = await fetch(`/api/events/${eventData.id}/timeline/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });
            return res.ok;
          } else {
            const res = await fetch(`/api/events/${eventData.id}/timeline`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            });
            return res.ok;
          }
        } catch (e) {
          console.warn('[Velmora Store] Failed to persist timeline item to database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const deleteRunSheetItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      setRunSheet((prev) => prev.filter((r) => r.id !== itemId));

      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer) {
        try {
          const res = await fetch(`/api/events/${eventData.id}/timeline/${itemId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return res.ok;
        } catch (e) {
          console.warn('[Velmora Store] Failed to delete timeline item from database:', e);
          return false;
        }
      }
      return true;
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const cascadeDelay = useCallback(
    async (fromId: string, extraMins: number): Promise<void> => {
      const changedItems: RunSheetItem[] = [];

      setRunSheet((prev) => {
        let found = false;
        const updated = prev.map((item) => {
          if (item.id === fromId) found = true;
          if (found && (item.status === 'live' || item.status === 'upcoming' || item.status === 'delayed')) {
            const newDelay = (item.delayMins || 0) + extraMins;
            const updatedItem: RunSheetItem = {
              ...item,
              currentTime: addMinutes(item.baseTime, newDelay),
              delayMins: newDelay,
              status: (newDelay > 0 ? 'delayed' : item.status) as RunSheetStatus,
            };
            changedItems.push(updatedItem);
            return updatedItem;
          }
          return item;
        });
        return updated;
      });

      // Asynchronously persist changed items to database
      const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
      if (token && isOrganizer && changedItems.length > 0) {
        try {
          for (const item of changedItems) {
            await fetch(`/api/events/${eventData.id}/timeline/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                currentTime: item.currentTime,
                delayMins: item.delayMins,
                status: item.status,
              }),
            });
          }
        } catch (e) {
          console.warn('[Velmora Store] Error saving cascade shift to database:', e);
        }
      }
    },
    [eventData.id, organizerKey, isOrganizer]
  );

  const resetSchedule = useCallback(async (): Promise<void> => {
    const resetItems: RunSheetItem[] = [];

    setRunSheet((prev) => {
      const updated = prev
        .filter((r) => !r.id.startsWith('crisis-'))
        .map((item) => {
          const resItem: RunSheetItem = {
            ...item,
            currentTime: item.baseTime,
            delayMins: 0,
            status: (item.status === 'delayed' ? 'upcoming' : item.status) as RunSheetStatus,
          };
          resetItems.push(resItem);
          return resItem;
        });
      return updated;
    });

    const token = organizerKey || (typeof window !== 'undefined' ? localStorage.getItem(`velmora_key_${eventData.id}`) : null);
    if (token && isOrganizer && resetItems.length > 0) {
      try {
        for (const item of resetItems) {
          await fetch(`/api/events/${eventData.id}/timeline/${item.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentTime: item.currentTime,
              delayMins: 0,
              status: item.status,
            }),
          });
        }
      } catch (e) {
        console.warn('[Velmora Store] Error resetting schedule in database:', e);
      }
    }
  }, [eventData.id, organizerKey, isOrganizer]);

  const setPreset = useCallback((p: PresetKey) => {
    setPresetRaw(p);
    const d = PRESETS[p];
    setEvent(d.event);
    setSuggestions(d.suggestions);
    setBudget(d.budget);
    setCatering(d.catering);
    setScenarios(d.scenarios.map((s) => ({ ...s, applied: false })));
    setRunSheet(d.runSheet.map((r) => ({ ...r, currentTime: r.baseTime, delayMins: 0 })));
    setGuests(d.guests);
    setActiveTab('planner');
    setDbSource('local_demo');
    setHydrationError(null);
    setIsOrganizer(true);

    const defaultTpl: FestiveThemeTemplate =
      p === 'wedding' ? 'rajputana' : p === 'fest' ? 'carnivale' : 'jubilee';
    setThemeTemplateState(defaultTpl);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-template', defaultTpl);
    }
  }, []);

  const resetDemoData = useCallback(() => {
    const d = PRESETS.wedding;
    setPresetRaw('wedding');
    setEvent(d.event);
    setSuggestions(d.suggestions);
    setBudget(d.budget);
    setCatering(d.catering);
    setScenarios(d.scenarios.map((s) => ({ ...s, applied: false })));
    setRunSheet(d.runSheet.map((r) => ({ ...r, currentTime: r.baseTime, delayMins: 0 })));
    setGuests(d.guests);
    setActiveTab('planner');
    setDbSource('local_demo');
    setHydrationError(null);
    setIsOrganizer(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  // ─── Dynamic Derived Calculations ───────────────────────────────────────────
  const catering: CateringMathModel = useMemo(() => {
    const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
    const confirmedHeadcount = confirmedGuests.reduce((s, g) => s + 1 + g.plusOnes, 0);

    const jain = confirmedGuests
      .filter((g) => g.dietary === 'jain')
      .reduce((s, g) => s + 1 + g.plusOnes, 0);
    const vegan = confirmedGuests
      .filter((g) => g.dietary === 'vegan')
      .reduce((s, g) => s + 1 + g.plusOnes, 0);
    const allergy = confirmedGuests
      .filter((g) => g.dietary === 'nut_free')
      .reduce((s, g) => s + 1 + g.plusOnes, 0);
    const elderly = confirmedGuests
      .filter((g) => g.accessibilityTags.includes('elderly_seating'))
      .reduce((s, g) => s + 1 + g.plusOnes, 0);

    const p50 = Math.round(confirmedHeadcount * 0.9);
    const p90 = Math.max(confirmedHeadcount, Math.round(confirmedHeadcount * 1.05));

    return {
      ...baseCatering,
      rsvpConfirmed: confirmedHeadcount,
      p50ExpectedTurnout: p50,
      p90PeakTurnout: p90,
      recommendedPlates: p90,
      jainPlates: jain,
      veganPlates: vegan,
      allergySafePlates: allergy,
      elderlySeatingCount: elderly,
    };
  }, [baseCatering, guests]);

  const event: EventPlan = useMemo(() => {
    const confirmedHeadcount = guests
      .filter((g) => g.rsvpStatus === 'confirmed')
      .reduce((s, g) => s + 1 + g.plusOnes, 0);
    return {
      ...eventData,
      confirmedRsvpCount: confirmedHeadcount,
    };
  }, [eventData, guests]);

  const { totalCommitted, totalProjected, contingencyBuffer, contingencyUsed } = useMemo(() => {
    const committed = budget.reduce((s, b) => s + b.committedInstalments, 0);
    const projected = budget.reduce((s, b) => s + b.projectedFinalInvoice, 0);
    const buffer = Math.round(event.totalBudget * (event.contingencyReservePercent / 100));
    const used = Math.max(0, projected - event.totalBudget + buffer);
    return {
      totalCommitted: committed,
      totalProjected: projected,
      contingencyBuffer: buffer,
      contingencyUsed: used,
    };
  }, [budget, event]);

  const approveSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
    );
  }, []);

  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
  }, []);

  const applyScenario = useCallback((id: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: true } : s))
    );
  }, []);

  const revertScenario = useCallback((id: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: false } : s))
    );
  }, []);

  const value: AppStore = {
    preset,
    setPreset,
    event,
    setEvent,
    suggestions,
    setSuggestions,
    budget,
    setBudget,
    catering,
    setCatering,
    scenarios,
    setScenarios,
    runSheet,
    setRunSheet,
    guests,
    setGuests,
    activeTab,
    setActiveTab,
    themeTemplate,
    setThemeTemplate,
    executiveView,
    setExecutiveView,
    isDbSyncing,
    isOrganizer,
    dbSource,
    hydrationError,
    organizerKey,
    setOrganizerKey,
    totalCommitted,
    totalProjected,
    contingencyBuffer,
    contingencyUsed,
    approveSuggestion,
    rejectSuggestion,
    applyScenario,
    revertScenario,
    cascadeDelay,
    resetSchedule,
    addGuest,
    updateGuestRecord,
    deleteGuestRecord,
    saveBudgetItem,
    deleteBudgetItem,
    saveRunSheetItem,
    deleteRunSheetItem,
    refreshAllData,
    resetDemoData,
    syncDatabaseGuests,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
