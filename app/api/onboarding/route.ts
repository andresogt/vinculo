import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, partnerName, partnerGender, personalityType, intensityLevel } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const db = getServiceSupabase();

    await db.from("profiles").upsert(
      { user_id: user.id, name: name.trim() },
      { onConflict: "user_id" }
    );

    await db.from("partners").upsert(
      {
        user_id: user.id,
        partner_name: (partnerName || "Vinculo").trim(),
        partner_gender: partnerGender || "neutral",
        personality_type: personalityType || "romantic",
        intensity_level: intensityLevel || "medium",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
