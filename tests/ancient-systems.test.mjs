import test from "node:test";
import assert from "node:assert/strict";
import {castIChing,ichingConsultations,interpretIChing,interpretRuneSpread,runeMeanings,runeReadingGroups} from "../app/ancient-systems.ts";

test("el menú de Runas contiene exactamente 24 tiradas completas",()=>{
 const spreads=runeReadingGroups.flatMap(group=>group.items);
 assert.equal(spreads.length,24);
 assert.equal(new Set(spreads.map(item=>item.id)).size,24);
 assert.ok(spreads.every(item=>item.positions.length>=1&&item.positions.length<=12));
});

test("el Elder Futhark contiene 24 runas con significado específico",()=>{
 assert.equal(runeMeanings.length,24);
 assert.equal(new Set(runeMeanings.map(item=>item.name)).size,24);
 assert.ok(runeMeanings.every(item=>item.symbol&&item.core&&item.resource&&item.risk&&item.action));
});

test("las 24 tiradas de Runas producen interpretación por posición y síntesis",()=>{
 for(const spread of runeReadingGroups.flatMap(group=>group.items)){
  const result=interpretRuneSpread(spread,runeMeanings.slice(0,spread.positions.length));
  assert.equal(result.positionAnswers.length,spread.positions.length,spread.name);
  assert.ok(result.positionAnswers.every(answer=>answer.answer.length>35&&answer.rune.name));
  assert.ok(result.sections.every(section=>section.body.length>35&&section.sourceRuneIds.length&&section.sourcePositionIds.length));
  assert.ok(result.summary.length>100);
  assert.ok(result.narrativeSynthesis.sourceRuneIds.length===spread.positions.length);
 }
});

test("Sí / No rúnico entrega un veredicto visible",()=>{
 const spread=runeReadingGroups.flatMap(group=>group.items).find(item=>item.id==="reasoned");
 const result=interpretRuneSpread(spread,runeMeanings.slice(0,3));
 assert.ok(["Sí","Sí, con condiciones","No por ahora","La respuesta todavía no está definida"].includes(result.verdict));
});

test("el I Ching contiene 14 tipos de consulta sin convertirlos en tiradas de Tarot",()=>{
 assert.equal(ichingConsultations.length,14);
 assert.equal(new Set(ichingConsultations.map(item=>item.id)).size,14);
 assert.ok(ichingConsultations.every(item=>item.focus&&item.description));
});

test("el método de tres monedas produce seis líneas válidas",()=>{
 let seed=0;
 const lines=castIChing(()=>((seed++*37)%100)/100);
 assert.equal(lines.length,6);
 assert.ok(lines.every(line=>[6,7,8,9].includes(line.value)));
 assert.ok(lines.every(line=>line.yang===(line.value===7||line.value===9)));
 assert.ok(lines.every(line=>line.changing===(line.value===6||line.value===9)));
});

test("seis líneas yang mutantes transforman Lo Creativo en Lo Receptivo",()=>{
 const lines=castIChing(()=>.9);
 const result=interpretIChing(ichingConsultations[0],lines);
 assert.equal(result.primary.number,1);
 assert.equal(result.transformed.number,2);
 assert.deepEqual(result.changingLines,[1,2,3,4,5,6]);
});

test("las 14 consultas interpretan hexagrama principal, cambio y dirección resultante",()=>{
 const values=[6,7,8,9,7,8];
 const lines=values.map(value=>({value,yang:value===7||value===9,changing:value===6||value===9}));
 for(const consultation of ichingConsultations){
  const result=interpretIChing(consultation,lines);
  assert.ok(result.primary.number>=1&&result.primary.number<=64);
  assert.ok(result.transformed.number>=1&&result.transformed.number<=64);
  assert.ok(result.nuclear.number>=1&&result.nuclear.number<=64);
  assert.ok(result.sections.length>=3);
  assert.ok(result.sections.every(section=>section.sourceHexagramIds.length&&section.sourceConsultationIds.length));
  assert.ok(result.story.join(" ").includes(result.primary.name));
  assert.ok(result.summary.length>100);
  assert.ok(result.narrativeSynthesis.sourceHexagramIds.length>=2);
 }
});

test("la respuesta razonada del I Ching comienza con una orientación explícita",()=>{
 const consultation=ichingConsultations.find(item=>item.id==="reasoned");
 const result=interpretIChing(consultation,castIChing(()=>.2));
 assert.equal(result.sections[0].title,"Orientación");
 assert.ok(["Favorable","Favorable con condiciones","Conviene esperar","Desfavorable por ahora"].includes(result.verdict));
 assert.deepEqual(result.sections.slice(0,4).map(section=>section.title),["Orientación","Por qué","Condición","Advertencia"]);
});

test("Runas distingue sentir, pensar y actuar antes de sintetizar",()=>{
 const spread=runeReadingGroups.flatMap(group=>group.items).find(item=>item.id==="feel-think-act");
 const result=interpretRuneSpread(spread,runeMeanings.slice(3,6));
 assert.deepEqual(result.sections.map(section=>section.title),["Qué siente","Qué piensa","Qué probablemente hará","Cómo se relacionan"]);
 assert.match(result.sections[0].body,/afectiva/i);
 assert.match(result.sections[1].body,/mental/i);
 assert.match(result.sections[2].body,/conducta observable/i);
});

test("Runas compara caminos y actuar o esperar con consecuencias distintas",()=>{
 for(const id of ["two-paths","act-or-not"]){
  const spread=runeReadingGroups.flatMap(group=>group.items).find(item=>item.id===id),result=interpretRuneSpread(spread,runeMeanings.slice(5,10));
  assert.equal(result.sections.at(-1).title,"Comparación");
  assert.match(result.sections.at(-1).body,/diferencia|alternativas|salida/i);
 }
});

test("I Ching adapta la interpretación al tipo de consulta",()=>{
 const lines=[6,7,8,9,7,8].map(value=>({value,yang:value===7||value===9,changing:value===6||value===9}));
 const cases=new Map([
  ["two-options",["La alternativa que se alinea","La alternativa que acumula fricción","Comparación"]],
  ["relationship",["Dinámica del vínculo","Lo que necesita cuidado","Dirección resultante"]],
  ["work",["Condiciones del proyecto","Lo que está cambiando","Estrategia práctica","Dirección resultante"]],
  ["money",["La restricción","Movimiento posible","Dirección resultante"]],
 ]);
 for(const [id,titles] of cases){const consultation=ichingConsultations.find(item=>item.id===id),result=interpretIChing(consultation,lines);assert.deepEqual(result.sections.map(section=>section.title),titles);}
});

test("I Ching integra presente, fondo interno, cambio y consecuencia sin repetir una definición",()=>{
 const lines=[6,7,8,9,7,8].map(value=>({value,yang:value===7||value===9,changing:value===6||value===9}));
 for(const consultation of ichingConsultations){
  const result=interpretIChing(consultation,lines),story=result.story.join(" ");
  assert.ok(story.includes(result.primary.name),consultation.id);
  assert.ok(story.includes(result.nuclear.name)||consultation.id==="reasoned",consultation.id);
  assert.doesNotMatch(story,/El segundo hexagrama no promete|describe .*\. .*describe|la ausencia de mutación no significa/i);
  assert.equal(new Set(result.sections.map(section=>section.body)).size,result.sections.length,consultation.id);
 }
});

test("la consulta profunda del I Ching construye una secuencia causal y una advertencia concreta",()=>{
 const consultation=ichingConsultations.find(item=>item.id==="deep"),lines=[6,7,8,9,7,8].map(value=>({value,yang:value===7||value===9,changing:value===6||value===9})),result=interpretIChing(consultation,lines);
 assert.deepEqual(result.sections.map(section=>section.title),["Cómo llegaste a este punto","Lo que opera por debajo","El punto decisivo","La dirección probable"]);
 assert.match(result.sections.at(-1).body,/Si no haces ese ajuste, el riesgo/i);
 assert.ok(result.sections.at(-1).sourceHexagramIds.length>=2);
});

test("advertencia y orientación no duplican la narración principal",()=>{
 for(const spread of runeReadingGroups.flatMap(group=>group.items)){
  const result=interpretRuneSpread(spread,runeMeanings.slice(0,spread.positions.length)),main=result.story.join(" ");
  if(result.showWarning)assert.notEqual(result.caution,main);
  if(result.showAdvice){assert.notEqual(result.advice,main);assert.notEqual(result.advice,result.caution);}
 }
 for(const consultation of ichingConsultations){const result=interpretIChing(consultation,castIChing(()=>.9)),main=result.story.join(" ");if(result.showWarning)assert.notEqual(result.caution,main);if(result.showAdvice){assert.notEqual(result.advice,main);assert.notEqual(result.advice,result.caution);}}
});

test("Runas narra Sombra, aprendizaje y recurso sin repetir definiciones mecánicas",()=>{
 const spread=runeReadingGroups.flatMap(group=>group.items).find(item=>item.id==="shadow-learning-resource");
 const result=interpretRuneSpread(spread,[runeMeanings[1],runeMeanings[8],runeMeanings[18]]);
 assert.deepEqual(result.sections.map(section=>section.title),["El patrón que te está frenando","Cómo transformarlo"]);
 assert.doesNotMatch(result.story.join(" "),/el patrón que necesita revisión|el aprendizaje consiste|el recurso disponible es/i);
 assert.match(result.sections[1].body,/no para seguir tolerando el mismo patrón/i);
});

test("la Cruz rúnica completa construye una historia causal y no enumera posiciones",()=>{
 const spread=runeReadingGroups.flatMap(group=>group.items).find(item=>item.id==="rune-cross-nine");
 const result=interpretRuneSpread(spread,runeMeanings.slice(3,12));
 assert.deepEqual(result.sections.map(section=>section.title),["Cómo llegaste aquí","El punto decisivo","Lo que no conviene ignorar","La dirección probable"]);
 assert.doesNotMatch(result.story.join(" "),/tu respuesta se relaciona|la otra parte muestra|el antecedente muestra/i);
 assert.match(result.sections.at(-1).body,/si haces ese ajuste|si no/i);
});

test("cada runa ofrece una acción práctica propia",()=>{
 assert.equal(new Set(runeMeanings.map(rune=>rune.action)).size,24);
 assert.ok(runeMeanings.every(rune=>rune.action.length>=55));
 assert.ok(runeMeanings.every(rune=>!rune.action.includes("Lleva esta cualidad")));
});
