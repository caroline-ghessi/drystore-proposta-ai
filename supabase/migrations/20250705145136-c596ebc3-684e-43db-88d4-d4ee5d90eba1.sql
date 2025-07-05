-- Função para calcular e atualizar pontos de gamificação
CREATE OR REPLACE FUNCTION public.calculate_gamification_points(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proposals_created INTEGER := 0;
  v_proposals_sent INTEGER := 0;
  v_proposals_accepted INTEGER := 0;
  v_total_sales_value NUMERIC := 0;
  v_total_points INTEGER := 0;
  v_current_level TEXT := 'Bronze';
BEGIN
  -- Calcular estatísticas do usuário
  SELECT 
    COUNT(*) as total_proposals,
    COUNT(CASE WHEN status != 'draft' THEN 1 END) as sent_proposals,
    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_proposals,
    COALESCE(SUM(CASE WHEN status = 'accepted' THEN valor_total ELSE 0 END), 0) as sales_value
  INTO v_proposals_created, v_proposals_sent, v_proposals_accepted, v_total_sales_value
  FROM proposals
  WHERE user_id = target_user_id;

  -- Calcular pontos totais
  v_total_points := (v_proposals_created * 10) + (v_proposals_sent * 25) + (v_proposals_accepted * 100) + (v_total_sales_value * 0.001)::INTEGER;

  -- Determinar nível baseado nos pontos
  IF v_total_points >= 1000 THEN
    v_current_level := 'Diamond';
  ELSIF v_total_points >= 500 THEN
    v_current_level := 'Platinum';
  ELSIF v_total_points >= 250 THEN
    v_current_level := 'Gold';
  ELSIF v_total_points >= 100 THEN
    v_current_level := 'Silver';
  ELSE
    v_current_level := 'Bronze';
  END IF;

  -- Inserir ou atualizar pontos
  INSERT INTO public.gamification_points (
    user_id, total_points, current_level, proposals_created, 
    proposals_sent, proposals_accepted, total_sales_value
  ) VALUES (
    target_user_id, v_total_points, v_current_level, v_proposals_created,
    v_proposals_sent, v_proposals_accepted, v_total_sales_value
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = EXCLUDED.total_points,
    current_level = EXCLUDED.current_level,
    proposals_created = EXCLUDED.proposals_created,
    proposals_sent = EXCLUDED.proposals_sent,
    proposals_accepted = EXCLUDED.proposals_accepted,
    total_sales_value = EXCLUDED.total_sales_value,
    updated_at = now();
END;
$$;

-- Função para buscar ranking de vendedores
CREATE OR REPLACE FUNCTION public.get_seller_ranking()
RETURNS TABLE (
  user_id UUID,
  nome TEXT,
  role user_role,
  total_points INTEGER,
  current_level TEXT,
  proposals_created INTEGER,
  proposals_sent INTEGER,
  proposals_accepted INTEGER,
  total_sales_value NUMERIC,
  position INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_sellers AS (
    SELECT 
      p.user_id,
      p.nome,
      p.role,
      COALESCE(gp.total_points, 0) as total_points,
      COALESCE(gp.current_level, 'Bronze') as current_level,
      COALESCE(gp.proposals_created, 0) as proposals_created,
      COALESCE(gp.proposals_sent, 0) as proposals_sent,
      COALESCE(gp.proposals_accepted, 0) as proposals_accepted,
      COALESCE(gp.total_sales_value, 0) as total_sales_value,
      ROW_NUMBER() OVER (ORDER BY COALESCE(gp.total_points, 0) DESC, COALESCE(gp.total_sales_value, 0) DESC) as position
    FROM profiles p
    LEFT JOIN gamification_points gp ON p.user_id = gp.user_id
    WHERE p.role IN ('vendedor_interno', 'representante', 'admin')
  )
  SELECT * FROM ranked_sellers
  ORDER BY position;
END;
$$;

-- Função para buscar dados de gamificação do usuário
CREATE OR REPLACE FUNCTION public.get_user_gamification_data(target_user_id UUID)
RETURNS TABLE (
  total_points INTEGER,
  current_level TEXT,
  proposals_created INTEGER,
  proposals_sent INTEGER,
  proposals_accepted INTEGER,
  total_sales_value NUMERIC,
  achievements_count INTEGER,
  active_challenges_count INTEGER,
  rank_position INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_rank AS (
    SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(gp.total_points, 0) DESC) as position
    FROM profiles p
    LEFT JOIN gamification_points gp ON p.user_id = gp.user_id
    WHERE p.role IN ('vendedor_interno', 'representante', 'admin')
      AND p.user_id = target_user_id
  )
  SELECT 
    COALESCE(gp.total_points, 0) as total_points,
    COALESCE(gp.current_level, 'Bronze') as current_level,
    COALESCE(gp.proposals_created, 0) as proposals_created,
    COALESCE(gp.proposals_sent, 0) as proposals_sent,
    COALESCE(gp.proposals_accepted, 0) as proposals_accepted,
    COALESCE(gp.total_sales_value, 0) as total_sales_value,
    (SELECT COUNT(*) FROM user_achievements WHERE user_id = target_user_id)::INTEGER as achievements_count,
    (SELECT COUNT(*) FROM user_challenges uc 
     JOIN gamification_challenges gc ON uc.challenge_id = gc.id 
     WHERE uc.user_id = target_user_id AND gc.active = true AND gc.end_date > now())::INTEGER as active_challenges_count,
    COALESCE((SELECT position FROM user_rank), 0)::INTEGER as rank_position
  FROM gamification_points gp
  WHERE gp.user_id = target_user_id;
END;
$$;

-- Trigger para atualizar pontos quando propostas são modificadas
CREATE OR REPLACE FUNCTION public.update_gamification_on_proposal_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar pontos para o usuário da proposta
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM calculate_gamification_points(NEW.user_id);
  END IF;
  
  -- Se for um UPDATE e o user_id mudou, atualizar o usuário anterior também
  IF TG_OP = 'UPDATE' AND OLD.user_id != NEW.user_id THEN
    PERFORM calculate_gamification_points(OLD.user_id);
  END IF;
  
  -- Se for DELETE, atualizar o usuário anterior
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_gamification_points(OLD.user_id);
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela de propostas
DROP TRIGGER IF EXISTS trigger_update_gamification_points ON proposals;
CREATE TRIGGER trigger_update_gamification_points
  AFTER INSERT OR UPDATE OR DELETE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_gamification_on_proposal_change();

-- Inicializar pontos para usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT user_id FROM profiles WHERE role IN ('vendedor_interno', 'representante', 'admin')
  LOOP
    PERFORM calculate_gamification_points(user_record.user_id);
  END LOOP;
END $$;