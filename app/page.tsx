"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { angelCatalog, ichingCatalog, runeCatalog, tarotCatalog } from "./library-data";
import { chamalongoOutcomes, divineNames72, oshoZenReference, powerAnimals, sefirot, treePaths } from "./extended-library-data";
import { librarySites, librarySystems, serviceGroups, services, type ServiceDefinition } from "./service-config";
import { classicSpreadByName, type TarotSpreadDefinition, type TarotSpreadLayout } from "./tarot-spreads";
import { analyzeTarotReading, buildTarotEditorialOutput } from "./tarot-analysis";
import { buildOracleEditorialOutput } from "./oracle-analysis";
import { castIChing, getIChingCounsel, ichingConsultations, interpretIChing, interpretRuneSpread, runeMeanings, runeReadingGroups, type IChingConsultation, type IChingLine, type RuneSpread } from "./ancient-systems";
import { riderDeck as tarot } from "./rider-deck";
import { useAIInterpretation, toAICards, type AICard } from "./use-ai-interpretation";

type Method = "tarot" | "runes" | "iching" | "numerology" | "angels";
type Result = { method: Method; title: string; raw_result: unknown; themes: string[]; obstacles: string[]; opportunities: string[]; advice: string[]; interpretation: string };
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
 {title:"Tiradas rápidas",icon:"✧",items:["Una carta — mensaje central","Dos cartas — situación y consejo","Sí / No razonado — respuesta, condición y advertencia","Tres cartas — pasado, presente y tendencia","Situación, obstáculo y consejo","Mente, emoción y acción","Qué conservar, qué soltar y qué iniciar"]},
 {title:"Amor y relaciones",icon:"♡",items:["Tú, la otra persona y el vínculo","Relación de seis cartas","Qué siente, qué piensa y qué hará","Compatibilidad de la pareja","Evolución del vínculo","Reconciliación o cierre","Persona nueva: intención, potencial y precaución"]},
 {title:"Decisiones",icon:"⇄",items:["Camino A frente a Camino B","Ventajas, riesgos y resultado probable","Qué ocurre si actúo / si no actúo","Decisión de seis cartas","Semáforo: avanzar, esperar o detenerse"]},
 {title:"Trabajo y dinero",icon:"◇",items:["Situación laboral","Cambio de empleo","Proyecto o negocio","Bloqueo económico","Flujo de recursos","Oportunidad, riesgo y estrategia"]},
 {title:"Desarrollo personal",icon:"◉",items:["Sombra, aprendizaje y recurso","Bloqueo emocional","Propósito del momento","Ciclo que termina y ciclo que comienza","Herida, conciencia e integración","Los siete chakras","Rueda del año personal"]},
 {title:"Tiradas profundas",icon:"✦",items:["Cruz Celta — 10 cartas","Herradura — 7 cartas","Estrella de siete cartas","Mandala de nueve cartas","Doce casas — 12 cartas","Árbol de la Vida — 10 cartas","Camino espiritual — 12 cartas"]},
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
 "Astrología":["/cards/rws/17-star.jpg","/cards/rws/major-18.jpg","/cards/rws/major-19.jpg"],
 "Numerología":["/oracles/iching-balance.png","/cards/rws/pentacles-08.jpg","/textures/brushed-chrome-soft.webp"],
 "Quiromancia":["/oracles/pendulum/silver-witness-pendulum-held.jpg","/cards/rider-classic/dealing-hand-v3.png"],
 "Fisonomía":["/oracles/angels/angel-01.webp","/oracles/zen-oraculo/cards/zen-20.jpg"],
 "Energía / Aura":["/oracles/zen-oraculo/style-study-v2.png","/oracles/zen-oraculo/cards/zen-01.jpg","/oracles/angels/angel-20.webp"],
 "Feng Shui":["/oracles/iching-balance.png","/oracles/rune-token-wood-v3.png"],
 "Horóscopo Chino":["/oracles/animals/animal-31.webp","/oracles/animals/animal-17.webp","/oracles/iching-balance.png"],
 "Cita con Madame Meraki":["/speculum-animae-logo.png"]
};
function menuImage(system:string,seed:number){const images=homeMenuImages[system]||homeMenuImages["I Ching"];const hash=[...system].reduce((sum,char)=>sum+char.charCodeAt(0),0);return images[(seed+hash)%images.length]}
const nav = ["Inicio","Biblioteca"];
const viewRoutes:Record<string,string>={"Inicio":"/#/inicio","Biblioteca":"/#/biblioteca","Tarot Clásico":"/#/tarot-clasico","Tarot Zen":"/#/tarot-zen","Ángeles":"/#/angeles","Animales de Poder":"/#/animales-de-poder","Runas":"/#/runas","I Ching":"/#/i-ching","Radiestesia":"/#/radiestesia"};
const routeViews:Record<string,string>=Object.fromEntries(Object.entries(viewRoutes).map(([view,route])=>[route.split("#")[1],view]));

