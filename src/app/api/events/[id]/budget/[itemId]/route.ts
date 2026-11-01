import { NextResponse } from 'next/server';
import { UpdateBudgetItemSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
import { verifyEventAccess } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id, itemId } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateBudgetItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await EventRepository.updateBudgetItem(id, itemId, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: `Budget item '${itemId}' not found for event '${id}'.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: updated,
      message: 'Budget line item updated successfully.',
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] PATCH /api/events/[id]/budget/[itemId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id, itemId } = await context.params;
    const auth = verifyEventAccess(req, id);
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const deleted = await EventRepository.deleteBudgetItem(id, itemId);
    if (!deleted) {
      return NextResponse.json({ error: `Budget item '${itemId}' not found for event '${id}'.` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Budget line item deleted successfully.',
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error('[API] DELETE /api/events/[id]/budget/[itemId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
