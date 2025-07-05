import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Search, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolarPanel {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_wp: number;
  largura_m: number;
  altura_m: number;
  peso_kg?: number;
  eficiencia: number;
  preco_unitario: number;
  tipos_telhado_compativeis: string[];
  ativo: boolean;
  destaque: boolean;
  created_at: string;
}

export const SolarPanelsManager = () => {
  const [panels, setPanels] = useState<SolarPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<SolarPanel | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fabricante: '',
    modelo: '',
    potencia_wp: 0,
    largura_m: 0,
    altura_m: 0,
    peso_kg: 0,
    eficiencia: 0,
    preco_unitario: 0,
    tipos_telhado_compativeis: [] as string[],
    ativo: true,
    destaque: false
  });

  const tiposTelhado = [
    'ceramico',
    'metalico',
    'fibrocimento',
    'concreto',
    'telha_shingle',
    'laje'
  ];

  useEffect(() => {
    loadPanels();
  }, []);

  const loadPanels = async () => {
    try {
      const { data, error } = await supabase
        .from('paineis_solares')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPanels((data as any[])?.map(panel => ({
        ...panel,
        tipos_telhado_compativeis: Array.isArray(panel.tipos_telhado_compativeis) 
          ? panel.tipos_telhado_compativeis 
          : []
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar painéis:', error);
      toast({
        title: "Erro ao carregar painéis",
        description: "Não foi possível carregar a lista de painéis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPanel) {
        const { error } = await supabase
          .from('paineis_solares')
          .update(formData)
          .eq('id', editingPanel.id);
        
        if (error) throw error;
        
        toast({
          title: "Painel atualizado",
          description: "Painel solar atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('paineis_solares')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Painel criado",
          description: "Novo painel solar criado com sucesso",
        });
      }
      
      loadPanels();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar painel:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o painel",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (panel: SolarPanel) => {
    setEditingPanel(panel);
    setFormData({
      fabricante: panel.fabricante,
      modelo: panel.modelo,
      potencia_wp: panel.potencia_wp,
      largura_m: panel.largura_m,
      altura_m: panel.altura_m,
      peso_kg: panel.peso_kg || 0,
      eficiencia: panel.eficiencia,
      preco_unitario: panel.preco_unitario,
      tipos_telhado_compativeis: panel.tipos_telhado_compativeis || [],
      ativo: panel.ativo,
      destaque: panel.destaque
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este painel?')) return;
    
    try {
      const { error } = await supabase
        .from('paineis_solares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Painel excluído",
        description: "Painel removido com sucesso",
      });
      
      loadPanels();
    } catch (error) {
      console.error('Erro ao excluir painel:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o painel",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPanel(null);
    setFormData({
      fabricante: '',
      modelo: '',
      potencia_wp: 0,
      largura_m: 0,
      altura_m: 0,
      peso_kg: 0,
      eficiencia: 0,
      preco_unitario: 0,
      tipos_telhado_compativeis: [],
      ativo: true,
      destaque: false
    });
  };

  const toggleTelhadoCompativel = (tipo: string) => {
    setFormData(prev => ({
      ...prev,
      tipos_telhado_compativeis: prev.tipos_telhado_compativeis.includes(tipo)
        ? prev.tipos_telhado_compativeis.filter(t => t !== tipo)
        : [...prev.tipos_telhado_compativeis, tipo]
    }));
  };

  const filteredPanels = panels.filter(panel =>
    panel.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    panel.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-8">Carregando painéis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar painéis..."
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
              <Button onClick={() => setEditingPanel(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Painel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPanel ? 'Editar Painel' : 'Novo Painel Solar'}
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
                    <Label htmlFor="potencia">Potência (Wp)</Label>
                    <Input
                      id="potencia"
                      type="number"
                      value={formData.potencia_wp}
                      onChange={(e) => setFormData(prev => ({ ...prev, potencia_wp: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="largura">Largura (m)</Label>
                    <Input
                      id="largura"
                      type="number"
                      step="0.01"
                      value={formData.largura_m}
                      onChange={(e) => setFormData(prev => ({ ...prev, largura_m: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="altura">Altura (m)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.01"
                      value={formData.altura_m}
                      onChange={(e) => setFormData(prev => ({ ...prev, altura_m: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={formData.peso_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, peso_kg: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eficiencia">Eficiência (%)</Label>
                    <Input
                      id="eficiencia"
                      type="number"
                      step="0.1"
                      value={formData.eficiencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, eficiencia: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço Unitário (R$)</Label>
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

                <div>
                  <Label>Tipos de Telhado Compatíveis</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {tiposTelhado.map(tipo => (
                      <label key={tipo} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.tipos_telhado_compativeis.includes(tipo)}
                          onChange={() => toggleTelhadoCompativel(tipo)}
                        />
                        <span className="text-sm capitalize">{tipo.replace('_', ' ')}</span>
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
                    {editingPanel ? 'Atualizar' : 'Criar'} Painel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabela de painéis */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fabricante/Modelo</TableHead>
                <TableHead>Potência</TableHead>
                <TableHead>Dimensões</TableHead>
                <TableHead>Eficiência</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPanels.map((panel) => (
                <TableRow key={panel.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{panel.fabricante}</div>
                      <div className="text-sm text-gray-500">{panel.modelo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{panel.potencia_wp}Wp</TableCell>
                  <TableCell>
                    {panel.largura_m}x{panel.altura_m}m
                    {panel.peso_kg && <div className="text-sm text-gray-500">{panel.peso_kg}kg</div>}
                  </TableCell>
                  <TableCell>{panel.eficiencia}%</TableCell>
                  <TableCell>R$ {panel.preco_unitario.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={panel.ativo ? "default" : "secondary"}>
                        {panel.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {panel.destaque && (
                        <Badge variant="outline">Destaque</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(panel)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(panel.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPanels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum painel encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};