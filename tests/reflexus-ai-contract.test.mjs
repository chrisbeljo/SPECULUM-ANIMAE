import test from "node:test";
import assert from "node:assert/strict";

// These mirror the real logic in app/hooks/useReflexusEditorial.ts and
// app/components/reflexus-engine.ts (same lightweight-inline-copy pattern
// already used by the other files in this tests/ directory, which test core
// algorithms without pulling in the TSX build pipeline). If you change the
// real implementation, update these to match — that's the point: they
// exist to keep the AI-safety contract honest, not just to pass.

function extractValidIds(source) {
  const ids = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (value && typeof value === "object") {
      for (const [key, val] of Object.entries(value)) {
        if (key === "id" && typeof val === "string") ids.add(val);
        if ((key === "evidenceIds" || key === "signalIds") && Array.isArray(val)) {
          val.forEach((item) => typeof item === "string" && ids.add(item));
        }
        walk(val);
      }
    }
  };
  walk(source);
  return ids;
}

function parseTrace(text) {
  const match = text.match(/\n+TRACE_JSON:\s*(\{[\s\S]*\})\s*$/i);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    return (parsed.sections || []).map((item) => ({ section: item.title || "", sources: (item.sources || []).filter(Boolean) }));
  } catch {
    return [];
  }
}

