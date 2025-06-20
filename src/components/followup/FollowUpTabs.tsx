
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
    <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
      <div className="overflow-x-auto">
        <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
          <TabsTrigger value="pending" className="relative text-xs sm:text-sm">
            <span className="hidden sm:inline">Pendentes</span>
            <span className="sm:hidden">Pend.</span>
            {pendingMessages.length > 0 && (
              <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs">{pendingMessages.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Enviados</span>
            <span className="sm:hidden">Env.</span>
          </TabsTrigger>
          <TabsTrigger value="triggers" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Configurações</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Histórico</span>
            <span className="sm:hidden">Hist.</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pending" className="space-y-4 sm:space-y-6">
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

      <TabsContent value="sent" className="space-y-4 sm:space-y-6">
        {sentMessages.map((message) => (
          <Card key={message.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium">{message.clientName}</h3>
                  <p className="text-sm text-gray-600">{message.clientPhone}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm self-start sm:self-auto">
                  Enviado em {new Date(message.sentAt!).toLocaleString('pt-BR')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{message.finalMessage}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="triggers">
        <FollowUpTriggerConfig
          triggers={triggers}
          onTriggersChange={onTriggersChange}
        />
      </TabsContent>

      <TabsContent value="history">
        <WhatsAppHistory />
      </TabsContent>
    </Tabs>
  );
};

export default FollowUpTabs;
