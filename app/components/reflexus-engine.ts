import type { AstroConsultationPayload, AstroDiscipline } from "./AstroConsultationFlow";
import type { Aspect, FullAstroCalculation, PlanetPosition } from "./astro-full-calculations";
import {
  REFLEXUS_ENGINE_VERSION, REFLEXUS_RULES_VERSION, easternPalaceAreas, easternPillarRules,
  numerologyRules, reflexusAreas, reflexusInputReferences, westernAspectWeights,
  westernHouseAreas, westernPlanetWeights, westernSourceWeights, type ReflexusArea,
} from "./reflexus-config";

export type ReflexusTemporalClass = "structure" | "balance" | "stage" | "present" | "current_cycle" | "trend";
export type ReflexusDeterministicClass = "dominant" | "supporting" | "tension" | "neutral" | "unclassified";
export type ReflexusSignal = {
  id: string;
  engine: AstroDiscipline;
  source: string;
  area: ReflexusArea;
  temporalClass: ReflexusTemporalClass;
  relevance: number;
  evidenceStrength: number;
  deterministicClass: ReflexusDeterministicClass;
  referenceDate: string;
  validFrom?: string;
  validTo?: string;
  evidenceIds: string[];
  label: string;
  rawData: Record<string, unknown>;
};

export type ReflexusAreaResult = {
  area: ReflexusArea;
  relevance: number;
  evidenceStrength: number;
  rank: number;
  dominantClass: ReflexusDeterministicClass;
  temporalClasses: ReflexusTemporalClass[];
  signalIds: string[];
};

export type ReflexusReport = {
  kind: "reflexus";
  engine: AstroDiscipline;
  engineVersion: string;
  rulesVersion: string;
  inputReferenceVersion: string;
  calculatedAt: string;
  referenceDate: string;
  timezone: string;
  structuralKey: string;
  temporalKey: string;
  signals: ReflexusSignal[];
  areas: ReflexusAreaResult[];
  aiPayload: { facts: ReflexusSignal[]; classifications: ReflexusAreaResult[] };
};

