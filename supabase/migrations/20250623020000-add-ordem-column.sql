
-- Adicionar coluna ordem à tabela solution_images
ALTER TABLE public.solution_images 
ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0;
