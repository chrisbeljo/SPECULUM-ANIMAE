"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CardZoomModal } from "./components/CardZoomModal";
import { translations, type Language } from "./translations";
import { translateSpreadName, translatePositionLabel, translateIChingConsultation, translateRuneName, translateSpreadDescription, translateIChingConsultDescription, translateIChingHexagram, translateTarotIntro, translateRuneSystem, translateAngelInterpretation, translateNumerologyInterpretation, translateIChingInterpretation, translateRadiesthesiaInterpretation } from "./spread-translations";

import { useAuth } from "./hooks/useAuth";
import { Auth } from "./components/Auth";
import { Profile } from "./components/Profile";
import { UserProfileForm } from "./components/UserProfileForm";
import { Newsletter } from "./components/Newsletter";
import { Comments } from "./components/Comments";
import { ChamalongosSite } from "./components/ChamalongosSite";
import { AstrologySite } from "./components/AstrologySites";
import { NumerologySite } from "./components/NumerologySite";
import type { DisciplineLibraryItem } from "./components/DisciplineLibrary";
import { CollapsibleDisciplineLibrary } from "./components/CollapsibleDisciplineLibrary";
import { angelCatalog, ichingCatalog, runeCatalog, tarotCatalog } from "./library-data";
import { chamalongoOutcomes, divineNames72, oshoZenReference, powerAnimals, sefirot, treePaths } from "./extended-library-data";
import { librarySites, librarySystems, serviceGroups, services, systemCategories, type ServiceDefinition } from "./service-config";
import { classicSpreadByName, type TarotSpreadDefinition, type TarotSpreadLayout } from "./tarot-spreads";
import { analyzeTarotReading, buildTarotEditorialOutput, buildAIBrief } from "./tarot-analysis";
import { buildOracleEditorialOutput } from "./oracle-analysis";
import { localizeZenCard, localizeAnimalCard, localizeAngelCard } from "./oracle-translations";
import { castIChing, getIChingCounsel, ichingConsultations, interpretIChing, interpretRuneSpread, runeMeanings, runeReadingGroups, type IChingConsultation, type IChingLine, type RuneSpread } from "./ancient-systems";
import { riderDeck as tarot } from "./rider-deck";
import { localizeRiderCard } from "./rider-deck-translations";
import { useAIInterpretation, toAICards, submitFollowup, type AICard, type Discipline } from "./use-ai-interpretation";
import "./discipline-menu-refinements.css";

// Force inclusion of all new translation keys in the bundle
const _ensureTranslationKeys = () => {
  const keys = ["quickSpreads", "loveRelationships", "decisions", "workMoney", "personalDevelopment", "deepSpreads", "oraclesTitle", "oraclesDesc", "starsTitle", "starsDesc", "interpretTitle", "interpretDesc", "chooseApproach"] as const;
  return keys;
};

const reversedLabel: Record<Language, string> = { ES: "Invertida", EN: "Reversed", FR: "Inversée", DE: "Umgekehrt", PT: "Invertida" };
const libraryCategories: Record<Language, { card: string; symbol: string; image: string; hexagram: string }> = {
  ES: { card: "Carta", symbol: "Símbolo", image: "Imagen de referencia", hexagram: "Hexagrama" },
  EN: { card: "Card", symbol: "Symbol", image: "Reference image", hexagram: "Hexagram" },
  FR: { card: "Carte", symbol: "Symbole", image: "Image de référence", hexagram: "Hexagramme" },
  DE: { card: "Karte", symbol: "Symbol", image: "Referenzbild", hexagram: "Hexagramm" },
  PT: { card: "Carta", symbol: "Símbolo", image: "Imagem de referência", hexagram: "Hexagrama" },
};
const libraryDescriptions: Record<Language, { tarot: string; rune: string; hexagram: string; pendulum: string; board: string }> = {
  ES: { tarot: "Carta e imagen del mazo Rider–Waite–Smith.", rune: "Signo del Elder Futhark y su significado esencial.", hexagram: "Figura del Libro de los Cambios en el orden del rey Wen.", pendulum: "Péndulo testigo empleado en la consulta radiestésica.", board: "Tablero de respuestas y escala de intensidad." },
  EN: { tarot: "Card and artwork from the Rider–Waite–Smith deck.", rune: "Elder Futhark sign and its essential meaning.", hexagram: "Book of Changes figure in King Wen order.", pendulum: "Witness pendulum used in radiesthetic consultation.", board: "Answer board and intensity scale." },
  FR: { tarot: "Carte et image du jeu Rider–Waite–Smith.", rune: "Signe du Futhark ancien et sa signification essentielle.", hexagram: "Figure du Livre des Changements dans l’ordre du roi Wen.", pendulum: "Pendule témoin utilisé pour la consultation radiesthésique.", board: "Planche de réponses et échelle d’intensité." },
  DE: { tarot: "Karte und Bild des Rider–Waite–Smith-Decks.", rune: "Zeichen des älteren Futhark und seine wesentliche Bedeutung.", hexagram: "Figur des Buches der Wandlungen in König-Wen-Reihenfolge.", pendulum: "Zeugenpendel für die radiästhetische Befragung.", board: "Antworttafel und Intensitätsskala." },
  PT: { tarot: "Carta e imagem do baralho Rider–Waite–Smith.", rune: "Sinal do Futhark Antigo e seu significado essencial.", hexagram: "Figura do Livro das Mutações na ordem do rei Wen.", pendulum: "Pêndulo testemunho usado na consulta radiestésica.", board: "Prancha de respostas e escala de intensidade." },
};
type Method = "tarot" | "runes" | "iching" | "numerology" | "angels";
type Result = { method: Method; title: string; raw_result: unknown; themes: string[]; obstacles: string[]; opportunities: string[]; advice: string[]; interpretation: string };

// Editorial translation helper
const editorialTitleMap: Record<string, Record<Language, string>> = {
  "Lo que muestra la tirada": { ES: "Lo que muestra la tirada", EN: "What the spread shows", FR: "Ce que montre la tirada", DE: "Was die Legung zeigt", PT: "O que a leitura mostra" },
  "Panorama general": { ES: "Panorama general", EN: "Overview", FR: "Aperçu général", DE: "Allgemeiner Überblick", PT: "Panorama geral" },
  "Lo que muestra el vínculo": { ES: "Lo que muestra el vínculo", EN: "What the bond shows", FR: "Ce que montre le lien", DE: "Was die Bindung zeigt", PT: "O que o vínculo mostra" },
  "El nudo": { ES: "El nudo", EN: "The knot", FR: "Le nœud", DE: "Der Knoten", PT: "O nó" },
  "El camino": { ES: "El camino", EN: "The path", FR: "Le chemin", DE: "Der Weg", PT: "O caminho" },
  "Lo que debes cuidar": { ES: "Lo que debes cuidar", EN: "What to watch", FR: "Ce qu'il faut surveiller", DE: "Worauf Sie achten sollten", PT: "O que observar" },
  "Orientación": { ES: "Orientación", EN: "Direction", FR: "Orientation", DE: "Richtung", PT: "Orientação" },
  "La historia que cuentan tus cartas": { ES: "La historia que cuentan tus cartas", EN: "The story your cards tell", FR: "L'histoire que racontent vos cartes", DE: "Die Geschichte Ihrer Karten", PT: "A história que suas cartas contam" },
  "Mapa de las doce áreas": { ES: "Mapa de las doce áreas", EN: "Map of the twelve areas", FR: "Carte des douze zones", DE: "Karte der zwölf Bereiche", PT: "Mapa das doze áreas" },
  "Lectura de las doce casas — Tarot Zen": { ES: "Lectura de las doce casas — Tarot Zen", EN: "Reading of the twelve houses — Zen Tarot", FR: "Lecture des douze maisons — Tarot Zen", DE: "Lesung der zwölf Häuser — Zen Tarot", PT: "Leitura das doze casas — Tarot Zen" },
  "Mensaje central": { ES: "Mensaje central", EN: "Central message", FR: "Message central", DE: "Zentralbotschaft", PT: "Mensagem central" },
  "La lectura": { ES: "La lectura", EN: "The reading", FR: "La lecture", DE: "Die Lesung", PT: "A leitura" },
  "Lectura profunda": { ES: "Lectura profunda", EN: "Deep reading", FR: "Lecture profonde", DE: "Tiefes Lesen", PT: "Leitura profunda" },
  "Consejo de las Runas": { ES: "Consejo de las Runas", EN: "Rune counsel", FR: "Conseil des Runes", DE: "Runenrat", PT: "Conselho das Runas" },
  "La sabiduría del cambio": { ES: "La sabiduría del cambio", EN: "The wisdom of change", FR: "La sagesse du changement", DE: "Die Weisheit der Veränderung", PT: "A sabedoria da mudança" },
  "Interpretación": { ES: "Interpretación", EN: "Interpretation", FR: "Interprétation", DE: "Interpretation", PT: "Interpretação" },
  "Comprender la situación y la respuesta más útil.": { ES: "Comprender la situación y la respuesta más útil.", EN: "Understand the situation and the most useful response.", FR: "Comprendre la situation et la réponse la plus utile.", DE: "Verstehen Sie die Situation und die nützlichste Antwort.", PT: "Entenda a situação e a resposta mais útil." },
  "Reconocer el asunto central que merece atención ahora.": { ES: "Reconocer el asunto central que merece atención ahora.", EN: "Recognize the central issue that deserves attention now.", FR: "Reconnaître le problème central qui mérite une attention maintenant.", DE: "Erkennen Sie das zentrale Problem, das jetzt Aufmerksamkeit verdient.", PT: "Reconheça o problema central que merece atenção agora." },
  "Respuesta razonada": { ES: "Respuesta razonada", EN: "Reasoned answer", FR: "Réponse raisonnée", DE: "Begründete Antwort", PT: "Resposta razoada" },
  "Lectura": { ES: "Lectura", EN: "Reading", FR: "Lecture", DE: "Lesung", PT: "Leitura" },
  "Emoción, pensamiento y conducta": { ES: "Emoción, pensamiento y conducta", EN: "Emotion, thought, and action", FR: "Émotion, pensée et action", DE: "Emotion, Gedanke und Handlung", PT: "Emoção, pensamento e ação" },
  "Comparación de alternativas": { ES: "Comparación de alternativas", EN: "Comparison of alternatives", FR: "Comparaison des alternatives", DE: "Vergleich der Alternativen", PT: "Comparação de alternativas" },
  "La oportunidad y cómo aprovecharla": { ES: "La oportunidad y cómo aprovecharla", EN: "The opportunity and how to seize it", FR: "L'opportunité et comment en profiter", DE: "Die Gelegenheit und wie man sie nutzt", PT: "A oportunidade e como aproveitá-la" },
  "Del patrón a la respuesta": { ES: "Del patrón a la respuesta", EN: "From pattern to response", FR: "Du motif à la réponse", DE: "Vom Muster zur Antwort", PT: "Do padrão à resposta" },
  "La situación y su posible salida": { ES: "La situación y su posible salida", EN: "The situation and its possible way out", FR: "La situation et sa sortie possible", DE: "Die Situation und ein möglicher Weg heraus", PT: "A situação e uma possível saída" },
  "Lo que esta tirada muestra": { ES: "Lo que esta tirada muestra", EN: "What this spread shows", FR: "Ce que cette tirage montre", DE: "Was dieses Spread zeigt", PT: "O que este spread mostra" },
  "Sugerencia": { ES: "Sugerencia", EN: "Suggestion", FR: "Suggestion", DE: "Vorschlag", PT: "Sugestão" },
  "Clave": { ES: "Clave", EN: "Key", FR: "Clé", DE: "Schlüssel", PT: "Chave" },
  "Condición clave": { ES: "Condición clave", EN: "Key condition", FR: "Condition clé", DE: "Schlüsselbedingung", PT: "Condição-chave" },
  "Señal dominante": { ES: "Señal dominante", EN: "Dominant signal", FR: "Signal dominant", DE: "Dominantes Signal", PT: "Sinal dominante" },
  "Conclusión": { ES: "Conclusión", EN: "Conclusion", FR: "Conclusion", DE: "Schlussfolgerung", PT: "Conclusão" },
  "Estrategia": { ES: "Estrategia", EN: "Strategy", FR: "Stratégie", DE: "Strategie", PT: "Estratégia" },
  "Punto de apoyo": { ES: "Punto de apoyo", EN: "Point of support", FR: "Point d'appui", DE: "Stützpunkt", PT: "Ponto de apoio" },
  "Tema central": { ES: "Tema central", EN: "Central theme", FR: "Thème central", DE: "Zentrales Thema", PT: "Tema central" },
  "Primer paso": { ES: "Primer paso", EN: "First step", FR: "Premier pas", DE: "Erster Schritt", PT: "Primeiro passo" },
};

function translateEditorial(ed: any, lang: Language): any {
  return {
    ...ed,
    title: editorialTitleMap[ed.title]?.[lang] || ed.title,
    warningTitle: editorialTitleMap[ed.warningTitle]?.[lang] || ed.warningTitle,
    adviceTitle: editorialTitleMap[ed.adviceTitle]?.[lang] || ed.adviceTitle,
  };
}
type SavedReading = { id: string; date: string; question: string; category: string; methods: Method[]; results: Result[]; report: string; reviewStatus: "AI_GENERATED" };

const runes = [
  {name:"Fehu",symbol:"ᚠ",keys:["recursos","flujo","responsabilidad"],meaning:"Los recursos se mueven; conviene administrarlos con intención.",advice:"Reconoce qué valor ya está disponible."},
  {name:"Uruz",symbol:"ᚢ",keys:["vitalidad","fuerza","cambio"],meaning:"La energía crece cuando se canaliza con constancia.",advice:"Elige una acción que puedas sostener."},
  {name:"Ansuz",symbol:"ᚨ",keys:["mensaje","comunicación","escucha"],meaning:"La claridad depende de preguntar y escuchar con atención.",advice:"Aclara lo esencial antes de interpretar."},
  {name:"Raidho",symbol:"ᚱ",keys:["camino","ritmo","dirección"],meaning:"El proceso importa tanto como el destino.",advice:"Ajusta el ritmo y confirma la dirección."},
  {name:"Kenaz",symbol:"ᚲ",keys:["visión","aprendizaje","revelación"],meaning:"Una luz concreta permite comprender algo antes confuso.",advice:"Haz visible el problema y trabaja con él."},
  {name:"Gebo",symbol:"ᚷ",keys:["intercambio","equilibrio","don"],meaning:"La reciprocidad sostiene los acuerdos sanos.",advice:"Revisa qué das, qué recibes y qué esperas."},
  {name:"Wunjo",symbol:"ᚹ",keys:["armonía","alegría","pertenencia"],meaning:"La satisfacción surge de una alineación sencilla.",advice:"Cultiva lo que aporta bienestar compartido."},
  {name:"Nauthiz",symbol:"ᚾ",keys:["necesidad","límite","paciencia"],meaning:"Una restricción obliga a distinguir necesidad de deseo.",advice:"Trabaja con el límite real, no contra él."},
  {name:"Isa",symbol:"ᛁ",keys:["pausa","concentración","quietud"],meaning:"La pausa protege mientras algo toma forma.",advice:"No fuerces movimiento sin claridad."},
  {name:"Jera",symbol:"ᛃ",keys:["cosecha","ciclo","consecuencia"],meaning:"Los resultados maduran según lo sembrado.",advice:"Sostén el proceso y evalúa su ciclo."},
  {name:"Eihwaz",symbol:"ᛇ",keys:["resistencia","transición","eje"],meaning:"La estabilidad interna permite atravesar una transición.",advice:"Mantén tu eje mientras cambia el entorno."},
  {name:"Algiz",symbol:"ᛉ",keys:["protección","límites","atención"],meaning:"Los límites conscientes preservan energía y criterio.",advice:"Protege lo esencial sin cerrarte por completo."},
];

const spreads = { one:["Mensaje"], three:["Pasado","Presente","Tendencia"], relationship:["Tú","La otra persona","Dinámica","Obstáculo","Tendencia","Consejo"], decision:["Situación","Camino A","Resultado A","Camino B","Resultado B","Consejo"], celtic:["Situación","Cruce","Base","Pasado","Posibilidad","Futuro cercano","Actitud","Entorno","Esperanzas / temores","Tendencia"] };
const tarotSpreadGroups = [
 {titleKey:"quickSpreads",icon:"✧",items:["Una carta — mensaje central","Dos cartas — situación y consejo","Sí / No razonado — respuesta, condición y advertencia","Tres cartas — pasado, presente y tendencia","Situación, obstáculo y consejo","Mente, emoción y acción","Qué conservar, qué soltar y qué iniciar"]},
 {titleKey:"loveRelationships",icon:"♡",items:["Tú, la otra persona y el vínculo","Relación de seis cartas","Qué siente, qué piensa y qué hará","Compatibilidad de la pareja","Evolución del vínculo","Reconciliación o cierre","Persona nueva: intención, potencial y precaución"]},
 {titleKey:"decisions",icon:"⇄",items:["Camino A frente a Camino B","Ventajas, riesgos y resultado probable","Qué ocurre si actúo / si no actúo","Decisión de seis cartas","Semáforo: avanzar, esperar o detenerse"]},
 {titleKey:"workMoney",icon:"◇",items:["Situación laboral","Cambio de empleo","Proyecto o negocio","Bloqueo económico","Flujo de recursos","Oportunidad, riesgo y estrategia"]},
 {titleKey:"personalDevelopment",icon:"◉",items:["Sombra, aprendizaje y recurso","Bloqueo emocional","Propósito del momento","Ciclo que termina y ciclo que comienza","Herida, conciencia e integración","Los siete chakras","Rueda del año personal"]},
 {titleKey:"deepSpreads",icon:"✦",items:["Cruz Celta — 10 cartas","Herradura — 7 cartas","Estrella de siete cartas","Mandala de nueve cartas","Doce casas — 12 cartas","Árbol de la Vida — 10 cartas","Camino espiritual — 12 cartas"]},
] as const;
const categories = ["Amor y relaciones","Trabajo","Dinero","Familia","Decisión importante","Futuro cercano","Crecimiento personal","Consulta general"];
const serviceMenu = [
 {icon:"🔮",category:"Tarot",services:"Tarot de Marsella, Rider–Waite, Tarot Gitano, Tarot Egipcio, Osho Zen Tarot"},
 {icon:"👼",category:"Oráculos",services:"Ángeles, Arcángeles, Oráculo de los Maestros Ascendidos, Cartas de Diosas, Oráculo de Animales de Poder"},
 {icon:"✋",category:"Lectura corporal",services:"Quiromancia (manos), Fisonomía (rostro)"},
 {icon:"ᚠ",category:"Tradiciones antiguas",services:"Runas nórdicas, I Ching"},
 {icon:"✨",category:"Energía",services:"Lectura de aura, Chakras, Radiestesia (péndulo)"},
 {icon:"🌙",category:"Astrología",services:"Carta natal, revolución solar, compatibilidad, tránsitos"},
 {icon:"🔢",category:"Numerología",services:"Pitagórica, cabalística, numerología del nombre"},
 {icon:"🌳",category:"Kabbalah",services:"Árbol de la Vida, senderos, análisis espiritual"},
 {icon:"☯",category:"Feng Shui",services:"Diagnóstico energético del hogar u oficina"},
 {icon:"🌿",category:"Chamanismo",services:"Animales de poder, viaje chamánico (más nicho)"},
 {icon:"💎",category:"Cristales",services:"Recomendación energética según la consulta"},
];
const methodLabels:Record<Method,string> = {tarot:"Tarot",runes:"Runas",iching:"I Ching",numerology:"Numerología",angels:"Ángeles"};
const numberedImages=(folder:string,prefix:string,count:number,extension:string)=>Array.from({length:count},(_,index)=>`${folder}/${prefix}-${String(index+1).padStart(2,"0")}.${extension}`);
const homeMenuImages:Record<string,string[]>={
 "Tarot":tarotCatalog.map(card=>card.image),
 "Tarot Zen":numberedImages("/oracles/zen-oraculo/cards","zen",79,"jpg"),
 "Ángeles":numberedImages("/oracles/angels","angel",44,"webp"),
 "Animales de Poder":numberedImages("/oracles/animals","animal",44,"webp"),
 "Runas":["/oracles/rune-token-wood-v3.png","/oracles/runes-wood-v2.png","/oracles/runes-stone.png"],
 "I Ching":["/oracles/iching-balance.png"],
 "Radiestesia":["/oracles/pendulum/silver-witness-pendulum-held.jpg","/oracles/pendulum/silver-witness-pendulum.jpg","/oracles/pendulum/radiesthesia-board.svg"],
 "Chamalongos":["/oracles/chamalongos/tiger-cowrie-up.webp","/oracles/chamalongos/tiger-cowrie-down.webp"],
 "Kabbalah":["/textures/brushed-chrome-soft.webp","/textures/brushed-chrome.png"],
 "Astrología Occidental":["/oracles/astrology/western-astrolabe-v2.jpg"],
 "Numerología":["/oracles/numerology/numerology-oracle-v2.jpg"],
 "Quiromancia":["/oracles/pendulum/silver-witness-pendulum-held.jpg","/cards/rider-classic/dealing-hand-v3.png"],
 "Fisonomía":["/oracles/angels/angel-01.webp","/oracles/zen-oraculo/cards/zen-20.jpg"],
 "Energía / Aura":["/oracles/zen-oraculo/style-study-v2.png","/oracles/zen-oraculo/cards/zen-01.jpg","/oracles/angels/angel-20.webp"],
 "Feng Shui":["/oracles/iching-balance.png","/oracles/rune-token-wood-v3.png"],
 "Astrología Oriental":["/oracles/astrology/eastern-luopan-v2.jpg"],
 "Cita con Madame Meraki":["/speculum-animae-logo.png"]
};
function menuImage(system:string,seed:number){const images=homeMenuImages[system]||homeMenuImages["I Ching"];const hash=[...system].reduce((sum,char)=>sum+char.charCodeAt(0),0);return images[(seed+hash)%images.length]}
const nav = ["Inicio","Biblioteca","Comentarios"];
const viewRoutes:Record<string,string>={"Inicio":"/#/inicio","Biblioteca":"/#/biblioteca","Tarot Clásico":"/#/tarot-clasico","Tarot Zen":"/#/tarot-zen","Ángeles":"/#/angeles","Animales de Poder":"/#/animales-de-poder","Runas":"/#/runas","I Ching":"/#/i-ching","Radiestesia":"/#/radiestesia","Astrología Occidental":"/#/astrologia-occidental","Astrología Oriental":"/#/astrologia-oriental","Numerología":"/#/numerologia"};
const routeViews:Record<string,string>=Object.fromEntries(Object.entries(viewRoutes).map(([view,route])=>[route.split("#")[1],view]));

