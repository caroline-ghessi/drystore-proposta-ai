
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Clock } from 'lucide-react';
import { FollowUpTrigger } from '@/types/followup';

interface FollowUpTriggerConfigProps {
  triggers: FollowUpTrigger[];
  onTriggersChange: (triggers: FollowUpTrigger[]) => void;
}

const FollowUpTriggerConfig = ({ triggers, onTriggersChange }: FollowUpTriggerConfigProps) => {
  const [newTrigger, setNewTrigger] = useState<Partial<FollowUpTrigger>>({
    type: 'delivery_completed',
    daysAfter: 3,
    isActive: true
  });

  const triggerTypes = [
    { value: 'delivery_completed', label: 'Após entrega finalizada' },
    { value: 'product_purchase', label: 'Após compra de produto específico' },
    { value: 'no_activity', label: 'Sem atividade há X dias' }
  ];

  const addTrigger = () => {
    if (!newTrigger.name) return;

    const trigger: FollowUpTrigger = {
      id: Date.now().toString(),
      type: newTrigger.type as any,
      name: newTrigger.name,
      description: newTrigger.description || '',
      daysAfter: newTrigger.daysAfter || 3,
      productCategories: newTrigger.productCategories || [],
      isActive: newTrigger.isActive || true,
      createdAt: new Date().toISOString()
    };

    onTriggersChange([...triggers, trigger]);
    setNewTrigger({ type: 'delivery_completed', daysAfter: 3, isActive: true });
  };

  const toggleTrigger = (triggerId: string) => {
    const updated = triggers.map(trigger =>
      trigger.id === triggerId
        ? { ...trigger, isActive: !trigger.isActive }
        : trigger
    );
    onTriggersChange(updated);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Configuração de Gatilhos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Triggers Existentes */}
        <div>
          <h4 className="font-medium mb-3">Gatilhos Ativos</h4>
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium">{trigger.name}</h5>
                    <Badge variant={trigger.isActive ? 'default' : 'secondary'}>
                      {trigger.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{trigger.description}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {trigger.daysAfter} dias após {triggerTypes.find(t => t.value === trigger.type)?.label.toLowerCase()}
                  </div>
                </div>
                <Switch
                  checked={trigger.isActive}
                  onCheckedChange={() => toggleTrigger(trigger.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Adicionar Novo Trigger */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Adicionar Novo Gatilho</h4>
          <div className="space-y-3">
            <Input
              placeholder="Nome do gatilho"
              value={newTrigger.name || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
            />
            
            <Input
              placeholder="Descrição (opcional)"
              value={newTrigger.description || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
            />

            <Select
              value={newTrigger.type}
              onValueChange={(value) => setNewTrigger({ ...newTrigger, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Dias após o evento"
              value={newTrigger.daysAfter || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, daysAfter: parseInt(e.target.value) })}
            />

            <Button onClick={addTrigger} disabled={!newTrigger.name}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Gatilho
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpTriggerConfig;
