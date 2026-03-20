import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar boletos não pagos que vencem em breve
    const { data: bills, error: billsError } = await supabaseClient
      .from('bills')
      .select('*')
      .eq('paid', false)

    if (billsError) throw billsError

    // 2. Buscar configurações de contato
    const { data: settingsData } = await supabaseClient
      .from('settings')
      .select('config')
      .single()

    const settings = settingsData?.config
    const today = new Date()

    const results = []

    for (const bill of bills) {
      const dueDate = new Date(bill.due_date)
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Verifica se o dia de hoje é um dos dias de alerta configurados
      const shouldAlert = [settings.intervals.first, settings.intervals.second, settings.intervals.third].includes(diffDays) || diffDays < 0

      if (shouldAlert) {
        // AQUI VOCÊ CONECTA O WHATSAPP OU EMAIL REAL
        // Exemplo: Chamar API do Resend (Email) ou Evolution API (WhatsApp)
        console.log(`Disparando alerta para: ${bill.title} - Vence em ${diffDays} dias`)
        
        results.push({ bill: bill.title, status: 'Alerta processado' })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})