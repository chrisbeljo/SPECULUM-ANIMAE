# ORÁCULO — laboratorio simbólico local

Primer MVP funcional para explorar Tarot, Runas, I Ching, Numerología, Ángeles y una síntesis multidisciplinaria mediante **Analyst**. Funciona sin cuentas, pagos, base de datos ni IA externa. El historial vive en `localStorage` del navegador.

> Las interpretaciones son recursos de entretenimiento, reflexión y autoconocimiento. No sustituyen asesoramiento médico, psicológico, legal o financiero profesional.

## Ejecutar

Requiere Node.js 22.13 o posterior.

```bash
npm install
npm run dev
```

Abre la dirección local que aparece en la terminal (normalmente `http://localhost:3000`). Para validar una versión de producción:

```bash
npm run build
npm test
```

## Qué incluye

- Home orientada a la necesidad del usuario, no a la disciplina.
- Consultor breve: pregunta, categoría y contexto.
- Tarot funcional con selección criptográfica sin duplicados, invertidas y cinco tiradas configurables.
- Imágenes Rider–Waite–Smith “Pam-A” de dominio público para todas las cartas disponibles en la biblioteca del MVP.
- Disposición visual propia para una carta, tres cartas, relación, decisión por caminos y Cruz Celta tradicional.
- Interpretación contextual posición por posición basada en la pregunta, categoría y respuestas entregadas al Consultor.
- Runas con tirada situación / obstáculo / consejo.
- Motor I Ching de seis líneas, líneas mutantes y hexagrama resultante.
- Numerología determinista: Camino de Vida, nacimiento, expresión, alma, personalidad, año y mes personal.
- Consulta Integral; cada disciplina produce una salida estándar independiente.
- Analyst local por reglas: coincidencias, diferencias, obstáculos, oportunidades, consejo y nivel de convergencia sin porcentajes falsos.
- Reporte imprimible, descarga HTML y guardado local.
- Biblioteca con búsqueda y catálogos completos: 78 cartas Rider–Waite–Smith, 24 runas Elder Futhark, 64 hexagramas del I Ching y una baraja original de 44 Mensajes de los Ángeles.
- Colecciones ampliadas: referencia estructural de 79 cartas Osho Zen sin imágenes comerciales, Oráculo original de 44 Animales de Poder, referencia cultural de Chamalongos, 72 tripletes hebreos y Árbol de la Vida con 10 sefirot y 22 senderos.
- Estados de revisión preparados (`AI_GENERATED`) y contenidos DEMO identificados.

## Arquitectura

- `app/page.tsx`: experiencia, motores locales y componentes del MVP.
- `app/globals.css`: sistema visual responsive.
- `data/spreads.json`: tiradas declarativas.
- `public/cards/rws`: imágenes locales Rider–Waite–Smith procedentes de Wikimedia Commons.
- `public/oracles`: arte original generado para Ángeles, fichas rúnicas individuales de madera tallada e I Ching.
- `locales/es.json`, `locales/en.json`: base de internacionalización.
- `config.json`: proveedor/modelo LLM, modo demo, debug y disciplinas activas.
- `.env.example`: variables futuras sin secretos.
- `tests/core.test.mjs`: pruebas de los invariantes principales.

La salida normalizada por disciplina contiene `method`, `raw_result`, `themes`, `obstacles`, `opportunities`, `advice` e `interpretation`. Analyst sólo consume esa salida; nunca vuelve a ejecutar una tirada.

## IA

El modo actual es `mock/local-rules` y no envía información fuera del dispositivo. `config.json` deja preparada la selección de proveedor. Para integrar Ollama u OpenAI, crea un adaptador que reciba la salida normalizada y devuelva texto estructurado, informa al usuario antes de enviar datos y carga secretos exclusivamente desde `.env`.

Nunca guardes API keys en `config.json` ni en el repositorio.

## Añadir contenido

### Carta

Añade un objeto con `id`, nombres ES/EN, arcano, palo, número, palabras clave, significados por categoría, consejo, simbolismo, inversión e imagen. Los placeholders visuales aceptan reemplazo posterior mediante el campo `image`.

### Tirada

Añade una entrada a `data/spreads.json` con nombre y lista de posiciones; después exponla en el selector. El motor usa la longitud de `positions`, por lo que no se programa el reparto carta por carta.

### Disciplina

1. Crea su biblioteca independiente.
2. Implementa un generador determinista o aleatorio según corresponda.
3. Devuelve el contrato normalizado.
4. Añade etiqueta, selector, visualización y prueba.
5. No mezcles significados editoriales entre disciplinas.

### Traducción

Agrega las claves a ambos archivos en `locales/`. El selector ES/EN ya está visible; la conexión completa de todos los textos a estos diccionarios es la siguiente etapa de internacionalización.

## LAB

Abre `LAB` desde la navegación. Permite disparar Tarot, Runas, I Ching o Ángeles, activar debug, inspeccionar el resultado normalizado y copiar JSON. Para probar Analyst con varias fuentes, utiliza `Integral`.

## Límites conscientes del MVP

- La biblioteca contiene una muestra editorial, no las 78 cartas ni los 64 textos completos.
- Ángeles es contenido demostrativo; Osho queda estructuralmente previsto pero no se presenta como contenido completo.
- Astrología muestra que el motor está pendiente; no inventa posiciones planetarias.
- Quiromancia y análisis visual quedan pendientes; no se simulan conclusiones sobre fotos.
- El selector de idioma demuestra la arquitectura, pero la traducción integral de interfaz está pendiente.
- PDF, PWA, revisión humana real y conectores LLM son futuras integraciones.

## Privacidad

Sin un proveedor LLM activado, el proyecto no transmite preguntas. El historial puede borrarse por consulta o por completo desde `Historial`. Descargar un reporte crea un archivo HTML en el equipo del usuario.

## Imágenes y licencia

Las imágenes Rider–Waite–Smith incluidas corresponden al conjunto “Pam-A” de Pamela Colman Smith (1910), publicado en Wikimedia Commons con marca de dominio público. Se guardan localmente para no depender de servicios externos durante una lectura. Evita sustituirlas por recolorizaciones modernas sin revisar sus derechos.
