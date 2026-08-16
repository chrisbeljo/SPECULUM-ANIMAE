import type { Language } from "../translations";
import type { AstroConsultationPayload, AstroDiscipline } from "./AstroConsultationFlow";

export type AstroInterpretation = {
  image: string;
  title: string;
  summary: string;
  keys: { label: string; value: string }[];
  guidance: string;
  method: string;
};

const labels: Record<Language, Record<string, string>> = {
  ES:{sun:"Sol",cycle:"Ciclo",basis:"Base calculada",woodTiger:"Tigre de Madera",polarity:"Polaridad",yang:"Yang",life:"Camino de Vida",expression:"Expresión",soul:"Alma",year:"Año Personal",method:"Alcance técnico"},
  EN:{sun:"Sun",cycle:"Cycle",basis:"Calculated basis",woodTiger:"Wood Tiger",polarity:"Polarity",yang:"Yang",life:"Life Path",expression:"Expression",soul:"Soul",year:"Personal Year",method:"Technical scope"},
  FR:{sun:"Soleil",cycle:"Cycle",basis:"Base calculée",woodTiger:"Tigre de Bois",polarity:"Polarité",yang:"Yang",life:"Chemin de Vie",expression:"Expression",soul:"Âme",year:"Année personnelle",method:"Portée technique"},
  DE:{sun:"Sonne",cycle:"Zyklus",basis:"Berechnete Grundlage",woodTiger:"Holz-Tiger",polarity:"Polarität",yang:"Yang",life:"Lebensweg",expression:"Ausdruck",soul:"Seele",year:"Persönliches Jahr",method:"Technischer Umfang"},
  PT:{sun:"Sol",cycle:"Ciclo",basis:"Base calculada",woodTiger:"Tigre de Madeira",polarity:"Polaridade",yang:"Yang",life:"Caminho de Vida",expression:"Expressão",soul:"Alma",year:"Ano Pessoal",method:"Escopo técnico"},
};

