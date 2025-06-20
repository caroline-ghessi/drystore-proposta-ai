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
import Layout from '@/components/Layout';
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
    excelColumns
  } = useProductImport();
  useEffect(() => {
    setProducts(getProducts());
  }, [currentImport?.status]);
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.code.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()));
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
  return <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestão de Produtos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gerencie seu catálogo de produtos e importe dados via planilhas Excel
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant={activeTab === 'list' ? 'default' : 'outline'} onClick={() => setActiveTab('list')} className="w-full sm:w-auto">
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Lista de Produtos</span>
              <span className="sm:hidden">Produtos</span>
              <span className="ml-1">({products.length})</span>
            </Button>
            <Button variant={activeTab === 'import' ? 'default' : 'outline'} onClick={() => setActiveTab('import')} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Importar Planilha</span>
              <span className="sm:hidden">Importar</span>
            </Button>
          </div>
        </div>

        {activeTab === 'list' && <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <CardTitle className="text-lg sm:text-xl">Produtos Cadastrados</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input placeholder="Buscar produtos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full sm:w-64" />
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                {filteredProducts.length > 0 ? <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[80px]">Código</TableHead>
                            <TableHead className="min-w-[150px]">Nome</TableHead>
                            <TableHead className="hidden sm:table-cell min-w-[100px]">Categoria</TableHead>
                            <TableHead className="hidden md:table-cell min-w-[80px]">Unidade</TableHead>
                            <TableHead className="min-w-[100px]">Preço</TableHead>
                            <TableHead className="hidden lg:table-cell min-w-[120px]">Fornecedor</TableHead>
                            <TableHead className="min-w-[80px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map(product => <TableRow key={product.id}>
                              <TableCell className="font-mono text-xs sm:text-sm">{product.code}</TableCell>
                              <TableCell className="font-medium text-xs sm:text-sm">
                                <div className="max-w-[150px] truncate" title={product.name}>
                                  {product.name}
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{product.category}</TableCell>
                              <TableCell className="hidden md:table-cell text-xs sm:text-sm">{product.unit}</TableCell>
                              <TableCell className="text-xs sm:text-sm font-medium">{formatPrice(product.price)}</TableCell>
                              <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{product.supplier || '-'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {product.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                              </TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div> : <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-slate-200">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-4 text-sm sm:text-base">
                      {searchTerm ? 'Tente ajustar sua busca' : 'Importe uma planilha para começar'}
                    </p>
                    {!searchTerm && <Button onClick={() => setActiveTab('import')} className="w-full sm:w-auto">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Produtos
                      </Button>}
                  </div>}
              </CardContent>
            </Card>
          </div>}

        {activeTab === 'import' && <div className="space-y-6">
            {!currentImport && <ExcelUploader onFileUpload={uploadExcelFile} isUploading={isUploading} />}

            {currentImport && currentImport.status === 'mapping' && <FieldMapper excelColumns={excelColumns} availableFields={getAllFields()} mapping={currentImport.mapping} onMappingChange={updateMapping} onAddCustomField={addCustomField} onConfirm={processImport} isProcessing={isProcessing} />}

            {currentImport && currentImport.status === 'completed' && <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Importação Concluída!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleImportComplete} className="w-full sm:w-auto">
                        Ver Produtos Importados
                      </Button>
                      <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
                        Nova Importação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>}
          </div>}
      </div>
    </Layout>;
};
export default ProductManagement;