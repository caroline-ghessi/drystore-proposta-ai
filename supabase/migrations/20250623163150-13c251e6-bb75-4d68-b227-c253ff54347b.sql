
-- Phase 1: Critical Security Fixes - Database Level

-- 1. Add missing RLS policies for client_access_tokens (already has RLS enabled)
CREATE POLICY "Only system can access client tokens" ON public.client_access_tokens
  FOR ALL USING (false); -- Only accessible through secure functions

-- 2. Fix clients table RLS policies (replace existing with proper ones)
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients" ON public.clients;

-- Proper client RLS policies
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Authenticated users can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

-- 3. Add comprehensive RLS policies for proposals table
DROP POLICY IF EXISTS "Users can view their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;

CREATE POLICY "Users can view their proposals" ON public.proposals
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create proposals" ON public.proposals
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Users can update their proposals" ON public.proposals
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 4. Add RLS policies for missing tables
CREATE POLICY "Authenticated users can view proposal items" ON public.proposal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id 
      AND (p.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Users can manage their proposal items" ON public.proposal_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id 
      AND (p.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Authenticated users can view proposal features" ON public.proposal_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id 
      AND (p.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Users can manage their proposal features" ON public.proposal_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals p 
      WHERE p.id = proposal_id 
      AND (p.user_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

-- 5. Create secure client proposal access function
CREATE OR REPLACE FUNCTION public.get_client_proposals_by_token(access_token text)
RETURNS TABLE (
  proposal_id uuid,
  client_id uuid,
  valor_total numeric,
  status proposal_status,
  validade date,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_client_id uuid;
BEGIN
  -- Validate token and get client_id
  SELECT cat.client_id INTO token_client_id
  FROM public.client_access_tokens cat
  WHERE cat.token = access_token
    AND cat.is_active = true
    AND cat.expires_at > now();
  
  IF token_client_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired access token';
  END IF;
  
  -- Return proposals for this client only
  RETURN QUERY
  SELECT 
    p.id as proposal_id,
    p.client_id,
    p.valor_total,
    p.status,
    p.validade,
    p.created_at
  FROM public.proposals p
  WHERE p.client_id = token_client_id
    AND p.status != 'draft';
END;
$$;

-- 6. Enhanced rate limiting function with stricter limits
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  endpoint_name text,
  user_identifier text,
  max_requests integer DEFAULT 50,
  window_minutes integer DEFAULT 60,
  block_duration_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  window_start_time timestamp with time zone;
  current_count integer;
  is_blocked boolean;
BEGIN
  window_start_time := date_trunc('minute', now()) - ((extract(minute from now())::integer % window_minutes) || ' minutes')::interval;
  
  -- Check if currently blocked
  SELECT EXISTS(
    SELECT 1 FROM public.auth_rate_limits
    WHERE identifier = user_identifier
      AND blocked_until > now()
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN false;
  END IF;
  
  -- Get current count for this window
  SELECT request_count INTO current_count
  FROM public.api_rate_limits
  WHERE endpoint = endpoint_name
    AND identifier = user_identifier
    AND window_start = window_start_time;
  
  IF current_count IS NULL THEN
    -- First request in this window
    INSERT INTO public.api_rate_limits (endpoint, identifier, window_start, request_count)
    VALUES (endpoint_name, user_identifier, window_start_time, 1);
    RETURN true;
  ELSIF current_count < max_requests THEN
    -- Increment counter
    UPDATE public.api_rate_limits
    SET request_count = request_count + 1
    WHERE endpoint = endpoint_name
      AND identifier = user_identifier
      AND window_start = window_start_time;
    RETURN true;
  ELSE
    -- Rate limit exceeded, block user
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, blocked_until)
    VALUES (user_identifier, 1, now() + (block_duration_minutes || ' minutes')::interval)
    ON CONFLICT (identifier) DO UPDATE SET
      attempt_count = auth_rate_limits.attempt_count + 1,
      blocked_until = now() + (block_duration_minutes || ' minutes')::interval,
      last_attempt = now();
    
    RETURN false;
  END IF;
END;
$$;

-- 7. Add security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  client_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  severity text DEFAULT 'low',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events" ON public.security_events
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- 8. Create security event logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  user_id uuid DEFAULT NULL,
  client_id uuid DEFAULT NULL,
  details jsonb DEFAULT NULL,
  severity text DEFAULT 'low'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, client_id, details, severity)
  VALUES (event_type, user_id, client_id, details, severity);
END;
$$;
