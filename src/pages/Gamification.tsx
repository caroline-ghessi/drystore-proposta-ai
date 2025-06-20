
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerRanking } from '@/components/gamification/SellerRanking';
import { GoalsAndChallenges } from '@/components/gamification/GoalsAndChallenges';
import { PointsAndRewards } from '@/components/gamification/PointsAndRewards';
import { Achievements } from '@/components/gamification/Achievements';
import { TeamCompetitions } from '@/components/gamification/TeamCompetitions';

const Gamification = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🏆 Gamificação</h1>
          <p className="text-gray-600">Motive sua equipe com competições e recompensas</p>
        </div>

        <Tabs defaultValue="ranking" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="goals">Metas e Desafios</TabsTrigger>
            <TabsTrigger value="rewards">Pontos e Recompensas</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="competitions">Competições</TabsTrigger>
          </TabsList>

          <TabsContent value="ranking">
            <SellerRanking />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsAndChallenges />
          </TabsContent>

          <TabsContent value="rewards">
            <PointsAndRewards />
          </TabsContent>

          <TabsContent value="achievements">
            <Achievements />
          </TabsContent>

          <TabsContent value="competitions">
            <TeamCompetitions />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Gamification;
