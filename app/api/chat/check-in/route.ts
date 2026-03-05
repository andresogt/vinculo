import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import OpenAI from "openai";

const FALLBACK_MSG = "Estaba pensando en cómo te va el día.";

/**
 * Called by cron when user inactive > 6 hours.
 * Sends a spontaneous AI message to re-engage.
 * Vercel cron sends GET; also accepts POST with Bearer token.
 */
async function handleCheckIn(request: Request) {
  const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getServiceSupabase();
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: staleUsers } = await db
      .from("relationship_state")
      .select("user_id")
      .or(`last_interaction.lt.${sixHoursAgo},last_interaction.is.null`)
      .limit(20);

    if (!staleUsers?.length) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: "OpenAI not configured" }, { status: 503 });
    const openai = new OpenAI({ apiKey });

    let sent = 0;
    for (const { user_id } of staleUsers) {
      const { data: profile } = await db.from("profiles").select("name").eq("user_id", user_id).single();
      const userName = (profile?.name as string) || "ahí";
      let content: string;
      try {
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Generate a single short, casual message in Spanish to check in on the user. Example: "Estaba pensando en cómo te va el día." User name: ${userName}. Max 15 words.`,
            },
            { role: "user", content: "Generate check-in message." },
          ],
          max_tokens: 40,
        });
        content = (res.choices[0]?.message?.content ?? "").trim() || FALLBACK_MSG;
      } catch {
        content = FALLBACK_MSG;
      }

      await db.from("messages").insert({
        user_id,
        role: "ai",
        content,
      });
      await db
        .from("relationship_state")
        .update({
          last_interaction: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);
      sent++;
    }

    return NextResponse.json({ ok: true, sent });
}

export async function GET(request: Request) {
  try {
    return await handleCheckIn(request);
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return await handleCheckIn(request);
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}
