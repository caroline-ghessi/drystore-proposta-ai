
import React from 'react';
import { ExternalLink, MapPin, Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CasesGallery: React.FC = () => {
  const cases = [
    {
      id: 1,
      title: 'Residência Moderna - São Paulo',
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80',
      area: '180m²',
      duration: '45 dias',
      family: '4 pessoas',
      location: 'São Paulo, SP',
      description: 'Casa moderna de 2 pavimentos com acabamento premium e eficiência energética.',
      highlights: ['Laje seca', 'Isolamento térmico', 'Estrutura anti-sísmica']
    },
    {
      id: 2,
      title: 'Casa de Campo Sustentável',
      image: 'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=600&q=80',
      area: '120m²',
      duration: '30 dias',
      family: '3 pessoas',
      location: 'Campos do Jordão, SP',
      description: 'Residência em meio à natureza com foco em sustentabilidade e conforto.',
      highlights: ['Madeira certificada', 'Captação de chuva', 'Energia solar']
    },
    {
      id: 3,
      title: 'Sobrado Contemporâneo',
      image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80',
      area: '220m²',
      duration: '60 dias',
      family: '5 pessoas',
      location: 'Campinas, SP',
      description: 'Sobrado de 3 pavimentos com design arrojado e tecnologia integrada.',
      highlights: ['Fachada ventilada', 'Automação residencial', 'Piscina integrada']
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cases de Sucesso em Light Steel Frame
          </h2>
          <p className="text-lg text-gray-600">
            Conheça alguns projetos realizados com excelência e satisfação total dos clientes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Image */}
              <div className="relative overflow-hidden">
                <img 
                  src={caseItem.image}
                  alt={caseItem.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Concluído
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {caseItem.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {caseItem.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    {caseItem.family}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    {caseItem.area}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                    {caseItem.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    {caseItem.location.split(',')[0]}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {caseItem.highlights.map((highlight, index) => (
                      <span 
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Projeto Completo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Ver Todos os Cases
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
