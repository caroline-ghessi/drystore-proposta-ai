
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Edit, Sparkles, Phone } from 'lucide-react';
import { FollowUpMessage } from '@/types/followup';
import { useFollowUpAI } from '@/hooks/useFollowUpAI';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';

interface FollowUpMessageCardProps {
  followUpMessage: FollowUpMessage;
  onMessageSent: (messageId: string) => void;
}

const FollowUpMessageCard = ({ followUpMessage, onMessageSent }: FollowUpMessageCardProps) => {
  const [editedMessage, setEditedMessage] = useState(followUpMessage.editedMessage || followUpMessage.originalMessage);
  const [improvementInstruction, setImprovementInstruction] = useState('');
  const [zapiToken, setZapiToken] = useState(localStorage.getItem('zapi_token') || '');
  
  const { improveMessage, isImproving } = useFollowUpAI();
  const { sendWhatsAppMessage, isSending } = useWhatsAppAPI();

  const handleImproveMessage = async () => {
    if (!improvementInstruction.trim()) return;
    
    try {
      const improved = await improveMessage(editedMessage, improvementInstruction);
      setEditedMessage(improved);
      setImprovementInstruction('');
    } catch (error) {
      console.error('Erro ao melhorar mensagem:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!zapiToken.trim()) {
      alert('Configure o token Z-API primeiro');
      return;
    }

    localStorage.setItem('zapi_token', zapiToken);
    
    try {
      await sendWhatsAppMessage(
        followUpMessage.clientPhone,
        followUpMessage.vendorPhone,
        editedMessage,
        zapiToken
      );
      onMessageSent(followUpMessage.id);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            Follow-up para {followUpMessage.clientName}
          </CardTitle>
          <Badge variant="secondary">
            {followUpMessage.triggerType.replace('_', ' ')}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          <p>📱 Cliente: {followUpMessage.clientPhone}</p>
          <p>👤 Vendedor: {followUpMessage.vendorName}</p>
          {followUpMessage.lastPurchase && (
            <p>🛒 Última compra: {followUpMessage.lastPurchase.productName}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Produtos Sugeridos */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
            Produtos Sugeridos pela IA
          </h4>
          <div className="space-y-2">
            {followUpMessage.suggestedProducts.map((product) => (
              <div key={product.id} className="bg-blue-50 p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm">{product.name}</h5>
                  <span className="text-green-600 font-semibold">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{product.description}</p>
                <p className="text-xs text-blue-700">{product.reason}</p>
                {product.urgencyMessage && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {product.urgencyMessage}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Configuração Z-API */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Phone className="w-4 h-4 mr-2 text-orange-600" />
            Token Z-API
          </h4>
          <Input
            type="password"
            placeholder="Cole seu token Z-API aqui..."
            value={zapiToken}
            onChange={(e) => setZapiToken(e.target.value)}
            className="mb-2"
          />
          <p className="text-xs text-gray-500">
            Configure seu token Z-API para enviar mensagens via WhatsApp
          </p>
        </div>

        <Separator />

        {/* Mensagem IA */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Edit className="w-4 h-4 mr-2 text-purple-600" />
            Mensagem Gerada pela IA
          </h4>
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={6}
            className="mb-3"
          />
        </div>

        {/* Melhorar Mensagem */}
        <div>
          <h4 className="font-medium mb-2">🧠 Instrução para IA Melhorar</h4>
          <div className="flex space-x-2">
            <Input
              placeholder='Ex: "Deixa mais direta", "Mais técnica", "Mais urgente"'
              value={improvementInstruction}
              onChange={(e) => setImprovementInstruction(e.target.value)}
            />
            <Button
              onClick={handleImproveMessage}
              disabled={isImproving || !improvementInstruction.trim()}
              variant="outline"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {isImproving ? 'Melhorando...' : 'Melhorar'}
            </Button>
          </div>
        </div>

        {/* Botão Enviar */}
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !zapiToken.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Send className="w-5 h-5 mr-2" />
          {isSending ? 'Enviando...' : 'Enviar via WhatsApp'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FollowUpMessageCard;
