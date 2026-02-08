import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisRequest {
  imageBase64: string;
  price?: number;
  discountPercent?: number;
  offerText?: string;
}

interface ProductAnalysis {
  brand: string;
  productType: string;
  modelCategory: string;
  features: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedBadge: string;
  suggestedBackground: {
    type: 'gradient' | 'solid';
    colors: string[];
  };
  suggestedTextColor: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: AnalysisRequest = await req.json();
    const { imageBase64, price, discountPercent, offerText } = body;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the AI prompt for product analysis
    const systemPrompt = `You are a product image analyzer for a CCTV/Security Camera business called "Shivam CCTV" in Jalna, Maharashtra, India.

Analyze the product image and extract the following information:
1. Brand name (look for logos, text on product - if not visible, use "Shivam CCTV")
2. Product type (Dome Camera, Bullet Camera, DVR, NVR, SMPS, Cable, Combo Kit, Accessories, etc.)
3. Model category (approximate specs like 2MP, 5MP, Full Color, Night Vision, Outdoor, Indoor, etc.)
4. Key features (up to 4 safe, realistic features - don't make fake claims)
5. Suggested banner title (catchy, short - max 6 words)
6. Suggested description (one line punchline for the banner)
7. Suggested badge text (like "HOT DEAL", "BESTSELLER", "NEW ARRIVAL", "SPECIAL OFFER", etc.)
8. Suggested background style based on product colors (gradient or solid, with hex colors that complement the product)
9. Suggested text color (ensure good contrast with background)

Be conservative with claims. Only include features you can actually see or reasonably infer from the image.
For CCTV products, common features are: HD Resolution, Night Vision, Weatherproof, Wide Angle, Motion Detection, Remote Access.

Respond in valid JSON format only.`;

    const userPrompt = `Analyze this CCTV/Security product image and provide marketing banner content.
${price ? `Price: ₹${price}` : ''}
${discountPercent ? `Discount: ${discountPercent}% OFF` : ''}
${offerText ? `Offer: ${offerText}` : ''}

Provide a JSON response with this exact structure:
{
  "brand": "detected or inferred brand name",
  "productType": "type of product",
  "modelCategory": "approximate model/specs",
  "features": ["feature1", "feature2", "feature3", "feature4"],
  "suggestedTitle": "catchy title for banner",
  "suggestedDescription": "one line marketing description",
  "suggestedBadge": "badge text like HOT DEAL",
  "suggestedBackground": {
    "type": "gradient or solid",
    "colors": ["#hex1", "#hex2"]
  },
  "suggestedTextColor": "#hexcolor"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from AI
    let analysis: ProductAnalysis;
    try {
      // Extract JSON from the response (in case it has markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide fallback analysis
      analysis = {
        brand: "Shivam CCTV",
        productType: "Security Camera",
        modelCategory: "HD Camera",
        features: ["High Definition", "Night Vision", "Wide Angle", "Easy Install"],
        suggestedTitle: "Premium Security Camera",
        suggestedDescription: "Professional surveillance for your peace of mind",
        suggestedBadge: "FEATURED",
        suggestedBackground: {
          type: "gradient",
          colors: ["#1a1a2e", "#16213e"]
        },
        suggestedTextColor: "#ffffff"
      };
    }

    // Add price/discount info to the analysis if provided
    const enrichedAnalysis = {
      ...analysis,
      price: price || null,
      discountPercent: discountPercent || null,
      offerText: offerText || null,
      formattedPrice: price ? `₹${price.toLocaleString('en-IN')}` : null,
      discountedPrice: price && discountPercent 
        ? `₹${Math.round(price * (1 - discountPercent / 100)).toLocaleString('en-IN')}`
        : null,
    };

    return new Response(
      JSON.stringify({ success: true, analysis: enrichedAnalysis }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing product image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
