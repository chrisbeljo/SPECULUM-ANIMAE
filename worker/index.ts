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
  SUPABASE_SERVICE_ROLE_KEY: string;
}

const SUPABASE_URL = "https://xenftrcqqhhrajatzhbq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbmZ0cmNxcWhocmFqYXR6aGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDkzMjksImV4cCI6MjEwMjEyNTMyOX0.ydGXZPq42fiKKWcnywoR8FJE4ytPdPLwH0zGYHt3PC0";

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
  discipline?: "tarot" | "oracle-zen" | "oracle-angels" | "oracle-animals" | "runes" | "iching" | "radiestesia" | string;
  spread?: string;
  question?: string;
  cards?: Card[];
  language?: "ES" | "EN" | "FR" | "DE" | "PT";
  analysis?: Record<string, unknown>;
  followup?: { question: string };
  astro?: {
    discipline: "western" | "eastern" | "numerology";
    focus: string;
    focusIndex?: number;
    data: Record<string, unknown>;
    context?: { name?: string; birthDate?: string; question?: string };
    theme?: {
      id: string;
      title: string;
      description: string;
      centralQuestion: string;
      indicators: Record<string, unknown>;
      evidence: Array<{ kind: string; label: string; value: string; source: string }>;
    };
  };
  reflexus?: {
    engine: "western" | "eastern" | "numerology";
    facts: Array<Record<string, unknown>>;
    classifications: Array<Record<string, unknown>>;
  };
  imago?: {
    sourceReports: string[];
    areas: Array<Record<string, unknown>>;
  };
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
[How to use this response in the decision ahead. Close with a single direct sentence.]`,
};

// ─── Astros System Prompts ──────────────────────────────────────────────────
// Same 5-beat storytelling arc as SYSTEM_PROMPTS, grounded in real calculated
// data (Swiss Ephemeris / BaZi / Zi Wei / Pythagorean numerology) — never
// invented placements, pillars, palaces, or numbers.

const ASTRO_SYSTEM_PROMPTS: Record<string, string> = {
  western: `You are an expert Western astrologer working with real tropical geocentric calculations (planets, houses, aspects, transits, solar return). Never invent a placement, house, or aspect that is not present in the data provided — if something is absent from the data, do not mention it.

PRINCIPLES:
- Read the chart as an integrated system: Sun, Moon, Ascendant, and the tightest aspects together, never in isolation.
- Distinguish natal structure from current transits or the solar return — these activate the natal chart, they do not replace it.
- Retrograde motion has its own meaning: internalized, revisited, or delayed expression.
- Be specific: name the actual signs, houses, planets, and orbs given in the data — never a generic zodiac description.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the chart as one continuous story, not a checklist:

## Where we come from
[The natal foundation — Sun, Moon, Ascendant, and the tightest natal aspects present in the data, as origin and structure.]

## Where we are
[The current moment — active transits, or the solar return if present in the data — explicitly connected to the natal structure above.]

