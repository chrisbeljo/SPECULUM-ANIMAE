import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {analyzeTarotReading,buildTarotEditorialOutput,composeTarotInterpretation,deriveTarotGuidance,interpretCardInPosition,resolveSpreadNarrativeStrategy,semanticSimilarity,validateSemanticTrace} from "../app/tarot-analysis.js";
import {getSpreadGrammar,listSpreadGrammars,TAROT_OUTPUT_STRATEGIES} from "../app/tarot-spread-grammar.js";
import {riderDeck} from "../app/rider-deck.ts";

const c=(id,name,arcana,suit,number,keys,general,reversed="bloqueo o exceso")=>({id,name,arcana,suit,number,keys,general,reversed,isReversed:false});
const bank=[
 c("02","La Sacerdotisa","Mayor",null,2,["intuición","pausa","profundidad"],"Hay información sutil todavía no revelada."),
 c("09","El Ermitaño","Mayor",null,9,["introspección","prudencia","sabiduría"],"La claridad requiere retirar ruido externo."),
 c("13","La Muerte","Mayor",null,13,["cierre","transformación","renovación"],"Una etapa termina para liberar otra forma."),
 c("17","La Estrella","Mayor",null,17,["esperanza","autenticidad","renovación"],"Se recuperan confianza y dirección."),
 c("10","La Rueda","Mayor",null,10,["cambio","ciclo","adaptación"],"Las circunstancias entran en movimiento."),
 c("sw-ace","As de Espadas","Menor","Espadas",1,["claridad","verdad","decisión"],"Una verdad corta la confusión."),
 c("pe-8","Ocho de Oros","Menor","Oros",8,["práctica","detalle","maestría"],"El progreso necesita trabajo constante."),
 c("06","Los Enamorados","Mayor",null,6,["elección","vínculo","valores"],"Una elección debe coincidir con los valores."),
 c("cu-2","Dos de Copas","Menor","Copas",2,["encuentro","reciprocidad","acuerdo"],"Dos partes pueden encontrarse con reciprocidad."),
 c("14","La Templanza","Mayor",null,14,["equilibrio","integración","paciencia"],"La salida combina elementos gradualmente."),
 c("00","El Loco","Mayor",null,0,["inicio","libertad","confianza"],"Un comienzo abre movimiento."),
 c("01","El Mago","Mayor",null,1,["iniciativa","recursos","acción"],"Hay recursos para actuar."),
];
const judgement=c("20","El Juicio","Mayor",null,20,["despertar","llamado","renacimiento","decisión"],"Una verdad del pasado llama a despertar y decidir con conciencia.");
const celtic=["Situación","Lo que cruza","Base","Pasado","Posibilidad","Futuro cercano","Actitud","Entorno","Esperanzas y temores","Tendencia"];
const analyze=(spread,positions,cards,category="Consulta general",question="")=>analyzeTarotReading({spread,positions,cards,category,question,orientationEnabled:false});

test("Cruz Celta de validación descubre ejes y tensión funcional",()=>{
 const analysis=analyze("Cruz Celta — 10 cartas",celtic,bank.slice(0,10));
 assert.ok(analysis.narrativeClusters.some(x=>x.theme==="claridad y conocimiento"&&x.cards.length>=3));
 assert.ok(analysis.narrativeClusters.some(x=>x.theme==="transformación y cambio"&&x.cards.length>=2));
 assert.ok(analysis.conflictingPairs.some(x=>x.cards.includes("El Ermitaño")));
 assert.equal(analysis.structuralWeight.majorArcanaCount,7);
 assert.match(analysis.trendSynthesis,/no constituye un destino fijo/i);
});

test("la posición modifica una cualidad repetida",()=>{
 const analysis=analyze("Situación, obstáculo y consejo",["Situación","Obstáculo","Consejo"],[bank[0],bank[1],bank[5]]);
 assert.equal(analysis.positionDynamics[1].positionFunction,"tensiona o modifica");
 assert.ok(analysis.conflictingPairs.length>0);
});

test("la categoría cambia la aplicación sin inventar hechos",()=>{
 const cards=[bank[7],bank[8],bank[6]],positions=["Tú","La otra persona","El vínculo"];
 const love=composeTarotInterpretation(analyze("Tú, la otra persona y el vínculo",positions,cards,"Amor y relaciones","¿Qué ocurre entre nosotros?"),cards).join(" ");
 const work=composeTarotInterpretation(analyze("Tú, la otra persona y el vínculo",positions,cards,"Trabajo","¿Conviene asociarnos?"),cards).join(" ");
 assert.notEqual(love,work);assert.match(love,/reciprocidad|afectiv/i);assert.match(work,/asociaciones|colaboración/i);assert.doesNotMatch(love,/te ama/i);
});

test("trece lecturas cambian tesis, grupos y estructura narrativa",()=>{
 const houses=["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"];
 const cases=[
  ["Cruz Celta — 10 cartas",celtic,bank.slice(0,10)],
  ["Cruz Celta — 10 cartas",celtic,[...bank.slice(2,12)]],
  ["Cruz Celta — 10 cartas",celtic,[bank[7],bank[8],bank[6],bank[11],bank[10],bank[5],bank[4],bank[3],bank[2],bank[9]]],
  ["Doce casas — 12 cartas",houses,bank],
  ["Doce casas — 12 cartas",houses,[...bank.slice(4),...bank.slice(0,4)]],
  ["Doce casas — 12 cartas",houses,[bank[7],bank[1],bank[10],bank[2],bank[6],bank[0],bank[8],bank[11],bank[5],bank[4],bank[3],bank[9]]],
  ["Tres cartas — pasado, presente y tendencia",["Pasado","Presente","Tendencia"],[bank[2],bank[4],bank[9]]],
  ["Situación, obstáculo y consejo",["Situación","Obstáculo","Consejo"],[bank[0],bank[1],bank[5]]],
  ["Mente, emoción y acción",["Mente","Emoción","Acción"],[bank[5],bank[8],bank[11]]],
  ["Tú, la otra persona y el vínculo",["Tú","La otra persona","El vínculo"],[bank[7],bank[8],bank[6]]],
  ["Relación de seis cartas",["Tu energía","Su energía","Lo que une","Lo que distancia","Aprendizaje","Tendencia"],[bank[7],bank[8],bank[3],bank[1],bank[6],bank[9]]],
  ["Camino A frente a Camino B",["Situación","Camino A","Resultado A","Camino B","Resultado B"],[bank[4],bank[10],bank[6],bank[2],bank[9]]],
  ["Decisión de seis cartas",["Situación","Motivación","Camino A","Resultado A","Camino B","Resultado B"],[bank[0],bank[7],bank[11],bank[6],bank[1],bank[5]]]
 ];
 const analyses=cases.map(([spread,positions,cards])=>analyze(spread,positions,cards));
 const texts=analyses.map((analysis,index)=>composeTarotInterpretation(analysis,cases[index][2]).join("\n"));
 assert.ok(new Set(analyses.map(x=>x.centralThesis)).size>=7);
 assert.equal(new Set(texts).size,13);
 assert.ok(new Set(analyses.map(x=>x.narrativeClusters.map(c=>c.theme).join("|"))).size>=6);
 assert.ok(texts.every(text=>!/Al ocupar el lugar|Después aparece|carta número|patrón dominante|cluster|eje narrativo|peso estructural|concentración de arcanos|estas cartas se relacionan|la segunda carta confirma|movimiento principal|movimiento secundario|lectura principal/i.test(text)));
 assert.ok(bank.slice(0,10).some(card=>!texts[0].includes(card.name)),"el texto principal no debe enumerar obligatoriamente las diez cartas");
});

test("mover cartas entre áreas cambia sustancialmente la lectura",()=>{
 const positions=["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"];
 const original=analyze("Doce casas — 12 cartas",positions,bank),moved=[...bank];[moved[3],moved[9]]=[moved[9],moved[3]];[moved[5],moved[11]]=[moved[11],moved[5]];
 const changed=analyze("Doce casas — 12 cartas",positions,moved);
 const a=composeTarotInterpretation(original,bank).join(" "),b=composeTarotInterpretation(changed,moved).join(" ");
 assert.notEqual(a,b);
});

test("cambiar tres cartas importantes cambia la tesis",()=>{
 const a=analyze("Cruz Celta — 10 cartas",celtic,bank.slice(0,10));
 const changed=[bank[10],bank[11],bank[6],...bank.slice(3,10)];
 const b=analyze("Cruz Celta — 10 cartas",celtic,changed);
 assert.notEqual(a.centralThesis,b.centralThesis);
 assert.notDeepEqual(a.narrativeClusters.map(x=>x.theme),b.narrativeClusters.map(x=>x.theme));
});

