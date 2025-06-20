
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Users, Shield } from 'lucide-react';

const IntegrationConfigPanel = () => {
  const [erpConfig, setErpConfig] = useState({
    type: 'protheus',
    apiUrl: '',
    isActive: false
  });

  const [crmConfig, setCrmConfig] = useState({
    type: 'freshsales',
    apiUrl: 'https://domain.freshsales.io/api',
    isActive: false
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Configurações de Integração
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="erp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="erp">ERP</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="erp" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="font-medium">Integração ERP</h3>
              </div>
              <Badge variant={erpConfig.isActive ? "default" : "secondary"}>
                {erpConfig.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="erp-type">Tipo de ERP</Label>
                <select
                  id="erp-type"
                  className="w-full p-2 border rounded-md"
                  value={erpConfig.type}
                  onChange={(e) => setErpConfig({...erpConfig, type: e.target.value})}
                >
                  <option value="protheus">TOTVS Protheus</option>
                  <option value="datasul">TOTVS Datasul</option>
                  <option value="senior">Senior</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="erp-url">URL da API</Label>
                <Input
                  id="erp-url"
                  placeholder="https://seu-erp.com/api/v1"
                  value={erpConfig.apiUrl}
                  onChange={(e) => setErpConfig({...erpConfig, apiUrl: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="erp-active"
                  checked={erpConfig.isActive}
                  onCheckedChange={(checked) => setErpConfig({...erpConfig, isActive: checked})}
                />
                <Label htmlFor="erp-active">Ativar integração ERP</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                <h3 className="font-medium">Integração CRM</h3>
              </div>
              <Badge variant={crmConfig.isActive ? "default" : "secondary"}>
                {crmConfig.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="crm-type">Tipo de CRM</Label>
                <select
                  id="crm-type"
                  className="w-full p-2 border rounded-md"
                  value={crmConfig.type}
                  onChange={(e) => setCrmConfig({...crmConfig, type: e.target.value})}
                >
                  <option value="freshsales">Freshsales</option>
                  <option value="pipedrive">Pipedrive</option>
                  <option value="hubspot">HubSpot</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div>
                <Label htmlFor="crm-url">URL da API</Label>
                <Input
                  id="crm-url"
                  placeholder="https://domain.freshsales.io/api"
                  value={crmConfig.apiUrl}
                  onChange={(e) => setCrmConfig({...crmConfig, apiUrl: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="crm-active"
                  checked={crmConfig.isActive}
                  onCheckedChange={(checked) => setCrmConfig({...crmConfig, isActive: checked})}
                />
                <Label htmlFor="crm-active">Ativar integração CRM</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-600" />
              <h3 className="font-medium">Configuração de Segurança</h3>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">🔐 Chaves de API</h4>
              <p className="text-sm text-orange-700 mb-3">
                As chaves de API devem ser configuradas no Supabase Secrets para maior segurança.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>ERP API Key:</strong> Configure em <code>ERP_API_KEY</code></p>
                <p><strong>CRM API Key:</strong> Configure em <code>FRESHSALES_API_KEY</code></p>
                <p><strong>Webhook Secret:</strong> Configure em <code>WEBHOOK_SECRET</code></p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📋 Próximos Passos</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Configure as chaves no Supabase Secrets</p>
                <p>2. Ative as integrações desejadas</p>
                <p>3. Teste com uma proposta de exemplo</p>
                <p>4. Configure webhooks no ERP/CRM (se necessário)</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1">
            Testar Conexão
          </Button>
          <Button className="flex-1">
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationConfigPanel;
