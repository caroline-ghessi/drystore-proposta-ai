
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Share, CheckCircle, Clock, Lightbulb, ArrowDown } from 'lucide-react';
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

  const scrollToSolution = () => {
    const element = document.querySelector('[id="investment-section"]');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-4000"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 border-b border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center space-x-4">
              {!isExpired && (
                <Badge className="bg-green-600/20 text-green-300 border border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Válida até {validUntil}
                </Badge>
              )}
              {isExpired && (
                <Badge variant="destructive" className="bg-red-600/20 text-red-300 border border-red-500/30">
                  <Clock className="w-3 h-3 mr-1" />
                  Expirada
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={onShare}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50"
              >
                <Share className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Badge */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 text-lg font-semibold rounded-full shadow-lg">
            🏗️ Construção Premium
          </Badge>
        </div>

        {/* Client Info */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Solução Personalizada para {firstName}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-300">
            <div className="flex items-center">
              <span className="text-orange-400 mr-2">📐</span>
              <span>Área: 120m²</span>
            </div>
            <div className="flex items-center">
              <span className="text-orange-400 mr-2">📍</span>
              <span>Residencial Premium</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-full px-6 py-3 flex items-center space-x-2">
            <span className="text-2xl">🏠</span>
            <span className="text-white font-medium">Construção</span>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-full px-6 py-3 flex items-center space-x-2">
            <span className="text-2xl">⭐</span>
            <span className="text-white font-medium">Energia Solar</span>
          </div>
        </div>

        {/* Central Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* Lightbulb Icon */}
              <div className="relative mx-auto mb-6 w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 flex items-center justify-center">
                  <Lightbulb className="w-12 h-12 text-gray-900" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Sua Solução Personalizada Está Aqui
              </h2>

              {/* Description */}
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Preparamos uma proposta exclusiva com as melhores soluções para seu projeto. 
                Cada detalhe foi pensado para superar suas expectativas.
              </p>

              {/* CTA Button */}
              <Button 
                onClick={scrollToSolution}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="mr-3">Ver Minha Solução</span>
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Number */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Proposta {proposalNumber}
          </p>
        </div>
      </div>
    </div>
  );
};
