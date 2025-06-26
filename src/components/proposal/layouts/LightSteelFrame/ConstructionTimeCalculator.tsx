
import React, { useState } from 'react';
import { Calculator, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ConstructionTimeCalculator: React.FC = () => {
  const [area, setArea] = useState<number>(0);
  const [result, setResult] = useState<{traditional: number, lsf: number, savings: number} | null>(null);

  const calculateTime = () => {
    if (area > 0) {
      // Cálculos baseados em médias reais de construção
      const traditionalDays = Math.round(area * 0.8); // ~0.8 dias por m²
      const lsfDays = Math.round(area * 0.25); // ~0.25 dias por m²
      const savings = traditionalDays - lsfDays;
      
      setResult({
        traditional: traditionalDays,
        lsf: lsfDays,
        savings: savings
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Tempo de Construção
          </h2>
          <p className="text-lg text-gray-600">
            Descubra quanto tempo você economiza com Light Steel Frame
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Calculator */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcule sua Economia de Tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="area">Área a ser construída (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={area || ''}
                    onChange={(e) => setArea(Number(e.target.value))}
                    placeholder="Ex: 120"
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={calculateTime}
                  disabled={!area}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Calcular Tempo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-red-900">Construção Tradicional</h3>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{result.traditional} dias</div>
                  <p className="text-sm text-red-700 mt-1">Alvenaria convencional</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">Light Steel Frame</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{result.lsf} dias</div>
                  <p className="text-sm text-green-700 mt-1">Sistema industrializado</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{result.savings} dias</div>
                    <p className="text-blue-900 font-semibold">Economia de Tempo</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {Math.round((result.savings / result.traditional) * 100)}% mais rápido
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
