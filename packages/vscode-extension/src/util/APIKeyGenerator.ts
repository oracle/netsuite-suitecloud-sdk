import { randomBytes } from 'crypto';

/**
 * Generates a secure random API key.
 * @param length Number of random bytes (default 32 = 64 hex chars).
 * @returns Hex-encoded API key.
 */
// TODO: This code is duplicated. Remove this class from VSCode layer and call the equivalent SuiteCloud-Cli class directly.
export  const generateApiKey = (length = 32): string => {
  return randomBytes(length).toString('hex');
}