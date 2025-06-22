
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Activity
} from 'lucide-react';
import PermissionGuard from '@/components/PermissionGuard';
import AdobeDebugTab from '@/components/admin/debug/AdobeDebugTab';
import ZAPIDebugTab from '@/components/admin/debug/ZAPIDebugTab';
import SystemDebugTab from '@/components/admin/debug/SystemDebugTab';
import LogsDebugTab from '@/components/admin/debug/LogsDebugTab';
import EmailDebugTab from '@/components/admin/debug/EmailDebugTab';
import ZAPIManagementTab from '@/components/admin/debug/ZAPIManagementTab';
import DebugHeader from '@/components/admin/debug/DebugHeader';
import StatusOverview from '@/components/admin/debug/StatusOverview';
import QuickActions from '@/components/admin/debug/QuickActions';
import SystemInfo from '@/components/admin/debug/SystemInfo';

const TechnicalDebug = () => {
  const [activeTab, setActiveTab] = useState('adobe');
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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="adobe" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Adobe PDF</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="zapi-config" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Z-API Config</span>
                </TabsTrigger>
                <TabsTrigger value="zapi" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Z-API Test</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Sistema</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Logs</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="adobe" className="space-y-4">
                  <AdobeDebugTab />
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  <EmailDebugTab />
                </TabsContent>

                <TabsContent value="zapi-config" className="space-y-4">
                  <ZAPIManagementTab />
                </TabsContent>

                <TabsContent value="zapi" className="space-y-4">
                  <ZAPIDebugTab />
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
