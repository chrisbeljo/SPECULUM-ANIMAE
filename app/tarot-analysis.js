import {getSpreadGrammar,isKnownSpread,TAROT_OUTPUT_STRATEGIES} from "./tarot-spread-grammar.js";
import {buildContextualProposition,buildPropositionRelations,contextualRelationMovement,resolveTarotDomain} from "./tarot-context-semantics.js";

const AXES={
 "claridad y conocimiento":["claridad","verdad","intuición","sabiduría","introspección","observación","información","decisión"],
 "transformación y cambio":["cambio","ciclo","cierre","transformación","renovación","adaptación","transición","inicio"],
 "vínculo y reciprocidad":["vínculo","reciprocidad","encuentro","acuerdo","elección","amor","unión","comunicación"],
 "construcción y recursos":["práctica","detalle","maestría","recursos","acción","constancia","trabajo","estabilidad","estructura"],
 "equilibrio e integración":["equilibrio","integración","paciencia","armonía","moderación","regulación"],
 "libertad y movimiento":["libertad","movimiento","impulso","oportunidad","expansión","confianza"],
 "protección y límites":["prudencia","límites","protección","riesgo","atención","reserva"],
 "esperanza y propósito":["esperanza","autenticidad","propósito","inspiración","recuperación","visión"],
 "tensión y conflicto":["conflicto","tensión","miedo","engaño","bloqueo","confusión","aislamiento","apego","dependencia"]
};
const OPPOSITES=[["claridad y conocimiento","tensión y conflicto"],["transformación y cambio","estabilidad"],["vínculo y reciprocidad","aislamiento"],["libertad y movimiento","protección y límites"]];
const NEGATIVE_POSITION=/cruza|obstáculo|riesgo|sombra|bloqueo|advertencia|temor|fuga|distancia|prueba|herida/i;
const POSSIBILITY_POSITION=/posibilidad|potencial|oportunidad|recurso|fortaleza|esperanza/i;
const TREND_POSITION=/tendencia|resultado|evolución|futuro|destino|dirección/i;
const SPREAD_STRATEGIES=new Map([
 ["Una carta — mensaje central",["focal_message","single"]],["Dos cartas — situación y consejo",["problem_resolution","situation_advice"]],["Sí / No razonado — respuesta, condición y advertencia",["weighted_answer","reasoned_answer"]],["Tres cartas — pasado, presente y tendencia",["sequence","timeline"]],["Situación, obstáculo y consejo",["problem_resolution","obstacle_advice"]],["Mente, emoción y acción",["inner_evolution","mind_emotion_action"]],["Qué conservar, qué soltar y qué iniciar",["inner_evolution","release_begin"]],
 ["Tú, la otra persona y el vínculo",["relational_dynamic","three_way"]],["Relación de seis cartas",["relational_dynamic","six_card"]],["Qué siente, qué piensa y qué hará",["relational_dynamic","thought_feeling_action"]],["Compatibilidad de la pareja",["relational_dynamic","compatibility"]],["Evolución del vínculo",["relational_dynamic","evolution"]],["Reconciliación o cierre",["relational_dynamic","reconciliation"]],["Persona nueva: intención, potencial y precaución",["relational_dynamic","new_person"]],
 ["Camino A frente a Camino B",["comparison","two_paths"]],["Ventajas, riesgos y resultado probable",["comparison","risk_result"]],["Qué ocurre si actúo / si no actúo",["comparison","act_or_wait"]],["Decisión de seis cartas",["comparison","six_card"]],["Semáforo: avanzar, esperar o detenerse",["comparison","traffic_light"]],
 ["Situación laboral",["problem_resolution","work"]],["Cambio de empleo",["comparison","job_change"]],["Proyecto o negocio",["problem_resolution","project"]],["Bloqueo económico",["problem_resolution","blockage"]],["Flujo de recursos",["systemic_map","resources"]],["Oportunidad, riesgo y estrategia",["problem_resolution","opportunity_risk"]],
 ["Sombra, aprendizaje y recurso",["inner_evolution","shadow_learning"]],["Bloqueo emocional",["inner_evolution","emotional_block"]],["Propósito del momento",["inner_evolution","purpose"]],["Ciclo que termina y ciclo que comienza",["inner_evolution","cycle"]],["Herida, conciencia e integración",["inner_evolution","integration"]],["Los siete chakras",["systemic_map","chakras"]],["Rueda del año personal",["seasonal_cycle","year_wheel"]],
 ["Cruz Celta — 10 cartas",["evolutionary_story","celtic"]],["Herradura — 7 cartas",["evolutionary_story","horseshoe"]],["Estrella de siete cartas",["systemic_map","star"]],["Mandala de nueve cartas",["systemic_map","mandala"]],["Doce casas — 12 cartas",["systemic_map","twelve_houses"]],["Árbol de la Vida — 10 cartas",["systemic_map","tree"]],["Camino espiritual — 12 cartas",["inner_evolution","spiritual_path"]],
]);
export function resolveSpreadNarrativeStrategy(spread){const [strategy,schema]=SPREAD_STRATEGIES.get(spread)||["sequence","ordered_positions"];return {strategy,schema};}

const normalize=text=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function concepts(card){
 const source=normalize(`${card.keys.join(" ")} ${card.isReversed?(card.reversed||""):card.general}`),found=[];
 for(const [axis,words] of Object.entries(AXES))if(words.some(word=>source.includes(normalize(word))))found.push(axis);
 for(const key of card.keys){const clean=normalize(key);if(!Object.values(AXES).flat().some(word=>normalize(word)===clean))found.push(clean)}
 return [...new Set(found)];
}
function positionFunction(label){
 if(NEGATIVE_POSITION.test(label))return "tensiona o modifica";
 if(POSSIBILITY_POSITION.test(label))return "abre una posibilidad";
 if(TREND_POSITION.test(label))return "describe una dirección probable";
 if(/base|raíz|origen|pasado/i.test(label))return "explica el origen";
 if(/actitud|mente|emoción|tú|intern/i.test(label))return "expresa la respuesta interna";
 if(/entorno|otra persona|extern/i.test(label))return "describe una influencia externa";
 if(/consejo|acción|estrategia|iniciar/i.test(label))return "orienta la acción";
 return "define el asunto";
}
function structuralRelations(spread,positions){
 const name=normalize(spread),pairs=[];
 const add=(a,b,kind)=>{if(a<positions.length&&b<positions.length)pairs.push({indices:[a,b],kind})};
 if(name.includes("cruz celta")){add(0,1,"núcleo y tensión");add(2,3,"origen y antecedente");add(4,5,"potencial y desarrollo");add(6,7,"interior y exterior");add(7,8,"realidad y expectativa");add(8,9,"expectativa y tendencia");add(0,5,"presente y desarrollo");}
 else if(name.includes("doce casas")){add(0,6,"identidad y vínculos");add(1,9,"recursos y vocación");add(2,10,"comunicación y comunidad");add(3,7,"hogar y transformación");add(5,11,"rutinas e inconsciente");add(8,9,"visión y vocación");add(0,1,"identidad y recursos");add(6,7,"vínculos y transformación");}
 else if(name.includes("relacion")||name.includes("vinculo")||name.includes("compatibilidad")){add(0,1,"dos perspectivas");add(0,2,"aporte al vínculo");add(1,2,"aporte al vínculo");if(positions.length>4)add(3,4,"tensión y desarrollo");}
 else if(name.includes("camino")||name.includes("decision")||name.includes("actuo")){add(0,1,"punto de partida y alternativa");add(1,2,"camino y consecuencia");if(positions.length>4)add(3,4,"camino y consecuencia");}
 else for(let i=0;i<positions.length-1;i++)add(i,i+1,"desarrollo");
 return pairs;
}
function strengthLabel(score){return score>=8?"high":score>=4?"medium":"low"}
function buildReadingStory(config,positions,enriched){
 const node=index=>index>=0&&index<enriched.length?{index,positionId:enriched[index].positionId,role:positions[index],card:enriched[index].card,cardId:enriched[index].card.id,positionFunction:enriched[index].positionFunction}:null,steps=enriched.map((_,index)=>node(index));
 if(config.schema==="celtic")return {kind:"celtic",strategy:config.strategy,origin:node(3),underlyingProcess:node(2),currentSituation:node(0),mainChallenge:node(1),availablePotential:node(4),emergingDevelopment:node(5),querentResponse:node(6),externalFactors:node(7),internalConflict:node(8),likelyDirection:node(9)};
 if(config.schema==="twelve_houses")return {kind:"houses",strategy:config.strategy,areas:steps,relations:[[0,6],[1,9],[2,10],[3,7],[5,11],[8,9]].map(([a,b])=>[node(a),node(b)])};
 if(config.strategy==="comparison")return {kind:"decision",strategy:config.strategy,schema:config.schema,currentSituation:node(0),pathA:[node(1),node(2)].filter(Boolean),pathB:[node(3),node(4)].filter(Boolean),guidance:node(enriched.length>5?5:-1),steps};
 if(config.strategy==="relational_dynamic")return {kind:"relationship",strategy:config.strategy,personA:node(0),personB:node(1),bond:node(2),tension:node(enriched.length>3?3:-1),likelyDirection:node(enriched.length-1),steps};
 if(config.strategy==="problem_resolution"){const obstacle=positions.findIndex(position=>NEGATIVE_POSITION.test(position)),advice=positions.findIndex(position=>/consejo|acción|estrategia|salida|integración/i.test(position));return {kind:"situation",strategy:config.strategy,currentSituation:node(0),mainChallenge:node(obstacle>=0?obstacle:Math.min(1,enriched.length-1)),guidance:node(advice>=0?advice:enriched.length-1),steps};}
 if(config.strategy==="sequence"&&config.schema==="timeline")return {kind:"timeline",strategy:config.strategy,origin:node(0),currentSituation:node(1),likelyDirection:node(2),steps};
 return {kind:config.strategy,strategy:config.strategy,schema:config.schema,steps};
}
function buildNarrativeArcs(story){
 const arcs=[],add=(from,to,relationType,importance)=>{if(!from||!to)return;const shared=concepts(from.card).filter(theme=>concepts(to.card).includes(theme)),reversed=Boolean(from.card.isReversed||to.card.isReversed),major=(from.card.arcana==="Mayor"?1:0)+(to.card.arcana==="Mayor"?1:0);arcs.push({id:`arc_${arcs.length+1}`,fromPosition:from.role,toPosition:to.role,fromPositionId:from.positionId,toPositionId:to.positionId,sourcePositionIds:[from.positionId,to.positionId],sourceCardIds:[from.cardId,to.cardId],fromIndex:from.index,toIndex:to.index,relationType,sharedThemes:shared,orientationEffect:reversed?"La inversión altera o bloquea la transición.":"La relación se expresa de forma directa.",strength:importance+major+(reversed?2:0)+shared.length});};
 if(story.kind==="celtic"){add(story.origin,story.underlyingProcess,"CAUSE_EFFECT",4);add(story.underlyingProcess,story.currentSituation,"CAUSE_EFFECT",5);add(story.currentSituation,story.mainChallenge,"TENSION",7);add(story.mainChallenge,story.availablePotential,"BLOCK_RELEASE",4);add(story.availablePotential,story.emergingDevelopment,"TRANSITION",5);add(story.querentResponse,story.externalFactors,"INTERNAL_EXTERNAL",6);add(story.internalConflict,story.likelyDirection,"QUESTION_RESPONSE",5);add(story.origin,story.likelyDirection,"TRANSITION",7);add(story.underlyingProcess,story.likelyDirection,"CAUSE_EFFECT",6);add(story.currentSituation,story.likelyDirection,"TRANSITION",6);}
 else if(story.kind==="timeline"){add(story.origin,story.currentSituation,"TRANSITION",6);add(story.currentSituation,story.likelyDirection,"TRANSITION",7);add(story.origin,story.likelyDirection,"TRANSITION",5);}
 else if(story.kind==="situation"){add(story.currentSituation,story.mainChallenge,"TENSION",7);add(story.mainChallenge,story.guidance,"BLOCK_RELEASE",7);}
 else if(story.kind==="relationship"){add(story.personA,story.personB,"CONTRAST",5);add(story.personA,story.bond,"CAUSE_EFFECT",5);add(story.personB,story.bond,"CAUSE_EFFECT",5);add(story.tension,story.likelyDirection,"TRANSITION",6);}
 else if(story.kind==="houses")for(const [from,to] of story.relations)add(from,to,"AREA_INTERACTION",5);
 return arcs.sort((a,b)=>b.strength-a.strength);
}
export function analyzeTarotReading({spread,positions,cards,category="Consulta general",question="",orientationEnabled=false,drawId=null}){
 const grammar=getSpreadGrammar(spread,positions),resolvedDrawId=drawId||`${grammar.id}:${cards.map(card=>`${card.id}:${card.isReversed?"r":"u"}`).join("|")}`;
 const enriched=cards.map((card,index)=>({card,index,positionId:grammar.positions[index]?.id||`position_${index+1}`,position:grammar.positions[index]?.label||positions[index],positionFunction:positionFunction(positions[index]),concepts:concepts(card),weight:(card.arcana==="Mayor"?2:1)+(NEGATIVE_POSITION.test(positions[index])||TREND_POSITION.test(positions[index])?1:0)}));
 const domain=resolveTarotDomain(grammar.domain,category,question),narrativeStrategy=resolveSpreadNarrativeStrategy(spread),readingStory=buildReadingStory(narrativeStrategy,positions,enriched);
 const narrativeArcs=buildNarrativeArcs(readingStory);
 const relations=structuralRelations(spread,positions),reinforcingPairs=[],conflictingPairs=[];
 const positionalInterpretations=enriched.map(item=>{const neighborIndices=relations.filter(relation=>relation.indices.includes(item.index)).flatMap(relation=>relation.indices.filter(index=>index!==item.index));return interpretCardInPosition(item.card,{position:item.position,positionSpec:grammar.positions[item.index],spreadType:grammar.narrativeStrategy,spread,domain,secondaryDomains:grammar.secondaryDomains,mode:grammar.mode,purpose:grammar.purpose,neighboringCards:[...new Set(neighborIndices)].map(index=>cards[index]).filter(Boolean),questionContext:question,category});});
 const propositionRelations=buildPropositionRelations(grammar,positionalInterpretations);
 for(const relation of relations){const [a,b]=relation.indices,A=enriched[a],B=enriched[b],shared=A.concepts.filter(x=>B.concepts.includes(x)),functionalTension=shared.length&&(NEGATIVE_POSITION.test(A.position)!==NEGATIVE_POSITION.test(B.position));if(functionalTension)conflictingPairs.push({...relation,cards:[A.card.name,B.card.name],themes:shared,reason:"una misma cualidad funciona como recurso en una posición y como interferencia en otra"});else if(shared.length)reinforcingPairs.push({...relation,cards:[A.card.name,B.card.name],themes:shared});else{const tension=OPPOSITES.find(([x,y])=>(A.concepts.includes(x)&&B.concepts.includes(y))||(A.concepts.includes(y)&&B.concepts.includes(x)));if(tension)conflictingPairs.push({...relation,cards:[A.card.name,B.card.name],themes:tension,reason:"los ejes introducen necesidades opuestas"});}}
 const buckets=new Map();
 for(const item of enriched)for(const theme of item.concepts){const bucket=buckets.get(theme)||[];bucket.push(item);buckets.set(theme,bucket)}
 const narrativeClusters=[];
 for(const [theme,items] of buckets.entries()){
  if(items.length<2)continue;
  const itemIndices=new Set(items.map(item=>item.index)),edges=relations.filter(rel=>rel.indices.every(index=>itemIndices.has(index))),visited=new Set();
  for(const item of items){if(visited.has(item.index))continue;const component=[],queue=[item.index];visited.add(item.index);while(queue.length){const current=queue.shift(),member=items.find(candidate=>candidate.index===current);if(member)component.push(member);for(const edge of edges){if(!edge.indices.includes(current))continue;const next=edge.indices[0]===current?edge.indices[1]:edge.indices[0];if(!visited.has(next)){visited.add(next);queue.push(next)}}}if(component.length<2)continue;const connected=edges.filter(edge=>edge.indices.every(index=>component.some(member=>member.index===index))).length,score=component.reduce((sum,member)=>sum+member.weight,0)+connected*2;narrativeClusters.push({theme,cards:component.map(member=>member.card.name),indices:component.map(member=>member.index),positions:component.map(member=>member.position),relationship:component.map(member=>`${member.card.name}: ${member.positionFunction}`).join(" → "),strength:strengthLabel(score),score});}
 }
 narrativeClusters.sort((a,b)=>b.score-a.score);
 if(!narrativeClusters.length){const strongest=[...enriched].sort((a,b)=>b.weight-a.weight).slice(0,Math.min(3,enriched.length));narrativeClusters.push({theme:strongest.flatMap(x=>x.concepts).slice(0,2).join(" y ")||"proceso central",cards:strongest.map(x=>x.card.name),indices:strongest.map(x=>x.index),positions:strongest.map(x=>x.position),relationship:strongest.map(x=>`${x.card.name}: ${x.positionFunction}`).join(" → "),strength:"medium",score:strongest.reduce((s,x)=>s+x.weight,0)});}
 const repeatedNumbers=[...new Set(cards.map(card=>card.number).filter(number=>number!==null&&cards.filter(c=>c.number===number).length>1))];
 const suits=cards.map(card=>card.suit).filter(Boolean),suitCounts=Object.fromEntries([...new Set(suits)].map(suit=>[suit,suits.filter(x=>x===suit).length])),dominantSuits=Object.entries(suitCounts).filter(([,count])=>count===Math.max(0,...Object.values(suitCounts))).map(([suit])=>suit),missingSuits=["Bastos","Copas","Espadas","Oros"].filter(suit=>!suits.includes(suit));
 const majorArcanaCount=cards.filter(card=>card.arcana==="Mayor").length,central=narrativeClusters[0],secondary=narrativeClusters.slice(1,3);
 const centralThesis=`La lectura se organiza alrededor de ${central.theme}; ${central.relationship.toLowerCase()}.`;
 const trend=enriched.filter(item=>TREND_POSITION.test(item.position)).map(item=>({card:item.card.name,themes:item.concepts,function:item.positionFunction}));
 const semanticModel={domain,mode:grammar.mode,purpose:grammar.purpose,dominant_theme:central.theme,secondary_themes:secondary.map(item=>item.theme),positionAnswers:positionalInterpretations,position_answers:positionalInterpretations,propositions:positionalInterpretations,relations:propositionRelations,positional_interpretations:positionalInterpretations,central_conflict:conflictingPairs[0]||null,supporting_factors:reinforcingPairs,blocking_factors:enriched.filter(item=>item.card.isReversed||NEGATIVE_POSITION.test(item.position)).map(item=>({position:item.position,card:item.card.name,concepts:item.concepts})),contradictions:conflictingPairs,turning_point:enriched.find(item=>POSSIBILITY_POSITION.test(item.position)||/futuro|umbral|próximo/i.test(item.position))||null,user_agency:enriched.filter(item=>/actitud|consejo|acción|estrategia|tu |yo|mente|emoción/i.test(item.position)).map(item=>item.position),external_factors:enriched.filter(item=>/entorno|otra persona|su energía|mercado|comunidad/i.test(item.position)).map(item=>item.position),probable_direction:trend,uncertainty:conflictingPairs.length?"Hay señales que no avanzan en la misma dirección.":"La lectura conserva el margen propio de una tendencia simbólica.",advice_basis:{conflict:conflictingPairs[0]||null,agency:enriched.filter(item=>/actitud|consejo|acción|estrategia/i.test(item.position)).map(item=>item.card.name),trend:trend.map(item=>item.card)}};
 const structuralWeight={majorArcanaCount,majorArcanaRatio:cards.length?majorArcanaCount/cards.length:0,dominantSuits,missingSuits,repeatedNumbers,repeatedThemes:narrativeClusters.map(x=>x.theme)},fallbackUsed=!grammar.known||grammar.narrativeStrategy==="generic_map";
 const interpretationDebug={spreadStrategy:grammar.narrativeStrategy,domain,mode:grammar.mode,purpose:grammar.purpose,positionAnswers:positionalInterpretations,positionInterpretations:positionalInterpretations,propositions:positionalInterpretations,relationshipsUsed:propositionRelations,patternsDetected:{repeatedThemes:structuralWeight.repeatedThemes,majorArcanaCount,dominantSuits,repeatedNumbers},fallbackUsed};
 if(isKnownSpread(spread)&&fallbackUsed&&typeof console!=="undefined")console.warn(`[tarot] La tirada conocida "${spread}" cayó en una estrategia genérica.`);
 const positionAnswersById=Object.fromEntries(positionalInterpretations.map(item=>[item.positionId,item])),cardsByPositionId=Object.fromEntries(enriched.map(item=>[item.positionId,item.card]));
 return {drawId:resolvedDrawId,context:{spread,category,question,domain,mode:grammar.mode,purpose:grammar.purpose,deck:"Rider–Waite–Smith",orientationEnabled},spreadGrammar:grammar,narrativeStrategy,semanticModel,positionAnswers:positionalInterpretations,positionAnswersById,cardsByPositionId,propositions:positionalInterpretations,propositionRelations,positionalInterpretations,readingStory,narrativeArcs,contextualRelations:narrativeArcs.slice(0,4),structuralWeight,positionDynamics:enriched.map(({card,index,positionId,position,positionFunction,concepts,weight})=>({cardId:card.id,card:card.name,index,positionId,position,positionFunction,concepts,weight})),reinforcingPairs,conflictingPairs,narrativeClusters,temporalFlow:relations.filter(x=>/desarrollo|antecedente|futuro|tendencia|consecuencia/.test(x.kind)),internalExternalDynamics:relations.filter(x=>x.kind.includes("interior")),centralTensions:conflictingPairs,centralThesis,secondaryTheses:secondary.map(x=>`${x.theme}: ${x.relationship}`),trendSynthesis:trend.length?`La dirección probable se relaciona con ${trend.flatMap(x=>x.themes).slice(0,3).join(", ")}; no constituye un destino fijo.`:"La tirada describe condiciones y decisiones, no un destino fijo.",confidenceNotes:[central.strength==="high"?"El eje principal está reforzado por varias cartas o relaciones.":"La tesis es orientativa y conviene contrastarla con los hechos."],interpretationDebug};
}