## Fears and longings
[The emotional undercurrent — drawn from the Moon's placement and any challenging aspects present in the data.]

## Precautions
[Concrete warnings drawn from squares, oppositions, or retrograde planets actually present in the data.]

## The trend
[Where this configuration is heading — drawn from supportive aspects (trine/sextile) or the solar return's dominant house if present. Close with a single direct sentence.]`,

  eastern: `You are an expert in Chinese BaZi (Four Pillars) and Zi Wei Dou Shu astrology, working with real calculated pillars, elements, and palaces. Never invent a pillar, stem, branch, star, or palace that is not present in the data provided.

PRINCIPLES:
- Read the Day Master through the full Four Pillars as one integrated system — never reduce it to the year animal alone.
- Element balance shows what is available or scarce, never inherently good or bad.
- The active luck cycle (Da Yun) and yearly palace activate the chart; they do not replace its natal structure.
- Be specific: name the actual Heavenly Stems, Earthly Branches, elements, stars, and palaces given in the data.

DELIVER EXACTLY THIS STORYTELLING STRUCTURE — narrate the chart as one continuous story, not a checklist:

## Where we come from
[The Day Master and the natal Four Pillars, as origin and foundation.]

## Where we are
[The active luck cycle (Da Yun) and/or current palace data present in the data, explicitly connected to the pillars above.]

## Fears and longings
[Drawn from the weakest element, challenging Ten Gods relationships, or palace themes tied to inner life present in the data.]

## Precautions
[Concrete warnings from element imbalance or difficult relationships actually present in the data.]

## The trend
[Where the current cycle is heading, drawn from the data. Close with a single direct sentence.]`,

  numerology: `You are an expert numerologist working with real Pythagorean calculations (Life Path, Expression, Soul, Personality, cycles, pinnacles, challenges, karmic debts). Never invent a number that is not present in the data provided.

PRINCIPLES:
- Read the core numbers (Life Path, Expression, Soul, Personality) as one integrated system.
- Master numbers (11, 22, 33) carry an amplified charge — never reduce them further.
- Be specific: name the actual numbers given in the data — never a generic numerology description.

DELIVER EXACTLY THE FIVE-SECTION STRUCTURE SPECIFIED IN THE "NUMEROLOGY STRUCTURE" BLOCK BELOW, in that exact order, narrated as one continuous story, not a checklist. Use those exact section headers, translated into the target language.`,
};

// Each discipline's system prompt keeps ONE shared 5-beat structure (so
// parsing stays reliable), but every focus within it must answer a
// different central question — otherwise Carta Natal, Tránsitos, Revolución
// Solar, and Horóscopos (or BaZi vs. Balance de elementos vs. Zi Wei) read
// as the same report reshuffled. This lens is injected per focusIndex.
const FOCUS_LENS: Record<"western" | "eastern" | "numerology", string[]> = {
  western: [
    `FOCUS LENS — Carta Natal: this reading must answer "how is this person built?" Give the full, deep natal architecture — Sun, Moon, Ascendant, personal planets, houses, and aspects as one integrated identity. Do not discuss current transits or the solar return even if present in the data — this report is about permanent structure, not the current moment.`,
    `FOCUS LENS — Tránsitos: this reading must answer "what is activating right now?" The natal chart is context, not the subject — mention it briefly to anchor the reading, then spend most of the narrative on the actual transiting aspects present in the data: which natal points they touch, what kind of contact (tension vs. flow), and what that activation concretely awakens. Do not re-narrate the full birth chart from scratch.`,
    `FOCUS LENS — Revolución Solar: this reading must answer "what is the central argument of this year?" Center on the solar return chart specifically — its Ascendant, the house the Sun falls into, the Moon's placement — read as an annual agenda running from this birthday to the next. Reference the natal Sun only briefly as anchor; do not re-derive the full natal architecture.`,
    `FOCUS LENS — Horóscopos: this reading must answer "what is the immediate climate?" Write a shorter, more practical day/week/month outlook — current transits filtered through the natal Sun, Moon, and Ascendant, in an actionable everyday tone. This is lighter and more immediate than a deep structural reading; do not attempt the depth of a full natal or transit analysis.`,
  ],
  eastern: [
    `FOCUS LENS — Cuatro Pilares completos: this reading must answer "what is my energetic architecture and how does it evolve through cycles?" Give the full, deep BaZi read — Day Master, all Four Pillars as one system, Ten Gods, hidden stems, Na Yin, and how the active Da Yun luck cycle moves through it.`,
    `FOCUS LENS — Balance de elementos: this reading must answer "where are my excesses, deficiencies, and compensations?" This is a DIAGNOSTIC, not a biography — do NOT re-explain each pillar's meaning or the Day Master's full story (that belongs to the Cuatro Pilares reading; assume the reader already has it). Go straight to: which element dominates, which is scarce or absent, what feeds or drains what among the five elements, and how the current Da Yun cycle shifts that balance.`,
    `FOCUS LENS — Zi Wei Dou Shu: this reading must answer "how are the fundamental areas of my destiny distributed?" This reading must be PALACE-LED: identify the 3-4 most significant palaces present in the data (the Origin palace, the Body palace, and any palace holding major stars or currently activated by the decadal/yearly cycle) and organize the entire narrative around those specific palaces — not a generic four-part life story that could apply to any chart.`,
  ],
  numerology: [
    `FOCUS LENS — Camino de Vida: this reading must answer "what is my core life direction?" This report is ~90% permanent structure, 10% timing. Center on the Life Path number as the foundational read, using Soul and Expression only as supporting context. Mention the current Personal Year only as a brief closing note — do not build a section around it.`,
    `FOCUS LENS — Expresión: this reading must answer "what are my talents and how do they manifest outwardly?" This report is ~90% permanent structure, 10% timing. Center specifically on the Expression number — how it shows up in action and output — referencing Life Path only briefly as context. Mention the current Personal Year only as a brief closing note — do not build a section around it.`,
    `FOCUS LENS — Alma: this reading must answer "what motivates me from within?" This report is ~90% permanent structure, 10% timing. Center specifically on the Soul number — the inner want beneath outward choices — referencing the other numbers only briefly as context. Mention the current Personal Year only as a brief closing note — do not build a section around it.`,
    `FOCUS LENS — Ciclos / Año Personal: this reading must answer "what is active this specific year?" This report FLIPS the usual balance: ~70% timing, 30% structure. The Personal Year (and month/day if present in the data) IS the main subject of the entire reading, not a footnote — reference Life Path/Expression/Soul only briefly as anchor.`,
  ],
};

// Numerology gets its own section-header set per focus (instead of the
// shared 5-beat arc used by western/eastern) so Vida, Expresión, Alma, and
// Ciclos read as four genuinely different report types, not the same
// checklist re-labeled. Still exactly 5 "## " headers, so parsing on the
// client stays unchanged.
const NUMEROLOGY_STRUCTURE: string[] = [
  `## Essential path
[The Life Path number as core life direction — origin and foundation.]

## Strengths
[What this Life Path number equips the person with — natural resources and capacities.]

## Learning
[What this Life Path number is here to learn — its growth edge, drawn from the number's meaning and any karmic lessons present in the data.]

## Life stages
[The pinnacles and their age ranges present in the data, read as chapters of this Life Path unfolding over time.]

## Integration
[How to live this Life Path number well today. Mention the current Personal Year only briefly, as a closing note. Close with a single direct sentence.]`,
  `## Talents
[The Expression number's natural talents — origin and foundation.]

## How you act
[How this Expression number shows up in action and initiative.]

## How you communicate
[How this Expression number shows up in communication and self-presentation.]

## Obstacles to manifestation
[What blocks this Expression number from showing up fully — drawn from challenge numbers or karmic debts present in the data.]

## Development
[How to develop this Expression number further. Mention the current Personal Year only briefly, as a closing note. Close with a single direct sentence.]`,
  `## Deep desire
[The Soul number's core inner want — origin and foundation.]

## Emotional need
[What this Soul number needs emotionally to feel fulfilled.]

## Inner tension
[The friction between this Soul number's private want and the outward Personality/Expression, drawn from the data.]

## What feeds the soul
[What concretely satisfies this Soul number — activities, relationships, or environments implied by its meaning.]

## Integration
[How to honor this Soul number today. Mention the current Personal Year only briefly, as a closing note. Close with a single direct sentence.]`,
  `## Current cycle
[The Personal Year, Month, and Day as the primary subject of this entire reading — not a footnote.]

## Opportunities
[What this specific Personal Year/Month opens up, drawn from its number meaning.]

## Tensions
[What this specific Personal Year/Month makes difficult, drawn from its number meaning and any active challenge numbers.]

## Where you are in the cycle
[Which pinnacle period the person is currently in, and how the Personal Year sits inside that larger pinnacle.]

## Next transition
[When the current Personal Year or pinnacle period shifts, and what that means. Close with a single direct sentence.]`,
];

const ASTRO_ESSENTIALS_INSTRUCTION = `

MANDATORY FINAL LINE: after delivering the full five-section interpretation above, your response MUST end with exactly one more line containing ONLY this literal marker (never translate the marker text "ESSENTIALS:" itself — keep it in English as a technical delimiter; only the content after it goes in the target language):
ESSENTIALS: <first key takeaway> | <second key takeaway> | <third key takeaway>
Each takeaway must be a single short sentence (under 15 words), specific to this exact reading and this exact focus — never a generic statement that could apply to any chart. Provide exactly 3 takeaways, separated by " | ". Nothing may come after this line. Omitting it is a critical error.`;

const ASTRO_THEME_SYSTEM_PROMPT = `You write a specialized thematic report derived from an already-calculated Western astrology, Chinese astrology, or numerology report.

NON-NEGOTIABLE GROUNDING:
- Use only values present in PRECOMPUTED CALCULATION and VERIFIED EVIDENCE.
- Never invent a planet, sign, house, aspect, orb, duration, stem, branch, Ten God, element, cycle, palace, star, number, pinnacle, challenge, or timing claim.
- Every important paragraph must be supported by one or more exact VERIFIED EVIDENCE source strings.
- If the evidence cannot support a requested conclusion, state the limitation briefly instead of filling the gap.
- Preserve the original report as context, but answer only the selected thematic question. Do not repeat the general interpretation.
- Distinguish permanent structure from timed activation. Include a current-moment section only when temporal evidence is supplied.
- Describe symbolic tendencies, not inevitable events. Do not provide medical diagnosis, investment advice, legal certainty, or absolute predictions.
- Chinese astrology must retain its own terminology; do not translate it automatically into Western astrology.

DELIVER THESE SECTIONS, translating every visible header into the target language:
## Opening
One or two concise paragraphs defining the exact area being examined.
## Main indicators
Name the strongest calculated indicators that genuinely support this theme.
## Interpretation
Develop the selected theme specifically and coherently.
## Strengths
Explain configurations that favor this area.
## Tensions or challenges
Explain configurations that create friction without presenting them as fate.
## Current moment
Include only if temporal evidence exists; otherwise omit this entire section.
## Integration
Relate the theme to the original report without retelling it.
## Guidance
Offer a practical symbolic conclusion grounded in the evidence.
## Method and scope
State which calculations were used and what this report cannot establish.

MANDATORY FINAL LINE: after all visible sections, output exactly one technical line in this format and nothing after it:
TRACE_JSON: {"sections":[{"title":"<visible section title>","sources":["<exact source string from VERIFIED EVIDENCE>"]}]}
Include one object for every visible section. The source strings must be copied exactly from VERIFIED EVIDENCE; never create new source identifiers.`;

const getAstroThemeUserPrompt = (language:string, astro:NonNullable<InterpretRequest["astro"]>):string => {
  const instruction=LANGUAGE_INSTRUCTIONS[language]||LANGUAGE_INSTRUCTIONS.ES;
  return `${instruction}

Discipline: ${astro.discipline}
Original report: ${astro.focus}
Selected thematic report: ${astro.theme?.title}
Central question: ${astro.theme?.centralQuestion}
Description: ${astro.theme?.description}
Allowed indicator contract: ${JSON.stringify(astro.theme?.indicators||{},null,2)}
${astro.context?.name?`Consultant: ${astro.context.name}`:""}
${astro.context?.birthDate?`Birth date: ${astro.context.birthDate}`:""}
${astro.context?.question?`Consultant question: ${astro.context.question}`:"No specific consultant question."}

VERIFIED EVIDENCE (each source value is an internal trace identifier; cite only these identifiers in TRACE_JSON):
${JSON.stringify(astro.theme?.evidence||[],null,2)}

PRECOMPUTED CALCULATION (ground truth; use it to understand relationships, never to invent missing facts):
${JSON.stringify(astro.data,null,2)}

Write the specialized report now. Every visible word must be in ${LANGUAGE_NAMES[language]||"Spanish"}; keep only the technical marker TRACE_JSON and JSON keys in English.`;
};

// ─── REFLEXUS / IMAGO SPECULI editorial layer ──────────────────────────────
// REFLEXUS and IMAGO SPECULI are entirely client-side, deterministic,
// rule-based engines (app/components/reflexus-engine.ts) — the worker never
// sees the underlying birth data for these, only the already-computed
// signals/classifications/areas. Claude never calculates, ranks, or
// classifies anything here; it narrates what the deterministic engine
// already decided. TRACE_JSON follows the exact same contract as the theme
// explorer above (extractTraceJson below), so the client can reject any
// response that cites an id it wasn't actually given.

const REFLEXUS_SYSTEM_PROMPT = `You are writing an editorial expansion of REFLEXUS, an already-complete, versioned, rule-based deterministic reading. You are NOT the calculation engine and NOT the source of truth — every score, ranking, classification, and area assignment you are given was computed by deterministic rules before you were called. None of it may be changed, recalculated, re-ranked, or contradicted.

You will receive FACTS (individual calculated signals — each with an id, area, relevance, evidenceStrength, deterministicClass, temporalClass, and evidenceIds) and CLASSIFICATIONS (the life areas ranked by the deterministic engine, each with relevance, dominantClass, rank, and the signalIds that support it).

RULES:
- Use only the facts and classifications provided. Never invent a signal, score, area, or evidence id absent from the data.
- Never state or imply a ranking, score, or classification different from what is given — narrate what the engine decided, do not re-decide it.
- Never diagnose physical or mental health, never promise events, never present a tendency as fixed destiny.
- Write as an editorial voice that makes the calculated pattern legible and narratively coherent — not a second calculation.

STYLE:
- The exact relevance scores, ranks, and evidence labels are already visible in tables directly above this text on the page — do not restate them as numbers ("(92/100)", "rank 1", etc.). Refer to emphasis qualitatively instead ("the area with the clearest concentration of signals," "a secondary theme") and let the visible tables carry the precise figures. Repeating a number the reader already sees above is a critical error, not just a style slip.
- Be direct and assertive, never vague or hedging. Commit to a clear reading of what the pattern shows — state it, don't dance around it — while still respecting that this describes a tendency, not a fixed destiny.
- Write as one continuous narrative with a throughline, not a checklist that restates each area in turn. Each section should read like the next beat of the same story, picking up where the previous one left off.

DELIVER EXACTLY THIS FIVE-SECTION STRUCTURE, in this order, translating every visible header into the target language. Each header below is prefixed with TWO hash characters (##) — copy that exact prefix, not one hash (#) and not three:

## Síntesis editorial
A short editorial overview naming the top-ranked areas (by relevance) and what ties them together.

## Estructura de base
Narrate the signals/areas whose temporalClass is "structure" (and "balance" or "stage" if present) — what this reveals about the person's underlying architecture.

## Momento actual
Narrate the signals/areas whose temporalClass is "present" or "current_cycle" — what is active right now. If none are present in the data, say so briefly instead of inventing one.

## Tendencia
Narrate the signals/areas whose temporalClass is "trend" — where the emphasis is heading.

## Integración y orientación
A closing, integrative paragraph connecting structure, present, and trend into one coherent orientation. Close with a single direct sentence.

MANDATORY FINAL LINE: after all five sections, output exactly one technical line in this format and nothing after it:
TRACE_JSON: {"sections":[{"title":"<visible section title, in the target language>","sources":["<exact fact or evidence id you actually used>"]}]}
Include one object for every visible section, each with at least one real id. The ids must be copied exactly from the FACTS/CLASSIFICATIONS you received; never invent new ones. Omitting this line, or citing an id you were not given, is a critical error.`;

const IMAGO_SYSTEM_PROMPT = `You are writing an editorial expansion of IMAGO SPECULI, an already-complete, deterministic comparison of three independent REFLEXUS readings (western astrology, eastern astrology, numerology). You are NOT the comparison engine — every convergence value (1of3/2of3/3of3), consistency label (aligned/complementary/mixed/divergent/insufficient_data), relevance score, and ranking was already computed. None of it may be changed, recalculated, or artificially "resolved."

You will receive AREAS: the life areas as computed by IMAGO, each with relevance, convergence, consistency, per-engine relevance/rank/dominantClass, and evidenceIds.

RULES:
- Use only the areas provided. Never invent a convergence, consistency, score, or evidence id absent from the data.
- Never turn a 1of3 into a 2of3 or 3of3, and never turn a divergent or mixed reading into an artificially resolved "aligned" one — contrast and tension are part of what you must describe honestly.
- Never diagnose physical or mental health, never promise events, never present a tendency as fixed destiny.

STYLE:
- The exact relevance scores, convergence labels (1of3/2of3/3of3), and per-engine ranks are already visible in the matrix table directly above this text — do not restate them as numbers or literal labels. Refer to them qualitatively instead ("the three systems converge outright," "only one engine flags this") and let the visible table carry the precise figures. Repeating a number or label the reader already sees above is a critical error, not just a style slip.
- Be direct and assertive, never vague or hedging. Commit to a clear reading of what the pattern shows — state it, don't dance around it — while still respecting that this describes a tendency, not a fixed destiny.
- Write as one continuous narrative with a throughline, not a checklist that restates each area in turn. Each section should read like the next beat of the same story, picking up where the previous one left off.

DELIVER EXACTLY THIS FIVE-SECTION STRUCTURE, in this order, translating every visible header into the target language. Each header below is prefixed with TWO hash characters (##) — copy that exact prefix, not one hash (#) and not three:

## Imagen integrada
An overview naming the highest-relevance areas and what the three systems together suggest.

## Convergencias principales
Narrate the 2of3/3of3 areas — where the systems agree.

## Contrastes y complementos
Narrate the divergent/mixed/complementary areas honestly, without resolving the tension.

## Estructura, presente y tendencia
Connect the temporalClasses present across areas into a structure/present/trend narrative.

## Orientación integradora
A closing, integrative paragraph. Close with a single direct sentence.

MANDATORY FINAL LINE: after all five sections, output exactly one technical line in this format and nothing after it:
TRACE_JSON: {"sections":[{"title":"<visible section title, in the target language>","sources":["<exact evidence id you actually used>"]}]}
Include one object for every visible section, each with at least one real id, copied exactly from the AREAS you received. Omitting this line, or citing an id you were not given, is a critical error.`;

const getReflexusUserPrompt = (language: string, reflexus: NonNullable<InterpretRequest["reflexus"]>): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;
  return `${instruction}

Engine: ${reflexus.engine}

FACTS (calculated signals — verified ground truth):
${JSON.stringify(reflexus.facts, null, 2)}

CLASSIFICATIONS (calculated area rankings — verified ground truth):
${JSON.stringify(reflexus.classifications, null, 2)}

Write the editorial expansion now. Every visible word must be in ${LANGUAGE_NAMES[language] || "Spanish"}; keep only the technical marker TRACE_JSON and its JSON keys in English.`;
};

