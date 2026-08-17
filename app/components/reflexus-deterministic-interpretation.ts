import type { Language } from "../translations";
import type { AstroDiscipline } from "./AstroConsultationFlow";
import type {
  ImagoArea,
  ImagoConsistency,
  ImagoReport,
  ReflexusDeterministicClass,
  ReflexusReport,
  ReflexusSignal,
  ReflexusTemporalClass,
} from "./reflexus-engine";
import type { ReflexusArea } from "./reflexus-config";

export type DeterministicInterpretationSection = {
  id: string;
  title: string;
  text: string;
  signalIds: string[];
  evidenceIds: string[];
};

export type ReflexusDeterministicInterpretation = {
  engine: AstroDiscipline;
  title: string;
  summary: string;
  sections: DeterministicInterpretationSection[];
  method: string;
};

export type ImagoDeterministicInterpretation = {
  title: string;
  summary: string;
  sections: DeterministicInterpretationSection[];
  method: string;
};

type TextPack = {
  title: string;
  imagoTitle: string;
  insufficient: string;
  evidenceLead: string;
  secondaryLead: string;
  scoreNote: string;
  method: string;
  imagoMethod: string;
  convergence: Record<ImagoArea["convergence"], string>;
  consistency: Record<ImagoConsistency, string>;
  classText: Record<ReflexusDeterministicClass, string>;
  layerNames: Record<ReflexusTemporalClass | "integration", string>;
  engineLead: Record<AstroDiscipline, Record<ReflexusTemporalClass, string>>;
};

const areaNames: Record<Language, Record<ReflexusArea, string>> = {
  ES: { identity:"Identidad y expresión",emotions:"Emociones y mundo interior",relationships:"Amor y relaciones",vocation:"Profesión y vocación",resources:"Dinero y recursos",health:"Salud y equilibrio",family:"Familia y raíces",learning:"Retos y aprendizajes",spirituality:"Espiritualidad y propósito",transformation:"Transformación y evolución",direction:"Dirección y ciclos" },
  EN: { identity:"Identity and expression",emotions:"Emotions and inner world",relationships:"Love and relationships",vocation:"Profession and vocation",resources:"Money and resources",health:"Health and balance",family:"Family and roots",learning:"Challenges and learning",spirituality:"Spirituality and purpose",transformation:"Transformation and evolution",direction:"Direction and cycles" },
  FR: { identity:"Identité et expression",emotions:"Émotions et monde intérieur",relationships:"Amour et relations",vocation:"Profession et vocation",resources:"Argent et ressources",health:"Santé et équilibre",family:"Famille et racines",learning:"Défis et apprentissages",spirituality:"Spiritualité et but",transformation:"Transformation et évolution",direction:"Direction et cycles" },
  DE: { identity:"Identität und Ausdruck",emotions:"Emotionen und Innenwelt",relationships:"Liebe und Beziehungen",vocation:"Beruf und Berufung",resources:"Geld und Ressourcen",health:"Gesundheit und Gleichgewicht",family:"Familie und Wurzeln",learning:"Herausforderungen und Lernen",spirituality:"Spiritualität und Sinn",transformation:"Transformation und Entwicklung",direction:"Richtung und Zyklen" },
  PT: { identity:"Identidade e expressão",emotions:"Emoções e mundo interior",relationships:"Amor e relações",vocation:"Profissão e vocação",resources:"Dinheiro e recursos",health:"Saúde e equilíbrio",family:"Família e raízes",learning:"Desafios e aprendizados",spirituality:"Espiritualidade e propósito",transformation:"Transformação e evolução",direction:"Direção e ciclos" },
};

