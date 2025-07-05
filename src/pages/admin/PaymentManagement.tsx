import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePaymentConditions, useCreatePaymentCondition, useUpdatePaymentCondition } from '@/hooks/usePaymentConditions';
import { CreditCard, Plus, Settings, Percent, Calendar, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type PaymentCondition = Tables<'payment_conditions'>;

const PaymentManagement = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<PaymentCondition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    installments: 1,
    discount_percentage: 0,
    interest_percentage: 0,
    active: true
  });

  const { data: conditions, isLoading } = usePaymentConditions();
  const createMutation = useCreatePaymentCondition();
  const updateMutation = useUpdatePaymentCondition();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCondition) {
        await updateMutation.mutateAsync({
          id: editingCondition.id,
          updates: formData
        });
        toast({
          title: "Condição atualizada",
          description: "A condição de pagamento foi atualizada com sucesso."
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Condição criada",
          description: "Nova condição de pagamento criada com sucesso."
        });
      }
      
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a condição de pagamento.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      installments: 1,
      discount_percentage: 0,
      interest_percentage: 0,
      active: true
    });
    setEditingCondition(null);
  };

  const openEditDialog = (condition: PaymentCondition) => {
    setEditingCondition(condition);
    setFormData({
      name: condition.name,
      installments: condition.installments,
      discount_percentage: condition.discount_percentage || 0,
      interest_percentage: condition.interest_percentage || 0,
      active: condition.active ?? true
    });
    setDialogOpen(true);
  };

  const toggleStatus = async (condition: PaymentCondition) => {
    try {
      await updateMutation.mutateAsync({
        id: condition.id,
        updates: { active: !condition.active }
      });
      toast({
        title: "Status atualizado",
        description: `Condição ${condition.active ? 'desativada' : 'ativada'} com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da condição.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando condições de pagamento...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestão de Pagamentos
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure condições de pagamento, taxas e parcelamentos
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Condição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCondition ? 'Editar Condição' : 'Nova Condição de Pagamento'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Condição</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: À Vista, Até 6x, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: parseInt(e.target.value) }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Desconto (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="interest">Juros (%)</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.interest_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, interest_percentage: parseFloat(e.target.value) }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Condição ativa</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingCondition ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conditions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conditions" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Condições de Pagamento
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conditions" className="space-y-4">
            <div className="grid gap-4">
              {conditions?.map((condition) => (
                <Card key={condition.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {condition.name}
                            {!condition.active && (
                              <Badge variant="secondary">Inativa</Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {condition.installments}x
                            </span>
                            {condition.discount_percentage > 0 && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Percent className="w-3 h-3" />
                                {condition.discount_percentage}% desconto
                              </span>
                            )}
                            {condition.interest_percentage > 0 && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Percent className="w-3 h-3" />
                                {condition.interest_percentage}% juros
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(condition)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant={condition.active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleStatus(condition)}
                        >
                          {condition.active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!conditions?.length && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      Nenhuma condição cadastrada
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Crie a primeira condição de pagamento para começar.
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Condição
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Gateway</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                    <Settings className="w-8 h-8 mx-auto mb-2" />
                    <p>Configurações de gateway de pagamento</p>
                    <p className="text-sm">Em desenvolvimento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PaymentManagement;