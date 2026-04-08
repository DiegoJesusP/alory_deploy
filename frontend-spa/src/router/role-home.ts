import type { AuthUser } from '@/context/auth-context';

export function getHomePathByRole(_: AuthUser['role']): string {
  return '/dashboard';
}