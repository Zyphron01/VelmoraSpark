import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, getClientIp, resetRateLimits } from '@/lib/rate-limit';

describe('Rate Limiter Module (Unit Tests)', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('allows requests within the specified limit', () => {
    const key = 'test:client:1';
    const limit = 5;
    const windowMs = 10_000;

    for (let i = 1; i <= limit; i++) {
      const result = checkRateLimit(key, limit, windowMs);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - i);
    }
  });

  it('blocks requests once the threshold limit is exceeded', () => {
    const key = 'test:client:2';
    const limit = 3;
    const windowMs = 10_000;

    // Use up the quota
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);
    checkRateLimit(key, limit, windowMs);

    // 4th request must be rejected
    const blockedResult = checkRateLimit(key, limit, windowMs);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
    expect(blockedResult.reset).toBeGreaterThan(Date.now());
  });

  it('isolates different client keys independently', () => {
    const keyA = 'test:client:A';
    const keyB = 'test:client:B';
    const limit = 2;
    const windowMs = 10_000;

    checkRateLimit(keyA, limit, windowMs);
    checkRateLimit(keyA, limit, windowMs);
    expect(checkRateLimit(keyA, limit, windowMs).success).toBe(false);

    // Key B should still have full quota
    expect(checkRateLimit(keyB, limit, windowMs).success).toBe(true);
  });

  it('extracts leftmost client IP from x-forwarded-for header', () => {
    const req = new Request('https://velmora.internal/api/rsvp', {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('203.0.113.195');
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('https://velmora.internal/api/rsvp', {
      headers: {
        'x-real-ip': '198.51.100.42',
      },
    });

    const ip = getClientIp(req);
    expect(ip).toBe('198.51.100.42');
  });

  it('defaults to 127.0.0.1 when no proxy headers are present', () => {
    const req = new Request('https://velmora.internal/api/rsvp');
    const ip = getClientIp(req);
    expect(ip).toBe('127.0.0.1');
  });
});

