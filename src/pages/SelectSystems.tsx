
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, Layers, Zap } from 'lucide-react';
import DrystoreCube from '@/components/DrystoreCube';

const SelectSystems = () => {
  const navigate = useNavigate();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const systems = [
    {
      id: 'telhado-shingle',
      name: 'Telhado Shingle',
      description: 'Telhas asfálticas de alta qualidade',
      icon: Home,
      estimatedValue: 'R$ 15.000 - R$ 25.000',
      division: 'Drybuild'
    },
    {
      id: 'forro-drywall',
      name: 'Forro Drywall',
      description: 'Sistema de forro em placas de gesso',
      icon: Layers,
      estimatedValue: 'R$ 8.000 - R$ 12.000',
      division: 'Drybuild'
    },
    {
      id: 'revestimento-interno',
      name: 'Revestimento Interno',
      description: 'Acabamentos internos em drywall',
      icon: Layers,
      estimatedValue: 'R$ 12.000 - R$ 18.000',
      division: 'Drybuild'
    },
    {
      id: 'revestimento-externo',
      name: 'Revestimento Externo',
      description: 'Painéis de fachada e acabamentos',
      icon: Layers,
      estimatedValue: 'R$ 20.000 - R$ 30.000',
      division: 'Drybuild'
    },
    {
      id: 'piso',
      name: 'Piso',
      description: 'Sistema de pisos e contrapiso',
      icon: Layers,
      estimatedValue: 'R$ 10.000 - R$ 16.000',
      division: 'Drybuild'
    },
    {
      id: 'energia-solar',
      name: 'Energia Solar',
      description: 'Sistema fotovoltaico completo',
      icon: Zap,
      estimatedValue: 'R$ 25.000 - R$ 40.000',
      division: 'Drysolar'
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
    navigate('/proposal-preview');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/upload-pdf')}
            className="mr-4 text-drystore-gray-medium hover:text-drystore-gray-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center">
            <DrystoreCube size="md" className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-drystore-gray-dark">Selecionar Sistemas</h1>
              <p className="text-drystore-gray-medium mt-1">Escolha quais sistemas farão parte da proposta</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {systems.map((system) => {
              const Icon = system.icon;
              const isSelected = selectedSystems.includes(system.id);
              
              return (
                <Card 
                  key={system.id} 
                  className={`cursor-pointer transition-all hover:shadow-md border ${
                    isSelected 
                      ? 'ring-2 ring-drystore-orange bg-orange-50 border-drystore-orange' 
                      : 'border-drystore-gray-light hover:border-drystore-gray-medium'
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
                            <div className={`p-2 rounded-lg ${
                              isSelected 
                                ? 'bg-drystore-orange text-white' 
                                : system.division === 'Drysolar' 
                                  ? 'bg-drystore-green-sustainable text-white'
                                  : 'bg-drystore-gray-light text-drystore-gray-medium'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-drystore-gray-dark">{system.name}</h3>
                              <span className="text-xs text-drystore-gray-medium">{system.division}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-drystore-orange">
                            {system.estimatedValue}
                          </span>
                        </div>
                        <p className="text-drystore-gray-medium">{system.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8 border border-drystore-gray-light shadow-sm">
              <CardHeader>
                <CardTitle className="text-drystore-gray-dark">Resumo da Seleção</CardTitle>
                <CardDescription className="text-drystore-gray-medium">
                  <span className="font-medium text-drystore-orange">{selectedSystems.length}</span> sistema(s) selecionado(s)
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
                          <div key={systemId} className="flex items-center justify-between py-2 border-b border-drystore-gray-light last:border-0">
                            <span className="text-sm text-drystore-gray-medium">{system.name}</span>
                            <span className="text-xs text-drystore-gray-medium">{system.division}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-4 border-t border-drystore-gray-light">
                      <Button 
                        onClick={handleNext}
                        className="w-full bg-drystore-orange hover:bg-drystore-orange-light text-white"
                        size="lg"
                      >
                        Gerar Proposta
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-drystore-gray-medium mb-4">
                      Selecione pelo menos um sistema para continuar
                    </p>
                    <Button disabled variant="outline" className="w-full">
                      Gerar Proposta
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