const westernCopy: Record<Language, {title:string;summary:string;guidance:string;method:string}[]> = {
  ES:[
    {title:"Sensibilidad que necesita dirección",summary:"El Sol en Piscis señala una identidad receptiva, imaginativa y capaz de leer matices. Su potencia aumenta cuando la intuición encuentra estructura, límites y una forma concreta de servicio.",guidance:"Distingue percepción de absorción emocional. Convierte lo que intuyes en una decisión verificable y protege el tiempo necesario para recuperar claridad.",method:"Esta primera lectura usa el Sol calculable por fecha. Ascendente, Luna, casas y aspectos requieren integrar efemérides astronómicas antes de afirmarlos."},
    {title:"El presente debe contrastarse con la raíz",summary:"La fecha de análisis cae dentro de tu ciclo de los 52 años. El valor de un tránsito no está en enumerar planetas, sino en reconocer qué movimiento toca un punto natal sensible y qué proceso activa.",guidance:"Toma una sola prioridad actual y contrástala con identidad, vínculos y responsabilidad. Evita interpretar cada cambio del cielo como un mandato.",method:"El periodo está calculado; las posiciones planetarias y sus aspectos exactos permanecerán reservados hasta conectar un motor de efemérides."},
    {title:"Un año para integrar y responsabilizarte",summary:"Tu ciclo solar vigente va del 21 de febrero de 2026 al 21 de febrero de 2027. Coincide con un Año Personal 6: vínculos, cuidado, acuerdos y responsabilidad piden una forma más armónica.",guidance:"Elige compromisos sostenibles. Cuidar no significa cargar con todo; la tarea es ordenar responsabilidades y fortalecer lo que sí puede crecer contigo.",method:"El periodo solar y el Año Personal están calculados. Casas y ángulos de la Revolución Solar requieren el retorno astronómico exacto."},
    {title:"Orientación general para Piscis",summary:"La cualidad pisciana favorece imaginación, empatía y percepción simbólica. Sin una pregunta concreta, la lectura más útil es observar dónde necesitas cerrar dispersión y dar forma a una intuición recurrente.",guidance:"Durante los próximos días registra la señal que se repite, define una acción pequeña y comprueba su efecto antes de ampliar el compromiso.",method:"Es una orientación solar general; no sustituye una lectura de Carta Natal ni afirma eventos específicos."},
  ],
  EN:[
    {title:"Sensitivity needs direction",summary:"The Pisces Sun points to a receptive, imaginative identity able to read nuance. Its strength grows when intuition finds structure, boundaries, and a concrete form of service.",guidance:"Separate perception from emotional absorption. Turn intuition into one verifiable decision and protect the time needed to regain clarity.",method:"This first reading uses the Sun derived from the date. Ascendant, Moon, houses, and aspects require an ephemeris engine."},
    {title:"The present must meet the root",summary:"The analysis date falls within your age-52 cycle. A transit matters when a moving factor touches a sensitive natal point and activates a recognizable process.",guidance:"Choose one current priority and test it against identity, relationships, and responsibility. Do not treat every sky change as a command.",method:"The period is calculated; exact planetary positions and aspects await an ephemeris engine."},
    {title:"A year to integrate and take responsibility",summary:"Your current solar cycle runs from February 21, 2026 to February 21, 2027. It coincides with Personal Year 6: relationships, care, agreements, and responsibility seek greater harmony.",guidance:"Choose sustainable commitments. Caring does not mean carrying everything; organize responsibility and strengthen what can grow with you.",method:"The solar period and Personal Year are calculated. Solar Return houses and angles require the exact astronomical return."},
    {title:"General guidance for Pisces",summary:"Piscean quality favors imagination, empathy, and symbolic perception. Without a specific question, notice where recurring intuition needs form and dispersion needs closure.",guidance:"Track the repeating signal, choose one small action, and verify its effect before expanding the commitment.",method:"This is general Sun-sign guidance; it does not replace a Natal Chart or claim specific events."},
  ],
  FR:[
    {title:"La sensibilité demande une direction",summary:"Le Soleil en Poissons indique une identité réceptive et imaginative. Sa force grandit lorsque l’intuition trouve structure, limites et service concret.",guidance:"Distinguez perception et absorption émotionnelle. Transformez l’intuition en une décision vérifiable.",method:"Cette lecture utilise le Soleil dérivé de la date. Ascendant, Lune, maisons et aspects exigent des éphémérides."},
    {title:"Le présent doit rencontrer la racine",summary:"La date analysée appartient à votre cycle de 52 ans. Un transit devient utile lorsqu’il touche un point natal sensible et active un processus reconnaissable.",guidance:"Choisissez une priorité et confrontez-la à l’identité, aux liens et à la responsabilité.",method:"La période est calculée; positions et aspects exacts attendent un moteur d’éphémérides."},
    {title:"Une année pour intégrer",summary:"Le cycle solaire actuel va du 21 février 2026 au 21 février 2027 et coïncide avec une Année personnelle 6: liens, soin et responsabilité cherchent l’harmonie.",guidance:"Choisissez des engagements durables et répartissez clairement les responsabilités.",method:"La période et l’Année personnelle sont calculées; les maisons exigent le retour astronomique exact."},
    {title:"Orientation générale pour les Poissons",summary:"Les Poissons favorisent imagination, empathie et perception symbolique. Sans question précise, observez où une intuition récurrente demande une forme.",guidance:"Notez le signal répété, agissez à petite échelle et vérifiez l’effet.",method:"Orientation solaire générale, sans prédiction d’événements précis."},
  ],
  DE:[
    {title:"Sensibilität braucht Richtung",summary:"Die Sonne in Fische weist auf eine empfängliche, imaginative Identität hin. Intuition gewinnt durch Struktur, Grenzen und konkreten Dienst.",guidance:"Trennen Sie Wahrnehmung von emotionaler Aufnahme und übersetzen Sie Intuition in eine prüfbare Entscheidung.",method:"Verwendet wird die Sonne aus dem Datum. Aszendent, Mond, Häuser und Aspekte benötigen Ephemeriden."},
    {title:"Die Gegenwart trifft die Wurzel",summary:"Das Analysedatum liegt in Ihrem Zyklus mit 52 Jahren. Ein Transit wird bedeutsam, wenn er einen sensiblen Geburtspunkt berührt.",guidance:"Wählen Sie eine Priorität und prüfen Sie sie an Identität, Beziehungen und Verantwortung.",method:"Der Zeitraum ist berechnet; exakte Planetenpositionen benötigen eine Ephemeriden-Engine."},
    {title:"Ein Jahr der Integration",summary:"Der aktuelle Sonnenzyklus läuft vom 21. Februar 2026 bis 21. Februar 2027 und fällt mit dem Persönlichen Jahr 6 zusammen: Beziehungen, Fürsorge und Verantwortung suchen Harmonie.",guidance:"Wählen Sie tragfähige Verpflichtungen und verteilen Sie Verantwortung klar.",method:"Zeitraum und Persönliches Jahr sind berechnet; Häuser benötigen die exakte Sonnenwiederkehr."},
    {title:"Allgemeine Orientierung für Fische",summary:"Fische fördern Vorstellungskraft, Empathie und symbolische Wahrnehmung. Ohne konkrete Frage zeigt sich, wo eine wiederkehrende Intuition Form braucht.",guidance:"Beobachten Sie das wiederkehrende Signal, handeln Sie klein und prüfen Sie die Wirkung.",method:"Allgemeine Sonnenzeichen-Deutung ohne konkrete Ereignisprognose."},
  ],
  PT:[
    {title:"Sensibilidade precisa de direção",summary:"O Sol em Peixes indica identidade receptiva e imaginativa. Sua força cresce quando a intuição encontra estrutura, limites e serviço concreto.",guidance:"Separe percepção de absorção emocional e transforme a intuição em uma decisão verificável.",method:"Usa o Sol derivado da data. Ascendente, Lua, casas e aspectos exigem efemérides."},
    {title:"O presente encontra a raiz",summary:"A data analisada está no seu ciclo dos 52 anos. Um trânsito importa quando toca um ponto natal sensível e ativa um processo reconhecível.",guidance:"Escolha uma prioridade e confronte-a com identidade, vínculos e responsabilidade.",method:"O período está calculado; posições planetárias exatas aguardam um motor de efemérides."},
    {title:"Um ano para integrar",summary:"O ciclo solar atual vai de 21 de fevereiro de 2026 a 21 de fevereiro de 2027 e coincide com o Ano Pessoal 6: vínculos, cuidado e responsabilidade buscam harmonia.",guidance:"Escolha compromissos sustentáveis e distribua responsabilidades com clareza.",method:"Período e Ano Pessoal estão calculados; casas exigem o retorno astronômico exato."},
    {title:"Orientação geral para Peixes",summary:"Peixes favorece imaginação, empatia e percepção simbólica. Sem pergunta específica, observe onde uma intuição recorrente precisa ganhar forma.",guidance:"Registre o sinal repetido, aja em pequena escala e confira o efeito.",method:"Orientação solar geral sem afirmar eventos específicos."},
  ],
};