const areaFocus: Record<Language, Record<ReflexusArea, string>> = {
  ES: { identity:"pone el acento en la manera de afirmarte, expresarte y ocupar tu lugar",emotions:"observa cómo procesas lo que sientes y construyes seguridad interior",relationships:"describe tu forma de vincularte, cooperar y establecer reciprocidad",vocation:"concentra la atención en el trabajo, la contribución y la dirección profesional",resources:"ordena la relación con el valor, la administración y la seguridad material",health:"señala hábitos, ritmos y ajustes que sostienen tu equilibrio cotidiano",family:"conecta pertenencia, hogar, memoria y patrones heredados",learning:"muestra las experiencias que exigen comprensión, práctica y desarrollo",spirituality:"orienta la búsqueda de sentido, coherencia y propósito",transformation:"marca procesos de cierre, depuración, cambio y regeneración",direction:"sitúa decisiones, etapas y movimientos que organizan el rumbo" },
  EN: { identity:"emphasizes how you affirm yourself, express yourself, and take your place",emotions:"observes how you process feelings and build inner security",relationships:"describes how you bond, cooperate, and establish reciprocity",vocation:"focuses attention on work, contribution, and professional direction",resources:"organizes your relationship with value, management, and material security",health:"points to habits, rhythms, and adjustments that sustain daily balance",family:"connects belonging, home, memory, and inherited patterns",learning:"shows experiences that require understanding, practice, and development",spirituality:"orients the search for meaning, coherence, and purpose",transformation:"marks processes of closure, refinement, change, and regeneration",direction:"situates decisions, stages, and movements that organize your course" },
  FR: { identity:"met l’accent sur votre manière de vous affirmer, de vous exprimer et de prendre votre place",emotions:"observe comment vous traitez vos émotions et construisez votre sécurité intérieure",relationships:"décrit votre façon de créer des liens, de coopérer et d’établir la réciprocité",vocation:"centre l’attention sur le travail, la contribution et l’orientation professionnelle",resources:"organise votre rapport à la valeur, à la gestion et à la sécurité matérielle",health:"signale les habitudes, rythmes et ajustements qui soutiennent l’équilibre quotidien",family:"relie appartenance, foyer, mémoire et schémas hérités",learning:"montre les expériences qui exigent compréhension, pratique et développement",spirituality:"oriente la recherche de sens, de cohérence et de but",transformation:"marque les processus de clôture, d’épuration, de changement et de régénération",direction:"situe les décisions, étapes et mouvements qui organisent votre trajectoire" },
  DE: { identity:"betont, wie Sie sich behaupten, ausdrücken und Ihren Platz einnehmen",emotions:"betrachtet, wie Sie Gefühle verarbeiten und innere Sicherheit aufbauen",relationships:"beschreibt, wie Sie Beziehungen gestalten, kooperieren und Gegenseitigkeit herstellen",vocation:"richtet den Blick auf Arbeit, Beitrag und berufliche Ausrichtung",resources:"ordnet Ihr Verhältnis zu Wert, Verwaltung und materieller Sicherheit",health:"weist auf Gewohnheiten, Rhythmen und Anpassungen hin, die das tägliche Gleichgewicht tragen",family:"verbindet Zugehörigkeit, Zuhause, Erinnerung und ererbte Muster",learning:"zeigt Erfahrungen, die Verständnis, Übung und Entwicklung verlangen",spirituality:"orientiert die Suche nach Sinn, Kohärenz und Zweck",transformation:"markiert Prozesse von Abschluss, Klärung, Wandel und Erneuerung",direction:"verortet Entscheidungen, Phasen und Bewegungen, die den Kurs ordnen" },
  PT: { identity:"enfatiza como você se afirma, se expressa e ocupa seu lugar",emotions:"observa como você processa sentimentos e constrói segurança interior",relationships:"descreve sua forma de se vincular, cooperar e estabelecer reciprocidade",vocation:"concentra a atenção no trabalho, na contribuição e na direção profissional",resources:"organiza sua relação com valor, administração e segurança material",health:"indica hábitos, ritmos e ajustes que sustentam o equilíbrio cotidiano",family:"conecta pertencimento, lar, memória e padrões herdados",learning:"mostra experiências que exigem compreensão, prática e desenvolvimento",spirituality:"orienta a busca de sentido, coerência e propósito",transformation:"marca processos de fechamento, depuração, mudança e regeneração",direction:"situa decisões, etapas e movimentos que organizam o rumo" },
};