function application(theme,category){const c=normalize(category);if(/amor|relacion|familia/.test(c)){if(theme.includes("vínculo"))return "la reciprocidad y las decisiones afectivas";if(theme.includes("claridad"))return "lo que necesita hablarse o comprobarse";}if(/trabajo|dinero|proyecto/.test(c)){if(theme.includes("vínculo"))return "los acuerdos y la colaboración";if(theme.includes("construcción"))return "la forma de convertir esfuerzo y recursos en resultados";}return `la manera en que se combinan ${theme.replace(" y "," con ")}`;}
function area(position){const key=normalize(position),areas={"yo":"tu manera de posicionarte","recursos":"tu seguridad y tus recursos","comunicacion":"la forma de expresar y entender lo que ocurre","hogar":"tu base, hogar o sensación de pertenencia","creatividad":"tu capacidad de crear y disfrutar","rutinas":"tus hábitos y responsabilidades cotidianas","vinculos":"tus relaciones cercanas","transformacion":"aquello que debe cambiar de raíz","vision":"tu manera de comprender el futuro","vocacion":"tu dirección profesional o vocación","comunidad":"tu relación con grupos y apoyos","inconsciente":"lo que procesas en silencio"};if(areas[key])return areas[key];if(NEGATIVE_POSITION.test(position))return "el punto que hoy complica la situación";if(TREND_POSITION.test(position))return "la dirección que toman las condiciones actuales";if(POSSIBILITY_POSITION.test(position))return "lo que todavía puede desarrollarse";if(/pasado|base|raiz|origen/.test(key))return "lo que sostiene esta situación desde atrás";if(/actitud|mente|emocion|tu energia/.test(key))return "tu forma de responder";if(/entorno|otra persona|su energia/.test(key))return "las circunstancias y respuestas externas";return `el aspecto relacionado con ${position.toLowerCase()}`;}
const quality=card=>card.keys.slice(0,2).join(" y ");
const sentence=text=>text.charAt(0).toUpperCase()+text.slice(1);
function humanCluster(cluster,analysis,cards){
 const members=cluster.indices.map(index=>({dynamic:analysis.positionDynamics[index],card:cards[index]})),obstacle=members.find(x=>NEGATIVE_POSITION.test(x.dynamic.position)),origin=members.find(x=>/base|raíz|origen|pasado/i.test(x.dynamic.position)),opening=[...members].reverse().find(x=>POSSIBILITY_POSITION.test(x.dynamic.position)||TREND_POSITION.test(x.dynamic.position));
 if(origin&&opening)return `Lo que se viene gestando en ${area(origin.dynamic.position)} desde ${quality(origin.card)} está empujando ${area(opening.dynamic.position)} hacia ${quality(opening.card)}. No parece un cambio aislado: afecta la manera de conservar lo útil sin sostener una forma que ya perdió vigencia.`;
 if(obstacle){const support=members.find(x=>x!==obstacle);return `En ${area(support.dynamic.position)}, ${quality(support.card)} puede ayudarte a comprender lo que ocurre. La dificultad es que, en ${area(obstacle.dynamic.position)}, esa búsqueda se vuelve ${quality(obstacle.card)} y corre el riesgo de transformarse en distancia, demora o exceso de análisis.`;}
 const [first,second]=members;return `${sentence(area(first.dynamic.position))} necesita encontrar un acuerdo con ${area(second.dynamic.position)}. La combinación de ${quality(first.card)} no basta por sí sola: necesita convivir con ${quality(second.card)} para que la situación sea sostenible.`;
}
function pairNarrative(pair,analysis,cards){const members=pair.cards.map(name=>{const index=cards.findIndex(card=>card.name===name);return {dynamic:analysis.positionDynamics[index],card:cards[index]}}).filter(x=>x.card);if(members.length<2)return "";return `Existe una tensión concreta entre ${area(members[0].dynamic.position)} y ${area(members[1].dynamic.position)}: ${quality(members[0].card)} puede abrir una posibilidad, pero ${quality(members[1].card)} puede frenarla si se convierte en una respuesta automática.`;}
const trimSentence=text=>(text||"").trim().replace(/[.!?]+$/,"").replace(/^./,letter=>letter.toLowerCase());
function contextualMeaning(card,category){if(card.isReversed)return card.reversed;const c=normalize(category||"");if(/amor|relacion|familia/.test(c)&&card.love)return card.love;if(/trabajo|empleo|negocio|vocacion/.test(c)&&card.work)return card.work;if(/dinero|econom|recurso/.test(c)&&card.money)return card.money;if(/personal|crecimiento/.test(c)&&card.growth)return card.growth;return card.general;}
function positionIntent(position){
 const p=normalize(position);
 if(/sombra|herida/.test(p))return "shadow";
 if(/aprendizaje|leccion/.test(p))return "learning";
 if(/recurso|fortaleza|talento/.test(p))return "resource";
 if(/lo que termina|soltar|depuracion|cierre consciente|entrega/.test(p))return "ending";
 if(/umbral/.test(p))return "threshold";
 if(/lo que comienza|iniciar|despertar|primavera/.test(p))return "beginning";
 if(/entrada/.test(p))return "inflow";
 if(/fuga/.test(p))return "leakage";
 if(/reserva/.test(p))return "reserve";
 if(/movimiento/.test(p))return "movement";
 if(/que siente|sentimiento|emocion/.test(p))return "feeling";
 if(/que piensa|mente|comunicacion/.test(p))return "thought";
 if(/que hara|accion|estrategia|consejo|primer paso|salida|integracion/.test(p))return "action";
 if(/riesgo|obstaculo|cruza|bloqueo|advertencia|prueba|distancia/.test(p))return "risk";
 if(/oportunidad|posibilidad|potencial/.test(p))return "opportunity";
 if(/pasado|origen|invierno/.test(p))return "past";
 if(/base|raiz|inconsciente/.test(p))return "foundation";
 if(/futuro|tendencia|resultado|evolucion|destino/.test(p))return "future";
 if(/actitud|tu energia|yo|esencia/.test(p))return "attitude";
 if(/entorno|otra persona|su energia|mercado|comunidad/.test(p))return "external";
 if(/esperanza|temor|deseo/.test(p))return "expectation";
 if(/condicion/.test(p))return "condition";
 if(/presente|situacion|estado actual|centro/.test(p))return "present";
 return "general";
}
function uprightPositionMeaning(card,intent,category){
 const name=normalize(card.name),general=trimSentence(contextualMeaning(card,category));
 if(/enamorados/.test(name)){if(intent==="shadow")return "la dificultad para elegir, la búsqueda de validación o el intento de conservar opciones incompatibles está creando ambivalencia entre deseo y valores";if(intent==="learning")return "el aprendizaje consiste en elegir desde valores claros y aceptar que decidir también implica renunciar a una alternativa";if(intent==="resource")return "tu capacidad para reconocer lo que valoras y comprometerte con una elección consciente juega a tu favor";if(intent==="feeling")return "hay atracción o una conexión emocional real, aunque esos sentimientos también obligan a decidir qué lugar darles";if(intent==="thought")return "la mente está valorando una elección importante y compara lo que desea con lo que considera correcto";if(intent==="action")return "la acción dependerá de una elección clara; no bastará con mantener abiertas todas las posibilidades";if(intent==="risk")return "el riesgo está en decidir sólo desde el deseo o en evitar una elección que ya pide definición";return "aparece una elección importante que debe respetar tanto los valores personales como la realidad del vínculo o acuerdo";}
 if(/mago/.test(name)){if(intent==="thought")return "mentalmente hay iniciativa: se considera posible hablar, acercarse o provocar un cambio en la situación";if(intent==="action")return "hay recursos para intervenir y convertir una intención en un paso concreto";if(intent==="risk")return "el riesgo está en confiar demasiado en la propia habilidad o usar los recursos sin una dirección definida";if(intent==="opportunity")return "la oportunidad consiste en utilizar capacidades que ya están disponibles y darles una aplicación concreta";return "existen iniciativa y recursos suficientes para intervenir, siempre que se utilicen con una intención clara";}
 if(/rueda/.test(name)){if(intent==="action")return "la situación probablemente se moverá y puede haber un acercamiento o giro inesperado, aunque no todo dependerá exclusivamente de una persona";if(intent==="future")return "se aproxima un giro que puede abrir posibilidades nuevas, pero su forma concreta dependerá también de circunstancias externas";if(intent==="risk")return "el riesgo está en dejar una decisión importante enteramente en manos del azar o de circunstancias cambiantes";if(intent==="opportunity")return "un cambio de circunstancias puede abrir una oportunidad que hasta ahora no estaba disponible";return "las circunstancias empiezan a girar y exigen adaptarse a un movimiento que no puede controlarse por completo";}
 if(/estrella/.test(name)){if(intent==="opportunity")return "existe una oportunidad prometedora para recuperar confianza, inspiración y una dirección más auténtica";if(intent==="risk")return "el riesgo está en idealizar una señal favorable y tratar la esperanza como si ya fuera una confirmación";if(intent==="future")return "la tendencia favorece una recuperación gradual de la confianza y una visión más clara del camino";return "empieza a recuperarse la confianza en una dirección que antes parecía debilitada";}
 if(/loco/.test(name)){if(intent==="risk")return "el principal riesgo es precipitarse, confiar en exceso o comenzar sin conocer suficientemente el terreno y sus consecuencias";if(intent==="action")return "la acción tiende a ser espontánea y puede iniciar algo nuevo, aunque necesita una mínima conciencia de sus consecuencias";if(intent==="opportunity")return "la oportunidad permite comenzar de otra manera, con libertad para explorar un terreno nuevo";if(intent==="future")return "se abre un comienzo distinto, todavía incierto, que ofrece libertad pero exige mirar por dónde se avanza";return "se abre un camino nuevo que invita a avanzar, sin confundir libertad con ausencia de consecuencias";}
 if(/sacerdotisa/.test(name)){if(intent==="action")return "la mejor estrategia es observar antes de actuar, reunir información y reservar lo importante hasta comprender mejor el terreno";if(intent==="thought")return "hay pensamientos que todavía se mantienen en reserva; se observa más de lo que se expresa";if(intent==="feeling")return "los sentimientos son profundos pero contenidos y no parecen mostrarse por completo";if(intent==="risk")return "el silencio o la información incompleta pueden convertirse en el principal punto ciego";return "hay algo que todavía necesita observarse en silencio antes de revelarse o convertirse en acción";}
 if(/ermitano/.test(name)){if(intent==="past")return "vienes de un periodo de introspección en el que necesitaste tomar distancia y encontrar tus propias respuestas antes de avanzar";if(intent==="risk")return "el exceso de análisis, la demora o el aislamiento pueden estar dificultando una respuesta que ya necesita salir al mundo";if(intent==="action")return "conviene tomar distancia del ruido y pensar antes de decidir, sin convertir la prudencia en aislamiento";if(intent==="future")return "se aproxima una etapa de reflexión que puede exigir distancia y una respuesta menos influida por opiniones externas";if(intent==="external")return "el entorno ofrece pocas respuestas inmediatas y parece mantener distancia o silencio";return "necesitas reducir el ruido externo y encontrar una respuesta propia antes de avanzar";}
 if(/muerte/.test(name)){if(intent==="learning")return "el aprendizaje consiste en aceptar un final, soltar una identidad o dinámica agotada y permitir una transformación real";if(intent==="resource")return "tu capacidad de cerrar, soltar y reorganizarte ante un cambio profundo juega a tu favor";if(intent==="ending")return "está terminando una etapa que ya cumplió su función y necesita dejar espacio a otra forma";if(intent==="threshold")return "para cruzar hacia lo nuevo necesitas aceptar que una forma anterior ya terminó y no puede conservarse intacta";if(intent==="beginning")return "lo nuevo surge después de una depuración profunda y no podrá construirse con la misma forma que acaba de terminar";if(intent==="past")return "vienes de un cierre importante que cambió la forma anterior de la situación y dejó algo definitivamente atrás";if(intent==="risk")return "la resistencia a cerrar una etapa puede prolongar una forma que ya perdió vigencia";if(intent==="future")return "la tendencia conduce hacia un cierre y una reorganización profunda de lo que todavía puede continuar";return "una etapa está terminando y obliga a distinguir qué debe cerrarse de lo que puede renovarse";}
 if(/juicio/.test(name)){if(intent==="resource")return "cuentas con la capacidad de reconocer la verdad, revisar el pasado con conciencia y tomar una decisión definitiva";if(intent==="learning")return "el aprendizaje consiste en escuchar el llamado que surge de lo vivido y responder con una decisión consciente";if(intent==="shadow")return "evitar una evaluación honesta del pasado o esperar validación externa está retrasando una decisión necesaria";if(intent==="action")return "es momento de reconocer lo aprendido, responder al llamado y tomar una decisión que cierre la indecisión";if(intent==="future")return "se acerca una evaluación decisiva que puede traer despertar, claridad y una segunda oportunidad";return "una verdad del pasado pide ser reconocida para despertar y decidir con mayor conciencia";}
 if(/templanza/.test(name)){if(intent==="risk")return "el riesgo está en sostener demasiado tiempo una situación desigual o confundir equilibrio con inmovilidad";if(intent==="action")return "la respuesta más sensata es combinar los elementos gradualmente y corregir los excesos antes de avanzar";return "la situación busca un punto medio entre fuerzas distintas y necesita ajustes graduales para no producir desgaste";}
 if(/ocho de oros/.test(name)){if(intent==="future")return "lo que se construya dependerá menos de un golpe de suerte que de la constancia, la práctica y el cuidado de los detalles";if(intent==="risk")return "el riesgo está en repetir esfuerzo sin corregir la técnica o perderse en detalles que no mejoran el resultado";if(intent==="action")return "la estrategia pide trabajo constante, atención y corrección paciente de lo que todavía no funciona";return "el progreso se sostiene con práctica, constancia y cuidado de los detalles";}
 if(/as de espadas/.test(name)){if(intent==="action")return "es momento de formular una decisión clara, hacer la pregunta directa o cortar aquello que mantiene la confusión";if(intent==="risk")return "el riesgo está en usar una verdad de forma tajante o decidir antes de comprender todos los hechos";if(intent==="opportunity")return "la oportunidad consiste en obtener claridad, nombrar el problema y tomar una decisión mejor informada";return "empieza a entrar claridad y con ella la posibilidad de definir el problema sin seguir rodeándolo";}
 if(/dos de copas/.test(name)){if(intent==="feeling")return "hay apertura emocional y deseo de encuentro, con potencial para una respuesta recíproca";if(intent==="thought")return "se piensa en un acercamiento, acuerdo o conversación capaz de equilibrar a ambas partes";if(intent==="action")return "la acción tiende hacia el acercamiento o la búsqueda de un acuerdo";if(intent==="risk")return "el riesgo está en suponer reciprocidad antes de verla demostrada en hechos";return "existe posibilidad de encuentro o acuerdo, siempre que el intercambio sea realmente recíproco";}
 if(intent==="shadow")return `el patrón que necesita reconocerse aparece aquí: ${general}`;if(intent==="learning")return `la experiencia pide comprender y aceptar esto: ${general}`;if(intent==="resource")return `juega a tu favor esta capacidad: ${general}`;if(intent==="ending")return `está terminando una etapa marcada por esto: ${general}`;if(intent==="threshold")return `para cruzar hacia lo nuevo necesitas responder a esto: ${general}`;if(intent==="beginning")return `empieza a surgir una etapa en la que ${general}`;if(intent==="inflow")return `la entrada de recursos se favorece cuando ${general}`;if(intent==="leakage")return `los recursos se pierden, dispersan o bloquean cuando ${general}`;if(intent==="reserve")return `puedes conservar o acumular recursos mediante esta capacidad: ${general}`;if(intent==="movement")return `los recursos pueden ponerse a trabajar cuando ${general}`;if(intent==="past")return `vienes de una etapa en la que ${general}`;if(intent==="risk")return `el riesgo o bloqueo aparece donde ${general}`;if(intent==="action")return `la acción más coherente consiste en que ${general}`;if(intent==="opportunity")return `la oportunidad surge porque ${general}`;if(intent==="future")return `la tendencia sugiere que ${general}`;if(intent==="feeling")return `emocionalmente, ${general}`;if(intent==="thought")return `mentalmente, ${general}`;return general;
}
function reversedPositionMeaning(card,intent,category){
 const keys=normalize(card.keys.join(" ")),specific=trimSentence(card.reversed||contextualMeaning(card,category));
 if(/reciprocidad|encuentro|acuerdo|vinculo/.test(keys)){if(intent==="feeling")return "hay sentimientos o deseo de acercamiento, pero la reciprocidad es desigual o no consigue expresarse con claridad";if(intent==="action")return "el acercamiento puede retrasarse, darse a medias o depender de que ambas partes corrijan un intercambio desigual";return "dos partes parecen querer cosas distintas o no consiguen encontrarse desde un intercambio equilibrado";}
 if(/claridad|verdad|decision/.test(keys)){if(intent==="thought")return "la mente gira alrededor del problema, pero la información se mezcla con dudas y dificulta una conclusión clara";if(intent==="action")return "la acción puede demorarse o dirigirse mal porque todavía no se ha definido con claridad qué hacer";return "la claridad está distorsionada o incompleta y decidir ahora podría apoyarse en una lectura equivocada de los hechos";}
 if(/intuicion|introspeccion|pausa|prudencia/.test(keys)){if(intent==="risk")return "la reflexión se ha prolongado hasta convertirse en aislamiento, demora o evasión";if(intent==="action")return "conviene salir del aislamiento y contrastar la intuición con información concreta antes de actuar";return "lo que debía ser una pausa útil se está convirtiendo en distancia o dificultad para responder";}
 if(/inicio|libertad|confianza/.test(keys)){if(intent==="risk")return "el riesgo combina impulso sin dirección con falta de experiencia: se puede avanzar demasiado pronto o paralizarse por temor";if(intent==="action")return "el inicio se retrasa o se expresa mediante un impulso poco preparado";return "el deseo de comenzar está frenado por temor o aparece como un impulso que todavía no sabe hacia dónde ir";}
 if(/equilibrio|integracion|paciencia/.test(keys))return intent==="risk"?"el desequilibrio puede agravarse si se sigue compensando un exceso sin corregir su causa":"el intento de mantener armonía está produciendo desgaste porque algo continúa fuera de medida";
 if(/practica|detalle|maestria|accion|recursos/.test(keys))return intent==="action"?"hay capacidad, pero la ejecución se dispersa; hace falta elegir una tarea concreta y corregir lo que no funciona":"el esfuerzo o el talento no están produciendo todo su resultado por dispersión, repetición o mala ejecución";
 if(intent==="shadow")return `el patrón se expresa de forma bloqueada o extrema mediante ${specific}`;if(intent==="learning")return `el aprendizaje se dificulta mientras continúe ${specific}`;if(intent==="resource")return `este recurso está disponible, pero todavía no fluye con libertad debido a ${specific}`;if(intent==="ending")return `el cierre se retrasa o se complica por ${specific}`;if(intent==="threshold")return `el cruce hacia lo nuevo se bloquea mientras continúe ${specific}`;if(intent==="beginning")return `lo nuevo intenta surgir, pero pierde dirección por ${specific}`;if(intent==="inflow")return `la entrada de recursos se reduce o se distorsiona debido a ${specific}`;if(intent==="leakage")return `la fuga se agrava por ${specific}`;if(intent==="reserve")return `la reserva se debilita o no consigue consolidarse debido a ${specific}`;if(intent==="movement")return `los recursos no logran ponerse en movimiento por ${specific}`;if(intent==="past")return `vienes de una etapa marcada por ${specific}`;if(intent==="future")return `la tendencia puede retrasarse o manifestarse de forma problemática mediante ${specific}`;if(intent==="risk")return `el riesgo principal se concentra en ${specific}`;return specific;
}
function ensureRoleContext(meaning,role){
 const base=trimSentence(meaning),plain=normalize(base);
 if(role==="resource_origin"&&!/origen|origino/.test(plain))return `el origen de la situación de recursos se relaciona con esto: ${base}`;
 if(role==="inflow"&&!/entrada de recursos/.test(plain))return `la entrada de recursos se favorece cuando ${base}`;
 if(role==="leakage"&&!/fuga|recursos se pierden|perdida/.test(plain))return `los recursos se pierden, dispersan o bloquean cuando ${base}`;
 if(role==="reserve"&&!/reserva|conservar|acumular/.test(plain))return `puedes conservar o acumular recursos cuando ${base}`;
 if(role==="movement"&&!/recursos.*movimiento|recursos.*trabajar/.test(plain))return `los recursos pueden ponerse a trabajar cuando ${base}`;
 return meaning;
}
function semanticFunctionForRole(role){
 const map={past:"PAST",present:"CURRENT_STATE",foundation:"ORIGIN",obstacle:"OBSTACLE",risk:"RISK",warning:"RISK",shadow:"INTERNAL",
  resource:"RESOURCE",learning:"RESOURCE",action:"ACTION",advice:"ADVICE",future:"TREND",opportunity:"POTENTIAL",feeling:"INTERNAL",
  thought:"INTERNAL",external:"EXTERNAL",expectation:"DESIRE",condition:"DECISION",ending:"ENDING",beginning:"BEGINNING",
  threshold:"DECISION",bond:"RELATIONSHIP",distance:"OBSTACLE",outcome:"OUTCOME",option:"DECISION",leakage:"RISK",inflow:"RESOURCE",
  reserve:"RESOURCE",movement:"ACTION",resource_origin:"ORIGIN",calling:"BEGINNING",insight:"RESOURCE",focus:"CURRENT_STATE"};
 return map[role]||"CURRENT_STATE";
}
function answerModeForIntent(intent,position=""){
 const label=normalize(position);
 if(/conservar/.test(label))return "PRESERVE_CONSTRUCTIVE";
 if(/soltar|depuracion/.test(label))return "RELEASE_EXPRESSION";
 if(/lo que termina/.test(label))return "ENDING_EXPRESSION";
 if(/iniciar|lo que comienza/.test(label))return "INITIATE_EXPRESSION";
 if(/primer paso/.test(label))return "FIRST_ACTION";
 const map={shadow:"EXPOSE_OBSTACLE",learning:"INTEGRATE_LEARNING",resource:"ACTIVATE_RESOURCE",ending:"ENDING_EXPRESSION",
  threshold:"DECISION_CONDITION",beginning:"INITIATE_EXPRESSION",inflow:"ENABLE_INFLOW",leakage:"EXPOSE_LEAKAGE",
  reserve:"BUILD_RESERVE",movement:"MOBILIZE_RESOURCES",feeling:"EMOTIONAL_RESPONSE",thought:"MENTAL_RESPONSE",
  action:"ACTIONABLE_RESPONSE",risk:"EXPOSE_RISK",opportunity:"FUNCTIONAL_OPPORTUNITY",past:"PAST_INFLUENCE",
  foundation:"ORIGIN_EXPLANATION",future:"CONDITIONAL_OUTCOME",attitude:"INTERNAL_RESPONSE",external:"EXTERNAL_RESPONSE",
  expectation:"DESIRE_OR_FEAR",condition:"DECISION_CONDITION",present:"CURRENT_STATE_ANSWER",general:"POSITION_SPECIFIC_ANSWER"};
 return map[intent]||"POSITION_SPECIFIC_ANSWER";
}
export function interpretCardInPosition(card,{position="",positionSpec=null,spreadType="",spread="",domain="GENERAL",secondaryDomains=[],mode="NARRATIVO",purpose="",neighboringCards=[],questionContext="",category="Consulta general"}={}){
 const intent=positionSpec?.role||positionIntent(position),effectiveSpec={...(positionSpec||{}),id:positionSpec?.id||null,label:positionSpec?.label||position,question:positionSpec?.question||`¿Cómo responde esta carta a lo que representa ${position.toLowerCase()}?`,answerMode:positionSpec?.answerMode||answerModeForIntent(intent,position),role:intent,function:positionSpec?.function||semanticFunctionForRole(intent)},rawInterpretation=card.isReversed?reversedPositionMeaning(card,intent,category):uprightPositionMeaning(card,intent,category),baseInterpretation=ensureRoleContext(rawInterpretation,intent),neighborThemes=neighboringCards.flatMap(neighbor=>concepts(neighbor)),own=concepts(card),shared=own.filter(theme=>neighborThemes.includes(theme)),warningRoles=new Set(["risk","shadow","obstacle","warning","leakage","distance"]),supportRoles=new Set(["opportunity","resource","advice","action","inflow","reserve"]),confidence=shared.length||card.arcana==="Mayor"?"high":"medium";
 const semanticRange={
  general:trimSentence(contextualMeaning(card,category)),constructive:uprightPositionMeaning(card,"resource",category),
  opportunity:uprightPositionMeaning(card,"opportunity",category),learning:uprightPositionMeaning(card,"learning",category),
  challenging:uprightPositionMeaning(card,"risk",category),actionable:card.advice||uprightPositionMeaning(card,"action",category),
  outcome:uprightPositionMeaning(card,"future",category),past:uprightPositionMeaning(card,"past",category),
  emotional:uprightPositionMeaning(card,"feeling",category),mental:uprightPositionMeaning(card,"thought",category),
  external:uprightPositionMeaning(card,"external",category),orientation:baseInterpretation
 };
 const proposition=buildContextualProposition({card,position,positionSpec:effectiveSpec,baseInterpretation,semanticRange,spread,domain,secondaryDomains,mode,purpose,questionContext,category,neighboringCards,themes:own,confidence});
 return {...proposition,positionId:effectiveSpec.id,question:effectiveSpec.question,positionQuestion:effectiveSpec.question,answerMode:effectiveSpec.answerMode,role:intent,polarity:card.isReversed||warningRoles.has(intent)?"warning":supportRoles.has(intent)?"support":"mixed",spreadType};
}
function cardExpression(card,role,category){return interpretCardInPosition(card,{position:role,category}).interpretation;}
function narrativeState(card){
 const keys=normalize(card.keys.join(" "));
 if(card.isReversed){
  if(/reciprocidad|encuentro|acuerdo|vinculo/.test(keys))return "encuentro bloqueado";
  if(/claridad|verdad|decision/.test(keys))return "claridad bloqueada";
  if(/intuicion|introspeccion|pausa|prudencia/.test(keys))return "pausa convertida en aislamiento";
  if(/inicio|libertad|confianza/.test(keys))return "inicio sin dirección";
  if(/equilibrio|integracion|paciencia/.test(keys))return "desequilibrio";
  if(/practica|detalle|maestria|accion|recursos/.test(keys))return "capacidad sin ejecución";
  return "movimiento bloqueado";
 }
 if(/intuicion|pausa|profundidad|introspeccion|prudencia|sabiduria/.test(keys))return "búsqueda interior";
 if(/claridad|verdad|decision/.test(keys))return "claridad para decidir";
 if(/esperanza|autenticidad/.test(keys))return "esperanza recuperada";
 if(/cierre|transformacion|renovacion/.test(keys))return "cierre y renovación";
 if(/cambio|ciclo|adaptacion/.test(keys))return "movimiento de las circunstancias";
 if(/equilibrio|integracion|paciencia/.test(keys))return "equilibrio sostenible";
 if(/encuentro|reciprocidad|acuerdo/.test(keys))return "encuentro recíproco";
 if(/eleccion|vinculo|valores/.test(keys))return "decisión coherente";
 if(/practica|detalle|maestria/.test(keys))return "construcción constante";
 if(/iniciativa|recursos|accion/.test(keys))return "acción con recursos";
 if(/inicio|libertad|confianza/.test(keys))return "apertura de un camino";
 return concepts(card)[0]||"proceso en desarrollo";
}
function semanticMovement(from,to){
 const a=narrativeState(from),b=narrativeState(to),key=`${a}>${b}`,known={
  "búsqueda interior>claridad para decidir":"la búsqueda interior empieza a convertirse en claridad para decidir",
  "búsqueda interior>movimiento de las circunstancias":"la pausa empieza a ceder ante un movimiento que ya no puede ignorarse",
  "cierre y renovación>esperanza recuperada":"el cierre de una etapa está dejando espacio para recuperar esperanza y dirección",
  "cierre y renovación>apertura de un camino":"lo que termina abre un camino distinto, aunque todavía no esté completamente definido",
  "claridad para decidir>acción con recursos":"la claridad encuentra herramientas para convertirse en una acción concreta",
  "claridad para decidir>capacidad sin ejecución":"la claridad ya existe, pero todavía no consigue convertirse en una acción coherente",
  "esperanza recuperada>construcción constante":"la esperanza necesita dejar de ser expectativa y convertirse en trabajo sostenido",
  "desequilibrio>equilibrio sostenible":"lo que estaba fuera de medida empieza a buscar un reajuste posible",
  "encuentro bloqueado>encuentro recíproco":"la distancia o desigualdad todavía puede transformarse en encuentro, pero la reciprocidad debe demostrarse",
  "movimiento de las circunstancias>apertura de un camino":"el giro de las circunstancias empieza a abrir un camino nuevo",
 };
 if(a===b)return `${a} se profundiza y sigue marcando el rumbo`;
 return known[key]||`${a} está dando paso a ${b}`;
}
function relationKind(first,second){
 const A=concepts(first),B=concepts(second),opposed=OPPOSITES.some(([x,y])=>(A.includes(x)&&B.includes(y))||(A.includes(y)&&B.includes(x)));
 if(first.isReversed||second.isReversed||opposed)return "tension";
 if(A.some(theme=>B.includes(theme)))return "reinforcement";
 return "development";
}
function positionedExpression(analysis,node){return analysis.positionAnswersById?.[node.positionId]?.interpretation||cardExpression(node.card,node.role,analysis.context.category);}
function strategySynthesis(analysis,cards,rawParagraphs){
 const story=analysis.readingStory,strategy=analysis.narrativeStrategy.strategy,e=node=>positionedExpression(analysis,node),state=node=>narrativeState(node.card),nodes=story.steps||story.areas||[],fallback=deriveAdvice(analysis);
 const packageResult=(fields)=>({strategy,...fields});
 if(strategy==="seasonal_cycle"){
  const [winter,awakening,spring,expansion,summer,harvest,autumn,release,center]=nodes;
  return packageResult({reading_thesis:`El ciclo anual gira alrededor de un tema en el que ${e(center)}.`,central_tension:e(release),main_movement:semanticMovement(winter.card,release.card),arcs:{opening:`El ciclo comienza en invierno, con una etapa en la que ${e(winter)}. Durante el despertar, ${e(awakening)}; lo que estaba en preparación empieza a mostrar su primera forma.`,growth:`En primavera, ${e(spring)}. La expansión lleva ese proceso hacia un momento en el que ${e(expansion)}, hasta alcanzar en verano la fase de mayor actividad: ${e(summer)}.`,results:`La cosecha permite ver resultados mediante una situación en la que ${e(harvest)}. El otoño pide evaluar y madurar lo vivido, porque ${e(autumn)}.`,closure:`Antes de cerrar el ciclo será necesario depurar: ${e(release)}. Todo el año vuelve al tema central, donde ${e(center)}; esa es la medida para decidir qué conservar y qué dejar atrás.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(center),e(release)],depends_on_others:[],depends_on_circumstances:[e(winter),e(summer)]},warning:`No intentes llevar al siguiente ciclo aquello que la etapa de depuración ya pide revisar: ${e(release)}.`,actionable_guidance:`Usa el tema central como criterio: ${e(center)}. Al cerrar el año, suelta lo que contradiga esa dirección y conserva lo que haya demostrado sostenerla.`});
 }
 if(strategy==="systemic_map"){
  const groups=analysis.narrativeStrategy.schema==="twelve_houses"?[
   {key:"personal",label:"tu identidad y lo que procesas en silencio",indices:[0,11]},
   {key:"practical",label:"los recursos, las rutinas y la vocación",indices:[1,5,9]},
   {key:"relational",label:"la comunicación, los vínculos y la comunidad",indices:[2,6,10]},
   {key:"structural",label:"el hogar, la creatividad, la transformación y la visión",indices:[3,4,7,8]},
  ]:[{key:"whole",label:"las distintas partes del mapa",indices:nodes.map((_,index)=>index)}];
  const summaries=groups.map(group=>{const members=group.indices.map(index=>nodes[index]).filter(Boolean),ranked=[...members].sort((a,b)=>((b.card.isReversed?3:0)+(b.card.arcana==="Mayor"?2:0))-((a.card.isReversed?3:0)+(a.card.arcana==="Mayor"?2:0))),focus=ranked[0],blocked=members.filter(node=>node.card.isReversed).length,themes=members.flatMap(node=>concepts(node.card)),repeated=[...new Set(themes.filter(theme=>themes.filter(item=>item===theme).length>1))];return {...group,members,focus,blocked,repeated,score:blocked*3+members.filter(node=>node.card.arcana==="Mayor").length+(repeated.length*2)}}).sort((a,b)=>b.score-a.score),core=summaries[0],support=[...summaries].sort((a,b)=>a.score-b.score)[0];
  const describe=group=>`${group.label} están marcados por una situación en la que ${e(group.focus)}${group.blocked?`; hay ${group.blocked>1?"varios puntos":"un punto"} que no fluye con libertad`:""}`;
  const arcs=analysis.narrativeStrategy.schema==="twelve_houses"?{
   map_core:`El centro del mapa aparece donde ${describe(core)}. Ese foco repercute en más de una parte de tu vida y explica por qué otros asuntos no pueden leerse por separado.`,
   practical_and_relational:`En lo práctico, ${describe(summaries.find(group=>group.key==="practical"))}. En los vínculos y la comunicación, ${describe(summaries.find(group=>group.key==="relational"))}. La relación entre ambos planos muestra si lo cotidiano sostiene tus acuerdos o empieza a desgastarlos.`,
   inner_and_structural:`Tu mundo personal se enlaza con la estructura que te rodea: ${describe(summaries.find(group=>group.key==="personal"))}, y ${describe(summaries.find(group=>group.key==="structural"))}. Lo que cambie en uno de estos planos puede liberar al otro.`,
   leverage:`El punto con mayor capacidad de apoyo está en ${support.label}: ${e(support.focus)}. Empezar ahí puede ordenar varias piezas del mapa a la vez.`
  }:{map_core:`La lectura funciona como un mapa: ${describe(core)}. Las cartas que se repiten o se contradicen indican qué parte sostiene al conjunto y cuál exige reajuste.`,leverage:`El cambio con mayor alcance comienza donde ${e(support.focus)}. Desde ahí puede repercutir en las demás posiciones sin tratarlas como problemas aislados.`};
  return packageResult({reading_thesis:`El mapa se concentra en ${core.label}; lo que ocurra ahí condiciona varias dimensiones y puede ordenarse desde ${support.label}.`,central_tension:core.blocked?`La mayor presión está en ${core.label}, donde una parte del proceso permanece bloqueada.`:analysis.semanticModel.uncertainty,main_movement:semanticMovement(core.focus.card,support.focus.card),arcs,key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(support.focus)],depends_on_others:[],depends_on_circumstances:[e(core.focus)]},warning:`No intentes corregir cada aspecto por separado: el núcleo que aparece en ${core.label} puede reproducir el mismo problema en otros planos.`,actionable_guidance:`Empieza por aquello que ${e(support.focus)}. Un ajuste ahí puede ordenar el resto del mapa con menos dispersión.`});
 }
 if(strategy==="relational_dynamic"){
  if(analysis.narrativeStrategy.schema==="thought_feeling_action"){
   const [feeling,thought,action]=nodes,relation=relationKind(feeling.card,thought.card),bridge=relation==="tension"?"Lo que se siente y lo que se piensa no terminan de coincidir.":"Lo que se siente encuentra una respuesta activa en el pensamiento.";
   return packageResult({reading_thesis:`La lectura conecta el sentimiento con la intención y muestra cómo ambos pueden convertirse en acción.`,central_tension:relation==="tension"?`${e(feeling)}; sin embargo, ${e(thought)}.`:analysis.semanticModel.uncertainty,main_movement:semanticMovement(feeling.card,action.card),arcs:{feeling_and_thought:`En lo emocional, ${e(feeling)}. En sus pensamientos, ${e(thought)}. ${bridge}`,action:`Esa combinación apunta a una conducta en la que ${e(action)}. La acción no depende solamente del sentimiento: también intervienen la decisión y las circunstancias que rodean la situación.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[],depends_on_others:[e(feeling),e(thought),e(action)],depends_on_circumstances:[]},warning:relation==="tension"?"No des por hecho que sentir algo conduce automáticamente a actuar en la misma dirección.":"El movimiento sugerido todavía necesita confirmarse mediante hechos.",actionable_guidance:`Observa si la iniciativa que aparece en el pensamiento se convierte realmente en la conducta descrita. Da más peso a los hechos que a una intención todavía no realizada.`});
  }
  const tension=story.tension?e(story.tension):"la reciprocidad todavía necesita mostrarse en hechos",direction=e(story.likelyDirection),professional=/trabajo|empleo|negocio|profesional/i.test(analysis.context.category),context=professional?"Aquí el punto común debe verse en colaboración y acuerdos que ambas partes puedan cumplir.":"Aquí el punto común debe verse en reciprocidad y necesidades expresadas con claridad.";
  return packageResult({reading_thesis:`La lectura trata de cómo dos disposiciones distintas construyen —o dificultan— un mismo vínculo.`,central_tension:tension,main_movement:semanticMovement(story.bond.card,story.likelyDirection.card),arcs:{two_sides:`Una parte se acerca de modo que ${e(story.personA)}; la otra responde desde un lugar en el que ${e(story.personB)}. El vínculo nace del punto de encuentro real entre ambas, no de lo que una sola parte desea. ${context}`,bond_and_tension:`Entre ambas aparece una dinámica en la que ${e(story.bond)}. Sin embargo, ${tension}; esa diferencia define cuánto puede avanzar la relación.`,direction:`La evolución sugiere que ${direction}. Esa dirección sólo podrá sostenerse si la participación es recíproca.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.personA)],depends_on_others:[e(story.personB)],depends_on_circumstances:[]},warning:`No confundas el potencial del vínculo con reciprocidad confirmada: ${tension}.`,actionable_guidance:`Observa qué ofrece realmente cada parte. Sostén sólo el movimiento que pueda construirse entre dos, sin compensar de manera unilateral lo que falta.`});
 }
 if(strategy==="comparison"){
  if(analysis.narrativeStrategy.schema==="risk_result"){
   const [advantage,risk,result]=nodes;
   return packageResult({reading_thesis:`El resultado probable depende de aprovechar lo que está a favor sin minimizar el riesgo señalado.`,central_tension:e(risk),main_movement:semanticMovement(advantage.card,result.card),arcs:{balance:`A favor, ${e(advantage)}. Sin embargo, ${e(risk)}; esa dificultad puede reducir la ventaja si se ignora o se subestima.`,outcome:`El resultado probable muestra que ${e(result)}. No surge automáticamente: será más viable si usas la ventaja con criterio y atiendes el riesgo antes de comprometerte.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(advantage),e(risk)],depends_on_others:[],depends_on_circumstances:[e(result)]},warning:`No avances como si el riesgo fuera secundario: ${e(risk)}.`,actionable_guidance:`Aprovecha aquello que ${e(advantage)}, pero establece primero una medida concreta para responder a que ${e(risk)}. Después compara esa realidad con el resultado que aparece.`});
  }
  if(analysis.narrativeStrategy.schema==="traffic_light"){
   const [advance,wait,stop]=nodes;
   return packageResult({reading_thesis:`La lectura distingue qué favorece avanzar, qué necesita tiempo y qué justifica detenerse.`,central_tension:`La decisión exige diferenciar una oportunidad real de una señal que todavía pide cautela.`,main_movement:`tres señales delimitan las condiciones para actuar`,arcs:{signals:`Puedes avanzar en aquello donde ${e(advance)}. Conviene esperar cuando ${e(wait)}. La señal para detenerte aparece si ${e(stop)}.`,criterion:`Estas cartas no dan tres órdenes contradictorias: marcan un criterio. Avanza sólo cuando la primera condición esté presente, concede tiempo a la segunda y detén el movimiento si aparece con claridad la tercera.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(advance),e(wait),e(stop)],depends_on_others:[],depends_on_circumstances:[]},warning:`No conviertas el deseo de avanzar en una razón para ignorar la señal de alto: ${e(stop)}.`,actionable_guidance:`Comprueba cuál de las tres condiciones describe mejor los hechos actuales. Si aún domina que ${e(wait)}, no fuerces una decisión definitiva.`});
  }
  const [a,ar]=story.pathA,[b,br]=story.pathB,consequenceA=ar||a,consequenceB=br||b;
  return packageResult({reading_thesis:"La lectura compara consecuencias, no busca declarar una opción universalmente mejor.",central_tension:`La elección enfrenta ${state(consequenceA)} con ${state(consequenceB)}.`,main_movement:`dos caminos conducen a consecuencias distintas: ${state(consequenceA)} frente a ${state(consequenceB)}`,arcs:{starting_point:`La decisión nace en una situación donde ${e(story.currentSituation)}. Elegir sólo para terminar con la incertidumbre ocultaría el verdadero costo de cada alternativa.`,paths:`Un camino parte de que ${e(a)} y conduce hacia una situación en la que ${e(consequenceA)}. El otro comienza donde ${e(b)} y apunta a que ${e(consequenceB)}.`,comparison:`La diferencia decisiva está en lo que cada resultado permite o exige. En un caso, ${e(consequenceA)}; en el otro, ${e(consequenceB)}. La opción más coherente será la consecuencia que realmente puedas sostener.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.currentSituation)],depends_on_others:[],depends_on_circumstances:[e(consequenceA),e(consequenceB)]},warning:`No elijas por el atractivo inicial. Compara con cuidado que un camino conduce a que ${e(consequenceA)}, mientras el otro apunta a que ${e(consequenceB)}.`,actionable_guidance:`Compara qué exige cada consecuencia de ti. Elige la que coincida con tus recursos y prioridades, no sólo la que alivie primero la incertidumbre.`});
 }
 if(strategy==="problem_resolution"){
  if(analysis.narrativeStrategy.schema==="opportunity_risk")return packageResult({reading_thesis:`La oportunidad nace porque ${e(story.currentSituation)}, pero sólo podrá aprovecharse si la estrategia responde a que ${e(story.mainChallenge)}.`,central_tension:e(story.mainChallenge),main_movement:semanticMovement(story.mainChallenge.card,story.guidance.card),arcs:{direct_reading:`La oportunidad aparece porque ${e(story.currentSituation)}. El principal riesgo sería que ${e(story.mainChallenge)}.`,resolution:`La estrategia responde de forma directa a ese peligro: ${e(story.guidance)}. No se trata de abandonar la oportunidad, sino de evitar que la precipitación o el punto ciego la debiliten.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.guidance)],depends_on_others:[],depends_on_circumstances:[e(story.currentSituation)]},warning:`No confundas entusiasmo con certeza. ${sentence(e(story.mainChallenge))}.`,actionable_guidance:`${sentence(e(story.guidance))}. Deja que esa observación confirme el siguiente paso antes de comprometerte.`});
  return packageResult({reading_thesis:`La situación pide responder a ${state(story.mainChallenge)} mediante ${state(story.guidance)}.`,central_tension:e(story.mainChallenge),main_movement:semanticMovement(story.mainChallenge.card,story.guidance.card),arcs:{problem:`Ahora ${e(story.currentSituation)}. El núcleo del problema aparece donde ${e(story.mainChallenge)}; reaccionar sólo a sus efectos dejaría intacta la causa.`,resolution:`La salida comienza cuando ${e(story.guidance)}. Esa respuesta cambia la dinámica porque atiende directamente lo que hoy impide avanzar.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.guidance)],depends_on_others:[],depends_on_circumstances:[e(story.currentSituation)]},warning:`El principal riesgo es responder al síntoma y dejar intacto que ${e(story.mainChallenge)}.`,actionable_guidance:`Lleva tu esfuerzo al punto en el que ${e(story.guidance)}. Esa es la acción que mejor responde al bloqueo mostrado.`});
 }
 if(strategy==="focal_message"){
  const focus=nodes[0];return packageResult({reading_thesis:e(focus),central_tension:focus.card.isReversed?e(focus):"",main_movement:state(focus),arcs:{focus:`El mensaje se concentra en una sola imagen: ${e(focus)}. No necesita convertirse en una predicción; funciona como el aspecto que merece toda tu atención ahora.`},key_relationships:[],agency:{depends_on_consultant:[e(focus)],depends_on_others:[],depends_on_circumstances:[]},warning:focus.card.isReversed?`Observa dónde ${e(focus)}.`:"No disperses el mensaje intentando hacerlo responder asuntos que no aparecen en la carta.",actionable_guidance:`Lleva este símbolo a una pregunta concreta: ¿dónde puedes reconocer que ${e(focus)}?`});
 }
 if(strategy==="weighted_answer"){
  const [answer,condition,warning]=nodes;return packageResult({reading_thesis:`La respuesta está condicionada por ${state(condition)} y no puede separarse de ${state(warning)}.`,central_tension:e(warning),main_movement:semanticMovement(condition.card,answer.card),arcs:{answer:`La respuesta se inclina hacia una situación en la que ${e(answer)}, pero no es un sí o un no aislado.`,conditions:`Para que esa dirección pueda sostenerse, ${e(condition)}. Al mismo tiempo, ${e(warning)} marca el punto que podría cambiar el resultado.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(condition)],depends_on_others:[],depends_on_circumstances:[e(answer)]},warning:`La respuesta pierde fuerza si ${e(warning)}.`,actionable_guidance:`Antes de actuar, comprueba si realmente ${e(condition)}. Esa condición pesa más que una respuesta rápida.`});
 }
 if(strategy==="sequence"||strategy==="inner_evolution"||strategy==="evolutionary_story"){
  const first=nodes[0],middle=nodes[Math.floor((nodes.length-1)/2)],last=nodes.at(-1),movement=semanticMovement(first.card,last.card);
  return packageResult({reading_thesis:`La lectura describe un paso de ${state(first)} hacia ${state(last)}.`,central_tension:middle.card.isReversed?e(middle):analysis.semanticModel.uncertainty,main_movement:movement,arcs:{development:`El recorrido comienza donde ${e(first)}. En el momento actual, ${e(middle)}; esta es la bisagra entre lo vivido y lo que empieza a formarse.`,direction:`Si este proceso continúa, ${e(last)}. La tendencia nace de cómo el presente transforma o prolonga lo que comenzó antes, no de una carta aislada.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(middle)],depends_on_others:[],depends_on_circumstances:[e(first),e(last)]},warning:middle.card.isReversed?`El punto delicado está en que ${e(middle)}.`:"No confundas la dirección final con un resultado garantizado.",actionable_guidance:`Trabaja sobre lo que muestra el presente: ${e(middle)}. Esa respuesta es la que puede modificar la dirección del recorrido.`});
 }
 return packageResult({...{reading_thesis:analysis.centralThesis,central_tension:analysis.semanticModel.uncertainty,main_movement:analysis.trendSynthesis,arcs:{sequence:rawParagraphs},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[],depends_on_others:[],depends_on_circumstances:[]},warning:fallback.caution,actionable_guidance:fallback.advice}});
}

