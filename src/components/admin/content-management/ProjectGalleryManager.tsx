
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectGalleryDialog } from './dialogs/ProjectGalleryDialog';
import { useToast } from '@/hooks/use-toast';

interface ProjectGalleryItem {
  id: string;
  product_group: string;
  title: string;
  description: string | null;
  image_url: string;
  project_type: string | null;
  completion_date: string | null;
  client_name: string | null;
  location: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
}

export const ProjectGalleryManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectGalleryItem | null>(null);
  const { toast } = useToast();

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['project-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_gallery')
        .select('*')
        .order('product_group')
        .order('order_index');
      
      if (error) throw error;
      return data as ProjectGalleryItem[];
    }
  });

  const handleEdit = (item: ProjectGalleryItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;

    const { error } = await supabase
      .from('project_gallery')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso"
      });
      refetch();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('project_gallery')
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
        description: `Projeto ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
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
        <h2 className="text-2xl font-semibold">Galeria de Projetos</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Projeto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {!project.active && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                  <Badge variant="secondary">Inativo</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {project.product_group}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2 text-sm text-gray-600">
                {project.client_name && <p><strong>Cliente:</strong> {project.client_name}</p>}
                {project.location && <p><strong>Local:</strong> {project.location}</p>}
                {project.project_type && <p><strong>Tipo:</strong> {project.project_type}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(project)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(project.id, project.active)}
                >
                  {project.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum projeto cadastrado</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Projeto
          </Button>
        </div>
      )}

      <ProjectGalleryDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </div>
  );
};
