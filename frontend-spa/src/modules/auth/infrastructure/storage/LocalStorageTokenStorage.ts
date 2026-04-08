import type { ITokenStorage } from '../../domain/ITokenStorage';

const ACCESS_TOKEN_KEY = 'auth:access_token:v1';

/**
 * Concrete implementation of ITokenStorage using the browser's localStorage.
 * This is the only file in the codebase that knows about localStorage and the key name.
 *
 * Reads are cached in memory to avoid repeated synchronous localStorage calls
 * (the request interceptor calls get() on every outgoing request).
 * The cache is kept in sync on every save() and clear().
 */

// undefined = not yet read; null = explicitly cleared or absent
let cached: string | null | undefined = undefined;

export class LocalStorageTokenStorage implements ITokenStorage {
  save(token: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      cached = token;
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, disabled)
    }
  }

  get(): string | null {
    if (cached === undefined) {
      try {
        cached = localStorage.getItem(ACCESS_TOKEN_KEY);
      } catch {
        cached = null;
      }
    }
    return cached;
  }

  clear(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // localStorage unavailable
    }
    cached = null;
  }
}

/**
 * Singleton instance shared by the DI container and the HTTP gateway.
 */
export const tokenStorage = new LocalStorageTokenStorage();
