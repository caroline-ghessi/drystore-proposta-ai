
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  project: string;
  content: string;
  rating: number;
  avatar: string;
  location: string;
}

export const ClientTestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Carlos Eduardo Silva',
      company: 'Metalúrgica Silva & Cia',
      project: 'Estoque Automatizado Industrial',
      content: 'A Drystore transformou completamente nosso processo de armazenamento. Conseguimos otimizar 40% do espaço e reduzir em 60% o tempo de localização de produtos. Equipe extremamente profissional e soluções inovadoras.',
      rating: 5,
      avatar: '/lovable-uploads/291814a9-274a-4cf1-818c-67ec1b0e1dff.png',
      location: 'São Paulo, SP'
    },
    {
      id: '2',
      name: 'Marina Costa',
      company: 'Distribuidora MC',
      project: 'Sistema de Armazenamento Vertical',
      content: 'Impressionante como conseguiram aproveitar cada metro cúbico do nosso galpão. O sistema inteligente nos deu controle total do estoque em tempo real. ROI alcançado em menos de 8 meses!',
      rating: 5,
      avatar: '/lovable-uploads/54b2f5dc-8781-4f2f-9f68-d966142e985d.png',
      location: 'Rio de Janeiro, RJ'
    },
    {
      id: '3',
      name: 'Roberto Oliveira',
      company: 'Tech Solutions LTDA',
      project: 'Centro de Distribuição Inteligente',
      content: 'Superaram nossas expectativas em todos os aspectos: prazo, qualidade e suporte pós-venda. A tecnologia implementada colocou nossa operação em outro patamar de eficiência.',
      rating: 5,
      avatar: '/lovable-uploads/a7ae23c6-cbea-470d-be2a-44e24862efea.png',
      location: 'Belo Horizonte, MG'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            💬 O que nossos clientes dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Mais de 500 empresas já confiaram na Drystore para transformar seus processos de armazenamento
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-blue-600 opacity-70" />
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{testimonial.rating}/5</span>
                </div>

                <div className="flex items-center pt-4 border-t border-gray-100">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                    <p className="text-xs text-blue-600">{testimonial.project}</p>
                    <p className="text-xs text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Projetos Realizados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
            <div className="text-sm text-gray-600">Anos de Experiência</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-sm text-gray-600">Satisfação dos Clientes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Suporte Técnico</div>
          </div>
        </div>
      </div>
    </div>
  );
};
