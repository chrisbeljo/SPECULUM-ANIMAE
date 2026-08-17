import type { Language } from "../translations";

const elements: Record<string, Record<Language, string>> = {
  Madera:{ES:"Madera",EN:"Wood",FR:"Bois",DE:"Holz",PT:"Madeira"},
  Fuego:{ES:"Fuego",EN:"Fire",FR:"Feu",DE:"Feuer",PT:"Fogo"},
  Tierra:{ES:"Tierra",EN:"Earth",FR:"Terre",DE:"Erde",PT:"Terra"},
  Metal:{ES:"Metal",EN:"Metal",FR:"Métal",DE:"Metall",PT:"Metal"},
  Agua:{ES:"Agua",EN:"Water",FR:"Eau",DE:"Wasser",PT:"Água"},
};

const pillars: Record<string, Record<Language, string>> = {
  year:{ES:"Año",EN:"Year",FR:"Année",DE:"Jahr",PT:"Ano"},
  month:{ES:"Mes",EN:"Month",FR:"Mois",DE:"Monat",PT:"Mês"},
  day:{ES:"Día",EN:"Day",FR:"Jour",DE:"Tag",PT:"Dia"},
  hour:{ES:"Hora",EN:"Hour",FR:"Heure",DE:"Stunde",PT:"Hora"},
};

const planets: Record<string, Record<Language, string>> = {
  Sun:{ES:"Sol",EN:"Sun",FR:"Soleil",DE:"Sonne",PT:"Sol"},Moon:{ES:"Luna",EN:"Moon",FR:"Lune",DE:"Mond",PT:"Lua"},Mercury:{ES:"Mercurio",EN:"Mercury",FR:"Mercure",DE:"Merkur",PT:"Mercúrio"},Venus:{ES:"Venus",EN:"Venus",FR:"Vénus",DE:"Venus",PT:"Vênus"},Mars:{ES:"Marte",EN:"Mars",FR:"Mars",DE:"Mars",PT:"Marte"},Jupiter:{ES:"Júpiter",EN:"Jupiter",FR:"Jupiter",DE:"Jupiter",PT:"Júpiter"},Saturn:{ES:"Saturno",EN:"Saturn",FR:"Saturne",DE:"Saturn",PT:"Saturno"},Uranus:{ES:"Urano",EN:"Uranus",FR:"Uranus",DE:"Uranus",PT:"Urano"},Neptune:{ES:"Neptuno",EN:"Neptune",FR:"Neptune",DE:"Neptun",PT:"Netuno"},Pluto:{ES:"Plutón",EN:"Pluto",FR:"Pluton",DE:"Pluto",PT:"Plutão"},"North Node":{ES:"Nodo Norte",EN:"North Node",FR:"Nœud Nord",DE:"Nordknoten",PT:"Nodo Norte"},
};

const aspects: Record<string, Record<Language, string>> = {
  conjunction:{ES:"Conjunción",EN:"Conjunction",FR:"Conjonction",DE:"Konjunktion",PT:"Conjunção"},sextile:{ES:"Sextil",EN:"Sextile",FR:"Sextile",DE:"Sextil",PT:"Sextil"},square:{ES:"Cuadratura",EN:"Square",FR:"Carré",DE:"Quadrat",PT:"Quadratura"},trine:{ES:"Trígono",EN:"Trine",FR:"Trigone",DE:"Trigon",PT:"Trígono"},opposition:{ES:"Oposición",EN:"Opposition",FR:"Opposition",DE:"Opposition",PT:"Oposição"},
};

