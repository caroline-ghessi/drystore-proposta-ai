
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Calendar, Clock, TrendingUp, Share, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShareModal } from './ShareModal';

interface ProposalHeaderProps {
  proposal: {
    id?: string;
    title: string;
    subtitle: string;
    clientName: string;
    date: string;
    validUntil: string;
    isExpired: boolean;
    expirationDate: string;
  };
}

export const ProposalHeader = ({ proposal }: ProposalHeaderProps) => {
  const navigate = useNavigate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Extrair o primeiro nome do cliente para personalização
  const getFirstName = (fullName: string) => {
    if (!fullName || fullName === 'PROPOSTA COMERCIAL' || fullName === 'Cliente') {
      return 'Cliente';
    }
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(proposal.clientName);

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Back Button */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
            
            {/* Center - Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-32 h-32 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png" 
                  alt="Drystore Logo" 
                  className="w-32 h-32 object-contain dark:brightness-0 dark:invert"
                />
              </div>
            </div>
            
            {/* Right Side - Share Button */}
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-orange-500 border-orange-500 dark:text-orange-400 dark:border-orange-400"
                onClick={handleShare}
              >
                <Share className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        proposalId={proposal.id || 'unknown'}
      />

      {/* Alerta de Expiração */}
      {proposal.isExpired && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Proposta Expirada</p>
                  <p className="text-sm">Esta proposta expirou em {proposal.expirationDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Card Unificado - Boas-vindas + Detalhes da Proposta */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            {/* Seção de Boas-vindas */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-1">
                  👋 Olá, {firstName}!
                </h2>
                <p className="text-orange-700 dark:text-orange-300 text-lg">
                  Aqui está a sua proposta personalizada, preparada especialmente para você.
                </p>
              </div>
            </div>

            {/* Seção de Detalhes da Proposta */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{proposal.title}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{proposal.subtitle}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{proposal.clientName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{proposal.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Válido até {proposal.validUntil}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
