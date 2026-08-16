"use client";

import { useState } from "react";
import type { Language } from "../translations";
import { ChamalongoCast } from "./ChamalongoCast";

type ChamalongosSiteProps = { lang: Language; onBack: () => void };
type Step = "menu" | "cast";
type Focus = { title: string; description: string };
type ChamalongosCopy = { back: string; backToFocuses: string; eyebrow: string; title: string; intro: string[]; culturalNote: string; choose: string; count: string; instruction: string; result: string; focuses: Focus[] };

const copy: Record<Language, ChamalongosCopy> = {
  ES: {
    back: "Volver al inicio", backToFocuses: "Elegir otro enfoque", eyebrow: "CAÍDA · CONFIGURACIÓN · ORIENTACIÓN", title: "Chamalongos",
    intro: ["Los chamalongos son un sistema oracular del Palo Monte o Regla de Palo, tradición afrocubana de raíz bantú desarrollada en Cuba y otras regiones del Caribe a partir de los saberes preservados por personas congas esclavizadas durante la colonia. Su historia está ligada al uso ritual de conchas y piezas de coco, relacionado con voces bantúes como nkombe o nkobo.", "El juego tradicional consta de cuatro piezas de coco seco. La boca —la cara interior, blanca y pulida— se asocia con la luz, la vida y el asentimiento; la espalda —la cáscara exterior, oscura y rugosa— se relaciona con la oscuridad, la muerte y la negación. Al arrojarlas sobre una estera o tablero, la combinación se interpreta como una sola señal.", "En su contexto religioso, la consulta busca establecer comunicación con los Mpungus, las fuerzas de la naturaleza y los ancestros, con la mediación del fundamento o Nganga. Para recibir el mensaje no basta con contar las caras visibles: es indispensable mantener la intuición abierta como canal de escucha y comunicación entre la pregunta, la caída y su significado."],
    culturalNote: "Las denominaciones y lecturas varían entre ramas y casas. Esta experiencia no enseña consagraciones ni sustituye la guía de una persona iniciada.",
    choose: "Elige el enfoque", count: "1 consulta", instruction: "Respira profundo, mantén tu pregunta presente y pide a tus guías confirmar o no.", result: "Configuración obtenida",
    focuses: [{ title: "Consulta general", description: "Panorama y orientación del momento" }, { title: "Decisiones", description: "Dirección ante una elección concreta" }, { title: "Relaciones", description: "Dinámica, apertura y equilibrio del vínculo" }, { title: "Camino personal", description: "Movimiento, bloqueo y próximo paso" }],
  },
  EN: {
    back: "Back to home", backToFocuses: "Choose another focus", eyebrow: "CAST · PATTERN · GUIDANCE", title: "Chamalongos",
    intro: ["Chamalongos are an oracular system of Palo Monte, or Regla de Palo, an Afro-Cuban tradition with Bantu roots developed in Cuba and other parts of the Caribbean from knowledge preserved by enslaved Kongo people during the colonial period. Their history is tied to the ritual use of shells and coconut pieces, associated with Bantu words such as nkombe or nkobo.", "The traditional set consists of four pieces of dried coconut. The mouth—the white, polished inner face—is associated with light, life, and affirmation; the back—the dark, rough outer shell—is associated with darkness, death, and denial. When cast onto a mat or board, the combination is interpreted as a single sign.", "Within its religious context, the consultation seeks communication with the Mpungus, the forces of nature, and the ancestors through the mediation of the foundation, or Nganga. Receiving the message requires more than counting visible faces: intuition must remain open as an essential channel of listening and communication between the question, the cast, and its meaning."],
    culturalNote: "Names and readings vary between lineages and houses. This experience does not teach consecrations or replace the guidance of an initiated practitioner.",
    choose: "Choose a focus", count: "1 consultation", instruction: "Take a deep breath, keep your question present, and ask your guides for confirmation or denial.", result: "Pattern obtained",
    focuses: [{ title: "General consultation", description: "A view and guidance for the present" }, { title: "Decisions", description: "Direction for a concrete choice" }, { title: "Relationships", description: "Dynamics, openness, and balance" }, { title: "Personal path", description: "Movement, blockage, and next step" }],
  },
  FR: {
    back: "Retour à l’accueil", backToFocuses: "Choisir une autre approche", eyebrow: "LANCER · CONFIGURATION · ORIENTATION", title: "Chamalongos",
    intro: ["Les chamalongos constituent un système oraculaire du Palo Monte, ou Regla de Palo, une tradition afro-cubaine d’origine bantoue développée à Cuba et dans d’autres régions des Caraïbes à partir des savoirs préservés par des personnes congolaises réduites en esclavage durant la période coloniale. Leur histoire est liée à l’usage rituel de coquillages et de morceaux de noix de coco, associé à des mots bantous tels que nkombe ou nkobo.", "Le jeu traditionnel comprend quatre morceaux de noix de coco séchée. La bouche —la face intérieure, blanche et polie— est associée à la lumière, à la vie et à l’assentiment ; le dos —la coque extérieure, sombre et rugueuse— est associé à l’obscurité, à la mort et à la négation. Lorsqu’elles sont lancées sur une natte ou un plateau, les pièces forment un seul signe à interpréter.", "Dans son contexte religieux, la consultation cherche à établir une communication avec les Mpungus, les forces de la nature et les ancêtres, par l’intermédiaire du fondement ou Nganga. Recevoir le message ne consiste pas seulement à compter les faces visibles : l’intuition doit rester ouverte comme canal indispensable d’écoute et de communication entre la question, le lancer et sa signification."],
    culturalNote: "Les noms et les lectures varient selon les lignées et les maisons. Cette expérience n’enseigne pas les consécrations et ne remplace pas l’accompagnement d’une personne initiée.",
    choose: "Choisissez l’approche", count: "1 consultation", instruction: "Respirez profondément, gardez votre question présente et demandez à vos guides de confirmer ou non.", result: "Configuration obtenue",
    focuses: [{ title: "Consultation générale", description: "Vue d’ensemble et orientation du moment" }, { title: "Décisions", description: "Direction face à un choix concret" }, { title: "Relations", description: "Dynamique, ouverture et équilibre du lien" }, { title: "Chemin personnel", description: "Mouvement, blocage et prochaine étape" }],
  },
  DE: {
    back: "Zurück zum Anfang", backToFocuses: "Anderen Schwerpunkt wählen", eyebrow: "WURF · MUSTER · ORIENTIERUNG", title: "Chamalongos",
    intro: ["Chamalongos sind ein Orakelsystem des Palo Monte oder der Regla de Palo, einer afrokubanischen Tradition mit Bantu-Wurzeln, die sich in Kuba und anderen Teilen der Karibik aus dem von versklavten Kongolesen während der Kolonialzeit bewahrten Wissen entwickelte. Ihre Geschichte ist mit der rituellen Verwendung von Muscheln und Kokosnussstücken verbunden, die mit Bantu-Wörtern wie nkombe oder nkobo in Beziehung gebracht werden.", "Das traditionelle Set besteht aus vier getrockneten Kokosnussstücken. Der Mund —die weiße, polierte Innenseite— wird mit Licht, Leben und Zustimmung verbunden; der Rücken —die dunkle, raue Außenschale— mit Dunkelheit, Tod und Verneinung. Beim Wurf auf eine Matte oder ein Brett wird die Kombination als ein einziges Zeichen gedeutet.", "In seinem religiösen Kontext sucht das Orakel die Kommunikation mit den Mpungus, den Naturkräften und den Ahnen durch die Vermittlung des Fundaments oder Nganga. Die Botschaft zu empfangen bedeutet mehr, als sichtbare Seiten zu zählen: Die Intuition muss als unverzichtbarer Kanal des Zuhörens und der Kommunikation zwischen Frage, Wurf und Bedeutung offen bleiben."],
    culturalNote: "Bezeichnungen und Lesarten unterscheiden sich je nach Linie und Haus. Diese Erfahrung lehrt keine Weihen und ersetzt nicht die Begleitung einer eingeweihten Person.",
    choose: "Schwerpunkt wählen", count: "1 Beratung", instruction: "Atmen Sie tief durch, behalten Sie Ihre Frage im Sinn und bitten Sie Ihre geistigen Begleiter um Bestätigung oder Verneinung.", result: "Erhaltenes Muster",
    focuses: [{ title: "Allgemeine Beratung", description: "Überblick und Orientierung für den Moment" }, { title: "Entscheidungen", description: "Richtung bei einer konkreten Wahl" }, { title: "Beziehungen", description: "Dynamik, Offenheit und Gleichgewicht" }, { title: "Persönlicher Weg", description: "Bewegung, Blockade und nächster Schritt" }],
  },
  PT: {
    back: "Voltar ao início", backToFocuses: "Escolher outro enfoque", eyebrow: "QUEDA · CONFIGURAÇÃO · ORIENTAÇÃO", title: "Chamalongos",
    intro: ["Os chamalongos são um sistema oracular do Palo Monte, ou Regla de Palo, tradição afro-cubana de raiz banta desenvolvida em Cuba e em outras regiões do Caribe a partir dos saberes preservados por pessoas congolesas escravizadas durante o período colonial. Sua história está ligada ao uso ritual de conchas e pedaços de coco, associado a palavras bantas como nkombe ou nkobo.", "O jogo tradicional é formado por quatro pedaços de coco seco. A boca —a face interna, branca e polida— associa-se à luz, à vida e ao assentimento; as costas —a casca externa, escura e áspera— relacionam-se à escuridão, à morte e à negação. Ao serem lançadas sobre uma esteira ou tabuleiro, as peças formam um único sinal a ser interpretado.", "Em seu contexto religioso, a consulta busca estabelecer comunicação com os Mpungus, as forças da natureza e os ancestrais, por meio da mediação do fundamento ou Nganga. Receber a mensagem exige mais do que contar as faces visíveis: é indispensável manter a intuição aberta como canal de escuta e comunicação entre a pergunta, a queda e seu significado."],
    culturalNote: "As denominações e leituras variam entre linhagens e casas. Esta experiência não ensina consagrações nem substitui a orientação de uma pessoa iniciada.",
    choose: "Escolha o enfoque", count: "1 consulta", instruction: "Respire profundamente, mantenha sua pergunta presente e peça aos seus guias que confirmem ou não.", result: "Configuração obtida",
    focuses: [{ title: "Consulta geral", description: "Panorama e orientação do momento" }, { title: "Decisões", description: "Direção diante de uma escolha concreta" }, { title: "Relacionamentos", description: "Dinâmica, abertura e equilíbrio do vínculo" }, { title: "Caminho pessoal", description: "Movimento, bloqueio e próximo passo" }],
  },
};