const packs: Record<Language, TextPack> = {
  ES: {
    title:"INTERPRETACIÓN DETERMINISTA",imagoTitle:"INTERPRETACIÓN INTEGRADA",insufficient:"No hay evidencia calculada suficiente para formular esta capa sin inferir datos.",evidenceLead:"La señal calculada de mayor peso es",secondaryLead:"Como apoyo secundario aparece",scoreNote:"Las puntuaciones ordenan relevancia simbólica interna; no expresan probabilidad, certeza ni diagnóstico.",method:"Esta lectura se compone exclusivamente con reglas versionadas, clasificaciones calculadas y evidencia identificable. No añade datos ni utiliza inteligencia artificial.",imagoMethod:"La integración compara los tres REFLEXUS ya calculados. No recalcula, mezcla ni corrige sus sistemas de origen, y no utiliza inteligencia artificial.",
    convergence:{"1of3":"La prioridad aparece en uno de los tres sistemas.","2of3":"Dos de los tres sistemas priorizan esta misma área.","3of3":"Los tres sistemas priorizan esta misma área de forma independiente."},
    consistency:{aligned:"Las clasificaciones coinciden y describen una dirección simbólica alineada.",complementary:"Las clasificaciones son distintas pero compatibles; muestran funciones complementarias.",mixed:"Las señales combinan funciones diferentes y deben leerse por separado antes de integrarlas.",divergent:"Las señales incluyen apoyos y tensiones simultáneas; el contraste es parte central de la lectura.",insufficient_data:"Solo un sistema la prioriza; se conserva como señal particular, no como convergencia."},
    classText:{dominant:"La concentración de señales la convierte en un eje principal.",supporting:"La configuración funciona como recurso disponible o vía de facilitación.",tension:"La configuración señala fricción, exigencia o trabajo consciente.",neutral:"La configuración describe una función activa sin clasificarla como apoyo o tensión.",unclassified:"La evidencia se conserva, pero la regla disponible no permite asignarle una cualidad adicional."},
    layerNames:{structure:"Estructura de base",balance:"Equilibrio de elementos",stage:"Etapa de desarrollo",present:"Momento actual",current_cycle:"Ciclo vigente",trend:"Tendencia siguiente",integration:"Síntesis de la lectura"},
    engineLead:{western:{structure:"La estructura natal establece el patrón de base.",balance:"La astrología occidental no asignó señales a esta capa.",stage:"La astrología occidental no asignó señales a esta capa.",present:"Los tránsitos describen qué partes de la estructura natal están activadas en la fecha consultada.",current_cycle:"La astrología occidental no asignó señales a esta capa.",trend:"La revolución solar y las referencias cíclicas ordenan el énfasis del periodo, no un hecho inevitable."},eastern:{structure:"Los pilares de BaZi y los palacios de Zi Wei describen la organización natal del sistema.",balance:"La distribución de los Cinco Elementos muestra concentraciones y ausencias que conviene equilibrar.",stage:"La astrología oriental no asignó señales a esta capa.",present:"El palacio anual sitúa el foco operativo de la fecha consultada.",current_cycle:"El ciclo de suerte y el palacio decenal describen el marco temporal vigente.",trend:"El ciclo siguiente muestra el cambio de énfasis previsto por la secuencia calculada."},numerology:{structure:"Los números derivados de la fecha y el nombre organizan la estructura numerológica de base.",balance:"La numerología no asignó señales a esta capa.",stage:"Pináculos, desafíos, lecciones y ciclos describen la etapa de aprendizaje activa.",present:"Año, mes y día personales sitúan el clima simbólico de la fecha consultada.",current_cycle:"La numerología no asignó señales a esta capa.",trend:"Madurez y deudas kármicas conservan una dirección de desarrollo de largo plazo."}},
  },
  EN: {
    title:"DETERMINISTIC INTERPRETATION",imagoTitle:"INTEGRATED INTERPRETATION",insufficient:"There is not enough calculated evidence to formulate this layer without inferring data.",evidenceLead:"The highest-weight calculated signal is",secondaryLead:"A secondary supporting signal is",scoreNote:"Scores rank internal symbolic relevance; they do not express probability, certainty, or diagnosis.",method:"This reading is composed exclusively from versioned rules, calculated classifications, and identifiable evidence. It adds no data and uses no artificial intelligence.",imagoMethod:"The integration compares the three already-calculated REFLEXUS reports. It does not recalculate, merge, or correct their source systems, and it uses no artificial intelligence.",
    convergence:{"1of3":"The priority appears in one of the three systems.","2of3":"Two of the three systems prioritize this same area.","3of3":"All three systems independently prioritize this same area."},consistency:{aligned:"The classifications agree and describe an aligned symbolic direction.",complementary:"The classifications differ but are compatible; they show complementary functions.",mixed:"The signals combine different functions and should be read separately before integration.",divergent:"The signals include support and tension at once; contrast is central to the reading.",insufficient_data:"Only one system prioritizes it; it remains a particular signal, not a convergence."},classText:{dominant:"The concentration of signals makes it a primary axis.",supporting:"The configuration functions as an available resource or facilitating path.",tension:"The configuration points to friction, demand, or conscious work.",neutral:"The configuration describes an active function without classifying it as support or tension.",unclassified:"The evidence is retained, but the available rule cannot assign an additional quality."},layerNames:{structure:"Base structure",balance:"Elemental balance",stage:"Development stage",present:"Current moment",current_cycle:"Current cycle",trend:"Next trend",integration:"Reading synthesis"},
    engineLead:{western:{structure:"The natal structure establishes the base pattern.",balance:"Western astrology assigned no signals to this layer.",stage:"Western astrology assigned no signals to this layer.",present:"Transits describe which parts of the natal structure are activated on the consultation date.",current_cycle:"Western astrology assigned no signals to this layer.",trend:"The solar return and cyclical references rank the period’s emphasis, not an inevitable event."},eastern:{structure:"BaZi pillars and Zi Wei palaces describe the system’s natal organization.",balance:"The Five Elements distribution shows concentrations and absences to be balanced.",stage:"Eastern astrology assigned no signals to this layer.",present:"The annual palace locates the operational focus of the consultation date.",current_cycle:"The luck cycle and decadal palace describe the current temporal frame.",trend:"The next cycle shows the shift in emphasis established by the calculated sequence."},numerology:{structure:"Numbers derived from the date and name organize the base numerological structure.",balance:"Numerology assigned no signals to this layer.",stage:"Pinnacles, challenges, lessons, and cycles describe the active learning stage.",present:"Personal year, month, and day locate the symbolic climate of the consultation date.",current_cycle:"Numerology assigned no signals to this layer.",trend:"Maturity and karmic-debt values preserve a long-term direction of development."}},
  },
  FR: {
    title:"INTERPRÉTATION DÉTERMINISTE",imagoTitle:"INTERPRÉTATION INTÉGRÉE",insufficient:"Les preuves calculées sont insuffisantes pour formuler cette couche sans inférer de données.",evidenceLead:"Le signal calculé de plus grand poids est",secondaryLead:"Un signal secondaire apparaît",scoreNote:"Les scores classent la pertinence symbolique interne; ils n’expriment ni probabilité, ni certitude, ni diagnostic.",method:"Cette lecture est composée exclusivement de règles versionnées, de classifications calculées et de preuves identifiables. Elle n’ajoute aucune donnée et n’utilise pas d’intelligence artificielle.",imagoMethod:"L’intégration compare les trois REFLEXUS déjà calculés. Elle ne recalcule, ne fusionne ni ne corrige leurs systèmes d’origine et n’utilise pas d’intelligence artificielle.",
    convergence:{"1of3":"La priorité apparaît dans un des trois systèmes.","2of3":"Deux des trois systèmes priorisent ce même domaine.","3of3":"Les trois systèmes priorisent ce même domaine de façon indépendante."},consistency:{aligned:"Les classifications concordent et décrivent une direction symbolique alignée.",complementary:"Les classifications diffèrent mais sont compatibles et montrent des fonctions complémentaires.",mixed:"Les signaux combinent des fonctions différentes à lire séparément avant intégration.",divergent:"Les signaux incluent soutien et tension; le contraste est central dans la lecture.",insufficient_data:"Un seul système le priorise; il reste un signal particulier, non une convergence."},classText:{dominant:"La concentration des signaux en fait un axe principal.",supporting:"La configuration fonctionne comme ressource disponible ou voie facilitatrice.",tension:"La configuration signale friction, exigence ou travail conscient.",neutral:"La configuration décrit une fonction active sans la classer comme soutien ou tension.",unclassified:"La preuve est conservée, mais la règle disponible ne permet pas une qualité supplémentaire."},layerNames:{structure:"Structure de base",balance:"Équilibre des éléments",stage:"Étape de développement",present:"Moment actuel",current_cycle:"Cycle actuel",trend:"Tendance suivante",integration:"Synthèse de la lecture"},
    engineLead:{western:{structure:"La structure natale établit le schéma de base.",balance:"L’astrologie occidentale n’a attribué aucun signal à cette couche.",stage:"L’astrologie occidentale n’a attribué aucun signal à cette couche.",present:"Les transits décrivent les parties de la structure natale activées à la date consultée.",current_cycle:"L’astrologie occidentale n’a attribué aucun signal à cette couche.",trend:"La révolution solaire et les références cycliques ordonnent l’accent de la période, non un fait inévitable."},eastern:{structure:"Les piliers BaZi et les palais Zi Wei décrivent l’organisation natale du système.",balance:"La distribution des Cinq Éléments montre les concentrations et absences à équilibrer.",stage:"L’astrologie orientale n’a attribué aucun signal à cette couche.",present:"Le palais annuel situe le foyer opérationnel de la date consultée.",current_cycle:"Le cycle de chance et le palais décennal décrivent le cadre temporel actuel.",trend:"Le cycle suivant montre le changement d’accent établi par la séquence calculée."},numerology:{structure:"Les nombres issus de la date et du nom organisent la structure numérologique de base.",balance:"La numérologie n’a attribué aucun signal à cette couche.",stage:"Sommets, défis, leçons et cycles décrivent l’étape d’apprentissage active.",present:"L’année, le mois et le jour personnels situent le climat symbolique de la date consultée.",current_cycle:"La numérologie n’a attribué aucun signal à cette couche.",trend:"La maturité et les dettes karmiques conservent une direction de développement à long terme."}},
  },
  DE: {
    title:"DETERMINISTISCHE DEUTUNG",imagoTitle:"INTEGRIERTE DEUTUNG",insufficient:"Es liegen nicht genügend berechnete Belege vor, um diese Ebene ohne Schlussfolgerungen zu formulieren.",evidenceLead:"Das am stärksten gewichtete berechnete Signal ist",secondaryLead:"Als sekundäres Signal erscheint",scoreNote:"Die Werte ordnen interne symbolische Relevanz; sie drücken keine Wahrscheinlichkeit, Gewissheit oder Diagnose aus.",method:"Diese Deutung besteht ausschließlich aus versionierten Regeln, berechneten Klassifikationen und identifizierbaren Belegen. Sie fügt keine Daten hinzu und verwendet keine künstliche Intelligenz.",imagoMethod:"Die Integration vergleicht die drei bereits berechneten REFLEXUS-Berichte. Sie berechnet, vermischt oder korrigiert deren Ursprungssysteme nicht und verwendet keine künstliche Intelligenz.",
    convergence:{"1of3":"Die Priorität erscheint in einem der drei Systeme.","2of3":"Zwei der drei Systeme priorisieren denselben Bereich.","3of3":"Alle drei Systeme priorisieren diesen Bereich unabhängig voneinander."},consistency:{aligned:"Die Klassifikationen stimmen überein und beschreiben eine ausgerichtete symbolische Richtung.",complementary:"Die Klassifikationen unterscheiden sich, sind aber kompatibel und ergänzen einander.",mixed:"Die Signale verbinden verschiedene Funktionen, die vor der Integration getrennt zu lesen sind.",divergent:"Die Signale enthalten zugleich Unterstützung und Spannung; der Kontrast ist zentral.",insufficient_data:"Nur ein System priorisiert den Bereich; er bleibt ein Einzelsignal, keine Konvergenz."},classText:{dominant:"Die Konzentration der Signale macht ihn zu einer Hauptachse.",supporting:"Die Konfiguration wirkt als verfügbare Ressource oder erleichternder Weg.",tension:"Die Konfiguration weist auf Reibung, Anforderung oder bewusste Arbeit hin.",neutral:"Die Konfiguration beschreibt eine aktive Funktion ohne Zuordnung zu Unterstützung oder Spannung.",unclassified:"Der Beleg bleibt erhalten, doch die verfügbare Regel erlaubt keine weitere Qualität."},layerNames:{structure:"Grundstruktur",balance:"Elementgleichgewicht",stage:"Entwicklungsphase",present:"Aktueller Moment",current_cycle:"Aktueller Zyklus",trend:"Nächste Tendenz",integration:"Synthese der Deutung"},
    engineLead:{western:{structure:"Die Geburtsstruktur legt das Grundmuster fest.",balance:"Die westliche Astrologie ordnete dieser Ebene keine Signale zu.",stage:"Die westliche Astrologie ordnete dieser Ebene keine Signale zu.",present:"Transite beschreiben, welche Teile der Geburtsstruktur am Bezugsdatum aktiviert sind.",current_cycle:"Die westliche Astrologie ordnete dieser Ebene keine Signale zu.",trend:"Solarhoroskop und zyklische Bezüge ordnen die Schwerpunkte der Periode, kein unvermeidbares Ereignis."},eastern:{structure:"BaZi-Säulen und Zi-Wei-Paläste beschreiben die Geburtsorganisation des Systems.",balance:"Die Verteilung der Fünf Elemente zeigt Konzentrationen und Abwesenheiten, die auszugleichen sind.",stage:"Die östliche Astrologie ordnete dieser Ebene keine Signale zu.",present:"Der Jahrespala st verortet den operativen Schwerpunkt des Bezugsdatums.",current_cycle:"Glückszyklus und Dekadenpalast beschreiben den aktuellen Zeitrahmen.",trend:"Der nächste Zyklus zeigt die durch die berechnete Folge bestimmte Schwerpunktverlagerung."},numerology:{structure:"Aus Datum und Namen abgeleitete Zahlen ordnen die numerologische Grundstruktur.",balance:"Die Numerologie ordnete dieser Ebene keine Signale zu.",stage:"Höhepunkte, Herausforderungen, Lektionen und Zyklen beschreiben die aktive Lernphase.",present:"Persönliches Jahr, Monat und Tag verorten das symbolische Klima des Bezugsdatums.",current_cycle:"Die Numerologie ordnete dieser Ebene keine Signale zu.",trend:"Reife- und karmische Schuldwerte bewahren eine langfristige Entwicklungsrichtung."}},
  },
  PT: {
    title:"INTERPRETAÇÃO DETERMINÍSTICA",imagoTitle:"INTERPRETAÇÃO INTEGRADA",insufficient:"Não há evidência calculada suficiente para formular esta camada sem inferir dados.",evidenceLead:"O sinal calculado de maior peso é",secondaryLead:"Como apoio secundário aparece",scoreNote:"As pontuações ordenam relevância simbólica interna; não expressam probabilidade, certeza nem diagnóstico.",method:"Esta leitura é composta exclusivamente por regras versionadas, classificações calculadas e evidências identificáveis. Não adiciona dados nem utiliza inteligência artificial.",imagoMethod:"A integração compara os três REFLEXUS já calculados. Não recalcula, mistura nem corrige seus sistemas de origem e não utiliza inteligência artificial.",
    convergence:{"1of3":"A prioridade aparece em um dos três sistemas.","2of3":"Dois dos três sistemas priorizam esta mesma área.","3of3":"Os três sistemas priorizam esta mesma área de forma independente."},consistency:{aligned:"As classificações coincidem e descrevem uma direção simbólica alinhada.",complementary:"As classificações são diferentes, mas compatíveis; mostram funções complementares.",mixed:"Os sinais combinam funções diferentes e devem ser lidos separadamente antes da integração.",divergent:"Os sinais incluem apoio e tensão simultâneos; o contraste é central na leitura.",insufficient_data:"Apenas um sistema a prioriza; permanece como sinal particular, não como convergência."},classText:{dominant:"A concentração de sinais a transforma em eixo principal.",supporting:"A configuração funciona como recurso disponível ou caminho facilitador.",tension:"A configuração indica fricção, exigência ou trabalho consciente.",neutral:"A configuração descreve uma função ativa sem classificá-la como apoio ou tensão.",unclassified:"A evidência é preservada, mas a regra disponível não permite qualidade adicional."},layerNames:{structure:"Estrutura de base",balance:"Equilíbrio dos elementos",stage:"Etapa de desenvolvimento",present:"Momento atual",current_cycle:"Ciclo vigente",trend:"Tendência seguinte",integration:"Síntese da leitura"},
    engineLead:{western:{structure:"A estrutura natal estabelece o padrão de base.",balance:"A astrologia ocidental não atribuiu sinais a esta camada.",stage:"A astrologia ocidental não atribuiu sinais a esta camada.",present:"Os trânsitos descrevem quais partes da estrutura natal estão ativadas na data consultada.",current_cycle:"A astrologia ocidental não atribuiu sinais a esta camada.",trend:"A revolução solar e as referências cíclicas ordenam a ênfase do período, não um fato inevitável."},eastern:{structure:"Os pilares do BaZi e os palácios de Zi Wei descrevem a organização natal do sistema.",balance:"A distribuição dos Cinco Elementos mostra concentrações e ausências a equilibrar.",stage:"A astrologia oriental não atribuiu sinais a esta camada.",present:"O palácio anual situa o foco operacional da data consultada.",current_cycle:"O ciclo de sorte e o palácio decenal descrevem o marco temporal vigente.",trend:"O ciclo seguinte mostra a mudança de ênfase estabelecida pela sequência calculada."},numerology:{structure:"Os números derivados da data e do nome organizam a estrutura numerológica de base.",balance:"A numerologia não atribuiu sinais a esta camada.",stage:"Pináculos, desafios, lições e ciclos descrevem a etapa de aprendizagem ativa.",present:"Ano, mês e dia pessoais situam o clima simbólico da data consultada.",current_cycle:"A numerologia não atribuiu sinais a esta camada.",trend:"Maturidade e dívidas kármicas preservam uma direção de desenvolvimento de longo prazo."}},
  },
};

