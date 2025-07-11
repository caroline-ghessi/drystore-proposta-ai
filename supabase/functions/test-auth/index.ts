import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🔐 Função test-auth iniciada');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    console.log('📊 URLs e Keys básicas configuradas');
    
    // Extrair headers de autorização
    const authHeader = req.headers.get('Authorization');
    const apikey = req.headers.get('apikey');
    const clientInfo = req.headers.get('x-client-info');
    
    console.log('🔍 Headers recebidos:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : null,
      hasApikey: !!apikey,
      clientInfo: clientInfo
    });

    // Testar criação do cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
    });

    console.log('✅ Cliente Supabase criado');

    // Tentar obter usuário atual
    let userTest = null;
    let sessionTest = null;
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      userTest = {
        hasUser: !!user,
        userId: user?.id || null,
        userEmail: user?.email || null,
        error: userError?.message || null
      };
      
      console.log('👤 Teste de usuário:', userTest);
    } catch (userErr) {
      console.error('❌ Erro ao obter usuário:', userErr);
      userTest = { error: userErr.message };
    }

    // Tentar obter sessão atual
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      sessionTest = {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        expiresAt: session?.expires_at || null,
        error: sessionError?.message || null
      };
      
      console.log('🎫 Teste de sessão:', sessionTest);
    } catch (sessionErr) {
      console.error('❌ Erro ao obter sessão:', sessionErr);
      sessionTest = { error: sessionErr.message };
    }

    // Tentar fazer uma consulta simples ao banco
    let dbTest = null;
    try {
      const { data: profiles, error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      dbTest = {
        canQueryDb: !dbError,
        profilesCount: profiles?.length || 0,
        error: dbError?.message || null
      };
      
      console.log('🗄️ Teste de banco:', dbTest);
    } catch (dbErr) {
      console.error('❌ Erro ao consultar banco:', dbErr);
      dbTest = { error: dbErr.message };
    }

    const authStatus = {
      timestamp: new Date().toISOString(),
      headers: {
        hasAuthHeader: !!authHeader,
        hasApikey: !!apikey,
        clientInfo: clientInfo
      },
      user: userTest,
      session: sessionTest,
      database: dbTest,
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseAnonKey
      }
    };

    console.log('✅ Teste de autenticação concluído:', authStatus);

    return new Response(JSON.stringify(authStatus), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Erro crítico no teste de autenticação:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});