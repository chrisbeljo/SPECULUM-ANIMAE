/**
 * useAIInterpretation
 * Hook universal para todas las disciplinas (Tarot, Oráculos, Runas, I Ching)
 * Llama a /api/interpretar con la disciplina especificada
 *
 * USO:
 *   const { interpretation, isLoading, error } = useAIInterpretation({
 *     discipline: "tarot" | "oracle-zen" | "oracle-angels" | "oracle-animals" | "runes" | "iching",
 *     spread: "nombre de la tirada",
 *     cards: [...],
 *     question: "pregunta opcional"
 *   });
 */

import { useEffect, useState } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Discipline = "tarot" | "oracle-zen" | "oracle-angels" | "oracle-animals" | "runes" | "iching" | "radiestesia";

export interface AICard {
  num?: number;
  label: string;
  card: string;
  reversed?: boolean;
}

export interface AIInterpretationRequest {
  discipline: Discipline;
  spread: string;
  cards: AICard[];
  question?: string;
  analysis?: Record<string, unknown>;
}

export interface AIInterpretationResult {
  interpretation: string | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Constante de endpoint ────────────────────────────────────────────────────

const ENDPOINT = "https://site-creator-vinext-starter.speculum-animae.workers.dev/api/interpretar";

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useAIInterpretation(request: AIInterpretationRequest): AIInterpretationResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { discipline, spread, cards, question } = request;
  const cardKey = cards.map(c => `${c.card}-${c.reversed}`).join("|");

  useEffect(() => {
    console.log("🎯 useAIInterpretation fired:", { discipline, spread, cardKey, cardsLength: cards.length });
    if (!spread || spread.trim().length === 0 || cards.length === 0) {
      console.log("⚠️  Early return: spread or cards empty");
      return;
    }

    let cancelled = false;

    async function fetchInterpretation() {
      setIsLoading(true);
      setError(null);
      setInterpretation(null);

      try {
        console.log("📡 Fetching from:", ENDPOINT);
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discipline,
            spread,
            question: question || "",
            cards,
          }),
        });

        console.log("📡 Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as { interpretation: string };
        console.log("📡 Interpretation received:", data.interpretation?.slice(0, 100));

        if (!cancelled) {
          setInterpretation(data.interpretation);
        }
      } catch (err) {
        console.error("❌ Error:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    console.log("🚀 About to call fetchInterpretation, cancelled:", cancelled);
    fetchInterpretation();
    console.log("🚀 fetchInterpretation called");

    return () => {
      cancelled = true;
    };
  }, [discipline, spread, cardKey, question]);

  return { interpretation, isLoading, error };
}

// ─── Función helper: convierte cartas al formato del API ─────────────────────

export function toAICards(
  positions: string[],
  cards: { name: string; isReversed: boolean }[]
): AICard[] {
  return positions.map((label, index) => ({
    num: index + 1,
    label,
    card: cards[index]?.name ?? "",
    reversed: cards[index]?.isReversed ?? false,
  }));
}
