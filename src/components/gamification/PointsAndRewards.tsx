
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, Coins, Loader2 } from 'lucide-react';
import { useUserGamificationData } from '@/hooks/useGamification';

export const PointsAndRewards = () => {
  const { data: userData, isLoading } = useUserGamificationData();

  // Sistema de recompensas baseado em pontos
  const rewards = [
    { name: 'Badge Iniciante', points: 50, type: 'badge', icon: '🏅', unlocked: (userData?.total_points || 0) >= 50 },
    { name: 'Desconto 5% Loja', points: 100, type: 'discount', icon: '🎫', unlocked: (userData?.total_points || 0) >= 100 },
    { name: 'Badge Experiente', points: 250, type: 'badge', icon: '🥉', unlocked: (userData?.total_points || 0) >= 250 },
    { name: 'Vale Presente R$ 50', points: 500, type: 'voucher', icon: '🎁', unlocked: (userData?.total_points || 0) >= 500 },
    { name: 'Badge Master', points: 1000, type: 'badge', icon: '🏆', unlocked: (userData?.total_points || 0) >= 1000 },
    { name: 'Folga Especial', points: 1500, type: 'time_off', icon: '🏖️', unlocked: (userData?.total_points || 0) >= 1500 },
  ];

  const nextReward = rewards.find(r => !r.unlocked);
  const unlockedRewards = rewards.filter(r => r.unlocked);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Pontos e Recompensas
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Pontos e Recompensas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Atual */}
        <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <Coins className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
          <h3 className="text-2xl font-bold text-yellow-900">{userData?.total_points || 0}</h3>
          <p className="text-yellow-700">Pontos Totais</p>
          <Badge className="mt-2" variant="secondary">
            Nível {userData?.current_level || 'Bronze'}
          </Badge>
        </div>

        {/* Próxima Recompensa */}
        {nextReward && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Próxima Recompensa</h3>
              </div>
              <span className="text-2xl">{nextReward.icon}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{nextReward.name}</span>
                <span className="text-sm text-gray-600">{nextReward.points} pontos</span>
              </div>
              <Progress 
                value={((userData?.total_points || 0) / nextReward.points) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600">
                Faltam {nextReward.points - (userData?.total_points || 0)} pontos
              </p>
            </div>
          </div>
        )}

        {/* Recompensas Desbloqueadas */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-500" />
            Recompensas Desbloqueadas ({unlockedRewards.length})
          </h3>
          
          {unlockedRewards.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {unlockedRewards.map((reward, index) => (
                <div key={index} className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="text-center">
                    <span className="text-2xl mb-1 block">{reward.icon}</span>
                    <p className="text-sm font-medium text-green-800">{reward.name}</p>
                    <p className="text-xs text-green-600">{reward.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Continue ganhando pontos para desbloquear recompensas!</p>
            </div>
          )}
        </div>

        {/* Sistema de Pontos */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Como Ganhar Pontos</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Criar proposta</span>
              <span className="font-medium text-blue-600">+10 pontos</span>
            </div>
            <div className="flex justify-between">
              <span>Enviar proposta</span>
              <span className="font-medium text-green-600">+25 pontos</span>
            </div>
            <div className="flex justify-between">
              <span>Proposta aceita</span>
              <span className="font-medium text-purple-600">+100 pontos</span>
            </div>
            <div className="flex justify-between">
              <span>Vendas (por R$ 1.000)</span>
              <span className="font-medium text-orange-600">+1 ponto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
