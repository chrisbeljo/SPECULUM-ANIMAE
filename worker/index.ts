/** Cloudflare Worker - SPECULUM ANIMAE V2 - Hybrid Approach (Option C) */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
  ANTHROPIC_API_KEY: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface Card {
  num?: number;
  label: string;
  card: string;
  reversed?: boolean;
}

interface InterpretRequest {
  discipline?: "tarot" | "oracle-zen" | "oracle-angels" | "oracle-animals" | "runes" | "iching" | "radiestesia";
  spread: string;
  question?: string;
  cards: Card[];
  language?: "ES" | "EN" | "FR" | "DE" | "PT";
  analysis?: Record<string, unknown>;
}

// ─── Language Configuration ────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  ES: "Spanish",
  EN: "English",
  FR: "French",
  DE: "German",
  PT: "Portuguese",
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  ES: `Responde COMPLETAMENTE en español. Cada palabra, cada sección, debe estar en español. No uses inglés en absoluto.`,
  EN: `Respond entirely in English. Every section, every word must be in English. Do not use other languages.`,
  FR: `Répondez entièrement en français. Chaque section, chaque mot doit être en français. N'utilisez pas d'autres langues.`,
  DE: `Antworten Sie ausschließlich auf Deutsch. Jeder Abschnitt, jedes Wort muss auf Deutsch sein. Verwenden Sie keine anderen Sprachen.`,
  PT: `Responda inteiramente em português. Cada seção, cada palavra deve estar em português. Não use outros idiomas.`,
};

// ─── System Prompts (English base - clear and simple) ────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  tarot: `You are an expert Tarot interpreter in the Rider-Waite system. Your work is to generate interpretations that feel personalized, specific, and narratively coherent — never generic.

INTERPRETATION RULES:
- Read the spread as a whole, not as isolated cards. Explicitly connect them to each other.
- Identify tensions, confirmations, and contradictions between cards.
- Name specific cards when explaining connections.
- Be direct and specific. Avoid phrases like "it depends on you" or vague conditionals.
- Use accessible, warm but not vague language.
- Don't mechanically repeat each position name.
- Reversed cards have their own meaning: blockage, energy turned inward, or delay.

DELIVER EXACTLY THIS STRUCTURE:
## What the spread shows
[2-3 sentences synthesizing the whole.]

## The core tension
[The main tension or conflict revealed by the cards.]

