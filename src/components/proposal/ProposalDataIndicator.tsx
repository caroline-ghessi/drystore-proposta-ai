
interface ProposalDataIndicatorProps {
  dataSource: 'supabase' | 'pdf' | 'mock';
  proposal: {
    clientName: string;
    finalPrice: number;
    discount?: number;
  };
  itemsCount: number;
}

const ProposalDataIndicator = ({ dataSource, proposal, itemsCount }: ProposalDataIndicatorProps) => {
  if (dataSource === 'mock') {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-700 font-medium">
        {dataSource === 'supabase' ? '✅ Proposta carregada do banco de dados' : '✅ Proposta baseada em dados extraídos do PDF'}
      </p>
      <p className="text-xs text-green-600">
        Cliente: {proposal.clientName} | {itemsCount} itens | Total: R$ {proposal.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        {proposal.discount && proposal.discount > 0 && ` | Desconto: ${proposal.discount}%`}
      </p>
    </div>
  );
};

export default ProposalDataIndicator;
