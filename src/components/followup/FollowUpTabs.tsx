
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FollowUpMessageCard from '@/components/followup/FollowUpMessageCard';
import FollowUpTriggerConfig from '@/components/followup/FollowUpTriggerConfig';
import WhatsAppHistory from '@/components/followup/WhatsAppHistory';
import FollowUpEmptyState from '@/components/followup/FollowUpEmptyState';
import { FollowUpMessage, FollowUpTrigger } from '@/types/followup';

interface FollowUpTabsProps {
  followUpMessages: FollowUpMessage[];
  triggers: FollowUpTrigger[];
  onMessageSent: (messageId: string) => void;
  onTriggersChange: (triggers: FollowUpTrigger[]) => void;
  onGenerateFollowUp: () => void;
  isGenerating: boolean;
}

const FollowUpTabs = ({ 
  followUpMessages, 
  triggers, 
  onMessageSent, 
  onTriggersChange, 
  onGenerateFollowUp,
  isGenerating 
}: FollowUpTabsProps) => {
  const pendingMessages = followUpMessages.filter(msg => msg.status === 'pending');
  const sentMessages = followUpMessages.filter(msg => msg.status === 'sent');

  return (
    <div className="w-full">
      <Tabs defaultValue="pending" className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
            <TabsTrigger value="pending" className="text-xs sm:text-sm px-1 sm:px-3">
              <span className="block sm:hidden">Pend.</span>
              <span className="hidden sm:block">Pendentes</span>
              {pendingMessages.length > 0 && (
                <Badge className="ml-1 bg-red-500 text-xs px-1 py-0 h-4 min-w-4">{pendingMessages.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs sm:text-sm px-1 sm:px-3">
              <span className="block sm:hidden">Env.</span>
              <span className="hidden sm:block">Enviados</span>
            </TabsTrigger>
            <TabsTrigger value="triggers" className="text-xs sm:text-sm px-1 sm:px-3">
              <span className="block sm:hidden">Config</span>
              <span className="hidden sm:block">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-1 sm:px-3">
              <span className="block sm:hidden">Hist.</span>
              <span className="hidden sm:block">Histórico</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="pending" className="mt-0 space-y-4">
            {pendingMessages.length > 0 ? (
              pendingMessages.map((message) => (
                <FollowUpMessageCard
                  key={message.id}
                  followUpMessage={message}
                  onMessageSent={onMessageSent}
                />
              ))
            ) : (
              <FollowUpEmptyState 
                onGenerateFollowUp={onGenerateFollowUp}
                isGenerating={isGenerating}
              />
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-0 space-y-4">
            {sentMessages.map((message) => (
              <Card key={message.id} className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate text-sm sm:text-base">{message.clientName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{message.clientPhone}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs shrink-0 self-start sm:self-auto">
                        {new Date(message.sentAt!).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.finalMessage}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="triggers" className="mt-0">
            <FollowUpTriggerConfig
              triggers={triggers}
              onTriggersChange={onTriggersChange}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <WhatsAppHistory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default FollowUpTabs;