const layersByEngine: Record<AstroDiscipline, ReflexusTemporalClass[][]> = {
  western: [["structure"], ["present"], ["trend"]],
  eastern: [["structure"], ["balance"], ["present", "current_cycle"], ["trend"]],
  numerology: [["structure"], ["stage"], ["present"], ["trend"]],
};

function uniqueAreas(signals: ReflexusSignal[]) {
  const seen = new Set<ReflexusArea>();
  return [...signals].sort((a, b) => b.relevance - a.relevance).filter(signal => {
    if (seen.has(signal.area)) return false;
    seen.add(signal.area);
    return true;
  });
}

function evidenceFor(signals: ReflexusSignal[]) {
  return [...new Set(signals.flatMap(signal => signal.evidenceIds))];
}

function sectionText(engine: AstroDiscipline, classes: ReflexusTemporalClass[], signals: ReflexusSignal[], lang: Language) {
  const pack = packs[lang];
  if (!signals.length) return pack.insufficient;
  const ranked = uniqueAreas(signals);
  const primary = ranked[0];
  const secondary = ranked[1];
  const lead = classes.map(item => pack.engineLead[engine][item]).join(" ");
  const primaryText = `${areaNames[lang][primary.area]} (${primary.relevance}/100) ${areaFocus[lang][primary.area]}. ${pack.classText[primary.deterministicClass]}`;
  const secondaryText = secondary ? ` ${pack.secondaryLead}: ${areaNames[lang][secondary.area]} (${secondary.relevance}/100); ${areaFocus[lang][secondary.area]}.` : "";
  const evidence = signals.slice(0, 2).map(signal => signal.label).join("; ");
  return `${lead} ${primaryText}${secondaryText} ${pack.evidenceLead}: ${evidence}.`;
}

