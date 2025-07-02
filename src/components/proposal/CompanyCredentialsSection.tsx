import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, CheckCircle } from 'lucide-react';

export const CompanyCredentialsSection = () => {
  const certifications = [
    {
      icon: Shield,
      title: 'ISO 9001:2015',
      description: 'Gestão de Qualidade'
    },
    {
      icon: Award,
      title: 'Prêmio Inovação',
      description: 'Tecnologia em Armazenamento 2023'
    },
    {
      icon: Users,
      title: 'ABML Certificada',
      description: 'Associação Brasileira de Movimentação e Logística'
    },
    {
      icon: CheckCircle,
      title: 'NR-11 Compliance',
      description: 'Normas de Segurança em Armazenagem'
    }
  ];

  const companyStats = [
    { value: '20+', label: 'Anos no Mercado', color: 'text-drystore-orange' },
    { value: '500+', label: 'Projetos Concluídos', color: 'text-drystore-orange' },
    { value: '98%', label: 'Satisfação Cliente', color: 'text-drystore-orange' },
  ];

  return (
    <div className="py-16 bg-drystore-gray-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            🏆 Liderança e Confiança no Mercado
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Referência nacional em soluções inteligentes de armazenamento
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-16">
          {companyStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-drystore-orange mb-2">{stat.value}</div>
              <div className="text-gray-200">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};