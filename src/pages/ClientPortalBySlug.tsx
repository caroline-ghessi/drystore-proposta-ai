
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ClientProposalHistory from '@/components/client/ClientProposalHistory';
import { useClientProposals } from '@/hooks/useClientProposals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Mail } from 'lucide-react';
import { getClientNameFromSlug } from '@/utils/clientUtils';
import { useToast } from '@/hooks/use-toast';

const ClientPortalBySlug = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const clientName = clientSlug ? getClientNameFromSlug(clientSlug) : '';

  const { data: clientData, isLoading: isLoadingData, error } = useClientProposals(
    isAuthenticated ? email : ''
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setIsAuthenticated(true);
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Portal do Cliente
              </h1>
              <p className="text-gray-600">
                Olá <strong>{clientName}</strong>, confirme seu email para acessar suas propostas
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Acessar Propostas'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingData || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Carregando suas propostas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Email não encontrado</h2>
            <p className="text-gray-600 text-center mb-6">
              Este email não possui propostas em nosso sistema.
            </p>
            <Button onClick={() => setIsAuthenticated(false)}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { client, proposals } = clientData;

  // Processar propostas
  const processedProposals = proposals.map(proposal => ({
    id: proposal.id,
    number: `PROP-${proposal.id.substring(0, 8)}`,
    project: `Proposta ${proposal.id.substring(0, 8)}`,
    value: Number(proposal.valor_total),
    date: new Date(proposal.created_at).toLocaleDateString('pt-BR'),
    validUntil: new Date(proposal.validade).toLocaleDateString('pt-BR'),
    status: new Date(proposal.validade) < new Date() ? 'expirada' : proposal.status
  }));

  // Separar propostas ativas e expiradas
  const activeProposals = processedProposals.filter(proposal => 
    proposal.status !== 'expirada' && new Date(proposal.validUntil.split('/').reverse().join('-')) >= new Date()
  );
  const expiredProposals = processedProposals.filter(proposal => 
    proposal.status === 'expirada' || new Date(proposal.validUntil.split('/').reverse().join('-')) < new Date()
  );

  return (
    <Layout showBackButton={false}>
      <div className="animate-fade-in space-y-6">
        {/* Header do Cliente */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {client.nome}!
          </h1>
          <p className="text-gray-600">
            Aqui você pode visualizar todas as suas propostas
          </p>
        </div>

        {/* Dashboard Simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {activeProposals.length}
                </div>
                <div className="text-gray-600">Propostas Ativas</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  R$ {activeProposals.reduce((sum, p) => sum + p.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-gray-600">Valor Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 mb-2">
                  {expiredProposals.length}
                </div>
                <div className="text-gray-600">Expiradas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Propostas Ativas */}
        {activeProposals.length > 0 && (
          <ClientProposalHistory 
            proposals={activeProposals}
            title="Propostas Ativas"
          />
        )}

        {/* Propostas Expiradas (se houver) */}
        {expiredProposals.length > 0 && (
          <ClientProposalHistory 
            proposals={expiredProposals}
            title="Propostas Expiradas"
          />
        )}

        {/* Mensagem quando não há propostas */}
        {proposals.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma proposta encontrada
              </h3>
              <p className="text-gray-500">
                Você ainda não possui propostas disponíveis.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ClientPortalBySlug;
