
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TestimonialDialog } from './dialogs/TestimonialDialog';
import { useToast } from '@/hooks/use-toast';

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
  created_at: string;
}

export const TestimonialsManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const { data: testimonials, isLoading, refetch } = useQuery({
    queryKey: ['client-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_testimonials')
        .select('*')
        .order('product_group')
        .order('order_index');
      
      if (error) throw error;
      return data as Testimonial[];
    }
  });

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    const { error } = await supabase
      .from('client_testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir depoimento",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Depoimento excluído com sucesso"
      });
      refetch();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('client_testimonials')
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
        description: `Depoimento ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Depoimentos de Clientes</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Depoimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials?.map((testimonial) => (
          <Card key={testimonial.id} className={`${!testimonial.active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {testimonial.avatar_url ? (
                    <img
                      src={testimonial.avatar_url}
                      alt={testimonial.client_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {testimonial.client_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{testimonial.client_name}</CardTitle>
                    {testimonial.company && (
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    )}
                    <Badge variant="outline" className="mt-1">
                      {testimonial.product_group}
                    </Badge>
                  </div>
                </div>
                {!testimonial.active && (
                  <Badge variant="secondary">Inativo</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                {testimonial.location && (
                  <p className="text-sm text-gray-500">📍 {testimonial.location}</p>
                )}
                {testimonial.project_type && (
                  <p className="text-sm text-gray-500">🏗️ {testimonial.project_type}</p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(testimonial)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(testimonial.id, testimonial.active)}
                >
                  {testimonial.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(testimonial.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum depoimento cadastrado</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Depoimento
          </Button>
        </div>
      )}

      <TestimonialDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </div>
  );
};