const easternCopy: Record<Language, {title:string;summary:string;guidance:string;method:string}[]> = {
  ES:[
    {title:"Impulso de crecimiento con presencia",summary:"El pilar anual verificable corresponde al Tigre de Madera Yang. Combina iniciativa, expansión y coraje; su reto es sostener dirección sin convertir la fuerza en prisa o confrontación.",guidance:"Haz crecer una sola estructura a la vez. La Madera necesita raíz, medida y continuidad para no dispersarse.",method:"Año, animal, elemento y polaridad están calculados. Mes, Día Maestro y hora requieren un calendario BaZi especializado."},
    {title:"Madera Yang sobre Tigre",summary:"La Madera representa crecimiento, visión y capacidad de abrir camino; el Tigre añade iniciativa e independencia. Yang vuelve visible la energía y pide aprender cuándo avanzar y cuándo escuchar.",guidance:"Usa la valentía para iniciar, pero establece límites y ritmos antes de ampliar el terreno.",method:"Lectura basada en el pilar anual verificable; no presenta el animal como sustituto de los Cuatro Pilares."},
    {title:"El mapa estelar requiere precisión",summary:"Zi Wei Dou Shu organiza el destino por palacios y ciclos temporales. Tus datos ya permiten preparar la consulta, pero una interpretación honesta necesita convertir fecha y hora al calendario lunar y ubicar las estrellas principales.",guidance:"Mientras se integra el cálculo, usa esta capa para formular el área vital que deseas observar: vocación, recursos, vínculos o salud.",method:"No se inventan estrellas ni palacios. El resultado completo queda condicionado al calculador Zi Wei Dou Shu."},
  ],
  EN:[
    {title:"Growth impulse with presence",summary:"The verifiable year pillar is Yang Wood Tiger. It combines initiative, expansion, and courage; its challenge is sustaining direction without turning strength into haste.",guidance:"Grow one structure at a time. Wood needs roots, measure, and continuity.",method:"Year, animal, element, and polarity are calculated. Month, Day Master, and hour require a specialized BaZi calendar."},
    {title:"Yang Wood over Tiger",summary:"Wood represents growth and vision; Tiger adds initiative and independence. Yang makes the energy visible and asks when to advance and when to listen.",guidance:"Use courage to begin, then establish limits and rhythm before expanding.",method:"Based on the verifiable year pillar; the animal does not replace the Four Pillars."},
    {title:"The stellar map requires precision",summary:"Zi Wei Dou Shu arranges destiny through palaces and timing cycles. Your data prepares the consultation, but a sound reading requires lunar conversion and star placement.",guidance:"Define the life area to observe: vocation, resources, relationships, or health.",method:"No stars or palaces are invented. A complete result awaits the Zi Wei calculator."},
  ],
  FR:[
    {title:"Élan de croissance et présence",summary:"Le pilier annuel vérifiable est Tigre de Bois Yang: initiative, expansion et courage, avec le défi de soutenir la direction sans précipitation.",guidance:"Faites croître une structure à la fois; le Bois demande racines et continuité.",method:"Année, animal, élément et polarité sont calculés; les autres piliers exigent un calendrier BaZi."},
    {title:"Bois Yang sur Tigre",summary:"Le Bois représente croissance et vision; le Tigre ajoute initiative et indépendance. Yang rend l’énergie visible.",guidance:"Commencez avec courage puis établissez limites et rythme.",method:"Lecture du pilier annuel, sans remplacer les Quatre Piliers."},
    {title:"La carte stellaire exige précision",summary:"Zi Wei Dou Shu organise les palais et les cycles. Une lecture sûre demande la conversion lunaire et le placement des étoiles.",guidance:"Définissez d’abord le domaine à observer: vocation, ressources, liens ou santé.",method:"Aucune étoile ni palais n’est inventé; le calculateur spécialisé reste requis."},
  ],
  DE:[
    {title:"Wachstum mit Präsenz",summary:"Die verifizierbare Jahressäule ist Yang-Holz-Tiger: Initiative, Expansion und Mut, mit der Aufgabe, Richtung ohne Hast zu halten.",guidance:"Lassen Sie jeweils eine Struktur wachsen; Holz braucht Wurzeln und Kontinuität.",method:"Jahr, Tier, Element und Polarität sind berechnet; weitere Säulen benötigen einen BaZi-Kalender."},
    {title:"Yang-Holz über Tiger",summary:"Holz steht für Wachstum und Vision, Tiger für Initiative und Unabhängigkeit. Yang macht die Energie sichtbar.",guidance:"Beginnen Sie mutig und setzen Sie dann Grenzen und Rhythmus.",method:"Deutung der Jahressäule, nicht Ersatz für die Vier Säulen."},
    {title:"Die Sternenkarte braucht Präzision",summary:"Zi Wei Dou Shu ordnet Paläste und Zeitzyklen. Eine seriöse Deutung braucht Mondkalender-Umrechnung und Sternpositionen.",guidance:"Bestimmen Sie zunächst den Lebensbereich: Beruf, Ressourcen, Beziehungen oder Gesundheit.",method:"Keine Sterne oder Paläste werden erfunden; der Spezialrechner bleibt erforderlich."},
  ],
  PT:[
    {title:"Impulso de crescimento com presença",summary:"O pilar anual verificável é Tigre de Madeira Yang: iniciativa, expansão e coragem, com o desafio de manter direção sem pressa.",guidance:"Faça crescer uma estrutura por vez; Madeira precisa de raiz e continuidade.",method:"Ano, animal, elemento e polaridade estão calculados; outros pilares exigem calendário BaZi."},
    {title:"Madeira Yang sobre Tigre",summary:"Madeira representa crescimento e visão; Tigre acrescenta iniciativa e independência. Yang torna a energia visível.",guidance:"Comece com coragem e depois estabeleça limites e ritmo.",method:"Leitura do pilar anual, não substituto dos Quatro Pilares."},
    {title:"O mapa estelar exige precisão",summary:"Zi Wei Dou Shu organiza palácios e ciclos. Uma leitura segura exige conversão lunar e posicionamento das estrelas.",guidance:"Defina primeiro a área vital: vocação, recursos, vínculos ou saúde.",method:"Nenhuma estrela ou palácio é inventado; o calculador especializado continua necessário."},
  ],
};