function secureIndex(max:number){ if(typeof crypto!=="undefined"&&crypto.getRandomValues){const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]%max} return Math.floor(Math.random()*max) }
function pickUnique<T>(items:T[], count:number){const pool=[...items], out:T[]=[], target=Math.min(count,pool.length); while(out.length<target){out.push(pool.splice(secureIndex(pool.length),1)[0])} return out}
function reduceNumber(n:number){while(n>9 && ![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+Number(b),0);return n}
function letters(name:string){const map:Record<string,number>={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};return [...name.normalize("NFD").replace(/[^a-z]/gi,"").toUpperCase()].map(c=>map[c]||0)}
function numerology(name:string,birth:string){const d=birth.replace(/\D/g,"").split("").map(Number), day=Number(birth.slice(8,10));const vals=letters(name), vowels=new Set(["A","E","I","O","U"]), chars=[...name.normalize("NFD").replace(/[^a-z]/gi,"").toUpperCase()];const soul=vals.filter((_,i)=>vowels.has(chars[i])).reduce((a,b)=>a+b,0), personality=vals.filter((_,i)=>!vowels.has(chars[i])).reduce((a,b)=>a+b,0);const now=new Date(), personal=reduceNumber(reduceNumber(day)+reduceNumber(Number(birth.slice(5,7)))+reduceNumber(now.getFullYear()));return {lifePath:reduceNumber(d.reduce((a,b)=>a+b,0)),birthday:reduceNumber(day),expression:reduceNumber(vals.reduce((a,b)=>a+b,0)),soul:reduceNumber(soul),personality:reduceNumber(personality),personalYear:personal,personalMonth:reduceNumber(personal+now.getMonth()+1)}}
const numberMeanings:Record<number,string>={1:"iniciativa y autonomía",2:"cooperación y sensibilidad",3:"expresión y creatividad",4:"estructura y constancia",5:"cambio y libertad responsable",6:"cuidado y armonía",7:"análisis e introspección",8:"gestión y resultados",9:"cierre, servicio y amplitud",11:"intuición e inspiración",22:"visión aplicada y construcción",33:"servicio compasivo"};

function categoryMeaning(card:typeof tarot[number],category:string){if(category.includes("Amor")||category.includes("Familia"))return card.love;if(category.includes("Trabajo"))return card.work;if(category.includes("Dinero"))return card.money;if(category.includes("Crecimiento"))return card.growth;return card.general}
function contextLens(context:string){const text=context.toLowerCase(), notes:string[]=[];if(/separad|distancia|sin contacto/.test(text))notes.push("distancia o separación");if(/junt|pareja|relación actual/.test(text))notes.push("vínculo activo");if(/nuevo|reciente|comenz/.test(text))notes.push("etapa inicial");if(/decid|opci|camino|elegir/.test(text))notes.push("elección entre alternativas");if(/cambio|renuncia|oferta|nuevo trabajo/.test(text))notes.push("transición profesional");if(/deuda|ingreso|ahorro|inversión/.test(text))notes.push("gestión de recursos");if(/conflicto|discusi|tensión/.test(text))notes.push("tensión expresada");return notes}
function buildTarot(question:string,context:string,category:string,spread:keyof typeof spreads,reversed:boolean,language:Language="ES"):Result{
 const lenses=contextLens(context), cards=pickUnique(tarot,spreads[spread].length).map((c,i)=>{const isReversed=reversed&&secureIndex(3)===0, base=isReversed?c.reversed:categoryMeaning(c,category);return {...c,position:spreads[spread][i],spread,isReversed,contextualInterpretation:`En "${spreads[spread][i]}", ${c.name}${isReversed?" invertida":""} pone el foco en ${c.keys.slice(0,2).join(" y ")}. ${base} ${lenses.length?`Al relacionarla con ${lenses.join(" y ")}, conviene contrastar este símbolo con lo que realmente estás observando.`:""}`}});
 const spreadNames={one:"Una carta — mensaje central",three:"Tres cartas — pasado, presente y tendencia",relationship:"Relación de seis cartas",decision:"Decisión de seis cartas",celtic:"Cruz Celta — 10 cartas"} as const;
 const readingAnalysis=analyzeTarotReading({spread:spreadNames[spread],positions:spreads[spread],cards,category,question,orientationEnabled:reversed,language});
 const paragraphs=composeTarotInterpretation(readingAnalysis,cards),opening=context.trim()?translateTarotIntro("Tomando en cuenta lo que compartiste, la lectura organiza la situación así:",language):translateTarotIntro("La lectura organiza la situación así:",language);
 const cardWord=spreads[spread].length>1?translateTarotIntro("cartas",language):translateTarotIntro("carta",language);
 return {method:"tarot",title:`${translateTarotIntro("Tarot",language)} · ${spreads[spread].length} ${cardWord}`,raw_result:{cards,readingAnalysis},themes:readingAnalysis.narrativeClusters.map((cluster:{theme:string})=>cluster.theme),obstacles:cards.filter(c=>c.isReversed).map(c=>c.reversed),opportunities:cards.filter(c=>!c.isReversed).map(c=>categoryMeaning(c,category)),advice:cards.map(c=>c.advice),interpretation:`${opening}\n\n${paragraphs.join("\n\n")}`}
}
function buildRunes(question:string,language:Language="ES"):Result{const drawn=pickUnique(runes,3).map((r,i)=>({...r,position:["Situación","Obstáculo","Consejo"][i],image:"/oracles/runes-wood-v2.png"}));return {method:"runes",title:translateRuneSystem("Runas · Situación / obstáculo / consejo",language),raw_result:drawn,themes:[...new Set(drawn.flatMap(r=>r.keys))],obstacles:[drawn[1].meaning],opportunities:[drawn[0].meaning],advice:[drawn[2].advice],interpretation:`${language==="ES"?"Las runas":language==="EN"?"The runes":language==="FR"?"Les runes":language==="DE"?"Die Runen":"As runas"} invitan a explorar ${drawn.flatMap(r=>r.keys).slice(0,3).join(", ")} alrededor de "${question}".`}}
function buildIChing(question:string,language:Language="ES"):Result{const lines=Array.from({length:6},()=>{const n=[6,7,8,9][secureIndex(4)];return {value:n,yang:n===7||n===9,changing:n===6||n===9}});const bits=lines.map(l=>l.yang?1:0).join(""), transformed=lines.map(l=>(l.changing?!l.yang:l.yang)?1:0).join("");const number=parseInt(bits,2)+1,resultNumber=parseInt(transformed,2)+1;const hexLabel=language==="ES"?"Hexagrama":language==="EN"?"Hexagram":language==="FR"?"Hexagramme":language==="DE"?"Hexagramm":"Hexagrama";const changeNote=language==="ES"?"El cambio requiere atención a los puntos móviles.":language==="EN"?"Change requires attention to the moving points.":language==="FR"?"Le changement nécessite une attention aux points mobiles.":language==="DE"?"Veränderung erfordert Aufmerksamkeit für die beweglichen Punkte.":"A mudança requer atenção aos pontos móveis.";const observeAdvice=language==="ES"?"Observar la evolución de la situación antes de forzarla.":language==="EN"?"Observe the evolution of the situation before forcing it.":language==="FR"?"Observez l'évolution de la situation avant de la forcer.":language==="DE"?"Beobachten Sie die Entwicklung der Situation, bevor Sie sie erzwingen.":"Observe a evolução da situação antes de forçá-la.";const respondAdvice=language==="ES"?"Responde al momento con coherencia y gradualidad.":language==="EN"?"Respond to the moment with coherence and graduality.":language==="FR"?"Répondez au moment avec cohérence et gradualité.":language==="DE"?"Reagieren Sie auf den Moment mit Kohärenz und Schrittweise.":"Responda ao momento com coerência e gradualidade.";const pendingContent=language==="ES"?"el contenido editorial completo de los 64 hexagramas está pendiente":language==="EN"?"the complete editorial content of the 64 hexagrams is pending":language==="FR"?"le contenu éditorial complet des 64 hexagrammes est en attente":language==="DE"?"der vollständige redaktionelle Inhalt der 64 Hexagramme steht aus":"o conteúdo editorial completo dos 64 hexagramas está pendente";return {method:"iching",title:`I Ching · ${hexLabel} ${number}`,raw_result:{lines,number,resultNumber,image:"/oracles/iching-balance.png"},themes:["cambio","equilibrio","proceso"],obstacles:lines.some(l=>l.changing)?[changeNote]:[],opportunities:[observeAdvice],advice:[respondAdvice],interpretation:`${translateIChingInterpretation("El hexagrama",language)} ${number}${number!==resultNumber?` ${translateIChingInterpretation("transforma hacia el",language)} ${resultNumber}`:` ${translateIChingInterpretation("permanece estable",language)}`}. ${translateIChingInterpretation("La lectura funciona como orientación simbólica sobre",language)} "${question}"; ${pendingContent}.`}}
function buildAngels(q:string,ctx:string,cat:string,lang:Language="ES"):Result{
  const c=angelCatalog[secureIndex(angelCatalog.length)];
  const cNote=ctx.trim()?` ${lang==="ES"?"Considerando el contexto que compartiste":lang==="EN"?"Considering the context you shared":lang==="FR"?"Considérant le contexte que vous avez partagé":lang==="DE"?"Unter Berücksichtigung des Kontexts, den Sie mitgeteilt haben":"Considerando o contexto que você compartilhou"} —"${ctx.trim()}"—,`:"";
  const msgInv=lang==="ES"?"el mensaje invita a explorar":lang==="EN"?"the message invites you to explore":lang==="FR"?"le message vous invite à explorer":lang==="DE"?"die Botschaft lädt Sie ein, zu erforschen":"a mensagem convida você a explorar";
  const symNote=lang==="ES"?"Esta orientación es simbólica: úsala como una pregunta de reflexión y contrástala con tu situación real.":lang==="EN"?"This guidance is symbolic: use it as a question for reflection and contrast it with your real situation.":lang==="FR"?"Cette orientation est symbolique: utilisez-la comme une question de réflexion et contrarez-la avec votre situation réelle.":lang==="DE"?"Diese Orientierung ist symbolisch: Verwenden Sie sie als Reflexionsfrage und vergleichen Sie sie mit Ihrer realen Situation.":"Esta orientação é simbólica: use-a como uma questão de reflexão e contraste com sua situação real.";
  const ttl=lang==="ES"?"Mensaje de Ángeles":lang==="EN"?"Angels Message":lang==="FR"?"Message des Anges":lang==="DE"?"Engelsbotschaft":"Mensagem dos Anjos";
  return {method:"angels",title:`${ttl} · ${c.family}`,raw_result:c,themes:[...c.keys],obstacles:[],opportunities:[c.message],advice:[c.message],interpretation:`${translateAngelInterpretation("Para tu pregunta",lang)} "${q}" ${translateAngelInterpretation("en",lang)} ${cat.toLowerCase()}, ${translateAngelInterpretation("aparece",lang)} ${c.name}.${cNote} ${msgInv} ${c.keys.join(" y ")}. ${c.message} ${symNote}`}
}
function buildNumerology(name:string,birth:string,language:Language="ES"):Result{const n=numerology(name,birth);const lifePath=language==="ES"?"Camino de Vida":language==="EN"?"Life Path":language==="FR"?"Chemin de Vie":language==="DE"?"Lebensweg":"Caminho de Vida";const yearLabel=language==="ES"?"Año personal":language==="EN"?"Personal Year":language==="FR"?"Année personnelle":language==="DE"?"Persönliches Jahr":"Ano pessoal";const explore=language==="ES"?"explora":language==="EN"?"explore":language==="FR"?"explorez":language==="DE"?"erkunden":"explorar";const expression=language==="ES"?"Expresión":language==="EN"?"Expression":language==="FR"?"Expression":language==="DE"?"Ausdruck":"Expressão";const soul=language==="ES"?"Alma":language==="EN"?"Soul":language==="FR"?"Âme":language==="DE"?"Seele":"Alma";return {method:"numerology",title:translateNumerologyInterpretation("Perfil numerológico",language),raw_result:n,themes:[numberMeanings[n.lifePath],numberMeanings[n.expression]],obstacles:[],opportunities:[`${lifePath} ${n.lifePath}: ${numberMeanings[n.lifePath]}`],advice:[`${yearLabel} ${n.personalYear}: ${explore} ${numberMeanings[n.personalYear]}.`],interpretation:`${translateNumerologyInterpretation("Cálculo determinista basado en el nombre y fecha proporcionados",language)}. ${lifePath} ${n.lifePath}; ${expression} ${n.expression}; ${soul} ${n.soul}.`}}
function analyze(results:Result[]){const all=results.flatMap(r=>r.themes).map(x=>x.toLowerCase()), counts=new Map<string,number>();all.forEach(x=>counts.set(x,(counts.get(x)||0)+1));const repeated=[...counts.entries()].filter(([,n])=>n>1).map(([x])=>x);return {central:repeated[0]||all[0]||"observación consciente",matches:repeated.length?repeated.join(", "):"Cada método aporta una perspectiva distinta.",differences:results.length>1?"Las disciplinas usan lenguajes diferentes; sus matices no deben forzarse a coincidir.":"Se utilizó una sola disciplina.",obstacles:[...new Set(results.flatMap(r=>r.obstacles))].slice(0,3),opportunities:[...new Set(results.flatMap(r=>r.opportunities))].slice(0,3),advice:[...new Set(results.flatMap(r=>r.advice))].slice(0,3),confidence:repeated.length>=2?"Convergencia alta":repeated.length?"Convergencia media":"Perspectivas diversas"}}

function ServiceCards({items,onSelect}:{items:ServiceDefinition[];onSelect:(service:ServiceDefinition)=>void}){
 return <div className="service-choice-grid">{items.map(service=><button key={service.id} className={`service-choice ${service.status==="COMING_SOON"?"coming-soon":""}`} onClick={()=>onSelect(service)}><span className="service-choice-icon" aria-hidden="true">{service.icon}</span><span><b>{service.name}</b><small>{service.description}</small></span><em>{service.status==="AVAILABLE"?"→":"PRÓXIMAMENTE"}</em></button>)}</div>
}

function SelectionGroup({title,description,items,onSelect}:{title:string;description:string;items:ServiceDefinition[];onSelect:(service:ServiceDefinition)=>void}){
 return <section className="selection-group"><div className="selection-group-head"><div><span className="mini-label">{title}</span><h2>{title}</h2></div><p>{description}</p></div><ServiceCards items={items} onSelect={onSelect}/></section>
}

function ClassicTarotSite({onBack,lang}:{onBack:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const [shufflePhase,setShufflePhase]=useState<"idle"|"shuffling"|"ready">("idle");
 const [selectedSpread,setSelectedSpread]=useState("");
 const [includeReversed,setIncludeReversed]=useState(false);
 const [dealKey,setDealKey]=useState(0);
 const [tarotStep,setTarotStep]=useState<"menu"|"shuffle"|"reading">("menu");
 const spreadDefinition=selectedSpread?classicSpreadByName.get(selectedSpread):undefined;
 const tarotLibrary=useMemo<DisciplineLibraryItem[]>(()=>tarot.map(card=>{const localized=localizeRiderCard(card,language);return {id:card.id,name:localized.name,category:`${libraryCategories[language].card} · ${localized.arcana}`,description:localized.general||libraryDescriptions[language].tarot,image:card.image}}),[language]);
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 // Force explicit translation key access
 const titleTranslations = {quickSpreads:translations[language].quickSpreads,loveRelationships:translations[language].loveRelationships,decisions:translations[language].decisions,workMoney:translations[language].workMoney,personalDevelopment:translations[language].personalDevelopment,deepSpreads:translations[language].deepSpreads} as const;
 function chooseSpread(item:string){setSelectedSpread(item);setShufflePhase("idle");setTarotStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function toggleShuffle(){if(shufflePhase!=="shuffling"){setShufflePhase("shuffling");return}setShufflePhase("ready");setDealKey(current=>current+1);window.setTimeout(()=>{setTarotStep("reading");window.scrollTo({top:0,behavior:"smooth"})},420)}
 function returnToMenu(){setTarotStep("menu");setShufflePhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site tarot-step-${tarotStep}`}>
  <button className="system-back" onClick={tarotStep==="menu"?onBack:returnToMenu}>{t("back")}</button>
  {tarotStep==="menu"&&<><div className="tarot-menu-title"><h1>{t("classicTarotTitle")}</h1><span>{t("classicTarotSubtitle")}</span><div className="rider-history"><p>{t("classicTarotHistory1")}</p><p>{t("classicTarotHistory2")}</p><p>{t("classicTarotHistory3")}</p><small>{t("classicTarotHistory4")}</small></div></div><section className="spread-menu-section"><span className="mini-label">{t("chooseApproach")}</span><div className="spread-category-grid">{tarotSpreadGroups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.titleKey}><summary><span className="spread-symbol" aria-hidden="true"><i>{group.icon}</i></span><div><b>{t(group.titleKey)}</b><small>{group.items.length} {t("spreadsLabel")}</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>chooseSpread(item)} key={item}>{translateSpreadName(item, undefined, language)}<span>→</span></button>)}</div></details>)}</div></section><CollapsibleDisciplineLibrary lang={language} items={tarotLibrary}/></>}
  {tarotStep==="shuffle"&&<><div className="tarot-classic-head"><h1>{translateSpreadName(selectedSpread, undefined, language)}</h1></div><div className="tarot-shuffle-stage"><div className="deck-touch-area"><div className={`animated-deck ${shufflePhase}`} role="button" tabIndex={0} onClick={toggleShuffle} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();toggleShuffle()}}} aria-label={shufflePhase==="shuffling"?t("stopShuffling"):t("startShuffling")}>{Array.from({length:9},(_,index)=><div className="shuffle-card" key={index}><span>✦</span></div>)}</div></div><div className="shuffle-guidance" aria-live="polite"><p>{shufflePhase==="shuffling"?t("focusDuringShuffling"):t("focusBeforeShuffling")}</p></div><button type="button" className={`reversed-option stage-reversed-option ${includeReversed?"active":""}`} aria-pressed={includeReversed} disabled={shufflePhase!=="idle"} onClick={()=>setIncludeReversed(value=>!value)}><span aria-hidden="true">↕</span><b>{t("includeReversed")}</b><small>{includeReversed?t("reversedActive"):t("reversedInactive")}</small></button></div></>}
  {tarotStep==="reading"&&spreadDefinition&&<AnimatedTarotDeal key={`${spreadDefinition.name}-${dealKey}-${includeReversed}`} spread={spreadDefinition} dealKey={dealKey} includeReversed={includeReversed} onReplay={()=>setDealKey(current=>current+1)} onMoreQuestions={onBack} lang={language}/>}
 </section>
}

type OracleCard={id:string;name:string;image:string;theme:string;message:string;detail:string};
type OracleSystemKey="zen"|"angels"|"animals";
type OracleReadingGroup={title:string;icon:string;items:TarotSpreadDefinition[]};
type OracleSystemConfig={key:OracleSystemKey;title:string;subtitle:string;introduction:string;groups:OracleReadingGroup[];cards:OracleCard[]};
const completeOracleReadingMenu:OracleReadingGroup[]=tarotSpreadGroups.map(group=>({
 title:group.titleKey,
 icon:group.icon,
 items:group.items.map(name=>classicSpreadByName.get(name)).filter((item):item is TarotSpreadDefinition=>Boolean(item))
}));
const oracleSystems:Record<OracleSystemKey,OracleSystemConfig>={
 zen:{key:"zen",title:"ZEN",subtitle:"CONCIENCIA · PRESENCIA · INTEGRACIÓN",introduction:"ZEN es un desarrollo original de Speculum Animae, inspirado en las enseñanzas de Osho y en la tradición contemplativa del Zen. Fue creado para transmitir la integración del cosmos con uno mismo: sus imágenes invitan a observar la conciencia, reconocer nuestros vínculos con el entorno y responder al presente desde una visión más amplia e integrada.",cards:oshoZenReference.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.group} · ${card.phase}`,message:card.message,detail:`${card.question} ${card.action}`})),groups:completeOracleReadingMenu},
 angels:{key:"angels",title:"Ángeles",subtitle:"ORIENTACIÓN · PROTECCIÓN · ACCIÓN",introduction:"Ángeles es una baraja original desarrollada por Speculum Animae a partir del simbolismo de mensajeros y figuras protectoras presente en distintas tradiciones. Su propósito es orientarnos, ayudarnos a reconocer aquello que necesita cuidado y ofrecer mensajes de protección, límites y acciones conscientes.",cards:angelCatalog.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.role} · ${card.family}`,message:card.message,detail:`${card.attribute}. ${card.keys.join(", ")}. Tradición de referencia: ${card.tradition}.`})),groups:completeOracleReadingMenu},
 animals:{key:"animals",title:"Animales de Poder",subtitle:"INSTINTO · RECURSO · ACCIÓN",introduction:"Animales de Poder es una creación original de Speculum Animae inspirada en las cualidades que distintas culturas han reconocido en el mundo animal. Cada carta funciona como un espejo simbólico para descubrir fortalezas, instintos, formas de adaptación y recursos personales que pueden convertirse en respuestas prácticas.",cards:powerAnimals.map(card=>({id:card.id,name:card.name,image:card.image,theme:card.meaning,message:card.message,detail:`Su cualidad es ${card.meaning.toLowerCase()}. Observa dónde puedes aplicarla de manera concreta.`})),groups:completeOracleReadingMenu}
};
function buildOracleCards(system:OracleSystemKey,language:Language):OracleCard[]{
 if(language==="ES")return oracleSystems[system].cards;
 if(system==="zen")return oshoZenReference.map(card=>{const localized=localizeZenCard(card,language);return {id:card.id,name:localized.name,image:card.image,theme:localized.theme,message:localized.message,detail:localized.detail}});
 if(system==="angels")return angelCatalog.map((card,index)=>{const localized=localizeAngelCard(card,index,language);return {id:card.id,name:localized.name,image:card.image,theme:localized.theme,message:localized.message,detail:localized.detail}});
 return powerAnimals.map((card,index)=>{const localized=localizeAnimalCard(card,index,language);return {id:card.id,name:localized.name,image:card.image,theme:localized.theme,message:localized.message,detail:localized.detail}});
}

function OracleSystemSite({system,onBack,lang}:{system:OracleSystemKey;onBack:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const config=useMemo(()=>({...oracleSystems[system],cards:buildOracleCards(system,language)}),[system,language]);
 const oracleLibrary=useMemo<DisciplineLibraryItem[]>(()=>config.cards.map(card=>({id:card.id,name:card.name,category:card.theme,description:card.message,image:card.image})),[config.cards]);
 const [step,setStep]=useState<"menu"|"shuffle"|"reading">("menu"),[selected,setSelected]=useState<TarotSpreadDefinition|null>(null),[phase,setPhase]=useState<"idle"|"shuffling">("idle"),[dealKey,setDealKey]=useState(0);
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const oracleTitle=system==="zen"?"zenTitle":system==="angels"?"angelsTitle":"animalsTitle";
 const oracleSubtitle=system==="zen"?"zenSubtitle":system==="angels"?"angelsSubtitle":"animalsSubtitle";
 const oracleIntro=system==="zen"?"zenIntroduction":system==="angels"?"angelsIntroduction":"animalsIntroduction";
 function choose(reading:TarotSpreadDefinition){setSelected(reading);setPhase("idle");setStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function shuffle(){if(phase==="idle"){setPhase("shuffling");return}setDealKey(value=>value+1);setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site oracle-system-site oracle-${system} tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?t("back"):t("chooseOtherReading")}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>{t(oracleTitle)}</h1><span>{t(oracleSubtitle)}</span><p className="system-introduction">{t(oracleIntro)}</p></div><section className="spread-menu-section"><span className="mini-label">{t("chooseApproach")}</span><div className="spread-category-grid">{config.groups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.title}><summary><span className="spread-symbol"><i>{group.icon}</i></span><div><b>{t(group.title)}</b><small>{group.items.length} {t("oracleReadingsLabel")}</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>choose(item)} key={item.name}>{translateSpreadName(item.name, undefined, language)}<span>→</span></button>)}</div></details>)}</div></section><CollapsibleDisciplineLibrary lang={language} items={oracleLibrary}/></>}
  {step==="shuffle"&&selected&&<><div className="tarot-classic-head"><h1>{translateSpreadName(selected.name, undefined, language)}</h1></div><div className="tarot-shuffle-stage oracle-shuffle-stage"><div className="deck-touch-area"><div className={`animated-deck ${phase}`} role="button" tabIndex={0} onClick={shuffle} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();shuffle()}}}>{Array.from({length:9},(_,index)=><div className="shuffle-card" key={index}><img src={config.cards[(index*7)%config.cards.length].image} alt=""/></div>)}</div></div><div className="shuffle-guidance"><p>{phase==="shuffling"?t("focusDuringShuffling"):t("focusBeforeShuffling")}</p></div><div className="oracle-method-note"><b>{t(oracleTitle)}</b><small>{t(oracleSubtitle)}</small></div></div></>}
  {step==="reading"&&selected&&<AnimatedOracleDeal key={`${system}-${selected.name}-${dealKey}`} config={config} reading={selected} dealKey={dealKey} onReplay={()=>setDealKey(value=>value+1)} onMoreQuestions={onBack} language={lang}/>}
 </section>
}

type DealPoint={x:number;y:number;r?:number};
const polar=(count:number,radius:number,start=-90)=>Array.from({length:count},(_,index)=>{const angle=(start+(360/count)*index)*Math.PI/180;return {x:50+Math.cos(angle)*radius,y:50+Math.sin(angle)*radius,r:(start+(360/count)*index+90)*.05}});
function dealPoints(layout:TarotSpreadLayout,count:number):DealPoint[]{
 if(layout==="line")return Array.from({length:count},(_,i)=>({x:50+(i-(count-1)/2)*Math.min(22,64/Math.max(1,count-1)),y:53,r:(i-(count-1)/2)*2}));
 if(layout==="grid")return Array.from({length:count},(_,i)=>({x:32+(i%3)*18,y:34+Math.floor(i/3)*34}));
 if(layout==="cross")return [{x:50,y:50},{x:50,y:20},{x:76,y:50},{x:50,y:80},{x:24,y:50}].slice(0,count);
 if(layout==="branches")return [{x:50,y:22},{x:28,y:46},{x:72,y:46},{x:22,y:76},{x:78,y:76},{x:50,y:78}].slice(0,count);
 if(layout==="chakra")return Array.from({length:count},(_,i)=>({x:50,y:88-i*12,r:i%2?2:-2}));
 if(layout==="wheel")return [...polar(Math.max(1,count-1),34),{x:50,y:50}].slice(0,count);
 if(layout==="celtic")return [{x:37,y:45},{x:37,y:58,r:90},{x:37,y:78},{x:18,y:49},{x:37,y:18},{x:58,y:49},{x:78,y:82},{x:78,y:62},{x:78,y:42},{x:78,y:20}];
 if(layout==="star")return [{x:50,y:50},...polar(6,35,-90)];
 if(layout==="mandala")return [{x:50,y:50},...polar(8,35,-90)];
 if(layout==="houses")return polar(12,37,-90);
 if(layout==="tree")return [{x:50,y:9},{x:66,y:24},{x:34,y:24},{x:69,y:43},{x:31,y:43},{x:50,y:52},{x:69,y:69},{x:31,y:69},{x:50,y:79},{x:50,y:94}];
 if(layout==="path")return Array.from({length:count},(_,i)=>({x:i%2?64:36,y:8+i*7.7,r:i%2?5:-5}));
 return Array.from({length:count},(_,i)=>{const t=count===1?.5:i/(count-1);return {x:16+t*68,y:72-Math.sin(t*Math.PI)*48,r:(t-.5)*18}});
}

function RuneSystemSite({onBack,lang}:{onBack:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const titleMap:Record<string,string>={"Tiradas rápidas":"quickSpreads","Amor y relaciones":"loveRelationships","Decisiones y proyectos":"decisions","Desarrollo personal":"personalDevelopment","Tiradas profundas":"deepSpreads"};
 const [step,setStep]=useState<"menu"|"shuffle"|"reading">("menu"),[selected,setSelected]=useState<RuneSpread|null>(null),[phase,setPhase]=useState<"idle"|"shuffling">("idle"),[dealKey,setDealKey]=useState(0);
 const runeLibrary=useMemo<DisciplineLibraryItem[]>(()=>runeMeanings.map(rune=>({id:rune.id,name:translateRuneName(rune.name,undefined,language),category:libraryCategories[language].symbol,description:language==="ES"?rune.core:libraryDescriptions[language].rune,symbol:rune.symbol,visual:"rune"})),[language]);
 function choose(reading:RuneSpread){setSelected(reading);setPhase("idle");setStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function touchBag(){if(phase==="idle"){setPhase("shuffling");return}setDealKey(value=>value+1);setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site ancient-system-site rune-system-site tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?t("back"):t("chooseOtherReading")}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>{t("runesTitle")}</h1><span>{t("runesSubtitle")}</span><p className="system-introduction">{t("runesIntroduction")}</p></div><section className="spread-menu-section rune-menu"><span className="mini-label">{t("chooseApproach")}</span><div className="spread-category-grid">{runeReadingGroups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.title}><summary><span className="spread-symbol"><i>{group.icon}</i></span><div><b>{t(titleMap[group.title]||group.title)}</b><small>{group.items.length} {t("spreadsLabel")}</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>choose(item)} key={item.id}><span><strong>{translateSpreadName(item.name, undefined, language)}</strong><small>{translateSpreadDescription(item.description, language)}</small></span><b>→</b></button>)}</div></details>)}</div></section><CollapsibleDisciplineLibrary lang={language} items={runeLibrary}/></>}
  {step==="shuffle"&&selected&&<><div className="tarot-classic-head"><h1>{translateSpreadName(selected.name, undefined, language)}</h1><p>{translateSpreadDescription(selected.description, language)}</p></div><div className="ancient-preparation rune-preparation"><p className="rune-shuffle-guidance">{translateRuneSystem("Antes de tocar la bolsa de las Runas, concéntrate en qué quieres saber.",language)}</p><div className={`rune-bag ${phase}`} role="button" tabIndex={0} aria-label={phase==="shuffling"?translateRuneSystem("Toca de nuevo para tomar las runas",language):translateRuneSystem("Toca la bolsa para mezclar las runas",language)} onClick={touchBag} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();touchBag()}}}><img className="rune-bag-photo" src="/oracles/runes/felt-rune-bag-purple.png" alt="Bolsa morada abierta de paño para las runas"/>{runeMeanings.slice(0,9).map((rune,index)=><i style={{"--i":index} as CSSProperties} key={rune.name}>{rune.symbol}</i>)}</div></div></>}
  {step==="reading"&&selected&&<RuneReadingStage key={`${selected.id}-${dealKey}`} spread={selected} dealKey={dealKey} onReplay={()=>setDealKey(value=>value+1)} onMoreQuestions={onBack} lang={language}/>} 
 </section>
}

function runeLayoutPoints(spread:RuneSpread):DealPoint[]{
 if(spread.layout==="cross")return dealPoints("cross",spread.positions.length);
 if(spread.layout==="branches"&&spread.positions.length>6)return [{x:50,y:14},{x:27,y:34},{x:73,y:34},{x:19,y:61},{x:81,y:61},{x:35,y:85},{x:65,y:85}];
 if(spread.layout==="branches")return dealPoints("branches",spread.positions.length);
 if(spread.layout==="wheel")return dealPoints("houses",spread.positions.length);
 if(spread.layout==="nine")return Array.from({length:spread.positions.length},(_,index)=>({x:27+(index%3)*23,y:24+Math.floor(index/3)*27,r:(index%3-1)*2}));
 return dealPoints("line",spread.positions.length);
}

function RuneReadingStage({spread,dealKey,onReplay,onMoreQuestions,lang}:{spread:RuneSpread;dealKey:number;onReplay:()=>void;onMoreQuestions:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const drawn=useMemo(()=>pickUnique(runeMeanings,spread.positions.length),[spread.id,dealKey]),reading=useMemo(()=>interpretRuneSpread(spread,drawn,language),[spread,drawn,language]),points=runeLayoutPoints(spread),[zoomRune,setZoomRune]=useState<{symbol:string;name:string;meaning:string}|null>(null);
 const runeCards=useMemo(()=>drawn.map((rune,index)=>({num:index+1,label:translatePositionLabel(spread.positions[index].label, undefined, language),card:rune.name,reversed:false})),[drawn,spread.positions,language]);
 const {interpretation:aiInterpretation,followupQuestion,isLoading,error}=useAIInterpretation({discipline:"runes",spread:spread.name,cards:runeCards,language});
 const aiSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);
 return <><div className="tarot-reading-title"><h1>{translateRuneName(spread.name, undefined, language)}</h1><span>{spread.positions.length} RUNA{spread.positions.length===1?"":"S"}</span></div><section className="ancient-reading-shell rune-reading-shell"><div className="spread-table-heading"><button onClick={onReplay}>{t("replayRunes")}</button></div><div className={`rune-cast-board rune-layout-${spread.layout}`}>{points.map((point,index)=><article className="rune-cast-item" style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties} key={`${drawn[index].id}-${index}`} onClick={()=>setZoomRune({symbol:drawn[index].symbol,name:drawn[index].name,meaning:drawn[index].meaning})}><RuneToken symbol={drawn[index].symbol} name={drawn[index].name}/><p><b>{index+1}</b><span>{translatePositionLabel(spread.positions[index].label, t)}</span></p></article>)}</div><p className="deal-note">{t("runeInterpretationNote")}</p><section className="classic-reading ancient-interpretation"><div className="reading-synthesis"><small>{t("messageAndInterpretation")}</small>{aiSections[0]?.title&&<h3>{aiSections[0].title}</h3>}{reading.verdict&&<div className="ancient-verdict">{reading.verdict}</div>}{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>{t("generatingInterpretation")}</p>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((section,idx)=><article key={section.id}>{idx>0&&<h4>{section.title}</h4>}<p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>:<div className="reading-output-sections">{reading.sections.map(section=><article key={section.id}><h4>{section.title}</h4><p dangerouslySetInnerHTML={{__html:markdownToHtml(section.body)}}/></article>)}</div>}{!isLoading&&aiSections.length===0&&reading.showWarning&&<div className="combination-warnings"><strong>{reading.warningTitle}</strong><p>{reading.caution}</p></div>}{!isLoading&&aiSections.length===0&&reading.showAdvice&&<p className="protective-close encouragement"><strong>{reading.adviceTitle}</strong><span>{reading.advice}</span></p>}</div><FollowupPanel discipline="runes" spread={spread.name} cards={runeCards} language={language} followupQuestion={followupQuestion} onMoreQuestions={onMoreQuestions} t={t}/></section></section>
 <CardZoomModal isOpen={!!zoomRune} symbol={zoomRune?.symbol} title={zoomRune?.name||""} meaning={zoomRune?.meaning||""} onClose={()=>setZoomRune(null)}/>
 </>
}

function IChingSystemSite({onBack,lang}:{onBack:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const [step,setStep]=useState<"menu"|"cast"|"reading">("menu"),[selected,setSelected]=useState<IChingConsultation|null>(null),[phase,setPhase]=useState<"idle"|"casting"|"complete">("idle"),[castKey,setCastKey]=useState(0),[castRound,setCastRound]=useState(0),[castLines,setCastLines]=useState<IChingLine[]>([]);
 const ichingLibrary=useMemo<DisciplineLibraryItem[]>(()=>ichingCatalog.map(hexagram=>({id:`hexagram-${hexagram.number}`,name:`${hexagram.number}. ${translateIChingHexagram(hexagram.name,language)}`,category:libraryCategories[language].hexagram,description:libraryDescriptions[language].hexagram,symbol:hexagram.symbol,pattern:hexagram.pattern,visual:"hexagram"})),[language]);
 useEffect(()=>{if(phase!=="casting")return;if(castRound>=6){const timer=window.setTimeout(()=>setPhase("complete"),700);return()=>window.clearTimeout(timer)}const timer=window.setTimeout(()=>setCastRound(value=>value+1),1050);return()=>window.clearTimeout(timer)},[phase,castRound]);
 function choose(item:IChingConsultation){setSelected(item);setPhase("idle");setCastRound(0);setCastLines([]);setCastKey(0);setStep("cast");window.scrollTo({top:0,behavior:"smooth"})}
 function cast(){if(phase!=="idle")return;setCastLines(castIChing());setCastRound(0);setPhase("casting")}
 function revealInterpretation(){if(phase!=="complete")return;setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");setCastRound(0);setCastLines([]);window.scrollTo({top:0,behavior:"smooth"})}
 const mutatingLineNumbers=castLines.map((line,index)=>line.changing?index+1:0).filter(Boolean),mutatingLineLabel=mutatingLineNumbers.length===1?`${t("ichingMutatingLine")} ${mutatingLineNumbers[0]} ${t("ichingMutatingLineIs")}`:`${t("ichingMutatingLines")} ${mutatingLineNumbers.slice(0,-1).join(", ")} ${t("ichingMutatingLinesAre")}`;
 return <section className={`tarot-classic-site ancient-system-site iching-system-site tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?t("back"):t("chooseOtherReading")}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>{t("ichingTitle")}</h1><span>{t("ichingSubtitle")}</span><p className="system-introduction">{t("ichingIntroduction")}</p></div><section className="iching-consultation-menu"><span className="mini-label">{t("chooseApproach")}</span><div>{ichingConsultations.map((item,index)=><button onClick={()=>choose(item)} key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div><b>{translateIChingConsultation(item.name, undefined, language)}</b><small>{translateIChingConsultDescription(item.description, language)}</small></div><em>→</em></button>)}</div></section><CollapsibleDisciplineLibrary lang={language} items={ichingLibrary}/></>}
  {step==="cast"&&selected&&<><div className="tarot-classic-head"><h1>{translateIChingConsultation(selected.name, undefined, language)}</h1><p>{translateIChingConsultDescription(selected.description, language)}</p></div><div className="ancient-preparation iching-preparation"><p className="iching-cast-guidance">{t("ichingGuidance")}</p><div className="iching-cast-stage"><div className={`coin-cast ${phase}`} role="button" tabIndex={phase==="idle"?0:-1} onClick={cast} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();cast()}}} aria-label={phase==="casting"?`${t("ichingCastLabel")} ${Math.min(castRound+1,6)} ${t("ichingCastOf")}`:phase==="complete"?t("ichingCastComplete"):t("ichingTouchCoins")}>{Array.from({length:3},(_,index)=><i style={{"--i":index} as CSSProperties} key={`${castRound}-${index}`}><img src="/oracles/iching/antique-cash-coin.png" alt=""/></i>)}</div><div className={`iching-evolution-board ${phase}`}><div className="iching-line-builder primary" aria-label={`${castRound} ${t("ichingLinesFormed")}`}>{castLines.slice(0,castRound).map((line,index)=><span style={{"--i":index} as CSSProperties} className={`${line.yang?"yang":"yin"} ${line.changing?"changing":""}`} key={index}>{line.yang?<i/>:<><i/><i/></>}</span>)}</div>{phase==="complete"&&<><span className="evolution-arrow" aria-hidden="true">→</span><div className="iching-line-builder evolved" aria-label={t("ichingHexagramEvolved")}>{castLines.map((line,index)=>{const yang=line.changing?!line.yang:line.yang;return <span style={{"--i":index} as CSSProperties} className={`${yang?"yang":"yin"} ${line.changing?"from-changing":""}`} key={index}>{yang?<i/>:<><i/><i/></>}</span>})}</div></>}</div>{phase==="complete"&&<div className="iching-evolution-explanation"><p>{t("ichingFirstHexagram")} {mutatingLineNumbers.length?`${mutatingLineLabel}. ${mutatingLineNumbers.length===1?t("ichingThatPointShows"):t("ichingThosePointsShow")} ${t("ichingWhereChanging")}`:t("ichingNoMutating")}</p><button onClick={revealInterpretation}>{t("ichingViewInterpretation")} <span>→</span></button></div>}</div></div></>}
  {step==="reading"&&selected&&<IChingReadingStage key={`${selected.id}-${castKey}`} consultation={selected} castKey={castKey} initialLines={castLines} onReplay={()=>setCastKey(value=>value+1)} onMoreQuestions={onBack} lang={language}/>} 
 </section>
}

