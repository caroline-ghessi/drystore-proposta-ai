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
  aiScore?: number;
  needsApproval?: boolean;
}

const ProposalManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Enhanced mock data with AI scores and approval flags
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
      interactionCount: 5,
      aiScore: 82,
      needsApproval: false
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
      interactionCount: 8,
      aiScore: 65,
      needsApproval: false
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
      interactionCount: 3,
      aiScore: 45,
      needsApproval: false
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
      interactionCount: 2,
      aiScore: 38,
      needsApproval: false
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
      interactionCount: 1,
      aiScore: 72,
      needsApproval: false
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
      interactionCount: 4,
      aiScore: 88,
      needsApproval: false
    },
    {
      id: '7',
      number: 'PROP-2024-007',
      client: 'Construtora ABC',
      project: 'Galpão Industrial 2000m²',
      value: 350000.00,
      status: 'aguardando_aprovacao',
      date: '2024-01-09',
      validUntil: '2024-01-24',
      lastUpdate: '2024-01-09',
      clientTags: ['Grande Cliente'],
      hasQuestions: false,
      interactionCount: 2,
      aiScore: 75,
      needsApproval: true
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
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button 
              onClick={() => navigate('/approvals')}
              variant="outline"
              size="lg"
            >
              Aprovações Pendentes
            </Button>
            <Button 
              onClick={() => navigate('/create-proposal')}
              className="gradient-bg hover:opacity-90"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Proposta
            </Button>
          </div>
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
