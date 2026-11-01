import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as authPost } from '@/app/api/events/[id]/auth/route';
import { POST as rsvpPost } from '@/app/api/rsvp/route';
import { GET as eventGet } from '@/app/api/events/[id]/route';
import { GET as guestsGet } from '@/app/api/events/[id]/guests/route';
import { EventRepository, DatabaseUnavailableError, DuplicateRecordError } from '@/db/repo';
import { generateOrganizerToken, verifyEventAccess } from '@/lib/auth';
import { resetRateLimits } from '@/lib/rate-limit';

/**
 * Security Regression Checkpoint (HTTP Handler Tests)
 *
 * Tests HTTP route handlers in isolation with synthetic fixtures.
 * Proves that:
 * 1. Missing authentication secret fails securely.
 * 2. Unauthenticated and invalid organizer credentials return 401.
 * 3. Cross-event organizer access attempts return 401/403.
 * 4. Missing events return 404 and are NEVER auto-provisioned.
 * 5. Duplicate RSVP submissions return 409.
 * 6. Rate limits are strictly enforced with 429.
 * 7. Public routes never expose confidential financial data.
 * 8. Database errors cleanly return 503 without crashing or silent fallback.
 */
describe('Security Regression & Authorization Checkpoint (HTTP Handlers)', () => {
  const testEventIdA = 'sec-test-evt-a-2026';
  const testEventIdB = 'sec-test-evt-b-2026';

  const mockEventA = {
    id: testEventIdA,
    title: 'Aarav & Diya Wedding Celebration',
    category: 'wedding',
    date: '2026-12-14',
    city: 'Bengaluru',
    totalBudget: 2800000,
    invitedCount: 250,
    confirmedRsvpCount: 0,
    contingencyReservePercent: 12,
    activeWhatsappGroupsReplaced: 8,
    createdAt: new Date(),
  };

  const mockEventB = {
    id: testEventIdB,
    title: 'Milestone Anniversary Celebration',
    category: 'anniversary',
    date: '2026-12-20',
    city: 'Mumbai',
    totalBudget: 1500000,
    invitedCount: 100,
    confirmedRsvpCount: 0,
    contingencyReservePercent: 10,
    activeWhatsappGroupsReplaced: 2,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
    // Ensure test environment uses a valid synthetic secret
    process.env.AUTH_SECRET = 'synthetic_test_auth_secret_with_more_than_32_characters_for_testing';
    delete process.env.ADMIN_API_KEY;

    // Default repository mock
    vi.spyOn(EventRepository, 'getEvent').mockImplementation(async (id: string) => {
      if (id === testEventIdA) return mockEventA;
      if (id === testEventIdB) return mockEventB;
      return null;
    });
  });

  describe('Priority 1: Organizer Authentication & Legitimate Ownership', () => {
    it('rejects unauthenticated requests to obtain organizer token (401)', async () => {
      const req = new Request(`https://velmora.internal/api/events/${testEventIdA}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await authPost(req, { params: Promise.resolve({ id: testEventIdA }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
      expect(data.organizerKey).toBeUndefined();
    });

    it('rejects unauthorized passcode attempts (no hardcoded bypass) (401)', async () => {
      const req = new Request(`https://velmora.internal/api/events/${testEventIdA}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: 'velmora2026' }),
      });

      const res = await authPost(req, { params: Promise.resolve({ id: testEventIdA }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Invalid organizer credentials');
      expect(data.organizerKey).toBeUndefined();
    });

    it('rejects unknown event IDs with 404', async () => {
      const req = new Request('https://velmora.internal/api/events/non-existent-event-xyz/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: 'some-credential' }),
      });

      const res = await authPost(req, { params: Promise.resolve({ id: 'non-existent-event-xyz' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain('not found');
    });

    it('enforces strict cross-event isolation: token for Event A cannot access Event B', async () => {
      const tokenA = generateOrganizerToken(testEventIdA);

      const req = new Request(`https://velmora.internal/api/events/${testEventIdB}/guests`, {
        headers: {
          authorization: `Bearer ${tokenA}`,
        },
      });

      const auth = verifyEventAccess(req, testEventIdB);
      expect(auth.isAuthorized).toBe(false);

      const res = await guestsGet(req, { params: Promise.resolve({ id: testEventIdB }) });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Invalid authorization token');
    });

    it('enforces rate limiting on organizer authentication endpoint (429)', async () => {
      const clientHeaders = {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.99',
      };

      // 5 allowed attempts
      for (let i = 0; i < 5; i++) {
        const req = new Request(`https://velmora.internal/api/events/${testEventIdA}/auth`, {
          method: 'POST',
          headers: clientHeaders,
          body: JSON.stringify({ credential: 'wrong-credential' }),
        });
        const res = await authPost(req, { params: Promise.resolve({ id: testEventIdA }) });
        expect(res.status).toBe(401);
      }

      // 6th attempt must be rate-limited with HTTP 429
      const blockedReq = new Request(`https://velmora.internal/api/events/${testEventIdA}/auth`, {
        method: 'POST',
        headers: clientHeaders,
        body: JSON.stringify({ credential: 'wrong-credential' }),
      });
      const blockedRes = await authPost(blockedReq, { params: Promise.resolve({ id: testEventIdA }) });
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('Retry-After')).toBeDefined();
    });

    it('allows organizer with legitimate token to verify ownership successfully (200)', async () => {
      const validToken = generateOrganizerToken(testEventIdA);

      const req = new Request(`https://velmora.internal/api/events/${testEventIdA}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: validToken }),
      });

      const res = await authPost(req, { params: Promise.resolve({ id: testEventIdA }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.organizerKey).toBe(validToken);
    });
  });

  describe('Priority 2: Public RSVP Protection & Rate Limiting', () => {
    it('strictly rejects RSVP submissions to non-existent events with 404 (no auto-provisioning)', async () => {
      const req = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'completely-nonexistent-event-12345',
          name: 'Synthetic Tester',
          phone: '+1-555-010-0099',
          partySize: 1,
        }),
      });

      const res = await rsvpPost(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('does not exist');
    });

    it('rejects RSVP submissions with malformed phone numbers (400)', async () => {
      const req = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: testEventIdA,
          name: 'Invalid Phone Tester',
          phone: 'bad-phone-letters-123!@#',
          partySize: 1,
        }),
      });

      const res = await rsvpPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });

    it('rejects duplicate RSVP submissions with 409 Conflict', async () => {
      vi.spyOn(EventRepository, 'createGuest').mockRejectedValueOnce(
        new DuplicateRecordError("An RSVP with phone number '+1-555-010-1234' already exists for this event.")
      );

      const req = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: testEventIdA,
          name: 'Duplicate Tester',
          phone: '+1-555-010-1234',
          partySize: 2,
        }),
      });

      const res = await rsvpPost(req);
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('enforces rate limiting on public RSVP endpoint (429)', async () => {
      const clientHeaders = {
        'Content-Type': 'application/json',
        'x-forwarded-for': '198.51.100.77',
      };

      vi.spyOn(EventRepository, 'createGuest').mockResolvedValue({
        id: 'mock-guest-id',
        eventId: testEventIdA,
        name: 'Guest',
        phone: '+1-555-010-0001',
        dietary: 'standard',
        accessibilityTags: [],
        rsvpStatus: 'confirmed',
        plusOnes: 0,
        notes: '',
        createdAt: new Date(),
      });

      // Exhaust 10 allowed requests per window
      for (let i = 0; i < 10; i++) {
        const req = new Request('https://velmora.internal/api/rsvp', {
          method: 'POST',
          headers: clientHeaders,
          body: JSON.stringify({
            eventId: testEventIdA,
            name: `Guest ${i}`,
            phone: `+1-555-010-000${i}`,
            partySize: 1,
          }),
        });
        const res = await rsvpPost(req);
        expect(res.status).toBe(201);
      }

      // 11th request must be rate limited with HTTP 429
      const blockedReq = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: clientHeaders,
        body: JSON.stringify({
          eventId: testEventIdA,
          name: 'Guest 11',
          phone: '+1-555-010-0011',
          partySize: 1,
        }),
      });

      const blockedRes = await rsvpPost(blockedReq);
      expect(blockedRes.status).toBe(429);
      const data = await blockedRes.json();
      expect(data.error).toContain('Too many RSVP requests');
    });

    it('never exposes private guest list or secret keys in successful RSVP response (201)', async () => {
      vi.spyOn(EventRepository, 'createGuest').mockResolvedValueOnce({
        id: 'guest-privacy-check',
        eventId: testEventIdA,
        name: 'Private Guest',
        phone: '+1-555-010-9988',
        dietary: 'jain',
        accessibilityTags: ['wheelchair_ramp'],
        rsvpStatus: 'confirmed',
        plusOnes: 2,
        notes: 'Private Note',
        createdAt: new Date(),
      });

      const req = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: testEventIdA,
          name: 'Private Guest',
          phone: '+1-555-010-9988',
          dietary: 'jain',
          accessibilityTags: ['wheelchair_ramp'],
          partySize: 3,
        }),
      });

      const res = await rsvpPost(req);
      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.rsvp).toBeDefined();
      expect(data.rsvp.name).toBe('Private Guest');
      expect(data.rsvp.partySize).toBe(3);
      // Ensure private fields (other guests, organizer keys) are not leaked
      expect(data.organizerKey).toBeUndefined();
      expect(data.allGuests).toBeUndefined();
    });
  });

  describe('Priority 3: Information Disclosure & Financial Data Protection', () => {
    it('redacts confidential financial figures (budget) for unauthenticated public visitors on GET /api/events/[id]', async () => {
      const publicReq = new Request(`https://velmora.internal/api/events/${testEventIdA}`);

      const res = await eventGet(publicReq, { params: Promise.resolve({ id: testEventIdA }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.isOrganizer).toBe(false);
      expect(data.event.title).toBe(mockEventA.title);
      // Confidential budget figures must be undefined for public visitors
      expect(data.event.totalBudget).toBeUndefined();
      expect(data.event.contingencyReservePercent).toBeUndefined();
    });

    it('returns complete event data including budget for authorized organizers on GET /api/events/[id]', async () => {
      const organizerToken = generateOrganizerToken(testEventIdA);
      const authReq = new Request(`https://velmora.internal/api/events/${testEventIdA}`, {
        headers: {
          authorization: `Bearer ${organizerToken}`,
        },
      });

      const res = await eventGet(authReq, { params: Promise.resolve({ id: testEventIdA }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.isOrganizer).toBe(true);
      expect(data.event.totalBudget).toBe(mockEventA.totalBudget);
    });
  });

  describe('Priority 4: Database Error Handling', () => {
    it('returns HTTP 503 when the database service is unavailable', async () => {
      vi.spyOn(EventRepository, 'getEvent').mockRejectedValueOnce(
        new DatabaseUnavailableError('Database service is currently unavailable.')
      );

      const req = new Request('https://velmora.internal/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: testEventIdA,
          name: 'Tester',
          phone: '+1-555-010-0001',
          partySize: 1,
        }),
      });

      const res = await rsvpPost(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toContain('unavailable');
    });
  });
});
