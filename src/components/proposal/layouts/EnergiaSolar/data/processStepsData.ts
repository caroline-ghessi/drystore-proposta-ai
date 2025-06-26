
import { CheckCircle, Clock, FileText, Zap, Eye, RefreshCw, BarChart3, PartyPopper } from 'lucide-react';

export const processStepsData = [
  {
    numero: 1,
    titulo: 'Vistoria Técnica Detalhada',
    icon: Eye,
    fazemos: 'Verificação completa das condições de instalação',
    objetivo: 'Confirmar se o projeto pode ser executado com a infraestrutura existente',
    prazo: '2-3 dias úteis após aprovação',
    seuPapel: 'Apenas acompanhar nosso técnico',
    color: 'blue'
  },
  {
    numero: 2,
    titulo: 'Documentação e Burocracia',
    icon: FileText,
    fazemos: 'Elaboração de contrato e procuração',
    objetivo: 'Resolver tudo na concessionária sem você se preocupar',
    prazo: '1-2 dias úteis',
    seuPapel: 'Assinar documentos (digital)',
    color: 'green'
  },
  {
    numero: 3,
    titulo: 'Projeto de Instalação',
    icon: FileText,
    fazemos: 'Projeto elétrico detalhado + cronograma de instalação',
    objetivo: 'Garantir instalação perfeita e dentro do prazo',
    prazo: '3-5 dias úteis',
    seuPapel: 'Aprovar cronograma',
    color: 'purple'
  },
  {
    numero: 4,
    titulo: 'Instalação Profissional',
    icon: Zap,
    fazemos: 'Instalação completa + testes do sistema',
    objetivo: 'Sistema funcionando perfeitamente',
    prazo: '1-2 dias (conforme projeto)',
    seuPapel: 'Relaxar enquanto trabalhamos',
    color: 'orange'
  },
  {
    numero: 5,
    titulo: 'Vistoria da Concessionária',
    icon: CheckCircle,
    fazemos: 'Solicitação e acompanhamento da vistoria',
    objetivo: 'Aprovação técnica da distribuidora',
    prazo: '10-15 dias úteis',
    seuPapel: 'Nenhum, cuidamos de tudo',
    color: 'indigo'
  },
  {
    numero: 6,
    titulo: 'Troca do Medidor',
    icon: RefreshCw,
    fazemos: 'Coordenação com a concessionária',
    objetivo: 'Medidor bidirecional instalado',
    prazo: 'Conforme agenda da concessionária',
    seuPapel: 'Nenhum, a concessionária faz tudo',
    color: 'teal'
  },
  {
    numero: 7,
    titulo: 'Acompanhamento Inicial',
    icon: BarChart3,
    fazemos: 'Monitoramento de performance + suporte',
    objetivo: 'Garantir que tudo está funcionando perfeitamente',
    prazo: 'Primeiros 30 dias',
    seuPapel: 'Acompanhar sua economia crescer',
    color: 'pink'
  },
  {
    numero: 8,
    titulo: 'Você Economizando!',
    icon: PartyPopper,
    fazemos: 'Sistema gerando energia e reduzindo sua conta',
    objetivo: 'Economia imediata + valorização do imóvel',
    prazo: '25+ anos de economia garantida',
    seuPapel: 'Aproveitar a economia e compartilhar a experiência',
    color: 'yellow'
  }
];
