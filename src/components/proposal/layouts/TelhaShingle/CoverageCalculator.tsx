
import React, { useState } from 'react';
import { Calculator, Home, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const CoverageCalculator: React.FC = () => {
  const [area, setArea] = useState<number>(0);
  const [roofType, setRoofType] = useState<string>('simples');
  const [result, setResult] = useState<{bundles: number, cost: number, waste: number} | null>(null);

  const calculateCoverage = () => {
    if (area > 0) {
      const wasteFactors = {
        'simples': 1.1,  // 10% desperdício
        'complexo': 1.15, // 15% desperdício
        'irregular': 1.2  // 20% desperdício
      };
      
      const wasteFactor = wasteFactors[roofType as keyof typeof wasteFactors];
      const adjustedArea = area * wasteFactor;
      const bundlesNeeded = Math.ceil(adjustedArea / 33.3); // 1 fardo cobre ~33.3m²
      const estimatedCost = bundlesNeeded * 180; // R$ 180 por fardo (estimativa)
      const wastePercentage = Math.round((wasteFactor - 1) * 100);
      
      setResult({
        bundles: bundlesNeeded,
        cost: estimatedCost,
        waste: wastePercentage
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Cobertura
          </h2>
          <p className="text-lg text-gray-600">
            Calcule a quantidade exata de telhas Shingle para seu projeto
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Calculator */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-green-600 text-white">
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcule sua Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverage-area">Área do telhado (m²)</Label>
                  <Input
                    id="coverage-area"
                    type="number"
                    value={area || ''}
                    onChange={(e) => setArea(Number(e.target.value))}
                    placeholder="Ex: 120"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="roof-type">Tipo de telhado</Label>
                  <select
                    id="roof-type"
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="simples">Simples (2 águas)</option>
                    <option value="complexo">Complexo (4+ águas)</option>
                    <option value="irregular">Irregular (muitos recortes)</option>
                  </select>
                </div>
                
                <Button 
                  onClick={calculateCoverage}
                  disabled={!area}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Calcular Material
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <Home className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">Material Necessário</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{result.bundles} fardos</div>
                  <p className="text-sm text-green-700">Telhas Shingle + {result.waste}% desperdício</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Investimento Estimado</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    R$ {result.cost.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-sm text-blue-700">Apenas material (sem instalação)</p>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Incluso no orçamento:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Telhas Shingle premium</li>
                  <li>• Manta asfáltica de proteção</li>
                  <li>• Pregos galvanizados especiais</li>
                  <li>• Cumeeira e acessórios</li>
                  <li>• Instalação profissional</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
