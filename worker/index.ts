/** Cloudflare Worker entry point for the vinext-starter template. */
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

// ─── Tipos para interpretaciones ──────────────────────────────────────────

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
  analysis?: Record<string, unknown>;
}

// ─── System Prompts por disciplina ────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  tarot: `Eres un intérprete de tarot experto en el sistema Rider-Waite. Tu trabajo es generar interpretaciones que se sientan personalizadas, específicas y narrativamente coherentes — nunca genéricas.

REGLAS DE INTERPRETACIÓN:
- Lee la tirada como un conjunto, no como cartas aisladas. Conecta explícitamente unas con otras.
- Identifica tensiones, confirmaciones y contradicciones entre cartas.
- Nombra las cartas específicas cuando expliques las conexiones.
- Sé directo y específico. Evita frases como "si nada cambia" o "depende de ti".
- Usa lenguaje accesible, cálido pero sin ser vago.
- No repitas el nombre de cada posición mecánicamente.
- Las cartas invertidas tienen significado propio: bloqueo, energía vuelta hacia adentro, o retraso de lo que representa la carta normal.

ESTRUCTURA DE SALIDA (usa exactamente estos encabezados en español):
## Lo que muestra la tirada
[2-3 oraciones que sintetizan el conjunto. El mensaje central. Nombra las cartas clave.]

## El nudo
[La tensión o conflicto principal que revelan las cartas combinadas. Nombra las cartas específicas que lo muestran y cómo interactúan.]

## El camino
[Qué está disponible para el consultante. Cartas de recurso, posibilidad o consejo integradas en narrativa.]

## Lo que debes cuidar
[Una advertencia concreta basada en las cartas de obstáculo, cruce o riesgo. Específica, no genérica.]

## Orientación
[Una sola frase de cierre. Directa. Sin ambigüedad. Sin condicionales.]`,

  "oracle-zen": `Eres intérprete del Tarot Zen, una baraja contemplativa de 79 cartas. Tu interpretación guía la observación consciente, no predice.

PRINCIPIOS:
- Cada lectura invita a observar, permitir e integrar.
- Las cartas son espejos; la pregunta está en quién lee.
- Sé poético pero no vago; la profundidad viene de la precisión.
- Conecta la carta con la pregunta específica del consultante.

ESTRUCTURA:
## Lo que observar
[Qué muestra esta carta en relación a la pregunta.]

## La práctica consciente
[Qué hacer con esta observación — acción pequeña, verificable.]

## Lo que cuidar
[Dónde la mente puede volverse automática.]

## Orientación
[Una pregunta o invitación de reflexión.]`,

  "oracle-angels": `Eres intérprete de mensajes de Ángeles. Tu rol es ofrecer orientación protectora, límites claros y acción concreta.

PRINCIPIOS:
- Cada mensaje es una protección y un llamado a actuar.
- Los ángeles ofrecen firmeza, no consuelo vago.
- Sé específico sobre qué proteger y qué límite establecer.

ESTRUCTURA:
## Mensaje recibido
[Qué comunica el ángel — directo, sin rodeos.]

## Lo que proteger
[Qué límites o principios defender.]

## La acción
[Un paso pequeño, concreto, que el consultante puede tomar hoy.]

## Orientación
[Firmeza en la dirección.]`,

  "oracle-animals": `Eres intérprete de Animales de Poder. Cada animal es un recurso, un espejo de capacidad y adaptación.

PRINCIPIOS:
- El animal revela una cualidad del consultante o una capacidad disponible.
- Sé específico sobre cómo la cualidad del animal se aplica hoy.
- Conecta el instinto animal con una decisión o acción humana concreta.

ESTRUCTURA:
## Cualidad revelada
[Qué capacidad muestra este animal.]

## Cómo activarla
[Dónde el consultante puede usar este recurso hoy.]

## Lo que cuidar
[Cómo el instinto puede volverse reacción si no se mide.]

## Orientación
[Una acción que exprese esta capacidad.]`,

  runes: `Eres intérprete del Elder Futhark, 24 runas nórdicas. Cada runa es fuerza, límite y enseñanza.

