import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun } from 'lucide-react';
import { ClienteSolarForm } from '@/components/solar/ClienteSolarForm';
import { SolarCalculationService } from '@/services/solarCalculationService';
import type { DadosClienteSolar } from '@/types/solarClient';
import { useToast } from '@/hooks/use-toast';

const SolarProposalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSolarFormSubmit = async (dados: DadosClienteSolar) => {
    setLoading(true);
    
    try {
      console.log('🌞 Iniciando geração de proposta solar:', dados.nome);
      
      const propostaSolar = await SolarCalculationService.gerarPropostaCompleta(dados);
      
      toast({
        title: "Proposta solar criada com sucesso!",
        description: `Proposta gerada para ${dados.nome} com sistema de ${propostaSolar.dimensionamento.potencia_necessaria_kwp}kWp`,
      });

      // Redirecionar para visualização da proposta
      navigate(`/proposal-view/${propostaSolar.proposal.id}`);
    } catch (error) {
      console.error('❌ Erro ao gerar proposta solar:', error);
      
      toast({
        title: "Erro ao gerar proposta",
        description: error instanceof Error ? error.message : "Erro inesperado ao processar dados solares",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <Sun className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proposta de Energia Solar</h1>
              <p className="text-gray-600 mt-1">Cálculo automatizado de sistema fotovoltaico</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 2 de 3</span>
            <span>66% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '66%' }}></div>
          </div>
        </div>

        <ClienteSolarForm 
          onSubmit={handleSolarFormSubmit}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default SolarProposalPage;