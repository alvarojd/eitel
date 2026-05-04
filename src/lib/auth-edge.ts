// src/lib/auth-edge.ts
// Native implementation of JWT verification for Edge Runtime (No Node.js dependencies)

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required for Edge runtime.');
  }
  return secret;
}

function base64UrlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

export async function verifyJWTEu(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const key = await getCryptoKey(getJwtSecret());
    
    const enc = new TextEncoder();
    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlDecode(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    );

    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
    
    // Check expiration (exp is in seconds, Date.now() in milliseconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error('JWT Edge Verification Error:', err);
    return null;
  }
}
