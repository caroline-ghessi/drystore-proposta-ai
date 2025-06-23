
-- Condições de pagamento gerenciadas por admin
CREATE TABLE public.payment_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  installments integer NOT NULL DEFAULT 1,
  discount_percentage numeric DEFAULT 0,
  interest_percentage numeric DEFAULT 0,
  active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(user_id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Regras de desconto por role
CREATE TABLE public.discount_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role user_role NOT NULL,
  max_discount_percentage numeric NOT NULL DEFAULT 0,
  requires_approval_above numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_role)
);

-- Solicitações de aprovação expandidas
CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.proposals(id),
  requested_by uuid REFERENCES public.profiles(user_id),
  approval_type text NOT NULL CHECK (approval_type IN ('discount', 'value', 'custom')),
  requested_value numeric,
  current_limit numeric,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES public.profiles(user_id),
  approved_at timestamp with time zone,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Condições de pagamento selecionadas para cada proposta
CREATE TABLE public.proposal_payment_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.proposals(id),
  payment_condition_id uuid REFERENCES public.payment_conditions(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(proposal_id, payment_condition_id)
);

-- Enable RLS
ALTER TABLE public.payment_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_payment_conditions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_conditions
CREATE POLICY "Admins can manage payment conditions" ON public.payment_conditions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can view active payment conditions" ON public.payment_conditions
  FOR SELECT USING (active = true AND auth.role() = 'authenticated');

-- RLS Policies for discount_rules
CREATE POLICY "Admins can manage discount rules" ON public.discount_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can view discount rules" ON public.discount_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for approval_requests
CREATE POLICY "Users can view their own approval requests" ON public.approval_requests
  FOR SELECT USING (
    requested_by IN (
      SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all approval requests" ON public.approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create approval requests" ON public.approval_requests
  FOR INSERT WITH CHECK (
    requested_by IN (
      SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update approval requests" ON public.approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for proposal_payment_conditions
CREATE POLICY "Users can manage payment conditions for their proposals" ON public.proposal_payment_conditions
  FOR ALL USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all proposal payment conditions" ON public.proposal_payment_conditions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default payment conditions
INSERT INTO public.payment_conditions (name, installments, discount_percentage, interest_percentage) VALUES
('À Vista', 1, 5.0, 0.0),
('Até 6x', 6, 0.0, 0.0),
('Até 12x', 12, 0.0, 2.5),
('Até 18x', 18, 0.0, 4.0);

-- Insert default discount rules
INSERT INTO public.discount_rules (user_role, max_discount_percentage, requires_approval_above) VALUES
('admin', 100.0, 50.0),
('vendedor_interno', 5.0, 5.0),
('representante', 3.0, 3.0),
('cliente', 0.0, 0.0);

-- Add discount_percentage column to proposals table
ALTER TABLE public.proposals ADD COLUMN discount_percentage numeric DEFAULT 0;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_conditions_updated_at
  BEFORE UPDATE ON public.payment_conditions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER discount_rules_updated_at
  BEFORE UPDATE ON public.discount_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER approval_requests_updated_at
  BEFORE UPDATE ON public.approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
