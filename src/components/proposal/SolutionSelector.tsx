
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wrench, DollarSign } from 'lucide-react';
import { useSolutions, type Solution } from '@/hooks/useSolutions';

interface SolutionSelectorProps {
  includeTechnicalDetails: boolean;
  onIncludeTechnicalDetailsChange: (include: boolean) => void;
  selectedSolutions: Array<{ solutionId: string; value: number }>;
  onSelectedSolutionsChange: (solutions: Array<{ solutionId: string; value: number }>) => void;
}

const SolutionSelector = ({
  includeTechnicalDetails,
  onIncludeTechnicalDetailsChange,
  selectedSolutions,
  onSelectedSolutionsChange
}: SolutionSelectorProps) => {
  const { data: solutions = [], isLoading } = useSolutions();

  const handleSolutionToggle = (solutionId: string, checked: boolean) => {
    if (checked) {
      onSelectedSolutionsChange([
        ...selectedSolutions,
        { solutionId, value: 0 }
      ]);
    } else {
      onSelectedSolutionsChange(
        selectedSolutions.filter(s => s.solutionId !== solutionId)
      );
    }
  };

  const handleValueChange = (solutionId: string, value: number) => {
    onSelectedSolutionsChange(
      selectedSolutions.map(s => 
        s.solutionId === solutionId ? { ...s, value } : s
      )
    );
  };

  const getSolutionById = (id: string) => 
    solutions.find(s => s.id === id);

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'telhado': 'bg-blue-100 text-blue-800',
      'revestimento_externo': 'bg-green-100 text-green-800',
      'revestimento_interno': 'bg-purple-100 text-purple-800',
      'estrutura': 'bg-orange-100 text-orange-800',
      'forro': 'bg-yellow-100 text-yellow-800',
      'drywall': 'bg-pink-100 text-pink-800',
      'steel_frame': 'bg-indigo-100 text-indigo-800',
      'outros': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-drystore-blue" />
          Produtos e Soluções
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="include-technical" className="text-sm font-medium">
              Incluir seção de detalhes técnicos
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Mostra produtos e soluções específicas na proposta
            </p>
          </div>
          <Switch
            id="include-technical"
            checked={includeTechnicalDetails}
            onCheckedChange={onIncludeTechnicalDetailsChange}
          />
        </div>

        {includeTechnicalDetails && (
          <div className="space-y-4 pt-4 border-t">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-drystore-blue mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando soluções...</p>
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma solução disponível</p>
                <p className="text-xs">Entre em contato com o administrador</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Selecione as soluções que fazem parte desta proposta:
                </Label>
                
                {solutions.map((solution) => {
                  const isSelected = selectedSolutions.some(s => s.solutionId === solution.id);
                  const selectedSolution = selectedSolutions.find(s => s.solutionId === solution.id);
                  
                  return (
                    <div key={solution.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`solution-${solution.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => 
                            handleSolutionToggle(solution.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Label 
                              htmlFor={`solution-${solution.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {solution.nome}
                            </Label>
                            <Badge 
                              variant="secondary" 
                              className={getCategoryColor(solution.categoria)}
                            >
                              {solution.categoria.replace('_', ' ')}
                            </Badge>
                          </div>
                          {solution.descricao && (
                            <p className="text-xs text-gray-600">{solution.descricao}</p>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="ml-6">
                          <Label htmlFor={`value-${solution.id}`} className="text-xs text-gray-500">
                            Valor desta solução (R$)
                          </Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id={`value-${solution.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={selectedSolution?.value || ''}
                              onChange={(e) => 
                                handleValueChange(solution.id, parseFloat(e.target.value) || 0)
                              }
                              className="pl-10 text-sm"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {selectedSolutions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      Resumo das Soluções Selecionadas:
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      {selectedSolutions.length} solução(ões) • Total: R$ {
                        selectedSolutions.reduce((sum, s) => sum + s.value, 0)
                          .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!includeTechnicalDetails && (
          <div className="text-center py-6 text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Seção de detalhes técnicos desabilitada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SolutionSelector;
