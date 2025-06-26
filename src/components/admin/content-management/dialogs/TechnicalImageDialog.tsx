
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

interface TechnicalImage {
  id: string;
  product_group: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  order_index: number;
  active: boolean;
}

interface TechnicalImageDialogProps {
  open: boolean;
  onClose: () => void;
  editingItem?: TechnicalImage | null;
}

interface FormData {
  product_group: string;
  title: string;
  description: string;
  category: string;
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

const categories = [
  'Instalação',
  'Especificações',
  'Manutenção',
  'Segurança',
  'Funcionamento',
  'Comparativo',
  'Benefícios',
  'Certificações'
];

export const TechnicalImageDialog = ({ open, onClose, editingItem }: TechnicalImageDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      product_group: '',
      title: '',
      description: '',
      category: '',
      order_index: 0
    }
  });

  useEffect(() => {
    if (editingItem) {
      setValue('product_group', editingItem.product_group);
      setValue('title', editingItem.title);
      setValue('description', editingItem.description || '');
      setValue('category', editingItem.category || '');
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
    const filePath = `technical/${fileName}`;

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

      const imageData = {
        ...data,
        image_url: imageUrl,
        active: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('technical_images')
          .update(imageData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('technical_images')
          .insert([imageData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Imagem ${editingItem ? 'atualizada' : 'criada'} com sucesso`
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar imagem",
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
            {editingItem ? 'Editar Imagem' : 'Adicionar Imagem'}
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
              placeholder="Título da imagem técnica"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              {...register('description')}
              placeholder="Descrição explicativa da imagem"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select onValueChange={(value) => setValue('category', value)} value={watch('category')}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="image">Imagem</Label>
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
