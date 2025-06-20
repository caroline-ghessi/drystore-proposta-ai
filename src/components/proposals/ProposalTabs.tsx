
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AcceptedProposalsTab from './AcceptedProposalsTab';
import HistoryTab from './HistoryTab';
import IntegrationConfigPanel from '@/components/erp/IntegrationConfigPanel';

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

interface ProposalTabsProps {
  acceptedProposals: Proposal[];
  erpOrders: any[];
  crmDeals: any[];
  onRefreshIntegrationData: () => void;
}

const ProposalTabs = ({ acceptedProposals, erpOrders, crmDeals, onRefreshIntegrationData }: ProposalTabsProps) => {
  return (
    <Tabs defaultValue="accepted" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
        <TabsTrigger value="accepted" className="text-xs sm:text-sm px-2 py-2 flex flex-col sm:flex-row items-center gap-1">
          <span className="truncate">Propostas Aceitas</span>
          {acceptedProposals.length > 0 && (
            <Badge className="text-xs h-4 px-1">{acceptedProposals.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="integration" className="text-xs sm:text-sm px-2 py-2">
          <span className="truncate">ERP/CRM</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-2">
          <span className="truncate">Histórico</span>
        </TabsTrigger>
        <TabsTrigger value="config" className="text-xs sm:text-sm px-2 py-2">
          <span className="truncate">Config</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="accepted" className="space-y-6">
        <AcceptedProposalsTab 
          acceptedProposals={acceptedProposals}
          onRefreshIntegrationData={onRefreshIntegrationData}
        />
      </TabsContent>

      <TabsContent value="integration" className="space-y-6">
        <div className="grid gap-6">
          <IntegrationConfigPanel />
        </div>
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <HistoryTab erpOrders={erpOrders} crmDeals={crmDeals} />
      </TabsContent>

      <TabsContent value="config">
        <IntegrationConfigPanel />
      </TabsContent>
    </Tabs>
  );
};

export default ProposalTabs;
