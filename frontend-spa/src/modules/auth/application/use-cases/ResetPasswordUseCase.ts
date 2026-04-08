import type { IAuthRepository } from '../../domain/IAuthRepository';

/**
 * Resets the user's password using the email returned by ValidateResetTokenUseCase.
 */
export class ResetPasswordUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  async execute(email: string, password: string, confirmPassword: string): Promise<boolean> {
    return this.repository.resetPassword(email, password, confirmPassword);
  }
}
