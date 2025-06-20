
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ERPBudgetImporterProps {
  onImportComplete: (budgetData: any) => void;
  onCancel: () => void;
}

const ERPBudgetImporter = ({ onImportComplete, onCancel }: ERPBudgetImporterProps) => {
  const [budgetNumber, setBudgetNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [budgetFound, setBudgetFound] = useState<any>(null);
  const [searchError, setSearchError] = useState<string>('');
  const { toast } = useToast();

  const searchBudget = async () => {
    if (!budgetNumber.trim()) {
      setSearchError('Por favor, informe o número do orçamento');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setBudgetFound(null);

    try {
      // Simular busca no ERP (futuramente será uma chamada real para API)
      console.log('Buscando orçamento no ERP:', budgetNumber);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dados simulados do orçamento encontrado
      const mockBudgetData = {
        budgetNumber: budgetNumber,
        clientName: 'Construtora ABC Ltda',
        clientEmail: 'contato@construtorabc.com.br',
        clientPhone: '(11) 99999-8888',
        projectName: `Projeto Orçamento ${budgetNumber}`,
        address: 'Rua das Construções, 123 - São Paulo, SP',
        totalValue: 45750.00,
        validUntil: '2024-02-15',
        items: [
          {
            id: '1',
            code: 'DRY001',
            description: 'Placas Drywall 12,5mm Standard',
            quantity: 85,
            unit: 'm²',
            unitPrice: 28.50,
            total: 2422.50
          },
          {
            id: '2',
            code: 'PER002',
            description: 'Perfis Metálicos 48mm',
            quantity: 120,
            unit: 'm',
            unitPrice: 12.80,
            total: 1536.00
          },
          {
            id: '3',
            code: 'ACB003',
            description: 'Acabamentos e Acessórios',
            quantity: 1,
            unit: 'vb',
            unitPrice: 8500.00,
            total: 8500.00
          },
          {
            id: '4',
            code: 'INS004',
            description: 'Mão de obra especializada',
            quantity: 180,
            unit: 'm²',
            unitPrice: 185.40,
            total: 33372.00
          }
        ],
        observations: 'Orçamento válido por 15 dias. Inclui materiais e mão de obra especializada.',
        status: 'active'
      };

      setBudgetFound(mockBudgetData);
      toast({
        title: "Orçamento encontrado!",
        description: `Orçamento ${budgetNumber} localizado no ERP`,
      });
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      setSearchError('Erro ao conectar com o ERP. Tente novamente.');
      toast({
        title: "Erro na busca",
        description: "Não foi possível conectar com o ERP",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = () => {
    if (budgetFound) {
      onImportComplete(budgetFound);
      toast({
        title: "Orçamento importado!",
        description: "Dados importados com sucesso. Você pode editá-los antes de finalizar.",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600" />
          Importar Orçamento do ERP
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informe o número do orçamento para importar automaticamente os dados do ERP
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Busca do Orçamento */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="budgetNumber">Número do Orçamento</Label>
              <Input
                id="budgetNumber"
                placeholder="Ex: ORC-2024-001"
                value={budgetNumber}
                onChange={(e) => setBudgetNumber(e.target.value)}
                disabled={isSearching}
              />
            </div>
            <Button 
              onClick={searchBudget}
              disabled={isSearching || !budgetNumber.trim()}
              className="self-end"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {searchError && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {searchError}
            </div>
          )}
        </div>

        {/* Resultado da Busca */}
        {budgetFound && (
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium">Orçamento Encontrado</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {budgetFound.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Cliente:</span>
                  <p>{budgetFound.clientName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Projeto:</span>
                  <p>{budgetFound.projectName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Valor Total:</span>
                  <p className="font-bold text-blue-600">
                    R$ {budgetFound.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Válido até:</span>
                  <p>{new Date(budgetFound.validUntil).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-600">Itens:</span>
                <p className="text-sm">{budgetFound.items.length} produtos no orçamento</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleImport} className="flex-1">
                Importar Orçamento
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Ações quando não há resultado */}
        {!budgetFound && !isSearching && (
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onCancel}>
              Voltar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ERPBudgetImporter;
