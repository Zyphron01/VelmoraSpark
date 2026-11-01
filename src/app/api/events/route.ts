import { NextResponse } from 'next/server';
import { CreateEventSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError, DuplicateRecordError } from '@/db/repo';
import { generateOrganizerToken, AuthenticationConfigurationError } from '@/lib/auth';
import { getDb } from '@/db';

export async function GET() {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database service is unavailable.' },
        { status: 503 }
      );
    }

    const events = await EventRepository.listEvents();
    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] GET /api/events error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database service is unavailable.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = CreateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const eventId = parsed.data.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const eventData = {
      ...parsed.data,
      id: eventId,
      confirmedRsvpCount: 0,
    };

    const createdEvent = await EventRepository.createEvent(eventData);
    const organizerKey = generateOrganizerToken(createdEvent.id);

    return NextResponse.json(
      {
        success: true,
        event: createdEvent,
        organizerKey,
        message: 'Event created successfully. Store your organizerKey safely for authenticated operations.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DuplicateRecordError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof AuthenticationConfigurationError) {
      return NextResponse.json(
        { error: 'Server authentication configuration error. Secure operations are temporarily unavailable.' },
        { status: 500 }
      );
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] POST /api/events error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

