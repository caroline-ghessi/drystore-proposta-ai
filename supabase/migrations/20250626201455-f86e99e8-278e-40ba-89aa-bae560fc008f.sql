
-- Criar tabela para galeria de projetos
CREATE TABLE public.project_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_group TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  project_type TEXT,
  completion_date DATE,
  client_name TEXT,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para depoimentos de clientes
CREATE TABLE public.client_testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_group TEXT NOT NULL,
  client_name TEXT NOT NULL,
  company TEXT,
  project_type TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  location TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para imagens técnicas
CREATE TABLE public.technical_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_group TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para arquivos de download
CREATE TABLE public.download_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_group TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_files ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_gallery
CREATE POLICY "Admins can manage project gallery" ON public.project_gallery
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "All users can view active project gallery" ON public.project_gallery
  FOR SELECT USING (active = true);

-- Políticas RLS para client_testimonials
CREATE POLICY "Admins can manage client testimonials" ON public.client_testimonials
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "All users can view active client testimonials" ON public.client_testimonials
  FOR SELECT USING (active = true);

-- Políticas RLS para technical_images
CREATE POLICY "Admins can manage technical images" ON public.technical_images
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "All users can view active technical images" ON public.technical_images
  FOR SELECT USING (active = true);

-- Políticas RLS para download_files
CREATE POLICY "Admins can manage download files" ON public.download_files
  FOR ALL USING (public.is_admin_user());

CREATE POLICY "All users can view active download files" ON public.download_files
  FOR SELECT USING (active = true);

-- Criar triggers para updated_at
CREATE TRIGGER handle_updated_at_project_gallery
  BEFORE UPDATE ON public.project_gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_client_testimonials
  BEFORE UPDATE ON public.client_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_technical_images
  BEFORE UPDATE ON public.technical_images
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_download_files
  BEFORE UPDATE ON public.download_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar bucket de storage para uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-management', 'content-management', true);

-- Políticas para o bucket de storage
CREATE POLICY "Admins can upload content management files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-management' AND 
    public.is_admin_user()
  );

CREATE POLICY "Admins can update content management files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'content-management' AND 
    public.is_admin_user()
  );

CREATE POLICY "Admins can delete content management files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-management' AND 
    public.is_admin_user()
  );

CREATE POLICY "Everyone can view content management files" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-management');
