import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { getHomePathByRole } from '@/router/role-home';

interface Props {
  children: JSX.Element;
  /** If provided, only these roles can access the route. */
  allowedRoles?: Array<'ADMIN' | 'EMPLOYEE'>;
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return children;
}