const numerology: Record<string, Record<Language, string>> = {
  life:{ES:"Camino de Vida",EN:"Life Path",FR:"Chemin de Vie",DE:"Lebensweg",PT:"Caminho de Vida"},expression:{ES:"Expresión",EN:"Expression",FR:"Expression",DE:"Ausdruck",PT:"Expressão"},soul:{ES:"Alma",EN:"Soul",FR:"Âme",DE:"Seele",PT:"Alma"},personality:{ES:"Personalidad",EN:"Personality",FR:"Personnalité",DE:"Persönlichkeit",PT:"Personalidade"},maturity:{ES:"Madurez",EN:"Maturity",FR:"Maturité",DE:"Reife",PT:"Maturidade"},birthday:{ES:"Cumpleaños",EN:"Birthday",FR:"Anniversaire",DE:"Geburtstag",PT:"Aniversário"},attitude:{ES:"Actitud",EN:"Attitude",FR:"Attitude",DE:"Haltung",PT:"Atitude"},balance:{ES:"Balance",EN:"Balance",FR:"Équilibre",DE:"Balance",PT:"Equilíbrio"},hiddenPassion:{ES:"Pasión oculta",EN:"Hidden Passion",FR:"Passion cachée",DE:"Verborgene Leidenschaft",PT:"Paixão oculta"},subconsciousSelf:{ES:"Yo subconsciente",EN:"Subconscious Self",FR:"Moi subconscient",DE:"Unterbewusstes Selbst",PT:"Eu subconsciente"},karmicLessons:{ES:"Lecciones kármicas",EN:"Karmic Lessons",FR:"Leçons karmiques",DE:"Karmische Lektionen",PT:"Lições kármicas"},year:{ES:"Año personal",EN:"Personal Year",FR:"Année personnelle",DE:"Persönliches Jahr",PT:"Ano pessoal"},month:{ES:"Mes personal",EN:"Personal Month",FR:"Mois personnel",DE:"Persönlicher Monat",PT:"Mês pessoal"},day:{ES:"Día personal",EN:"Personal Day",FR:"Jour personnel",DE:"Persönlicher Tag",PT:"Dia pessoal"},pinnacles:{ES:"Pináculos",EN:"Pinnacles",FR:"Sommets",DE:"Höhepunkte",PT:"Pináculos"},challenges:{ES:"Desafíos",EN:"Challenges",FR:"Défis",DE:"Herausforderungen",PT:"Desafios"},lifeCycles:{ES:"Ciclos de vida",EN:"Life Cycles",FR:"Cycles de vie",DE:"Lebenszyklen",PT:"Ciclos de vida"},karmicDebts:{ES:"Deudas kármicas",EN:"Karmic Debts",FR:"Dettes karmiques",DE:"Karmische Schulden",PT:"Dívidas kármicas"},
};

export const elementKeys = ["Madera","Fuego","Tierra","Metal","Agua"] as const;
export const localizeEasternElement = (value:string,lang:Language) => elements[value]?.[lang] || value;
export const localizePillar = (value:string,lang:Language) => pillars[value]?.[lang] || value;
export const localizePlanet = (value:string,lang:Language) => planets[value]?.[lang] || value;
export const localizeAspect = (value:string,lang:Language) => aspects[value]?.[lang] || value;
export const localizeNumerologyKey = (value:string,lang:Language) => numerology[value]?.[lang] || value;

export const astroDataTerms: Record<Language, Record<string,string>> = {
  ES:{dayMaster:"Maestro del Día",house:"Casa",cusp:"cúspide",retrograde:"retrógrado",natal:"Natal",orb:"orbe",origin:"origen",body:"cuerpo",currentPalaces:"Palacios actuales"},
  EN:{dayMaster:"Day Master",house:"House",cusp:"cusp",retrograde:"retrograde",natal:"Natal",orb:"orb",origin:"origin",body:"body",currentPalaces:"Current palaces"},
  FR:{dayMaster:"Maître du Jour",house:"Maison",cusp:"cuspide",retrograde:"rétrograde",natal:"Natal",orb:"orbe",origin:"origine",body:"corps",currentPalaces:"Palais actuels"},
  DE:{dayMaster:"Tagesmeister",house:"Haus",cusp:"Spitze",retrograde:"rückläufig",natal:"Radix",orb:"Orbis",origin:"Ursprung",body:"Körper",currentPalaces:"Aktuelle Paläste"},
  PT:{dayMaster:"Mestre do Dia",house:"Casa",cusp:"cúspide",retrograde:"retrógrado",natal:"Natal",orb:"orbe",origin:"origem",body:"corpo",currentPalaces:"Palácios atuais"},
};
