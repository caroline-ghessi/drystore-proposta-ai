
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MessageCircle, User } from 'lucide-react';
import { SalesRepresentative } from '@/types/auth';

interface SalesRepContactProps {
  representative: SalesRepresentative;
}

const SalesRepContact = ({ representative }: SalesRepContactProps) => {
  const handlePhoneCall = () => {
    window.open(`tel:${representative.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${representative.email}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Tenho algumas dúvidas sobre minha proposta.');
    window.open(`https://wa.me/${representative.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Seu Representante
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={representative.photo} alt={representative.name} />
            <AvatarFallback>
              {representative.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{representative.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{representative.territory}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePhoneCall}
                className="flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                Ligar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                className="flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                Email
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Dúvidas sobre suas propostas?</strong> Entre em contato diretamente com seu representante 
            pelos canais acima. Estamos aqui para ajudar!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesRepContact;