export function buildReflexusDeterministicInterpretation(report: ReflexusReport, lang: Language): ReflexusDeterministicInterpretation {
  const pack = packs[lang];
  const top = report.areas.filter(area => area.relevance > 0).slice(0, 3);
  const summary = top.length
    ? `${pack.layerNames.integration}: ${top.map(area => `${areaNames[lang][area.area]} (${area.relevance}/100)`).join(" · ")}. ${areaFocus[lang][top[0].area]}. ${pack.scoreNote}`
    : pack.insufficient;
  const sections = layersByEngine[report.engine].map((classes, index) => {
    const signals = report.signals.filter(signal => classes.includes(signal.temporalClass)).sort((a, b) => b.relevance - a.relevance);
    const included = signals.slice(0, 8);
    return {
      id: `${report.engine}-${classes.join("-")}-${index}`,
      title: classes.map(item => pack.layerNames[item]).join(" · "),
      text: sectionText(report.engine, classes, included, lang),
      signalIds: included.map(signal => signal.id),
      evidenceIds: evidenceFor(included),
    };
  });
  return { engine: report.engine, title: pack.title, summary, sections, method: pack.method };
}

function imagoAreaText(area: ImagoArea, lang: Language) {
  const pack = packs[lang];
  const activeEngines = area.engines.filter(engine => engine.rank <= 5 && engine.relevance >= 55);
  const engineValues = activeEngines.map(engine => `${engine.engine} ${engine.relevance}/100`).join(" · ");
  return `${areaNames[lang][area.area]} ${areaFocus[lang][area.area]}. ${pack.convergence[area.convergence]} ${pack.consistency[area.consistency]}${engineValues ? ` ${pack.evidenceLead}: ${engineValues}.` : ""}`;
}

