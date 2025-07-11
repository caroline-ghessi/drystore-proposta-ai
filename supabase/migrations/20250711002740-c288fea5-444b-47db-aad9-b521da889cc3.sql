-- Criar tabela de cache para extração de PDFs
CREATE TABLE IF NOT EXISTS pdf_extraction_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_hash TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extraction_data JSONB NOT NULL,
  extraction_quality TEXT NOT NULL CHECK (extraction_quality IN ('high', 'medium', 'low')),
  processing_method TEXT NOT NULL,
  user_id UUID NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_pdf_cache_hash_user ON pdf_extraction_cache(file_hash, user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_cache_created_at ON pdf_extraction_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_pdf_cache_user_id ON pdf_extraction_cache(user_id);

-- Criar storage bucket para PDFs processados se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-processing', 'pdf-processing', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para cache de PDFs
ALTER TABLE pdf_extraction_cache ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus próprios caches
CREATE POLICY "Users can view their own PDF cache" 
  ON pdf_extraction_cache 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política: usuários podem inserir em seu próprio cache
CREATE POLICY "Users can insert their own PDF cache" 
  ON pdf_extraction_cache 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar seu próprio cache
CREATE POLICY "Users can update their own PDF cache" 
  ON pdf_extraction_cache 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política: sistema pode gerenciar cache (para limpeza automática)
CREATE POLICY "System can manage PDF cache" 
  ON pdf_extraction_cache 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Storage policies para pdf-processing bucket
CREATE POLICY "Authenticated users can upload PDFs" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'pdf-processing' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own PDF files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'pdf-processing' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can manage PDF files" 
  ON storage.objects 
  FOR ALL 
  USING (bucket_id = 'pdf-processing' AND auth.role() = 'service_role');