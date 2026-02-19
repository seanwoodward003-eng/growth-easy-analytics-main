// lib/encryption.ts

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
}

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

  // Use Buffer.toString('base64') for safer base64
  return Buffer.from(combined).toString('base64');
}

export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return "";

  try {
    // Pre-check: must be valid base64
    if (!/^[A-Za-z0-9+/=]+$/.test(encryptedText.trim())) {
      console.warn('[DECRYPT] Input is not valid base64 - returning empty');
      return "";
    }

    // Use Buffer.from(base64, 'base64') – more reliable than atob in Node/Edge
    const combined = Buffer.from(encryptedText, 'base64');
    const iv = combined.subarray(0, 12);
    const encrypted = combined.subarray(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      await crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['decrypt']),
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('[DECRYPT] Failed:', err.message);
    return ""; // Return empty instead of throwing
  }
}