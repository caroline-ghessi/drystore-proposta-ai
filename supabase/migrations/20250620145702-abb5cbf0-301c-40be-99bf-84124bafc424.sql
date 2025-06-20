
-- Phase 1: Critical Database Security Fixes (Fixed Version)

-- First, drop existing policies if they exist, then create new comprehensive ones

-- 1. Drop and recreate RLS policies for clients table
DROP POLICY IF EXISTS "Internal users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Internal users can update clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;

CREATE POLICY "Users can view clients they created or admins can view all" ON public.clients
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'admin' OR
    public.get_user_role(auth.uid()) IN ('vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can insert clients" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can update clients" ON public.clients
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can delete clients" ON public.clients
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 2. Drop and recreate RLS policies for products table
DROP POLICY IF EXISTS "Internal users can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view active products or internal users can view all" ON public.products
  FOR SELECT USING (
    ativo = true OR 
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can insert products" ON public.products
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can update products" ON public.products
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 3. Drop and recreate RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- 4. Drop and recreate RLS policies for proposals table
DROP POLICY IF EXISTS "Users can view their own proposals" ON public.proposals;
DROP POLICY IF EXISTS "Internal users can insert proposals" ON public.proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;

CREATE POLICY "Users can view their own proposals or client access" ON public.proposals
  FOR SELECT USING (
    auth.uid() = user_id OR 
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'cliente' AND 
     client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
  );

CREATE POLICY "Internal users can insert proposals" ON public.proposals
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Users can update their own proposals or admins can update all" ON public.proposals
  FOR UPDATE USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete proposals" ON public.proposals
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'admin'
  );

-- 5. Drop and recreate RLS policies for proposal_items table
DROP POLICY IF EXISTS "Users can view proposal items" ON public.proposal_items;
DROP POLICY IF EXISTS "Internal users can manage proposal items" ON public.proposal_items;

CREATE POLICY "Users can view proposal items for accessible proposals" ON public.proposal_items
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR 
            public.get_user_role(auth.uid()) = 'admin' OR
            (public.get_user_role(auth.uid()) = 'cliente' AND 
             client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    )
  );

CREATE POLICY "Internal users can insert proposal items" ON public.proposal_items
  FOR INSERT WITH CHECK (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
    )
  );

CREATE POLICY "Internal users can update proposal items" ON public.proposal_items
  FOR UPDATE USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
    )
  );

CREATE POLICY "Internal users can delete proposal items" ON public.proposal_items
  FOR DELETE USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
    )
  );

-- 6. Update the handle_new_user function to properly set role based on metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'cliente'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add input validation function for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_email_format(email_input text)
RETURNS boolean AS $$
BEGIN
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- 9. Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email or IP
  attempt_count INTEGER DEFAULT 1,
  first_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier 
  ON public.auth_rate_limits(identifier);

-- Enable RLS on rate limits (admins only)
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view rate limits" ON public.auth_rate_limits
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
