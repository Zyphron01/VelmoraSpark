import { describe, it, expect } from 'vitest';
import {
  generateOrganizerToken,
  verifyEventAccess,
  extractAuthToken,
} from '@/lib/auth';
import {
  CreateEventSchema,
  UpdateEventSchema,
  CreateGuestSchema,
  UpdateGuestSchema,
  CreateBudgetItemSchema,
  UpdateBudgetItemSchema,
  CreateTimelineItemSchema,
  UpdateTimelineItemSchema,
  PublicRsvpSubmissionSchema,
  StakeholderVoteSubmissionSchema,
} from '@/lib/validations/event';

describe('Milestone 2 Backend Operations Suite', () => {
  describe('Cryptographic Authentication & Scoped Authorization', () => {
    const eventIdA = 'event-wedding-2026';
    const eventIdB = 'event-birthday-2026';

    it('generates deterministic SHA-256 HMAC organizer tokens', () => {
      const token1 = generateOrganizerToken(eventIdA);
      const token2 = generateOrganizerToken(eventIdA);
      const tokenDifferent = generateOrganizerToken(eventIdB);

      expect(token1).toBeDefined();
      expect(typeof token1).toBe('string');
      expect(token1.length).toBe(64); // SHA-256 hex string length
      expect(token1).toEqual(token2);
      expect(token1).not.toEqual(tokenDifferent);
    });

    it('extracts tokens from Bearer authorization header', () => {
      const req = new Request('https://api.velmora.internal/api/events/1', {
        headers: {
          authorization: 'Bearer my-secret-token-123',
        },
      });

      expect(extractAuthToken(req)).toBe('my-secret-token-123');
    });

    it('extracts tokens from x-organizer-key custom header', () => {
      const req = new Request('https://api.velmora.internal/api/events/1', {
        headers: {
          'x-organizer-key': 'custom-organizer-key',
        },
      });

      expect(extractAuthToken(req)).toBe('custom-organizer-key');
    });

    it('rejects authorization when token is missing', () => {
      const req = new Request('https://api.velmora.internal/api/events/1');
      const auth = verifyEventAccess(req, eventIdA);

      expect(auth.isAuthorized).toBe(false);
      expect(auth.role).toBe('public');
      expect(auth.error).toContain('Missing Authorization header');
    });

    it('authorizes requests with the valid organizer token', () => {
      const validToken = generateOrganizerToken(eventIdA);
      const req = new Request('https://api.velmora.internal/api/events/1', {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      const auth = verifyEventAccess(req, eventIdA);
      expect(auth.isAuthorized).toBe(true);
      expect(auth.role).toBe('organizer');
      expect(auth.eventId).toBe(eventIdA);
    });

    it('enforces cross-event isolation by rejecting a valid token belonging to a different event', () => {
      // Token for Event B used against Event A
      const tokenForEventB = generateOrganizerToken(eventIdB);
      const req = new Request('https://api.velmora.internal/api/events/1', {
        headers: {
          authorization: `Bearer ${tokenForEventB}`,
        },
      });

      const auth = verifyEventAccess(req, eventIdA);
      expect(auth.isAuthorized).toBe(false);
      expect(auth.role).toBe('public');
      expect(auth.error).toContain('Invalid authorization token for this event');
    });

    it('rejects tampered or malformed tokens', () => {
      const validToken = generateOrganizerToken(eventIdA);
      const tamperedToken = validToken.slice(0, -4) + '0000';

      const req = new Request('https://api.velmora.internal/api/events/1', {
        headers: {
          authorization: `Bearer ${tamperedToken}`,
        },
      });

      const auth = verifyEventAccess(req, eventIdA);
      expect(auth.isAuthorized).toBe(false);
    });
  });

  describe('Event CRUD Validations', () => {
    it('accepts a valid event creation payload', () => {
      const payload = {
        title: 'Mehendi & Sangeet Gala',
        category: 'wedding',
        date: '2026-11-20',
        city: 'Mumbai',
        invitedCount: 300,
        totalBudget: 4500000,
        contingencyReservePercent: 15,
      };

      const result = CreateEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects event creation with negative total budget', () => {
      const payload = {
        title: 'Mehendi & Sangeet Gala',
        category: 'wedding',
        date: '2026-11-20',
        city: 'Mumbai',
        totalBudget: -1000,
      };

      const result = CreateEventSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects event creation with too short title', () => {
      const payload = {
        title: 'M',
        category: 'wedding',
        date: '2026-11-20',
        city: 'Mumbai',
        totalBudget: 100000,
      };

      const result = CreateEventSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('allows partial event updates with UpdateEventSchema', () => {
      const payload = {
        totalBudget: 5000000,
        contingencyReservePercent: 18,
      };

      const result = UpdateEventSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalBudget).toBe(5000000);
      }
    });
  });

  describe('Public RSVP & Guest Management Validations', () => {
    it('strictly requires eventId on public RSVP submission (no hardcoded fallback)', () => {
      const withoutEventId = {
        name: 'Kavita Nair',
        phone: '+91 98200 11223',
        partySize: 2,
      };

      const result = PublicRsvpSubmissionSchema.safeParse(withoutEventId);
      expect(result.success).toBe(false);
    });

    it('accepts valid public RSVP with eventId and phone', () => {
      const validRsvp = {
        eventId: 'event-wedding-2026',
        name: 'Kavita Nair',
        phone: '+91 98200 11223',
        partySize: 2,
        dietary: 'vegan',
        rsvpStatus: 'confirmed',
      };

      const result = PublicRsvpSubmissionSchema.safeParse(validRsvp);
      expect(result.success).toBe(true);
    });

    it('rejects partySize greater than 20 for anti-abuse protection', () => {
      const excessiveParty = {
        eventId: 'event-wedding-2026',
        name: 'Party Spammer',
        phone: '+91 98200 11223',
        partySize: 25,
      };

      const result = PublicRsvpSubmissionSchema.safeParse(excessiveParty);
      expect(result.success).toBe(false);
    });

    it('validates organizer-created guest with CreateGuestSchema', () => {
      const guest = {
        name: 'Suresh Menon',
        phone: '+91 94440 55667',
        dietary: 'nut_free',
        plusOnes: 1,
        rsvpStatus: 'confirmed',
      };

      const result = CreateGuestSchema.safeParse(guest);
      expect(result.success).toBe(true);
    });

    it('allows partial guest updates with UpdateGuestSchema', () => {
      const update = {
        rsvpStatus: 'declined',
        notes: 'Cannot attend due to travel schedule',
      };

      const result = UpdateGuestSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe('Budget & Timeline Item Validations', () => {
    it('validates budget item with positive figures', () => {
      const budgetItem = {
        category: 'Decor & Flowers',
        vendorName: 'Bloom Crafts Bangalore',
        quotedAmount: 350000,
        committedInstalments: 100000,
        projectedFinalInvoice: 375000,
        confirmationStatus: 'confirmed_24h',
      };

      const result = CreateBudgetItemSchema.safeParse(budgetItem);
      expect(result.success).toBe(true);
    });

    it('rejects negative quoted amount on budget item', () => {
      const invalidBudgetItem = {
        category: 'Decor',
        vendorName: 'Bad Vendor',
        quotedAmount: -50000,
      };

      const result = CreateBudgetItemSchema.safeParse(invalidBudgetItem);
      expect(result.success).toBe(false);
    });

    it('validates partial budget updates with UpdateBudgetItemSchema', () => {
      const budgetUpdate = {
        projectedFinalInvoice: 380000,
        confirmationStatus: 'confirmed_24h' as const,
      };

      const result = UpdateBudgetItemSchema.safeParse(budgetUpdate);
      expect(result.success).toBe(true);
    });

    it('validates timeline item schema', () => {
      const timelineItem = {
        baseTime: '18:30',
        currentTime: '18:45',
        durationMins: 45,
        delayMins: 15,
        title: 'Baraat Arrival & Welcome',
        owner: 'Groom Family Lead',
        status: 'delayed',
      };

      const result = CreateTimelineItemSchema.safeParse(timelineItem);
      expect(result.success).toBe(true);
    });

    it('validates partial timeline item updates', () => {
      const update = {
        delayMins: 20,
        status: 'live',
      };

      const result = UpdateTimelineItemSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it('validates stakeholder vote payload', () => {
      const vote = {
        suggestionId: 'option-heritage-palace',
        stakeholderRole: 'couple',
        vote: 'approved',
        voterName: 'Aarav & Diya',
      };

      const result = StakeholderVoteSubmissionSchema.safeParse(vote);
      expect(result.success).toBe(true);
    });
  });
});

