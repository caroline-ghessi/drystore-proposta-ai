
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Calendar, Loader2 } from 'lucide-react';
import { useSellerRanking } from '@/hooks/useGamification';

export const TeamCompetitions = () => {
  const { data: sellers, isLoading } = useSellerRanking();

  // Simular competições baseadas nos dados reais
  const competitions = [
    {
      id: 1,
      name: 'Batalha de Vendas - Dezembro',
      description: 'Competição mensal entre vendedores',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      type: 'individual',
      status: 'active'
    },
    {
      id: 2,
      name: 'Desafio das Propostas',
      description: 'Quem cria mais propostas esta semana',
      startDate: '2024-12-02',
      endDate: '2024-12-08',
      type: 'sprint',
      status: 'active'
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Competições entre Equipes
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
          <Users className="w-5 h-5 text-blue-500" />
          Competições entre Equipes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Competições Ativas */}
        <div className="space-y-4">
          {competitions.map((competition) => (
            <div key={competition.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-blue-900">{competition.name}</h3>
                  <p className="text-sm text-blue-700">{competition.description}</p>
                </div>
                <Badge variant={competition.status === 'active' ? 'default' : 'secondary'}>
                  {competition.status === 'active' ? '🔥 Ativo' : '⏰ Finalizado'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(competition.startDate).toLocaleDateString('pt-BR')} - {new Date(competition.endDate).toLocaleDateString('pt-BR')}
                </span>
                <Badge variant="outline">{competition.type}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Ranking da Competição */}
        {sellers && sellers.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Ranking Atual da Competição
            </h3>
            
            <div className="space-y-2">
              {sellers.slice(0, 3).map((seller, index) => (
                <div key={seller.user_id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{seller.nome}</p>
                      <p className="text-sm text-gray-600">{seller.total_points} pontos</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {seller.current_level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
