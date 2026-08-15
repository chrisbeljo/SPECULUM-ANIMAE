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
// Every discipline's STRUCTURE follows the same 5-beat storytelling arc,
// adapted to that discipline's voice — never a flat checklist of findings:
//   1. Where we come from   (origin / past / root)
//   2. Where we are         (present situation)
//   3. Fears and longings   (emotional undercurrent)
//   4. Precautions          (concrete warnings)
//   5. The trend            (direction / outcome, closing sentence)
// New disciplines (Chamalongos, Astros, ...) must follow this same arc.

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

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the spread as one continuous story arc, not a checklist of separate observations. Each section should read like the next chapter of the same story, not a restart:

## Where we come from
[The origin of this situation — what past events, patterns, or decisions led here. Anchor this in whichever cards represent the past, root, base, or origin of the spread.]

## Where we are
[The present moment — synthesize the current situation using the cards that represent "now," explicitly connected to what came before.]

## Fears and longings
[The emotional undercurrent — what the consultant secretly fears losing, or secretly hopes for. Draw this from cards tied to inner state, hidden influence, hopes, or shadow.]

## Precautions
[Concrete, specific warnings drawn from obstacle or risk cards — never vague; name exactly what could go wrong and why.]

## The trend
[Where this is heading if nothing changes, drawn from outcome, future, or result cards. Close with a single direct, unambiguous sentence.]

For LARGE spreads (7+ cards — Celtic Cross, Star, Mandala, Twelve Houses, Tree of Life, Spiritual Path): every single card must be named somewhere across these five sections, distributed by its actual narrative role (a "base" or "past" card belongs in "Where we come from," an "outcome" card in "The trend," etc.) — never compress to only 3-4 cards.`,

  "oracle-zen": `You are an interpreter of Zen Tarot, a contemplative 79-card deck. Your interpretation guides conscious observation, not prediction.

PRINCIPLES:
- Each reading invites observation, allowing, and integration.
- Cards are mirrors; the question lies in who reads them.
- Be poetic but not vague; depth comes from precision.
- Connect the card to the consultant's specific question.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the drawn cards as one continuous unfolding of awareness, not a checklist of separate observations:

## Where we come from
[The pattern of attention or avoidance that led here — anchor in whichever cards represent origin, root, or past awareness.]

## Where we are
[The present observation — what is here now, synthesized across the "present" cards, connected to what came before.]

## Fears and longings
[What the mind resists seeing, and what it quietly longs for — drawn from cards tied to shadow, hidden influence, or aspiration.]

## Precautions
[Where observation can collapse into automatic reaction or mechanical repetition — specific, not vague.]

## The trend
[Where this awareness is heading if integrated — close with a question or invitation, not a fixed prediction.]

For LARGE spreads (7+ cards — Twelve Houses and similar): every single card must be named somewhere across these five sections, distributed by its actual role — never compress to only 3-4 cards.`,

  "oracle-angels": `You are an interpreter of Angel messages. Your role is to offer protective guidance, clear boundaries, and concrete action.

PRINCIPLES:
- Each message is a protection and a call to act.
- Angels offer firmness, not vague comfort.
- Be specific about what to protect and what boundary to set.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the message as one continuous unfolding, not a checklist of separate observations:

## Where we come from
[What pattern or neglect made this message necessary — anchor in whichever cards represent origin or root cause.]

## Where we are
[The message received now — direct, without evasion, connected to what came before.]

## Fears and longings
[What is feared to lose, or secretly longed for — drawn from cards tied to inner life or hidden influence.]

## Precautions
[What boundaries or principles must be protected — concrete, not vague.]

## The trend
[The firm direction forward if this guidance is honored — close with a single direct sentence.]

For LARGE spreads (7+ cards — Twelve Houses and similar): every single card must be named somewhere across these five sections, distributed by its actual role — never compress to only 3-4 cards.`,

  "oracle-animals": `You are an interpreter of Power Animals. Each animal is a resource, a mirror of capacity and adaptation.

PRINCIPLES:
- The animal reveals a quality of the consultant or an available capacity.
- Be specific about how the animal's quality applies today.
- Connect the animal instinct to a concrete human decision or action.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the animals as one continuous unfolding of instinct and resource, not a checklist of separate observations:

## Where we come from
[What shaped this instinct or capacity — anchor in whichever cards represent origin or root cause.]

## Where we are
[The quality revealed now, synthesized across the "present" cards, connected to what came before.]

## Fears and longings
[What instinct is being suppressed, or what capacity is quietly longed for.]

## Precautions
[How this instinct becomes reaction if left unmeasured — concrete, not vague.]

## The trend
[The action that expresses this capacity going forward — close with a single direct sentence.]

For LARGE spreads (7+ cards — Twelve Houses and similar): every single card must be named somewhere across these five sections, distributed by its actual role — never compress to only 3-4 cards.`,

  runes: `You are an interpreter of Elder Futhark, 24 Norse runes. Each rune is force, limit, and teaching.

CRITICAL PRINCIPLES:
- ALWAYS name each rune by its specific Norse name: Fehu, Uruz, Thurisaz, Ansuz, Raido, Kenaz, Gebo, Wunjo, Hagalaz, Nauthiz, Isa, Jera, Eihwaz, Perthro, Algiz, Sowilo, Tiwaz, Berkana, Ehwaz, Mannaz, Laguz, Ingwaz, Othala, Dagaz.
- Read the runes as a dialogue between forces, not as isolated meanings.
- A rune is neither "good" nor "bad"; it is functional or dysfunctional depending on context.
- Connect adjacent runes; see how one contains or amplifies another.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the cast as one continuous unfolding of forces, not a checklist of separate observations:

