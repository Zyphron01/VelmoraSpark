import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateOrganizerToken, AuthenticationConfigurationError } from '@/lib/auth';
import { EventRepository, DatabaseUnavailableError } from '@/db/repo';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/events/[id]/auth
 * Authenticates an organizer by verifying proof of legitimate event ownership.
 *
 * SECURITY GUARANTEES:
 * 1. An event ID alone NEVER grants organizer access.
 * 2. Unrestricted global admin bypasses are completely eliminated.
 * 3. Rate limiting defends against credential brute-forcing.
 * 4. Timing-safe comparison prevents side-channel timing attacks.
 * 5. Fails securely if database or authentication secret is unavailable.
 */
export async function POST(req: Request, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;

    // 1. Rate-limiting check per client IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`auth:${clientIp}:${eventId}`, 5, 60_000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again shortly.' },
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

    const body = await req.json().catch(() => ({}));

    // 2. Extract organizer proof (no admin bypass accepted)
    const providedCredential = body.credential || body.organizerKey || body.passcode;

    if (!providedCredential || typeof providedCredential !== 'string' || providedCredential.trim().length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized. Legitimate organizer credential required.' },
        { status: 401 }
      );
    }

    // 3. Verify event exists in repository
    const event = await EventRepository.getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: `Event with id '${eventId}' not found.` },
        { status: 404 }
      );
    }

    // 4. Validate organizer token using constant-time comparison
    const credentialStr = providedCredential.trim();
    const credBuf = Buffer.from(credentialStr);

    const expectedToken = generateOrganizerToken(eventId);
    const expectedBuf = Buffer.from(expectedToken);

    if (credBuf.length === expectedBuf.length && crypto.timingSafeEqual(credBuf, expectedBuf)) {
      return NextResponse.json({
        success: true,
        eventId,
        organizerKey: expectedToken,
      });
    }

    // Reject any unauthorized attempt
    return NextResponse.json(
      { error: 'Invalid organizer credentials.' },
      { status: 401 }
    );
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof AuthenticationConfigurationError) {
      return NextResponse.json(
        { error: 'Server authentication configuration error. Secure operations are temporarily unavailable.' },
        { status: 500 }
      );
    }
    console.error('[API] POST /api/events/[id]/auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
