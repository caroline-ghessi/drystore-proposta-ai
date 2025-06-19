
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Edit,
  Plus,
  Calendar,
  DollarSign
} from 'lucide-react';

const ProposalManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dados mockados das propostas
  const proposals = [
    {
      id: '1',
      number: 'PROP-2024-001',
      client: 'João Silva',
      project: 'Residência Moderna',
      value: 48283.75,
      status: 'aberta',
      date: '2024-01-15',
      validUntil: '2024-01-30',
      lastUpdate: '2024-01-15'
    },
    {
      id: '2',
      number: 'PROP-2024-002',
      client: 'Maria Santos',
      project: 'Cobertura Premium',
      value: 78000.00,
      status: 'aceita',
      date: '2024-01-14',
      validUntil: '2024-01-29',
      lastUpdate: '2024-01-16'
    },
    {
      id: '3',
      number: 'PROP-2024-003',
      client: 'Carlos Oliveira',
      project: 'Casa de Campo',
      value: 32000.00,
      status: 'negada',
      date: '2024-01-13',
      validUntil: '2024-01-28',
      lastUpdate: '2024-01-14'
    },
    {
      id: '4',
      number: 'PROP-2024-004',
      client: 'Ana Costa',
      project: 'Apartamento Duplex',
      value: 56000.00,
      status: 'expirada',
      date: '2024-01-12',
      validUntil: '2024-01-27',
      lastUpdate: '2024-01-12'
    },
    {
      id: '5',
      number: 'PROP-2024-005',
      client: 'Pedro Alves',
      project: 'Galpão Industrial',
      value: 125000.00,
      status: 'aberta',
      date: '2024-01-11',
      validUntil: '2024-01-26',
      lastUpdate: '2024-01-11'
    },
    {
      id: '6',
      number: 'PROP-2024-006',
      client: 'Lucia Ferreira',
      project: 'Reforma Comercial',
      value: 45000.00,
      status: 'aceita',
      date: '2024-01-10',
      validUntil: '2024-01-25',
      lastUpdate: '2024-01-12'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberta: { label: 'Em Aberto', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      aceita: { label: 'Aceita', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      negada: { label: 'Negada', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      expirada: { label: 'Expirada', variant: 'outline' as const, icon: AlertCircle, color: 'text-gray-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = proposals.length;
    const abertas = proposals.filter(p => p.status === 'aberta').length;
    const aceitas = proposals.filter(p => p.status === 'aceita').length;
    const valorTotal = proposals
      .filter(p => p.status === 'aceita')
      .reduce((sum, p) => sum + p.value, 0);
    
    return { total, abertas, aceitas, valorTotal };
  };

  const stats = getStats();

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Propostas
            </h1>
            <p className="text-gray-600">
              Acompanhe o status e gerencie suas propostas comerciais
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create-proposal')}
            className="gradient-bg hover:opacity-90 mt-4 sm:mt-0"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Em Aberto</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.abertas}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Aceitas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aceitas}</p>
                </div>
                <div className="p-3 rounded-full bg-green-50 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor Fechado</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {stats.valorTotal.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, projeto ou número..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="aberta">Em Aberto</SelectItem>
                  <SelectItem value="aceita">Aceitas</SelectItem>
                  <SelectItem value="negada">Negadas</SelectItem>
                  <SelectItem value="expirada">Expiradas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Propostas ({filteredProposals.length})</CardTitle>
            <CardDescription>
              Lista de todas as propostas com seus respectivos status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => (
                  <div 
                    key={proposal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-drystore-blue rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-medium text-gray-900">{proposal.number}</p>
                          {getStatusBadge(proposal.status)}
                        </div>
                        <p className="text-sm text-gray-600">{proposal.client} - {proposal.project}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Criada: {proposal.date}
                          </span>
                          <span>Válida até: {proposal.validUntil}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Atualizada: {proposal.lastUpdate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/proposal/${proposal.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/edit-proposal/${proposal.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Nenhuma proposta encontrada com os filtros aplicados'
                      : 'Nenhuma proposta criada ainda'
                    }
                  </p>
                  <Button 
                    onClick={() => navigate('/create-proposal')}
                    className="gradient-bg hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Proposta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProposalManagement;
