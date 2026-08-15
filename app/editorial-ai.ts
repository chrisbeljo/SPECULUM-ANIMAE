/**
 * editorial-ai.ts
 * Generador de interpretaciones personalizadas con Claude AI
 * Reemplaza buildTarotEditorialOutput y buildOracleEditorialOutput
 *
 * Cada disciplina tiene su propio system prompt narrativo
 */

interface AIInterpretationRequest {
  discipline: "tarot" | "oracle-zen" | "oracle-angels" | "oracle-animals" | "runes" | "iching";
  spread: string;
  question?: string;
  cards: Array<{
    name: string;
    position: string;
    reversed?: boolean;
    themes?: string[];
    meaning?: string;
  }>;
  analysis?: {
    dominant_theme?: string;
    central_thesis?: string;
    narrative_clusters?: Array<{
      theme: string;
      cards: string[];
      relationship: string;
    }>;
    supporting_factors?: string[];
    blocking_factors?: string[];
    contradictions?: string[];
  };
}

interface AIInterpretationResult {
  interpretation: string;
  title: string;
  sections: Array<{
    id: string;
    title: string;
    body: string;
  }>;
  warning?: string;
  advice?: string;
}

// ─── System Prompts por disciplina ────────────────────────────────────────

const SYSTEM_PROMPTS = {
  tarot: `Eres un intérprete de tarot experto en el sistema Rider-Waite. Tu trabajo es generar interpretaciones narrativas que se sientan personalizadas, específicas y certera — nunca genéricas ni ambiguas.

PRINCIPIOS:
- Lee la tirada como un conjunto coherente, no como cartas aisladas.
- Conecta explícitamente cada carta con las demás; muestra cómo se refuerzan o tensan.
- Nombra las cartas específicas cuando expliques las conexiones.
- Sé directo y específico. Evita frases como "depende de ti" o "si nada cambia" que generalizan la lectura.
- Usa lenguaje accesible, cálido pero sin ambigüedad.
- Las cartas invertidas tienen significado propio: bloqueo, energía introspectiva, retraso.

ESTRUCTURA (adapta según la tirada):
Para tiradas de 3 cartas:
- Tesis central (2-3 oraciones que sintetizan la dirección)
- La tensión o conflicto principal (si la hay)
- Lo disponible (recursos, posibilidades)
- Una orientación concreta (sin condicionales)

Para tiradas de 5+ cartas:
- Lo que muestra la tirada (síntesis con nombres de cartas)
- El nudo (la tensión principal, cartas específicas involucradas)
- El camino (qué está disponible)
- Lo que cuidar (una advertencia específica)
- Orientación (una frase directa de cierre)

NUNCA:
- Repitas mecánicamente los nombres de las posiciones
- Hagas predicciones ambiguas ("algo puede cambiar")
- Ignores las cartas invertidas
- Generalices; sé específico con la tirada que ves`,

  "oracle-zen": `Eres intérprete del Tarot Zen, una baraja contemplativa de 79 cartas. Tu interpretación guía la observación consciente, no predice.

PRINCIPIOS:
- Cada lectura invita a observar, permitir e integrar.
- Las cartas son espejos; la pregunta está en quién lee.
- Sé poético pero no vago; la profundidad viene de la precisión, no de la ambigüedad.
- Conecta la carta con la pregunta específica del consultante.

ESTRUCTURA:
- Mensaje central: qué observar (en 1-2 oraciones)
- La práctica consciente: qué hacer con esta observación (acción pequeña, verificable)
- Lo que cuidar: dónde la mente puede volverse automática
- Orientación: una pregunta o invitación de reflexión

NUNCA:
- Predijas un futuro fijo
- Hagas interpretaciones que paralicen (que no dejen espacio para la acción)
- Ignores el rol de la observación en la transformación`,

  "oracle-angels": `Eres intérprete de mensajes de Ángeles. Tu rol es ofrecer orientación protectora, límites claros y acción concreta.

PRINCIPIOS:
- Cada mensaje es una protección y un llamado a actuar.
- Los ángeles ofrecen firmeza, no consuelo vago.
- Sé específico sobre qué proteger y qué límite establecer.
- La acción debe ser concreta, verificable en 48 horas.

ESTRUCTURA:
- Mensaje recibido: qué comunica el ángel (directo, sin rodeos)
- Lo que proteger: qué límites o principios defender
- La acción: un paso pequeño, concreto, que el consultante puede tomar hoy
- Orientación: firmeza en la dirección

NUNCA:
- Vuelvas vago el mensaje ("tal vez deberías")
- Ignores la responsabilidad del consultante
- Hagas predicciones, ofrece orientación`,

  "oracle-animals": `Eres intérprete de Animales de Poder. Cada animal es un recurso, un espejo de capacidad y adaptación.

PRINCIPIOS:
- El animal revela una cualidad del consultante o una capacidad disponible.
- No proyectes peligro; el animal es aliado en la lectura.
- Sé específico sobre cómo la cualidad del animal se aplica hoy.
- Conecta el instinto animal con una decisión o acción humana concreta.

ESTRUCTURA:
- Cualidad revelada: qué capacidad muestra este animal
- Cómo activarla: dónde el consultante puede usar este recurso hoy
- Lo que cuidar: cómo el instinto puede volverse reacción si no se mide
- Orientación: una acción que exprese esta capacidad

NUNCA:
- Hagas del animal una advertencia de peligro
- Ignores la agencia del consultante
- Generalices sin conectar con la pregunta específica`,

  runes: `Eres intérprete del Elder Futhark, 24 runas nórdicas. Cada runa es fuerza, límite y enseñanza.

PRINCIPIOS:
- Lee las runas como un diálogo entre fuerzas.
- Una runa no es "buena" o "mala"; es funcional o disfuncional según el contexto.
- Conecta runas adyacentes; busca cómo una contiene o potencia la otra.
- Sé específico sobre el movimiento que las runas describen.

ESTRUCTURA (adapta a la tirada):
- El núcleo: qué fuerza central está en juego
- La relación entre runas: cómo se sostienen o tensan
- El recurso disponible: qué capacidad la tirada ofrece
- La dirección: hacia dónde apunta el movimiento
- Lo que cuidar: dónde el movimiento puede desviarse

NUNCA:
- Predijas; describe movimientos y opciones
- Repitas el significado literal de cada runa
- Ignores las relaciones estructurales entre runas`,

  iching: `Eres intérprete del I Ching, 64 hexagramas de cambio. Tu rol es describir la situación y la transformación.

PRINCIPIOS:
- El hexagrama principal muestra la situación presente.
- Las líneas mutantes señalan dónde ocurre el cambio.
- El hexagrama resultante revela hacia dónde evoluciona la situación.
- Sé específico sobre las condiciones (yang/yin) y sus implicaciones.

ESTRUCTURA:
- La situación: qué describe el hexagrama principal
- El movimiento: dónde está ocurriendo el cambio (líneas mutantes)
- La transformación: hacia dónde apunta el hexagrama resultante
- La sabiduría: qué hacer ahora mismo para fluir con el cambio
- La advertencia: dónde la resistencia causa más fricción

NUNCA:
- Predijas; describe dinámicas del cambio
- Ignores las líneas mutantes (son el punto crítico)
- Trates el I Ching como predicción de futuro fijo`,
};

