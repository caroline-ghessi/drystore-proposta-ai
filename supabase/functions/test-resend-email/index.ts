
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Test Resend Email function started');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { testType, email, vendorEmail } = await req.json();
    console.log('Test type:', testType, 'Email:', email);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    let result = {};

    switch (testType) {
      case 'reset_password':
        console.log('🔄 Testing password reset email...');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`
        });
        
        if (resetError) {
          throw new Error(`Reset password failed: ${resetError.message}`);
        }
        
        result = {
          success: true,
          message: 'Password reset email sent successfully',
          email: email
        };
        break;

      case 'client_proposal':
        console.log('📧 Testing client proposal email...');
        // Simulate sending a proposal email to client
        const mockProposalData = {
          clientName: 'Cliente Teste',
          proposalNumber: 'PROP-' + Date.now(),
          totalValue: 'R$ 15.000,00',
          vendorName: vendorEmail || 'Vendedor Teste'
        };

        result = {
          success: true,
          message: 'Client proposal email simulation completed',
          email: email,
          proposalData: mockProposalData
        };
        break;

      case 'domain_validation':
        console.log('🌐 Testing domain validation...');
        // Check if the domain is properly configured
        try {
          const domainCheck = await fetch('https://propostas.drystore.com.br', {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          result = {
            success: true,
            message: 'Domain validation completed',
            domain: 'propostas.drystore.com.br',
            status: domainCheck.status,
            accessible: domainCheck.ok
          };
        } catch (domainError) {
          result = {
            success: false,
            message: 'Domain validation failed',
            domain: 'propostas.drystore.com.br',
            error: domainError.message
          };
        }
        break;

      case 'resend_api':
        console.log('🚀 Testing direct Resend API...');
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY not configured');
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'portal@propostas.drystore.com.br',
            to: [email],
            subject: '🔧 Teste de Configuração - Portal de Propostas',
            html: `
              <h2>✅ Teste de Email Realizado com Sucesso!</h2>
              <p>Este é um teste automatizado do sistema de emails.</p>
              <p><strong>Horário:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Tipo:</strong> Teste direto via Resend API</p>
              <hr>
              <p><small>Portal de Propostas - Drystore</small></p>
            `
          }),
        });

        if (!resendResponse.ok) {
          const errorData = await resendResponse.text();
          throw new Error(`Resend API error: ${resendResponse.status} - ${errorData}`);
        }

        const resendData = await resendResponse.json();
        result = {
          success: true,
          message: 'Direct Resend API test successful',
          resendResponse: resendData,
          email: email
        };
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    console.log('✅ Test completed successfully:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Test Resend Email Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