function CastHexagram({lines,title}:{lines:IChingLine[];title:string}){
 return <div className="cast-hexagram" role="img" aria-label={title}><div>{[...lines].reverse().map((line,index)=><span className={`${line.yang?"yang":"yin"} ${line.changing?"changing":""}`} key={index}>{line.yang?<i/>:<><i/><i/></>}{line.changing&&<b>×</b>}</span>)}</div></div>
}

function IChingReadingStage({consultation,castKey,initialLines,onReplay,onMoreQuestions,lang}:{consultation:IChingConsultation;castKey:number;initialLines:IChingLine[];onReplay:()=>void;onMoreQuestions:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const lines=useMemo(()=>castKey===0&&initialLines.length===6?initialLines:castIChing(),[consultation.id,castKey,initialLines]),reading=useMemo(()=>interpretIChing(consultation,lines,language),[consultation,lines,language]),resultLines=lines.map(line=>({...line,yang:line.changing?!line.yang:line.yang,changing:false}));
 const iChingCards=useMemo(()=>[{num:1,label:translatePositionLabel("Hexagrama principal", undefined, language),card:reading.primary.name,reversed:false},{num:2,label:translatePositionLabel("Hexagrama resultante", undefined, language),card:reading.transformed.name,reversed:false}],[reading.primary.name,reading.transformed.name,language]);
 const {interpretation:aiInterpretation,followupQuestion,isLoading,error}=useAIInterpretation({discipline:"iching",spread:consultation.name,cards:iChingCards,language});
 const aiSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);
 return <><div className="tarot-reading-title"><h1>{translateIChingConsultation(consultation.name, undefined, language)}</h1><span>I CHING · {t("iChingLinesLabel")}</span></div><section className="ancient-reading-shell iching-reading-shell"><div className="spread-table-heading"><button onClick={onReplay}>{t("consultAgain")} ↻</button></div><div className="iching-transformation"><article><CastHexagram lines={lines} title="Hexagrama principal"/><div className="iching-card-caption"><small>{reading.primary.number}</small><h2>{translateIChingHexagram(reading.primary.name, language)}</h2></div></article><div className="transformation-arrow"><span>→</span><small>{reading.changingLines.length?`${reading.changingLines.length} línea${reading.changingLines.length===1?"":"s"} mutante${reading.changingLines.length===1?"":"s"}`:t("noMutatingLines")}</small></div><article><CastHexagram lines={resultLines} title="Hexagrama resultante"/><div className="iching-card-caption"><small>{reading.transformed.number}</small><h2>{translateIChingHexagram(reading.transformed.name, language)}</h2></div></article></div><section className="classic-reading ancient-interpretation"><div className="reading-synthesis"><small>{t("messageAndInterpretation")}</small>{aiSections[0]?.title&&<h3>{aiSections[0].title}</h3>}{consultation.id==="reasoned"&&<div className="ancient-verdict">{reading.verdict}</div>}<p>{reading.summary}</p>{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>{t("generatingInterpretation")}</p>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((section,idx)=><article key={section.id}>{idx>0&&<h4>{section.title}</h4>}<p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>:<div className="reading-output-sections">{reading.sections.map(section=><article key={section.id}><h4>{section.title}</h4><p>{section.body}</p></article>)}</div>}{!isLoading&&aiSections.length===0&&reading.showWarning&&<div className="combination-warnings"><strong>{reading.warningTitle}</strong><p>{reading.caution}</p></div>}{!isLoading&&aiSections.length===0&&reading.showAdvice&&<p className="protective-close encouragement"><strong>{reading.adviceTitle}</strong><span>{reading.advice}</span></p>}</div><div className="individual-reading iching-details"><span className="mini-label">{t("internalStructure")}</span><h2>{t("whatSustains")}</h2><div className="iching-nuclear-detail"><HexagramDiagram pattern={reading.nuclear.pattern} name={reading.nuclear.name}/><div><small>HEXAGRAMA NUCLEAR {reading.nuclear.number}</small><h3>{reading.nuclear.name}</h3><p>{getIChingCounsel(reading.nuclear.number,language)}</p></div></div><div className="iching-line-detail"><h3>{t("changingLines")}</h3>{reading.changingLines.length?reading.changingLines.map(number=><p key={number}><b>Línea {number}.</b> {t("lineModifies")} {reading.transformed.name}.</p>):<p>{t("hexagramNotChanging")}</p>}</div><FollowupPanel discipline="iching" spread={consultation.name} cards={iChingCards} language={language} followupQuestion={followupQuestion} onMoreQuestions={onMoreQuestions} t={t}/></div></section></section></>
}

type ClassicCard=typeof tarot[number]&{isReversed:boolean};
function narrativeLens(position:string,card:ClassicCard,index:number,total:number){
 const label=position.toLowerCase();
 const messages:Record<string,string>={
  "00":"Estás iniciando algo nuevo. Avanza, pero no actúes sin medir las consecuencias.",
  "01":"Cuentas con los recursos para cambiar la situación. Elige una acción concreta y ejecútala.",
  "02":"Falta información. Escucha tu intuición, pero confirma los datos antes de decidir.",
  "06":"Tienes que tomar una decisión. Elige lo que coincide con tus valores, no lo más cómodo ni lo que otros esperan de ti.",
  "09":"Detente y revisa la situación sin opiniones externas. La presión está ocultando detalles importantes.",
  "10":"Las circunstancias están cambiando y no controlarás todo. Adáptate y concentra tu esfuerzo en lo que sí depende de ti.",
  "13":"Esta etapa terminó. Aferrarte a ella sólo retrasará el cambio que ya comenzó.",
  "14":"Necesitas recuperar el equilibrio. Ajusta lo necesario y avanza paso a paso; forzar el resultado empeorará las cosas.",
  "17":"Puedes recuperar la confianza, pero no basta con esperar. Acompaña tus planes con acciones constantes.",
  "sw-ace":"Habla con claridad y toma una decisión. Evitar una verdad incómoda sólo prolongará el problema.",
  "cu-2":"Hay posibilidad de acuerdo y cercanía. Funcionará únicamente si ambas partes actúan con honestidad y el mismo compromiso.",
  "pe-8":"Los resultados requieren trabajo constante. Si cuidas los detalles y mantienes el esfuerzo, lo que construyes crecerá."
 };
 const reversedMessages:Record<string,string>={
  "00":"La prisa o el miedo a comenzar están frenando tu avance. No des un salto sin un plan, pero tampoco uses el riesgo como excusa para quedarte inmóvil.",
  "01":"Tienes capacidad, pero la estás dispersando o usando sin una dirección clara. Ordena tus recursos antes de intentar controlar el resultado.",
  "02":"Estás ignorando señales importantes o confundiendo intuición con suposición. Busca hechos antes de confiar en una impresión.",
  "06":"Estás postergando una decisión o eligiendo contra tus propios valores. La falta de definición ya está teniendo consecuencias.",
  "09":"La reflexión se convirtió en aislamiento o evasión. Pedir una opinión confiable puede ayudarte a salir del círculo mental.",
  "10":"Un patrón se repite porque sigues respondiendo de la misma manera. Cambia tu reacción, aunque no puedas cambiar las circunstancias.",
  "13":"Te estás aferrando a una etapa terminada. Resistir el cierre prolongará el desgaste.",
  "14":"Hay desequilibrio, exceso o impaciencia. Reduce la presión y corrige el ritmo antes de continuar.",
  "17":"El desánimo o una expectativa poco realista están debilitando tu avance. Revisa el plan y trabaja con objetivos posibles.",
  "sw-ace":"Hay confusión o una conversación mal planteada. No decidas hasta entender los hechos y evita usar la verdad para herir.",
  "cu-2":"El acuerdo está desequilibrado. Una parte está dando más, esperando algo distinto o evitando hablar con claridad.",
  "pe-8":"El esfuerzo se volvió descuidado, repetitivo o perfeccionista. Corrige el método antes de invertir más tiempo."
 };
 let message=card.isReversed?(reversedMessages[card.id]||`${card.reversed} ${card.advice}`):(messages[card.id]||`${card.general} ${card.advice}`);
 if(/obstáculo|riesgo|sombra|bloqueo|advertencia|fuga|distancia|prueba|precaución/.test(label))message=`El reto estará aquí: ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
 else if(/esperanza|temor|deseo|siente|emoción|alma|inconsciente/.test(label))message=`En el fondo, ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
 else if(/resultado|tendencia|evolución|síntesis|destino|futuro|potencial|propósito/.test(label))message=`Si mantienes este rumbo, ${message.charAt(0).toLowerCase()}${message.slice(1)}`;
 if(index===0)return message;
 const connector=index===total-1?"Finalmente, ":index%3===1?"Al mismo tiempo, ":index%3===2?"Sin embargo, ":"Después, ";
 return `${connector}${message.charAt(0).toLowerCase()}${message.slice(1)}`;
}

function combinationWarnings(cards:ClassicCard[]){
 const names=cards.map(card=>card.name.toLowerCase()), text=cards.map(card=>`${card.name} ${card.keys.join(" ")} ${card.isReversed?card.reversed:card.general}`).join(" ").toLowerCase(), warnings:string[]=[];
 const has=(pattern:RegExp)=>pattern.test(text);
 if((names.some(name=>/enamorados|justicia|dos de espadas/.test(name))||has(/elección|decisión/))&&(names.some(name=>/siete de espadas|luna|diablo/.test(name))||has(/engaño|ocult|evasión|información incompleta/)))warnings.push("Debes tomar una decisión, pero no tienes toda la información. No decidas sólo por afecto, deseo o presión. Haz preguntas directas y comprueba que los hechos coincidan con las palabras.");
 if(has(/vínculo|amor|deseo/)&&has(/dependencia|control|obsesión|atadura/))warnings.push("La intensidad puede confundirse con cercanía. Si para conservar el vínculo debes ceder tus límites, justificar conductas dañinas o vivir en incertidumbre, la relación necesita una revisión seria.");
 if(has(/oportunidad|inicio|expansión/)&&has(/impuls|riesgo|imprudencia/))warnings.push("Existe una oportunidad, pero no conviene lanzarse sin condiciones. Revisa costos, consecuencias y una salida posible antes de comprometer tiempo, dinero o confianza.");
 if(has(/miedo|temor|ansiedad/)&&has(/silencio|aislamiento|ocult/))warnings.push("El miedo puede estar alimentándose de silencios y suposiciones. Habla de manera directa; si la otra parte evita aclarar lo esencial, considera esa evasión como información relevante.");
 return warnings;
}

function markdownToHtml(text:string):string {
 return text
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>')
  .replace(/→/g, '→');
}

function parseAIInterpretation(text:string):{id:string;title:string;body:string}[]{
 if(!text)return [];
 const sections=text.split(/^#+\s+/m).filter(s=>s.trim());
 const parsed = sections.map((section,index)=>{
  const lines=section.split("\n");
  const title=lines[0]?.trim()||"";
  const body=markdownToHtml(lines.slice(1).join("\n").trim().replace(/^---$/gm,""));
  return {id:`ai-section-${index}`,title,body};
 }).filter(s=>s.title||s.body);
 return parsed;
}

function FollowupPanel({discipline,spread,cards,language,followupQuestion,onMoreQuestions,t}:{discipline:Discipline;spread:string;cards:AICard[];language:Language;followupQuestion:string|null;onMoreQuestions:()=>void;t:(key:string)=>string}){
 const [question,setQuestion]=useState("");
 const [submitting,setSubmitting]=useState(false);
 const [response,setResponse]=useState<string|null>(null);
 const [error,setError]=useState<string|null>(null);
 const submit=async()=>{
  const trimmed=question.trim();
  if(!trimmed||submitting)return;
  setSubmitting(true);
  setError(null);
  try{
   const text=await submitFollowup({discipline,spread,cards,language,question:trimmed});
   setResponse(text);
  }catch{
   setError(t("followupError"));
  }finally{
   setSubmitting(false);
  }
 };
 return <div className="followup-panel">
  <span className="mini-label">{t("askYourQuestion")}</span>
  {followupQuestion&&<p className="followup-suggestion">{t("followupSuggestionPrefix")} {followupQuestion}</p>}
  {!response&&<div className="followup-input-row">
   <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder={t("followupPlaceholder")} disabled={submitting} rows={2}/>
   <button type="button" onClick={submit} disabled={submitting||!question.trim()}>{submitting?t("generatingInterpretation"):t("followupSubmit")}</button>
  </div>}
  {error&&<p className="followup-error">{error}</p>}
  {response&&<div className="followup-response"><p>{response}</p></div>}
  <button type="button" className="more-questions-button" onClick={onMoreQuestions}>{t("otherDisciplines")}<span>→</span></button>
 </div>;
}

function AnimatedTarotDeal({spread,dealKey,includeReversed,onReplay,onMoreQuestions,lang}:{spread:TarotSpreadDefinition;dealKey:number;includeReversed:boolean;onReplay:()=>void;onMoreQuestions:()=>void;lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const drawnCards=useMemo(()=>pickUnique(tarot,spread.positions.length).map(card=>({...card,isReversed:includeReversed&&secureIndex(3)===0})),[spread.name,dealKey,includeReversed]);
 const cards=useMemo(()=>drawnCards.map(card=>({...localizeRiderCard(card,language),isReversed:card.isReversed})),[drawnCards,language]);
 const [zoomCard,setZoomCard]=useState<{image:string;title:string;position:string;meaning:string}|null>(null);
 const points=dealPoints(spread.layout,spread.positions.length);
 const gap=.96;
 const aiCards=useMemo(()=>toAICards(spread.positions,cards),[spread.positions,cards]);
 const readingCategory=/amor|relación|pareja|persona nueva|reconciliación/i.test(spread.name)?"Amor y relaciones":/trabajo|empleo|negocio|económico|recursos/i.test(spread.name)?"Trabajo y dinero":/decisión|camino|actúo|semáforo/i.test(spread.name)?"Decisiones":/sombra|emocional|propósito|chakra|ciclo|herida/i.test(spread.name)?"Desarrollo personal":"Consulta general";
 const readingAnalysis=useMemo(()=>analyzeTarotReading({spread:spread.name,positions:spread.positions,cards,category:readingCategory,orientationEnabled:includeReversed,drawId:`${spread.name}:${dealKey}:${cards.map(card=>`${card.id}-${card.isReversed?"r":"u"}`).join("|")}`,language}),[spread.name,spread.positions,cards,readingCategory,dealKey,includeReversed,language]);
 const aiBrief=useMemo(()=>{const brief=buildAIBrief(readingAnalysis);return {...brief,positions:brief.positions.map((p:{position:string;card:string;orientation:string;answer:string})=>({...p,position:translatePositionLabel(p.position, undefined, language)}))}},[readingAnalysis,language]);
 const {interpretation,followupQuestion,isLoading,error}=useAIInterpretation({discipline:"tarot",spread:spread.name,cards:aiCards,language,analysis:aiBrief});
 const aiSections=useMemo(()=>parseAIInterpretation(interpretation||""),[interpretation]);
 const editorial=useMemo(()=>buildTarotEditorialOutput(readingAnalysis,cards),[readingAnalysis,cards]);
 const translatedEditorial=translateEditorial(editorial,language);
 const storyParagraphs=translatedEditorial.story;
 const readingSections=translatedEditorial.sections?.length?translatedEditorial.sections:storyParagraphs.map((body:string,index:number)=>({id:`paragraph-${index}`,title:"",body}));
 const guidance=translatedEditorial;
 const aiTitle=aiSections[0]?.title||"";
 return <><div className="tarot-reading-title"><h1>{translateSpreadName(spread.name, undefined, language)}</h1><span>{spread.positions.length} {t('cardsLabel')}</span></div><section className={`animated-spread-table layout-${spread.layout}`} style={{"--deal-gap":`${gap}s`,"--deal-duration":"1.08s"} as CSSProperties} aria-label={`Tirada ${spread.name}`}>
  <div className="spread-table-heading"><button onClick={onReplay}>{t("dealAgain")}</button></div>
  <div className="felt-table"><div className="source-deck" aria-hidden="true"/><div className="table-ornament" aria-hidden="true"/>
   {points.map((point,index)=>{const style={"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties;const translatedPosition=translatePositionLabel(spread.positions[index], undefined, language);const reversedSuffix=cards[index]?.isReversed?` · ${reversedLabel[language]}`:"";return <div className={`dealt-card-slot slot-${index+1} ${cards[index]?.isReversed?"is-reversed":""}`} style={style} key={`card-${dealKey}-${index}`}><div className="dealt-card"><img src={cards[index]?.image} alt={`${cards[index]?.name||`Carta ${index+1}`}${cards[index]?.isReversed?`, ${reversedLabel[language].toLowerCase()}`:""}`} onClick={()=>setZoomCard({image:cards[index].image,title:cards[index].name,position:`${translatedPosition}${reversedSuffix}`,meaning:`${cards[index].isReversed?cards[index].reversed:cards[index].general} ${cards[index].advice}`})} style={{cursor:"zoom-in"}}/></div><p><b>{index+1}</b><span>{translatedPosition}{reversedSuffix}</span></p></div>})}
   {points.map((point,index)=>{const sway=index%2?1:-1;const style={"--x":`${point.x}%`,"--y":`${point.y}%`,"--approach-x":`${Math.min(94,point.x+2)}%`,"--approach-y":`${Math.max(6,point.y-3)}%`,"--retreat-x":`${point.x+sway}%`,"--retreat-y":`${Math.max(3,point.y-7)}%`,"--r":`${point.r||0}deg`,"--i":index,"--tilt":`${sway*1.2}deg`,"--tilt-wide":`${sway*3}deg`,"--tilt-opposite":`${sway*-2}deg`} as CSSProperties;return <div className="dealing-visit" style={style} key={`hand-${dealKey}-${index}`} aria-hidden="true"><div className="carried-card"/><img src="/cards/rider-classic/dealing-hand-v3.png" alt=""/></div>})}
  </div><p className="deal-note">{t("cardsPlacedNote")}</p>
  <section className="classic-reading" style={{"--reading-delay":`${spread.positions.length*gap+.7}s`} as CSSProperties}><div className={`reading-synthesis output-${translatedEditorial.outputStrategy?.toLowerCase()||"reading"}`}><small>{t("messageAndInterpretation")}</small>{aiTitle&&<h3>{aiTitle}</h3>}{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>{t("generatingInterpretation")}</p>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((item:{id:string;title:string;body:string},idx:number)=><article key={item.id}>{idx>0&&item.title&&<h4>{item.title}</h4>}<p dangerouslySetInnerHTML={{__html:item.body}}/></article>)}</div>:<div className="reading-output-sections">{readingSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p>{item.body}</p></article>)}</div>}{!isLoading&&aiSections.length===0&&guidance.showWarning&&<div className="combination-warnings"><strong>{guidance.warningTitle}</strong><p>{guidance.caution}</p></div>}{!isLoading&&aiSections.length===0&&guidance.showAdvice&&<p className="protective-close encouragement"><strong>{guidance.adviceTitle}</strong><span>{guidance.advice}</span></p>}</div><FollowupPanel discipline="tarot" spread={spread.name} cards={aiCards} language={language} followupQuestion={followupQuestion} onMoreQuestions={onMoreQuestions} t={t}/></section>
 </section>
 <CardZoomModal isOpen={!!zoomCard} image={zoomCard?.image||""} title={zoomCard?.title||""} position={zoomCard?.position} meaning={zoomCard?.meaning||""} onClose={()=>setZoomCard(null)}/>
 </>
}

function AnimatedOracleDeal({config,reading,dealKey,onReplay,onMoreQuestions,language="ES"}:{config:OracleSystemConfig;reading:TarotSpreadDefinition;dealKey:number;onReplay:()=>void;onMoreQuestions:()=>void;language?:Language}){
 const lang = language as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[lang];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const oracleTitle=config.key==="zen"?"zenTitle":config.key==="angels"?"angelsTitle":"animalsTitle";
 const cards=useMemo(()=>pickUnique(config.cards,reading.positions.length),[config.key,config.cards,reading.name,dealKey]);
 const points=dealPoints(reading.layout,reading.positions.length),gap=.88;
 const [zoomCard,setZoomCard]=useState<{image:string;title:string;position:string;message:string}|null>(null);
 const oracleCards=useMemo(()=>cards.map((card,index)=>({num:index+1,label:translatePositionLabel(reading.positions[index], undefined, language),card:card.name,reversed:false})),[cards,reading.positions,language]);
 const disciplineMap={zen:"oracle-zen",angels:"oracle-angels",animals:"oracle-animals"} as Record<string,any>;
 const {interpretation,followupQuestion,isLoading,error}=useAIInterpretation({discipline:disciplineMap[config.key]||"oracle-zen",spread:reading.name,cards:oracleCards,language:lang});
 const aiSections=useMemo(()=>parseAIInterpretation(interpretation||""),[interpretation]);
 const oracleAiTitle=aiSections[0]?.title||"";
 const editorial=useMemo(()=>buildOracleEditorialOutput({system:config.key,spread:reading,cards,drawId:`${config.key}:${reading.name}:${dealKey}:${cards.map(card=>card.id).join("|")}`,language:lang}),[config.key,reading,cards,dealKey,lang]);
 const translatedOracleEditorial=translateEditorial(editorial,language);
 const readingSections=translatedOracleEditorial.sections?.length?translatedOracleEditorial.sections:[];
 return <><div className="tarot-reading-title"><h1>{translateSpreadName(reading.name, undefined, language)}</h1><span>{reading.positions.length} {t('cardsLabel')} · {t(oracleTitle).toUpperCase()}</span></div><section className={`animated-spread-table oracle-spread layout-${reading.layout}`} style={{"--deal-gap":`${gap}s`,"--deal-duration":"1.08s"} as CSSProperties}>
  <div className="spread-table-heading"><button onClick={onReplay}>{t("dealAgain")}</button></div><div className="felt-table"><div className="source-deck"/><div className="table-ornament"/>
  {points.map((point,index)=>{const card=cards[index];const translatedPos=translatePositionLabel(reading.positions[index], undefined, language);return <div className={`dealt-card-slot slot-${index+1}`} style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties} key={`oracle-card-${dealKey}-${index}`}><div className="dealt-card"><img src={card?.image} alt={card?.name} onClick={()=>{if(card) setZoomCard({image:card.image,title:card.name,position:translatedPos,message:`${card.message} ${card.detail}`})}} style={{cursor:"zoom-in"}}/></div><p><b>{index+1}</b><span>{translatedPos}</span></p></div>})}
  {points.map((point,index)=>{const sway=index%2?1:-1;return <div className="dealing-visit" style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--approach-x":`${Math.min(94,point.x+2)}%`,"--approach-y":`${Math.max(6,point.y-3)}%`,"--retreat-x":`${point.x+sway}%`,"--retreat-y":`${Math.max(3,point.y-7)}%`,"--r":`${point.r||0}deg`,"--i":index,"--tilt":`${sway*1.2}deg`,"--tilt-wide":`${sway*3}deg`,"--tilt-opposite":`${sway*-2}deg`} as CSSProperties} key={`oracle-hand-${dealKey}-${index}`}><div className="carried-card"/><img src="/cards/rider-classic/dealing-hand-v3.png" alt=""/></div>})}</div>
  <section className="classic-reading" style={{"--reading-delay":`${reading.positions.length*gap+.7}s`} as CSSProperties}><div className={`reading-synthesis output-${translatedOracleEditorial.outputStrategy.toLowerCase()}`}><small>{t("messageAndInterpretation")}</small>{oracleAiTitle&&<h3>{oracleAiTitle}</h3>}{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>{t("generatingInterpretation")}</p>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((item:{id:string;title:string;body:string},idx:number)=><article key={item.id}>{idx>0&&item.title&&<h4>{item.title}</h4>}<p dangerouslySetInnerHTML={{__html:item.body}}/></article>)}</div>:<div className="reading-output-sections">{readingSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p>{item.body}</p></article>)}</div>}{!isLoading&&aiSections.length===0&&translatedOracleEditorial.showWarning&&<div className="combination-warnings"><strong>{translatedOracleEditorial.warningTitle}</strong><p>{translatedOracleEditorial.caution}</p></div>}{!isLoading&&aiSections.length===0&&translatedOracleEditorial.showAdvice&&<p className="protective-close encouragement"><strong>{translatedOracleEditorial.adviceTitle}</strong><span>{translatedOracleEditorial.advice}</span></p>}</div><FollowupPanel discipline={disciplineMap[config.key]||"oracle-zen"} spread={reading.name} cards={oracleCards} language={lang} followupQuestion={followupQuestion} onMoreQuestions={onMoreQuestions} t={t}/></section>
 <CardZoomModal isOpen={!!zoomCard} image={zoomCard?.image||""} title={zoomCard?.title||""} position={zoomCard?.position} meaning={zoomCard?.message||""} onClose={()=>setZoomCard(null)}/>
 </section></>
}

function LibrarySystemSite({slug,query,setQuery,onBack}:{slug:string;query:string;setQuery:(value:string)=>void;onBack:()=>void}){
 const site=librarySites.find(item=>item.slug===slug)||librarySites[0], normalized=query.toLowerCase();
 const searchable=["tarot","tarot-zen","angeles","animales-de-poder","runas","i-ching"].includes(site.slug);
 return <section className={`workspace library system-site system-${site.slug}`}><button className="system-back" onClick={onBack}>← Todos los sistemas</button><div className="system-site-hero"><div><span className="mini-label">BIBLIOTECA · SITIO DE LA DISCIPLINA</span><h1>{site.name}</h1><p>{site.description}</p></div><span className="system-site-icon" aria-hidden="true">{site.icon}</span></div>{searchable&&<input className="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder={`⌕  Buscar en ${site.shortName}…`}/>} 
  {site.slug==="tarot"&&<><h2 className="subhead first">Las 78 cartas</h2><div className="library-grid">{tarotCatalog.filter(c=>(`${c.name} ${c.arcana} ${c.suit||""}`).toLowerCase().includes(normalized)).map(c=>{const content=tarot.find(item=>item.id===c.id);return <article key={c.id}><div className="card-art"><img src={c.image} alt={`Carta ${c.name} de Rider–Waite–Smith`} loading="lazy"/></div><small>{c.arcana} {c.suit?`· ${c.suit}`:""}</small><h3>{c.name}</h3>{content?<><p>{content.general}</p><div>{content.keys.map(k=><span key={k}>{k}</span>)}</div></>:<p className="editorial-pending">Interpretación editorial pendiente de revisión.</p>}</article>})}</div><p className="image-credit">Imágenes de Pamela Colman Smith, edición Rider–Waite de 1909 · Dominio público · Wikimedia Commons.</p></>}
  {site.slug==="tarot-zen"&&<><h2 className="subhead first">79 cartas originales</h2><p className="collection-note sacred-note">Veintitrés cartas de Conciencia y cuatro familias de catorce cartas: Fuego, Agua, Nubes y Arcoíris.</p><div className="zen-reference-grid">{oshoZenReference.filter(card=>(`${card.name} ${card.group}`).toLowerCase().includes(normalized)).map(card=><article className="zen-deck-card" key={card.id}><div className="zen-card-art"><img src={card.image} alt={`Carta ${card.name} de la familia ${card.group}`} loading="lazy"/></div><small>{card.group}{card.number!==null?` · ${card.number}`:""} · {card.phase}</small><h3>{card.name}</h3><p>{card.message}</p><em>{card.question}</em></article>)}</div></>}
  {site.slug==="angeles"&&<><h2 className="subhead first">44 mensajes ilustrados</h2><p className="collection-note">Las atribuciones cambian entre fuentes; cada carta identifica la tradición de referencia utilizada.</p><div className="angel-library-grid">{angelCatalog.filter(c=>(`${c.name} ${c.role} ${c.family} ${c.tradition} ${c.attribute} ${c.message} ${c.keys.join(" ")}`).toLowerCase().includes(normalized)).map(c=><AngelDeckCard card={c} key={c.id}/>)}</div></>}
  {site.slug==="animales-de-poder"&&<><h2 className="subhead first">44 animales</h2><p className="collection-note">Ilustraciones originales y significados reflexivos sin atribuirlos a una nación indígena específica.</p><div className="animal-library-grid">{powerAnimals.filter(card=>(`${card.name} ${card.meaning} ${card.message}`).toLowerCase().includes(normalized)).map(card=><article key={card.id}><img src={card.image} alt={`Carta del animal de poder ${card.name}`} loading="lazy"/><small>{card.id.slice(-2)} · {card.meaning}</small><h3>{card.name}</h3><p>{card.message}</p></article>)}</div></>}
  {site.slug==="runas"&&<><h2 className="subhead first">Elder Futhark · 24 runas</h2><div className="rune-row system-rune-grid">{runeCatalog.filter(r=>(`${r.name} ${r.symbol}`).toLowerCase().includes(normalized)).map(r=>{const content=runeMeanings.find(item=>item.name===r.name);return <article key={r.name}><RuneToken symbol={r.symbol} name={r.name}/><span>{r.name}</span><small>{content?.keywords.join(" · ")}</small></article>})}</div></>}
  {site.slug==="i-ching"&&<><h2 className="subhead first">Los 64 hexagramas</h2><div className="iching-library-grid">{ichingCatalog.filter(h=>(`${h.number} ${h.name}`).toLowerCase().includes(normalized)).map(h=><article key={h.number}><HexagramDiagram pattern={h.pattern} name={h.name}/><div><small>HEXAGRAMA {h.number}</small><h3>{h.name}</h3><p>{getIChingCounsel(h.number)}</p></div></article>)}</div></>}
  {site.slug==="radiestesia"&&<><h2 className="subhead first">{language==="ES"?"Péndulo y tablero":language==="EN"?"Pendulum and Board":language==="FR"?"Pendule et Tableau":language==="DE"?"Pendel und Tafel":"Pêndulo e Tabuleiro"}</h2><p className="collection-note">{t("radiestesiaNote")}</p><div className="radiesthesia-library"><article><img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt={language==="ES"?"Péndulo de plata con testigo sostenido por una mano":language==="EN"?"Silver witness pendulum held by hand":language==="FR"?"Pendule avec témoin en argent tenue à la main":language==="DE"?"Silbernes Zeugenpendel in der Hand gehalten":"Pêndulo testemunha de prata seguro à mão"}/><div><small>{language==="ES"?"INSTRUMENTO":language==="EN"?"INSTRUMENT":language==="FR"?"INSTRUMENT":language==="DE"?"INSTRUMENT":"INSTRUMENTO"}</small><h3>{language==="ES"?"Péndulo de plata con testigo":language==="EN"?"Silver Witness Pendulum":language==="FR"?"Pendule avec Témoin en Argent":language==="DE"?"Silbernes Zeugenpendel":"Pêndulo Testemunha de Prata"}</h3><p>{t("radiestesiaPendulumHold")}</p></div></article><article className="radiesthesia-board-card"><img src="/oracles/pendulum/radiesthesia-board.svg" alt={language==="ES"?"Tablero semicircular de radiestesia":language==="EN"?"Radiesthesia semicircular board":language==="FR"?"Tableau radiesthésie semi-circulaire":language==="DE"?"Radiästhesie Halbrund-Tafel":"Tabuleiro radiestesia semicircular"}/><div><small>{language==="ES"?"TABLERO":language==="EN"?"BOARD":language==="FR"?"TABLEAU":language==="DE"?"TAFEL":"TABULEIRO"}</small><h3>{t("radiestesiaBoard")}</h3><p>{t("radiestesiaBoardDesc")}</p><a href="/oracles/pendulum/radiesthesia-board.svg" download>{t("radiestesiaDownload")}</a></div></article></div></>}
  {site.slug==="chamalongos"&&<><h2 className="subhead first">Referencia cultural</h2><p className="collection-note sacred-note">Las denominaciones y lecturas varían entre ramas y casas. Esta síntesis no enseña consagraciones ni sustituye a una persona iniciada.</p><h3 className="collection-variant-title">Versión 1 · Cáscaras de coco</h3><ChamalongoGrid normalized="" version="coconut"/><h3 className="collection-variant-title">Versión 2 · Caracoles tigre</h3><ChamalongoGrid normalized="" version="cowrie"/></>}
  {site.slug==="kabbalah"&&<><h2 className="subhead first">Los 72 Nombres de Dios · tripletes hebreos</h2><p className="collection-note sacred-note">Referencia textual de los tripletes derivados de Éxodo 14:19–21, sin asignaciones terapéuticas ni predictivas añadidas.</p><div className="divine-names-grid metal-engraving" dir="rtl">{divineNames72.map(item=><article key={item.number}><small>{item.number}</small><b lang="he">{item.hebrew}</b></article>)}</div><h2 className="subhead">Árbol de la Vida · 10 sefirot y 22 senderos</h2><div className="tree-study metal-tree-study"><div className="tree-canvas" aria-label="Árbol de la Vida"><TreeConnections/>{sefirot.map((item,index)=><div className={`sefirah-node node-${index+1}`} key={item.number}><b lang="he">{item.hebrew}</b><span>{item.name}</span><small>{item.gloss}</small></div>)}</div><div className="tree-details"><h3>Los 22 senderos</h3><div className="path-grid">{treePaths.map(path=><article key={path.number}><small>{path.number}</small><b lang="he">{path.hebrew}</b><span>{path.name}</span></article>)}</div></div></div></>}
 </section>
}

function App(){
 const { user } = useAuth();
 const [view,setView]=useState("Inicio"),[lang,setLang]=useState<"ES"|"EN"|"FR"|"DE"|"PT">("ES"),[category,setCategory]=useState(categories[0]),[question,setQuestion]=useState(""),[context,setContext]=useState(""),[stage,setStage]=useState(1),[method,setMethod]=useState<Method>("tarot"),[spread,setSpread]=useState<keyof typeof spreads>("three"),[useReversed,setUseReversed]=useState(true),[results,setResults]=useState<Result[]>([]),[selectedMethods,setSelectedMethods]=useState<Method[]>(["tarot","runes","iching"]),[name,setName]=useState(""),[birth,setBirth]=useState(""),[history,setHistory]=useState<SavedReading[]>([]),[query,setQuery]=useState(""),[debug,setDebug]=useState(false),[toast,setToast]=useState("");
 const [menuOpen,setMenuOpen]=useState(false);
 const [systemSlug,setSystemSlug]=useState("tarot");
 const [homeImageSeed,setHomeImageSeed]=useState(0);
 const [visits,setVisits]=useState(0);
 const [feedback,setFeedback]=useState("");
 const [userName,setUserName]=useState("");
 const [userEmail,setUserEmail]=useState("");
 const [userWhatsapp,setUserWhatsapp]=useState("");
 const [userTelegram,setUserTelegram]=useState("");
 const [contactMethod,setContactMethod]=useState<"email"|"whatsapp"|"telegram">("email");
 const [astroSelection,setAstroSelection]=useState<{discipline:"western"|"eastern"|"numerology";index:number;focus:string}|null>(null);
 const [astroConsultationOpen,setAstroConsultationOpen]=useState(false);
 useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem("oraculo_history")||"[]"))}catch{}},[]);
 useEffect(()=>{const count=parseInt(localStorage.getItem("speculum_visits")||"0",10);setVisits(count+1);localStorage.setItem("speculum_visits",String(count+1))},[]);
 useEffect(()=>{setHomeImageSeed(secureIndex(1000000))},[]);
 useEffect(()=>{const sync=()=>setView(routeViews[location.hash.slice(1)]||"Inicio");sync();addEventListener("hashchange",sync);addEventListener("popstate",sync);return()=>{removeEventListener("hashchange",sync);removeEventListener("popstate",sync)}},[]);
 const analyst=useMemo(()=>analyze(results),[results]);
 const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2200)};
 function navigate(next:string){setView(next);setMenuOpen(false);if(!["Astrología Occidental","Astrología Oriental","Numerología"].includes(next))setAstroConsultationOpen(false);const route=viewRoutes[next];if(route&&location.hash!==route.split("#")[1])window.history.pushState(null,"",route)}
 function openService(service:ServiceDefinition){if(service.status==="COMING_SOON"){notify(`${service.name} estará disponible próximamente`);return}if(service.method)setMethod(service.method);reset();navigate("Consulta")}
 function reset(){setStage(1);setResults([]);setQuestion("");setContext("")}
 function generate(methods=selectedMethods){if(!question.trim()){notify("Escribe una pregunta para comenzar");return}const out:Result[]=[];for(const m of methods){if(m==="tarot")out.push(buildTarot(question,context,category,spread,useReversed,lang as Language));if(m==="runes")out.push(buildRunes(question,lang as Language));if(m==="iching")out.push(buildIChing(question,lang as Language));if(m==="angels")out.push(buildAngels(question,context,category,lang as Language));if(m==="numerology"&&name&&birth)out.push(buildNumerology(name,birth,lang as Language))}setResults(out);setStage(4)}
 function reportText(){return `SPECULUM ANIMAE — REPORTE\n${new Date().toLocaleString()}\n\nPREGUNTA\n${question}\n\nCONTEXTO\n${context||"No proporcionado"}\n\nMÉTODOS\n${results.map(r=>r.title).join(" · ")}\n\nRESULTADOS\n${results.map(r=>`${r.title}\n${r.interpretation}`).join("\n\n")}\n\nANALYST\nTema central: ${analyst.central}\nCoincidencias: ${analyst.matches}\nTensiones: ${analyst.differences}\nConsejo: ${analyst.advice.join(" ")}\nConfianza interpretativa: ${analyst.confidence}\n\nEsta interpretación es simbólica y no constituye un hecho comprobado.`}
 function save(){const item:SavedReading={id:crypto.randomUUID?.()||String(Date.now()),date:new Date().toISOString(),question,category,methods:results.map(r=>r.method),results,report:reportText(),reviewStatus:"AI_GENERATED"};const next=[item,...history];setHistory(next);localStorage.setItem("oraculo_history",JSON.stringify(next));notify("Consulta guardada en este dispositivo")}
 function download(){const blob=new Blob([`<!doctype html><meta charset="utf-8"><title>Reporte Speculum Animae</title><style>body{font:16px system-ui;max-width:760px;margin:40px auto;line-height:1.6;white-space:pre-wrap;color:#241b30}</style>${reportText().replace(/&/g,"&amp;").replace(/</g,"&lt;")}`],{type:"text/html"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="speculum-animae-reporte.html";a.click();URL.revokeObjectURL(a.href)}
 const dailyNow=new Date(), daily=tarot[(dailyNow.getUTCFullYear()*372+dailyNow.getUTCMonth()*31+dailyNow.getUTCDate())%tarot.length];
 const [showAuth, setShowAuth] = useState(false);
 const [authMode,setAuthMode]=useState<"login"|"register">("login");
 const [showProfile,setShowProfile]=useState(false);
 const astroDiscipline=view==="Astrología Occidental"?"western":view==="Astrología Oriental"?"eastern":view==="Numerología"?"numerology":null;
 const astroSelectedIndex=astroDiscipline&&astroSelection?.discipline===astroDiscipline?astroSelection.index:null;

 function selectAstroFocus(discipline:"western"|"eastern"|"numerology",index:number,focus:string){
  setAstroSelection({discipline,index,focus});
  setAstroConsultationOpen(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelector(".astro-consultation-flow")?.scrollIntoView({behavior:"smooth",block:"start"})));
 }

 function closeAstroConsultation(){setAstroConsultationOpen(false);window.scrollTo({top:0,behavior:"smooth"})}

 const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

 return <main>
  <header className="site-header"><span className="header-balance" aria-hidden="true"/><div className="header-actions"><label className="language-menu"><span className="sr-only">{t("language")}</span><select value={lang} onChange={event=>setLang(event.target.value as "ES"|"EN"|"FR"|"DE"|"PT")} aria-label={t("language")}><option value="ES">Español</option><option value="EN">English</option><option value="FR">Français</option><option value="DE">Deutsch</option><option value="PT">Português</option></select></label>{!user&&<button className="login-button" onClick={()=>{setAuthMode("login");setShowAuth(true)}}>{t("login")}</button>}{!user&&<button className="auth-button" onClick={()=>{setAuthMode("register");setShowAuth(true)}}>{t("account")}</button>}{user&&<Profile lang={lang as Language} onOpenProfile={()=>setShowProfile(true)} onOpenHistory={()=>navigate("Historial")} onLogout={()=>{setShowProfile(false);navigate("Inicio")}}/>}<button className="menu-toggle" aria-label={t("menu")} aria-expanded={menuOpen} onClick={()=>setMenuOpen(x=>!x)}>{menuOpen?t("close"):"☰"}</button><nav className={menuOpen?"open":""}>{nav.map(n=><button key={n} className={view===n?"active":""} onClick={()=>navigate(n)}>{t(n.toLowerCase() === "inicio" ? "home" : n.toLowerCase() === "biblioteca" ? "library" : n.toLowerCase() === "comentarios" ? "comments" : n.toLowerCase())}</button>)}</nav></div></header>
  {showAuth&&<div className="auth-modal" onClick={()=>setShowAuth(false)}><div className="auth-modal-content" onClick={e=>e.stopPropagation()}><button className="close-auth" onClick={()=>setShowAuth(false)}>×</button><Auth initialMode={authMode} onSuccess={()=>{setShowAuth(false);setShowProfile(true)}}/></div></div>}
  {showProfile&&user&&<div className="auth-modal user-profile-modal" onClick={()=>setShowProfile(false)}><div onClick={event=>event.stopPropagation()}><UserProfileForm lang={lang as Language} onClose={()=>setShowProfile(false)}/></div></div>}
  {view==="Inicio"&&<>
   <section className="home-disciplines"><div className="home-disciplines-head"><span className="mini-label">{t("menuDisciplines")}</span><h1>{t("exploreTitle")}</h1><p>{t("exploreSubtitle")}</p></div>{systemCategories.map(category=>{const categoryTitleKey = category.title.toLowerCase() === "oráculos" ? "oraclesTitle" : category.title.toLowerCase() === "astros" ? "starsTitle" : "interpretTitle"; const categoryDescKey = category.title.toLowerCase() === "oráculos" ? "oraclesDesc" : category.title.toLowerCase() === "astros" ? "starsDesc" : "interpretDesc"; return <div key={category.title} className="discipline-category"><div className="category-header"><h2>{t(categoryTitleKey)}</h2><p>{t(categoryDescKey)}</p></div><div className="home-discipline-grid">{category.systems.map(([system])=>{const targets:Record<string,string>={"Tarot":"Tarot Clásico","Tarot Zen":"Tarot Zen","Ángeles":"Ángeles","Animales de Poder":"Animales de Poder","Runas":"Runas","I Ching":"I Ching","Radiestesia":"Radiestesia","Chamalongos":"Chamalongos","Astrología Occidental":"Astrología Occidental","Astrología Oriental":"Astrología Oriental","Numerología":"Numerología"};const target=targets[system],appointment=system==="Cita con Madame Meraki",nameKeyMap:Record<string,string>={"Tarot":"riderName","Tarot Zen":"zenName","Ángeles":"angelsName","Animales de Poder":"animalsName","Runas":"runesName","I Ching":"ichingName","Radiestesia":"pendulumName","Chamalongos":"chamalongosName","Astrología Occidental":"westernAstrologyName","Astrología Oriental":"easternAstrologyName"},numerologyNames:Record<Language,string>={ES:"Numerología",EN:"Numerology",FR:"Numérologie",DE:"Numerologie",PT:"Numerologia"},displayName=system==="Numerología"?numerologyNames[lang]:t(nameKeyMap[system]||system);return <button key={system} className={`${target?"available":""} ${appointment?"appointment-card":""}`} onClick={()=>target?navigate(target):notify(appointment?`La agenda de Madame Meraki ${t("comingSoon").toLowerCase()}`:`El sitio de ${system} se trabajará más adelante`)}><span className="home-menu-image"><img src={menuImage(system,homeImageSeed)} alt={`Imagen de ${displayName}`}/></span><span className="home-menu-copy"><b>{displayName}</b><small>{target?t("openSite"):appointment?t("comingSoon"):t("sitePending")}</small></span></button>})}</div></div>})}<button className="home-library-link" onClick={()=>navigate("Biblioteca")}>{t("openLibrary")}</button></section>
  </>}
  {view==="Tarot Clásico"&&<ClassicTarotSite onBack={()=>navigate("Inicio")} lang={lang as Language}/>} 
  {view==="Tarot Zen"&&<OracleSystemSite system="zen" onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Ángeles"&&<OracleSystemSite system="angels" onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Animales de Poder"&&<OracleSystemSite system="animals" onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Runas"&&<RuneSystemSite onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="I Ching"&&<IChingSystemSite onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Radiestesia"&&<RadiestesiaSystemSite onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Chamalongos"&&<ChamalongosSite onBack={()=>navigate("Inicio")} lang={lang as Language}/>}
  {view==="Astrología Occidental"&&<AstrologySite branch="western" onBack={()=>navigate("Inicio")} lang={lang as Language} selected={astroSelectedIndex} consultationOpen={astroConsultationOpen} onSelect={(index,focus)=>selectAstroFocus("western",index,focus)} onCloseConsultation={closeAstroConsultation} onOpenProfile={()=>setShowProfile(true)} onOpenAccount={()=>setShowAuth(true)}/>}
  {view==="Astrología Oriental"&&<AstrologySite branch="eastern" onBack={()=>navigate("Inicio")} lang={lang as Language} selected={astroSelectedIndex} consultationOpen={astroConsultationOpen} onSelect={(index,focus)=>selectAstroFocus("eastern",index,focus)} onCloseConsultation={closeAstroConsultation} onOpenProfile={()=>setShowProfile(true)} onOpenAccount={()=>setShowAuth(true)}/>}
  {view==="Numerología"&&<NumerologySite onBack={()=>navigate("Inicio")} lang={lang as Language} selected={astroSelectedIndex} consultationOpen={astroConsultationOpen} onSelect={(index,focus)=>selectAstroFocus("numerology",index,focus)} onCloseConsultation={closeAstroConsultation} onOpenProfile={()=>setShowProfile(true)} onOpenAccount={()=>setShowAuth(true)}/>}
  {view==="Consulta"&&<section className="workspace"><div className="page-title"><span className="mini-label">{t("consultaTitle")}</span><h1>{t("consultaSubtitle")}</h1><p>{t("consultaDescription")}</p></div><div className="stepper">{["Pregunta","Contexto","Método","Interpretación"].map((s,i)=><div className={stage>=i+1?"done":""} key={s}><span>{stage>i+1?"✓":i+1}</span>{s}</div>)}</div>
   {stage===1&&<div className="panel consult"><div className="consultor"><span>✦</span><div><b>{t("consultorTitle")}</b><p>{t("consultorStart")}</p></div></div><label>{t("questionLabel")}<textarea autoFocus value={question} onChange={e=>setQuestion(e.target.value)} placeholder={t("questionPlaceholder")}/></label><label>{t("categoryLabel")}<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><button className="primary" onClick={()=>question.trim()?setStage(2):notify(t("questionLabel"))}>{t("continue")} <span>→</span></button></div>}
   {stage===2&&<div className="panel consult"><div className="consultor"><span>✦</span><div><b>{t("consultorTitle")}</b><p>{category.includes("Amor")?t("consultorContext1"):t("consultorContext2")}</p></div></div><label>{t("contextLabel")}<textarea value={context} onChange={e=>setContext(e.target.value)} placeholder={t("contextPlaceholder")}/></label><p className="privacy">{t("privacy")}</p><div className="actions"><button className="ghost" onClick={()=>setStage(1)}>{t("back2")}</button><button className="primary" onClick={()=>setStage(3)}>{t("chooseAnother")} <span>→</span></button></div></div>}
   {stage===3&&<div className="panel"><h2>{t("chooseMethod")}</h2><div className="method-pills">{(["tarot","runes","iching","numerology","angels"] as Method[]).map(m=><button className={method===m?"selected":""} onClick={()=>setMethod(m)} key={m}>{methodLabels[m]}</button>)}</div>{method==="tarot"&&<div className="options"><label>{t("spreadLabel")}<select value={spread} onChange={e=>setSpread(e.target.value as keyof typeof spreads)}><option value="one">{t("spread1")}</option><option value="three">{t("spread3")}</option><option value="relationship">{t("spreadRelationship")}</option><option value="decision">{t("spreadDecision")}</option><option value="celtic">{t("spreadCeltic")}</option></select></label><label className="toggle">{t("useReversed")} <input type="checkbox" checked={useReversed} onChange={e=>setUseReversed(e.target.checked)}/><i/></label></div>}{method==="numerology"&&<div className="two"><label>Nombre completo<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Fecha de nacimiento<input type="date" value={birth} onChange={e=>setBirth(e.target.value)}/></label></div>}<div className="deck-preview"><div className="deck">✦</div><div><h3>{t("uniqueSelection")}</h3><p>{t("uniqueDescription")}</p></div></div><button className="primary" onClick={()=>{if(method==="numerology"&&(!name||!birth)){notify("Completa nombre y fecha");return}generate([method])}}>Realizar consulta <span>✦</span></button></div>}
   {stage===4&&<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={reset} debug={debug}/>} 
  </section>}
  {view==="Integral"&&<section className="workspace"><div className="page-title"><span className="mini-label">{t("integral")}</span><h1>{t("integralTitle")}</h1><p>{t("integralDescription")}</p></div>{!results.length?<div className="panel"><label>{t("yourQuestion")}<textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="¿Qué deseas comprender?"/></label><label>{t("categoryLabel")}<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>{t("contextOptional")}<textarea value={context} onChange={e=>setContext(e.target.value)} placeholder={t("contextPlaceholder")}/></label><div className="check-grid">{(["tarot","runes","iching","angels","numerology"] as Method[]).map(m=><label key={m}><input type="checkbox" checked={selectedMethods.includes(m)} onChange={()=>setSelectedMethods(x=>x.includes(m)?x.filter(v=>v!==m):[...x,m])}/><span>{methodLabels[m]}</span><small>{m==="angels"?t("demoContent"):m==="numerology"?t("requiresData"):t("selectMethods")}</small></label>)}</div>{selectedMethods.includes("numerology")&&<div className="two"><label>Nombre<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Nacimiento<input type="date" value={birth} onChange={e=>setBirth(e.target.value)}/></label></div>}<button className="primary" onClick={()=>generate()}>{t("generateIntegral")} <span>✦</span></button></div>:<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={()=>setResults([])} debug={debug}/>}</section>}
  {view==="Biblioteca"&&<section className="workspace library"><div className="page-title"><span className="mini-label">BIBLIOTECA SIMBÓLICA</span><h1>{t("libraryTitle")}</h1><p>{t("librarySubtitle")}</p></div><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("search")}/><h2 className="subhead first">{t("tarotCards")}</h2><div className="library-grid">{tarotCatalog.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())).map(c=>{const raw=tarot.find(item=>item.id===c.id);const content=raw?localizeRiderCard(raw,lang):null;const arcanaLabel=c.arcana==="Arcano Mayor"?{ES:"Arcano Mayor",EN:"Major Arcana",FR:"Arcane Majeur",DE:"Große Arkana",PT:"Arcano Maior"}[lang]:{ES:"Arcano Menor",EN:"Minor Arcana",FR:"Arcane Mineur",DE:"Kleine Arkana",PT:"Arcano Menor"}[lang];const suitLabel=c.suit?{Bastos:{ES:"Bastos",EN:"Wands",FR:"Bâtons",DE:"Stäbe",PT:"Paus"},Copas:{ES:"Copas",EN:"Cups",FR:"Coupes",DE:"Kelche",PT:"Copas"},Espadas:{ES:"Espadas",EN:"Swords",FR:"Épées",DE:"Schwerter",PT:"Espadas"},Oros:{ES:"Oros",EN:"Pentacles",FR:"Deniers",DE:"Münzen",PT:"Ouros"}}[c.suit][lang]:"";return <article key={c.id}><div className="card-art"><img src={c.image} alt={`Carta ${content?.name||c.name} de Rider–Waite–Smith`} loading="lazy"/></div><small>{arcanaLabel} {suitLabel?`· ${suitLabel}`:""}</small><h3>{content?.name||c.name}</h3>{content?<><p>{content.general}</p><div>{content.keys.map(k=><span key={k}>{k}</span>)}</div></>:<p className="editorial-pending">Interpretación editorial pendiente de revisión.</p>}</article>})}</div><p className="image-credit">Imágenes de Pamela Colman Smith, edición Rider–Waite de 1909 · Dominio público · Wikimedia Commons.</p><h2 className="subhead">{t("runesTitle")}</h2><div className="rune-row">{runeCatalog.filter(r=>r.name.toLowerCase().includes(query.toLowerCase())).map(r=>{const content=runeMeanings.find(item=>item.name===r.name);return <article key={r.name}><RuneToken symbol={r.symbol} name={r.name}/><span>{r.name}</span><small>{content?.keywords.join(" · ")}</small></article>})}</div><h2 className="subhead">{t("iChingTitle")}</h2><div className="iching-library-grid">{ichingCatalog.filter(h=>(`${h.number} ${h.name}`).toLowerCase().includes(query.toLowerCase())).map(h=><article key={h.number}><HexagramDiagram pattern={h.pattern} name={h.name}/><div><small>HEXAGRAMA {h.number}</small><h3>{h.name}</h3><p>{getIChingCounsel(h.number)}</p></div></article>)}</div><h2 className="subhead">{t("angelsTitle")}</h2><p className="collection-note">Colección original inspirada en diversas tradiciones. Las atribuciones cambian entre fuentes; cada carta identifica la tradición utilizada.</p><div className="angel-library-grid">{angelCatalog.filter(c=>(`${c.name} ${c.role} ${c.family} ${c.tradition} ${c.attribute} ${c.message} ${c.keys.join(" ")}`).toLowerCase().includes(query.toLowerCase())).map(c=><AngelDeckCard card={c} key={c.id}/>)}</div><ExtendedCollections query={query} lang={lang}/></section>}
  {view==="Diario"&&<Daily daily={daily}/>} 
  {view==="Historial"&&<section className="workspace"><div className="page-title"><span className="mini-label">{t("historyTitle")}</span><h1>{t("historySubtitle")}</h1><p>{t("historyDescription")}</p></div>{history.length===0?<div className="empty"><span>◌</span><h2>{t("noHistory")}</h2><p>{t("noHistoryDesc")}</p></div>:<><div className="history-list">{history.map(h=><article key={h.id}><div><small>{new Date(h.date).toLocaleString()}</small><h3>{h.question}</h3><p>{h.category} · {h.methods.map(m=>methodLabels[m]).join(", ")}</p></div><button onClick={()=>{setQuestion(h.question);setContext("");setResults(h.results);setView("Integral")}}>{t("openReading")}</button><button className="danger" onClick={()=>{const n=history.filter(x=>x.id!==h.id);setHistory(n);localStorage.setItem("oraculo_history",JSON.stringify(n))}}>{t("deleteReading")}</button></article>)}</div><button className="ghost danger" onClick={()=>{setHistory([]);localStorage.removeItem("oraculo_history")}}>{t("deleteAll")}</button></>}</section>}
  {view==="LAB"&&<section className="workspace"><div className="page-title"><span className="mini-label">{t("labTitle")}</span><h1>{t("labSubtitle")}</h1><p>{t("labDescription")}</p></div><div className="lab-grid"><div className="panel"><h2>{t("directGenerator")}</h2><label>Pregunta<input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Pregunta de laboratorio"/></label><div className="method-pills">{(["tarot","runes","iching","angels"] as Method[]).map(m=><button key={m} onClick={()=>{if(!question)setQuestion("¿Qué necesito observar ahora?");setTimeout(()=>generate([m]),0)}}>{methodLabels[m]}</button>)}</div><label className="toggle">{t("debugMode")} <input type="checkbox" checked={debug} onChange={e=>setDebug(e.target.checked)}/><i/></label></div><div className="panel"><h2>{t("standardOutput")}</h2><pre>{JSON.stringify(results[0]||{method:"tarot",question:"…",raw_result:{},themes:[],obstacles:[],opportunities:[],advice:[],temporal_indicators:[],interpretation:"…"},null,2)}</pre><button className="ghost" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(results[0]||{},null,2));notify(t("jsonCopied"))}}>{t("copyJSON")}</button></div></div>{results.length>1&&<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={()=>setResults([])} debug/>}</section>}
  {view==="Comentarios"&&<section className="workspace"><Newsletter/><Comments/></section>}
  <style>{`
    .auth-button {
      padding: 10px 16px;
      border: 1px solid #d6b66d;
      border-radius: 6px;
      background: transparent;
      color: #d6b66d;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.05em;
      margin-right: 12px;
    }
    .auth-button:hover {
      background: #d6b66d;
      color: #160f1e;
    }
    .login-button {
      padding: 10px 16px;
      border: 0;
      background: transparent;
      color: #c8becd;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
      letter-spacing: 0.05em;
    }
    .login-button:hover {
      color: #f7f0e4;
    }
    .auth-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: grid;
      place-items: center;
      z-index: 1000;
      padding: 20px;
    }
    .auth-modal-content {
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
    }
    .close-auth {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: #3a2c4a;
      color: #d6b66d;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      display: grid;
      place-items: center;
      z-index: 10;
      transition: all 0.2s;
    }
    .close-auth:hover {
      background: #d6b66d;
      color: #160f1e;
    }
  `}</style>
  <footer className="site-footer"><nav className="footer-socials" aria-label="Próximas redes sociales"><span><img src="https://cdn.simpleicons.org/instagram/c9a76a" alt="" aria-hidden="true"/><b>Instagram</b></span><span><img src="https://cdn.simpleicons.org/facebook/c9a76a" alt="" aria-hidden="true"/><b>Facebook</b></span><span><img src="https://cdn.simpleicons.org/youtube/c9a76a" alt="" aria-hidden="true"/><b>YouTube</b></span><span><img src="https://cdn.simpleicons.org/tiktok/c9a76a" alt="" aria-hidden="true"/><b>TikTok</b></span></nav><div className="footer-brand"><img src="/speculum-animae-logo.png" alt="Emblema de Speculum Animae"/><strong>SPECULUM ANIMAE</strong><small>EL ESPEJO DEL ALMA</small></div><div className="footer-metrics"><div className="metric"><span className="label">Visitas en este dispositivo</span><span className="value">{visits}</span></div><button className="feedback-button" onClick={()=>navigate("Comentarios")}>✉ Compartir comentarios</button></div><div className="footer-legal"><nav aria-label="Información legal"><span>Aviso legal</span><span>Privacidad</span><span>Términos de uso</span></nav><p>Las interpretaciones ofrecidas tienen fines de entretenimiento, reflexión personal y autoconocimiento. No predicen hechos ni sustituyen asesoramiento médico, psicológico, legal o financiero profesional.</p><small>© {new Date().getFullYear()} Speculum Animae · Todos los derechos reservados</small></div></footer>{toast&&<div className="toast">{toast}</div>}
 </main>
}