function grammarEntries(analysis,cards){
 const fallbackCards=new Map(cards.map(card=>[card.id,card]));
 return analysis.spreadGrammar.positions.map((spec,index)=>{
  const answer=analysis.positionAnswersById?.[spec.id]||analysis.positionAnswers?.find(item=>item.positionId===spec.id);
  const cardData=analysis.cardsByPositionId?.[spec.id]||fallbackCards.get(answer?.cardId);
  return answer?{...answer,spec,index,cardData}:null;
 }).filter(Boolean);
}
function grammarCaution(entries){
 const dangerRoles=new Set(["shadow","risk","obstacle","warning","leakage","distance","defense","threshold"]),entry=entries.find(item=>dangerRoles.has(item.role))||entries.find(item=>item.orientation==="reversed")||entries.find(item=>item.role==="expectation")||entries[Math.min(1,entries.length-1)],meaning=trimSentence(entry.answer||entry.interpretation);
 if(entry.role==="leakage")return `Presta atención a esta fuga: ${sentence(meaning)}. Si continúa, debilitará lo que sí consigues conservar.`;
 return `Presta atención a este punto: ${sentence(meaning)}.`;
}
function grammarAction(entries){
 const priorities=["action","advice","resource","movement","integration","condition","learning","insight"],entry=priorities.map(role=>entries.find(item=>item.role===role)).find(Boolean)||entries.at(-1),meaning=trimSentence(entry.answer||entry.interpretation);
 if(entry.role==="resource")return `Pon en uso lo que tienes a favor: ${sentence(meaning)}. Tradúcelo en una decisión observable.`;
 if(entry.role==="condition")return `Antes de decidir, comprueba esta condición: ${sentence(meaning)}.`;
 if(entry.role==="learning")return `Aplica el aprendizaje de forma concreta: ${sentence(meaning)}.`;
 return `Da un paso concreto desde esta indicación: ${sentence(meaning)}.`;
}
function grammarSynthesis(analysis,cards){
 const grammar=analysis.spreadGrammar,entries=grammarEntries(analysis,cards),byId=new Map(entries.map(entry=>[entry.spec.id,entry])),at=id=>byId.get(id),m=id=>at(id)?.interpretation||"",card=id=>at(id)?.cardData,cap=id=>sentence(trimSentence(m(id))),ordered=grammar.narrativeOrder.map(at).filter(Boolean),strategy=grammar.narrativeStrategy;
 const relationships=(analysis.propositionRelations||[]).map(relation=>({...relation,positions:[at(relation.from)?.position,at(relation.to)?.position].filter(Boolean),relationship:relation.type,importance:"high"})),movement=(from,to)=>contextualRelationMovement(at(from),at(to),relationships)||semanticMovement(card(from),card(to)),agencyEntries=entries.filter(entry=>["self","attitude","action","advice","resource","movement","condition","learning","thought","feeling","motivation"].includes(entry.role)),externalEntries=entries.filter(entry=>["external","other","outcome","future"].includes(entry.role));
 const pack=(reading_thesis,central_tension,main_movement,arcs)=>({strategy,domain:analysis.context.domain,mode:grammar.mode,reading_thesis,central_tension,main_movement,arcs,key_relationships:relationships,agency:{depends_on_consultant:agencyEntries.map(entry=>entry.interpretation),depends_on_others:entries.filter(entry=>entry.role==="other").map(entry=>entry.interpretation),depends_on_circumstances:externalEntries.map(entry=>entry.interpretation)},warning:grammarCaution(entries),actionable_guidance:grammarAction(entries),purpose:grammar.purpose,fallbackUsed:false});

 if(strategy==="focus")return pack(m("message"),m("message"),narrativeState(card("message")),{focus:`${cap("message")}. Esta es la cuestión que merece atención antes de ampliar la pregunta o buscar una predicción.`});
 if(strategy==="weighted_answer")return pack(`La respuesta depende de que se cumpla la condición y de atender la advertencia.`,m("warning"),movement("condition","answer"),{answer:`La respuesta se inclina hacia esto: ${m("answer")}.`,conditions:`Para que pueda sostenerse, ${m("condition")}. El factor capaz de modificarla es claro: ${m("warning")}.`});
 if(strategy==="chronological"){
  if(grammar.id==="past_present_trend")return pack(`El antecedente explica el presente y el presente condiciona la tendencia.`,m("present"),movement("past","trend"),{development:`${cap("past")}. Esto explica el presente: ${m("present")}.`,direction:`Si la dinámica actual continúa, ${m("trend")}. Lo que hagas ahora puede reforzar o modificar esa dirección.`});
  return pack(`La tirada sigue una secuencia desde el antecedente hasta el resultado.`,m("obstacle"),movement("past","result"),{origin_and_present:`${cap("past")}. En el presente, ${m("present")}. También actúa una influencia todavía poco visible: ${m("hidden")}.`,pressure:`El problema central es este: ${cap("obstacle")}. Las condiciones externas añaden que ${m("environment")}.`,response_and_result:`La respuesta útil aparece aquí: ${cap("advice")}. Si se aplica y las condiciones continúan, ${m("result")}.`});
 }
 if(strategy==="transition"){
  if(grammar.id==="cycle_ending_beginning")return pack(`Una etapa termina, deja un aprendizaje y exige cruzar un umbral antes de comenzar otra.`,m("threshold"),movement("ending","beginning"),{ending_and_lesson:`${cap("ending")}. La experiencia deja esta enseñanza: ${m("lesson")}. Conservarla evita repetir la forma que ya se agotó.`,threshold_and_beginning:`Antes de entrar plenamente en lo nuevo aparece este umbral: ${m("threshold")}. De ahí surge lo siguiente: ${m("beginning")}.`,first_step:`El primer paso no consiste en resolver todo de inmediato. ${cap("first_step")}. Esa acción convierte el cierre en un comienzo real.`});
  return pack(`La lectura distingue lo que conserva valor, lo que debe soltarse y lo que puede comenzar.`,m("release"),movement("release","begin"),{selection:`Esto conserva valor: ${cap("keep")}. En cambio, esto debe soltarse: ${m("release")}. Seguir sosteniéndolo ocuparía el espacio que necesita lo nuevo.`,beginning:`Después de esa liberación aparece el comienzo: ${cap("begin")}. Será más claro si no intenta reconstruir exactamente lo que acabas de soltar.`});
 }
 if(strategy==="diagnostic"){
  if(grammar.id==="opportunity_risk_strategy")return pack(`La oportunidad nace donde ${m("opportunity")}; su viabilidad depende de responder a que ${m("risk")}.`,m("risk"),semanticMovement(card("risk"),card("strategy")),{diagnosis:`${cap("opportunity")}. Sin embargo, ${m("risk")}.`,response:`La estrategia responde de forma directa: ${cap("strategy")}. Primero observa si puede aplicarse; después decide cuánto comprometer.`});
  if(entries.length===2)return pack(`La situación necesita una respuesta concreta.`,m("situation"),semanticMovement(card("situation"),card("advice")),{problem_and_response:`Ahora ${m("situation")}. La respuesta útil es que ${m("advice")}; así atiendes lo que ocurre en vez de reaccionar sin dirección.`});
  if(grammar.id==="economic_block")return pack(`El bloqueo se sostiene por una cadena que va del origen al patrón y puede romperse desde el recurso disponible.`,m("pattern"),movement("origin","exit"),{origin_and_pattern:`El bloqueo se originó donde ${m("origin")} y hoy se manifiesta así: ${m("manifestation")}. Se repite porque ${m("pattern")}.`,resource_and_exit:`Lo que modifica el panorama es el recurso disponible: ${m("resource")}. A partir de ahí, la salida consiste en que ${m("exit")}.`});
  const situation=entries.find(entry=>["present","situation"].includes(entry.role))||entries[0],obstacle=entries.find(entry=>["obstacle","risk","shadow"].includes(entry.role))||entries[1],resource=entries.find(entry=>entry.role==="resource"),external=entries.find(entry=>entry.role==="external"),action=entries.find(entry=>["action","advice"].includes(entry.role))||entries.at(-1);
  return pack(`La lectura identifica qué ocurre, qué lo complica y cómo responder.`,obstacle.interpretation,semanticMovement(obstacle.cardData,action.cardData),{situation:`Ahora ${situation.interpretation}${resource?`. A tu favor, ${resource.interpretation}`:""}.`,problem:`El problema aparece cuando ${obstacle.interpretation}${external?`. Además, las circunstancias muestran que ${external.interpretation}`:""}.`,response:`Para atravesarlo, ${action.interpretation}. Esa respuesta atiende el conflicto principal y permite evaluar cambios concretos.`});
 }
 if(strategy==="inner_process")return pack(`Pensamiento, emoción y conducta necesitan dejar de operar por separado.`,m("emotion")||m("release"),semanticMovement(ordered[0].cardData,ordered.at(-1).cardData),{inner_relation:`En la mente, ${m("mind")||ordered[0].interpretation}. En lo emocional, ${m("emotion")||ordered[1]?.interpretation}. La diferencia entre ambos planos explica parte de la tensión.`,action:`Lo anterior se convierte en una conducta cuando ${m("action")||ordered.at(-1).interpretation}. Actuar con conciencia evita que una emoción o una idea aislada decida por todo el conjunto.`});
 if(strategy==="psychological"){
  if(grammar.id==="shadow_learning_resource")return pack(`Un patrón interno exige una transformación y la lectura muestra la capacidad disponible para realizarla.`,m("shadow"),semanticMovement(card("shadow"),card("resource")),{shadow_and_learning:`${cap("shadow")}. Para dejar de repetirlo, ${m("learning")}.`,resource:`Para atravesarlo, ${m("resource")}. De ahí puede surgir una decisión más consciente, capaz de distinguir lo que debe continuar de lo que ya necesita terminar.`});
  const first=ordered[0],middle=ordered[Math.floor(ordered.length/2)],last=ordered.at(-1);
  return pack(`La lectura reconoce una experiencia interna, descubre lo que pide comprenderse y la lleva hacia una integración.`,first.interpretation,semanticMovement(first.cardData,last.cardData),{recognition:`El proceso comienza al reconocer que ${first.interpretation}. Su raíz o aprendizaje se vuelve más claro cuando ${middle.interpretation}.`,integration:`Para que esta comprensión produzca un cambio, ${last.interpretation}. La integración no borra lo vivido; modifica la forma de responder.`});
 }
 if(strategy==="relationship"){
  if(grammar.id==="feeling_thought_action"){
   const sameOrientation=at("feeling").orientation===at("thought").orientation&&at("thought").orientation===at("action").orientation,sharedIntent=at("feeling").themes.some(theme=>at("thought").themes.includes(theme))||at("thought").themes.some(theme=>at("action").themes.includes(theme)),alignment=sameOrientation&&sharedIntent?"Sentimiento, pensamiento y acción muestran una alineación suficiente.":"La alineación es parcial: lo que se siente, lo que se piensa y lo que probablemente se hará no tienen la misma intensidad.";
   return pack(`Sentimiento, pensamiento y conducta no son equivalentes y deben leerse en ese orden.`,m("thought"),movement("feeling","action"),{feeling_and_thought:`En lo emocional, ${m("feeling")}. Mentalmente, ${m("thought")}. ${alignment}`,action:`La conducta probable aparece cuando ${m("action")}. Da más peso a los hechos que a una emoción o intención todavía no expresada.`});
  }
  if(grammar.id==="self_other_bond"){const professional=/trabajo|empleo|negocio|profesional/i.test(analysis.context.category),context=professional?"En una asociación profesional, ese punto común debe convertirse en colaboración y acuerdos verificables.":"En una relación afectiva, ese punto común necesita reciprocidad y necesidades expresadas con claridad.";return pack(`El vínculo surge de dos disposiciones concretas, no del deseo de una sola parte.`,m("bond"),semanticMovement(card("self"),card("bond")),{two_people:`De tu lado, ${m("self")}. La otra persona participa desde un lugar donde ${m("other")}.`,bond:`Cuando ambas respuestas se encuentran, ${m("bond")}. ${context}`});}
  const tension=entries.find(entry=>["distance","obstacle","warning"].includes(entry.role)),future=entries.find(entry=>entry.role==="future")||entries.at(-1),self=entries.find(entry=>entry.role==="self")||entries[0],other=entries.find(entry=>entry.role==="other")||entries[1],bond=entries.find(entry=>entry.role==="bond")||entries[2];
  return pack(`La relación depende de lo que aporta cada parte, de su punto de encuentro y de la tensión que ambas estén dispuestas a resolver.`,tension?.interpretation||bond.interpretation,semanticMovement(bond.cardData,future.cardData),{participants:`Una parte se muestra así: ${self.interpretation}. La otra responde desde un lugar donde ${other.interpretation}.`,bond_and_tension:`El vínculo se construye cuando ${bond.interpretation}${tension?`. Sin embargo, ${tension.interpretation}`:""}.`,development:`Lo que se aprenda o decida a partir de esa diferencia conduce a que ${future.interpretation}. No puede sostenerse desde el esfuerzo unilateral.`});
 }
 if(strategy==="decision"){
  if(grammar.id==="advantages_risks_result")return pack(`El resultado probable depende de usar la ventaja sin minimizar el riesgo.`,m("risk"),semanticMovement(card("advantage"),card("result")),{comparison:`A favor aparece esto: ${cap("advantage")}. El riesgo es concreto: ${cap("risk")}. Ignorarlo reduciría la ventaja.`,result:`Al combinar ambos factores, ${m("result")}. Ese resultado será más viable si la precaución se convierte en una medida concreta antes de avanzar.`});
  if(grammar.id==="traffic_light"){
   const optionScore=(entry,id)=>{const source=normalize(entry.themes.join(" ")),affinity=id==="advance"?/claridad|esperanza|libertad|movimiento|accion|confianza/:id==="wait"?/introspeccion|pausa|prudencia|paciencia|equilibrio/:/cierre|bloqueo|riesgo|conflicto|tension/;return (entry.orientation==="reversed"?-2:0)+(entry.polarity==="support"?2:entry.polarity==="mixed"?1:0)+(affinity.test(source)?2:0);},options=[["advance","avanzar"],["wait","esperar"],["stop","detenerse"]].map(([id,label])=>({id,label,entry:at(id),score:optionScore(at(id),id)})).sort((a,b)=>b.score-a.score),leader=options[0],condition=options[1];
   return pack(`La lectura compara el respaldo relativo de avanzar, esperar y detenerse.`,m("stop"),movement("wait","advance"),{signals:`Avanzar encuentra respaldo cuando ${m("advance")}. Esperar resulta más sensato mientras ${m("wait")}. Detenerse gana peso si ${m("stop")}.`,criterion:`La señal con mayor respaldo relativo es ${leader.label}, porque ${leader.entry.interpretation}. Esta inclinación cambiaría si los hechos empiezan a parecerse más a la condición de ${condition.label}: ${condition.entry.interpretation}.`});
  }
  if(grammar.id==="job_change")return pack(`El cambio debe medirse por sus razones, su oportunidad, su riesgo y el resultado que realmente puede sostenerse.`,m("risk"),semanticMovement(card("current"),card("result")),{current_and_motive:`El trabajo actual se vive de este modo: ${m("current")}. La razón que impulsa el cambio es que ${m("reason")}.`,opportunity_and_risk:`La alternativa ofrece que ${m("opportunity")}. Sin embargo, ${m("risk")}; esa condición puede modificar el resultado.`,result_and_advice:`Si decides desde esos datos, ${m("result")}. El consejo es que ${m("advice")}.`});
  const situation=at("situation")||at("decision")||entries[0],pathA=at("path_a")||at("act"),resultA=at("result_a")||at("act_result"),pathB=at("path_b")||at("not_act"),resultB=at("result_b")||at("not_act_result");
  return pack(`La elección se aclara al comparar lo que exige cada camino con su consecuencia.`,situation.interpretation,semanticMovement(resultA.cardData,resultB.cardData),{starting_point:`La decisión nace donde ${situation.interpretation}${m("motivation")?`. La motivación real es que ${m("motivation")}`:""}.`,path_a:`El primer camino exige que ${pathA.interpretation} y conduce a que ${resultA.interpretation}.`,path_b:`En cambio, el segundo pide que ${pathB.interpretation} y conduce a que ${resultB.interpretation}. Compara qué consecuencia coincide con tus recursos y prioridades, no cuál alivia primero la incertidumbre.`});
 }
 if(strategy==="resource_flow")return pack(`Los recursos siguen una cadena concreta: origen, entrada, fuga, conservación, movimiento y dirección probable.`,m("leakage"),semanticMovement(card("origin"),card("trend")),{origin_and_entry:`El origen muestra esto: ${cap("origin")}. Después, ${m("inflow")}. Aquí los recursos pueden ser dinero, tiempo, energía, atención u oportunidades, según tu pregunta.`,leakage_and_reserve:`El punto de pérdida o bloqueo es este: ${cap("leakage")}. Frente a ello, ${m("reserve")}.`,movement_and_trend:`Para poner los recursos a trabajar, considera lo siguiente: ${cap("movement")}. Si la dinámica continúa, ${m("trend")}; atender la fuga decidirá cuánto de esa dirección puede sostenerse.`});
 if(strategy==="project_flow")return pack(`La viabilidad del proyecto depende de coordinar idea, recursos, respuesta externa, obstáculo y estrategia.`,m("obstacle"),semanticMovement(card("idea"),card("result")),{idea_and_resources:`La idea parte de que ${m("idea")}. Para convertirla en algo viable, cuenta con esto: ${m("resources")}.`,market_and_obstacle:`La respuesta externa muestra que ${m("market")}. El problema aparece cuando ${m("obstacle")}.`,strategy_and_result:`La estrategia debe responder a ese punto: ${m("strategy")}. Si lo hace, ${m("result")}.`});
 if(strategy==="seasonal_cycle")return pack(`El año avanza desde preparación y nacimiento hasta actividad, cosecha, aprendizaje y depuración.`,m("release"),semanticMovement(card("winter"),card("center")),{preparation:`En invierno, ${m("winter")}. Durante el despertar, ${m("awakening")}; en primavera, ${m("spring")}.`,growth:`La expansión muestra que ${m("expansion")}. En verano, ${m("summer")}; ahí se concentra la actividad del ciclo.`,results:`La cosecha trae que ${m("harvest")}. El otoño pide comprender que ${m("autumn")}.`,closure:`Antes del siguiente ciclo será necesario depurar: ${m("release")}. Todo se integra alrededor de este tema central: ${m("center")}.`});
 if(strategy==="celtic_cross")return pack(`La historia parte de ${m("past")}; su base es ${m("base")}. El conflicto es ${m("cross")} y la dirección probable es ${m("trend")}.`,m("cross"),movement("past","trend"),{origin_and_present:`${cap("past")}. Debajo de la situación, ${m("base")}. Esto explica el presente: ${m("situation")}.`,conflict_and_opening:`El conflicto concreto aparece aquí: ${cap("cross")}. Aun así, ${m("possibility")}. Antes de consolidarse, ${m("near_future")}.`,self_and_context:`De tu lado, ${m("attitude")}. Afuera, ${m("environment")}. Tu expectativa puede inclinarse hacia que ${m("hopes_fears")}, pero esa emoción no equivale todavía a un hecho.`,direction:`Si la dinámica continúa, ${m("trend")}. La posibilidad sólo podrá sostenerse si responde al cruce y a las condiciones reales del entorno.`});
 if(strategy==="houses")return pack(`La energía se concentra en las áreas donde las posiciones se refuerzan o se bloquean entre sí.`,m("unconscious"),movement("resources","vocation"),{self_and_bonds:`Tu manera de posicionarte muestra que ${m("self")}. En los vínculos, ${m("bonds")}; la relación entre ambas posiciones muestra cómo tu respuesta personal afecta los acuerdos.`,resources_and_direction:`En recursos, ${m("resources")}. En las rutinas, ${m("routines")}; esto condiciona una vocación donde ${m("vocation")}.`,home_and_change:`La base personal señala que ${m("home")}. La transformación exige que ${m("transformation")}; la visión aporta que ${m("vision")}.`,communication_and_inner_world:`La comunicación se mueve donde ${m("communication")}, mientras la comunidad responde con ${m("community")}. Por debajo, ${m("unconscious")}; atender ese contenido evita que opere sin ser reconocido.`});
 if(strategy==="chakra_system")return pack(`La lectura sigue cómo seguridad, deseo, voluntad, afecto, expresión y visión se integran en un sentido común.`,m("root"),semanticMovement(card("root"),card("crown")),{foundation:`En la base, ${m("root")}. El deseo y la creatividad muestran que ${m("sacral")}, y la voluntad se expresa cuando ${m("solar")}.`,heart_and_voice:`En el corazón, ${m("heart")}. Para que eso pueda comunicarse, ${m("throat")}.`,vision_and_meaning:`La percepción interior señala que ${m("third_eye")}. El sentido que integra el proceso aparece cuando ${m("crown")}.`});
 if(strategy==="star_system")return pack(`El centro se aclara al contrastar conciencia y deseo, y se resuelve mediante recurso, desafío y acción.`,m("challenge"),semanticMovement(card("center"),card("result")),{center:`El asunto central es que ${m("center")}. Ya puedes reconocer que ${m("awareness")}, aunque el deseo añade que ${m("desire")}.`,challenge:`Cuentas con este recurso: ${m("resource")}. El desafío concreto es que ${m("challenge")}.`,action_and_result:`Para responder, ${m("action")}. Si esa acción se sostiene, ${m("result")}.`});
 if(strategy==="mandala_system")return pack(`El centro recibe influencias del pasado y del fundamento, mientras otras posiciones muestran inicio, acción, cierre y aprendizaje.`,m("southwest"),semanticMovement(card("west"),card("east")),{center_and_past:`En el centro, ${m("center")}. Lo que queda atrás todavía influye porque ${m("west")}; la base añade que ${m("south")}.`,new_movement:`La orientación se aclara cuando ${m("north")}. Algo empieza a acercarse donde ${m("northeast")}; el inicio pide que ${m("east")} y el movimiento requiere que ${m("southeast")}.`,closure_and_learning:`Para completar el proceso, ${m("southwest")}. La experiencia se integra al comprender que ${m("northwest")}.`});
 if(strategy==="tree_system")return pack(`Una intención desciende desde el impulso y la comprensión hasta una manifestación concreta.`,m("gevurah"),semanticMovement(card("keter"),card("malkuth")),{origin:`El principio que inicia el proceso muestra que ${m("keter")}. Su impulso creativo aparece cuando ${m("chokmah")}, y toma forma porque ${m("binah")}.`,balance:`La expansión aporta que ${m("chesed")}, pero el límite necesario exige que ${m("gevurah")}. Ambas fuerzas buscan integrarse donde ${m("tiferet")}.`,foundation:`El deseo impulsa cuando ${m("netzach")}, mientras la mente organiza porque ${m("hod")}. Su base común se forma donde ${m("yesod")}.`,manifestation:`Cuando esa base se consolida, la expresión concreta apunta a que ${m("malkuth")}.`});
 if(strategy==="spiritual_path")return pack(`El camino nace de un llamado, atraviesa una prueba y una sombra, y se define mediante elección, entrega e integración.`,m("shadow"),movement("calling","destination"),{calling_and_origin:`El llamado aparece porque ${m("calling")}. Nace de una historia en la que ${m("origin")}, y llevas contigo que ${m("baggage")}.`,guidance_and_threshold:`La guía disponible señala que ${m("guide")}. Para cruzar el umbral, ${m("threshold")}.`,trial_and_revelation:`La prueba consiste en que ${m("trial")}; por debajo, ${m("shadow")}. Atravesarlas permite reconocer que ${m("revelation")}.`,choice_and_integration:`La elección pide que ${m("choice")}. Después será necesario que ${m("surrender")}, para integrar que ${m("integration")}.`,destination:`El resultado interior de ese proceso apunta a que ${m("destination")}.`});

 const first=ordered[0],last=ordered.at(-1);
 return {...pack(`La tirada desconocida se interpreta respetando el orden de sus posiciones.`,first?.interpretation||"",first&&last?semanticMovement(first.cardData,last.cardData):"",{sequence:ordered.map(entry=>`${entry.position}: ${entry.interpretation}`).join(" ")}),strategy:"generic_map",fallbackUsed:true};
}

