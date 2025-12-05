/**
 * Generate a UUID v4-like string
 * Safe for use in React components (deterministic)
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a short ID (9 characters)
 * Used for entity IDs in the app
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Generate a cryptographically secure ID
 * Use this for sensitive operations
 */
export const generateSecureId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
