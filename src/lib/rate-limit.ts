const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

export function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 60_000): boolean {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) return false;

  entry.count++;
  return true;
}
