import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes for auth tag

function getSecretKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || "default-32-byte-secret-key-ecodigitech-pos";
  // Derive a consistent 32-byte key using SHA-256 hash
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * @param text - The plaintext string to encrypt.
 * @returns Hex formatted string containing `iv:authTag:cipherText`.
 */
export function encrypt(text: string): string {
  if (!text) return "";
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string formatted as `iv:authTag:cipherText`.
 * @param cipherText - The encrypted string formatted as `iv:authTag:cipherText`.
 * @returns The original decrypted plaintext string.
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return "";
  const parts = cipherText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid cipher text format. Expected 'iv:authTag:encryptedData'.");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getSecretKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
