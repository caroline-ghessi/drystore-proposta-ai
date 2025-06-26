
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TechnicalImageDialog } from './dialogs/TechnicalImageDialog';
import { useToast } from '@/hooks/use-toast';

interface TechnicalImage {
  id: string;
  product_group: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
}

export const TechnicalImagesManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TechnicalImage | null>(null);
  const { toast } = useToast();

  const { data: images, isLoading, refetch } = useQuery({
    queryKey: ['technical-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technical_images')
        .select('*')
        .order('product_group')
        .order('order_index');
      
      if (error) throw error;
      return data as TechnicalImage[];
    }
  });

  const handleEdit = (item: TechnicalImage) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    const { error } = await supabase
      .from('technical_images')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir imagem",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Imagem excluída com sucesso"
      });
      refetch();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('technical_images')
      .update({ active: !currentActive })
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: `Imagem ${!currentActive ? 'ativada' : 'desativada'} com sucesso`
      });
      refetch();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    refetch();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Imagens Técnicas</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Imagem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images?.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 relative">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              {!image.active && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                  <Badge variant="secondary">Inativa</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{image.title}</CardTitle>
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  {image.product_group}
                </Badge>
                {image.category && (
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {image.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {image.description}
                </p>
              )}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(image)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(image.id, image.active)}
                  className="h-8 w-8 p-0"
                >
                  {image.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhuma imagem técnica cadastrada</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeira Imagem
          </Button>
        </div>
      )}

      <TechnicalImageDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </div>
  );
};
