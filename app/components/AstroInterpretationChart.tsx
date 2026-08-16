import type { Language } from "../translations";
import type { AstroDiscipline } from "./AstroConsultationFlow";
import "./astro-interpretation-chart.css";

type Numbers={life:number;expression:number;soul:number;year:number}|null;
type Props={discipline:AstroDiscipline;focusIndex:number;lang:Language;numbers:Numbers};

const text:Record<Language,Record<string,string>>={
  ES:{chart:"CHART DE INTERPRETACIÓN",verified:"Dato calculado",pending:"Cálculo especializado pendiente",natal:"Estructura natal disponible",transits:"Carta raíz y cielo en movimiento",solar:"Ciclo solar anual",horoscope:"Orientación por signo solar",yearPillar:"Pilar anual",month:"Mes",day:"Día",hour:"Hora",wood:"Madera",fire:"Fuego",earth:"Tierra",metal:"Metal",water:"Agua",palaces:"Doce palacios",life:"Vida",expression:"Expresión",soul:"Alma",year:"Año personal"},
  EN:{chart:"INTERPRETATION CHART",verified:"Calculated data",pending:"Specialized calculation pending",natal:"Available natal structure",transits:"Root chart and moving sky",solar:"Annual solar cycle",horoscope:"Sun-sign guidance",yearPillar:"Year pillar",month:"Month",day:"Day",hour:"Hour",wood:"Wood",fire:"Fire",earth:"Earth",metal:"Metal",water:"Water",palaces:"Twelve palaces",life:"Life",expression:"Expression",soul:"Soul",year:"Personal year"},
  FR:{chart:"CARTE D’INTERPRÉTATION",verified:"Donnée calculée",pending:"Calcul spécialisé en attente",natal:"Structure natale disponible",transits:"Carte racine et ciel mobile",solar:"Cycle solaire annuel",horoscope:"Orientation par signe solaire",yearPillar:"Pilier annuel",month:"Mois",day:"Jour",hour:"Heure",wood:"Bois",fire:"Feu",earth:"Terre",metal:"Métal",water:"Eau",palaces:"Douze palais",life:"Vie",expression:"Expression",soul:"Âme",year:"Année personnelle"},
  DE:{chart:"DEUTUNGSDIAGRAMM",verified:"Berechnete Daten",pending:"Spezialberechnung ausstehend",natal:"Verfügbare Geburtsstruktur",transits:"Wurzelkarte und bewegter Himmel",solar:"Jährlicher Sonnenzyklus",horoscope:"Orientierung nach Sonnenzeichen",yearPillar:"Jahressäule",month:"Monat",day:"Tag",hour:"Stunde",wood:"Holz",fire:"Feuer",earth:"Erde",metal:"Metall",water:"Wasser",palaces:"Zwölf Paläste",life:"Leben",expression:"Ausdruck",soul:"Seele",year:"Persönliches Jahr"},
  PT:{chart:"MAPA DE INTERPRETAÇÃO",verified:"Dado calculado",pending:"Cálculo especializado pendente",natal:"Estrutura natal disponível",transits:"Mapa raiz e céu em movimento",solar:"Ciclo solar anual",horoscope:"Orientação por signo solar",yearPillar:"Pilar anual",month:"Mês",day:"Dia",hour:"Hora",wood:"Madeira",fire:"Fogo",earth:"Terra",metal:"Metal",water:"Água",palaces:"Doze palácios",life:"Vida",expression:"Expressão",soul:"Alma",year:"Ano pessoal"},
};

