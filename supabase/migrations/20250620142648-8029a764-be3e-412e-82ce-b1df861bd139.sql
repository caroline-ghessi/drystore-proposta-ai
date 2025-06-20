
-- Criar ENUMs para status e roles
CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired');
CREATE TYPE public.user_role AS ENUM ('admin', 'vendedor_interno', 'representante', 'cliente');

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  cnpj TEXT,
  endereco TEXT,
  freshsales_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  sku TEXT UNIQUE,
  categoria TEXT,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  unidade TEXT DEFAULT 'UN',
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  estoque_disponivel INTEGER DEFAULT 0,
  marca TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de propostas
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  link_acesso TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da proposta
CREATE TABLE public.proposal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC(10,3) NOT NULL DEFAULT 1,
  preco_unit NUMERIC(10,2) NOT NULL DEFAULT 0,
  preco_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  descricao_item TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at nas tabelas
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_proposals
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    'cliente'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função auxiliar para verificar role do usuário (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Políticas RLS para clients
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Internal users can insert clients" ON public.clients
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

CREATE POLICY "Internal users can update clients" ON public.clients
  FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

-- Políticas RLS para products
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (ativo = true OR public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante'));

CREATE POLICY "Internal users can manage products" ON public.products
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('admin', 'vendedor_interno', 'representante')
  );

-- Políticas RLS para proposals
CREATE POLICY "Users can view their own proposals" ON public.proposals
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

CREATE POLICY "Users can update their own proposals" ON public.proposals
  FOR UPDATE USING (
    auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
  );

-- Políticas RLS para proposal_items
CREATE POLICY "Users can view proposal items" ON public.proposal_items
  FOR SELECT USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR 
            public.get_user_role(auth.uid()) = 'admin' OR
            (public.get_user_role(auth.uid()) = 'cliente' AND 
             client_id IN (SELECT id FROM public.clients WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())))
    )
  );

CREATE POLICY "Internal users can manage proposal items" ON public.proposal_items
  FOR ALL USING (
    proposal_id IN (
      SELECT id FROM public.proposals 
      WHERE auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin'
    )
  );

-- Criar índices para melhor performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_freshsales_id ON public.clients(freshsales_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_categoria ON public.products(categoria);
CREATE INDEX idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_link_acesso ON public.proposals(link_acesso);
CREATE INDEX idx_proposal_items_proposal_id ON public.proposal_items(proposal_id);
