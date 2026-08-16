"use client";

import { useState } from "react";
import type { Language } from "../translations";
import { chamalongoOutcomes } from "../extended-library-data";
import { ChamalongoCast } from "./ChamalongoCast";
import { DisciplineLibrary, type DisciplineLibraryItem } from "./DisciplineLibrary";

type ChamalongosSiteProps = { lang: Language; onBack: () => void };
type Step = "menu" | "cast";
type Focus = { title: string; description: string };
type ChamalongosCopy = { back: string; backToFocuses: string; eyebrow: string; title: string; intro: string[]; culturalNote: string; choose: string; count: string; instruction: string; result: string; focuses: Focus[] };
type ReadingStage = "initial" | "confirm-etawa" | "identify-speaker" | "confirm-speaker" | "guided-answer" | "confirm-guided-etawa" | "complete";
type ReadingResult = { name: string; verdict: string; message: string };
type ReadingCopy = {
  ready: string; shaking: string; newConsultation: string; confirmAnswer: string; askWho: string; confirmSpeaker: string; askGuide: string;
  alafia: string; eyeife: string; okana: string; etawa: string; oyekunAsk: string; oyekunFinal: string; speakerConfirmed: string; speakerEtawa: string; undefinedResult: string;
};

const copy: Record<Language, ChamalongosCopy> = {
  ES: {
    back: "Volver al inicio", backToFocuses: "Elegir otro enfoque", eyebrow: "CAÍDA · CONFIGURACIÓN · ORIENTACIÓN", title: "Chamalongos",
    intro: ["Los chamalongos son un sistema oracular del Palo Monte o Regla de Palo, tradición afrocubana de raíz bantú desarrollada en Cuba y otras regiones del Caribe a partir de los saberes preservados por personas congas esclavizadas durante la colonia. Su historia está ligada al uso ritual de conchas y piezas de coco, relacionado con voces bantúes como nkombe o nkobo.", "El juego tradicional consta de cuatro piezas de coco seco. La boca —la cara interior, blanca y pulida— se asocia con la luz, la vida y el asentimiento; la espalda —la cáscara exterior, oscura y rugosa— se relaciona con la oscuridad, la muerte y la negación. La consulta puede realizarse con las vistas de coco o con caracoles, conservando en ambos casos la lectura de sus caras abiertas y cerradas. Al arrojarlas sobre una estera o tablero, la combinación se interpreta como una sola señal.", "En su contexto religioso, la consulta busca establecer comunicación con los Mpungus, las fuerzas de la naturaleza y los ancestros, con la mediación del fundamento o Nganga y sus guías espirituales. Para recibir el mensaje no basta con contar las caras visibles: es indispensable mantener la intuición abierta como canal de escucha y comunicación entre la pregunta, la caída y su significado."],
    culturalNote: "Las denominaciones y lecturas varían entre ramas y casas. Esta experiencia no enseña consagraciones ni sustituye la guía de una persona iniciada.",
    choose: "Elige el enfoque", count: "1 consulta", instruction: "Respira profundo, mantén tu pregunta presente y pide a tus guías confirmar o no.", result: "Configuración obtenida",
    focuses: [{ title: "Consulta general", description: "Panorama y orientación del momento" }, { title: "Decisiones", description: "Dirección ante una elección concreta" }, { title: "Relaciones", description: "Dinámica, apertura y equilibrio del vínculo" }, { title: "Camino personal", description: "Movimiento, bloqueo y próximo paso" }],
  },
  EN: {
    back: "Back to home", backToFocuses: "Choose another focus", eyebrow: "CAST · PATTERN · GUIDANCE", title: "Chamalongos",
    intro: ["Chamalongos are an oracular system of Palo Monte, or Regla de Palo, an Afro-Cuban tradition with Bantu roots developed in Cuba and other parts of the Caribbean from knowledge preserved by enslaved Kongo people during the colonial period. Their history is tied to the ritual use of shells and coconut pieces, associated with Bantu words such as nkombe or nkobo.", "The traditional set consists of four pieces of dried coconut. The mouth—the white, polished inner face—is associated with light, life, and affirmation; the back—the dark, rough outer shell—is associated with darkness, death, and denial. The consultation may use coconut pieces or cowrie shells, preserving the reading of open and closed faces in either form. When cast onto a mat or board, the combination is interpreted as a single sign.", "Within its religious context, the consultation seeks communication with the Mpungus, the forces of nature, and the ancestors through the mediation of the foundation, or Nganga, and its spiritual guides. Receiving the message requires more than counting visible faces: intuition must remain open as an essential channel of listening and communication between the question, the cast, and its meaning."],
    culturalNote: "Names and readings vary between lineages and houses. This experience does not teach consecrations or replace the guidance of an initiated practitioner.",
    choose: "Choose a focus", count: "1 consultation", instruction: "Take a deep breath, keep your question present, and ask your guides for confirmation or denial.", result: "Pattern obtained",
    focuses: [{ title: "General consultation", description: "A view and guidance for the present" }, { title: "Decisions", description: "Direction for a concrete choice" }, { title: "Relationships", description: "Dynamics, openness, and balance" }, { title: "Personal path", description: "Movement, blockage, and next step" }],
  },
  FR: {
    back: "Retour à l’accueil", backToFocuses: "Choisir une autre approche", eyebrow: "LANCER · CONFIGURATION · ORIENTATION", title: "Chamalongos",
    intro: ["Les chamalongos constituent un système oraculaire du Palo Monte, ou Regla de Palo, une tradition afro-cubaine d’origine bantoue développée à Cuba et dans d’autres régions des Caraïbes à partir des savoirs préservés par des personnes congolaises réduites en esclavage durant la période coloniale. Leur histoire est liée à l’usage rituel de coquillages et de morceaux de noix de coco, associé à des mots bantous tels que nkombe ou nkobo.", "Le jeu traditionnel comprend quatre morceaux de noix de coco séchée. La bouche —la face intérieure, blanche et polie— est associée à la lumière, à la vie et à l’assentiment ; le dos —la coque extérieure, sombre et rugueuse— est associé à l’obscurité, à la mort et à la négation. La consultation peut utiliser des morceaux de noix de coco ou des cauris, tout en conservant la lecture des faces ouvertes et fermées dans les deux cas. Lorsqu’elles sont lancées sur une natte ou un plateau, les pièces forment un seul signe à interpréter.", "Dans son contexte religieux, la consultation cherche à établir une communication avec les Mpungus, les forces de la nature et les ancêtres, par l’intermédiaire du fondement ou Nganga et de ses guides spirituels. Recevoir le message ne consiste pas seulement à compter les faces visibles : l’intuition doit rester ouverte comme canal indispensable d’écoute et de communication entre la question, le lancer et sa signification."],
    culturalNote: "Les noms et les lectures varient selon les lignées et les maisons. Cette expérience n’enseigne pas les consécrations et ne remplace pas l’accompagnement d’une personne initiée.",
    choose: "Choisissez l’approche", count: "1 consultation", instruction: "Respirez profondément, gardez votre question présente et demandez à vos guides de confirmer ou non.", result: "Configuration obtenue",
    focuses: [{ title: "Consultation générale", description: "Vue d’ensemble et orientation du moment" }, { title: "Décisions", description: "Direction face à un choix concret" }, { title: "Relations", description: "Dynamique, ouverture et équilibre du lien" }, { title: "Chemin personnel", description: "Mouvement, blocage et prochaine étape" }],
  },
  DE: {
    back: "Zurück zum Anfang", backToFocuses: "Anderen Schwerpunkt wählen", eyebrow: "WURF · MUSTER · ORIENTIERUNG", title: "Chamalongos",
    intro: ["Chamalongos sind ein Orakelsystem des Palo Monte oder der Regla de Palo, einer afrokubanischen Tradition mit Bantu-Wurzeln, die sich in Kuba und anderen Teilen der Karibik aus dem von versklavten Kongolesen während der Kolonialzeit bewahrten Wissen entwickelte. Ihre Geschichte ist mit der rituellen Verwendung von Muscheln und Kokosnussstücken verbunden, die mit Bantu-Wörtern wie nkombe oder nkobo in Beziehung gebracht werden.", "Das traditionelle Set besteht aus vier getrockneten Kokosnussstücken. Der Mund —die weiße, polierte Innenseite— wird mit Licht, Leben und Zustimmung verbunden; der Rücken —die dunkle, raue Außenschale— mit Dunkelheit, Tod und Verneinung. Für die Befragung können Kokosnussstücke oder Kaurimuscheln verwendet werden; in beiden Formen bleibt die Lesung offener und geschlossener Seiten erhalten. Beim Wurf auf eine Matte oder ein Brett wird die Kombination als ein einziges Zeichen gedeutet.", "In seinem religiösen Kontext sucht das Orakel die Kommunikation mit den Mpungus, den Naturkräften und den Ahnen durch die Vermittlung des Fundaments oder Nganga und seiner geistigen Führer. Die Botschaft zu empfangen bedeutet mehr, als sichtbare Seiten zu zählen: Die Intuition muss als unverzichtbarer Kanal des Zuhörens und der Kommunikation zwischen Frage, Wurf und Bedeutung offen bleiben."],
    culturalNote: "Bezeichnungen und Lesarten unterscheiden sich je nach Linie und Haus. Diese Erfahrung lehrt keine Weihen und ersetzt nicht die Begleitung einer eingeweihten Person.",
    choose: "Schwerpunkt wählen", count: "1 Beratung", instruction: "Atmen Sie tief durch, behalten Sie Ihre Frage im Sinn und bitten Sie Ihre geistigen Begleiter um Bestätigung oder Verneinung.", result: "Erhaltenes Muster",
    focuses: [{ title: "Allgemeine Beratung", description: "Überblick und Orientierung für den Moment" }, { title: "Entscheidungen", description: "Richtung bei einer konkreten Wahl" }, { title: "Beziehungen", description: "Dynamik, Offenheit und Gleichgewicht" }, { title: "Persönlicher Weg", description: "Bewegung, Blockade und nächster Schritt" }],
  },
  PT: {
    back: "Voltar ao início", backToFocuses: "Escolher outro enfoque", eyebrow: "QUEDA · CONFIGURAÇÃO · ORIENTAÇÃO", title: "Chamalongos",
    intro: ["Os chamalongos são um sistema oracular do Palo Monte, ou Regla de Palo, tradição afro-cubana de raiz banta desenvolvida em Cuba e em outras regiões do Caribe a partir dos saberes preservados por pessoas congolesas escravizadas durante o período colonial. Sua história está ligada ao uso ritual de conchas e pedaços de coco, associado a palavras bantas como nkombe ou nkobo.", "O jogo tradicional é formado por quatro pedaços de coco seco. A boca —a face interna, branca e polida— associa-se à luz, à vida e ao assentimento; as costas —a casca externa, escura e áspera— relacionam-se à escuridão, à morte e à negação. A consulta pode usar pedaços de coco ou búzios, preservando em ambas as formas a leitura das faces abertas e fechadas. Ao serem lançadas sobre uma esteira ou tabuleiro, as peças formam um único sinal a ser interpretado.", "Em seu contexto religioso, a consulta busca estabelecer comunicação com os Mpungus, as forças da natureza e os ancestrais, por meio da mediação do fundamento ou Nganga e de seus guias espirituais. Receber a mensagem exige mais do que contar as faces visíveis: é indispensável manter a intuição aberta como canal de escuta e comunicação entre a pergunta, a queda e seu significado."],
    culturalNote: "As denominações e leituras variam entre linhagens e casas. Esta experiência não ensina consagrações nem substitui a orientação de uma pessoa iniciada.",
    choose: "Escolha o enfoque", count: "1 consulta", instruction: "Respire profundamente, mantenha sua pergunta presente e peça aos seus guias que confirmem ou não.", result: "Configuração obtida",
    focuses: [{ title: "Consulta geral", description: "Panorama e orientação do momento" }, { title: "Decisões", description: "Direção diante de uma escolha concreta" }, { title: "Relacionamentos", description: "Dinâmica, abertura e equilíbrio do vínculo" }, { title: "Caminho pessoal", description: "Movimento, bloqueio e próximo passo" }],
  },
};

