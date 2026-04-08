import type { IAuthRepository } from '../../domain/IAuthRepository';

/**
 * Validates the password reset token sent by email.
 * Returns the email associated with the token, or null if invalid/expired.
 */
export class ValidateResetTokenUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(token: string): Promise<string | null> {
    return this.repository.validateResetToken(token);
  }
}