function ExtendedCollections({query,lang}:{query:string,lang:"ES"|"EN"|"FR"|"DE"|"PT"}){
 const t = (key: string) => {
    const keys = key.split(".");
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
 const normalized=query.toLowerCase();
 const osho=oshoZenReference.filter(card=>(`${card.name} ${card.group}`).toLowerCase().includes(normalized));
 const animals=powerAnimals.filter(card=>(`${card.name} ${card.meaning} ${card.message}`).toLowerCase().includes(normalized));
 const names=divineNames72.filter(item=>(`${item.number} ${item.hebrew}`).includes(normalized));

 const zenLabels = {"ES": "Tarot Zen ORÁCULO · 79 cartas originales", "EN": "Zen Tarot ORACLE · 79 original cards", "FR": "Oracle Tarot Zen · 79 cartes originales", "DE": "Zen Tarot ORAKEL · 79 Originalkarten", "PT": "Oracle Tarot Zen · 79 cartas originais"};
 const animalsLabels = {"ES": "Oráculo original de Animales de Poder · 44 cartas", "EN": "Original Power Animals Oracle · 44 cards", "FR": "Oracle original des Animaux de Pouvoir · 44 cartes", "DE": "Krafttiere Orakel · 44 Karten", "PT": "Oracle original de Animais de Poder · 44 cartas"};
 const radiLabels = {"ES": "Radiestesia · péndulo con testigo y tablero", "EN": "Radiesthesia · pendulum with witness and board", "FR": "Radiesthésie · pendule avec témoin et tableau", "DE": "Radiästhesie · Pendel mit Zeuge und Tafel", "PT": "Radiestesia · pêndulo com testemunha e tabuleiro"};
 const chamLabels = {"ES": "Chamalongos · referencia cultural", "EN": "Chamalongos · cultural reference", "FR": "Chamalongos · référence culturelle", "DE": "Chamalongos · Kulturelle Referenz", "PT": "Chamalongos · referência cultural"};
 const divineLabels = {"ES": "Los 72 Nombres de Dios · tripletes hebreos", "EN": "The 72 Names of God · Hebrew triplets", "FR": "Les 72 Noms de Dieu · triplets hébreux", "DE": "Die 72 Namen Gottes · hebräische Tripletts", "PT": "Os 72 Nomes de Deus · tripletes hebraicos"};
 const treeLabels = {"ES": "Árbol de la Vida · 10 sefirot y 22 senderos", "EN": "Tree of Life · 10 sefirot and 22 paths", "FR": "Arbre de Vie · 10 séphirot et 22 chemins", "DE": "Baum des Lebens · 10 Sefiroth und 22 Pfade", "PT": "Árvore da Vida · 10 sefirot e 22 caminhos"};
 const pathsLabels = {"ES": "Los 22 senderos", "EN": "The 22 Paths", "FR": "Les 22 chemins", "DE": "Die 22 Pfade", "PT": "Os 22 caminhos"};
 const v1Labels = {"ES": "Versión 1 · Cáscaras de coco", "EN": "Version 1 · Coconut shells", "FR": "Version 1 · Coquilles de noix de coco", "DE": "Version 1 · Kokosnussschalen", "PT": "Versão 1 · Cascas de coco"};
 const v2Labels = {"ES": "Versión 2 · Caracoles tigre", "EN": "Version 2 · Tiger cowries", "FR": "Version 2 · Escargots tigre", "DE": "Version 2 · Tigerschnecken", "PT": "Versão 2 · Caramujos-tigre"};
 const instrLabels = {"ES": "INSTRUMENTO", "EN": "INSTRUMENT", "FR": "INSTRUMENT", "DE": "INSTRUMENT", "PT": "INSTRUMENTO"};
 const boardLabels = {"ES": "TABLERO", "EN": "BOARD", "FR": "TABLEAU", "DE": "TAFEL", "PT": "TABULEIRO"};
 const downloadLabels = {"ES": "Descargar tablero para imprimir", "EN": "Download board for printing", "FR": "Télécharger le tableau pour imprimer", "DE": "Tafel zum Ausdrucken herunterladen", "PT": "Baixar tabuleiro para imprimir"};

 return <>
  <h2 className="subhead">{zenLabels[lang]}</h2>
  <p className="collection-note sacred-note">Baraja contemplativa original: 23 cartas de Conciencia y cuatro familias de 14 cartas —Fuego, Agua, Nubes y Arcoíris—. Cada lectura recorre tres movimientos: observar, permitir e integrar. No reproduce textos ni ilustraciones de una baraja comercial.</p>
  <div className="zen-reference-grid">{osho.map(card=><article className="zen-deck-card" key={card.id}><div className="zen-card-art"><img src={card.image} alt={`Carta ${card.name} de la familia ${card.group}`} loading="lazy"/></div><small>{card.group}{card.number!==null?` · ${card.number}`:""} · {card.phase}</small><h3>{card.name}</h3><p>{card.message}</p><em>{card.question}</em></article>)}</div>

  <h2 className="subhead">{animalsLabels[lang]}</h2>
  <p className="collection-note">Ilustraciones originales y significados reflexivos. No atribuye estos símbolos a una nación indígena específica ni reproduce un oráculo comercial.</p>
  <div className="animal-library-grid">{animals.map(card=><article key={card.id}><img src={card.image} alt={`Carta del animal de poder ${card.name}`} loading="lazy"/><small>{card.id.slice(-2)} · {card.meaning}</small><h3>{card.name}</h3><p>{card.message}</p></article>)}</div>

  <h2 className="subhead">{radiLabels[lang]}</h2>
  <p className="collection-note">Péndulo de plata con cámara interior para colocar un pequeño testigo y tablero graduado para respuestas orientativas. La práctica se presenta como herramienta simbólica de observación y no como método de diagnóstico.</p>
  <div className="radiesthesia-library">
   <article><img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt={lang==="ES"?"Péndulo de plata con testigo sostenido por una mano":lang==="EN"?"Silver witness pendulum held by hand":lang==="FR"?"Pendule avec témoin en argent tenue par la main":lang==="DE"?"Silbernes Zeugenpendel in der Hand gehalten":"Pêndulo testemunha de prata seguro à mão"} loading="lazy"/><div><small>{instrLabels[lang]}</small><h3>{lang==="ES"?"Péndulo de plata con testigo":lang==="EN"?"Silver Witness Pendulum":lang==="FR"?"Pendule avec Témoin en Argent":lang==="DE"?"Silbernes Zeugenpendel":"Pêndulo Testemunha de Prata"}</h3><p>{t("radiestesiaPendulumDescription")}</p></div></article>
   <article className="radiesthesia-board-card"><img src="/oracles/pendulum/radiesthesia-board.svg" alt={lang==="ES"?"Tablero semicircular de radiestesia con respuestas y escala porcentual":lang==="EN"?"Semicircular radiesthesia board with responses and percentage scale":lang==="FR"?"Tableau radiesthésie semi-circulaire avec réponses et échelle de pourcentage":lang==="DE"?"Radiästhesie-Halbrundtafel mit Antworten und Prozentskala":"Tabuleiro radiestesia semicircular com respostas e escala percentual"} loading="lazy"/><div><small>{boardLabels[lang]}</small><h3>{t("radiestesiaBoard")}</h3><p>{t("radiestesiaBoardDescription")}</p><a href="/oracles/pendulum/radiesthesia-board.svg" download>{downloadLabels[lang]}</a></div></article>
  </div>

  <h2 className="subhead">{chamLabels[lang]}</h2>
  <p className="collection-note sacred-note">Dos versiones visuales de cuatro piezas: cáscara de coco y caracol tigre. Las denominaciones y lecturas varían entre ramas y casas; esta síntesis documental no enseña consagraciones, firmas ni sustituye a una persona iniciada.</p>
  <h3 className="collection-variant-title">{v1Labels[lang]}</h3><ChamalongoGrid normalized={normalized} version="coconut"/>
  <h3 className="collection-variant-title">{v2Labels[lang]}</h3><p className="variant-note">Representación con cuatro caracoles tigre, mostrando la cara ventral como "arriba" y la cara dorsal moteada como "abajo". Existen prácticas con otros números de caracoles.</p><ChamalongoGrid normalized={normalized} version="cowrie"/>

  <h2 className="subhead">{divineLabels[lang]}</h2>
  <p className="collection-note sacred-note">Referencia textual de los 72 tripletes derivados de Éxodo 14:19–21. Se presentan sin asignaciones terapéuticas, predictivas o comerciales añadidas.</p>
  <div className="divine-names-grid metal-engraving" dir="rtl">{names.map(item=><article key={item.number}><small>{item.number}</small><b lang="he">{item.hebrew}</b></article>)}</div>

  <h2 className="subhead">{treeLabels[lang]}</h2>
  <p className="collection-note sacred-note">Mapa de estudio. Las correspondencias entre senderos, letras, planetas y Tarot cambian entre la Cábala judía y las escuelas herméticas; aquí se conserva la capa común de diez sefirot y veintidós letras.</p>
  <div className="tree-study metal-tree-study"><div className="tree-canvas" aria-label="Árbol de la Vida con diez sefirot y veintidós conexiones"><TreeConnections/>{sefirot.map((item,index)=><div className={`sefirah-node node-${index+1}`} key={item.number}><b lang="he">{item.hebrew}</b><span>{item.name}</span><small>{item.gloss}</small></div>)}</div><div className="tree-details"><h3>{pathsLabels[lang]}</h3><div className="path-grid">{treePaths.map(path=><article key={path.number}><small>{path.number}</small><b lang="he">{path.hebrew}</b><span>{path.name}</span></article>)}</div></div></div>
 </>
}

function TreeConnections(){
 const points:Record<number,[number,number]>={1:[240,63],2:[419,163],3:[61,163],4:[419,303],5:[61,303],6:[240,363],7:[419,463],8:[61,463],9:[240,543],10:[240,627]};
 const links:[number,number,string][]=[[1,2,"א"],[1,3,"ב"],[1,6,"ג"],[2,3,"ד"],[2,4,"ה"],[2,6,"ו"],[3,5,"ז"],[3,6,"ח"],[4,5,"ט"],[4,6,"י"],[4,7,"כ"],[5,6,"ל"],[5,8,"מ"],[6,7,"נ"],[6,8,"ס"],[6,9,"ע"],[7,8,"פ"],[7,9,"צ"],[7,10,"ק"],[8,9,"ר"],[8,10,"ש"],[9,10,"ת"]];
 return <svg className="tree-connections" viewBox="0 0 480 680" preserveAspectRatio="none" aria-hidden="true">{links.map(([from,to,letter])=>{const [x1,y1]=points[from],[x2,y2]=points[to],x=(x1+x2)/2,y=(y1+y2)/2;return <g key={`${from}-${to}`}><line x1={x1} y1={y1} x2={x2} y2={y2}/><text x={x} y={y+5} lang="he">{letter}</text></g>})}</svg>
}

function ChamalongoGrid({normalized,version}:{normalized:string,version:"coconut"|"cowrie"}){
 const outcomes=chamalongoOutcomes.filter(item=>(`${item.name} ${item.tone} ${item.note}`).toLowerCase().includes(normalized));
 return <div className={`chamalongo-grid ${version}`}>{outcomes.map(item=><article key={`${version}-${item.name}`}><div className="chamalongo-cast" aria-label={`${item.up} caras interiores y ${4-item.up} exteriores`}>{Array.from({length:4},(_,index)=>version==="coconut"?<i className={index<item.up?"up":"down"} key={index}/>:<img src={`/oracles/chamalongos/tiger-cowrie-${index<item.up?"up":"down"}.webp`} alt={index<item.up?"Cara ventral del caracol tigre":"Cara dorsal moteada del caracol tigre"} key={index}/>)}</div><small>{item.up} DE 4 CARAS INTERIORES</small><h3>{item.name}</h3><strong>{item.tone}</strong><p>{item.note}</p></article>)}</div>
}

function HexagramDiagram({pattern,name}:{pattern:string,name:string}){
 return <div className="hexagram-diagram" role="img" aria-label={`Hexagrama ${name}: seis líneas yin y yang`}>
  <div className="hexagram-lines">{[...pattern].map((line,index)=><div className={`yao ${line==="1"?"yang":"yin"}`} key={index}>{line==="1"?<i/>:<><i/><i/></>}</div>)}</div>
  <span>易</span>
 </div>
}

function Report({results,analyst,question,context,onSave,onDownload,onNew,debug}:{results:Result[],analyst:ReturnType<typeof analyze>,question:string,context:string,onSave:()=>void,onDownload:()=>void,onNew:()=>void,debug:boolean}){
 return <div className="report">
  <div className="report-head"><div><span className="mini-label">REPORTE SIMBÓLICO</span><h2>{question}</h2><p>{context||"Sin contexto adicional"}</p></div><span>{new Date().toLocaleDateString()}</span></div>
  <div className="results">{results.map(r=><article key={r.method}>
   <div className="result-title"><span>{r.method==="tarot"?"✧":r.method==="runes"?"ᛉ":r.method==="iching"?"☰":r.method==="numerology"?"#":"✦"}</span><div><small>{methodLabels[r.method]}</small><h3>{r.title}</h3></div></div>
   {r.method==="tarot"&&<><TarotSpread cards={r.raw_result as TarotDrawn[]}/><PositionReadings cards={r.raw_result as TarotDrawn[]}/></>} 
   {r.method==="runes"&&<div className="drawn-runes">{(r.raw_result as (typeof runes[number]&{position:string})[]).map(x=><div key={x.name}><RuneToken symbol={x.symbol} name={x.name}/><span>{x.position}</span><strong>{x.name}</strong></div>)}</div>}
   {r.method==="iching"&&<div className="iching-visual"><OracleArtwork src="/oracles/iching-balance.png" alt="Paisaje de tinta y hexagrama del I Ching" eyebrow="EL CAMBIO Y EL EQUILIBRIO"/><Hexagram data={r.raw_result as {lines:{yang:boolean,changing:boolean}[],number:number,resultNumber:number}}/></div>}
   {r.method==="angels"&&<AngelCard data={r.raw_result as typeof angelCatalog[number]}/>}
   {r.method==="numerology"&&<NumberGrid data={r.raw_result as ReturnType<typeof numerology>}/>}<p className="interpretation">{r.interpretation}</p><div className="advice"><b>Consejo</b><p>{r.advice[0]}</p></div>{debug&&<pre>{JSON.stringify(r,null,2)}</pre>}
  </article>)}</div>
  <article className="analyst"><div className="analyst-title"><span>◈</span><div><small>ANALYST · REGLAS LOCALES</small><h2>Síntesis integrada</h2></div><b>{analyst.confidence}</b></div><div className="analysis-grid"><div><small>TEMA CENTRAL</small><h3>{analyst.central}</h3><p>Patrón destacado en el conjunto de resultados.</p></div><div><small>COINCIDENCIAS</small><p>{analyst.matches}</p></div><div><small>TENSIONES O DIFERENCIAS</small><p>{analyst.differences}</p></div><div><small>OPORTUNIDADES</small><p>{analyst.opportunities.join(" ")||"Explorar la pregunta desde otra perspectiva."}</p></div><div><small>OBSTÁCULOS</small><p>{analyst.obstacles.join(" ")||"No aparece un obstáculo repetido."}</p></div><div><small>CONSEJO CONJUNTO</small><p>{analyst.advice.join(" ")}</p></div></div><div className="boundary"><b>Distinción importante</b><p>La pregunta y el contexto son datos proporcionados por ti. Las selecciones son resultados aleatorios registrados; la numerología es un cálculo determinista; el resto es interpretación simbólica. Esta síntesis local no afirma hechos ni utiliza IA externa.</p></div></article>
  <div className="report-actions"><button className="ghost" onClick={()=>window.print()}>Imprimir</button><button className="ghost" onClick={onDownload}>Guardar HTML</button><button className="ghost" onClick={onSave}>Guardar localmente</button><button className="primary" onClick={onNew}>Nueva consulta</button></div>
 </div>
}

type TarotDrawn=typeof tarot[number]&{position:string;spread:keyof typeof spreads;isReversed:boolean;contextualInterpretation:string};
function TarotSpread({cards}:{cards:TarotDrawn[]}){const spread=cards[0]?.spread||"three";return <div className={`tarot-table spread-${spread}`} aria-label={`Disposición ${spread}`}><div className="table-cloth"/>{cards.map((c,i)=><div className="spread-card" key={c.id} data-position={i+1}><div className={`mini-card ${c.isReversed?"reversed":""}`}><img src={c.image} alt={c.name}/></div><small><b>{i+1}</b>{c.position}</small><strong>{c.name}{c.isReversed?" · invertida":""}</strong></div>)}</div>}
function PositionReadings({cards}:{cards:TarotDrawn[]}){return <div className="position-readings"><div className="reading-label">INTERPRETACIÓN POSICIÓN POR POSICIÓN</div>{cards.map((c,i)=><article key={c.id}><span>{i+1}</span><div><small>{c.position} · {c.name}{c.isReversed?" invertida":""}</small><p>{c.contextualInterpretation}</p></div></article>)}</div>}
function OracleArtwork({src,alt,eyebrow}:{src:string;alt:string;eyebrow:string}){return <figure className="oracle-art"><img src={src} alt={alt}/><figcaption>{eyebrow}</figcaption></figure>}
function RuneToken({symbol,name}:{symbol:string;name:string}){return <div className="rune-token" role="img" aria-label={`Runa ${name} tallada en madera`}><img src="/oracles/rune-token-wood-v3.png" alt=""/><b>{symbol}</b></div>}
function AngelDeckCard({card}:{card:typeof angelCatalog[number]}){return <article className="angel-deck-card"><div className="angel-deck-art"><img src={card.image} alt={`Representación original de ${card.name} con ${card.attribute.toLowerCase()}`} loading="lazy"/><i/></div><small>{card.family} · {card.id.slice(-2)}</small><h3>{card.name}</h3><strong>{card.role}</strong><p>{card.message}</p><em>{card.tradition}</em><div>{card.keys.map(key=><b key={key}>{key}</b>)}</div></article>}
function AngelCard({data}:{data:typeof angelCatalog[number]}){return <div className="angel-card"><AngelDeckCard card={data}/><div><small>MENSAJE DE LOS ÁNGELES · {data.family}</small><h3>{data.name}</h3><b className="angel-role">{data.role}</b><p>{data.message}</p><p className="angel-source"><b>Atributo:</b> {data.attribute}<br/><b>Tradición:</b> {data.tradition}</p><div className="angel-keywords">{data.keys.map(key=><span key={key}>{key}</span>)}</div></div></div>}
function Hexagram({data}:{data:{lines:{yang:boolean,changing:boolean}[],number:number,resultNumber:number}}){return <div className="hex"><div><small>HEXAGRAMA INICIAL · {data.number}</small>{[...data.lines].reverse().map((l,i)=><div key={i} className="line">{l.yang?<i/>:<><i/><i/></>}{l.changing&&<b>×</b>}</div>)}</div>{data.number!==data.resultNumber&&<span>→</span>} {data.number!==data.resultNumber&&<div><small>RESULTANTE · {data.resultNumber}</small>{[...data.lines].reverse().map((l,i)=>{const y=l.changing?!l.yang:l.yang;return <div key={i} className="line">{y?<i/>:<><i/><i/></>}</div>})}</div>}</div>}
function NumberGrid({data}:{data:ReturnType<typeof numerology>}){return <div className="number-grid">{Object.entries({"Camino de Vida":data.lifePath,"Nacimiento":data.birthday,"Expresión":data.expression,"Alma":data.soul,"Personalidad":data.personality,"Año personal":data.personalYear,"Mes personal":data.personalMonth}).map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span><small>{numberMeanings[v]}</small></div>)}</div>}
function Daily({daily}:{daily:typeof tarot[number]}){const day=reduceNumber([...String(new Date().getFullYear()),String(new Date().getMonth()+1).padStart(2,"0"),String(new Date().getDate()).padStart(2,"0")].join("").split("").reduce((a,b)=>a+Number(b),0)),rune=runes[new Date().getDate()%runes.length];return <section className="workspace"><div className="page-title"><span className="mini-label">RITUAL COTIDIANO</span><h1>Guía del día</h1><p>La misma selección global se mantiene durante la fecha local actual.</p></div><div className="daily-grid"><article><span className="mini-label">CARTA DEL DÍA</span><div className="big-card"><img src={daily.image} alt={daily.name}/></div><h2>{daily.name}</h2><p>{daily.general}</p><strong>Reflexión</strong><p>{daily.advice}</p></article><article><span className="mini-label">RUNA DEL DÍA</span><RuneToken symbol={rune.symbol} name={rune.name}/><h2>{rune.name}</h2><p>{rune.meaning}</p></article><article><span className="mini-label">NÚMERO DEL DÍA</span><b className="big-number">{day}</b><h2>{numberMeanings[day]}</h2><p>Suma reducida de los dígitos de la fecha: {new Date().toLocaleDateString()}.</p></article></div></section>}

