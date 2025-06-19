
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import ProposalCard from './ProposalCard';

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

interface ProposalListSectionProps {
  proposals: Proposal[];
  onUpdateTags: (proposalId: string, tags: string[]) => void;
  onUpdateStatus: (proposalId: string, status: string) => void;
}

const ProposalListSection = ({ proposals, onUpdateTags, onUpdateStatus }: ProposalListSectionProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Propostas ({proposals.length})</CardTitle>
        <CardDescription>
          Lista de todas as propostas com seus respectivos status e tags
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proposals.length > 0 ? (
            proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onUpdateTags={onUpdateTags}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Nenhuma proposta encontrada com os filtros aplicados
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
  );
};

export default ProposalListSection;
