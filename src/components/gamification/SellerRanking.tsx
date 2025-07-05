
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star, Loader2 } from 'lucide-react';
import { useSellerRanking } from '@/hooks/useGamification';

export const SellerRanking = () => {
  const { data: sellers, isLoading, error } = useSellerRanking();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return (
        <div className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-sm font-bold">
          {position}
        </div>
      );
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'bg-purple-100 text-purple-800';
      case 'Platinum': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-slate-100 text-slate-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Erro ao carregar ranking</p>
        </CardContent>
      </Card>
    );
  }

  if (!sellers || sellers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Ranking de Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Nenhum vendedor encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking de Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellers.map((seller) => (
            <div key={seller.user_id} className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getPositionIcon(seller.rank_position)}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold">
                      {seller.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{seller.nome}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getLevelColor(seller.current_level)}>
                        {seller.current_level}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {seller.total_points} pontos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    R$ {seller.total_sales_value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500">vendas totais</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {seller.proposals_accepted} vendas • {seller.proposals_created} propostas
                  </span>
                  <span className="text-gray-600">
                    Taxa: {seller.proposals_sent > 0 ? ((seller.proposals_accepted / seller.proposals_sent) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={seller.total_points > 0 ? Math.min((seller.total_points / 1000) * 100, 100) : 0} 
                  className="h-2" 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