function buildNarrativeSynthesis(analysis,cards,rawParagraphs){
 if(analysis.spreadGrammar?.known)return grammarSynthesis(analysis,cards);
 const story=analysis.readingStory,rawGuidance=deriveAdvice(analysis),base={reading_thesis:analysis.centralThesis,central_tension:analysis.centralTensions[0]?.reason||rawGuidance.caution,main_movement:analysis.trendSynthesis,arcs:{sequence:rawParagraphs},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[],depends_on_others:[],depends_on_circumstances:[]},warning:rawGuidance.caution,actionable_guidance:rawGuidance.advice};
 if(story.kind!=="celtic")return strategySynthesis(analysis,cards,rawParagraphs);
 const e=node=>positionedExpression(analysis,node),state=node=>narrativeState(node.card);
 const originMovement=semanticMovement(story.origin.card,story.underlyingProcess.card),baseToTrend=semanticMovement(story.underlyingProcess.card,story.likelyDirection.card),potentialToTrend=semanticMovement(story.availablePotential.card,story.likelyDirection.card),challengeRelation=relationKind(story.mainChallenge.card,story.availablePotential.card),selfContextRelation=relationKind(story.querentResponse.card,story.externalFactors.card);
 const arc1=`${sentence(e(story.origin))}. Debajo de la situación, ${e(story.underlyingProcess)}; por eso ahora ${e(story.currentSituation)}.`;
 const arc2=challengeRelation==="tension"?`La posibilidad sigue abierta, pero el obstáculo la condiciona: ${e(story.mainChallenge)}. Aun así, ${e(story.availablePotential)}; más adelante, ${e(story.emergingDevelopment)}.`:`La dificultad actual puede abrir una salida: ${e(story.mainChallenge)}. Al mismo tiempo, ${e(story.availablePotential)}; a partir de ahí, ${e(story.emergingDevelopment)}.`;
 const alignment=selfContextRelation==="reinforcement"?"Tu disposición y el entorno parecen reforzarse.":selfContextRelation==="tension"?"Tu disposición y lo que ocurre afuera no avanzan al mismo ritmo.":"Tu respuesta y el entorno aportan partes distintas de la historia.";
 const arc3=`${alignment} De tu lado, ${e(story.querentResponse)}; afuera, ${e(story.externalFactors)}. Mientras tanto, esperas o temes que ${e(story.internalConflict)}, pero esa expectativa no equivale a un hecho.`;
 const trendRelation=relationKind(story.underlyingProcess.card,story.likelyDirection.card),directionLead=trendRelation==="tension"?`Lo que sostiene la situación y la tendencia no terminan de coincidir: aunque ${e(story.underlyingProcess)}, la dirección apunta a que ${e(story.likelyDirection)}.`:`Lo que existe en la base encuentra continuación: ${e(story.underlyingProcess)}, y la tendencia muestra que ${e(story.likelyDirection)}.`;
 const arc4=`${directionLead} Lo que aparece como posibilidad —${e(story.availablePotential)}— sólo podrá sostenerse si consigue convivir con esa dirección final.`;
 const centralTension=challengeRelation==="tension"?`Existe una posibilidad real porque ${e(story.availablePotential)}, pero el obstáculo impide tratarla como certeza: ${e(story.mainChallenge)}.`:`El reto consiste en convertir la posibilidad de que ${e(story.availablePotential)} en un desarrollo real sin repetir aquello que ${e(story.mainChallenge)}.`;
 const thesis=`Esta lectura trata de un proceso que pasa de ${state(story.origin)} hacia ${state(story.likelyDirection)}, pero antes necesita atravesar ${state(story.mainChallenge)} y comprobar qué parte de ${state(story.availablePotential)} puede sostenerse.`;
 const consultant=e(story.querentResponse),external=e(story.externalFactors),trend=e(story.likelyDirection);
 return {strategy:"evolutionary_story",reading_thesis:thesis,central_tension:centralTension,main_movement:semanticMovement(story.origin.card,story.likelyDirection.card),arcs:{origin_and_present:arc1,conflict_and_opening:arc2,self_and_context:arc3,direction:arc4},key_relationships:[{positions:[story.underlyingProcess.role,story.likelyDirection.role],relationship:baseToTrend,importance:"high"},{positions:[story.availablePotential.role,story.likelyDirection.role],relationship:potentialToTrend,importance:"high"},{positions:[story.querentResponse.role,story.externalFactors.role],relationship:alignment,importance:"high"}],agency:{depends_on_consultant:[consultant],depends_on_others:[],depends_on_circumstances:[external]},warning:`${centralTension} Lo que esperas o temes —que ${e(story.internalConflict)}— no confirma por sí mismo la tendencia.`,actionable_guidance:`Apóyate en esta disposición: ${consultant}. Ten en cuenta lo que ocurre afuera: ${external}. Espera a que los hechos muestren su verdadero alcance antes de comprometerte con una dirección en la que ${trend}.`};
}
function deriveAdvice(analysis){
 const story=analysis.readingStory,e=node=>node?cardExpression(node.card,node.role,analysis.context.category):"";
 if(story.kind==="celtic"){
  const challenge=e(story.mainChallenge),agency=e(story.querentResponse),external=e(story.externalFactors),trend=e(story.likelyDirection);
  const caution=story.mainChallenge.card.isReversed?`No trates el obstáculo como un detalle menor: ${sentence(challenge)}. Ese bloqueo está alterando la relación entre lo que buscas y lo que realmente puede sostenerse.`:`Cuida que ${challenge} no termine dirigiendo tus decisiones por encima de lo que la situación actual necesita.`;
  const reading=`Si esta dinámica continúa, ${trend}. Lo que sí depende de ti es reconocer que ${agency}; lo que no controlas es que ${external}. No fuerces la parte que requiere respuesta ajena o nuevos hechos. Favorecerás la tendencia cuando tu manera de actuar responda al obstáculo sin repetirlo.`;
  return {caution,advice:`Dado que ${challenge}, te conviene responder desde esta capacidad: ${agency}. Aprovecha que en el entorno ${external}, pero no intentes controlar su ritmo ni forzar la parte que depende de otra respuesta.`,reading};
 }
 if(story.kind==="situation")return {caution:`No respondas sólo al efecto visible del problema: ${e(story.mainChallenge)}.`,advice:`La acción más coherente es permitir que ${e(story.guidance)} atienda directamente aquello que hoy interfiere.`,reading:`La orientación práctica es permitir que ${e(story.guidance)}; así respondes a la causa del obstáculo y no únicamente a sus consecuencias.`};
 if(story.kind==="timeline")return {caution:`No trates el pasado como una condena ni la tendencia como una garantía.`,advice:`Relaciona lo aprendido cuando ${e(story.origin)} con lo que hoy muestra que ${e(story.currentSituation)}.`,reading:`Si mantienes esta dinámica, ${e(story.likelyDirection)}. La mejor forma de acompañarla es aplicar en el presente lo que el antecedente ya te permitió comprender.`};
 if(story.kind==="relationship")return {caution:story.tension?`No pases por alto que ${e(story.tension)}. Esa dificultad no se resuelve interpretando por la otra persona ni compensando de manera unilateral.`:`No confundas la posibilidad de acercamiento con reciprocidad comprobada.`,advice:`Observa cómo se encuentran ${e(story.personA)} y ${e(story.personB)}. Favorece únicamente aquello que permita que ${e(story.bond)} sin exigir que una sola parte sostenga todo el vínculo.`,reading:`La evolución dependerá de que ambas respuestas encuentren una forma real de participar.`};
 if(story.kind==="decision"){const [a,ar]=story.pathA,[b,br]=story.pathB;return {caution:`No elijas sólo para escapar de la condición actual, donde ${e(story.currentSituation)}. Compara las consecuencias, no únicamente el atractivo inicial de cada camino.`,advice:`Contrasta el camino en el que ${e(a)} y puede resultar que ${e(ar||a)}, con aquel en el que ${e(b)} y puede resultar que ${e(br||b)}. Elige la consecuencia que realmente puedas sostener.`,reading:"La dirección no depende de una opción abstractamente mejor, sino de cuál consecuencia coincide con tus recursos y prioridades."};}
 if(story.kind==="houses"){const relation=story.relations[0];return {caution:`No atiendas ${area(relation[0].role)} como si estuviera separada de ${area(relation[1].role)}; lo que ocurra en una ya está condicionando la otra.`,advice:`Revisa dónde ${e(relation[0])} y comprueba cómo eso afecta el hecho de que ${e(relation[1])}. Ajusta primero la conexión entre ambas áreas.`,reading:"La orientación surge de coordinar las áreas relacionadas, no de intentar corregir cada una por separado."};}
 return {caution:"No conviertas una posibilidad simbólica en una certeza antes de contrastarla con los hechos.",advice:"Conserva únicamente la orientación que pueda traducirse en una decisión o una observación verificable.",reading:"La tendencia sigue abierta y dependerá de cómo respondas a las condiciones que la tirada muestra."};
}
function celticReading(story,analysis){
 const e=node=>cardExpression(node.card,node.role,analysis.context.category),p=[];
 p.push(`Vienes de una etapa en la que ${e(story.origin)}. Ese antecedente no quedó atrás sin más: por debajo ya existe un proceso en el que ${e(story.underlyingProcess)}. Por eso, lo que ocurre ahora se entiende mejor como una respuesta a ese cambio: ${e(story.currentSituation)}.`);
 p.push(`La dificultad central es que ${e(story.mainChallenge)}. Esto interfiere directamente con lo que intentas conseguir ahora y obliga a comprobar si el equilibrio depende de ti, de otra parte o de una condición que aún no está disponible.`);
 p.push(`La posibilidad abierta por la tirada muestra que ${e(story.availablePotential)}. No conduce de inmediato a una resolución: en el desarrollo inmediato ${e(story.emergingDevelopment)}. Antes de definir el rumbo, habrá que dejar que esa transición aclare qué opción es real y cuál existe sólo como expectativa.`);
 p.push(`Tu manera de responder consiste en que ${e(story.querentResponse)}, mientras afuera ${e(story.externalFactors)}. Esa diferencia es importante: puedes decidir cómo procesar y responder, pero no controlar el ritmo con el que llegan los hechos. Además, deseas —o temes— que ${e(story.internalConflict)}; conviene no confundir esa expectativa con una confirmación.`);
 p.push(deriveAdvice(analysis).reading);
 return p;
}
function housesReading(story,analysis){
 const p=[],e=node=>cardExpression(node.card,node.role,analysis.context.category);
 for(const [first,second] of story.relations.slice(0,4))p.push(`${sentence(area(first.role))} está influyendo directamente en ${area(second.role)}. Mientras en la primera área ${e(first)}, en la segunda ${e(second)}. Lo importante es comprobar si ambos procesos pueden sostenerse juntos o si uno está debilitando al otro.`);
 const inner=story.relations.find(pair=>normalize(pair[0].role).includes("rutina"));if(inner)p.push(`Lo cotidiano y lo que procesas en silencio necesitan alinearse. En tus hábitos ${e(inner[0])}, pero internamente ${e(inner[1])}. Ignorar esa diferencia puede convertir una tensión silenciosa en agotamiento o evasión.`);
 const vocation=story.relations.find(pair=>normalize(pair[1].role).includes("vocacion"));if(vocation)p.push(`La orientación práctica es revisar ${area(vocation[0].role)} antes de comprometerte con ${area(vocation[1].role)}. Lo que elijas conservar debe apoyar una dirección viable, no únicamente una expectativa.`);
 return p;
}
function simpleStoryReading(story,analysis){
 const e=node=>node?cardExpression(node.card,node.role,analysis.context.category):"";
 if(story.kind==="timeline")return [`Vienes de una experiencia en la que ${e(story.origin)}. Ahora ${e(story.currentSituation)}. El presente no repite el pasado: muestra cómo esa experiencia está cambiando tu manera de responder.`,`Si las condiciones actuales continúan, ${e(story.likelyDirection)}. No es un destino fijo; depende de cómo conectes lo aprendido con lo que hoy puedes decidir o sostener.`];
 if(story.kind==="situation")return [`Actualmente ${e(story.currentSituation)}. El problema es que ${e(story.mainChallenge)}, y esa interferencia puede impedir que la situación encuentre una salida clara.`,`La respuesta más coherente es que ${e(story.guidance)}. Así atiendes la causa del obstáculo en lugar de reaccionar únicamente a sus efectos.`];
 if(story.kind==="relationship"){const professional=/trabajo|empleo|negocio|profesional/i.test(analysis.context.category),context=professional?"En una relación profesional, esto exige colaboración y términos que ambas partes puedan cumplir.":"En una relación afectiva, esto exige reciprocidad y necesidades expresadas con claridad.";return [`Una parte se acerca de modo que ${e(story.personA)}, mientras la otra responde de modo que ${e(story.personB)}. El vínculo sólo puede avanzar si estas dos formas encuentran un punto común. ${context}`,story.tension?`La dificultad es que ${e(story.tension)}. Conviene comprobar lo que cada parte realmente ofrece, sin asumir sentimientos o intenciones que no se hayan expresado.`:`La reciprocidad necesita mostrarse en hechos, no sólo en expectativas.`,`Si las condiciones continúan, ${e(story.likelyDirection)}. Esa dirección sólo será sostenible si ambas partes participan; no puede construirse desde el esfuerzo unilateral.`];}
 if(story.kind==="decision"){
  if(story.schema==="risk_result"){const [advantage,risk,result]=story.steps;return [`A tu favor, ${e(advantage)}. El riesgo es que ${e(risk)}; conviene atenderlo antes de confiar en la ventaja.`,`Si respondes a esa dificultad, el resultado probable apunta a que ${e(result)}. No es automático: depende de cómo combines la oportunidad con una precaución concreta.`];}
  if(story.schema==="traffic_light"){const [advance,wait,stop]=story.steps;return [`Avanza cuando ${e(advance)}. Espera si ${e(wait)}. Detente si ${e(stop)}.`,`Usa estas tres señales como condiciones observables y decide según la que describa mejor los hechos actuales.`];}
  const [a,ar]=story.pathA,[b,br]=story.pathB;
  if(!a||!b)return story.steps.slice(0,3).map((step,index)=>`${index===0?"La situación comienza":"La decisión añade otra condición"} donde ${e(step)}.`);
  return [`La decisión parte de una condición en la que ${e(story.currentSituation)}. No conviene elegir sólo para terminar con la incertidumbre; primero hay que definir qué consecuencia estás dispuesto a sostener.`,`En el primer camino ${e(a)}${ar?`; su consecuencia sugiere que ${e(ar)}`:""}. En el segundo ${e(b)}${br?`; su consecuencia muestra que ${e(br)}`:""}. La diferencia está en cuál de esas consecuencias coincide con tus posibilidades reales.`,story.guidance?`La recomendación es permitir que ${e(story.guidance)}.`:`Elige el camino cuyas consecuencias puedas sostener, no sólo la opción que produzca alivio inmediato.`];
 }
 return [];
}
function buildInterpretiveSynthesis(analysis,cards){
 const story=analysis.readingStory;
 if(story.kind==="celtic")return celticReading(story,analysis);
 if(story.kind==="houses")return housesReading(story,analysis);
 const direct=simpleStoryReading(story,analysis);if(direct.length)return direct;
 const steps=story.steps||[];if(!steps.length)return ["La lectura no reúne todavía elementos suficientes para construir una orientación específica."];
 return steps.slice(0,3).map((step,index)=>`${index===0?"La situación comienza":"La dinámica continúa"} con ${quality(step.card)}. ${sentence(trimSentence(contextualMeaning(step.card,analysis.context.category)))}.`);
}

