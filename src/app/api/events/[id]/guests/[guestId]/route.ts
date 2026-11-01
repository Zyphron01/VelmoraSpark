import { NextResponse } from 'next/server';
import { UpdateGuestSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError, DuplicateRecordError } from '@/db/repo';
import { verifyEventAccess } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; guestId: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id, guestId } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await EventRepository.updateGuest(id, guestId, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: `Guest '${guestId}' not found for event '${id}'.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      guest: updated,
      message: 'Guest record updated successfully.',
    });
  } catch (err) {
    if (err instanceof DuplicateRecordError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] PATCH /api/events/[id]/guests/[guestId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id, guestId } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const deleted = await EventRepository.deleteGuest(id, guestId);
    if (!deleted) {
      return NextResponse.json({ error: `Guest '${guestId}' not found for event '${id}'.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Guest record deleted successfully.',
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] DELETE /api/events/[id]/guests/[guestId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
