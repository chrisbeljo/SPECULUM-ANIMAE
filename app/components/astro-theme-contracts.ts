import type { Language } from "../translations";
import type { AstroDiscipline, AstroConsultationPayload } from "./AstroConsultationFlow";
import type { FullAstroCalculation } from "./astro-full-calculations";

export type AstroThemeEvidence = {
  kind: "planet" | "aspect" | "house" | "pillar" | "element" | "cycle" | "palace" | "star" | "number";
  label: string;
  value: string;
  source: string;
};

export type AstroThemeContract = {
  id: string;
  symbol: string;
  category: string;
  title: string;
  description: string;
  centralQuestion: string;
  planets: string[];
  houses: number[];
  palaces: string[];
  numberKeys: string[];
  temporal: boolean;
};

type ReportKey = `${AstroDiscipline}-${number}`;
type ThemeSeed = { id: string; symbol: string; category: string; planets?: string[]; houses?: number[]; palaces?: string[]; numberKeys?: string[]; temporal?: boolean };

const localizedTitles: Record<ReportKey, Record<Language, string[]>> = {
  "western-0": {
    ES:["Emociones y mundo interior","Amor y relaciones","Miedos y anhelos","Talentos y fortalezas","Profesión y vocación","Dinero y recursos","Retos y aprendizajes","Familia y raíces","Espiritualidad y propósito","Transformación y evolución"],
    EN:["Emotions and inner world","Love and relationships","Fears and longings","Talents and strengths","Profession and vocation","Money and resources","Challenges and learning","Family and roots","Spirituality and purpose","Transformation and evolution"],
    FR:["Émotions et monde intérieur","Amour et relations","Peurs et aspirations","Talents et forces","Profession et vocation","Argent et ressources","Défis et apprentissages","Famille et racines","Spiritualité et sens","Transformation et évolution"],
    DE:["Emotionen und innere Welt","Liebe und Beziehungen","Ängste und Sehnsüchte","Talente und Stärken","Beruf und Berufung","Geld und Ressourcen","Herausforderungen und Lernen","Familie und Wurzeln","Spiritualität und Sinn","Transformation und Entwicklung"],
    PT:["Emoções e mundo interior","Amor e relações","Medos e anseios","Talentos e forças","Profissão e vocação","Dinheiro e recursos","Desafios e aprendizados","Família e raízes","Espiritualidade e propósito","Transformação e evolução"],
  },
  "western-1": {
    ES:["Emociones y estado interior","Amor y relaciones","Profesión y trabajo","Dinero y recursos","Retos actuales","Cambios y decisiones","Familia y hogar","Expansión y oportunidades","Introspección y espiritualidad","Próximas tendencias"],
    EN:["Emotions and inner state","Love and relationships","Profession and work","Money and resources","Current challenges","Changes and decisions","Family and home","Expansion and opportunities","Introspection and spirituality","Upcoming trends"],
    FR:["Émotions et état intérieur","Amour et relations","Profession et travail","Argent et ressources","Défis actuels","Changements et décisions","Famille et foyer","Expansion et opportunités","Introspection et spiritualité","Tendances à venir"],
    DE:["Emotionen und innerer Zustand","Liebe und Beziehungen","Beruf und Arbeit","Geld und Ressourcen","Aktuelle Herausforderungen","Veränderungen und Entscheidungen","Familie und Zuhause","Wachstum und Chancen","Innenschau und Spiritualität","Nächste Tendenzen"],
    PT:["Emoções e estado interior","Amor e relações","Profissão e trabalho","Dinheiro e recursos","Desafios atuais","Mudanças e decisões","Família e lar","Expansão e oportunidades","Introspecção e espiritualidade","Próximas tendências"],
  },
  "western-2": {
    ES:["Tema central del año","Emociones y bienestar interior","Amor y relaciones","Profesión y dirección","Dinero y recursos","Familia y hogar","Retos del año","Oportunidades y expansión","Cambios y transformación","Propósito y crecimiento personal"],
    EN:["Central theme of the year","Emotions and inner wellbeing","Love and relationships","Profession and direction","Money and resources","Family and home","Challenges of the year","Opportunities and expansion","Changes and transformation","Purpose and personal growth"],
    FR:["Thème central de l’année","Émotions et bien-être intérieur","Amour et relations","Profession et direction","Argent et ressources","Famille et foyer","Défis de l’année","Opportunités et expansion","Changements et transformation","Sens et croissance personnelle"],
    DE:["Zentrales Jahresthema","Emotionen und inneres Wohlbefinden","Liebe und Beziehungen","Beruf und Richtung","Geld und Ressourcen","Familie und Zuhause","Herausforderungen des Jahres","Chancen und Wachstum","Veränderung und Transformation","Sinn und persönliches Wachstum"],
    PT:["Tema central do ano","Emoções e bem-estar interior","Amor e relações","Profissão e direção","Dinheiro e recursos","Família e lar","Desafios do ano","Oportunidades e expansão","Mudanças e transformação","Propósito e crescimento pessoal"],
  },
  "western-3": {
    ES:["Clima general","Emociones","Amor y vínculos","Trabajo y profesión","Dinero","Retos","Oportunidades","Consejo del periodo"],
    EN:["General climate","Emotions","Love and bonds","Work and profession","Money","Challenges","Opportunities","Guidance for the period"],
    FR:["Climat général","Émotions","Amour et liens","Travail et profession","Argent","Défis","Opportunités","Conseil de la période"],
    DE:["Allgemeines Klima","Emotionen","Liebe und Bindungen","Arbeit und Beruf","Geld","Herausforderungen","Chancen","Hinweis für den Zeitraum"],
    PT:["Clima geral","Emoções","Amor e vínculos","Trabalho e profissão","Dinheiro","Desafios","Oportunidades","Conselho do período"],
  },
  "eastern-0": {
    ES:["Identidad y estructura personal","Fortalezas naturales","Equilibrio de los cinco elementos","Trabajo y vocación","Dinero y recursos","Relaciones","Familia y entorno","Retos y desequilibrios","Ciclos de vida","Momento actual"],
    EN:["Identity and personal structure","Natural strengths","Five-element balance","Work and vocation","Money and resources","Relationships","Family and environment","Challenges and imbalances","Life cycles","Current moment"],
    FR:["Identité et structure personnelle","Forces naturelles","Équilibre des cinq éléments","Travail et vocation","Argent et ressources","Relations","Famille et environnement","Défis et déséquilibres","Cycles de vie","Moment actuel"],
    DE:["Identität und persönliche Struktur","Natürliche Stärken","Gleichgewicht der fünf Elemente","Arbeit und Berufung","Geld und Ressourcen","Beziehungen","Familie und Umfeld","Herausforderungen und Ungleichgewichte","Lebenszyklen","Aktueller Moment"],
    PT:["Identidade e estrutura pessoal","Forças naturais","Equilíbrio dos cinco elementos","Trabalho e vocação","Dinheiro e recursos","Relações","Família e ambiente","Desafios e desequilíbrios","Ciclos de vida","Momento atual"],
  },
  "eastern-1": {
    ES:["Elemento dominante","Elemento ausente o débil","Excesos y carencias","Relaciones entre elementos","Equilibrio Yin / Yang","Forma natural de actuar","Recursos personales","Tensiones internas","Ciclo actual","Integración del mapa"],
    EN:["Dominant element","Absent or weak element","Excesses and deficiencies","Relationships among elements","Yin/Yang balance","Natural way of acting","Personal resources","Inner tensions","Current cycle","Chart integration"],
    FR:["Élément dominant","Élément absent ou faible","Excès et carences","Relations entre éléments","Équilibre Yin/Yang","Manière naturelle d’agir","Ressources personnelles","Tensions intérieures","Cycle actuel","Intégration de la carte"],
    DE:["Dominantes Element","Fehlendes oder schwaches Element","Überschüsse und Mängel","Beziehungen der Elemente","Yin-Yang-Gleichgewicht","Natürliche Handlungsweise","Persönliche Ressourcen","Innere Spannungen","Aktueller Zyklus","Integration der Karte"],
    PT:["Elemento dominante","Elemento ausente ou fraco","Excessos e carências","Relações entre elementos","Equilíbrio Yin/Yang","Forma natural de agir","Recursos pessoais","Tensões internas","Ciclo atual","Integração do mapa"],
  },
  "eastern-2": {
    ES:["Identidad y destino","Carrera","Riqueza","Pareja","Salud simbólica y vitalidad","Familia y padres","Hermanos y entorno cercano","Amistades y redes","Propiedad y patrimonio","Espíritu y mundo interior","Ciclo actual","Palacios dominantes"],
    EN:["Identity and destiny","Career","Wealth","Partnership","Symbolic health and vitality","Family and parents","Siblings and close environment","Friendships and networks","Property and assets","Spirit and inner world","Current cycle","Dominant palaces"],
    FR:["Identité et destin","Carrière","Richesse","Couple","Santé symbolique et vitalité","Famille et parents","Fratrie et entourage proche","Amitiés et réseaux","Propriété et patrimoine","Esprit et monde intérieur","Cycle actuel","Palais dominants"],
    DE:["Identität und Schicksal","Karriere","Wohlstand","Partnerschaft","Symbolische Gesundheit und Vitalität","Familie und Eltern","Geschwister und nahes Umfeld","Freundschaften und Netzwerke","Eigentum und Vermögen","Geist und innere Welt","Aktueller Zyklus","Dominante Paläste"],
    PT:["Identidade e destino","Carreira","Riqueza","Parceria","Saúde simbólica e vitalidade","Família e pais","Irmãos e ambiente próximo","Amizades e redes","Propriedade e patrimônio","Espírito e mundo interior","Ciclo atual","Palácios dominantes"],
  },
  "numerology-0": {
    ES:["Propósito y dirección","Talentos naturales","Retos principales","Relaciones","Profesión y realización","Dinero y relación con el logro","Mundo interior","Pináculos y etapas de vida","Lecciones kármicas","Integración del Camino de Vida"],
    EN:["Purpose and direction","Natural talents","Main challenges","Relationships","Profession and fulfillment","Money and relationship with achievement","Inner world","Pinnacles and life stages","Karmic lessons","Life Path integration"],
    FR:["Sens et direction","Talents naturels","Défis principaux","Relations","Profession et accomplissement","Argent et rapport à la réussite","Monde intérieur","Sommets et étapes de vie","Leçons karmiques","Intégration du Chemin de Vie"],
    DE:["Sinn und Richtung","Natürliche Talente","Zentrale Herausforderungen","Beziehungen","Beruf und Erfüllung","Geld und Verhältnis zum Erfolg","Innere Welt","Höhepunkte und Lebensphasen","Karmische Lektionen","Integration des Lebenswegs"],
    PT:["Propósito e direção","Talentos naturais","Desafios principais","Relações","Profissão e realização","Dinheiro e relação com o êxito","Mundo interior","Pináculos e etapas de vida","Lições cármicas","Integração do Caminho de Vida"],
  },
  "numerology-1": {
    ES:["Talentos","Forma de comunicar","Forma de actuar","Trabajo y profesión","Creatividad","Relaciones sociales","Fortalezas","Bloqueos de expresión","Desarrollo personal","Integración con Vida y Alma"],
    EN:["Talents","Way of communicating","Way of acting","Work and profession","Creativity","Social relationships","Strengths","Blocks to expression","Personal development","Integration with Life Path and Soul"],
    FR:["Talents","Manière de communiquer","Manière d’agir","Travail et profession","Créativité","Relations sociales","Forces","Blocages d’expression","Développement personnel","Intégration avec Vie et Âme"],
    DE:["Talente","Kommunikationsweise","Handlungsweise","Arbeit und Beruf","Kreativität","Soziale Beziehungen","Stärken","Ausdrucksblockaden","Persönliche Entwicklung","Integration mit Lebensweg und Seele"],
    PT:["Talentos","Forma de comunicar","Forma de agir","Trabalho e profissão","Criatividade","Relações sociais","Forças","Bloqueios de expressão","Desenvolvimento pessoal","Integração com Vida e Alma"],
  },
  "numerology-2": {
    ES:["Deseos profundos","Necesidades emocionales","Miedos internos","Amor y afectividad","Sentido y espiritualidad","Tensión entre deseo y realidad","Lo que alimenta al Alma","Fortalezas internas","Aprendizajes emocionales","Integración con Vida y Expresión"],
    EN:["Deep desires","Emotional needs","Inner fears","Love and affection","Meaning and spirituality","Tension between desire and reality","What nourishes the Soul","Inner strengths","Emotional learning","Integration with Life Path and Expression"],
    FR:["Désirs profonds","Besoins émotionnels","Peurs intérieures","Amour et affectivité","Sens et spiritualité","Tension entre désir et réalité","Ce qui nourrit l’Âme","Forces intérieures","Apprentissages émotionnels","Intégration avec Vie et Expression"],
    DE:["Tiefe Wünsche","Emotionale Bedürfnisse","Innere Ängste","Liebe und Zuneigung","Sinn und Spiritualität","Spannung zwischen Wunsch und Wirklichkeit","Was die Seele nährt","Innere Stärken","Emotionales Lernen","Integration mit Lebensweg und Ausdruck"],
    PT:["Desejos profundos","Necessidades emocionais","Medos internos","Amor e afetividade","Sentido e espiritualidade","Tensão entre desejo e realidade","O que nutre a Alma","Forças internas","Aprendizados emocionais","Integração com Vida e Expressão"],
  },
  "numerology-3": {
    ES:["Tema del año","Momento actual","Trabajo y profesión","Dinero","Relaciones","Retos del periodo","Oportunidades","Mes Personal","Día Personal","Próxima transición"],
    EN:["Theme of the year","Current moment","Work and profession","Money","Relationships","Challenges of the period","Opportunities","Personal Month","Personal Day","Next transition"],
    FR:["Thème de l’année","Moment actuel","Travail et profession","Argent","Relations","Défis de la période","Opportunités","Mois Personnel","Jour Personnel","Prochaine transition"],
    DE:["Jahresthema","Aktueller Moment","Arbeit und Beruf","Geld","Beziehungen","Herausforderungen des Zeitraums","Chancen","Persönlicher Monat","Persönlicher Tag","Nächster Übergang"],
    PT:["Tema do ano","Momento atual","Trabalho e profissão","Dinheiro","Relações","Desafios do período","Oportunidades","Mês Pessoal","Dia Pessoal","Próxima transição"],
  },
};