const numberMeaning: Record<Language, Record<number,string>> = {
  ES:{8:"administrar poder, recursos y resultados con ética",7:"investigar, discriminar y encontrar sentido antes de actuar",11:"convertir intuición e inspiración en una señal clara",6:"ordenar vínculos, cuidado, hogar y responsabilidad"},
  EN:{8:"manage power, resources, and results ethically",7:"investigate, discern, and find meaning before acting",11:"turn intuition and inspiration into a clear signal",6:"organize relationships, care, home, and responsibility"},
  FR:{8:"gérer pouvoir, ressources et résultats avec éthique",7:"chercher, discerner et trouver du sens avant d’agir",11:"transformer intuition et inspiration en signal clair",6:"organiser liens, soin, foyer et responsabilité"},
  DE:{8:"Macht, Ressourcen und Ergebnisse ethisch führen",7:"forschen, unterscheiden und vor dem Handeln Sinn finden",11:"Intuition und Inspiration in ein klares Signal verwandeln",6:"Beziehungen, Fürsorge, Zuhause und Verantwortung ordnen"},
  PT:{8:"administrar poder, recursos e resultados com ética",7:"investigar, discernir e encontrar sentido antes de agir",11:"transformar intuição e inspiração em sinal claro",6:"organizar vínculos, cuidado, lar e responsabilidade"},
};

