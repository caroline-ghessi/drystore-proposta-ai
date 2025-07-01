import { RecommendedSolutionCard } from './RecommendedSolutionCard';
import { EconomySummarySection } from './EconomySummarySection';

interface RecommendedSolution {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  features: string[];
  image?: string;
  rating: number;
  popular?: boolean;
}

interface RecommendedSolutionsSectionProps {
  solutions?: RecommendedSolution[];
  onSolutionSelect?: (solution: RecommendedSolution) => void;
  selectedSolutions?: Array<{ id: string; price: number }>;
  onCloseDeal?: () => void;
}

export const RecommendedSolutionsSection = ({ 
  solutions = [], 
  onSolutionSelect,
  selectedSolutions = [],
  onCloseDeal
}: RecommendedSolutionsSectionProps) => {
  
  // Mock data se não houver soluções
  const defaultSolutions: RecommendedSolution[] = [
    {
      id: '1',
      name: 'Sistema de Segurança Premium',
      description: 'Proteção completa com câmeras 4K, sensores e monitoramento 24h',
      price: 4500,
      originalPrice: 5625,
      category: 'Segurança',
      features: ['Câmeras 4K', 'Sensores de movimento', 'App mobile', 'Armazenamento na nuvem'],
      rating: 4.9,
      popular: true
    },
    {
      id: '2',
      name: 'Automação Residencial Completa',
      description: 'Controle total da casa: iluminação, climatização e eletrodomésticos',
      price: 6800,
      originalPrice: 8500,
      category: 'Automação',
      features: ['Controle de luzes', 'Termostato inteligente', 'Tomadas smart', 'Assistente virtual'],
      rating: 4.8
    },
    {
      id: '3',
      name: 'Sistema de Energia Solar',
      description: 'Geração própria de energia com economia de até 95% na conta de luz',
      price: 12500,
      originalPrice: 15625,
      category: 'Sustentabilidade',
      features: ['Painéis de alta eficiência', 'Inversor inteligente', 'Monitoramento', 'Garantia 25 anos'],
      rating: 4.7
    },
    {
      id: '4',
      name: 'Áudio e Vídeo Multiroom',
      description: 'Som ambiente em todos os cômodos com qualidade profissional',
      price: 3200,
      originalPrice: 4000,
      category: 'Entretenimento',
      features: ['Caixas embutidas', 'Central de áudio', 'Controle por app', 'Streaming integrado'],
      rating: 4.6
    }
  ];

  const displaySolutions = solutions.length > 0 ? solutions : defaultSolutions;

  const isSolutionSelected = (solutionId: string) => {
    return selectedSolutions.some(s => s.id === solutionId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          🎯 Soluções Recomendadas Para Você
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Baseado no seu perfil, selecionamos essas soluções que podem completar perfeitamente seu projeto
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displaySolutions.map((solution) => (
          <RecommendedSolutionCard
            key={solution.id}
            solution={solution}
            isSelected={isSolutionSelected(solution.id)}
            onSelect={onSolutionSelect || (() => {})}
          />
        ))}
      </div>

      {/* Economy Summary Section - Similar to reference image */}
      <EconomySummarySection
        selectedSolutions={selectedSolutions}
        displaySolutions={displaySolutions}
        onCloseDeal={onCloseDeal}
      />
    </div>
  );
};
