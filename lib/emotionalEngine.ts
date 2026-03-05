import type { RelationshipState, EmotionalEvent } from "@/types/emotional";

export type DetectedEmotion = "affection" | "sadness" | "conflict" | "jealousy" | null;

const AFFECTION_TRIGGERS = [
  "te quiero", "me gustas", "me importas",
  "te amo", "te extraño", "eres especial",
];

const SADNESS_TRIGGERS = [
  "triste", "mal día", "cansado", "solo", "sola",
  "horrible", "malo", "fue difícil", "pasó que",
];

const CONFLICT_TRIGGERS = [
  "no me gusta", "me molestó", "estoy enojado", "enojada",
  "me enoja", "odio", "basta", "déjame",
];

const JEALOUSY_TRIGGERS = [
  "otra chica", "otro chico", "otra persona",
  "un amigo", "una amiga", "él", "ella",
];

const EMOTIONAL_EVENTS: Exclude<EmotionalEvent, null>[] = [
  "vulnerability",
  "nostalgia",
  "playful_teasing",
  "insecurity",
];

const RELATIONSHIP_LEVEL_NAMES: Record<number, string> = {
  1: "stranger",
  2: "friendly",
  3: "close",
  4: "intimate",
  5: "deep bond",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function createDefaultState(): RelationshipState {
  return {
    attachment: 50,
    trust: 50,
    tension: 20,
    affection: 50,
    jealousy: 10,
    distance: 5,
    playfulness: 60,
    relationshipLevel: 1,
    emotionalState: "connected",
  };
}

export const getDefaultState = createDefaultState;

export function detectEmotion(message: string): DetectedEmotion {
  const msg = message.toLowerCase().trim();

  for (const t of AFFECTION_TRIGGERS) {
    if (msg.includes(t)) return "affection";
  }
  for (const t of SADNESS_TRIGGERS) {
    if (msg.includes(t)) return "sadness";
  }
  for (const t of CONFLICT_TRIGGERS) {
    if (msg.includes(t)) return "conflict";
  }
  for (const t of JEALOUSY_TRIGGERS) {
    if (msg.includes(t)) return "jealousy";
  }

  return null;
}

export function updateState(
  state: RelationshipState,
  message: string,
  hoursSinceLastMessage?: number
): RelationshipState {
  const emotion = detectEmotion(message);
  let updated = updateEmotionalState(state, emotion);

  if (hoursSinceLastMessage !== undefined && hoursSinceLastMessage >= 8) {
    updated = {
      ...updated,
      distance: clamp(updated.distance + 15),
      affection: clamp(updated.affection - 5),
    };
  }

  return updated;
}

function updateEmotionalState(
  state: RelationshipState,
  emotion: DetectedEmotion
): RelationshipState {
  const def = createDefaultState();
  let {
    attachment = def.attachment,
    trust = def.trust,
    affection = def.affection,
    jealousy = def.jealousy,
    distance = def.distance,
    playfulness = def.playfulness,
    relationshipLevel = def.relationshipLevel ?? 1,
  } = state;

  if (emotion === "affection") {
    attachment = clamp(attachment + 5);
    trust = clamp(trust + 3);
  } else if (emotion === "sadness") {
    attachment = clamp(attachment + 3);
  } else if (emotion === "conflict") {
    trust = clamp(trust - 5);
    distance = clamp(distance + 6);
  } else if (emotion === "jealousy") {
    jealousy = clamp(jealousy + 7);
  }

  // Relationship level logic
  if (attachment > 70 && trust > 70) {
    relationshipLevel = Math.min(5, (relationshipLevel ?? 1) + 1);
  } else if (distance > 70) {
    relationshipLevel = Math.max(1, (relationshipLevel ?? 1) - 1);
  }

  let emotionalState = state.emotionalState ?? "connected";
  if (distance > 60) emotionalState = "distant";
  else if (affection > 70 || attachment > 70) emotionalState = "passionate";
  else if (trust < 30) emotionalState = "vulnerable";
  else if (jealousy > 40 && affection > 50) emotionalState = "jealous";

  return {
    ...state,
    attachment,
    trust,
    tension: state.tension ?? 20,
    affection,
    jealousy,
    distance,
    playfulness,
    relationshipLevel: relationshipLevel ?? 1,
    emotionalState,
  };
}

export function randomEmotionalEvent(): EmotionalEvent | null {
  if (Math.random() < 0.10) {
    return EMOTIONAL_EVENTS[Math.floor(Math.random() * EMOTIONAL_EVENTS.length)];
  }
  return null;
}

export function getRelationshipLevelName(level: number): string {
  return RELATIONSHIP_LEVEL_NAMES[level] ?? "stranger";
}