const getImagoUserPrompt = (language: string, imago: NonNullable<InterpretRequest["imago"]>): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;
  return `${instruction}

Source REFLEXUS report keys: ${imago.sourceReports.join(", ")}

AREAS (calculated convergence/consistency across the three engines — verified ground truth):
${JSON.stringify(imago.areas, null, 2)}

Write the editorial expansion now. Every visible word must be in ${LANGUAGE_NAMES[language] || "Spanish"}; keep only the technical marker TRACE_JSON and its JSON keys in English.`;
};

const getAstroUserPrompt = (language: string, discipline: string, focus: string, focusIndex: number | undefined, data: Record<string, unknown>, context?: { name?: string; birthDate?: string; question?: string }): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;
  const lens = focusIndex !== undefined ? FOCUS_LENS[discipline as "western" | "eastern" | "numerology"]?.[focusIndex] : undefined;
  const structure = discipline === "numerology" && focusIndex !== undefined ? NUMEROLOGY_STRUCTURE[focusIndex] : undefined;
  return `${instruction}

Discipline: ${discipline}
Focus: ${focus}
${lens ? `\n${lens}\n` : ""}
${context?.name ? `Consultant: ${context.name}` : ""}
${context?.birthDate ? `Birth date: ${context.birthDate}` : ""}
${context?.question ? `Consultant's question: ${context.question}` : "No specific question — general reading."}

