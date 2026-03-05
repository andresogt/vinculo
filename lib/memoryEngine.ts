const EMOTIONAL_CONTEXT_PATTERNS = [
  "tuve un día horrible", "fue un día malo", "estoy triste", "me siento mal",
  "fue increíble", "me pasó algo", "te cuento", "pasó que",
  "me dijeron", "lo que pasó", "emocionado", "preocupado",
  "cansado", "solo", "sola", "feliz", "enojado",
];

const WEIGHT_BY_PATTERN: Record<string, number> = {
  "tuve un día horrible": 8,
  "fue un día malo": 7,
  "estoy triste": 6,
  "me siento mal": 6,
  "fue increíble": 7,
  "me pasó algo": 5,
  "te cuento": 5,
  "pasó que": 5,
};

export function shouldStoreMemory(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return EMOTIONAL_CONTEXT_PATTERNS.some((p) => lower.includes(p));
}

export function getEmotionalWeight(message: string): number {
  const lower = message.toLowerCase().trim();
  for (const [pattern, weight] of Object.entries(WEIGHT_BY_PATTERN)) {
    if (lower.includes(pattern)) return weight;
  }
  return 5;
}
