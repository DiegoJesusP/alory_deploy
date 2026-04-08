import { createContext } from "react";
import type { LoginCredentials } from "@/modules/auth/domain/auth.types";

export interface AuthUser {
  username: string;
  full_name: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
