
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Trophy, Loader2 } from 'lucide-react';
import { useChallenges, useSalesTargets } from '@/hooks/useGamification';

export const GoalsAndChallenges = () => {
  const { data: challenges, isLoading: challengesLoading } = useChallenges();
  const { data: salesTarget, isLoading: targetLoading } = useSalesTargets();

  if (challengesLoading || targetLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Metas e Desafios
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
          <Target className="w-5 h-5 text-blue-500" />
          Metas e Desafios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta Mensal */}
        {salesTarget && (
          <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Meta Mensal - {salesTarget.month}/{salesTarget.year}</h3>
              </div>
              <Badge variant={salesTarget.progress_percentage >= 100 ? "default" : "secondary"}>
                {salesTarget.progress_percentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso: R$ {salesTarget.actual_sales.toLocaleString('pt-BR')}</span>
                <span>Meta: R$ {salesTarget.target_amount.toLocaleString('pt-BR')}</span>
              </div>
              <Progress value={Math.min(salesTarget.progress_percentage, 100)} className="h-3" />
              <p className="text-xs text-gray-600">
                {salesTarget.progress_percentage >= 100 
                  ? '🎉 Meta atingida! Parabéns!' 
                  : `Faltam R$ ${(salesTarget.target_amount - salesTarget.actual_sales).toLocaleString('pt-BR')} para atingir a meta`
                }
              </p>
            </div>
          </div>
        )}

        {/* Desafios Ativos */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Desafios Ativos
          </h3>
          
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div key={challenge.id} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{challenge.name}</h4>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={challenge.completed ? "default" : "outline"}>
                      {challenge.challenge_type === 'monthly' && '📅 Mensal'}
                      {challenge.challenge_type === 'weekly' && '⚡ Semanal'}
                      {challenge.challenge_type === 'special' && '🌟 Especial'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {challenge.reward_points} pontos
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso: {challenge.current_progress?.toLocaleString('pt-BR')}</span>
                    <span>Meta: {challenge.target_value.toLocaleString('pt-BR')}</span>
                  </div>
                  <Progress value={challenge.progress_percentage || 0} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Termina: {new Date(challenge.end_date).toLocaleDateString('pt-BR')}</span>
                    <span>{challenge.progress_percentage?.toFixed(1)}% completo</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum desafio ativo no momento</p>
              <p className="text-sm">Novos desafios em breve!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
