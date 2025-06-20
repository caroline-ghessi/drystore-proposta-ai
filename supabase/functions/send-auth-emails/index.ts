
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

// Modo de diagnóstico - definir como true para pular validação do webhook
const DIAGNOSTIC_MODE = true;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailData {
  type: string;
  user: {
    id: string;
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const getPasswordResetTemplate = (email: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - DryStore</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
    .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
    .content { padding: 40px 30px; }
    .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
    .text { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .security-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏢 DryStore</div>
      <div class="subtitle">Sistema de Propostas Inteligentes</div>
    </div>
    
    <div class="content">
      <h1 class="title">Redefinir sua senha</h1>
      
      <p class="text">
        Olá! Recebemos uma solicitação para redefinir a senha da sua conta no DryStore.
      </p>
      
      <p class="text">
        Clique no botão abaixo para criar uma nova senha segura:
      </p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Redefinir Senha</a>
      </div>
      
      <div class="security-note">
        <strong>🔒 Segurança:</strong> Este link é válido por 1 hora e pode ser usado apenas uma vez.
      </div>
      
      <p class="text">
        <strong>Não solicitou esta alteração?</strong> Ignore este email com segurança. Sua senha atual permanece inalterada.
      </p>
      
      <p class="text">
        Se você tiver problemas ao clicar no botão, copie e cole este link no seu navegador:<br>
        <small style="color: #9ca3af; word-break: break-all;">${resetUrl}</small>
      </p>
    </div>
    
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo sistema DryStore.</p>
      <p>© 2024 DryStore - Sistema de Propostas Inteligentes</p>
    </div>
  </div>
</body>
</html>
`;

const getConfirmationTemplate = (email: string, confirmUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmar Conta - DryStore</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
    .content { padding: 40px 30px; }
    .title { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
    .text { color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .welcome-box { background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏢 DryStore</div>
      <div class="subtitle">Sistema de Propostas Inteligentes</div>
    </div>
    
    <div class="content">
      <h1 class="title">Bem-vindo ao DryStore!</h1>
      
      <p class="text">
        Olá! Obrigado por se cadastrar no DryStore. Para começar a usar nossa plataforma, precisamos confirmar seu endereço de email.
      </p>
      
      <div style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirmar Email</a>
      </div>
      
      <div class="welcome-box">
        <h3 style="color: #065f46; margin-top: 0;">🎉 O que você pode fazer no DryStore:</h3>
        <ul style="color: #047857; margin: 0;">
          <li>Criar propostas inteligentes com IA</li>
          <li>Gerenciar clientes e oportunidades</li>
          <li>Acompanhar vendas em tempo real</li>
          <li>Automatizar follow-ups</li>
          <li>Analisar performance de vendas</li>
        </ul>
      </div>
      
      <p class="text">
        Se você tiver problemas ao clicar no botão, copie e cole este link no seu navegador:<br>
        <small style="color: #9ca3af; word-break: break-all;">${confirmUrl}</small>
      </p>
    </div>
    
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo sistema DryStore.</p>
      <p>© 2024 DryStore - Sistema de Propostas Inteligentes</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("=== DIAGNÓSTICO DE EMAIL INICIADO ===");
  console.log("Modo diagnóstico:", DIAGNOSTIC_MODE);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Diagnóstico 1: Verificar secrets
    console.log("1. Verificando secrets...");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const webhookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    
    console.log("RESEND_API_KEY presente:", !!resendKey);
    console.log("SEND_EMAIL_HOOK_SECRET presente:", !!webhookSecret);
    
    if (webhookSecret) {
      console.log("Webhook secret length:", webhookSecret.length);
      console.log("Webhook secret first 10 chars:", webhookSecret.substring(0, 10));
    }

    // Diagnóstico 2: Verificar payload
    console.log("2. Verificando payload...");
    const payload = await req.text();
    console.log("Payload length:", payload.length);
    console.log("Payload preview:", payload.substring(0, 200));

    let authData: AuthEmailData;

    if (DIAGNOSTIC_MODE) {
      console.log("3. MODO DIAGNÓSTICO - Pulando validação de webhook");
      try {
        authData = JSON.parse(payload) as AuthEmailData;
        console.log("Payload JSON parseado com sucesso");
      } catch (parseError) {
        console.error("Erro ao parsear JSON:", parseError);
        return new Response(
          JSON.stringify({ 
            error: "Erro ao parsear payload JSON",
            details: parseError.toString()
          }), 
          { status: 400, headers: corsHeaders }
        );
      }
    } else {
      console.log("3. Validando webhook...");
      
      if (!hookSecret) {
        console.error("SEND_EMAIL_HOOK_SECRET não configurado");
        return new Response(
          JSON.stringify({ error: "Configuração de segurança ausente" }), 
          { status: 500, headers: corsHeaders }
        );
      }

      const headers = Object.fromEntries(req.headers);
      console.log("Headers recebidos:", Object.keys(headers));
      
      const wh = new Webhook(hookSecret);
      
      try {
        authData = wh.verify(payload, headers) as AuthEmailData;
        console.log("Webhook validado com sucesso");
      } catch (verifyError) {
        console.error("Falha na validação do webhook:", verifyError);
        console.error("Erro detalhado:", verifyError.toString());
        return new Response(
          JSON.stringify({ 
            error: "Assinatura de webhook inválida",
            details: verifyError.toString()
          }), 
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // Diagnóstico 4: Verificar dados extraídos
    console.log("4. Verificando dados extraídos...");
    const { user, email_data } = authData;
    const { email } = user;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    console.log("Email do usuário:", email);
    console.log("Tipo de ação:", email_action_type);
    console.log("Site URL:", site_url);
    console.log("Redirect to:", redirect_to);

    // Diagnóstico 5: Construir URLs
    console.log("5. Construindo URLs...");
    let actionUrl: string;
    let emailSubject: string;
    let emailHtml: string;

    if (email_action_type === "recovery") {
      actionUrl = `${site_url}/reset-password?token_hash=${token_hash}&type=${email_action_type}`;
      if (redirect_to) {
        actionUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
      
      emailSubject = "DryStore - Redefinir sua senha";
      emailHtml = getPasswordResetTemplate(email, actionUrl);
      
    } else if (email_action_type === "signup") {
      actionUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}`;
      if (redirect_to) {
        actionUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
      
      emailSubject = "DryStore - Confirme sua conta";
      emailHtml = getConfirmationTemplate(email, actionUrl);
      
    } else {
      console.log("Tipo de email não suportado:", email_action_type);
      return new Response(
        JSON.stringify({ error: "Tipo de email não suportado" }), 
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("URL de ação construída:", actionUrl);

    // Diagnóstico 6: Testar Resend
    console.log("6. Testando envio via Resend...");
    
    if (!resendKey) {
      console.error("RESEND_API_KEY não configurado");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY não configurado" }), 
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const emailResponse = await resend.emails.send({
        from: "DryStore <noreply@resend.dev>",
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      });

      console.log("Email enviado com sucesso:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: emailResponse.data?.id,
          type: email_action_type,
          diagnosticMode: DIAGNOSTIC_MODE,
          validated: !DIAGNOSTIC_MODE
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (resendError) {
      console.error("Erro no Resend:", resendError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao enviar email via Resend",
          details: resendError.toString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("Erro geral na função:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
