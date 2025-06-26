
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
import { Upload, FileText } from 'lucide-react';

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
}

interface DownloadFileDialogProps {
  open: boolean;
  onClose: () => void;
  editingItem?: DownloadFile | null;
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
  'Manual',
  'Catálogo',
  'Certificado',
  'Especificação Técnica',
  'Guia de Instalação',
  'Garantia',
  'Planilha',
  'Projeto'
];

export const DownloadFileDialog = ({ open, onClose, editingItem }: DownloadFileDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
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
      setFileName(editingItem.title);
    } else {
      reset();
      setFileName('');
    }
  }, [editingItem, setValue, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; size: string; type: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `downloads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content-management')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('content-management')
      .getPublicUrl(filePath);

    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    return {
      url: data.publicUrl,
      size: `${fileSizeInMB} MB`,
      type: file.type
    };
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      let fileUrl = editingItem?.file_url || '';
      let fileSize = editingItem?.file_size || '';
      let fileType = editingItem?.file_type || '';

      if (file) {
        const uploadResult = await uploadFile(file);
        fileUrl = uploadResult.url;
        fileSize = uploadResult.size;
        fileType = uploadResult.type;
      }

      if (!fileUrl) {
        toast({
          title: "Erro",
          description: "É necessário selecionar um arquivo",
          variant: "destructive"
        });
        return;
      }

      const fileData = {
        ...data,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
        active: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('download_files')
          .update(fileData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('download_files')
          .insert([fileData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Arquivo ${editingItem ? 'atualizado' : 'criado'} com sucesso`
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar arquivo",
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
            {editingItem ? 'Editar Arquivo' : 'Adicionar Arquivo'}
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
              placeholder="Título do arquivo"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              {...register('description')}
              placeholder="Descrição do arquivo"
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
            <Label htmlFor="file">Arquivo</Label>
            <div className="mt-2">
              {fileName && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{fileName}</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {fileName ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formatos aceitos: PDF, DOC, XLS, PPT, ZIP, RAR
              </p>
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