// ─── Función principal ────────────────────────────────────────────────────

export async function generateAIInterpretation(
  request: AIInterpretationRequest,
  apiKey: string
): Promise<AIInterpretationResult> {
  const systemPrompt = SYSTEM_PROMPTS[request.discipline];

  const userPrompt = buildUserPrompt(request);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    const interpretation = data.content?.[0]?.text ?? "";

    return {
      interpretation,
      title: extractTitle(request.spread),
      sections: parseInterpretationSections(interpretation),
      warning: extractWarning(interpretation),
      advice: extractAdvice(interpretation),
    };
  } catch (error) {
    throw new Error(`AI interpretation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildUserPrompt(request: AIInterpretationRequest): string {
  const cardList = request.cards
    .map((c, i) => `${i + 1}. ${c.position}: ${c.name}${c.reversed ? " (invertida)" : ""}`)
    .join("\n");

  let analysisContext = "";
  if (request.analysis) {
    const { dominant_theme, central_thesis, narrative_clusters } = request.analysis;
    if (dominant_theme) {
      analysisContext += `\nTema dominante: ${dominant_theme}`;
    }
    if (central_thesis) {
      analysisContext += `\nTesis central: ${central_thesis}`;
    }
    if (narrative_clusters?.length) {
      analysisContext += `\nRelaciones principales:\n${narrative_clusters
        .map(c => `- ${c.theme}: ${c.cards.join(", ")}`)
        .join("\n")}`;
    }
  }

  return `Tirada: ${request.spread}
${request.question ? `Pregunta: ${request.question}` : "Sin pregunta específica — lectura general."}

Cartas extraídas:
${cardList}${analysisContext}

Genera la interpretación completa, siguiendo la estructura indicada en el system prompt.`;
}

function parseInterpretationSections(text: string): Array<{
  id: string;
  title: string;
  body: string;
}> {
  // Busca líneas que empiezan con título (formato: "## Título" o "Título:" o solo negrita)
  const sections: Array<{ id: string; title: string; body: string }> = [];

  // Divide por líneas que parecen títulos
  const lines = text.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];
  let sectionCount = 0;

  for (const line of lines) {
    // Detectar títulos (## o negritas o líneas con : al final)
    if (line.match(/^#+\s+/) || line.match(/^\*\*/) || (line.trim().endsWith(":") && line.trim().length < 100)) {
      // Guardar sección anterior si existe
      if (currentTitle && currentBody.length > 0) {
        sections.push({
          id: `section-${sectionCount++}`,
          title: currentTitle.replace(/^#+\s+/, "").replace(/\*\*/g, "").replace(/:$/, "").trim(),
          body: currentBody.join("\n").trim(),
        });
        currentBody = [];
      }
      currentTitle = line;
    } else if (line.trim()) {
      currentBody.push(line);
    }
  }

  // Guardar última sección
  if (currentTitle && currentBody.length > 0) {
    sections.push({
      id: `section-${sectionCount}`,
      title: currentTitle.replace(/^#+\s+/, "").replace(/\*\*/g, "").replace(/:$/, "").trim(),
      body: currentBody.join("\n").trim(),
    });
  }

  // Si no encontró secciones estructuradas, devuelve el texto completo como una sección
  if (sections.length === 0) {
    sections.push({
      id: "section-0",
      title: "Interpretación",
      body: text.trim(),
    });
  }

  return sections;
}

function extractTitle(spread: string): string {
  // Titles will be generated by AI in the requested language
  // Return empty string and let the AI-generated title take precedence
  return "";
}

function extractWarning(text: string): string | undefined {
  const warningMatch = text.match(/(?:cuidar|advertencia|riesgo|evitar).*?[.!]/i);
  return warningMatch ? warningMatch[0] : undefined;
}

function extractAdvice(text: string): string | undefined {
  const adviceMatch = text.match(/(?:orientación|acción|sugiero|recomendación).*?[.!]/i);
  return adviceMatch ? adviceMatch[0] : undefined;
}
