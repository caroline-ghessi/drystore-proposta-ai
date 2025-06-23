
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao início
      </Link>
      <div className="flex items-center justify-center mb-4">
        <img 
          className="h-16 w-auto" 
          src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png" 
          alt="DryStore" 
        />
      </div>
      <p className="text-gray-600">Acesse sua conta</p>
    </div>
  );
};

export default LoginHeader;
