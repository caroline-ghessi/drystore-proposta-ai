
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = action === 'generate' ? email : token
    
    const { data: rateLimitCheck } = await supabaseClient.rpc('check_rate_limit', {
      endpoint_name: `client-auth-${action}`,
      user_identifier: `${clientIP}-${rateLimitKey}`,
      max_requests: 10,
      window_minutes: 60
    })

    if (!rateLimitCheck) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result
    
    if (action === 'generate') {
      // Input validation for email
      if (!email || typeof email !== 'string' || !isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate secure token
      const { data, error } = await supabaseClient.rpc('generate_client_access_token', {
        client_email: email.toLowerCase().trim(),
        expires_in_hours: 24
      })

      if (error) {
        console.error('Token generation error:', error)
        return new Response(
          JSON.stringify({ error: 'Client not found or internal error' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      result = { token: data }
      
    } else if (action === 'validate') {
      // Input validation for token
      if (!token || typeof token !== 'string' || token.length < 10) {
        return new Response(
          JSON.stringify({ error: 'Invalid token format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate token
      const { data, error } = await supabaseClient.rpc('validate_client_access_token', {
        token: token
      })

      if (error) {
        console.error('Token validation error:', error)
        return new Response(
          JSON.stringify({ error: 'Token validation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      result = data
      
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}
