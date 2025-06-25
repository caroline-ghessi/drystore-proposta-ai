
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const ConsultationCallToAction = () => {
  return (
    <div className="text-center">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quer uma Consultoria Personalizada?
          </h3>
          <p className="text-gray-600 mb-6">
            Nossos especialistas podem ajudar você a escolher a combinação perfeita de soluções
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Falar com Especialista
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
