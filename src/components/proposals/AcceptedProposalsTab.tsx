
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import ERPIntegrationCard from '@/components/erp/ERPIntegrationCard';

interface Proposal {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  finalPrice: number;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

interface AcceptedProposalsTabProps {
  acceptedProposals: Proposal[];
  onRefreshIntegrationData: () => void;
}

const AcceptedProposalsTab = ({ acceptedProposals, onRefreshIntegrationData }: AcceptedProposalsTabProps) => {
  return (
    <div className="space-y-6">
      {acceptedProposals.length > 0 ? (
        acceptedProposals.map((proposal) => (
          <Card key={proposal.id} className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="flex items-start sm:items-center gap-2 text-base sm:text-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{proposal.id} - {proposal.clientName}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Valor: R$ {proposal.finalPrice.toFixed(2)} • {proposal.items.length} itens
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 self-start sm:self-center">Aceita</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ERPIntegrationCard 
                proposalData={proposal}
                onIntegrationComplete={onRefreshIntegrationData}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Nenhuma proposta aceita
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Quando houver propostas aceitas, elas aparecerão aqui para integração automática
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcceptedProposalsTab;
