
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-sm sm:text-lg font-bold truncate">{pendingMessages.length}</p>
              <p className="text-gray-600 text-xs truncate">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-sm sm:text-lg font-bold truncate">{sentMessages.length}</p>
              <p className="text-gray-600 text-xs truncate">Enviados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-sm sm:text-lg font-bold truncate">{triggers.filter(t => t.isActive).length}</p>
              <p className="text-gray-600 text-xs truncate">Gatilhos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-sm sm:text-lg font-bold truncate">{followUpMessages.length}</p>
              <p className="text-gray-600 text-xs truncate">Histórico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpStats;
