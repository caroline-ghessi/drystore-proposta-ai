
-- Phase 1: Critical Database Security Fixes

-- 1. Add comprehensive RLS policies for missing tables
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_role_result public.user_role;
BEGIN
  SELECT role INTO user_role_result 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role_result, 'cliente'::public.user_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'cliente'::public.user_role;
END;
$$;

-- 3. RLS policies for solutions table
CREATE POLICY "Everyone can view active solutions" ON public.solutions
  FOR SELECT USING (ativo = true);

CREATE POLICY "Admins can manage solutions" ON public.solutions
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Vendors can manage solutions" ON public.solutions
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'));

-- 4. RLS policies for recommended_products table
CREATE POLICY "Everyone can view active recommended products" ON public.recommended_products
  FOR SELECT USING (ativo = true);

CREATE POLICY "Admins can manage recommended products" ON public.recommended_products
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Vendors can manage recommended products" ON public.recommended_products
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'));

-- 5. RLS policies for solution_images table
CREATE POLICY "Everyone can view solution images" ON public.solution_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage solution images" ON public.solution_images
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- 6. RLS policies for clients table (critical for client portal security)
CREATE POLICY "Users can view their own clients" ON public.clients
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Users can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Users can update clients" ON public.clients
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

-- 7. Create secure client access tokens table
CREATE TABLE public.client_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  last_used_at timestamp with time zone,
  is_active boolean DEFAULT true NOT NULL
);

ALTER TABLE public.client_access_tokens ENABLE ROW LEVEL SECURITY;

-- RLS for client access tokens
CREATE POLICY "Only system can manage client tokens" ON public.client_access_tokens
  FOR ALL USING (false); -- No direct access, only through functions

-- 8. Create function to generate secure client access tokens
CREATE OR REPLACE FUNCTION public.generate_client_access_token(
  client_email text,
  expires_in_hours integer DEFAULT 24
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_record public.clients;
  new_token text;
  token_expires_at timestamp with time zone;
BEGIN
  -- Find client by email
  SELECT * INTO client_record 
  FROM public.clients 
  WHERE email = client_email;
  
  IF client_record IS NULL THEN
    RAISE EXCEPTION 'Client not found with email: %', client_email;
  END IF;
  
  -- Generate secure token
  new_token := encode(gen_random_bytes(32), 'base64');
  token_expires_at := now() + (expires_in_hours || ' hours')::interval;
  
  -- Deactivate old tokens for this client
  UPDATE public.client_access_tokens 
  SET is_active = false 
  WHERE client_id = client_record.id;
  
  -- Insert new token
  INSERT INTO public.client_access_tokens (client_id, token, expires_at)
  VALUES (client_record.id, new_token, token_expires_at);
  
  RETURN new_token;
END;
$$;

-- 9. Create function to validate client access tokens
CREATE OR REPLACE FUNCTION public.validate_client_access_token(token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record public.client_access_tokens;
  client_record public.clients;
  result json;
BEGIN
  -- Find and validate token
  SELECT * INTO token_record
  FROM public.client_access_tokens
  WHERE token = validate_client_access_token.token
    AND is_active = true
    AND expires_at > now();
  
  IF token_record IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired token');
  END IF;
  
  -- Update last used timestamp
  UPDATE public.client_access_tokens 
  SET last_used_at = now()
  WHERE id = token_record.id;
  
  -- Get client details
  SELECT * INTO client_record
  FROM public.clients
  WHERE id = token_record.client_id;
  
  result := json_build_object(
    'valid', true,
    'client', json_build_object(
      'id', client_record.id,
      'nome', client_record.nome,
      'email', client_record.email,
      'empresa', client_record.empresa,
      'telefone', client_record.telefone
    ),
    'token_expires_at', token_record.expires_at
  );
  
  RETURN result;
END;
$$;

-- 10. Add audit logging trigger for sensitive operations
CREATE TABLE public.security_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.security_audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- 11. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, table_name, record_id, old_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, table_name, record_id, old_values, new_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_logs (
      user_id, action, table_name, record_id, new_values
    ) VALUES (
      auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- 12. Add audit triggers to sensitive tables
CREATE TRIGGER audit_proposals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 13. Create rate limiting table for API endpoints
CREATE TABLE public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  identifier text NOT NULL, -- user_id, email, or IP
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(endpoint, identifier, window_start)
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limiting policies
CREATE POLICY "System manages rate limits" ON public.api_rate_limits
  FOR ALL USING (false); -- Only accessible through functions

-- 14. Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  endpoint_name text,
  user_identifier text,
  max_requests integer DEFAULT 100,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  window_start_time timestamp with time zone;
  current_count integer;
BEGIN
  window_start_time := date_trunc('minute', now()) - ((extract(minute from now())::integer % window_minutes) || ' minutes')::interval;
  
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
    -- Rate limit exceeded
    RETURN false;
  END IF;
END;
$$;
