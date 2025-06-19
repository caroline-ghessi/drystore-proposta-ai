
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Share, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

export const ShareModal = ({ isOpen, onClose, proposalId }: ShareModalProps) => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome e e-mail do destinatário.",
        variant: "destructive"
      });
      return;
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular envio da proposta e registro do compartilhamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Compartilhamento registrado:', {
        proposalId,
        recipientName,
        recipientEmail,
        message,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Proposta compartilhada!",
        description: `A proposta foi enviada para ${recipientName} (${recipientEmail})`,
      });

      // Resetar formulário
      setRecipientName('');
      setRecipientEmail('');
      setMessage('');
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Ocorreu um erro ao enviar a proposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientName('');
    setRecipientEmail('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share className="w-5 h-5 mr-2 text-orange-500" />
            Compartilhar Proposta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aviso sobre registro */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Aviso Importante</p>
                <p className="text-yellow-700">
                  Todos os compartilhamentos são registrados em nosso sistema para fins de acompanhamento e segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientName">Nome do destinatário *</Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="Ex: João Silva"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="recipientEmail">E-mail do destinatário *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="Ex: joao@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensagem personalizada (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem personalizada para acompanhar a proposta..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Proposta
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
