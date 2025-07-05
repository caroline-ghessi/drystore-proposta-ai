import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Inverter {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_kw: number;
  eficiencia: number;
  preco_unitario: number;
  faixa_potencia_min_kwp: number;
  faixa_potencia_max_kwp: number;
  tipos_instalacao: string[];
  ativo: boolean;
  destaque: boolean;
  created_at: string;
}

export const InvertersManager = () => {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInverter, setEditingInverter] = useState<Inverter | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fabricante: '',
    modelo: '',
    potencia_kw: 0,
    eficiencia: 0.97,
    preco_unitario: 0,
    faixa_potencia_min_kwp: 0,
    faixa_potencia_max_kwp: 100,
    tipos_instalacao: [] as string[],
    ativo: true,
    destaque: false
  });

  const tiposInstalacao = [
    'residencial',
    'comercial',
    'industrial'
  ];

  useEffect(() => {
    loadInverters();
  }, []);

  const loadInverters = async () => {
    try {
      const { data, error } = await supabase
        .from('inversores_solares')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInverters((data as any[])?.map(inverter => ({
        ...inverter,
        tipos_instalacao: Array.isArray(inverter.tipos_instalacao) 
          ? inverter.tipos_instalacao 
          : []
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar inversores:', error);
      toast({
        title: "Erro ao carregar inversores",
        description: "Não foi possível carregar a lista de inversores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInverter) {
        const { error } = await supabase
          .from('inversores_solares')
          .update(formData)
          .eq('id', editingInverter.id);
        
        if (error) throw error;
        
        toast({
          title: "Inversor atualizado",
          description: "Inversor atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('inversores_solares')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Inversor criado",
          description: "Novo inversor criado com sucesso",
        });
      }
      
      loadInverters();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar inversor:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o inversor",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (inverter: Inverter) => {
    setEditingInverter(inverter);
    setFormData({
      fabricante: inverter.fabricante,
      modelo: inverter.modelo,
      potencia_kw: inverter.potencia_kw,
      eficiencia: inverter.eficiencia,
      preco_unitario: inverter.preco_unitario,
      faixa_potencia_min_kwp: inverter.faixa_potencia_min_kwp,
      faixa_potencia_max_kwp: inverter.faixa_potencia_max_kwp,
      tipos_instalacao: inverter.tipos_instalacao || [],
      ativo: inverter.ativo,
      destaque: inverter.destaque
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este inversor?')) return;
    
    try {
      const { error } = await supabase
        .from('inversores_solares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Inversor excluído",
        description: "Inversor removido com sucesso",
      });
      
      loadInverters();
    } catch (error) {
      console.error('Erro ao excluir inversor:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o inversor",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInverter(null);
    setFormData({
      fabricante: '',
      modelo: '',
      potencia_kw: 0,
      eficiencia: 0.97,
      preco_unitario: 0,
      faixa_potencia_min_kwp: 0,
      faixa_potencia_max_kwp: 100,
      tipos_instalacao: [],
      ativo: true,
      destaque: false
    });
  };

  const toggleTipoInstalacao = (tipo: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_instalacao: prev.tipos_instalacao.includes(tipo)
        ? prev.tipos_instalacao.filter(t => t !== tipo)
        : [...prev.tipos_instalacao, tipo]
    }));
  };

  const filteredInverters = inverters.filter(inverter =>
    inverter.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inverter.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Carregando inversores...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar inversores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingInverter(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Inversor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingInverter ? 'Editar Inversor' : 'Novo Inversor'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabricante">Fabricante</Label>
                    <Input
                      id="fabricante"
                      value={formData.fabricante}
                      onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="potencia">Potência (kW)</Label>
                    <Input
                      id="potencia"
                      type="number"
                      step="0.1"
                      value={formData.potencia_kw}
                      onChange={(e) => setFormData(prev => ({ ...prev, potencia_kw: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eficiencia">Eficiência</Label>
                    <Input
                      id="eficiencia"
                      type="number"
                      step="0.001"
                      min="0"
                      max="1"
                      value={formData.eficiencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, eficiencia: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco_unitario}
                      onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_potencia">Potência Mínima (kWp)</Label>
                    <Input
                      id="min_potencia"
                      type="number"
                      step="0.1"
                      value={formData.faixa_potencia_min_kwp}
                      onChange={(e) => setFormData(prev => ({ ...prev, faixa_potencia_min_kwp: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_potencia">Potência Máxima (kWp)</Label>
                    <Input
                      id="max_potencia"
                      type="number"
                      step="0.1"
                      value={formData.faixa_potencia_max_kwp}
                      onChange={(e) => setFormData(prev => ({ ...prev, faixa_potencia_max_kwp: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Tipos de Instalação</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {tiposInstalacao.map(tipo => (
                      <label key={tipo} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.tipos_instalacao.includes(tipo)}
                          onChange={() => toggleTipoInstalacao(tipo)}
                        />
                        <span className="text-sm capitalize">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                    />
                    <Label htmlFor="ativo">Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="destaque"
                      checked={formData.destaque}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destaque: checked }))}
                    />
                    <Label htmlFor="destaque">Destaque</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingInverter ? 'Atualizar' : 'Criar'} Inversor
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabela de inversores */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fabricante/Modelo</TableHead>
                <TableHead>Potência</TableHead>
                <TableHead>Eficiência</TableHead>
                <TableHead>Faixa kWp</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInverters.map((inverter) => (
                <TableRow key={inverter.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{inverter.fabricante}</div>
                      <div className="text-sm text-gray-500">{inverter.modelo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{inverter.potencia_kw}kW</TableCell>
                  <TableCell>{(inverter.eficiencia * 100).toFixed(1)}%</TableCell>
                  <TableCell>
                    {inverter.faixa_potencia_min_kwp} - {inverter.faixa_potencia_max_kwp} kWp
                  </TableCell>
                  <TableCell>R$ {inverter.preco_unitario.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={inverter.ativo ? "default" : "secondary"}>
                        {inverter.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {inverter.destaque && (
                        <Badge variant="outline">Destaque</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(inverter)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(inverter.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredInverters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum inversor encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};