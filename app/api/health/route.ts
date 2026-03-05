import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.OPENAI_API_KEY?.trim() ?? "";
  const hasOpenAI = !!raw;
  const isPlaceholder = /reemplaza|placeholder|tu-api-key|your-key|sk-your/i.test(raw);
  const hasSupabaseUrl = !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
  const hasSupabaseKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasSupabase = hasSupabaseUrl && (hasServiceKey || hasSupabaseKey);

  let openaiStatus = "missing";
  let message = "OPENAI_API_KEY no encontrada. Agrega tu API key en .env.local";
  if (hasOpenAI && isPlaceholder) {
    openaiStatus = "placeholder";
    message = "La API key es un placeholder. Reemplázala por tu clave real de platform.openai.com";
  } else if (hasOpenAI) {
    openaiStatus = "ok";
    message = "OPENAI_API_KEY configurada correctamente";
  }

  return NextResponse.json({
    openai: openaiStatus,
    supabase: hasSupabase ? "ok" : "not configured",
    message,
    config: {
      supabaseUrl: hasSupabaseUrl,
      supabaseKey: hasSupabaseKey,
      serviceRoleKey: hasServiceKey,
    },
  });
}