const questions: Record<ReportKey, Record<Language,string>> = {
  "western-0":{ES:"¿Cómo está construida esta área de mi vida?",EN:"How is this area of my life structured?",FR:"Comment cette sphère de ma vie est-elle structurée ?",DE:"Wie ist dieser Lebensbereich aufgebaut?",PT:"Como esta área da minha vida está estruturada?"},
  "western-1":{ES:"¿Qué está activándose ahora en esta área?",EN:"What is being activated in this area now?",FR:"Qu’est-ce qui s’active maintenant dans ce domaine ?",DE:"Was wird in diesem Bereich jetzt aktiviert?",PT:"O que está sendo ativado agora nesta área?"},
  "western-2":{ES:"¿Qué papel tendrá esta área durante mi año solar?",EN:"What role will this area play during my solar year?",FR:"Quel rôle ce domaine jouera-t-il pendant mon année solaire ?",DE:"Welche Rolle spielt dieser Bereich in meinem Solarjahr?",PT:"Que papel esta área terá durante meu ano solar?"},
  "western-3":{ES:"¿Qué áreas requieren atención durante este periodo?",EN:"Which areas need attention during this period?",FR:"Quels domaines demandent de l’attention pendant cette période ?",DE:"Welche Bereiche brauchen in diesem Zeitraum Aufmerksamkeit?",PT:"Quais áreas exigem atenção durante este período?"},
  "eastern-0":{ES:"¿Cómo se organiza esta área dentro de mis Cuatro Pilares?",EN:"How is this area organized within my Four Pillars?",FR:"Comment ce domaine s’organise-t-il dans mes Quatre Piliers ?",DE:"Wie ist dieser Bereich in meinen Vier Säulen organisiert?",PT:"Como esta área se organiza dentro dos meus Quatro Pilares?"},
  "eastern-1":{ES:"¿Qué muestra el equilibrio elemental sobre esta área?",EN:"What does elemental balance show about this area?",FR:"Que montre l’équilibre élémentaire dans ce domaine ?",DE:"Was zeigt das elementare Gleichgewicht in diesem Bereich?",PT:"O que o equilíbrio elemental mostra sobre esta área?"},
  "eastern-2":{ES:"¿Qué palacios y estrellas sostienen esta área?",EN:"Which palaces and stars support this area?",FR:"Quels palais et étoiles soutiennent ce domaine ?",DE:"Welche Paläste und Sterne tragen diesen Bereich?",PT:"Quais palácios e estrelas sustentam esta área?"},
  "numerology-0":{ES:"¿Qué estructura de aprendizaje y dirección simboliza mi Camino de Vida?",EN:"What structure of learning and direction does my Life Path symbolize?",FR:"Quelle structure d’apprentissage et de direction mon Chemin de Vie symbolise-t-il ?",DE:"Welche Lern- und Richtungsstruktur symbolisiert mein Lebensweg?",PT:"Que estrutura de aprendizado e direção meu Caminho de Vida simboliza?"},
  "numerology-1":{ES:"¿Cómo tiendo a manifestar mis capacidades en el mundo?",EN:"How do I tend to manifest my abilities in the world?",FR:"Comment ai-je tendance à manifester mes capacités dans le monde ?",DE:"Wie bringe ich meine Fähigkeiten in der Welt zum Ausdruck?",PT:"Como tendo a manifestar minhas capacidades no mundo?"},
  "numerology-2":{ES:"¿Qué necesidades y motivaciones profundas operan en mi interior?",EN:"What deep needs and motivations operate within me?",FR:"Quels besoins et motivations profondes agissent en moi ?",DE:"Welche tiefen Bedürfnisse und Motive wirken in mir?",PT:"Que necessidades e motivações profundas operam em meu interior?"},
  "numerology-3":{ES:"¿Qué etapa estoy atravesando y qué movimiento simboliza?",EN:"What stage am I going through and what movement does it symbolize?",FR:"Quelle étape suis-je en train de traverser et quel mouvement symbolise-t-elle ?",DE:"Welche Phase durchlaufe ich und welche Bewegung symbolisiert sie?",PT:"Que etapa estou atravessando e que movimento ela simboliza?"},
};