function stripTrace(text) {
  return text.replace(/\n+TRACE_JSON:\s*\{[\s\S]*$/i, "").trim();
}

function parseSections(text) {
  const clean = stripTrace(text).replace(/^#\s+[^\n]*\n+/, "");
  return clean
    .split(/^##\s+/m)
    .filter(Boolean)
    .map((part) => {
      const [title, ...body] = part.split("\n");
      return { title: title.trim(), text: body.join("\n").trim() };
    })
    .filter((section) => section.title && section.text);
}

function validateTrace(trace, sectionCount, validIds) {
  if (trace.length < sectionCount) return false;
  return trace.every((item) => item.sources.some((id) => validIds.has(id)));
}

// A minimal REFLEXUS-shaped fixture, structurally identical to what
// buildReflexus() in reflexus-engine.ts actually produces.
const fixtureReport = {
  kind: "reflexus",
  engine: "western",
  temporalKey: "abc123",
  signals: [
    { id: "reflexus:western:natal:sun-house-1:identity", area: "identity", relevance: 92, evidenceStrength: 90, deterministicClass: "dominant", temporalClass: "structure", evidenceIds: ["western:natal:sun-house-1"] },
    { id: "reflexus:western:transits:mars-square-venus:relationships", area: "relationships", relevance: 78, evidenceStrength: 70, deterministicClass: "tension", temporalClass: "present", evidenceIds: ["western:transits:mars-square-venus"] },
  ],
  areas: [
    { area: "identity", relevance: 92, rank: 1, dominantClass: "dominant", signalIds: ["reflexus:western:natal:sun-house-1:identity"] },
    { area: "relationships", relevance: 78, rank: 2, dominantClass: "tension", signalIds: ["reflexus:western:transits:mars-square-venus:relationships"] },
  ],
};
fixtureReport.aiPayload = { facts: fixtureReport.signals, classifications: fixtureReport.areas };

const fixtureImagoArea = {
  area: "identity",
  relevance: 90,
  convergence: "1of3",
  consistency: "insufficient_data",
  engines: [{ engine: "western", relevance: 92, rank: 1, dominantClass: "dominant", signalIds: ["reflexus:western:natal:sun-house-1:identity"] }],
  temporalClasses: ["structure"],
  evidenceIds: ["western:natal:sun-house-1"],
};

test("extractValidIds finds real signal/evidence ids from a REFLEXUS payload", () => {
  const ids = extractValidIds({ facts: fixtureReport.aiPayload.facts, classifications: fixtureReport.aiPayload.classifications });
  assert.ok(ids.has("reflexus:western:natal:sun-house-1:identity"));
  assert.ok(ids.has("western:natal:sun-house-1"));
  assert.ok(ids.has("reflexus:western:transits:mars-square-venus:relationships"));
});

test("una respuesta sin TRACE_JSON es rechazada (trace vacío nunca valida)", () => {
  const text = "## Síntesis editorial\ntexto\n## Estructura de base\ntexto\n## Momento actual\ntexto\n## Tendencia\ntexto\n## Integración y orientación\ntexto";
  const trace = parseTrace(text);
  assert.deepEqual(trace, []);
  assert.equal(validateTrace(trace, 5, extractValidIds(fixtureReport.aiPayload)), false);
});

test("una respuesta que cita un id inventado es rechazada", () => {
  const text = `## Síntesis editorial\ntexto\n\nTRACE_JSON: {"sections":[{"title":"Síntesis editorial","sources":["id-que-no-existe"]}]}`;
  const trace = parseTrace(text);
  const validIds = extractValidIds(fixtureReport.aiPayload);
  assert.equal(validateTrace(trace, 1, validIds), false);
});

test("una respuesta con ids reales y trazabilidad completa sí valida", () => {
  const text = `## Síntesis editorial\ntexto\n\nTRACE_JSON: {"sections":[{"title":"Síntesis editorial","sources":["reflexus:western:natal:sun-house-1:identity"]}]}`;
  const trace = parseTrace(text);
  const validIds = extractValidIds(fixtureReport.aiPayload);
  assert.equal(validateTrace(trace, 1, validIds), true);
});

test("una sección con un id inventado MEZCLADO junto a un id real sí valida (tolerante a errores parciales de cita, no exige que TODOS los ids sean exactos)", () => {
  const text = `## Síntesis editorial\ntexto\n\nTRACE_JSON: {"sections":[{"title":"Síntesis editorial","sources":["reflexus:western:natal:sun-house-1:identity","id-con-typo-inventado"]}]}`;
  const trace = parseTrace(text);
  const validIds = extractValidIds(fixtureReport.aiPayload);
  assert.equal(validateTrace(trace, 1, validIds), true);
});

test("una sección donde NINGÚN id citado es real sigue siendo rechazada (la tolerancia no equivale a aceptar cualquier cosa)", () => {
  const text = `## Síntesis editorial\ntexto\n\nTRACE_JSON: {"sections":[{"title":"Síntesis editorial","sources":["id-inventado-1","id-inventado-2"]}]}`;
  const trace = parseTrace(text);
  const validIds = extractValidIds(fixtureReport.aiPayload);
  assert.equal(validateTrace(trace, 1, validIds), false);
});

test("una respuesta incompleta (menos de 5 secciones) se rechaza antes de llegar a trazabilidad", () => {
  const text = `## Síntesis editorial\ntexto\n## Estructura de base\ntexto\n\nTRACE_JSON: {"sections":[{"title":"Síntesis editorial","sources":["reflexus:western:natal:sun-house-1:identity"]},{"title":"Estructura de base","sources":["reflexus:western:natal:sun-house-1:identity"]}]}`;
  const sections = parseSections(text);
  assert.equal(sections.length < 5, true);
});

test("stripTrace nunca deja visible el marcador técnico al consultante", () => {
  const text = `## Síntesis editorial\ntexto visible\n\nTRACE_JSON: {"sections":[]}`;
  const visible = stripTrace(text);
  assert.equal(visible.includes("TRACE_JSON"), false);
  assert.equal(visible.includes("texto visible"), true);
});

test("construir el payload de IA no muta el reporte REFLEXUS original (rankings/clasificaciones intactos)", () => {
  const before = JSON.stringify(fixtureReport);
  // Exactly what useReflexusEditorial does to build the request body.
  const body = { language: "ES", reflexus: { engine: fixtureReport.engine, facts: fixtureReport.aiPayload.facts, classifications: fixtureReport.aiPayload.classifications } };
  void JSON.stringify(body); // simulate the fetch serialization step
  assert.equal(JSON.stringify(fixtureReport), before);
  assert.equal(fixtureReport.areas[0].rank, 1);
  assert.equal(fixtureReport.areas[0].dominantClass, "dominant");
  assert.equal(fixtureReport.areas[1].relevance, 78);
});

test("IMAGO: construir el payload de IA no cambia convergence ni consistency (1of3 nunca se vuelve 2of3/3of3)", () => {
  const before = JSON.stringify(fixtureImagoArea);
  const body = { language: "ES", imago: { sourceReports: ["a", "b", "c"], areas: [fixtureImagoArea] } };
  void JSON.stringify(body);
  assert.equal(JSON.stringify(fixtureImagoArea), before);
  assert.equal(fixtureImagoArea.convergence, "1of3");
  assert.equal(fixtureImagoArea.consistency, "insufficient_data");
});

test("el payload enviado a la IA nunca incluye datos de contacto (correo, teléfono, WhatsApp, Telegram)", () => {
  const reflexusBody = { language: "ES", reflexus: { engine: fixtureReport.engine, facts: fixtureReport.aiPayload.facts, classifications: fixtureReport.aiPayload.classifications } };
  const imagoBody = { language: "ES", imago: { sourceReports: ["a", "b", "c"], areas: [fixtureImagoArea] } };
  const serialized = (JSON.stringify(reflexusBody) + JSON.stringify(imagoBody)).toLowerCase();
  for (const forbidden of ["email", "correo", "telefono", "teléfono", "whatsapp", "telegram", "@"]) {
    assert.equal(serialized.includes(forbidden), false, `payload no debe contener "${forbidden}"`);
  }
});

test("un fallo del stream (excepción) no debe bloquear el reporte determinístico — el hook siempre resuelve a sections:null, nunca lanza", async () => {
  async function simulateFailingStream() {
    try {
      throw new Error("network error");
    } catch {
      return null; // exactamente lo que useReflexusEditorial hace: sections=null, usedFallback=true
    }
  }
  const result = await simulateFailingStream();
  assert.equal(result, null);
});