const numberTitles: Record<Language,string[]>={
  ES:["Construir con poder responsable","La identidad del investigador","Una motivación maestra e intuitiva","El presente pide armonía y compromiso"],
  EN:["Build with responsible power","The investigator’s identity","A master intuitive drive","The present asks for harmony and commitment"],
  FR:["Construire avec un pouvoir responsable","L’identité du chercheur","Un élan intuitif maître","Le présent demande harmonie et engagement"],
  DE:["Mit verantwortlicher Kraft bauen","Die Identität des Forschers","Ein intuitiver Meisterimpuls","Die Gegenwart verlangt Harmonie"],
  PT:["Construir com poder responsável","A identidade do investigador","Uma motivação intuitiva mestra","O presente pede harmonia e compromisso"],
};

const images: Record<AstroDiscipline,string[]>={
  western:["/oracles/interpretations/western/natal-chart.jpg","/oracles/interpretations/western/transits.jpg","/oracles/interpretations/western/solar-return.jpg","/oracles/interpretations/western/horoscope.jpg"],
  eastern:["/oracles/interpretations/eastern/bazi.jpg","/oracles/interpretations/eastern/elements.jpg","/oracles/interpretations/eastern/zi-wei.jpg"],
  numerology:["/oracles/interpretations/numerology/life-path.jpg","/oracles/interpretations/numerology/expression.jpg","/oracles/interpretations/numerology/soul.jpg","/oracles/interpretations/numerology/personal-year.jpg"],
};

