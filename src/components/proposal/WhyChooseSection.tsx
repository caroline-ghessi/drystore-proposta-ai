
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, Clock, ThumbsUp } from 'lucide-react';

export const WhyChooseSection = () => {
  const stats = [
    {
      icon: Clock,
      number: "15+",
      label: "Anos de Experiência",
      description: "Mais de uma década transformando lares"
    },
    {
      icon: Users,
      number: "2.500+",
      label: "Projetos Entregues",
      description: "Famílias satisfeitas em todo o Brasil"
    },
    {
      icon: Award,
      number: "98%",
      label: "Satisfação dos Clientes",
      description: "Índice de aprovação comprovado"
    },
    {
      icon: ThumbsUp,
      number: "5",
      label: "Anos de Garantia",
      description: "Tranquilidade total no pós-venda"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Por Que Escolher a Drystore?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossa experiência e dedicação garantem os melhores resultados para seu projeto
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-gray-600">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