PRECOMPUTED CALCULATION (verified ground truth — real astronomical/astrological math, not invented). Use ONLY the placements, aspects, houses, pillars, stars, or numbers that appear below. Never invent anything absent from this data:
${JSON.stringify(data, null, 2)}
${structure ? `\nNUMEROLOGY STRUCTURE — deliver exactly these five sections, in this order, with these exact headers translated into the target language:\n${structure}\n` : ""}
Generate the full interpretation following the structure indicated in the system prompt. Entire response — every section, every sentence — must be written in ${LANGUAGE_NAMES[language] || "Spanish"}.`;
};

// ─── Model + Caching Configuration ─────────────────────────────────────────
// Text disciplines run on Haiku (fast, cheap). Vision-based modules (not yet
// built — Quiromancia, Fisonomía, Feng Shui, Aura), large spreads (8+ cards —
// more prone to dropping cards on the faster model), and the open-ended
// followup conversation all run on Sonnet.
const VISION_DISCIPLINES = new Set<string>(["quiromancia", "fisonomia", "fengshui", "aura"]);
const LARGE_SPREAD_THRESHOLD = 7;
const modelFor = (discipline: string, cardCount: number): string =>
  (VISION_DISCIPLINES.has(discipline) || cardCount > LARGE_SPREAD_THRESHOLD) ? "claude-sonnet-5" : "claude-haiku-4-5-20251001";

const FOLLOWUP_QUESTION_INSTRUCTION = `

