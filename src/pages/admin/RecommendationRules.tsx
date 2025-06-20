
import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Target, 
  Package,
  Brain,
  Save,
  AlertCircle 
} from 'lucide-react';
import { RecommendationRule, ProductGroup } from '@/types/recommendations';
import PermissionGuard from '@/components/PermissionGuard';

const RecommendationRules = () => {
  const [rules, setRules] = useState<RecommendationRule[]>([
    {
      id: '1',
      name: 'Complementos para Telhado',
      description: 'Recomenda vedações e acessórios quando telhas estão na proposta',
      triggerGroups: ['telhas', 'estrutura-telhado'],
      recommendedProducts: [
        {
          productId: 'ved-001',
          name: 'Kit de Vedação Premium',
          description: 'Vedação completa para telhas',
          price: 189.90,
          originalPrice: 249.90,
          image: '/placeholder.svg',
          reason: 'Essencial para vedação perfeita',
          discount: 24,
          category: 'vedacao'
        }
      ],
      priority: 1,
      isActive: true,
      conditions: {
        minValue: 1000
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'Acabamento Drywall',
      description: 'Sugere massas e parafusos para projetos de drywall',
      triggerGroups: ['drywall', 'placas'],
      recommendedProducts: [
        {
          productId: 'aca-001',
          name: 'Massa para Junta Premium',
          description: 'Acabamento profissional',
          price: 85.90,
          originalPrice: 119.90,
          image: '/placeholder.svg',
          reason: 'Necessária para acabamento perfeito',
          discount: 28,
          category: 'acabamento'
        }
      ],
      priority: 2,
      isActive: true,
      conditions: {},
      createdAt: '2024-01-16',
      updatedAt: '2024-01-18'
    }
  ]);

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([
    {
      id: 'telhas',
      name: 'Telhas e Coberturas',
      keywords: ['telha', 'shingle', 'cobertura', 'telhado'],
      category: 'cobertura'
    },
    {
      id: 'drywall',
      name: 'Drywall e Placas',
      keywords: ['drywall', 'placa', 'gesso', 'parede'],
      category: 'acabamento'
    },
    {
      id: 'estrutura-telhado',
      name: 'Estrutura de Telhado',
      keywords: ['estrutura', 'madeira', 'viga', 'caibro'],
      category: 'estrutural'
    }
  ]);

  const [showNewRule, setShowNewRule] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);

  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerGroups: [] as string[],
    priority: 1,
    minValue: 0,
    maxValue: 0
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    keywords: '',
    category: ''
  });

  const handleSaveRule = () => {
    if (!newRule.name || !newRule.description) return;

    const rule: RecommendationRule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description,
      triggerGroups: newRule.triggerGroups,
      recommendedProducts: [],
      priority: newRule.priority,
      isActive: true,
      conditions: {
        minValue: newRule.minValue || undefined,
        maxValue: newRule.maxValue || undefined
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRules(prev => [...prev, rule]);
    setNewRule({ name: '', description: '', triggerGroups: [], priority: 1, minValue: 0, maxValue: 0 });
    setShowNewRule(false);
  };

  const handleSaveGroup = () => {
    if (!newGroup.name || !newGroup.keywords) return;

    const group: ProductGroup = {
      id: newGroup.name.toLowerCase().replace(/\s+/g, '-'),
      name: newGroup.name,
      keywords: newGroup.keywords.split(',').map(k => k.trim()),
      category: newGroup.category
    };

    setProductGroups(prev => [...prev, group]);
    setNewGroup({ name: '', keywords: '', category: '' });
    setShowNewGroup(false);
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const deleteGroup = (groupId: string) => {
    setProductGroups(prev => prev.filter(group => group.id !== groupId));
  };

  return (
    <Layout>
      <PermissionGuard requiredRole={['admin']}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regras de Recomendação</h1>
              <p className="text-gray-600 mt-1">Configure as regras inteligentes para recomendações automáticas</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Brain className="w-4 h-4 mr-1" />
              Sistema IA
            </Badge>
          </div>

          <Tabs defaultValue="rules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rules">Regras de Recomendação</TabsTrigger>
              <TabsTrigger value="groups">Grupos de Produtos</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Regras Ativas</h2>
                <Dialog open={showNewRule} onOpenChange={setShowNewRule}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Regra
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Regra</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rule-name">Nome da Regra</Label>
                        <Input
                          id="rule-name"
                          value={newRule.name}
                          onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Complementos para Telhado"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rule-description">Descrição</Label>
                        <Textarea
                          id="rule-description"
                          value={newRule.description}
                          onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva quando esta regra deve ser aplicada"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Grupos Acionadores</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {productGroups.map(group => (
                            <label key={group.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newRule.triggerGroups.includes(group.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRule(prev => ({ 
                                      ...prev, 
                                      triggerGroups: [...prev.triggerGroups, group.id] 
                                    }));
                                  } else {
                                    setNewRule(prev => ({ 
                                      ...prev, 
                                      triggerGroups: prev.triggerGroups.filter(id => id !== group.id) 
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{group.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="rule-priority">Prioridade</Label>
                          <Input
                            id="rule-priority"
                            type="number"
                            value={newRule.priority}
                            onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                            min="1"
                            max="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rule-min-value">Valor Mínimo (R$)</Label>
                          <Input
                            id="rule-min-value"
                            type="number"
                            value={newRule.minValue || ''}
                            onChange={(e) => setNewRule(prev => ({ ...prev, minValue: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="rule-max-value">Valor Máximo (R$)</Label>
                          <Input
                            id="rule-max-value"
                            type="number"
                            value={newRule.maxValue || ''}
                            onChange={(e) => setNewRule(prev => ({ ...prev, maxValue: parseFloat(e.target.value) || 0 }))}
                            placeholder="Sem limite"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setShowNewRule(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveRule} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Regra
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {rules.map(rule => (
                  <Card key={rule.id} className={`border-0 shadow-md ${!rule.isActive ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          {rule.name}
                          <Badge variant={rule.isActive ? "default" : "secondary"} className="ml-2">
                            {rule.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{rule.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {rule.triggerGroups.map(groupId => {
                          const group = productGroups.find(g => g.id === groupId);
                          return group ? (
                            <Badge key={groupId} variant="outline">
                              {group.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Prioridade: {rule.priority}</p>
                        {rule.conditions.minValue && <p>Valor mínimo: R$ {rule.conditions.minValue}</p>}
                        <p>Produtos recomendados: {rule.recommendedProducts.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Grupos de Produtos</h2>
                <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Grupo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Grupo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="group-name">Nome do Grupo</Label>
                        <Input
                          id="group-name"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Telhas e Coberturas"
                        />
                      </div>
                      <div>
                        <Label htmlFor="group-keywords">Palavras-chave (separadas por vírgula)</Label>
                        <Input
                          id="group-keywords"
                          value={newGroup.keywords}
                          onChange={(e) => setNewGroup(prev => ({ ...prev, keywords: e.target.value }))}
                          placeholder="telha, shingle, cobertura, telhado"
                        />
                      </div>
                      <div>
                        <Label htmlFor="group-category">Categoria</Label>
                        <Input
                          id="group-category"
                          value={newGroup.category}
                          onChange={(e) => setNewGroup(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="Ex: cobertura"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setShowNewGroup(false)} className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveGroup} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Grupo
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {productGroups.map(group => (
                  <Card key={group.id} className="border-0 shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Package className="w-5 h-5 mr-2 text-green-600" />
                          {group.name}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Categoria:</span>
                          <Badge variant="outline" className="ml-2">{group.category}</Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Palavras-chave:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {group.keywords.map(keyword => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PermissionGuard>
    </Layout>
  );
};

export default RecommendationRules;
