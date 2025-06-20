
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Phone, Mail, Calendar } from 'lucide-react';
import ClientTags from '@/components/clients/ClientTags';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'ativo' | 'inativo' | 'prospecto';
  tags: string[];
  createdAt: string;
  lastContact?: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      company: 'Silva Construtora',
      status: 'ativo',
      tags: ['Cliente Quente', 'Negociação'],
      createdAt: '2024-01-15',
      lastContact: '2024-06-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      phone: '(11) 88888-8888',
      company: 'Santos Engenharia',
      status: 'prospecto',
      tags: ['Follow-up', 'Aguardando Projeto'],
      createdAt: '2024-02-10',
      lastContact: '2024-06-10'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro.costa@construtora.com',
      phone: '(11) 77777-7777',
      company: 'Costa & Associados',
      status: 'ativo',
      tags: ['Proposta Enviada'],
      createdAt: '2024-03-05',
      lastContact: '2024-06-12'
    }
  ];

  const [clients, setClients] = useState<Client[]>(mockClients);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inativo': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'prospecto': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleTagsChange = (clientId: string, newTags: string[]) => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, tags: newTags } : client
    ));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Clientes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus clientes e prospects</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.filter(c => c.status === 'ativo').length}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Clientes Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.filter(c => c.status === 'prospecto').length}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Prospects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.length}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{client.name}</h3>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    
                    {client.company && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{client.company}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {client.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {client.phone}
                      </div>
                      {client.lastContact && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Último contato: {new Date(client.lastContact).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    <ClientTags
                      clientId={client.id}
                      tags={client.tags}
                      onTagsChange={(tags) => handleTagsChange(client.id, tags)}
                      editable={true}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
