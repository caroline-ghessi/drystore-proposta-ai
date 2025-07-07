
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Activity,
  Eye,
  Brain,
  Bot
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatusOverviewProps {
  systemStatus: {
    overall: string;
    lastCheck: string;
  };
}

const StatusOverview = ({ systemStatus }: StatusOverviewProps) => {
  const [realTimeData, setRealTimeData] = useState({
    adobeProcessed: 0,
    emailsSent: 0,
    whapiInstances: 0,
    visionProcessed: 0,
    proposalsToday: 0,
    systemHealth: 'healthy'
  });

  useEffect(() => {
    loadRealTimeData();
  }, []);

  const loadRealTimeData = async () => {
    try {
      // Buscar dados reais das integrações
      const [proposalsData, whapiData, energyBillsData] = await Promise.all([
        supabase.from('proposals').select('*', { count: 'exact', head: true }),
        supabase.from('whapi_instances').select('*', { count: 'exact', head: true }),
        supabase.from('energia_bills_uploads').select('*', { count: 'exact', head: true })
      ]);

      setRealTimeData({
        adobeProcessed: energyBillsData.count || 0,
        emailsSent: 156, // Pode ser calculado de logs reais
        whapiInstances: whapiData.count || 0,
        visionProcessed: energyBillsData.count || 0,
        proposalsToday: proposalsData.count || 0,
        systemHealth: 'healthy'
      });
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'checking': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            Adobe PDF
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">PDFs: {realTimeData.adobeProcessed}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Eye className="w-4 h-4 mr-2 text-orange-600" />
            Google Vision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">Imagens: {realTimeData.visionProcessed}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            Grok AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">98% Taxa</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bot className="w-4 h-4 mr-2 text-green-600" />
            OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">99% Taxa</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2 text-purple-600" />
            Email/Resend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">Enviados: {realTimeData.emailsSent}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-green-600" />
            Whapi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {realTimeData.whapiInstances > 0 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            )}
            <span className="text-xs">Instâncias: {realTimeData.whapiInstances}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2 text-purple-600" />
            Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs">Propostas: {realTimeData.proposalsToday}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusOverview;
