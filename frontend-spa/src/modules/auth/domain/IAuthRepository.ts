import type { AuthToken } from './AuthToken';

/**
 * Contract for auth data access.
 * Returns domain types — never API/infrastructure shapes.
 */
export interface IAuthRepository {
  login(username: string, password: string): Promise<AuthToken | null>;
  logout(): Promise<void>;
  /** Returns null on success, or the error message string on failure. */
  requestPasswordReset(email: string): Promise<string | null>;
  /** Returns the email associated with the token, or null if invalid/expired. */
  validateResetToken(token: string): Promise<string | null>;
  resetPassword(email: string, password: string, confirmPassword: string): Promise<boolean>;
}
