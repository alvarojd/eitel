import { kv } from '@vercel/kv';

export async function checkRateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 60_000): Promise<boolean> {
  try {
    const key = `rate-limit:${ip}`;
    const windowSeconds = Math.floor(windowMs / 1000);
    
    const currentAttempts = await kv.incr(key);

    if (currentAttempts === 1) {
      await kv.expire(key, windowSeconds);
    }

    if (currentAttempts > maxAttempts) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Vercel KV error, ignorando límite (asegúrate de que KV_REST_API_URL y KV_REST_API_TOKEN estén en .env):', error);
    return true; // Fail-open
  }
}
