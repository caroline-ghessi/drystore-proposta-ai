
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

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
}

interface ProjectGalleryDialogProps {
  open: boolean;
  onClose: () => void;
  editingItem?: ProjectGalleryItem | null;
}

interface FormData {
  product_group: string;
  title: string;
  description: string;
  project_type: string;
  completion_date: string;
  client_name: string;
  location: string;
  order_index: number;
}

const productGroups = [
  'Energia Solar',
  'Light Steel Frame',
  'Telha Shingle',
  'Divisórias',
  'Forros',
  'Pisos e Mantas',
  'Ferramentas',
  'Genérico'
];

export const ProjectGalleryDialog = ({ open, onClose, editingItem }: ProjectGalleryDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      product_group: '',
      title: '',
      description: '',
      project_type: '',
      completion_date: '',
      client_name: '',
      location: '',
      order_index: 0
    }
  });

  useEffect(() => {
    if (editingItem) {
      setValue('product_group', editingItem.product_group);
      setValue('title', editingItem.title);
      setValue('description', editingItem.description || '');
      setValue('project_type', editingItem.project_type || '');
      setValue('completion_date', editingItem.completion_date || '');
      setValue('client_name', editingItem.client_name || '');
      setValue('location', editingItem.location || '');
      setValue('order_index', editingItem.order_index);
      setImagePreview(editingItem.image_url);
    } else {
      reset();
      setImagePreview('');
    }
  }, [editingItem, setValue, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-management')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('content-management')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      let imageUrl = editingItem?.image_url || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (!imageUrl) {
        toast({
          title: "Erro",
          description: "É necessário selecionar uma imagem",
          variant: "destructive"
        });
        return;
      }

      const projectData = {
        ...data,
        image_url: imageUrl,
        active: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('project_gallery')
          .update(projectData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_gallery')
          .insert([projectData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Projeto ${editingItem ? 'atualizado' : 'criado'} com sucesso`
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Projeto' : 'Adicionar Projeto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="product_group">Grupo de Produtos</Label>
            <Select onValueChange={(value) => setValue('product_group', value)} value={watch('product_group')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo de produtos" />
              </SelectTrigger>
              <SelectContent>
                {productGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              {...register('title', { required: true })}
              placeholder="Título do projeto"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              {...register('description')}
              placeholder="Descrição do projeto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Nome do Cliente</Label>
              <Input
                {...register('client_name')}
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                {...register('location')}
                placeholder="Cidade/Estado"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project_type">Tipo de Projeto</Label>
              <Input
                {...register('project_type')}
                placeholder="Ex: Residencial, Comercial"
              />
            </div>

            <div>
              <Label htmlFor="completion_date">Data de Conclusão</Label>
              <Input
                type="date"
                {...register('completion_date')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="order_index">Ordem de Exibição</Label>
            <Input
              type="number"
              {...register('order_index', { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="image">Imagem do Projeto</Label>
            <div className="mt-2">
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : editingItem ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