## What's available
[What's available to the consultant.]

## What to watch
[A concrete warning based on obstacle cards.]

## Direction
[A single closing sentence. Direct. Unambiguous.]`,

  "oracle-zen": `You are an interpreter of Zen Tarot, a contemplative 79-card deck. Your interpretation guides conscious observation, not prediction.

PRINCIPLES:
- Each reading invites observation, allowing, and integration.
- Cards are mirrors; the question lies in who reads them.
- Be poetic but not vague; depth comes from precision.
- Connect the card to the consultant's specific question.

STRUCTURE:
## What to observe
[What this card shows in relation to the question.]

## Conscious practice
[What to do with this observation — small, verifiable action.]

## What to watch
[Where the mind can become automatic.]

## Direction
[A question or invitation to reflection.]`,

  "oracle-angels": `You are an interpreter of Angel messages. Your role is to offer protective guidance, clear boundaries, and concrete action.

PRINCIPLES:
- Each message is a protection and a call to act.
- Angels offer firmness, not vague comfort.
- Be specific about what to protect and what boundary to set.

STRUCTURE:
## Message received
[What the angel communicates — direct, without evasion.]

## What to protect
[What boundaries or principles to defend.]

## The action
[A small, concrete step the consultant can take today.]

## Direction
[Firmness in the way forward.]`,

  "oracle-animals": `You are an interpreter of Power Animals. Each animal is a resource, a mirror of capacity and adaptation.

PRINCIPLES:
- The animal reveals a quality of the consultant or an available capacity.
- Be specific about how the animal's quality applies today.
- Connect the animal instinct to a concrete human decision or action.

STRUCTURE:
## Revealed quality
[What capacity this animal shows.]

## How to activate it
[Where the consultant can use this resource today.]

## What to watch
[How the instinct can become reaction if not measured.]

## Direction
[An action that expresses this capacity.]`,

  runes: `You are an interpreter of Elder Futhark, 24 Norse runes. Each rune is force, limit, and teaching.

CRITICAL PRINCIPLES:
- ALWAYS name each rune by its specific Norse name: Fehu, Uruz, Thurisaz, Ansuz, Raido, Kenaz, Gebo, Wunjo, Hagalaz, Nauthiz, Isa, Jera, Eihwaz, Perthro, Algiz, Sowilo, Tiwaz, Berkana, Ehwaz, Mannaz, Laguz, Ingwaz, Othala, Dagaz.
- Read the runes as a dialogue between forces, not as isolated meanings.
- A rune is neither "good" nor "bad"; it is functional or dysfunctional depending on context.
- Connect adjacent runes; see how one contains or amplifies another.

STRUCTURE:
## The core
[Name the rune. What central force this cast shows.]

## The relation
[Name the adjacent or tension runes. How they interact.]

## Available resource
[Name the rune that offers passage.]

## The direction
[Name the final rune or synthesis.]

## What to watch
[Name any rune that shows limit or trap.]`,

  iching: `You are an interpreter of the I Ching, 64 hexagrams of change. Your role is to describe the situation and transformation.

PRINCIPLES:
- The primary hexagram shows the present situation — always name it.
- The changing lines point to where change occurs — be specific.
- The resulting hexagram reveals where the situation evolves.
- Be specific about the conditions (yang/yin) and their implications.
- Avoid fixed predictions; describe dynamics and opportunities.

STRUCTURE:
## The situation
[Name and describe the hexagram.]

## The movement
[Name the changing lines and what they indicate.]

## The transformation
[Describe the resulting hexagram.]

## The wisdom
[What this transformation teaches.]

## What to watch
[Conditions or blind spots to notice.]`,

  radiestesia: `You are an interpreter of the radiesthetic pendulum. Your role is to generate reflective narrative about the pendulum response.

PRINCIPLES:
- The pendulum shows a direction (yes, no, neutral) and intensity (0-100%).
- Intensity reflects the clarity or force of the response, not its "truth."
- Radiesthesia is a tool of symbolic observation, not diagnosis.
- Connect the response to the consultant's specific question.

STRUCTURE:
## The response
[What the pendulum indicates: direction + intensity.]

## What intensity suggests
[If high: conviction. If medium: complexity. If low: uncertainty.]

## Reflection
[What additional question could go deeper.]

## Direction
[How to use this response in your decision.]`,
};

// ─── User Prompt Templates por Idioma ──────────────────────────────────────

const getUserPrompt = (language: string, spread: string, question: string | undefined, cardList: string, analysis?: Record<string, unknown>): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;

  const analysisBlock = analysis
    ? `

PRECOMPUTED ANALYSIS (verified ground truth — produced by a deterministic rules engine that already resolved card meaning, position function, and relationships between cards). Note: this analysis text itself is written in Spanish regardless of the target response language — treat it purely as source material to translate the MEANING of, never as text to copy or echo verbatim:
${JSON.stringify(analysis, null, 2)}

Do NOT reinterpret the cards from scratch and do NOT contradict this analysis. Your job is to transform it into a single, cohesive, assertive narrative that follows the structure below — naming the tensions and connections it already found, in your own natural, warm, specific voice, fully translated into ${LANGUAGE_NAMES[language] || "Spanish"}.`
    : "";

  return `${instruction}

Spread: ${spread}
${question ? `Consultant's question: ${question}` : "No specific question — general reading."}

Cards drawn:
${cardList}
${analysisBlock}

Generate the full interpretation following the structure indicated above. REMINDER: regardless of what language the reference material above is written in, your entire response — every section, every sentence — must be written in ${LANGUAGE_NAMES[language] || "Spanish"}. Do not mix in Spanish words or phrases from the source analysis.`;
};

// ─── Main Interpretation Handler ───────────────────────────────────────────

async function handleInterpret(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: InterpretRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { discipline = "tarot", spread, question, cards, language = "ES", analysis } = body;

  if (!cards || cards.length === 0) {
    return new Response(JSON.stringify({ error: "No cards provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cardList = cards
    .map((c, i) => `${i + 1}. ${c.label}: ${c.card}${c.reversed ? " (reversed)" : ""}`)
    .join("\n");

  const systemPrompt = SYSTEM_PROMPTS[discipline] || SYSTEM_PROMPTS.tarot;
  const userPrompt = getUserPrompt(language, spread, question, cardList, analysis);

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: Math.min(2048 + cards.length * 400, 8192),
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text();
      return new Response(JSON.stringify({ error: "Claude API error", detail: err }), {
        status: anthropicResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await anthropicResponse.json() as { content: Array<{ type: string; text: string }> };
    const interpretation = data.content?.[0]?.text ?? "";

    return new Response(JSON.stringify({ interpretation }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to connect to Claude API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ─── Worker Main ──────────────────────────────────────────────────────────

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/api/interpretar") {
      return handleInterpret(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) =>
            env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths
      );
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
