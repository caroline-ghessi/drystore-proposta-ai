
import { Shield } from 'lucide-react';

const LoginFooter = () => {
  return (
    <div className="text-center mt-12">
      <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-full">
        <Shield className="w-4 h-4" />
        Conexão segura e protegida
      </div>
    </div>
  );
};

export default LoginFooter;
