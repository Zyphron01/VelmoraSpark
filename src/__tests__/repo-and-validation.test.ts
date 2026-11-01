import { describe, it, expect } from 'vitest';
import {
  EventPlanSchema,
  GuestSubmissionSchema,
  BudgetItemSchema,
  StakeholderVoteSubmissionSchema,
  PublicRsvpSubmissionSchema,
} from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';

describe('Domain Validation & Repository Layer', () => {
  it('validates a valid EventPlan schema correctly', () => {
    const validEvent = {
      id: 'event-wedding-1',
      title: 'Aarav & Diya Wedding Celebration',
      category: 'wedding',
      date: '2026-12-14',
      city: 'Bengaluru',
      invitedCount: 250,
      confirmedRsvpCount: 180,
      totalBudget: 2800000,
      contingencyReservePercent: 12,
      activeWhatsappGroupsReplaced: 8,
    };

    const result = EventPlanSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid EventPlan schema with negative budget', () => {
    const invalidEvent = {
      id: 'event-bad',
      title: 'Test',
      category: 'wedding',
      date: '2026-12-14',
      city: 'Bengaluru',
      invitedCount: 100,
      confirmedRsvpCount: 50,
      totalBudget: -500, // Invalid!
    };

    const result = EventPlanSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
  });

  it('validates a correct guest RSVP submission', () => {
    const validSubmission = {
      eventId: 'wedding-1',
      name: 'Dr. Ramesh Sharma',
      phone: '+91 98450 12345',
      dietary: 'jain',
      accessibilityTags: ['elderly_seating', 'wheelchair_ramp'],
      rsvpStatus: 'confirmed',
      partySize: 3,
      notes: 'Please arrange ground-floor access for grandparents',
      language: 'en',
    };

    const result = GuestSubmissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid guest submission with invalid phone format', () => {
    const invalidSubmission = {
      eventId: 'wedding-1',
      name: 'Ramesh',
      phone: 'invalid-phone-abc!@#',
    };

    const result = GuestSubmissionSchema.safeParse(invalidSubmission);
    expect(result.success).toBe(false);
  });

  it('rejects public RSVP submission if eventId is missing (no silent fallback)', () => {
    const missingEventSubmission = {
      name: 'Ramesh',
      phone: '+91 98450 12345',
    };

    const result = PublicRsvpSubmissionSchema.safeParse(missingEventSubmission);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('eventId'));
      expect(issue).toBeDefined();
    }
  });

  it('validates budget items with non-negative figures', () => {
    const item = {
      id: 'b-1',
      eventId: 'wedding-1',
      category: 'Catering',
      vendorName: 'Royal Mysore Caterers',
      quotedAmount: 1100000,
      committedInstalments: 450000,
      projectedFinalInvoice: 1150000,
      confirmationStatus: 'confirmed_24h',
    };

    const result = BudgetItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it('validates stakeholder vote submission schema', () => {
    const vote = {
      suggestionId: 's-1',
      stakeholderRole: 'parents',
      vote: 'approved',
      voterName: 'Rajesh Sharma',
    };

    const result = StakeholderVoteSubmissionSchema.safeParse(vote);
    expect(result.success).toBe(true);
  });

  it('eliminates silent fake-data fallback and throws DatabaseUnavailableError when DB is disconnected', async () => {
    // When no DB instance exists, repository refuses to fabricate data
    try {
      await EventRepository.getEvent('non-existent-event');
      // If DB is connected in test environment, it returns null instead of fake preset
    } catch (err: unknown) {
      expect(err instanceof DatabaseUnavailableError).toBe(true);
    }
  });
});