export function ChamalongosSite({ lang, onBack }: ChamalongosSiteProps) {
  const [step, setStep] = useState<Step>("menu");
  const [focusIndex, setFocusIndex] = useState(0);
  const [result, setResult] = useState<Array<"up" | "down"> | null>(null);
  const text = copy[lang];
  const focus = text.focuses[focusIndex];

  function chooseFocus(index: number) {
    setFocusIndex(index);
    setResult(null);
    setStep("cast");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (step === "cast") {
      setResult(null);
      setStep("menu");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onBack();
  }

  return (
    <section className={`chamalongos-site chamalongos-${step}`}>
      <button type="button" className="chamalongos-back" onClick={goBack}>← {step === "menu" ? text.back : text.backToFocuses}</button>
      {step === "menu" ? (
        <>
          <header className="chamalongos-heading chamalongos-intro">
            <h1>{text.title}</h1>
            <span>{text.eyebrow}</span>
          </header>
          <div className="chamalongos-introduction-copy">
            {text.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <small>{text.culturalNote}</small>
          </div>
          <section className="chamalongos-focus-panel" aria-labelledby="chamalongos-focus-title">
            <span className="chamalongos-mini-label" id="chamalongos-focus-title">{text.choose}</span>
            <div className="chamalongos-focus-grid">
              {text.focuses.map((item, index) => (
                <button type="button" className={`chamalongos-focus-card focus-${index + 1}`} onClick={() => chooseFocus(index)} key={item.title}>
                  <span className="chamalongos-focus-symbol" aria-hidden="true"><img src="/oracles/chamalongos/tiger-cowrie-up.webp" alt="" /></span>
                  <span className="chamalongos-focus-copy"><strong>{item.title}</strong><small>{text.count}</small><em>{item.description}</em></span>
                  <b aria-hidden="true">+</b>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <header className="chamalongos-heading chamalongos-cast-heading"><span>{text.title}</span><h1>{focus.title}</h1><p>{focus.description}</p></header>
          <div className="chamalongos-ritual-shell">
            <p className="chamalongos-guidance">{text.instruction}</p>
            <ChamalongoCast onCastComplete={setResult} />
            {result && <div className="chamalongos-result" aria-live="polite"><small>{text.result}</small><strong>{result.filter((face) => face === "up").length} / 4</strong></div>}
          </div>
        </>
      )}
    </section>
  );
}
