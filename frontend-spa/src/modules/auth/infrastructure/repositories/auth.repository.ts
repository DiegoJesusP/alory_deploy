import { handleRequest } from '../../../../infrastructure/http/http-client.gateway';
import type { IAuthRepository } from '../../domain/IAuthRepository';
import { AuthToken } from '../../domain/AuthToken';

const BASE = '/auth';

/**
 * Maps raw HTTP responses into domain types.
 * Nothing outside this file knows about ApiResponse or HTTP field names.
 */
export const authRepository: IAuthRepository = {
  async login(username, password) {
    const res = await handleRequest<{ access_token: string }>('post', `${BASE}/login`, { username, password });
    return res.type === 'SUCCESS' && res.result?.access_token
      ? new AuthToken(res.result.access_token)
      : null;
  },

  async logout() {
    await handleRequest('post', `${BASE}/logout`);
  },

  async requestPasswordReset(email) {
    const res = await handleRequest('post', `${BASE}/password-reset/request`, { email });
    return res.type === 'SUCCESS' ? null : (res.text ?? 'Ocurrió un error al enviar el código.');
  },

  async validateResetToken(token) {
    const res = await handleRequest<{ email: string }>('post', `${BASE}/password-reset/validate`, { token });
    return res.type === 'SUCCESS' && res.result?.email ? res.result.email : null;
  },

  async resetPassword(email, password, confirmPassword) {
    const res = await handleRequest('post', `${BASE}/password-reset/confirm`, { email, password, confirmPassword });
    return res.type === 'SUCCESS';
  },
};
