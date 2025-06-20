
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProposalHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Propostas & Integrações</h1>
        <p className="text-gray-600 mt-1">Gerencie propostas e automatize integrações ERP/CRM</p>
      </div>
      <Button className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Nova Proposta
      </Button>
    </div>
  );
};

export default ProposalHeader;
