
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Globe } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Configurações da Conta
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações básicas de conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Nome da empresa"
                    defaultValue="DryStore"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Input
                    id="timezone"
                    defaultValue="America/Sao_Paulo"
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações por Email</Label>
                    <p className="text-sm text-gray-600">Receber notificações importantes por email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notificações Push</Label>
                    <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Relatórios Semanais</Label>
                    <p className="text-sm text-gray-600">Receber resumo semanal por email</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Aparência</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Tema Escuro</Label>
                    <p className="text-sm text-gray-600">Usar tema escuro na interface</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Modo Compacto</Label>
                    <p className="text-sm text-gray-600">Reduzir espaçamento na interface</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full md:w-auto">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Função Atual</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{user?.role}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full">
                  Autenticação em 2 Fatores
                </Button>
                <Button variant="outline" className="w-full">
                  Sessões Ativas
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Última Atividade</h4>
                <p className="text-xs text-gray-600">Hoje às 14:23</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-blue-600">v2.1.0</h3>
                <p className="text-sm text-gray-600">Versão Atual</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-green-600">Online</h3>
                <p className="text-sm text-gray-600">Status do Sistema</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-purple-600">99.9%</h3>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
