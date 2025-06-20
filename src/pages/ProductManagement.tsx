
import React, { useState, useEffect } from 'react';
import { Package, Upload, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductImport } from '@/hooks/useProductImport';
import { ExcelUploader } from '@/components/products/ExcelUploader';
import { FieldMapper } from '@/components/products/FieldMapper';
import { Product } from '@/types/products';

const ProductManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'import'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  
  const {
    uploadExcelFile,
    updateMapping,
    addCustomField,
    processImport,
    getProducts,
    getAllFields,
    isUploading,
    isProcessing,
    currentImport,
    excelColumns,
  } = useProductImport();

  useEffect(() => {
    setProducts(getProducts());
  }, [currentImport?.status]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportComplete = () => {
    setProducts(getProducts());
    setActiveTab('list');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestão de Produtos
          </h1>
          <p className="text-gray-600">
            Gerencie seu catálogo de produtos e importe dados via planilhas Excel
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'list' ? 'default' : 'outline'}
            onClick={() => setActiveTab('list')}
          >
            <Package className="h-4 w-4 mr-2" />
            Lista de Produtos ({products.length})
          </Button>
          <Button
            variant={activeTab === 'import' ? 'default' : 'outline'}
            onClick={() => setActiveTab('import')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Planilha
          </Button>
        </div>

        {activeTab === 'list' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Produtos Cadastrados</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredProducts.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-mono">{product.code}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{formatPrice(product.price)}</TableCell>
                            <TableCell>{product.supplier || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 'Tente ajustar sua busca' : 'Importe uma planilha para começar'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setActiveTab('import')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Produtos
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-6">
            {!currentImport && (
              <ExcelUploader
                onFileUpload={uploadExcelFile}
                isUploading={isUploading}
              />
            )}

            {currentImport && currentImport.status === 'mapping' && (
              <FieldMapper
                excelColumns={excelColumns}
                availableFields={getAllFields()}
                mapping={currentImport.mapping}
                onMappingChange={updateMapping}
                onAddCustomField={addCustomField}
                onConfirm={processImport}
                isProcessing={isProcessing}
              />
            )}

            {currentImport && currentImport.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Importação Concluída!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentImport.successfulRows}
                        </div>
                        <div className="text-sm text-gray-600">Produtos Importados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {currentImport.failedRows}
                        </div>
                        <div className="text-sm text-gray-600">Erros</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentImport.totalRows}
                        </div>
                        <div className="text-sm text-gray-600">Total de Linhas</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleImportComplete}>
                        Ver Produtos Importados
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        Nova Importação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
