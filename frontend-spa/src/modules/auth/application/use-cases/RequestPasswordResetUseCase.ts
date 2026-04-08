import type { IAuthRepository } from '../../domain/IAuthRepository';

/**
 * Sends a password reset email to the given address.
 * Returns true if the server accepted the request.
 */
export class RequestPasswordResetUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  /** Returns null on success, or the error message string on failure. */
  async execute(email: string): Promise<string | null> {
    return this.repository.requestPasswordReset(email);
  }
}
