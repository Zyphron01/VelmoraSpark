// ─── Velmora Spark — Domain Types ────────────────────────────────────────────

export type EventCategory = 'wedding' | 'college_fest' | 'milestone_birthday' | 'celebration' | 'other';

export interface EventPlan {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // ISO date string
  city: string;
  invitedCount: number;
  confirmedRsvpCount: number;
  totalBudget: number; // in INR
  contingencyReservePercent: number;
  activeWhatsappGroupsReplaced: number;
  isCustom?: boolean;
}

// ─── AI Co-Planner ────────────────────────────────────────────────────────────

export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface PlanSuggestion {
  id: string;
  phase: string; // e.g. 'Pre-Event', 'Event Day', 'Post-Event'
  title: string;
  estimatedCost: number;
  costRationale: string; // WHY it costs this + how to challenge vendor markups
  wasteImpact: string;   // e.g. '~12 kg food waste prevented'
  accessibilityNote: string;
  status: SuggestionStatus;
}

// ─── Budget & Invoice ─────────────────────────────────────────────────────────

export type ConfirmationStatus = 'confirmed_24h' | 'pending_ping' | 'at_risk';

export interface BudgetLineItem {
  id: string;
  category: string;
  vendorName: string;
  quotedAmount: number;
  committedInstalments: number; // amount already paid
  projectedFinalInvoice: number;
  overrunRiskReason: string;
  quoteChallengeTip: string;
  backupVendorName: string;
  backupVendorDelta: number; // + or - vs quoted
  confirmationStatus: ConfirmationStatus;
  vendorPhone: string;
}

// ─── Catering Intelligence ────────────────────────────────────────────────────

export interface CateringMathModel {
  invitedCount: number;
  rsvpConfirmed: number;
  p50ExpectedTurnout: number;
  p90PeakTurnout: number;
  blindBufferPlates: number; // Invited × 1.15 — the "guess" approach
  recommendedPlates: number; // Velmora recommendation (P90)
  perPlateCost: number;
  jainPlates: number;
  veganPlates: number;
  allergySafePlates: number;
  elderlySeatingCount: number;
}

// ─── Stress Test & Crisis Scenarios ──────────────────────────────────────────

export type TriggerType =
  | 'monsoon_rain'
  | 'vendor_cancellation'
  | 'guest_surge_20'
  | 'power_sound_delay';

export interface StressScenario {
  id: string;
  triggerType: TriggerType;
  title: string;
  probability: number; // 0–1
  financialImpact: number; // INR delta
  scheduleImpactMins: number;
  backupVendorUsed: string;
  recoveryChecklist: string[];
  applied: boolean;
}

// ─── Run Sheet / Command Center ───────────────────────────────────────────────

export type RunSheetStatus = 'completed' | 'live' | 'upcoming' | 'delayed';

export interface RunSheetItem {
  id: string;
  baseTime: string;    // 'HH:MM' — original scheduled time
  currentTime: string; // 'HH:MM' — live adjusted time
  durationMins: number;
  delayMins: number;
  title: string;
  owner: string;
  vendorPhone: string;
  dependencyNote: string;
  status: RunSheetStatus;
}

// ─── RSVP & Guest Matrix ──────────────────────────────────────────────────────

export type DietaryType = 'standard' | 'jain' | 'vegan' | 'nut_free';
export type AccessibilityTag =
  | 'wheelchair_ramp'
  | 'ground_floor_room'
  | 'elderly_seating'
  | 'low_decibel_zone';

export interface Guest {
  id: string;
  name: string;
  phone: string;
  dietary: DietaryType;
  accessibilityTags: AccessibilityTag[];
  rsvpStatus: 'confirmed' | 'pending' | 'declined';
  plusOnes: number;
  notes?: string;
}

// ─── App-level State ──────────────────────────────────────────────────────────

export type TabId = 'planner' | 'budget' | 'stress' | 'rsvp' | 'command';

export interface AppState {
  activePreset: 'wedding' | 'fest' | 'birthday';
  activeTab: TabId;
  executiveView: boolean;
  appliedScenarios: string[];
}
