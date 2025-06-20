
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  console.log("Webhook de email recebido");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authData: AuthEmailData = await req.json();
    console.log("Dados recebidos:", authData);

    const { user, email_data } = authData;
    const { email } = user;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    // Construir URL completa baseada no tipo de ação
    let actionUrl: string;
    let emailSubject: string;
    let emailHtml: string;

    if (email_action_type === "recovery") {
      // URL para redefinição de senha
      actionUrl = `${site_url}/reset-password?token_hash=${token_hash}&type=${email_action_type}`;
      if (redirect_to) {
        actionUrl += `&redirect_to=${encodeURIComponent(redirect_to)}`;
      }
      
      emailSubject = "DryStore - Redefinir sua senha";
      emailHtml = getPasswordResetTemplate(email, actionUrl);
      
    } else if (email_action_type === "signup") {
      // URL para confirmação de email
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

    console.log(`Enviando email ${email_action_type} para:`, email);
    console.log("URL de ação:", actionUrl);

    // Enviar email via Resend
    const emailResponse = await resend.emails.send({
      from: "DryStore <noreply@resend.dev>", // Usar domínio verificado depois
      to: [email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        type: email_action_type
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