export type ImagoConsistency = "aligned" | "complementary" | "mixed" | "divergent" | "insufficient_data";
export type ImagoArea = {
  area: ReflexusArea;
  relevance: number;
  convergence: "1of3" | "2of3" | "3of3";
  consistency: ImagoConsistency;
  engines: { engine: AstroDiscipline; relevance: number; rank: number; dominantClass: ReflexusDeterministicClass; signalIds: string[] }[];
  temporalClasses: ReflexusTemporalClass[];
  evidenceIds: string[];
};
export type ImagoReport = {
  kind: "imago_speculi";
  engineVersion: string;
  rulesVersion: string;
  calculatedAt: string;
  referenceDate: string;
  timezone: string;
  sourceKeys: Record<AstroDiscipline, string>;
  areas: ImagoArea[];
  aiPayload: { sourceReports: string[]; areas: ImagoArea[] };
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function stableHash(value: string) { let hash = 2166136261; for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(36); }
const signalId = (engine: AstroDiscipline, source: string, evidence: string, area: ReflexusArea) => `reflexus:${engine}:${slug(source)}:${slug(evidence)}:${area}`;

function classifyAspect(type: string): ReflexusDeterministicClass {
  if (["trine", "sextile"].includes(type)) return "supporting";
  if (["square", "opposition"].includes(type)) return "tension";
  if (type === "conjunction") return "dominant";
  return "unclassified";
}

function makeSignal(input: Omit<ReflexusSignal, "id" | "relevance" | "evidenceStrength"> & { evidence: string; relevance: number; evidenceStrength?: number }): ReflexusSignal {
  const { evidence, relevance, evidenceStrength = relevance, ...rest } = input;
  return { ...rest, id: signalId(input.engine, input.source, evidence, input.area), relevance: clamp(relevance), evidenceStrength: clamp(evidenceStrength) };
}

function planetSignals(engine: AstroDiscipline, source: string, temporalClass: ReflexusTemporalClass, planets: PlanetPosition[], referenceDate: string, factor: number) {
  return planets.map(planet => {
    const area = westernHouseAreas[planet.house] || "identity";
    const angular = [1, 4, 7, 10].includes(planet.house) ? 8 : 0;
    const relevance = (westernPlanetWeights[planet.name] || 55) * factor + angular;
    const evidence = `${planet.name}-house-${planet.house}`;
    return makeSignal({ engine, source, area, temporalClass, relevance, deterministicClass: relevance >= 88 ? "dominant" : "neutral", referenceDate, evidence, evidenceIds: [`western:${source}:${slug(evidence)}`], label: `${planet.name} · house ${planet.house} · ${planet.degree.toFixed(2)}°`, rawData: { ...planet } });
  });
}

function aspectSignals(source: string, temporalClass: ReflexusTemporalClass, aspects: Aspect[], planets: PlanetPosition[], referenceDate: string, factor: number) {
  const byName = new Map(planets.map(planet => [planet.name, planet]));
  return aspects.map(aspect => {
    const target = byName.get(aspect.to) || byName.get(aspect.from);
    const area = westernHouseAreas[target?.house || 1];
    const base = westernAspectWeights[aspect.type] || 45;
    const relevance = (base - Math.min(25, aspect.orb * 4)) * factor;
    const evidence = `${aspect.from}-${aspect.type}-${aspect.to}-${aspect.orb}`;
    return makeSignal({ engine: "western", source, area, temporalClass, relevance, evidenceStrength: base - Math.min(35, aspect.orb * 5), deterministicClass: classifyAspect(aspect.type), referenceDate, evidence, evidenceIds: [`western:${source}:${slug(evidence)}`], label: `${aspect.from} ${aspect.type} ${aspect.to} · orb ${aspect.orb.toFixed(2)}°`, rawData: { ...aspect, applyingStatus: "unclassified" } });
  });
}

function westernSignals(data: FullAstroCalculation, referenceDate: string): ReflexusSignal[] {
  if (!data.western) return [];
  const chart = data.western;
  const signals = [
    ...planetSignals("western", "natal", "structure", chart.planets, referenceDate, westernSourceWeights.natal),
    ...aspectSignals("natal", "structure", chart.aspects, chart.planets, referenceDate, westernSourceWeights.natal),
    ...planetSignals("western", "transits", "present", chart.transits, referenceDate, 0.76),
    ...aspectSignals("transits", "present", chart.transitAspects, chart.planets, referenceDate, westernSourceWeights.transits),
    ...planetSignals("western", "solar_return", "trend", chart.solarReturnPlanets, referenceDate, westernSourceWeights.solar_return),
    ...aspectSignals("solar_return", "trend", chart.solarReturnAspects, chart.solarReturnPlanets, referenceDate, westernSourceWeights.solar_return),
  ];
  const sun = chart.planets.find(planet => planet.name === "Sun");
  if (sun) signals.push(makeSignal({ engine: "western", source: "horoscope", area: "direction", temporalClass: "trend", relevance: 58, evidenceStrength: 45, deterministicClass: "neutral", referenceDate, evidence: `sun-sign-${sun.sign}`, evidenceIds: [`western:horoscope:sun-sign-${sun.sign}`], label: `Solar sign index ${sun.sign}`, rawData: { sign: sun.sign, longitude: sun.longitude } }));
  return signals;
}

function resolvePalaceArea(name: string): ReflexusArea | null {
  const normalized = name.toLowerCase();
  const key = Object.keys(easternPalaceAreas).find(item => normalized.includes(item.toLowerCase()));
  return key ? easternPalaceAreas[key] : null;
}

function easternSignals(data: FullAstroCalculation, referenceDate: string): ReflexusSignal[] {
  const signals: ReflexusSignal[] = [];
  data.bazi?.pillars.forEach(pillar => {
    const rule = easternPillarRules[pillar.key];
    const evidence = `${pillar.key}-${pillar.ganZhi}`;
    signals.push(makeSignal({ engine: "eastern", source: "bazi_pillar", area: rule.area, temporalClass: "structure", relevance: rule.weight, deterministicClass: pillar.key === "day" ? "dominant" : "neutral", referenceDate, evidence, evidenceIds: [`eastern:bazi:${slug(evidence)}`], label: `${pillar.key} · ${pillar.ganZhi} · ${pillar.wuXing}`, rawData: { ...pillar } }));
  });
  if (data.bazi) {
    const entries = Object.entries(data.bazi.elements);
    const max = Math.max(...entries.map(([, count]) => count), 1);
    entries.forEach(([element, count]) => {
      const balanceClass: ReflexusDeterministicClass = count === 0 ? "tension" : count === max ? "dominant" : "neutral";
      const relevance = count === 0 ? 86 : 58 + count * 7;
      signals.push(makeSignal({ engine: "eastern", source: "five_elements", area: count === 0 ? "health" : "identity", temporalClass: "balance", relevance, deterministicClass: balanceClass, referenceDate, evidence: `${element}-${count}`, evidenceIds: [`eastern:elements:${slug(element)}:${count}`], label: `${element} · ${count}`, rawData: { element, count, total: entries.reduce((sum, [, value]) => sum + value, 0) } }));
    });
    if (data.bazi.currentLuck) {
      const cycle = data.bazi.currentLuck;
      signals.push(makeSignal({ engine: "eastern", source: "bazi_luck_cycle", area: "direction", temporalClass: "current_cycle", relevance: 92, deterministicClass: "dominant", referenceDate, validFrom: String(cycle.startYear), validTo: String(cycle.endYear), evidence: `${cycle.ganZhi}-${cycle.startYear}-${cycle.endYear}`, evidenceIds: [`eastern:luck:${slug(cycle.ganZhi)}:${cycle.startYear}`], label: `${cycle.ganZhi} · ${cycle.startYear}–${cycle.endYear}`, rawData: { ...cycle } }));
      const nextCycle = data.bazi.luckCycles.find(item => item.startYear > cycle.endYear);
      if (nextCycle) signals.push(makeSignal({ engine: "eastern", source: "bazi_next_luck_cycle", area: "direction", temporalClass: "trend", relevance: 78, deterministicClass: "neutral", referenceDate, validFrom: String(nextCycle.startYear), validTo: String(nextCycle.endYear), evidence: `${nextCycle.ganZhi}-${nextCycle.startYear}-${nextCycle.endYear}`, evidenceIds: [`eastern:luck:next:${slug(nextCycle.ganZhi)}:${nextCycle.startYear}`], label: `${nextCycle.ganZhi} · ${nextCycle.startYear}–${nextCycle.endYear}`, rawData: { ...nextCycle } }));
    }
  }
  data.ziwei?.palaces.forEach(palace => {
    const area = resolvePalaceArea(palace.name);
    if (!area) {
      signals.push(makeSignal({ engine: "eastern", source: "ziwei_palace", area: "direction", temporalClass: "structure", relevance: 30, evidenceStrength: 25, deterministicClass: "unclassified", referenceDate, evidence: `${palace.index}-${palace.name}`, evidenceIds: [`eastern:ziwei:palace:${palace.index}`], label: `${palace.name} · unclassified area`, rawData: { ...palace } }));
      return;
    }
    const relevance = 58 + Math.min(32, palace.majorStars.length * 8) + (palace.isBody || palace.isOrigin ? 8 : 0);
    signals.push(makeSignal({ engine: "eastern", source: "ziwei_palace", area, temporalClass: "structure", relevance, deterministicClass: palace.isBody || palace.isOrigin ? "dominant" : "neutral", referenceDate, evidence: `${palace.index}-${palace.name}`, evidenceIds: [`eastern:ziwei:palace:${palace.index}`], label: `${palace.name} · ${palace.majorStars.map(star => star.name).join(", ") || "no major stars"}`, rawData: { ...palace } }));
  });
  if (data.ziwei?.current) {
    for (const [period, palaceName] of [["decadal", data.ziwei.current.decadalPalace], ["yearly", data.ziwei.current.yearlyPalace]] as const) {
      const area = resolvePalaceArea(palaceName) || "direction";
      signals.push(makeSignal({ engine: "eastern", source: `ziwei_${period}`, area, temporalClass: period === "yearly" ? "present" : "current_cycle", relevance: period === "yearly" ? 88 : 84, deterministicClass: "dominant", referenceDate, evidence: palaceName || "unclassified", evidenceIds: [`eastern:ziwei:${period}:${slug(palaceName || "unknown")}`], label: `${period} · ${palaceName || "unclassified"}`, rawData: { palaceName, yearStemBranch: data.ziwei.current.yearStemBranch } }));
    }
  }
  return signals;
}

function numerologySignals(data: FullAstroCalculation, referenceDate: string): ReflexusSignal[] {
  const calculation = data.numerology as unknown as Record<string, unknown>;
  const signals: ReflexusSignal[] = [];
  Object.entries(numerologyRules).forEach(([field, rule]) => {
    const value = calculation[field];
    if (value === undefined) return;
    rule.areas.forEach((area, index) => {
      const serialized = Array.isArray(value) ? value.join("-") : String(value);
      const relevance = rule.weight - index * 6;
      signals.push(makeSignal({ engine: "numerology", source: `numerology_${field}`, area, temporalClass: rule.temporal, relevance, deterministicClass: relevance >= 88 ? "dominant" : "neutral", referenceDate, evidence: `${field}-${serialized}-${index}`, evidenceIds: [`numerology:${field}:${slug(serialized)}`], label: `${field} · ${Array.isArray(value) ? value.join(" · ") : String(value)}`, rawData: { field, value } }));
    });
  });
  return signals;
}

function aggregateAreas(signals: ReflexusSignal[]): ReflexusAreaResult[] {
  const results = reflexusAreas.map(area => {
    const items = signals.filter(signal => signal.area === area);
    const sorted = [...items].sort((a, b) => b.relevance - a.relevance);
    const top = sorted.slice(0, 5);
    const relevance = top.length ? clamp(top.reduce((sum, signal, index) => sum + signal.relevance * (1 / (index + 1)), 0) / top.reduce((sum, _signal, index) => sum + 1 / (index + 1), 0)) : 0;
    const evidenceStrength = top.length ? clamp(top.reduce((sum, signal) => sum + signal.evidenceStrength, 0) / top.length) : 0;
    const counts = top.reduce<Record<string, number>>((acc, signal) => (acc[signal.deterministicClass] = (acc[signal.deterministicClass] || 0) + 1, acc), {});
    const dominantClass = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "unclassified") as ReflexusDeterministicClass;
    return { area, relevance, evidenceStrength, rank: 0, dominantClass, temporalClasses: [...new Set(top.map(signal => signal.temporalClass))], signalIds: top.map(signal => signal.id) };
  }).sort((a, b) => b.relevance - a.relevance);
  return results.map((area, index) => ({ ...area, rank: index + 1 }));
}