function RadiestesiaSystemSite({onBack, lang}:{onBack:()=>void; lang?:Language}){
 const language = (lang || "ES") as Language;
 const t=(key:string):string=>{try{const keys=key.split(".");let value:any=translations[language];for(const k of keys){if(value)value=value[k];else return key}return value||key}catch(e){return key}};
 const [step,setStep]=useState<"menu"|"question"|"casting"|"result">("menu");
 const [focus,setFocus]=useState("");
 const [selectedFocusIdx,setSelectedFocusIdx]=useState<number|null>(null);
 const [question,setQuestion]=useState("");
 const [angle,setAngle]=useState(0);
 const [intensity,setIntensity]=useState(0);
 const [isAnimating,setIsAnimating]=useState(false);
 const [revealed,setRevealed]=useState(false);
 const [castPhase,setCastPhase]=useState<"swinging"|"board"|"stopped">("swinging");
 const [pendulumActive,setPendulumActive]=useState(false);

 const reading=useMemo<Result|null>(()=>{
  if(!revealed)return null;
  const normalized=Math.max(-75,Math.min(75,angle));
  let resp="";
  if(normalized<-55)resp=language==="ES"?"No definitivo":language==="EN"?"Definite No":language==="FR"?"Non définitif":language==="DE"?"Entschiedenes Nein":"Não definitivo";
  else if(normalized<-30)resp=language==="ES"?"No":language==="EN"?"No":language==="FR"?"Non":language==="DE"?"Nein":"Não";
  else if(normalized<-10)resp=language==="ES"?"Probablemente no":language==="EN"?"Probably not":language==="FR"?"Probablement non":language==="DE"?"Wahrscheinlich nein":"Provavelmente não";
  else if(normalized<=10)resp=language==="ES"?"Neutral":language==="EN"?"Neutral":language==="FR"?"Neutre":language==="DE"?"Neutral":"Neutro";
  else if(normalized<=35)resp=language==="ES"?"Probablemente sí":language==="EN"?"Probably yes":language==="FR"?"Probablement oui":language==="DE"?"Wahrscheinlich ja":"Provavelmente sim";
  else if(normalized<=60)resp=language==="ES"?"Sí":language==="EN"?"Yes":language==="FR"?"Oui":language==="DE"?"Ja":"Sim";
  else resp=language==="ES"?"Sí definitivo":language==="EN"?"Definite Yes":language==="FR"?"Oui définitif":language==="DE"?"Entschiedenes Ja":"Sim definitivo";
  const observeAdvice=language==="ES"?"Observe el movimiento sin forzar una interpretación.":language==="EN"?"Observe the movement without forcing an interpretation.":language==="FR"?"Observez le mouvement sans forcer une interprétation.":language==="DE"?"Beobachten Sie die Bewegung, ohne eine Interpretation zu erzwingen.":"Observe o movimento sem forçar uma interpretação.";
  const radiesTitle=language==="ES"?"Radiestesia":language==="EN"?"Radiesthesia":language==="FR"?"Radiesthésie":language==="DE"?"Radiästhesie":"Radiestesia";
  const consultLabel=language==="ES"?"Consulta pendular":language==="EN"?"Pendulum Consultation":language==="FR"?"Consultation Pendulaire":language==="DE"?"Pendel-Konsultation":"Consulta Pendular";
  const pendulumResp=translateRadiesthesiaInterpretation("El péndulo responde a tu pregunta con",language);
  const intensityLabel=translateRadiesthesiaInterpretation("a una intensidad del",language);
  const energyNote=translateRadiesthesiaInterpretation("En la radiestesia, el movimiento es un reflejo del campo energético",language);
  const symbolGuidance=translateRadiesthesiaInterpretation("usa esta información como orientación simbólica para reflexionar sobre tu pregunta",language);
  const themes=language==="ES"?["intuición","dirección","equilibrio"]:language==="EN"?["intuition","direction","balance"]:language==="FR"?["intuition","direction","équilibre"]:language==="DE"?["Intuition","Richtung","Gleichgewicht"]:["intuição","direção","equilíbrio"];
  return {method:"radiestesia",title:`${radiesTitle} · ${consultLabel}`,raw_result:{angle:normalized,intensity,response:resp},themes,obstacles:[],opportunities:[resp],advice:[observeAdvice],interpretation:`${pendulumResp} ${resp.toLowerCase()} ${intensityLabel} ${intensity}%. ${energyNote}; ${symbolGuidance}.`};
 },[revealed,angle,intensity,language]);

 const radiestesiaCards=[{num:1,label:"Pregunta",card:question||"Sin pregunta",reversed:false}];
 const {interpretation:aiInterpretation,isLoading}=useAIInterpretation({discipline:"radiestesia",spread:castPhase==="board"||castPhase==="stopped"?`Consulta radiestésica - ${focus} (Intensidad: ${intensity}%, Ángulo: ${angle}°)`:"",cards:radiestesiaCards,question,language});
 const radiestesiaSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);

 const boardX=200+Math.cos(((angle-90)*Math.PI)/180)*120;
 const boardY=200+Math.sin(((angle-90)*Math.PI)/180)*120;

 const focuses=[
   {label:t("focusDecisionsLabel"),color:"#3b82f6",symbol:"↗",description:t("focusDecisionsDesc"),subcats:[t("focusDecisionsQ1"),t("focusDecisionsQ2"),t("focusDecisionsQ3"),t("focusDecisionsQ4")]},
   {label:t("focusClarityLabel"),color:"#9333ea",symbol:"◉",description:t("focusClarityDesc"),subcats:[t("focusClarityQ1"),t("focusClarityQ2"),t("focusClarityQ3"),t("focusClarityQ4")]},
   {label:t("focusEnergyLabel"),color:"#16a34a",symbol:"≈",description:t("focusEnergyDesc"),subcats:[t("focusEnergyQ1"),t("focusEnergyQ2"),t("focusEnergyQ3"),t("focusEnergyQ4")]},
   {label:t("focusRelationshipsLabel"),color:"#e11d48",symbol:"◇",description:t("focusRelationshipsDesc"),subcats:[t("focusRelationshipsQ1"),t("focusRelationshipsQ2"),t("focusRelationshipsQ3"),t("focusRelationshipsQ4")]}
 ];

 const selectedFocus=selectedFocusIdx===null?null:focuses[selectedFocusIdx];
 const radiestesiaLibrary:DisciplineLibraryItem[]=[
  {id:"pendulum-held",name:t("pendulumTitle"),category:libraryCategories[language].image,description:libraryDescriptions[language].pendulum,image:"/oracles/pendulum/silver-witness-pendulum-held.jpg"},
  {id:"pendulum",name:`${t("pendulumTitle")} · ${libraryCategories[language].symbol}`,category:libraryCategories[language].image,description:libraryDescriptions[language].pendulum,image:"/oracles/pendulum/silver-witness-pendulum.jpg"},
  {id:"radiesthesia-board",name:t("pendulumBoardTitle1"),category:libraryCategories[language].image,description:libraryDescriptions[language].board,image:"/oracles/pendulum/radiesthesia-board.svg"},
 ];
 const resultAnswer=reading?(reading.raw_result as {response:string}).response:"";
 const answerTone=resultAnswer.includes("No")||resultAnswer.includes("no")?"no":resultAnswer.includes("Neutral")?"neutral":"yes";

 function returnToMenu(){setStep("menu");setCastPhase("swinging");setPendulumActive(false);setRevealed(false);window.scrollTo({top:0,behavior:"smooth"})}

 function startCasting(){
  if(!question.trim()){alert("Formúlate una pregunta clara"); return}
  setPendulumActive(true);
 }

 function readBoard(){
  if(castPhase!=="swinging")return;
  const sectorAngles=[-67,-45,-22,0,22,45,67];
  const availableAngles=sectorAngles.filter(sector=>Math.abs(sector-angle)>12);
  const randomValue=typeof crypto!=="undefined"&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]/4294967296:Math.random();
  const selectedSector=availableAngles[Math.floor(randomValue*availableAngles.length)]??sectorAngles[0];
  const newAngle=selectedSector+(Math.random()*8-4);
  const intensity_val=30+Math.random()*70;
  setAngle(newAngle);
  setIntensity(Math.round(intensity_val));
  setStep("casting");
  setCastPhase("board");
  setIsAnimating(true);
  setRevealed(false);
  setTimeout(()=>{
   setIsAnimating(false);
   setCastPhase("stopped");
   setRevealed(true);
  },14100);
 }

 return (
    <section className={`tarot-classic-site radiestesia-site tarot-step-${step}`}>
      <button className="system-back radiestesia-back" onClick={step==="menu"?onBack:returnToMenu}>
        {step==="menu"?t("pendulumBackToStart"):t("pendulumChooseOtherFocus")}
      </button>

      {step==="menu" && (
        <>
          <div className="tarot-menu-title system-intro-title radiestesia-intro">
            <h1>{t("pendulumTitle")}</h1>
            <span>{t("pendulumSubtitle")}</span>
            <div className="system-introduction radiestesia-introduction-copy">
              <p>{t("pendulumIntro1")}</p>
              <p>{t("pendulumIntro2")}</p>
              <p>{t("pendulumIntro3")}</p>
              <p>{t("pendulumIntro4")}</p>
            </div>
          </div>
          <section className="spread-menu-section radiestesia-menu">
            <span className="mini-label">{t("pendulumChooseFocus")}</span>
            <div className="spread-category-grid radiestesia-focus-grid">
              {focuses.map((f,idx)=><details className={`radiestesia-focus-card spread-group-${idx+1}`} key={f.label}>
                <summary><span className="spread-symbol"><i>{f.symbol}</i></span><div><b>{f.label}</b><small>{f.subcats.length} {t("pendulumConsultations")}</small></div><em>+</em></summary>
                <div className="spread-options radiestesia-focus-options">{f.subcats.map(subcat=><button key={subcat} onClick={()=>{setSelectedFocusIdx(idx);setFocus(f.label);setQuestion(subcat);setStep("question");window.scrollTo({top:0,behavior:"smooth"})}}>{subcat}<span>→</span></button>)}</div>
              </details>)}
            </div>
          </section>
          <CollapsibleDisciplineLibrary lang={language} items={radiestesiaLibrary}/>
        </>
      )}

      {step==="question" && (
        <div className="radiestesia-casting" style={{"--focus":selectedFocus?.color||"#9333ea"} as CSSProperties}>
          <div className="casting-heading"><span>{focus.toUpperCase()}</span><h1>{t("pendulumObserve")}</h1><p>{pendulumActive?t("pendulumActiveText"):t("pendulumReadyText")}</p></div>
          <button className={`pendulum-casting-stage photo-pendulum ${pendulumActive?"swinging":"ready"}`} onClick={pendulumActive?readBoard:startCasting} aria-label={pendulumActive?"Cambiar al tablero y realizar la lectura":"Activar el movimiento del péndulo"}>
            <img className="real-pendulum-background" src="/oracles/pendulum/silver-witness-hand-background.png" alt="Mano sosteniendo el péndulo durante la consulta"/>
            <img className="real-pendulum-layer" src="/oracles/pendulum/silver-witness-pendulum-cutout.png" alt="Péndulo de plata"/>
          </button>
        </div>
      )}

      {step==="casting" && (
        <div className="radiestesia-casting radiestesia-board-casting" style={{"--focus":selectedFocus?.color||"#9333ea","--swing-span":`${48+intensity*.42}%`} as CSSProperties}>
          <div className="casting-heading"><span>{focus.toUpperCase()}</span><h1>{castPhase==="swinging"?t("pendulumObserve"):castPhase==="board"?t("pendulumBoardTitle1"):t("pendulumBoardTitle2")}</h1><p>{castPhase==="swinging"?t("pendulumActiveText"):castPhase==="board"?t("pendulumBoardText1"):t("pendulumBoardText2")}</p></div>
          <div className={`pendulum-casting-stage ${castPhase}`} style={{"--target-angle":`${angle}deg`} as CSSProperties} aria-live="polite">
            {castPhase==="swinging"?<>
              <img className="real-pendulum-background" src="/oracles/pendulum/silver-witness-hand-background.png" alt="Mano sosteniendo el péndulo durante la consulta"/>
              <img className="real-pendulum-layer" src="/oracles/pendulum/silver-witness-pendulum-cutout.png" alt="Péndulo de plata oscilando"/>
            </>:<>
              <img className="radiestesia-board-image" src="/oracles/pendulum/radiesthesia-board.svg" alt="Tablero de radiestesia con respuestas e intensidad"/>
              <span className="board-swing-axis" aria-hidden="true"><i/><b className="board-swing-traveler"/></span>
              <span className="board-center-mark" aria-hidden="true"/>
            </>}
          </div>
          {(castPhase==="board"||castPhase==="stopped")&&reading&&<section className="radiestesia-inline-interpretation radiestesia-interpretation-panel">
            <div className="radiestesia-inline-answer"><div><span className="mini-label">{t("pendulumResponse")}</span><div className={`answer-word ${answerTone}`}>{resultAnswer}</div></div><div><span className="mini-label">{t("pendulumIntensity")}</span><b>{intensity}%</b></div></div>
            <div className="intensity-bar"><div className="intensity-fill" style={{width:`${intensity}%`}}/></div>
            <div className="reading-divider"/>
            <span className="mini-label">{t("pendulumInterpretationLabel")}</span><h2>{t("pendulumInterpretationTitle")}</h2>
            <div className="interpretation-copy">{isLoading?<p className="interpretation-loading">{t("pendulumInterpretationLoading")}</p>:radiestesiaSections.length>0?<div className="radiestesia-ai-sections">{radiestesiaSections.map(section=><article key={section.id}><h3>{section.title}</h3><p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>:<p dangerouslySetInnerHTML={{__html:markdownToHtml(reading.interpretation)}}/>}</div>
            <blockquote>"{question}"</blockquote>
            <div className="radiestesia-result-actions"><button onClick={returnToMenu}>{t("pendulumChooseOtherFocus")}</button><button onClick={onBack}>{t("pendulumBackToHome")}</button></div>
          </section>}
        </div>
      )}
    </section>
  );
}

export default App;
