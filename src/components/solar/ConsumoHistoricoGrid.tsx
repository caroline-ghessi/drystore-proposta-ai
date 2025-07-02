import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConsumoMensal } from '@/types/solarClient';

interface ConsumoHistoricoGridProps {
  consumo: ConsumoMensal[];
  onChange: (consumo: ConsumoMensal[]) => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ConsumoHistoricoGrid: React.FC<ConsumoHistoricoGridProps> = ({
  consumo,
  onChange
}) => {
  const handleConsumoChange = (index: number, valor: string) => {
    const novoConsumo = [...consumo];
    novoConsumo[index] = {
      mes: MESES[index],
      consumo: parseFloat(valor) || 0
    };
    onChange(novoConsumo);
  };

  const calcularMedia = () => {
    const total = consumo.reduce((sum, item) => sum + (item.consumo || 0), 0);
    return total / 12;
  };

  // Garantir que temos 12 meses
  const consumoCompleto = MESES.map((mes, index) => {
    const existente = consumo.find(c => c.mes === mes);
    return existente || { mes, consumo: 0 };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {consumoCompleto.map((item, index) => (
          <div key={item.mes} className="space-y-2">
            <Label htmlFor={`consumo-${index}`} className="text-sm font-medium">
              {item.mes}
            </Label>
            <div className="relative">
              <Input
                id={`consumo-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={item.consumo || ''}
                onChange={(e) => handleConsumoChange(index, e.target.value)}
                placeholder="0"
                className="text-right pr-12"
              />
              <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                kWh
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Média mensal:</span>
          <span className="text-lg font-bold text-primary">
            {calcularMedia().toFixed(0)} kWh
          </span>
        </div>
      </Card>
    </div>
  );
};