const categoryByDiscipline:Record<AstroDiscipline,Record<Language,string>>={
  western:{ES:"LECTURA TEMÁTICA",EN:"THEMATIC READING",FR:"LECTURE THÉMATIQUE",DE:"THEMATISCHE DEUTUNG",PT:"LEITURA TEMÁTICA"},
  eastern:{ES:"MAPA Y EQUILIBRIO",EN:"CHART AND BALANCE",FR:"CARTE ET ÉQUILIBRE",DE:"KARTE UND GLEICHGEWICHT",PT:"MAPA E EQUILÍBRIO"},
  numerology:{ES:"NÚMERO Y EXPERIENCIA",EN:"NUMBER AND EXPERIENCE",FR:"NOMBRE ET EXPÉRIENCE",DE:"ZAHL UND ERFAHRUNG",PT:"NÚMERO E EXPERIÊNCIA"},
};

const genericDescription:Record<Language,(title:string)=>string>={
  ES:title=>`Lectura de ${title.toLowerCase()} sustentada exclusivamente por los indicadores calculados en este reporte.`,
  EN:title=>`A ${title.toLowerCase()} reading grounded exclusively in the indicators calculated in this report.`,
  FR:title=>`Lecture de ${title.toLowerCase()} fondée exclusivement sur les indicateurs calculés dans ce rapport.`,
  DE:title=>`Deutung zu ${title.toLowerCase()}, ausschließlich auf den berechneten Indikatoren dieses Berichts gestützt.`,
  PT:title=>`Leitura de ${title.toLowerCase()} baseada exclusivamente nos indicadores calculados neste relatório.`,
};