export function buildImagoDeterministicInterpretation(imago: ImagoReport, lang: Language): ImagoDeterministicInterpretation {
  const pack = packs[lang];
  const prioritized = imago.areas.filter(area => area.relevance > 0).slice(0, 5);
  const lead = prioritized[0];
  const summary = lead ? `${areaNames[lang][lead.area]} (${lead.relevance}/100). ${areaFocus[lang][lead.area]}. ${pack.convergence[lead.convergence]} ${pack.consistency[lead.consistency]} ${pack.scoreNote}` : pack.insufficient;
  const sections = prioritized.slice(0, 3).map((area, index) => ({
    id: `imago-${area.area}-${index}`,
    title: areaNames[lang][area.area],
    text: imagoAreaText(area, lang),
    signalIds: area.engines.flatMap(engine => engine.signalIds),
    evidenceIds: area.evidenceIds,
  }));
  return { title: pack.imagoTitle, summary, sections, method: pack.imagoMethod };
}

export function buildImagoAreaDeterministicInterpretation(area: ImagoArea, lang: Language): DeterministicInterpretationSection {
  return {
    id: `imago-area-${area.area}`,
    title: packs[lang].imagoTitle,
    text: imagoAreaText(area, lang),
    signalIds: area.engines.flatMap(engine => engine.signalIds),
    evidenceIds: area.evidenceIds,
  };
}
