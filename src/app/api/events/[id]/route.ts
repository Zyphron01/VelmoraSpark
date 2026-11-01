import { NextResponse } from 'next/server';
import { UpdateEventSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
import { verifyEventAccess } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const event = await EventRepository.getEvent(id);

    if (!event) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    const auth = verifyEventAccess(req, id);

    // Redact confidential financial figures for unauthenticated/public visitors
    const sanitizedEvent = auth.isAuthorized
      ? event
      : {
          ...event,
          totalBudget: undefined,
          contingencyReservePercent: undefined,
        };

    return NextResponse.json({
      success: true,
      event: sanitizedEvent,
      isOrganizer: auth.isAuthorized,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] GET /api/events/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await EventRepository.updateEvent(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: updated,
      message: 'Event updated successfully.',
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] PATCH /api/events/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const deleted = await EventRepository.deleteEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event and all associated records deleted successfully.',
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] DELETE /api/events/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
