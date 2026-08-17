import { useEffect, useMemo, useState } from "react";
import type { AstroConsultationPayload } from "../components/AstroConsultationFlow";
import type { FullAstroCalculation } from "../components/astro-full-calculations";
import { buildAstroThemeEvidence, themeSessionKey, type AstroThemeContract, type AstroThemeEvidence } from "../components/astro-theme-contracts";

export type AstroThemeSection = { title: string; text: string };
export type AstroThemeTrace = { section: string; sources: string[] };
export type AstroThemeInterpretation = { sections: AstroThemeSection[]; trace: AstroThemeTrace[] };

const sessionCache = new Map<string, AstroThemeInterpretation>();
const ENDPOINT = "/api/interpretar";

const sectionNames:Record<string,string[]>={
  ES:["Apertura","Indicadores principales","Interpretación","Fortalezas","Tensiones o retos","Momento actual","Integración","Orientación","Método y alcance"],
  EN:["Opening","Main indicators","Interpretation","Strengths","Tensions or challenges","Current moment","Integration","Guidance","Method and scope"],
  FR:["Ouverture","Indicateurs principaux","Interprétation","Forces","Tensions ou défis","Moment actuel","Intégration","Orientation","Méthode et portée"],
  DE:["Einleitung","Hauptindikatoren","Deutung","Stärken","Spannungen oder Herausforderungen","Aktueller Moment","Integration","Orientierung","Methode und Umfang"],
  PT:["Abertura","Indicadores principais","Interpretação","Forças","Tensões ou desafios","Momento atual","Integração","Orientação","Método e escopo"],
};

function parseTrace(text:string):AstroThemeTrace[]{
  const match=text.match(/\n+TRACE_JSON:\s*(\{[\s\S]*\})\s*$/i);if(!match)return[];
  try{const parsed=JSON.parse(match[1]) as {sections?:Array<{title?:string;sources?:string[]}>};return(parsed.sections||[]).map(item=>({section:item.title||"",sources:(item.sources||[]).filter(Boolean)}))}catch{return[]}
}