test("la Cruz Celta construye arcos desde su estructura",()=>{
 const analysis=analyze("Cruz Celta — 10 cartas",celtic,bank.slice(0,10));
 assert.ok(analysis.narrativeArcs.some(arc=>arc.fromPosition==="Pasado"&&arc.toPosition==="Tendencia"&&arc.relationType==="TRANSITION"));
 assert.ok(analysis.contextualRelations.length<=4);
 assert.equal(analysis.narrativeArcs[0].relationType,"TENSION");
});

test("una inversión relevante cambia la tensión y el consejo",()=>{
 const cards=[bank[9],{...bank[8],isReversed:false},bank[3],bank[2],bank[7],bank[1],bank[0],bank[5],bank[6],bank[10]];
 const upright=analyze("Cruz Celta — 10 cartas",celtic,cards),reversedCards=cards.map((card,index)=>index===1?{...card,isReversed:true,reversed:"Desequilibrio o expectativas distintas."}:card),reversed=analyze("Cruz Celta — 10 cartas",celtic,reversedCards);
 const a=composeTarotInterpretation(upright,cards).join(" "),b=composeTarotInterpretation(reversed,reversedCards).join(" ");
 assert.notEqual(a,b);assert.match(b,/quieren cosas distintas|intercambio equilibrado|diferencia entre dos partes|desigual/i);assert.doesNotMatch(a,/quieren cosas distintas|diferencia entre dos partes|desigual/i);
 assert.notEqual(deriveTarotGuidance(upright).caution,deriveTarotGuidance(reversed).caution);
});

test("intercambiar los extremos del arco cambia la historia",()=>{
 const cards=bank.slice(0,10),moved=[...cards];[moved[3],moved[9]]=[moved[9],moved[3]];[moved[2],moved[9]]=[moved[9],moved[2]];[moved[6],moved[7]]=[moved[7],moved[6]];
 const outputA=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),outputB=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,moved),moved),a=outputA.story.join(" "),b=outputB.story.join(" ");
 assert.notEqual(a,b);assert.notEqual(outputA.narrativeSynthesis.reading_thesis,outputB.narrativeSynthesis.reading_thesis);assert.notEqual(outputA.narrativeSynthesis.main_movement,outputB.narrativeSynthesis.main_movement);assert.notEqual(outputA.narrativeSynthesis.arcs.direction,outputB.narrativeSynthesis.arcs.direction);
});

test("la lectura visible no expone pares de keywords",()=>{
 const analysis=analyze("Cruz Celta — 10 cartas",celtic,bank.slice(0,10)),text=composeTarotInterpretation(analysis,bank.slice(0,10)).join(" ");
 for(const phrase of ["cierre y transformación","esperanza y autenticidad","equilibrio e integración","encuentro y reciprocidad","elección y vínculo","introspección y prudencia","intuición y pausa","claridad y verdad","práctica y detalle","inicio y libertad"])assert.doesNotMatch(text,new RegExp(phrase,"i"));
});

test("diez consejos se derivan de historias distintas",()=>{
 const guidance=Array.from({length:10},(_,shift)=>{const cards=[...bank.slice(shift),...bank.slice(0,shift)].slice(0,10),analysis=analyze("Cruz Celta — 10 cartas",celtic,cards);return deriveTarotGuidance(analysis)});
 assert.ok(new Set(guidance.map(item=>item.caution)).size>=8);
 assert.ok(new Set(guidance.map(item=>item.advice)).size>=8);
 for(const item of guidance)assert.doesNotMatch(`${item.caution} ${item.advice}`,/revisa costos|tiempo, dinero o confianza|observa los resultados/i);
});

test("la capa editorial conserva la síntesis interna y entrega una narración separada",()=>{
 const cards=bank.slice(0,10),analysis=analyze("Cruz Celta — 10 cartas",celtic,cards),output=buildTarotEditorialOutput(analysis,cards);
 assert.ok(output.raw.story.length>=output.story.length);
 assert.notEqual(output.raw.guidance.caution,deriveTarotGuidance(analysis).caution);
 assert.ok(output.story.length>=4&&output.story.length<=6);
 assert.doesNotMatch(output.story.join(" "),/Esto interfiere directamente|La posibilidad abierta por la tirada|Tu manera de responder consiste en/i);
});

test("el editor no introduce dominios ausentes ni elimina contradicciones",()=>{
 const cards=[bank[9],{...bank[8],isReversed:true,reversed:"Desequilibrio o expectativas distintas."},bank[3],bank[2],bank[7],bank[1],bank[0],bank[5],bank[6],bank[10]];
 const output=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),text=[...output.story,output.caution,output.advice].join(" ");
 assert.match(text,/quieren cosas distintas|intercambio equilibrado|diferencia entre dos partes|desigual/i);
 assert.doesNotMatch(text,/costos|dinero|inversión|ganancia|regresará|ocurrirá/i);
 assert.match(text,/puede|posibilidad|si las condiciones|conviene|depende/i);
});

test("la longitud editorial se adapta a tiradas breves, relaciones y decisiones",()=>{
 const timeline=buildTarotEditorialOutput(analyze("Tres cartas — pasado, presente y tendencia",["Pasado","Presente","Tendencia"],[bank[2],bank[4],bank[9]]),[bank[2],bank[4],bank[9]]);
 const relationCards=[bank[7],bank[8],bank[6]],relationship=buildTarotEditorialOutput(analyze("Tú, la otra persona y el vínculo",["Tú","La otra persona","El vínculo"],relationCards,"Amor y relaciones"),relationCards);
 const decisionCards=[bank[4],bank[10],bank[6],bank[2],bank[9]],decision=buildTarotEditorialOutput(analyze("Camino A frente a Camino B",["Situación","Camino A","Resultado A","Camino B","Resultado B"],decisionCards,"Decisiones"),decisionCards);
 assert.equal(timeline.story.length,2);assert.ok(relationship.story.length>=2&&relationship.story.length<=3);assert.ok(decision.story.length>=2&&decision.story.length<=3);
 for(const output of [timeline,relationship,decision])assert.ok(output.story.every(paragraph=>paragraph.length<650));
});

test("la edición recupera lenguaje simbólico sin nombrar carta por carta",()=>{
 const cards=bank.slice(0,10),output=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),text=output.story.join(" ");
 assert.match(text,/ciclo|camino|claridad|construyas|equilibrio|búsqueda interior/i);
 assert.doesNotMatch(text,/La carta|representa|significa|indica que/i);
 assert.ok(cards.filter(card=>text.includes(card.name)).length<=1);
});

test("cuidado y consejo son breves, naturales y distintos de la historia",()=>{
 const cards=bank.slice(0,10),output=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),sentenceCount=text=>(text.match(/[.!?]+/g)||[]).length;
 assert.ok(sentenceCount(output.caution)<=2);assert.ok(sentenceCount(output.advice)<=3);
 assert.doesNotMatch(`${output.caution} ${output.advice}`,/Cuida que hay|Cuida que has|Favorecerás la tendencia|Depende de ti reconocer|Hay margen/i);
 assert.ok(!output.story.some(paragraph=>paragraph===output.caution||paragraph===output.advice));
});

test("la Cruz Celta entrega una síntesis narrativa estructurada antes de editar",()=>{
 const cards=bank.slice(0,10),output=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),s=output.narrativeSynthesis;
 assert.ok(s.reading_thesis&&s.central_tension&&s.main_movement);
 assert.deepEqual(Object.keys(s.arcs),["origin_and_present","conflict_and_opening","self_and_context","direction"]);
 assert.ok(s.key_relationships.length>=6);assert.ok(s.key_relationships.every(item=>item.importance==="high"));
 assert.ok(s.agency.depends_on_consultant.length&&s.agency.depends_on_circumstances.length);
 assert.equal(output.story.length,4);
});

test("diez Cruces Celtas conservan evidencia y producen historias diferenciadas",()=>{
 const outputs=Array.from({length:10},(_,shift)=>{const cards=[...bank.slice(shift),...bank.slice(0,shift)].slice(0,10);return buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards)});
 assert.ok(new Set(outputs.map(output=>output.narrativeSynthesis.reading_thesis)).size>=8);
 assert.ok(new Set(outputs.map(output=>output.story.join(" "))).size>=8);
 for(const output of outputs){assert.equal(output.debug.cards.length,10);assert.ok(output.debug.cards.every(item=>item.position&&item.card&&typeof item.isReversed==="boolean"&&item.meaning));assert.ok(output.debug.relationships.length);assert.equal(output.debug.narrativeSynthesis,output.narrativeSynthesis);}
});