const natalDescriptionsES=[
  "Necesidades emocionales, sensibilidad, seguridad interna y forma de procesar lo que sientes.",
  "Forma de amar, vincularte, desear y construir intimidad.",
  "Deseos profundos, inseguridades, contradicciones internas y aquello que puede impulsarte o frenarte.",
  "Capacidades naturales, recursos personales y potencial que puede desarrollarse con mayor facilidad.",
  "Talentos profesionales, ambición, estilo de trabajo y posibles direcciones de desarrollo.",
  "Relación simbólica con seguridad material, recursos propios, administración y recursos compartidos.",
  "Tensiones estructurales, patrones repetitivos y áreas que exigen mayor desarrollo.",
  "Hogar, pertenencia, origen y patrones simbólicos vinculados con la base emocional.",
  "Búsqueda de sentido, creencias, trascendencia y orientación interior.",
  "Procesos profundos de cambio, reinvención, desapego y crecimiento personal.",
];

const westernSeeds:ThemeSeed[]=[
  {id:"inner",symbol:"☾",category:"INNER",planets:["Moon","Saturn","Neptune","Pluto"],houses:[4,8,12]},
  {id:"love",symbol:"♡",category:"RELATIONSHIPS",planets:["Venus","Mars","Moon"],houses:[5,7,8]},
  {id:"fear",symbol:"◐",category:"DEPTH",planets:["Moon","Saturn","Pluto","Neptune","Venus","Jupiter"],houses:[8,12]},
  {id:"talent",symbol:"✦",category:"POTENTIAL",planets:["Sun","Jupiter","Mercury","Venus","Mars"],houses:[1,5,10]},
  {id:"career",symbol:"◇",category:"VOCATION",planets:["Saturn","Jupiter","Mars","Mercury"],houses:[2,6,10]},
  {id:"money",symbol:"¤",category:"RESOURCES",planets:["Venus","Jupiter","Saturn","Mars"],houses:[2,8]},
  {id:"challenges",symbol:"△",category:"LEARNING",planets:["Saturn","Mars","Pluto"],houses:[1,6,8,10,12]},
  {id:"family",symbol:"⌂",category:"ROOTS",planets:["Moon"],houses:[4]},
  {id:"spirit",symbol:"◎",category:"PURPOSE",planets:["Jupiter","Neptune","Sun","North Node"],houses:[9,12]},
  {id:"change",symbol:"↻",category:"EVOLUTION",planets:["Pluto","Saturn","Uranus"],houses:[8],temporal:true},
];

