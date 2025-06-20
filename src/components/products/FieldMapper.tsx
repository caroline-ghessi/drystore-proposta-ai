
import React, { useState } from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExcelColumn, FieldMapping, ProductField } from '@/types/products';

interface FieldMapperProps {
  excelColumns: ExcelColumn[];
  availableFields: ProductField[];
  mapping: FieldMapping;
  onMappingChange: (mapping: FieldMapping) => void;
  onAddCustomField: (field: ProductField) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export const FieldMapper: React.FC<FieldMapperProps> = ({
  excelColumns,
  availableFields,
  mapping,
  onMappingChange,
  onAddCustomField,
  onConfirm,
  isProcessing
}) => {
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'currency'>('text');
  const [showAddField, setShowAddField] = useState(false);

  const handleMappingChange = (excelColumn: string, targetField: string, required: boolean = false) => {
    const newMapping = { ...mapping };
    
    if (targetField === 'none') {
      delete newMapping[excelColumn];
    } else {
      newMapping[excelColumn] = {
        targetField,
        transformation: getTransformationType(targetField),
        required,
        customField: !availableFields.find(f => f.key === targetField)
      };
    }
    
    onMappingChange(newMapping);
  };

  const getTransformationType = (fieldKey: string): 'text' | 'number' | 'currency' | 'boolean' | 'date' => {
    const field = availableFields.find(f => f.key === fieldKey);
    if (field?.type === 'currency') return 'currency';
    if (field?.type === 'number') return 'number';
    if (field?.type === 'boolean') return 'boolean';
    if (field?.type === 'date') return 'date';
    return 'text';
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    
    const customField: ProductField = {
      key: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldName,
      type: newFieldType,
      required: false
    };
    
    onAddCustomField(customField);
    setNewFieldName('');
    setNewFieldType('text');
    setShowAddField(false);
  };

  const getMappedField = (excelColumn: string): string => {
    return mapping[excelColumn]?.targetField || 'none';
  };

  const isValidMapping = (): boolean => {
    const requiredFields = availableFields.filter(f => f.required).map(f => f.key);
    const mappedFields = Object.values(mapping).map(m => m.targetField);
    return requiredFields.every(field => mappedFields.includes(field));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapeamento de Campos</CardTitle>
        <p className="text-sm text-gray-600">
          Configure como os dados da planilha devem ser importados
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {excelColumns.map((column) => (
            <div key={column.name} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{column.name}</div>
                <div className="text-sm text-gray-500">
                  Ex: {column.sampleValues.slice(0, 2).join(', ')}
                </div>
              </div>
              
              <ArrowRight className="h-4 w-4 text-gray-400" />
              
              <div className="flex-1">
                <Select
                  value={getMappedField(column.name)}
                  onValueChange={(value) => handleMappingChange(column.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não mapear</SelectItem>
                    {availableFields.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label} {field.required && '*'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Dialog open={showAddField} onOpenChange={setShowAddField}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Campo Personalizado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Campo Personalizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome do Campo</label>
                  <Input
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Ex: Peso, Dimensões, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Dados</label>
                  <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="currency">Moeda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddField(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddCustomField}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={onConfirm}
            disabled={!isValidMapping() || isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? 'Processando...' : 'Importar Dados'}
          </Button>
        </div>

        {!isValidMapping() && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
            ⚠️ Campos obrigatórios precisam ser mapeados: {
              availableFields
                .filter(f => f.required)
                .filter(f => !Object.values(mapping).find(m => m.targetField === f.key))
                .map(f => f.label)
                .join(', ')
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};
