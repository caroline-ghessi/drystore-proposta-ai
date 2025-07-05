import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Zap, Settings, BarChart3 } from 'lucide-react';
import { SolarPanelsManager } from '@/components/admin/solar/SolarPanelsManager';
import { InvertersManager } from '@/components/admin/solar/InvertersManager';
import { SolarConfigManager } from '@/components/admin/solar/SolarConfigManager';
import { SolarDashboard } from '@/components/admin/solar/SolarDashboard';

const SolarProductsManagement = () => {
  const [activeTab, setActiveTab] = useState('panels');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de Produtos Solares
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie painéis, inversores e configurações do sistema de energia solar
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="panels" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline">Painéis Solares</span>
              <span className="sm:hidden">Painéis</span>
            </TabsTrigger>
            <TabsTrigger value="inverters" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Inversores</span>
              <span className="sm:hidden">Inversores</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
          </TabsList>

          {/* Painéis Solares */}
          <TabsContent value="panels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  Gestão de Painéis Solares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SolarPanelsManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inversores */}
          <TabsContent value="inverters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Gestão de Inversores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvertersManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SolarConfigManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <SolarDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SolarProductsManagement;