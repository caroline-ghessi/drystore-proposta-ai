
import { Shield } from 'lucide-react';

const LoginFooter = () => {
  return (
    <div className="text-center mt-12">
      <div className="inline-flex items-center gap-2 text-sm text-drystore-gray-medium bg-white/80 px-6 py-3 rounded-full border border-drystore-gray-light shadow-sm">
        <Shield className="w-4 h-4 text-drystore-orange" />
        <span className="text-drystore-gray-dark">Conexão segura e protegida</span>
      </div>
    </div>
  );
};

export default LoginFooter;
