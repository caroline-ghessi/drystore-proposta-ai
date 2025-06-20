
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Database, Settings } from 'lucide-react';

interface ProposalStatsProps {
  acceptedProposalsCount: number;
  crmDealsCount: number;
  erpOrdersCount: number;
}

const ProposalStats = ({ acceptedProposalsCount, crmDealsCount, erpOrdersCount }: ProposalStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card className="p-4 sm:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold">{acceptedProposalsCount}</p>
              <p className="text-xs sm:text-sm text-gray-600">Propostas Aceitas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="p-4 sm:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold">{crmDealsCount}</p>
              <p className="text-xs sm:text-sm text-gray-600">Negócios CRM</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="p-4 sm:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold">{erpOrdersCount}</p>
              <p className="text-xs sm:text-sm text-gray-600">Pedidos ERP</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="p-4 sm:p-6">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold">2</p>
              <p className="text-xs sm:text-sm text-gray-600">Integrações Ativas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalStats;
