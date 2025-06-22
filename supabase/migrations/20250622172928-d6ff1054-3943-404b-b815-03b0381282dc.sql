
-- Criar tabela para metas dos vendedores
CREATE TABLE public.sales_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  target_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Habilitar RLS
ALTER TABLE public.sales_targets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sales_targets
CREATE POLICY "Users can view their own targets" 
  ON public.sales_targets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all targets" 
  ON public.sales_targets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert targets" 
  ON public.sales_targets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update targets" 
  ON public.sales_targets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Adicionar trigger para updated_at
CREATE TRIGGER sales_targets_updated_at
  BEFORE UPDATE ON public.sales_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir algumas metas de exemplo
INSERT INTO public.sales_targets (user_id, month, year, target_amount)
SELECT 
  p.user_id,
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  CASE 
    WHEN p.role = 'vendedor_interno' THEN 100000
    WHEN p.role = 'representante' THEN 80000
    ELSE 50000
  END
FROM public.profiles p
WHERE p.role IN ('vendedor_interno', 'representante', 'admin')
ON CONFLICT (user_id, month, year) DO NOTHING;
