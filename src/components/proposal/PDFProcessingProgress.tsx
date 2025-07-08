import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, FileText, Brain, Settings, Shield, Save } from 'lucide-react';

interface ProcessingStage {
  stage: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface PDFProcessingProgressProps {
  stages: ProcessingStage[];
  currentStage: string;
  fileName: string;
  totalProgress: number;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const PDFProcessingProgress: React.FC<PDFProcessingProgressProps> = ({
  stages,
  currentStage,
  fileName,
  totalProgress,
  error,
  onRetry,
  onCancel
}) => {
  const getStageIcon = (stage: ProcessingStage) => {
    if (stage.status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (stage.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (stage.status === 'processing') {
      return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processando</Badge>;
      default:
        return <Badge variant="secondary">Aguardando</Badge>;
    }
  };

  const defaultStages: ProcessingStage[] = [
    {
      stage: 'text_extraction',
      name: 'Extração de Texto',
      icon: <FileText className="w-5 h-5" />,
      status: 'pending'
    },
    {
      stage: 'data_organization',
      name: 'Organização de Dados',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending'
    },
    {
      stage: 'data_formatting',
      name: 'Formatação',
      icon: <Settings className="w-5 h-5" />,
      status: 'pending'
    },
    {
      stage: 'data_validation',
      name: 'Validação',
      icon: <Shield className="w-5 h-5" />,
      status: 'pending'
    },
    {
      stage: 'data_saving',
      name: 'Salvamento',
      icon: <Save className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  const finalStages = stages.length > 0 ? stages : defaultStages;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Processando PDF</h3>
            <p className="text-sm text-muted-foreground">{fileName}</p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={totalProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {totalProgress.toFixed(0)}% concluído
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Erro no processamento</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
              {onRetry && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={onRetry}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Tentar Novamente
                  </button>
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Processing Stages */}
          <div className="space-y-3">
            {finalStages.map((stage, index) => (
              <div
                key={stage.stage}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  stage.status === 'processing' ? 'bg-blue-50 border-blue-200' :
                  stage.status === 'success' ? 'bg-green-50 border-green-200' :
                  stage.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                {getStageIcon(stage)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{stage.name}</span>
                    {getStatusBadge(stage.status)}
                  </div>
                  {stage.message && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stage.message}
                    </p>
                  )}
                  {stage.duration && stage.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">
                      Concluído em {(stage.duration / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Current Stage Info */}
          {currentStage && !error && (
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Processando: {finalStages.find(s => s.stage === currentStage)?.name || currentStage}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};