const transitSeeds:ThemeSeed[]=[
  {...westernSeeds[0],id:"emotions",temporal:true},
  {...westernSeeds[1],id:"love",temporal:true},
  {...westernSeeds[4],id:"career",temporal:true},
  {...westernSeeds[5],id:"money",temporal:true},
  {...westernSeeds[6],id:"challenges",temporal:true},
  {...westernSeeds[9],id:"decisions",houses:[1,3,7,10],temporal:true},
  {...westernSeeds[7],id:"family",temporal:true},
  {...westernSeeds[3],id:"expansion",planets:["Jupiter","Sun","Venus"],houses:[1,5,9,10,11],temporal:true},
  {...westernSeeds[8],id:"introspection",temporal:true},
  {id:"trends",symbol:"↗",category:"CURRENT",planets:["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"],houses:[1,4,7,10],temporal:true},
];

const solarSeeds:ThemeSeed[]=[
  {id:"central",symbol:"☉",category:"YEAR",planets:["Sun","Moon","Jupiter","Saturn"],houses:[1,4,7,10],temporal:true},
  {...westernSeeds[0],id:"emotions",temporal:true},
  {...westernSeeds[1],id:"love",temporal:true},
  {...westernSeeds[4],id:"career",temporal:true},
  {...westernSeeds[5],id:"money",temporal:true},
  {...westernSeeds[7],id:"family",temporal:true},
  {...westernSeeds[6],id:"challenges",temporal:true},
  {...westernSeeds[3],id:"opportunities",planets:["Jupiter","Sun","Venus"],houses:[1,5,9,10,11],temporal:true},
  {...westernSeeds[9],id:"change",temporal:true},
  {...westernSeeds[8],id:"purpose",temporal:true},
];