export function reflexusKeys(payload: AstroConsultationPayload) {
  const structural = [payload.discipline, payload.birthDate, payload.birthTime, payload.birthPlace, payload.timezone, payload.birthName || payload.name, payload.gender, payload.calendar].join("|");
  const temporal = [structural, payload.targetDate].join("|");
  return { structuralKey: stableHash(structural), temporalKey: stableHash(temporal) };
}

export function buildReflexus(engine: AstroDiscipline, payload: AstroConsultationPayload, data: FullAstroCalculation): ReflexusReport {
  const referenceDate = payload.targetDate || new Date().toISOString().slice(0, 10);
  const signals = engine === "western" ? westernSignals(data, referenceDate) : engine === "eastern" ? easternSignals(data, referenceDate) : numerologySignals(data, referenceDate);
  const areas = aggregateAreas(signals);
  const keys = reflexusKeys(payload);
  return { kind: "reflexus", engine, engineVersion: REFLEXUS_ENGINE_VERSION, rulesVersion: REFLEXUS_RULES_VERSION, inputReferenceVersion: reflexusInputReferences[engine], calculatedAt: new Date().toISOString(), referenceDate, timezone: payload.timezone || "UTC", ...keys, signals, areas, aiPayload: { facts: signals, classifications: areas } };
}

