
import { User, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientData {
  name: string;
  email: string;
  company?: string;
}

interface ClientDataSectionProps {
  clientData: ClientData;
  errors: {[key: string]: string};
  onUpdateClientData: (field: keyof ClientData, value: string) => void;
}

const ClientDataSection = ({ clientData, errors, onUpdateClientData }: ClientDataSectionProps) => {
  return (
    <div className="p-4 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <User className="w-5 h-5 mr-2 text-blue-600" />
        Dados do Cliente *
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client-name">
            Nome do Cliente *
            {errors.name && (
              <span className="text-red-500 text-sm ml-1">({errors.name})</span>
            )}
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="client-name"
              value={clientData.name}
              onChange={(e) => onUpdateClientData('name', e.target.value)}
              className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nome do cliente"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="client-email">
            Email do Cliente *
            {errors.email && (
              <span className="text-red-500 text-sm ml-1">({errors.email})</span>
            )}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="client-email"
              type="email"
              value={clientData.email}
              onChange={(e) => onUpdateClientData('email', e.target.value)}
              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="client-company">Empresa (opcional)</Label>
        <Input
          id="client-company"
          value={clientData.company}
          onChange={(e) => onUpdateClientData('company', e.target.value)}
          placeholder="Nome da empresa"
        />
      </div>
    </div>
  );
};

export default ClientDataSection;
