
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Calendar, DollarSign } from 'lucide-react';
import { getProposalStatusColor, getProposalStatusLabel } from '@/utils/clientUtils';

interface Proposal {
  id: string;
  number: string;
  project: string;
  value: number;
  date: string;
  validUntil?: string;
  status: 'aceita' | 'pendente' | 'expirada' | 'rejeitada' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
}

interface ClientProposalHistoryProps {
  proposals: Proposal[];
  title?: string;
}

const ClientProposalHistory = ({ proposals, title = "Histórico de Propostas" }: ClientProposalHistoryProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title} ({proposals.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposta</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validade</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {proposal.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      {proposal.validUntil && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {proposal.validUntil}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="w-3 h-3" />
                        R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProposalStatusColor(proposal.status)}>
                        {getProposalStatusLabel(proposal.status)}
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
