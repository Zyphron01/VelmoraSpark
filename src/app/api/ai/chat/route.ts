import { NextRequest, NextResponse } from 'next/server';
import { AIChatEndpointSchema } from '@/lib/validations/event';
import { verifyEventAccess } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
import { PRESETS } from '@/lib/demo-data';
import {
  generateChatResponse,
  generateDeterministicOperationalReply,
  EventGroundedContext,
  GeminiServiceUnavailableError,
  GeminiApiError,
} from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`ai-chat:${clientIp}`, 20, 60_000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a moment before sending another AI query.',
          retryAfter: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
          },
        }
      );
    }

    // 2. Validate Request Body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsed = AIChatEndpointSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { eventId, prompt, history, language } = parsed.data;

    // 3. Organizer Authentication & Authorization
    const matchedPresetEntry = Object.entries(PRESETS).find(([, p]) => p.event.id === eventId);
    const isDemoEvent = Boolean(matchedPresetEntry);

    if (!isDemoEvent) {
      const auth = verifyEventAccess(req, eventId);
      if (!auth.isAuthorized) {
        return NextResponse.json(
          {
            error: auth.error
              ? `Unauthorized: ${auth.error}`
              : 'Unauthorized: Valid organizer access token is required to converse with the AI Concierge.',
          },
          { status: 401 }
        );
      }
    }

    // 4. Retrieve Grounded Operational Context (from Database or Preset)
    let event: {
      id: string;
      title: string;
      category: string;
      date: string;
      city: string;
      totalBudget: number;
      invitedCount: number;
      contingencyReservePercent: number;
      confirmedRsvpCount?: number;
    };
    let budgetItems: {
      category: string;
      vendorName: string;
      quotedAmount: number;
      committedInstalments: number;
      projectedFinalInvoice: number;
      confirmationStatus: string;
      overrunRiskReason?: string | null;
    }[];
    let guests: {
      dietary?: string | null;
      accessibilityTags?: string[] | null;
      rsvpStatus?: string | null;
      plusOnes?: number | null;
    }[];
    let timelineItems: {
      baseTime?: string | null;
      currentTime: string;
      title: string;
      owner: string;
      delayMins: number;
      status: string;
    }[];

    if (matchedPresetEntry) {
      const presetData = matchedPresetEntry[1];
      event = {
        id: presetData.event.id,
        title: presetData.event.title,
        category: presetData.event.category,
        date: presetData.event.date,
        city: presetData.event.city,
        totalBudget: presetData.event.totalBudget,
        invitedCount: presetData.event.invitedCount,
        contingencyReservePercent: presetData.event.contingencyReservePercent,
        confirmedRsvpCount: presetData.event.confirmedRsvpCount,
      };
      budgetItems = presetData.budget;
      guests = presetData.guests;
      timelineItems = presetData.runSheet;
    } else {
      const dbEvent = await EventRepository.getEvent(eventId);
      if (!dbEvent) {
        return NextResponse.json(
          { error: `Event with id '${eventId}' was not found in the database.` },
          { status: 404 }
        );
      }
      event = {
        id: dbEvent.id,
        title: dbEvent.title,
        category: dbEvent.category,
        date: dbEvent.date,
        city: dbEvent.city,
        totalBudget: dbEvent.totalBudget,
        invitedCount: dbEvent.invitedCount,
        contingencyReservePercent: dbEvent.contingencyReservePercent,
        confirmedRsvpCount: dbEvent.confirmedRsvpCount,
      };
      [budgetItems, guests, timelineItems] = await Promise.all([
        EventRepository.getBudgetItems(eventId),
        EventRepository.getGuests(eventId),
        EventRepository.getTimelineItems(eventId),
      ]);
    }

    // Financial calculations
    const totalCommitted = budgetItems.reduce((sum, b) => sum + (b.committedInstalments || 0), 0);
    const totalProjected = budgetItems.reduce((sum, b) => sum + (b.projectedFinalInvoice || 0), 0);
    const contingencyReservePercent = event.contingencyReservePercent || 10;
    const contingencyBufferTotal = Math.round(event.totalBudget * (contingencyReservePercent / 100));
    const contingencyUsed = budgetItems
      .filter((b) => (b.projectedFinalInvoice || 0) > (b.quotedAmount || 0))
      .reduce((sum, b) => sum + ((b.projectedFinalInvoice || 0) - (b.quotedAmount || 0)), 0);
    const contingencyBufferRemaining = Math.max(0, contingencyBufferTotal - contingencyUsed);
    const budgetVariance = totalProjected - event.totalBudget;

    const atRiskVendors = budgetItems
      .filter((b) => b.confirmationStatus === 'at_risk' || (b.overrunRiskReason && b.overrunRiskReason.trim().length > 0))
      .map((b) => ({
        category: b.category,
        vendorName: b.vendorName,
        projectedFinalInvoice: b.projectedFinalInvoice || 0,
        confirmationStatus: b.confirmationStatus,
        overrunRiskReason: b.overrunRiskReason || undefined,
      }));

    // Guest Attendance & Dietary Aggregation (STRICT PRIVACY: NO NAMES OR PHONE NUMBERS)
    let confirmedHeadcount = 0;
    let pendingHeadcount = 0;
    let declinedHeadcount = 0;

    const dietaryCounts = { standard: 0, jain: 0, vegan: 0, nutFree: 0 };
    const accessibilityCounts = {
      wheelchairRamp: 0,
      groundFloorRoom: 0,
      elderlySeating: 0,
      lowDecibelZone: 0,
    };

    for (const g of guests) {
      const headcount = 1 + (g.plusOnes || 0);
      if (g.rsvpStatus === 'confirmed') {
        confirmedHeadcount += headcount;
      } else if (g.rsvpStatus === 'pending') {
        pendingHeadcount += headcount;
      } else if (g.rsvpStatus === 'declined') {
        declinedHeadcount += headcount;
      }

      // Dietary
      if (g.dietary === 'jain') dietaryCounts.jain += headcount;
      else if (g.dietary === 'vegan') dietaryCounts.vegan += headcount;
      else if (g.dietary === 'nut_free') dietaryCounts.nutFree += headcount;
      else dietaryCounts.standard += headcount;

      // Accessibility tags
      if (Array.isArray(g.accessibilityTags)) {
        if (g.accessibilityTags.includes('wheelchair_ramp')) accessibilityCounts.wheelchairRamp += 1;
        if (g.accessibilityTags.includes('ground_floor_room')) accessibilityCounts.groundFloorRoom += 1;
        if (g.accessibilityTags.includes('elderly_seating')) accessibilityCounts.elderlySeating += 1;
        if (g.accessibilityTags.includes('low_decibel_zone')) accessibilityCounts.lowDecibelZone += 1;
      }
    }

    // Timeline Aggregation
    const completedItems = timelineItems.filter((t) => t.status === 'completed').length;
    const delayedList = timelineItems.filter((t) => (t.delayMins || 0) > 0 || t.status === 'delayed');
    const totalCumulativeDelayMins = delayedList.reduce((sum, t) => sum + (t.delayMins || 0), 0);

    const eventContext: EventGroundedContext = {
      event: {
        id: event.id,
        title: event.title,
        category: event.category,
        date: event.date,
        city: event.city,
        totalBudget: event.totalBudget,
        contingencyReservePercent,
        confirmedRsvpCount: confirmedHeadcount > 0 ? confirmedHeadcount : (event.confirmedRsvpCount ?? 0),
        invitedCount: event.invitedCount,
      },
      financials: {
        totalCommitted,
        totalProjected,
        contingencyBufferTotal,
        contingencyBufferRemaining,
        budgetVariance,
        lineItemsCount: budgetItems.length,
        atRiskVendors,
      },
      guestsSummary: {
        totalGuestsRecords: guests.length,
        totalConfirmedHeadcount: confirmedHeadcount,
        pendingHeadcount,
        declinedHeadcount,
        dietaryBreakdown: dietaryCounts,
        accessibilityRequests: accessibilityCounts,
      },
      timelineSummary: {
        totalItems: timelineItems.length,
        completedItems,
        liveOrUpcomingItems: timelineItems.length - completedItems,
        delayedItemsCount: delayedList.length,
        totalCumulativeDelayMins,
        delayedItems: delayedList.map((d) => ({
          title: d.title,
          baseTime: d.baseTime || d.currentTime,
          currentTime: d.currentTime || undefined,
          delayMins: d.delayMins || 0,
          owner: d.owner,
          status: d.status,
        })),
      },
    };

    // 5. Generate Response via Gemini (with graceful demo fallback if offline or key unconfigured)
    let aiResponse;
    try {
      aiResponse = await generateChatResponse({
        eventContext,
        messages: history,
        userPrompt: prompt,
        language,
      });
    } catch (err: unknown) {
      if (isDemoEvent && (err instanceof GeminiServiceUnavailableError || err instanceof GeminiApiError)) {
        aiResponse = {
          reply: generateDeterministicOperationalReply(prompt, eventContext),
          model: 'grounded-operational-engine (demo fallback)',
          isLiveModel: false,
        };
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      reply: aiResponse.reply,
      model: aiResponse.model,
      dataSource: isDemoEvent ? 'demo_preset' : 'neon_database',
      isLiveModel: aiResponse.isLiveModel,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please check database configuration.' },
        { status: 503 }
      );
    }

    if (err instanceof GeminiServiceUnavailableError) {
      return NextResponse.json(
        { error: err.message },
        { status: 503 }
      );
    }

    if (err instanceof GeminiApiError) {
      return NextResponse.json(
        { error: `Upstream AI provider error: ${err.message}` },
        { status: 502 }
      );
    }

    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { error: 'Internal server error processing AI chat request.', details: message },
      { status: 500 }
    );
  }
}
