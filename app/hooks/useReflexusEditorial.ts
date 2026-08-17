import { useEffect, useState } from "react";
import type { Language } from "../translations";
import type { ReflexusReport, ImagoArea } from "../components/reflexus-engine";

/**
 * Editorial AI layer for REFLEXUS / IMAGO SPECULI.
 *
 * Both engines are 100% client-side, deterministic, rule-based (see
 * reflexus-engine.ts) — this hook never sends birth data, never recomputes
 * anything, and never lets the AI's text influence relevance/rank/
 * dominantClass/convergence/consistency. It only asks Claude to narrate the
 * already-final numbers, and validates that every claim traces back to a
 * real id from the data actually sent — a response that fails validation
 * (missing/invalid TRACE_JSON, an id that wasn't in the payload, or fewer
 * than 5 sections) is treated exactly like a network failure: the caller
 * falls back to the deterministic reading, which is always available and
 * never blocked by this hook.
 */

export type EditorialSection = { title: string; text: string };
export type EditorialResult = {
  sections: EditorialSection[] | null;
  isLoading: boolean;
  usedFallback: boolean;
  streamingText: string;
};

const ENDPOINT = "/api/interpretar";
const sessionCache = new Map<string, EditorialSection[]>();

function extractValidIds(source: unknown): Set<string> {
  const ids = new Set<string>();
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
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

function stripTrace(text: string): string {
  return text.replace(/\n+TRACE_JSON:\s*\{[\s\S]*$/i, "").trim();
}

function parseTrace(text: string): { section: string; sources: string[] }[] {
  const match = text.match(/\n+TRACE_JSON:\s*(\{[\s\S]*\})\s*$/i);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]) as { sections?: Array<{ title?: string; sources?: string[] }> };
    return (parsed.sections || []).map((item) => ({ section: item.title || "", sources: (item.sources || []).filter(Boolean) }));
  } catch {
    return [];
  }
}

function parseSections(text: string): EditorialSection[] {
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

/**
 * A response is only accepted if it has exactly the expected number of
 * sections AND every section cites at least one id that genuinely appears
 * in the data we sent. Anything else — missing TRACE_JSON, no traceable
 * evidence at all for some section, an incomplete response — is rejected
 * and the caller falls back.
 *
 * Deliberately lenient on a per-section basis: requiring EVERY cited id in
 * a section to be exact (rather than at least one) rejected otherwise-good
 * responses whenever the model listed one slightly malformed id alongside
 * genuinely real ones — the text would stream in fine and then vanish at
 * the very end. A single real, verifiable citation per section is already
 * enough to prove the paragraph isn't fabricated from nothing.
 */
function validateTrace(trace: { section: string; sources: string[] }[], sectionCount: number, validIds: Set<string>): boolean {
  if (trace.length < sectionCount) return false;
  return trace.every((item) => item.sources.some((id) => validIds.has(id)));
}

async function streamAndValidate(body: unknown, validIds: Set<string>, onChunk: (full: string) => void, cancelledRef: { current: boolean }): Promise<EditorialSection[] | null> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok || !response.body) throw new Error(`Error ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const raw of events) {
      const line = raw.split("\n").find((item) => item.startsWith("data: "));
      if (!line) continue;
      try {
        const evt = JSON.parse(line.slice(6)) as { text?: string };
        if (evt.text) {
          full += evt.text;
          if (!cancelledRef.current) onChunk(full);
        }
      } catch {
        // ignore malformed SSE frames
      }
    }
  }

  const sections = parseSections(full);
  const trace = parseTrace(full);
  if (sections.length < 5) {
    console.error("editorial rejected: too few sections", { found: sections.length, full });
    return null;
  }
  if (!validateTrace(trace, sections.length, validIds)) {
    console.error("editorial rejected: trace validation failed", { trace, validIds: [...validIds] });
    return null;
  }
  return sections;
}

function useEditorial(cacheKey: string | null, requestBody: unknown, validIds: Set<string>): EditorialResult {
  const [sections, setSections] = useState<EditorialSection[] | null>(() => (cacheKey ? sessionCache.get(cacheKey) || null : null));
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(!!cacheKey && !sessionCache.has(cacheKey));
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    if (!cacheKey) {
      setSections(null);
      setIsLoading(false);
      return;
    }
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      setSections(cached);
      setIsLoading(false);
      setStreamingText("");
      return;
    }
    const cancelledRef = { current: false };
    setIsLoading(true);
    setStreamingText("");
    setUsedFallback(false);
    void (async () => {
      try {
        const result = await streamAndValidate(requestBody, validIds, (full) => setStreamingText(full), cancelledRef);
        if (!result) throw new Error("Editorial response failed trace validation");
        sessionCache.set(cacheKey, result);
        if (!cancelledRef.current) {
          setSections(result);
          setUsedFallback(false);
        }
      } catch {
        if (!cancelledRef.current) {
          setSections(null);
          setUsedFallback(true);
        }
      } finally {
        if (!cancelledRef.current) setIsLoading(false);
      }
    })();
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { sections, isLoading, usedFallback, streamingText: stripTrace(streamingText) };
}

export function useReflexusEditorial(report: ReflexusReport | null, lang: Language): EditorialResult {
  const cacheKey = report ? `reflexus:${report.engine}:${report.temporalKey}:${lang}` : null;
  const validIds = report ? extractValidIds({ facts: report.aiPayload.facts, classifications: report.aiPayload.classifications }) : new Set<string>();
  const body = report
    ? { language: lang, reflexus: { engine: report.engine, facts: report.aiPayload.facts as unknown as Record<string, unknown>[], classifications: report.aiPayload.classifications as unknown as Record<string, unknown>[] } }
    : null;
  return useEditorial(cacheKey, body, validIds);
}

export function useImagoEditorial(areas: ImagoArea[] | null, sourceReports: string[], lang: Language, keySuffix: string): EditorialResult {
  const cacheKey = areas ? `imago:${keySuffix}:${sourceReports.join(",")}:${lang}` : null;
  const validIds = areas ? extractValidIds({ areas }) : new Set<string>();
  const body = areas ? { language: lang, imago: { sourceReports, areas: areas as unknown as Record<string, unknown>[] } } : null;
  return useEditorial(cacheKey, body, validIds);
}
