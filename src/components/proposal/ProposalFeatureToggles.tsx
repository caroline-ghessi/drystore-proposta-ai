
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Package, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClientContext } from '@/hooks/useClientContext';

interface ProposalFeatureTogglesProps {
  proposalId: string;
  contractGeneration: boolean;
  deliveryControl: boolean;
  onToggleContractGeneration: (enabled: boolean) => void;
  onToggleDeliveryControl: (enabled: boolean) => void;
}

const ProposalFeatureToggles = ({
  proposalId,
  contractGeneration,
  deliveryControl,
  onToggleContractGeneration,
  onToggleDeliveryControl
}: ProposalFeatureTogglesProps) => {
  const { isClient } = useClientContext();

  // Não exibir configurações para clientes
  if (isClient) {
    return null;
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5" />
          Configurações da Proposta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <Label htmlFor="contract-generation" className="text-sm font-medium">
                Geração de Contrato
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Habilita assinatura digital após aceite
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    id="contract-generation"
                    checked={contractGeneration}
                    onCheckedChange={onToggleContractGeneration}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quando ativado, o cliente poderá assinar o contrato digitalmente após aceitar a proposta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <Label htmlFor="delivery-control" className="text-sm font-medium">
                Controle de Entregas
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Permite acompanhar entregas e recebimentos
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    id="delivery-control"
                    checked={deliveryControl}
                    onCheckedChange={onToggleDeliveryControl}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quando ativado, será possível registrar entregas e acompanhar o progresso</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {(contractGeneration || deliveryControl) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Funcionalidades ativas:</strong>
              {contractGeneration && " Geração de Contrato"}
              {contractGeneration && deliveryControl && " • "}
              {deliveryControl && " Controle de Entregas"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalFeatureToggles;
