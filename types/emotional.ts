export type EmotionalState =
  | "connected"
  | "distant"
  | "jealous"
  | "vulnerable"
  | "passionate";

export type RelationshipLevel = 1 | 2 | 3 | 4 | 5;

export interface RelationshipState {
  attachment: number;
  trust: number;
  tension: number;
  affection: number;
  jealousy: number;
  distance: number;
  playfulness: number;
  relationshipLevel?: number;
  emotionalState: EmotionalState;
}

export type EmotionalEvent =
  | "vulnerability"
  | "nostalgia"
  | "playful_teasing"
  | "insecurity"
  | null;
