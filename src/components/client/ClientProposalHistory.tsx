
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Calendar, DollarSign } from 'lucide-react';

interface Proposal {
  id: string;
  number: string;
  project: string;
  value: number;
  date: string;
  validUntil: string;
  status: 'aceita' | 'pendente' | 'expirada' | 'rejeitada';
}

interface ClientProposalHistoryProps {
  proposals: Proposal[];
}

const ClientProposalHistory = ({ proposals }: ClientProposalHistoryProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'expirada':
        return 'bg-red-100 text-red-800';
      case 'rejeitada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aceita':
        return 'Aceita';
      case 'pendente':
        return 'Pendente';
      case 'expirada':
        return 'Expirada';
      case 'rejeitada':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Histórico de Propostas ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposta</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">
                      {proposal.number}
                    </TableCell>
                    <TableCell>{proposal.project}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {proposal.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="w-3 h-3" />
                        R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/proposal/${proposal.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma proposta encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientProposalHistory;
