import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {angelCatalog} from "../app/library-data.ts";
import {oshoZenReference,powerAnimals} from "../app/extended-library-data.ts";
import {classicTarotSpreads} from "../app/tarot-spreads.ts";
import {buildOracleEditorialOutput,interpretOracleCardInPosition,oracleSemanticOverlap} from "../app/oracle-analysis.js";
import {getOracleSpreadOutputContract,ORACLE_VERDICTS} from "../app/oracle-output-contracts.js";
import {getSpreadGrammar} from "../app/tarot-spread-grammar.js";

const decks={
 zen:oshoZenReference.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.group} · ${card.phase}`,message:card.message,detail:`${card.question} ${card.action}`})),
 angels:angelCatalog.map(card=>({id:card.id,name:card.name,image:card.image,theme:`${card.role} · ${card.family}`,message:card.message,detail:`${card.attribute}. ${card.keys.join(", ")}. Tradición de referencia: ${card.tradition}.`})),
 animals:powerAnimals.map(card=>({id:card.id,name:card.name,image:card.image,theme:card.meaning,message:card.message,detail:`Su cualidad es ${card.meaning.toLowerCase()}.`})),
};

const output=(system,spread,cards=decks[system].slice(0,spread.positions.length),drawId="test")=>buildOracleEditorialOutput({system,spread,cards,drawId});
const rotated=(items,count,offset)=>Array.from({length:count},(_,index)=>items[(offset+index)%items.length]);
const spreadNamed=name=>classicTarotSpreads.find(item=>item.name===name);

test("Zen, Ángeles y Animales de Poder cubren las 39 lecturas completas",()=>{
 assert.equal(classicTarotSpreads.length,39);
 for(const system of Object.keys(decks))for(const spread of classicTarotSpreads){
  const result=output(system,spread);
  assert.equal(result.debug.fallbackUsed,false,`${system}: ${spread.name} no debe usar fallback`);
  assert.ok(result.sections.length,`${system}: ${spread.name} necesita secciones`);
  assert.ok(result.story.join(" ").length>80,`${system}: ${spread.name} necesita interpretación sustantiva`);
  assert.equal(result.positionAnswers.length,spread.positions.length);
  assert.deepEqual(new Set(result.positionAnswers.map(item=>item.cardId)).size,spread.positions.length);
  assert.deepEqual(new Set(result.narrativeSynthesis.sourcePositionIds).size,spread.positions.length);
  assert.ok(result.sections.every(item=>item.sourceCardIds.length&&item.sourcePositionIds.length));
 }
});

test("cada sistema conserva una voz propia y evita promesas sobrenaturales",()=>{
 const spread=classicTarotSpreads.find(item=>item.name==="Situación, obstáculo y consejo");
 const zen=output("zen",spread).story.join(" "),angels=output("angels",spread).story.join(" "),animals=output("animals",spread).story.join(" ");
 assert.match(zen,/movimiento|consciente|experiencia|reconoce/i);
 assert.doesNotMatch(zen,/arcángel|animal aliado|te sucederá|destino fijo/i);
 assert.match(angels,/orientación|mensaje|guía/i);
 assert.doesNotMatch(angels,/milagro garantizado|se cumplirá|certeza absoluta/i);
 assert.match(animals,/instinto|recurso|movimiento|conducta/i);
 assert.doesNotMatch(animals,/tu tótem asignado|nación indígena|espíritu te ordena/i);
 assert.equal(new Set([zen,angels,animals]).size,3);
});

test("la misma carta responde de manera distinta cuando cambia de función",()=>{
 for(const system of Object.keys(decks)){
  const card=decks[system][0];
  const situation=getSpreadGrammar("Situación, obstáculo y consejo").positions[0];
  const obstacle=getSpreadGrammar("Situación, obstáculo y consejo").positions[1];
  const advice=getSpreadGrammar("Situación, obstáculo y consejo").positions[2];
  const answers=[situation,obstacle,advice].map(position=>interpretOracleCardInPosition({system,card,position}).answer);
  assert.equal(new Set(answers).size,3,`${system} debe cambiar situación, obstáculo y consejo`);
  assert.match(answers[1],/delicado|advertencia|precaución|dificultad|punto ciego|evitar/i);
  assert.match(answers[2],/práctica|respuesta|movimiento|hechos|expresar/i);
 }
});

test("una carta produce mensajes específicos y no repite una plantilla única",()=>{
 const spread=classicTarotSpreads[0];
 for(const system of Object.keys(decks)){
  const messages=decks[system].slice(0,10).map(card=>output(system,spread,[card],card.id).story.join(" "));
  assert.equal(new Set(messages).size,10);
  assert.ok(messages.every(text=>text.split(/\s+/).length>=12));
 }
});

test("cambiar las cartas cambia la tesis sin dejar referencias residuales",()=>{
 const spread=classicTarotSpreads.find(item=>item.name==="Cruz Celta — 10 cartas");
 for(const system of Object.keys(decks)){
  const first=output(system,spread,decks[system].slice(0,10),`${system}-a`);
  const second=output(system,spread,decks[system].slice(10,20),`${system}-b`);
  assert.notEqual(first.narrativeSynthesis.reading_thesis,second.narrativeSynthesis.reading_thesis);
  assert.notDeepEqual(first.narrativeSynthesis.sourceCardIds,second.narrativeSynthesis.sourceCardIds);
  assert.equal(second.drawId,`${system}-b`);
 }
});

test("las tiradas profundas mantienen su arquitectura editorial",()=>{
 const expected=new Map([
  ["Cruz Celta — 10 cartas",["El asunto y su tensión","De dónde viene y qué se abre","Tu respuesta y el entorno","Dirección probable"]],
  ["Los siete chakras",["Arraigo y deseo","Voluntad","Vínculo","Expresión y visión","Sentido","Flujo general"]],
  ["Árbol de la Vida — 10 cartas",["Principio, impulso y forma","Expansión y límite","Integración","Deseo, pensamiento y fundamento","Manifestación"]],
  ["Camino espiritual — 12 cartas",["El llamado","Guía y umbral","Prueba y elección","Entrega e integración"]],
 ]);
 for(const [name,titles] of expected){
  const spread=classicTarotSpreads.find(item=>item.name===name);
  for(const system of Object.keys(decks))assert.deepEqual(output(system,spread).sections.map(item=>item.title),titles);
 }
});

test("Sí / No razonado siempre entrega veredicto, explicación, condición y advertencia",()=>{
 const spread=spreadNamed("Sí / No razonado — respuesta, condición y advertencia"),valid=new Set(Object.values(ORACLE_VERDICTS));
 for(const system of Object.keys(decks))for(let draw=0;draw<10;draw++){
  const result=output(system,spread,rotated(decks[system],3,draw),`${system}-yes-no-${draw}`);
  assert.ok(valid.has(result.verdict.code));
  assert.equal(result.sections[0].title,"Respuesta");
  assert.match(result.sections[0].body,/^(Sí|Sí, con condiciones|No por ahora|No|Indeterminado)\.$/);
  assert.deepEqual(result.sections.slice(0,4).map(item=>item.title),["Respuesta","Por qué","Condición","Advertencia"]);
  assert.ok(result.sections.slice(1,4).every(item=>item.body.length>35));
  assert.equal(result.contractValidation.valid,true);
 }
});

test("los contratos obligatorios se cumplen en las ocho familias críticas",()=>{
 const names=[
  "Sí / No razonado — respuesta, condición y advertencia","Qué siente, qué piensa y qué hará","Oportunidad, riesgo y estrategia","Camino A frente a Camino B","Qué ocurre si actúo / si no actúo","Tres cartas — pasado, presente y tendencia","Árbol de la Vida — 10 cartas","Los siete chakras"
 ];
 for(const name of names){const spread=spreadNamed(name),contract=getOracleSpreadOutputContract(name,spread.positions);for(const system of Object.keys(decks)){
  const result=output(system,spread);
  assert.equal(result.contractValidation.valid,true,`${system}: ${name}`);
  const answered=new Set(result.sections.flatMap(item=>item.answerKeys));if(result.verdict)answered.add("verdict");
  for(const required of contract.requiredAnswers)assert.ok(answered.has(required),`${system}: ${name} debe responder ${required}`);
 }}
});

test("sentir, pensar y actuar permanecen en planos diferentes",()=>{
 const spread=spreadNamed("Qué siente, qué piensa y qué hará");
 for(const system of Object.keys(decks)){const result=output(system,spread),sections=Object.fromEntries(result.sections.map(item=>[item.id,item.body]));
  assert.match(sections.feeling,/afectiv|emocional/i);
  assert.match(sections.thought,/mental|pensamiento|evaluación/i);
  assert.match(sections.action,/probablemente|conducta más probable/i);
  assert.notEqual(sections.feeling,sections.thought);assert.notEqual(sections.thought,sections.action);
 }
});

test("Oportunidad, riesgo y estrategia utiliza títulos literales y síntesis nueva",()=>{
 const spread=spreadNamed("Oportunidad, riesgo y estrategia");
 for(const system of Object.keys(decks)){const result=output(system,spread),titles=result.sections.map(item=>item.title);
  assert.deepEqual(titles,["Oportunidad","Riesgo","Estrategia","Síntesis"]);
  assert.ok(result.sections[3].sourceCardIds.length===3);
  assert.ok(result.sections[3].body!==result.sections[0].body&&result.sections[3].body!==result.sections[1].body);
 }
});

test("Camino A/B y Actúo/No actúo terminan en una comparación que distingue alternativas",()=>{
 for(const name of ["Camino A frente a Camino B","Qué ocurre si actúo / si no actúo"]){const spread=spreadNamed(name);for(const system of Object.keys(decks)){const result=output(system,spread),last=result.sections.at(-1);
  assert.equal(last.title,"Comparación");assert.match(last.body,/mientras|no ofrecen lo mismo|diferencia/i);assert.ok(last.sourceCardIds.length>=4);
 }}
});

test("150 lecturas evitan repetición mecánica dentro del mismo resultado",()=>{
 const mechanical=/No necesitas resolverlo todo ahora|observa con honestidad|acción pequeña y verificable|haz espacio para la experiencia|convierte la comprensión en una acción pequeña/i;
 for(const system of Object.keys(decks))for(let draw=0;draw<50;draw++){
  const spread=classicTarotSpreads[draw%classicTarotSpreads.length],cards=rotated(decks[system],spread.positions.length,draw),result=output(system,spread,cards,`${system}-repeat-${draw}`),text=result.story.join(" ");
  const sentences=text.split(/(?<=[.!?])\s+/).map(item=>normalizeForTest(item)).filter(item=>item.split(" ").length>4);
  assert.equal(new Set(sentences).size,sentences.length,`${system}: ${spread.name} repite una frase exacta`);
  assert.doesNotMatch(text,mechanical);
  const openings=result.sections.map(item=>normalizeForTest(item.body).split(" ").slice(0,6).join(" "));
  for(let index=1;index<openings.length;index++)assert.notEqual(openings[index],openings[index-1],`${system}: ${spread.name} repite apertura consecutiva`);
  if(result.showWarning&&result.showAdvice){assert.notEqual(result.caution,result.advice);assert.ok(oracleSemanticOverlap(result.caution,result.advice)<.35);}
  if(result.showWarning)assert.ok(oracleSemanticOverlap(result.caution,text)<.43);
  if(result.showAdvice)assert.ok(oracleSemanticOverlap(result.advice,text)<.43);
 }
});

function normalizeForTest(value){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();}

test("los tres sistemas responden las mismas posiciones sin perder identidad",()=>{
 const spread=spreadNamed("Oportunidad, riesgo y estrategia"),texts=Object.fromEntries(Object.keys(decks).map(system=>[system,output(system,spread).story.join(" ")]));
 assert.match(texts.zen,/experiencia|consciente|movimiento|patrón/i);
 assert.match(texts.angels,/orientación|figura|mensaje simbólico/i);
 assert.match(texts.animals,/cualidad|recurso|impulso|conducta/i);
 assert.equal(new Set(Object.values(texts)).size,3);
 assert.doesNotMatch(texts.zen,/arcángel|misericordia angelical|instinto animal|arcano/i);
 assert.doesNotMatch(texts.angels,/no identificación|instinto animal|conducta zoológica/i);
 assert.doesNotMatch(texts.animals,/arcángel|arcano|sefirá|misericordia divina/i);
});

test("cada conclusión conserva procedencia de cartas, mensajes, posiciones y relaciones",()=>{
 for(const system of Object.keys(decks))for(const spread of classicTarotSpreads){const result=output(system,spread);
  for(const item of result.sections){assert.ok(item.sourceCardIds.length);assert.ok(item.sourceMessageIds.length);assert.ok(item.sourcePositionIds.length);assert.ok(Array.isArray(item.sourceRelationIds));}
  for(const answer of result.positionAnswers){assert.equal(answer.sourceCardIds.length,1);assert.equal(answer.sourceMessageIds.length,1);assert.equal(answer.sourcePositionIds.length,1);assert.ok(Array.isArray(answer.sourceRelationIds));}
 }
});

test("los títulos interpretativos cambian según el contrato de la tirada",()=>{
 const cases=new Map([["Sí / No razonado — respuesta, condición y advertencia","Respuesta razonada"],["Qué siente, qué piensa y qué hará","Lo que muestra el vínculo"],["Oportunidad, riesgo y estrategia","Oportunidad, riesgo y estrategia"],["Árbol de la Vida — 10 cartas","Recorrido del Árbol de la Vida"],["Los siete chakras","Lectura de los siete centros"]]);
 for(const [name,title] of cases){const spread=spreadNamed(name);for(const system of Object.keys(decks))assert.equal(output(system,spread).title,title);}
});

test("Tarot Clásico permanece fuera del motor de los tres oráculos",()=>{
 const source=readFileSync(new URL("../app/oracle-analysis.js",import.meta.url),"utf8");
 assert.doesNotMatch(source,/analyzeTarotReading|buildTarotEditorialOutput|riderDeck/);
});

test("la salida visible elimina el antiguo texto mecánico",()=>{
 const forbidden=/La lectura comienza|Después aparece|Al ocupar el lugar|sugiere trabajar|carta número|cluster|fallback/i;
 for(const system of Object.keys(decks))for(const spread of classicTarotSpreads){
  const result=output(system,spread),visible=[...result.story,result.caution,result.advice,...result.positionAnswers.map(item=>item.answer)].join(" ");
  assert.doesNotMatch(visible,forbidden,`${system}: ${spread.name}`);
 }
});