const horoscopeSeeds:ThemeSeed[]=[
  {id:"climate",symbol:"☼",category:"PERIOD",planets:["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"],houses:[1,4,7,10],temporal:true},
  {...westernSeeds[0],id:"emotions",temporal:true},
  {...westernSeeds[1],id:"love",temporal:true},
  {...westernSeeds[4],id:"work",temporal:true},
  {...westernSeeds[5],id:"money",temporal:true},
  {...westernSeeds[6],id:"challenges",temporal:true},
  {...westernSeeds[3],id:"opportunities",planets:["Jupiter","Sun","Venus"],houses:[1,5,9,10,11],temporal:true},
  {id:"guidance",symbol:"✧",category:"GUIDANCE",planets:["Sun","Moon","Mercury","Jupiter","Saturn"],houses:[1,6,9,10,12],temporal:true},
];
const westernByFocus=[westernSeeds,transitSeeds,solarSeeds,horoscopeSeeds];

const baziSeeds:ThemeSeed[]=[
  {id:"identity",symbol:"命",category:"STRUCTURE"},{id:"strengths",symbol:"力",category:"RESOURCES"},{id:"elements",symbol:"五",category:"ELEMENTS"},{id:"career",symbol:"業",category:"VOCATION"},{id:"money",symbol:"財",category:"RESOURCES"},{id:"relationships",symbol:"合",category:"BONDS"},{id:"family",symbol:"家",category:"ROOTS"},{id:"imbalances",symbol:"衡",category:"BALANCE"},{id:"cycles",symbol:"運",category:"CYCLES",temporal:true},{id:"current",symbol:"時",category:"CURRENT",temporal:true},
];
const elementSeeds=baziSeeds.map((seed,index)=>({...seed,id:["dominant","weak","excess","relations","yin-yang","action","resources","tensions","cycle","integration"][index],temporal:index===8}));
const ziweiPalaces=["soul","career","wealth","spouse","health","parents","siblings","friends","property","spirit","",""].map((palace,index):ThemeSeed=>({id:["identity","career","wealth","partner","vitality","family","siblings","friends","property","spirit","cycle","dominant"][index],symbol:["命","官","財","夫妻","疾","父","兄","友","田","福","運","紫"][index],category:"PALACES",palaces:palace?[palace]:[],temporal:index>=10}));
const easternByFocus=[baziSeeds,elementSeeds,ziweiPalaces];

const numerologyKeys=[
  ["life","attitude","birthday"],["life","expression","birthday"],["life","challenges","karmicLessons"],["life","soul","expression"],["life","expression","maturity"],["life","expression","year"],["life","soul","personality"],["life","pinnacles","lifeCycles"],["life","karmicLessons","karmicDebts"],["life","expression","soul","maturity"],
];
const numerologyIds=[
  ["purpose","talents","challenges","relationships","profession","money","inner","pinnacles","karmic","integration"],
  ["talents","communication","action","profession","creativity","social","strengths","blocks","development","integration"],
  ["desires","needs","fears","love","spirit","tension","nourishment","strengths","learning","integration"],
  ["year","current","profession","money","relationships","challenges","opportunities","month","day","transition"],
];
const numerologyByFocus=numerologyIds.map((ids,focus)=>ids.map((id,index):ThemeSeed=>({id,symbol:["◎","✦","△","♡","◇","¤","◐","Ⅰ","Ⅸ","↻"][index],category:focus===3?"CYCLES":"STRUCTURE",numberKeys:focus===3?["year","month","day","pinnacles","challenges"]:numerologyKeys[index],temporal:focus===3})));

