
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Target, TrendingUp } from 'lucide-react';
import { useSalesTargets, useSalesUsers } from '@/hooks/useSalesTargets';

interface TargetFormData {
  user_id: string;
  month: number;
  year: number;
  target_amount: number;
}

export const SalesTargetManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<any>(null);
  const [formData, setFormData] = useState<TargetFormData>({
    user_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    target_amount: 0
  });

  const { targets, isLoading, createTarget, updateTarget, deleteTarget } = useSalesTargets();
  const { data: salesUsers } = useSalesUsers();

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTarget) {
      updateTarget({
        id: editingTarget.id,
        target_amount: formData.target_amount
      });
    } else {
      createTarget(formData);
    }
    
    setIsDialogOpen(false);
    setEditingTarget(null);
    setFormData({
      user_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      target_amount: 0
    });
  };

  const handleEdit = (target: any) => {
    setEditingTarget(target);
    setFormData({
      user_id: target.user_id,
      month: target.month,
      year: target.year,
      target_amount: target.target_amount
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteTarget(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Gerenciar Metas de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Gerenciar Metas de Vendas
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTarget(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTarget ? 'Editar Meta' : 'Criar Nova Meta'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingTarget && (
                  <div>
                    <Label htmlFor="user_id">Vendedor</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um vendedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesUsers?.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.nome} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {!editingTarget && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Mês</Label>
                      <Select
                        value={formData.month.toString()}
                        onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="target_amount">Valor da Meta (R$)</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) })}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTarget ? 'Atualizar' : 'Criar'} Meta
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets?.map((target: any) => {
                const monthName = months.find(m => m.value === target.month)?.label;
                const isCurrentMonth = target.month === new Date().getMonth() + 1 && 
                                     target.year === new Date().getFullYear();
                
                return (
                  <TableRow key={target.id}>
                    <TableCell className="font-medium">
                      {target.profiles?.nome}
                      <div className="text-sm text-gray-500 capitalize">
                        {target.profiles?.role?.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {monthName} {target.year}
                      {isCurrentMonth && (
                        <Badge variant="secondary" className="ml-2">
                          Atual
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(target.target_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isCurrentMonth ? "default" : "outline"}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {isCurrentMonth ? 'Ativa' : 'Histórica'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(target)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(target.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!targets || targets.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhuma meta definida ainda.
                    <br />
                    <span className="text-sm">Clique em "Nova Meta" para começar.</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
