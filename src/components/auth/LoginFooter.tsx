
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const LoginFooter = () => {
  return (
    <div className="mt-6 text-center space-y-4">
      <p className="text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
          Cadastre-se
        </Link>
      </p>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Para testar a plataforma:</p>
        <p className="text-xs text-gray-500">
          • Use qualquer email válido<br/>
          • Senha deve ter 8+ caracteres<br/>
          • Exemplo: vendedor@drystore.com
        </p>
      </div>

      <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        Conexão segura e protegida
      </div>
    </div>
  );
};

export default LoginFooter;