export function createAstroInterpretation(payload:AstroConsultationPayload,focusIndex:number,numbers:{life:number;expression:number;soul:number;year:number}|null):AstroInterpretation{
  const l=labels[payload.language];
  if(payload.discipline==="western"){
    const c=westernCopy[payload.language][focusIndex]||westernCopy[payload.language][0];
    return {image:images.western[focusIndex]||images.western[0],...c,keys:[{label:l.sun,value:"Piscis · Pisces"},{label:l.cycle,value:focusIndex===2?"21 Feb 2026 — 21 Feb 2027":"52"}]};
  }
  if(payload.discipline==="eastern"){
    const c=easternCopy[payload.language][focusIndex]||easternCopy[payload.language][0];
    return {image:images.eastern[focusIndex]||images.eastern[0],...c,keys:[{label:l.basis,value:l.woodTiger},{label:l.polarity,value:l.yang}]};
  }
  const n=numbers||{life:8,expression:7,soul:11,year:6};
  const values=[n.life,n.expression,n.soul,n.year];
  const value=values[focusIndex]??n.life;
  const keyLabels=[l.life,l.expression,l.soul,l.year];
  const summaries:Record<Language,string>={ES:`El ${value} orienta este enfoque hacia ${numberMeaning.ES[value]}. No actúa aislado: dialoga con tu Camino 8, Expresión 7, Alma 11 y el ciclo 6 vigente.`,EN:`The ${value} directs this focus toward the capacity to ${numberMeaning.EN[value]}. It works with Life Path 8, Expression 7, Soul 11, and the current 6 cycle.`,FR:`Le ${value} oriente cet axe vers la capacité de ${numberMeaning.FR[value]}. Il dialogue avec le Chemin 8, l’Expression 7, l’Âme 11 et le cycle 6.`,DE:`Die ${value} richtet diesen Schwerpunkt darauf, ${numberMeaning.DE[value]}. Sie wirkt mit Lebensweg 8, Ausdruck 7, Seele 11 und dem aktuellen Zyklus 6.`,PT:`O ${value} orienta este enfoque para ${numberMeaning.PT[value]}. Ele atua com Caminho 8, Expressão 7, Alma 11 e o ciclo 6 atual.`};
  const guidance:Record<Language,string>={ES:"Integra ambición con reflexión, intuición con método y cuidado con límites. El resultado mejora cuando ninguna de estas fuerzas intenta dominar a las demás.",EN:"Integrate ambition with reflection, intuition with method, and care with boundaries. The result improves when none of these forces dominates the others.",FR:"Intégrez ambition et réflexion, intuition et méthode, soin et limites. L’ensemble gagne quand aucune force ne domine les autres.",DE:"Verbinden Sie Ehrgeiz mit Reflexion, Intuition mit Methode und Fürsorge mit Grenzen.",PT:"Integre ambição com reflexão, intuição com método e cuidado com limites."};
  const method:Record<Language,string>={ES:"Cálculo pitagórico por reducción teosófica; conserva los números maestros 11, 22 y 33.",EN:"Pythagorean calculation by theosophical reduction; master numbers 11, 22, and 33 are preserved.",FR:"Calcul pythagoricien par réduction théosophique; les maîtres 11, 22 et 33 sont conservés.",DE:"Pythagoreische theosophische Reduktion; Meisterzahlen 11, 22 und 33 bleiben erhalten.",PT:"Cálculo pitagórico por redução teosófica; números mestres 11, 22 e 33 são preservados."};
  return {image:images.numerology[focusIndex]||images.numerology[0],title:numberTitles[payload.language][focusIndex]||numberTitles[payload.language][0],summary:summaries[payload.language],guidance:guidance[payload.language],method:method[payload.language],keys:[{label:keyLabels[focusIndex]||l.life,value:String(value)},{label:l.year,value:String(n.year)}]};
}
