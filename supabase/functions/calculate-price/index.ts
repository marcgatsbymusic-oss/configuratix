import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceInput {
  profile_system_id: string
  window_type_id: string
  dimensions: { width: number; height: number }
  options: Record<string, string>
}

interface LineItem {
  label: string
  price_eur: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: PriceInput = await req.json()
    const { profile_system_id, window_type_id, dimensions, options } = input

    // Validate required fields
    if (!profile_system_id || !window_type_id || !dimensions) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch pricing rules for this profile system
    const { data: rules, error: rulesError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('profile_system_id', profile_system_id)

    if (rulesError) throw rulesError

    const lineItems: LineItem[] = []

    // ── Base price: area × price_per_m2 ─────────────────────────────────────
    const areaMm2 = dimensions.width * dimensions.height
    const areaM2 = areaMm2 / 1_000_000

    const baseRule = rules?.find((r) => !r.group_name && !r.option_key && r.price_per_m2_eur)
    const pricePerM2 = baseRule?.price_per_m2_eur ?? 180 // fallback default

    const basePrice = Math.round(areaM2 * pricePerM2 * 100) / 100
    lineItems.push({ label: `Base price (${areaM2.toFixed(2)} m²)`, price_eur: basePrice })

    // ── Option deltas ────────────────────────────────────────────────────────
    for (const [group, key] of Object.entries(options)) {
      const rule = rules?.find(
        (r) => r.group_name === group && r.option_key === key && r.price_delta_eur !== null
      )
      if (rule?.price_delta_eur && rule.price_delta_eur !== 0) {
        // Scale delta by area for area-sensitive options (e.g., glazing)
        const areaFactor = ['glazing', 'spacer'].includes(group) ? areaM2 : 1
        const delta = Math.round(rule.price_delta_eur * areaFactor * 100) / 100
        lineItems.push({ label: formatOptionLabel(group, key), price_eur: delta })
      }
    }

    // ── Window type surcharge ────────────────────────────────────────────────
    const typeRule = rules?.find(
      (r) => r.group_name === 'window_type' && r.option_key === window_type_id
    )
    if (typeRule?.price_delta_eur) {
      lineItems.push({ label: 'Window type surcharge', price_eur: typeRule.price_delta_eur })
    }

    const total_eur = Math.round(lineItems.reduce((sum, item) => sum + item.price_eur, 0) * 100) / 100

    return new Response(
      JSON.stringify({ line_items: lineItems, total_eur }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[calculate-price]', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function formatOptionLabel(group: string, key: string): string {
  const groupLabels: Record<string, string> = {
    glazing: 'Glazing',
    color_exterior: 'Exterior colour',
    color_interior: 'Interior colour',
    security: 'Security level',
    spacer: 'Spacer bar',
    handle: 'Handle',
  }
  return `${groupLabels[group] ?? group}: ${key.replace(/-/g, ' ')}`
}
