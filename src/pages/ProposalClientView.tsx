
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useClientProposal } from '@/hooks/useClientProposals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Loader2, FileText, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { getProposalStatusLabel, getProposalStatusColor, formatProposalNumber, isProposalExpired } from '@/utils/clientUtils';
import { useToast } from '@/hooks/use-toast';

const ProposalClientView = () => {
  const { linkAccess } = useParams<{ linkAccess: string }>();
  const { data: proposal, isLoading, error } = useClientProposal(linkAccess || '');
  const { toast } = useToast();

  const handleAcceptProposal = () => {
    toast({
      title: "Proposta aceita!",
      description: "Nossa equipe entrará em contato para os próximos passos.",
    });
  };

  const handleRejectProposal = () => {
    toast({
      title: "Proposta rejeitada",
      description: "Agradecemos sua consideração.",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Carregando proposta...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-gray-600 text-center">
              O link de acesso é inválido ou a proposta não existe mais.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const proposalNumber = formatProposalNumber(proposal.id, proposal.created_at);
  const isExpired = isProposalExpired(proposal.validade);
  const canInteract = proposal.status === 'sent' || proposal.status === 'viewed';

  return (
    <Layout showBackButton={false}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header da Proposta */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  {proposalNumber}
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Para: {proposal.clients.nome} ({proposal.clients.empresa})
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={getProposalStatusColor(proposal.status)}>
                  {getProposalStatusLabel(proposal.status)}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive">
                    <Clock className="w-3 h-3 mr-1" />
                    Expirada
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações da Proposta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {Number(proposal.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Válida até</p>
                  <p className="text-lg font-semibold">
                    {new Date(proposal.validade).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Itens</p>
                  <p className="text-lg font-semibold">
                    {proposal.proposal_items.length} produto(s)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itens da Proposta */}
        <Card>
          <CardHeader>
            <CardTitle>Itens da Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposal.proposal_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.produto_nome}</p>
                          {item.descricao_item && (
                            <p className="text-sm text-gray-500">{item.descricao_item}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{Number(item.quantidade)}</TableCell>
                      <TableCell>
                        R$ {Number(item.preco_unit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {Number(item.preco_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totais */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end space-y-2">
                <div className="text-right">
                  {proposal.desconto_percentual > 0 && (
                    <div className="text-sm text-gray-600">
                      Desconto: {proposal.desconto_percentual}%
                    </div>
                  )}
                  <div className="text-xl font-bold">
                    Total: R$ {Number(proposal.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {proposal.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        {canInteract && !isExpired && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleAcceptProposal}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aceitar Proposta
                </Button>
                <Button
                  onClick={handleRejectProposal}
                  variant="outline"
                  size="lg"
                >
                  Rejeitar Proposta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isExpired && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Proposta Expirada</h3>
              <p className="text-red-600">
                Esta proposta expirou em {new Date(proposal.validade).toLocaleDateString('pt-BR')}.
                Entre em contato conosco para uma nova proposta.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProposalClientView;