function secureIndex(max:number){ if(typeof crypto!=="undefined"&&crypto.getRandomValues){const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]%max} return Math.floor(Math.random()*max) }
function pickUnique<T>(items:T[], count:number){const pool=[...items], out:T[]=[], target=Math.min(count,pool.length); while(out.length<target){out.push(pool.splice(secureIndex(pool.length),1)[0])} return out}
function reduceNumber(n:number){while(n>9 && ![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+Number(b),0);return n}
function letters(name:string){const map:Record<string,number>={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};return [...name.normalize("NFD").replace(/[^a-z]/gi,"").toUpperCase()].map(c=>map[c]||0)}
function numerology(name:string,birth:string){const d=birth.replace(/\D/g,"").split("").map(Number), day=Number(birth.slice(8,10));const vals=letters(name), vowels=new Set(["A","E","I","O","U"]), chars=[...name.normalize("NFD").replace(/[^a-z]/gi,"").toUpperCase()];const soul=vals.filter((_,i)=>vowels.has(chars[i])).reduce((a,b)=>a+b,0), personality=vals.filter((_,i)=>!vowels.has(chars[i])).reduce((a,b)=>a+b,0);const now=new Date(), personal=reduceNumber(reduceNumber(day)+reduceNumber(Number(birth.slice(5,7)))+reduceNumber(now.getFullYear()));return {lifePath:reduceNumber(d.reduce((a,b)=>a+b,0)),birthday:reduceNumber(day),expression:reduceNumber(vals.reduce((a,b)=>a+b,0)),soul:reduceNumber(soul),personality:reduceNumber(personality),personalYear:personal,personalMonth:reduceNumber(personal+now.getMonth()+1)}}
const numberMeanings:Record<number,string>={1:"iniciativa y autonomía",2:"cooperación y sensibilidad",3:"expresión y creatividad",4:"estructura y constancia",5:"cambio y libertad responsable",6:"cuidado y armonía",7:"análisis e introspección",8:"gestión y resultados",9:"cierre, servicio y amplitud",11:"intuición e inspiración",22:"visión aplicada y construcción",33:"servicio compasivo"};

function categoryMeaning(card:typeof tarot[number],category:string){if(category.includes("Amor")||category.includes("Familia"))return card.love;if(category.includes("Trabajo"))return card.work;if(category.includes("Dinero"))return card.money;if(category.includes("Crecimiento"))return card.growth;return card.general}
function contextLens(context:string){const text=context.toLowerCase(), notes:string[]=[];if(/separad|distancia|sin contacto/.test(text))notes.push("distancia o separación");if(/junt|pareja|relación actual/.test(text))notes.push("vínculo activo");if(/nuevo|reciente|comenz/.test(text))notes.push("etapa inicial");if(/decid|opci|camino|elegir/.test(text))notes.push("elección entre alternativas");if(/cambio|renuncia|oferta|nuevo trabajo/.test(text))notes.push("transición profesional");if(/deuda|ingreso|ahorro|inversión/.test(text))notes.push("gestión de recursos");if(/conflicto|discusi|tensión/.test(text))notes.push("tensión expresada");return notes}
function buildTarot(question:string,context:string,category:string,spread:keyof typeof spreads,reversed:boolean):Result{
 const lenses=contextLens(context), cards=pickUnique(tarot,spreads[spread].length).map((c,i)=>{const isReversed=reversed&&secureIndex(3)===0, base=isReversed?c.reversed:categoryMeaning(c,category);return {...c,position:spreads[spread][i],spread,isReversed,contextualInterpretation:`En “${spreads[spread][i]}”, ${c.name}${isReversed?" invertida":""} pone el foco en ${c.keys.slice(0,2).join(" y ")}. ${base} ${lenses.length?`Al relacionarla con ${lenses.join(" y ")}, conviene contrastar este símbolo con lo que realmente estás observando.`:""}`}});
 const spreadNames={one:"Una carta — mensaje central",three:"Tres cartas — pasado, presente y tendencia",relationship:"Relación de seis cartas",decision:"Decisión de seis cartas",celtic:"Cruz Celta — 10 cartas"} as const;
 const readingAnalysis=analyzeTarotReading({spread:spreadNames[spread],positions:spreads[spread],cards,category,question,orientationEnabled:reversed});
 const paragraphs=composeTarotInterpretation(readingAnalysis,cards),opening=context.trim()?"Tomando en cuenta lo que compartiste, la lectura organiza la situación así:":"La lectura organiza la situación así:";
 return {method:"tarot",title:`Tarot · ${spreads[spread].length} carta${cards.length>1?"s":""}`,raw_result:{cards,readingAnalysis},themes:readingAnalysis.narrativeClusters.map((cluster:{theme:string})=>cluster.theme),obstacles:cards.filter(c=>c.isReversed).map(c=>c.reversed),opportunities:cards.filter(c=>!c.isReversed).map(c=>categoryMeaning(c,category)),advice:cards.map(c=>c.advice),interpretation:`${opening}\n\n${paragraphs.join("\n\n")}`}
}
function buildRunes(question:string):Result{const drawn=pickUnique(runes,3).map((r,i)=>({...r,position:["Situación","Obstáculo","Consejo"][i],image:"/oracles/runes-wood-v2.png"}));return {method:"runes",title:"Runas · Situación / obstáculo / consejo",raw_result:drawn,themes:[...new Set(drawn.flatMap(r=>r.keys))],obstacles:[drawn[1].meaning],opportunities:[drawn[0].meaning],advice:[drawn[2].advice],interpretation:`Las runas invitan a explorar ${drawn.flatMap(r=>r.keys).slice(0,3).join(", ")} alrededor de “${question}”.`}}
function buildIChing(question:string):Result{const lines=Array.from({length:6},()=>{const n=[6,7,8,9][secureIndex(4)];return {value:n,yang:n===7||n===9,changing:n===6||n===9}});const bits=lines.map(l=>l.yang?1:0).join(""), transformed=lines.map(l=>(l.changing?!l.yang:l.yang)?1:0).join("");const number=parseInt(bits,2)+1,resultNumber=parseInt(transformed,2)+1;return {method:"iching",title:`I Ching · Hexagrama ${number}`,raw_result:{lines,number,resultNumber,image:"/oracles/iching-balance.png"},themes:["cambio","equilibrio","proceso"],obstacles:lines.some(l=>l.changing)?["El cambio requiere atención a los puntos móviles."]:[],opportunities:["Observar la evolución de la situación antes de forzarla."],advice:["Responde al momento con coherencia y gradualidad."],interpretation:`El hexagrama ${number}${number!==resultNumber?` transforma hacia el ${resultNumber}`:" permanece estable"}. La lectura funciona como orientación simbólica sobre “${question}”; el contenido editorial completo de los 64 hexagramas está pendiente.`}}
function buildAngels(question:string,context:string,category:string):Result{const c=angelCatalog[secureIndex(angelCatalog.length)],contextNote=context.trim()?` Considerando el contexto que compartiste —“${context.trim()}”—,`:"";return {method:"angels",title:`Mensaje de Ángeles · ${c.family}`,raw_result:c,themes:[...c.keys],obstacles:[],opportunities:[c.message],advice:[c.message],interpretation:`Para tu pregunta “${question}” en ${category.toLowerCase()}, aparece ${c.name}.${contextNote} el mensaje invita a explorar ${c.keys.join(" y ")}. ${c.message} Esta orientación es simbólica: úsala como una pregunta de reflexión y contrástala con tu situación real.`}}
function buildNumerology(name:string,birth:string):Result{const n=numerology(name,birth);return {method:"numerology",title:"Perfil numerológico",raw_result:n,themes:[numberMeanings[n.lifePath],numberMeanings[n.expression]],obstacles:[],opportunities:[`Camino de Vida ${n.lifePath}: ${numberMeanings[n.lifePath]}`],advice:[`Año personal ${n.personalYear}: explora ${numberMeanings[n.personalYear]}.`],interpretation:`Cálculo determinista basado en el nombre y fecha proporcionados. Camino de Vida ${n.lifePath}; Expresión ${n.expression}; Alma ${n.soul}.`}}
function analyze(results:Result[]){const all=results.flatMap(r=>r.themes).map(x=>x.toLowerCase()), counts=new Map<string,number>();all.forEach(x=>counts.set(x,(counts.get(x)||0)+1));const repeated=[...counts.entries()].filter(([,n])=>n>1).map(([x])=>x);return {central:repeated[0]||all[0]||"observación consciente",matches:repeated.length?repeated.join(", "):"Cada método aporta una perspectiva distinta.",differences:results.length>1?"Las disciplinas usan lenguajes diferentes; sus matices no deben forzarse a coincidir.":"Se utilizó una sola disciplina.",obstacles:[...new Set(results.flatMap(r=>r.obstacles))].slice(0,3),opportunities:[...new Set(results.flatMap(r=>r.opportunities))].slice(0,3),advice:[...new Set(results.flatMap(r=>r.advice))].slice(0,3),confidence:repeated.length>=2?"Convergencia alta":repeated.length?"Convergencia media":"Perspectivas diversas"}}

function ServiceCards({items,onSelect}:{items:ServiceDefinition[];onSelect:(service:ServiceDefinition)=>void}){
 return <div className="service-choice-grid">{items.map(service=><button key={service.id} className={`service-choice ${service.status==="COMING_SOON"?"coming-soon":""}`} onClick={()=>onSelect(service)}><span className="service-choice-icon" aria-hidden="true">{service.icon}</span><span><b>{service.name}</b><small>{service.description}</small></span><em>{service.status==="AVAILABLE"?"→":"PRÓXIMAMENTE"}</em></button>)}</div>
}

function SelectionGroup({title,description,items,onSelect}:{title:string;description:string;items:ServiceDefinition[];onSelect:(service:ServiceDefinition)=>void}){
 return <section className="selection-group"><div className="selection-group-head"><div><span className="mini-label">{title}</span><h2>{title}</h2></div><p>{description}</p></div><ServiceCards items={items} onSelect={onSelect}/></section>
}

function ClassicTarotSite({onBack}:{onBack:()=>void}){
 const [shufflePhase,setShufflePhase]=useState<"idle"|"shuffling"|"ready">("idle");
 const [selectedSpread,setSelectedSpread]=useState("");
 const [includeReversed,setIncludeReversed]=useState(false);
 const [dealKey,setDealKey]=useState(0);
 const [tarotStep,setTarotStep]=useState<"menu"|"shuffle"|"reading">("menu");
 const spreadDefinition=selectedSpread?classicSpreadByName.get(selectedSpread):undefined;
 function chooseSpread(item:string){setSelectedSpread(item);setShufflePhase("idle");setTarotStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function toggleShuffle(){if(shufflePhase!=="shuffling"){setShufflePhase("shuffling");return}setShufflePhase("ready");setDealKey(current=>current+1);window.setTimeout(()=>{setTarotStep("reading");window.scrollTo({top:0,behavior:"smooth"})},420)}
 function returnToMenu(){setTarotStep("menu");setShufflePhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site tarot-step-${tarotStep}`}>
  <button className="system-back" onClick={tarotStep==="menu"?onBack:returnToMenu}>{tarotStep==="menu"?"← Volver al Inicio":"← Elegir otra tirada"}</button>
  {tarotStep==="menu"&&<><div className="tarot-menu-title"><h1>Tarot Rider–Waite–Smith</h1><span>UNA BARAJA QUE CONVIERTE LOS SÍMBOLOS EN HISTORIAS</span><div className="rider-history"><p>El tarot nació como juego de cartas en la Italia del siglo XV y empezó a utilizarse con fines interpretativos y adivinatorios en Europa varios siglos después. Sus 78 cartas combinan arcanos mayores y menores para representar experiencias, conflictos, decisiones y ciclos humanos.</p><p>Publicado en 1909, el Rider–Waite–Smith reúne la concepción de Arthur Edward Waite y las ilustraciones de Pamela Colman Smith, con William Rider como editor original. Su innovación fue representar escenas completas también en los arcanos menores, haciendo que cada carta pudiera leerse como parte de una historia.</p><p>Sus imágenes nos hablan mediante personajes, gestos, colores, objetos y paisajes. Al relacionar cada carta con el lugar que ocupa en la tirada, podemos reconocer el momento presente, tensiones, posibilidades, decisiones y consecuencias probables. No determina un futuro inevitable: ayuda a observar patrones y a formular una respuesta más consciente.</p><small>La versión histórica utilizada en este sitio pertenece al dominio público.</small></div></div><section className="spread-menu-section"><span className="mini-label">ELIGE EL ENFOQUE</span><div className="spread-category-grid">{tarotSpreadGroups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.title}><summary><span className="spread-symbol" aria-hidden="true"><i>{group.icon}</i></span><div><b>{group.title}</b><small>{group.items.length} tiradas</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>chooseSpread(item)} key={item}>{item}<span>→</span></button>)}</div></details>)}</div></section></>}
  {tarotStep==="shuffle"&&<><div className="tarot-classic-head"><h1>{selectedSpread}</h1></div><div className="tarot-shuffle-stage"><div className="deck-touch-area"><div className={`animated-deck ${shufflePhase}`} role="button" tabIndex={0} onClick={toggleShuffle} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();toggleShuffle()}}} aria-label={shufflePhase==="shuffling"?"Toca de nuevo para parar":"Toca las cartas para comenzar"}>{Array.from({length:9},(_,index)=><div className="shuffle-card" key={index}><span>✦</span></div>)}</div></div><div className="shuffle-guidance" aria-live="polite"><p>{shufflePhase==="shuffling"?"Concéntrate en lo que quieres saber.":"Antes de tocar las cartas, concéntrate en lo que quieres saber."}</p></div><button type="button" className={`reversed-option stage-reversed-option ${includeReversed?"active":""}`} aria-pressed={includeReversed} disabled={shufflePhase!=="idle"} onClick={()=>setIncludeReversed(value=>!value)}><span aria-hidden="true">↕</span><b>Incluir cartas invertidas</b><small>{includeReversed?"Activado: al derecho o invertidas":"Desactivado: todas al derecho"}</small></button></div></>}
  {tarotStep==="reading"&&spreadDefinition&&<AnimatedTarotDeal key={`${spreadDefinition.name}-${dealKey}-${includeReversed}`} spread={spreadDefinition} dealKey={dealKey} includeReversed={includeReversed} onReplay={()=>setDealKey(current=>current+1)} onMoreQuestions={onBack}/>} 
 </section>
}

type OracleCard={id:string;name:string;image:string;theme:string;message:string;detail:string};
type OracleSystemKey="zen"|"angels"|"animals";
type OracleReadingGroup={title:string;icon:string;items:TarotSpreadDefinition[]};
type OracleSystemConfig={key:OracleSystemKey;title:string;subtitle:string;introduction:string;groups:OracleReadingGroup[];cards:OracleCard[]};
const completeOracleReadingMenu:OracleReadingGroup[]=tarotSpreadGroups.map(group=>({
 title:group.title,
 icon:group.icon,
 items:group.items.map(name=>classicSpreadByName.get(name)).filter((item):item is TarotSpreadDefinition=>Boolean(item))
}));
const oracleSystems:Record<OracleSystemKey,OracleSystemConfig>={
 zen:{key:"zen",title:"ZEN",subtitle:"CONCIENCIA · PRESENCIA · INTEGRACIÓN",introduction:"ZEN es un desarrollo original de Speculum Animae, inspirado en las enseñanzas de Osho y en la tradición contemplativa del Zen. Fue creado para transmitir la integración del cosmos con uno mismo: sus imágenes invitan a observar la conciencia, reconocer nuestros vínculos con el entorno y responder al presente desde una visión más amplia e integrada.",cards:oshoZenReference.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.group} · ${card.phase}`,message:card.message,detail:`${card.question} ${card.action}`})),groups:completeOracleReadingMenu},
 angels:{key:"angels",title:"Ángeles",subtitle:"ORIENTACIÓN · PROTECCIÓN · ACCIÓN",introduction:"Ángeles es una baraja original desarrollada por Speculum Animae a partir del simbolismo de mensajeros y figuras protectoras presente en distintas tradiciones. Su propósito es orientarnos, ayudarnos a reconocer aquello que necesita cuidado y ofrecer mensajes de protección, límites y acciones conscientes.",cards:angelCatalog.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.role} · ${card.family}`,message:card.message,detail:`${card.attribute}. ${card.keys.join(", ")}. Tradición de referencia: ${card.tradition}.`})),groups:completeOracleReadingMenu},
 animals:{key:"animals",title:"Animales de Poder",subtitle:"INSTINTO · RECURSO · ACCIÓN",introduction:"Animales de Poder es una creación original de Speculum Animae inspirada en las cualidades que distintas culturas han reconocido en el mundo animal. Cada carta funciona como un espejo simbólico para descubrir fortalezas, instintos, formas de adaptación y recursos personales que pueden convertirse en respuestas prácticas.",cards:powerAnimals.map(card=>({id:card.id,name:card.name,image:card.image,theme:card.meaning,message:card.message,detail:`Su cualidad es ${card.meaning.toLowerCase()}. Observa dónde puedes aplicarla de manera concreta.`})),groups:completeOracleReadingMenu}
};

function OracleSystemSite({system,onBack}:{system:OracleSystemKey;onBack:()=>void}){
 const config=oracleSystems[system];
 const [step,setStep]=useState<"menu"|"shuffle"|"reading">("menu"),[selected,setSelected]=useState<TarotSpreadDefinition|null>(null),[phase,setPhase]=useState<"idle"|"shuffling">("idle"),[dealKey,setDealKey]=useState(0);
 function choose(reading:TarotSpreadDefinition){setSelected(reading);setPhase("idle");setStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function shuffle(){if(phase==="idle"){setPhase("shuffling");return}setDealKey(value=>value+1);setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site oracle-system-site oracle-${system} tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?"← Volver al Inicio":"← Elegir otra lectura"}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>{config.title}</h1><span>{config.subtitle}</span><p className="system-introduction">{config.introduction}</p></div><section className="spread-menu-section"><span className="mini-label">ELIGE EL ENFOQUE</span><div className="spread-category-grid">{config.groups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.title}><summary><span className="spread-symbol"><i>{group.icon}</i></span><div><b>{group.title}</b><small>{group.items.length} lecturas</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>choose(item)} key={item.name}>{item.name}<span>→</span></button>)}</div></details>)}</div></section></>}
  {step==="shuffle"&&selected&&<><div className="tarot-classic-head"><h1>{selected.name}</h1></div><div className="tarot-shuffle-stage oracle-shuffle-stage"><div className="deck-touch-area"><div className={`animated-deck ${phase}`} role="button" tabIndex={0} onClick={shuffle} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();shuffle()}}}>{Array.from({length:9},(_,index)=><div className="shuffle-card" key={index}><img src={config.cards[(index*7)%config.cards.length].image} alt=""/></div>)}</div></div><div className="shuffle-guidance"><p>{phase==="shuffling"?"Concéntrate en lo que quieres saber. Toca de nuevo para parar.":"Antes de tocar las cartas, concéntrate en lo que quieres saber."}</p></div><div className="oracle-method-note"><b>{config.title}</b><small>{config.subtitle}</small></div></div></>}
  {step==="reading"&&selected&&<AnimatedOracleDeal key={`${system}-${selected.name}-${dealKey}`} config={config} reading={selected} dealKey={dealKey} onReplay={()=>setDealKey(value=>value+1)} onMoreQuestions={onBack}/>} 
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

function RuneSystemSite({onBack}:{onBack:()=>void}){
 const [step,setStep]=useState<"menu"|"shuffle"|"reading">("menu"),[selected,setSelected]=useState<RuneSpread|null>(null),[phase,setPhase]=useState<"idle"|"shuffling">("idle"),[dealKey,setDealKey]=useState(0);
 function choose(reading:RuneSpread){setSelected(reading);setPhase("idle");setStep("shuffle");window.scrollTo({top:0,behavior:"smooth"})}
 function touchBag(){if(phase==="idle"){setPhase("shuffling");return}setDealKey(value=>value+1);setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");window.scrollTo({top:0,behavior:"smooth"})}
 return <section className={`tarot-classic-site ancient-system-site rune-system-site tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?"← Volver al Inicio":"← Elegir otra tirada"}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>Runas</h1><span>ELDER FUTHARK · 24 RUNAS</span><p className="system-introduction">Las runas fueron signos de los antiguos alfabetos germánicos; el Elder Futhark, documentado desde los primeros siglos de nuestra era, es su forma más antigua conocida. Hoy pueden emplearse como lenguaje simbólico para examinar fuerzas, límites, decisiones y posibles consecuencias, sin confundir esta práctica contemporánea con el uso histórico de las inscripciones.</p></div><section className="spread-menu-section rune-menu"><span className="mini-label">ELIGE EL ENFOQUE</span><div className="spread-category-grid">{runeReadingGroups.map((group,index)=><details className={`spread-group-${index+1}`} key={group.title}><summary><span className="spread-symbol"><i>{group.icon}</i></span><div><b>{group.title}</b><small>{group.items.length} tiradas</small></div><em>+</em></summary><div className="spread-options">{group.items.map(item=><button onClick={()=>choose(item)} key={item.id}><span><strong>{item.name}</strong><small>{item.description}</small></span><b>→</b></button>)}</div></details>)}</div></section></>}
  {step==="shuffle"&&selected&&<><div className="tarot-classic-head"><h1>{selected.name}</h1><p>{selected.description}</p></div><div className="ancient-preparation rune-preparation"><p className="rune-shuffle-guidance">Antes de tocar la bolsa de las Runas, concéntrate en qué quieres saber.</p><div className={`rune-bag ${phase}`} role="button" tabIndex={0} aria-label={phase==="shuffling"?"Toca de nuevo para tomar las runas":"Toca la bolsa para mezclar las runas"} onClick={touchBag} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();touchBag()}}}><img className="rune-bag-photo" src="/oracles/runes/felt-rune-bag-purple.png" alt="Bolsa morada abierta de paño para las runas"/>{runeMeanings.slice(0,9).map((rune,index)=><i style={{"--i":index} as CSSProperties} key={rune.name}>{rune.symbol}</i>)}</div></div></>}
  {step==="reading"&&selected&&<RuneReadingStage key={`${selected.id}-${dealKey}`} spread={selected} dealKey={dealKey} onReplay={()=>setDealKey(value=>value+1)} onMoreQuestions={onBack}/>} 
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

