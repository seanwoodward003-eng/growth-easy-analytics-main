// lib/encryption.ts
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 chars)");
}

export function encrypt(value: string): string {
  if (!value) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decrypt(encrypted: string): string {
  if (!encrypted) return "";
  const [ivHex, encryptedHex, authTagHex] = encrypted.split(":");
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error("Invalid encrypted data format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}