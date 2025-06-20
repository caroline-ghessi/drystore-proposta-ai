
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

export const SellerRanking = () => {
  const sellers = [
    { name: 'Carlos Silva', sales: 95000, growth: '+15%', position: 1 },
    { name: 'Ana Costa', sales: 87000, growth: '+12%', position: 2 },
    { name: 'João Santos', sales: 79000, growth: '+8%', position: 3 },
    { name: 'Maria Oliveira', sales: 72000, growth: '+5%', position: 4 },
    { name: 'Pedro Lima', sales: 68000, growth: '+3%', position: 5 },
  ];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Vendedores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sellers.map((seller) => (
            <div key={seller.position} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPositionIcon(seller.position)}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {seller.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{seller.name}</p>
                  <p className="text-xs text-gray-600">
                    R$ {seller.sales.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-600">
                {seller.growth}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
