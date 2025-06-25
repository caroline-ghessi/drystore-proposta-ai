
import { useState } from 'react';
import InteractionLog from '@/components/proposal/InteractionLog';
import InternalNotes from '@/components/proposal/InternalNotes';

interface ProposalVendorToolsProps {
  proposalId: string;
  interactions: any[];
  onAddInteraction: (interaction: any) => void;
  proposalCreatedBy: string;
}

export const ProposalVendorTools = ({
  proposalId,
  interactions,
  onAddInteraction,
  proposalCreatedBy
}: ProposalVendorToolsProps) => {
  const [internalNotes, setInternalNotes] = useState<string>('');

  return (
    <div className="bg-gray-50 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Ferramentas Internas</h3>
        <div className="grid lg:grid-cols-2 gap-8">
          <InternalNotes
            proposalId={proposalId}
            notes={internalNotes}
            onNotesChange={setInternalNotes}
          />

          <InteractionLog
            proposalId={proposalId}
            interactions={interactions}
            onAddInteraction={onAddInteraction}
            proposalCreatedBy={proposalCreatedBy}
          />
        </div>
      </div>
    </div>
  );
};