const zodiac=["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
const point=(cx:number,cy:number,r:number,angle:number)=>({x:cx+Math.cos((angle-90)*Math.PI/180)*r,y:cy+Math.sin((angle-90)*Math.PI/180)*r});

function Wheel({focusIndex}:{focusIndex:number}){
  const markerAngle=focusIndex===2?52:focusIndex===1?228:345;
  const marker=point(300,210,132,markerAngle);
  return <svg viewBox="0 0 600 420" role="img">
    <circle className="chart-ring outer" cx="300" cy="210" r="174"/><circle className="chart-ring" cx="300" cy="210" r="138"/><circle className="chart-ring inner" cx="300" cy="210" r="72"/>
    {zodiac.map((symbol,index)=>{const a=index*30+15;const label=point(300,210,156,a);const line=point(300,210,174,index*30);return <g key={symbol}><line className="chart-axis" x1="300" y1="210" x2={line.x} y2={line.y}/><text className={index===11?"chart-symbol active":"chart-symbol"} x={label.x} y={label.y}>{symbol}</text></g>})}
    {focusIndex===1&&<><circle className="chart-orbit moving" cx="300" cy="210" r="116"/><path className="chart-transit" d="M151 262 C225 84 393 88 461 247"/></>}
    {focusIndex===2&&<path className="chart-cycle" d="M300 66 A144 144 0 1 1 299 66"/>}
    {focusIndex===3&&<><path className="chart-arc" d="M185 299 A145 145 0 0 1 179 130"/><path className="chart-arc secondary" d="M179 130 A145 145 0 0 1 340 72"/></>}
    <circle className="chart-marker" cx={marker.x} cy={marker.y} r="9"/><text className="chart-center-glyph" x="300" y="224">♓</text>
  </svg>;
}

function Bazi({focusIndex,t}:{focusIndex:number;t:Record<string,string>}){
  if(focusIndex===1){const elements=[t.wood,t.fire,t.earth,t.metal,t.water];const values=[92,38,46,34,42];const pts=values.map((v,i)=>point(300,210,v,i*72)).map(p=>`${p.x},${p.y}`).join(" ");return <svg viewBox="0 0 600 420"><polygon className="element-frame" points={[0,1,2,3,4].map(i=>{const p=point(300,210,110,i*72);return `${p.x},${p.y}`}).join(" ")}/>{[0,1,2,3,4].map(i=>{const p=point(300,210,128,i*72);return <text className="element-label" x={p.x} y={p.y} key={i}>{elements[i]}</text>})}<polygon className="element-value" points={pts}/><circle className="chart-marker" cx="300" cy="118" r="8"/><text className="chart-center-glyph tiger" x="300" y="230">虎</text></svg>}
  if(focusIndex===2)return <svg viewBox="0 0 600 420"><circle className="chart-ring outer" cx="300" cy="210" r="172"/><circle className="chart-ring" cx="300" cy="210" r="105"/>{Array.from({length:12},(_,i)=>{const a=i*30;const p1=point(300,210,105,a);const p2=point(300,210,172,a);const label=point(300,210,138,a+15);return <g key={i}><line className="chart-axis" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}/><circle className="palace-dot pending" cx={label.x} cy={label.y} r="5"/></g>})}<text className="chart-center-glyph" x="300" y="226">紫</text></svg>;
  const columns=[{label:t.yearPillar,value:"甲寅",active:true},{label:t.month,value:"—"},{label:t.day,value:"—"},{label:t.hour,value:"—"}];return <svg viewBox="0 0 600 420">{columns.map((c,i)=><g className={c.active?"pillar active":"pillar"} key={c.label} transform={`translate(${70+i*125} 60)`}><rect width="105" height="300" rx="16"/><text className="pillar-label" x="52" y="38">{c.label}</text><text className="pillar-value" x="52" y="160">{c.value}</text><text className="pillar-animal" x="52" y="230">{c.active?"虎":"○"}</text></g>)}</svg>;
}

function NumberChart({focusIndex,numbers,t}:{focusIndex:number;numbers:Numbers;t:Record<string,string>}){
  const n=numbers||{life:8,expression:7,soul:11,year:6};const values=[n.life,n.expression,n.soul,n.year];const labels=[t.life,t.expression,t.soul,t.year];const chosen=values[focusIndex]??n.life;
  return <svg viewBox="0 0 600 420"><circle className="chart-ring outer" cx="300" cy="210" r="168"/><circle className="chart-ring" cx="300" cy="210" r="126"/><circle className="chart-ring inner" cx="300" cy="210" r="79"/>{values.map((value,i)=>{const p=point(300,210,145,i*90);return <g className={i===focusIndex?"number-node active":"number-node"} key={labels[i]}><circle cx={p.x} cy={p.y} r="30"/><text x={p.x} y={p.y+7}>{value}</text><text className="number-label" x={p.x} y={p.y+(i===0?-42:48)}>{labels[i]}</text></g>})}<text className="number-core" x="300" y="237">{chosen}</text></svg>;
}

export function AstroInterpretationChart({discipline,focusIndex,lang,numbers}:Props){
  const t=text[lang];const subtitles=discipline==="western"?[t.natal,t.transits,t.solar,t.horoscope]:discipline==="eastern"?[t.yearPillar,`${t.wood} · ${t.polarity||"Yang"}`,t.palaces]:[t.life,t.expression,t.soul,t.year];
  return <section className={`astro-chart astro-chart-${discipline}`}><header><span>{t.chart}</span><h3>{subtitles[focusIndex]}</h3></header><div className="astro-chart-canvas">{discipline==="western"?<Wheel focusIndex={focusIndex}/>:discipline==="eastern"?<Bazi focusIndex={focusIndex} t={t}/>:<NumberChart focusIndex={focusIndex} numbers={numbers} t={t}/>}</div><footer><i/><span>{t.verified}</span>{discipline!=="numerology"&&<><i className="pending"/><span>{t.pending}</span></>}</footer></section>;
}
