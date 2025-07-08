-- Criar tabelas para logs e métricas de processamento PDF

-- Tabela para logs detalhados de processamento
CREATE TABLE public.pdf_processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processing_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'error', 'timeout')),
  duration_ms INTEGER,
  error_message TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para métricas agregadas por etapa
CREATE TABLE public.pdf_processing_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  stage TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  avg_duration_ms NUMERIC,
  most_common_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, stage)
);

-- RLS policies para logs
ALTER TABLE public.pdf_processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all processing logs" 
ON public.pdf_processing_logs 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Users can view their own processing logs" 
ON public.pdf_processing_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert processing logs" 
ON public.pdf_processing_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS policies para métricas
ALTER TABLE public.pdf_processing_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all processing metrics" 
ON public.pdf_processing_metrics 
FOR ALL 
USING (is_admin_user());

CREATE POLICY "System can manage processing metrics" 
ON public.pdf_processing_metrics 
FOR ALL 
USING (true);

-- Índices para performance
CREATE INDEX idx_pdf_processing_logs_processing_id ON public.pdf_processing_logs(processing_id);
CREATE INDEX idx_pdf_processing_logs_user_id ON public.pdf_processing_logs(user_id);
CREATE INDEX idx_pdf_processing_logs_created_at ON public.pdf_processing_logs(created_at DESC);
CREATE INDEX idx_pdf_processing_metrics_date_stage ON public.pdf_processing_metrics(date, stage);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pdf_processing_metrics_updated_at
  BEFORE UPDATE ON public.pdf_processing_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();