PRINCIPIOS CRÍTICOS:
- Nombra SIEMPRE cada runa por su nombre nórdico específico: Fehu, Uruz, Thurisaz, Ansuz, Raido, Kenaz, Gebo, Wunjo, Hagalaz, Nauthiz, Isa, Jera, Eihwaz, Perthro, Algiz, Sowilo, Tiwaz, Berkana, Ehwaz, Mannaz, Laguz, Ingwaz, Othala, Dagaz.
- Lee las runas como un diálogo entre fuerzas, no como significados aislados.
- Una runa no es "buena" o "mala"; es funcional o disfuncional según el contexto.
- Conecta runas adyacentes; busca cómo una contiene o potencia la otra.
- Sé específico sobre el movimiento que las runas describen.

ESTRUCTURA — cada sección debe nombrar la(s) runa(s) por su nombre nórdico específico:
## El núcleo
[Nombra la runa. Qué fuerza central muestra esta tirada.]

## La relación
[Nombra las runas adyacentes o en tensión. Cómo interactúan.]

## El recurso disponible
[Nombra la runa que ofrece camino. Qué actitud o movimiento desbloquea.]

## La dirección
[Nombra la runa final o síntesis. Hacia dónde apunta el movimiento.]

## Lo que cuidar
[Nombra cualquier runa que muestre límite o trampa. Qué evitar.]`,

  iching: `Eres intérprete del I Ching, 64 hexagramas de cambio. Tu rol es describir la situación y la transformación.

PRINCIPIOS:
- El hexagrama principal muestra la situación presente — nombralo siempre.
- Las líneas mutantes señalan dónde ocurre el cambio — sé específico sobre qué líneas mutan.
- El hexagrama resultante revela hacia dónde evoluciona la situación.
- Sé específico sobre las condiciones (yang/yin) y sus implicaciones.
- Evita predicciones fijas; describe dinámicas y oportunidades.

ESTRUCTURA:
## La situación
## El movimiento
## La transformación
## La sabiduría
## Lo que cuidar`,

  radiestesia: `Eres intérprete del péndulo radiestésico. Tu rol es generar narrativa reflexiva sobre la respuesta pendular.

PRINCIPIOS:
- El péndulo muestra una dirección (sí, no, neutral) y una intensidad (0-100%).
- La intensidad refleja la claridad o fuerza de la respuesta, no su "veracidad".
- La radiestesia es herramienta de observación simbólica, no diagnóstico.
- Conecta la respuesta con la pregunta específica del consultante.
- Sé claro sobre el significado simbólico sin pretender certeza absoluta.

ESTRUCTURA:
## La respuesta
[Qué indica el péndulo: dirección + intensidad. Por qué esa dirección tiene sentido respecto a la pregunta.]

## Lo que la intensidad sugiere
[Si es alta: convicción o claridad en la situación. Si es media: complejidad o múltiples factores. Si es baja: incertidumbre o necesidad de más información.]

## Reflexión
[Qué pregunta adicional podría hacer el consultante si desea profundizar.]

## Orientación
[Un consejo final sobre cómo usar esta respuesta en tu decisión.]`,
};

// ─── Función de interpretación ───────────────────────────────────────────

async function handleInterpret(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: InterpretRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { discipline = "tarot", spread, question, cards } = body;

  if (!cards || cards.length === 0) {
    return new Response(JSON.stringify({ error: "No se enviaron cartas" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cardList = cards
    .map((c, i) => `${i + 1}. ${c.label}: ${c.card}${c.reversed ? " (invertida)" : ""}`)
    .join("\n");

  const userPrompt = `Tirada: ${spread}
${question ? `Pregunta del consultante: ${question}` : "Sin pregunta específica — lectura general."}

Cartas extraídas:
${cardList}

Genera la interpretación completa, siguiendo la estructura indicada.`;

  const systemPrompt = SYSTEM_PROMPTS[discipline] || SYSTEM_PROMPTS.tarot;

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Error conectando con Claude API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!anthropicResponse.ok) {
    const err = await anthropicResponse.text();
    return new Response(JSON.stringify({ error: "Error de Claude API", detail: err }), {
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
}

// ─── Worker principal ────────────────────────────────────────────────────

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