MANDATORY FINAL LINE: after delivering the full interpretation above, your response MUST end with exactly one more line containing ONLY this literal marker (never translate the marker text "FOLLOWUP_QUESTION:" itself — keep it in English as a technical delimiter; only the question after it goes in the target language):
FOLLOWUP_QUESTION: <one single-sentence question specific to THIS exact reading, inviting the consultant to reflect on or share more about something concrete you just interpreted — never generic like "would you like to explore a card?">
Nothing may come after this line. Omitting it is a critical error.`;

const FOLLOWUP_SYSTEM_PROMPT = `You are answering a question the consultant has about a divination reading they just received. You have the original spread and cards as context.

Your task: answer their specific question directly and warmly, referencing the actual cards/symbols from the original spread where relevant. Do not repeat the entire original interpretation from scratch — go straight to answering what they asked. Do not start a new full reading. 2-4 sentences, direct and specific — never generic reassurance.`;

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

Generate the full interpretation following the structure indicated above. REMINDER: regardless of what language the reference material above is written in, your entire response — every section, every sentence — must be written in ${LANGUAGE_NAMES[language] || "Spanish"}. Do not mix in Spanish words or phrases from the source analysis.

Then, after the interpretation, add exactly one final line in this literal format — the marker "FOLLOWUP_QUESTION:" itself must stay in English as a technical delimiter, never translated; only the question text after it must be in ${LANGUAGE_NAMES[language] || "Spanish"}:
FOLLOWUP_QUESTION: <one single-sentence question specific to THIS reading, inviting the consultant to reflect on or share more about something concrete you just interpreted — never generic like "would you like to explore a card?">`;
};

