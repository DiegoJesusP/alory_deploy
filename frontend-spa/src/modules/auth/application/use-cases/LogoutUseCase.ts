import type { IAuthRepository } from '../../domain/IAuthRepository';
import type { ITokenStorage } from '../../domain/ITokenStorage';

/**
 * Revokes the session on the server and clears the local token.
 */
export class LogoutUseCase {
  constructor(
    private readonly repository: IAuthRepository,
    private readonly tokenStorage: ITokenStorage
  ) {}

  async execute(): Promise<void> {
    await this.repository.logout();
    this.tokenStorage.clear();
  }
}
