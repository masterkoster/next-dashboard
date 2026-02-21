import crypto from 'crypto';
import { prisma } from './auth';

// AES-256-GCM encryption constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes for GCM auth tag
const KEY_LENGTH = 32; // 32 bytes = 256 bits

/**
 * Generate a new 32-byte encryption key as hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - The text to encrypt
 * @param keyHex - 64-character hex string (32 bytes)
 * @returns Base64-encoded string containing IV + auth tag + ciphertext
 */
export function encryptMessage(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Format: base64(iv + authTag + ciphertext)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param ciphertext - Base64-encoded string from encryptMessage
 * @param keyHex - 64-character hex string (32 bytes)
 * @returns Decrypted plaintext
 */
export function decryptMessage(ciphertext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const data = Buffer.from(ciphertext, 'base64');
  
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}

/**
 * Get or create encryption key for a user
 * @param userId - The user's ID
 * @returns The user's encryption key
 */
export async function getUserEncryptionKey(userId: string): Promise<string> {
  const userKey = await prisma.userKey.findUnique({
    where: { userId }
  });
  
  if (userKey) {
    return userKey.encryptionKey;
  }
  
  // Generate new key if none exists
  const newKey = generateEncryptionKey();
  await prisma.userKey.create({
    data: {
      userId,
      encryptionKey: newKey
    }
  });
  
  return newKey;
}

/**
 * Encrypt a message for a specific user
 * @param plaintext - The message to encrypt
 * @param userId - The recipient's user ID
 * @returns Encrypted ciphertext
 */
export async function encryptForUser(plaintext: string, userId: string): Promise<string> {
  const key = await getUserEncryptionKey(userId);
  return encryptMessage(plaintext, key);
}

/**
 * Decrypt a message for a specific user
 * @param ciphertext - The encrypted message
 * @param userId - The user's ID
 * @returns Decrypted plaintext
 */
export async function decryptForUser(ciphertext: string, userId: string): Promise<string> {
  const key = await getUserEncryptionKey(userId);
  return decryptMessage(ciphertext, key);
}

/**
 * Generate encryption key and store for a new user
 * @param userId - The new user's ID
 * @returns The generated encryption key
 */
export async function createUserEncryptionKey(userId: string): Promise<string> {
  const key = generateEncryptionKey();
  await prisma.userKey.create({
    data: {
      userId,
      encryptionKey: key
    }
  });
  return key;
}
