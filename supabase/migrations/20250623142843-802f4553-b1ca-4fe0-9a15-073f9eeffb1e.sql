
-- Adicionar colunas para as novas funcionalidades de proposta
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS include_video boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS include_technical_details boolean DEFAULT false;

-- Criar tabela para soluções se não existir
CREATE TABLE IF NOT EXISTS public.solutions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  categoria text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para produtos recomendados se não existir
CREATE TABLE IF NOT EXISTS public.recommended_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  preco numeric DEFAULT 0,
  categoria text,
  ativo boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de relacionamento entre propostas e soluções
CREATE TABLE IF NOT EXISTS public.proposal_solutions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  valor_solucao numeric DEFAULT 0,
  observacoes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de relacionamento entre propostas e produtos recomendados
CREATE TABLE IF NOT EXISTS public.proposal_recommended_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  recommended_product_id uuid NOT NULL REFERENCES public.recommended_products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para imagens das soluções
CREATE TABLE IF NOT EXISTS public.solution_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_title text,
  image_description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir algumas soluções de exemplo
INSERT INTO public.solutions (nome, descricao, categoria) VALUES
('Drywall Residencial', 'Sistema completo de drywall para ambientes residenciais com isolamento acústico', 'Residencial'),
('Drywall Comercial', 'Solução robusta para ambientes comerciais com alta resistência', 'Comercial'),
('Steel Frame', 'Sistema construtivo em steel frame para construções rápidas', 'Estrutural')
ON CONFLICT DO NOTHING;

-- Inserir alguns produtos recomendados de exemplo
INSERT INTO public.recommended_products (nome, descricao, preco, categoria) VALUES
('Massa Corrida Premium', 'Massa para acabamento de alta qualidade', 45.90, 'Acabamento'),
('Tinta Primer Especializada', 'Primer específico para drywall', 89.50, 'Tinta'),
('Kit Ferramentas Drywall', 'Kit completo de ferramentas para instalação', 299.00, 'Ferramentas')
ON CONFLICT DO NOTHING;
