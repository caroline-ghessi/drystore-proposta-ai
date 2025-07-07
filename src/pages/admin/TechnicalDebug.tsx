
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Activity,
  UserPlus,
  Eye,
  Brain,
  Bot
} from 'lucide-react';
import PermissionGuard from '@/components/PermissionGuard';
import AdobeDebugTab from '@/components/admin/debug/AdobeDebugTab';
import WhapiDebugTab from '@/components/admin/debug/WhapiDebugTab';
import SystemDebugTab from '@/components/admin/debug/SystemDebugTab';
import LogsDebugTab from '@/components/admin/debug/LogsDebugTab';
import EmailDebugTab from '@/components/admin/debug/EmailDebugTab';
import WhapiManagementTab from '@/components/admin/debug/WhapiManagementTab';
import SignUpDebugTab from '@/components/admin/debug/SignUpDebugTab';
import GoogleVisionDebugTab from '@/components/admin/debug/GoogleVisionDebugTab';
import GrokDebugTab from '@/components/admin/debug/GrokDebugTab';
import OpenAIDebugTab from '@/components/admin/debug/OpenAIDebugTab';
import DebugHeader from '@/components/admin/debug/DebugHeader';
import StatusOverview from '@/components/admin/debug/StatusOverview';
import QuickActions from '@/components/admin/debug/QuickActions';
import SystemInfo from '@/components/admin/debug/SystemInfo';

const TechnicalDebug = () => {
  const [activeTab, setActiveTab] = useState('whapi-config');
  const [systemStatus, setSystemStatus] = useState({
    overall: 'healthy',
    lastCheck: new Date().toISOString()
  });

  const handleRefreshStatus = () => {
    setSystemStatus({
      overall: 'checking',
      lastCheck: new Date().toISOString()
    });
    
    setTimeout(() => {
      setSystemStatus({
        overall: 'healthy',
        lastCheck: new Date().toISOString()
      });
    }, 2000);
  };

  return (
    <PermissionGuard requiredRole={['admin']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <DebugHeader 
          systemStatus={systemStatus}
          onRefreshStatus={handleRefreshStatus}
        />

        {/* Status Cards Overview */}
        <StatusOverview systemStatus={systemStatus} />

        {/* Main Debug Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Central de Diagnóstico e Configuração</CardTitle>
            <CardDescription>
              Todas as ferramentas de debug, teste e configuração em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="space-y-2">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="adobe" className="flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs">Adobe PDF</span>
                  </TabsTrigger>
                  <TabsTrigger value="google-vision" className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs">Google Vision</span>
                  </TabsTrigger>
                  <TabsTrigger value="grok" className="flex items-center space-x-1">
                    <Brain className="w-3 h-3" />
                    <span className="text-xs">Grok AI</span>
                  </TabsTrigger>
                  <TabsTrigger value="openai" className="flex items-center space-x-1">
                    <Bot className="w-3 h-3" />
                    <span className="text-xs">OpenAI</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span className="text-xs">Email</span>
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="whapi-config" className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">Whapi Config</span>
                  </TabsTrigger>
                  <TabsTrigger value="whapi" className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">Whapi Test</span>
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center space-x-1">
                    <UserPlus className="w-3 h-3" />
                    <span className="text-xs">Sign Up</span>
                  </TabsTrigger>
                  <TabsTrigger value="system" className="flex items-center space-x-1">
                    <Settings className="w-3 h-3" />
                    <span className="text-xs">Sistema</span>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span className="text-xs">Logs</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-6">
                <TabsContent value="adobe" className="space-y-4">
                  <AdobeDebugTab />
                </TabsContent>

                <TabsContent value="google-vision" className="space-y-4">
                  <GoogleVisionDebugTab />
                </TabsContent>

                <TabsContent value="grok" className="space-y-4">
                  <GrokDebugTab />
                </TabsContent>

                <TabsContent value="openai" className="space-y-4">
                  <OpenAIDebugTab />
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <EmailDebugTab />
                </TabsContent>

                <TabsContent value="whapi-config" className="space-y-4">
                  <WhapiManagementTab />
                </TabsContent>

                <TabsContent value="whapi" className="space-y-4">
                  <WhapiDebugTab />
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <SignUpDebugTab />
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                  <SystemDebugTab />
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  <LogsDebugTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />

        {/* Footer Info */}
        <SystemInfo lastCheck={systemStatus.lastCheck} />
      </div>
    </PermissionGuard>
  );
};

export default TechnicalDebug;
