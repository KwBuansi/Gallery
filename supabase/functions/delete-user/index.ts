import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Use environment variables for service role
const supabaseUrl = Deno.env.get("MY_SUPABASE_URL");
const serviceRoleKey = Deno.env.get("MY_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing access token" }), {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const userId = user.id;

    // Delete profile row
    const { error: profileError } = await supabase.from("profile").delete().eq("id", userId);
    if (profileError) {
      return new Response(JSON.stringify({ error: "Failed to delete profile" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      return new Response(JSON.stringify({ error: "Failed to delete user" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});