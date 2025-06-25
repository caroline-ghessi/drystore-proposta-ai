
import { ClientTestimonialsSection } from './ClientTestimonialsSection';
import { ProjectGallerySection } from './ProjectGallerySection';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Award, Users, CheckCircle } from 'lucide-react';

export const TrustBuilderSection = () => {
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
    { value: '15+', label: 'Anos no Mercado', color: 'text-blue-600' },
    { value: '500+', label: 'Projetos Concluídos', color: 'text-green-600' },
    { value: '2M+', label: 'm² Otimizados', color: 'text-purple-600' },
    { value: '98%', label: 'Satisfação Cliente', color: 'text-orange-600' },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Company Stats and Certifications */}
      <div className="py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              🏆 Liderança e Confiança no Mercado
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Referência nacional em soluções inteligentes de armazenamento
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {companyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <cert.icon className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">{cert.title}</h3>
                  <p className="text-sm text-blue-200">{cert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Client Testimonials */}
      <ClientTestimonialsSection />

      {/* Project Gallery */}
      <ProjectGallerySection />

      {/* Final Trust Message */}
      <div className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Sua Confiança é Nossa Prioridade
          </h3>
          <p className="text-lg text-gray-700 mb-6">
            Mais de 500 empresas já escolheram a Drystore para transformar seus processos. 
            Junte-se a nós e descubra porque somos líderes em soluções inteligentes de armazenamento.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Garantia de 5 anos
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Suporte 24/7
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Instalação profissional
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ROI comprovado
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
