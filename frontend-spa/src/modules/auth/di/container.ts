import { authRepository }              from '../infrastructure/repositories/auth.repository';
import { tokenStorage }                from '../infrastructure/storage/LocalStorageTokenStorage';
import { LoginUseCase }                from '../application/use-cases/LoginUseCase';
import { LogoutUseCase }               from '../application/use-cases/LogoutUseCase';
import { RequestPasswordResetUseCase } from '../application/use-cases/RequestPasswordResetUseCase';
import { ValidateResetTokenUseCase }   from '../application/use-cases/ValidateResetTokenUseCase';
import { ResetPasswordUseCase }        from '../application/use-cases/ResetPasswordUseCase';

/**
 * Composition root — the only place that wires concrete implementations.
 */
export const loginUseCase                = new LoginUseCase(authRepository, tokenStorage);
export const logoutUseCase               = new LogoutUseCase(authRepository, tokenStorage);
export const requestPasswordResetUseCase = new RequestPasswordResetUseCase(authRepository);
export const validateResetTokenUseCase   = new ValidateResetTokenUseCase(authRepository);
export const resetPasswordUseCase        = new ResetPasswordUseCase(authRepository);