export function buildImago(reports: Record<AstroDiscipline, ReflexusReport>): ImagoReport {
  const areas = reflexusAreas.map(area => {
    const engineAreas = (["western", "eastern", "numerology"] as AstroDiscipline[]).map(engine => ({ engine, ...reports[engine].areas.find(item => item.area === area)! }));
    const prioritized = engineAreas.filter(item => item.rank <= 5 && item.relevance >= 55);
    const convergence = `${Math.max(1, prioritized.length)}of3` as ImagoArea["convergence"];
    const classes = [...new Set(prioritized.map(item => item.dominantClass))];
    const consistency: ImagoConsistency = prioritized.length < 2 ? "insufficient_data" : classes.length === 1 ? "aligned" : classes.includes("tension") && classes.includes("supporting") ? "divergent" : classes.length === 2 ? "complementary" : "mixed";
    const relevance = clamp(engineAreas.reduce((sum, item) => sum + item.relevance, 0) / 3 + (prioritized.length - 1) * 5);
    return { area, relevance, convergence, consistency, engines: engineAreas.map(item => ({ engine: item.engine, relevance: item.relevance, rank: item.rank, dominantClass: item.dominantClass, signalIds: item.signalIds })), temporalClasses: [...new Set(engineAreas.flatMap(item => item.temporalClasses))], evidenceIds: engineAreas.flatMap(item => item.signalIds) };
  }).sort((a, b) => b.relevance - a.relevance);
  const first = reports.western;
  return { kind: "imago_speculi", engineVersion: REFLEXUS_ENGINE_VERSION, rulesVersion: REFLEXUS_RULES_VERSION, calculatedAt: new Date().toISOString(), referenceDate: first.referenceDate, timezone: first.timezone, sourceKeys: { western: reports.western.temporalKey, eastern: reports.eastern.temporalKey, numerology: reports.numerology.temporalKey }, areas, aiPayload: { sourceReports: [reports.western.temporalKey, reports.eastern.temporalKey, reports.numerology.temporalKey], areas } };
}

const cachePrefix = "speculum_reflexus";
export function readReflexusCache(engine: AstroDiscipline, temporalKey: string): ReflexusReport | null { try { const raw = localStorage.getItem(`${cachePrefix}:${engine}:${REFLEXUS_RULES_VERSION}:${temporalKey}`); return raw ? JSON.parse(raw) as ReflexusReport : null; } catch { return null; } }
export function writeReflexusCache(report: ReflexusReport) { try { localStorage.setItem(`${cachePrefix}:${report.engine}:${report.rulesVersion}:${report.temporalKey}`, JSON.stringify(report)); } catch {} }
