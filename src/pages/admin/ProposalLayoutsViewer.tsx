
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PermissionGuard from '@/components/PermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Layout as LayoutIcon, Eye } from 'lucide-react';
import { PRODUCT_GROUPS, ProductGroup } from '@/types/productGroups';
import LayoutPreviewCard from '@/components/admin/layout-viewer/LayoutPreviewCard';
import LayoutFullPreview from '@/components/admin/layout-viewer/LayoutFullPreview';

const ProposalLayoutsViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLayout, setSelectedLayout] = useState<ProductGroup | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filteredGroups = PRODUCT_GROUPS.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewLayout = (groupId: string) => {
    setSelectedLayout(groupId as ProductGroup);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedLayout(null);
  };

  return (
    <PermissionGuard requiredRole={['admin']}>
      <Layout>
        <div className="animate-fade-in space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <LayoutIcon className="w-8 h-8 mr-3 text-blue-600" />
                Layouts de Propostas
              </h1>
              <p className="text-gray-600 mt-2">
                Visualize e valide todos os layouts de propostas disponíveis por grupo de produtos
              </p>
            </div>
            
            <Badge variant="secondary" className="text-sm">
              {PRODUCT_GROUPS.length} layouts disponíveis
            </Badge>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Layouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {PRODUCT_GROUPS.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Com Calculadora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  3
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Steel Frame, Solar, Shingle
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Cores Primárias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  7
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Diferentes paletas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Último Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  Hoje
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sistema atualizado
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome do layout ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>
                    {filteredGroups.length} de {PRODUCT_GROUPS.length} layouts
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layouts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((productGroup) => (
              <LayoutPreviewCard
                key={productGroup.id}
                productGroup={productGroup}
                onViewLayout={handleViewLayout}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredGroups.length === 0 && (
            <Card className="py-12">
              <CardContent className="text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum layout encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os termos de busca ou limpar os filtros.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <LayoutIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">
                    Sobre os Layouts de Propostas
                  </h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Cada layout é otimizado para um grupo específico de produtos, com design, 
                    cores e funcionalidades personalizadas. Os layouts com calculadora oferecem 
                    ferramentas interativas para melhorar a experiência do cliente e aumentar as conversões.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Layout Preview Modal */}
        <LayoutFullPreview
          productGroupId={selectedLayout}
          isOpen={previewOpen}
          onClose={handleClosePreview}
        />
      </Layout>
    </PermissionGuard>
  );
};

export default ProposalLayoutsViewer;
