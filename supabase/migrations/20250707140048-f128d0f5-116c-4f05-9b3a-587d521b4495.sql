-- Habilitar extensões necessárias para HTTP requests (se não estiverem habilitadas)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para enviar email de boas-vindas
CREATE OR REPLACE FUNCTION public.send_welcome_email(
  user_email text,
  user_name text,
  user_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_subject text;
  email_body text;
  role_display text;
  role_instructions text;
  request_id bigint;
BEGIN
  -- Definir exibição do role em português
  CASE user_role
    WHEN 'admin' THEN role_display := 'Administrador';
    WHEN 'vendedor_interno' THEN role_display := 'Vendedor Interno';
    WHEN 'representante' THEN role_display := 'Representante';
    ELSE role_display := 'Usuário';
  END CASE;
  
  -- Definir instruções específicas por role
  CASE user_role
    WHEN 'admin' THEN role_instructions := 'Como administrador, você terá acesso total ao sistema, incluindo criação de usuários, configurações e todos os dados.';
    WHEN 'vendedor_interno' THEN role_instructions := 'Como vendedor interno, você poderá criar propostas, gerenciar clientes e acompanhar suas vendas.';
    WHEN 'representante' THEN role_instructions := 'Como representante, você poderá criar propostas para seus clientes e acompanhar seu desempenho.';
    ELSE role_instructions := 'Você foi cadastrado no sistema.';
  END CASE;

  -- Configurar assunto do email
  email_subject := 'Bem-vindo ao DryStore - Configure sua conta';

  -- Montar corpo do email em HTML
  email_body := '<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao DryStore</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao DryStore</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Soluções Inteligentes</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin: 0 0 20px 0;">Olá, ' || user_name || '!</h2>
        
        <p>Sua conta foi criada com sucesso no sistema DryStore. Você foi cadastrado como <strong>' || role_display || '</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">Suas informações:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ' || user_email || '</p>
            <p style="margin: 5px 0;"><strong>Tipo de usuário:</strong> ' || role_display || '</p>
        </div>
        
        <p>' || role_instructions || '</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Importante - Configure sua senha</h4>
            <p style="margin: 0;">Para acessar o sistema, você precisa definir uma senha. Use a opção "Esqueci minha senha" na tela de login para criar sua senha de acesso.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="' || current_setting('app.settings.site_url', true) || '/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar DryStore
            </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <div style="color: #666; font-size: 14px;">
            <p><strong>Precisa de ajuda?</strong></p>
            <p>Entre em contato conosco:</p>
            <p>📧 suporte@drystore.com.br<br>
               📱 WhatsApp: (11) 99999-9999</p>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            Este email foi enviado automaticamente pelo sistema DryStore.<br>
            © 2024 DryStore - Soluções Inteligentes
        </p>
    </div>
</body>
</html>';

  -- Log da tentativa de envio
  RAISE LOG 'Tentando enviar email de boas-vindas para: % (role: %)', user_email, user_role;

  -- Enviar email via SMTP usando pg_net
  BEGIN
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/auth/v1/admin/generate_link',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', 'recovery',
        'email', user_email,
        'options', jsonb_build_object(
          'email_redirect_to', current_setting('app.settings.site_url', true) || '/reset-password'
        )
      )
    ) INTO request_id;
    
    RAISE LOG 'Email de boas-vindas enviado com sucesso para: % (request_id: %)', user_email, request_id;
    
    -- Log de sucesso
    INSERT INTO public.security_events (event_type, details, severity)
    VALUES (
      'welcome_email_sent',
      jsonb_build_object(
        'email', user_email,
        'role', user_role,
        'request_id', request_id,
        'timestamp', now()
      ),
      'low'
    );
    
    RETURN true;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log do erro sem bloquear o cadastro
      RAISE LOG 'ERRO ao enviar email de boas-vindas para %: % - %', user_email, SQLSTATE, SQLERRM;
      
      INSERT INTO public.security_events (event_type, details, severity)
      VALUES (
        'welcome_email_failed',
        jsonb_build_object(
          'email', user_email,
          'role', user_role,
          'error', SQLERRM,
          'timestamp', now()
        ),
        'medium'
      );
      
      RETURN false;
  END;
END;
$$;

-- Modificar a função handle_new_user para incluir envio de email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value text;
  user_nome text;
  final_role public.user_role;
  email_sent boolean;
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
  
  -- Enviar email de boas-vindas (não bloqueia se falhar)
  BEGIN
    SELECT public.send_welcome_email(NEW.email, user_nome, user_role_value) INTO email_sent;
    
    IF email_sent THEN
      RAISE LOG 'Email de boas-vindas enviado com sucesso para: %', NEW.email;
    ELSE
      RAISE LOG 'Falha no envio do email de boas-vindas para: %', NEW.email;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log do erro mas não bloqueia o cadastro
      RAISE LOG 'ERRO no envio de email para %: % - %', NEW.email, SQLSTATE, SQLERRM;
  END;
  
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
$$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();