
import React, { useState } from 'react';
import { Calculator, Zap, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const EnergyCalculator: React.FC = () => {
  const [monthlyBill, setMonthlyBill] = useState<number>(0);
  const [result, setResult] = useState<{
    systemSize: number;
    monthlySavings: number;
    annualSavings: number;
    panels: number;
  } | null>(null);

  const calculateSavings = () => {
    if (monthlyBill > 0) {
      // Cálculos baseados em médias reais do mercado brasileiro
      const kwhPrice = 0.75; // R$ 0,75 por kWh (média nacional)
      const monthlyConsumption = monthlyBill / kwhPrice;
      const systemSize = (monthlyConsumption * 12) / 1350; // 1350 kWh/kWp/ano (média Brasil)
      const panelsNeeded = Math.ceil(systemSize / 0.54); // 540W por painel
      
      const monthlySavings = monthlyBill * 0.95; // 95% de economia
      const annualSavings = monthlySavings * 12;
      
      setResult({
        systemSize: Math.round(systemSize * 100) / 100,
        monthlySavings: Math.round(monthlySavings),
        annualSavings: Math.round(annualSavings),
        panels: panelsNeeded
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Economia Solar
          </h2>
          <p className="text-lg text-gray-600">
            Descubra quanto você pode economizar com energia solar
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Calculator */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-yellow-600 text-white">
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Calcule sua Economia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthly-bill">Valor da conta de luz mensal (R$)</Label>
                  <Input
                    id="monthly-bill"
                    type="number"
                    value={monthlyBill || ''}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    placeholder="Ex: 350"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor médio dos últimos 12 meses
                  </p>
                </div>
                
                <Button 
                  onClick={calculateSavings}
                  disabled={!monthlyBill}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  Calcular Economia
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
                    <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">Economia Mensal</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    R$ {result.monthlySavings.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-sm text-green-700">95% de redução na conta</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Sistema Necessário</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.systemSize} kWp
                  </div>
                  <p className="text-sm text-blue-700">{result.panels} painéis solares</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      R$ {result.annualSavings.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-yellow-900 font-semibold">Economia Anual</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Em 25 anos: R$ {(result.annualSavings * 25).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Benefits */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Benefícios inclusos:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Painéis Tier 1 com 25 anos de garantia</li>
                  <li>• Inversor com 12 anos de garantia</li>
                  <li>• Instalação e homologação inclusa</li>
                  <li>• Monitoramento remoto</li>
                  <li>• Financiamento solar disponível</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
