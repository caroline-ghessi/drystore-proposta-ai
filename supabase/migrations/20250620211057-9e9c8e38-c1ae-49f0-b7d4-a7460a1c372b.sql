
-- Corrigir e otimizar a função handle_new_user com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_nome text;
BEGIN
  -- Log para debug
  RAISE LOG 'Iniciando handle_new_user para user_id: %', NEW.id;
  
  -- Extrair e validar o nome do usuário
  user_nome := COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1));
  
  -- Extrair e validar o role do usuário
  BEGIN
    user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'cliente'::user_role);
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- Se o role não for válido, usar 'cliente' como padrão
      user_role_value := 'cliente'::user_role;
      RAISE LOG 'Role inválido recebido para user_id: %, usando cliente como padrão', NEW.id;
  END;
  
  -- Log dos valores que serão inseridos
  RAISE LOG 'Inserindo perfil: user_id=%, nome=%, role=%', NEW.id, user_nome, user_role_value;
  
  -- Inserir o perfil do usuário
  INSERT INTO public.profiles (user_id, nome, role)
  VALUES (NEW.id, user_nome, user_role_value);
  
  RAISE LOG 'Perfil criado com sucesso para user_id: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detalhado do erro
    RAISE LOG 'Erro ao criar perfil para user_id: %. Erro: % - %', NEW.id, SQLSTATE, SQLERRM;
    -- Re-raise o erro para que o Supabase possa capturá-lo
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger com configuração mais robusta
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Garantir que a função get_user_role existe e funciona corretamente
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role AS $$
DECLARE
  user_role_result user_role;
BEGIN
  SELECT role INTO user_role_result 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role_result, 'cliente'::user_role);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'cliente'::user_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Verificar se há registros órfãos na tabela auth.users sem perfil correspondente
-- e criar perfis para eles se necessário
DO $$
DECLARE
  orphan_record RECORD;
BEGIN
  FOR orphan_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    INSERT INTO public.profiles (user_id, nome, role)
    VALUES (
      orphan_record.id,
      COALESCE(orphan_record.raw_user_meta_data ->> 'nome', split_part(orphan_record.email, '@', 1)),
      COALESCE((orphan_record.raw_user_meta_data ->> 'role')::user_role, 'cliente'::user_role)
    );
    RAISE LOG 'Perfil criado para usuário órfão: %', orphan_record.id;
  END LOOP;
END $$;

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
