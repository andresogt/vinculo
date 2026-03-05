import { NextResponse } from "next/server";
import { hasSupabase, getServiceSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabase()) return NextResponse.json({ ok: true });

  try {
    const supabase = getServiceSupabase();
    const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);

    const { data: users } = await supabase
      .from("users")
      .select("id");

    const defaultMessage = "Hoy estuve pensando en lo que dijiste...";
    let sent = 0;

    for (const u of users ?? []) {
      const { data: last } = await supabase
        .from("messages")
        .select("created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (last?.created_at && new Date(last.created_at) < eightHoursAgo) {
        await supabase.from("messages").insert({
          user_id: u.id,
          role: "ai",
          content: defaultMessage,
        });
        sent++;
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
