// lib/encryption.ts

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
}

// Use Web Crypto (global, no import, Edge-safe)
const key = new TextEncoder().encode(ENCRYPTION_KEY.padEnd(32, ' ')); // 256-bit key

export async function encrypt(value: string): Promise<string> {
  if (!value) return "";

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['encrypt']),
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return "";

  const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      await crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['decrypt']),
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (err: unknown) {
    // Safe error handling: check if it's an Error instance
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[DECRYPT] Failed:', errorMessage);
    return ""; // Return empty string on failure (prevents app crash)
  }
}