import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      message,
      page_name,
      source_type,
    } = await req.json();

    if (!customer_name || !customer_phone) {
      return new Response(
        JSON.stringify({ error: "Name and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store enquiry in database
    const { data: enquiry, error: dbError } = await supabase
      .from("enquiries")
      .insert({
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        message: message || null,
        page_name: page_name || "unknown",
        source_type: source_type || "general",
        is_read: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error(`Failed to store enquiry: ${dbError.message}`);
    }

    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Send WhatsApp notification to admin
    const adminPhone = "918087153702";
    const whatsappMessage = encodeURIComponent(
      `🔔 *New Enquiry Received!*\n\n` +
      `👤 *Name:* ${customer_name}\n` +
      `📱 *Phone:* ${customer_phone}\n` +
      `${customer_email ? `📧 *Email:* ${customer_email}\n` : ""}` +
      `💬 *Message:* ${message || "No message"}\n` +
      `📄 *Page:* ${page_name}\n` +
      `🏷️ *Type:* ${source_type}\n` +
      `📅 *Date:* ${now}`
    );

    // Attempt WhatsApp notification via CallMeBot (free API)
    const whatsappApiKey = Deno.env.get("CALLMEBOT_API_KEY");
    if (whatsappApiKey) {
      try {
        const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${whatsappMessage}&apikey=${whatsappApiKey}`;
        await fetch(waUrl);
        console.log("WhatsApp notification sent");
      } catch (waError) {
        console.error("WhatsApp notification failed:", waError);
      }
    } else {
      console.log("CALLMEBOT_API_KEY not set, skipping WhatsApp notification");
    }

    // Attempt email notification
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = "daineshiva@gmail.com";
    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Shivam CCTV <onboarding@resend.dev>",
            to: [adminEmail],
            subject: `🔔 New Enquiry from ${customer_name} - ${source_type}`,
            html: `
              <h2>New Enquiry Received</h2>
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${customer_name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${customer_phone}</td></tr>
                ${customer_email ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${customer_email}</td></tr>` : ""}
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${message || "No message"}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Page</td><td style="padding:8px;border:1px solid #ddd">${page_name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Type</td><td style="padding:8px;border:1px solid #ddd">${source_type}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Date</td><td style="padding:8px;border:1px solid #ddd">${now}</td></tr>
              </table>
            `,
          }),
        });
        if (emailRes.ok) {
          console.log("Email notification sent");
        } else {
          const errBody = await emailRes.text();
          console.error("Email send failed:", errBody);
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }
    } else {
      console.log("RESEND_API_KEY not set, skipping email notification");
    }

    return new Response(
      JSON.stringify({ success: true, enquiry_id: enquiry.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in notify-enquiry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
