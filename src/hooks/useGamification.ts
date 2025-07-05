import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SellerRankingData {
  user_id: string;
  nome: string;
  role: string;
  total_points: number;
  current_level: string;
  proposals_created: number;
  proposals_sent: number;
  proposals_accepted: number;
  total_sales_value: number;
  rank_position: number;
}

export interface UserGamificationData {
  total_points: number;
  current_level: string;
  proposals_created: number;
  proposals_sent: number;
  proposals_accepted: number;
  total_sales_value: number;
  achievements_count: number;
  active_challenges_count: number;
  rank_position: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required?: number;
  proposals_required?: number;
  sales_value_required?: number;
  special_condition?: string;
  badge_color: string;
  earned_at?: string;
  progress?: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_metric: string;
  start_date: string;
  end_date: string;
  reward_points: number;
  reward_description?: string;
  current_progress?: number;
  completed?: boolean;
  progress_percentage?: number;
}

export const useSellerRanking = () => {
  return useQuery({
    queryKey: ['seller-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_seller_ranking');
      
      if (error) {
        console.error('Error fetching seller ranking:', error);
        throw error;
      }
      
      return data as SellerRankingData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserGamificationData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-gamification', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get user's gamification points
      const { data: pointsData, error: pointsError } = await supabase
        .from('gamification_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (pointsError && pointsError.code !== 'PGRST116') {
        console.error('Error fetching user gamification data:', pointsError);
        throw pointsError;
      }
      
      // Get achievements count
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id);
      
      if (achievementsError) throw achievementsError;
      
      // Get active challenges count
      const { data: challengesData, error: challengesError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', user.id);
      
      if (challengesError) throw challengesError;
      
      // Calculate rank position
      const { data: rankData, error: rankError } = await supabase.rpc('get_seller_ranking');
      if (rankError) throw rankError;
      
      const userRank = (rankData as SellerRankingData[])?.find(r => r.user_id === user.id);
      
      return {
        total_points: pointsData?.total_points || 0,
        current_level: pointsData?.current_level || 'Bronze',
        proposals_created: pointsData?.proposals_created || 0,
        proposals_sent: pointsData?.proposals_sent || 0,
        proposals_accepted: pointsData?.proposals_accepted || 0,
        total_sales_value: pointsData?.total_sales_value || 0,
        achievements_count: achievementsData?.length || 0,
        active_challenges_count: challengesData?.length || 0,
        rank_position: userRank?.rank_position || 0
      } as UserGamificationData;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAchievements = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      // Get all available achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('gamification_achievements')
        .select('*')
        .eq('active', true)
        .order('points_required', { ascending: true, nullsFirst: false });
      
      if (achievementsError) throw achievementsError;
      
      // Get user's earned achievements if user is logged in
      let userAchievements: any[] = [];
      if (user?.id) {
        const { data: userAchievementsData, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);
        
        if (userAchievementsError) throw userAchievementsError;
        userAchievements = userAchievementsData || [];
      }
      
      // Get user's current stats for progress calculation
      let userStats = null;
      if (user?.id) {
        const { data: statsData, error: statsError } = await supabase
          .from('gamification_points')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (statsError && statsError.code !== 'PGRST116') throw statsError;
        userStats = statsData;
      }
      
      // Combine achievements with user progress
      const achievementsWithProgress = achievements?.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        let progress = 0;
        
        if (userStats && !userAchievement) {
          // Calculate progress based on achievement criteria
          if (achievement.points_required) {
            progress = Math.min((userStats.total_points / achievement.points_required) * 100, 100);
          } else if (achievement.proposals_required) {
            progress = Math.min((userStats.proposals_created / achievement.proposals_required) * 100, 100);
          } else if (achievement.sales_value_required) {
            progress = Math.min((userStats.total_sales_value / achievement.sales_value_required) * 100, 100);
          }
        }
        
        return {
          ...achievement,
          earned_at: userAchievement?.earned_at,
          progress: userAchievement ? 100 : progress
        };
      }) || [];
      
      return achievementsWithProgress as Achievement[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useChallenges = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      // Get active challenges
      const { data: challenges, error: challengesError } = await supabase
        .from('gamification_challenges')
        .select('*')
        .eq('active', true)
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: true });
      
      if (challengesError) throw challengesError;
      
      if (!user?.id) return challenges as Challenge[];
      
      // Get user's progress on challenges
      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);
      
      if (userChallengesError) throw userChallengesError;
      
      // Get user's current stats
      const { data: userStats, error: userStatsError } = await supabase
        .from('gamification_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (userStatsError && userStatsError.code !== 'PGRST116') throw userStatsError;
      
      // Combine challenges with user progress
      const challengesWithProgress = challenges?.map(challenge => {
        const userChallenge = userChallenges?.find(uc => uc.challenge_id === challenge.id);
        let currentProgress = userChallenge?.current_progress || 0;
        
        // Calculate real-time progress if no user challenge record exists
        if (!userChallenge && userStats) {
          switch (challenge.target_metric) {
            case 'sales_value':
              currentProgress = userStats.total_sales_value;
              break;
            case 'proposals_count':
              currentProgress = userStats.proposals_created;
              break;
            case 'acceptance_rate':
              currentProgress = userStats.proposals_accepted > 0 ? 
                (userStats.proposals_accepted / userStats.proposals_sent) * 100 : 0;
              break;
          }
        }
        
        const progressPercentage = Math.min((currentProgress / challenge.target_value) * 100, 100);
        
        return {
          ...challenge,
          current_progress: currentProgress,
          completed: userChallenge?.completed || false,
          progress_percentage: progressPercentage
        };
      }) || [];
      
      return challengesWithProgress as Challenge[];
    },
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useSalesTargets = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sales-targets', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get current month's target
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const { data: targets, error: targetsError } = await supabase
        .from('sales_targets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);
      
      if (targetsError) throw targetsError;
      
      // Get actual sales for current month
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('valor_total')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      if (proposalsError) throw proposalsError;
      
      const actualSales = proposals?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0;
      const target = targets?.[0];
      
      return {
        target_amount: target?.target_amount || 0,
        actual_sales: actualSales,
        progress_percentage: target?.target_amount ? (actualSales / target.target_amount) * 100 : 0,
        month: currentMonth,
        year: currentYear
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};