test("cambiar sólo la Tendencia modifica la conclusión narrativa",()=>{
 const cards=bank.slice(0,10),changed=[...cards];changed[9]=bank[10];
 const a=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards),b=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,changed),changed);
 assert.notEqual(a.narrativeSynthesis.arcs.direction,b.narrativeSynthesis.arcs.direction);
 assert.notEqual(a.narrativeSynthesis.reading_thesis,b.narrativeSynthesis.reading_thesis);
 assert.notEqual(a.story.at(-1),b.story.at(-1));
});

test("cada familia de tirada declara una estrategia narrativa explícita",()=>{
 assert.deepEqual(resolveSpreadNarrativeStrategy("Cruz Celta — 10 cartas"),{strategy:"evolutionary_story",schema:"celtic"});
 assert.deepEqual(resolveSpreadNarrativeStrategy("Doce casas — 12 cartas"),{strategy:"systemic_map",schema:"twelve_houses"});
 assert.deepEqual(resolveSpreadNarrativeStrategy("Camino A frente a Camino B"),{strategy:"comparison",schema:"two_paths"});
 assert.deepEqual(resolveSpreadNarrativeStrategy("Tú, la otra persona y el vínculo"),{strategy:"relational_dynamic",schema:"three_way"});
 assert.deepEqual(resolveSpreadNarrativeStrategy("Situación, obstáculo y consejo"),{strategy:"problem_resolution",schema:"obstacle_advice"});
 assert.deepEqual(resolveSpreadNarrativeStrategy("Una carta — mensaje central"),{strategy:"focal_message",schema:"single"});
});

test("tres Doce Casas sintetizan mapas y no enumeran posiciones",()=>{
 const positions=["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"],outputs=[0,3,7].map(shift=>{const cards=[...bank.slice(shift),...bank.slice(0,shift)];return buildTarotEditorialOutput(analyze("Doce casas — 12 cartas",positions,cards),cards)}),texts=outputs.map(output=>output.story.join(" "));
 assert.equal(new Set(texts).size,3);
 for(const output of outputs){assert.equal(output.narrativeSynthesis.strategy,"houses");assert.ok(output.story.length>=3&&output.story.length<=4);assert.doesNotMatch(output.story.join(" "),/primera área|segunda área|carta (uno|dos|tres)|capacidad sin ejecución|movimiento de las circunstancias|equilibrio sostenible/i);}
});

test("tres tiradas cortas usan estructuras y longitudes diferentes",()=>{
 const oneCards=[bank[3]],problemCards=[bank[0],bank[1],bank[5]],decisionCards=[bank[4],bank[10],bank[6],bank[2],bank[9]],cases=[
  buildTarotEditorialOutput(analyze("Una carta — mensaje central",["Mensaje central"],oneCards),oneCards),
  buildTarotEditorialOutput(analyze("Situación, obstáculo y consejo",["Situación","Obstáculo","Consejo"],problemCards),problemCards),
  buildTarotEditorialOutput(analyze("Camino A frente a Camino B",["Situación","Camino A","Resultado A","Camino B","Resultado B"],decisionCards,"Decisiones"),decisionCards),
 ];
 assert.deepEqual(cases.map(output=>output.narrativeSynthesis.strategy),["focus","diagnostic","decision"]);
 assert.ok(cases[0].story.length<cases[2].story.length);assert.equal(new Set(cases.map(output=>output.story.join(" "))).size,3);
});

test("tres Cruces Celtas mantienen evolución y consejos propios",()=>{
 const outputs=[0,2,5].map(shift=>{const cards=[...bank.slice(shift),...bank.slice(0,shift)].slice(0,10);return buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards)});
 assert.equal(new Set(outputs.map(output=>output.narrativeSynthesis.main_movement)).size,3);
 assert.equal(new Set(outputs.map(output=>output.advice)).size,3);
 assert.ok(outputs.every(output=>output.narrativeSynthesis.strategy==="celtic_cross"));
});

test("Estrella, Loco y Sacerdotisa responden directamente a oportunidad, riesgo y estrategia",()=>{
 const cards=[bank[3],bank[10],bank[0]],positions=["Oportunidad","Riesgo","Estrategia"],output=buildTarotEditorialOutput(analyze("Oportunidad, riesgo y estrategia",positions,cards,"Trabajo y dinero"),cards),text=[...output.story,output.caution,output.advice].join(" ");
 assert.match(text,/oportunidad prometedora|recuperar confianza/i);
 assert.match(text,/precipitarse|confiar en exceso|sin conocer suficientemente/i);
 assert.match(text,/observar antes de actuar|reunir información|comprender mejor el terreno/i);
 assert.doesNotMatch(text,/capacidad sin ejecución|equilibrio sostenible|movimiento de las circunstancias|apertura de un camino|pausa de búsqueda interior/i);
});

test("Enamorados, Mago y Rueda responden a qué siente, piensa y hará",()=>{
 const cards=[bank[7],bank[11],bank[4]],positions=["Qué siente","Qué piensa","Qué hará"],output=buildTarotEditorialOutput(analyze("Qué siente, qué piensa y qué hará",positions,cards,"Amor y relaciones"),cards),text=output.story.join(" ");
 assert.match(text,/atracción|conexión emocional|sentimientos/i);
 assert.match(text,/mentalmente hay iniciativa|hablar|acercarse|provocar un cambio/i);
 assert.match(text,/probablemente se moverá|giro inesperado|no todo dependerá/i);
 assert.doesNotMatch(text,/Una parte se acerca de modo|encuentro recíproco/i);
});

test("pasado, presente y tendencia forman una secuencia temporal concreta",()=>{
 const cards=[bank[1],bank[5],bank[6]],positions=["Pasado","Presente","Tendencia"],output=buildTarotEditorialOutput(analyze("Tres cartas — pasado, presente y tendencia",positions,cards),cards),text=output.story.join(" ");
 assert.match(text,/vienes de un periodo de introspección/i);assert.match(text,/empieza a entrar claridad/i);assert.match(text,/dependerá menos de un golpe de suerte|constancia/i);
 assert.doesNotMatch(text,/primera carta|segunda carta|tercera carta/i);
});

test("Rueda del año utiliza una estrategia temporal estacional",()=>{
 const positions=["Invierno","Despertar","Primavera","Expansión","Verano","Cosecha","Otoño","Depuración","Centro del año"],cards=bank.slice(0,9),analysis=analyze("Rueda del año personal",positions,cards,"Desarrollo personal"),output=buildTarotEditorialOutput(analysis,cards),text=output.story.join(" ");
 assert.equal(analysis.narrativeStrategy.strategy,"seasonal_cycle");assert.equal(output.narrativeSynthesis.strategy,"seasonal_cycle");
 for(const phase of ["invierno","despertar","primavera","verano","cosecha","otoño","depurar"])assert.match(text,new RegExp(phase,"i"));
 assert.doesNotMatch(text,/distintas partes del mapa|primera área|segunda área/i);
});

test("una misma carta cambia de sentido al cambiar de posición u orientación",()=>{
 const hermit=bank[1],past=interpretCardInPosition(hermit,{position:"Pasado"}),risk=interpretCardInPosition(hermit,{position:"Obstáculo"}),advice=interpretCardInPosition(hermit,{position:"Consejo"}),future=interpretCardInPosition(hermit,{position:"Futuro cercano"}),reversed=interpretCardInPosition({...hermit,isReversed:true},{position:"Obstáculo"});
 assert.equal(new Set([past.interpretation,risk.interpretation,advice.interpretation,future.interpretation]).size,4);
 assert.notEqual(risk.interpretation,reversed.interpretation);assert.equal(reversed.orientation,"reversed");assert.equal(risk.polarity,"warning");
});

test("cambiar una carta clave altera claramente cada lectura de aceptación",()=>{
 const opportunityPositions=["Oportunidad","Riesgo","Estrategia"],aCards=[bank[3],bank[10],bank[0]],bCards=[bank[2],bank[10],bank[0]],a=buildTarotEditorialOutput(analyze("Oportunidad, riesgo y estrategia",opportunityPositions,aCards),aCards),b=buildTarotEditorialOutput(analyze("Oportunidad, riesgo y estrategia",opportunityPositions,bCards),bCards);
 const relationPositions=["Qué siente","Qué piensa","Qué hará"],rCards=[bank[7],bank[11],bank[4]],rChanged=[bank[3],bank[11],bank[4]],r1=buildTarotEditorialOutput(analyze("Qué siente, qué piensa y qué hará",relationPositions,rCards,"Amor"),rCards),r2=buildTarotEditorialOutput(analyze("Qué siente, qué piensa y qué hará",relationPositions,rChanged,"Amor"),rChanged);
 assert.notEqual(a.story[0],b.story[0]);assert.notEqual(a.narrativeSynthesis.reading_thesis,b.narrativeSynthesis.reading_thesis);assert.notEqual(r1.story[0],r2.story[0]);
});

