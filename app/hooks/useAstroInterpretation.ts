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
  // The model sometimes prepends a "# <title>" line before the five "## "
  // sections — strip it so it isn't mistaken for the first section's content.
  const withoutTitle = text.replace(/^#\s+[^\n]*\n+/, "");
  const parts = withoutTitle.split(/^##\s+/m).filter((s) => s.trim());
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
  streamingText: string;
}

export function useAstroInterpretation(payload: AstroConsultationPayload | null, focusIndex: number, data: FullAstroCalculation | null): AstroInterpretationResult {
  const [aiSections, setAiSections] = useState<{ title: string; text: string }[] | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    if (!payload || !data) {
      setAiSections(null);
      setStreamingText("");
      return;
    }
    let cancelled = false;

    async function fetchInterpretation() {
      setIsLoading(true);
      setUsedFallback(false);
      setStreamingText("");
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
          buffer = events.pop() ?? "";
          for (const raw of events) {
            const line = raw.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            let evt: { text?: string; done?: boolean };
            try {
              evt = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (evt.text) {
              full += evt.text;
              if (!cancelled) setStreamingText(full);
            }
          }
        }

        const sections = parseAstroSections(full);
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

  if (!payload || !data) return { interpretation: null, isLoading, usedFallback, streamingText };

  const deterministic = createAstroInterpretation(payload, focusIndex, data);

  if (aiSections && aiSections.length >= 5) {
    const [origin, ...rest] = aiSections;
    const trend = rest.pop()!;
    return {
      interpretation: { ...deterministic, summary: origin.text, sections: rest, guidance: trend.text },
      isLoading,
      usedFallback: false,
      streamingText,
    };
  }

  return { interpretation: deterministic, isLoading, usedFallback, streamingText };
}
