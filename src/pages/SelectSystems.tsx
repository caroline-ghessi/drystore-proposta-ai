
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home, Layers, Zap, Droplets } from 'lucide-react';

const SelectSystems = () => {
  const navigate = useNavigate();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const systems = [
    {
      id: 'telhado-shingle',
      name: 'Telhado Shingle',
      description: 'Telhas asfálticas de alta qualidade',
      icon: Home,
      estimatedValue: 'R$ 15.000 - R$ 25.000'
    },
    {
      id: 'forro-drywall',
      name: 'Forro Drywall',
      description: 'Sistema de forro em placas de gesso',
      icon: Layers,
      estimatedValue: 'R$ 8.000 - R$ 12.000'
    },
    {
      id: 'revestimento-interno',
      name: 'Revestimento Interno',
      description: 'Acabamentos internos em drywall',
      icon: Layers,
      estimatedValue: 'R$ 12.000 - R$ 18.000'
    },
    {
      id: 'revestimento-externo',
      name: 'Revestimento Externo',
      description: 'Painéis de fachada e acabamentos',
      icon: Layers,
      estimatedValue: 'R$ 20.000 - R$ 30.000'
    },
    {
      id: 'piso',
      name: 'Piso',
      description: 'Sistema de pisos e contrapiso',
      icon: Layers,
      estimatedValue: 'R$ 10.000 - R$ 16.000'
    },
    {
      id: 'energia-solar',
      name: 'Energia Solar',
      description: 'Sistema fotovoltaico completo',
      icon: Zap,
      estimatedValue: 'R$ 25.000 - R$ 40.000'
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {systems.map((system) => {
              const Icon = system.icon;
              const isSelected = selectedSystems.includes(system.id);
              
              return (
                <Card 
                  key={system.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : ''
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
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            {system.estimatedValue}
                          </span>
                        </div>
                        <p className="text-gray-600">{system.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
                      <Button 
                        onClick={handleNext}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="lg"
                      >
                        Gerar Proposta
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