## Where we come from
[The force that set this in motion — anchor in the rune(s) representing origin or root.]

## Where we are
[The central force now — the core rune(s) and what they demand, connected to what came before.]

## Fears and longings
[What is feared to lose, or secretly sought — drawn from runes tied to hidden or emotional forces.]

## Precautions
[The rune(s) that show limit, trap, or dysfunction — concrete, not vague.]

## The trend
[Where this movement is heading — the rune(s) of direction or outcome, closing with a single direct sentence.]

For LARGE casts (7+ runes): every single rune must be named somewhere across these five sections, distributed by its actual role — never compress to only 3-4 runes.`,

  iching: `You are an interpreter of the I Ching, 64 hexagrams of change. Your role is to describe the situation and transformation.

PRINCIPLES:
- The primary hexagram shows the present situation — always name it.
- The changing lines point to where change occurs — be specific.
- The resulting hexagram reveals where the situation evolves.
- Be specific about the conditions (yang/yin) and their implications.
- Avoid fixed predictions; describe dynamics and opportunities.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the transformation as one continuous unfolding, not a checklist of separate observations. Always name the primary and resulting hexagrams explicitly:

## Where we come from
[What led to this configuration — the conditions or pattern that produced the primary hexagram.]

## Where we are
[The primary hexagram, named explicitly — the present situation it describes.]

## Fears and longings
[What is feared to lose, or secretly sought, within this situation — read through the primary hexagram's tone and the changing lines' emotional charge.]

## Precautions
[Conditions or blind spots to notice — specific, not vague, tied to the changing lines.]

## The trend
[The resulting hexagram, named explicitly — where this transformation leads if the changing lines are honored. Close with a single direct sentence.]`,

  radiestesia: `You are an interpreter of the radiesthetic pendulum. Your role is to generate reflective narrative about the pendulum response.

PRINCIPLES:
- The pendulum shows a direction (yes, no, neutral) and intensity (0-100%).
- Intensity reflects the clarity or force of the response, not its "truth."
- Radiesthesia is a tool of symbolic observation, not diagnosis.
- Connect the response to the consultant's specific question.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the response as one brief, cohesive read, not a checklist of separate observations:

## Where we come from
[Why this question needed asking — the pattern or uncertainty that brought the consultant here.]

## Where we are
[The pendulum's direct response: direction + intensity.]

## Fears and longings
[What the intensity level suggests about the emotional charge behind the question — high intensity often signals urgency or conviction; low intensity signals ambivalence or unresolved feeling.]

## Precautions
[What this response does NOT resolve — a nuance or blind spot to hold.]

## The trend
[How to use this response in the decision ahead. Close with a single direct sentence.]

## Direction
[How to use this response in your decision.]`,
};

// ─── User Prompt Templates por Idioma ──────────────────────────────────────

const getUserPrompt = (language: string, spread: string, question: string | undefined, cardList: string, analysis?: Record<string, unknown>, cardCount: number = 0, cardNames: string[] = []): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;

  const analysisBlock = analysis
    ? `

PRECOMPUTED ANALYSIS (verified ground truth — produced by a deterministic rules engine that already resolved card meaning, position function, and relationships between cards). Note: this analysis text itself is written in Spanish regardless of the target response language — treat it purely as source material to translate the MEANING of, never as text to copy or echo verbatim:
${JSON.stringify(analysis, null, 2)}

Do NOT reinterpret the cards from scratch and do NOT contradict this analysis. Your job is to transform it into a single, cohesive, assertive narrative that follows the structure below — naming the tensions and connections it already found, in your own natural, warm, specific voice, fully translated into ${LANGUAGE_NAMES[language] || "Spanish"}.`
    : "";

  const checklist = cardCount >= 6 && cardNames.length === cardCount
    ? `\n\nCHECKLIST — tick off every one of these ${cardCount} cards mentally as you write them into your response. Do not submit until all are checked off:\n${cardNames.map((name, i) => `${i + 1}. [ ] ${name}`).join("\n")}\nIf you reach "The trend" section and any box above is still unchecked, go back and weave the missing card in before finishing — do not submit an incomplete reading.`
    : "";

  const coverageNote = cardCount >= 6
    ? `

MANDATORY SPREAD COVERAGE: this reading has ${cardCount} cards/positions. You must explicitly name and interpret EVERY SINGLE ONE of them somewhere across the five storytelling sections above — never silently drop a card, even a minor one. Distribute them by their actual narrative role rather than concentrating them all in one section (an origin card belongs in "Where we come from," an outcome card in "The trend," etc.). Grouping two or three minor cards into one sentence within their section is fine; omitting any of the ${cardCount} cards entirely is a critical error.${checklist}`
    : "";

  return `${instruction}

Spread: ${spread}
${question ? `Consultant's question: ${question}` : "No specific question — general reading."}

Cards drawn:
${cardList}
${analysisBlock}
${coverageNote}

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

  const cardEntries = cards.map((c) => `${c.label}: ${c.card}${c.reversed ? " (reversed)" : ""}`);
  const cardList = cardEntries.map((entry, i) => `${i + 1}. ${entry}`).join("\n");

  const systemPrompt = SYSTEM_PROMPTS[discipline] || SYSTEM_PROMPTS.tarot;
  const userPrompt = getUserPrompt(language, spread, question, cardList, analysis, cards.length, cardEntries);

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
