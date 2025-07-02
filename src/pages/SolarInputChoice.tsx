import React from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileText, Camera, PenTool, Sun } from 'lucide-react';

const SolarInputChoice = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (option: 'pdf' | 'photo' | 'manual') => {
    switch (option) {
      case 'pdf':
      case 'photo':
        navigate('/create-proposal/energia-solar/upload', { state: { type: option } });
        break;
      case 'manual':
        navigate('/create-proposal/energia-solar/manual');
        break;
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in">
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
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <Sun className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proposta de Energia Solar</h1>
              <p className="text-gray-600 mt-1">Como deseja informar os dados do cliente?</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 2 de 4</span>
            <span>50% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Opções de Input */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-yellow-500"
            onClick={() => handleOptionSelect('pdf')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-blue-100 p-6 rounded-lg mx-auto mb-6 w-fit">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">PDF da Conta de Luz</h3>
                <p className="text-gray-600 mb-6">
                  IA extrai automaticamente consumo histórico, tarifa e dados da concessionária
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>• Extração automática de dados</p>
                  <p>• Histórico de 12 meses</p>
                  <p>• Processamento inteligente</p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
            onClick={() => handleOptionSelect('photo')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-green-100 p-6 rounded-lg mx-auto mb-6 w-fit">
                  <Camera className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Foto da Conta</h3>
                <p className="text-gray-600 mb-6">
                  Tire uma foto da conta de luz e nossa IA extrairá os dados automaticamente
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>• Reconhecimento de imagem</p>
                  <p>• Prático e rápido</p>
                  <p>• Validação inteligente</p>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Enviar Foto
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-500"
            onClick={() => handleOptionSelect('manual')}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="bg-purple-100 p-6 rounded-lg mx-auto mb-6 w-fit">
                  <PenTool className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Input Manual</h3>
                <p className="text-gray-600 mb-6">
                  Preencha manualmente os dados do cliente e histórico de consumo
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <p>• Controle total dos dados</p>
                  <p>• Flexibilidade máxima</p>
                  <p>• Ideal para casos específicos</p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Preencher Manual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 <strong>PDF/Foto</strong>: Extração automática mais rápida | <strong>Manual</strong>: Controle total dos dados</p>
        </div>
      </div>
    </Layout>
  );
};

export default SolarInputChoice;