
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Eye, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProposalCardProps {
  id: string;
  clientName: string;
  clientEmail: string;
  finalPrice: number;
  status: string;
  createdAt: string;
  validUntil?: string;
  onStatusChange?: (id: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'aceita':
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendente':
    case 'sent':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejeitada':
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'expirada':
    case 'expired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'draft':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const OptimizedProposalCard: React.FC<ProposalCardProps> = React.memo(({
  id,
  clientName,
  clientEmail,
  finalPrice,
  status,
  createdAt,
  validUntil,
  onStatusChange
}) => {
  const navigate = useNavigate();

  const handleViewProposal = React.useCallback(() => {
    navigate(`/proposal-view/${id}`);
  }, [id, navigate]);

  const statusColorClasses = React.useMemo(() => getStatusColor(status), [status]);
  const formattedPrice = React.useMemo(() => formatCurrency(finalPrice), [finalPrice]);
  const formattedCreatedAt = React.useMemo(() => formatDate(createdAt), [createdAt]);
  const formattedValidUntil = React.useMemo(() => 
    validUntil ? formatDate(validUntil) : null, 
    [validUntil]
  );

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {clientName}
            </CardTitle>
            <CardDescription className="flex items-center text-sm text-gray-600 mt-1">
              <User className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{clientEmail}</span>
            </CardDescription>
          </div>
          <Badge className={`ml-2 text-xs ${statusColorClasses} border`}>
            {status === 'aceita' ? 'Aceita' :
             status === 'pendente' ? 'Pendente' :
             status === 'rejected' ? 'Rejeitada' :
             status === 'expired' ? 'Expirada' :
             status === 'draft' ? 'Rascunho' :
             status === 'sent' ? 'Enviada' :
             status === 'accepted' ? 'Aceita' :
             status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-medium text-gray-900">{formattedPrice}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formattedCreatedAt}</span>
          </div>
        </div>

        {formattedValidUntil && (
          <div className="text-xs text-gray-500">
            Válida até: {formattedValidUntil}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProposal}
            className="flex-1 text-sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            Visualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.id === nextProps.id &&
    prevProps.clientName === nextProps.clientName &&
    prevProps.clientEmail === nextProps.clientEmail &&
    prevProps.finalPrice === nextProps.finalPrice &&
    prevProps.status === nextProps.status &&
    prevProps.createdAt === nextProps.createdAt &&
    prevProps.validUntil === nextProps.validUntil
  );
});

OptimizedProposalCard.displayName = 'OptimizedProposalCard';

export default OptimizedProposalCard;