const readingCopy: Record<Language, ReadingCopy> = {
  ES: { ready: "Toca las manos para agitar los chamalongos", shaking: "Mantén tu pregunta presente", newConsultation: "Nueva consulta", confirmAnswer: "Confirmar respuesta", askWho: "Preguntar quién habla", confirmSpeaker: "Confirmar quién responde", askGuide: "Preguntar al guía", alafia: "Sí, con la bendición de Dios.", eyeife: "Sí.", okana: "No.", etawa: "La respuesta necesita confirmación. Realiza una segunda tirada.", oyekunAsk: "Pregunta obligatoriamente quién desea hablar. Abre la intuición, reconoce al guía y vuelve a tirar.", oyekunFinal: "No definitivo. Ahora sabes qué guía comunicó esta respuesta.", speakerConfirmed: "Un guía ha confirmado que desea hablar. Repite ahora tu pregunta original, dirigida a ese guía.", speakerEtawa: "La identidad de quien desea responder necesita confirmación. Vuelve a tirar.", undefinedResult: "Aún no está definido el resultado. Nadie confirmó que desea responder; vuelve a preguntar más adelante." },
  EN: { ready: "Touch the hands to shake the chamalongos", shaking: "Keep your question present", newConsultation: "New consultation", confirmAnswer: "Confirm answer", askWho: "Ask who is speaking", confirmSpeaker: "Confirm who responds", askGuide: "Ask the guide", alafia: "Yes, with God's blessing.", eyeife: "Yes.", okana: "No.", etawa: "The answer requires confirmation. Make a second cast.", oyekunAsk: "You must ask who wishes to speak. Open your intuition, recognize the guide, and cast again.", oyekunFinal: "Definitive no. You now know which guide communicated this answer.", speakerConfirmed: "A guide has confirmed the wish to speak. Repeat your original question, now addressing that guide.", speakerEtawa: "The identity of whoever wishes to respond requires confirmation. Cast again.", undefinedResult: "The result is not yet defined. No one confirmed the wish to respond; ask again later." },
  FR: { ready: "Touchez les mains pour agiter les chamalongos", shaking: "Gardez votre question présente", newConsultation: "Nouvelle consultation", confirmAnswer: "Confirmer la réponse", askWho: "Demander qui parle", confirmSpeaker: "Confirmer qui répond", askGuide: "Interroger le guide", alafia: "Oui, avec la bénédiction de Dieu.", eyeife: "Oui.", okana: "Non.", etawa: "La réponse demande confirmation. Effectuez un second lancer.", oyekunAsk: "Vous devez demander qui souhaite parler. Ouvrez votre intuition, reconnaissez le guide et relancez.", oyekunFinal: "Non définitif. Vous savez maintenant quel guide a communiqué cette réponse.", speakerConfirmed: "Un guide a confirmé qu’il souhaite parler. Répétez votre question initiale en vous adressant à lui.", speakerEtawa: "L’identité de celui qui souhaite répondre demande confirmation. Relancez.", undefinedResult: "Le résultat n’est pas encore défini. Personne n’a confirmé vouloir répondre ; reposez la question plus tard." },
  DE: { ready: "Berühren Sie die Hände, um die Chamalongos zu schütteln", shaking: "Behalten Sie Ihre Frage im Sinn", newConsultation: "Neue Befragung", confirmAnswer: "Antwort bestätigen", askWho: "Fragen, wer spricht", confirmSpeaker: "Bestätigen, wer antwortet", askGuide: "Den geistigen Führer fragen", alafia: "Ja, mit Gottes Segen.", eyeife: "Ja.", okana: "Nein.", etawa: "Die Antwort muss bestätigt werden. Werfen Sie ein zweites Mal.", oyekunAsk: "Sie müssen fragen, wer sprechen möchte. Öffnen Sie Ihre Intuition, erkennen Sie den geistigen Führer und werfen Sie erneut.", oyekunFinal: "Endgültiges Nein. Sie wissen nun, welcher geistige Führer diese Antwort übermittelt hat.", speakerConfirmed: "Ein geistiger Führer hat bestätigt, dass er sprechen möchte. Wiederholen Sie Ihre ursprüngliche Frage nun an ihn.", speakerEtawa: "Die Identität dessen, der antworten möchte, muss bestätigt werden. Werfen Sie erneut.", undefinedResult: "Das Ergebnis ist noch nicht bestimmt. Niemand hat bestätigt, antworten zu wollen; fragen Sie später erneut." },
  PT: { ready: "Toque as mãos para agitar os chamalongos", shaking: "Mantenha sua pergunta presente", newConsultation: "Nova consulta", confirmAnswer: "Confirmar resposta", askWho: "Perguntar quem fala", confirmSpeaker: "Confirmar quem responde", askGuide: "Perguntar ao guia", alafia: "Sim, com a bênção de Deus.", eyeife: "Sim.", okana: "Não.", etawa: "A resposta precisa de confirmação. Faça uma segunda queda.", oyekunAsk: "É obrigatório perguntar quem deseja falar. Abra a intuição, reconheça o guia e lance novamente.", oyekunFinal: "Não definitivo. Agora você sabe qual guia comunicou esta resposta.", speakerConfirmed: "Um guia confirmou que deseja falar. Repita agora a pergunta original, dirigindo-a a esse guia.", speakerEtawa: "A identidade de quem deseja responder precisa de confirmação. Lance novamente.", undefinedResult: "O resultado ainda não está definido. Ninguém confirmou que deseja responder; pergunte novamente mais tarde." },
};

