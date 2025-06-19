
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Brain, Eye, FileText, Cpu, CheckCircle } from 'lucide-react';
import DrystoreCube from '@/components/DrystoreCube';

const TechnicalAnalysis = () => {
  const navigate = useNavigate();
  const [analysisStep, setAnalysisStep] = useState(0);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const analysisSteps = [
    { id: 'pdf-conversion', label: 'Convertendo PDF em imagens', icon: FileText },
    { id: 'adobe-extraction', label: 'Extraindo texto e tabelas (Adobe PDF Services)', icon: FileText },
    { id: 'ocr-analysis', label: 'Análise textual com IA (Memorial + Tabelas)', icon: Brain },
    { id: 'visual-analysis', label: 'Análise visual com IA Multimodal (Plantas + Símbolos)', icon: Eye },
    { id: 'data-unification', label: 'Unificando resultados das IAs', icon: Cpu },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (analysisStep < analysisSteps.length - 1) {
        setAnalysisStep(prev => prev + 1);
      } else if (ocrProgress < 100) {
        setOcrProgress(prev => Math.min(prev + 10, 100));
      } else if (visualProgress < 100) {
        setVisualProgress(prev => Math.min(prev + 15, 100));
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, 800);

    return () => clearInterval(timer);
  }, [analysisStep, ocrProgress, visualProgress]);

  const handleContinue = () => {
    navigate('/technical-table');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/upload-pdf')}
            className="mr-4 text-drystore-gray-medium hover:text-drystore-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <DrystoreCube size="md" className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-drystore-gray-dark">Análise Técnica com IA</h1>
              <p className="text-drystore-gray-medium mt-1">Extraindo dados técnicos do projeto arquitetônico</p>
            </div>
          </div>
        </div>

        <Card className="border border-drystore-gray-light shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-drystore-gray-dark">
              <Brain className="w-5 h-5 mr-2 text-drystore-orange" />
              Pipeline de Análise Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps Progress */}
            <div className="space-y-4">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === analysisStep;
                const isCompleted = index < analysisStep || isComplete;
                
                return (
                  <div key={step.id} className={`flex items-center p-4 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-orange-50 border-drystore-orange' 
                      : isCompleted 
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-drystore-gray-light'
                  }`}>
                    <div className={`p-2 rounded-lg mr-4 ${
                      isActive 
                        ? 'bg-drystore-orange text-white' 
                        : isCompleted
                          ? 'bg-drystore-green-sustainable text-white'
                          : 'bg-drystore-gray-light text-drystore-gray-medium'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isActive || isCompleted ? 'text-drystore-gray-dark' : 'text-drystore-gray-medium'
                      }`}>
                        {step.label}
                      </p>
                      {isActive && (
                        <div className="flex items-center mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-drystore-orange mr-2"></div>
                          <span className="text-sm text-drystore-orange">Processando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* IA Analysis Progress */}
            {analysisStep >= analysisSteps.length - 1 && (
              <div className="space-y-4 pt-6 border-t border-drystore-gray-light">
                <h4 className="font-semibold text-drystore-gray-dark">Análise Paralela das IAs</h4>
                
                {/* OCR/Textual IA */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-drystore-blue-technical mr-2" />
                      <span className="font-medium text-drystore-gray-dark">IA Textual (OCR)</span>
                    </div>
                    <span className="text-sm text-drystore-blue-technical font-medium">{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-drystore-blue-technical h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${ocrProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-700">
                    Analisando memorial descritivo, tabelas de materiais e especificações técnicas...
                  </p>
                </div>

                {/* Visual/Multimodal IA */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 text-drystore-green-sustainable mr-2" />
                      <span className="font-medium text-drystore-gray-dark">IA Visual (Multimodal)</span>
                    </div>
                    <span className="text-sm text-drystore-green-sustainable font-medium">{visualProgress}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-drystore-green-sustainable h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${visualProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-green-700">
                    Interpretando plantas, símbolos arquitetônicos, cotas e estimando quantidades...
                  </p>
                </div>
              </div>
            )}

            {/* Complete State */}
            {isComplete && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200 text-center">
                <CheckCircle className="w-12 h-12 text-drystore-green-sustainable mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-drystore-gray-dark mb-2">
                  Análise Técnica Concluída!
                </h3>
                <p className="text-drystore-gray-medium mb-4">
                  As IAs identificaram sistemas construtivos e extraíram quantitativos técnicos do projeto.
                </p>
                <Button 
                  onClick={handleContinue}
                  className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
                  size="lg"
                >
                  Ver Tabela Técnica
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TechnicalAnalysis;
