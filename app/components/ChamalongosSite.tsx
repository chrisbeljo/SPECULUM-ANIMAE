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
    intro: ["Los chamalongos forman parte de prácticas oraculares de raíz afrocubana en las que cuatro piezas se arrojan y se leen según la combinación de sus caras visibles.", "La configuración obtenida ofrece una respuesta breve y simbólica. La lectura observa cuántas piezas quedan abiertas o cerradas y considera el conjunto como una sola señal, no como cuatro respuestas independientes."],
    culturalNote: "Las denominaciones y lecturas varían entre ramas y casas. Esta experiencia no enseña consagraciones ni sustituye la guía de una persona iniciada.",
    choose: "Elige el enfoque", count: "1 consulta", instruction: "Respira profundo, mantén tu pregunta presente y pide a tus guías confirmar o no.", result: "Configuración obtenida",
    focuses: [{ title: "Consulta general", description: "Panorama y orientación del momento" }, { title: "Decisiones", description: "Dirección ante una elección concreta" }, { title: "Relaciones", description: "Dinámica, apertura y equilibrio del vínculo" }, { title: "Camino personal", description: "Movimiento, bloqueo y próximo paso" }],
  },
  EN: {
    back: "Back to home", backToFocuses: "Choose another focus", eyebrow: "CAST · PATTERN · GUIDANCE", title: "Chamalongos",
    intro: ["Chamalongos belong to Afro-Cuban divinatory practices in which four pieces are cast and read through the combination of their visible faces.", "The resulting pattern offers brief symbolic guidance. The reading observes how many pieces land open or closed and considers the whole as one signal rather than four independent answers."],
    culturalNote: "Names and readings vary between lineages and houses. This experience does not teach consecrations or replace the guidance of an initiated practitioner.",
    choose: "Choose a focus", count: "1 consultation", instruction: "Take a deep breath, keep your question present, and ask your guides for confirmation or denial.", result: "Pattern obtained",
    focuses: [{ title: "General consultation", description: "A view and guidance for the present" }, { title: "Decisions", description: "Direction for a concrete choice" }, { title: "Relationships", description: "Dynamics, openness, and balance" }, { title: "Personal path", description: "Movement, blockage, and next step" }],
  },
  FR: {
    back: "Retour à l’accueil", backToFocuses: "Choisir une autre approche", eyebrow: "LANCER · CONFIGURATION · ORIENTATION", title: "Chamalongos",
    intro: ["Les chamalongos appartiennent à des pratiques divinatoires afro-cubaines où quatre pièces sont lancées puis lues selon la combinaison de leurs faces visibles.", "La configuration obtenue propose une orientation symbolique brève. La lecture observe les pièces ouvertes ou fermées et considère l’ensemble comme un seul signe."],
    culturalNote: "Les noms et les lectures varient selon les lignées et les maisons. Cette expérience n’enseigne pas les consécrations et ne remplace pas l’accompagnement d’une personne initiée.",
    choose: "Choisissez l’approche", count: "1 consultation", instruction: "Respirez profondément, gardez votre question présente et demandez à vos guides de confirmer ou non.", result: "Configuration obtenue",
    focuses: [{ title: "Consultation générale", description: "Vue d’ensemble et orientation du moment" }, { title: "Décisions", description: "Direction face à un choix concret" }, { title: "Relations", description: "Dynamique, ouverture et équilibre du lien" }, { title: "Chemin personnel", description: "Mouvement, blocage et prochaine étape" }],
  },
  DE: {
    back: "Zurück zum Anfang", backToFocuses: "Anderen Schwerpunkt wählen", eyebrow: "WURF · MUSTER · ORIENTIERUNG", title: "Chamalongos",
    intro: ["Chamalongos gehören zu afrokubanischen Orakelpraxen, bei denen vier Stücke geworfen und anhand der Kombination ihrer sichtbaren Seiten gelesen werden.", "Das entstandene Muster bietet eine kurze symbolische Orientierung. Die Deutung betrachtet offene und geschlossene Seiten als ein gemeinsames Zeichen."],
    culturalNote: "Bezeichnungen und Lesarten unterscheiden sich je nach Linie und Haus. Diese Erfahrung lehrt keine Weihen und ersetzt nicht die Begleitung einer eingeweihten Person.",
    choose: "Schwerpunkt wählen", count: "1 Beratung", instruction: "Atmen Sie tief durch, behalten Sie Ihre Frage im Sinn und bitten Sie Ihre geistigen Begleiter um Bestätigung oder Verneinung.", result: "Erhaltenes Muster",
    focuses: [{ title: "Allgemeine Beratung", description: "Überblick und Orientierung für den Moment" }, { title: "Entscheidungen", description: "Richtung bei einer konkreten Wahl" }, { title: "Beziehungen", description: "Dynamik, Offenheit und Gleichgewicht" }, { title: "Persönlicher Weg", description: "Bewegung, Blockade und nächster Schritt" }],
  },
  PT: {
    back: "Voltar ao início", backToFocuses: "Escolher outro enfoque", eyebrow: "QUEDA · CONFIGURAÇÃO · ORIENTAÇÃO", title: "Chamalongos",
    intro: ["Os chamalongos fazem parte de práticas oraculares de raiz afro-cubana nas quais quatro peças são lançadas e lidas segundo a combinação de suas faces visíveis.", "A configuração obtida oferece uma orientação simbólica breve. A leitura observa quantas peças ficam abertas ou fechadas e considera o conjunto como um único sinal."],
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
