import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getServiceSupabase();

    const { data: profile } = await db
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    const { data: partner } = await db
      .from("partners")
      .select("partner_name, partner_gender, personality_type, intensity_level")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      name: profile?.name ?? "",
      partnerName: partner?.partner_name ?? "Vinculo",
      partnerGender: partner?.partner_gender ?? "neutral",
      personalityType: partner?.personality_type ?? "romantic",
      intensityLevel: partner?.intensity_level ?? "medium",
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, partnerName, partnerGender, personalityType, intensityLevel } = body;

    const db = getServiceSupabase();

    if (name !== undefined && typeof name === "string") {
      await db.from("profiles").upsert(
        { user_id: user.id, name: name.trim() },
        { onConflict: "user_id" }
      );
    }

    if (
      partnerName !== undefined ||
      partnerGender !== undefined ||
      personalityType !== undefined ||
      intensityLevel !== undefined
    ) {
      const updates: Record<string, unknown> = { user_id: user.id };
      if (partnerName !== undefined) updates.partner_name = partnerName;
      if (partnerGender !== undefined) updates.partner_gender = partnerGender;
      if (personalityType !== undefined) updates.personality_type = personalityType;
      if (intensityLevel !== undefined) updates.intensity_level = intensityLevel;

      await db.from("partners").upsert(updates, { onConflict: "user_id" });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
