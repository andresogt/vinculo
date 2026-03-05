import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("vinculo_user_id")?.value;
    if (!userId) {
      return NextResponse.json({
        attachment: 40,
        trust: 50,
        tension: 20,
        emotionalState: "connected",
      });
    }

    const supabase = getServiceSupabase();
    const { data } = await supabase
      .from("relationship_state")
      .select("attachment, trust, tension, emotional_state")
      .eq("user_id", userId)
      .single();

    if (!data) {
      return NextResponse.json({
        attachment: 40,
        trust: 50,
        tension: 20,
        emotionalState: "connected",
      });
    }

    return NextResponse.json({
      attachment: data.attachment,
      trust: data.trust,
      tension: data.tension,
      emotionalState: data.emotional_state,
    });
  } catch {
    return NextResponse.json(
      { attachment: 40, trust: 50, tension: 20, emotionalState: "connected" },
      { status: 500 }
    );
  }
}
