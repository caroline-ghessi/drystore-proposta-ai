
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
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 === INÍCIO DO DIAGNÓSTICO DE EMAIL [${timestamp}] ===`);
  console.log("🔧 Modo diagnóstico:", DIAGNOSTIC_MODE);
  console.log("📍 Método da requisição:", req.method);
  console.log("🌐 URL da requisição:", req.url);

  if (req.method === "OPTIONS") {
    console.log("✅ Requisição OPTIONS - retornando CORS headers");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Diagnóstico 1: Verificar variáveis de ambiente
    console.log("\n📋 1. VERIFICANDO VARIÁVEIS DE AMBIENTE...");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const webhookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    
    console.log("🔑 RESEND_API_KEY presente:", !!resendKey);
    console.log("🔑 RESEND_API_KEY comprimento:", resendKey ? resendKey.length : 0);
    console.log("🔐 SEND_EMAIL_HOOK_SECRET presente:", !!webhookSecret);
    console.log("🔐 SEND_EMAIL_HOOK_SECRET comprimento:", webhookSecret ? webhookSecret.length : 0);
    
    if (webhookSecret) {
      console.log("🔐 Webhook secret preview:", webhookSecret.substring(0, 10) + "...");
    }

    // Diagnóstico 2: Analisar payload
    console.log("\n📋 2. ANALISANDO PAYLOAD...");
    const payload = await req.text();
    console.log("📦 Payload comprimento:", payload.length);
    console.log("📦 Payload preview (primeiros 300 chars):", payload.substring(0, 300));

    let authData: AuthEmailData;

    if (DIAGNOSTIC_MODE) {
      console.log("\n🔧 3. MODO DIAGNÓSTICO ATIVO - Pulando validação de webhook");
      try {
        authData = JSON.parse(payload) as AuthEmailData;
        console.log("✅ Payload JSON parseado com sucesso");
        console.log("📧 Email do usuário:", authData.user?.email);
        console.log("🔤 Tipo de ação:", authData.email_data?.email_action_type);
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON:", parseError);
        return new Response(
          JSON.stringify({ 
            error: "Erro ao parsear payload JSON",
            details: parseError.toString(),
            timestamp: timestamp
          }), 
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      console.log("\n🔒 3. VALIDANDO WEBHOOK...");
      
      if (!hookSecret) {
        console.error("❌ SEND_EMAIL_HOOK_SECRET não configurado");
        return new Response(
          JSON.stringify({ 
            error: "Configuração de segurança ausente",
            timestamp: timestamp
          }), 
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const headers = Object.fromEntries(req.headers);
      console.log("📋 Headers da requisição:", Object.keys(headers));
      console.log("🔍 Headers relevantes:", {
        'webhook-id': headers['webhook-id'],
        'webhook-timestamp': headers['webhook-timestamp'],
        'webhook-signature': headers['webhook-signature'] ? 'presente' : 'ausente'
      });
      
      const wh = new Webhook(hookSecret);
      
      try {
        authData = wh.verify(payload, headers) as AuthEmailData;
        console.log("✅ Webhook validado com sucesso");
      } catch (verifyError) {
        console.error("❌ Falha na validação do webhook:", verifyError);
        console.error("🔍 Detalhes do erro:", verifyError.toString());
        return new Response(
          JSON.stringify({ 
            error: "Assinatura de webhook inválida",
            details: verifyError.toString(),
            timestamp: timestamp
          }), 
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Diagnóstico 4: Verificar dados extraídos
    console.log("\n📋 4. VERIFICANDO DADOS EXTRAÍDOS...");
    const { user, email_data } = authData;
    const { email } = user;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    console.log("👤 Email do usuário:", email);
    console.log("🎯 Tipo de ação:", email_action_type);
    console.log("🌐 Site URL:", site_url);
    console.log("↩️ Redirect to:", redirect_to);
    console.log("🔗 Token hash preview:", token_hash?.substring(0, 10) + "...");

    // Diagnóstico 5: Construir URLs
    console.log("\n📋 5. CONSTRUINDO URLs E TEMPLATES...");
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
      console.log("🔑 Construída URL de recuperação de senha");
      
    } else if (email_action_type === "signup") {
      actionUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}`;
      if (redirect_to) {
        actionUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
      
      emailSubject = "DryStore - Confirme sua conta";
      emailHtml = getConfirmationTemplate(email, actionUrl);
      console.log("✅ Construída URL de confirmação de cadastro");
      
    } else {
      console.log("❌ Tipo de email não suportado:", email_action_type);
      return new Response(
        JSON.stringify({ 
          error: "Tipo de email não suportado",
          supportedTypes: ["recovery", "signup"],
          receivedType: email_action_type,
          timestamp: timestamp
        }), 
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("🔗 URL de ação final:", actionUrl);

    // Diagnóstico 6: Verificar configuração do Resend
    console.log("\n📋 6. VERIFICANDO CONFIGURAÇÃO DO RESEND...");
    
    if (!resendKey) {
      console.error("❌ RESEND_API_KEY não configurado");
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY não configurado",
          timestamp: timestamp
        }), 
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✅ RESEND_API_KEY configurada");

    // Diagnóstico 7: Enviar email via Resend
    console.log("\n📋 7. ENVIANDO EMAIL VIA RESEND...");
    
    try {
      const emailPayload = {
        from: "DryStore <noreply@resend.dev>",
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      };

      console.log("📤 Payload do email:", {
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject,
        htmlLength: emailPayload.html.length
      });

      const emailResponse = await resend.emails.send(emailPayload);

      console.log("✅ Email enviado com sucesso!");
      console.log("📧 Resposta do Resend:", emailResponse);

      const successResponse = { 
        success: true, 
        messageId: emailResponse.data?.id,
        type: email_action_type,
        diagnosticMode: DIAGNOSTIC_MODE,
        validated: !DIAGNOSTIC_MODE,
        timestamp: timestamp,
        email: email,
        actionUrl: actionUrl
      };

      console.log("🎉 RESPOSTA DE SUCESSO:", successResponse);

      return new Response(
        JSON.stringify(successResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );

    } catch (resendError) {
      console.error("❌ ERRO NO RESEND:", resendError);
      console.error("🔍 Detalhes completos do erro:", JSON.stringify(resendError, null, 2));
      
      return new Response(
        JSON.stringify({ 
          error: "Erro ao enviar email via Resend",
          details: resendError.toString(),
          timestamp: timestamp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

  } catch (error: any) {
    console.error("\n💥 ERRO GERAL NA FUNÇÃO:");
    console.error("🔍 Tipo do erro:", typeof error);
    console.error("🔍 Mensagem:", error.message);
    console.error("🔍 Stack:", error.stack);
    console.error("🔍 Objeto completo:", JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor",
        details: error.toString(),
        stack: error.stack,
        timestamp: timestamp
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } finally {
    console.log(`\n🏁 === FIM DO DIAGNÓSTICO [${new Date().toISOString()}] ===\n`);
  }
};

serve(handler);
