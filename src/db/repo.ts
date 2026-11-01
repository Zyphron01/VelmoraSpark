import { getDb } from '@/db';
import { schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import type {
  EventEntity,
  InsertEventEntity,
  BudgetItemEntity,
  InsertBudgetItemEntity,
  RsvpGuestEntity,
  InsertRsvpGuestEntity,
  RunSheetItemEntity,
  InsertRunSheetItemEntity,
} from '@/db/schema';

export class DatabaseUnavailableError extends Error {
  constructor(message = 'Database service is currently unavailable. Check DATABASE_URL configuration.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

export class DuplicateRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateRecordError';
  }
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new DatabaseUnavailableError();
  }
  return db;
}

export class EventRepository {
  // ─── Events ───────────────────────────────────────────────────────────────

  static async listEvents(): Promise<EventEntity[]> {
    const db = requireDb();
    return await db.select().from(schema.events);
  }

  static async getEvent(eventId: string): Promise<EventEntity | null> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, eventId))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  static async createEvent(data: InsertEventEntity): Promise<EventEntity> {
    const db = requireDb();
    const existing = await this.getEvent(data.id);
    if (existing) {
      throw new DuplicateRecordError(`Event with id '${data.id}' already exists.`);
    }

    const rows = await db.insert(schema.events).values(data).returning();
    return rows[0];
  }

  static async updateEvent(
    eventId: string,
    data: Partial<Omit<InsertEventEntity, 'id' | 'createdAt'>>
  ): Promise<EventEntity | null> {
    const db = requireDb();
    const rows = await db
      .update(schema.events)
      .set(data)
      .where(eq(schema.events.id, eventId))
      .returning();

    return rows.length > 0 ? rows[0] : null;
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    const db = requireDb();
    // Delete dependent records first to maintain integrity across all tables
    await db.delete(schema.budgetItems).where(eq(schema.budgetItems.eventId, eventId));
    await db.delete(schema.rsvpGuests).where(eq(schema.rsvpGuests.eventId, eventId));
    await db.delete(schema.runSheetItems).where(eq(schema.runSheetItems.eventId, eventId));
    await db.delete(schema.planSuggestions).where(eq(schema.planSuggestions.eventId, eventId));

    const rows = await db
      .delete(schema.events)
      .where(eq(schema.events.id, eventId))
      .returning({ id: schema.events.id });

    return rows.length > 0;
  }

  // ─── Guests & RSVPs ───────────────────────────────────────────────────────

  static async getGuests(eventId: string): Promise<RsvpGuestEntity[]> {
    const db = requireDb();
    return await db
      .select()
      .from(schema.rsvpGuests)
      .where(eq(schema.rsvpGuests.eventId, eventId));
  }

  static async getGuest(eventId: string, guestId: string): Promise<RsvpGuestEntity | null> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.rsvpGuests)
      .where(and(eq(schema.rsvpGuests.eventId, eventId), eq(schema.rsvpGuests.id, guestId)))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  static async findGuestByPhone(eventId: string, phone: string): Promise<RsvpGuestEntity | null> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.rsvpGuests)
      .where(and(eq(schema.rsvpGuests.eventId, eventId), eq(schema.rsvpGuests.phone, phone)))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  static async createGuest(guestData: InsertRsvpGuestEntity): Promise<RsvpGuestEntity> {
    const db = requireDb();

    // Verify parent event exists
    const event = await this.getEvent(guestData.eventId);
    if (!event) {
      throw new Error(`Event '${guestData.eventId}' not found.`);
    }

    // Check duplicate phone
    const existing = await this.findGuestByPhone(guestData.eventId, guestData.phone);
    if (existing) {
      throw new DuplicateRecordError(`An RSVP with phone number '${guestData.phone}' already exists for this event.`);
    }

    let rows: RsvpGuestEntity[];
    try {
      rows = await db.insert(schema.rsvpGuests).values(guestData).returning();
    } catch (insertErr: unknown) {
      const errObj = insertErr as { code?: string; message?: string };
      if (
        errObj?.code === '23505' ||
        errObj?.message?.toLowerCase().includes('unique') ||
        errObj?.message?.toLowerCase().includes('duplicate')
      ) {
        throw new DuplicateRecordError(`An RSVP with phone number '${guestData.phone}' already exists for this event.`);
      }
      throw insertErr;
    }
    const created = rows[0];

    // Atomically recalculate and update confirmed RSVP count on event
    await this.refreshConfirmedRsvpCount(guestData.eventId);

    return created;
  }

  static async updateGuest(
    eventId: string,
    guestId: string,
    data: Partial<Omit<InsertRsvpGuestEntity, 'id' | 'eventId' | 'createdAt'>>
  ): Promise<RsvpGuestEntity | null> {
    const db = requireDb();

    // Check if phone is being changed to an existing phone
    if (data.phone) {
      const existing = await this.findGuestByPhone(eventId, data.phone);
      if (existing && existing.id !== guestId) {
        throw new DuplicateRecordError(`An RSVP with phone number '${data.phone}' already exists for this event.`);
      }
    }

    const rows = await db
      .update(schema.rsvpGuests)
      .set(data)
      .where(and(eq(schema.rsvpGuests.eventId, eventId), eq(schema.rsvpGuests.id, guestId)))
      .returning();

    if (rows.length > 0) {
      await this.refreshConfirmedRsvpCount(eventId);
      return rows[0];
    }
    return null;
  }

  static async deleteGuest(eventId: string, guestId: string): Promise<boolean> {
    const db = requireDb();
    const rows = await db
      .delete(schema.rsvpGuests)
      .where(and(eq(schema.rsvpGuests.eventId, eventId), eq(schema.rsvpGuests.id, guestId)))
      .returning({ id: schema.rsvpGuests.id });

    if (rows.length > 0) {
      await this.refreshConfirmedRsvpCount(eventId);
      return true;
    }
    return false;
  }

  private static async refreshConfirmedRsvpCount(eventId: string): Promise<void> {
    const db = requireDb();
    const guests = await db
      .select({ status: schema.rsvpGuests.rsvpStatus, plusOnes: schema.rsvpGuests.plusOnes })
      .from(schema.rsvpGuests)
      .where(eq(schema.rsvpGuests.eventId, eventId));

    const confirmedCount = guests
      .filter((g) => g.status === 'confirmed')
      .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

    await db
      .update(schema.events)
      .set({ confirmedRsvpCount: confirmedCount })
      .where(eq(schema.events.id, eventId));
  }

  // ─── Budget Items ─────────────────────────────────────────────────────────

  static async getBudgetItems(eventId: string): Promise<BudgetItemEntity[]> {
    const db = requireDb();
    return await db
      .select()
      .from(schema.budgetItems)
      .where(eq(schema.budgetItems.eventId, eventId));
  }

  static async getBudgetItem(eventId: string, itemId: string): Promise<BudgetItemEntity | null> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.budgetItems)
      .where(and(eq(schema.budgetItems.eventId, eventId), eq(schema.budgetItems.id, itemId)))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  static async createBudgetItem(itemData: InsertBudgetItemEntity): Promise<BudgetItemEntity> {
    const db = requireDb();
    const event = await this.getEvent(itemData.eventId);
    if (!event) {
      throw new Error(`Event '${itemData.eventId}' not found.`);
    }

    const rows = await db.insert(schema.budgetItems).values(itemData).returning();
    return rows[0];
  }

  static async updateBudgetItem(
    eventId: string,
    itemId: string,
    data: Partial<Omit<InsertBudgetItemEntity, 'id' | 'eventId' | 'createdAt'>>
  ): Promise<BudgetItemEntity | null> {
    const db = requireDb();
    const rows = await db
      .update(schema.budgetItems)
      .set(data)
      .where(and(eq(schema.budgetItems.eventId, eventId), eq(schema.budgetItems.id, itemId)))
      .returning();

    return rows.length > 0 ? rows[0] : null;
  }

  static async deleteBudgetItem(eventId: string, itemId: string): Promise<boolean> {
    const db = requireDb();
    const rows = await db
      .delete(schema.budgetItems)
      .where(and(eq(schema.budgetItems.eventId, eventId), eq(schema.budgetItems.id, itemId)))
      .returning({ id: schema.budgetItems.id });

    return rows.length > 0;
  }

  // ─── Timeline / Run Sheet ─────────────────────────────────────────────────

  static async getTimelineItems(eventId: string): Promise<RunSheetItemEntity[]> {
    const db = requireDb();
    return await db
      .select()
      .from(schema.runSheetItems)
      .where(eq(schema.runSheetItems.eventId, eventId));
  }

  static async getTimelineItem(eventId: string, itemId: string): Promise<RunSheetItemEntity | null> {
    const db = requireDb();
    const rows = await db
      .select()
      .from(schema.runSheetItems)
      .where(and(eq(schema.runSheetItems.eventId, eventId), eq(schema.runSheetItems.id, itemId)))
      .limit(1);

    return rows.length > 0 ? rows[0] : null;
  }

  static async createTimelineItem(itemData: InsertRunSheetItemEntity): Promise<RunSheetItemEntity> {
    const db = requireDb();
    const event = await this.getEvent(itemData.eventId);
    if (!event) {
      throw new Error(`Event '${itemData.eventId}' not found.`);
    }

    const rows = await db.insert(schema.runSheetItems).values(itemData).returning();
    return rows[0];
  }

  static async updateTimelineItem(
    eventId: string,
    itemId: string,
    data: Partial<Omit<InsertRunSheetItemEntity, 'id' | 'eventId' | 'createdAt'>>
  ): Promise<RunSheetItemEntity | null> {
    const db = requireDb();
    const rows = await db
      .update(schema.runSheetItems)
      .set(data)
      .where(and(eq(schema.runSheetItems.eventId, eventId), eq(schema.runSheetItems.id, itemId)))
      .returning();

    return rows.length > 0 ? rows[0] : null;
  }

  static async deleteTimelineItem(eventId: string, itemId: string): Promise<boolean> {
    const db = requireDb();
    const rows = await db
      .delete(schema.runSheetItems)
      .where(and(eq(schema.runSheetItems.eventId, eventId), eq(schema.runSheetItems.id, itemId)))
      .returning({ id: schema.runSheetItems.id });

    return rows.length > 0;
  }
}
