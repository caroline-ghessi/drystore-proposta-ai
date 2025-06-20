
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const TechnicalChatCard = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-blue-900">Dúvidas Técnicas?</h3>
        <MessageCircle className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-sm text-blue-800 mb-3">
        Converse com nossa IA especializada para esclarecer detalhes técnicos sobre os produtos e soluções.
      </p>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
        Iniciar Chat Técnico
      </Button>
    </div>
  );
};

export default TechnicalChatCard;
