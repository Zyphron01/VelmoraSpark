import { NextResponse } from 'next/server';
import { CreateGuestSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError, DuplicateRecordError } from '@/db/repo';
import { verifyEventAccess } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized. Organizer authorization required to access guest register.' },
        { status: 401 }
      );
    }

    const event = await EventRepository.getEvent(id);
    if (!event) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    const guests = await EventRepository.getGuests(id);
    return NextResponse.json({
      success: true,
      eventId: id,
      guests,
      count: guests.length,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] GET /api/events/[id]/guests error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized. Organizer authorization required to add guests.' },
        { status: 401 }
      );
    }

    const event = await EventRepository.getEvent(id);
    if (!event) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    const body = await req.json();
    const parsed = CreateGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const guestId = parsed.data.id || `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const guestData = {
      ...parsed.data,
      id: guestId,
      eventId: id,
    };

    const created = await EventRepository.createGuest(guestData);
    return NextResponse.json(
      {
        success: true,
        guest: created,
        message: 'Guest added successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DuplicateRecordError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] POST /api/events/[id]/guests error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