function stripTrace(text:string):string{return text.replace(/\n+TRACE_JSON:\s*\{[\s\S]*$/i,"").trim()}

function parseSections(text:string):AstroThemeSection[]{
  const clean=stripTrace(text).replace(/^#\s+[^\n]*\n+/,"");
  return clean.split(/^##\s+/m).filter(Boolean).map(part=>{const [title,...body]=part.split("\n");return{title:title.trim(),text:body.join("\n").trim()}}).filter(section=>section.title&&section.text);
}

function fallback(contract:AstroThemeContract,evidence:AstroThemeEvidence[],language:string):AstroThemeInterpretation{
  const names=sectionNames[language]||sectionNames.ES;const sources=evidence.map(item=>item.source);const facts=evidence.map(item=>`${item.label}: ${item.value}`).join(" · ");
  const copy:Record<string,{opening:string;reading:string;strengths:string;tensions:string;current:string;integration:string;guidance:string;method:string}>={
    ES:{opening:`Este enfoque observa ${contract.title.toLowerCase()} dentro del reporte original. La lectura se limita a los indicadores realmente disponibles.`,reading:`Los datos calculados concentran la lectura en ${facts||"los indicadores estructurales disponibles"}.`,strengths:"Las configuraciones disponibles describen recursos simbólicos; su expresión concreta debe contrastarse con la experiencia de la persona.",tensions:"Las tensiones se presentan como áreas de atención y desarrollo, no como hechos inevitables ni conclusiones absolutas.",current:contract.temporal?"El momento actual se interpreta únicamente mediante los ciclos o activaciones fechadas presentes en el cálculo.":"Este reporte es estructural y no permite afirmar por sí solo cuándo se manifestará una tendencia.",integration:`Este enfoque conserva como contexto el reporte general y la pregunta central: ${contract.centralQuestion}`,guidance:"Utiliza estos indicadores como una hipótesis simbólica y comprueba su resonancia en hechos observables.",method:"Síntesis determinista de los indicadores calculados; no se añadieron posiciones, números, ciclos, elementos, palacios ni estrellas ausentes."},
    EN:{opening:`This focus examines ${contract.title.toLowerCase()} within the original report and uses only available indicators.`,reading:`The calculated data grounds this reading in ${facts||"the available structural indicators"}.`,strengths:"Available configurations describe symbolic resources whose concrete expression must be checked against lived experience.",tensions:"Tensions are areas for attention and development, not inevitable events or absolute conclusions.",current:contract.temporal?"The current moment is read only through dated cycles or activations present in the calculation.":"This is a structural report and cannot establish when a tendency will manifest.",integration:`This focus retains the general report as context and answers: ${contract.centralQuestion}`,guidance:"Use these indicators as a symbolic hypothesis and test their resonance against observable facts.",method:"Deterministic synthesis of calculated indicators; no absent placements, numbers, cycles, elements, palaces, or stars were added."},
    FR:{opening:`Cette approche examine ${contract.title.toLowerCase()} dans le rapport original et se limite aux indicateurs disponibles.`,reading:`Les données calculées fondent la lecture sur ${facts||"les indicateurs structurels disponibles"}.`,strengths:"Les configurations disponibles décrivent des ressources symboliques à confronter à l’expérience vécue.",tensions:"Les tensions indiquent des axes d’attention et de développement, jamais des événements inévitables.",current:contract.temporal?"Le moment actuel est lu uniquement à travers les cycles ou activations datés du calcul.":"Ce rapport structurel ne permet pas de dater la manifestation d’une tendance.",integration:`Cette approche conserve le rapport général comme contexte et répond à : ${contract.centralQuestion}`,guidance:"Utilisez ces indicateurs comme hypothèse symbolique et vérifiez leur résonance dans les faits observables.",method:"Synthèse déterministe des indicateurs calculés ; aucun élément absent n’a été ajouté."},
    DE:{opening:`Dieser Fokus untersucht ${contract.title.toLowerCase()} im ursprünglichen Bericht und nutzt nur vorhandene Indikatoren.`,reading:`Die berechneten Daten stützen die Deutung auf ${facts||"die verfügbaren Strukturindikatoren"}.`,strengths:"Die vorhandenen Konfigurationen beschreiben symbolische Ressourcen, deren Ausdruck an der Erfahrung geprüft werden muss.",tensions:"Spannungen sind Entwicklungsfelder, keine unvermeidlichen Ereignisse oder absoluten Aussagen.",current:contract.temporal?"Der aktuelle Moment wird nur anhand datierter Zyklen oder Aktivierungen im Ergebnis gedeutet.":"Dieser Strukturbericht kann nicht bestimmen, wann sich eine Tendenz zeigt.",integration:`Der allgemeine Bericht bleibt als Kontext erhalten; Leitfrage: ${contract.centralQuestion}`,guidance:"Nutzen Sie die Indikatoren als symbolische Hypothese und prüfen Sie ihre Resonanz an beobachtbaren Fakten.",method:"Deterministische Synthese berechneter Indikatoren; fehlende Positionen, Zahlen, Zyklen, Elemente, Paläste oder Sterne wurden nicht ergänzt."},
    PT:{opening:`Este enfoque observa ${contract.title.toLowerCase()} dentro do relatório original e usa apenas os indicadores disponíveis.`,reading:`Os dados calculados fundamentam a leitura em ${facts||"indicadores estruturais disponíveis"}.`,strengths:"As configurações disponíveis descrevem recursos simbólicos cuja expressão deve ser conferida na experiência real.",tensions:"As tensões são áreas de atenção e desenvolvimento, não acontecimentos inevitáveis ou conclusões absolutas.",current:contract.temporal?"O momento atual é lido somente pelos ciclos ou ativações datadas presentes no cálculo.":"Este relatório estrutural não permite afirmar quando uma tendência se manifestará.",integration:`Este enfoque mantém o relatório geral como contexto e responde: ${contract.centralQuestion}`,guidance:"Use estes indicadores como hipótese simbólica e confira sua ressonância em fatos observáveis.",method:"Síntese determinística dos indicadores calculados; nenhum dado ausente foi acrescentado."},
  };const c=copy[language]||copy.ES;
  const texts=[c.opening,facts||c.reading,c.reading,c.strengths,c.tensions,c.current,c.integration,c.guidance,c.method];
  const sections=names.map((title,index)=>({title,text:texts[index]})).filter((_,index)=>contract.temporal||index!==5);
  return{sections,trace:sections.map(section=>({section:section.title,sources}))};
}

export function useAstroThemeInterpretation(payload:AstroConsultationPayload,focusIndex:number,data:FullAstroCalculation,contract:AstroThemeContract){
  const evidence=useMemo(()=>buildAstroThemeEvidence(payload.discipline,focusIndex,contract,data),[payload.discipline,focusIndex,contract,data]);
  const key=themeSessionKey(payload,focusIndex,contract.id);
  const [result,setResult]=useState<AstroThemeInterpretation>(()=>sessionCache.get(key)||fallback(contract,evidence,payload.language));
  const [streamingText,setStreamingText]=useState("");const [isLoading,setIsLoading]=useState(!sessionCache.has(key));const [usedFallback,setUsedFallback]=useState(false);

  useEffect(()=>{const cached=sessionCache.get(key);if(cached){setResult(cached);setIsLoading(false);setStreamingText("");return}let cancelled=false;setIsLoading(true);setStreamingText("");setUsedFallback(false);
    void(async()=>{try{const response=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language:payload.language,astro:{discipline:payload.discipline,focus:payload.focus,focusIndex,data,context:{name:payload.birthName||payload.name,birthDate:payload.birthDate,question:payload.question},theme:{id:contract.id,title:contract.title,description:contract.description,centralQuestion:contract.centralQuestion,indicators:{planets:contract.planets,houses:contract.houses,palaces:contract.palaces,numberKeys:contract.numberKeys,temporal:contract.temporal},evidence}}})});if(!response.ok||!response.body)throw new Error(`Error ${response.status}`);const reader=response.body.getReader();const decoder=new TextDecoder();let full="",buffer="";while(true){const{done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const events=buffer.split("\n\n");buffer=events.pop()||"";for(const raw of events){const line=raw.split("\n").find(item=>item.startsWith("data: "));if(!line)continue;try{const event=JSON.parse(line.slice(6)) as{text?:string};if(event.text){full+=event.text;if(!cancelled)setStreamingText(full)}}catch{}}}const sections=parseSections(full);if(sections.length<7)throw new Error("Incomplete thematic report");const interpreted={sections,trace:parseTrace(full)};sessionCache.set(key,interpreted);if(!cancelled){setResult(interpreted);setUsedFallback(false)}}catch{if(!cancelled){setResult(fallback(contract,evidence,payload.language));setUsedFallback(true)}}finally{if(!cancelled)setIsLoading(false)}})();return()=>{cancelled=true}},[key]);

  return{...result,evidence,isLoading,streamingText:stripTrace(streamingText),usedFallback};
}
