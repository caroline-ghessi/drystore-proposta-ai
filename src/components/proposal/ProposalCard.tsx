
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Edit, 
  Bot, 
  MessageCircle,
  Brain,
  AlertTriangle
} from 'lucide-react';
import ClientTags from '@/components/clients/ClientTags';
import ProposalStatus from '@/components/proposal/ProposalStatus';

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

interface ProposalCardProps {
  proposal: Proposal;
  onUpdateTags: (proposalId: string, tags: string[]) => void;
  onUpdateStatus: (proposalId: string, status: string) => void;
}

const ProposalCard = ({ proposal, onUpdateTags, onUpdateStatus }: ProposalCardProps) => {
  const navigate = useNavigate();

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getAIScoreLabel = (score: number) => {
    if (score >= 80) return 'Alta';
    if (score >= 60) return 'Média';
    return 'Baixa';
  };

  return (
    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-10 h-10 bg-drystore-blue rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <p className="font-medium text-gray-900">{proposal.number}</p>
              <ProposalStatus 
                currentStatus={proposal.status}
                onStatusChange={(status) => onUpdateStatus(proposal.id, status)}
                editable={true}
              />
              {proposal.hasQuestions && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Dúvidas
                </Badge>
              )}
              {proposal.needsApproval && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Aprovação
                </Badge>
              )}
              {proposal.aiScore && (
                <Badge className={getAIScoreColor(proposal.aiScore)}>
                  <Brain className="w-3 h-3 mr-1" />
                  {getAIScoreLabel(proposal.aiScore)} ({proposal.aiScore}%)
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{proposal.client} - {proposal.project}</p>
            
            <ClientTags
              clientId={proposal.id}
              tags={proposal.clientTags}
              onTagsChange={(tags) => onUpdateTags(proposal.id, tags)}
              editable={true}
            />
            
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Criada: {proposal.date}
              </span>
              <span>Válida até: {proposal.validUntil}</span>
              <span>{proposal.interactionCount} interações</span>
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
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/proposal-view/${proposal.id}?ai=true`)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Bot className="w-4 h-4 mr-1" />
            IA
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/proposal-view/${proposal.id}`)}
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
    </div>
  );
};

export default ProposalCard;
