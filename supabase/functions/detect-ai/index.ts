import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ILLUMINARTY_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Illuminarty API key not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to Blob for Deno fetch
    const fileBuffer = await file.arrayBuffer();
    const illumForm = new FormData();
    illumForm.append("file", new Blob([fileBuffer]), file.name);

    // Call Illuminarty API
    const illumResponse = await fetch("https://api.illuminarty.ai/v1/image/classify", {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: illumForm,
    });

    const illumResult = await illumResponse.json();
    console.log("Illuminarty raw response:", illumResult);

    const probability = illumResult.data?.probability ?? 0;
    console.log("PROBABILITY!", probability)
    const THRESHOLD = 0.35;

    if (probability > THRESHOLD) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "Image detected as AI-generated, with " +  Math.floor(probability*100) + "% confidence",
          confidence: probability,
          attribution: illumResult.data.attribution,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: illumResult.data,
        status: illumResult.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
