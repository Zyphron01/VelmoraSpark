import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAuthSecret,
  generateOrganizerToken,
  verifyEventAccess,
  AuthenticationConfigurationError,
} from '@/lib/auth';

/**
 * Unit Test Suite: Authentication Secrets, Strength Invariants & Organizer Proof
 */
describe('Authentication Secrets & Cryptographic Strength Verification (Unit Tests)', () => {
  const originalAuthSecret = process.env.AUTH_SECRET;
  const originalOrganizerSecret = process.env.ORGANIZER_SECRET;
  const originalAdminKey = process.env.ADMIN_API_KEY;

  beforeEach(() => {
    // Set a known synthetic valid secret for baseline tests
    process.env.AUTH_SECRET = 'a_synthetic_strong_test_secret_key_at_least_32_chars_long';
    delete process.env.ORGANIZER_SECRET;
    delete process.env.ADMIN_API_KEY;
  });

  afterEach(() => {
    process.env.AUTH_SECRET = originalAuthSecret;
    process.env.ORGANIZER_SECRET = originalOrganizerSecret;
    process.env.ADMIN_API_KEY = originalAdminKey;
  });

  describe('Task 1: Secret Verification & Cryptographic Strength', () => {
    it('fails securely when AUTH_SECRET and ORGANIZER_SECRET are completely absent', () => {
      delete process.env.AUTH_SECRET;
      delete process.env.ORGANIZER_SECRET;

      expect(() => getAuthSecret()).toThrow(AuthenticationConfigurationError);
      expect(() => generateOrganizerToken('event-123')).toThrow(AuthenticationConfigurationError);
    });

    it('fails securely when secret is empty string or only whitespace', () => {
      process.env.AUTH_SECRET = '   ';
      expect(() => getAuthSecret()).toThrow(AuthenticationConfigurationError);
    });

    it('fails securely when secret is inadequate (< 32 characters)', () => {
      process.env.AUTH_SECRET = 'too-short-secret';
      expect(() => getAuthSecret()).toThrow(AuthenticationConfigurationError);
      expect(() => getAuthSecret()).toThrow(/minimum 32 characters/);
    });

    it('fails securely when secret matches known insecure default placeholders', () => {
      process.env.AUTH_SECRET = 'velmora-default-secret-salt-1234567890';
      expect(() => getAuthSecret()).toThrow(AuthenticationConfigurationError);
      expect(() => getAuthSecret()).toThrow(/insecure default placeholder/);

      process.env.AUTH_SECRET = 'velmora-prod-fallback-secret-key-32ch';
      expect(() => getAuthSecret()).toThrow(AuthenticationConfigurationError);
    });

    it('succeeds when a strong secret (>= 32 chars) is provided', () => {
      process.env.AUTH_SECRET = 'c0ff33_c0ff33_c0ff33_c0ff33_c0ff33_c0ff33_c0ff33_c0ff33';
      const secret = getAuthSecret();
      expect(secret.length).toBeGreaterThanOrEqual(32);
      expect(typeof secret).toBe('string');
    });

    it('generates deterministic SHA-256 HMAC organizer tokens without logging or predictability', () => {
      const token1 = generateOrganizerToken('event-wedding-2026');
      const token2 = generateOrganizerToken('event-wedding-2026');
      const tokenDiff = generateOrganizerToken('event-birthday-2026');

      expect(token1).toHaveLength(64);
      expect(token1).toEqual(token2);
      expect(token1).not.toEqual(tokenDiff);
    });

    it('fails securely in verifyEventAccess when auth secret is missing', () => {
      delete process.env.AUTH_SECRET;
      delete process.env.ORGANIZER_SECRET;

      const req = new Request('https://velmora.internal/api/events/1', {
        headers: { authorization: 'Bearer some-token' },
      });

      const auth = verifyEventAccess(req, 'event-1');
      expect(auth.isAuthorized).toBe(false);
      expect(auth.role).toBe('public');
      expect(auth.error).toContain('configuration error');
    });
  });

  describe('Task 2: Admin Access & Legitimate Ownership Verification', () => {
    it('prohibits admin credentials from acting as an unrestricted event ownership bypass', () => {
      // Even if ADMIN_API_KEY is configured in the environment:
      process.env.ADMIN_API_KEY = 'super-secret-admin-master-key-xyz';

      const eventId = 'event-target-isolated-1';
      const req = new Request(`https://velmora.internal/api/events/${eventId}`, {
        headers: {
          authorization: 'Bearer super-secret-admin-master-key-xyz',
        },
      });

      // verifyEventAccess MUST reject the admin master key when accessing a specific event
      // Legitimate event-scoped organizer ownership must be proven!
      const auth = verifyEventAccess(req, eventId);
      expect(auth.isAuthorized).toBe(false);
      expect(auth.role).toBe('public');
      expect(auth.error).toContain('Invalid authorization token');
    });

    it('allows organizers demonstrating legitimate proof of event ownership to be authorized', () => {
      const eventId = 'event-target-legit-2';
      const legitToken = generateOrganizerToken(eventId);

      const req = new Request(`https://velmora.internal/api/events/${eventId}`, {
        headers: {
          authorization: `Bearer ${legitToken}`,
        },
      });

      const auth = verifyEventAccess(req, eventId);
      expect(auth.isAuthorized).toBe(true);
      expect(auth.role).toBe('organizer');
      expect(auth.eventId).toBe(eventId);
    });

    it('enforces event isolation: organizer token for Event A cannot access Event B', () => {
      const tokenA = generateOrganizerToken('event-A');

      const req = new Request('https://velmora.internal/api/events/event-B', {
        headers: {
          authorization: `Bearer ${tokenA}`,
        },
      });

      const auth = verifyEventAccess(req, 'event-B');
      expect(auth.isAuthorized).toBe(false);
      expect(auth.role).toBe('public');
    });
  });
});

