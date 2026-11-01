import { NextRequest, NextResponse } from 'next/server';
import { verifyEventAccess } from '@/lib/auth';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
import { StakeholderVoteSubmissionSchema } from '@/lib/validations/event';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/events/[id]/votes
 * Protected endpoint to retrieve stakeholder votes for an event.
 *
 * NOTE: The 'stakeholder_votes' table is defined in code and generated in
 * `drizzle/0000_clever_abomination.sql`, but has NOT been applied to Neon DB yet
 * per the rule against automatic destructive/unapproved migrations.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { id: eventId } = await context.params;

  const auth = verifyEventAccess(request, eventId);
  if (!auth.isAuthorized) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const event = await EventRepository.getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Since the table is awaiting user migration approval, return explicit status
    return NextResponse.json(
      {
        message: 'Stakeholder votes feature is awaiting database migration.',
        migrationPending: true,
        migrationFile: 'drizzle/0000_clever_abomination.sql',
        table: 'stakeholder_votes',
        votes: [],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error while fetching votes.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/votes
 * Record a stakeholder vote on an event plan option.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const { id: eventId } = await context.params;

  try {
    const rawBody = await request.json();
    const parseResult = StakeholderVoteSubmissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { suggestionId, voterName, stakeholderRole, vote, comments } = parseResult.data;

    // Check if parent event exists
    const event = await EventRepository.getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Parent event not found' },
        { status: 404 }
      );
    }

    // Table pending migration approval
    return NextResponse.json(
      {
        error: 'Database migration required: stakeholder_votes table has not been created yet in the database.',
        migrationPending: true,
        migrationFile: 'drizzle/0000_clever_abomination.sql',
        submittedVote: {
          eventId,
          suggestionId,
          voterName,
          stakeholderRole,
          vote,
          comments,
        },
      },
      { status: 501 }
    );
  } catch (err: unknown) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error processing vote submission.' },
      { status: 500 }
    );
  }
}
