import { NextResponse } from 'next/server';
import { CreateTimelineItemSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
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
        { error: auth.error || 'Unauthorized. Organizer authorization required to access timeline.' },
        { status: 401 }
      );
    }

    const event = await EventRepository.getEvent(id);
    if (!event) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    const items = await EventRepository.getTimelineItems(id);
    return NextResponse.json({
      success: true,
      eventId: id,
      timeline: items,
      count: items.length,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] GET /api/events/[id]/timeline error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized. Organizer authorization required to create timeline items.' },
        { status: 401 }
      );
    }

    const event = await EventRepository.getEvent(id);
    if (!event) {
      return NextResponse.json({ error: `Event with id '${id}' not found.` }, { status: 404 });
    }

    const body = await req.json();
    const parsed = CreateTimelineItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const itemId = parsed.data.id || `timeline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const itemData = {
      ...parsed.data,
      id: itemId,
      eventId: id,
      currentTime: parsed.data.currentTime || parsed.data.baseTime,
    };

    const created = await EventRepository.createTimelineItem(itemData);
    return NextResponse.json(
      {
        success: true,
        item: created,
        message: 'Timeline item added successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] POST /api/events/[id]/timeline error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