const seedsFor=(discipline:AstroDiscipline,focusIndex:number):ThemeSeed[]=>discipline==="western"?(westernByFocus[focusIndex]||westernSeeds):discipline==="eastern"?(easternByFocus[focusIndex]||baziSeeds):(numerologyByFocus[focusIndex]||numerologyByFocus[0]);

export function getAstroThemeContracts(discipline:AstroDiscipline,focusIndex:number,lang:Language):AstroThemeContract[]{
  const key=`${discipline}-${focusIndex}` as ReportKey;
  const titles=localizedTitles[key]?.[lang]||localizedTitles[key]?.ES||[];
  return seedsFor(discipline,focusIndex).map((seed,index)=>({
    id:seed.id,symbol:seed.symbol,category:categoryByDiscipline[discipline][lang],title:titles[index]||seed.id,
    description:key==="western-0"&&lang==="ES"?natalDescriptionsES[index]:genericDescription[lang](titles[index]||seed.id),centralQuestion:questions[key]?.[lang]||questions[key]?.ES||"",
    planets:seed.planets||[],houses:seed.houses||[],palaces:seed.palaces||[],numberKeys:seed.numberKeys||[],temporal:Boolean(seed.temporal),
  }));
}

const numberValue=(data:FullAstroCalculation,key:string):string=>{
  const n=data.numerology as unknown as Record<string,unknown>;const value=n[key];
  return Array.isArray(value)?value.join(" · "):String(value??"");
};

export function buildAstroThemeEvidence(discipline:AstroDiscipline,focusIndex:number,contract:AstroThemeContract,data:FullAstroCalculation):AstroThemeEvidence[]{
  const evidence:AstroThemeEvidence[]=[];
  if(discipline==="western"&&data.western){
    const w=data.western;const moving=focusIndex===1||focusIndex===3;const planets=focusIndex===2?w.solarReturnPlanets:moving?w.transits:w.planets;const aspects=focusIndex===2?w.solarReturnAspects:moving?w.transitAspects:w.aspects;const houses=focusIndex===2?w.solarReturnHouses:w.houses;
    planets.filter(p=>contract.planets.includes(p.name)||contract.houses.includes(p.house)).slice(0,6).forEach(p=>evidence.push({kind:"planet",label:p.name,value:`${p.degree.toFixed(2)}° · house ${p.house}${p.retrograde?" · retrograde":""}`,source:`${p.name}:longitude=${p.longitude.toFixed(4)};house=${p.house};retrograde=${p.retrograde}`}));
    aspects.filter(a=>contract.planets.includes(a.from)||contract.planets.includes(a.to)).slice(0,6).forEach(a=>evidence.push({kind:"aspect",label:`${a.from} ${a.type} ${a.to}`,value:`orb ${a.orb.toFixed(2)}°`,source:`aspect:${a.from}:${a.type}:${a.to}:orb=${a.orb}`}));
    contract.houses.slice(0,3).forEach(house=>evidence.push({kind:"house",label:`House ${house}`,value:`cusp ${(houses[house-1]??0).toFixed(2)}°`,source:`${focusIndex===2?"solarReturnHouse":"house"}:${house}:cusp=${houses[house-1]??0}`}));
    if(focusIndex===2){
      w.planets.filter(p=>contract.planets.includes(p.name)||contract.houses.includes(p.house)).slice(0,3).forEach(p=>evidence.push({kind:"planet",label:`Natal ${p.name}`,value:`${p.degree.toFixed(2)}° · house ${p.house}`,source:`natal.${p.name}:longitude=${p.longitude.toFixed(4)};house=${p.house};retrograde=${p.retrograde}`}));
    }
  } else if(discipline==="eastern"&&focusIndex<2&&data.bazi){
    const b=data.bazi;evidence.push({kind:"pillar",label:"Day Master",value:`${b.dayMaster} · ${b.dayElement} ${b.dayPolarity}`,source:`dayMaster=${b.dayMaster};element=${b.dayElement};polarity=${b.dayPolarity}`});
    [...Object.entries(b.elements)].sort((a,bv)=>bv[1]-a[1]).forEach(([name,value])=>evidence.push({kind:"element",label:name,value:`${value}/8`,source:`elements.${name}=${value}`}));
    b.pillars.slice(0,4).forEach(p=>evidence.push({kind:"pillar",label:p.key,value:`${p.ganZhi} · ${p.tenGod}`,source:`pillar.${p.key}=${p.ganZhi};tenGod=${p.tenGod};hidden=${p.hidden.join(",")};naYin=${p.naYin}`}));
    if(contract.temporal&&b.currentLuck)evidence.push({kind:"cycle",label:"Da Yun",value:`${b.currentLuck.ganZhi} · ${b.currentLuck.startYear}–${b.currentLuck.endYear}`,source:`currentLuck=${JSON.stringify(b.currentLuck)}`});
  } else if(discipline==="eastern"&&data.ziwei){
    const z=data.ziwei;let palaces=contract.palaces.length?z.palaces.filter(p=>contract.palaces.includes(p.name)):z.palaces.filter(p=>p.isOrigin||p.isBody||p.name===z.current.decadalPalace||p.name===z.current.yearlyPalace);
    if(!palaces.length)palaces=[...z.palaces].sort((a,b)=>b.majorStars.length-a.majorStars.length).slice(0,3);
    palaces.slice(0,4).forEach(p=>{evidence.push({kind:"palace",label:p.name,value:`${p.stem} ${p.branch}${p.isOrigin?" · origin":""}${p.isBody?" · body":""}`,source:`palace.${p.name}:origin=${p.isOrigin};body=${p.isBody};decadal=${p.decadal.join("-")}`});p.majorStars.slice(0,4).forEach(s=>evidence.push({kind:"star",label:s.name,value:`${p.name}${s.brightness?` · ${s.brightness}`:""}`,source:`palace.${p.name}.star=${s.name};brightness=${s.brightness};mutagen=${s.mutagen||""}`}))});
    if(contract.temporal)evidence.push({kind:"cycle",label:"Current palaces",value:`${z.current.decadalPalace} · ${z.current.yearlyPalace}`,source:`ziwei.current=${JSON.stringify(z.current)}`});
  } else {
    const keys=contract.numberKeys.length?contract.numberKeys:["life","expression","soul","year"];
    keys.forEach(key=>evidence.push({kind:key.includes("year")||key.includes("month")||key.includes("day")?"cycle":"number",label:key,value:numberValue(data,key),source:`numerology.${key}=${numberValue(data,key)}`}));
  }
  return evidence.slice(0,12);
}

