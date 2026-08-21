import { describe, it, expect, beforeEach } from 'vitest';

// We test the rate-limiting logic in isolation by replicating the core algorithm.
// This mirrors the exact logic in server.ts so we can unit-test it without
// spinning up an Express server.

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, retryAfter: 0 };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, retryAfter: 0 };
}

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  it('allows the first request', () => {
    const result = rateLimit('192.168.1.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(result.retryAfter).toBe(0);
  });

  it('allows up to RATE_LIMIT_MAX requests', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      const result = rateLimit('10.0.0.1');
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the (MAX+1)th request', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      rateLimit('172.16.0.1');
    }
    const result = rateLimit('172.16.0.1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('tracks different IPs independently', () => {
    // IP A uses all its quota
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      rateLimit('1.1.1.1');
    }
    // IP B should still be allowed
    const result = rateLimit('2.2.2.2');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('resets the window after RATE_LIMIT_WINDOW_MS', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      rateLimit('3.3.3.3');
    }
    expect(rateLimit('3.3.3.3').allowed).toBe(false);

    // Simulate time passing by manually resetting the entry
    const entry = rateLimitMap.get('3.3.3.3')!;
    entry.resetAt = Date.now() - 1; // expire it

    const result = rateLimit('3.3.3.3');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('counts down remaining requests accurately', () => {
    for (let i = 1; i <= RATE_LIMIT_MAX; i++) {
      const result = rateLimit('4.4.4.4');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_MAX - i);
    }
  });

  it('returns a positive retryAfter when blocked', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      rateLimit('5.5.5.5');
    }
    const result = rateLimit('5.5.5.5');
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(60);
  });
});