test("todas las tiradas del menú producen una interpretación completa",()=>{
 const source=readFileSync(new URL("../app/tarot-spreads.ts",import.meta.url),"utf8");
 const spreads=[...source.matchAll(/spread\("([^"]+)","[^"]+",(\[[^\n]+\])\)/g)].map(match=>({name:match[1],positions:JSON.parse(match[2])}));
 assert.equal(spreads.length,39);
 for(const {name,positions} of spreads){
  const cards=bank.slice(0,positions.length);
  assert.doesNotThrow(()=>{
   const output=buildTarotEditorialOutput(analyze(name,positions,cards),cards);
   assert.ok(output.story.length>0,`${name} debe producir una narración`);
   assert.ok(output.narrativeSynthesis.reading_thesis,`${name} debe producir una tesis`);
   assert.equal(output.debug.interpretationDebug.fallbackUsed,false,`${name} no debe usar fallback`);
  },name);
 }
});

test("las 39 tiradas tienen gramática explícita y ninguna usa generic_map",()=>{
 const grammars=listSpreadGrammars();
 assert.equal(grammars.length,39);
 for(const [name] of grammars){const grammar=getSpreadGrammar(name);assert.equal(grammar.known,true);assert.notEqual(grammar.narrativeStrategy,"generic_map");assert.ok(grammar.purpose);assert.ok(grammar.positions.every(position=>position.id&&position.question&&position.role));assert.ok(grammar.narrativeOrder.length);assert.ok(grammar.relationships.length||grammar.positions.length===1);}
});

test("Sombra, Aprendizaje y Recurso interpreta Enamorados, Muerte y Juicio desde sus funciones",()=>{
 const positions=["Sombra","Aprendizaje","Recurso"],cards=[bank[7],bank[2],judgement],analysis=analyze("Sombra, aprendizaje y recurso",positions,cards,"Desarrollo personal"),output=buildTarotEditorialOutput(analysis,cards),text=output.story.join(" ");
 assert.match(text,/dificultad para elegir|ambivalencia|opciones incompatibles/i);
 assert.match(text,/aceptar un final|soltar|transformación real/i);
 assert.match(text,/reconocer la verdad|despertar|decisión definitiva/i);
 assert.deepEqual(analysis.positionalInterpretations.map(item=>item.role),["shadow","learning","resource"]);
 assert.match(output.caution,/prolongar una decisión|opciones incompatibles/i);
});

test("Flujo de recursos responde a origen, entrada, fuga, reserva, movimiento y tendencia",()=>{
 const positions=["Origen","Entrada","Fuga","Reserva","Movimiento","Tendencia"],cards=bank.slice(0,6),output=buildTarotEditorialOutput(analyze("Flujo de recursos",positions,cards,"Consulta general"),cards),text=output.story.join(" ");
 assert.match(text,/origen muestra|se originó|situación actual de recursos/i);
 assert.match(text,/entrada (de recursos )?se favorece/i);
 assert.match(text,/pérdida|bloqueo|fuga/i);
 assert.match(text,/conservar|reserva/i);
 assert.match(text,/poner esos recursos a trabajar|movimiento/i);
 assert.match(text,/dinámica continúa|tendencia/i);
 assert.doesNotMatch(text,/La lectura funciona como un mapa|distintas partes del mapa/i);
});

test("Ciclo que termina y comienza conserva la secuencia final, aprendizaje, umbral, nacimiento y acción",()=>{
 const positions=["Lo que termina","Lección","Umbral","Lo que comienza","Primer paso"],cards=[bank[2],bank[1],bank[0],bank[10],bank[5]],output=buildTarotEditorialOutput(analyze("Ciclo que termina y ciclo que comienza",positions,cards,"Desarrollo personal"),cards),text=output.story.join(" ");
 assert.match(text,/termina una etapa|terminando una etapa/i);assert.match(text,/enseñanza|aprendizaje/i);assert.match(text,/Antes de entrar plenamente|cruzar hacia lo nuevo/i);assert.match(text,/surge una etapa|surge lo siguiente|lo nuevo/i);assert.match(text,/primer paso/i);
 assert.doesNotMatch(text,/El recorrido comienza|La lectura funciona como un mapa/i);
});

test("cambiar una carta modifica su tramo y conservar las cartas en otras posiciones cambia la historia",()=>{
 const positions=["Sombra","Aprendizaje","Recurso"],firstCards=[bank[7],bank[2],judgement],changedCards=[bank[7],bank[1],judgement],swappedCards=[bank[2],bank[7],judgement];
 const first=buildTarotEditorialOutput(analyze("Sombra, aprendizaje y recurso",positions,firstCards),firstCards),changed=buildTarotEditorialOutput(analyze("Sombra, aprendizaje y recurso",positions,changedCards),changedCards),swappedAnalysis=analyze("Sombra, aprendizaje y recurso",positions,swappedCards),swapped=buildTarotEditorialOutput(swappedAnalysis,swappedCards);
 assert.notEqual(first.story.join(" "),changed.story.join(" "));
 assert.notEqual(first.story.join(" "),swapped.story.join(" "));
 assert.notEqual(first.debug.interpretationDebug.positionInterpretations[0].interpretation,swappedAnalysis.positionalInterpretations[1].interpretation);
 assert.match(swappedAnalysis.positionalInterpretations[0].interpretation,/patrón|termin|cierre/i);
 assert.match(swappedAnalysis.positionalInterpretations[1].interpretation,/aprendizaje|comprender|aceptar/i);
});

test("el debug explica estrategia, posiciones, relaciones, patrones y fallback sin mostrarse en la lectura",()=>{
 const cards=[bank[7],bank[2],judgement],output=buildTarotEditorialOutput(analyze("Sombra, aprendizaje y recurso",["Sombra","Aprendizaje","Recurso"],cards),cards),debug=output.debug.interpretationDebug;
 assert.equal(debug.spreadStrategy,"psychological");assert.equal(debug.positionInterpretations.length,3);assert.equal(debug.relationshipsUsed.length,2);assert.ok(debug.patternsDetected);assert.equal(debug.fallbackUsed,false);assert.doesNotMatch(output.story.join(" "),/fallbackUsed|relationshipsUsed|patternsDetected/i);
});

test("cada gramática declara dominio, modo y función semántica por posición",()=>{
 for(const [name] of listSpreadGrammars()){
  const grammar=getSpreadGrammar(name);
  assert.ok(grammar.domain,`${name} necesita dominio`);assert.ok(grammar.mode,`${name} necesita modo`);
  assert.ok(Array.isArray(grammar.secondaryDomains));assert.ok(grammar.positions.every(position=>/^[A-Z_]+$/.test(position.function)),`${name} necesita funciones semánticas`);
 }
 assert.equal(getSpreadGrammar("Bloqueo económico").domain,"DINERO_RECURSOS");
 assert.equal(getSpreadGrammar("Qué siente, qué piensa y qué hará").mode,"RELACIONAL");
 assert.equal(getSpreadGrammar("Doce casas — 12 cartas").mode,"MAPA");
});

test("El Ermitaño cambia de manifestación según dominio, función y propósito",()=>{
 const hermit={...bank[1],love:"Tomar espacio para aclarar necesidades antes de comprometerse.",work:"Revisar experiencia y datos antes del siguiente movimiento profesional.",money:"Preferir sobriedad, información y asesoramiento antes de mover recursos.",growth:"Convertir silencio, estudio y experiencia en criterio propio.",advice:"Detente a comprobar lo que todavía no sabes."};
 const cases=[
  ["Semáforo: avanzar, esperar o detenerse",1,"DECISION","¿Conviene esperar antes de elegir?"],
  ["Bloqueo económico",0,"DINERO_RECURSOS","¿Por qué no consigo ordenar mis ingresos?"],
  ["Qué siente, qué piensa y qué hará",1,"AMOR_RELACIONES","¿Qué piensa esta persona de la relación?"],
  ["Camino espiritual — 12 cartas",0,"ESPIRITUAL","¿Cómo comienza este camino interior?"],
  ["Cruz Celta — 10 cartas",3,"GENERAL","¿De dónde viene esta situación?"]
 ].map(([spread,index,domain,question])=>{const grammar=getSpreadGrammar(spread);return interpretCardInPosition(hermit,{position:grammar.positions[index].label,positionSpec:grammar.positions[index],spread,spreadType:grammar.narrativeStrategy,domain,mode:grammar.mode,purpose:grammar.purpose,questionContext:question});});
 assert.equal(new Set(cases.map(item=>item.interpretation)).size,cases.length);
 assert.match(cases[1].interpretation,/dinero|recursos|ingresos/i);assert.match(cases[2].interpretation,/vínculo|relación/i);assert.match(cases[3].interpretation,/camino interior|criterio propio/i);
 assert.deepEqual(cases.map(item=>item.positionFunction),["DECISION","ORIGIN","INTERNAL","BEGINNING","PAST"]);
});

