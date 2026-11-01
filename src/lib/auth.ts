import crypto from 'crypto';

export interface AuthContext {
  isAuthorized: boolean;
  role: 'organizer' | 'public';
  eventId?: string;
  error?: string;
}

export class AuthenticationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationConfigurationError';
  }
}

const INSECURE_SECRET_PATTERNS = [
  'velmora-default-secret-salt',
  'velmora-prod-fallback-secret-key-32ch',
  '12345678901234567890123456789012',
  'changeme-changeme-changeme-changeme',
  'your-secret-key-here-must-be-32ch',
];

/**
 * Returns a cryptographically strong server-side secret used for HMAC token derivation.
 *
 * SECURITY INVARIANTS:
 * 1. Requires AUTH_SECRET or ORGANIZER_SECRET to be explicitly configured in the environment.
 * 2. Never falls back to hardcoded defaults or predictable strings (such as DATABASE_URL prefixes).
 * 3. Enforces a minimum length of 32 characters (256-bit entropy recommendation).
 * 4. Fails securely by throwing AuthenticationConfigurationError if the secret is absent or inadequate.
 * 5. Never logs the secret value.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.ORGANIZER_SECRET;

  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new AuthenticationConfigurationError(
      'Authentication configuration error: AUTH_SECRET or ORGANIZER_SECRET environment variable is missing. Organizer token operations require an explicit cryptographically strong secret.'
    );
  }

  const trimmed = secret.trim();

  if (trimmed.length < 32) {
    throw new AuthenticationConfigurationError(
      'Authentication configuration error: AUTH_SECRET does not meet cryptographic strength requirements (minimum 32 characters required).'
    );
  }

  if (INSECURE_SECRET_PATTERNS.some((pattern) => trimmed.toLowerCase().includes(pattern.toLowerCase()))) {
    throw new AuthenticationConfigurationError(
      'Authentication configuration error: AUTH_SECRET uses an insecure default placeholder. Please configure a cryptographically secure random secret.'
    );
  }

  return trimmed;
}

/**
 * Generates a deterministic, cryptographically secure organizer access token for an event.
 * Token is an HMAC-SHA256 signature binding the event ID to the server secret.
 */
export function generateOrganizerToken(eventId: string): string {
  if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
    throw new Error('Cannot generate organizer token for an empty or invalid eventId.');
  }

  const secret = getAuthSecret();
  return crypto.createHmac('sha256', secret).update(`event:organizer:${eventId.trim()}`).digest('hex');
}

/**
 * Extracts bearer token or custom header from request.
 */
export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const keyHeader = req.headers.get('x-organizer-key') || req.headers.get('x-api-key');
  if (keyHeader) {
    return keyHeader.trim();
  }

  return null;
}

/**
 * Verifies if the request is authorized to perform organizer operations on an event.
 *
 * SECURITY GUARANTEES:
 * 1. Rejects requests without proper authorization (HTTP 401).
 * 2. Prohibits global admin key bypasses; legitimate event-scoped organizer ownership must be proven.
 * 3. Uses constant-time comparison (crypto.timingSafeEqual) to prevent timing side-channel attacks.
 * 4. Fails securely when authentication secrets are improperly configured.
 */
export function verifyEventAccess(req: Request, eventId: string): AuthContext {
  const token = extractAuthToken(req);

  if (!token) {
    return {
      isAuthorized: false,
      role: 'public',
      eventId,
      error: 'Missing Authorization header. Expected Bearer <organizerToken> or x-organizer-key.',
    };
  }

  let expectedToken: string;
  try {
    expectedToken = generateOrganizerToken(eventId);
  } catch {
    return {
      isAuthorized: false,
      role: 'public',
      eventId,
      error: 'Server authentication configuration error. Secure operations are temporarily unavailable.',
    };
  }

  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expectedToken);

  if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
    return {
      isAuthorized: true,
      role: 'organizer',
      eventId,
    };
  }

  return {
    isAuthorized: false,
    role: 'public',
    eventId,
    error: 'Invalid authorization token for this event.',
  };
}
