// ─────────────────────────────────────────────────────────────────
// Memory Rate Limiter Engine — Protection against brute-force & API abuse
// ─────────────────────────────────────────────────────────────────

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  key: string;
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit({ key, maxRequests, windowMs }: RateLimitOptions): {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInMs: record.resetAt - now };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetInMs: record.resetAt - now,
  };
}