test("Bloqueo económico forma una cadena causal de proposiciones y relaciones",()=>{
 const positions=["Origen","Manifestación","Patrón","Recurso","Salida"],cards=[bank[1],bank[4],bank[6],bank[11],bank[5]],analysis=analyze("Bloqueo económico",positions,cards,"Trabajo y dinero","¿Por qué se repite el bloqueo y cómo romperlo?"),output=buildTarotEditorialOutput(analysis,cards),text=output.story.join(" ");
 assert.equal(analysis.propositions.length,5);assert.deepEqual(analysis.propositions.map(item=>item.positionFunction),["ORIGIN","CURRENT_STATE","OBSTACLE","RESOURCE","ACTION"]);
 assert.deepEqual(analysis.propositionRelations.map(item=>item.type),["causes","continues","blocks","enables"]);
 assert.match(text,/originó|origen/i);assert.match(text,/hoy|ahora/i);assert.match(text,/se repite|patrón/i);assert.match(text,/recurso|favor/i);assert.match(text,/salida|romper/i);
 assert.equal(output.narrativeSynthesis.domain,"DINERO_RECURSOS");
});

test("Semáforo compara opciones y expresa una inclinación relativa condicionada",()=>{
 const positions=["Avanzar","Esperar","Detenerse"],cards=[bank[3],bank[1],bank[2]],output=buildTarotEditorialOutput(analyze("Semáforo: avanzar, esperar o detenerse",positions,cards,"Decisiones","¿Conviene avanzar ahora?"),cards),text=output.story.join(" ");
 assert.match(text,/avanzar/i);assert.match(text,/esperar/i);assert.match(text,/detenerse/i);assert.match(text,/mayor respaldo relativo/i);assert.match(text,/cambiaría si/i);
 assert.doesNotMatch(text,/resultado garantizado|ocurrirá con certeza|debes avanzar/i);
});

test("sentir, pensar y actuar se interpretan por planos y después se comparan",()=>{
 const positions=["Qué siente","Qué piensa","Qué hará"],cards=[bank[7],bank[1],bank[4]],analysis=analyze("Qué siente, qué piensa y qué hará",positions,cards,"Amor y relaciones","¿Cómo se está relacionando conmigo?"),output=buildTarotEditorialOutput(analysis,cards),text=output.story.join(" ");
 assert.deepEqual(analysis.propositions.map(item=>item.positionFunction),["INTERNAL","INTERNAL","ACTION"]);
 assert.match(text,/emocional/i);assert.match(text,/mentalmente/i);assert.match(text,/conducta probable/i);assert.match(text,/alineación/i);
 assert.ok(analysis.propositionRelations.some(item=>item.type==="contradicts"||item.type==="transforms"));
});

test("las cartas invertidas eligen una manifestación contextual y no un opuesto automático",()=>{
 const card={...bank[6],money:"Mejorar el rendimiento mediante disciplina y método.",isReversed:true,reversed:"Perfeccionismo o trabajo mecánico."},grammar=getSpreadGrammar("Bloqueo económico"),resource=interpretCardInPosition(card,{position:"Recurso",positionSpec:grammar.positions[3],spread:"Bloqueo económico",domain:grammar.domain,mode:grammar.mode}),exit=interpretCardInPosition(card,{position:"Salida",positionSpec:grammar.positions[4],spread:"Bloqueo económico",domain:grammar.domain,mode:grammar.mode});
 assert.equal(resource.reversalMode,"DEFICIT");assert.equal(exit.reversalMode,"MISDIRECTED");assert.notEqual(resource.interpretation,exit.interpretation);
 assert.match(`${resource.interpretation} ${exit.interpretation}`,/dinero|recursos/i);assert.match(exit.interpretation,/mal canalizados|poco resultado/i);
});

test("el contexto de la pregunta modifica la proposición sin exponer términos internos",()=>{
 const grammar=getSpreadGrammar("Situación, obstáculo y consejo"),spec=grammar.positions[2],method=interpretCardInPosition(bank[1],{position:spec.label,positionSpec:spec,spread:"Situación, obstáculo y consejo",domain:grammar.domain,mode:grammar.mode,questionContext:"¿Cómo puedo decidir mejor?"}),choice=interpretCardInPosition(bank[1],{position:spec.label,positionSpec:spec,spread:"Situación, obstáculo y consejo",domain:grammar.domain,mode:grammar.mode,questionContext:"¿Debo elegir esta opción?"});
 assert.notEqual(method.interpretation,choice.interpretation);assert.match(method.interpretation,/hechos observables/i);assert.match(choice.interpretation,/comparar consecuencias/i);
 assert.doesNotMatch(`${method.interpretation} ${choice.interpretation}`,/positionRole|questionLens|confidence|domain/i);
});

test("tiradas distintas con cartas similares no producen la misma conclusión",()=>{
 const economicCards=[bank[1],bank[4],bank[6],bank[11],bank[5]],economic=buildTarotEditorialOutput(analyze("Bloqueo económico",["Origen","Manifestación","Patrón","Recurso","Salida"],economicCards,"Dinero"),economicCards);
 const transitionCards=economicCards.slice(0,3),transition=buildTarotEditorialOutput(analyze("Qué conservar, qué soltar y qué iniciar",["Conservar","Soltar","Iniciar"],transitionCards,"Desarrollo personal"),transitionCards);
 assert.notEqual(economic.story.join(" "),transition.story.join(" "));assert.notEqual(economic.narrativeSynthesis.main_movement,transition.narrativeSynthesis.main_movement);
 assert.equal(economic.narrativeSynthesis.mode,"DIAGNOSTICO");assert.equal(transition.narrativeSynthesis.mode,"NARRATIVO");
});

test("cada posición declarada contiene pregunta interna y modo de respuesta",()=>{
 for(const [name] of listSpreadGrammars()){
  const grammar=getSpreadGrammar(name);
  for(const position of grammar.positions){
   assert.match(position.question,/^¿.+\?$/,`${name} · ${position.label} necesita una pregunta interna`);
   assert.match(position.answerMode,/^[A-Z_]+$/,`${name} · ${position.label} necesita answerMode`);
   assert.match(position.semanticRole,/^[A-Z_]+$/,`${name} · ${position.label} necesita semanticRole`);
  }
 }
 const transition=getSpreadGrammar("Qué conservar, qué soltar y qué iniciar");
 assert.match(transition.positions[0].question,/aspecto positivo|conviene conservar/i);
 assert.match(transition.positions[1].question,/conviene dejar atrás/i);
 assert.match(transition.positions[2].question,/nueva conducta|movimiento/i);
});

test("La Estrella produce nueve respuestas funcionalmente distintas según la pregunta de posición",()=>{
 const star=bank[3],cases=[
  ["Ventajas, riesgos y resultado probable",0,/juega a favor/i],
  ["Ventajas, riesgos y resultado probable",1,/riesgo concreto/i],
  ["Qué conservar, qué soltar y qué iniciar",1,/dejar atrás/i],
  ["Qué conservar, qué soltar y qué iniciar",0,/conservar/i],
  ["Situación, obstáculo y consejo",1,/se complica/i],
  ["Sombra, aprendizaje y recurso",2,/utilizar constructivamente/i],
  ["Ventajas, riesgos y resultado probable",2,/escenario/i],
  ["Tres cartas — pasado, presente y tendencia",0,/antecedente/i],
  ["Ciclo que termina y ciclo que comienza",4,/primer paso/i]
 ].map(([spread,index,pattern])=>{const grammar=getSpreadGrammar(spread),spec=grammar.positions[index],answer=interpretCardInPosition(star,{position:spec.label,positionSpec:spec,spread,domain:grammar.domain,mode:grammar.mode});assert.match(answer.answer,pattern);return answer;});
 assert.equal(new Set(cases.map(item=>item.answer)).size,9);
 assert.ok(cases.every(item=>item.positionQuestion&&item.answerMode&&item.semanticRole));
});