function RuneReadingStage({spread,dealKey,onReplay,onMoreQuestions}:{spread:RuneSpread;dealKey:number;onReplay:()=>void;onMoreQuestions:()=>void}){
 const drawn=useMemo(()=>pickUnique(runeMeanings,spread.positions.length),[spread.id,dealKey]),reading=useMemo(()=>interpretRuneSpread(spread,drawn),[spread,drawn]),points=runeLayoutPoints(spread),[showDetails,setShowDetails]=useState(false);
 const runeCards=useMemo(()=>drawn.map((rune,index)=>({num:index+1,label:spread.positions[index].label,card:rune.name,reversed:false})),[drawn,spread.positions]);
 const {interpretation:aiInterpretation,isLoading,error}=useAIInterpretation({discipline:"runes",spread:spread.name,cards:runeCards});
 const aiSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);
 return <><div className="tarot-reading-title"><h1>{spread.name}</h1><span>{spread.positions.length} RUNA{spread.positions.length===1?"":"S"}</span></div><section className="ancient-reading-shell rune-reading-shell"><div className="spread-table-heading"><button onClick={onReplay}>Extraer de nuevo ↻</button></div><div className={`rune-cast-board rune-layout-${spread.layout}`}>{points.map((point,index)=><article className="rune-cast-item" style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties} key={`${drawn[index].id}-${index}`}><RuneToken symbol={drawn[index].symbol} name={drawn[index].name}/><p><b>{index+1}</b><span>{spread.positions[index].label}</span></p></article>)}</div><p className="deal-note">Cada runa se interpreta por su significado y por la función que ocupa en esta tirada.</p><section className="classic-reading ancient-interpretation"><div className="reading-synthesis"><small>MENSAJE E INTERPRETACIÓN</small><h3>{reading.title}</h3>{reading.verdict&&<div className="ancient-verdict">{reading.verdict}</div>}{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>Generando interpretación…</p>:error?<div style={{color:"#d9534f",padding:"1rem",backgroundColor:"rgba(217, 83, 79, 0.1)",borderRadius:"4px"}}><p><strong>Error:</strong> {error}</p></div>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map(section=><article key={section.id}><h4>{section.title}</h4><p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>:<div className="reading-output-sections">{reading.sections.map(section=><article key={section.id}><h4>{section.title}</h4><p dangerouslySetInnerHTML={{__html:markdownToHtml(section.body)}}/></article>)}</div>}{!isLoading&&!error&&aiSections.length===0&&reading.showWarning&&<div className="combination-warnings"><strong>{reading.warningTitle}</strong><p>{reading.caution}</p></div>}{!isLoading&&!error&&aiSections.length===0&&reading.showAdvice&&<p className="protective-close encouragement"><strong>{reading.adviceTitle}</strong><span>{reading.advice}</span></p>}</div><button className="more-reading-button" onClick={()=>setShowDetails(value=>!value)}>{showDetails?"Ocultar lectura por runa":"¿Quieres saber más?"}<span>{showDetails?"↑":"↓"}</span></button>{showDetails&&<div className="individual-reading"><span className="mini-label">LECTURA RUNA POR RUNA</span><h2>Cómo actúa cada símbolo</h2><div className="rune-reading-list">{reading.positionAnswers.map((answer,index)=><article key={`${answer.rune.id}-${index}`}><RuneToken symbol={answer.rune.symbol} name={answer.rune.name}/><div><small>{answer.position}</small><h3>{answer.rune.name}</h3><p>{answer.answer}</p><div>{answer.rune.keywords.map(keyword=><b key={keyword}>{keyword}</b>)}</div></div></article>)}</div><button className="more-questions-button" onClick={onMoreQuestions}>¿Más preguntas?<span>→</span></button></div>}</section></section></>
}

function IChingSystemSite({onBack}:{onBack:()=>void}){
 const [step,setStep]=useState<"menu"|"cast"|"reading">("menu"),[selected,setSelected]=useState<IChingConsultation|null>(null),[phase,setPhase]=useState<"idle"|"casting"|"complete">("idle"),[castKey,setCastKey]=useState(0),[castRound,setCastRound]=useState(0),[castLines,setCastLines]=useState<IChingLine[]>([]);
 useEffect(()=>{if(phase!=="casting")return;if(castRound>=6){const timer=window.setTimeout(()=>setPhase("complete"),700);return()=>window.clearTimeout(timer)}const timer=window.setTimeout(()=>setCastRound(value=>value+1),1050);return()=>window.clearTimeout(timer)},[phase,castRound]);
 function choose(item:IChingConsultation){setSelected(item);setPhase("idle");setCastRound(0);setCastLines([]);setCastKey(0);setStep("cast");window.scrollTo({top:0,behavior:"smooth"})}
 function cast(){if(phase!=="idle")return;setCastLines(castIChing());setCastRound(0);setPhase("casting")}
 function revealInterpretation(){if(phase!=="complete")return;setStep("reading");window.scrollTo({top:0,behavior:"smooth"})}
 function menu(){setStep("menu");setPhase("idle");setCastRound(0);setCastLines([]);window.scrollTo({top:0,behavior:"smooth"})}
 const mutatingLineNumbers=castLines.map((line,index)=>line.changing?index+1:0).filter(Boolean),mutatingLineLabel=mutatingLineNumbers.length===1?`La línea ${mutatingLineNumbers[0]} es mutante`:`Las líneas ${mutatingLineNumbers.slice(0,-1).join(", ")} y ${mutatingLineNumbers.at(-1)} son mutantes`;
 return <section className={`tarot-classic-site ancient-system-site iching-system-site tarot-step-${step}`}>
  <button className="system-back" onClick={step==="menu"?onBack:menu}>{step==="menu"?"← Volver al Inicio":"← Elegir otra consulta"}</button>
  {step==="menu"&&<><div className="tarot-menu-title system-intro-title"><h1>I Ching</h1><span>EL LIBRO DE LOS CAMBIOS · 64 HEXAGRAMAS</span><p className="system-introduction">El I Ching es un antiguo clásico chino formado a lo largo de siglos a partir de tradiciones de consulta y reflexión filosófica. Sus 64 hexagramas describen estados de cambio; al relacionar la figura principal, sus líneas mutantes y el resultado, ayuda a comprender el momento, sus condiciones y la respuesta más adecuada.</p><p className="system-introduction iching-method-introduction">I Ching se hace con una pregunta clara en la mente y el lanzamiento de tres monedas seis veces. Cada tirada suma los valores de las monedas (cara o cruz) para formar una línea, construyendo de abajo hacia arriba un hexagrama de seis líneas que revela el consejo del oráculo.</p></div><section className="iching-consultation-menu"><span className="mini-label">ELIGE EL TIPO DE CONSULTA</span><div>{ichingConsultations.map((item,index)=><button onClick={()=>choose(item)} key={item.id}><span>{String(index+1).padStart(2,"0")}</span><div><b>{item.name}</b><small>{item.description}</small></div><em>→</em></button>)}</div></section></>}
  {step==="cast"&&selected&&<><div className="tarot-classic-head"><h1>{selected.name}</h1><p>{selected.description}</p></div><div className="ancient-preparation iching-preparation"><p className="iching-cast-guidance">Antes de tocar las monedas, concéntrate en lo que quieres saber.</p><div className="iching-cast-stage"><div className={`coin-cast ${phase}`} role="button" tabIndex={phase==="idle"?0:-1} onClick={cast} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();cast()}}} aria-label={phase==="casting"?`Lanzamiento ${Math.min(castRound+1,6)} de seis en curso`:phase==="complete"?"Los seis lanzamientos han terminado":"Toca las monedas para comenzar"}>{Array.from({length:3},(_,index)=><i style={{"--i":index} as CSSProperties} key={`${castRound}-${index}`}><img src="/oracles/iching/antique-cash-coin.png" alt=""/></i>)}</div><div className={`iching-evolution-board ${phase}`}><div className="iching-line-builder primary" aria-label={`${castRound} de seis líneas formadas`}>{castLines.slice(0,castRound).map((line,index)=><span style={{"--i":index} as CSSProperties} className={`${line.yang?"yang":"yin"} ${line.changing?"changing":""}`} key={index}>{line.yang?<i/>:<><i/><i/></>}</span>)}</div>{phase==="complete"&&<><span className="evolution-arrow" aria-hidden="true">→</span><div className="iching-line-builder evolved" aria-label="Hexagrama evolucionado">{castLines.map((line,index)=>{const yang=line.changing?!line.yang:line.yang;return <span style={{"--i":index} as CSSProperties} className={`${yang?"yang":"yin"} ${line.changing?"from-changing":""}`} key={index}>{yang?<i/>:<><i/><i/></>}</span>})}</div></>}</div>{phase==="complete"&&<div className="iching-evolution-explanation"><p>El primer hexagrama muestra la situación presente. {mutatingLineNumbers.length?`${mutatingLineLabel}. ${mutatingLineNumbers.length===1?"Ese punto señala":"Esos puntos señalan"} dónde está ocurriendo el cambio; la transformación forma el segundo hexagrama y muestra hacia dónde puede evolucionar la situación.`:"Como no aparecieron líneas mutantes, el consejo permanece concentrado en el hexagrama inicial y pide profundizar en sus condiciones actuales."}</p><button onClick={revealInterpretation}>Ver la interpretación <span>→</span></button></div>}</div></div></>}
  {step==="reading"&&selected&&<IChingReadingStage key={`${selected.id}-${castKey}`} consultation={selected} castKey={castKey} initialLines={castLines} onReplay={()=>setCastKey(value=>value+1)} onMoreQuestions={onBack}/>} 
 </section>
}

