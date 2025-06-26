
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Download, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DownloadFileDialog } from './dialogs/DownloadFileDialog';
import { useToast } from '@/hooks/use-toast';

interface DownloadFile {
  id: string;
  product_group: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: string | null;
  category: string | null;
  order_index: number;
  active: boolean;
  created_at: string;
}

export const DownloadFilesManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadFile | null>(null);
  const { toast } = useToast();

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['download-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('download_files')
        .select('*')
        .order('product_group')
        .order('order_index');
      
      if (error) throw error;
      return data as DownloadFile[];
    }
  });

  const handleEdit = (item: DownloadFile) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    const { error } = await supabase
      .from('download_files')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir arquivo",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Arquivo excluído com sucesso"
      });
      refetch();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('download_files')
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
        description: `Arquivo ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
      });
      refetch();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    refetch();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Arquivos para Download</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Arquivo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files?.map((file) => (
          <Card key={file.id} className={`${!file.active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{file.title}</CardTitle>
                  <div className="space-y-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {file.product_group}
                    </Badge>
                    {file.category && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {file.category}
                      </Badge>
                    )}
                  </div>
                </div>
                {!file.active && (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {file.description && (
                  <p className="text-sm text-gray-600">{file.description}</p>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{file.file_type}</span>
                  {file.file_size && <span>{file.file_size}</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(file.file_url, '_blank')}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(file)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(file.id, file.active)}
                  >
                    {file.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {files?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum arquivo cadastrado</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Arquivo
          </Button>
        </div>
      )}

      <DownloadFileDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </div>
  );
};