test("La Muerte cambia radicalmente de función entre recurso, riesgo, final, inicio, obstáculo y resultado",()=>{
 const death=bank[2],locations=[
  ["Sombra, aprendizaje y recurso",2],
  ["Ventajas, riesgos y resultado probable",1],
  ["Ciclo que termina y ciclo que comienza",0],
  ["Ciclo que termina y ciclo que comienza",3],
  ["Situación, obstáculo y consejo",1],
  ["Ventajas, riesgos y resultado probable",2]
 ],answers=locations.map(([spread,index])=>{const grammar=getSpreadGrammar(spread),spec=grammar.positions[index];return interpretCardInPosition(death,{position:spec.label,positionSpec:spec,spread,domain:grammar.domain,mode:grammar.mode}).answer;});
 assert.equal(new Set(answers).size,6);
 assert.match(answers[0],/utilizar constructivamente|capacidad de cerrar/i);
 assert.match(answers[1],/riesgo concreto|resistencia/i);
 assert.match(answers[2],/termina una etapa/i);
 assert.match(answers[3],/lo nuevo empieza|depuración/i);
 assert.match(answers[4],/se complica|resistencia/i);
 assert.match(answers[5],/escenario|tendencia/i);
});

test("El Ermitaño como obstáculo responde de forma distinta en cinco dominios",()=>{
 const hermit={...bank[1],love:"La distancia emocional dificulta expresar necesidades y recibir respuesta.",work:"El aislamiento reduce colaboración y retrasa decisiones profesionales.",money:"La cautela excesiva retrasa el uso productivo de los recursos.",growth:"El retiro interior puede convertirse en evasión del siguiente aprendizaje."},grammar=getSpreadGrammar("Situación, obstáculo y consejo"),spec=grammar.positions[1],domains=["AMOR_RELACIONES","DINERO_RECURSOS","TRABAJO_PROFESION","ESPIRITUAL","GENERAL"],answers=domains.map(domain=>interpretCardInPosition(hermit,{position:spec.label,positionSpec:spec,spread:"Situación, obstáculo y consejo",domain,mode:grammar.mode}).answer);
 assert.equal(new Set(answers).size,5);
 assert.match(answers[0],/vínculo|distancia emocional/i);assert.match(answers[1],/dinero|recursos/i);assert.match(answers[2],/profesional|colaboración/i);assert.match(answers[3],/camino interior|retiro interior/i);
});

test("intercambiar las mismas cartas entre conservar, soltar e iniciar cambia las respuestas y la historia",()=>{
 const spread="Qué conservar, qué soltar y qué iniciar",positions=["Conservar","Soltar","Iniciar"],cards=[bank[3],bank[5],bank[2]],swapped=[bank[5],bank[2],bank[3]],first=analyze(spread,positions,cards,"Desarrollo personal"),second=analyze(spread,positions,swapped,"Desarrollo personal"),storyA=composeTarotInterpretation(first,cards).join(" "),storyB=composeTarotInterpretation(second,swapped).join(" ");
 assert.notEqual(storyA,storyB);
 assert.equal(first.positionAnswers.length,3);assert.equal(second.positionAnswers.length,3);
 for(let index=0;index<3;index++)assert.notEqual(first.positionAnswers[index].answer,second.positionAnswers[index].answer);
 assert.deepEqual(first.positionAnswers.map(item=>item.answerMode),["PRESERVE_CONSTRUCTIVE","RELEASE_EXPRESSION","INITIATE_EXPRESSION"]);
});

test("las relaciones conectan respuestas completas y la inversión no expone explicación técnica",()=>{
 const cards=[bank[3],{...bank[10],isReversed:true,reversed:"Impulso sin dirección."},bank[0]],analysis=analyze("Oportunidad, riesgo y estrategia",["Oportunidad","Riesgo","Estrategia"],cards,"Trabajo y dinero"),output=buildTarotEditorialOutput(analysis,cards),visible=[...output.story,output.caution,output.advice].join(" ");
 assert.ok(analysis.propositionRelations.every(relation=>relation.fromAnswer&&relation.toAnswer&&relation.bridge));
 assert.ok(analysis.propositionRelations.every(relation=>relation.bridge.includes(relation.fromAnswer.slice(0,20))));
 assert.doesNotMatch(visible,/Al aparecer invertida|bloquea o debilita la expresión de esta carta/i);
});

test("las 39 tiradas declaran una estrategia de salida independiente de su estrategia narrativa",()=>{
 const grammars=listSpreadGrammars();
 assert.equal(grammars.length,39);
 for(const [name,grammar] of grammars){assert.ok(Object.values(TAROT_OUTPUT_STRATEGIES).includes(grammar.outputStrategy),name);assert.ok(grammar.narrativeStrategy);}
 assert.equal(getSpreadGrammar("Una carta — mensaje central").outputStrategy,"SINGLE_MESSAGE");
 assert.equal(getSpreadGrammar("Semáforo: avanzar, esperar o detenerse").outputStrategy,"COMPARATIVE_SIGNAL");
 assert.equal(getSpreadGrammar("Cruz Celta — 10 cartas").outputStrategy,"FULL_NARRATIVE");
 assert.equal(getSpreadGrammar("Doce casas — 12 cartas").outputStrategy,"SYSTEMIC_OVERVIEW");
 assert.equal(getSpreadGrammar("Camino espiritual — 12 cartas").outputStrategy,"JOURNEY_STAGES");
});

test("la salida visible elimina rastros del motor en todas las tiradas conocidas",()=>{
 const forbidden=/se manifiesta así|se expresa así|la aplicación concreta|la dirección probable|como criterio|el punto crítico es este|el camino interior|la experiencia pide|la respuesta se expresa|la tendencia sugiere que|la situación actual se expresa|un camino conduce a|la disposición interna|la respuesta del entorno|la dirección condicionada|la dinámica anterior|este escenario|positionAnswer|semanticRole|outputStrategy|fallback|confidence|bloquea o debilita la expresión/i;
 for(const [name,grammar] of listSpreadGrammars()){
  const cards=grammar.positions.map((_,index)=>bank[index%bank.length]),positions=grammar.positions.map(item=>item.label),output=buildTarotEditorialOutput(analyze(name,positions,cards),cards),visible=[...output.sections.map(item=>`${item.title} ${item.body}`),output.caution,output.advice].join(" ");
  assert.doesNotMatch(visible,forbidden,name);
 }
});

test("el aviso es opcional y sólo aparece cuando existe una señal de riesgo",()=>{
 const upright=[bank[3]],normal=buildTarotEditorialOutput(analyze("Una carta — mensaje central",["Mensaje central"],upright),upright),reversed=[{...bank[3],isReversed:true,reversed:"Desánimo que impide reconocer una oportunidad real."}],alert=buildTarotEditorialOutput(analyze("Una carta — mensaje central",["Mensaje central"],reversed),reversed);
 assert.equal(normal.showWarning,false);assert.equal(normal.caution,"");
 assert.equal(alert.showWarning,true);assert.ok(alert.caution.length>20);assert.ok((alert.caution.match(/[.!?]+/g)||[]).length<=2);
});

test("las estrategias producen estructuras visibles realmente distintas",()=>{
 const cards=[bank[3],bank[1],bank[2]],cases=[
  ["Tres cartas — pasado, presente y tendencia",["Pasado","Presente","Tendencia"]],
  ["Qué siente, qué piensa y qué hará",["Qué siente","Qué piensa","Qué hará"]],
  ["Semáforo: avanzar, esperar o detenerse",["Avanzar","Esperar","Detenerse"]],
  ["Sombra, aprendizaje y recurso",["Sombra","Aprendizaje","Recurso"]],
 ],outputs=cases.map(([spread,positions])=>buildTarotEditorialOutput(analyze(spread,positions,cards),cards));
 assert.ok(new Set(outputs.map(output=>output.outputStrategy)).size>=3);
 assert.ok(new Set(outputs.map(output=>output.sections.map(item=>item.title).join("|"))).size>=3);
 assert.equal(new Set(outputs.map(output=>output.sections.map(item=>item.body).join(" "))).size,4);
 assert.match(outputs[1].sections.map(item=>item.title).join(" "),/Lo que siente|Lo que piensa|probablemente hará/);
 assert.match(outputs[2].sections.map(item=>item.title).join(" "),/Avanzar|Esperar|Detenerse|Señal dominante/);
});

test("las longitudes editoriales se ajustan al tamaño de la tirada",()=>{
 const cases=[
  ["Una carta — mensaje central",["Mensaje central"],bank.slice(0,1),60,130],
  ["Tres cartas — pasado, presente y tendencia",["Pasado","Presente","Tendencia"],bank.slice(1,4),90,180],
  ["Qué ocurre si actúo / si no actúo",["Punto de decisión","Si actúo","Consecuencia","Si no actúo","Consecuencia"],bank.slice(3,8),150,280],
  ["Cruz Celta — 10 cartas",celtic,bank.slice(0,10),220,450],
  ["Doce casas — 12 cartas",["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"],bank,220,450],
  ["Camino espiritual — 12 cartas",["Llamado","Origen","Equipaje","Guía","Umbral","Prueba","Sombra","Revelación","Elección","Entrega","Integración","Destino interior"],bank,220,450],
 ];
 for(const [spread,positions,cards,min,max] of cases){const output=buildTarotEditorialOutput(analyze(spread,positions,cards),cards);assert.ok(output.wordCount>=min,`${spread}: ${output.wordCount}`);assert.ok(output.wordCount<=max,`${spread}: ${output.wordCount}`);}
});

