# Velmora Spark 🎉
### *Dream it. Plan it. Celebrate it.*

> **AI-powered celebration & event-operations platform** — built for Indian weddings, college fests, and milestone celebrations.  
> Prompt Wars — Challenge 5 MVP.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and (optionally) add Gemini API key
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully offline without any API key — the AI planner falls back to deterministic suggestions.

---

## 🎯 Market Validation: Why Existing Tools Fail

We validated against **29 sources** and **10 direct competitors**. Here's the gap we found:

### The Saturated Checklist Layer (What Exists)

| Tool | What It Does | Core Failure Mode |
|---|---|---|
| **Joy** | Digital wedding website + RSVP | No budget ops, no vendor chaos management |
| **Notion** | Flexible checklists | Zero event-specific logic, no catering math |
| **WedPlan.in** | Agent-mediated planning | Opaque pricing, requires human intermediary |
| **Wedd.ai** | AI chat for suggestions | No operational layer post-chat |
| **WeddingKart** | Vendor marketplace | No budget overrun alerts, no run-sheet |
| **OnePlan** | Corporate event management | Enterprise-only, no Indian wedding context |
| **Cvent** | Conference/venue management | ₹15L+/year, overkill for personal events |

### The Empty Operations Layer (What We Build)

Every competitor stops at **checklist + vendor discovery**. Zero tools address the **Day-0 to Day+1 operational chaos**:

| Validated Failure Mode | Velmora Spark Solution |
|---|---|
| **Invoice creep** — vendor final bill 15–40% over quote | Committed vs. Projected Invoice Tracker with per-vendor overrun flags |
| **Catering over-ordering** — "Invite + 15% buffer" wastes ₹40–80k and 30+ kg food | P50/P90 Plate-Count Intelligence with auditable ₹ savings + kg waste metrics |
| **Vendor no-shows / cancellations** | Pre-vetted Backup Vendor Shortlist activated on 1 click |
| **8 WhatsApp groups, zero single source of truth** | 1-Click WhatsApp Status Brief replacing all fragmented groups |
| **Executor (planner) vs. Paying Buyer (parent/sponsor) split** | Parent Executive View with clean financial summary |
| **No crisis pre-planning** | 4 Stress Scenario Simulations (rain, cancellation, surge, power) with cascade impact |
| **Run-sheet delays cascade manually** | Auto-cascading delay controls that shift all downstream vendor cues |
| **Zero-install RSVPs** | WhatsApp deep-link RSVP with dietary + accessibility capture, no app needed |

---

## 🏗 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Vanilla CSS design system
- **AI**: Gemini 1.5 Flash (server-side only, graceful fallback)
- **Validation**: Zod
- **Icons**: Lucide React
- **Fonts**: Playfair Display (serif) + Plus Jakarta Sans (sans)

---

## 📐 Design System

Aesthetic: **Kinfolk meets Linear** — warm editorial celebration UI.

| Token | Value | Usage |
|---|---|---|
| Alabaster | `#FAF7F2` | Page background |
| Ivory | `#F4EFE6` | Card surfaces |
| Espresso | `#1C1917` | Body text |
| Terracotta | `#C85A32` | Primary CTA, accents |
| Deep Sage | `#2E6F40` | Confirmed/savings states |
| Amber | `#D97706` | Pending/warning states |
| Crimson | `#B91C1C` | Invoice overrun, crisis |

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── api/ai/plan/route.ts   # Gemini AI endpoint (server-only)
│   ├── globals.css            # Design system tokens + utilities
│   ├── layout.tsx             # Root layout with SEO metadata
│   └── page.tsx               # Main app entry point
├── components/
│   ├── shell/
│   │   └── AppShell.tsx       # Header, tabs, exec view, WA brief
│   └── tabs/
│       ├── PlannerTab.tsx     # AI co-planner + voice input
│       ├── BudgetTab.tsx      # Invoice tracker + plate calculator
│       ├── StressTab.tsx      # Crisis simulator + backup radar
│       ├── RSVPTab.tsx        # WhatsApp RSVPs + accessibility
│       └── CommandTab.tsx     # Auto-cascading run sheet
├── lib/
│   ├── ai/provider.ts         # Gemini + fallback abstraction
│   ├── app-store.tsx          # Global React context / state
│   ├── demo-data.ts           # 3 realistic Indian event presets
│   └── utils.ts               # INR formatting, time math, cn()
└── types/
    └── event.ts               # All domain TypeScript types
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Gemini AI for plan generation. App works without it. |
| `DATABASE_URL` | Optional | PostgreSQL for persistence (MVP uses in-memory state) |

---

## 📦 Event Presets

The app ships with 3 switchable realistic demo presets:

1. **💍 250-Guest Bengaluru Courtyard Wedding** — ₹18.5L with 8 vendors, full run sheet
2. **🎭 Inter-College Cultural Fest 'Aarohan'** — ₹4.2L with 600 attendees, 7-slot run sheet  
3. **🎂 50th Milestone Garden Gala** — ₹3.5L intimate Mysuru garden party, 6-slot dinner timeline

---

## 🧪 Feature Checklist

- [x] 3 switchable event presets
- [x] AI co-planner with Gemini (+ fallback)
- [x] Voice input (Web Speech API) — English / हिन्दी / ಕನ್ನಡ
- [x] Approve/Reject suggestions → dynamic budget update
- [x] Committed vs. Projected Invoice tracker
- [x] Contingency "Oh-Sh*t" Buffer meter
- [x] P50/P90 Plate-Count Calculator with ₹ savings + kg waste
- [x] 48-Hour Vendor Confirmation Radar
- [x] 4 Crisis Stress Scenarios with cascade
- [x] Pre-vetted Backup Vendor Shortlist
- [x] Auto-cascading run sheet with +15m/+30m delay controls
- [x] WhatsApp RSVP invite generator (zero-install)
- [x] Guest dietary + accessibility matrix
- [x] Parent/Sponsor Executive View toggle
- [x] 1-Click WhatsApp Status Brief (replaces 8 WA groups)
- [x] WhatsApp broadcast for revised timeline

---

*Built with ❤️ for Prompt Wars Challenge 5.*
