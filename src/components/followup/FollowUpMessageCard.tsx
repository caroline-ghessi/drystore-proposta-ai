import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Edit, Sparkles, Settings } from 'lucide-react';
import { FollowUpMessage } from '@/types/followup';
import { useFollowUpAI } from '@/hooks/useFollowUpAI';
import { useWhatsAppAPI } from '@/hooks/useWhatsAppAPI';
import { useAuth } from '@/contexts/AuthContext';
interface FollowUpMessageCardProps {
  followUpMessage: FollowUpMessage;
  onMessageSent: (messageId: string) => void;
}
const FollowUpMessageCard = ({
  followUpMessage,
  onMessageSent
}: FollowUpMessageCardProps) => {
  const [editedMessage, setEditedMessage] = useState(followUpMessage.editedMessage || followUpMessage.originalMessage);
  const [improvementInstruction, setImprovementInstruction] = useState('');
  const {
    user
  } = useAuth();
  const {
    improveMessage,
    isImproving
  } = useFollowUpAI();
  const {
    sendWhatsAppMessage,
    isSending,
    getVendorZAPIConfig
  } = useWhatsAppAPI();

  // Verificar se o vendedor tem configuração Z-API
  const vendorConfig = getVendorZAPIConfig(followUpMessage.vendorId || 'default');
  const hasZAPIConfig = vendorConfig && vendorConfig.token;
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
    if (!hasZAPIConfig) {
      alert('Configuração Z-API não encontrada. Entre em contato com o administrador.');
      return;
    }
    try {
      await sendWhatsAppMessage(followUpMessage.clientPhone, followUpMessage.vendorPhone, editedMessage, followUpMessage.vendorId || 'default');
      onMessageSent(followUpMessage.id);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    }
  };
  return <Card className="border-0 shadow-lg">
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
          {followUpMessage.lastPurchase && <p>🛒 Última compra: {followUpMessage.lastPurchase.productName}</p>}
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
            {followUpMessage.suggestedProducts.map(product => <div key={product.id} className="bg-blue-50 p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm text-slate-950">{product.name}</h5>
                  <span className="text-green-600 font-semibold">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{product.description}</p>
                <p className="text-xs text-blue-700">{product.reason}</p>
                {product.urgencyMessage && <Badge variant="destructive" className="mt-1 text-xs">
                    {product.urgencyMessage}
                  </Badge>}
              </div>)}
          </div>
        </div>

        <Separator />

        {/* Status da Configuração Z-API */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2 text-orange-600" />
            Status Z-API
          </h4>
          {hasZAPIConfig ? <div className="flex items-center text-green-600">
              <span className="text-sm">✅ Configurado para {followUpMessage.vendorName}</span>
            </div> : <div className="flex items-center text-red-600">
              <span className="text-sm">❌ Não configurado para {followUpMessage.vendorName}</span>
              {user?.role === 'admin' && <span className="text-xs ml-2 text-gray-500">
                  (Configure nas configurações administrativas)
                </span>}
            </div>}
        </div>

        <Separator />

        {/* Mensagem IA */}
        <div>
          <h4 className="font-medium mb-3 flex items-center">
            <Edit className="w-4 h-4 mr-2 text-purple-600" />
            Mensagem Gerada pela IA
          </h4>
          <Textarea value={editedMessage} onChange={e => setEditedMessage(e.target.value)} rows={6} className="mb-3" />
        </div>

        {/* Melhorar Mensagem */}
        <div>
          <h4 className="font-medium mb-2">🧠 Instrução para IA Melhorar</h4>
          <div className="flex space-x-2">
            <input className="flex-1 px-3 py-2 border border-gray-300 rounded-md" placeholder='Ex: "Deixa mais direta", "Mais técnica", "Mais urgente"' value={improvementInstruction} onChange={e => setImprovementInstruction(e.target.value)} />
            <Button onClick={handleImproveMessage} disabled={isImproving || !improvementInstruction.trim()} variant="outline">
              <Sparkles className="w-4 h-4 mr-1" />
              {isImproving ? 'Melhorando...' : 'Melhorar'}
            </Button>
          </div>
        </div>

        {/* Botão Enviar */}
        <Button onClick={handleSendMessage} disabled={isSending || !hasZAPIConfig} className="w-full bg-green-600 hover:bg-green-700" size="lg">
          <Send className="w-5 h-5 mr-2" />
          {isSending ? 'Enviando...' : 'Enviar via WhatsApp'}
        </Button>
      </CardContent>
    </Card>;
};
export default FollowUpMessageCard;