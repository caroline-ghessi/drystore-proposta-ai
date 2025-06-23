
import { Card, CardContent } from '@/components/ui/card';

interface ClientPortalStatsProps {
  activeProposals: Array<{ value: number }>;
  expiredProposals: Array<any>;
}

const ClientPortalStats = ({ activeProposals, expiredProposals }: ClientPortalStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {activeProposals.length}
            </div>
            <div className="text-gray-600">Propostas Ativas</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              R$ {activeProposals.reduce((sum, p) => sum + p.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-gray-600">Valor Total</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-500 mb-2">
              {expiredProposals.length}
            </div>
            <div className="text-gray-600">Expiradas</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPortalStats;
