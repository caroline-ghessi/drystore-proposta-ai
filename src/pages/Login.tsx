
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import LoginFooter from '@/components/auth/LoginFooter';
import { useLoginLogic } from '@/hooks/useLoginLogic';

const Login = () => {
  const { error, loading, loginStep, handleSubmit } = useLoginLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader />

        <Card className="shadow-2xl border-0 animate-fade-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm 
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              loginStep={loginStep}
            />
            
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                Esqueceu a senha?
              </Link>
            </div>

            <LoginFooter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
