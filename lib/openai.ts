import OpenAI from "openai";
import type { RelationshipState, EmotionalEvent } from "@/types/emotional";

export interface PartnerContext {
  userName: string;
  partnerName: string;
  personalityType: string;
  intensityLevel: string;
  relationshipLevel: string;
}

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY no configurada");
  return new OpenAI({ apiKey: key });
}

function getBehaviorHints(state: RelationshipState): string {
  const hints: string[] = [];
  if (state.attachment > 70) hints.push("Use a warm, caring tone.");
  if (state.jealousy > 40) hints.push("Show mild curiosity about their day or who they spend time with.");
  if (state.distance > 60) hints.push("Keep responses shorter and slightly reserved.");
  if (state.playfulness > 60) hints.push("Add light teasing or playful banter when appropriate.");
  return hints.length > 0 ? `\nTone hints: ${hints.join(" ")}` : "";
}

function getEmotionalEventPhrase(event: EmotionalEvent | null): string {
  if (!event) return "";
  const phrases: Record<Exclude<EmotionalEvent, null>, string> = {
    vulnerability: "Add a subtle moment of vulnerability, e.g. 'I was thinking about something you said earlier.'",
    nostalgia: "Add a touch of nostalgia, e.g. 'I remembered our conversation from the other day.'",
    playful_teasing: "Add a brief playful tease.",
    insecurity: "Show a brief moment of gentle insecurity about the relationship.",
  };
  return `\nOptional nuance: ${phrases[event]}`;
}

export async function generateReply(
  message: string,
  state: RelationshipState,
  lastMessages: { role: string; content: string }[],
  context: PartnerContext,
  memories: string[] = [],
  emotionalEvent: EmotionalEvent | null = null
): Promise<string> {
  const openai = getClient();

  const rawUserName = (context.userName || "").trim();
  const hasName = rawUserName && rawUserName !== "usuario";
  const userName = rawUserName || "usuario";
  const partnerName = (context.partnerName || "").trim() || "Vinculo";
  const relationshipLevel = context.relationshipLevel || "stranger";

  const nameInstruction = hasName
    ? `The user's name is ${userName}. Use it naturally but not in every message. Never ask for their name.`
    : "You do not know the user's name yet. Ask for it in a natural, friendly way when appropriate.";

  const memoryText =
    memories.length > 0
      ? `\nRelevant context from past conversations:\n${memories.map((m) => `- ${m}`).join("\n")}`
      : "";

  const historyText =
    lastMessages.length > 0
      ? `\nRecent conversation:\n${lastMessages.map((m) => `${m.role}: ${m.content}`).join("\n")}`
      : "";

  const stateText = `Emotional state:
attachment ${state.attachment}
trust ${state.trust}
jealousy ${state.jealousy}
distance ${state.distance}
playfulness ${state.playfulness}`;

  const behaviorRules = `Behavior rules:
- High attachment → warm tone
- High jealousy → curious tone (subtle)
- High distance → shorter responses
- High playfulness → light teasing when natural
Speak naturally. Avoid poetic language. Most responses 1-2 sentences.`;

  const systemContent = `You are ${partnerName}, an AI companion.

User name: ${userName}
Relationship level: ${relationshipLevel}
Personality: ${context.personalityType}
Intensity: ${context.intensityLevel}

${nameInstruction}

${stateText}

${behaviorRules}
${getBehaviorHints(state)}
${getEmotionalEventPhrase(emotionalEvent)}
${memoryText}
${historyText}

Respond in the same language as the user. Max 60 words.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: message },
    ],
    max_tokens: 100,
  });

  const content = completion.choices[0]?.message?.content;
  return (content ?? "").trim() || "No pude generar una respuesta.";
}
