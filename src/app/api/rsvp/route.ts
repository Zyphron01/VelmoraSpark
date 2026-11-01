import { NextResponse } from 'next/server';
import { PublicRsvpSubmissionSchema } from '@/lib/validations/event';
import { EventRepository, DatabaseUnavailableError, DuplicateRecordError } from '@/db/repo';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/rsvp
 * Public RSVP submission endpoint.
 *
 * SECURITY GUARANTEES:
 * 1. Missing events return HTTP 404 and are NEVER automatically provisioned.
 * 2. Rate limiting prevents automated spam and denial-of-service submissions.
 * 3. Never exposes guest registers, attendee lists, or financial data to public callers.
 * 4. Duplicate phone numbers for the same event are rejected with HTTP 409 Conflict.
 * 5. Input data is strictly validated against PublicRsvpSubmissionSchema.
 */
export async function POST(req: Request) {
  try {
    // 1. Rate limiting per client IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`rsvp:${clientIp}`, 10, 60_000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many RSVP requests from this network. Please wait a moment and try again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateCheck.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': String(rateCheck.reset),
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON payload' },
        { status: 400 }
      );
    }

    const parsed = PublicRsvpSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 2. Verify parent event exists. An unauthenticated public RSVP request
    // must NEVER automatically create or provision a missing event.
    const event = await EventRepository.getEvent(data.eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: `Event with id '${data.eventId}' does not exist or is not accepting public RSVPs.`,
        },
        { status: 404 }
      );
    }

    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newGuest = {
      id: guestId,
      eventId: data.eventId,
      name: data.name,
      phone: data.phone,
      dietary: data.dietary,
      accessibilityTags: data.accessibilityTags,
      rsvpStatus: data.rsvpStatus,
      plusOnes: Math.max(0, data.partySize - 1),
      notes: data.notes || '',
    };

    const created = await EventRepository.createGuest(newGuest);

    // 3. Privacy-conscious response: return ONLY the newly created guest's submitted data.
    // Never expose other guests, private organizers keys, or budgets.
    return NextResponse.json(
      {
        success: true,
        message: 'RSVP confirmed and registered successfully',
        rsvp: {
          id: created.id,
          eventId: created.eventId,
          name: created.name,
          rsvpStatus: created.rsvpStatus,
          partySize: created.plusOnes + 1,
          dietary: created.dietary,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof DuplicateRecordError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 409 }
      );
    }

    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database service is currently unavailable.',
        },
        { status: 503 }
      );
    }

    console.error('RSVP API submission error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing your RSVP.',
      },
      { status: 500 }
    );
  }
}
