
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react';

interface ProposalStatsProps {
  stats: {
    total: number;
    abertas: number;
    aceitas: number;
    valorTotal: number;
  };
}

const ProposalStats = ({ stats }: ProposalStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{stats.abertas}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Aceitas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aceitas}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Valor Fechado</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {stats.valorTotal.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalStats;
