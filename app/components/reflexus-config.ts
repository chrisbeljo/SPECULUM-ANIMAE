import type { AstroDiscipline } from "./AstroConsultationFlow";

export const REFLEXUS_ENGINE_VERSION = "1.0.0";
export const REFLEXUS_RULES_VERSION = "2026-08-17.2";

export const reflexusAreas = [
  "identity",
  "emotions",
  "relationships",
  "vocation",
  "resources",
  "health",
  "family",
  "learning",
  "spirituality",
  "transformation",
  "direction",
] as const;

export type ReflexusArea = (typeof reflexusAreas)[number];

export const westernHouseAreas: Record<number, ReflexusArea> = {
  1: "identity", 2: "resources", 3: "learning", 4: "family", 5: "transformation",
  6: "health", 7: "relationships", 8: "transformation", 9: "spirituality",
  10: "vocation", 11: "direction", 12: "emotions",
};

export const westernPlanetWeights: Record<string, number> = {
  Sun: 92, Moon: 92, Mercury: 76, Venus: 82, Mars: 82, Jupiter: 78,
  Saturn: 84, Uranus: 72, Neptune: 72, Pluto: 74, "North Node": 70,
};

export const westernAspectWeights: Record<string, number> = {
  conjunction: 90, opposition: 86, square: 84, trine: 76, sextile: 68,
};

export const westernSourceWeights = { natal: 1, transits: 1, solar_return: 0.92, horoscope: 0.58 } as const;

export const easternPillarRules: Record<string, { area: ReflexusArea; weight: number }> = {
  year: { area: "family", weight: 72 }, month: { area: "vocation", weight: 82 },
  day: { area: "identity", weight: 96 }, hour: { area: "direction", weight: 78 },
};

export const easternPalaceAreas: Record<string, ReflexusArea> = {
  self: "identity", life: "identity", destiny: "identity", 命宫: "identity",
  siblings: "family", brother: "family", 兄弟宫: "family",
  spouse: "relationships", marriage: "relationships",夫妻宫: "relationships",
  children: "family", 子女宫: "family",
  wealth: "resources", finance: "resources", 财帛宫: "resources",
  health: "health", illness: "health", 疾厄宫: "health",
  travel: "direction", migration: "direction", 迁移宫: "direction",
  friends: "relationships", servants: "relationships", 仆役宫: "relationships", 交友宫: "relationships",
  career: "vocation", official: "vocation", 官禄宫: "vocation",
  property: "resources", estate: "resources", 田宅宫: "resources",
  fortune: "spirituality", happiness: "spirituality", 福德宫: "spirituality",
  parents: "family", 父母宫: "family",
};

export const numerologyRules: Record<string, { areas: ReflexusArea[]; temporal: "structure" | "stage" | "present" | "trend"; weight: number }> = {
  life: { areas: ["identity", "direction"], temporal: "structure", weight: 96 },
  expression: { areas: ["identity", "vocation"], temporal: "structure", weight: 90 },
  soul: { areas: ["emotions", "spirituality"], temporal: "structure", weight: 88 },
  personality: { areas: ["identity", "relationships"], temporal: "structure", weight: 76 },
  maturity: { areas: ["direction", "transformation"], temporal: "trend", weight: 82 },
  birthday: { areas: ["identity", "learning"], temporal: "structure", weight: 68 },
  attitude: { areas: ["relationships", "direction"], temporal: "structure", weight: 66 },
  balance: { areas: ["emotions", "health"], temporal: "structure", weight: 70 },
  hiddenPassion: { areas: ["vocation", "transformation"], temporal: "structure", weight: 72 },
  subconsciousSelf: { areas: ["learning", "health"], temporal: "structure", weight: 64 },
  karmicLessons: { areas: ["learning", "transformation"], temporal: "stage", weight: 78 },
  year: { areas: ["direction", "vocation"], temporal: "present", weight: 94 },
  month: { areas: ["direction", "emotions"], temporal: "present", weight: 82 },
  day: { areas: ["direction"], temporal: "present", weight: 68 },
  pinnacles: { areas: ["direction", "vocation"], temporal: "stage", weight: 84 },
  challenges: { areas: ["learning", "transformation"], temporal: "stage", weight: 82 },
  lifeCycles: { areas: ["direction", "family"], temporal: "stage", weight: 78 },
  karmicDebts: { areas: ["learning", "transformation"], temporal: "trend", weight: 80 },
};

export const reflexusInputReferences: Record<AstroDiscipline, string> = {
  western: "swisseph-browser+placidus-v1",
  eastern: "lunar-javascript+iztro-v1",
  numerology: "pythagorean-reduction-v1",
};
