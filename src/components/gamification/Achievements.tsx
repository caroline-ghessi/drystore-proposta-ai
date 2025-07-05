
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, Loader2 } from 'lucide-react';
import { useAchievements } from '@/hooks/useGamification';

export const Achievements = () => {
  const { data: achievements, isLoading } = useAchievements();

  const getBadgeColor = (color: string, earned: boolean) => {
    if (!earned) return 'bg-gray-100 text-gray-500';
    
    switch (color) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'pink': return 'bg-pink-100 text-pink-800';
      case 'diamond': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas
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

  const earnedAchievements = achievements?.filter(a => a.earned_at) || [];
  const availableAchievements = achievements?.filter(a => !a.earned_at) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Conquistas ({earnedAchievements.length}/{achievements?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conquistas Desbloqueadas */}
        {earnedAchievements.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-green-500" />
              Conquistas Desbloqueadas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedAchievements.map((achievement) => (
                <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-green-900">{achievement.name}</h4>
                        <Badge className={getBadgeColor(achievement.badge_color, true)}>
                          Desbloqueada
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700">{achievement.description}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Desbloqueada em {new Date(achievement.earned_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conquistas Disponíveis */}
        {availableAchievements.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-500" />
              Próximas Conquistas
            </h3>
            
            <div className="space-y-3">
              {availableAchievements.map((achievement) => (
                <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-700">{achievement.name}</h4>
                        <Badge variant="outline" className={getBadgeColor(achievement.badge_color, false)}>
                          {achievement.badge_color}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      
                      {/* Progresso */}
                      {achievement.progress !== undefined && achievement.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progresso</span>
                            <span>{achievement.progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                      
                      {/* Requisitos */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {achievement.points_required && (
                          <Badge variant="outline" className="text-xs">
                            {achievement.points_required} pontos
                          </Badge>
                        )}
                        {achievement.proposals_required && (
                          <Badge variant="outline" className="text-xs">
                            {achievement.proposals_required} propostas
                          </Badge>
                        )}
                        {achievement.sales_value_required && (
                          <Badge variant="outline" className="text-xs">
                            R$ {achievement.sales_value_required.toLocaleString('pt-BR')} em vendas
                          </Badge>
                        )}
                        {achievement.special_condition && (
                          <Badge variant="outline" className="text-xs">
                            {achievement.special_condition}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {(!achievements || achievements.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma conquista disponível</p>
            <p className="text-sm">Continue vendendo para desbloquear conquistas!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
