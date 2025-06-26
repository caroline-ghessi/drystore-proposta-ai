
import { ProductGroup } from '@/types/productGroups';
import { lazy } from 'react';

// Lazy load dos layouts específicos
const LightSteelFrameLayout = lazy(() => import('@/components/proposal/layouts/LightSteelFrame/LightSteelFrameLayout'));
const TelhaShingleLayout = lazy(() => import('@/components/proposal/layouts/TelhaShingle/TelhaShingleLayout'));
const EnergiaSolarLayout = lazy(() => import('@/components/proposal/layouts/EnergiaSolar/EnergiaSolarLayout'));
const PisosMantas = lazy(() => import('@/components/proposal/layouts/PisosMantas/PisosMantas'));
const ForsLayout = lazy(() => import('@/components/proposal/layouts/Forros/ForrosLayout'));
const DivisoriasLayout = lazy(() => import('@/components/proposal/layouts/Divisorias/DivisoriasLayout'));
const FerramentasLayout = lazy(() => import('@/components/proposal/layouts/Ferramentas/FerramentasLayout'));
const GenericLayout = lazy(() => import('@/components/proposal/layouts/Generic/GenericLayout'));

export interface ProposalLayoutProps {
  proposal: {
    clientName: string;
    benefits: string[];
    finalPrice: number;
    totalPrice: number;
    discount: number;
    validUntil: string;
  };
  proposalItems: Array<{
    description: string;
    solution?: string;
  }>;
  selectedSolutions: Array<{ id: string; price: number }>;
  canInteract: boolean;
  isExpired: boolean;
  onAcceptProposal: () => void;
  onRejectProposal: () => void;
  onSolutionSelect: (solution: any) => void;
  onCloseDeal: () => void;
}

export class ProposalLayoutService {
  static getLayoutComponent(productGroup: ProductGroup | null) {
    console.log('🔍 ProposalLayoutService.getLayoutComponent chamado');
    console.log('📦 Product Group recebido:', productGroup);
    
    switch (productGroup) {
      case 'light_steel_frame':
        console.log('✅ Retornando LightSteelFrameLayout');
        return LightSteelFrameLayout;
      case 'telha_shingle':
        console.log('✅ Retornando TelhaShingleLayout');
        return TelhaShingleLayout;
      case 'energia_solar':
        console.log('🔥 Retornando EnergiaSolarLayout');
        return EnergiaSolarLayout;
      case 'pisos_mantas_carpetes':
        console.log('✅ Retornando PisosMantas');
        return PisosMantas;
      case 'forros':
        console.log('✅ Retornando ForsLayout');
        return ForsLayout;
      case 'divisorias':
        console.log('✅ Retornando DivisoriasLayout');
        return DivisoriasLayout;
      case 'ferramentas':
        console.log('✅ Retornando FerramentasLayout');
        return FerramentasLayout;
      default:
        console.log('⚠️ Product Group não encontrado, retornando GenericLayout');
        console.log('📋 Product groups disponíveis: light_steel_frame, telha_shingle, energia_solar, pisos_mantas_carpetes, forros, divisorias, ferramentas');
        return GenericLayout;
    }
  }

  static getLayoutConfig(productGroup: ProductGroup | null) {
    const configs = {
      light_steel_frame: {
        heroTitle: 'Construção Inteligente em Light Steel Frame',
        heroSubtitle: 'Tecnologia sustentável que reduz em até 70% o tempo de construção',
        primaryColor: 'blue',
        focusAreas: ['sustentabilidade', 'rapidez', 'qualidade'],
        showCalculator: true,
        calculatorType: 'construction_time'
      },
      telha_shingle: {
        heroTitle: 'Telhas Shingle de Alta Performance',
        heroSubtitle: 'Proteção superior com design elegante para sua cobertura',
        primaryColor: 'green',
        focusAreas: ['durabilidade', 'estética', 'proteção'],
        showCalculator: true,
        calculatorType: 'coverage_area'
      },
      energia_solar: {
        heroTitle: 'Energia Solar Fotovoltaica',
        heroSubtitle: 'Economia de até 95% na sua conta de luz com energia limpa',
        primaryColor: 'yellow',
        focusAreas: ['economia', 'sustentabilidade', 'ROI'],
        showCalculator: true,
        calculatorType: 'energy_savings'
      },
      pisos_mantas_carpetes: {
        heroTitle: 'Revestimentos de Alta Qualidade',
        heroSubtitle: 'Pisos, mantas e carpetes para todos os ambientes',
        primaryColor: 'purple',
        focusAreas: ['conforto', 'estética', 'durabilidade'],
        showCalculator: false
      },
      forros: {
        heroTitle: 'Sistemas de Forro Profissionais',
        heroSubtitle: 'Acabamento perfeito e isolamento acústico superior',
        primaryColor: 'indigo',
        focusAreas: ['acústica', 'acabamento', 'isolamento'],
        showCalculator: false
      },
      divisorias: {
        heroTitle: 'Divisórias Inteligentes',
        heroSubtitle: 'Otimização de espaços com flexibilidade e design',
        primaryColor: 'orange',
        focusAreas: ['flexibilidade', 'otimização', 'design'],
        showCalculator: false
      },
      ferramentas: {
        heroTitle: 'Ferramentas Profissionais',
        heroSubtitle: 'Equipamentos de alta qualidade para profissionais exigentes',
        primaryColor: 'red',
        focusAreas: ['qualidade', 'durabilidade', 'profissional'],
        showCalculator: false
      }
    };

    return configs[productGroup as keyof typeof configs] || {
      heroTitle: 'Solução Personalizada Drystore',
      heroSubtitle: 'Qualidade e inovação em cada projeto',
      primaryColor: 'blue',
      focusAreas: ['qualidade', 'inovação', 'personalização'],
      showCalculator: false
    };
  }
}
