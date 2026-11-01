import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { EventRepository, DuplicateRecordError } from '@/db/repo';
import { getDb, isTestDatabaseConfigured } from '@/db';

/**
 * End-to-End RSVP Flow & Real Database Persistence
 *
 * SAFETY INVARIANT:
 * This integration test suite ONLY executes against an explicitly configured disposable
 * test database via TEST_DATABASE_URL. It NEVER connects to or modifies the primary/production DATABASE_URL.
 */
describe('End-to-End RSVP Flow & Real Database Persistence (Separate Test Database)', () => {
  const db = getDb();
  const hasTestDb = isTestDatabaseConfigured();
  const isolatedTestEventId = `test-isolated-evt-${Date.now()}`;
  const syntheticPhone = `+1-555-010-${Math.floor(1000 + Math.random() * 8999)}`;

  beforeAll(async () => {
    if (!hasTestDb || !db) {
      console.log(
        '[Safety Invariant] Skipping live DB persistence test: TEST_DATABASE_URL is not configured. Live tests never run against primary DATABASE_URL.'
      );
      return;
    }

    // Create dedicated isolated synthetic event for testing in the test database
    await EventRepository.createEvent({
      id: isolatedTestEventId,
      title: 'SYNTHETIC_ISOLATED_TEST_EVENT',
      category: 'wedding',
      date: '2026-12-14',
      city: 'Bengaluru',
      totalBudget: 2800000,
      invitedCount: 250,
      confirmedRsvpCount: 0,
      contingencyReservePercent: 12,
      activeWhatsappGroupsReplaced: 8,
    });
  });

  afterAll(async () => {
    if (!hasTestDb || !db) return;
    try {
      await EventRepository.deleteEvent(isolatedTestEventId);
    } catch (err) {
      console.warn('Test cleanup error in test database:', err);
    }
  });

  it('guarantees safety invariant: requires TEST_DATABASE_URL to be explicitly configured', () => {
    if (!hasTestDb) {
      expect(db).toBeNull();
      return;
    }
    expect(db).toBeDefined();
  });

  it('guarantees isolated test celebration event exists in test database when configured', async () => {
    if (!hasTestDb || !db) return;

    const event = await EventRepository.getEvent(isolatedTestEventId);
    expect(event).toBeDefined();
    expect(event?.id).toBe(isolatedTestEventId);
    expect(event?.title).toContain('SYNTHETIC_ISOLATED_TEST_EVENT');
  });

  it('persists a new synthetic guest RSVP with dietary & accessibility options to test DB', async () => {
    if (!hasTestDb || !db) return;

    const guestPayload = {
      id: `guest-synthetic-${Date.now()}`,
      eventId: isolatedTestEventId,
      name: 'SYNTHETIC_TEST_GUEST_555_0100',
      phone: syntheticPhone,
      dietary: 'vegan',
      accessibilityTags: ['wheelchair_ramp', 'elderly_seating'],
      rsvpStatus: 'confirmed',
      plusOnes: 1,
      notes: 'Synthetic test record for verification suite',
    };

    const created = await EventRepository.createGuest(guestPayload);
    expect(created).toBeDefined();
    expect(created.name).toBe('SYNTHETIC_TEST_GUEST_555_0100');
    expect(created.phone).toBe(syntheticPhone);
    expect(created.dietary).toBe('vegan');

    // Confirm that the event RSVP count was atomically updated
    const updatedEvent = await EventRepository.getEvent(isolatedTestEventId);
    expect(updatedEvent?.confirmedRsvpCount).toBe(2); // 1 primary guest + 1 plusOne
  });

  it('rejects duplicate RSVP submissions using the same phone number in test DB', async () => {
    if (!hasTestDb || !db) return;

    const duplicateGuestPayload = {
      id: `guest-synthetic-duplicate-${Date.now()}`,
      eventId: isolatedTestEventId,
      name: 'SYNTHETIC_DUPLICATE_ATTEMPT',
      phone: syntheticPhone, // Identical phone
      dietary: 'standard',
      accessibilityTags: [],
      rsvpStatus: 'confirmed',
      plusOnes: 0,
      notes: 'Duplicate should fail',
    };

    await expect(EventRepository.createGuest(duplicateGuestPayload)).rejects.toThrow(DuplicateRecordError);
  });
});