const getFollowupUserPrompt = (language: string, spread: string, cardList: string, consultantQuestion: string): string => {
  const instruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.ES;
  return `${instruction}

Original spread: ${spread}
Cards drawn:
${cardList}

The consultant asks: "${consultantQuestion}"

Answer their question directly, following the instructions in the system prompt. Entire response must be in ${LANGUAGE_NAMES[language] || "Spanish"}.`;
};

function extractFollowupQuestion(text: string): { interpretation: string; followupQuestion: string | null } {
  const match = text.match(/FOLLOWUP_QUESTION:\s*(.+?)\s*$/i);
  if (!match || match.index === undefined) return { interpretation: text.trim(), followupQuestion: null };
  return {
    interpretation: text.slice(0, match.index).trim(),
    followupQuestion: match[1].trim(),
  };
}

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

  const { discipline = "tarot", spread, question, cards, language = "ES", analysis, followup, astro, reflexus, imago } = body;

  if (reflexus) {
    return callClaudeStream(env, {
      model: "claude-sonnet-5",
      maxTokens: 8192,
      systemPrompt: REFLEXUS_SYSTEM_PROMPT,
      userPrompt: getReflexusUserPrompt(language, reflexus),
    });
  }

  if (imago) {
    return callClaudeStream(env, {
      model: "claude-sonnet-5",
      maxTokens: 8192,
      systemPrompt: IMAGO_SYSTEM_PROMPT,
      userPrompt: getImagoUserPrompt(language, imago),
    });
  }

  if (astro) {
    const systemPrompt = astro.theme ? ASTRO_THEME_SYSTEM_PROMPT : ASTRO_SYSTEM_PROMPTS[astro.discipline] ? ASTRO_SYSTEM_PROMPTS[astro.discipline] + ASTRO_ESSENTIALS_INSTRUCTION : undefined;
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Unknown astro discipline" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return callClaudeStream(env, {
      model: "claude-sonnet-5",
      maxTokens: 8192,
      systemPrompt,
      userPrompt: astro.theme ? getAstroThemeUserPrompt(language,astro) : getAstroUserPrompt(language, astro.discipline, astro.focus, astro.focusIndex, astro.data, astro.context),
    });
  }

  if (!cards || cards.length === 0 || !spread) {
    return new Response(JSON.stringify({ error: "No cards provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cardEntries = cards.map((c) => `${c.label}: ${c.card}${c.reversed ? " (reversed)" : ""}`);
  const cardList = cardEntries.map((entry, i) => `${i + 1}. ${entry}`).join("\n");

  if (followup) {
    return callClaude(env, {
      model: "claude-sonnet-5",
      maxTokens: 1200,
      systemPrompt: FOLLOWUP_SYSTEM_PROMPT,
      userPrompt: getFollowupUserPrompt(language, spread, cardList, followup.question),
      extractFollowup: false,
    });
  }

  const systemPrompt = (SYSTEM_PROMPTS[discipline] || SYSTEM_PROMPTS.tarot) + FOLLOWUP_QUESTION_INSTRUCTION;
  const userPrompt = getUserPrompt(language, spread, question, cardList, analysis, cards.length, cardEntries);

  return callClaude(env, {
    model: modelFor(discipline, cards.length),
    maxTokens: Math.min(2048 + cards.length * 400, 8192),
    systemPrompt,
    userPrompt,
    extractFollowup: true,
  });
}

async function callClaude(env: Env, opts: { model: string; maxTokens: number; systemPrompt: string; userPrompt: string; extractFollowup: boolean }): Promise<Response> {
  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        system: [{ type: "text", text: opts.systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: opts.userPrompt }],
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
    // Sonnet can return a "thinking" block before the "text" block — never assume
    // content[0] is the answer; some models don't include a thinking block at all.
    const rawText = data.content?.find((block) => block.type === "text")?.text ?? "";
    const { interpretation, followupQuestion } = opts.extractFollowup
      ? extractFollowupQuestion(rawText)
      : { interpretation: rawText.trim(), followupQuestion: null };

    return new Response(JSON.stringify({ interpretation, followup_question: followupQuestion }), {
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

// Streams text deltas back to the client as they're generated instead of
// waiting for the full ~4096-token response — Astros readings take 30-40s
// on Sonnet, and a static spinner for that long reads as broken.
async function callClaudeStream(env: Env, opts: { model: string; maxTokens: number; systemPrompt: string; userPrompt: string }): Promise<Response> {
  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: [{ type: "text", text: opts.systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: opts.userPrompt }],
      stream: true,
    }),
  });

  if (!anthropicResponse.ok || !anthropicResponse.body) {
    const detail = await anthropicResponse.text().catch(() => "");
    return new Response(JSON.stringify({ error: "Claude API error", detail }), {
      status: anthropicResponse.status || 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const upstream = anthropicResponse.body;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.getReader();
      const blockTypes = new Map<number, string>();
      let buffer = "";
      let relayedAny = false;
      let stopReason: string | undefined;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let event: any;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }
            if (event.type === "content_block_start") {
              blockTypes.set(event.index, event.content_block?.type);
            } else if (event.type === "content_block_delta") {
              // Sonnet can emit a "thinking" block before the "text" block —
              // only relay actual answer text to the client.
              if (blockTypes.get(event.index) === "text" && event.delta?.type === "text_delta") {
                relayedAny = true;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
              }
            } else if (event.type === "message_delta") {
              stopReason = event.delta?.stop_reason || stopReason;
            }
          }
        }
        if (!relayedAny) {
          console.error("callClaudeStream: no text relayed", { stopReason, blockTypes: Object.fromEntries(blockTypes) });
        }
      } catch (streamError) {
        console.error("callClaudeStream: reader loop threw", streamError);
      } finally {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ─── Account Deletion ───────────────────────────────────────────────────────

async function handleDeleteAccount(request: Request, env: Env): Promise<Response> {
  const cors = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
  }

  const authHeader = request.headers.get("Authorization") || "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401, headers: cors });
  }

  const whoami = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${accessToken}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!whoami.ok) {
    return new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401, headers: cors });
  }
  const account = (await whoami.json()) as { id?: string };
  if (!account.id) {
    return new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401, headers: cors });
  }

  const serviceHeaders = {
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  };

  await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${account.id}`, {
    method: "DELETE",
    headers: serviceHeaders,
  });

  const deleted = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${account.id}`, {
    method: "DELETE",
    headers: serviceHeaders,
  });
  if (!deleted.ok) {
    return new Response(JSON.stringify({ error: "No se pudo eliminar la cuenta" }), { status: 502, headers: cors });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
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

    if (url.pathname === "/api/delete-account") {
      return handleDeleteAccount(request, env);
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
