import type { IAuthRepository } from '../../domain/IAuthRepository';
import type { ITokenStorage } from '../../domain/ITokenStorage';
import type { LoginCredentials } from '../../domain/auth.types';

/**
 * Authenticates the user and persists the token.
 * Does not know WHERE the token is stored — that is ITokenStorage's concern.
 */
export class LoginUseCase {
  constructor(
    private readonly repository: IAuthRepository,
    private readonly tokenStorage: ITokenStorage
  ) {}

  async execute(credentials: LoginCredentials): Promise<boolean> {
    const token = await this.repository.login(credentials.username, credentials.password);
    if (token) {
      this.tokenStorage.save(token.value);
      return true;
    }
    return false;
  }
}
