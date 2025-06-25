
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ProposalExpiredMessageProps {
  validUntil: string;
}

export const ProposalExpiredMessage = ({ validUntil }: ProposalExpiredMessageProps) => {
  return (
    <div className="bg-red-50 border-t border-red-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-red-800 mb-4">Proposta Expirada</h3>
            <p className="text-red-600 text-lg mb-6">
              Esta proposta expirou em {validUntil}.
            </p>
            <p className="text-red-600">
              Entre em contato conosco para uma nova proposta atualizada.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
