
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModernProposalHeaderProps {
  clientName: string;
  proposalNumber: string;
  validUntil: string;
  isExpired: boolean;
  onShare?: () => void;
}

export const ModernProposalHeader = ({ 
  clientName, 
  proposalNumber, 
  validUntil, 
  isExpired,
  onShare 
}: ModernProposalHeaderProps) => {
  const navigate = useNavigate();
  const firstName = clientName.split(' ')[0];

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {/* Top Bar */}
      <div className="border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-4">
              {!isExpired && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Válida até {validUntil}
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">
                  <Clock className="w-3 h-3 mr-1" />
                  Expirada
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={onShare}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Share className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Projeto Residencial Premium
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Proposta {proposalNumber} • Especialmente preparada para {firstName}
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Uma solução completa e personalizada para transformar sua casa em um lar dos sonhos, 
            com tecnologia, conforto e design exclusivos.
          </p>
        </div>
      </div>
    </div>
  );
};
