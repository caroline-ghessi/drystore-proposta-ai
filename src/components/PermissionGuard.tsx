
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: string[];
  fallback?: ReactNode;
}

const PermissionGuard = ({ children, requiredRole = [], fallback = null }: PermissionGuardProps) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
