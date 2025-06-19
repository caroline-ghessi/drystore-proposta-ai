
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, Shield, Layers, Droplets, Zap } from 'lucide-react';

const SelectSystems = () => {
  const navigate = useNavigate();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const systems = [
    {
      id: 'cobertura',
      name: 'Sistema de Cobertura',
      description: 'Telhas, estrutura metálica, calhas e rufos',
      icon: Home,
      recommended: true,
      estimatedValue: 'R$ 35.000 - R$ 45.000',
      items: ['Telhas termoacústicas', 'Estrutura metálica', 'Calhas', 'Rufos e complementos']
    },
    {
      id: 'revestimento',
      name: 'Sistema de Revestimento',
      description: 'Painéis de fachada e acabamentos externos',
      icon: Layers,
      recommended: true,
      estimatedValue: 'R$ 25.000 - R$ 35.000',
      items: ['Painéis de fachada', 'Perfis de fixação', 'Vedações', 'Acabamentos']
    },
    {
      id: 'isolamento',
      name: 'Sistema de Isolamento',
      description: 'Isolamento térmico e acústico',
      icon: Shield,
      recommended: false,
      estimatedValue: 'R$ 8.000 - R$ 12.000',
      items: ['Manta térmica', 'Isolamento acústico', 'Barreiras de vapor']
    },
    {
      id: 'drenagem',
      name: 'Sistema de Drenagem',
      description: 'Captação e escoamento de águas pluviais',
      icon: Droplets,
      recommended: true,
      estimatedValue: 'R$ 5.000 - R$ 8.000',
      items: ['Calhas coletoras', 'Condutores', 'Ralos e grelhas']
    },
    {
      id: 'eletrico',
      name: 'Sistema Elétrico',
      description: 'Iluminação e instalações elétricas',
      icon: Zap,
      recommended: false,
      estimatedValue: 'R$ 15.000 - R$ 20.000',
      items: ['Luminárias LED', 'Painéis elétricos', 'Cabeamento']
    }
  ];

  const handleSystemToggle = (systemId: string) => {
    setSelectedSystems(prev => 
      prev.includes(systemId) 
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  };

  const handleNext = () => {
    console.log('Sistemas selecionados:', selectedSystems);
    navigate('/edit-proposal/1');
  };

  const getTotalEstimate = () => {
    const selectedSystemsData = systems.filter(system => selectedSystems.includes(system.id));
    const min = selectedSystemsData.reduce((acc, system) => {
      const match = system.estimatedValue.match(/R\$ ([\d.]+)/);
      return acc + (match ? parseInt(match[1].replace('.', '')) : 0);
    }, 0);
    const max = selectedSystemsData.reduce((acc, system) => {
      const matches = system.estimatedValue.match(/R\$ ([\d.]+) - R\$ ([\d.]+)/);
      return acc + (matches ? parseInt(matches[2].replace('.', '')) : 0);
    }, 0);
    
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/upload-document')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Selecionar Sistemas</h1>
            <p className="text-gray-600 mt-1">Escolha quais sistemas farão parte da proposta</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Passo 3 de 4</span>
            <span>75% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-drystore-blue h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Systems List */}
          <div className="lg:col-span-2 space-y-4">
            {systems.map((system) => {
              const Icon = system.icon;
              const isSelected = selectedSystems.includes(system.id);
              
              return (
                <Card 
                  key={system.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-drystore-blue bg-blue-50' : ''
                  }`}
                  onClick={() => handleSystemToggle(system.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleSystemToggle(system.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-drystore-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                            {system.recommended && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Recomendado
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium text-drystore-blue">
                            {system.estimatedValue}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{system.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {system.items.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Resumo da Seleção</CardTitle>
                <CardDescription>
                  {selectedSystems.length} sistema(s) selecionado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSystems.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {selectedSystems.map(systemId => {
                        const system = systems.find(s => s.id === systemId);
                        if (!system) return null;
                        
                        return (
                          <div key={systemId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-600">{system.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Estimativa Total:</span>
                        <span className="text-lg font-bold text-drystore-blue">
                          {getTotalEstimate()}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={handleNext}
                        className="w-full gradient-bg hover:opacity-90"
                        size="lg"
                      >
                        Gerar Orçamento
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      Selecione pelo menos um sistema para continuar
                    </p>
                    <Button disabled variant="outline" className="w-full">
                      Gerar Orçamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectSystems;
