import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, PenTool } from 'lucide-react';
import { PRODUCT_GROUPS, ProductGroup } from '@/types/productGroups';

const ProductUploadChoice = () => {
  const navigate = useNavigate();
  const { productGroup } = useParams<{ productGroup: ProductGroup }>();
  
  const selectedProduct = PRODUCT_GROUPS.find(p => p.id === productGroup);

  const handleOptionSelect = (option: 'pdf' | 'manual') => {
    if (option === 'pdf') {
      navigate('/proposal-upload-choice', { state: { productGroup } });
    } else {
      navigate(`/proposal-builder?productGroup=${productGroup}`);
    }
  };

  if (!selectedProduct) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Button onClick={() => navigate('/create-proposal')}>
            Voltar para seleção de produtos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-proposal')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <div className="text-3xl mr-4">{selectedProduct.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <p className="text-gray-600 mt-1">Como deseja criar a proposta?</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 2 de 3</span>
            <span>66% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Opções de Criação */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-drystore-blue"
            onClick={() => handleOptionSelect('pdf')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-100 p-6 rounded-lg mx-auto mb-6 w-fit">
                  <FileText className="w-12 h-12 text-drystore-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Upload de PDF</h3>
                <p className="text-gray-600 mb-6">
                  IA extrai dados automaticamente de PDFs com quantitativos para {selectedProduct.name.toLowerCase()}
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>• Extração automática de dados</p>
                  <p>• Processamento inteligente</p>
                  <p>• Geração rápida de proposta</p>
                </div>
                <Button 
                  className="w-full gradient-bg hover:opacity-90"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200"
            onClick={() => handleOptionSelect('manual')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-lg mx-auto mb-6 w-fit">
                  <PenTool className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Criar Manualmente</h3>
                <p className="text-gray-600 mb-6">
                  Crie uma proposta de {selectedProduct.name.toLowerCase()} preenchendo todos os dados manualmente
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>• Controle total dos dados</p>
                  <p>• Preenchimento manual</p>
                  <p>• Ideal para casos específicos</p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Criar Manualmente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Para <strong>{selectedProduct.name}</strong>: Upload de PDF para importação rápida ou criação manual para controle total</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProductUploadChoice;