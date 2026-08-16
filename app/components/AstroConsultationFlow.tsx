"use client";

import { useEffect, useMemo, useState } from "react";
import type { Language } from "../translations";
import { createAstroInterpretation } from "./astro-interpretation";
import { AstroInterpretationChart } from "./AstroInterpretationChart";
import "./astro-consultation-flow.css";
import "./astro-consultation-refinements.css";

export type AstroDiscipline = "western" | "eastern" | "numerology";

export type AstroConsultationPayload = {
  discipline: AstroDiscipline;
  focus: string;
  language: Language;
  name: string;
  birthName?: string;
  currentName?: string;
  birthDate: string;
  birthTime?: string;
  birthPlace?: string;
  currentPlace?: string;
  timezone?: string;
  targetDate?: string;
  calendar?: "solar" | "lunar";
  gender?: string;
  question: string;
};

type FormState = Omit<AstroConsultationPayload, "discipline" | "focus" | "language"> & { birthHour: string; birthMinute: string; birthCountry: string; birthCity: string; currentCountry: string; currentCity: string };

const locations: Record<string, string[]> = {
  "México": ["Ciudad de México","Guadalajara","Monterrey","Puebla","Querétaro","Mérida","Tijuana","Otra ciudad"],
  "Argentina": ["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata","Otra ciudad"],
  "Brasil": ["São Paulo","Rio de Janeiro","Brasília","Salvador","Belo Horizonte","Outra cidade"],
  "Canadá": ["Toronto","Montreal","Vancouver","Ottawa","Calgary","Other city"],
  "Chile": ["Santiago","Valparaíso","Concepción","Antofagasta","Otra ciudad"],
  "Colombia": ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Otra ciudad"],
  "Cuba": ["La Habana","Santiago de Cuba","Camagüey","Holguín","Otra ciudad"],
  "España": ["Madrid","Barcelona","Valencia","Sevilla","Bilbao","Otra ciudad"],
  "Estados Unidos": ["New York","Los Angeles","Miami","Chicago","Houston","Other city"],
  "Francia": ["Paris","Lyon","Marseille","Toulouse","Autre ville"],
  "Alemania": ["Berlin","Hamburg","Munich","Cologne","Andere Stadt"],
  "Perú": ["Lima","Arequipa","Cusco","Trujillo","Otra ciudad"],
  "Portugal": ["Lisboa","Porto","Braga","Coimbra","Outra cidade"],
  "Reino Unido": ["London","Manchester","Birmingham","Edinburgh","Other city"],
  "Otro país": ["Otra ciudad"],
};

const timezones = ["America/Mexico_City","America/Tijuana","America/New_York","America/Chicago","America/Denver","America/Los_Angeles","America/Havana","America/Bogota","America/Lima","America/Santiago","America/Argentina/Buenos_Aires","America/Sao_Paulo","Europe/London","Europe/Madrid","Europe/Paris","Europe/Berlin","Europe/Lisbon","UTC"];
const hours = Array.from({length:24},(_,index)=>String(index).padStart(2,"0"));
const minutes = Array.from({length:60},(_,index)=>String(index).padStart(2,"0"));

const copy: Record<Language, Record<string, string>> = {
  ES: { eyebrow:"DATOS DE LA CONSULTA", title:"Prepara tu mapa", subtitle:"La precisión de los datos determina la precisión del cálculo.", name:"Nombre", birthName:"Nombre completo de nacimiento", currentName:"Nombre actual (opcional)", date:"Fecha de nacimiento", time:"Hora exacta de nacimiento", hour:"Hora", minute:"Minutos", country:"País de nacimiento", city:"Ciudad de nacimiento", currentCountry:"País actual", currentPlace:"Ciudad actual", choose:"Selecciona", timezone:"Zona horaria de nacimiento", target:"Fecha que deseas analizar", calendar:"Calendario de nacimiento", solar:"Solar", lunar:"Lunar", gender:"Sexo registrado al nacer", female:"Femenino", male:"Masculino", other:"Prefiero no indicarlo", question:"Pregunta o intención", submit:"Preparar interpretación", required:"Completa los campos obligatorios.", result:"MAPA PREPARADO", resultTitle:"Tu consulta está lista", calculation:"Cálculo base", interpretation:"Interpretación", pending:"El contrato de la consulta ya está preparado. La interpretación editorial se mostrará aquí cuando Claude incorpore esta disciplina; no se sustituye temporalmente con lógica de Tarot.", new:"Modificar datos", focus:"Enfoque", data:"Datos utilizados", life:"Número de Vida", expression:"Número de Expresión", soul:"Número del Alma", year:"Año Personal", exactTime:"Si desconoces la hora, indícalo en tu pregunta; algunos cálculos no podrán ser exactos." },
  EN: { eyebrow:"CONSULTATION DATA", title:"Prepare your chart", subtitle:"Accurate data is essential for an accurate calculation.", name:"Name", birthName:"Full birth name", currentName:"Current name (optional)", date:"Date of birth", time:"Exact birth time", place:"Birth city and country", currentPlace:"Current city", timezone:"Birth timezone", target:"Date to analyze", calendar:"Birth calendar", solar:"Solar", lunar:"Lunar", gender:"Sex recorded at birth", female:"Female", male:"Male", other:"Prefer not to say", question:"Question or intention", submit:"Prepare interpretation", required:"Complete all required fields.", result:"CHART PREPARED", resultTitle:"Your consultation is ready", calculation:"Base calculation", interpretation:"Interpretation", pending:"The consultation contract is ready. The editorial interpretation will appear here when Claude adds this discipline; it is not temporarily replaced with Tarot logic.", new:"Edit data", focus:"Focus", data:"Data used", life:"Life Path", expression:"Expression Number", soul:"Soul Number", year:"Personal Year", exactTime:"If the time is unknown, mention it in your question; some calculations cannot be exact." },
  FR: { eyebrow:"DONNÉES DE CONSULTATION", title:"Préparez votre carte", subtitle:"La précision des données détermine celle du calcul.", name:"Nom", birthName:"Nom complet de naissance", currentName:"Nom actuel (facultatif)", date:"Date de naissance", time:"Heure exacte de naissance", place:"Ville et pays de naissance", currentPlace:"Ville actuelle", timezone:"Fuseau horaire de naissance", target:"Date à analyser", calendar:"Calendrier de naissance", solar:"Solaire", lunar:"Lunaire", gender:"Sexe enregistré à la naissance", female:"Féminin", male:"Masculin", other:"Je préfère ne pas l’indiquer", question:"Question ou intention", submit:"Préparer l’interprétation", required:"Complétez les champs obligatoires.", result:"CARTE PRÉPARÉE", resultTitle:"Votre consultation est prête", calculation:"Calcul de base", interpretation:"Interprétation", pending:"Le contrat de consultation est prêt. L’interprétation éditoriale apparaîtra ici lorsque Claude intégrera cette discipline; elle n’est pas remplacée par la logique du Tarot.", new:"Modifier les données", focus:"Approche", data:"Données utilisées", life:"Chemin de Vie", expression:"Nombre d’Expression", soul:"Nombre de l’Âme", year:"Année personnelle", exactTime:"Si l’heure est inconnue, indiquez-le dans votre question; certains calculs ne pourront pas être exacts." },
  DE: { eyebrow:"BERATUNGSDATEN", title:"Bereiten Sie Ihre Karte vor", subtitle:"Die Genauigkeit der Daten bestimmt die Genauigkeit der Berechnung.", name:"Name", birthName:"Vollständiger Geburtsname", currentName:"Aktueller Name (optional)", date:"Geburtsdatum", time:"Genaue Geburtszeit", place:"Geburtsstadt und Land", currentPlace:"Aktueller Wohnort", timezone:"Zeitzone der Geburt", target:"Zu analysierendes Datum", calendar:"Geburtskalender", solar:"Solar", lunar:"Lunar", gender:"Bei Geburt eingetragenes Geschlecht", female:"Weiblich", male:"Männlich", other:"Keine Angabe", question:"Frage oder Absicht", submit:"Deutung vorbereiten", required:"Füllen Sie alle Pflichtfelder aus.", result:"KARTE VORBEREITET", resultTitle:"Ihre Beratung ist bereit", calculation:"Grundberechnung", interpretation:"Deutung", pending:"Der Beratungsvertrag ist vorbereitet. Die redaktionelle Deutung erscheint hier, sobald Claude diese Disziplin integriert; sie wird nicht vorübergehend durch Tarot-Logik ersetzt.", new:"Daten bearbeiten", focus:"Schwerpunkt", data:"Verwendete Daten", life:"Lebensweg", expression:"Ausdruckszahl", soul:"Seelenzahl", year:"Persönliches Jahr", exactTime:"Falls die Uhrzeit unbekannt ist, erwähnen Sie dies in Ihrer Frage; manche Berechnungen sind dann nicht exakt möglich." },
  PT: { eyebrow:"DADOS DA CONSULTA", title:"Prepare seu mapa", subtitle:"A precisão dos dados determina a precisão do cálculo.", name:"Nome", birthName:"Nome completo de nascimento", currentName:"Nome atual (opcional)", date:"Data de nascimento", time:"Hora exata de nascimento", place:"Cidade e país de nascimento", currentPlace:"Cidade atual", timezone:"Fuso horário de nascimento", target:"Data a analisar", calendar:"Calendário de nascimento", solar:"Solar", lunar:"Lunar", gender:"Sexo registrado ao nascer", female:"Feminino", male:"Masculino", other:"Prefiro não informar", question:"Pergunta ou intenção", submit:"Preparar interpretação", required:"Preencha os campos obrigatórios.", result:"MAPA PREPARADO", resultTitle:"Sua consulta está pronta", calculation:"Cálculo base", interpretation:"Interpretação", pending:"O contrato da consulta está preparado. A interpretação editorial aparecerá aqui quando Claude incorporar esta disciplina; ela não será substituída temporariamente pela lógica do Tarot.", new:"Modificar dados", focus:"Enfoque", data:"Dados utilizados", life:"Caminho de Vida", expression:"Número de Expressão", soul:"Número da Alma", year:"Ano Pessoal", exactTime:"Se a hora for desconhecida, mencione isso em sua pergunta; alguns cálculos não poderão ser exatos." },
};

const selectorCopy: Record<Language, Record<string,string>> = {
  ES:{hour:"Hora",minute:"Minutos",country:"País de nacimiento",city:"Ciudad de nacimiento",currentCountry:"País actual",currentPlace:"Ciudad actual",choose:"Selecciona"},
  EN:{hour:"Hour",minute:"Minutes",country:"Country of birth",city:"City of birth",currentCountry:"Current country",currentPlace:"Current city",choose:"Select"},
  FR:{hour:"Heure",minute:"Minutes",country:"Pays de naissance",city:"Ville de naissance",currentCountry:"Pays actuel",currentPlace:"Ville actuelle",choose:"Sélectionner"},
  DE:{hour:"Stunde",minute:"Minuten",country:"Geburtsland",city:"Geburtsstadt",currentCountry:"Aktuelles Land",currentPlace:"Aktueller Ort",choose:"Auswählen"},
  PT:{hour:"Hora",minute:"Minutos",country:"País de nascimento",city:"Cidade de nascimento",currentCountry:"País atual",currentPlace:"Cidade atual",choose:"Selecionar"},
};

// TEMP_SESSION_FIXTURE: remove Alain's personal data before any push or deploy.
const initial: FormState = { name:"Alain Christian Beltrán José", birthName:"Alain Christian Beltrán José", currentName:"", birthDate:"1974-02-21", birthTime:"12:32", birthPlace:"Ciudad de México, México", currentPlace:"Ciudad de México, México", birthHour:"12", birthMinute:"32", birthCountry:"México", birthCity:"Ciudad de México", currentCountry:"México", currentCity:"Ciudad de México", timezone:"America/Mexico_City", targetDate:"2026-08-16", calendar:"solar", gender:"male", question:"" };

const resultCopy:Record<Language,Record<string,string>>={
  ES:{demo:"DATOS TEMPORALES DE PRUEBA",synthesis:"Síntesis",guidance:"Orientación",method:"Método y alcance",questionOptional:"Pregunta o intención (opcional por ahora)"},
  EN:{demo:"TEMPORARY TEST DATA",synthesis:"Synthesis",guidance:"Guidance",method:"Method and scope",questionOptional:"Question or intention (optional for now)"},
  FR:{demo:"DONNÉES DE TEST TEMPORAIRES",synthesis:"Synthèse",guidance:"Orientation",method:"Méthode et portée",questionOptional:"Question ou intention (facultative pour l’instant)"},
  DE:{demo:"TEMPORÄRE TESTDATEN",synthesis:"Synthese",guidance:"Orientierung",method:"Methode und Umfang",questionOptional:"Frage oder Absicht (vorerst optional)"},
  PT:{demo:"DADOS TEMPORÁRIOS DE TESTE",synthesis:"Síntese",guidance:"Orientação",method:"Método e escopo",questionOptional:"Pergunta ou intenção (opcional por enquanto)"},
};

