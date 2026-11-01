import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as eventPost } from '@/app/api/events/route';
import { GET as eventGet } from '@/app/api/events/[id]/route';
import { POST as budgetPost, GET as budgetGet } from '@/app/api/events/[id]/budget/route';
import { PATCH as budgetPatch } from '@/app/api/events/[id]/budget/[itemId]/route';
import { POST as timelinePost } from '@/app/api/events/[id]/timeline/route';
import { POST as rsvpPost } from '@/app/api/rsvp/route';
import { GET as guestsGet } from '@/app/api/events/[id]/guests/route';
import { POST as aiChatPost } from '@/app/api/ai/chat/route';
import { EventRepository } from '@/db/repo';
import { resetRateLimits } from '@/lib/rate-limit';
import * as aiProvider from '@/lib/ai/provider';
import * as dbModule from '@/db';
import type { EventEntity, BudgetItemEntity, RsvpGuestEntity, RunSheetItemEntity } from '@/db/schema';

describe('Demo Readiness End-to-End Workflow Integration Test (Stages 1-3)', () => {
  const syntheticEventId = 'demo-wedding-aarav-diya-2026';
  let organizerToken: string;

  // In-memory synthetic state stores (zero production database writes)
  let storedEvent: EventEntity;
  let storedBudget: BudgetItemEntity[] = [];
  let storedTimeline: RunSheetItemEntity[] = [];
  let storedGuests: RsvpGuestEntity[] = [];

  const originalAuthSecret = process.env.AUTH_SECRET;
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
    process.env.AUTH_SECRET = 'synthetic_test_auth_secret_with_more_than_32_characters_for_testing';
    process.env.GEMINI_API_KEY = 'synthetic_gemini_test_api_key_for_unit_tests';

    storedBudget = [];
    storedTimeline = [];
    storedGuests = [];

    vi.spyOn(dbModule, 'getDb').mockReturnValue({} as unknown as ReturnType<typeof dbModule.getDb>);

    // Mock EventRepository to operate on our clean in-memory state
    vi.spyOn(EventRepository, 'createEvent').mockImplementation(async (data) => {
      storedEvent = {
        id: data.id,
        title: data.title,
        category: data.category,
        date: data.date,
        city: data.city,
        totalBudget: data.totalBudget ?? 3000000,
        invitedCount: data.invitedCount ?? 250,
        confirmedRsvpCount: 0,
        contingencyReservePercent: data.contingencyReservePercent || 10,
        activeWhatsappGroupsReplaced: data.activeWhatsappGroupsReplaced || 0,
        createdAt: new Date(),
      };
      return storedEvent;
    });

    vi.spyOn(EventRepository, 'getEvent').mockImplementation(async (id) => {
      if (storedEvent && storedEvent.id === id) return storedEvent;
      return null;
    });

    vi.spyOn(EventRepository, 'listEvents').mockImplementation(async () => {
      return storedEvent ? [storedEvent] : [];
    });

    vi.spyOn(EventRepository, 'getBudgetItems').mockImplementation(async (id) => {
      return storedBudget.filter((b) => b.eventId === id);
    });

    vi.spyOn(EventRepository, 'createBudgetItem').mockImplementation(async (data) => {
      const item: BudgetItemEntity = {
        id: data.id,
        eventId: data.eventId,
        category: data.category,
        vendorName: data.vendorName,
        quotedAmount: data.quotedAmount ?? 0,
        committedInstalments: data.committedInstalments ?? 0,
        projectedFinalInvoice: data.projectedFinalInvoice ?? 0,
        overrunRiskReason: data.overrunRiskReason || null,
        quoteChallengeTip: data.quoteChallengeTip || null,
        backupVendorName: data.backupVendorName || null,
        backupVendorDelta: data.backupVendorDelta || 0,
        confirmationStatus: data.confirmationStatus || 'pending_ping',
        vendorPhone: data.vendorPhone || null,
        createdAt: new Date(),
      };
      storedBudget.push(item);
      return item;
    });

    vi.spyOn(EventRepository, 'updateBudgetItem').mockImplementation(async (eventId, itemId, data) => {
      const idx = storedBudget.findIndex((b) => b.eventId === eventId && b.id === itemId);
      if (idx === -1) return null;
      storedBudget[idx] = { ...storedBudget[idx], ...data };
      return storedBudget[idx];
    });

    vi.spyOn(EventRepository, 'getTimelineItems').mockImplementation(async (id) => {
      return storedTimeline.filter((t) => t.eventId === id);
    });

    vi.spyOn(EventRepository, 'createTimelineItem').mockImplementation(async (data) => {
      const item: RunSheetItemEntity = {
        id: data.id,
        eventId: data.eventId,
        baseTime: data.baseTime,
        currentTime: data.currentTime || data.baseTime,
        durationMins: data.durationMins ?? 0,
        delayMins: data.delayMins || 0,
        title: data.title,
        owner: data.owner,
        vendorPhone: data.vendorPhone || null,
        dependencyNote: data.dependencyNote || null,
        status: data.status || 'upcoming',
        createdAt: new Date(),
      };
      storedTimeline.push(item);
      return item;
    });

    vi.spyOn(EventRepository, 'getGuests').mockImplementation(async (id) => {
      return storedGuests.filter((g) => g.eventId === id);
    });

    vi.spyOn(EventRepository, 'findGuestByPhone').mockImplementation(async (eventId, phone) => {
      return storedGuests.find((g) => g.eventId === eventId && g.phone === phone) || null;
    });

    vi.spyOn(EventRepository, 'createGuest').mockImplementation(async (data) => {
      const existing = storedGuests.find((g) => g.eventId === data.eventId && g.phone === data.phone);
      if (existing) {
        throw new Error(`Duplicate phone ${data.phone}`);
      }
      const guest: RsvpGuestEntity = {
        id: data.id,
        eventId: data.eventId,
        name: data.name,
        phone: data.phone,
        dietary: data.dietary || 'standard',
        accessibilityTags: data.accessibilityTags || [],
        rsvpStatus: data.rsvpStatus || 'confirmed',
        plusOnes: data.plusOnes || 0,
        notes: data.notes || null,
        createdAt: new Date(),
      };
      storedGuests.push(guest);
      // update confirmed count
      const confirmed = storedGuests
        .filter((g) => g.eventId === data.eventId && g.rsvpStatus === 'confirmed')
        .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
      storedEvent.confirmedRsvpCount = confirmed;
      return guest;
    });
  });

  afterEach(() => {
    process.env.AUTH_SECRET = originalAuthSecret;
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it('successfully executes the full 13-step hackathon event management workflow', async () => {
    // -------------------------------------------------------------
    // Step 1: Create synthetic wedding event
    // -------------------------------------------------------------
    const createEventReq = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: syntheticEventId,
        title: 'Aarav & Diya Grand Bengaluru Wedding',
        category: 'wedding',
        date: '2026-12-14',
        city: 'Bengaluru',
        totalBudget: 3000000, // ₹30 Lakhs
        invitedCount: 250,
        contingencyReservePercent: 10,
        activeWhatsappGroupsReplaced: 6,
      }),
    });

    const createEventRes = await eventPost(createEventReq);
    expect(createEventRes.status).toBe(201);
    const eventJson = await createEventRes.json();
    expect(eventJson.success).toBe(true);
    expect(eventJson.event.id).toBe(syntheticEventId);
    expect(eventJson.organizerKey).toBeDefined();

    organizerToken = eventJson.organizerKey;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${organizerToken}`,
    };

    // -------------------------------------------------------------
    // Step 2: Verify persistence & read back event
    // -------------------------------------------------------------
    const getEventRes = await eventGet(
      new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}`, {
        headers: authHeaders,
      }),
      { params: Promise.resolve({ id: syntheticEventId }) }
    );
    expect(getEventRes.status).toBe(200);
    const fetchedEventJson = await getEventRes.json();
    expect(fetchedEventJson.event.title).toBe('Aarav & Diya Grand Bengaluru Wedding');
    expect(fetchedEventJson.isOrganizer).toBe(true);

    // -------------------------------------------------------------
    // Step 3: Add two synthetic vendor budget records
    // -------------------------------------------------------------
    // Vendor 1: Catering
    const b1Req = new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}/budget`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'Catering',
        vendorName: 'Royal Feast Caterers',
        quotedAmount: 1200000,
        committedInstalments: 600000,
        projectedFinalInvoice: 1200000,
        confirmationStatus: 'confirmed_24h',
        vendorPhone: '+91 98450 11111',
      }),
    });
    const b1Res = await budgetPost(b1Req, { params: Promise.resolve({ id: syntheticEventId }) });
    expect(b1Res.status).toBe(201);
    const b1Json = await b1Res.json();
    const vendor1Id = b1Json.item.id;

    // Vendor 2: Decor
    const b2Req = new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}/budget`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'Decor & Mandap',
        vendorName: 'Floral Dreams Bengaluru',
        quotedAmount: 500000,
        committedInstalments: 250000,
        projectedFinalInvoice: 500000,
        confirmationStatus: 'confirmed_24h',
        vendorPhone: '+91 98450 22222',
      }),
    });
    const b2Res = await budgetPost(b2Req, { params: Promise.resolve({ id: syntheticEventId }) });
    expect(b2Res.status).toBe(201);

    // Verify budget count is 2
    const listBudgetRes = await budgetGet(
      new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}/budget`, {
        headers: authHeaders,
      }),
      { params: Promise.resolve({ id: syntheticEventId }) }
    );
    const listBudgetJson = await listBudgetRes.json();
    expect(listBudgetJson.count).toBe(2);

    // -------------------------------------------------------------
    // Step 4: Add synthetic timeline task
    // -------------------------------------------------------------
    const t1Req = new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}/timeline`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        baseTime: '17:00',
        durationMins: 45,
        title: 'Baraat Procession & Welcome',
        owner: 'Pandit Ji & Groomsmen',
        vendorPhone: '+91 98450 33333',
        status: 'upcoming',
      }),
    });
    const t1Res = await timelinePost(t1Req, { params: Promise.resolve({ id: syntheticEventId }) });
    expect(t1Res.status).toBe(201);

    // -------------------------------------------------------------
    // Step 5 & 6: Public Invitation & Submit synthetic guest RSVP
    // -------------------------------------------------------------
    const rsvpReq = new NextRequest('http://localhost:3000/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: syntheticEventId,
        name: 'Rajesh & Suneetha Sharma',
        phone: '+91 98450 12345',
        dietary: 'jain',
        accessibilityTags: ['elderly_seating', 'wheelchair_ramp'],
        rsvpStatus: 'confirmed',
        partySize: 2, // Primary + 1 plus-one
        notes: 'Grandparents attending. Thank you!',
        language: 'en',
      }),
    });
    const rsvpRes = await rsvpPost(rsvpReq);
    expect(rsvpRes.status).toBe(201);

    // -------------------------------------------------------------
    // Step 7: Verify guest appears in organizer dashboard
    // -------------------------------------------------------------
    const guestsRes = await guestsGet(
      new NextRequest(`http://localhost:3000/api/events/${syntheticEventId}/guests`, {
        headers: authHeaders,
      }),
      { params: Promise.resolve({ id: syntheticEventId }) }
    );
    expect(guestsRes.status).toBe(200);
    const guestsJson = await guestsRes.json();
    expect(guestsJson.count).toBe(1);
    expect(guestsJson.guests[0].name).toBe('Rajesh & Suneetha Sharma');
    expect(guestsJson.guests[0].dietary).toBe('jain');
    expect(guestsJson.guests[0].plusOnes).toBe(1);

    // -------------------------------------------------------------
    // Step 8: Confirm attendance & calculations update
    // -------------------------------------------------------------
    expect(storedEvent.confirmedRsvpCount).toBe(2); // 1 guest + 1 plusOne = 2

    // -------------------------------------------------------------
    // Step 9: Modify budget (Catering cost increases +50,000 for live counters)
    // -------------------------------------------------------------
    const patchBudgetReq = new NextRequest(
      `http://localhost:3000/api/events/${syntheticEventId}/budget/${vendor1Id}`,
      {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          projectedFinalInvoice: 1250000, // Increased by 50,000
          committedInstalments: 700000,   // Additional installment of 100,000 paid
          overrunRiskReason: 'Live dessert counters added per couple request',
          confirmationStatus: 'confirmed_24h',
        }),
      }
    );
    const patchBudgetRes = await budgetPatch(patchBudgetReq, {
      params: Promise.resolve({ id: syntheticEventId, itemId: vendor1Id }),
    });
    expect(patchBudgetRes.status).toBe(200);

    // -------------------------------------------------------------
    // Step 10 & 11: Ask AI Concierge how much of event budget is committed
    // -------------------------------------------------------------
    let groundedContextCaptured: aiProvider.EventGroundedContext | null = null;
    vi.spyOn(aiProvider, 'generateChatResponse').mockImplementation(async ({ eventContext }) => {
      groundedContextCaptured = eventContext;
      return {
        reply: `For "${eventContext.event.title}", you have committed ₹${eventContext.financials.totalCommitted.toLocaleString('en-IN')} out of your ₹${eventContext.event.totalBudget.toLocaleString('en-IN')} budget. Projected final total is ₹${eventContext.financials.totalProjected.toLocaleString('en-IN')}.`,
        model: 'gemini-3.5-flash-lite',
      };
    });

    const aiReq = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        eventId: syntheticEventId,
        prompt: "How much of this event's budget is committed?",
        history: [],
        language: 'en',
      }),
    });

    const aiRes = await aiChatPost(aiReq);
    expect(aiRes.status).toBe(200);
    const aiJson = await aiRes.json();

    // -------------------------------------------------------------
    // Step 12: Verify Gemini model responds with accurate figures
    // -------------------------------------------------------------
    expect(aiJson.success).toBe(true);
    expect(aiJson.model).toBe('gemini-3.5-flash-lite');

    // Deterministic Math Verification:
    // Vendor 1 committed: 700,000
    // Vendor 2 committed: 250,000
    // Total Committed: 950,000
    // Vendor 1 projected: 1,250,000
    // Vendor 2 projected: 500,000
    // Total Projected: 1,750,000
    // Contingency Buffer Total: 10% of 3,000,000 = 300,000
    // Contingency Used: 1,250,000 - 1,200,000 = 50,000
    // Contingency Buffer Remaining: 250,000
    expect(groundedContextCaptured).not.toBeNull();
    expect(groundedContextCaptured!.financials.totalCommitted).toBe(950000);
    expect(groundedContextCaptured!.financials.totalProjected).toBe(1750000);
    expect(groundedContextCaptured!.financials.contingencyBufferRemaining).toBe(250000);
    expect(groundedContextCaptured!.guestsSummary.totalConfirmedHeadcount).toBe(2);
    expect(groundedContextCaptured!.guestsSummary.dietaryBreakdown.jain).toBe(2);

    expect(aiJson.reply).toContain('9,50,000');

    // -------------------------------------------------------------
    // Step 13: Reload / Read-back all persistent records
    // -------------------------------------------------------------
    const finalEvent = await EventRepository.getEvent(syntheticEventId);
    expect(finalEvent).not.toBeNull();
    expect(finalEvent!.confirmedRsvpCount).toBe(2);

    const finalBudget = await EventRepository.getBudgetItems(syntheticEventId);
    expect(finalBudget.length).toBe(2);

    const finalGuests = await EventRepository.getGuests(syntheticEventId);
    expect(finalGuests.length).toBe(1);

    const finalTimeline = await EventRepository.getTimelineItems(syntheticEventId);
    expect(finalTimeline.length).toBe(1);
  });
});
