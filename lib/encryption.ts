// lib/encryption.ts

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
}

// TS now sees ENCRYPTION_KEY as string (narrowed by the guard above)
const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY.padEnd(32, ' ')); // 256-bit key

export async function encrypt(value: string): Promise<string> {
  if (!value) return "";

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encoded = new TextEncoder().encode(value);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', true, ['encrypt']),
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encrypted: string): Promise<string> {
  if (!encrypted) return "";

  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    await crypto.subtle.importKey('raw', keyBuffer, 'AES-GCM', true, ['decrypt']),
    encryptedData
  );

  return new TextDecoder().decode(decrypted);
}