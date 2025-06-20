
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductImport, FieldMapping, ExcelColumn, ProductField, PRODUCT_FIELDS } from '@/types/products';

export const useProductImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImport, setCurrentImport] = useState<ProductImport | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<ExcelColumn[]>([]);
  const [customFields, setCustomFields] = useState<ProductField[]>([]);
  const { toast } = useToast();

  const uploadExcelFile = async (file: File): Promise<void> => {
    setIsUploading(true);
    
    try {
      console.log('Fazendo upload do arquivo Excel:', file.name);
      
      // Simular análise do arquivo Excel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dados simulados do Excel
      const mockData = [
        { 'Código': 'DRY001', 'Nome': 'Placa Drywall 12,5mm', 'Categoria': 'Placas', 'Preço': '45.90', 'Unidade': 'UN' },
        { 'Código': 'DRY002', 'Nome': 'Perfil Guia 48mm', 'Categoria': 'Perfis', 'Preço': '12.30', 'Unidade': 'M' },
        { 'Código': 'DRY003', 'Nome': 'Parafuso Drywall 25mm', 'Categoria': 'Fixação', 'Preço': '0.15', 'Unidade': 'UN' }
      ];
      
      const columns: ExcelColumn[] = [
        { name: 'Código', type: 'string', sampleValues: ['DRY001', 'DRY002'] },
        { name: 'Nome', type: 'string', sampleValues: ['Placa Drywall 12,5mm', 'Perfil Guia 48mm'] },
        { name: 'Categoria', type: 'string', sampleValues: ['Placas', 'Perfis'] },
        { name: 'Preço', type: 'string', sampleValues: ['45.90', '12.30'] },
        { name: 'Unidade', type: 'string', sampleValues: ['UN', 'M'] }
      ];
      
      setExcelData(mockData);
      setExcelColumns(columns);
      
      const importData: ProductImport = {
        id: Date.now().toString(),
        fileName: file.name,
        totalRows: mockData.length,
        processedRows: 0,
        successfulRows: 0,
        failedRows: 0,
        status: 'mapping',
        mapping: {},
        errors: [],
        createdAt: new Date().toISOString()
      };
      
      setCurrentImport(importData);
      
      toast({
        title: "Arquivo carregado!",
        description: `${mockData.length} linhas encontradas. Configure o mapeamento dos campos.`,
      });
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: "Não foi possível processar o arquivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateMapping = (mapping: FieldMapping): void => {
    if (currentImport) {
      setCurrentImport({
        ...currentImport,
        mapping
      });
    }
  };

  const addCustomField = (field: ProductField): void => {
    setCustomFields(prev => [...prev, field]);
  };

  const processImport = async (): Promise<void> => {
    if (!currentImport || !excelData.length) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Processando importação com mapeamento:', currentImport.mapping);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const products: Product[] = excelData.map((row, index) => {
        const product: Product = {
          id: `prod_${Date.now()}_${index}`,
          code: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'code') || ''] || '',
          name: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'name') || ''] || '',
          description: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'description') || ''] || '',
          category: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'category') || ''] || '',
          unit: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'unit') || ''] || '',
          price: parseFloat(row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'price') || ''] || '0'),
          supplier: row[Object.keys(currentImport.mapping).find(k => currentImport.mapping[k].targetField === 'supplier') || ''] || '',
          specifications: {},
          tags: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return product;
      });
      
      // Salvar produtos no localStorage (em produção seria no Supabase)
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const allProducts = [...existingProducts, ...products];
      localStorage.setItem('products', JSON.stringify(allProducts));
      
      setCurrentImport({
        ...currentImport,
        status: 'completed',
        processedRows: excelData.length,
        successfulRows: excelData.length,
        failedRows: 0,
        completedAt: new Date().toISOString()
      });
      
      toast({
        title: "Importação Concluída!",
        description: `${products.length} produtos importados com sucesso`,
      });
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro na Importação",
        description: "Não foi possível processar os dados",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getProducts = (): Product[] => {
    return JSON.parse(localStorage.getItem('products') || '[]');
  };

  const getAllFields = (): ProductField[] => {
    return [...PRODUCT_FIELDS, ...customFields];
  };

  return {
    uploadExcelFile,
    updateMapping,
    addCustomField,
    processImport,
    getProducts,
    getAllFields,
    isUploading,
    isProcessing,
    currentImport,
    excelData,
    excelColumns,
    customFields
  };
};
