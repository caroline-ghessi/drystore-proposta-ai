
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
import { Upload, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  product_group: string;
  client_name: string;
  company: string | null;
  project_type: string | null;
  content: string;
  rating: number;
  avatar_url: string | null;
  location: string | null;
  order_index: number;
  active: boolean;
}

interface TestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  editingItem?: Testimonial | null;
}

interface FormData {
  product_group: string;
  client_name: string;
  company: string;
  project_type: string;
  content: string;
  rating: number;
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

export const TestimonialDialog = ({ open, onClose, editingItem }: TestimonialDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState(5);
  const { toast } = useToast();

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      product_group: '',
      client_name: '',
      company: '',
      project_type: '',
      content: '',
      rating: 5,
      location: '',
      order_index: 0
    }
  });

  useEffect(() => {
    if (editingItem) {
      setValue('product_group', editingItem.product_group);
      setValue('client_name', editingItem.client_name);
      setValue('company', editingItem.company || '');
      setValue('project_type', editingItem.project_type || '');
      setValue('content', editingItem.content);
      setValue('rating', editingItem.rating);
      setValue('location', editingItem.location || '');
      setValue('order_index', editingItem.order_index);
      setSelectedRating(editingItem.rating);
      setAvatarPreview(editingItem.avatar_url || '');
    } else {
      reset();
      setSelectedRating(5);
      setAvatarPreview('');
    }
  }, [editingItem, setValue, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `testimonials/${fileName}`;

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
      let avatarUrl = editingItem?.avatar_url || '';

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const testimonialData = {
        ...data,
        rating: selectedRating,
        avatar_url: avatarUrl || null,
        active: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('client_testimonials')
          .update(testimonialData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('client_testimonials')
          .insert([testimonialData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Depoimento ${editingItem ? 'atualizado' : 'criado'} com sucesso`
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar depoimento",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              i < selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            onClick={() => setSelectedRating(i + 1)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({selectedRating}/5)</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar Depoimento' : 'Adicionar Depoimento'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">Nome do Cliente</Label>
              <Input
                {...register('client_name', { required: true })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                {...register('company')}
                placeholder="Nome da empresa (opcional)"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Depoimento</Label>
            <Textarea
              {...register('content', { required: true })}
              placeholder="Conte sobre a experiência do cliente..."
              rows={4}
            />
          </div>

          <div>
            <Label>Avaliação</Label>
            {renderStarRating()}
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
              <Label htmlFor="location">Local</Label>
              <Input
                {...register('location')}
                placeholder="Cidade/Estado"
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
            <Label htmlFor="avatar">Foto do Cliente</Label>
            <div className="mt-2">
              {avatarPreview && (
                <div className="mb-4">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {avatarPreview ? 'Alterar Foto' : 'Selecionar Foto'}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
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
