
import React from 'react';
import { CheckCircle, Clock, FileText, Zap, Eye, RefreshCw, BarChart3, PartyPopper } from 'lucide-react';

export const ZeroBurocraciaSection: React.FC = () => {
  const etapas = [
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

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4">
            🚀 Processo Completo Pós-Aprovação
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Zero Burocracia Para Você
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            "Você Aprova, Nós Cuidamos de Tudo!"
          </p>
        </div>

        {/* Etapas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {etapas.map((etapa) => (
            <div 
              key={etapa.numero}
              className={`relative p-6 bg-white rounded-xl shadow-lg border-2 border-${etapa.color}-100 hover:shadow-xl transition-all duration-300`}
            >
              {/* Número da Etapa */}
              <div className={`absolute -top-3 -left-3 w-8 h-8 bg-${etapa.color}-500 text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                {etapa.numero}
              </div>

              {/* Ícone */}
              <div className={`w-12 h-12 bg-${etapa.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                <etapa.icon className={`w-6 h-6 text-${etapa.color}-600`} />
              </div>

              {/* Título */}
              <h3 className={`font-bold text-${etapa.color}-900 mb-3 text-sm`}>
                🔍 {etapa.titulo}
              </h3>

              {/* Detalhes */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">O que fazemos:</span>
                  <p className="text-gray-600">{etapa.fazemos}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Objetivo:</span>
                  <p className="text-gray-600">{etapa.objetivo}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Prazo:</span>
                  <p className={`text-${etapa.color}-600 font-medium`}>{etapa.prazo}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Seu papel:</span>
                  <p className="text-green-600 font-medium">{etapa.seuPapel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Destaque Especial */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              💡 Destaque Especial: "Zero Burocracia Para Você!"
            </h3>
            <p className="text-lg leading-relaxed">
              Com nossa procuração, resolvemos todos os trâmites na concessionária. 
              Você só precisa assinar o contrato e aguardar o sistema funcionar!
            </p>
          </div>
        </div>

        {/* Timeline Resumida */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              ⏱️ Timeline Resumida
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span><strong>Semana 1:</strong> Vistoria + Documentação + Projeto</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span><strong>Semana 2-3:</strong> Instalação + Testes</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span><strong>Semana 4-6:</strong> Tramitação na concessionária</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span><strong>A partir da Semana 7:</strong> Você economizando!</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              🛡️ Nossa Garantia de Processo
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Cronograma cumprido rigorosamente</span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Comunicação constante sobre cada etapa</span>
              </div>
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Suporte técnico durante todo o processo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
