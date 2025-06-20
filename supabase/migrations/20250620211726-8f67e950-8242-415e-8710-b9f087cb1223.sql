
-- Primeiro, vamos garantir que o enum user_role existe
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'vendedor_interno', 'representante', 'cliente');
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Enum user_role já existe';
END $$;

-- Remover completamente a função e trigger existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar a função handle_new_user do zero com validação robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value text;
  user_nome text;
  final_role public.user_role;
BEGIN
  -- Log inicial
  RAISE LOG 'FUNÇÃO handle_new_user INICIADA para user_id: %', NEW.id;
  
  -- Extrair nome do usuário
  user_nome := COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1));
  RAISE LOG 'Nome extraído: %', user_nome;
  
  -- Extrair role como string primeiro
  user_role_value := COALESCE(NEW.raw_user_meta_data ->> 'role', 'cliente');
  RAISE LOG 'Role como string: %', user_role_value;
  
  -- Validar e converter o role para o enum
  CASE user_role_value
    WHEN 'admin' THEN final_role := 'admin'::public.user_role;
    WHEN 'vendedor_interno' THEN final_role := 'vendedor_interno'::public.user_role;
    WHEN 'representante' THEN final_role := 'representante'::public.user_role;
    WHEN 'cliente' THEN final_role := 'cliente'::public.user_role;
    ELSE 
      RAISE LOG 'Role inválido %, usando cliente como padrão', user_role_value;
      final_role := 'cliente'::public.user_role;
  END CASE;
  
  RAISE LOG 'Role final definido: %', final_role;
  
  -- Inserir o perfil
  INSERT INTO public.profiles (user_id, nome, role)
  VALUES (NEW.id, user_nome, final_role);
  
  RAISE LOG 'PERFIL CRIADO COM SUCESSO para user_id: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'ERRO CRÍTICO na função handle_new_user para user_id: %. SQLSTATE: %, SQLERRM: %', NEW.id, SQLSTATE, SQLERRM;
    -- Criar perfil mínimo para não bloquear o cadastro
    BEGIN
      INSERT INTO public.profiles (user_id, nome, role)
      VALUES (NEW.id, COALESCE(user_nome, split_part(NEW.email, '@', 1)), 'cliente'::public.user_role);
      RAISE LOG 'Perfil de fallback criado para user_id: %', NEW.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE LOG 'FALHA TOTAL no fallback para user_id: %. SQLSTATE: %, SQLERRM: %', NEW.id, SQLSTATE, SQLERRM;
        -- Re-raise o erro original para bloquear o cadastro se nem o fallback funcionar
        RAISE;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Função de teste para validar o sistema
CREATE OR REPLACE FUNCTION public.test_user_role_enum()
RETURNS TEXT AS $$
DECLARE
  test_role public.user_role;
BEGIN
  test_role := 'vendedor_interno'::public.user_role;
  RETURN 'Enum user_role funcionando: ' || test_role::text;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERRO no enum user_role: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Corrigir usuários órfãos existentes
DO $$
DECLARE
  orphan_record RECORD;
  safe_role public.user_role;
BEGIN
  RAISE LOG 'Iniciando correção de usuários órfãos...';
  
  FOR orphan_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Determinar role seguro
    CASE COALESCE(orphan_record.raw_user_meta_data ->> 'role', 'cliente')
      WHEN 'admin' THEN safe_role := 'admin'::public.user_role;
      WHEN 'vendedor_interno' THEN safe_role := 'vendedor_interno'::public.user_role;
      WHEN 'representante' THEN safe_role := 'representante'::public.user_role;
      ELSE safe_role := 'cliente'::public.user_role;
    END CASE;
    
    INSERT INTO public.profiles (user_id, nome, role)
    VALUES (
      orphan_record.id,
      COALESCE(orphan_record.raw_user_meta_data ->> 'nome', split_part(orphan_record.email, '@', 1)),
      safe_role
    );
    
    RAISE LOG 'Perfil órfão criado para user_id: % com role: %', orphan_record.id, safe_role;
  END LOOP;
  
  RAISE LOG 'Correção de usuários órfãos concluída';
END $$;

-- Garantir índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Atualizar função get_user_role para consistência
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS public.user_role AS $$
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
