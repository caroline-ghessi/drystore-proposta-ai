
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface UrgencyCardProps {
  validUntil: string;
}

const UrgencyCard = ({ validUntil }: UrgencyCardProps) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-orange-600" />
          <div>
            <p className="font-semibold text-orange-800">⏰ Oferta por Tempo Limitado!</p>
            <p className="text-sm text-orange-700">Esta proposta é válida apenas até {validUntil}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrgencyCard;