test("cada formato profundo conserva sus agrupaciones propias",()=>{
 const houses=["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"],path=["Llamado","Origen","Equipaje","Guía","Umbral","Prueba","Sombra","Revelación","Elección","Entrega","Integración","Destino interior"],outputs=[
  buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,bank.slice(0,10)),bank.slice(0,10)),
  buildTarotEditorialOutput(analyze("Doce casas — 12 cartas",houses,bank),bank),
  buildTarotEditorialOutput(analyze("Camino espiritual — 12 cartas",path,bank),bank),
 ];
 assert.match(outputs[0].sections.map(item=>item.title).join(" "),/traído|reto|Tendencia/i);
 assert.match(outputs[1].sections.map(item=>item.title).join(" "),/Eje personal|Eje práctico|Eje relacional|Eje de cambio/i);
 assert.match(outputs[2].sections.map(item=>item.title).join(" "),/Llamado y origen|Umbral y prueba|Integración y destino/i);
});

test("el debug conserva las capas internas sin mezclarlas con la salida editorial",()=>{
 const cards=bank.slice(0,10),output=buildTarotEditorialOutput(analyze("Cruz Celta — 10 cartas",celtic,cards),cards);
 for(const key of ["semanticAnalysis","positionAnswers","relations","spreadSynthesis","outputStrategy","editorialOutput"])assert.ok(key in output.debug,key);
 assert.equal(output.debug.outputStrategy,output.outputStrategy);
 assert.deepEqual(output.debug.editorialOutput.sections,output.sections);
});

const rider=name=>{
 const card=riderDeck.find(item=>item.name===name);assert.ok(card,`No se encontró ${name}`);return card;
};

test("la identidad semántica de la carta no se sustituye por keywords de otra carta",()=>{
 const trendGrammar=getSpreadGrammar("Tres cartas — pasado, presente y tendencia"),trend=interpretCardInPosition(rider("Siete de Oros"),{position:trendGrammar.positions[2].label,positionSpec:trendGrammar.positions[2],spread:"Tres cartas — pasado, presente y tendencia",domain:trendGrammar.domain,mode:trendGrammar.mode});
 assert.match(trend.answer,/trabajo|rendimiento|evaluar|cosecha|paciencia/i);assert.doesNotMatch(trend.answer,/punto medio|fuerzas distintas|ajustes graduales/i);
 const conditionGrammar=getSpreadGrammar("Sí / No razonado — respuesta, condición y advertencia"),condition=interpretCardInPosition(rider("Sota de Copas"),{position:conditionGrammar.positions[1].label,positionSpec:conditionGrammar.positions[1],spread:"Sí / No razonado — respuesta, condición y advertencia",domain:conditionGrammar.domain,mode:conditionGrammar.mode});
 assert.match(condition.answer,/mensaje emocional|intuición|conversación delicada/i);assert.doesNotMatch(condition.answer,/observarse en silencio|información incompleta|reservar lo importante/i);
 const relationGrammar=getSpreadGrammar("Qué siente, qué piensa y qué hará"),feeling=interpretCardInPosition(rider("Tres de Espadas"),{position:relationGrammar.positions[0].label,positionSpec:relationGrammar.positions[0],spread:"Qué siente, qué piensa y qué hará",domain:relationGrammar.domain,mode:relationGrammar.mode});
 assert.match(feeling.answer,/dolor|herida|separación/i);assert.doesNotMatch(feeling.answer,/definir el problema|empieza a entrar claridad|pregunta directa/i);
});

test("Tendencia, Riesgo, Condición, Resultado y Consejo responden desde la carta asignada",()=>{
 const cases=[
  ["Tres cartas — pasado, presente y tendencia",2,rider("Siete de Oros"),/rendimiento|cosecha|trabajo|evaluar/i],
  ["Ventajas, riesgos y resultado probable",1,rider("Cinco de Espadas"),/conflicto|victoria|tensión|imponerse|ganar la discusión|pérdida mayor/i],
  ["Sí / No razonado — respuesta, condición y advertencia",1,rider("Sota de Copas"),/mensaje|intuición|sensibilidad/i],
  ["Ventajas, riesgos y resultado probable",2,rider("La Estrella"),/recuperación|confianza|visión/i],
  ["Situación, obstáculo y consejo",2,rider("El Ermitaño"),/ruido|pensar|prudencia|distancia|pausa deliberada/i],
 ];
 for(const [spread,index,card,identity] of cases){const grammar=getSpreadGrammar(spread),spec=grammar.positions[index],result=interpretCardInPosition(card,{position:spec.label,positionSpec:spec,spread,domain:grammar.domain,mode:grammar.mode});assert.equal(result.cardId,card.id);assert.equal(result.positionId,spec.id);assert.match(result.answer,identity,`${spread} · ${card.name}`);}
});

test("Qué siente, qué piensa y qué hará conserva identidad y procedencia por plano",()=>{
 const cards=[rider("Tres de Espadas"),rider("Cuatro de Copas"),rider("As de Bastos")],positions=["Qué siente","Qué piensa","Qué hará"],analysis=analyzeTarotReading({spread:"Qué siente, qué piensa y qué hará",positions,cards,category:"Amor y relaciones",drawId:"fta-1"}),output=buildTarotEditorialOutput(analysis,cards),trace=output.debug.semanticTrace;
 assert.match(analysis.positionAnswersById.feeling.answer,/dolor|herida|separación/i);assert.match(analysis.positionAnswersById.thought.answer,/apatía|insatisfacción|opciones|rutinario|distante/i);assert.match(analysis.positionAnswersById.action.answer,/inicio|impulso|acción|comenzar/i);
 for(const id of ["feeling","thought","action"]){const conclusion=trace.synthesisConclusions.find(item=>item.id===id),answer=analysis.positionAnswersById[id];assert.deepEqual(conclusion.sourcePositionIds,[id]);assert.deepEqual(conclusion.sourceCardIds,[answer.cardId]);}
 assert.equal(validateSemanticTrace(trace).valid,true);
});

test("el mensaje de una carta interpreta sin repetir la definición general",()=>{
 const names=["Seis de Copas","La Torre","Cuatro de Oros","El Ermitaño","La Estrella","Cinco de Espadas","Reina de Copas","Ocho de Oros"];
 for(const [index,name] of names.entries()){
  const card=rider(name),analysis=analyzeTarotReading({spread:"Una carta — mensaje central",positions:["Mensaje central"],cards:[card],drawId:`single-${index}`}),output=buildTarotEditorialOutput(analysis,[card]),body=output.sections[0].body,count=body.split(/\s+/).length;
  assert.ok(count>=60&&count<=130,`${name}: ${count} palabras`);assert.notEqual(body,card.general);assert.ok(semanticSimilarity(body,`${card.general} ${card.advice}`)<.7,`${name}: repetición semántica excesiva`);assert.doesNotMatch(body,/Esta carta concentra la atención|No fija un resultado: muestra el punto/i);assert.equal(output.showWarning,false,`${name}: aviso sin riesgo posicional o inversión`);
 }
});

test("la Cruz Celta documenta la procedencia exacta de posiciones, relaciones y conclusiones",()=>{
 const cards=riderDeck.slice(0,10),analysis=analyzeTarotReading({spread:"Cruz Celta — 10 cartas",positions:celtic,cards,drawId:"celtic-provenance"}),output=buildTarotEditorialOutput(analysis,cards),trace=output.debug.semanticTrace,validation=validateSemanticTrace(trace);
 assert.equal(validation.valid,true,validation.errors.join(", "));assert.equal(trace.drawId,"celtic-provenance");assert.equal(trace.positions.length,10);assert.equal(new Set(trace.positions.map(item=>item.positionId)).size,10);assert.equal(new Set(trace.positions.map(item=>item.cardId)).size,10);
 for(const position of trace.positions){assert.equal(position.cardId,analysis.cardsByPositionId[position.positionId].id);assert.ok(position.positionQuestion);assert.ok(position.answer);}
 for(const relation of trace.relations){assert.equal(relation.sourcePositionIds.length,2);assert.equal(relation.sourceCardIds.length,2);assert.ok(relation.interpretation);}
 const direction=trace.synthesisConclusions.find(item=>item.id==="direction");assert.deepEqual(direction.sourcePositionIds,["trend"]);assert.deepEqual(direction.sourceCardIds,[analysis.positionAnswersById.trend.cardId]);
});

