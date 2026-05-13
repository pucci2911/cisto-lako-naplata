import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, shopName: shopNameInput } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId je obavezan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY nije konfigurisan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, order_number, customer_id")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Porudžbina nije pronađena" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: customer, error: custErr } = await admin
      .from("customers")
      .select("full_name, email")
      .eq("id", order.customer_id)
      .single();
    if (custErr || !customer) {
      return new Response(JSON.stringify({ error: "Kupac nije pronađen" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!customer.email) {
      return new Response(JSON.stringify({ error: "Kupac nema email adresu" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shopName = (shopNameInput || "Čisto").toString();
    const subject = `Vaša porudžbina je spremna — ${shopName}`;
    const text = `Poštovani ${customer.full_name}, vaša porudžbina broj ${order.order_number} je spremna za preuzimanje. Hvala na poverenju — ${shopName}`;
    const html = `<p>Poštovani ${customer.full_name},</p><p>Vaša porudžbina broj <strong>${order.order_number}</strong> je spremna za preuzimanje.</p><p>Hvala na poverenju — ${shopName}</p>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${shopName} <noreply@resend.dev>`,
        to: [customer.email],
        subject,
        text,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      return new Response(JSON.stringify({ error: "Slanje emaila nije uspelo", details: errBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, email: customer.email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
