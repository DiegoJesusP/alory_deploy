import type { AuthUser } from '@/context/auth-context';

export function getHomePathByRole(role: AuthUser['role']): string {
  return '/dashboard';
}
