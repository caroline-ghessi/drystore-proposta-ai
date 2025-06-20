
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Proposals = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
            <p className="text-gray-600 mt-2">Gerencie todas as suas propostas comerciais</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Propostas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as propostas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Em breve: Interface completa para gerenciamento de propostas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Proposals;
