
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star } from 'lucide-react';

export const SellerRanking = () => {
  const sellers = [
    { 
      name: 'Carlos Silva', 
      points: 2850, 
      sales: 95000, 
      position: 1, 
      level: 'Ouro',
      achievement: 'Vendedor do Mês',
      progress: 95 
    },
    { 
      name: 'Ana Costa', 
      points: 2640, 
      sales: 87000, 
      position: 2, 
      level: 'Ouro',
      achievement: 'Estrela Crescente',
      progress: 87 
    },
    { 
      name: 'João Santos', 
      points: 2180, 
      sales: 79000, 
      position: 3, 
      level: 'Prata',
      achievement: 'Persistente',
      progress: 73 
    },
    { 
      name: 'Maria Oliveira', 
      points: 1920, 
      sales: 72000, 
      position: 4, 
      level: 'Prata',
      achievement: 'Consistente',
      progress: 64 
    },
    { 
      name: 'Pedro Lima', 
      points: 1650, 
      sales: 68000, 
      position: 5, 
      level: 'Bronze',
      achievement: 'Iniciante Pro',
      progress: 55 
    },
  ];

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
      case 'Ouro': return 'bg-yellow-100 text-yellow-800';
      case 'Prata': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

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
            <div key={seller.position} className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getPositionIcon(seller.position)}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-bold">
                      {seller.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{seller.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getLevelColor(seller.level)}>
                        {seller.level}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {seller.points} pontos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    R$ {seller.sales.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500">vendas este mês</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {seller.achievement}
                  </span>
                  <span className="text-gray-600">{seller.progress}% da meta</span>
                </div>
                <Progress value={seller.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
