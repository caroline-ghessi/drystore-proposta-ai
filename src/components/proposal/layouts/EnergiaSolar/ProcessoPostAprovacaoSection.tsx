
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ProcessoPostAprovacaoSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  const processSteps = [
    {
      id: '1',
      number: '1',
      title: 'Vistoria',
      time: '2-3 dias',
      icon: '🔍',
      content: {
        title: 'Vistoria Técnica Completa',
        info: [
          {
            label: 'O que fazemos',
            description: 'Verificação detalhada de toda estrutura elétrica e do telhado',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Garantia de que tudo será instalado com segurança máxima',
            highlight: true
          }
        ]
      }
    },
    {
      id: '2',
      number: '2',
      title: 'Documentação',
      time: '5-7 dias',
      icon: '📋',
      content: {
        title: 'Toda Burocracia Por Nossa Conta',
        info: [
          {
            label: 'O que fazemos',
            description: 'Elaboramos projeto, ART e solicitamos conexão na concessionária',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Zero preocupação com papelada e processos burocráticos',
            highlight: true
          }
        ]
      }
    },
    {
      id: '3',
      number: '3',
      title: 'Aprovação',
      time: '15-30 dias',
      icon: '✅',
      content: {
        title: 'Aprovação da Concessionária',
        info: [
          {
            label: 'O que fazemos',
            description: 'Acompanhamos todo processo até aprovação final do projeto',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Atualizações constantes sobre o andamento do processo',
            highlight: true
          }
        ]
      }
    },
    {
      id: '4',
      number: '4',
      title: 'Instalação',
      time: '1-2 dias',
      icon: '🔧',
      content: {
        title: 'Instalação Profissional Completa',
        info: [
          {
            label: 'O que fazemos',
            description: 'Instalação de painéis, inversor e todos equipamentos necessários',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Sistema funcionando perfeitamente e gerando economia',
            highlight: true
          }
        ]
      }
    },
    {
      id: '5',
      number: '5',
      title: 'Testes',
      time: '1 dia',
      icon: '⚡',
      content: {
        title: 'Testes e Comissionamento',
        info: [
          {
            label: 'O que fazemos',
            description: 'Testes completos de funcionamento e configuração do sistema',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Certeza absoluta de que tudo está funcionando perfeitamente',
            highlight: true
          }
        ]
      }
    },
    {
      id: '6',
      number: '6',
      title: 'Ativação',
      time: '5-10 dias',
      icon: '🚀',
      content: {
        title: 'Sistema Ativo e Gerando',
        info: [
          {
            label: 'O que fazemos',
            description: 'Solicitação de ativação final na concessionária',
            highlight: false
          },
          {
            label: 'Para você',
            description: 'Começar a economizar imediatamente na conta de luz',
            highlight: true
          }
        ]
      }
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-drystore-gray-dark mb-4">
            🚀 Processo Pós-Aprovação
          </h2>
          <p className="text-xl text-drystore-gray-medium">
            Você aprova, nós cuidamos de tudo para você!
          </p>
        </div>

        {/* Process Tabs */}
        <div className="max-w-5xl mx-auto mb-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-white rounded-2xl p-2 shadow-lg h-auto">
              {processSteps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="flex flex-col items-center p-4 space-y-2 data-[state=active]:bg-drystore-orange data-[state=active]:text-white"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    activeTab === step.id ? 'bg-white text-drystore-orange' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-xs font-semibold text-center">{step.title}</div>
                  <div className="text-xs opacity-70">{step.time}</div>
                </TabsTrigger>
              ))}
            </TabsList>

            {processSteps.map((step) => (
              <TabsContent key={step.id} value={step.id} className="mt-8">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-12">
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-4">{step.icon}</div>
                      <h3 className="text-2xl font-bold text-drystore-gray-dark mb-2">
                        {step.content.title}
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                      {step.content.info.map((info, index) => (
                        <div
                          key={index}
                          className={`p-6 rounded-lg border-2 ${
                            info.highlight 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            {info.label}
                          </h4>
                          <p className={`text-lg leading-relaxed ${
                            info.highlight ? 'text-green-700 font-semibold' : 'text-gray-800'
                          }`}>
                            {info.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Timeline Compact */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h3 className="text-xl font-bold text-center mb-6 text-drystore-gray-dark">
            ⏱️ Cronograma Resumido
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6">
            <div className="text-center">
              <div className="font-bold text-lg text-drystore-gray-dark">Semana 1-2</div>
              <div className="text-sm text-gray-600">Vistoria + Docs</div>
            </div>
            <div className="text-2xl text-drystore-orange">→</div>
            <div className="text-center">
              <div className="font-bold text-lg text-drystore-gray-dark">Semana 3-6</div>
              <div className="text-sm text-gray-600">Aprovação</div>
            </div>
            <div className="text-2xl text-drystore-orange">→</div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">Semana 7</div>
              <div className="text-sm text-gray-600">Instalação</div>
            </div>
            <div className="text-2xl text-drystore-orange">→</div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">Semana 8</div>
              <div className="text-sm text-gray-600">Ativação</div>
            </div>
          </div>
        </div>

        {/* Final Highlight */}
        <div className="bg-gradient-to-r from-drystore-orange to-orange-600 text-white p-8 rounded-2xl text-center shadow-xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Sistema Ativo em Até 45 Dias!</h3>
              <p className="text-lg opacity-90">
                Da aprovação até começar a economizar na sua conta de luz
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