function CastHexagram({lines,title}:{lines:IChingLine[];title:string}){
 return <div className="cast-hexagram" role="img" aria-label={title}><div>{[...lines].reverse().map((line,index)=><span className={`${line.yang?"yang":"yin"} ${line.changing?"changing":""}`} key={index}>{line.yang?<i/>:<><i/><i/></>}{line.changing&&<b>×</b>}</span>)}</div></div>
}

function IChingReadingStage({consultation,castKey,initialLines,onReplay,onMoreQuestions}:{consultation:IChingConsultation;castKey:number;initialLines:IChingLine[];onReplay:()=>void;onMoreQuestions:()=>void}){
 const lines=useMemo(()=>castKey===0&&initialLines.length===6?initialLines:castIChing(),[consultation.id,castKey,initialLines]),reading=useMemo(()=>interpretIChing(consultation,lines),[consultation,lines]),[showDetails,setShowDetails]=useState(false),resultLines=lines.map(line=>({...line,yang:line.changing?!line.yang:line.yang,changing:false}));
 const iChingCards=useMemo(()=>[{num:1,label:"Hexagrama principal",card:reading.primary.name,reversed:false},{num:2,label:"Hexagrama resultante",card:reading.transformed.name,reversed:false}],[reading.primary.name,reading.transformed.name]);
 const {interpretation:aiInterpretation,isLoading,error}=useAIInterpretation({discipline:"iching",spread:consultation.name,cards:iChingCards});
 const aiSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);
 return <><div className="tarot-reading-title"><h1>{consultation.name}</h1><span>I CHING · SEIS LÍNEAS</span></div><section className="ancient-reading-shell iching-reading-shell"><div className="spread-table-heading"><button onClick={onReplay}>Consultar de nuevo ↻</button></div><div className="iching-transformation"><article><CastHexagram lines={lines} title="Hexagrama principal"/><div className="iching-card-caption"><small>{reading.primary.number}</small><h2>{reading.primary.name}</h2></div></article><div className="transformation-arrow"><span>→</span><small>{reading.changingLines.length?`${reading.changingLines.length} línea${reading.changingLines.length===1?"":"s"} mutante${reading.changingLines.length===1?"":"s"}`:"sin mutación"}</small></div><article><CastHexagram lines={resultLines} title="Hexagrama resultante"/><div className="iching-card-caption"><small>{reading.transformed.number}</small><h2>{reading.transformed.name}</h2></div></article></div><section className="classic-reading ancient-interpretation"><div className="reading-synthesis"><small>MENSAJE E INTERPRETACIÓN</small><h3>{consultation.id==="reasoned"?"Respuesta razonada":"El movimiento de la consulta"}</h3>{consultation.id==="reasoned"&&<div className="ancient-verdict">{reading.verdict}</div>}<p>{reading.summary}</p>{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>Generando interpretación…</p>:error?<div style={{color:"#d9534f",padding:"1rem",backgroundColor:"rgba(217, 83, 79, 0.1)",borderRadius:"4px"}}><p><strong>Error:</strong> {error}</p></div>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map(section=><article key={section.id}><h4>{section.title}</h4><p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>:<div className="reading-output-sections">{reading.sections.map(section=><article key={section.id}><h4>{section.title}</h4><p>{section.body}</p></article>)}</div>}{!isLoading&&!error&&aiSections.length===0&&reading.showWarning&&<div className="combination-warnings"><strong>{reading.warningTitle}</strong><p>{reading.caution}</p></div>}{!isLoading&&!error&&aiSections.length===0&&reading.showAdvice&&<p className="protective-close encouragement"><strong>{reading.adviceTitle}</strong><span>{reading.advice}</span></p>}</div><button className="more-reading-button" onClick={()=>setShowDetails(value=>!value)}>{showDetails?"Ocultar detalles del cambio":"¿Quieres saber más?"}<span>{showDetails?"↑":"↓"}</span></button>{showDetails&&<div className="individual-reading iching-details"><span className="mini-label">ESTRUCTURA INTERNA</span><h2>Qué sostiene el movimiento</h2><div className="iching-nuclear-detail"><HexagramDiagram pattern={reading.nuclear.pattern} name={reading.nuclear.name}/><div><small>HEXAGRAMA NUCLEAR {reading.nuclear.number}</small><h3>{reading.nuclear.name}</h3><p>{getIChingCounsel(reading.nuclear.number)}</p></div></div><div className="iching-line-detail"><h3>Líneas mutantes</h3>{reading.changingLines.length?reading.changingLines.map(number=><p key={number}><b>Línea {number}.</b> Esta fase modifica la lectura y participa en la formación de {reading.transformed.name}.</p>):<p>El hexagrama no presenta líneas mutantes. Profundiza en su consejo antes de formular una nueva consulta.</p>}</div><button className="more-questions-button" onClick={onMoreQuestions}>¿Más preguntas?<span>→</span></button></div>}</section></section></>
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

function AnimatedTarotDeal({spread,dealKey,includeReversed,onReplay,onMoreQuestions}:{spread:TarotSpreadDefinition;dealKey:number;includeReversed:boolean;onReplay:()=>void;onMoreQuestions:()=>void}){
 const cards=useMemo(()=>pickUnique(tarot,spread.positions.length).map(card=>({...card,isReversed:includeReversed&&secureIndex(3)===0})),[spread.name,dealKey,includeReversed]);
 const [showCardDetails,setShowCardDetails]=useState(false);
 const points=dealPoints(spread.layout,spread.positions.length);
 const gap=.96;
 const aiCards=useMemo(()=>toAICards(spread.positions,cards),[spread.positions,cards]);
 console.log("🎲 AnimatedTarotDeal: about to call useAIInterpretation with:", {spreadName: spread.name, aiCardsLength: aiCards.length});
 const {interpretation,isLoading,error}=useAIInterpretation({discipline:"tarot",spread:spread.name,cards:aiCards});
 const aiSections=useMemo(()=>parseAIInterpretation(interpretation||""),[interpretation]);
 const readingCategory=/amor|relación|pareja|persona nueva|reconciliación/i.test(spread.name)?"Amor y relaciones":/trabajo|empleo|negocio|económico|recursos/i.test(spread.name)?"Trabajo y dinero":/decisión|camino|actúo|semáforo/i.test(spread.name)?"Decisiones":/sombra|emocional|propósito|chakra|ciclo|herida/i.test(spread.name)?"Desarrollo personal":"Consulta general";
 const readingAnalysis=useMemo(()=>analyzeTarotReading({spread:spread.name,positions:spread.positions,cards,category:readingCategory,orientationEnabled:includeReversed,drawId:`${spread.name}:${dealKey}:${cards.map(card=>`${card.id}-${card.isReversed?"r":"u"}`).join("|")}`}),[spread.name,spread.positions,cards,readingCategory,dealKey,includeReversed]);
 const editorial=useMemo(()=>buildTarotEditorialOutput(readingAnalysis,cards),[readingAnalysis,cards]);
 const storyParagraphs=editorial.story;
 const readingSections=editorial.sections?.length?editorial.sections:storyParagraphs.map((body:string,index:number)=>({id:`paragraph-${index}`,title:"",body}));
 const guidance=editorial;
 return <><div className="tarot-reading-title"><h1>{spread.name}</h1><span>{spread.positions.length} CARTAS</span></div><section className={`animated-spread-table layout-${spread.layout}`} style={{"--deal-gap":`${gap}s`,"--deal-duration":"1.08s"} as CSSProperties} aria-label={`Tirada ${spread.name}`}>
  <div className="spread-table-heading"><button onClick={onReplay}>Repartir de nuevo ↻</button></div>
  <div className="felt-table"><div className="source-deck" aria-hidden="true"/><div className="table-ornament" aria-hidden="true"/>
   {points.map((point,index)=>{const style={"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties;return <div className={`dealt-card-slot slot-${index+1} ${cards[index]?.isReversed?"is-reversed":""}`} style={style} key={`card-${dealKey}-${index}`}><div className="dealt-card"><img src={cards[index]?.image} alt={`${cards[index]?.name||`Carta ${index+1}`}${cards[index]?.isReversed?", invertida":""}`}/></div><p><b>{index+1}</b><span>{spread.positions[index]}{cards[index]?.isReversed?" · Invertida":""}</span></p></div>})}
   {points.map((point,index)=>{const sway=index%2?1:-1;const style={"--x":`${point.x}%`,"--y":`${point.y}%`,"--approach-x":`${Math.min(94,point.x+2)}%`,"--approach-y":`${Math.max(6,point.y-3)}%`,"--retreat-x":`${point.x+sway}%`,"--retreat-y":`${Math.max(3,point.y-7)}%`,"--r":`${point.r||0}deg`,"--i":index,"--tilt":`${sway*1.2}deg`,"--tilt-wide":`${sway*3}deg`,"--tilt-opposite":`${sway*-2}deg`} as CSSProperties;return <div className="dealing-visit" style={style} key={`hand-${dealKey}-${index}`} aria-hidden="true"><div className="carried-card"/><img src="/cards/rider-classic/dealing-hand-v3.png" alt=""/></div>})}
  </div><p className="deal-note">Las cartas se colocan en el orden tradicional de esta tirada.</p>
  <section className="classic-reading" style={{"--reading-delay":`${spread.positions.length*gap+.7}s`} as CSSProperties}><div className={`reading-synthesis output-${editorial.outputStrategy?.toLowerCase()||"reading"}`}><small>MENSAJE E INTERPRETACIÓN</small><h3>{editorial.title||"La historia que cuentan tus cartas"}</h3>{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>Generando interpretación…</p>:error?<div style={{color:"#d9534f",padding:"1rem",backgroundColor:"rgba(217, 83, 79, 0.1)",borderRadius:"4px"}}><p><strong>Error:</strong> {error}</p></div>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p dangerouslySetInnerHTML={{__html:item.body}}/></article>)}</div>:<div className="reading-output-sections">{readingSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p>{item.body}</p></article>)}</div>}{!isLoading&&!error&&aiSections.length===0&&guidance.showWarning&&<div className="combination-warnings"><strong>{guidance.warningTitle}</strong><p>{guidance.caution}</p></div>}{!isLoading&&!error&&aiSections.length===0&&guidance.showAdvice&&<p className="protective-close encouragement"><strong>{guidance.adviceTitle}</strong><span>{guidance.advice}</span></p>}</div><button type="button" className="more-reading-button" aria-expanded={showCardDetails} onClick={()=>setShowCardDetails(value=>!value)}>{showCardDetails?"Ocultar significado por carta":"¿Quieres saber más?"}<span>{showCardDetails?"↑":"↓"}</span></button>{showCardDetails&&<div className="individual-reading"><span className="mini-label">LECTURA CARTA POR CARTA</span><h2>El significado de cada carta</h2><p className="reading-intro">Cada carta se interpreta de acuerdo con el lugar que ocupa en la tirada.</p><div className="classic-reading-list">{cards.map((card,index)=><article className={card.isReversed?"is-reversed":""} key={`${card.id}-${index}`}><span>{index+1}</span><img className="reading-card-image" src={card.image} alt={`${card.name}, carta ${card.isReversed?"invertida":"al derecho"} en la posición ${spread.positions[index]}`}/><div><small>{spread.positions[index]}{card.isReversed?" · INVERTIDA":""}</small><h3>{card.name}</h3><p>{card.isReversed?card.reversed:card.general} {card.advice}</p><div>{card.keys.slice(0,3).map(key=><b key={key}>{key}</b>)}</div></div></article>)}</div><button type="button" className="more-questions-button" onClick={onMoreQuestions}>¿Más preguntas?<span>→</span></button></div>}</section>
 </section></>
}

function AnimatedOracleDeal({config,reading,dealKey,onReplay,onMoreQuestions}:{config:OracleSystemConfig;reading:TarotSpreadDefinition;dealKey:number;onReplay:()=>void;onMoreQuestions:()=>void}){
 const cards=useMemo(()=>pickUnique(config.cards,reading.positions.length),[config.key,reading.name,dealKey]);
 const [showDetails,setShowDetails]=useState(false),points=dealPoints(reading.layout,reading.positions.length),gap=.88;
 const oracleCards=useMemo(()=>cards.map((card,index)=>({num:index+1,label:reading.positions[index],card:card.name,reversed:false})),[cards,reading.positions]);
 const disciplineMap={zen:"oracle-zen",angels:"oracle-angels",animals:"oracle-animals"} as Record<string,any>;
 const {interpretation,isLoading,error}=useAIInterpretation({discipline:disciplineMap[config.key]||"oracle-zen",spread:reading.name,cards:oracleCards});
 const aiSections=useMemo(()=>parseAIInterpretation(interpretation||""),[interpretation]);
 const editorial=useMemo(()=>buildOracleEditorialOutput({system:config.key,spread:reading,cards,drawId:`${config.key}:${reading.name}:${dealKey}:${cards.map(card=>card.id).join("|")}`}),[config.key,reading,cards,dealKey]);
 const readingSections=editorial.sections?.length?editorial.sections:[];
 return <><div className="tarot-reading-title"><h1>{reading.name}</h1><span>{reading.positions.length} CARTAS · {config.title.toUpperCase()}</span></div><section className={`animated-spread-table oracle-spread layout-${reading.layout}`} style={{"--deal-gap":`${gap}s`,"--deal-duration":"1.08s"} as CSSProperties}>
  <div className="spread-table-heading"><button onClick={onReplay}>Repartir de nuevo ↻</button></div><div className="felt-table"><div className="source-deck"/><div className="table-ornament"/>
  {points.map((point,index)=><div className={`dealt-card-slot slot-${index+1}`} style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--r":`${point.r||0}deg`,"--i":index} as CSSProperties} key={`oracle-card-${dealKey}-${index}`}><div className="dealt-card"><img src={cards[index]?.image} alt={cards[index]?.name}/></div><p><b>{index+1}</b><span>{reading.positions[index]}</span></p></div>)}
  {points.map((point,index)=>{const sway=index%2?1:-1;return <div className="dealing-visit" style={{"--x":`${point.x}%`,"--y":`${point.y}%`,"--approach-x":`${Math.min(94,point.x+2)}%`,"--approach-y":`${Math.max(6,point.y-3)}%`,"--retreat-x":`${point.x+sway}%`,"--retreat-y":`${Math.max(3,point.y-7)}%`,"--r":`${point.r||0}deg`,"--i":index,"--tilt":`${sway*1.2}deg`,"--tilt-wide":`${sway*3}deg`,"--tilt-opposite":`${sway*-2}deg`} as CSSProperties} key={`oracle-hand-${dealKey}-${index}`}><div className="carried-card"/><img src="/cards/rider-classic/dealing-hand-v3.png" alt=""/></div>})}</div>
  <section className="classic-reading" style={{"--reading-delay":`${reading.positions.length*gap+.7}s`} as CSSProperties}><div className={`reading-synthesis output-${editorial.outputStrategy.toLowerCase()}`}><small>MENSAJE E INTERPRETACIÓN</small><h3>{editorial.title}</h3>{isLoading?<p style={{fontStyle:"italic",opacity:.7,minHeight:"100px",display:"flex",alignItems:"center"}}>Generando interpretación…</p>:error?<div style={{color:"#d9534f",padding:"1rem",backgroundColor:"rgba(217, 83, 79, 0.1)",borderRadius:"4px"}}><p><strong>Error:</strong> {error}</p></div>:aiSections.length>0?<div className="reading-output-sections">{aiSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p dangerouslySetInnerHTML={{__html:item.body}}/></article>)}</div>:<div className="reading-output-sections">{readingSections.map((item:{id:string;title:string;body:string})=><article key={item.id}>{item.title&&<h4>{item.title}</h4>}<p>{item.body}</p></article>)}</div>}{!isLoading&&!error&&aiSections.length===0&&editorial.showWarning&&<div className="combination-warnings"><strong>{editorial.warningTitle}</strong><p>{editorial.caution}</p></div>}{!isLoading&&!error&&aiSections.length===0&&editorial.showAdvice&&<p className="protective-close encouragement"><strong>{editorial.adviceTitle}</strong><span>{editorial.advice}</span></p>}</div><button className="more-reading-button" onClick={()=>setShowDetails(value=>!value)}>{showDetails?"Ocultar significado por carta":"¿Quieres saber más?"}<span>{showDetails?"↑":"↓"}</span></button>{showDetails&&<div className="individual-reading"><span className="mini-label">LECTURA CARTA POR CARTA</span><h2>El significado de cada carta</h2><p className="reading-intro">Cada mensaje cambia de función según el lugar que ocupa en la lectura.</p><div className="classic-reading-list">{cards.map((card,index)=>{const answer=editorial.positionAnswers[index];return <article key={`${card.id}-${index}`}><span>{index+1}</span><img className="reading-card-image" src={card.image} alt={`${card.name}, ${reading.positions[index]}`}/><div><small>{reading.positions[index]}</small><h3>{card.name}</h3><p>{answer?.answer||card.message} {answer?.detail||card.detail}</p><div><b>{card.theme}</b></div></div></article>})}</div><button className="more-questions-button" onClick={onMoreQuestions}>¿Más preguntas?<span>→</span></button></div>}</section>
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
  {site.slug==="radiestesia"&&<><h2 className="subhead first">Péndulo y tablero</h2><p className="collection-note">Herramienta simbólica de observación; no constituye un método de diagnóstico.</p><div className="radiesthesia-library"><article><img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt="Péndulo de plata con testigo sostenido por una mano"/><div><small>INSTRUMENTO</small><h3>Péndulo de plata con testigo</h3><p>Sostén el extremo de la cadena sin tensión y deja el péndulo suspendido.</p></div></article><article className="radiesthesia-board-card"><img src="/oracles/pendulum/radiesthesia-board.svg" alt="Tablero semicircular de radiestesia"/><div><small>TABLERO</small><h3>Respuesta e intensidad</h3><p>Siete respuestas graduadas, escala de 0 a 100 y punto de inicio.</p><a href="/oracles/pendulum/radiesthesia-board.svg" download>Descargar tablero para imprimir</a></div></article></div></>}
  {site.slug==="chamalongos"&&<><h2 className="subhead first">Referencia cultural</h2><p className="collection-note sacred-note">Las denominaciones y lecturas varían entre ramas y casas. Esta síntesis no enseña consagraciones ni sustituye a una persona iniciada.</p><h3 className="collection-variant-title">Versión 1 · Cáscaras de coco</h3><ChamalongoGrid normalized="" version="coconut"/><h3 className="collection-variant-title">Versión 2 · Caracoles tigre</h3><ChamalongoGrid normalized="" version="cowrie"/></>}
  {site.slug==="kabbalah"&&<><h2 className="subhead first">Los 72 Nombres de Dios · tripletes hebreos</h2><p className="collection-note sacred-note">Referencia textual de los tripletes derivados de Éxodo 14:19–21, sin asignaciones terapéuticas ni predictivas añadidas.</p><div className="divine-names-grid metal-engraving" dir="rtl">{divineNames72.map(item=><article key={item.number}><small>{item.number}</small><b lang="he">{item.hebrew}</b></article>)}</div><h2 className="subhead">Árbol de la Vida · 10 sefirot y 22 senderos</h2><div className="tree-study metal-tree-study"><div className="tree-canvas" aria-label="Árbol de la Vida"><TreeConnections/>{sefirot.map((item,index)=><div className={`sefirah-node node-${index+1}`} key={item.number}><b lang="he">{item.hebrew}</b><span>{item.name}</span><small>{item.gloss}</small></div>)}</div><div className="tree-details"><h3>Los 22 senderos</h3><div className="path-grid">{treePaths.map(path=><article key={path.number}><small>{path.number}</small><b lang="he">{path.hebrew}</b><span>{path.name}</span></article>)}</div></div></div></>}
 </section>
}

function App(){
 const [view,setView]=useState("Inicio"),[lang,setLang]=useState<"ES"|"EN"|"FR"|"DE">("ES"),[category,setCategory]=useState(categories[0]),[question,setQuestion]=useState(""),[context,setContext]=useState(""),[stage,setStage]=useState(1),[method,setMethod]=useState<Method>("tarot"),[spread,setSpread]=useState<keyof typeof spreads>("three"),[useReversed,setUseReversed]=useState(true),[results,setResults]=useState<Result[]>([]),[selectedMethods,setSelectedMethods]=useState<Method[]>(["tarot","runes","iching"]),[name,setName]=useState(""),[birth,setBirth]=useState(""),[history,setHistory]=useState<SavedReading[]>([]),[query,setQuery]=useState(""),[debug,setDebug]=useState(false),[toast,setToast]=useState("");
 const [menuOpen,setMenuOpen]=useState(false);
 const [systemSlug,setSystemSlug]=useState("tarot");
 const [homeImageSeed,setHomeImageSeed]=useState(0);
 useEffect(()=>{try{setHistory(JSON.parse(localStorage.getItem("oraculo_history")||"[]"))}catch{}},[]);
 useEffect(()=>{setHomeImageSeed(secureIndex(1000000))},[]);
 useEffect(()=>{const sync=()=>setView(routeViews[location.hash.slice(1)]||"Inicio");sync();addEventListener("hashchange",sync);addEventListener("popstate",sync);return()=>{removeEventListener("hashchange",sync);removeEventListener("popstate",sync)}},[]);
 const analyst=useMemo(()=>analyze(results),[results]);
 const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(""),2200)};
 function navigate(next:string){setView(next);setMenuOpen(false);const route=viewRoutes[next];if(route&&location.hash!==route.split("#")[1])window.history.pushState(null,"",route)}
 function openService(service:ServiceDefinition){if(service.status==="COMING_SOON"){notify(`${service.name} estará disponible próximamente`);return}if(service.method)setMethod(service.method);reset();navigate("Consulta")}
 function reset(){setStage(1);setResults([]);setQuestion("");setContext("")}
 function generate(methods=selectedMethods){if(!question.trim()){notify("Escribe una pregunta para comenzar");return}const out:Result[]=[];for(const m of methods){if(m==="tarot")out.push(buildTarot(question,context,category,spread,useReversed));if(m==="runes")out.push(buildRunes(question));if(m==="iching")out.push(buildIChing(question));if(m==="angels")out.push(buildAngels(question,context,category));if(m==="numerology"&&name&&birth)out.push(buildNumerology(name,birth))}setResults(out);setStage(4)}
 function reportText(){return `SPECULUM ANIMAE — REPORTE\n${new Date().toLocaleString()}\n\nPREGUNTA\n${question}\n\nCONTEXTO\n${context||"No proporcionado"}\n\nMÉTODOS\n${results.map(r=>r.title).join(" · ")}\n\nRESULTADOS\n${results.map(r=>`${r.title}\n${r.interpretation}`).join("\n\n")}\n\nANALYST\nTema central: ${analyst.central}\nCoincidencias: ${analyst.matches}\nTensiones: ${analyst.differences}\nConsejo: ${analyst.advice.join(" ")}\nConfianza interpretativa: ${analyst.confidence}\n\nEsta interpretación es simbólica y no constituye un hecho comprobado.`}
 function save(){const item:SavedReading={id:crypto.randomUUID?.()||String(Date.now()),date:new Date().toISOString(),question,category,methods:results.map(r=>r.method),results,report:reportText(),reviewStatus:"AI_GENERATED"};const next=[item,...history];setHistory(next);localStorage.setItem("oraculo_history",JSON.stringify(next));notify("Consulta guardada en este dispositivo")}
 function download(){const blob=new Blob([`<!doctype html><meta charset="utf-8"><title>Reporte Speculum Animae</title><style>body{font:16px system-ui;max-width:760px;margin:40px auto;line-height:1.6;white-space:pre-wrap;color:#241b30}</style>${reportText().replace(/&/g,"&amp;").replace(/</g,"&lt;")}`],{type:"text/html"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="speculum-animae-reporte.html";a.click();URL.revokeObjectURL(a.href)}
 const dailyNow=new Date(), daily=tarot[(dailyNow.getUTCFullYear()*372+dailyNow.getUTCMonth()*31+dailyNow.getUTCDate())%tarot.length];
 return <main>
  <header className="site-header"><span className="header-balance" aria-hidden="true"/><div className="header-actions"><label className="language-menu"><span className="sr-only">Idioma</span><select value={lang} onChange={event=>setLang(event.target.value as "ES"|"EN"|"FR"|"DE")} aria-label="Seleccionar idioma"><option value="ES">Español</option><option value="EN">English</option><option value="FR">Français</option><option value="DE">Deutsch</option></select></label><button className="menu-toggle" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={()=>setMenuOpen(x=>!x)}>{menuOpen?"×":"☰"}</button><nav className={menuOpen?"open":""}>{nav.map(n=><button key={n} className={view===n?"active":""} onClick={()=>navigate(n)}>{n}</button>)}</nav></div></header>
  {view==="Inicio"&&<>
   <section className="home-disciplines"><div className="home-disciplines-head"><span className="mini-label">MENÚ DE DISCIPLINAS</span><h1>Explora nuestros sistemas</h1><p>Ésta será la puerta de entrada a cada disciplina. Desarrollaremos sus sitios uno por uno.</p></div><div className="home-discipline-grid">{librarySystems.map(([system])=>{const targets:Record<string,string>={"Tarot":"Tarot Clásico","Tarot Zen":"Tarot Zen","Ángeles":"Ángeles","Animales de Poder":"Animales de Poder","Runas":"Runas","I Ching":"I Ching","Radiestesia":"Radiestesia"};const target=targets[system],appointment=system==="Cita con Madame Meraki",displayName=system==="Tarot"?"Rider":system==="Tarot Zen"?"Zen":system==="Radiestesia"?"Péndulo":system;return <button key={system} className={`${target?"available":""} ${appointment?"appointment-card":""}`} onClick={()=>target?navigate(target):notify(appointment?"La agenda de Madame Meraki estará disponible próximamente":`El sitio de ${system} se trabajará más adelante`)}><span className="home-menu-image"><img src={menuImage(system,homeImageSeed)} alt={`Imagen de ${displayName}`}/></span><span className="home-menu-copy"><b>{displayName}</b><small>{target?"ABRIR SITIO →":appointment?"PRÓXIMAMENTE":"SITIO PENDIENTE"}</small></span></button>})}</div><button className="home-library-link" onClick={()=>navigate("Biblioteca")}>Abrir la Biblioteca completa →</button></section>
  </>}
  {view==="Tarot Clásico"&&<ClassicTarotSite onBack={()=>navigate("Inicio")}/>} 
  {view==="Tarot Zen"&&<OracleSystemSite system="zen" onBack={()=>navigate("Inicio")}/>} 
  {view==="Ángeles"&&<OracleSystemSite system="angels" onBack={()=>navigate("Inicio")}/>} 
  {view==="Animales de Poder"&&<OracleSystemSite system="animals" onBack={()=>navigate("Inicio")}/>} 
  {view==="Runas"&&<RuneSystemSite onBack={()=>navigate("Inicio")}/>}
  {view==="I Ching"&&<IChingSystemSite onBack={()=>navigate("Inicio")}/>}
  {view==="Radiestesia"&&<RadiestesiaSystemSite onBack={()=>navigate("Inicio")}/>}
  {view==="Consulta"&&<section className="workspace"><div className="page-title"><span className="mini-label">CONSULTA GUIADA</span><h1>Conversa con el símbolo</h1><p>El Consultor reúne sólo el contexto necesario antes de la lectura.</p></div><div className="stepper">{["Pregunta","Contexto","Método","Interpretación"].map((s,i)=><div className={stage>=i+1?"done":""} key={s}><span>{stage>i+1?"✓":i+1}</span>{s}</div>)}</div>
   {stage===1&&<div className="panel consult"><div className="consultor"><span>✦</span><div><b>CONSULTOR</b><p>Empecemos por lo que de verdad necesitas mirar.</p></div></div><label>¿Qué quieres saber?<textarea autoFocus value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Escribe tu pregunta con tus propias palabras…"/></label><label>Categoría<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><button className="primary" onClick={()=>question.trim()?setStage(2):notify("Escribe una pregunta para continuar")}>Continuar <span>→</span></button></div>}
   {stage===2&&<div className="panel consult"><div className="consultor"><span>✦</span><div><b>CONSULTOR</b><p>{category.includes("Amor")?"¿Cuál es la situación actual entre ustedes?":"¿Qué situación relevante debemos conocer?"}</p></div></div><label>Contexto breve<textarea value={context} onChange={e=>setContext(e.target.value)} placeholder="Lo necesario para comprender la situación, sin datos sensibles…"/></label><p className="privacy">◉ Esta información permanece en tu dispositivo.</p><div className="actions"><button className="ghost" onClick={()=>setStage(1)}>Atrás</button><button className="primary" onClick={()=>setStage(3)}>Elegir método <span>→</span></button></div></div>}
   {stage===3&&<div className="panel"><h2>Elige el método</h2><div className="method-pills">{(["tarot","runes","iching","numerology","angels"] as Method[]).map(m=><button className={method===m?"selected":""} onClick={()=>setMethod(m)} key={m}>{methodLabels[m]}</button>)}</div>{method==="tarot"&&<div className="options"><label>Tirada<select value={spread} onChange={e=>setSpread(e.target.value as keyof typeof spreads)}><option value="one">Una carta</option><option value="three">Pasado · Presente · Tendencia</option><option value="relationship">Relación</option><option value="decision">Decisión</option><option value="celtic">Cruz Celta</option></select></label><label className="toggle">Usar cartas invertidas <input type="checkbox" checked={useReversed} onChange={e=>setUseReversed(e.target.checked)}/><i/></label></div>}{method==="numerology"&&<div className="two"><label>Nombre completo<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Fecha de nacimiento<input type="date" value={birth} onChange={e=>setBirth(e.target.value)}/></label></div>}<div className="deck-preview"><div className="deck">✦</div><div><h3>Tu selección será única</h3><p>Usamos aleatoriedad criptográfica cuando está disponible y registramos el resultado para poder reproducir la consulta guardada.</p></div></div><button className="primary" onClick={()=>{if(method==="numerology"&&(!name||!birth)){notify("Completa nombre y fecha");return}generate([method])}}>Realizar consulta <span>✦</span></button></div>}
   {stage===4&&<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={reset} debug={debug}/>} 
  </section>}
  {view==="Integral"&&<section className="workspace"><div className="page-title"><span className="mini-label">CONSULTA INTEGRAL</span><h1>Varias miradas, una síntesis</h1><p>Cada método genera su resultado por separado. Analyst los compara sin repetir las tiradas.</p></div>{!results.length?<div className="panel"><label>Tu pregunta<textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="¿Qué deseas comprender?"/></label><label>Categoría<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Contexto<textarea value={context} onChange={e=>setContext(e.target.value)} placeholder="Contexto breve (opcional)"/></label><div className="check-grid">{(["tarot","runes","iching","angels","numerology"] as Method[]).map(m=><label key={m}><input type="checkbox" checked={selectedMethods.includes(m)} onChange={()=>setSelectedMethods(x=>x.includes(m)?x.filter(v=>v!==m):[...x,m])}/><span>{methodLabels[m]}</span><small>{m==="angels"?"Contenido demo":m==="numerology"?"Requiere datos":"Disponible"}</small></label>)}</div>{selectedMethods.includes("numerology")&&<div className="two"><label>Nombre<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Nacimiento<input type="date" value={birth} onChange={e=>setBirth(e.target.value)}/></label></div>}<button className="primary" onClick={()=>generate()}>Generar consulta integral <span>✦</span></button></div>:<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={()=>setResults([])} debug={debug}/>}</section>}
  {view==="Biblioteca"&&<section className="workspace library"><div className="page-title"><span className="mini-label">BIBLIOTECA SIMBÓLICA</span><h1>Aprende el lenguaje de los símbolos</h1><p>Barajas completas, alfabeto rúnico y los 64 símbolos tradicionales del I Ching.</p></div><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="⌕  Buscar carta, runa, hexagrama o palabra clave…"/><h2 className="subhead first">Tarot Rider–Waite–Smith · 78 cartas</h2><div className="library-grid">{tarotCatalog.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())).map(c=>{const content=tarot.find(item=>item.id===c.id);return <article key={c.id}><div className="card-art"><img src={c.image} alt={`Carta ${c.name} de Rider–Waite–Smith`} loading="lazy"/></div><small>{c.arcana} {c.suit?`· ${c.suit}`:""}</small><h3>{c.name}</h3>{content?<><p>{content.general}</p><div>{content.keys.map(k=><span key={k}>{k}</span>)}</div></>:<p className="editorial-pending">Interpretación editorial pendiente de revisión.</p>}</article>})}</div><p className="image-credit">Imágenes de Pamela Colman Smith, edición Rider–Waite de 1909 · Dominio público · Wikimedia Commons.</p><h2 className="subhead">Runas Elder Futhark · 24 fichas de madera</h2><div className="rune-row">{runeCatalog.filter(r=>r.name.toLowerCase().includes(query.toLowerCase())).map(r=>{const content=runeMeanings.find(item=>item.name===r.name);return <article key={r.name}><RuneToken symbol={r.symbol} name={r.name}/><span>{r.name}</span><small>{content?.keywords.join(" · ")}</small></article>})}</div><h2 className="subhead">I Ching · 64 hexagramas</h2><div className="iching-library-grid">{ichingCatalog.filter(h=>(`${h.number} ${h.name}`).toLowerCase().includes(query.toLowerCase())).map(h=><article key={h.number}><HexagramDiagram pattern={h.pattern} name={h.name}/><div><small>HEXAGRAMA {h.number}</small><h3>{h.name}</h3><p>{getIChingCounsel(h.number)}</p></div></article>)}</div><h2 className="subhead">Mensajes de los Ángeles · 44 cartas ilustradas</h2><p className="collection-note">Colección original inspirada en diversas tradiciones. Las atribuciones cambian entre fuentes; cada carta identifica la tradición utilizada.</p><div className="angel-library-grid">{angelCatalog.filter(c=>(`${c.name} ${c.role} ${c.family} ${c.tradition} ${c.attribute} ${c.message} ${c.keys.join(" ")}`).toLowerCase().includes(query.toLowerCase())).map(c=><AngelDeckCard card={c} key={c.id}/>)}</div><ExtendedCollections query={query}/></section>}
  {view==="Diario"&&<Daily daily={daily}/>} 
  {view==="Historial"&&<section className="workspace"><div className="page-title"><span className="mini-label">HISTORIAL LOCAL</span><h1>Tus consultas</h1><p>Se guardan únicamente en este dispositivo.</p></div>{history.length===0?<div className="empty"><span>◌</span><h2>Aún no hay consultas guardadas</h2><p>Guarda un reporte para volver a él más adelante.</p></div>:<><div className="history-list">{history.map(h=><article key={h.id}><div><small>{new Date(h.date).toLocaleString()}</small><h3>{h.question}</h3><p>{h.category} · {h.methods.map(m=>methodLabels[m]).join(", ")}</p></div><button onClick={()=>{setQuestion(h.question);setContext("");setResults(h.results);setView("Integral")}}>Abrir</button><button className="danger" onClick={()=>{const n=history.filter(x=>x.id!==h.id);setHistory(n);localStorage.setItem("oraculo_history",JSON.stringify(n))}}>Eliminar</button></article>)}</div><button className="ghost danger" onClick={()=>{setHistory([]);localStorage.removeItem("oraculo_history")}}>Borrar todo el historial</button></>}</section>}
  {view==="LAB"&&<section className="workspace"><div className="page-title"><span className="mini-label">PANEL INTERNO</span><h1>LAB</h1><p>Prueba módulos y examina sus resultados normalizados.</p></div><div className="lab-grid"><div className="panel"><h2>Generador directo</h2><label>Pregunta<input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Pregunta de laboratorio"/></label><div className="method-pills">{(["tarot","runes","iching","angels"] as Method[]).map(m=><button key={m} onClick={()=>{if(!question)setQuestion("¿Qué necesito observar ahora?");setTimeout(()=>generate([m]),0)}}>{methodLabels[m]}</button>)}</div><label className="toggle">Debug <input type="checkbox" checked={debug} onChange={e=>setDebug(e.target.checked)}/><i/></label></div><div className="panel"><h2>Salida estándar</h2><pre>{JSON.stringify(results[0]||{method:"tarot",question:"…",raw_result:{},themes:[],obstacles:[],opportunities:[],advice:[],temporal_indicators:[],interpretation:"…"},null,2)}</pre><button className="ghost" onClick={()=>{navigator.clipboard.writeText(JSON.stringify(results[0]||{},null,2));notify("JSON copiado")}}>Copiar JSON</button></div></div>{results.length>1&&<Report results={results} analyst={analyst} question={question} context={context} onSave={save} onDownload={download} onNew={()=>setResults([])} debug/>}</section>}
  <footer className="site-footer"><nav className="footer-socials" aria-label="Próximas redes sociales"><span><img src="https://cdn.simpleicons.org/instagram/c9a76a" alt="" aria-hidden="true"/><b>Instagram</b></span><span><img src="https://cdn.simpleicons.org/facebook/c9a76a" alt="" aria-hidden="true"/><b>Facebook</b></span><span><img src="https://cdn.simpleicons.org/youtube/c9a76a" alt="" aria-hidden="true"/><b>YouTube</b></span><span><img src="https://cdn.simpleicons.org/tiktok/c9a76a" alt="" aria-hidden="true"/><b>TikTok</b></span></nav><div className="footer-brand"><img src="/speculum-animae-logo.png" alt="Emblema de Speculum Animae"/><strong>SPECULUM ANIMAE</strong><small>EL ESPEJO DEL ALMA</small></div><div className="footer-legal"><nav aria-label="Información legal"><span>Aviso legal</span><span>Privacidad</span><span>Términos de uso</span></nav><p>Las interpretaciones ofrecidas tienen fines de entretenimiento, reflexión personal y autoconocimiento. No predicen hechos ni sustituyen asesoramiento médico, psicológico, legal o financiero profesional.</p><small>© {new Date().getFullYear()} Speculum Animae · Todos los derechos reservados</small></div></footer>{toast&&<div className="toast">{toast}</div>}
 </main>
}

function ExtendedCollections({query}:{query:string}){
 const normalized=query.toLowerCase();
 const osho=oshoZenReference.filter(card=>(`${card.name} ${card.group}`).toLowerCase().includes(normalized));
 const animals=powerAnimals.filter(card=>(`${card.name} ${card.meaning} ${card.message}`).toLowerCase().includes(normalized));
 const names=divineNames72.filter(item=>(`${item.number} ${item.hebrew}`).includes(normalized));
 return <>
  <h2 className="subhead">Tarot Zen ORÁCULO · 79 cartas originales</h2>
  <p className="collection-note sacred-note">Baraja contemplativa original: 23 cartas de Conciencia y cuatro familias de 14 cartas —Fuego, Agua, Nubes y Arcoíris—. Cada lectura recorre tres movimientos: observar, permitir e integrar. No reproduce textos ni ilustraciones de una baraja comercial.</p>
  <div className="zen-reference-grid">{osho.map(card=><article className="zen-deck-card" key={card.id}><div className="zen-card-art"><img src={card.image} alt={`Carta ${card.name} de la familia ${card.group}`} loading="lazy"/></div><small>{card.group}{card.number!==null?` · ${card.number}`:""} · {card.phase}</small><h3>{card.name}</h3><p>{card.message}</p><em>{card.question}</em></article>)}</div>

  <h2 className="subhead">Oráculo original de Animales de Poder · 44 cartas</h2>
  <p className="collection-note">Ilustraciones originales y significados reflexivos. No atribuye estos símbolos a una nación indígena específica ni reproduce un oráculo comercial.</p>
  <div className="animal-library-grid">{animals.map(card=><article key={card.id}><img src={card.image} alt={`Carta del animal de poder ${card.name}`} loading="lazy"/><small>{card.id.slice(-2)} · {card.meaning}</small><h3>{card.name}</h3><p>{card.message}</p></article>)}</div>

  <h2 className="subhead">Radiestesia · péndulo con testigo y tablero</h2>
  <p className="collection-note">Péndulo de plata con cámara interior para colocar un pequeño testigo y tablero graduado para respuestas orientativas. La práctica se presenta como herramienta simbólica de observación y no como método de diagnóstico.</p>
  <div className="radiesthesia-library">
   <article><img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt="Péndulo de plata con testigo sostenido por una mano" loading="lazy"/><div><small>INSTRUMENTO</small><h3>Péndulo de plata con testigo</h3><p>Sostén el extremo de la cadena sin tensión y deja que el péndulo quede suspendido sobre el punto central.</p></div></article>
   <article className="radiesthesia-board-card"><img src="/oracles/pendulum/radiesthesia-board.svg" alt="Tablero semicircular de radiestesia con respuestas y escala porcentual" loading="lazy"/><div><small>TABLERO</small><h3>Respuesta e intensidad</h3><p>Incluye siete respuestas graduadas, escala de 0 a 100 y punto de inicio para el péndulo.</p><a href="/oracles/pendulum/radiesthesia-board.svg" download>Descargar tablero para imprimir</a></div></article>
  </div>

  <h2 className="subhead">Chamalongos · referencia cultural</h2>
  <p className="collection-note sacred-note">Dos versiones visuales de cuatro piezas: cáscara de coco y caracol tigre. Las denominaciones y lecturas varían entre ramas y casas; esta síntesis documental no enseña consagraciones, firmas ni sustituye a una persona iniciada.</p>
  <h3 className="collection-variant-title">Versión 1 · Cáscaras de coco</h3><ChamalongoGrid normalized={normalized} version="coconut"/>
  <h3 className="collection-variant-title">Versión 2 · Caracoles tigre</h3><p className="variant-note">Representación con cuatro caracoles tigre, mostrando la cara ventral como “arriba” y la cara dorsal moteada como “abajo”. Existen prácticas con otros números de caracoles.</p><ChamalongoGrid normalized={normalized} version="cowrie"/>

  <h2 className="subhead">Los 72 Nombres de Dios · tripletes hebreos</h2>
  <p className="collection-note sacred-note">Referencia textual de los 72 tripletes derivados de Éxodo 14:19–21. Se presentan sin asignaciones terapéuticas, predictivas o comerciales añadidas.</p>
  <div className="divine-names-grid metal-engraving" dir="rtl">{names.map(item=><article key={item.number}><small>{item.number}</small><b lang="he">{item.hebrew}</b></article>)}</div>

  <h2 className="subhead">Árbol de la Vida · 10 sefirot y 22 senderos</h2>
  <p className="collection-note sacred-note">Mapa de estudio. Las correspondencias entre senderos, letras, planetas y Tarot cambian entre la Cábala judía y las escuelas herméticas; aquí se conserva la capa común de diez sefirot y veintidós letras.</p>
  <div className="tree-study metal-tree-study"><div className="tree-canvas" aria-label="Árbol de la Vida con diez sefirot y veintidós conexiones"><TreeConnections/>{sefirot.map((item,index)=><div className={`sefirah-node node-${index+1}`} key={item.number}><b lang="he">{item.hebrew}</b><span>{item.name}</span><small>{item.gloss}</small></div>)}</div><div className="tree-details"><h3>Los 22 senderos</h3><div className="path-grid">{treePaths.map(path=><article key={path.number}><small>{path.number}</small><b lang="he">{path.hebrew}</b><span>{path.name}</span></article>)}</div></div></div>
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

function RadiestesiaSystemSite({onBack}:{onBack:()=>void}){
 const [step,setStep]=useState<"menu"|"question"|"casting"|"result">("menu");
 const [focus,setFocus]=useState("");
 const [selectedFocusIdx,setSelectedFocusIdx]=useState<number|null>(null);
 const [question,setQuestion]=useState("");
 const [angle,setAngle]=useState(0);
 const [intensity,setIntensity]=useState(0);
 const [isAnimating,setIsAnimating]=useState(false);
 const [response,setResponse]=useState<string|null>(null);
 const [reading,setReading]=useState<Result|null>(null);
 const [castPhase,setCastPhase]=useState<"swinging"|"board"|"stopped">("swinging");

 const radiestesiaCards=[{num:1,label:"Pregunta",card:question||"Sin pregunta",reversed:false}];
 const {interpretation:aiInterpretation,isLoading}=useAIInterpretation({discipline:"radiestesia",spread:focus?`Consulta radiestésica - ${focus}`:"",cards:radiestesiaCards,question});
 const radiestesiaSections=useMemo(()=>parseAIInterpretation(aiInterpretation||""),[aiInterpretation]);

 const boardX=200+Math.cos(((angle-90)*Math.PI)/180)*120;
 const boardY=200+Math.sin(((angle-90)*Math.PI)/180)*120;

 const focuses=[
   {label:"Decisiones",color:"#3b82f6",symbol:"↗",description:"Elecciones, tiempos y consecuencias",subcats:["¿Debo tomar esta acción?","¿Es el momento correcto?","¿Hay obstáculos ocultos?","¿Beneficiará a mis objetivos?"]},
   {label:"Claridad",color:"#9333ea",symbol:"◉",description:"Perspectiva, comprensión y dirección",subcats:["¿Entiendo la verdadera naturaleza?","¿Qué estoy perdiendo de vista?","¿Cuál es el siguiente paso?","¿Hay factores ocultos?"]},
   {label:"Energía y flujo",color:"#16a34a",symbol:"≈",description:"Impulso, bloqueos y ritmo",subcats:["¿Está fluyendo positivamente?","¿Hay bloqueo o resistencia?","¿Es este el mejor camino?","¿Debo acelerar o esperar?"]},
   {label:"Relaciones",color:"#e11d48",symbol:"◇",description:"Armonía, comunicación y confianza",subcats:["¿Hay armonía en esto?","¿Es el momento para comunicar?","¿Hay incompatibilidad fundamental?","¿Debo confiar?"]}
 ];

 const selectedFocus=selectedFocusIdx===null?null:focuses[selectedFocusIdx];
 const resultAnswer=reading?(reading.raw_result as {response:string}).response:"";
 const answerTone=resultAnswer.includes("No")||resultAnswer.includes("no")?"no":resultAnswer.includes("Neutral")?"neutral":"yes";

 function returnToMenu(){setStep("menu");setCastPhase("swinging");window.scrollTo({top:0,behavior:"smooth"})}

 function startCasting(){
  if(!question.trim()){alert("Formúlate una pregunta clara"); return}
  setStep("casting");
  setCastPhase("swinging");
  setIsAnimating(false);
  window.scrollTo({top:0,behavior:"smooth"});
 }

 function readBoard(){
  if(castPhase!=="swinging")return;
  const newAngle=-72+Math.random()*144;
  const intensity_val=30+Math.random()*70;
  setAngle(newAngle);
  setIntensity(Math.round(intensity_val));
  setCastPhase("board");
  setIsAnimating(true);
  setTimeout(()=>{
   interpretAngle(newAngle,Math.round(intensity_val));
   setIsAnimating(false);
   setCastPhase("stopped");
  },4600);
 }

 function revealResult(){
  if(castPhase!=="stopped")return;
  setStep("result");
  window.scrollTo({top:0,behavior:"smooth"});
 }

 function interpretAngle(ang:number,int:number){
  const normalized=Math.max(-75,Math.min(75,ang));
  let resp="";
  if(normalized<-55)resp="No definitivo";
  else if(normalized<-30)resp="No";
  else if(normalized<-10)resp="Probablemente no";
  else if(normalized<=10)resp="Neutral";
  else if(normalized<=35)resp="Probablemente sí";
  else if(normalized<=60)resp="Sí";
  else resp="Sí definitivo";
  setResponse(`${resp} · ${int}%`);
  const build:Result={method:"radiestesia",title:"Radiestesia · Consulta pendular",raw_result:{angle:normalized,intensity:int,response:resp},themes:["intuición","dirección","equilibrio"],obstacles:[],opportunities:[resp],advice:["Observe el movimiento sin forzar una interpretación."],interpretation:`El péndulo responde a tu pregunta con ${resp.toLowerCase()} a una intensidad del ${int}%. En la radiestesia, el movimiento es un reflejo del campo energético; usa esta información como orientación simbólica para reflexionar sobre tu pregunta.`};
  setReading(build);
 }

 return (
    <section className={`tarot-classic-site radiestesia-site tarot-step-${step}`}>
      <button className="system-back radiestesia-back" onClick={step==="menu"?onBack:returnToMenu}>
        {step==="menu"?"← Volver al Inicio":"← Elegir otro enfoque"}
      </button>

      {step==="menu" && (
        <>
          <div className="tarot-menu-title system-intro-title radiestesia-intro">
            <h1>Péndulo</h1>
            <span>OBSERVACIÓN · EQUILIBRIO · ORIENTACIÓN</span>
            <div className="system-introduction radiestesia-introduction-copy">
              <p>La radiestesia es una evolución moderna de la rabdomancia, práctica milenaria utilizada para localizar agua y minerales mediante varas. El término se consolidó en el siglo XX, combinando raíces latinas y griegas que aluden a la &quot;sensibilidad a las radiaciones&quot;.</p>
              <p>En su definición contemporánea, busca captar campos energéticos, frecuencias o información oculta a través de instrumentos amplificadores — principalmente el péndulo y las varillas — que funcionan como extensiones de la percepción del operador.</p>
              <p>Desde una perspectiva científica, su mecanismo se explica por el <strong>efecto ideomotor</strong>: micromovimientos musculares involuntarios generados por el subconsciente al procesar un estímulo mental o pregunta. El instrumento no detecta por sí solo; amplifica y hace visible lo que el sistema nervioso ya está procesando.</p>
              <p>Sus aplicaciones tradicionales incluyen la búsqueda de elementos físicos, el análisis energético de espacios, y como herramienta de apoyo en la toma de decisiones o procesos de introspección.</p>
            </div>
          </div>
          <section className="spread-menu-section radiestesia-menu">
            <span className="mini-label">ELIGE EL ENFOQUE</span>
            <div className="spread-category-grid radiestesia-focus-grid">
              {focuses.map((f,idx)=><details className={`radiestesia-focus-card spread-group-${idx+1}`} key={f.label}>
                <summary><span className="spread-symbol"><i>{f.symbol}</i></span><div><b>{f.label}</b><small>{f.subcats.length} consultas</small></div><em>+</em></summary>
                <div className="spread-options radiestesia-focus-options">{f.subcats.map(subcat=><button key={subcat} onClick={()=>{setSelectedFocusIdx(idx);setFocus(f.label);setQuestion(subcat);setStep("question");window.scrollTo({top:0,behavior:"smooth"})}}>{subcat}<span>→</span></button>)}</div>
              </details>)}
            </div>
          </section>
        </>
      )}

      {step==="question" && (
        <>
          <div className="tarot-classic-head radiestesia-activation-head">
            <h1>{question}</h1>
            <p>{selectedFocus?.description}</p>
          </div>
          <section className="radiestesia-activation-stage" style={{"--focus":selectedFocus?.color||"#9333ea"} as CSSProperties}>
            <p className="radiestesia-activation-guidance">Antes de tocar el péndulo, respira y concéntrate en lo que quieres saber.</p>
            <button className="pendulum-photo-action" type="button" onClick={startCasting} aria-label="Activar el péndulo para iniciar la consulta">
              <img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt="Péndulo de plata sostenido por una mano"/>
            </button>
          </section>
        </>
      )}

      {step==="casting" && (
        <div className="radiestesia-casting" style={{"--focus":selectedFocus?.color||"#9333ea"} as CSSProperties}>
          <div className="casting-heading"><span>{focus.toUpperCase()}</span><h1>{castPhase==="swinging"?"Observa el movimiento":castPhase==="board"?"El péndulo busca una dirección":"La señal está marcada"}</h1><p>{castPhase==="swinging"?"Mantén la pregunta presente. Cuando estés listo, toca de nuevo la imagen.":castPhase==="board"?"La oscilación pierde amplitud mientras se orienta sobre el tablero.":"El péndulo se ha detenido en un área del tablero."}</p></div>
          <button className={`pendulum-casting-stage ${castPhase}`} style={{"--target-angle":`${angle}deg`} as CSSProperties} onClick={castPhase==="swinging"?readBoard:revealResult} disabled={isAnimating} aria-label={castPhase==="swinging"?"Cambiar al tablero y realizar la lectura":castPhase==="stopped"?"Ver la interpretación":"El péndulo está buscando una dirección"}>
            {castPhase==="swinging"?<>
              <img src="/oracles/pendulum/silver-witness-pendulum-held.jpg" alt="Péndulo de plata oscilando durante la consulta"/>
              <span className="casting-vignette"/>
              <span className="pendulum-rig" aria-hidden="true"><i className="pendulum-chain"/><i className="pendulum-bob"/><i className="pendulum-shadow"/></span>
              <span className="casting-status"><i/> TOCA DE NUEVO PARA CONSULTAR EL TABLERO</span>
            </>:<>
              <img className="radiestesia-board-image" src="/oracles/pendulum/radiesthesia-board.svg" alt="Tablero de radiestesia con respuestas e intensidad"/>
              <span className="board-pendulum-arm" aria-hidden="true"><i/><b/></span>
              <span className="board-center-mark" aria-hidden="true"/>
              {castPhase==="stopped"&&<span className="casting-status">VER INTERPRETACIÓN <b>→</b></span>}
            </>}
          </button>
          <p className="casting-question">“{question}”</p>
        </div>
      )}

      {step==="result" && reading && (
        <div className="radiestesia-result" style={{"--focus":selectedFocus?.color||"#9333ea"} as CSSProperties}>
          <div className="page-title">
            <span className="mini-label">{focus.toUpperCase()} · RESPUESTA RADIESTÉSICA</span>
            <h1>Lo que señala el péndulo</h1>
          </div>
          <div className="radiestesia-result-grid">
            <section className="radiestesia-board-panel"><div className="board-frame"><img src="/oracles/pendulum/radiesthesia-board.svg" alt="Tablero circular de radiestesia"/><svg viewBox="0 0 400 400" className="board-needle" aria-hidden="true"><defs><linearGradient id="needleGold" x1="0" x2="1"><stop stopColor="#876126"/><stop offset=".55" stopColor="#ffe4a0"/><stop offset="1" stopColor="#b4863e"/></linearGradient></defs><line x1="200" y1="200" x2={boardX} y2={boardY} stroke="url(#needleGold)" strokeWidth="4"/><path d={`M ${boardX} ${boardY} l -10 -5 l 3 11 z`} fill="#f8dc91"/><circle cx="200" cy="200" r="9" fill="#d9b565" stroke="#fff0bc" strokeWidth="2"/></svg></div><div className="board-meta"><span className={`result-badge ${answerTone}`}>{resultAnswer.toUpperCase()}</span><small>DIRECCIÓN · {Math.round(angle)}°</small></div></section>
            <section className="radiestesia-interpretation-panel">
              <span className="mini-label">RESPUESTA</span><div className={`answer-word ${answerTone}`}>{resultAnswer}</div>
              <div className="intensity-heading"><span>INTENSIDAD DE LA SEÑAL</span><b>{intensity}%</b></div><div className="intensity-bar"><div className="intensity-fill" style={{width:`${intensity}%`}}/></div>
              <div className="reading-divider"/>
              <span className="mini-label">MENSAJE E INTERPRETACIÓN</span><h2>Lo que el péndulo revela</h2>
              <div className="interpretation-copy">
              {isLoading ? (
                <p className="interpretation-loading">Generando una interpretación para tu consulta…</p>
              ) : radiestesiaSections.length>0 ? (
                <div className="radiestesia-ai-sections">{radiestesiaSections.map(section=><article key={section.id}><h3>{section.title}</h3><p dangerouslySetInnerHTML={{__html:section.body}}/></article>)}</div>
              ) : <p dangerouslySetInnerHTML={{__html:markdownToHtml(reading.interpretation)}}/>}
              </div><blockquote>“{question}”</blockquote>
            </section>
          </div>
          <div className="radiestesia-result-actions"><button onClick={returnToMenu}>← Elegir otro enfoque</button><button onClick={onBack}>← Volver al inicio</button><button className="new-consultation" onClick={()=>{setStep("question");setQuestion("");setAngle(0);setIntensity(0);setResponse(null);setReading(null)}}>Otra consulta <span>↗</span></button></div>
        </div>
      )}
    </section>
  );
}

export default App;