const EDITORIAL_REWRITES=[
 [/Y hoy La situación actual\s*/gi,"Y hoy "],
 [/En la mente, La disposición interna\s*/gi,"En la mente, "],
 [/En lo emocional, La disposición interna\s*/gi,"En lo emocional, "],
 [/La disposición interna\s*/gi,""],
 [/La respuesta del entorno\s*/gi,""],
 [/La dirección condicionada\s*/gi,""],
 [/La dinámica anterior\s*/gi,""],
 [/Este escenario\s*/gi,""],
 [/La conducta más probable\s*/gi,""],
 [/\bLa experiencia pide\s*/gi,"Aquí conviene "],
 [/\bEl punto crítico es este:\s*/gi,""],
 [/\bLa respuesta se expresa(?: así)?:\s*/gi,""],
 [/\bLa tendencia sugiere que\s*/gi,"Si nada relevante cambia, "],
 [/\bLa aplicación concreta(?: es esta)?:\s*/gi,""],
 [/\bLa dirección probable(?:, si no cambian las condiciones,)?(?: es esta)?:\s*/gi,""],
 [/La situación actual se expresa así:\s*/gi,""],
 [/Este antecedente todavía influye:\s*/gi,""],
 [/La dirección probable, si no cambian las condiciones, es esta:\s*/gi,""],
 [/La aplicación concreta es esta:\s*/gi,""],
 [/Como criterio(?: para decidir)?,?\s*(?:esto se manifiesta así:|el punto crítico es este:)?\s*/gi,""],
 [/La disposición interna se expresa así:\s*/gi,""],
 [/La respuesta del entorno se manifiesta así:\s*/gi,""],
 [/La dirección condicionada se expresa así:\s*/gi,""],
 [/La dinámica anterior(?: se expresa así)?:\s*/gi,""],
 [/Este escenario(?: se expresa así)?:\s*/gi,""],
 [/En el plano emocional, la respuesta es esta:\s*/gi,""],
 [/En el plano mental, la respuesta es esta:\s*/gi,""],
 [/La conducta más probable se expresa así:\s*/gi,""],
 [/Avanzar recibe respaldo bajo esta condición:\s*/gi,""],
 [/Conviene esperar mientras se mantenga esta condición:\s*/gi,""],
 [/Detenerse se justifica si aparece esta condición:\s*/gi,""],
 [/El riesgo concreto se expresa así:\s*/gi,""],
 [/La situación se complica de esta manera:\s*/gi,""],
 [/La posibilidad real consiste en esto:\s*/gi,""],
 [/La acción que responde a esta posición es la siguiente:\s*/gi,""],
 [/Si la dinámica anterior continúa, puede desarrollarse este escenario:\s*/gi,""],
 [/Si la dinámica anterior continúa, puede desarrollarse:?\s*/gi,""],
 [/El origen o fundamento se explica de esta manera:\s*/gi,""],
 [/Los recursos disponibles o faltantes se describen así:\s*/gi,""],
 [/La dinámica entre las partes se expresa así:\s*/gi,""],
 [/La expectativa o el temor que influye es este:\s*/gi,""],
 [/Termina una etapa marcada por esto:\s*/gi,""],
 [/Lo nuevo empieza al responder de esta manera:\s*/gi,""],
 [/Puedes utilizar constructivamente esta capacidad:\s*/gi,""],
 [/La respuesta útil consiste en esto:\s*/gi,""],
 [/La decisión depende de comprobar esta condición:\s*/gi,""],
 [/El aprendizaje que conviene integrar es este:\s*/gi,""],
 [/La entrada de recursos se favorece de esta forma:\s*/gi,""],
 [/La reserva se construye de esta manera:\s*/gi,""],
 [/El riesgo concreto es este:\s*/gi,""],
 [/La estrategia responde de forma directa:\s*/gi,""],
 [/La estrategia concreta es esta:\s*/gi,""],
 [/Conviene dejar atrás esta expresión:\s*/gi,""],
 [/Juega a tu favor esta capacidad:\s*/gi,""],
 [/En el camino interior, este antecedente se concreta así:\s*/gi,"En lo personal, conviene "],
 [/En el camino interior, esto (?:se manifiesta|se expresa) así:\s*/gi,"En lo personal, conviene "],
 [/En el camino interior, esto funciona como recurso:\s*/gi,"En lo personal, conviene "],
 [/En el camino interior, esto\s*/gi,"En lo personal, conviene "],
 [/En el camino interior,\s*/gi,"En lo personal, conviene "],
 [/La cosecha trae que\s*/gi,"En la cosecha, "],
 [/El otoño pide comprender que\s*/gi,"En otoño, "],
 [/Todo se integra alrededor de este tema central:\s*/gi,"El tema central es claro: "],
 [/Ese antecedente no quedó atrás sin más: por debajo ya existe un proceso en el que /gi,"Desde entonces, "],
 [/Por eso, lo que ocurre ahora se entiende mejor como una respuesta a ese cambio: /gi,"Ahora, "],
 [/La dificultad central es que /gi,"El reto está en que "],
 [/Esto interfiere directamente con lo que intentas conseguir ahora y obliga a comprobar si /gi,"Conviene distinguir si "],
 [/La posibilidad abierta por la tirada muestra que /gi,"Se abre una posibilidad: "],
 [/No conduce de inmediato a una resolución: en el desarrollo inmediato /gi,"Sin embargo, antes de resolverse, "],
 [/Antes de definir el rumbo, habrá que dejar que esa transición aclare /gi,"Antes de elegir, deja que el camino aclare "],
 [/Tu manera de responder consiste en que /gi,"De tu parte, "],
 [/Esa diferencia es importante: puedes decidir cómo procesar y responder, pero no controlar el ritmo con el que llegan los hechos\.?/gi,"Puedes decidir cómo responder, no el ritmo de los hechos."],
 [/Además, deseas —o temes— que /gi,"Al mismo tiempo, esperas o temes que "],
 [/Si esta dinámica continúa, /gi,"La tendencia apunta a que "],
 [/Si las condiciones actuales continúan, /gi,"La tendencia apunta a que "],
 [/Lo que sí depende de ti es reconocer que /gi,"Puedes hacerte cargo de que "],
 [/lo que no controlas es que /gi,"no controlas que "],
 [/La orientación práctica es permitir que /gi,"Conviene que "],
 [/La respuesta más coherente es que /gi,"Lo más coherente es que "],
 [/La decisión parte de una condición en la que /gi,"Ahora, "],
 [/La dirección no depende de una opción abstractamente mejor, sino de /gi,"La clave no es una opción perfecta, sino "],
 [/\b(?:se manifiesta|se expresa) así:\s*/gi,""],
 [/\bEl camino interior\b/gi,"tu proceso interior"],
];
const SYMBOLIC_REWRITES=[
 [/las circunstancias se están moviendo y exigen responder con flexibilidad a lo que no controlas/gi,"el ciclo empieza a girar y puede abrir posibilidades que antes no estaban disponibles, aunque parte del movimiento quede fuera de tus manos"],
 [/has necesitado tomar distancia, reducir el ruido y encontrar una respuesta propia/gi,"hubo una pausa de búsqueda interior: necesitaste tomar distancia del ruido para encontrar una respuesta propia"],
 [/prefieres observar antes de actuar y reservar parte de lo que piensas hasta comprender mejor la situación/gi,"estás observando en silencio antes de dar el siguiente paso, porque aún queda algo por comprender"],
 [/empiezan a aparecer elementos que permiten definir el problema y tomar una decisión más consciente/gi,"empieza a entrar claridad y con ella la posibilidad de cortar la confusión antes de decidir"],
 [/estás recuperando confianza en una dirección que antes parecía debilitada/gi,"vuelve a encenderse la confianza en una dirección que antes parecía perdida"],
 [/una forma anterior ya está terminando y obliga a reorganizar lo que seguirá vigente/gi,"un ciclo anterior está cerrándose y deja espacio para reorganizar lo que sí puede continuar"],
 [/buscas conciliar fuerzas distintas y recuperar una medida que puedas sostener/gi,"buscas un punto de equilibrio entre fuerzas distintas, uno que puedas sostener sin desgastarte"],
 [/existe la posibilidad de que dos partes se encuentren desde un intercambio más equilibrado/gi,"puede abrirse un encuentro más recíproco entre dos partes"],
 [/hay una elección que necesita coincidir con tus valores y con la realidad del vínculo o acuerdo/gi,"aparece una decisión que tendrá que respetar tanto tus valores como la realidad del vínculo o acuerdo"],
 [/los resultados dependerán del trabajo constante, la atención y la corrección de los detalles/gi,"lo que construyas dependerá menos de un golpe de suerte que de tu constancia y del cuidado de los detalles"],
 [/cuentas con recursos para intervenir, siempre que concentres la acción en algo concreto/gi,"tienes las herramientas para actuar, pero necesitan concentrarse en un paso concreto"],
 [/se abre la posibilidad de comenzar de otra manera, con libertad pero sin ignorar las consecuencias/gi,"se abre un camino nuevo; ofrece libertad, pero también exige mirar por dónde pisas"],
 [/hay una diferencia entre dos partes que todavía no encuentra un punto común/gi,"dos partes parecen buscar cosas distintas y todavía no encuentran un punto común"],
 [/la reciprocidad está bloqueada o se está dando de forma desigual/gi,"el encuentro está bloqueado o el intercambio se ha vuelto desigual"],
 [/la información disponible sigue siendo confusa o se está utilizando de una forma que dificulta decidir/gi,"la claridad no termina de llegar y decidir entre sombras puede llevarte a una conclusión equivocada"],
 [/el esfuerzo se está dispersando o repitiendo sin corregir lo que no funciona/gi,"el esfuerzo se dispersa: se repite el trabajo, pero no se corrige lo que impide avanzar"],
];
const cleanEditorial=text=>{
 let edited=(text||"").replace(/\s+/g," ").trim();
 for(const [pattern,replacement] of EDITORIAL_REWRITES)edited=edited.replace(pattern,replacement);
 for(const [pattern,replacement] of SYMBOLIC_REWRITES)edited=edited.replace(pattern,replacement);
 return edited.replace(/\b(positionAnswer|semanticRole|outputStrategy|fallback|confidence)\b/gi,"").replace(/bloquea o debilita la expresión de esta carta/gi,"dificulta que esa cualidad se exprese con claridad").replace(/\b(y|o)\s+\1\b/gi,"$1").replace(/([.!?])\s+(y|o|pero)\s+/gi,(_,mark,connector)=>`${mark} ${connector.charAt(0).toUpperCase()}${connector.slice(1)} `).replace(/\s+([,.;:])/g,"$1").replace(/\.{2,}/g,".").replace(/\s{2,}/g," ").trim();
};
const ideaKey=text=>normalize(text).replace(/\b(ahora|sin embargo|tambien|al mismo tiempo|conviene|depende de ti|la tendencia|el reto esta en que)\b/g,"").replace(/[^a-z0-9 ]/g,"").split(/\s+/).filter(word=>word.length>4).slice(0,8);
function overlaps(a,b){const A=ideaKey(a),B=new Set(ideaKey(b));return A.length>=4&&A.filter(word=>B.has(word)).length/A.length>=.62;}
const capSentences=(text,max)=>{const parts=(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(part=>part.trim()).filter(Boolean);return parts.slice(0,max).join(" ");};
function editorialCaution(text){
 const standard=text.match(/^Cuida que (.+?) no termine dirigiendo tus decisiones por encima de lo que la situación actual necesita\.?$/i);
 if(standard)return capSentences(`Presta atención a esto: ${sentence(cleanEditorial(standard[1]))}. No permitas que termine decidiendo por ti.`,2);
 let caution=cleanEditorial(text).replace(/^No trates el obstáculo como un detalle menor:\s*/i,"").replace(/\. Ese bloqueo está alterando la relación entre lo que buscas y lo que realmente puede sostenerse\.?$/i,". No es un detalle menor: altera lo que realmente puede sostenerse.");
 return capSentences(sentence(caution),2);
}
function editorialAdvice(text){
 const celtic=text.match(/^Dado que .+?, te conviene responder desde esta capacidad:\s*(.+?)\. Aprovecha que en el entorno (.+?), pero no intentes controlar su ritmo ni forzar la parte que depende de otra respuesta\.?$/i);
 if(celtic)return capSentences(`Usa a tu favor esta disposición: ${cleanEditorial(celtic[1])}. Observa cómo ${cleanEditorial(celtic[2])}, sin intentar controlar su ritmo ni la respuesta ajena.`,2);
 let advice=cleanEditorial(text)
  .replace(/^La acción más coherente es permitir que /i,"Ahora conviene que ")
  .replace(/^Relaciona lo aprendido cuando /i,"Lleva contigo lo aprendido cuando ")
  .replace(/^Observa cómo se encuentran /i,"Mira con honestidad cómo se encuentran ")
  .replace(/^Contrasta el camino en el que /i,"Compara el camino en el que ");
 return capSentences(advice,3);
}
function editorialNarrativeLayer({analysis,paragraphs,guidance}){
 const target=analysis.readingStory.kind==="celtic"?6:analysis.positionDynamics.length>=7?5:analysis.positionDynamics.length>=4?3:2;
 const story=[];
 for(let index=0;index<paragraphs.length;index++){
  let raw=paragraphs[index];
  const edited=cleanEditorial(raw);if(!edited||story.some(previous=>overlaps(edited,previous)))continue;story.push(edited);if(story.length===target)break;
 }
 const caution=editorialCaution(guidance.caution);
 let advice=editorialAdvice(guidance.advice);
 if(overlaps(advice,caution)){const unique=(advice.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(item=>item.trim()).filter(item=>!overlaps(item,caution));advice=unique.join(" ")||advice;}
 return {story,caution,advice,raw:{story:[...paragraphs],guidance:{...guidance}}};
}

const OUTPUT_COPY=Object.freeze({
 [TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE]:{title:"Mensaje central",advice:"Sugerencia"},
 [TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE]:{title:"Lectura",advice:"Clave"},
 [TAROT_OUTPUT_STRATEGIES.CONDITIONAL_ANSWER]:{title:"Respuesta razonada",advice:"Condición clave"},
 [TAROT_OUTPUT_STRATEGIES.RELATIONAL_THREE_PART]:{title:"Lo que muestra el vínculo",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW]:{title:"Dinámica del vínculo",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL]:{title:"Señales para decidir",advice:"Señal dominante"},
 [TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON]:{title:"Comparación de caminos",advice:"Conclusión"},
 [TAROT_OUTPUT_STRATEGIES.DECISION_ANALYSIS]:{title:"Análisis de la decisión",advice:"Conclusión"},
 [TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS]:{title:"Lectura práctica",advice:"Estrategia"},
 [TAROT_OUTPUT_STRATEGIES.INNER_PROCESS]:{title:"Proceso personal",advice:"Clave"},
 [TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE]:{title:"La historia que cuentan tus cartas",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW]:{title:"Panorama general",advice:"Punto de apoyo"},
 [TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM]:{title:"Lectura de los siete centros",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE]:{title:"Recorrido del Árbol de la Vida",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.JOURNEY_STAGES]:{title:"Etapas del camino",advice:"Orientación"},
 [TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE]:{title:"El ciclo que se abre",advice:"Tema central"},
 [TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY]:{title:"De un ciclo al siguiente",advice:"Primer paso"},
});
const DANGER_ROLES=new Set(["shadow","risk","obstacle","warning","leakage","distance","defense","threshold","trial"]);
const ACTION_ROLES=["action","advice","resource","movement","integration","condition","learning","insight","strength"];
const lowerFirst=text=>text?text.charAt(0).toLowerCase()+text.slice(1):"";
const asSentence=text=>{const value=sentence(trimSentence(cleanEditorial(text||"")));return value?`${value}.`:"";};
const entryAnswer=entry=>asSentence(entry?.answer||entry?.interpretation||"");
const section=(id,title,body)=>({id,title,body:cleanEditorial(body)});
const words=text=>(text||"").trim().split(/\s+/).filter(Boolean).length;
const meaningfulWords=text=>normalize(text||"").split(/[^a-z0-9]+/).filter(word=>word.length>4&&!new Set(["carta","lectura","situacion","puede","porque","cuando","desde","entre","sobre","ahora","tienes","necesita"]).has(word));
export function semanticSimilarity(first,second){
 const a=new Set(meaningfulWords(first)),b=new Set(meaningfulWords(second));
 if(!a.size||!b.size)return 0;
 const shared=[...a].filter(word=>b.has(word)).length;
 return shared/Math.min(a.size,b.size);
}
export function detectSemanticRedundancy({cardMeaning="",positionAnswer="",mainReading="",warning="",advice=""}={}){
 const fields={cardMeaning,positionAnswer,mainReading,warning,advice},pairs=[];
 for(const [left,leftText] of Object.entries(fields))for(const [right,rightText] of Object.entries(fields))if(left<right&&leftText&&rightText){const score=semanticSimilarity(leftText,rightText);if(score>=.7)pairs.push({left,right,score});}
 return pairs;
}
const SINGLE_MESSAGE_FRAMES=[
 {signals:["restriccion","miedo","bloqueo","ansiedad","preocupacion"],body:"Ahora pesa una sensación de límite que puede ser mayor que el obstáculo comprobable. En la experiencia cotidiana puede aparecer como demora, culpa, temor a equivocarte o la idea de que ninguna opción está disponible. Conviene distinguir entre una restricción real y una conclusión nacida del miedo. No asumas que sentirte atrapado significa estarlo por completo. Revisa qué regla, dato o permiso estás dando por fijo, identifica el margen que sí controlas y prueba un movimiento pequeño antes de renunciar a una salida."},
 {signals:["nostalgia","recuerdo","pasado","infancia","memoria"],body:"Algo conocido vuelve a ocupar espacio en el presente y puede ofrecer consuelo, identidad o una referencia para decidir. También puede hacerte mirar la situación actual con los ojos de otra etapa. La distinción importante está entre recuperar un valor genuino e idealizar lo que ya cambió. No supongas que lo familiar sigue siendo lo más conveniente. Compara el recuerdo con los hechos de hoy, conserva lo que todavía te nutre y evita convertir la nostalgia en un plan que ignore quién eres ahora."},
 {signals:["ruptura","revelacion","derrumbe","crisis","cambio brusco"],body:"Una estructura está mostrando una falla que ya no conviene disimular. Puede sentirse como una noticia, una pérdida de control o una alteración repentina, pero también permite ver qué parte de la situación era insostenible. La diferencia está entre el daño real y el miedo a que todo se pierda. No asumas que reconstruir significa volver a dejarlo igual. Atiende primero lo urgente, separa hechos de reacciones y utiliza lo revelado para crear una base que no dependa de mantener apariencias."},
 {signals:["control","seguridad","apego","retencion","posesividad"],body:"Estás protegiendo algo que consideras esencial: recursos, tiempo, una posición o una emoción. Esa reserva puede ser prudente, pero pierde utilidad cuando para sentir seguridad necesitas inmovilizarlo todo. La distinción está entre conservar una base y cerrar cualquier posibilidad de movimiento. No supongas que ceder un poco de control equivale a quedar desprotegido. Define qué debe permanecer, qué puede circular y qué riesgo es razonable. Una estabilidad sana sostiene decisiones; la rigidez sólo aplaza las que ya necesitan tomarse."},
 {signals:["esperanza","renovacion","recuperacion","inspiracion","autenticidad"],body:"Empieza a recuperarse una dirección que antes podía parecer debilitada. La experiencia puede sentirse como alivio, confianza renovada o una visión más limpia de lo que deseas construir. El matiz importante es que la esperanza orienta, pero no garantiza el resultado. No confundas una posibilidad prometedora con una confirmación. Busca señales concretas que respalden tu visión, conserva el objetivo y ajusta el método. Si la confianza se acompaña de constancia y verificación, puede convertirse en una recuperación real y no sólo en una expectativa agradable."},
 {signals:["introspeccion","prudencia","sabiduria","soledad","retiro"],body:"Necesitas reducir el ruido para reconocer qué piensas realmente y qué parte de la presión viene de fuera. La pausa puede evitar una decisión precipitada, aunque también puede convertirse en una forma discreta de posponerla. La diferencia está entre retirarte para comprender y aislarte para no responder. No asumas que esperar siempre produce más claridad. Ordena los hechos, escucha una opinión confiable sin entregar tu criterio y fija un momento para actuar. La reflexión cumple su función cuando termina ayudándote a elegir."},
 {signals:["conflicto","tension","victoria","competencia","hostilidad"],body:"La situación obliga a mirar no sólo quién gana, sino cuánto cuesta la forma de competir o discutir. Puede haber orgullo, presión, necesidad de imponerse o una ventaja que deje resentimiento. La distinción está entre defender lo esencial y prolongar una batalla para demostrar algo. No asumas que retirarte de un conflicto inútil equivale a perder. Define qué resultado necesitas, qué relación o recurso arriesgas y qué límite no vas a cruzar. Si el precio supera el beneficio, cambiar de estrategia es una decisión lúcida."},
 {signals:["empatia","intuicion","cuidado","sensibilidad","compasion"],body:"Tu sensibilidad permite percibir matices y necesidades que otras personas podrían pasar por alto. En la práctica, eso puede ayudarte a escuchar y contener, pero también a asumir responsabilidades emocionales que no te corresponden. La diferencia está entre comprender a alguien y cargar con su proceso. No trates cada emoción o presentimiento como una prueba suficiente. Conserva la empatía, pide claridad y protege tus límites. Tu intuición será más precisa cuando pueda convivir con hechos, descanso y una relación equilibrada entre dar y recibir."},
 {signals:["practica","detalle","maestria","oficio","disciplina"],body:"Lo que buscas se construye mediante práctica, atención y continuidad. La experiencia puede sentirse lenta o repetitiva, pero ofrece la oportunidad de mejorar algo que sí depende de ti. La distinción está entre repetir por costumbre y practicar con intención de corregir. No asumas que más horas producen automáticamente un mejor resultado. Elige una habilidad o tarea concreta, observa dónde falla el método y mide el avance. La dedicación puede dar fruto si cada repetición incorpora aprendizaje y no se limita a mantenerte ocupado."},
 {signals:["inicio","libertad","confianza","aventura","espontaneidad"],body:"Se abre una posibilidad que invita a moverte fuera de lo conocido. Puede sentirse como entusiasmo, curiosidad o deseo de empezar sin cargar con las reglas anteriores. La diferencia está entre avanzar con apertura y actuar como si no hubiera consecuencias. No asumas que necesitar una preparación mínima contradice la libertad del comienzo. Revisa el riesgo principal, conserva un margen de seguridad y da un primer paso que puedas corregir. La novedad puede llevarte lejos si la confianza se acompaña de atención y capacidad para ajustar el rumbo."},
];
const SINGLE_SUIT_FRAMES={
 Espadas:"El asunto está pasando por la forma en que interpretas los hechos y tomas una decisión. Una idea puede aclarar la situación o encerrarte en una conclusión demasiado rápida. Distingue entre lo que sabes, lo que supones y lo que temes. No conviertas una explicación mental en prueba suficiente. Formula la pregunta central, busca el dato que podría corregir tu lectura y habla con precisión. La claridad será útil si abre una decisión responsable, no si sólo sirve para defender una postura que ya habías elegido.",
 Copas:"El asunto central se relaciona con una emoción, un deseo o la manera en que estás leyendo un vínculo. Sentir algo con intensidad no confirma por sí solo lo que otra persona hará ni cómo terminará la situación. Distingue entre tu experiencia emocional y los hechos compartidos. No des por sentada la reciprocidad ni minimices lo que sientes. Nombra la necesidad concreta, pide claridad cuando corresponda y observa si la respuesta real coincide con la expectativa. Esa diferencia te permitirá cuidar el vínculo sin perder tu propio centro.",
 Oros:"La situación pide mirar resultados, recursos y estabilidad con sentido práctico. Puede haber una base valiosa, pero también una rutina o preocupación material que reduzca tu margen de movimiento. Distingue entre lo que produce continuidad y lo que sólo conserva una costumbre. No asumas que ir despacio significa no avanzar, ni que todo esfuerzo merece mantenerse. Revisa el rendimiento, el costo y la calidad de lo que estás construyendo. Después decide qué conviene sostener, corregir o dejar de financiar con tiempo y energía.",
 Bastos:"Hay energía disponible para actuar, competir o iniciar algo, pero necesita una dirección definida. El entusiasmo puede abrir una oportunidad y también dispersarse si intenta responder a todo al mismo tiempo. Distingue impulso de compromiso: comenzar es sencillo; sostener una elección exige prioridades. No asumas que moverte rápido equivale a acercarte al resultado. Elige el objetivo principal, limita las distracciones y comprueba pronto si la acción produce avance. Si no lo hace, corrige el rumbo antes de gastar más fuerza.",
};
export function interpretSingleMessage(entry){
 const card=entry?.cardData||{},source=normalize(`${(card.keys||entry?.themes||[]).join(" ")} ${card.general||""} ${card.growth||""} ${entry?.orientation==="reversed"?card.reversed||"":""}`),frame=SINGLE_MESSAGE_FRAMES.find(item=>item.signals.some(signal=>source.includes(normalize(signal))));
 const body=frame?.body||SINGLE_SUIT_FRAMES[card.suit]||"Esta lectura pone sobre la mesa una situación que ya pide una respuesta consciente. Puede manifestarse como una elección, un cambio de actitud o la necesidad de mirar un hecho que hasta ahora quedaba en segundo plano. Distingue lo que puedes comprobar de lo que sólo anticipas, y no conviertas una reacción inicial en conclusión definitiva. Observa qué depende realmente de ti, qué necesita conversación o evidencia y qué todavía requiere tiempo. Actúa sobre el elemento verificable más cercano y utiliza su resultado para corregir tu interpretación antes de avanzar.";
 return {body,sourcePositionIds:[entry.positionId],sourceCardIds:[entry.cardId],sourceRelationIds:[]};
}
function orderedEntries(analysis,cards){return grammarEntries(analysis,cards).filter(entry=>entry&&entry.cardData);}
function entryMap(entries){return new Map(entries.map(entry=>[entry.spec.id,entry]));}
function answerFor(byId,id){return entryAnswer(byId.get(id));}
function shortAnswerFor(byId,id){return capSentences(answerFor(byId,id),1);}
function naturalClause(text){
 return trimSentence(cleanEditorial(text||"")).replace(/^(?:Ahora|En este momento|La tendencia apunta a que|Si nada relevante cambia),?\s*/i,"").trim();
}
function titledObservation(title,text){const value=naturalClause(text);return value?`${title}: ${value}.`:"";}
function chakraFlow(entries){
 const tense=entries.filter(entry=>entry.orientation==="reversed"),steady=entries.filter(entry=>entry.orientation!=="reversed");
 if(!tense.length)return "El flujo general mantiene continuidad entre la base, el movimiento, la voluntad, el vínculo, la expresión, la percepción y el sentido. Esto no garantiza que todo sea sencillo: señala que las distintas funciones pueden apoyarse sin que una tensión domine el recorrido.";
 const labels=tense.map(entry=>entry.spec.label).join(", "),support=steady.slice(0,2).map(entry=>entry.spec.label).join(" y ");
 return `La lectura señala tensión en ${labels}; puede sentirse como una interrupción entre lo que necesitas, lo que expresas y la manera en que comprendes el proceso. No la presenta como una condición física ni como un hecho fijo. ${support?`El apoyo más disponible aparece en ${support}, y desde ahí puede recuperarse continuidad.`:"Conviene observar la tensión sin convertirla en una afirmación absoluta."}`;
}
function pairObservation(byId,first,second,firstLabel,secondLabel){
 const a=byId.get(first),b=byId.get(second),different=a?.orientation!==b?.orientation;
 return `${titledObservation(firstLabel,shortAnswerFor(byId,first))} ${titledObservation(secondLabel,shortAnswerFor(byId,second))} ${different?"Los dos polos no avanzan al mismo ritmo; uno puede impulsar lo que el otro todavía necesita ordenar.":"Los dos polos pueden trabajarse como complemento: ninguno necesita imponerse para que el proceso avance."}`;
}
function joinAnswers(entries,connectors=[]){
 return entries.map((entry,index)=>`${connectors[index]||""}${index?lowerFirst(entryAnswer(entry)):entryAnswer(entry)}`).filter(Boolean).join(" ");
}
function comparisonInclination(entries){
 const score=entry=>entry?.orientation==="reversed"?-1:1;
 const advance=entries.find(entry=>entry.spec.id==="advance"),wait=entries.find(entry=>entry.spec.id==="wait"),stop=entries.find(entry=>entry.spec.id==="stop");
 if(score(advance)>score(wait)&&score(advance)>score(stop))return "La lectura se inclina a avanzar, siempre que la condición favorable pueda comprobarse en los hechos.";
 if(score(stop)>score(advance))return "La señal de alto tiene más peso por ahora; conviene detener el movimiento hasta que cambien las condiciones.";
 return "La lectura se inclina a esperar y confirmar datos antes de tomar una decisión definitiva.";
}
function outputSections(strategy,analysis,cards,narrativeSynthesis,legacyStory){
 const entries=orderedEntries(analysis,cards),byId=entryMap(entries),id=analysis.spreadGrammar.id;
 if(strategy===TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE){
  const message=interpretSingleMessage(entries[0]);
  return [{...section("message","Mensaje",message.body),...message}];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_THREE_PART)return [
  section("feeling","Lo que siente",`Emocionalmente, ${lowerFirst(answerFor(byId,"feeling"))} Esto describe una emoción posible, no una confesión comprobada.`),
  section("thought","Lo que piensa",`Mentalmente, ${lowerFirst(answerFor(byId,"thought"))} Su evaluación puede no tener la misma intensidad que lo que siente.`),
  section("action","Lo que probablemente hará",`La conducta probable estará marcada por ${(byId.get("action")?.cardData?.keys||[]).slice(0,3).join(", ")||lowerFirst(answerFor(byId,"action"))}. Necesita confirmarse en hechos.`),
  section("synthesis","Síntesis",narrativeSynthesis.main_movement?`La alineación entre los tres planos se resume así: ${narrativeSynthesis.main_movement}. La coherencia real dependerá de que emoción, pensamiento y conducta avancen en la misma dirección.`:"La alineación no puede darse por sentada: sentir, pensar y actuar no son lo mismo; observa si los hechos confirman la intención."),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL)return [
  section("advance","Avanzar",`Avanzar tiene sentido cuando ${lowerFirst(answerFor(byId,"advance"))}`),
  section("wait","Esperar",`Esperar conviene mientras ${lowerFirst(answerFor(byId,"wait"))}`),
  section("stop","Detenerse",`Detenerse se justifica si ${lowerFirst(answerFor(byId,"stop"))}`),
  section("dominant","Señal dominante",`${comparisonInclination(entries)} Es la señal con mayor respaldo relativo y cambiaría si los hechos empiezan a coincidir con otra de las dos condiciones.`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON){
  const act=id==="act_or_not",current=answerFor(byId,act?"decision":"situation"),a=answerFor(byId,act?"act":"path_a"),ar=answerFor(byId,act?"act_result":"result_a"),b=answerFor(byId,act?"not_act":"path_b"),br=answerFor(byId,act?"not_act_result":"result_b");
  return [section("starting","Punto de partida",current),section("path_a",act?"Si actúas":"Camino A",`${a} ${ar}`),section("path_b",act?"Si no actúas":"Camino B",`${b} ${br}`),section("comparison","Comparación",`Si eliges el primer camino, ${lowerFirst(naturalClause(ar||a))}. Con el segundo, ${lowerFirst(naturalClause(br||b))}. La decisión más coherente será la consecuencia que realmente puedas sostener.`)];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.DECISION_ANALYSIS)return [section("advantage","A favor",answerFor(byId,"advantage")),section("risk","Riesgo",answerFor(byId,"risk")),section("result","Resultado probable",answerFor(byId,"result")),section("conclusion","Conclusión",`La ventaja puede aprovecharse, pero el resultado dependerá de atender el riesgo antes de comprometerte.`)];
 if(strategy===TAROT_OUTPUT_STRATEGIES.CONDITIONAL_ANSWER)return [section("answer","Respuesta",answerFor(byId,"answer")),section("condition","Condición",answerFor(byId,"condition")),section("warning","Lo que puede cambiarla",answerFor(byId,"warning"))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY)return [section("ending","Lo que termina",`Termina una etapa en la que ${lowerFirst(answerFor(byId,"ending"))}`),section("lesson","Lo que deja",answerFor(byId,"lesson")),section("threshold","El umbral",`Antes de cruzar hacia lo nuevo, ${lowerFirst(answerFor(byId,"threshold"))}`),section("beginning","Lo que comienza",answerFor(byId,"beginning")),section("first_step","Primer paso",answerFor(byId,"first_step"))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE)return [
  section("preparation","Preparación",narrativeSynthesis.arcs.opening||`En invierno, ${lowerFirst(answerFor(byId,"winter"))} Durante el despertar, ${lowerFirst(answerFor(byId,"awakening"))}`),
  section("growth","Crecimiento",`En primavera, ${lowerFirst(answerFor(byId,"spring"))} ${narrativeSynthesis.arcs.growth||`En verano, ${lowerFirst(answerFor(byId,"summer"))}`}`),
  section("harvest","Resultados",narrativeSynthesis.arcs.results||`La cosecha muestra que ${lowerFirst(answerFor(byId,"harvest"))} En otoño, ${lowerFirst(answerFor(byId,"autumn"))}`),
  section("center","Depuración y tema central",narrativeSynthesis.arcs.closure||`${answerFor(byId,"release")} ${answerFor(byId,"center")}`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.JOURNEY_STAGES)return [
  section("calling","Llamado y origen",`${answerFor(byId,"calling")} ${answerFor(byId,"origin")}`),
  section("support","Equipaje y guía",`${answerFor(byId,"baggage")} ${answerFor(byId,"guide")}`),
  section("trial","Umbral y prueba",`${answerFor(byId,"threshold")} ${answerFor(byId,"trial")} ${answerFor(byId,"shadow")}`),
  section("choice","Revelación y elección",`${answerFor(byId,"revelation")} ${answerFor(byId,"choice")} ${answerFor(byId,"surrender")}`),
  section("integration","Integración y destino",`${answerFor(byId,"integration")} ${answerFor(byId,"destination")}`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM)return [
  section("base_movement","BASE Y MOVIMIENTO",`${titledObservation("Seguridad y arraigo",answerFor(byId,"root"))} ${titledObservation("Deseo y creatividad",answerFor(byId,"sacral"))}`),
  section("will_bond","VOLUNTAD Y VÍNCULO",`${titledObservation("Voluntad personal",answerFor(byId,"solar"))} ${titledObservation("Afecto y apertura",answerFor(byId,"heart"))}`),
  section("expression_perception","EXPRESIÓN Y PERCEPCIÓN",`${titledObservation("Verdad y comunicación",answerFor(byId,"throat"))} ${titledObservation("Percepción y comprensión",answerFor(byId,"third_eye"))}`),
  section("integration","INTEGRACIÓN",titledObservation("Sentido que integra el proceso",answerFor(byId,"crown"))),
  section("flow","FLUJO GENERAL",chakraFlow(entries)),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE)return [
  section("principle","PRINCIPIO DEL PROCESO",titledObservation("Kéter plantea la intención inicial",shortAnswerFor(byId,"keter"))),
  section("polarities","POLARIDADES PRINCIPALES",`${pairObservation(byId,"chokmah","binah","Jojmá aporta impulso","Biná le da forma")} ${pairObservation(byId,"chesed","gevurah","Jésed permite expandir","Guevurá fija el límite")} ${pairObservation(byId,"netzach","hod","Nétzaj sostiene el deseo","Hod ordena pensamiento y palabra")}`),
  section("center_integration","CENTRO DE INTEGRACIÓN",`${titledObservation("Tiféret reúne las fuerzas en el centro",shortAnswerFor(byId,"tiferet"))} Su función aquí no es borrar las diferencias, sino encontrar una medida que permita utilizarlas sin que un extremo gobierne todo el proceso.`),
  section("underlying_pattern","PATRÓN SUBYACENTE",`${titledObservation("Yesod muestra la base interna",shortAnswerFor(byId,"yesod"))} Esta base prepara lo que podrá tomar forma; si permanece implícita, también puede condicionar el resultado sin que se advierta de inmediato.`),
  section("manifestation","MANIFESTACIÓN",`${titledObservation("Maljut lleva el proceso a los hechos",shortAnswerFor(byId,"malkuth"))} Aquí se comprueba qué parte de la intención puede sostenerse en decisiones, hábitos y resultados observables.`),
  section("panorama","PANORAMA GENERAL",`El recorrido conecta una intención con su forma concreta mediante tres polaridades que necesitan negociación, un centro que integra y una base interna que prepara la acción. No describe una verdad doctrinal ni un destino cerrado: ofrece un mapa simbólico para reconocer dónde existe impulso, dónde hace falta estructura y qué deberá cambiar para que la manifestación sea coherente con el principio inicial.`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE&&id==="celtic_cross")return [
  section("origin","Lo que te ha traído hasta aquí",`${answerFor(byId,"past")} En el fondo, ${lowerFirst(answerFor(byId,"base"))} Ahora, ${lowerFirst(answerFor(byId,"situation"))}`),
  section("challenge","El reto y la posibilidad",`${answerFor(byId,"cross")} Aun así, ${lowerFirst(answerFor(byId,"possibility"))}`),
  section("development","Lo que empieza a moverse",`${answerFor(byId,"near_future")} No es una conclusión cerrada: es el siguiente tramo si la dinámica se mantiene.`),
  section("response","Tu respuesta y lo que te rodea",`${answerFor(byId,"attitude")} A tu alrededor, ${lowerFirst(answerFor(byId,"environment"))} También pesan tus expectativas: ${lowerFirst(answerFor(byId,"hopes_fears"))}`),
  section("direction","Tendencia",`${answerFor(byId,"trend")} La dirección puede fortalecerse o cambiar según cómo respondas al reto central y a los hechos que aparezcan.`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW&&id==="twelve_houses"){
  const axis=(ids,lead)=>`${lead} ${lowerFirst(ids.map(key=>answerFor(byId,key)).filter(Boolean).join(" "))}`;
  return [section("personal","Eje personal",axis(["self","unconscious"],"Tu identidad y tu vida interior muestran que")),section("practical","Eje práctico",axis(["resources","routines","vocation"],"Recursos, hábitos y dirección profesional se relacionan así:")),section("relational","Eje relacional",axis(["communication","bonds","community"],"La comunicación y los vínculos señalan que")),section("change","Eje de cambio",axis(["home","creativity","transformation","vision"],"La estructura de vida y el cambio profundo muestran que"))];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS&&id==="project_business")return [section("idea","La idea",answerFor(byId,"idea")),section("resources","Recursos y mercado",`${answerFor(byId,"resources")} ${answerFor(byId,"market")}`),section("obstacle","Obstáculo",answerFor(byId,"obstacle")),section("strategy","Estrategia y resultado",`${answerFor(byId,"strategy")} ${answerFor(byId,"result")}`)];
 if(strategy===TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,index===0?"Situación":index===1?"Factores clave":"Dirección práctica",body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,index===0?"Las dos partes":index===1?"El vínculo":"Evolución",body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.INNER_PROCESS)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,index===0?"Lo que ocurre dentro":"Cómo integrarlo",body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,index===0?"Núcleo del mapa":"Eje de apoyo",body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE)return legacyStory.map((body,index)=>section(`stage_${index+1}`,index===0?"Origen y presente":index===legacyStory.length-1?"Dirección":"Desarrollo",body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE){
  const connectors=entries.length===2?[""," A partir de ahí, "]:[""," Ahora, "," A partir de aquí, "];
  const middle=entries[Math.floor(entries.length/2)],themes=middle?.cardData?.keys?.slice(0,2).join(" y ")||"la respuesta presente";
  return [section("reading","Lectura",joinAnswers(entries,connectors)),section("key","Clave",`La clave está en ${themes}: ahí puedes modificar el paso entre lo vivido y la tendencia. No se trata de repetir el pasado ni de esperar que el desenlace ocurra solo; el presente es el punto donde puedes intervenir.`)];
 }
 return legacyStory.map((body,index)=>section(`reading_${index+1}`,index===0?"Lectura":"Continuación",body));
}
function warningFor(analysis,entries){
 const explicit=entries.find(entry=>["risk","obstacle","warning","leakage","distance","cross","stop","trial"].includes(entry.spec.id)),reversed=entries.find(entry=>entry.orientation==="reversed"),semanticDanger=entries.find(entry=>DANGER_ROLES.has(entry.role)&&/riesgo|bloque|dificult|impide|prolong|evita|confusi|exceso|desigual|peligro|resistencia|aislamiento/i.test(entryAnswer(entry)));
 const source=explicit||reversed||semanticDanger;if(!source)return null;
 let body=entryAnswer(source);
 if(!body)return null;
 if(!/^no |^evita |^cuidado|^el riesgo|^detenerse|^puede |^hay /i.test(body))body=`No ignores este punto: ${lowerFirst(body)}`;
 body=capSentences(asSentence(body),2);
 return {id:"warning",title:"Lo que debes cuidar",body,sourcePositionIds:[source.positionId],sourceCardIds:[source.cardId],sourceRelationIds:[]};
}
function adviceFor(strategy,entries,sections,cards){
 if([TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE,TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM,TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE].includes(strategy))return null;
 let source=ACTION_ROLES.map(role=>entries.find(entry=>entry.role===role)).find(Boolean);
 if(!source&&strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE)source=entries.find(entry=>["attitude","possibility","near_future"].includes(entry.spec.id));
 let body=source?entryAnswer(source):"";
 if(!body&&strategy===TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE&&cards[0]?.advice)body=asSentence(cards[0].advice);
 if(!body)return null;
 if(sections.some(item=>normalize(item.body).includes(normalize(entryAnswer(source))))){const themes=source?.cardData?.keys?.slice(0,2).join(" y ")||source?.themes?.slice(0,2).join(" y ");body=themes?`Actúa desde ${themes} y comprueba el efecto antes de sostener la siguiente decisión.`:"";}
 if(!body)return null;
 return {id:"advice",title:OUTPUT_COPY[strategy]?.advice||"Orientación",body:capSentences(body,2),sourcePositionIds:[source.positionId],sourceCardIds:[source.cardId],sourceRelationIds:[]};
}
function compatibilityStory(strategy,sections,spreadId){
 const bodies=sections.map(item=>item.body);
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE&&spreadId==="celtic_cross"&&bodies.length>=5)return [bodies[0],`${bodies[1]} ${bodies[2]}`,bodies[3],bodies[4]];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON&&bodies.length>=4)return [bodies[0],`${bodies[1]} ${bodies[2]}`,bodies[3]];
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_THREE_PART&&bodies.length>=4)return [`${bodies[0]} ${bodies[1]}`,bodies[2],bodies[3]];
 if(strategy===TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL&&bodies.length>=4)return [`${bodies[0]} ${bodies[1]} ${bodies[2]}`,bodies[3]];
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW&&bodies.length>3)return [bodies[0],bodies[1],bodies.slice(2).join(" ")];
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW&&spreadId==="twelve_houses"&&bodies.length>4)return [bodies[0],bodies[1],bodies[2],bodies.slice(3).join(" ")];
 return bodies;
}
export function polishReading(output){
 const sections=[];
 for(const item of output.sections||[]){const body=cleanEditorial(item.body);if(!body||sections.some(previous=>normalize(body)===normalize(previous.body)))continue;const sameTitle=sections.find(previous=>item.title&&normalize(previous.title)===normalize(item.title));if(sameTitle){if(semanticSimilarity(sameTitle.body,body)<.7)sameTitle.body=cleanEditorial(`${sameTitle.body} ${body}`);continue;}sections.push({...item,body});}
 const warning=output.warning?{...output.warning,body:cleanEditorial(output.warning.body)}:null,advice=output.adviceBlock?{...output.adviceBlock,body:cleanEditorial(output.adviceBlock.body)}:null;
 return {...output,sections,warning,adviceBlock:advice,wordCount:words(sections.map(item=>item.body).join(" "))};
}
function readingBounds(count,strategy){
 if(strategy===TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM)return {min:150,max:280};
 if(strategy===TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE)return {min:250,max:400};
 if(count<=1)return {min:60,max:130};
 if(count===2)return {min:60,max:140};
 if(count<=3)return {min:90,max:180};
 if(count===4)return {min:120,max:230};
 if(count<=7)return {min:150,max:280};
 if(count===8)return {min:180,max:340};
 return {min:220,max:450};
}
function fitReadingLength(output,analysis,narrativeSynthesis){
 const bounds=readingBounds(analysis.positionDynamics.length,output.outputStrategy),sections=[...output.sections];
 let count=words(sections.map(item=>item.body).join(" "));
 if(count<bounds.min&&analysis.positionDynamics.length===1){sections[0]={...sections[0],body:cleanEditorial(`${sections[0].body} Comprueba esta orientación con una acción pequeña antes de convertirla en una decisión definitiva.`)};count=words(sections[0].body);}
 if([TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM,TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE].includes(output.outputStrategy))return {...output,sections,wordCount:count,lengthBounds:bounds};
 const additions=[
  cleanEditorial(`En conjunto, ${lowerFirst(narrativeSynthesis.reading_thesis||"")}`),
  "Las partes de la situación no actúan por separado: una puede reforzar, frenar o modificar a las demás.",
  "No todo pesa igual: comprueba qué parte ya se refleja en hechos, cuál depende de tu respuesta y cuál todavía necesita tiempo.",
  "La lectura no fija un resultado inevitable. Los siguientes hechos permitirán confirmar si la dirección se sostiene o necesita corregirse.",
 ].filter(Boolean);
 for(const addition of additions){if(count>=bounds.min||analysis.positionDynamics.length===1)break;if(sections.some(item=>overlaps(addition,item.body)))continue;sections.push(section(`context_${sections.length}`,sections.length?"En conjunto":"Lectura",addition));count=words(sections.map(item=>item.body).join(" "));}
 return {...output,sections,wordCount:count,lengthBounds:bounds};
}
const SECTION_SOURCE_GROUPS={
 celtic_cross:{origin:["past","base","situation"],challenge:["cross","possibility"],development:["near_future"],response:["attitude","environment","hopes_fears"],direction:["trend"]},
 twelve_houses:{personal:["self","unconscious"],practical:["resources","routines","vocation"],relational:["communication","bonds","community"],change:["home","creativity","transformation","vision"]},
 spiritual_path:{calling:["calling","origin"],support:["baggage","guide"],trial:["threshold","trial","shadow"],choice:["revelation","choice","surrender"],integration:["integration","destination"]},
 cycle_ending_beginning:{ending:["ending"],lesson:["lesson"],threshold:["threshold"],beginning:["beginning"],first_step:["first_step"]},
 project_business:{idea:["idea"],resources:["resources","market"],obstacle:["obstacle"],strategy:["strategy","result"]},
 seven_chakras:{base_movement:["root","sacral"],will_bond:["solar","heart"],expression_perception:["throat","third_eye"],integration:["crown"],flow:["root","sacral","solar","heart","throat","third_eye","crown"]},
 tree_of_life:{principle:["keter"],polarities:["chokmah","binah","chesed","gevurah","netzach","hod"],center_integration:["tiferet"],underlying_pattern:["yesod"],manifestation:["malkuth"],panorama:["keter","chokmah","binah","chesed","gevurah","tiferet","netzach","hod","yesod","malkuth"]},
};
const SECTION_SOURCE_ALIASES={
 message:["message"],feeling:["feeling"],thought:["thought"],action:["action"],advance:["advance"],wait:["wait"],stop:["stop"],
 advantage:["advantage"],risk:["risk"],result:["result"],answer:["answer"],condition:["condition"],warning:["warning"],
 starting:["situation","decision"],path_a:["path_a","result_a","act","act_result"],path_b:["path_b","result_b","not_act","not_act_result"],
 preparation:["winter","awakening"],growth:["spring","summer"],harvest:["harvest","autumn"],center:["release","center"],
};
function sourcePositionsForSection(item,analysis){
 const valid=new Set(analysis.positionAnswers.map(answer=>answer.positionId)),specific=SECTION_SOURCE_GROUPS[analysis.spreadGrammar.id]?.[item.id],aliases=specific||SECTION_SOURCE_ALIASES[item.id]||[item.id];
 let ids=aliases.filter(id=>valid.has(id));
 if(["synthesis","comparison","conclusion","dominant","reading","key"].includes(item.id)||item.id.startsWith("stage_")||item.id.startsWith("context_")||!ids.length)ids=[...valid];
 return [...new Set(ids)];
}
function applySectionProvenance(sections,analysis){
 const answerById=new Map(analysis.positionAnswers.map(answer=>[answer.positionId,answer]));
 return sections.map(item=>{
  const sourcePositionIds=item.sourcePositionIds?.length?item.sourcePositionIds:sourcePositionsForSection(item,analysis),sourceCardIds=[...new Set(sourcePositionIds.map(id=>answerById.get(id)?.cardId).filter(Boolean))];
  const sourceRelationIds=(analysis.propositionRelations||[]).filter(relation=>relation.sourcePositionIds?.every(id=>sourcePositionIds.includes(id))).map(relation=>relation.id);
  return {...item,sourcePositionIds,sourceCardIds,sourceRelationIds};
 });
}
function buildSemanticTrace(analysis,sections,extras=[]){
 const positions=analysis.positionAnswers.map(answer=>({positionId:answer.positionId,positionLabel:answer.positionLabel,positionQuestion:answer.positionQuestion,cardId:answer.cardId,cardName:answer.cardName,orientation:answer.orientation,domain:answer.domain,answer:answer.answer,themes:answer.themes}));
 const conclusions=[...sections,...extras.filter(Boolean)];
 return {drawId:analysis.drawId,spreadId:analysis.spreadGrammar.id,cards:positions.map(item=>({positionId:item.positionId,cardId:item.cardId,cardName:item.cardName,orientation:item.orientation})),positions,relations:(analysis.propositionRelations||[]).map(relation=>({id:relation.id,sourcePositionIds:relation.sourcePositionIds,sourceCardIds:relation.sourceCardIds,relationType:relation.relationType,interpretation:relation.interpretation})),synthesisConclusions:conclusions.map(item=>({id:item.id,text:item.body,sourcePositionIds:item.sourcePositionIds,sourceCardIds:item.sourceCardIds,sourceRelationIds:item.sourceRelationIds}))};
}
export function validateSemanticTrace(trace,{previousTrace=null}={}){
 const errors=[],positionIds=trace.positions.map(item=>item.positionId),cardIds=trace.cards.map(item=>item.cardId),positionSet=new Set(positionIds),cardSet=new Set(cardIds),positionCard=new Map(trace.cards.map(item=>[item.positionId,item.cardId]));
 if(positionSet.size!==positionIds.length)errors.push("position_ids_duplicated");
 if(cardSet.size!==cardIds.length)errors.push("card_ids_duplicated");
 for(const position of trace.positions)if(positionCard.get(position.positionId)!==position.cardId)errors.push(`position_card_mismatch:${position.positionId}`);
 for(const relation of trace.relations){if(relation.sourcePositionIds.some(id=>!positionSet.has(id)))errors.push(`relation_position_outside_draw:${relation.id}`);if(relation.sourceCardIds.some(id=>!cardSet.has(id)))errors.push(`relation_card_outside_draw:${relation.id}`);}
 const relationSet=new Set(trace.relations.map(item=>item.id));
 for(const conclusion of trace.synthesisConclusions){if(!conclusion.sourcePositionIds.length||conclusion.sourcePositionIds.some(id=>!positionSet.has(id)))errors.push(`conclusion_position_outside_draw:${conclusion.id}`);if(!conclusion.sourceCardIds.length||conclusion.sourceCardIds.some(id=>!cardSet.has(id)))errors.push(`conclusion_card_outside_draw:${conclusion.id}`);if(conclusion.sourceRelationIds.some(id=>!relationSet.has(id)))errors.push(`conclusion_relation_outside_draw:${conclusion.id}`);}
 if(previousTrace&&previousTrace.drawId===trace.drawId)errors.push("draw_id_not_changed");
 return {valid:errors.length===0,errors};
}
export function buildTarotEditorialOutput(analysis,cards){
 const interpretiveSynthesis=buildInterpretiveSynthesis(analysis,cards),narrativeSynthesis=buildNarrativeSynthesis(analysis,cards,interpretiveSynthesis),paragraphs=Object.values(narrativeSynthesis.arcs).flat(),guidance={caution:narrativeSynthesis.warning,advice:narrativeSynthesis.actionable_guidance,reading:narrativeSynthesis.arcs.direction||""},edited=editorialNarrativeLayer({analysis,paragraphs,guidance});
 const outputStrategy=analysis.spreadGrammar.outputStrategy||TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE,entries=orderedEntries(analysis,cards),draftSections=outputSections(outputStrategy,analysis,cards,narrativeSynthesis,edited.story),warning=warningFor(analysis,entries),adviceBlock=adviceFor(outputStrategy,entries,draftSections,cards),copy=OUTPUT_COPY[outputStrategy]||OUTPUT_COPY[TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],basePolished=polishReading({outputStrategy,title:copy.title,sections:draftSections,warning,adviceBlock}),polished=polishReading(fitReadingLength(basePolished,analysis,narrativeSynthesis));
 const sourcedSections=applySectionProvenance(polished.sections,analysis),semanticTrace=buildSemanticTrace(analysis,sourcedSections,[polished.warning,polished.adviceBlock]),traceValidation=validateSemanticTrace(semanticTrace);
 if(!traceValidation.valid)throw new Error(`[tarot semantic trace] ${traceValidation.errors.join(", ")}`);
 const story=compatibilityStory(outputStrategy,sourcedSections,analysis.spreadGrammar.id),caution=polished.warning?.body||"",advice=polished.adviceBlock?.body||"",editorialOutput={title:polished.title,sections:sourcedSections,warning:polished.warning,advice:polished.adviceBlock,wordCount:polished.wordCount},raw={...edited.raw,story:[...paragraphs,...draftSections.map(item=>item.body)]};
 const redundancyAudit=detectSemanticRedundancy({cardMeaning:cards.map(card=>card.isReversed?card.reversed:card.general).join(" "),positionAnswer:analysis.positionAnswers.map(item=>item.answer).join(" "),mainReading:sourcedSections.map(item=>item.body).join(" "),warning:caution,advice});
 return {...edited,...polished,sections:sourcedSections,raw,story,caution,advice,showWarning:Boolean(polished.warning),showAdvice:Boolean(polished.adviceBlock),warningTitle:polished.warning?.title||"",adviceTitle:polished.adviceBlock?.title||"",narrativeSynthesis,debug:{semanticTrace,traceValidation,redundancyAudit,semanticAnalysis:analysis.semanticModel,cards:analysis.positionAnswers.map(answer=>({positionId:answer.positionId,position:answer.positionLabel,positionQuestion:answer.positionQuestion,answerMode:answer.answerMode,cardId:answer.cardId,card:answer.cardName,isReversed:answer.orientation==="reversed",answer:answer.answer,meaning:answer.interpretation})),positionAnswers:analysis.positionAnswers,relations:analysis.propositionRelations,relationships:analysis.propositionRelations,spreadSynthesis:narrativeSynthesis,narrativeSynthesis,outputStrategy,editorialOutput,interpretiveSynthesis,interpretationDebug:analysis.interpretationDebug}};
}
export function composeTarotInterpretation(analysis,cards){return buildTarotEditorialOutput(analysis,cards).story;}
export function deriveTarotGuidance(analysis){
 const raw=deriveAdvice(analysis),edited=editorialNarrativeLayer({analysis,paragraphs:[],guidance:raw});
 return {caution:edited.caution,advice:edited.advice,reading:cleanEditorial(raw.reading)};
}
