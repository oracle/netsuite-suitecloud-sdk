import { randomBytes } from 'crypto';

/**
 * Generates a secure random API key.
 * @param length Number of random bytes (default 32 = 64 hex chars).
 * @returns Hex-encoded API key.
 */
export  const generateApiKey = (length = 32): string => {
  return randomBytes(length).toString('hex');
}