
import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageSkeleton } from './PageSkeleton';

interface AppLoadingFallbackProps {
  type?: 'dashboard' | 'proposal' | 'form' | 'table' | 'spinner' | 'default';
  message?: string;
}

export const AppLoadingFallback: React.FC<AppLoadingFallbackProps> = ({ 
  type = 'spinner', 
  message = 'Carregando...' 
}) => {
  if (type === 'spinner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-drystore-orange mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{message}</p>
          <div className="mt-2 text-sm text-gray-400">
            Preparando a melhor experiência para você...
          </div>
        </div>
      </div>
    );
  }

  return <PageSkeleton type={type} />;
};