export function getHighlightedThemeIds(discipline:AstroDiscipline,focusIndex:number,contracts:AstroThemeContract[],data:FullAstroCalculation):Set<string>{
  const ranked=contracts.map((contract,index)=>{
    const evidence=buildAstroThemeEvidence(discipline,focusIndex,contract,data);let score=evidence.length;
    score+=evidence.filter(item=>item.kind==="aspect"&&Number(item.value.match(/[\d.]+/)?.[0]||9)<=1.5).length*3;
    score+=evidence.filter(item=>item.kind==="palace"||item.kind==="cycle").length*2;
    if(contract.temporal)score+=1;
    if(discipline==="eastern"&&focusIndex<2&&data.bazi){
      const values=Object.values(data.bazi.elements);const maximum=Math.max(...values);const minimum=Math.min(...values);const spread=maximum-minimum;
      if(["elements","dominant","excess"].includes(contract.id))score+=maximum*3;
      if(["weak","imbalances","tensions"].includes(contract.id))score+=spread*4+(8-minimum);
      if(["cycles","current","cycle"].includes(contract.id)&&data.bazi.currentLuck)score+=20;
      if(contract.id==="identity")score+=data.bazi.pillars.length*2;
    }
    if(discipline==="eastern"&&focusIndex===2&&data.ziwei){
      const matching=contract.palaces.length?data.ziwei.palaces.filter(p=>contract.palaces.includes(p.name)):[];
      score+=matching.reduce((sum,palace)=>sum+palace.majorStars.length*3+(palace.isOrigin||palace.isBody?5:0),0);
      if(contract.id==="cycle")score+=data.ziwei.current.decadalPalace||data.ziwei.current.yearlyPalace?18:0;
      if(contract.id==="dominant")score+=Math.max(...data.ziwei.palaces.map(p=>p.majorStars.length))*4;
    }
    if(discipline==="numerology"){
      const values=contract.numberKeys.flatMap(key=>{const raw=(data.numerology as unknown as Record<string,unknown>)[key];return Array.isArray(raw)?raw.map(Number):[Number(raw)]}).filter(Number.isFinite);
      score+=values.filter(value=>[11,22,33].includes(value)).length*6+new Set(values).size;
      if(contract.numberKeys.includes("karmicDebts"))score+=data.numerology.karmicDebts.length*5;
      if(contract.temporal)score+=3;
    }
    return{id:contract.id,score,index};
  }).sort((a,b)=>b.score-a.score||a.index-b.index);
  return new Set(ranked.slice(0,Math.min(3,contracts.length)).map(item=>item.id));
}

export function themeSessionKey(payload:AstroConsultationPayload,focusIndex:number,themeId:string):string{
  return [payload.discipline,focusIndex,themeId,payload.birthDate,payload.birthTime,payload.birthPlace,payload.targetDate,payload.language].join("|");
}
