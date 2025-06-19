
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProposalStats from '@/components/proposal/ProposalStats';
import ProposalFilters from '@/components/proposal/ProposalFilters';
import ProposalListSection from '@/components/proposal/ProposalListSection';

interface Proposal {
  id: string;
  number: string;
  client: string;
  project: string;
  value: number;
  status: string;
  date: string;
  validUntil: string;
  lastUpdate: string;
  clientTags: string[];
  hasQuestions: boolean;
  interactionCount: number;
}

const ProposalManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dados mockados das propostas com novas funcionalidades
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      number: 'PROP-2024-001',
      client: 'João Silva',
      project: 'Residência Moderna',
      value: 48283.75,
      status: 'aguardando_planta',
      date: '2024-01-15',
      validUntil: '2024-01-30',
      lastUpdate: '2024-01-15',
      clientTags: ['Cliente Quente', 'Follow-up'],
      hasQuestions: true,
      interactionCount: 5
    },
    {
      id: '2',
      number: 'PROP-2024-002',
      client: 'Maria Santos',
      project: 'Cobertura Premium',
      value: 78000.00,
      status: 'negociacao',
      date: '2024-01-14',
      validUntil: '2024-01-29',
      lastUpdate: '2024-01-16',
      clientTags: ['Negociação'],
      hasQuestions: false,
      interactionCount: 8
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
      lastUpdate: '2024-01-14',
      clientTags: ['Cliente Frio'],
      hasQuestions: true,
      interactionCount: 3
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
      lastUpdate: '2024-01-12',
      clientTags: [],
      hasQuestions: false,
      interactionCount: 2
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
      lastUpdate: '2024-01-11',
      clientTags: [],
      hasQuestions: false,
      interactionCount: 1
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
      lastUpdate: '2024-01-12',
      clientTags: [],
      hasQuestions: false,
      interactionCount: 4
    }
  ]);

  const updateClientTags = (proposalId: string, tags: string[]) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, clientTags: tags }
        : proposal
    ));
  };

  const updateProposalStatus = (proposalId: string, status: string) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status, lastUpdate: new Date().toISOString().split('T')[0] }
        : proposal
    ));
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
    const abertas = proposals.filter(p => ['aberta', 'aguardando_planta', 'revisao_tecnica', 'negociacao'].includes(p.status)).length;
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
        <ProposalStats stats={stats} />

        {/* Filters */}
        <ProposalFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Proposals List */}
        <ProposalListSection
          proposals={filteredProposals}
          onUpdateTags={updateClientTags}
          onUpdateStatus={updateProposalStatus}
        />
      </div>
    </Layout>
  );
};

export default ProposalManagement;
