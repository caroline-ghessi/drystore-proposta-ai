
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, User } from 'lucide-react';

const ProposalDetails = () => {
  const { linkAccess } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-gray-900">Detalhes da Proposta</CardTitle>
            <CardDescription>
              Visualização detalhada da proposta comercial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Link de Acesso:</strong> {linkAccess}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">Ativa</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Cliente</p>
                  <p className="text-sm text-gray-600">Carregando...</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white border rounded-lg">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Valor</p>
                  <p className="text-sm text-gray-600">R$ 0,00</p>
                </div>
              </div>
            </div>

            <div className="text-center py-8">
              <p className="text-gray-500">
                Esta funcionalidade está em desenvolvimento...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalDetails;
