
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { generateClientSlug } from '@/utils/clientUtils';
import { ExternalLink, Search } from 'lucide-react';
import { useClients } from '@/hooks/useClients';

const ClientPortalAccess = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();

  const filteredClients = clients?.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleViewClientPortal = (client: any) => {
    const slug = generateClientSlug(client.nome);
    // Abrir em nova aba
    window.open(`/client-portal/${slug}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Acesso ao Portal do Cliente
        </CardTitle>
        <p className="text-sm text-gray-600">
          Visualize o portal de qualquer cliente como administrador
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Carregando clientes...</p>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{client.nome}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  {client.empresa && (
                    <p className="text-xs text-gray-500">{client.empresa}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClientPortal(client)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver Portal
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Digite para buscar clientes'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientPortalAccess;
