
import { Card, CardContent } from '@/components/ui/card';

interface ProposalObservationsProps {
  observacoes: string;
}

export const ProposalObservations = ({ observacoes }: ProposalObservationsProps) => {
  if (!observacoes) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Observações Importantes</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {observacoes}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
