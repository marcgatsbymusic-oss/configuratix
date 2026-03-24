import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitQuoteInput {
  // Configuration
  session_id: string
  product_category: string
  profile_system_id: string | null
  window_type_id: string | null
  width_mm: number
  height_mm: number
  options_json: Record<string, string>
  total_price_eur: number | null
  // Contact
  name: string
  email: string
  phone?: string | null
  message?: string | null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: SubmitQuoteInput = await req.json()

    // Basic validation
    if (!input.name || !input.email) {
      return new Response(
        JSON.stringify({ error: 'name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Validate dimensions against constraints (if profile + window type provided)
    if (input.profile_system_id && input.window_type_id) {
      const { data: constraint } = await supabase
        .from('constraints')
        .select('*')
        .eq('profile_system_id', input.profile_system_id)
        .eq('window_type_id', input.window_type_id)
        .maybeSingle()

      if (constraint) {
        if (input.width_mm < constraint.min_width_mm || input.width_mm > constraint.max_width_mm) {
          return new Response(
            JSON.stringify({
              error: `Width ${input.width_mm}mm is outside allowed range ${constraint.min_width_mm}–${constraint.max_width_mm}mm`,
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        if (input.height_mm < constraint.min_height_mm || input.height_mm > constraint.max_height_mm) {
          return new Response(
            JSON.stringify({
              error: `Height ${input.height_mm}mm is outside allowed range ${constraint.min_height_mm}–${constraint.max_height_mm}mm`,
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 2. Insert configuration
    const { data: configData, error: configErr } = await supabase
      .from('configurations')
      .insert({
        session_id: input.session_id,
        product_category: input.product_category,
        profile_system_id: input.profile_system_id,
        window_type_id: input.window_type_id,
        width_mm: input.width_mm,
        height_mm: input.height_mm,
        options_json: input.options_json,
        total_price_eur: input.total_price_eur,
      })
      .select('id')
      .single()

    if (configErr) throw configErr

    // 3. Insert quote request
    const { data: quoteData, error: quoteErr } = await supabase
      .from('quote_requests')
      .insert({
        configuration_id: configData.id,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        message: input.message ?? null,
      })
      .select('id')
      .single()

    if (quoteErr) throw quoteErr

    return new Response(
      JSON.stringify({
        success: true,
        configuration_id: configData.id,
        quote_request_id: quoteData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[submit-quote]', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
