import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/auth";
import { getServiceSupabase } from "@/lib/supabase";
import type { RelationshipState } from "@/types/emotional";
import {
  getDefaultState,
  updateState,
  randomEmotionalEvent,
  getRelationshipLevelName,
} from "@/lib/emotionalEngine";
import { shouldStoreMemory, getEmotionalWeight } from "@/lib/memoryEngine";
import { generateReply } from "@/lib/openai";

const ERROR_REPLY = "Lo siento, hubo un error. Intenta de nuevo.";
const FALLBACK_REPLY = "Tuve un pequeño problema respondiendo. ¿Puedes repetirlo?";

function extractUserName(message: string): string | null {
  const msg = message.trim();
  const patterns = [
    /(?:me llamo|mi nombre es|soy|i'm|i am|me llaman)\s+([a-záéíóúñ\s]{2,30})/i,
    /^([a-záéíóúñ]{2,30})$/i,
  ];
  for (const re of patterns) {
    const m = msg.match(re);
    if (m) {
      const name = m[1].trim();
      if (name.length >= 2 && name.length <= 30) return name;
    }
  }
  if (msg.length >= 2 && msg.length <= 30 && !/\s{2,}/.test(msg) && !msg.includes("?")) {
    return msg;
  }
  return null;
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getServiceSupabase();
    const { data: messages } = await db
      .from("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    return NextResponse.json({
      messages: (messages ?? []).map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) ?? {};
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const userName = typeof body?.userName === "string" ? body.userName.trim() : null;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    if (!supabase) {
      return NextResponse.json({ reply: ERROR_REPLY }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ reply: "Inicia sesión para chatear." }, { status: 401 });
    }

    const db = getServiceSupabase();

    // Load profile
    const { data: profile } = await db
      .from("profiles")
      .select("name")
      .eq("user_id", user.id)
      .single();

    let resolvedUserName = (profile?.name && typeof profile.name === "string" ? profile.name.trim() : "") || "";
    if (!resolvedUserName && userName) resolvedUserName = userName;
    const extractedName = extractUserName(message);
    if (!resolvedUserName && extractedName) {
      await db.from("profiles").upsert(
        { user_id: user.id, name: extractedName },
        { onConflict: "user_id" }
      );
      resolvedUserName = extractedName;
    }
    const safeUserName = resolvedUserName || "usuario";

    // Load partner
    const { data: partner } = await db
      .from("partners")
      .select("partner_name, personality_type, intensity_level")
      .eq("user_id", user.id)
      .single();

    const safePartnerName =
      (partner?.partner_name && typeof partner.partner_name === "string")
        ? partner.partner_name
        : "Vinculo";

    // Load relationship state
    let { data: stateRow } = await db
      .from("relationship_state")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const defaultState = getDefaultState();
    const currentState: RelationshipState = stateRow
      ? {
          attachment: stateRow.attachment ?? defaultState.attachment,
          trust: stateRow.trust ?? defaultState.trust,
          tension: stateRow.tension ?? defaultState.tension,
          affection: stateRow.affection ?? defaultState.affection,
          jealousy: stateRow.jealousy ?? defaultState.jealousy,
          distance: stateRow.distance ?? defaultState.distance,
          playfulness: stateRow.playfulness ?? defaultState.playfulness,
          relationshipLevel: stateRow.relationship_level ?? 1,
          emotionalState: (stateRow.emotional_state as RelationshipState["emotionalState"]) ?? defaultState.emotionalState,
        }
      : defaultState;

    // Hours since last message
    const { data: lastMsgRow } = await db
      .from("messages")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const hoursSince =
      lastMsgRow?.created_at
        ? (Date.now() - new Date(lastMsgRow.created_at).getTime()) / (1000 * 60 * 60)
        : 0;

    // Insert user message
    await db.from("messages").insert({
      user_id: user.id,
      role: "user",
      content: message,
    });

    // Update emotional state
    const updatedState = updateState(
      currentState,
      message,
      hoursSince >= 8 ? hoursSince : undefined
    );

    // Store memory if emotional context
    if (shouldStoreMemory(message)) {
      const weight = getEmotionalWeight(message);
      await db.from("memories").insert({
        user_id: user.id,
        content: message.slice(0, 500),
        emotional_weight: Math.min(10, Math.max(1, weight)),
      });
    }

    // Retrieve top 3 memories
    const { data: memoryRows } = await db
      .from("memories")
      .select("content")
      .eq("user_id", user.id)
      .order("emotional_weight", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

    const memories = (memoryRows ?? []).map((m) => String(m?.content ?? "")).filter(Boolean);

    // Recent messages (includes the one we just inserted)
    const { data: recentMsgs } = await db
      .from("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const lastMsgs = (recentMsgs ?? []).reverse().map((m) => ({
      role: String(m?.role ?? "user"),
      content: String(m?.content ?? ""),
    }));

    const emotionalEvent = randomEmotionalEvent();
    const relationshipLevel = updatedState.relationshipLevel ?? 1;
    const levelName = getRelationshipLevelName(relationshipLevel);

    const partnerContext = {
      userName: safeUserName,
      partnerName: safePartnerName,
      personalityType:
        (partner?.personality_type && typeof partner.personality_type === "string")
          ? partner.personality_type
          : "romantic",
      intensityLevel:
        (partner?.intensity_level && typeof partner.intensity_level === "string")
          ? partner.intensity_level
          : "medium",
      relationshipLevel: levelName,
    };

    let reply: string;
    try {
      reply = await generateReply(
        message,
        updatedState,
        lastMsgs,
        partnerContext,
        memories,
        emotionalEvent
      );
    } catch (openaiError) {
      console.error("OpenAI error:", openaiError);
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    if (!reply || typeof reply !== "string") {
      reply = FALLBACK_REPLY;
    }

    await db.from("messages").insert({
      user_id: user.id,
      role: "ai",
      content: reply,
    });

    await db.from("relationship_state").upsert(
      {
        user_id: user.id,
        attachment: updatedState.attachment,
        trust: updatedState.trust,
        tension: updatedState.tension,
        affection: updatedState.affection,
        jealousy: updatedState.jealousy,
        distance: updatedState.distance,
        playfulness: updatedState.playfulness,
        emotional_state: updatedState.emotionalState,
        relationship_level: relationshipLevel,
        last_interaction: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ reply });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Chat API error:", err.message);
    const msg = err.message.toLowerCase();
    const isKeyMissing = msg.includes("openai_api_key") || msg.includes("api key");
    const isAuth = msg.includes("401") || msg.includes("invalid") || msg.includes("incorrect");
    const isPlaceholder = msg.includes("reemplaz");
    let reply = ERROR_REPLY;
    if (isPlaceholder || isKeyMissing) {
      reply = "Configura OPENAI_API_KEY en .env.local";
    } else if (isAuth) {
      reply = "API key de OpenAI inválida. Verifica en platform.openai.com";
    }
    return NextResponse.json({ reply });
  }
}
