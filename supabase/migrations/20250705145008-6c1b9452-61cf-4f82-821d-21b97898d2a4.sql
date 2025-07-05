-- Criar tabelas para sistema de gamificação

-- Tabela de pontos dos usuários
CREATE TABLE public.gamification_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'Bronze',
  proposals_created INTEGER NOT NULL DEFAULT 0,
  proposals_sent INTEGER NOT NULL DEFAULT 0,
  proposals_accepted INTEGER NOT NULL DEFAULT 0,
  total_sales_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de conquistas disponíveis
CREATE TABLE public.gamification_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  points_required INTEGER,
  proposals_required INTEGER,
  sales_value_required NUMERIC,
  special_condition TEXT, -- 'first_sale', 'monthly_target', etc.
  badge_color TEXT NOT NULL DEFAULT 'gold',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conquistas dos usuários
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.gamification_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de desafios/competições
CREATE TABLE public.gamification_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'monthly', 'weekly', 'special'
  target_value NUMERIC NOT NULL,
  target_metric TEXT NOT NULL, -- 'sales_value', 'proposals_count', 'acceptance_rate'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 0,
  reward_description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso dos usuários nos desafios
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.gamification_challenges(id) ON DELETE CASCADE,
  current_progress NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Gamification Points
CREATE POLICY "Users can view their own points or admins view all" 
ON public.gamification_points FOR SELECT 
USING (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "Only system can manage points" 
ON public.gamification_points FOR ALL 
USING (false);

-- Achievements (públicas para visualização, admin para gerenciar)
CREATE POLICY "Everyone can view active achievements" 
ON public.gamification_achievements FOR SELECT 
USING (active = true OR is_admin_user());

CREATE POLICY "Admins can manage achievements" 
ON public.gamification_achievements FOR ALL 
USING (is_admin_user());

-- User Achievements
CREATE POLICY "Users can view their achievements or admins view all" 
ON public.user_achievements FOR SELECT 
USING (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "Only system can award achievements" 
ON public.user_achievements FOR ALL 
USING (false);

-- Challenges
CREATE POLICY "Everyone can view active challenges" 
ON public.gamification_challenges FOR SELECT 
USING (active = true OR is_admin_user());

CREATE POLICY "Admins can manage challenges" 
ON public.gamification_challenges FOR ALL 
USING (is_admin_user());

-- User Challenges
CREATE POLICY "Users can view their challenge progress or admins view all" 
ON public.user_challenges FOR SELECT 
USING (user_id = auth.uid() OR is_admin_user());

CREATE POLICY "Only system can update challenge progress" 
ON public.user_challenges FOR ALL 
USING (false);

-- Inserir conquistas iniciais
INSERT INTO public.gamification_achievements (name, description, icon, points_required, proposals_required, badge_color) VALUES
('Primeira Proposta', 'Criou sua primeira proposta', '🎯', 10, 1, 'green'),
('Vendedor Iniciante', 'Enviou 5 propostas', '📝', 50, 5, 'blue'),
('Negociador', 'Primeira proposta aceita', '🤝', 100, NULL, 'gold'),
('Top Performer', 'Atingiu R$ 50.000 em vendas', '💰', 500, NULL, 'purple'),
('Mestre das Vendas', 'Atingiu R$ 100.000 em vendas', '👑', 1000, NULL, 'diamond');

INSERT INTO public.gamification_achievements (name, description, icon, special_condition, badge_color) VALUES
('Meta Mensal', 'Atingiu 100% da meta mensal', '🎯', 'monthly_target', 'gold'),
('Sequência de Ouro', 'Três propostas aceitas consecutivas', '🔥', 'three_consecutive', 'orange'),
('Cliente Fiel', 'Cliente retornou para nova proposta', '💖', 'returning_client', 'pink');

-- Inserir desafio mensal atual
INSERT INTO public.gamification_challenges (name, description, challenge_type, target_value, target_metric, start_date, end_date, reward_points, reward_description) VALUES
('Desafio Dezembro 2024', 'Atingir R$ 75.000 em vendas em dezembro', 'monthly', 75000, 'sales_value', '2024-12-01', '2024-12-31', 200, 'Bônus especial + reconhecimento'),
('Sprint de Propostas', 'Criar 10 propostas em uma semana', 'weekly', 10, 'proposals_count', now(), now() + interval '7 days', 100, 'Badge exclusivo Sprint Master');

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gamification_points_updated_at
  BEFORE UPDATE ON public.gamification_points
  FOR EACH ROW EXECUTE FUNCTION update_gamification_updated_at();

CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON public.user_challenges
  FOR EACH ROW EXECUTE FUNCTION update_gamification_updated_at();