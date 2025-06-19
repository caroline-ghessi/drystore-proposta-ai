
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Calendar, Clock, TrendingUp, Share, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProposalHeaderProps {
  proposal: {
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

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center space-x-3 ml-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D</span>
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Drystore</h1>
                  <p className="text-xs text-orange-500">Sua Solução Completa</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="text-orange-500 border-orange-500">
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      {/* Alerta de Expiração */}
      {proposal.isExpired && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">Proposta Expirada</p>
                <p className="text-sm">Esta proposta expirou em {proposal.expirationDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cabeçalho da Proposta */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{proposal.title}</h1>
              <p className="text-gray-600 mb-4">{proposal.subtitle}</p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{proposal.clientName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{proposal.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Válido até {proposal.validUntil}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
