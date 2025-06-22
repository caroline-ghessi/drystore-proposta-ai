
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';

interface UserTypeInfoProps {
  selectedRole: string;
}

export const UserTypeInfo = ({ selectedRole }: UserTypeInfoProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Tipos de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Vendedor Interno</h4>
            <p className="text-sm text-blue-700">Funcionário da empresa com acesso completo ao sistema de vendas.</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">Representante</h4>
            <p className="text-sm text-purple-700">Vendedor externo com acesso específico ao seu território.</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Administrador
            </h4>
            <p className="text-sm text-red-700">Acesso total ao sistema, incluindo gestão de usuários e configurações.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Acesso ao sistema de propostas</li>
            <li>• Gerenciamento de clientes</li>
            <li>• Relatórios de vendas</li>
            <li>• CRM e follow-ups</li>
            <li>• Agenda inteligente</li>
            {selectedRole === 'admin' && (
              <>
                <li className="text-red-600 font-medium">• Gestão de usuários</li>
                <li className="text-red-600 font-medium">• Configurações do sistema</li>
                <li className="text-red-600 font-medium">• Acesso a todos os dados</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
