
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, AlertTriangle, Users, Settings } from 'lucide-react';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import PermissionGuard from '@/components/PermissionGuard';

const SecurityManagement = () => {
  return (
    <PermissionGuard requiredRole={['admin']}>
      <Layout>
        <div className="min-h-screen bg-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Shield className="w-10 h-10 mr-3 text-blue-600" />
                Gerenciamento de Segurança
              </h1>
              <p className="text-lg text-gray-600">
                Monitoramento e controle de segurança da plataforma
              </p>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="access" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Controle de Acesso
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <SecurityDashboard />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos de Segurança Detalhados</CardTitle>
                    <CardDescription>
                      Análise completa de todos os eventos de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Funcionalidade em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="access" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Controle de Acesso</CardTitle>
                    <CardDescription>
                      Gerenciamento de permissões e bloqueios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Funcionalidade em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>
                      Ajustes de políticas e regras de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Funcionalidade em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </PermissionGuard>
  );
};

export default SecurityManagement;