const reduce = (value:number) => { let result=value; while(result>9 && ![11,22,33].includes(result)) result=String(result).split("").reduce((sum,digit)=>sum+Number(digit),0); return result; };
const letterValue = (letter:string) => ((letter.charCodeAt(0)-65)%9)+1;
function numerologyValues(name:string,date:string,targetDate?:string){ const clean=name.normalize("NFD").replace(/[^a-z]/gi,"").toUpperCase(); const vowels=new Set(["A","E","I","O","U"]); const digits=date.replace(/\D/g,"").split("").map(Number); const targetYear=Number(targetDate?.slice(0,4))||new Date().getFullYear(); const [year,month,day]=date.split("-").map(Number); return { life:reduce(digits.reduce((a,b)=>a+b,0)), expression:reduce([...clean].reduce((a,b)=>a+letterValue(b),0)), soul:reduce([...clean].filter(c=>vowels.has(c)).reduce((a,b)=>a+letterValue(b),0)), year:reduce(reduce(day)+reduce(month)+reduce(targetYear)), birthday:reduce(day), birthYear:year }; }

export function AstroConsultationFlow({ discipline, focus, focusIndex, lang }: { discipline: AstroDiscipline; focus: string; focusIndex: number; lang: Language }) {
  const [form,setForm]=useState<FormState>(initial);
  const [submitted,setSubmitted]=useState<AstroConsultationPayload|null>(null);
  const [error,setError]=useState("");
  const t={...copy[lang],...selectorCopy[lang],...resultCopy[lang]};
  const numbers=useMemo(()=>discipline==="numerology"&&submitted?numerologyValues(submitted.birthName||submitted.name,submitted.birthDate,submitted.targetDate):null,[discipline,submitted]);
  useEffect(()=>{ setSubmitted(null); setError(""); window.setTimeout(()=>document.querySelector(".astro-consultation-flow")?.scrollIntoView({behavior:"smooth",block:"start"}),50); },[focus]);
  const update=(key:keyof FormState,value:string)=>setForm(current=>({...current,[key]:value}));
  function submit(event:React.FormEvent){ event.preventDefault(); const required=discipline==="numerology"?[form.birthName,form.birthDate]:[form.name,form.birthDate,form.birthHour,form.birthCountry,form.birthCity,form.timezone]; if(required.some(value=>!value?.trim())){setError(t.required);return;} setError(""); setSubmitted({discipline,focus,language:lang,...form,birthTime:`${form.birthHour}:${form.birthMinute}`,birthPlace:`${form.birthCity}, ${form.birthCountry}`,currentPlace:form.currentCity&&form.currentCountry?`${form.currentCity}, ${form.currentCountry}`:""}); window.setTimeout(()=>document.querySelector(".astro-result")?.scrollIntoView({behavior:"smooth",block:"start"}),50); }
  const disciplineClass=`astro-consultation-${discipline}`;
  if(submitted){const interpretation=createAstroInterpretation(submitted,focusIndex,numbers);return <section className={`astro-consultation-flow astro-result ${disciplineClass}`}><button className="astro-edit" onClick={()=>setSubmitted(null)}>← {t.new}</button><div className="astro-result-hero"><img src={interpretation.image} alt=""/><div><small>{t.result}</small><h2>{interpretation.title}</h2><p><b>{t.focus}:</b> {focus}</p></div></div><AstroInterpretationChart discipline={discipline} focusIndex={focusIndex} lang={lang} numbers={numbers}/><div className="astro-result-grid"><article><small>{t.data}</small><h3>{submitted.birthName||submitted.name}</h3><p>{submitted.birthDate}{submitted.birthTime?` · ${submitted.birthTime}`:""}</p><p>{submitted.birthPlace}</p>{submitted.question&&<p>{submitted.question}</p>}</article><article><small>{t.calculation}</small>{numbers?<div className="astro-number-grid"><b>{numbers.life}<span>{t.life}</span></b><b>{numbers.expression}<span>{t.expression}</span></b><b>{numbers.soul}<span>{t.soul}</span></b><b>{numbers.year}<span>{t.year}</span></b></div>:<div className="astro-key-grid">{interpretation.keys.map(item=><p key={item.label}><span>{item.label}</span><b>{item.value}</b></p>)}</div>}</article><article className="astro-reading"><small>{t.synthesis}</small><p>{interpretation.summary}</p></article><article className="astro-reading"><small>{t.guidance}</small><p>{interpretation.guidance}</p></article><article className="astro-interpretation-contract"><small>{t.method}</small><p>{interpretation.method}</p></article></div></section>}
  return <section className={`astro-consultation-flow ${disciplineClass}`}>
    <header><small>{t.eyebrow}</small><h2>{t.title}</h2><p>{t.subtitle}</p><b className="astro-demo-badge">{t.demo}</b></header>
    <form onSubmit={submit} noValidate><div className="astro-form-grid">
      {discipline==="numerology"?<><label>{t.birthName}<input required value={form.birthName} onChange={e=>update("birthName",e.target.value)}/></label><label>{t.currentName}<input value={form.currentName} onChange={e=>update("currentName",e.target.value)}/></label></>:<label>{t.name}<input required value={form.name} onChange={e=>update("name",e.target.value)}/></label>}
      <label>{t.date}<input type="date" required value={form.birthDate} onInput={e=>update("birthDate",e.currentTarget.value)}/></label>
      {discipline!=="numerology"&&<>
        <fieldset className="astro-time-field"><legend>{t.time}</legend><label>{t.hour}<select required value={form.birthHour} onChange={e=>update("birthHour",e.target.value)}><option value="">{t.choose}</option>{hours.map(hour=><option value={hour} key={hour}>{hour}</option>)}</select></label><label>{t.minute}<select value={form.birthMinute} onChange={e=>update("birthMinute",e.target.value)}>{minutes.map(minute=><option value={minute} key={minute}>{minute}</option>)}</select></label><small>{t.exactTime}</small></fieldset>
        <label>{t.country}<select required value={form.birthCountry} onChange={e=>setForm(current=>({...current,birthCountry:e.target.value,birthCity:""}))}><option value="">{t.choose}</option>{Object.keys(locations).map(country=><option value={country} key={country}>{country}</option>)}</select></label>
        <label>{t.city}<select required disabled={!form.birthCountry} value={form.birthCity} onChange={e=>update("birthCity",e.target.value)}><option value="">{t.choose}</option>{(locations[form.birthCountry]||[]).map(city=><option value={city} key={city}>{city}</option>)}</select></label>
        <label>{t.timezone}<select required value={form.timezone} onChange={e=>update("timezone",e.target.value)}>{timezones.map(zone=><option value={zone} key={zone}>{zone}</option>)}</select></label>
        <label>{t.currentCountry}<select value={form.currentCountry} onChange={e=>setForm(current=>({...current,currentCountry:e.target.value,currentCity:""}))}><option value="">{t.choose}</option>{Object.keys(locations).map(country=><option value={country} key={country}>{country}</option>)}</select></label>
        <label>{t.currentPlace}<select disabled={!form.currentCountry} value={form.currentCity} onChange={e=>update("currentCity",e.target.value)}><option value="">{t.choose}</option>{(locations[form.currentCountry]||[]).map(city=><option value={city} key={city}>{city}</option>)}</select></label>
        <label>{t.target}<input type="date" value={form.targetDate} onInput={e=>update("targetDate",e.currentTarget.value)}/></label>
      </>}
      {discipline==="eastern"&&<><label>{t.calendar}<select value={form.calendar} onChange={e=>update("calendar",e.target.value)}><option value="solar">{t.solar}</option><option value="lunar">{t.lunar}</option></select></label><label>{t.gender}<select value={form.gender} onChange={e=>update("gender",e.target.value)}><option value="">—</option><option value="female">{t.female}</option><option value="male">{t.male}</option><option value="other">{t.other}</option></select></label></>}
      <label className="astro-question">{t.questionOptional}<textarea rows={4} value={form.question} onChange={e=>update("question",e.target.value)}/></label>
    </div>{error&&<p className="astro-form-error" role="alert">{error}</p>}<button className="astro-submit" type="submit">{t.submit} →</button></form>
  </section>;
}
