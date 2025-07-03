
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, api-key, content-type',
}

// Enhanced input validation
function sanitizeInput(input: string, maxLength: number = 254): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .substring(0, maxLength);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && 
         email.length <= 254 && 
         !email.includes('..') && 
         !email.startsWith('.') && 
         !email.endsWith('.');
}

function isValidToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (token.length < 20) return false;
  
  // Check for valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(token);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, token } = await req.json()

    // Get client IP and user agent for security logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Enhanced rate limiting check
    const rateLimitKey = action === 'generate' ? email : token;
    
    const { data: rateLimitCheck } = await supabaseClient.rpc('check_enhanced_rate_limit', {
      endpoint_name: `client-auth-${action}`,
      user_identifier: `${clientIP}-${rateLimitKey}`,
      max_requests: 10,
      window_minutes: 60,
      block_duration_minutes: 15
    });

    if (!rateLimitCheck) {
      // Log security event
      await supabaseClient.rpc('log_security_event', {
        event_type: 'rate_limit_exceeded',
        details: { 
          endpoint: `client-auth-${action}`, 
          ip: clientIP,
          user_agent: userAgent 
        },
        severity: 'high'
      });

      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Access temporarily blocked.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    
    if (action === 'generate') {
      // Enhanced input validation for email
      const sanitizedEmail = sanitizeInput(email?.toLowerCase() || '');
      
      if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
        await supabaseClient.rpc('log_security_event', {
          event_type: 'invalid_email_format_attempt',
          details: { 
            attempted_email: email,
            ip: clientIP,
            user_agent: userAgent 
          },
          severity: 'medium'
        });

        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate secure token
      const { data, error } = await supabaseClient.rpc('generate_client_access_token', {
        client_email: sanitizedEmail,
        expires_in_hours: 24
      });

      if (error) {
        console.error('Token generation error:', error);
        
        await supabaseClient.rpc('log_security_event', {
          event_type: 'token_generation_failed',
          details: { 
            email: sanitizedEmail,
            error: error.message,
            ip: clientIP,
            user_agent: userAgent 
          },
          severity: 'medium'
        });

        return new Response(
          JSON.stringify({ error: 'Client not found or internal error' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient.rpc('log_security_event', {
        event_type: 'client_token_generated',
        details: { 
          email: sanitizedEmail,
          ip: clientIP,
          user_agent: userAgent 
        },
        severity: 'low'
      });

      result = { token: data };
      
    } else if (action === 'validate') {
      // Enhanced input validation for token
      const sanitizedToken = sanitizeInput(token || '', 100);
      
      if (!sanitizedToken || !isValidToken(sanitizedToken)) {
        await supabaseClient.rpc('log_security_event', {
          event_type: 'invalid_token_format_attempt',
          details: { 
            ip: clientIP,
            user_agent: userAgent 
          },
          severity: 'medium'
        });

        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate token
      const { data, error } = await supabaseClient.rpc('validate_client_access_token', {
        token: sanitizedToken
      });

      if (error) {
        console.error('Token validation error:', error);
        
        await supabaseClient.rpc('log_security_event', {
          event_type: 'token_validation_failed',
          details: { 
            error: error.message,
            ip: clientIP,
            user_agent: userAgent 
          },
          severity: 'medium'
        });

        return new Response(
          JSON.stringify({ error: 'Token validation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log successful validation
      await supabaseClient.rpc('log_security_event', {
        event_type: 'client_token_validated',
        client_id: (data as any)?.client?.id,
        details: { 
          ip: clientIP,
          user_agent: userAgent 
        },
        severity: 'low'
      });

      result = data;
      
    } else {
      await supabaseClient.rpc('log_security_event', {
        event_type: 'invalid_action_attempt',
        details: { 
          action: action,
          ip: clientIP,
          user_agent: userAgent 
        },
        severity: 'medium'
      });

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Log critical security event
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabaseClient.rpc('log_security_event', {
        event_type: 'edge_function_error',
        details: { 
          error: error.message,
          stack: error.stack 
        },
        severity: 'high'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
