
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ERPOrder {
  id: string;
  orderNumber: string;
  totalValue: number;
  status: string;
}

interface CRMDeal {
  id: string;
  clientName: string;
  dealValue: number;
  stage: string;
  status: string;
}

interface HistoryTabProps {
  erpOrders: ERPOrder[];
  crmDeals: CRMDeal[];
}

const HistoryTab = ({ erpOrders, crmDeals }: HistoryTabProps) => {
  return (
    <div className="grid gap-6">
      {/* Histórico ERP */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Histórico de Pedidos ERP</CardTitle>
        </CardHeader>
        <CardContent>
          {erpOrders.length > 0 ? (
            <div className="space-y-3">
              {erpOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded">
                  <div className="min-w-0">
                    <p className="font-medium break-words">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">R$ {order.totalValue.toFixed(2)}</p>
                  </div>
                  <Badge className="self-start sm:self-center">{order.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">Nenhum pedido ERP gerado ainda</p>
          )}
        </CardContent>
      </Card>

      {/* Histórico CRM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Histórico de Negócios CRM</CardTitle>
        </CardHeader>
        <CardContent>
          {crmDeals.length > 0 ? (
            <div className="space-y-3">
              {crmDeals.map((deal) => (
                <div key={deal.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded">
                  <div className="min-w-0">
                    <p className="font-medium break-words">{deal.clientName}</p>
                    <p className="text-sm text-gray-600">R$ {deal.dealValue.toFixed(2)} • {deal.stage}</p>
                  </div>
                  <Badge className="self-start sm:self-center">{deal.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">Nenhum negócio CRM criado ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryTab;
