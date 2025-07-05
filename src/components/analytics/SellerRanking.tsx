
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { useSellerRanking } from '@/hooks/useGamification';

export const SellerRanking = () => {
  const { data: sellers, isLoading, error } = useSellerRanking();

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !sellers || sellers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 p-8">
            {error ? 'Erro ao carregar ranking' : 'Nenhum vendedor encontrado'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Vendedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sellers.slice(0, 5).map((seller) => (
            <div key={seller.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPositionIcon(seller.rank_position)}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {seller.nome.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{seller.nome}</p>
                  <p className="text-xs text-gray-600">
                    R$ {seller.total_sales_value.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-600">
                {seller.current_level}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
