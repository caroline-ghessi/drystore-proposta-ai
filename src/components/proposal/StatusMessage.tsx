
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface StatusMessageProps {
  status: 'pending' | 'accepted' | 'rejected' | 'aguardando_pagamento';
}

export const StatusMessage = ({ status }: StatusMessageProps) => {
  if (status === 'pending') return null;

  return (
    <Card className="lg:hidden">
      <CardContent className="p-6 text-center">
        {status === 'accepted' || status === 'aguardando_pagamento' ? (
          <div className="text-green-600">
            <Check className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {status === 'accepted' ? 'Proposta Aceita!' : 'Aguardando Pagamento'}
            </h3>
            <p>
              {status === 'accepted' 
                ? 'O vendedor entrará em contato para finalizar o pedido.'
                : 'Finalize o pagamento para confirmar sua proposta.'
              }
            </p>
          </div>
        ) : (
          <div className="text-red-600">
            <X className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Proposta Rejeitada</h3>
            <p>O vendedor foi notificado sobre sua decisão.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
