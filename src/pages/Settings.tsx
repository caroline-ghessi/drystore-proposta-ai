import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Globe } from 'lucide-react';
import { useState } from 'react';
const Settings = () => {
  const {
    user
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const [darkModeEnabled, setDarkModeEnabled] = useState(theme === 'dark');
  const handleThemeToggle = (checked: boolean) => {
    setDarkModeEnabled(checked);
    setTheme(checked ? 'dark' : 'light');
  };
  return <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas preferências e configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Settings */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <SettingsIcon className="w-5 h-5 mr-2 text-drystore-orange" />
                Configurações da Conta
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Gerencie suas configurações básicas de conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-900 dark:text-gray-100">Empresa</Label>
                  <Input id="company" placeholder="Nome da empresa" defaultValue="DryStore" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-gray-900 dark:text-gray-100">Fuso Horário</Label>
                  <Input id="timezone" defaultValue="America/Sao_Paulo" disabled className="bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Notificações</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 dark:text-gray-100">Notificações por Email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações importantes por email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 dark:text-gray-100">Notificações Push</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações no navegador</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 dark:text-gray-100">Relatórios Semanais</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receber resumo semanal por email</p>
                  </div>
                  <Switch className="bg-slate-50" />
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aparência</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 dark:text-gray-100">Tema Escuro</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Usar tema escuro na interface</p>
                  </div>
                  <Switch checked={darkModeEnabled} onCheckedChange={handleThemeToggle} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-gray-900 dark:text-gray-100">Modo Compacto</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reduzir espaçamento na interface</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full md:w-auto bg-drystore-orange hover:bg-drystore-orange-light text-white">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Shield className="w-5 h-5 mr-2 text-drystore-orange" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-gray-100">Função Atual</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-drystore-orange text-drystore-orange">{user?.role}</Badge>
                </div>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-3">
                <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Autenticação em 2 Fatores
                </Button>
                <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Sessões Ativas
                </Button>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Última Atividade</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hoje às 14:23</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Globe className="w-5 h-5 mr-2 text-drystore-orange" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-bold text-drystore-blue-technical">v2.1.0</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Versão Atual</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-bold text-drystore-green-sustainable">Online</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status do Sistema</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-bold text-drystore-orange">99.9%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default Settings;