test("cambiar sólo la Tendencia cambia la conclusión y sus fuentes, no conserva la carta anterior",()=>{
 const firstCards=riderDeck.slice(0,10),secondCards=[...firstCards.slice(0,9),riderDeck[20]],first=buildTarotEditorialOutput(analyzeTarotReading({spread:"Cruz Celta — 10 cartas",positions:celtic,cards:firstCards,drawId:"trend-a"}),firstCards),second=buildTarotEditorialOutput(analyzeTarotReading({spread:"Cruz Celta — 10 cartas",positions:celtic,cards:secondCards,drawId:"trend-b"}),secondCards),a=first.debug.semanticTrace.synthesisConclusions.find(item=>item.id==="direction"),b=second.debug.semanticTrace.synthesisConclusions.find(item=>item.id==="direction");
 assert.notEqual(a.text,b.text);assert.notDeepEqual(a.sourceCardIds,b.sourceCardIds);assert.ok(!b.sourceCardIds.includes(a.sourceCardIds[0]));
});

test("repartir de nuevo crea otro drawId y una traza sin referencias residuales",()=>{
 const firstCards=riderDeck.slice(0,10),secondCards=riderDeck.slice(12,22),first=buildTarotEditorialOutput(analyzeTarotReading({spread:"Cruz Celta — 10 cartas",positions:celtic,cards:firstCards,drawId:"deal-a"}),firstCards).debug.semanticTrace,second=buildTarotEditorialOutput(analyzeTarotReading({spread:"Cruz Celta — 10 cartas",positions:celtic,cards:secondCards,drawId:"deal-b"}),secondCards).debug.semanticTrace,validation=validateSemanticTrace(second,{previousTrace:first});
 assert.equal(validation.valid,true,validation.errors.join(", "));assert.notEqual(first.drawId,second.drawId);const currentCards=new Set(second.cards.map(item=>item.cardId));for(const relation of second.relations)assert.ok(relation.sourceCardIds.every(id=>currentCards.has(id)));for(const conclusion of second.synthesisConclusions)assert.ok(conclusion.sourceCardIds.every(id=>currentCards.has(id)));
});

test("ninguna tirada sistémica repite encabezados ni deja una conclusión sin fuente",()=>{
 for(const [name,grammar] of listSpreadGrammars()){
  const cards=riderDeck.slice(0,grammar.positions.length),positions=grammar.positions.map(item=>item.label),output=buildTarotEditorialOutput(analyzeTarotReading({spread:name,positions,cards,drawId:`system-${grammar.id}`}),cards),titles=output.sections.map(item=>item.title).filter(Boolean);
  assert.equal(new Set(titles.map(title=>title.toLowerCase())).size,titles.length,`${name}: encabezados repetidos`);assert.equal(validateSemanticTrace(output.debug.semanticTrace).valid,true,name);
 }
});

test("SINGLE_MESSAGE interpreta diez cartas desde familias semánticas y no desde su nombre",()=>{
 const cases=[
  ["Ocho de Espadas",/límite|restricción|salida|miedo/i],
  ["Seis de Copas",/pasado|recuerdo|nostalgia|familiar/i],
  ["La Torre",/estructura|falla|reconstruir|urgente/i],
  ["Cuatro de Oros",/proteger|seguridad|control|rigidez/i],
  ["La Estrella",/confianza|esperanza|recuperación|visión/i],
  ["El Ermitaño",/ruido|pausa|reflexión|aislar/i],
  ["Cinco de Espadas",/ganar|conflicto|batalla|precio/i],
  ["Reina de Copas",/sensibilidad|empatía|límites|intuición/i],
  ["Ocho de Oros",/práctica|repetición|aprendizaje|dedicación/i],
  ["El Loco",/posibilidad|comienzo|libertad|riesgo/i],
 ];
 const bodies=[];
 for(const [index,[name,identity]] of cases.entries()){
  const card=rider(name),analysis=analyzeTarotReading({spread:"Una carta — mensaje central",positions:["Mensaje central"],cards:[card],drawId:`single-final-${index}`}),output=buildTarotEditorialOutput(analysis,[card]),body=output.sections[0].body,count=body.split(/\s+/).length;
  assert.equal(output.outputStrategy,TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE);assert.ok(count>=60&&count<=130,`${name}: ${count}`);assert.match(body,identity,name);assert.doesNotMatch(body,/Busca equilibrio|Da un paso concreto|Esta carta significa|representa simplemente/i);bodies.push(body);
 }
 assert.equal(new Set(bodies).size,cases.length);
});

test("Los siete chakras usa cinco grupos funcionales y conserva el significado de cada centro",()=>{
 const grammar=getSpreadGrammar("Los siete chakras"),positions=grammar.positions.map(item=>item.label),expected=["BASE Y MOVIMIENTO","VOLUNTAD Y VÍNCULO","EXPRESIÓN Y PERCEPCIÓN","INTEGRACIÓN","FLUJO GENERAL"];
 for(let draw=0;draw<5;draw++){
  const cards=Array.from({length:7},(_,index)=>{const card=riderDeck[(draw*7+index)%riderDeck.length];return draw%2&&index===draw%7?{...card,isReversed:true}:card;}),output=buildTarotEditorialOutput(analyzeTarotReading({spread:"Los siete chakras",positions,cards,drawId:`chakra-${draw}`}),cards),text=output.sections.map(item=>`${item.title} ${item.body}`).join(" ");
  assert.equal(output.outputStrategy,TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM);assert.deepEqual(output.sections.map(item=>item.title),expected);assert.ok(output.wordCount>=150&&output.wordCount<=280,`chakra ${draw}: ${output.wordCount}`);
  for(const concept of ["seguridad","deseo","voluntad","afecto","comunicación","percepción","sentido"])assert.match(text,new RegExp(concept,"i"));
  assert.doesNotMatch(text,/Núcleo del mapa|chakra (?:está|se encuentra) bloqueado|diagnóstico|enfermedad/i);assert.equal(validateSemanticTrace(output.debug.semanticTrace).valid,true);
 }
});

test("Árbol de la Vida relaciona polaridades, centro, fundamento y manifestación en cinco tiradas",()=>{
 const grammar=getSpreadGrammar("Árbol de la Vida — 10 cartas"),positions=grammar.positions.map(item=>item.label),expected=["PRINCIPIO DEL PROCESO","POLARIDADES PRINCIPALES","CENTRO DE INTEGRACIÓN","PATRÓN SUBYACENTE","MANIFESTACIÓN","PANORAMA GENERAL"];
 for(let draw=0;draw<5;draw++){
  const cards=Array.from({length:10},(_,index)=>{const card=riderDeck[(draw*11+index)%riderDeck.length];return draw%2&&index===draw?{...card,isReversed:true}:card;}),output=buildTarotEditorialOutput(analyzeTarotReading({spread:"Árbol de la Vida — 10 cartas",positions,cards,drawId:`tree-${draw}`}),cards),text=output.sections.map(item=>`${item.title} ${item.body}`).join(" ");
  assert.equal(output.outputStrategy,TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE);assert.deepEqual(output.sections.map(item=>item.title),expected);assert.ok(output.wordCount>=250&&output.wordCount<=400,`tree ${draw}: ${output.wordCount}`);
  for(const pair of [/Jojmá.*Biná/is,/Jésed.*Guevurá/is,/Nétzaj.*Hod/is,/Tiféret/i,/Yesod/i,/Maljut/i])assert.match(text,pair);
  assert.doesNotMatch(text,/Núcleo del mapa|verdad doctrinal afirmada|destino inevitable/i);assert.equal(validateSemanticTrace(output.debug.semanticTrace).valid,true);
 }
});

test("intercambiar cartas entre polaridades del Árbol cambia su interpretación y procedencia",()=>{
 const grammar=getSpreadGrammar("Árbol de la Vida — 10 cartas"),positions=grammar.positions.map(item=>item.label),cards=riderDeck.slice(0,10),swapped=[...cards];[swapped[1],swapped[2]]=[swapped[2],swapped[1]];[swapped[6],swapped[7]]=[swapped[7],swapped[6]];
 const first=buildTarotEditorialOutput(analyzeTarotReading({spread:"Árbol de la Vida — 10 cartas",positions,cards,drawId:"tree-original"}),cards),second=buildTarotEditorialOutput(analyzeTarotReading({spread:"Árbol de la Vida — 10 cartas",positions,cards:swapped,drawId:"tree-swapped"}),swapped),a=first.sections.find(item=>item.id==="polarities"),b=second.sections.find(item=>item.id==="polarities");
 assert.notEqual(a.body,b.body);assert.notDeepEqual(a.sourceCardIds,b.sourceCardIds);assert.deepEqual(a.sourcePositionIds,["chokmah","binah","chesed","gevurah","netzach","hod"]);
});