export function ChamalongosSite({ lang, onBack }: ChamalongosSiteProps) {
  const [step, setStep] = useState<Step>("menu");
  const [focusIndex, setFocusIndex] = useState(0);
  const [result, setResult] = useState<Array<"up" | "down"> | null>(null);
  const [readingStage, setReadingStage] = useState<ReadingStage>("initial");
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const text = copy[lang];
  const oracleText = readingCopy[lang];
  const focus = text.focuses[focusIndex];
  const outcomeDescriptions = [oracleText.alafia, oracleText.etawa, oracleText.eyeife, oracleText.okana, oracleText.oyekunAsk];
  const libraryItems: DisciplineLibraryItem[] = [
    { id: "open-face", name: `${text.title} · ${lang === "EN" ? "Open face" : lang === "FR" ? "Face ouverte" : lang === "DE" ? "Offene Seite" : lang === "PT" ? "Face aberta" : "Boca"}`, category: text.result, description: text.intro[1], image: "/oracles/chamalongos/tiger-cowrie-up.webp" },
    { id: "closed-face", name: `${text.title} · ${lang === "EN" ? "Closed face" : lang === "FR" ? "Face fermée" : lang === "DE" ? "Geschlossene Seite" : lang === "PT" ? "Face fechada" : "Espalda"}`, category: text.result, description: text.intro[1], image: "/oracles/chamalongos/tiger-cowrie-down.webp" },
    ...chamalongoOutcomes.map((outcome, index) => ({ id: `outcome-${outcome.name.toLowerCase()}`, name: outcome.name, category: `${outcome.up} / 4`, description: outcomeDescriptions[index], up: outcome.up, visual: "chamalongos" as const })),
  ];

  function chooseFocus(index: number) {
    setFocusIndex(index);
    setResult(null);
    setReading(null);
    setReadingStage("initial");
    setStep("cast");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (step === "cast") {
      setResult(null);
      setReading(null);
      setReadingStage("initial");
      setStep("menu");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onBack();
  }

  function finish(name: string, verdict: string, message = "") {
    setReading({ name, verdict, message });
    setReadingStage("complete");
  }

  function confirmGuide(name: string) {
    setReading({ name, verdict: oracleText.speakerConfirmed, message: "" });
    setReadingStage("guided-answer");
  }

  function interpretCast(faces: Array<"up" | "down">) {
    const up = faces.filter((face) => face === "up").length;
    const outcome = chamalongoOutcomes.find((item) => item.up === up)!;
    setResult(faces);

    if (readingStage === "identify-speaker") {
      if (up === 0) return finish(outcome.name, oracleText.oyekunFinal);
      if (up === 1) return finish(outcome.name, oracleText.okana);
      if (up === 3) { setReading({ name: outcome.name, verdict: oracleText.speakerEtawa, message: "" }); setReadingStage("confirm-speaker"); return; }
      return confirmGuide(outcome.name);
    }

    if (readingStage === "confirm-speaker") {
      if (up >= 2) return confirmGuide(outcome.name);
      return finish(outcome.name, oracleText.undefinedResult);
    }

    const guideIsKnown = readingStage === "guided-answer" || readingStage === "confirm-guided-etawa";
    const etawaIsConfirmed = readingStage === "confirm-etawa" || readingStage === "confirm-guided-etawa";
    if (up === 4) return finish(outcome.name, oracleText.alafia);
    if (up === 2) return finish(outcome.name, oracleText.eyeife);
    if (up === 1) return finish(outcome.name, oracleText.okana);
    if (up === 0) {
      if (guideIsKnown) return finish(outcome.name, oracleText.oyekunFinal);
      setReading({ name: outcome.name, verdict: oracleText.oyekunAsk, message: "" });
      setReadingStage("identify-speaker");
      return;
    }
    if (etawaIsConfirmed) return finish(outcome.name, oracleText.eyeife);
    setReading({ name: outcome.name, verdict: oracleText.etawa, message: "" });
    setReadingStage(guideIsKnown ? "confirm-guided-etawa" : "confirm-etawa");
  }

  function prepareNextCast() {
    setResult(null);
    setReading(null);
    if (readingStage === "complete") setReadingStage("initial");
  }

  const recastLabel = readingStage === "identify-speaker" ? oracleText.askWho : readingStage === "confirm-speaker" ? oracleText.confirmSpeaker : readingStage === "guided-answer" ? oracleText.askGuide : readingStage === "confirm-etawa" || readingStage === "confirm-guided-etawa" ? oracleText.confirmAnswer : oracleText.newConsultation;

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
          <DisciplineLibrary lang={lang} items={libraryItems} />
        </>
      ) : (
        <>
          <header className="chamalongos-heading chamalongos-cast-heading"><span>{text.title}</span><h1>{focus.title}</h1><p>{focus.description}</p></header>
          <div className="chamalongos-ritual-shell">
            <p className="chamalongos-guidance">{text.instruction}</p>
            <ChamalongoCast onCastComplete={interpretCast} onCastStart={prepareNextCast} readyLabel={oracleText.ready} shakingLabel={oracleText.shaking} recastLabel={recastLabel} resultContent={result && reading ? <div className="chamalongos-result" aria-live="polite"><small>{reading.name}</small><strong>{reading.verdict}</strong>{reading.message && <p>{reading.message}</p>}</div> : null} />
          </div>
        </>
      )}
    </section>
  );
}
