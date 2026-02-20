type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

// Minimal in-memory rate limiter.
// Note: In serverless environments this is best-effort only.
const buckets = new Map<string, number[]>();

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const start = now - windowMs;

  const existing = buckets.get(key) || [];
  const recent = existing.filter((ts) => ts > start);

  const ok = recent.length < limit;
  if (ok) recent.push(now);
  buckets.set(key, recent);

  const oldest = recent.length ? Math.min(...recent) : now;
  const resetAt = oldest + windowMs;

  return {
    ok,
    remaining: Math.max(0, limit - recent.length),
    resetAt,
  };
}
