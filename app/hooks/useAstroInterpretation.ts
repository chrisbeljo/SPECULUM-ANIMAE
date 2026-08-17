/**
 * useAstroInterpretation
 * Sends the already-computed astro calculation (real ephemeris/BaZi/Zi Wei/
 * numerology data — never recomputed or invented by the AI) to Claude for a
 * narrative enrichment of the existing deterministic interpretation.
 * Falls back to createAstroInterpretation() on any failure, so the reading
 * is never blocked by the AI call.
 */

import { useEffect, useState } from "react";
import type { AstroConsultationPayload } from "../components/AstroConsultationFlow";
import type { FullAstroCalculation } from "../components/astro-full-calculations";
import { createAstroInterpretation, type AstroInterpretation } from "../components/astro-interpretation";

const ENDPOINT = "/api/interpretar";

function parseAstroSections(text: string): { title: string; text: string }[] {
  if (!text) return [];
  const parts = text.split(/^#+\s+/m).filter((s) => s.trim());
  return parts
    .map((part) => {
      const lines = part.split("\n");
      const title = lines[0]?.trim() || "";
      const text = lines.slice(1).join("\n").trim();
      return { title, text };
    })
    .filter((s) => s.title || s.text);
}

export interface AstroInterpretationResult {
  interpretation: AstroInterpretation | null;
  isLoading: boolean;
  usedFallback: boolean;
}

export function useAstroInterpretation(payload: AstroConsultationPayload | null, focusIndex: number, data: FullAstroCalculation | null): AstroInterpretationResult {
  const [aiSections, setAiSections] = useState<{ title: string; text: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    if (!payload || !data) {
      setAiSections(null);
      return;
    }
    let cancelled = false;

    async function fetchInterpretation() {
      setIsLoading(true);
      setUsedFallback(false);
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: payload!.language,
            astro: {
              discipline: payload!.discipline,
              focus: payload!.focus,
              data,
              context: { name: payload!.birthName || payload!.name, birthDate: payload!.birthDate, question: payload!.question },
            },
          }),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const json = (await response.json()) as { interpretation: string };
        const sections = parseAstroSections(json.interpretation);
        if (!cancelled) {
          if (sections.length >= 5) setAiSections(sections);
          else {
            setUsedFallback(true);
            setAiSections(null);
          }
        }
      } catch {
        if (!cancelled) {
          setUsedFallback(true);
          setAiSections(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchInterpretation();
    return () => {
      cancelled = true;
    };
  }, [payload?.discipline, payload?.focus, payload?.language, data]);

  if (!payload || !data) return { interpretation: null, isLoading, usedFallback };

  const deterministic = createAstroInterpretation(payload, focusIndex, data);

  if (aiSections && aiSections.length >= 5) {
    const [origin, ...rest] = aiSections;
    const trend = rest.pop()!;
    return {
      interpretation: { ...deterministic, summary: origin.text, sections: rest, guidance: trend.text },
      isLoading,
      usedFallback: false,
    };
  }

  return { interpretation: deterministic, isLoading, usedFallback };
}
