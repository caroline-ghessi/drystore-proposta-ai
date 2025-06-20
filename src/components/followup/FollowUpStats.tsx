
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Settings, History, Zap } from 'lucide-react';
import { FollowUpMessage, FollowUpTrigger } from '@/types/followup';

interface FollowUpStatsProps {
  followUpMessages: FollowUpMessage[];
  triggers: FollowUpTrigger[];
}

const FollowUpStats = ({ followUpMessages, triggers }: FollowUpStatsProps) => {
  const pendingMessages = followUpMessages.filter(msg => msg.status === 'pending');
  const sentMessages = followUpMessages.filter(msg => msg.status === 'sent');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-lg sm:text-2xl font-bold">{pendingMessages.length}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-lg sm:text-2xl font-bold">{sentMessages.length}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Enviados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-lg sm:text-2xl font-bold">{triggers.filter(t => t.isActive).length}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Gatilhos Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <History className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            <div className="ml-3 sm:ml-4">
              <p className="text-lg sm:text-2xl font-bold">{followUpMessages.length}</p>
              <p className="text-gray-600 text-xs sm:text-sm">Total Histórico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpStats;
