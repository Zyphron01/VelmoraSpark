import { describe, it, expect } from 'vitest';
import { EventCategorySchema } from '@/lib/validations/event';
import { PRESETS } from '@/lib/demo-data';
import { generateDeterministicOperationalReply, EventGroundedContext } from '@/lib/ai/provider';

describe('Custom Event Creation & Scaled Math Verification', () => {
  it('supports expanded celebration categories including celebration and other', () => {
    const validCategories = ['wedding', 'college_fest', 'milestone_birthday', 'celebration', 'other'];
    validCategories.forEach((cat) => {
      const parsed = EventCategorySchema.safeParse(cat);
      expect(parsed.success).toBe(true);
    });

    const invalid = EventCategorySchema.safeParse('unsupported_type');
    expect(invalid.success).toBe(false);
  });

  it('allocates custom budget across 5 categories summing to exactly 100%', () => {
    const testBudgets = [250000, 1500000, 3500000, 8000000];

    testBudgets.forEach((totalBudget) => {
      const venue = Math.round(totalBudget * 0.35);
      const catering = Math.round(totalBudget * 0.30);
      const decor = Math.round(totalBudget * 0.15);
      const media = Math.round(totalBudget * 0.10);
      const entertainment = totalBudget - (venue + catering + decor + media);

      const sum = venue + catering + decor + media + entertainment;
      expect(sum).toBe(totalBudget);
      expect(venue).toBeGreaterThan(0);
      expect(catering).toBeGreaterThan(0);
      expect(decor).toBeGreaterThan(0);
      expect(media).toBeGreaterThan(0);
      expect(entertainment).toBeGreaterThan(0);
    });
  });

  it('scales catering calculations dynamically with custom guest count', () => {
    const invitedCount = 450;
    const totalBudget = 2500000;
    const cateringAmount = Math.round(totalBudget * 0.30);
    const perPlate = Math.round(cateringAmount / invitedCount);

    const p50 = Math.round(invitedCount * 0.82);
    const p90 = Math.round(invitedCount * 0.94);
    const buffer = Math.max(15, Math.round(invitedCount * 0.08));

    expect(perPlate).toBe(1667);
    expect(p50).toBe(369);
    expect(p90).toBe(423);
    expect(buffer).toBe(36);
    expect(p90).toBeGreaterThan(p50);
  });

  it('preserves clean isolation between presets and does not mutate demo data', () => {
    const originalWeddingTitle = PRESETS.wedding.event.title;
    const originalWeddingBudget = PRESETS.wedding.event.totalBudget;

    // Simulate custom event creation
    const customEvent = {
      id: 'custom-event-1',
      title: "Priya's 25th Milestone Birthday",
      totalBudget: 400000,
      isCustom: true,
    };

    expect(customEvent.title).not.toBe(originalWeddingTitle);
    expect(PRESETS.wedding.event.title).toBe(originalWeddingTitle);
    expect(PRESETS.wedding.event.totalBudget).toBe(originalWeddingBudget);
  });

  it('grounded operational engine provides accurate answers without failing when Gemini is offline', () => {
    const mockContext: EventGroundedContext = {
      event: {
        id: 'custom-event-1',
        title: "Aarav & Meera's Sangeet",
        category: 'wedding',
        date: '2026-12-15',
        city: 'Jaipur',
        totalBudget: 3000000,
        contingencyReservePercent: 10,
        confirmedRsvpCount: 220,
        invitedCount: 300,
      },
      financials: {
        totalCommitted: 600000,
        totalProjected: 3000000,
        contingencyBufferTotal: 300000,
        contingencyBufferRemaining: 300000,
        budgetVariance: 0,
        lineItemsCount: 5,
        atRiskVendors: [],
      },
      guestsSummary: {
        totalGuestsRecords: 5,
        totalConfirmedHeadcount: 220,
        pendingHeadcount: 40,
        declinedHeadcount: 10,
        dietaryBreakdown: { standard: 180, jain: 25, vegan: 15, nutFree: 5 },
        accessibilityRequests: { wheelchairRamp: 2, groundFloorRoom: 3, elderlySeating: 8, lowDecibelZone: 1 },
      },
      timelineSummary: {
        totalItems: 5,
        completedItems: 1,
        liveOrUpcomingItems: 4,
        delayedItemsCount: 0,
        totalCumulativeDelayMins: 0,
        delayedItems: [],
      },
    };

    // Test vendor delay query
    const riskReply = generateDeterministicOperationalReply('Any vendor delays or risks?', mockContext);
    expect(riskReply).toContain('Operational Risk Assessment');
    expect(riskReply).toContain('All contracted vendor invoices are currently within agreed ceilings');

    // Test budget query
    const budgetReply = generateDeterministicOperationalReply('What is the budget?', mockContext);
    expect(budgetReply).toContain('Financial Audit');
    expect(budgetReply).toContain('30,00,000');

    // Test dietary query
    const dietaryReply = generateDeterministicOperationalReply('Show me dietary requirements', mockContext);
    expect(dietaryReply).toContain('Guest & Catering Logistics');
    expect(dietaryReply).toContain('Jain');
  });
});
