import { useState } from 'react';
import type { ReactNode } from "react";
import type { LoginCredentials } from '@/modules/auth/domain/auth.types';
import { loginUseCase, logoutUseCase } from '@/modules/auth/di/container';
import { tokenStorage } from '@/modules/auth/infrastructure/storage/LocalStorageTokenStorage';
import { AuthContext } from "./auth-context";
import type { AuthUser } from "./auth-context";

function decodeToken(token: string): AuthUser | null {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(raw)) as Record<string, unknown>;
    if (payload.type !== 'access') return null;
    if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) return null;
    return {
      username: payload.sub as string,
      full_name: payload.full_name as string,
      role: payload.role as 'ADMIN' | 'EMPLOYEE',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = tokenStorage.get();
    return token ? decodeToken(token) : null;
  });

  const login = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
    const success = await loginUseCase.execute(credentials);
    if (success) {
      const token = tokenStorage.get();
      const nextUser = token ? decodeToken(token) : null;
      setUser(nextUser);
      return nextUser;
    }
    return null;
  };

  const logout = async (): Promise<void> => {
    await logoutUseCase.execute();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
