
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: string[];
  fallback?: ReactNode;
}

const PermissionGuard = ({ children, requiredRole = [], fallback = null }: PermissionGuardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">Login Necessário</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para acessar esta página.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-900">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-2">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              <strong>Permissão necessária:</strong> {requiredRole.join(' ou ')}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>Seu nível de acesso:</strong> {user.role}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
                Página Anterior
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
