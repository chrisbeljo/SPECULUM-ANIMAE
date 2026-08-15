import {getSpreadGrammar,isKnownSpread,TAROT_OUTPUT_STRATEGIES} from "./tarot-spread-grammar.js";
import {buildContextualProposition,buildPropositionRelations,contextualRelationMovement,resolveTarotDomain} from "./tarot-context-semantics.js";
import {riderDeck} from "./rider-deck.ts";

// Las cartas que llegan aquí pueden venir localizadas (nombre/keys/general en otro idioma).
// Toda clasificación estructural (ejes temáticos, casos especiales por carta) debe basarse
// en el español canónico, no en el texto mostrado, o se rompe para EN/FR/DE/PT.
const canonicalById=Object.fromEntries(riderDeck.map(card=>[card.id,card]));
const canonicalOf=card=>canonicalById[card.id]||card;

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
const AXIS_TRANSLATIONS={
 "claridad y conocimiento":{EN:"clarity and knowledge",FR:"clarté et connaissance",DE:"Klarheit und Erkenntnis",PT:"clareza e conhecimento"},
 "transformación y cambio":{EN:"transformation and change",FR:"transformation et changement",DE:"Wandel und Veränderung",PT:"transformação e mudança"},
 "vínculo y reciprocidad":{EN:"bond and reciprocity",FR:"lien et réciprocité",DE:"Bindung und Gegenseitigkeit",PT:"vínculo e reciprocidade"},
 "construcción y recursos":{EN:"building and resources",FR:"construction et ressources",DE:"Aufbau und Ressourcen",PT:"construção e recursos"},
 "equilibrio e integración":{EN:"balance and integration",FR:"équilibre et intégration",DE:"Gleichgewicht und Integration",PT:"equilíbrio e integração"},
 "libertad y movimiento":{EN:"freedom and movement",FR:"liberté et mouvement",DE:"Freiheit und Bewegung",PT:"liberdade e movimento"},
 "protección y límites":{EN:"protection and boundaries",FR:"protection et limites",DE:"Schutz und Grenzen",PT:"proteção e limites"},
 "esperanza y propósito":{EN:"hope and purpose",FR:"espoir et dessein",DE:"Hoffnung und Bestimmung",PT:"esperança e propósito"},
 "tensión y conflicto":{EN:"tension and conflict",FR:"tension et conflit",DE:"Spannung und Konflikt",PT:"tensão e conflito"},
};
const THEME_AND_WORD={EN:" and ",FR:" et ",DE:" und ",PT:" e "};
function translateTheme(theme,language){
 if(!theme||language==="ES")return theme;
 if(AXIS_TRANSLATIONS[theme]?.[language])return AXIS_TRANSLATIONS[theme][language];
 // Temas compuestos (p. ej. "eje1 y eje2") aparecen cuando no hay un cluster único de cartas;
 // se traduce cada eje conocido por separado y se reúnen con la conjunción del idioma.
 const axisKeys=Object.keys(AXIS_TRANSLATIONS).sort((a,b)=>b.length-a.length);
 let remaining=theme;
 const pieces=[];
 while(remaining){
  const match=axisKeys.find(key=>remaining===key||remaining.startsWith(`${key} y `));
  if(match){pieces.push(AXIS_TRANSLATIONS[match][language]||match);remaining=remaining===match?"":remaining.slice(match.length+3);}
  else{const idx=remaining.indexOf(" y ");if(idx===-1){pieces.push(remaining);remaining="";}else{pieces.push(remaining.slice(0,idx));remaining=remaining.slice(idx+3);}}
 }
 return pieces.join(THEME_AND_WORD[language]||" y ");
}
const TREND_SYNTHESIS_T={
 ES:(trend,lang)=>trend.length?`La dirección probable se relaciona con ${trend.flatMap(x=>x.themes.map(t=>translateTheme(t,lang))).slice(0,3).join(", ")}; no constituye un destino fijo.`:"La tirada describe condiciones y decisiones, no un destino fijo.",
 EN:(trend,lang)=>trend.length?`The likely direction relates to ${trend.flatMap(x=>x.themes.map(t=>translateTheme(t,lang))).slice(0,3).join(", ")}; it isn't a fixed destiny.`:"The spread describes conditions and decisions, not a fixed destiny.",
 FR:(trend,lang)=>trend.length?`La direction probable se rapporte à ${trend.flatMap(x=>x.themes.map(t=>translateTheme(t,lang))).slice(0,3).join(", ")} ; ce n'est pas un destin fixe.`:"Le tirage décrit des conditions et des décisions, pas un destin fixe.",
 DE:(trend,lang)=>trend.length?`Die wahrscheinliche Richtung steht in Verbindung mit ${trend.flatMap(x=>x.themes.map(t=>translateTheme(t,lang))).slice(0,3).join(", ")}; das ist kein festgelegtes Schicksal.`:"Die Legung beschreibt Bedingungen und Entscheidungen, kein festgelegtes Schicksal.",
 PT:(trend,lang)=>trend.length?`A direção provável se relaciona com ${trend.flatMap(x=>x.themes.map(t=>translateTheme(t,lang))).slice(0,3).join(", ")}; não constitui um destino fixo.`:"A tiragem descreve condições e decisões, não um destino fixo.",
};
const CONFIDENCE_NOTE_T={
 ES:high=>high?"El eje principal está reforzado por varias cartas o relaciones.":"La tesis es orientativa y conviene contrastarla con los hechos.",
 EN:high=>high?"The main axis is reinforced by several cards or relationships.":"The thesis is a guide and should be checked against the facts.",
 FR:high=>high?"L'axe principal est renforcé par plusieurs cartes ou relations.":"La thèse est indicative et doit être confrontée aux faits.",
 DE:high=>high?"Die Hauptachse wird durch mehrere Karten oder Beziehungen verstärkt.":"Die These ist orientierend und sollte mit den Fakten abgeglichen werden.",
 PT:high=>high?"O eixo principal é reforçado por várias cartas ou relações.":"A tese é orientativa e convém contrastá-la com os fatos.",
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
 const canonical=canonicalOf(card);
 const source=normalize(`${canonical.keys.join(" ")} ${card.isReversed?(canonical.reversed||""):canonical.general}`),found=[];
 for(const [axis,words] of Object.entries(AXES))if(words.some(word=>source.includes(normalize(word))))found.push(axis);
 for(const key of canonical.keys){const clean=normalize(key);if(!Object.values(AXES).flat().some(word=>normalize(word)===clean))found.push(clean)}
 return [...new Set(found)];
}
const POSITION_FUNCTION_T={
 ES:{tension:"tensiona o modifica",possibility:"abre una posibilidad",trend:"describe una dirección probable",origin:"explica el origen",internal:"expresa la respuesta interna",external:"describe una influencia externa",action:"orienta la acción",default:"define el asunto"},
 EN:{tension:"creates tension or changes things",possibility:"opens a possibility",trend:"describes a likely direction",origin:"explains the origin",internal:"expresses the internal response",external:"describes an external influence",action:"guides the action",default:"defines the matter"},
 FR:{tension:"crée une tension ou modifie",possibility:"ouvre une possibilité",trend:"décrit une direction probable",origin:"explique l'origine",internal:"exprime la réponse intérieure",external:"décrit une influence extérieure",action:"oriente l'action",default:"définit le sujet"},
 DE:{tension:"erzeugt Spannung oder verändert",possibility:"eröffnet eine Möglichkeit",trend:"beschreibt eine wahrscheinliche Richtung",origin:"erklärt den Ursprung",internal:"drückt die innere Antwort aus",external:"beschreibt einen äußeren Einfluss",action:"leitet das Handeln",default:"definiert das Thema"},
 PT:{tension:"tensiona ou modifica",possibility:"abre uma possibilidade",trend:"descreve uma direção provável",origin:"explica a origem",internal:"expressa a resposta interna",external:"descreve uma influência externa",action:"orienta a ação",default:"define o assunto"},
};
function positionFunction(label,language="ES"){
 const t=POSITION_FUNCTION_T[language]||POSITION_FUNCTION_T.ES;
 if(NEGATIVE_POSITION.test(label))return t.tension;
 if(POSSIBILITY_POSITION.test(label))return t.possibility;
 if(TREND_POSITION.test(label))return t.trend;
 if(/base|raíz|origen|pasado/i.test(label))return t.origin;
 if(/actitud|mente|emoción|tú|intern/i.test(label))return t.internal;
 if(/entorno|otra persona|extern/i.test(label))return t.external;
 if(/consejo|acción|estrategia|iniciar/i.test(label))return t.action;
 return t.default;
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
export function analyzeTarotReading({spread,positions,cards,category="Consulta general",question="",orientationEnabled=false,drawId=null,language="ES"}){
 const grammar=getSpreadGrammar(spread,positions),resolvedDrawId=drawId||`${grammar.id}:${cards.map(card=>`${card.id}:${card.isReversed?"r":"u"}`).join("|")}`;
 const enriched=cards.map((card,index)=>({card,index,positionId:grammar.positions[index]?.id||`position_${index+1}`,position:grammar.positions[index]?.label||positions[index],positionFunction:positionFunction(positions[index],language),concepts:concepts(card),weight:(card.arcana==="Mayor"?2:1)+(NEGATIVE_POSITION.test(positions[index])||TREND_POSITION.test(positions[index])?1:0)}));
 const domain=resolveTarotDomain(grammar.domain,category,question),narrativeStrategy=resolveSpreadNarrativeStrategy(spread),readingStory=buildReadingStory(narrativeStrategy,positions,enriched);
 const narrativeArcs=buildNarrativeArcs(readingStory);
 const relations=structuralRelations(spread,positions),reinforcingPairs=[],conflictingPairs=[];
 const positionalInterpretations=enriched.map(item=>{const neighborIndices=relations.filter(relation=>relation.indices.includes(item.index)).flatMap(relation=>relation.indices.filter(index=>index!==item.index));return interpretCardInPosition(item.card,{position:item.position,positionSpec:grammar.positions[item.index],spreadType:grammar.narrativeStrategy,spread,domain,secondaryDomains:grammar.secondaryDomains,mode:grammar.mode,purpose:grammar.purpose,neighboringCards:[...new Set(neighborIndices)].map(index=>cards[index]).filter(Boolean),questionContext:question,category,language});});
 const propositionRelations=buildPropositionRelations(grammar,positionalInterpretations,language);
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
 const CENTRAL_THESIS_T={ES:(t,r)=>`La lectura se organiza alrededor de ${t}; ${r}.`,EN:(t,r)=>`The reading is organized around ${t}; ${r}.`,FR:(t,r)=>`La lecture s'organise autour de ${t} ; ${r}.`,DE:(t,r)=>`Die Lesung ordnet sich um ${t}; ${r}.`,PT:(t,r)=>`A leitura se organiza em torno de ${t}; ${r}.`};
 const centralThesis=(CENTRAL_THESIS_T[language]||CENTRAL_THESIS_T.ES)(translateTheme(central.theme,language),central.relationship.toLowerCase());
 const trend=enriched.filter(item=>TREND_POSITION.test(item.position)).map(item=>({card:item.card.name,themes:item.concepts,function:item.positionFunction}));
 const semanticModel={domain,mode:grammar.mode,purpose:grammar.purpose,dominant_theme:central.theme,secondary_themes:secondary.map(item=>item.theme),positionAnswers:positionalInterpretations,position_answers:positionalInterpretations,propositions:positionalInterpretations,relations:propositionRelations,positional_interpretations:positionalInterpretations,central_conflict:conflictingPairs[0]||null,supporting_factors:reinforcingPairs,blocking_factors:enriched.filter(item=>item.card.isReversed||NEGATIVE_POSITION.test(item.position)).map(item=>({position:item.position,card:item.card.name,concepts:item.concepts})),contradictions:conflictingPairs,turning_point:enriched.find(item=>POSSIBILITY_POSITION.test(item.position)||/futuro|umbral|próximo/i.test(item.position))||null,user_agency:enriched.filter(item=>/actitud|consejo|acción|estrategia|tu |yo|mente|emoción/i.test(item.position)).map(item=>item.position),external_factors:enriched.filter(item=>/entorno|otra persona|su energía|mercado|comunidad/i.test(item.position)).map(item=>item.position),probable_direction:trend,uncertainty:conflictingPairs.length?"Hay señales que no avanzan en la misma dirección.":"La lectura conserva el margen propio de una tendencia simbólica.",advice_basis:{conflict:conflictingPairs[0]||null,agency:enriched.filter(item=>/actitud|consejo|acción|estrategia/i.test(item.position)).map(item=>item.card.name),trend:trend.map(item=>item.card)}};
 const structuralWeight={majorArcanaCount,majorArcanaRatio:cards.length?majorArcanaCount/cards.length:0,dominantSuits,missingSuits,repeatedNumbers,repeatedThemes:narrativeClusters.map(x=>x.theme)},fallbackUsed=!grammar.known||grammar.narrativeStrategy==="generic_map";
 const interpretationDebug={spreadStrategy:grammar.narrativeStrategy,domain,mode:grammar.mode,purpose:grammar.purpose,positionAnswers:positionalInterpretations,positionInterpretations:positionalInterpretations,propositions:positionalInterpretations,relationshipsUsed:propositionRelations,patternsDetected:{repeatedThemes:structuralWeight.repeatedThemes,majorArcanaCount,dominantSuits,repeatedNumbers},fallbackUsed};
 if(isKnownSpread(spread)&&fallbackUsed&&typeof console!=="undefined")console.warn(`[tarot] La tirada conocida "${spread}" cayó en una estrategia genérica.`);
 const positionAnswersById=Object.fromEntries(positionalInterpretations.map(item=>[item.positionId,item])),cardsByPositionId=Object.fromEntries(enriched.map(item=>[item.positionId,item.card]));
 return {drawId:resolvedDrawId,context:{spread,category,question,domain,mode:grammar.mode,purpose:grammar.purpose,deck:"Rider–Waite–Smith",orientationEnabled,language},spreadGrammar:grammar,narrativeStrategy,semanticModel,positionAnswers:positionalInterpretations,positionAnswersById,cardsByPositionId,propositions:positionalInterpretations,propositionRelations,positionalInterpretations,readingStory,narrativeArcs,contextualRelations:narrativeArcs.slice(0,4),structuralWeight,positionDynamics:enriched.map(({card,index,positionId,position,positionFunction,concepts,weight})=>({cardId:card.id,card:card.name,index,positionId,position,positionFunction,concepts,weight})),reinforcingPairs,conflictingPairs,narrativeClusters,temporalFlow:relations.filter(x=>/desarrollo|antecedente|futuro|tendencia|consecuencia/.test(x.kind)),internalExternalDynamics:relations.filter(x=>x.kind.includes("interior")),centralTensions:conflictingPairs,centralThesis,secondaryTheses:secondary.map(x=>`${translateTheme(x.theme,language)}: ${x.relationship}`),trendSynthesis:(TREND_SYNTHESIS_T[language]||TREND_SYNTHESIS_T.ES)(trend,language),confidenceNotes:[(CONFIDENCE_NOTE_T[language]||CONFIDENCE_NOTE_T.ES)(central.strength==="high")],interpretationDebug};
}

// Resumen compacto de analyzeTarotReading() pensado para enviarse como contexto a la IA:
// solo lo que ya está verificado (tesis, tensiones, respuesta por posición), nunca los objetos internos de depuración.
export function buildAIBrief(analysis){
 return {
  category:analysis.context.category,
  domain:analysis.context.domain,
  centralThesis:analysis.centralThesis,
  secondaryTheses:analysis.secondaryTheses,
  trendSynthesis:analysis.trendSynthesis,
  positions:analysis.positionAnswers.map(p=>({position:p.position,card:p.cardName,orientation:p.orientation,answer:p.answer})),
  tensions:analysis.conflictingPairs.map(p=>({cards:p.cards,themes:Array.isArray(p.themes)?p.themes:[p.themes].filter(Boolean),reason:p.reason||null})),
  reinforcements:analysis.reinforcingPairs.map(p=>({cards:p.cards,themes:p.themes}))
 };
}

function application(theme,category){const c=normalize(category);if(/amor|relacion|familia/.test(c)){if(theme.includes("vínculo"))return "la reciprocidad y las decisiones afectivas";if(theme.includes("claridad"))return "lo que necesita hablarse o comprobarse";}if(/trabajo|dinero|proyecto/.test(c)){if(theme.includes("vínculo"))return "los acuerdos y la colaboración";if(theme.includes("construcción"))return "la forma de convertir esfuerzo y recursos en resultados";}return `la manera en que se combinan ${theme.replace(" y "," con ")}`;}
function area(position){const key=normalize(position),areas={"yo":"tu manera de posicionarte","recursos":"tu seguridad y tus recursos","comunicacion":"la forma de expresar y entender lo que ocurre","hogar":"tu base, hogar o sensación de pertenencia","creatividad":"tu capacidad de crear y disfrutar","rutinas":"tus hábitos y responsabilidades cotidianas","vinculos":"tus relaciones cercanas","transformacion":"aquello que debe cambiar de raíz","vision":"tu manera de comprender el futuro","vocacion":"tu dirección profesional o vocación","comunidad":"tu relación con grupos y apoyos","inconsciente":"lo que procesas en silencio"};if(areas[key])return areas[key];if(NEGATIVE_POSITION.test(position))return "el punto que hoy complica la situación";if(TREND_POSITION.test(position))return "la dirección que toman las condiciones actuales";if(POSSIBILITY_POSITION.test(position))return "lo que todavía puede desarrollarse";if(/pasado|base|raiz|origen/.test(key))return "lo que sostiene esta situación desde atrás";if(/actitud|mente|emocion|tu energia/.test(key))return "tu forma de responder";if(/entorno|otra persona|su energia/.test(key))return "las circunstancias y respuestas externas";return `el aspecto relacionado con ${position.toLowerCase()}`;}
const AND_WORD={ES:" y ",EN:" and ",FR:" et ",DE:" und ",PT:" e "};
const quality=(card,language="ES")=>card.keys.slice(0,2).join(AND_WORD[language]||AND_WORD.ES);
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
const UPRIGHT_GENERIC_CONNECTORS={
 shadow:{EN:g=>`the pattern that needs to be recognized shows up here: ${g}`,FR:g=>`le schéma qui doit être reconnu apparaît ici : ${g}`,DE:g=>`das Muster, das erkannt werden muss, zeigt sich hier: ${g}`,PT:g=>`o padrão que precisa ser reconhecido aparece aqui: ${g}`},
 learning:{EN:g=>`the experience asks you to understand and accept this: ${g}`,FR:g=>`l'expérience demande de comprendre et d'accepter ceci : ${g}`,DE:g=>`die Erfahrung verlangt, dies zu verstehen und anzunehmen: ${g}`,PT:g=>`a experiência pede compreender e aceitar isto: ${g}`},
 resource:{EN:g=>`this capacity works in your favor: ${g}`,FR:g=>`cette capacité joue en ta faveur : ${g}`,DE:g=>`diese Fähigkeit spielt dir in die Hände: ${g}`,PT:g=>`esta capacidade joga a seu favor: ${g}`},
 ending:{EN:g=>`a stage marked by this is ending: ${g}`,FR:g=>`une étape marquée par ceci touche à sa fin : ${g}`,DE:g=>`eine von diesem Thema geprägte Phase geht zu Ende: ${g}`,PT:g=>`está terminando uma etapa marcada por isto: ${g}`},
 threshold:{EN:g=>`to cross into what's new you need to respond to this: ${g}`,FR:g=>`pour franchir le seuil vers le nouveau, tu dois répondre à ceci : ${g}`,DE:g=>`um in das Neue überzugehen, musst du auf dies antworten: ${g}`,PT:g=>`para atravessar rumo ao novo, você precisa responder a isto: ${g}`},
 beginning:{EN:g=>`a stage is emerging in which ${g}`,FR:g=>`une étape commence à émerger, dans laquelle ${g}`,DE:g=>`es beginnt eine Phase zu entstehen, in der ${g}`,PT:g=>`começa a surgir uma etapa em que ${g}`},
 inflow:{EN:g=>`the inflow of resources is favored when ${g}`,FR:g=>`l'entrée de ressources est favorisée quand ${g}`,DE:g=>`der Zufluss von Ressourcen wird begünstigt, wenn ${g}`,PT:g=>`a entrada de recursos é favorecida quando ${g}`},
 leakage:{EN:g=>`resources are lost, scattered, or blocked when ${g}`,FR:g=>`les ressources se perdent, se dispersent ou se bloquent quand ${g}`,DE:g=>`Ressourcen gehen verloren, zerstreuen sich oder werden blockiert, wenn ${g}`,PT:g=>`os recursos se perdem, dispersam ou bloqueiam quando ${g}`},
 reserve:{EN:g=>`you can conserve or build resources through this capacity: ${g}`,FR:g=>`tu peux conserver ou accumuler des ressources grâce à cette capacité : ${g}`,DE:g=>`du kannst Ressourcen durch diese Fähigkeit bewahren oder ansammeln: ${g}`,PT:g=>`você pode conservar ou acumular recursos mediante esta capacidade: ${g}`},
 movement:{EN:g=>`resources can be put to work when ${g}`,FR:g=>`les ressources peuvent se mettre au travail quand ${g}`,DE:g=>`Ressourcen können in Bewegung gesetzt werden, wenn ${g}`,PT:g=>`os recursos podem se pôr a trabalhar quando ${g}`},
 past:{EN:g=>`you're coming from a stage in which ${g}`,FR:g=>`tu viens d'une étape où ${g}`,DE:g=>`du kommst aus einer Phase, in der ${g}`,PT:g=>`você vem de uma etapa em que ${g}`},
 risk:{EN:g=>`the risk or block appears where ${g}`,FR:g=>`le risque ou le blocage apparaît là où ${g}`,DE:g=>`das Risiko oder die Blockade zeigt sich dort, wo ${g}`,PT:g=>`o risco ou bloqueio aparece onde ${g}`},
 action:{EN:g=>`the most coherent action is that ${g}`,FR:g=>`l'action la plus cohérente consiste à ce que ${g}`,DE:g=>`die stimmigste Handlung besteht darin, dass ${g}`,PT:g=>`a ação mais coerente consiste em que ${g}`},
 opportunity:{EN:g=>`the opportunity arises because ${g}`,FR:g=>`l'opportunité naît parce que ${g}`,DE:g=>`die Gelegenheit entsteht, weil ${g}`,PT:g=>`a oportunidade surge porque ${g}`},
 future:{EN:g=>`the trend suggests that ${g}`,FR:g=>`la tendance suggère que ${g}`,DE:g=>`der Trend legt nahe, dass ${g}`,PT:g=>`a tendência sugere que ${g}`},
 feeling:{EN:g=>`emotionally, ${g}`,FR:g=>`sur le plan émotionnel, ${g}`,DE:g=>`gefühlsmäßig ${g}`,PT:g=>`emocionalmente, ${g}`},
 thought:{EN:g=>`mentally, ${g}`,FR:g=>`mentalement, ${g}`,DE:g=>`gedanklich ${g}`,PT:g=>`mentalmente, ${g}`},
};
function uprightGenericFallback(intent,general,language){
 if(language&&language!=="ES"){const entry=UPRIGHT_GENERIC_CONNECTORS[intent];if(entry?.[language])return entry[language](general);}
 if(intent==="shadow")return `el patrón que necesita reconocerse aparece aquí: ${general}`;if(intent==="learning")return `la experiencia pide comprender y aceptar esto: ${general}`;if(intent==="resource")return `juega a tu favor esta capacidad: ${general}`;if(intent==="ending")return `está terminando una etapa marcada por esto: ${general}`;if(intent==="threshold")return `para cruzar hacia lo nuevo necesitas responder a esto: ${general}`;if(intent==="beginning")return `empieza a surgir una etapa en la que ${general}`;if(intent==="inflow")return `la entrada de recursos se favorece cuando ${general}`;if(intent==="leakage")return `los recursos se pierden, dispersan o bloquean cuando ${general}`;if(intent==="reserve")return `puedes conservar o acumular recursos mediante esta capacidad: ${general}`;if(intent==="movement")return `los recursos pueden ponerse a trabajar cuando ${general}`;if(intent==="past")return `vienes de una etapa en la que ${general}`;if(intent==="risk")return `el riesgo o bloqueo aparece donde ${general}`;if(intent==="action")return `la acción más coherente consiste en que ${general}`;if(intent==="opportunity")return `la oportunidad surge porque ${general}`;if(intent==="future")return `la tendencia sugiere que ${general}`;if(intent==="feeling")return `emocionalmente, ${general}`;if(intent==="thought")return `mentalmente, ${general}`;return general;
}
const SPECIAL_CARD_BRANCHES={
 "06":{ES:{shadow:"la dificultad para elegir, la búsqueda de validación o el intento de conservar opciones incompatibles está creando ambivalencia entre deseo y valores",learning:"el aprendizaje consiste en elegir desde valores claros y aceptar que decidir también implica renunciar a una alternativa",resource:"tu capacidad para reconocer lo que valoras y comprometerte con una elección consciente juega a tu favor",feeling:"hay atracción o una conexión emocional real, aunque esos sentimientos también obligan a decidir qué lugar darles",thought:"la mente está valorando una elección importante y compara lo que desea con lo que considera correcto",action:"la acción dependerá de una elección clara; no bastará con mantener abiertas todas las posibilidades",risk:"el riesgo está en decidir sólo desde el deseo o en evitar una elección que ya pide definición",default:"aparece una elección importante que debe respetar tanto los valores personales como la realidad del vínculo o acuerdo"},
  EN:{shadow:"the difficulty choosing, the search for validation, or trying to keep incompatible options open is creating ambivalence between desire and values",learning:"the lesson is to choose from clear values and accept that deciding also means giving up an alternative",resource:"your ability to recognize what you value and commit to a conscious choice works in your favor",feeling:"there's real attraction or emotional connection, though those feelings also demand deciding what place to give them",thought:"the mind is weighing an important choice and comparing what it wants with what it considers right",action:"the action will depend on a clear choice; keeping every option open won't be enough",risk:"the risk is deciding purely from desire, or avoiding a choice that's already asking to be made",default:"an important choice appears, one that must respect both personal values and the reality of the bond or agreement"},
  FR:{shadow:"la difficulté à choisir, la recherche de validation ou la tentative de conserver des options incompatibles crée une ambivalence entre désir et valeurs",learning:"l'apprentissage consiste à choisir depuis des valeurs claires et à accepter que décider implique aussi de renoncer à une alternative",resource:"ta capacité à reconnaître ce que tu valorises et à t'engager dans un choix conscient joue en ta faveur",feeling:"il y a une attraction ou une connexion émotionnelle réelle, bien que ces sentiments obligent aussi à décider quelle place leur donner",thought:"l'esprit évalue un choix important et compare ce qu'il désire avec ce qu'il considère juste",action:"l'action dépendra d'un choix clair ; il ne suffira pas de garder toutes les possibilités ouvertes",risk:"le risque est de décider uniquement depuis le désir, ou d'éviter un choix qui demande déjà à être défini",default:"un choix important apparaît, qui doit respecter à la fois les valeurs personnelles et la réalité du lien ou de l'accord"},
  DE:{shadow:"die Schwierigkeit zu wählen, die Suche nach Bestätigung oder der Versuch, unvereinbare Optionen offen zu halten, erzeugt Ambivalenz zwischen Verlangen und Werten",learning:"das Lernen besteht darin, aus klaren Werten zu wählen und zu akzeptieren, dass Entscheiden auch bedeutet, auf eine Alternative zu verzichten",resource:"deine Fähigkeit, das zu erkennen, was du schätzt, und dich für eine bewusste Wahl zu verpflichten, spielt dir in die Hände",feeling:"es gibt echte Anziehung oder eine emotionale Verbindung, auch wenn diese Gefühle dazu zwingen zu entscheiden, welchen Platz man ihnen gibt",thought:"der Geist wägt eine wichtige Wahl ab und vergleicht, was er begehrt, mit dem, was er für richtig hält",action:"das Handeln hängt von einer klaren Wahl ab; alle Möglichkeiten offen zu halten wird nicht genügen",risk:"das Risiko besteht darin, nur aus Verlangen zu entscheiden oder eine Wahl zu vermeiden, die bereits nach Klärung verlangt",default:"eine wichtige Wahl erscheint, die sowohl die persönlichen Werte als auch die Realität der Bindung oder Vereinbarung berücksichtigen muss"},
  PT:{shadow:"a dificuldade para escolher, a busca por validação ou a tentativa de conservar opções incompatíveis está criando ambivalência entre desejo e valores",learning:"o aprendizado consiste em escolher a partir de valores claros e aceitar que decidir também implica renunciar a uma alternativa",resource:"sua capacidade de reconhecer o que valoriza e se comprometer com uma escolha consciente joga a seu favor",feeling:"há atração ou uma conexão emocional real, embora esses sentimentos também obriguem a decidir que lugar dar a eles",thought:"a mente está avaliando uma escolha importante e compara o que deseja com o que considera correto",action:"a ação dependerá de uma escolha clara; não bastará manter todas as possibilidades abertas",risk:"o risco está em decidir apenas a partir do desejo ou em evitar uma escolha que já pede definição",default:"aparece uma escolha importante que deve respeitar tanto os valores pessoais quanto a realidade do vínculo ou acordo"}},
 "01":{ES:{thought:"mentalmente hay iniciativa: se considera posible hablar, acercarse o provocar un cambio en la situación",action:"hay recursos para intervenir y convertir una intención en un paso concreto",risk:"el riesgo está en confiar demasiado en la propia habilidad o usar los recursos sin una dirección definida",opportunity:"la oportunidad consiste en utilizar capacidades que ya están disponibles y darles una aplicación concreta",default:"existen iniciativa y recursos suficientes para intervenir, siempre que se utilicen con una intención clara"},
  EN:{thought:"mentally there's initiative: it feels possible to speak up, reach out, or provoke a change in the situation",action:"there are resources to step in and turn an intention into a concrete step",risk:"the risk is trusting your own skill too much, or using resources without a clear direction",opportunity:"the opportunity lies in using capacities that are already available and giving them a concrete application",default:"there's enough initiative and resources to intervene, as long as they're used with clear intention"},
  FR:{thought:"mentalement, il y a de l'initiative : il semble possible de parler, de se rapprocher ou de provoquer un changement dans la situation",action:"il y a des ressources pour intervenir et transformer une intention en un pas concret",risk:"le risque est de trop se fier à sa propre habileté ou d'utiliser les ressources sans direction définie",opportunity:"l'opportunité consiste à utiliser des capacités déjà disponibles et à leur donner une application concrète",default:"il existe suffisamment d'initiative et de ressources pour intervenir, à condition de les utiliser avec une intention claire"},
  DE:{thought:"gedanklich gibt es Initiative: Es erscheint möglich, zu sprechen, sich anzunähern oder eine Veränderung in der Situation herbeizuführen",action:"es gibt Ressourcen, um einzugreifen und eine Absicht in einen konkreten Schritt zu verwandeln",risk:"das Risiko besteht darin, zu sehr auf die eigene Fähigkeit zu vertrauen oder Ressourcen ohne klare Richtung einzusetzen",opportunity:"die Gelegenheit besteht darin, bereits verfügbare Fähigkeiten zu nutzen und ihnen eine konkrete Anwendung zu geben",default:"es gibt genug Initiative und Ressourcen, um einzugreifen, solange sie mit klarer Absicht eingesetzt werden"},
  PT:{thought:"mentalmente há iniciativa: considera-se possível falar, se aproximar ou provocar uma mudança na situação",action:"há recursos para intervir e converter uma intenção em um passo concreto",risk:"o risco está em confiar demais na própria habilidade ou usar os recursos sem uma direção definida",opportunity:"a oportunidade consiste em utilizar capacidades que já estão disponíveis e dar a elas uma aplicação concreta",default:"existem iniciativa e recursos suficientes para intervir, desde que sejam utilizados com intenção clara"}},
 "10":{ES:{action:"la situación probablemente se moverá y puede haber un acercamiento o giro inesperado, aunque no todo dependerá exclusivamente de una persona",future:"se aproxima un giro que puede abrir posibilidades nuevas, pero su forma concreta dependerá también de circunstancias externas",risk:"el riesgo está en dejar una decisión importante enteramente en manos del azar o de circunstancias cambiantes",opportunity:"un cambio de circunstancias puede abrir una oportunidad que hasta ahora no estaba disponible",default:"las circunstancias empiezan a girar y exigen adaptarse a un movimiento que no puede controlarse por completo"},
  EN:{action:"the situation will likely shift, and there could be an unexpected approach or turn, though not everything will depend on one person alone",future:"a turn is approaching that may open new possibilities, but its concrete shape will also depend on outside circumstances",risk:"the risk is leaving an important decision entirely in the hands of chance or shifting circumstances",opportunity:"a change in circumstances may open an opportunity that wasn't available until now",default:"circumstances are starting to turn and demand adapting to a movement that can't be fully controlled"},
  FR:{action:"la situation va probablement bouger, et il pourrait y avoir un rapprochement ou un revirement inattendu, bien que tout ne dépende pas d'une seule personne",future:"un tournant approche qui peut ouvrir de nouvelles possibilités, mais sa forme concrète dépendra aussi de circonstances extérieures",risk:"le risque est de laisser une décision importante entièrement entre les mains du hasard ou de circonstances changeantes",opportunity:"un changement de circonstances peut ouvrir une opportunité qui n'était pas disponible jusqu'à présent",default:"les circonstances commencent à tourner et exigent de s'adapter à un mouvement qui ne peut pas être entièrement contrôlé"},
  DE:{action:"die Situation wird sich wahrscheinlich verändern, und es könnte eine unerwartete Annäherung oder Wendung geben, obwohl nicht alles von einer einzigen Person abhängt",future:"eine Wendung nähert sich, die neue Möglichkeiten eröffnen kann, deren konkrete Form aber auch von äußeren Umständen abhängt",risk:"das Risiko besteht darin, eine wichtige Entscheidung ganz dem Zufall oder wechselnden Umständen zu überlassen",opportunity:"eine Veränderung der Umstände kann eine Gelegenheit eröffnen, die bisher nicht verfügbar war",default:"die Umstände beginnen sich zu drehen und verlangen Anpassung an eine Bewegung, die sich nicht vollständig kontrollieren lässt"},
  PT:{action:"a situação provavelmente vai se mover e pode haver uma aproximação ou uma reviravolta inesperada, embora nem tudo dependa exclusivamente de uma pessoa",future:"aproxima-se uma reviravolta que pode abrir novas possibilidades, mas sua forma concreta também dependerá de circunstâncias externas",risk:"o risco está em deixar uma decisão importante inteiramente nas mãos do acaso ou de circunstâncias mutáveis",opportunity:"uma mudança de circunstâncias pode abrir uma oportunidade que até agora não estava disponível",default:"as circunstâncias começam a girar e exigem adaptar-se a um movimento que não pode ser controlado por completo"}},
 "17":{ES:{opportunity:"existe una oportunidad prometedora para recuperar confianza, inspiración y una dirección más auténtica",risk:"el riesgo está en idealizar una señal favorable y tratar la esperanza como si ya fuera una confirmación",future:"la tendencia favorece una recuperación gradual de la confianza y una visión más clara del camino",default:"empieza a recuperarse la confianza en una dirección que antes parecía debilitada"},
  EN:{opportunity:"there's a promising opportunity to recover confidence, inspiration, and a more authentic direction",risk:"the risk is idealizing a favorable sign and treating hope as if it were already confirmation",future:"the trend favors a gradual recovery of confidence and a clearer view of the path",default:"confidence begins to recover in a direction that had seemed weakened before"},
  FR:{opportunity:"il existe une opportunité prometteuse de retrouver confiance, inspiration et une direction plus authentique",risk:"le risque est d'idéaliser un signe favorable et de traiter l'espoir comme s'il s'agissait déjà d'une confirmation",future:"la tendance favorise une récupération progressive de la confiance et une vision plus claire du chemin",default:"la confiance commence à se rétablir dans une direction qui semblait auparavant affaiblie"},
  DE:{opportunity:"es gibt eine vielversprechende Gelegenheit, Vertrauen, Inspiration und eine authentischere Richtung zurückzugewinnen",risk:"das Risiko besteht darin, ein günstiges Zeichen zu idealisieren und Hoffnung zu behandeln, als wäre sie bereits eine Bestätigung",future:"der Trend begünstigt eine allmähliche Rückgewinnung des Vertrauens und einen klareren Blick auf den Weg",default:"das Vertrauen beginnt sich in einer Richtung zu erholen, die zuvor geschwächt schien"},
  PT:{opportunity:"existe uma oportunidade promissora para recuperar confiança, inspiração e uma direção mais autêntica",risk:"o risco está em idealizar um sinal favorável e tratar a esperança como se já fosse uma confirmação",future:"a tendência favorece uma recuperação gradual da confiança e uma visão mais clara do caminho",default:"a confiança começa a se recuperar numa direção que antes parecia enfraquecida"}},
 "00":{ES:{risk:"el principal riesgo es precipitarse, confiar en exceso o comenzar sin conocer suficientemente el terreno y sus consecuencias",action:"la acción tiende a ser espontánea y puede iniciar algo nuevo, aunque necesita una mínima conciencia de sus consecuencias",opportunity:"la oportunidad permite comenzar de otra manera, con libertad para explorar un terreno nuevo",future:"se abre un comienzo distinto, todavía incierto, que ofrece libertad pero exige mirar por dónde se avanza",default:"se abre un camino nuevo que invita a avanzar, sin confundir libertad con ausencia de consecuencias"},
  EN:{risk:"the main risk is rushing in, trusting too much, or starting without knowing enough about the terrain and its consequences",action:"the action tends to be spontaneous and can start something new, though it needs at least some awareness of its consequences",opportunity:"the opportunity allows for a different kind of beginning, with freedom to explore new terrain",future:"a different, still uncertain start is opening up, one that offers freedom but requires watching where you're going",default:"a new path opens up that invites moving forward, without confusing freedom with an absence of consequences"},
  FR:{risk:"le principal risque est de se précipiter, de trop se fier à soi-même ou de commencer sans connaître suffisamment le terrain et ses conséquences",action:"l'action tend à être spontanée et peut initier quelque chose de nouveau, bien qu'elle ait besoin d'une conscience minimale de ses conséquences",opportunity:"l'opportunité permet de commencer autrement, avec la liberté d'explorer un terrain nouveau",future:"un commencement différent s'ouvre, encore incertain, qui offre la liberté mais exige de regarder où l'on avance",default:"un chemin nouveau s'ouvre qui invite à avancer, sans confondre liberté et absence de conséquences"},
  DE:{risk:"das Hauptrisiko besteht darin, überstürzt zu handeln, sich zu sehr zu vertrauen oder zu beginnen, ohne das Terrain und seine Folgen ausreichend zu kennen",action:"das Handeln tendiert dazu, spontan zu sein und kann etwas Neues beginnen, braucht aber ein Mindestmaß an Bewusstsein für seine Folgen",opportunity:"die Gelegenheit erlaubt einen anderen Anfang, mit Freiheit, neues Terrain zu erkunden",future:"ein anderer, noch ungewisser Anfang eröffnet sich, der Freiheit bietet, aber verlangt, darauf zu achten, wohin man geht",default:"ein neuer Weg eröffnet sich, der zum Vorangehen einlädt, ohne Freiheit mit Konsequenzlosigkeit zu verwechseln"},
  PT:{risk:"o principal risco é precipitar-se, confiar em excesso ou começar sem conhecer suficientemente o terreno e suas consequências",action:"a ação tende a ser espontânea e pode iniciar algo novo, embora precise de uma consciência mínima de suas consequências",opportunity:"a oportunidade permite começar de outra maneira, com liberdade para explorar um terreno novo",future:"abre-se um começo distinto, ainda incerto, que oferece liberdade, mas exige observar por onde se avança",default:"abre-se um caminho novo que convida a avançar, sem confundir liberdade com ausência de consequências"}},
 "02":{ES:{action:"la mejor estrategia es observar antes de actuar, reunir información y reservar lo importante hasta comprender mejor el terreno",thought:"hay pensamientos que todavía se mantienen en reserva; se observa más de lo que se expresa",feeling:"los sentimientos son profundos pero contenidos y no parecen mostrarse por completo",risk:"el silencio o la información incompleta pueden convertirse en el principal punto ciego",default:"hay algo que todavía necesita observarse en silencio antes de revelarse o convertirse en acción"},
  EN:{action:"the best strategy is to observe before acting, gather information, and hold back what matters until the terrain is better understood",thought:"some thoughts are still being held back; there's more observing happening than expressing",feeling:"feelings are deep but contained, and don't seem to fully show themselves",risk:"silence or incomplete information can become the main blind spot",default:"something still needs to be observed quietly before it's revealed or turned into action"},
  FR:{action:"la meilleure stratégie est d'observer avant d'agir, de rassembler des informations et de garder l'essentiel en réserve jusqu'à mieux comprendre le terrain",thought:"certaines pensées restent encore en réserve ; on observe plus qu'on ne s'exprime",feeling:"les sentiments sont profonds mais contenus et ne semblent pas se montrer complètement",risk:"le silence ou une information incomplète peuvent devenir le principal angle mort",default:"quelque chose a encore besoin d'être observé en silence avant de se révéler ou de se transformer en action"},
  DE:{action:"die beste Strategie ist zu beobachten, bevor man handelt, Informationen zu sammeln und das Wichtige zurückzuhalten, bis das Terrain besser verstanden ist",thought:"manche Gedanken werden noch zurückgehalten; es wird mehr beobachtet als ausgedrückt",feeling:"die Gefühle sind tief, aber zurückgehalten, und scheinen sich nicht vollständig zu zeigen",risk:"Schweigen oder unvollständige Information können zum blinden Fleck werden",default:"etwas muss noch still beobachtet werden, bevor es sich offenbart oder zu Handeln wird"},
  PT:{action:"a melhor estratégia é observar antes de agir, reunir informação e reservar o importante até compreender melhor o terreno",thought:"há pensamentos que ainda se mantêm em reserva; observa-se mais do que se expressa",feeling:"os sentimentos são profundos, mas contidos, e não parecem se mostrar por completo",risk:"o silêncio ou a informação incompleta podem se tornar o principal ponto cego",default:"há algo que ainda precisa ser observado em silêncio antes de se revelar ou se converter em ação"}},
 "09":{ES:{past:"vienes de un periodo de introspección en el que necesitaste tomar distancia y encontrar tus propias respuestas antes de avanzar",risk:"el exceso de análisis, la demora o el aislamiento pueden estar dificultando una respuesta que ya necesita salir al mundo",action:"conviene tomar distancia del ruido y pensar antes de decidir, sin convertir la prudencia en aislamiento",future:"se aproxima una etapa de reflexión que puede exigir distancia y una respuesta menos influida por opiniones externas",external:"el entorno ofrece pocas respuestas inmediatas y parece mantener distancia o silencio",default:"necesitas reducir el ruido externo y encontrar una respuesta propia antes de avanzar"},
  EN:{past:"you're coming from a period of introspection where you needed distance to find your own answers before moving forward",risk:"overanalyzing, delay, or isolation may be making it harder for an answer that already needs to come out into the world",action:"it's worth stepping back from the noise and thinking before deciding, without turning caution into isolation",future:"a stage of reflection is approaching that may call for distance and a response less shaped by outside opinions",external:"the environment offers few immediate answers and seems to keep its distance or stay silent",default:"you need to reduce outside noise and find your own answer before moving forward"},
  FR:{past:"tu viens d'une période d'introspection où tu as eu besoin de prendre du recul pour trouver tes propres réponses avant d'avancer",risk:"l'excès d'analyse, le retard ou l'isolement peuvent compliquer une réponse qui a déjà besoin de sortir au grand jour",action:"il convient de prendre du recul par rapport au bruit et de réfléchir avant de décider, sans transformer la prudence en isolement",future:"une étape de réflexion approche, qui peut exiger de la distance et une réponse moins influencée par des opinions extérieures",external:"l'environnement offre peu de réponses immédiates et semble garder ses distances ou le silence",default:"tu dois réduire le bruit extérieur et trouver ta propre réponse avant d'avancer"},
  DE:{past:"du kommst aus einer Phase der Innenschau, in der du Abstand brauchtest, um eigene Antworten zu finden, bevor du weitergehst",risk:"übermäßige Analyse, Verzögerung oder Isolation können eine Antwort erschweren, die bereits an die Öffentlichkeit muss",action:"es lohnt sich, Abstand vom Lärm zu nehmen und nachzudenken, bevor man entscheidet, ohne Vorsicht zu Isolation werden zu lassen",future:"eine Phase der Reflexion nähert sich, die Distanz und eine weniger von fremden Meinungen geprägte Antwort verlangen kann",external:"das Umfeld bietet wenige unmittelbare Antworten und scheint Distanz oder Schweigen zu wahren",default:"du musst äußeren Lärm verringern und eine eigene Antwort finden, bevor du weitergehst"},
  PT:{past:"você vem de um período de introspecção em que precisou tomar distância e encontrar suas próprias respostas antes de avançar",risk:"o excesso de análise, a demora ou o isolamento podem estar dificultando uma resposta que já precisa sair ao mundo",action:"convém tomar distância do ruído e pensar antes de decidir, sem transformar a prudência em isolamento",future:"aproxima-se uma etapa de reflexão que pode exigir distância e uma resposta menos influenciada por opiniões externas",external:"o ambiente oferece poucas respostas imediatas e parece manter distância ou silêncio",default:"você precisa reduzir o ruído externo e encontrar uma resposta própria antes de avançar"}},
 "13":{ES:{learning:"el aprendizaje consiste en aceptar un final, soltar una identidad o dinámica agotada y permitir una transformación real",resource:"tu capacidad de cerrar, soltar y reorganizarte ante un cambio profundo juega a tu favor",ending:"está terminando una etapa que ya cumplió su función y necesita dejar espacio a otra forma",threshold:"para cruzar hacia lo nuevo necesitas aceptar que una forma anterior ya terminó y no puede conservarse intacta",beginning:"lo nuevo surge después de una depuración profunda y no podrá construirse con la misma forma que acaba de terminar",past:"vienes de un cierre importante que cambió la forma anterior de la situación y dejó algo definitivamente atrás",risk:"la resistencia a cerrar una etapa puede prolongar una forma que ya perdió vigencia",future:"la tendencia conduce hacia un cierre y una reorganización profunda de lo que todavía puede continuar",default:"una etapa está terminando y obliga a distinguir qué debe cerrarse de lo que puede renovarse"},
  EN:{learning:"the lesson is to accept an ending, let go of an identity or dynamic that's run its course, and allow a real transformation",resource:"your ability to close, release, and reorganize in the face of deep change works in your favor",ending:"a stage that already served its purpose is ending and needs to make room for another shape",threshold:"to cross into the new, you need to accept that an earlier form has already ended and can't be kept intact",beginning:"the new emerges after a deep clearing out, and can't be built in the same shape that just ended",past:"you're coming from an important closure that changed the earlier shape of the situation and left something definitively behind",risk:"resisting the end of a stage can prolong a form that's already lost its relevance",future:"the trend leads toward a closure and a deep reorganization of what can still continue",default:"a stage is ending, and it calls for telling apart what must close from what can be renewed"},
  FR:{learning:"l'apprentissage consiste à accepter une fin, à lâcher une identité ou une dynamique épuisée et à permettre une véritable transformation",resource:"ta capacité à clore, lâcher prise et te réorganiser face à un changement profond joue en ta faveur",ending:"une étape qui a déjà rempli sa fonction se termine et doit laisser place à une autre forme",threshold:"pour passer vers le nouveau, tu dois accepter qu'une forme antérieure s'est déjà achevée et ne peut être conservée intacte",beginning:"le nouveau émerge après une profonde épuration et ne pourra pas se construire sous la même forme qui vient de se terminer",past:"tu viens d'une clôture importante qui a changé la forme antérieure de la situation et laissé définitivement quelque chose derrière toi",risk:"la résistance à clore une étape peut prolonger une forme qui a déjà perdu sa pertinence",future:"la tendance conduit vers une clôture et une profonde réorganisation de ce qui peut encore continuer",default:"une étape se termine et oblige à distinguer ce qui doit se clore de ce qui peut se renouveler"},
  DE:{learning:"das Lernen besteht darin, ein Ende zu akzeptieren, eine erschöpfte Identität oder Dynamik loszulassen und eine echte Verwandlung zuzulassen",resource:"deine Fähigkeit, abzuschließen, loszulassen und dich angesichts eines tiefgreifenden Wandels neu zu ordnen, spielt dir in die Hände",ending:"eine Phase, die ihre Funktion bereits erfüllt hat, geht zu Ende und muss einer anderen Form Platz machen",threshold:"um in das Neue überzugehen, musst du akzeptieren, dass eine frühere Form bereits geendet hat und nicht intakt bewahrt werden kann",beginning:"das Neue entsteht nach einer tiefen Läuterung und kann nicht in derselben Form aufgebaut werden, die gerade geendet hat",past:"du kommst aus einem wichtigen Abschluss, der die frühere Form der Situation veränderte und etwas endgültig zurückließ",risk:"der Widerstand, eine Phase abzuschließen, kann eine Form verlängern, die bereits ihre Gültigkeit verloren hat",future:"der Trend führt zu einem Abschluss und einer tiefgreifenden Neuordnung dessen, was noch weitergehen kann",default:"eine Phase geht zu Ende und verlangt zu unterscheiden, was abgeschlossen werden muss, von dem, was erneuert werden kann"},
  PT:{learning:"o aprendizado consiste em aceitar um final, soltar uma identidade ou dinâmica esgotada e permitir uma transformação real",resource:"sua capacidade de encerrar, soltar e se reorganizar diante de uma mudança profunda joga a seu favor",ending:"está terminando uma etapa que já cumpriu sua função e precisa deixar espaço para outra forma",threshold:"para atravessar rumo ao novo, você precisa aceitar que uma forma anterior já terminou e não pode ser conservada intacta",beginning:"o novo surge depois de uma depuração profunda e não poderá se construir com a mesma forma que acaba de terminar",past:"você vem de um encerramento importante que mudou a forma anterior da situação e deixou algo definitivamente para trás",risk:"a resistência a encerrar uma etapa pode prolongar uma forma que já perdeu vigência",future:"a tendência conduz a um encerramento e uma reorganização profunda do que ainda pode continuar",default:"uma etapa está terminando e obriga a distinguir o que deve se encerrar do que pode se renovar"}},
 "20":{ES:{resource:"cuentas con la capacidad de reconocer la verdad, revisar el pasado con conciencia y tomar una decisión definitiva",learning:"el aprendizaje consiste en escuchar el llamado que surge de lo vivido y responder con una decisión consciente",shadow:"evitar una evaluación honesta del pasado o esperar validación externa está retrasando una decisión necesaria",action:"es momento de reconocer lo aprendido, responder al llamado y tomar una decisión que cierre la indecisión",future:"se acerca una evaluación decisiva que puede traer despertar, claridad y una segunda oportunidad",default:"una verdad del pasado pide ser reconocida para despertar y decidir con mayor conciencia"},
  EN:{resource:"you have the capacity to recognize the truth, review the past with awareness, and make a definitive decision",learning:"the lesson is to listen to the call that arises from what you've lived and respond with a conscious decision",shadow:"avoiding an honest look at the past or waiting for outside validation is delaying a decision that's needed",action:"it's time to recognize what you've learned, answer the call, and make a decision that ends the indecision",future:"a decisive evaluation is approaching that can bring awakening, clarity, and a second chance",default:"a truth from the past is asking to be recognized in order to awaken and decide with greater awareness"},
  FR:{resource:"tu as la capacité de reconnaître la vérité, de revoir le passé en conscience et de prendre une décision définitive",learning:"l'apprentissage consiste à écouter l'appel qui surgit de ce qui a été vécu et à répondre par une décision consciente",shadow:"éviter une évaluation honnête du passé ou attendre une validation extérieure retarde une décision nécessaire",action:"il est temps de reconnaître ce qui a été appris, de répondre à l'appel et de prendre une décision qui mette fin à l'indécision",future:"une évaluation décisive approche, qui peut apporter éveil, clarté et une seconde chance",default:"une vérité du passé demande à être reconnue pour s'éveiller et décider avec plus de conscience"},
  DE:{resource:"du hast die Fähigkeit, die Wahrheit zu erkennen, die Vergangenheit bewusst zu überprüfen und eine endgültige Entscheidung zu treffen",learning:"das Lernen besteht darin, dem Ruf zuzuhören, der aus dem Erlebten entsteht, und mit einer bewussten Entscheidung zu antworten",shadow:"eine ehrliche Bewertung der Vergangenheit zu vermeiden oder auf äußere Bestätigung zu warten, verzögert eine notwendige Entscheidung",action:"es ist Zeit, das Gelernte anzuerkennen, dem Ruf zu antworten und eine Entscheidung zu treffen, die die Unentschlossenheit beendet",future:"eine entscheidende Bewertung nähert sich, die Erwachen, Klarheit und eine zweite Chance bringen kann",default:"eine Wahrheit aus der Vergangenheit verlangt Anerkennung, um zu erwachen und mit größerem Bewusstsein zu entscheiden"},
  PT:{resource:"você conta com a capacidade de reconhecer a verdade, revisar o passado com consciência e tomar uma decisão definitiva",learning:"o aprendizado consiste em escutar o chamado que surge do vivido e responder com uma decisão consciente",shadow:"evitar uma avaliação honesta do passado ou esperar validação externa está atrasando uma decisão necessária",action:"é hora de reconhecer o aprendido, responder ao chamado e tomar uma decisão que encerre a indecisão",future:"aproxima-se uma avaliação decisiva que pode trazer despertar, clareza e uma segunda oportunidade",default:"uma verdade do passado pede para ser reconhecida a fim de despertar e decidir com mais consciência"}},
 "14":{ES:{risk:"el riesgo está en sostener demasiado tiempo una situación desigual o confundir equilibrio con inmovilidad",action:"la respuesta más sensata es combinar los elementos gradualmente y corregir los excesos antes de avanzar",default:"la situación busca un punto medio entre fuerzas distintas y necesita ajustes graduales para no producir desgaste"},
  EN:{risk:"the risk is holding onto an unequal situation for too long, or confusing balance with standing still",action:"the wisest response is to combine elements gradually and correct excesses before moving forward",default:"the situation is looking for a middle point between different forces and needs gradual adjustments to avoid wearing itself out"},
  FR:{risk:"le risque est de maintenir trop longtemps une situation inégale ou de confondre équilibre et immobilité",action:"la réponse la plus sensée est de combiner les éléments progressivement et de corriger les excès avant d'avancer",default:"la situation cherche un juste milieu entre des forces différentes et a besoin d'ajustements progressifs pour ne pas s'épuiser"},
  DE:{risk:"das Risiko besteht darin, eine ungleiche Situation zu lange aufrechtzuerhalten oder Gleichgewicht mit Stillstand zu verwechseln",action:"die klügste Antwort ist, die Elemente schrittweise zu kombinieren und Übermaß zu korrigieren, bevor man weitergeht",default:"die Situation sucht einen Mittelweg zwischen unterschiedlichen Kräften und braucht schrittweise Anpassungen, um keinen Verschleiß zu erzeugen"},
  PT:{risk:"o risco está em sustentar por tempo demais uma situação desigual ou confundir equilíbrio com imobilidade",action:"a resposta mais sensata é combinar os elementos gradualmente e corrigir os excessos antes de avançar",default:"a situação busca um ponto médio entre forças distintas e precisa de ajustes graduais para não produzir desgaste"}},
 "pe-8":{ES:{future:"lo que se construya dependerá menos de un golpe de suerte que de la constancia, la práctica y el cuidado de los detalles",risk:"el riesgo está en repetir esfuerzo sin corregir la técnica o perderse en detalles que no mejoran el resultado",action:"la estrategia pide trabajo constante, atención y corrección paciente de lo que todavía no funciona",default:"el progreso se sostiene con práctica, constancia y cuidado de los detalles"},
  EN:{future:"what gets built will depend less on a stroke of luck than on consistency, practice, and attention to detail",risk:"the risk is repeating effort without correcting technique, or getting lost in details that don't improve the result",action:"the strategy calls for steady work, attention, and patiently correcting what still isn't working",default:"progress is sustained through practice, consistency, and attention to detail"},
  FR:{future:"ce qui se construira dépendra moins d'un coup de chance que de la constance, de la pratique et du soin apporté aux détails",risk:"le risque est de répéter l'effort sans corriger la technique ou de se perdre dans des détails qui n'améliorent pas le résultat",action:"la stratégie demande un travail constant, de l'attention et une correction patiente de ce qui ne fonctionne pas encore",default:"le progrès se soutient par la pratique, la constance et le soin apporté aux détails"},
  DE:{future:"was entsteht, hängt weniger von einem Glücksfall ab als von Beständigkeit, Übung und Sorgfalt für Details",risk:"das Risiko besteht darin, Anstrengung zu wiederholen, ohne die Technik zu korrigieren, oder sich in Details zu verlieren, die das Ergebnis nicht verbessern",action:"die Strategie verlangt beständige Arbeit, Aufmerksamkeit und geduldige Korrektur dessen, was noch nicht funktioniert",default:"Fortschritt wird durch Übung, Beständigkeit und Sorgfalt für Details getragen"},
  PT:{future:"o que se construir dependerá menos de um golpe de sorte do que de constância, prática e cuidado com os detalhes",risk:"o risco está em repetir esforço sem corrigir a técnica ou se perder em detalhes que não melhoram o resultado",action:"a estratégia pede trabalho constante, atenção e correção paciente do que ainda não funciona",default:"o progresso se sustenta com prática, constância e cuidado com os detalhes"}},
 "sw-ace":{ES:{action:"es momento de formular una decisión clara, hacer la pregunta directa o cortar aquello que mantiene la confusión",risk:"el riesgo está en usar una verdad de forma tajante o decidir antes de comprender todos los hechos",opportunity:"la oportunidad consiste en obtener claridad, nombrar el problema y tomar una decisión mejor informada",default:"empieza a entrar claridad y con ella la posibilidad de definir el problema sin seguir rodeándolo"},
  EN:{action:"it's time to make a clear decision, ask the direct question, or cut through whatever is keeping the confusion alive",risk:"the risk is wielding a truth too bluntly, or deciding before understanding all the facts",opportunity:"the opportunity lies in gaining clarity, naming the problem, and making a better-informed decision",default:"clarity is starting to come in, and with it the chance to define the problem instead of continuing to circle it"},
  FR:{action:"il est temps de formuler une décision claire, de poser la question directe ou de trancher ce qui entretient la confusion",risk:"le risque est d'utiliser une vérité de façon trop tranchante ou de décider avant de comprendre tous les faits",opportunity:"l'opportunité consiste à obtenir de la clarté, nommer le problème et prendre une décision mieux informée",default:"la clarté commence à s'installer, et avec elle la possibilité de définir le problème sans continuer à tourner autour"},
  DE:{action:"es ist Zeit, eine klare Entscheidung zu treffen, die direkte Frage zu stellen oder das zu durchtrennen, was die Verwirrung aufrechterhält",risk:"das Risiko besteht darin, eine Wahrheit zu schroff einzusetzen oder zu entscheiden, bevor alle Fakten verstanden sind",opportunity:"die Gelegenheit besteht darin, Klarheit zu gewinnen, das Problem zu benennen und eine besser informierte Entscheidung zu treffen",default:"Klarheit beginnt sich einzustellen, und mit ihr die Möglichkeit, das Problem zu definieren, statt weiter darum herumzugehen"},
  PT:{action:"é hora de formular uma decisão clara, fazer a pergunta direta ou cortar aquilo que mantém a confusão",risk:"o risco está em usar uma verdade de forma cortante ou decidir antes de compreender todos os fatos",opportunity:"a oportunidade consiste em obter clareza, nomear o problema e tomar uma decisão mais bem informada",default:"começa a entrar clareza e, com ela, a possibilidade de definir o problema sem continuar rodeando-o"}},
 "cu-2":{ES:{feeling:"hay apertura emocional y deseo de encuentro, con potencial para una respuesta recíproca",thought:"se piensa en un acercamiento, acuerdo o conversación capaz de equilibrar a ambas partes",action:"la acción tiende hacia el acercamiento o la búsqueda de un acuerdo",risk:"el riesgo está en suponer reciprocidad antes de verla demostrada en hechos",default:"existe posibilidad de encuentro o acuerdo, siempre que el intercambio sea realmente recíproco"},
  EN:{feeling:"there's emotional openness and a wish to connect, with real potential for a mutual response",thought:"an approach, agreement, or conversation that could balance both sides is being considered",action:"the action leans toward reaching out or seeking an agreement",risk:"the risk is assuming reciprocity before seeing it proven in actions",default:"there's a possibility of meeting or agreement, as long as the exchange is truly reciprocal"},
  FR:{feeling:"il y a une ouverture émotionnelle et un désir de rencontre, avec un potentiel réel de réponse réciproque",thought:"on envisage un rapprochement, un accord ou une conversation capable d'équilibrer les deux parties",action:"l'action tend vers le rapprochement ou la recherche d'un accord",risk:"le risque est de supposer une réciprocité avant de la voir démontrée par des faits",default:"il existe une possibilité de rencontre ou d'accord, à condition que l'échange soit réellement réciproque"},
  DE:{feeling:"es gibt emotionale Offenheit und den Wunsch nach Begegnung, mit echtem Potenzial für eine gegenseitige Antwort",thought:"es wird über eine Annäherung, eine Vereinbarung oder ein Gespräch nachgedacht, das beide Seiten ausgleichen könnte",action:"das Handeln tendiert zur Annäherung oder zur Suche nach einer Vereinbarung",risk:"das Risiko besteht darin, Gegenseitigkeit anzunehmen, bevor sie sich in Taten bestätigt hat",default:"es besteht die Möglichkeit einer Begegnung oder Vereinbarung, sofern der Austausch wirklich gegenseitig ist"},
  PT:{feeling:"há abertura emocional e desejo de encontro, com potencial real para uma resposta recíproca",thought:"pensa-se numa aproximação, acordo ou conversa capaz de equilibrar ambas as partes",action:"a ação tende para a aproximação ou a busca de um acordo",risk:"o risco está em supor reciprocidade antes de vê-la demonstrada em atos",default:"existe possibilidade de encontro ou acordo, desde que a troca seja realmente recíproca"}},
};
function uprightPositionMeaning(card,intent,category,language="ES"){
 const canonicalCard=canonicalOf(card),general=trimSentence(contextualMeaning(card,category));
 const special=SPECIAL_CARD_BRANCHES[canonicalCard.id];
 if(special){const table=special[language]||special.ES;return table[intent]||uprightGenericFallback(intent,general,language)||table.default;}
 return uprightGenericFallback(intent,general,language);
}
const REVERSED_KEYWORD_GROUPS=[
 {test:/reciprocidad|encuentro|acuerdo|vinculo/,ES:{feeling:"hay sentimientos o deseo de acercamiento, pero la reciprocidad es desigual o no consigue expresarse con claridad",action:"el acercamiento puede retrasarse, darse a medias o depender de que ambas partes corrijan un intercambio desigual",default:"dos partes parecen querer cosas distintas o no consiguen encontrarse desde un intercambio equilibrado"},
  EN:{feeling:"there are feelings or a wish to connect, but reciprocity is uneven or struggles to express itself clearly",action:"the approach may be delayed, happen halfway, or depend on both sides correcting an uneven exchange",default:"two sides seem to want different things, or can't meet from a balanced exchange"},
  FR:{feeling:"il y a des sentiments ou un désir de rapprochement, mais la réciprocité est inégale ou peine à s'exprimer clairement",action:"le rapprochement peut se retarder, se faire à moitié, ou dépendre de la correction d'un échange inégal par les deux parties",default:"les deux parties semblent vouloir des choses différentes, ou ne parviennent pas à se rencontrer dans un échange équilibré"},
  DE:{feeling:"es gibt Gefühle oder den Wunsch nach Annäherung, aber die Gegenseitigkeit ist ungleich oder drückt sich nicht klar aus",action:"die Annäherung kann sich verzögern, nur halb stattfinden oder davon abhängen, dass beide Seiten einen ungleichen Austausch korrigieren",default:"beide Seiten scheinen unterschiedliche Dinge zu wollen oder finden sich nicht in einem ausgeglichenen Austausch"},
  PT:{feeling:"há sentimentos ou desejo de aproximação, mas a reciprocidade é desigual ou não consegue se expressar com clareza",action:"a aproximação pode se atrasar, acontecer pela metade ou depender de que ambas as partes corrijam uma troca desigual",default:"as duas partes parecem querer coisas diferentes ou não conseguem se encontrar num intercâmbio equilibrado"}},
 {test:/claridad|verdad|decision/,ES:{thought:"la mente gira alrededor del problema, pero la información se mezcla con dudas y dificulta una conclusión clara",action:"la acción puede demorarse o dirigirse mal porque todavía no se ha definido con claridad qué hacer",default:"la claridad está distorsionada o incompleta y decidir ahora podría apoyarse en una lectura equivocada de los hechos"},
  EN:{thought:"the mind circles the problem, but information mixes with doubt and makes a clear conclusion difficult",action:"action may be delayed or misdirected because what to do hasn't yet been clearly defined",default:"clarity is distorted or incomplete, and deciding now could rest on a mistaken reading of the facts"},
  FR:{thought:"l'esprit tourne autour du problème, mais l'information se mêle de doutes et complique une conclusion claire",action:"l'action peut se retarder ou se diriger mal parce que ce qu'il faut faire n'est pas encore clairement défini",default:"la clarté est déformée ou incomplète, et décider maintenant pourrait s'appuyer sur une lecture erronée des faits"},
  DE:{thought:"der Geist kreist um das Problem, aber die Information vermischt sich mit Zweifeln und erschwert einen klaren Schluss",action:"das Handeln kann sich verzögern oder in die falsche Richtung gehen, weil noch nicht klar definiert ist, was zu tun ist",default:"die Klarheit ist verzerrt oder unvollständig, und jetzt zu entscheiden könnte auf einer falschen Lesart der Fakten beruhen"},
  PT:{thought:"a mente gira em torno do problema, mas a informação se mistura com dúvidas e dificulta uma conclusão clara",action:"a ação pode se atrasar ou se direcionar mal porque ainda não se definiu com clareza o que fazer",default:"a clareza está distorcida ou incompleta, e decidir agora poderia se apoiar numa leitura equivocada dos fatos"}},
 {test:/intuicion|introspeccion|pausa|prudencia/,ES:{risk:"la reflexión se ha prolongado hasta convertirse en aislamiento, demora o evasión",action:"conviene salir del aislamiento y contrastar la intuición con información concreta antes de actuar",default:"lo que debía ser una pausa útil se está convirtiendo en distancia o dificultad para responder"},
  EN:{risk:"reflection has stretched on until it became isolation, delay, or avoidance",action:"it's worth stepping out of isolation and checking intuition against concrete information before acting",default:"what should have been a useful pause is turning into distance or difficulty responding"},
  FR:{risk:"la réflexion s'est prolongée jusqu'à devenir isolement, retard ou évitement",action:"il convient de sortir de l'isolement et de confronter l'intuition à des informations concrètes avant d'agir",default:"ce qui devait être une pause utile devient distance ou difficulté à répondre"},
  DE:{risk:"das Nachdenken hat sich so lange hingezogen, dass daraus Isolation, Verzögerung oder Vermeidung wurde",action:"es lohnt sich, die Isolation zu verlassen und die Intuition vor dem Handeln mit konkreten Informationen abzugleichen",default:"was eine nützliche Pause sein sollte, wird zu Distanz oder Schwierigkeit zu antworten"},
  PT:{risk:"a reflexão se prolongou até se tornar isolamento, demora ou evasão",action:"convém sair do isolamento e contrastar a intuição com informação concreta antes de agir",default:"o que deveria ser uma pausa útil está se tornando distância ou dificuldade para responder"}},
 {test:/inicio|libertad|confianza/,ES:{risk:"el riesgo combina impulso sin dirección con falta de experiencia: se puede avanzar demasiado pronto o paralizarse por temor",action:"el inicio se retrasa o se expresa mediante un impulso poco preparado",default:"el deseo de comenzar está frenado por temor o aparece como un impulso que todavía no sabe hacia dónde ir"},
  EN:{risk:"the risk combines direction-less impulse with lack of experience: you could move too soon, or freeze out of fear",action:"the start is delayed or expressed through an unprepared impulse",default:"the wish to begin is held back by fear, or shows up as an impulse that doesn't yet know where it's going"},
  FR:{risk:"le risque combine une impulsion sans direction et un manque d'expérience : on peut avancer trop tôt ou se figer par peur",action:"le commencement se retarde ou s'exprime par une impulsion mal préparée",default:"le désir de commencer est freiné par la peur, ou se manifeste comme une impulsion qui ne sait pas encore où aller"},
  DE:{risk:"das Risiko verbindet richtungslosen Impuls mit fehlender Erfahrung: man kann zu früh losgehen oder vor Angst erstarren",action:"der Anfang verzögert sich oder äußert sich als unvorbereiteter Impuls",default:"der Wunsch zu beginnen wird von Angst gebremst oder zeigt sich als Impuls, der noch nicht weiß, wohin er will"},
  PT:{risk:"o risco combina impulso sem direção com falta de experiência: pode-se avançar cedo demais ou paralisar por medo",action:"o início se atrasa ou se expressa por meio de um impulso pouco preparado",default:"o desejo de começar está freado pelo medo ou aparece como um impulso que ainda não sabe para onde ir"}},
];
const REVERSED_BALANCE_GROUP={ES:{risk:"el desequilibrio puede agravarse si se sigue compensando un exceso sin corregir su causa",default:"el intento de mantener armonía está produciendo desgaste porque algo continúa fuera de medida"},
 EN:{risk:"the imbalance can worsen if an excess keeps being compensated for without correcting its cause",default:"the attempt to keep harmony is causing wear, because something remains out of proportion"},
 FR:{risk:"le déséquilibre peut s'aggraver si l'on continue à compenser un excès sans en corriger la cause",default:"la tentative de maintenir l'harmonie produit de l'usure, car quelque chose reste hors de mesure"},
 DE:{risk:"das Ungleichgewicht kann sich verschärfen, wenn ein Übermaß weiter ausgeglichen wird, ohne seine Ursache zu korrigieren",default:"der Versuch, Harmonie zu bewahren, erzeugt Verschleiß, weil etwas weiterhin außer Maß bleibt"},
 PT:{risk:"o desequilíbrio pode se agravar se continuar compensando um excesso sem corrigir sua causa",default:"a tentativa de manter a harmonia está produzindo desgaste porque algo continua fora de medida"}};
const REVERSED_CRAFT_GROUP={ES:{action:"hay capacidad, pero la ejecución se dispersa; hace falta elegir una tarea concreta y corregir lo que no funciona",default:"el esfuerzo o el talento no están produciendo todo su resultado por dispersión, repetición o mala ejecución"},
 EN:{action:"there's capacity, but execution is scattered; you need to choose a concrete task and fix what isn't working",default:"effort or talent isn't producing its full result due to scattering, repetition, or poor execution"},
 FR:{action:"la capacité existe, mais l'exécution se disperse ; il faut choisir une tâche concrète et corriger ce qui ne fonctionne pas",default:"l'effort ou le talent ne produit pas tout son résultat à cause de la dispersion, de la répétition ou d'une mauvaise exécution"},
 DE:{action:"die Fähigkeit ist da, aber die Umsetzung verzettelt sich; du musst eine konkrete Aufgabe wählen und korrigieren, was nicht funktioniert",default:"Anstrengung oder Talent bringen nicht ihr volles Ergebnis wegen Zersplitterung, Wiederholung oder schlechter Ausführung"},
 PT:{action:"há capacidade, mas a execução se dispersa; é preciso escolher uma tarefa concreta e corrigir o que não funciona",default:"o esforço ou talento não está produzindo todo o seu resultado por dispersão, repetição ou má execução"}};
const REVERSED_GENERIC_CONNECTORS={
 shadow:{EN:s=>`the pattern shows up in a blocked or extreme way through ${s}`,FR:s=>`le schéma s'exprime de façon bloquée ou extrême à travers ${s}`,DE:s=>`das Muster äußert sich blockiert oder extrem durch ${s}`,PT:s=>`o padrão se expressa de forma bloqueada ou extrema mediante ${s}`},
 learning:{EN:s=>`learning becomes difficult while ${s} continues`,FR:s=>`l'apprentissage devient difficile tant que ${s} persiste`,DE:s=>`das Lernen wird erschwert, solange ${s} anhält`,PT:s=>`o aprendizado se dificulta enquanto ${s} continuar`},
 resource:{EN:s=>`this resource is available, but doesn't yet flow freely because of ${s}`,FR:s=>`cette ressource est disponible, mais ne circule pas encore librement à cause de ${s}`,DE:s=>`diese Ressource ist verfügbar, fließt aber noch nicht frei wegen ${s}`,PT:s=>`este recurso está disponível, mas ainda não flui com liberdade devido a ${s}`},
 ending:{EN:s=>`the closure is delayed or complicated by ${s}`,FR:s=>`la clôture se retarde ou se complique à cause de ${s}`,DE:s=>`der Abschluss verzögert oder verkompliziert sich durch ${s}`,PT:s=>`o encerramento se atrasa ou se complica por ${s}`},
 threshold:{EN:s=>`the crossing into the new is blocked while ${s} continues`,FR:s=>`le passage vers le nouveau se bloque tant que ${s} persiste`,DE:s=>`der Übergang ins Neue blockiert, solange ${s} anhält`,PT:s=>`a travessia rumo ao novo se bloqueia enquanto ${s} continuar`},
 beginning:{EN:s=>`the new tries to emerge, but loses direction because of ${s}`,FR:s=>`le nouveau tente d'émerger, mais perd sa direction à cause de ${s}`,DE:s=>`das Neue versucht zu entstehen, verliert aber die Richtung wegen ${s}`,PT:s=>`o novo tenta surgir, mas perde direção por causa de ${s}`},
 inflow:{EN:s=>`the inflow of resources is reduced or distorted due to ${s}`,FR:s=>`l'entrée de ressources se réduit ou se déforme à cause de ${s}`,DE:s=>`der Zufluss von Ressourcen verringert oder verzerrt sich wegen ${s}`,PT:s=>`a entrada de recursos se reduz ou se distorce devido a ${s}`},
 leakage:{EN:s=>`the leak worsens because of ${s}`,FR:s=>`la fuite s'aggrave à cause de ${s}`,DE:s=>`die Verlustquelle verschärft sich wegen ${s}`,PT:s=>`a fuga se agrava por causa de ${s}`},
 reserve:{EN:s=>`the reserve weakens or fails to consolidate due to ${s}`,FR:s=>`la réserve s'affaiblit ou ne parvient pas à se consolider à cause de ${s}`,DE:s=>`die Reserve schwächt sich ab oder festigt sich nicht wegen ${s}`,PT:s=>`a reserva se enfraquece ou não consegue se consolidar devido a ${s}`},
 movement:{EN:s=>`resources fail to get moving because of ${s}`,FR:s=>`les ressources ne parviennent pas à se mettre en mouvement à cause de ${s}`,DE:s=>`die Ressourcen kommen wegen ${s} nicht in Bewegung`,PT:s=>`os recursos não conseguem entrar em movimento por causa de ${s}`},
 past:{EN:s=>`you're coming from a stage marked by ${s}`,FR:s=>`tu viens d'une étape marquée par ${s}`,DE:s=>`du kommst aus einer Phase, die von ${s} geprägt ist`,PT:s=>`você vem de uma etapa marcada por ${s}`},
 future:{EN:s=>`the trend may be delayed or show up in a problematic way through ${s}`,FR:s=>`la tendance peut se retarder ou se manifester de façon problématique à travers ${s}`,DE:s=>`der Trend kann sich verzögern oder sich problematisch äußern durch ${s}`,PT:s=>`a tendência pode se atrasar ou se manifestar de forma problemática mediante ${s}`},
 risk:{EN:s=>`the main risk is concentrated in ${s}`,FR:s=>`le risque principal se concentre sur ${s}`,DE:s=>`das Hauptrisiko konzentriert sich auf ${s}`,PT:s=>`o risco principal se concentra em ${s}`},
};
function reversedGenericFallback(intent,specific,language){
 if(language&&language!=="ES"){const entry=REVERSED_GENERIC_CONNECTORS[intent];if(entry?.[language])return entry[language](specific);}
 if(intent==="shadow")return `el patrón se expresa de forma bloqueada o extrema mediante ${specific}`;if(intent==="learning")return `el aprendizaje se dificulta mientras continúe ${specific}`;if(intent==="resource")return `este recurso está disponible, pero todavía no fluye con libertad debido a ${specific}`;if(intent==="ending")return `el cierre se retrasa o se complica por ${specific}`;if(intent==="threshold")return `el cruce hacia lo nuevo se bloquea mientras continúe ${specific}`;if(intent==="beginning")return `lo nuevo intenta surgir, pero pierde dirección por ${specific}`;if(intent==="inflow")return `la entrada de recursos se reduce o se distorsiona debido a ${specific}`;if(intent==="leakage")return `la fuga se agrava por ${specific}`;if(intent==="reserve")return `la reserva se debilita o no consigue consolidarse debido a ${specific}`;if(intent==="movement")return `los recursos no logran ponerse en movimiento por ${specific}`;if(intent==="past")return `vienes de una etapa marcada por ${specific}`;if(intent==="future")return `la tendencia puede retrasarse o manifestarse de forma problemática mediante ${specific}`;if(intent==="risk")return `el riesgo principal se concentra en ${specific}`;return specific;
}
function reversedPositionMeaning(card,intent,category,language="ES"){
 const keys=normalize(canonicalOf(card).keys.join(" ")),specific=trimSentence(card.reversed||contextualMeaning(card,category));
 for(const group of REVERSED_KEYWORD_GROUPS){
  if(!group.test.test(keys))continue;
  const table=(language!=="ES"&&group[language])?group[language]:group.ES;
  return table[intent]||reversedGenericFallback(intent,specific,language)||table.default;
 }
 if(/equilibrio|integracion|paciencia/.test(keys)){const table=(language!=="ES"&&REVERSED_BALANCE_GROUP[language])?REVERSED_BALANCE_GROUP[language]:REVERSED_BALANCE_GROUP.ES;return intent==="risk"?table.risk:(reversedGenericFallback(intent,specific,language)||table.default);}
 if(/practica|detalle|maestria|accion|recursos/.test(keys)){const table=(language!=="ES"&&REVERSED_CRAFT_GROUP[language])?REVERSED_CRAFT_GROUP[language]:REVERSED_CRAFT_GROUP.ES;return intent==="action"?table.action:(reversedGenericFallback(intent,specific,language)||table.default);}
 return reversedGenericFallback(intent,specific,language);
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
export function interpretCardInPosition(card,{position="",positionSpec=null,spreadType="",spread="",domain="GENERAL",secondaryDomains=[],mode="NARRATIVO",purpose="",neighboringCards=[],questionContext="",category="Consulta general",language="ES"}={}){
 const intent=positionSpec?.role||positionIntent(position),effectiveSpec={...(positionSpec||{}),id:positionSpec?.id||null,label:positionSpec?.label||position,question:positionSpec?.question||`¿Cómo responde esta carta a lo que representa ${position.toLowerCase()}?`,answerMode:positionSpec?.answerMode||answerModeForIntent(intent,position),role:intent,function:positionSpec?.function||semanticFunctionForRole(intent)},rawInterpretation=card.isReversed?reversedPositionMeaning(card,intent,category,language):uprightPositionMeaning(card,intent,category,language),baseInterpretation=ensureRoleContext(rawInterpretation,intent),neighborThemes=neighboringCards.flatMap(neighbor=>concepts(neighbor)),own=concepts(card),shared=own.filter(theme=>neighborThemes.includes(theme)),warningRoles=new Set(["risk","shadow","obstacle","warning","leakage","distance"]),supportRoles=new Set(["opportunity","resource","advice","action","inflow","reserve"]),confidence=shared.length||card.arcana==="Mayor"?"high":"medium";
 const semanticRange={
  general:trimSentence(contextualMeaning(card,category)),constructive:uprightPositionMeaning(card,"resource",category,language),
  opportunity:uprightPositionMeaning(card,"opportunity",category,language),learning:uprightPositionMeaning(card,"learning",category,language),
  challenging:uprightPositionMeaning(card,"risk",category,language),actionable:card.advice||uprightPositionMeaning(card,"action",category,language),
  outcome:uprightPositionMeaning(card,"future",category,language),past:uprightPositionMeaning(card,"past",category,language),
  emotional:uprightPositionMeaning(card,"feeling",category,language),mental:uprightPositionMeaning(card,"thought",category,language),
  external:uprightPositionMeaning(card,"external",category,language),orientation:baseInterpretation
 };
 const proposition=buildContextualProposition({card,position,positionSpec:effectiveSpec,baseInterpretation,semanticRange,spread,domain,secondaryDomains,mode,purpose,questionContext,category,neighboringCards,themes:own,confidence,language});
 return {...proposition,positionId:effectiveSpec.id,question:effectiveSpec.question,positionQuestion:effectiveSpec.question,answerMode:effectiveSpec.answerMode,role:intent,polarity:card.isReversed||warningRoles.has(intent)?"warning":supportRoles.has(intent)?"support":"mixed",spreadType};
}
function cardExpression(card,role,category){return interpretCardInPosition(card,{position:role,category}).interpretation;}
function narrativeState(card){
 const keys=normalize(canonicalOf(card).keys.join(" "));
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
const NARRATIVE_STATE_T={
 "encuentro bloqueado":{EN:"blocked encounter",FR:"rencontre bloquée",DE:"blockierte Begegnung",PT:"encontro bloqueado"},
 "claridad bloqueada":{EN:"blocked clarity",FR:"clarté bloquée",DE:"blockierte Klarheit",PT:"clareza bloqueada"},
 "pausa convertida en aislamiento":{EN:"pause turned into isolation",FR:"pause devenue isolement",DE:"zu Isolation gewordene Pause",PT:"pausa transformada em isolamento"},
 "inicio sin dirección":{EN:"beginning without direction",FR:"début sans direction",DE:"richtungsloser Anfang",PT:"início sem direção"},
 "desequilibrio":{EN:"imbalance",FR:"déséquilibre",DE:"Ungleichgewicht",PT:"desequilíbrio"},
 "capacidad sin ejecución":{EN:"capacity without execution",FR:"capacité sans exécution",DE:"Fähigkeit ohne Umsetzung",PT:"capacidade sem execução"},
 "movimiento bloqueado":{EN:"blocked movement",FR:"mouvement bloqué",DE:"blockierte Bewegung",PT:"movimento bloqueado"},
 "búsqueda interior":{EN:"inner search",FR:"recherche intérieure",DE:"innere Suche",PT:"busca interior"},
 "claridad para decidir":{EN:"clarity to decide",FR:"clarté pour décider",DE:"Klarheit zum Entscheiden",PT:"clareza para decidir"},
 "esperanza recuperada":{EN:"recovered hope",FR:"espoir retrouvé",DE:"wiedergewonnene Hoffnung",PT:"esperança recuperada"},
 "cierre y renovación":{EN:"closure and renewal",FR:"clôture et renouveau",DE:"Abschluss und Erneuerung",PT:"fechamento e renovação"},
 "movimiento de las circunstancias":{EN:"shifting circumstances",FR:"mouvement des circonstances",DE:"sich verändernde Umstände",PT:"movimento das circunstâncias"},
 "equilibrio sostenible":{EN:"sustainable balance",FR:"équilibre durable",DE:"nachhaltiges Gleichgewicht",PT:"equilíbrio sustentável"},
 "encuentro recíproco":{EN:"reciprocal encounter",FR:"rencontre réciproque",DE:"gegenseitige Begegnung",PT:"encontro recíproco"},
 "decisión coherente":{EN:"coherent decision",FR:"décision cohérente",DE:"kohärente Entscheidung",PT:"decisão coerente"},
 "construcción constante":{EN:"steady building",FR:"construction constante",DE:"beständiger Aufbau",PT:"construção constante"},
 "acción con recursos":{EN:"resourceful action",FR:"action avec des ressources",DE:"ressourcenstarkes Handeln",PT:"ação com recursos"},
 "apertura de un camino":{EN:"opening of a path",FR:"ouverture d'un chemin",DE:"Öffnung eines Weges",PT:"abertura de um caminho"},
 "proceso en desarrollo":{EN:"process underway",FR:"processus en cours",DE:"laufender Prozess",PT:"processo em desenvolvimento"},
};
function translateNarrativeState(state,language){
 if(!state||language==="ES")return state;
 return NARRATIVE_STATE_T[state]?.[language]||state;
}
const SEMANTIC_MOVEMENT_KNOWN_T={
 "búsqueda interior>claridad para decidir":{ES:"la búsqueda interior empieza a convertirse en claridad para decidir",EN:"the inner search is beginning to turn into clarity to decide",FR:"la recherche intérieure commence à se transformer en clarté pour décider",DE:"die innere Suche beginnt sich in Klarheit zum Entscheiden zu verwandeln",PT:"a busca interior começa a se transformar em clareza para decidir"},
 "búsqueda interior>movimiento de las circunstancias":{ES:"la pausa empieza a ceder ante un movimiento que ya no puede ignorarse",EN:"the pause is beginning to give way to a movement that can no longer be ignored",FR:"la pause commence à céder devant un mouvement qui ne peut plus être ignoré",DE:"die Pause beginnt einer Bewegung zu weichen, die nicht mehr ignoriert werden kann",PT:"a pausa começa a ceder diante de um movimento que já não pode ser ignorado"},
 "cierre y renovación>esperanza recuperada":{ES:"el cierre de una etapa está dejando espacio para recuperar esperanza y dirección",EN:"the closing of a stage is making room to recover hope and direction",FR:"la clôture d'une étape laisse de la place pour retrouver espoir et direction",DE:"der Abschluss einer Phase schafft Raum, um Hoffnung und Richtung zurückzugewinnen",PT:"o fechamento de uma etapa está abrindo espaço para recuperar esperança e direção"},
 "cierre y renovación>apertura de un camino":{ES:"lo que termina abre un camino distinto, aunque todavía no esté completamente definido",EN:"what's ending opens a different path, even if it isn't fully defined yet",FR:"ce qui se termine ouvre un chemin différent, même s'il n'est pas encore totalement défini",DE:"was endet, eröffnet einen anderen Weg, auch wenn er noch nicht vollständig definiert ist",PT:"o que termina abre um caminho diferente, mesmo que ainda não esteja totalmente definido"},
 "claridad para decidir>acción con recursos":{ES:"la claridad encuentra herramientas para convertirse en una acción concreta",EN:"clarity finds the tools to become concrete action",FR:"la clarté trouve les outils pour devenir une action concrète",DE:"die Klarheit findet die Werkzeuge, um zu konkretem Handeln zu werden",PT:"a clareza encontra ferramentas para se transformar em uma ação concreta"},
 "claridad para decidir>capacidad sin ejecución":{ES:"la claridad ya existe, pero todavía no consigue convertirse en una acción coherente",EN:"the clarity already exists, but it hasn't yet turned into coherent action",FR:"la clarté existe déjà, mais elle ne parvient pas encore à devenir une action cohérente",DE:"die Klarheit ist bereits vorhanden, wird aber noch nicht zu kohärentem Handeln",PT:"a clareza já existe, mas ainda não consegue se transformar em uma ação coerente"},
 "esperanza recuperada>construcción constante":{ES:"la esperanza necesita dejar de ser expectativa y convertirse en trabajo sostenido",EN:"hope needs to stop being an expectation and become sustained work",FR:"l'espoir doit cesser d'être une attente et devenir un travail soutenu",DE:"die Hoffnung muss aufhören, bloße Erwartung zu sein, und zu beständiger Arbeit werden",PT:"a esperança precisa deixar de ser expectativa e se tornar trabalho sustentado"},
 "desequilibrio>equilibrio sostenible":{ES:"lo que estaba fuera de medida empieza a buscar un reajuste posible",EN:"what was out of balance is beginning to look for a possible readjustment",FR:"ce qui était démesuré commence à chercher un réajustement possible",DE:"was aus dem Gleichgewicht war, beginnt eine mögliche Neuausrichtung zu suchen",PT:"o que estava fora de medida começa a buscar um reajuste possível"},
 "encuentro bloqueado>encuentro recíproco":{ES:"la distancia o desigualdad todavía puede transformarse en encuentro, pero la reciprocidad debe demostrarse",EN:"the distance or imbalance can still become an encounter, but reciprocity needs to be shown",FR:"la distance ou l'inégalité peut encore se transformer en rencontre, mais la réciprocité doit être démontrée",DE:"die Distanz oder Ungleichheit kann sich noch in eine Begegnung verwandeln, aber die Gegenseitigkeit muss sich zeigen",PT:"a distância ou desigualdade ainda pode se transformar em encontro, mas a reciprocidade precisa se demonstrar"},
 "movimiento de las circunstancias>apertura de un camino":{ES:"el giro de las circunstancias empieza a abrir un camino nuevo",EN:"the turn of circumstances is beginning to open a new path",FR:"le tournant des circonstances commence à ouvrir un nouveau chemin",DE:"die Wendung der Umstände beginnt, einen neuen Weg zu eröffnen",PT:"a virada das circunstâncias começa a abrir um novo caminho"},
};
const SEMANTIC_MOVEMENT_FALLBACK_T={
 ES:{same:a=>`${a} se profundiza y sigue marcando el rumbo`,generic:(a,b)=>`${a} está dando paso a ${b}`},
 EN:{same:a=>`${a} is deepening and continues to set the course`,generic:(a,b)=>`${a} is giving way to ${b}`},
 FR:{same:a=>`${a} s'approfondit et continue de marquer la direction`,generic:(a,b)=>`${a} cède la place à ${b}`},
 DE:{same:a=>`${a} vertieft sich und bestimmt weiterhin die Richtung`,generic:(a,b)=>`${a} weicht ${b}`},
 PT:{same:a=>`${a} se aprofunda e continua marcando o rumo`,generic:(a,b)=>`${a} está dando lugar a ${b}`},
};
function semanticMovement(from,to,language="ES"){
 const a=narrativeState(from),b=narrativeState(to),key=`${a}>${b}`,smf=SEMANTIC_MOVEMENT_FALLBACK_T[language]||SEMANTIC_MOVEMENT_FALLBACK_T.ES;
 if(a===b)return smf.same(translateNarrativeState(a,language));
 const known=SEMANTIC_MOVEMENT_KNOWN_T[key];
 if(known)return known[language]||known.ES;
 return smf.generic(translateNarrativeState(a,language),translateNarrativeState(b,language));
}
function relationKind(first,second){
 const A=concepts(first),B=concepts(second),opposed=OPPOSITES.some(([x,y])=>(A.includes(x)&&B.includes(y))||(A.includes(y)&&B.includes(x)));
 if(first.isReversed||second.isReversed||opposed)return "tension";
 if(A.some(theme=>B.includes(theme)))return "reinforcement";
 return "development";
}
function positionedExpression(analysis,node){return analysis.positionAnswersById?.[node.positionId]?.interpretation||cardExpression(node.card,node.role,analysis.context.category);}
function strategySynthesis(analysis,cards,rawParagraphs){
 const story=analysis.readingStory,strategy=analysis.narrativeStrategy.strategy,e=node=>positionedExpression(analysis,node),state=node=>narrativeState(node.card),nodes=story.steps||story.areas||[],fallback=deriveAdvice(analysis),lang=analysis.context?.language||"ES";
 const packageResult=(fields)=>({strategy,...fields});
 if(strategy==="seasonal_cycle"){
  const [winter,awakening,spring,expansion,summer,harvest,autumn,release,center]=nodes,lang2=analysis.context?.language||"ES";
  const SC2_T={
   ES:{thesis:c=>`El ciclo anual gira alrededor de un tema en el que ${c}.`,opening:(w,a)=>`El ciclo comienza en invierno, con una etapa en la que ${w}. Durante el despertar, ${a}; lo que estaba en preparación empieza a mostrar su primera forma.`,growth:(sp,ex,su)=>`En primavera, ${sp}. La expansión lleva ese proceso hacia un momento en el que ${ex}, hasta alcanzar en verano la fase de mayor actividad: ${su}.`,results:(h,au)=>`La cosecha permite ver resultados mediante una situación en la que ${h}. El otoño pide evaluar y madurar lo vivido, porque ${au}.`,closure:(r,c)=>`Antes de cerrar el ciclo será necesario depurar: ${r}. Todo el año vuelve al tema central, donde ${c}; esa es la medida para decidir qué conservar y qué dejar atrás.`,warning:r=>`No intentes llevar al siguiente ciclo aquello que la etapa de depuración ya pide revisar: ${r}.`,advice:c=>`Usa el tema central como criterio: ${c}. Al cerrar el año, suelta lo que contradiga esa dirección y conserva lo que haya demostrado sostenerla.`},
   EN:{thesis:c=>`The annual cycle revolves around a theme in which ${c}.`,opening:(w,a)=>`The cycle begins in winter, with a stage in which ${w}. During the awakening, ${a}; what was in preparation starts to show its first shape.`,growth:(sp,ex,su)=>`In spring, ${sp}. The expansion carries that process toward a moment in which ${ex}, until reaching in summer the phase of greatest activity: ${su}.`,results:(h,au)=>`The harvest lets you see results through a situation in which ${h}. Autumn calls for evaluating and maturing what's been lived, because ${au}.`,closure:(r,c)=>`Before closing the cycle it will be necessary to clear out: ${r}. The whole year returns to the central theme, where ${c}; that's the measure for deciding what to keep and what to leave behind.`,warning:r=>`Don't try to carry into the next cycle what the clearing-out stage is already asking you to review: ${r}.`,advice:c=>`Use the central theme as your criterion: ${c}. When closing the year, let go of what contradicts that direction and keep what has proven to sustain it.`},
   FR:{thesis:c=>`Le cycle annuel tourne autour d'un thème où ${c}.`,opening:(w,a)=>`Le cycle commence en hiver, avec une étape où ${w}. Pendant l'éveil, ${a} ; ce qui était en préparation commence à montrer sa première forme.`,growth:(sp,ex,su)=>`Au printemps, ${sp}. L'expansion mène ce processus vers un moment où ${ex}, jusqu'à atteindre en été la phase de plus grande activité : ${su}.`,results:(h,au)=>`La récolte permet de voir des résultats à travers une situation où ${h}. L'automne demande d'évaluer et de mûrir ce qui a été vécu, car ${au}.`,closure:(r,c)=>`Avant de clore le cycle, il faudra épurer : ${r}. Toute l'année revient au thème central, où ${c} ; c'est la mesure pour décider ce qu'il faut garder et ce qu'il faut laisser derrière soi.`,warning:r=>`N'essaie pas de porter dans le prochain cycle ce que l'étape d'épuration demande déjà de revoir : ${r}.`,advice:c=>`Utilise le thème central comme critère : ${c}. En clôturant l'année, laisse ce qui contredit cette direction et garde ce qui a prouvé pouvoir la soutenir.`},
   DE:{thesis:c=>`Der Jahreszyklus dreht sich um ein Thema, in dem ${c}.`,opening:(w,a)=>`Der Zyklus beginnt im Winter, mit einer Phase, in der ${w}. Während des Erwachens, ${a}; was in Vorbereitung war, beginnt seine erste Form zu zeigen.`,growth:(sp,ex,su)=>`Im Frühling, ${sp}. Die Expansion trägt diesen Prozess zu einem Moment, in dem ${ex}, bis im Sommer die Phase größter Aktivität erreicht wird: ${su}.`,results:(h,au)=>`Die Ernte lässt Ergebnisse erkennen durch eine Situation, in der ${h}. Der Herbst verlangt, das Erlebte zu bewerten und reifen zu lassen, weil ${au}.`,closure:(r,c)=>`Vor dem Abschluss des Zyklus wird es nötig sein zu läutern: ${r}. Das ganze Jahr kehrt zum zentralen Thema zurück, wo ${c}; das ist der Maßstab, um zu entscheiden, was zu bewahren und was zurückzulassen ist.`,warning:r=>`Versuche nicht, in den nächsten Zyklus zu tragen, was die Läuterungsphase bereits zu überprüfen verlangt: ${r}.`,advice:c=>`Nutze das zentrale Thema als Kriterium: ${c}. Lass beim Abschluss des Jahres los, was dieser Richtung widerspricht, und bewahre, was sich als tragfähig erwiesen hat.`},
   PT:{thesis:c=>`O ciclo anual gira em torno de um tema em que ${c}.`,opening:(w,a)=>`O ciclo começa no inverno, com uma etapa em que ${w}. Durante o despertar, ${a}; o que estava em preparação começa a mostrar sua primeira forma.`,growth:(sp,ex,su)=>`Na primavera, ${sp}. A expansão leva esse processo a um momento em que ${ex}, até alcançar no verão a fase de maior atividade: ${su}.`,results:(h,au)=>`A colheita permite ver resultados mediante uma situação em que ${h}. O outono pede avaliar e amadurecer o vivido, porque ${au}.`,closure:(r,c)=>`Antes de encerrar o ciclo será necessário depurar: ${r}. Todo o ano volta ao tema central, onde ${c}; essa é a medida para decidir o que conservar e o que deixar para trás.`,warning:r=>`Não tente levar para o próximo ciclo aquilo que a etapa de depuração já pede para revisar: ${r}.`,advice:c=>`Use o tema central como critério: ${c}. Ao encerrar o ano, solte o que contradiga essa direção e conserve o que tenha demonstrado sustentá-la.`},
  };
  const sc2=SC2_T[lang2]||SC2_T.ES;
  return packageResult({reading_thesis:sc2.thesis(e(center)),central_tension:e(release),main_movement:semanticMovement(winter.card,release.card,lang),arcs:{preparation:sc2.opening(e(winter),e(awakening)),growth:sc2.growth(e(spring),e(expansion),e(summer)),results:sc2.results(e(harvest),e(autumn)),closure:sc2.closure(e(release),e(center))},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(center),e(release)],depends_on_others:[],depends_on_circumstances:[e(winter),e(summer)]},warning:sc2.warning(e(release)),actionable_guidance:sc2.advice(e(center))});
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
  return packageResult({reading_thesis:`El mapa se concentra en ${core.label}; lo que ocurra ahí condiciona varias dimensiones y puede ordenarse desde ${support.label}.`,central_tension:core.blocked?`La mayor presión está en ${core.label}, donde una parte del proceso permanece bloqueada.`:analysis.semanticModel.uncertainty,main_movement:semanticMovement(core.focus.card,support.focus.card,lang),arcs,key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(support.focus)],depends_on_others:[],depends_on_circumstances:[e(core.focus)]},warning:`No intentes corregir cada aspecto por separado: el núcleo que aparece en ${core.label} puede reproducir el mismo problema en otros planos.`,actionable_guidance:`Empieza por aquello que ${e(support.focus)}. Un ajuste ahí puede ordenar el resto del mapa con menos dispersión.`});
 }
 if(strategy==="relational_dynamic"){
  if(analysis.narrativeStrategy.schema==="thought_feeling_action"){
   const [feeling,thought,action]=nodes,relation=relationKind(feeling.card,thought.card),bridge=relation==="tension"?"Lo que se siente y lo que se piensa no terminan de coincidir.":"Lo que se siente encuentra una respuesta activa en el pensamiento.";
   return packageResult({reading_thesis:`La lectura conecta el sentimiento con la intención y muestra cómo ambos pueden convertirse en acción.`,central_tension:relation==="tension"?`${e(feeling)}; sin embargo, ${e(thought)}.`:analysis.semanticModel.uncertainty,main_movement:semanticMovement(feeling.card,action.card,lang),arcs:{feeling_and_thought:`En lo emocional, ${e(feeling)}. En sus pensamientos, ${e(thought)}. ${bridge}`,action:`Esa combinación apunta a una conducta en la que ${e(action)}. La acción no depende solamente del sentimiento: también intervienen la decisión y las circunstancias que rodean la situación.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[],depends_on_others:[e(feeling),e(thought),e(action)],depends_on_circumstances:[]},warning:relation==="tension"?"No des por hecho que sentir algo conduce automáticamente a actuar en la misma dirección.":"El movimiento sugerido todavía necesita confirmarse mediante hechos.",actionable_guidance:`Observa si la iniciativa que aparece en el pensamiento se convierte realmente en la conducta descrita. Da más peso a los hechos que a una intención todavía no realizada.`});
  }
  const tension=story.tension?e(story.tension):"la reciprocidad todavía necesita mostrarse en hechos",direction=e(story.likelyDirection),professional=/trabajo|empleo|negocio|profesional/i.test(analysis.context.category),context=professional?"Aquí el punto común debe verse en colaboración y acuerdos que ambas partes puedan cumplir.":"Aquí el punto común debe verse en reciprocidad y necesidades expresadas con claridad.";
  return packageResult({reading_thesis:`La lectura trata de cómo dos disposiciones distintas construyen —o dificultan— un mismo vínculo.`,central_tension:tension,main_movement:semanticMovement(story.bond.card,story.likelyDirection.card,lang),arcs:{two_sides:`Una parte se acerca de modo que ${e(story.personA)}; la otra responde desde un lugar en el que ${e(story.personB)}. El vínculo nace del punto de encuentro real entre ambas, no de lo que una sola parte desea. ${context}`,bond_and_tension:`Entre ambas aparece una dinámica en la que ${e(story.bond)}. Sin embargo, ${tension}; esa diferencia define cuánto puede avanzar la relación.`,direction:`La evolución sugiere que ${direction}. Esa dirección sólo podrá sostenerse si la participación es recíproca.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.personA)],depends_on_others:[e(story.personB)],depends_on_circumstances:[]},warning:`No confundas el potencial del vínculo con reciprocidad confirmada: ${tension}.`,actionable_guidance:`Observa qué ofrece realmente cada parte. Sostén sólo el movimiento que pueda construirse entre dos, sin compensar de manera unilateral lo que falta.`});
 }
 if(strategy==="comparison"){
  if(analysis.narrativeStrategy.schema==="risk_result"){
   const [advantage,risk,result]=nodes;
   return packageResult({reading_thesis:`El resultado probable depende de aprovechar lo que está a favor sin minimizar el riesgo señalado.`,central_tension:e(risk),main_movement:semanticMovement(advantage.card,result.card,lang),arcs:{balance:`A favor, ${e(advantage)}. Sin embargo, ${e(risk)}; esa dificultad puede reducir la ventaja si se ignora o se subestima.`,outcome:`El resultado probable muestra que ${e(result)}. No surge automáticamente: será más viable si usas la ventaja con criterio y atiendes el riesgo antes de comprometerte.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(advantage),e(risk)],depends_on_others:[],depends_on_circumstances:[e(result)]},warning:`No avances como si el riesgo fuera secundario: ${e(risk)}.`,actionable_guidance:`Aprovecha aquello que ${e(advantage)}, pero establece primero una medida concreta para responder a que ${e(risk)}. Después compara esa realidad con el resultado que aparece.`});
  }
  if(analysis.narrativeStrategy.schema==="traffic_light"){
   const [advance,wait,stop]=nodes;
   return packageResult({reading_thesis:`La lectura distingue qué favorece avanzar, qué necesita tiempo y qué justifica detenerse.`,central_tension:`La decisión exige diferenciar una oportunidad real de una señal que todavía pide cautela.`,main_movement:`tres señales delimitan las condiciones para actuar`,arcs:{signals:`Puedes avanzar en aquello donde ${e(advance)}. Conviene esperar cuando ${e(wait)}. La señal para detenerte aparece si ${e(stop)}.`,criterion:`Estas cartas no dan tres órdenes contradictorias: marcan un criterio. Avanza sólo cuando la primera condición esté presente, concede tiempo a la segunda y detén el movimiento si aparece con claridad la tercera.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(advance),e(wait),e(stop)],depends_on_others:[],depends_on_circumstances:[]},warning:`No conviertas el deseo de avanzar en una razón para ignorar la señal de alto: ${e(stop)}.`,actionable_guidance:`Comprueba cuál de las tres condiciones describe mejor los hechos actuales. Si aún domina que ${e(wait)}, no fuerces una decisión definitiva.`});
  }
  const [a,ar]=story.pathA,[b,br]=story.pathB,consequenceA=ar||a,consequenceB=br||b;
  return packageResult({reading_thesis:"La lectura compara consecuencias, no busca declarar una opción universalmente mejor.",central_tension:`La elección enfrenta ${state(consequenceA)} con ${state(consequenceB)}.`,main_movement:`dos caminos conducen a consecuencias distintas: ${state(consequenceA)} frente a ${state(consequenceB)}`,arcs:{starting_point:`La decisión nace en una situación donde ${e(story.currentSituation)}. Elegir sólo para terminar con la incertidumbre ocultaría el verdadero costo de cada alternativa.`,paths:`Un camino parte de que ${e(a)} y conduce hacia una situación en la que ${e(consequenceA)}. El otro comienza donde ${e(b)} y apunta a que ${e(consequenceB)}.`,comparison:`La diferencia decisiva está en lo que cada resultado permite o exige. En un caso, ${e(consequenceA)}; en el otro, ${e(consequenceB)}. La opción más coherente será la consecuencia que realmente puedas sostener.`},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.currentSituation)],depends_on_others:[],depends_on_circumstances:[e(consequenceA),e(consequenceB)]},warning:`No elijas por el atractivo inicial. Compara con cuidado que un camino conduce a que ${e(consequenceA)}, mientras el otro apunta a que ${e(consequenceB)}.`,actionable_guidance:`Compara qué exige cada consecuencia de ti. Elige la que coincida con tus recursos y prioridades, no sólo la que alivie primero la incertidumbre.`});
 }
 if(strategy==="problem_resolution"){
  const lang=analysis.context?.language||"ES";
  const OPP_RISK_T={
   ES:{thesis:(e0,e1)=>`La oportunidad nace porque ${e0}, pero sólo podrá aprovecharse si la estrategia responde a que ${e1}.`,direct:(e0,e1)=>`La oportunidad aparece porque ${e0}. El principal riesgo sería que ${e1}.`,resolution:e0=>`La estrategia responde de forma directa a ese peligro: ${e0}. No se trata de abandonar la oportunidad, sino de evitar que la precipitación o el punto ciego la debiliten.`,warn:e0=>`No confundas entusiasmo con certeza. ${e0}.`,advice:e0=>`${e0}. Deja que esa observación confirme el siguiente paso antes de comprometerte.`},
   EN:{thesis:(e0,e1)=>`The opportunity arises because ${e0}, but it can only be seized if the strategy responds to the fact that ${e1}.`,direct:(e0,e1)=>`The opportunity appears because ${e0}. The main risk would be that ${e1}.`,resolution:e0=>`The strategy responds directly to that danger: ${e0}. It's not about abandoning the opportunity, but about keeping haste or a blind spot from weakening it.`,warn:e0=>`Don't confuse enthusiasm with certainty. ${e0}.`,advice:e0=>`${e0}. Let that observation confirm the next step before committing.`},
   FR:{thesis:(e0,e1)=>`L'opportunité naît parce que ${e0}, mais elle ne pourra être saisie que si la stratégie répond au fait que ${e1}.`,direct:(e0,e1)=>`L'opportunité apparaît parce que ${e0}. Le principal risque serait que ${e1}.`,resolution:e0=>`La stratégie répond directement à ce danger : ${e0}. Il ne s'agit pas d'abandonner l'opportunité, mais d'éviter que la précipitation ou l'angle mort ne l'affaiblissent.`,warn:e0=>`Ne confonds pas enthousiasme et certitude. ${e0}.`,advice:e0=>`${e0}. Laisse cette observation confirmer le prochain pas avant de t'engager.`},
   DE:{thesis:(e0,e1)=>`Die Gelegenheit entsteht, weil ${e0}, kann aber nur genutzt werden, wenn die Strategie darauf antwortet, dass ${e1}.`,direct:(e0,e1)=>`Die Gelegenheit erscheint, weil ${e0}. Das Hauptrisiko wäre, dass ${e1}.`,resolution:e0=>`Die Strategie antwortet direkt auf diese Gefahr: ${e0}. Es geht nicht darum, die Gelegenheit aufzugeben, sondern zu verhindern, dass Übereilung oder ein blinder Fleck sie schwächen.`,warn:e0=>`Verwechsle Begeisterung nicht mit Gewissheit. ${e0}.`,advice:e0=>`${e0}. Lass diese Beobachtung den nächsten Schritt bestätigen, bevor du dich festlegst.`},
   PT:{thesis:(e0,e1)=>`A oportunidade nasce porque ${e0}, mas só poderá ser aproveitada se a estratégia responder ao fato de que ${e1}.`,direct:(e0,e1)=>`A oportunidade aparece porque ${e0}. O principal risco seria que ${e1}.`,resolution:e0=>`A estratégia responde diretamente a esse perigo: ${e0}. Não se trata de abandonar a oportunidade, mas de evitar que a precipitação ou o ponto cego a enfraqueçam.`,warn:e0=>`Não confunda entusiasmo com certeza. ${e0}.`,advice:e0=>`${e0}. Deixe que essa observação confirme o próximo passo antes de se comprometer.`},
  };
  if(analysis.narrativeStrategy.schema==="opportunity_risk"){const t=OPP_RISK_T[lang]||OPP_RISK_T.ES;return packageResult({reading_thesis:t.thesis(e(story.currentSituation),e(story.mainChallenge)),central_tension:e(story.mainChallenge),main_movement:semanticMovement(story.mainChallenge.card,story.guidance.card,lang),arcs:{direct_reading:t.direct(e(story.currentSituation),e(story.mainChallenge)),resolution:t.resolution(e(story.guidance))},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.guidance)],depends_on_others:[],depends_on_circumstances:[e(story.currentSituation)]},warning:t.warn(sentence(e(story.mainChallenge))),actionable_guidance:t.advice(sentence(e(story.guidance)))});}
  const PROBLEM_T={
   ES:{thesis:(s1,s2)=>`La situación pide responder a ${s1} mediante ${s2}.`,problem:(e0,e1)=>`Ahora ${e0}. El núcleo del problema aparece donde ${e1}; reaccionar sólo a sus efectos dejaría intacta la causa.`,resolution:e0=>`La salida comienza cuando ${e0}. Esa respuesta cambia la dinámica porque atiende directamente lo que hoy impide avanzar.`,warn:e0=>`El principal riesgo es responder al síntoma y dejar intacto que ${e0}.`,advice:e0=>`Lleva tu esfuerzo al punto en el que ${e0}. Esa es la acción que mejor responde al bloqueo mostrado.`},
   EN:{thesis:(s1,s2)=>`The situation calls for responding to ${s1} through ${s2}.`,problem:(e0,e1)=>`Right now, ${e0}. The core of the problem appears where ${e1}; reacting only to its effects would leave the cause untouched.`,resolution:e0=>`The way out begins when ${e0}. That response changes the dynamic because it directly addresses what's blocking progress today.`,warn:e0=>`The main risk is responding to the symptom and leaving untouched the fact that ${e0}.`,advice:e0=>`Put your effort where ${e0}. That's the action that best responds to the block shown.`},
   FR:{thesis:(s1,s2)=>`La situation demande de répondre à ${s1} par ${s2}.`,problem:(e0,e1)=>`Maintenant, ${e0}. Le cœur du problème apparaît là où ${e1} ; ne réagir qu'à ses effets laisserait la cause intacte.`,resolution:e0=>`L'issue commence quand ${e0}. Cette réponse change la dynamique parce qu'elle s'attaque directement à ce qui empêche d'avancer aujourd'hui.`,warn:e0=>`Le principal risque est de répondre au symptôme et de laisser intact le fait que ${e0}.`,advice:e0=>`Porte ton effort là où ${e0}. C'est l'action qui répond le mieux au blocage observé.`},
   DE:{thesis:(s1,s2)=>`Die Situation verlangt, auf ${s1} mit ${s2} zu antworten.`,problem:(e0,e1)=>`Jetzt ${e0}. Der Kern des Problems zeigt sich dort, wo ${e1}; nur auf seine Auswirkungen zu reagieren würde die Ursache unberührt lassen.`,resolution:e0=>`Der Ausweg beginnt, wenn ${e0}. Diese Antwort verändert die Dynamik, weil sie direkt das angeht, was heute den Fortschritt blockiert.`,warn:e0=>`Das Hauptrisiko besteht darin, auf das Symptom zu reagieren und die Tatsache unberührt zu lassen, dass ${e0}.`,advice:e0=>`Setze deine Anstrengung dort ein, wo ${e0}. Das ist die Handlung, die am besten auf die gezeigte Blockade antwortet.`},
   PT:{thesis:(s1,s2)=>`A situação pede responder a ${s1} mediante ${s2}.`,problem:(e0,e1)=>`Agora, ${e0}. O núcleo do problema aparece onde ${e1}; reagir apenas aos seus efeitos deixaria a causa intacta.`,resolution:e0=>`A saída começa quando ${e0}. Essa resposta muda a dinâmica porque atende diretamente o que hoje impede avançar.`,warn:e0=>`O principal risco é responder ao sintoma e deixar intacto o fato de que ${e0}.`,advice:e0=>`Leve seu esforço ao ponto em que ${e0}. Essa é a ação que melhor responde ao bloqueio mostrado.`},
  };
  const t=PROBLEM_T[lang]||PROBLEM_T.ES;
  return packageResult({reading_thesis:t.thesis(state(story.mainChallenge),state(story.guidance)),central_tension:e(story.mainChallenge),main_movement:semanticMovement(story.mainChallenge.card,story.guidance.card,lang),arcs:{problem:t.problem(e(story.currentSituation),e(story.mainChallenge)),resolution:t.resolution(e(story.guidance))},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(story.guidance)],depends_on_others:[],depends_on_circumstances:[e(story.currentSituation)]},warning:t.warn(e(story.mainChallenge)),actionable_guidance:t.advice(e(story.guidance))});
 }
 if(strategy==="focal_message"){
  const focus=nodes[0],lang=analysis.context?.language||"ES";
  const FOCAL_TEMPLATES={
   ES:{arc:e0=>`El mensaje se concentra en una sola imagen: ${e0}. No necesita convertirse en una predicción; funciona como el aspecto que merece toda tu atención ahora.`,warnRev:e0=>`Observa dónde ${e0}.`,warnUp:"No disperses el mensaje intentando hacerlo responder asuntos que no aparecen en la carta.",advice:e0=>`Lleva este símbolo a una pregunta concreta: ¿dónde puedes reconocer que ${e0}?`},
   EN:{arc:e0=>`The message concentrates on a single image: ${e0}. It doesn't need to become a prediction; it works as the aspect that deserves all your attention right now.`,warnRev:e0=>`Notice where ${e0}.`,warnUp:"Don't scatter the message by trying to make it answer things that don't appear in the card.",advice:e0=>`Bring this symbol to a concrete question: where can you recognize that ${e0}?`},
   FR:{arc:e0=>`Le message se concentre sur une seule image : ${e0}. Il n'a pas besoin de devenir une prédiction ; il fonctionne comme l'aspect qui mérite toute ton attention maintenant.`,warnRev:e0=>`Observe où ${e0}.`,warnUp:"Ne disperse pas le message en essayant de lui faire répondre à des questions qui n'apparaissent pas dans la carte.",advice:e0=>`Amène ce symbole à une question concrète : où peux-tu reconnaître que ${e0} ?`},
   DE:{arc:e0=>`Die Botschaft konzentriert sich auf ein einziges Bild: ${e0}. Sie muss nicht zu einer Vorhersage werden; sie funktioniert als der Aspekt, der jetzt deine ganze Aufmerksamkeit verdient.`,warnRev:e0=>`Beobachte, wo ${e0}.`,warnUp:"Zerstreue die Botschaft nicht, indem du versuchst, sie Fragen beantworten zu lassen, die nicht in der Karte erscheinen.",advice:e0=>`Bring dieses Symbol zu einer konkreten Frage: Wo kannst du erkennen, dass ${e0}?`},
   PT:{arc:e0=>`A mensagem se concentra numa única imagem: ${e0}. Não precisa se tornar uma previsão; funciona como o aspecto que merece toda a sua atenção agora.`,warnRev:e0=>`Observe onde ${e0}.`,warnUp:"Não disperse a mensagem tentando fazê-la responder a assuntos que não aparecem na carta.",advice:e0=>`Leve este símbolo a uma pergunta concreta: onde você pode reconhecer que ${e0}?`},
  };
  const t=FOCAL_TEMPLATES[lang]||FOCAL_TEMPLATES.ES;
  return packageResult({reading_thesis:e(focus),central_tension:focus.card.isReversed?e(focus):"",main_movement:state(focus),arcs:{focus:t.arc(e(focus))},key_relationships:[],agency:{depends_on_consultant:[e(focus)],depends_on_others:[],depends_on_circumstances:[]},warning:focus.card.isReversed?t.warnRev(e(focus)):t.warnUp,actionable_guidance:t.advice(e(focus))});
 }
 if(strategy==="weighted_answer"){
  const [answer,condition,warning]=nodes,lang=analysis.context?.language||"ES";
  const T={
   ES:{thesis:(s1,s2)=>`La respuesta está condicionada por ${s1} y no puede separarse de ${s2}.`,answer:e0=>`La respuesta se inclina hacia una situación en la que ${e0}, pero no es un sí o un no aislado.`,cond:(e0,e1)=>`Para que esa dirección pueda sostenerse, ${e0}. Al mismo tiempo, ${e1} marca el punto que podría cambiar el resultado.`,warn:e0=>`La respuesta pierde fuerza si ${e0}.`,advice:e0=>`Antes de actuar, comprueba si realmente ${e0}. Esa condición pesa más que una respuesta rápida.`},
   EN:{thesis:(s1,s2)=>`The answer is conditioned by ${s1} and can't be separated from ${s2}.`,answer:e0=>`The answer leans toward a situation in which ${e0}, but it isn't an isolated yes or no.`,cond:(e0,e1)=>`For that direction to hold, ${e0}. At the same time, ${e1} marks the point that could change the outcome.`,warn:e0=>`The answer loses strength if ${e0}.`,advice:e0=>`Before acting, check whether ${e0} really holds. That condition weighs more than a quick answer.`},
   FR:{thesis:(s1,s2)=>`La réponse est conditionnée par ${s1} et ne peut être séparée de ${s2}.`,answer:e0=>`La réponse penche vers une situation où ${e0}, mais ce n'est pas un oui ou un non isolé.`,cond:(e0,e1)=>`Pour que cette direction puisse se maintenir, ${e0}. En même temps, ${e1} marque le point qui pourrait changer le résultat.`,warn:e0=>`La réponse perd de sa force si ${e0}.`,advice:e0=>`Avant d'agir, vérifie si ${e0} est vraiment le cas. Cette condition pèse plus qu'une réponse rapide.`},
   DE:{thesis:(s1,s2)=>`Die Antwort ist von ${s1} abhängig und lässt sich nicht von ${s2} trennen.`,answer:e0=>`Die Antwort neigt zu einer Situation, in der ${e0}, ist aber kein isoliertes Ja oder Nein.`,cond:(e0,e1)=>`Damit sich diese Richtung halten kann, ${e0}. Gleichzeitig markiert ${e1} den Punkt, der das Ergebnis verändern könnte.`,warn:e0=>`Die Antwort verliert an Kraft, wenn ${e0}.`,advice:e0=>`Bevor du handelst, prüfe, ob ${e0} wirklich zutrifft. Diese Bedingung wiegt mehr als eine schnelle Antwort.`},
   PT:{thesis:(s1,s2)=>`A resposta é condicionada por ${s1} e não pode se separar de ${s2}.`,answer:e0=>`A resposta se inclina para uma situação em que ${e0}, mas não é um sim ou não isolado.`,cond:(e0,e1)=>`Para que essa direção possa se sustentar, ${e0}. Ao mesmo tempo, ${e1} marca o ponto que poderia mudar o resultado.`,warn:e0=>`A resposta perde força se ${e0}.`,advice:e0=>`Antes de agir, verifique se ${e0} realmente se sustenta. Essa condição pesa mais do que uma resposta rápida.`},
  }[lang];
  return packageResult({reading_thesis:T.thesis(state(condition),state(warning)),central_tension:e(warning),main_movement:semanticMovement(condition.card,answer.card,lang),arcs:{answer:T.answer(e(answer)),conditions:T.cond(e(condition),e(warning))},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(condition)],depends_on_others:[],depends_on_circumstances:[e(answer)]},warning:T.warn(e(warning)),actionable_guidance:T.advice(e(condition))});
 }
 if(strategy==="sequence"||strategy==="inner_evolution"||strategy==="evolutionary_story"){
  const first=nodes[0],middle=nodes[Math.floor((nodes.length-1)/2)],last=nodes.at(-1),movement=semanticMovement(first.card,last.card,lang);
  const SEQ_T={
   ES:{thesis:(s1,s2)=>`La lectura describe un paso de ${s1} hacia ${s2}.`,development:(e0,e1)=>`El recorrido comienza donde ${e0}. En el momento actual, ${e1}; esta es la bisagra entre lo vivido y lo que empieza a formarse.`,direction:e0=>`Si este proceso continúa, ${e0}. La tendencia nace de cómo el presente transforma o prolonga lo que comenzó antes, no de una carta aislada.`,warnRev:e0=>`El punto delicado está en que ${e0}.`,warnUp:"No confundas la dirección final con un resultado garantizado.",advice:e0=>`Trabaja sobre lo que muestra el presente: ${e0}. Esa respuesta es la que puede modificar la dirección del recorrido.`},
   EN:{thesis:(s1,s2)=>`The reading describes a shift from ${s1} toward ${s2}.`,development:(e0,e1)=>`The journey begins where ${e0}. Right now, ${e1}; this is the hinge between what's been lived and what's starting to take shape.`,direction:e0=>`If this process continues, ${e0}. The trend comes from how the present transforms or extends what began earlier, not from a single isolated card.`,warnRev:e0=>`The delicate point is that ${e0}.`,warnUp:"Don't mistake the final direction for a guaranteed outcome.",advice:e0=>`Work with what the present shows: ${e0}. That response is what can change the direction of the journey.`},
   FR:{thesis:(s1,s2)=>`La lecture décrit un passage de ${s1} vers ${s2}.`,development:(e0,e1)=>`Le parcours commence là où ${e0}. En ce moment, ${e1} ; c'est la charnière entre ce qui a été vécu et ce qui commence à se former.`,direction:e0=>`Si ce processus continue, ${e0}. La tendance naît de la façon dont le présent transforme ou prolonge ce qui a commencé avant, pas d'une carte isolée.`,warnRev:e0=>`Le point délicat est que ${e0}.`,warnUp:"Ne confonds pas la direction finale avec un résultat garanti.",advice:e0=>`Travaille avec ce que montre le présent : ${e0}. Cette réponse est celle qui peut modifier la direction du parcours.`},
   DE:{thesis:(s1,s2)=>`Die Lesung beschreibt einen Übergang von ${s1} zu ${s2}.`,development:(e0,e1)=>`Der Weg beginnt dort, wo ${e0}. Im gegenwärtigen Moment, ${e1}; das ist das Scharnier zwischen dem Erlebten und dem, was sich zu formen beginnt.`,direction:e0=>`Wenn dieser Prozess weitergeht, ${e0}. Der Trend entsteht daraus, wie die Gegenwart das, was zuvor begann, verwandelt oder fortsetzt, nicht aus einer einzelnen Karte.`,warnRev:e0=>`Der heikle Punkt ist, dass ${e0}.`,warnUp:"Verwechsle die endgültige Richtung nicht mit einem garantierten Ergebnis.",advice:e0=>`Arbeite mit dem, was die Gegenwart zeigt: ${e0}. Diese Antwort ist es, die die Richtung des Weges verändern kann.`},
   PT:{thesis:(s1,s2)=>`A leitura descreve uma passagem de ${s1} rumo a ${s2}.`,development:(e0,e1)=>`O percurso começa onde ${e0}. No momento atual, ${e1}; esta é a dobradiça entre o que foi vivido e o que começa a se formar.`,direction:e0=>`Se este processo continuar, ${e0}. A tendência nasce de como o presente transforma ou prolonga o que começou antes, não de uma carta isolada.`,warnRev:e0=>`O ponto delicado está em que ${e0}.`,warnUp:"Não confunda a direção final com um resultado garantido.",advice:e0=>`Trabalhe com o que o presente mostra: ${e0}. Essa resposta é a que pode modificar a direção do percurso.`},
  };
  const t=SEQ_T[lang]||SEQ_T.ES;
  return packageResult({reading_thesis:t.thesis(state(first),state(last)),central_tension:middle.card.isReversed?e(middle):analysis.semanticModel.uncertainty,main_movement:movement,arcs:{development:t.development(e(first),e(middle)),direction:t.direction(e(last))},key_relationships:analysis.contextualRelations,agency:{depends_on_consultant:[e(middle)],depends_on_others:[],depends_on_circumstances:[e(first),e(last)]},warning:middle.card.isReversed?t.warnRev(e(middle)):t.warnUp,actionable_guidance:t.advice(e(middle))});
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
const GRAMMAR_CAUTION_T={
 ES:{leakage:m=>`Presta atención a esta fuga: ${m}. Si continúa, debilitará lo que sí consigues conservar.`,default:m=>`Presta atención a este punto: ${m}.`},
 EN:{leakage:m=>`Pay attention to this leak: ${m}. If it continues, it will weaken what you do manage to keep.`,default:m=>`Pay attention to this point: ${m}.`},
 FR:{leakage:m=>`Prête attention à cette fuite : ${m}. Si elle continue, elle affaiblira ce que tu parviens à conserver.`,default:m=>`Prête attention à ce point : ${m}.`},
 DE:{leakage:m=>`Achte auf dieses Leck: ${m}. Wenn es anhält, schwächt es, was du tatsächlich bewahren kannst.`,default:m=>`Achte auf diesen Punkt: ${m}.`},
 PT:{leakage:m=>`Preste atenção a esta fuga: ${m}. Se continuar, vai enfraquecer o que você consegue conservar.`,default:m=>`Preste atenção a este ponto: ${m}.`},
};
function grammarCaution(entries,language="ES"){
 const dangerRoles=new Set(["shadow","risk","obstacle","warning","leakage","distance","defense","threshold"]),entry=entries.find(item=>dangerRoles.has(item.role))||entries.find(item=>item.orientation==="reversed")||entries.find(item=>item.role==="expectation")||entries[Math.min(1,entries.length-1)],meaning=sentence(trimSentence(entry.answer||entry.interpretation)),t=GRAMMAR_CAUTION_T[language]||GRAMMAR_CAUTION_T.ES;
 if(entry.role==="leakage")return t.leakage(meaning);
 return t.default(meaning);
}
const GRAMMAR_ACTION_T={
 ES:{resource:m=>`Pon en uso lo que tienes a favor: ${m}. Tradúcelo en una decisión observable.`,condition:m=>`Antes de decidir, comprueba esta condición: ${m}.`,learning:m=>`Aplica el aprendizaje de forma concreta: ${m}.`,default:m=>`Da un paso concreto desde esta indicación: ${m}.`},
 EN:{resource:m=>`Put what's in your favor to use: ${m}. Turn it into an observable decision.`,condition:m=>`Before deciding, check this condition: ${m}.`,learning:m=>`Apply the lesson concretely: ${m}.`,default:m=>`Take a concrete step from this indication: ${m}.`},
 FR:{resource:m=>`Mets à profit ce qui joue en ta faveur : ${m}. Traduis-le en une décision observable.`,condition:m=>`Avant de décider, vérifie cette condition : ${m}.`,learning:m=>`Applique l'apprentissage de façon concrète : ${m}.`,default:m=>`Fais un pas concret à partir de cette indication : ${m}.`},
 DE:{resource:m=>`Nutze, was zu deinen Gunsten spricht: ${m}. Verwandle es in eine beobachtbare Entscheidung.`,condition:m=>`Prüfe vor der Entscheidung diese Bedingung: ${m}.`,learning:m=>`Wende die Lektion konkret an: ${m}.`,default:m=>`Mach einen konkreten Schritt ausgehend von diesem Hinweis: ${m}.`},
 PT:{resource:m=>`Coloque em uso o que está a seu favor: ${m}. Traduza isso numa decisão observável.`,condition:m=>`Antes de decidir, verifique esta condição: ${m}.`,learning:m=>`Aplique o aprendizado de forma concreta: ${m}.`,default:m=>`Dê um passo concreto a partir desta indicação: ${m}.`},
};
function grammarAction(entries,language="ES"){
 const priorities=["action","advice","resource","movement","integration","condition","learning","insight"],entry=priorities.map(role=>entries.find(item=>item.role===role)).find(Boolean)||entries.at(-1),meaning=sentence(trimSentence(entry.answer||entry.interpretation)),t=GRAMMAR_ACTION_T[language]||GRAMMAR_ACTION_T.ES;
 if(entry.role==="resource")return t.resource(meaning);
 if(entry.role==="condition")return t.condition(meaning);
 if(entry.role==="learning")return t.learning(meaning);
 return t.default(meaning);
}
const GT={
 ES:{
  focus_close:"Esta es la cuestión que merece atención antes de ampliar la pregunta o buscar una predicción.",
  weighted_thesis:"La respuesta depende de que se cumpla la condición y de atender la advertencia.",weighted_answer:a=>a,weighted_conditions:(c,w)=>`${c} Podría cambiar si: ${w}`,
  chron_ppt_thesis:"El antecedente explica el presente y el presente condiciona la tendencia.",chron_ppt_dev:(p,pr)=>`${p} ${pr}`,chron_ppt_dir:t=>`${t} Lo que hagas ahora puede reforzar o modificar esa dirección.`,
  chron_thesis:"La tirada sigue una secuencia desde el antecedente hasta el resultado.",chron_origin:(p,pr,h)=>`${p} ${pr} Influencia todavía poco visible: ${h}`,chron_pressure:(o,env)=>`${o} Condiciones externas: ${env}`,chron_response:(adv,res)=>`${adv} Si se sostiene: ${res}`,
  trans_ceb_thesis:"Una etapa termina, deja un aprendizaje y exige cruzar un umbral antes de comenzar otra.",trans_ending:(e,l)=>`${e} Enseñanza: ${l}`,trans_threshold:(th,b)=>`${th} Después: ${b}`,trans_first_step:fs=>`${fs} Esa acción convierte el cierre en un comienzo real.`,
  trans_thesis:"La lectura distingue lo que conserva valor, lo que debe soltarse y lo que puede comenzar.",trans_selection:(k,r)=>`Conserva valor: ${k} Debe soltarse: ${r}`,trans_beginning:b=>`${b} Será más claro si no intenta reconstruir exactamente lo que acabas de soltar.`,
  diag_ors_thesis:(op,ri)=>`${op} ${ri}`,diag_ors_diag:(op,ri)=>`${op} Sin embargo, ${ri}`,diag_ors_resp:st=>`${st} Primero observa si puede aplicarse; después decide cuánto comprometer.`,
  diag_two_thesis:"La situación necesita una respuesta concreta.",diag_two:(s,a)=>`${s} ${a}`,
  diag_econ_thesis:"El bloqueo se sostiene por una cadena que va del origen al patrón y puede romperse desde el recurso disponible.",diag_econ_origin:(o,man,p)=>`Origen: ${o} Hoy: ${man} Se repite porque ${p}`,diag_econ_exit:(r,ex)=>`Recurso disponible: ${r} Salida: ${ex}`,
  diag_thesis:"La lectura identifica qué ocurre, qué lo complica y cómo responder.",diag_situation:(s,r)=>`${s}${r?` A tu favor: ${r}`:""}`,diag_problem:(o,ext)=>`${o}${ext?` Además: ${ext}`:""}`,diag_response:a=>`${a} Atiende el conflicto principal y permite evaluar cambios concretos.`,
  inner_thesis:"Pensamiento, emoción y conducta necesitan dejar de operar por separado.",inner_relation:(mind,emo)=>`Mente: ${mind} Emoción: ${emo}`,inner_action:act=>`${act} Actuar con conciencia evita que una emoción o una idea aislada decida por todo el conjunto.`,
  psych_slr_thesis:"Un patrón interno exige una transformación y la lectura muestra la capacidad disponible para realizarla.",psych_shadow:(sh,le)=>`${sh} Para dejar de repetirlo: ${le}`,psych_resource:r=>`${r} De ahí puede surgir una decisión más consciente.`,
  psych_thesis:"La lectura reconoce una experiencia interna, descubre lo que pide comprenderse y la lleva hacia una integración.",psych_recognition:(f,mid)=>`${f} ${mid}`,psych_integration:l=>`${l} La integración no borra lo vivido; modifica la forma de responder.`,
  rel_align_yes:"Sentimiento, pensamiento y acción muestran una alineación suficiente.",rel_align_no:"La alineación es parcial: lo que se siente, lo que se piensa y lo que probablemente se hará no tienen la misma intensidad.",rel_fta_thesis:"Sentimiento, pensamiento y conducta no son equivalentes y deben leerse en ese orden.",rel_feeling_thought:(f,t,al)=>`${f} ${t} ${al}`,rel_action:a=>`${a} Da más peso a los hechos que a una emoción o intención todavía no expresada.`,
  rel_prof:"En una asociación profesional, ese punto común debe convertirse en colaboración y acuerdos verificables.",rel_affective:"En una relación afectiva, ese punto común necesita reciprocidad y necesidades expresadas con claridad.",rel_bond_thesis:"El vínculo surge de dos disposiciones concretas, no del deseo de una sola parte.",rel_two_people:(s,o)=>`${s} ${o}`,rel_bond:(b,ctx)=>`${b} ${ctx}`,
  rel_thesis:"La relación depende de lo que aporta cada parte, de su punto de encuentro y de la tensión que ambas estén dispuestas a resolver.",rel_participants:(s,o)=>`${s} ${o}`,rel_bond_tension:(b,t)=>`${b}${t?` Sin embargo, ${t}`:""}`,rel_development:f=>`${f} No puede sostenerse desde el esfuerzo unilateral.`,
  dec_arr_thesis:"El resultado probable depende de usar la ventaja sin minimizar el riesgo.",dec_arr_comp:(adv,ri)=>`A favor: ${adv} Riesgo: ${ri}`,dec_arr_result:r=>`${r} Será más viable si la precaución se convierte en una medida concreta antes de avanzar.`,
  tl_advance:"avanzar",tl_wait:"esperar",tl_stop:"detenerse",dec_tl_thesis:"La lectura compara el respaldo relativo de avanzar, esperar y detenerse.",dec_tl_signals:(adv,w,st)=>`Avanzar: ${adv} Esperar: ${w} Detenerse: ${st}`,dec_tl_criterion:(label,interp,condLabel,condInterp)=>`La señal con mayor respaldo es ${label}: ${interp} Cambiaría si los hechos se acercan más a ${condLabel}: ${condInterp}`,
  dec_job_thesis:"El cambio debe medirse por sus razones, su oportunidad, su riesgo y el resultado que realmente puede sostenerse.",dec_job_current:(c,r)=>`${c} Motivo del cambio: ${r}`,dec_job_risk:(op,ri)=>`${op} Sin embargo, ${ri}`,dec_job_result:(res,adv)=>`${res} Consejo: ${adv}`,
  dec_thesis:"La elección se aclara al comparar lo que exige cada camino con su consecuencia.",dec_start:(s,mot)=>`${s}${mot?` Motivación real: ${mot}`:""}`,dec_path_a:(p,r)=>`${p} ${r}`,dec_path_b:(p,r)=>`${p} ${r} Compara qué consecuencia coincide con tus recursos y prioridades, no cuál alivia primero la incertidumbre.`,
  res_thesis:"Los recursos siguen una cadena concreta: origen, entrada, fuga, conservación, movimiento y dirección probable.",res_origin:(o,inf)=>`${o} ${inf} Los recursos pueden ser dinero, tiempo, energía, atención u oportunidades, según tu pregunta.`,res_leak:(l,r)=>`${l} Frente a ello: ${r}`,res_move:(mv,t)=>`${mv} Tendencia: ${t}`,
  proj_thesis:"La viabilidad del proyecto depende de coordinar idea, recursos, respuesta externa, obstáculo y estrategia.",proj_idea:(i,r)=>`${i} Recursos: ${r}`,proj_obstacle:(mk,o)=>`${mk} ${o}`,proj_strategy:(st,r)=>`${st} ${r}`,
  celtic_thesis:(p,b,c,t)=>`Origen: ${p} Base: ${b} Conflicto: ${c} Tendencia: ${t}`,celtic_origin:(p,b,s)=>`${p} ${b} ${s}`,celtic_conflict:(c,poss,nf)=>`${c} Aun así, ${poss} ${nf}`,celtic_self:(att,env,hf)=>`${att} Afuera: ${env} Expectativa: ${hf}`,celtic_direction:t=>`${t} La posibilidad sólo podrá sostenerse si responde al cruce y a las condiciones reales del entorno.`,
  houses_thesis:"La energía se concentra en las áreas donde las posiciones se refuerzan o se bloquean entre sí.",houses_self:(s,b)=>`${s} Vínculos: ${b}`,houses_resources:(r,rt,v)=>`Recursos: ${r} Rutinas: ${rt} Vocación: ${v}`,houses_home:(h,tr,vi)=>`Base: ${h} Transformación: ${tr} Visión: ${vi}`,houses_comm:(c,com,u)=>`Comunicación: ${c} Comunidad: ${com} Inconsciente: ${u}`,
  chakra_thesis:"La lectura sigue cómo seguridad, deseo, voluntad, afecto, expresión y visión se integran en un sentido común.",chakra_foundation:(root,sac,sol)=>`Base: ${root} Sacro: ${sac} Plexo solar: ${sol}`,chakra_heart:(h,th)=>`Corazón: ${h} Garganta: ${th}`,chakra_vision:(te,cr)=>`Tercer ojo: ${te} Corona: ${cr}`,
  star_thesis:"El centro se aclara al contrastar conciencia y deseo, y se resuelve mediante recurso, desafío y acción.",star_center:(c,aw,d)=>`${c} Conciencia: ${aw} Deseo: ${d}`,star_challenge:(r,c)=>`Recurso: ${r} Desafío: ${c}`,star_action:(a,r)=>`${a} ${r}`,
  mandala_thesis:"El centro recibe influencias del pasado y del fundamento, mientras otras posiciones muestran inicio, acción, cierre y aprendizaje.",mandala_center:(c,w,s)=>`Centro: ${c} Oeste: ${w} Sur: ${s}`,mandala_move:(n,ne,e,se)=>`Norte: ${n} Noreste: ${ne} Este: ${e} Sureste: ${se}`,mandala_close:(sw,nw)=>`Suroeste: ${sw} Noroeste: ${nw}`,
  tree_thesis:"Una intención desciende desde el impulso y la comprensión hasta una manifestación concreta.",tree_origin:(k,ch,b)=>`Kéter: ${k} Jojmá: ${ch} Biná: ${b}`,tree_balance:(che,g,t)=>`Jésed: ${che} Guevurá: ${g} Tiféret: ${t}`,tree_foundation:(n,h,y)=>`Nétzaj: ${n} Hod: ${h} Yesod: ${y}`,tree_manifestation:mv=>mv,
  spirit_thesis:"El camino nace de un llamado, atraviesa una prueba y una sombra, y se define mediante elección, entrega e integración.",spirit_calling:(c,o,bg)=>`${c} Origen: ${o} Equipaje: ${bg}`,spirit_threshold:(g,th)=>`Guía: ${g} Umbral: ${th}`,spirit_trial:(t,sh,rv)=>`Prueba: ${t} Sombra: ${sh} Revelación: ${rv}`,spirit_choice:(ch,su,i)=>`Elección: ${ch} Entrega: ${su} Integración: ${i}`,spirit_destination:d=>d,
  generic_thesis:"La tirada desconocida se interpreta respetando el orden de sus posiciones.",
 },
 EN:{
  focus_close:"This is the issue that deserves attention before widening the question or looking for a prediction.",
  weighted_thesis:"The answer depends on the condition being met and on heeding the warning.",weighted_answer:a=>a,weighted_conditions:(c,w)=>`${c} Could change if: ${w}`,
  chron_ppt_thesis:"The antecedent explains the present and the present shapes the trend.",chron_ppt_dev:(p,pr)=>`${p} ${pr}`,chron_ppt_dir:t=>`${t} What you do now can reinforce or change that direction.`,
  chron_thesis:"The spread follows a sequence from the antecedent to the outcome.",chron_origin:(p,pr,h)=>`${p} ${pr} A still barely visible influence: ${h}`,chron_pressure:(o,env)=>`${o} External conditions: ${env}`,chron_response:(adv,res)=>`${adv} If it holds: ${res}`,
  trans_ceb_thesis:"One stage ends, leaves a lesson, and requires crossing a threshold before another begins.",trans_ending:(e,l)=>`${e} Lesson: ${l}`,trans_threshold:(th,b)=>`${th} Then: ${b}`,trans_first_step:fs=>`${fs} That action turns the ending into a real beginning.`,
  trans_thesis:"The reading distinguishes what still holds value, what needs to be released, and what can begin.",trans_selection:(k,r)=>`Still holds value: ${k} Needs to be released: ${r}`,trans_beginning:b=>`${b} It will be clearer if it doesn't try to rebuild exactly what you just let go of.`,
  diag_ors_thesis:(op,ri)=>`${op} ${ri}`,diag_ors_diag:(op,ri)=>`${op} However, ${ri}`,diag_ors_resp:st=>`${st} First see whether it can be applied; then decide how much to commit.`,
  diag_two_thesis:"The situation needs a concrete response.",diag_two:(s,a)=>`${s} ${a}`,
  diag_econ_thesis:"The block is sustained by a chain running from the origin to the pattern, and it can be broken from the available resource.",diag_econ_origin:(o,man,p)=>`Origin: ${o} Today: ${man} It repeats because ${p}`,diag_econ_exit:(r,ex)=>`Available resource: ${r} Way out: ${ex}`,
  diag_thesis:"The reading identifies what's happening, what complicates it, and how to respond.",diag_situation:(s,r)=>`${s}${r?` In your favor: ${r}`:""}`,diag_problem:(o,ext)=>`${o}${ext?` Also: ${ext}`:""}`,diag_response:a=>`${a} That response addresses the main conflict and allows you to weigh concrete changes.`,
  inner_thesis:"Thought, emotion, and behavior need to stop operating separately.",inner_relation:(mind,emo)=>`Mind: ${mind} Emotion: ${emo}`,inner_action:act=>`${act} Acting with awareness keeps a single emotion or isolated idea from deciding for the whole.`,
  psych_slr_thesis:"An inner pattern calls for a transformation, and the reading shows the capacity available to carry it out.",psych_shadow:(sh,le)=>`${sh} To stop repeating it: ${le}`,psych_resource:r=>`${r} From there a more conscious decision can emerge.`,
  psych_thesis:"The reading recognizes an inner experience, uncovers what asks to be understood, and carries it toward integration.",psych_recognition:(f,mid)=>`${f} ${mid}`,psych_integration:l=>`${l} Integration doesn't erase what was lived; it changes the way you respond.`,
  rel_align_yes:"Feeling, thought, and action show sufficient alignment.",rel_align_no:"The alignment is partial: what's felt, what's thought, and what will likely be done don't carry the same intensity.",rel_fta_thesis:"Feeling, thought, and behavior aren't equivalent and should be read in that order.",rel_feeling_thought:(f,t,al)=>`${f} ${t} ${al}`,rel_action:a=>`${a} Give more weight to facts than to an emotion or intention that hasn't been expressed yet.`,
  rel_prof:"In a professional partnership, that common ground must turn into collaboration and verifiable agreements.",rel_affective:"In an affective relationship, that common ground needs reciprocity and clearly expressed needs.",rel_bond_thesis:"The bond arises from two concrete dispositions, not from the wish of a single party.",rel_two_people:(s,o)=>`${s} ${o}`,rel_bond:(b,ctx)=>`${b} ${ctx}`,
  rel_thesis:"The relationship depends on what each side brings, their meeting point, and the tension both are willing to resolve.",rel_participants:(s,o)=>`${s} ${o}`,rel_bond_tension:(b,t)=>`${b}${t?` However, ${t}`:""}`,rel_development:f=>`${f} It can't be sustained by one-sided effort.`,
  dec_arr_thesis:"The probable outcome depends on using the advantage without downplaying the risk.",dec_arr_comp:(adv,ri)=>`In favor: ${adv} Risk: ${ri}`,dec_arr_result:r=>`${r} That outcome will be more viable if the caution becomes a concrete measure before moving forward.`,
  tl_advance:"advance",tl_wait:"wait",tl_stop:"stop",dec_tl_thesis:"The reading compares the relative support for advancing, waiting, and stopping.",dec_tl_signals:(adv,w,st)=>`Advance: ${adv} Wait: ${w} Stop: ${st}`,dec_tl_criterion:(label,interp,condLabel,condInterp)=>`The signal with the strongest relative support is ${label}: ${interp} It would change if the facts start to resemble the condition for ${condLabel} more: ${condInterp}`,
  dec_job_thesis:"The change should be measured by its reasons, its opportunity, its risk, and the outcome that can actually be sustained.",dec_job_current:(c,r)=>`${c} Reason for the change: ${r}`,dec_job_risk:(op,ri)=>`${op} However, ${ri}`,dec_job_result:(res,adv)=>`${res} Advice: ${adv}`,
  dec_thesis:"The choice becomes clearer by comparing what each path demands against its consequence.",dec_start:(s,mot)=>`${s}${mot?` Real motivation: ${mot}`:""}`,dec_path_a:(p,r)=>`${p} ${r}`,dec_path_b:(p,r)=>`${p} ${r} Compare which consequence matches your resources and priorities, not which one relieves the uncertainty first.`,
  res_thesis:"Resources follow a concrete chain: origin, inflow, leak, reserve, movement, and probable direction.",res_origin:(o,inf)=>`${o} ${inf} Resources can be money, time, energy, attention, or opportunities, depending on your question.`,res_leak:(l,r)=>`${l} Facing it: ${r}`,res_move:(mv,t)=>`${mv} Trend: ${t}`,
  proj_thesis:"The project's viability depends on coordinating idea, resources, external response, obstacle, and strategy.",proj_idea:(i,r)=>`${i} Resources: ${r}`,proj_obstacle:(mk,o)=>`${mk} ${o}`,proj_strategy:(st,r)=>`${st} ${r}`,
  celtic_thesis:(p,b,c,t)=>`Origin: ${p} Foundation: ${b} Conflict: ${c} Trend: ${t}`,celtic_origin:(p,b,s)=>`${p} ${b} ${s}`,celtic_conflict:(c,poss,nf)=>`${c} Even so, ${poss} ${nf}`,celtic_self:(att,env,hf)=>`${att} Outside: ${env} Expectation: ${hf}`,celtic_direction:t=>`${t} The possibility can only hold if it responds to the crossing and to the real conditions around it.`,
  houses_thesis:"The energy concentrates in the areas where the positions reinforce or block each other.",houses_self:(s,b)=>`${s} Bonds: ${b}`,houses_resources:(r,rt,v)=>`Resources: ${r} Routines: ${rt} Vocation: ${v}`,houses_home:(h,tr,vi)=>`Base: ${h} Transformation: ${tr} Vision: ${vi}`,houses_comm:(c,com,u)=>`Communication: ${c} Community: ${com} Unconscious: ${u}`,
  chakra_thesis:"The reading follows how security, desire, will, affection, expression, and vision integrate into a shared meaning.",chakra_foundation:(root,sac,sol)=>`Base: ${root} Sacral: ${sac} Solar plexus: ${sol}`,chakra_heart:(h,th)=>`Heart: ${h} Throat: ${th}`,chakra_vision:(te,cr)=>`Third eye: ${te} Crown: ${cr}`,
  star_thesis:"The core becomes clear by contrasting awareness and desire, and is resolved through resource, challenge, and action.",star_center:(c,aw,d)=>`${c} Awareness: ${aw} Desire: ${d}`,star_challenge:(r,c)=>`Resource: ${r} Challenge: ${c}`,star_action:(a,r)=>`${a} ${r}`,
  mandala_thesis:"The center receives influences from the past and the foundation, while other positions show beginning, action, closure, and learning.",mandala_center:(c,w,s)=>`Center: ${c} West: ${w} South: ${s}`,mandala_move:(n,ne,e,se)=>`North: ${n} Northeast: ${ne} East: ${e} Southeast: ${se}`,mandala_close:(sw,nw)=>`Southwest: ${sw} Northwest: ${nw}`,
  tree_thesis:"An intention descends from impulse and understanding down to a concrete manifestation.",tree_origin:(k,ch,b)=>`Keter: ${k} Chokmah: ${ch} Binah: ${b}`,tree_balance:(che,g,t)=>`Chesed: ${che} Gevurah: ${g} Tiferet: ${t}`,tree_foundation:(n,h,y)=>`Netzach: ${n} Hod: ${h} Yesod: ${y}`,tree_manifestation:mv=>mv,
  spirit_thesis:"The path is born from a calling, crosses a trial and a shadow, and is defined through choice, surrender, and integration.",spirit_calling:(c,o,bg)=>`${c} Origin: ${o} Baggage: ${bg}`,spirit_threshold:(g,th)=>`Guide: ${g} Threshold: ${th}`,spirit_trial:(t,sh,rv)=>`Trial: ${t} Shadow: ${sh} Revelation: ${rv}`,spirit_choice:(ch,su,i)=>`Choice: ${ch} Surrender: ${su} Integration: ${i}`,spirit_destination:d=>d,
  generic_thesis:"The unknown spread is interpreted respecting the order of its positions.",
 },
 FR:{
  focus_close:"C'est la question qui mérite de l'attention avant d'élargir la question ou de chercher une prédiction.",
  weighted_thesis:"La réponse dépend du respect de la condition et de la prise en compte de l'avertissement.",weighted_answer:a=>a,weighted_conditions:(c,w)=>`${c} Pourrait changer si : ${w}`,
  chron_ppt_thesis:"L'antécédent explique le présent et le présent conditionne la tendance.",chron_ppt_dev:(p,pr)=>`${p} ${pr}`,chron_ppt_dir:t=>`${t} Ce que tu fais maintenant peut renforcer ou modifier cette direction.`,
  chron_thesis:"Le tirage suit une séquence depuis l'antécédent jusqu'au résultat.",chron_origin:(p,pr,h)=>`${p} ${pr} Influence encore peu visible : ${h}`,chron_pressure:(o,env)=>`${o} Conditions extérieures : ${env}`,chron_response:(adv,res)=>`${adv} Si elle se maintient : ${res}`,
  trans_ceb_thesis:"Une étape se termine, laisse un apprentissage et exige de franchir un seuil avant d'en commencer une autre.",trans_ending:(e,l)=>`${e} Enseignement : ${l}`,trans_threshold:(th,b)=>`${th} Ensuite : ${b}`,trans_first_step:fs=>`${fs} Cette action transforme la clôture en un véritable commencement.`,
  trans_thesis:"La lecture distingue ce qui conserve de la valeur, ce qui doit être lâché et ce qui peut commencer.",trans_selection:(k,r)=>`Conserve de la valeur : ${k} Doit être lâché : ${r}`,trans_beginning:b=>`${b} Ce sera plus clair s'il n'essaie pas de reconstruire exactement ce que tu viens de lâcher.`,
  diag_ors_thesis:(op,ri)=>`${op} ${ri}`,diag_ors_diag:(op,ri)=>`${op} Cependant, ${ri}`,diag_ors_resp:st=>`${st} Observe d'abord si elle peut s'appliquer ; décide ensuite combien t'engager.`,
  diag_two_thesis:"La situation a besoin d'une réponse concrète.",diag_two:(s,a)=>`${s} ${a}`,
  diag_econ_thesis:"Le blocage se maintient par une chaîne qui va de l'origine au schéma et peut être rompu depuis la ressource disponible.",diag_econ_origin:(o,man,p)=>`Origine : ${o} Aujourd'hui : ${man} Se répète parce que ${p}`,diag_econ_exit:(r,ex)=>`Ressource disponible : ${r} Sortie : ${ex}`,
  diag_thesis:"La lecture identifie ce qui se passe, ce qui le complique et comment répondre.",diag_situation:(s,r)=>`${s}${r?` En ta faveur : ${r}`:""}`,diag_problem:(o,ext)=>`${o}${ext?` De plus : ${ext}`:""}`,diag_response:a=>`${a} Cette réponse s'occupe du conflit principal et permet d'évaluer des changements concrets.`,
  inner_thesis:"Pensée, émotion et conduite doivent cesser de fonctionner séparément.",inner_relation:(mind,emo)=>`Esprit : ${mind} Émotion : ${emo}`,inner_action:act=>`${act} Agir en conscience évite qu'une émotion ou une idée isolée décide pour l'ensemble.`,
  psych_slr_thesis:"Un schéma intérieur exige une transformation, et la lecture montre la capacité disponible pour la réaliser.",psych_shadow:(sh,le)=>`${sh} Pour cesser de le répéter : ${le}`,psych_resource:r=>`${r} De là peut naître une décision plus consciente.`,
  psych_thesis:"La lecture reconnaît une expérience intérieure, découvre ce qui demande à être compris et la mène vers une intégration.",psych_recognition:(f,mid)=>`${f} ${mid}`,psych_integration:l=>`${l} L'intégration n'efface pas ce qui a été vécu ; elle modifie la façon de répondre.`,
  rel_align_yes:"Sentiment, pensée et action montrent un alignement suffisant.",rel_align_no:"L'alignement est partiel : ce qui est ressenti, ce qui est pensé et ce qui sera probablement fait n'ont pas la même intensité.",rel_fta_thesis:"Sentiment, pensée et conduite ne sont pas équivalents et doivent se lire dans cet ordre.",rel_feeling_thought:(f,t,al)=>`${f} ${t} ${al}`,rel_action:a=>`${a} Donne plus de poids aux faits qu'à une émotion ou une intention pas encore exprimée.`,
  rel_prof:"Dans une association professionnelle, ce point commun doit se transformer en collaboration et en accords vérifiables.",rel_affective:"Dans une relation affective, ce point commun a besoin de réciprocité et de besoins exprimés clairement.",rel_bond_thesis:"Le lien naît de deux dispositions concrètes, pas du désir d'une seule partie.",rel_two_people:(s,o)=>`${s} ${o}`,rel_bond:(b,ctx)=>`${b} ${ctx}`,
  rel_thesis:"La relation dépend de ce qu'apporte chaque partie, de leur point de rencontre et de la tension que les deux sont disposées à résoudre.",rel_participants:(s,o)=>`${s} ${o}`,rel_bond_tension:(b,t)=>`${b}${t?` Cependant, ${t}`:""}`,rel_development:f=>`${f} Il ne peut se maintenir par un effort unilatéral.`,
  dec_arr_thesis:"Le résultat probable dépend de l'utilisation de l'avantage sans minimiser le risque.",dec_arr_comp:(adv,ri)=>`En faveur : ${adv} Risque : ${ri}`,dec_arr_result:r=>`${r} Ce résultat sera plus viable si la prudence se transforme en mesure concrète avant d'avancer.`,
  tl_advance:"avancer",tl_wait:"attendre",tl_stop:"s'arrêter",dec_tl_thesis:"La lecture compare le soutien relatif d'avancer, d'attendre et de s'arrêter.",dec_tl_signals:(adv,w,st)=>`Avancer : ${adv} Attendre : ${w} S'arrêter : ${st}`,dec_tl_criterion:(label,interp,condLabel,condInterp)=>`Le signal avec le plus grand soutien relatif est ${label} : ${interp} Cela changerait si les faits commencent à ressembler davantage à la condition de ${condLabel} : ${condInterp}`,
  dec_job_thesis:"Le changement doit se mesurer à ses raisons, son opportunité, son risque et le résultat qui peut réellement se maintenir.",dec_job_current:(c,r)=>`${c} Raison du changement : ${r}`,dec_job_risk:(op,ri)=>`${op} Cependant, ${ri}`,dec_job_result:(res,adv)=>`${res} Conseil : ${adv}`,
  dec_thesis:"Le choix s'éclaircit en comparant ce qu'exige chaque chemin avec sa conséquence.",dec_start:(s,mot)=>`${s}${mot?` Motivation réelle : ${mot}`:""}`,dec_path_a:(p,r)=>`${p} ${r}`,dec_path_b:(p,r)=>`${p} ${r} Compare quelle conséquence correspond à tes ressources et priorités, pas celle qui soulage en premier l'incertitude.`,
  res_thesis:"Les ressources suivent une chaîne concrète : origine, entrée, fuite, conservation, mouvement et direction probable.",res_origin:(o,inf)=>`${o} ${inf} Les ressources peuvent être de l'argent, du temps, de l'énergie, de l'attention ou des opportunités, selon ta question.`,res_leak:(l,r)=>`${l} Face à cela : ${r}`,res_move:(mv,t)=>`${mv} Tendance : ${t}`,
  proj_thesis:"La viabilité du projet dépend de la coordination entre l'idée, les ressources, la réponse extérieure, l'obstacle et la stratégie.",proj_idea:(i,r)=>`${i} Ressources : ${r}`,proj_obstacle:(mk,o)=>`${mk} ${o}`,proj_strategy:(st,r)=>`${st} ${r}`,
  celtic_thesis:(p,b,c,t)=>`Origine : ${p} Base : ${b} Conflit : ${c} Tendance : ${t}`,celtic_origin:(p,b,s)=>`${p} ${b} ${s}`,celtic_conflict:(c,poss,nf)=>`${c} Malgré tout, ${poss} ${nf}`,celtic_self:(att,env,hf)=>`${att} À l'extérieur : ${env} Attente : ${hf}`,celtic_direction:t=>`${t} La possibilité ne pourra se maintenir que si elle répond au croisement et aux conditions réelles de l'environnement.`,
  houses_thesis:"L'énergie se concentre dans les zones où les positions se renforcent ou se bloquent mutuellement.",houses_self:(s,b)=>`${s} Liens : ${b}`,houses_resources:(r,rt,v)=>`Ressources : ${r} Routines : ${rt} Vocation : ${v}`,houses_home:(h,tr,vi)=>`Base : ${h} Transformation : ${tr} Vision : ${vi}`,houses_comm:(c,com,u)=>`Communication : ${c} Communauté : ${com} Inconscient : ${u}`,
  chakra_thesis:"La lecture suit comment sécurité, désir, volonté, affection, expression et vision s'intègrent en un sens commun.",chakra_foundation:(root,sac,sol)=>`Base : ${root} Sacré : ${sac} Plexus solaire : ${sol}`,chakra_heart:(h,th)=>`Cœur : ${h} Gorge : ${th}`,chakra_vision:(te,cr)=>`Troisième œil : ${te} Couronne : ${cr}`,
  star_thesis:"Le centre s'éclaircit en confrontant conscience et désir, et se résout par la ressource, le défi et l'action.",star_center:(c,aw,d)=>`${c} Conscience : ${aw} Désir : ${d}`,star_challenge:(r,c)=>`Ressource : ${r} Défi : ${c}`,star_action:(a,r)=>`${a} ${r}`,
  mandala_thesis:"Le centre reçoit des influences du passé et du fondement, tandis que d'autres positions montrent commencement, action, clôture et apprentissage.",mandala_center:(c,w,s)=>`Centre : ${c} Ouest : ${w} Sud : ${s}`,mandala_move:(n,ne,e,se)=>`Nord : ${n} Nord-Est : ${ne} Est : ${e} Sud-Est : ${se}`,mandala_close:(sw,nw)=>`Sud-Ouest : ${sw} Nord-Ouest : ${nw}`,
  tree_thesis:"Une intention descend depuis l'impulsion et la compréhension jusqu'à une manifestation concrète.",tree_origin:(k,ch,b)=>`Kéter : ${k} Jojmá : ${ch} Biná : ${b}`,tree_balance:(che,g,t)=>`Jésed : ${che} Guevurá : ${g} Tiféret : ${t}`,tree_foundation:(n,h,y)=>`Nétzaj : ${n} Hod : ${h} Yesod : ${y}`,tree_manifestation:mv=>mv,
  spirit_thesis:"Le chemin naît d'un appel, traverse une épreuve et une ombre, et se définit par le choix, l'abandon et l'intégration.",spirit_calling:(c,o,bg)=>`${c} Origine : ${o} Bagages : ${bg}`,spirit_threshold:(g,th)=>`Guide : ${g} Seuil : ${th}`,spirit_trial:(t,sh,rv)=>`Épreuve : ${t} Ombre : ${sh} Révélation : ${rv}`,spirit_choice:(ch,su,i)=>`Choix : ${ch} Abandon : ${su} Intégration : ${i}`,spirit_destination:d=>d,
  generic_thesis:"Le tirage inconnu est interprété en respectant l'ordre de ses positions.",
 },
 DE:{
  focus_close:"Das ist die Frage, die Aufmerksamkeit verdient, bevor du die Frage erweiterst oder nach einer Vorhersage suchst.",
  weighted_thesis:"Die Antwort hängt davon ab, dass die Bedingung erfüllt wird und die Warnung beachtet wird.",weighted_answer:a=>a,weighted_conditions:(c,w)=>`${c} Könnte sich ändern, wenn: ${w}`,
  chron_ppt_thesis:"Der Vorläufer erklärt die Gegenwart, und die Gegenwart bestimmt die Tendenz.",chron_ppt_dev:(p,pr)=>`${p} ${pr}`,chron_ppt_dir:t=>`${t} Was du jetzt tust, kann diese Richtung verstärken oder verändern.`,
  chron_thesis:"Die Legung folgt einer Abfolge vom Vorläufer bis zum Ergebnis.",chron_origin:(p,pr,h)=>`${p} ${pr} Noch kaum sichtbarer Einfluss: ${h}`,chron_pressure:(o,env)=>`${o} Äußere Bedingungen: ${env}`,chron_response:(adv,res)=>`${adv} Wenn es anhält: ${res}`,
  trans_ceb_thesis:"Eine Phase endet, hinterlässt eine Lektion und verlangt, eine Schwelle zu überschreiten, bevor eine andere beginnt.",trans_ending:(e,l)=>`${e} Lektion: ${l}`,trans_threshold:(th,b)=>`${th} Danach: ${b}`,trans_first_step:fs=>`${fs} Diese Handlung verwandelt den Abschluss in einen echten Neuanfang.`,
  trans_thesis:"Die Lesung unterscheidet, was noch Wert hat, was losgelassen werden muss und was beginnen kann.",trans_selection:(k,r)=>`Behält Wert: ${k} Muss losgelassen werden: ${r}`,trans_beginning:b=>`${b} Er wird klarer, wenn er nicht versucht, genau das wiederaufzubauen, was du gerade losgelassen hast.`,
  diag_ors_thesis:(op,ri)=>`${op} ${ri}`,diag_ors_diag:(op,ri)=>`${op} Allerdings ${ri}`,diag_ors_resp:st=>`${st} Beobachte zuerst, ob sie sich anwenden lässt; entscheide dann, wie viel du einsetzt.`,
  diag_two_thesis:"Die Situation braucht eine konkrete Antwort.",diag_two:(s,a)=>`${s} ${a}`,
  diag_econ_thesis:"Die Blockade wird durch eine Kette gestützt, die vom Ursprung zum Muster reicht, und kann von der verfügbaren Ressource aus durchbrochen werden.",diag_econ_origin:(o,man,p)=>`Ursprung: ${o} Heute: ${man} Wiederholt sich, weil ${p}`,diag_econ_exit:(r,ex)=>`Verfügbare Ressource: ${r} Ausweg: ${ex}`,
  diag_thesis:"Die Lesung identifiziert, was geschieht, was es erschwert und wie man reagieren sollte.",diag_situation:(s,r)=>`${s}${r?` Zu deinen Gunsten: ${r}`:""}`,diag_problem:(o,ext)=>`${o}${ext?` Außerdem: ${ext}`:""}`,diag_response:a=>`${a} Diese Antwort geht auf den Hauptkonflikt ein und erlaubt es, konkrete Veränderungen abzuwägen.`,
  inner_thesis:"Denken, Gefühl und Verhalten dürfen nicht länger getrennt voneinander wirken.",inner_relation:(mind,emo)=>`Verstand: ${mind} Gefühl: ${emo}`,inner_action:act=>`${act} Bewusst zu handeln verhindert, dass eine einzelne Emotion oder eine isolierte Idee für das Ganze entscheidet.`,
  psych_slr_thesis:"Ein inneres Muster verlangt eine Transformation, und die Lesung zeigt die verfügbare Fähigkeit, sie zu vollziehen.",psych_shadow:(sh,le)=>`${sh} Um aufzuhören, es zu wiederholen: ${le}`,psych_resource:r=>`${r} Daraus kann eine bewusstere Entscheidung entstehen.`,
  psych_thesis:"Die Lesung erkennt eine innere Erfahrung, deckt auf, was verstanden werden will, und führt sie zu einer Integration.",psych_recognition:(f,mid)=>`${f} ${mid}`,psych_integration:l=>`${l} Die Integration löscht das Erlebte nicht; sie verändert die Art zu reagieren.`,
  rel_align_yes:"Gefühl, Gedanke und Handlung zeigen ausreichende Übereinstimmung.",rel_align_no:"Die Übereinstimmung ist teilweise: Was gefühlt, was gedacht und was wahrscheinlich getan wird, haben nicht dieselbe Intensität.",rel_fta_thesis:"Gefühl, Gedanke und Verhalten sind nicht gleichwertig und sollten in dieser Reihenfolge gelesen werden.",rel_feeling_thought:(f,t,al)=>`${f} ${t} ${al}`,rel_action:a=>`${a} Gib den Fakten mehr Gewicht als einer noch nicht ausgedrückten Emotion oder Absicht.`,
  rel_prof:"In einer beruflichen Partnerschaft muss dieser gemeinsame Punkt zu Zusammenarbeit und überprüfbaren Vereinbarungen werden.",rel_affective:"In einer emotionalen Beziehung braucht dieser gemeinsame Punkt Gegenseitigkeit und klar ausgedrückte Bedürfnisse.",rel_bond_thesis:"Die Bindung entsteht aus zwei konkreten Haltungen, nicht aus dem Wunsch einer einzigen Seite.",rel_two_people:(s,o)=>`${s} ${o}`,rel_bond:(b,ctx)=>`${b} ${ctx}`,
  rel_thesis:"Die Beziehung hängt davon ab, was jede Seite einbringt, von ihrem Treffpunkt und von der Spannung, die beide zu lösen bereit sind.",rel_participants:(s,o)=>`${s} ${o}`,rel_bond_tension:(b,t)=>`${b}${t?` Allerdings ${t}`:""}`,rel_development:f=>`${f} Sie kann nicht durch einseitige Anstrengung getragen werden.`,
  dec_arr_thesis:"Das wahrscheinliche Ergebnis hängt davon ab, den Vorteil zu nutzen, ohne das Risiko herunterzuspielen.",dec_arr_comp:(adv,ri)=>`Dafür: ${adv} Risiko: ${ri}`,dec_arr_result:r=>`${r} Dieses Ergebnis wird tragfähiger, wenn die Vorsicht zu einer konkreten Maßnahme wird, bevor du weitergehst.`,
  tl_advance:"vorangehen",tl_wait:"warten",tl_stop:"anhalten",dec_tl_thesis:"Die Lesung vergleicht die relative Unterstützung für Vorangehen, Warten und Anhalten.",dec_tl_signals:(adv,w,st)=>`Vorangehen: ${adv} Warten: ${w} Anhalten: ${st}`,dec_tl_criterion:(label,interp,condLabel,condInterp)=>`Das Signal mit der stärksten relativen Unterstützung ist ${label}: ${interp} Das würde sich ändern, wenn die Fakten mehr der Bedingung für ${condLabel} ähneln: ${condInterp}`,
  dec_job_thesis:"Die Veränderung sollte an ihren Gründen, ihrer Gelegenheit, ihrem Risiko und dem tatsächlich tragfähigen Ergebnis gemessen werden.",dec_job_current:(c,r)=>`${c} Grund für den Wechsel: ${r}`,dec_job_risk:(op,ri)=>`${op} Allerdings ${ri}`,dec_job_result:(res,adv)=>`${res} Rat: ${adv}`,
  dec_thesis:"Die Wahl wird klarer, wenn man vergleicht, was jeder Weg verlangt, mit seiner Konsequenz.",dec_start:(s,mot)=>`${s}${mot?` Wirkliche Motivation: ${mot}`:""}`,dec_path_a:(p,r)=>`${p} ${r}`,dec_path_b:(p,r)=>`${p} ${r} Vergleiche, welche Konsequenz zu deinen Ressourcen und Prioritäten passt, nicht welche zuerst die Unsicherheit lindert.`,
  res_thesis:"Ressourcen folgen einer konkreten Kette: Ursprung, Zufluss, Leck, Bewahrung, Bewegung und wahrscheinliche Richtung.",res_origin:(o,inf)=>`${o} ${inf} Ressourcen können Geld, Zeit, Energie, Aufmerksamkeit oder Gelegenheiten sein, je nach deiner Frage.`,res_leak:(l,r)=>`${l} Dem gegenüber: ${r}`,res_move:(mv,t)=>`${mv} Tendenz: ${t}`,
  proj_thesis:"Die Tragfähigkeit des Projekts hängt davon ab, Idee, Ressourcen, äußere Reaktion, Hindernis und Strategie zu koordinieren.",proj_idea:(i,r)=>`${i} Ressourcen: ${r}`,proj_obstacle:(mk,o)=>`${mk} ${o}`,proj_strategy:(st,r)=>`${st} ${r}`,
  celtic_thesis:(p,b,c,t)=>`Ursprung: ${p} Grundlage: ${b} Konflikt: ${c} Tendenz: ${t}`,celtic_origin:(p,b,s)=>`${p} ${b} ${s}`,celtic_conflict:(c,poss,nf)=>`${c} Dennoch, ${poss} ${nf}`,celtic_self:(att,env,hf)=>`${att} Draußen: ${env} Erwartung: ${hf}`,celtic_direction:t=>`${t} Die Möglichkeit kann sich nur halten, wenn sie auf die Kreuzung und die realen Umstände reagiert.`,
  houses_thesis:"Die Energie konzentriert sich in den Bereichen, in denen sich die Positionen gegenseitig verstärken oder blockieren.",houses_self:(s,b)=>`${s} Bindungen: ${b}`,houses_resources:(r,rt,v)=>`Ressourcen: ${r} Routinen: ${rt} Berufung: ${v}`,houses_home:(h,tr,vi)=>`Basis: ${h} Transformation: ${tr} Vision: ${vi}`,houses_comm:(c,com,u)=>`Kommunikation: ${c} Gemeinschaft: ${com} Unbewusstes: ${u}`,
  chakra_thesis:"Die Lesung verfolgt, wie Sicherheit, Verlangen, Wille, Zuneigung, Ausdruck und Vision sich zu einem gemeinsamen Sinn verbinden.",chakra_foundation:(root,sac,sol)=>`Basis: ${root} Sakral: ${sac} Solarplexus: ${sol}`,chakra_heart:(h,th)=>`Herz: ${h} Kehle: ${th}`,chakra_vision:(te,cr)=>`Drittes Auge: ${te} Krone: ${cr}`,
  star_thesis:"Der Kern wird klar, indem man Bewusstsein und Verlangen gegenüberstellt, und löst sich durch Ressource, Herausforderung und Handlung.",star_center:(c,aw,d)=>`${c} Bewusstsein: ${aw} Verlangen: ${d}`,star_challenge:(r,c)=>`Ressource: ${r} Herausforderung: ${c}`,star_action:(a,r)=>`${a} ${r}`,
  mandala_thesis:"Die Mitte empfängt Einflüsse aus Vergangenheit und Grundlage, während andere Positionen Anfang, Handlung, Abschluss und Lektion zeigen.",mandala_center:(c,w,s)=>`Zentrum: ${c} Westen: ${w} Süden: ${s}`,mandala_move:(n,ne,e,se)=>`Norden: ${n} Nordosten: ${ne} Osten: ${e} Südosten: ${se}`,mandala_close:(sw,nw)=>`Südwesten: ${sw} Nordwesten: ${nw}`,
  tree_thesis:"Eine Absicht steigt vom Impuls und dem Verständnis bis zu einer konkreten Manifestation herab.",tree_origin:(k,ch,b)=>`Keter: ${k} Chokmah: ${ch} Binah: ${b}`,tree_balance:(che,g,t)=>`Chesed: ${che} Gevurah: ${g} Tiferet: ${t}`,tree_foundation:(n,h,y)=>`Netzach: ${n} Hod: ${h} Yesod: ${y}`,tree_manifestation:mv=>mv,
  spirit_thesis:"Der Weg entsteht aus einer Berufung, durchquert eine Prüfung und einen Schatten und definiert sich durch Wahl, Hingabe und Integration.",spirit_calling:(c,o,bg)=>`${c} Ursprung: ${o} Gepäck: ${bg}`,spirit_threshold:(g,th)=>`Führung: ${g} Schwelle: ${th}`,spirit_trial:(t,sh,rv)=>`Prüfung: ${t} Schatten: ${sh} Enthüllung: ${rv}`,spirit_choice:(ch,su,i)=>`Wahl: ${ch} Hingabe: ${su} Integration: ${i}`,spirit_destination:d=>d,
  generic_thesis:"Die unbekannte Legung wird unter Beachtung der Reihenfolge ihrer Positionen interpretiert.",
 },
 PT:{
  focus_close:"Esta é a questão que merece atenção antes de ampliar a pergunta ou buscar uma previsão.",
  weighted_thesis:"A resposta depende de que a condição se cumpra e de atender ao aviso.",weighted_answer:a=>a,weighted_conditions:(c,w)=>`${c} Poderia mudar se: ${w}`,
  chron_ppt_thesis:"O antecedente explica o presente e o presente condiciona a tendência.",chron_ppt_dev:(p,pr)=>`${p} ${pr}`,chron_ppt_dir:t=>`${t} O que você faz agora pode reforçar ou modificar essa direção.`,
  chron_thesis:"A tiragem segue uma sequência do antecedente até o resultado.",chron_origin:(p,pr,h)=>`${p} ${pr} Influência ainda pouco visível: ${h}`,chron_pressure:(o,env)=>`${o} Condições externas: ${env}`,chron_response:(adv,res)=>`${adv} Se se sustentar: ${res}`,
  trans_ceb_thesis:"Uma etapa termina, deixa um aprendizado e exige atravessar um limiar antes de começar outra.",trans_ending:(e,l)=>`${e} Ensinamento: ${l}`,trans_threshold:(th,b)=>`${th} Depois: ${b}`,trans_first_step:fs=>`${fs} Essa ação transforma o fechamento em um começo real.`,
  trans_thesis:"A leitura distingue o que conserva valor, o que deve ser solto e o que pode começar.",trans_selection:(k,r)=>`Conserva valor: ${k} Deve ser solto: ${r}`,trans_beginning:b=>`${b} Ficará mais claro se não tentar reconstruir exatamente o que você acabou de soltar.`,
  diag_ors_thesis:(op,ri)=>`${op} ${ri}`,diag_ors_diag:(op,ri)=>`${op} No entanto, ${ri}`,diag_ors_resp:st=>`${st} Primeiro observe se pode ser aplicada; depois decida quanto comprometer.`,
  diag_two_thesis:"A situação precisa de uma resposta concreta.",diag_two:(s,a)=>`${s} ${a}`,
  diag_econ_thesis:"O bloqueio se sustenta por uma cadeia que vai da origem ao padrão e pode ser rompido a partir do recurso disponível.",diag_econ_origin:(o,man,p)=>`Origem: ${o} Hoje: ${man} Se repete porque ${p}`,diag_econ_exit:(r,ex)=>`Recurso disponível: ${r} Saída: ${ex}`,
  diag_thesis:"A leitura identifica o que ocorre, o que o complica e como responder.",diag_situation:(s,r)=>`${s}${r?` A seu favor: ${r}`:""}`,diag_problem:(o,ext)=>`${o}${ext?` Além disso: ${ext}`:""}`,diag_response:a=>`${a} Essa resposta atende ao conflito principal e permite avaliar mudanças concretas.`,
  inner_thesis:"Pensamento, emoção e conduta precisam deixar de operar separadamente.",inner_relation:(mind,emo)=>`Mente: ${mind} Emoção: ${emo}`,inner_action:act=>`${act} Agir com consciência evita que uma emoção ou uma ideia isolada decida por todo o conjunto.`,
  psych_slr_thesis:"Um padrão interno exige uma transformação e a leitura mostra a capacidade disponível para realizá-la.",psych_shadow:(sh,le)=>`${sh} Para deixar de repeti-lo: ${le}`,psych_resource:r=>`${r} Daí pode surgir uma decisão mais consciente.`,
  psych_thesis:"A leitura reconhece uma experiência interna, descobre o que pede para ser compreendido e a leva rumo a uma integração.",psych_recognition:(f,mid)=>`${f} ${mid}`,psych_integration:l=>`${l} A integração não apaga o vivido; modifica a forma de responder.`,
  rel_align_yes:"Sentimento, pensamento e ação mostram um alinhamento suficiente.",rel_align_no:"O alinhamento é parcial: o que se sente, o que se pensa e o que provavelmente se fará não têm a mesma intensidade.",rel_fta_thesis:"Sentimento, pensamento e conduta não são equivalentes e devem ser lidos nessa ordem.",rel_feeling_thought:(f,t,al)=>`${f} ${t} ${al}`,rel_action:a=>`${a} Dê mais peso aos fatos do que a uma emoção ou intenção ainda não expressada.`,
  rel_prof:"Em uma parceria profissional, esse ponto comum deve se transformar em colaboração e acordos verificáveis.",rel_affective:"Em uma relação afetiva, esse ponto comum precisa de reciprocidade e necessidades expressas com clareza.",rel_bond_thesis:"O vínculo surge de duas disposições concretas, não do desejo de uma única parte.",rel_two_people:(s,o)=>`${s} ${o}`,rel_bond:(b,ctx)=>`${b} ${ctx}`,
  rel_thesis:"O relacionamento depende do que cada parte traz, do seu ponto de encontro e da tensão que ambas estão dispostas a resolver.",rel_participants:(s,o)=>`${s} ${o}`,rel_bond_tension:(b,t)=>`${b}${t?` No entanto, ${t}`:""}`,rel_development:f=>`${f} Não pode se sustentar a partir do esforço unilateral.`,
  dec_arr_thesis:"O resultado provável depende de usar a vantagem sem minimizar o risco.",dec_arr_comp:(adv,ri)=>`A favor: ${adv} Risco: ${ri}`,dec_arr_result:r=>`${r} Esse resultado será mais viável se a precaução se tornar uma medida concreta antes de avançar.`,
  tl_advance:"avançar",tl_wait:"esperar",tl_stop:"parar",dec_tl_thesis:"A leitura compara o respaldo relativo de avançar, esperar e parar.",dec_tl_signals:(adv,w,st)=>`Avançar: ${adv} Esperar: ${w} Parar: ${st}`,dec_tl_criterion:(label,interp,condLabel,condInterp)=>`O sinal com maior respaldo relativo é ${label}: ${interp} Isso mudaria se os fatos começarem a se parecer mais com a condição de ${condLabel}: ${condInterp}`,
  dec_job_thesis:"A mudança deve ser medida por suas razões, sua oportunidade, seu risco e o resultado que realmente pode se sustentar.",dec_job_current:(c,r)=>`${c} Motivo da mudança: ${r}`,dec_job_risk:(op,ri)=>`${op} No entanto, ${ri}`,dec_job_result:(res,adv)=>`${res} Conselho: ${adv}`,
  dec_thesis:"A escolha fica mais clara ao comparar o que cada caminho exige com sua consequência.",dec_start:(s,mot)=>`${s}${mot?` Motivação real: ${mot}`:""}`,dec_path_a:(p,r)=>`${p} ${r}`,dec_path_b:(p,r)=>`${p} ${r} Compare qual consequência combina com seus recursos e prioridades, não qual alivia primeiro a incerteza.`,
  res_thesis:"Os recursos seguem uma cadeia concreta: origem, entrada, fuga, conservação, movimento e direção provável.",res_origin:(o,inf)=>`${o} ${inf} Os recursos podem ser dinheiro, tempo, energia, atenção ou oportunidades, conforme sua pergunta.`,res_leak:(l,r)=>`${l} Diante disso: ${r}`,res_move:(mv,t)=>`${mv} Tendência: ${t}`,
  proj_thesis:"A viabilidade do projeto depende de coordenar ideia, recursos, resposta externa, obstáculo e estratégia.",proj_idea:(i,r)=>`${i} Recursos: ${r}`,proj_obstacle:(mk,o)=>`${mk} ${o}`,proj_strategy:(st,r)=>`${st} ${r}`,
  celtic_thesis:(p,b,c,t)=>`Origem: ${p} Base: ${b} Conflito: ${c} Tendência: ${t}`,celtic_origin:(p,b,s)=>`${p} ${b} ${s}`,celtic_conflict:(c,poss,nf)=>`${c} Mesmo assim, ${poss} ${nf}`,celtic_self:(att,env,hf)=>`${att} Fora: ${env} Expectativa: ${hf}`,celtic_direction:t=>`${t} A possibilidade só poderá se sustentar se responder ao cruzamento e às condições reais do ambiente.`,
  houses_thesis:"A energia se concentra nas áreas onde as posições se reforçam ou se bloqueiam entre si.",houses_self:(s,b)=>`${s} Vínculos: ${b}`,houses_resources:(r,rt,v)=>`Recursos: ${r} Rotinas: ${rt} Vocação: ${v}`,houses_home:(h,tr,vi)=>`Base: ${h} Transformação: ${tr} Visão: ${vi}`,houses_comm:(c,com,u)=>`Comunicação: ${c} Comunidade: ${com} Inconsciente: ${u}`,
  chakra_thesis:"A leitura acompanha como segurança, desejo, vontade, afeto, expressão e visão se integram em um sentido comum.",chakra_foundation:(root,sac,sol)=>`Base: ${root} Sacro: ${sac} Plexo solar: ${sol}`,chakra_heart:(h,th)=>`Coração: ${h} Garganta: ${th}`,chakra_vision:(te,cr)=>`Terceiro olho: ${te} Coroa: ${cr}`,
  star_thesis:"O centro se esclarece ao contrastar consciência e desejo, e se resolve por meio de recurso, desafio e ação.",star_center:(c,aw,d)=>`${c} Consciência: ${aw} Desejo: ${d}`,star_challenge:(r,c)=>`Recurso: ${r} Desafio: ${c}`,star_action:(a,r)=>`${a} ${r}`,
  mandala_thesis:"O centro recebe influências do passado e do fundamento, enquanto outras posições mostram início, ação, fechamento e aprendizado.",mandala_center:(c,w,s)=>`Centro: ${c} Oeste: ${w} Sul: ${s}`,mandala_move:(n,ne,e,se)=>`Norte: ${n} Nordeste: ${ne} Leste: ${e} Sudeste: ${se}`,mandala_close:(sw,nw)=>`Sudoeste: ${sw} Noroeste: ${nw}`,
  tree_thesis:"Uma intenção desce do impulso e da compreensão até uma manifestação concreta.",tree_origin:(k,ch,b)=>`Kéter: ${k} Chokmah: ${ch} Binah: ${b}`,tree_balance:(che,g,t)=>`Chesed: ${che} Gevurah: ${g} Tiféret: ${t}`,tree_foundation:(n,h,y)=>`Netzach: ${n} Hod: ${h} Yesod: ${y}`,tree_manifestation:mv=>mv,
  spirit_thesis:"O caminho nasce de um chamado, atravessa uma provação e uma sombra, e se define por meio de escolha, entrega e integração.",spirit_calling:(c,o,bg)=>`${c} Origem: ${o} Bagagem: ${bg}`,spirit_threshold:(g,th)=>`Guia: ${g} Limiar: ${th}`,spirit_trial:(t,sh,rv)=>`Provação: ${t} Sombra: ${sh} Revelação: ${rv}`,spirit_choice:(ch,su,i)=>`Escolha: ${ch} Entrega: ${su} Integração: ${i}`,spirit_destination:d=>d,
  generic_thesis:"A tiragem desconhecida é interpretada respeitando a ordem de suas posições.",
 },
};
function grammarSynthesis(analysis,cards){
 const grammar=analysis.spreadGrammar,entries=grammarEntries(analysis,cards),byId=new Map(entries.map(entry=>[entry.spec.id,entry])),at=id=>byId.get(id),m=id=>at(id)?.interpretation||"",card=id=>at(id)?.cardData,cap=id=>sentence(trimSentence(m(id))),ordered=grammar.narrativeOrder.map(at).filter(Boolean),strategy=grammar.narrativeStrategy;
 const lang=analysis.context?.language||"ES",gt=GT[lang]||GT.ES,relationships=(analysis.propositionRelations||[]).map(relation=>({...relation,positions:[at(relation.from)?.position,at(relation.to)?.position].filter(Boolean),relationship:relation.type,importance:"high"})),movement=(from,to)=>contextualRelationMovement(at(from),at(to),relationships,lang)||semanticMovement(card(from),card(to),lang),agencyEntries=entries.filter(entry=>["self","attitude","action","advice","resource","movement","condition","learning","thought","feeling","motivation"].includes(entry.role)),externalEntries=entries.filter(entry=>["external","other","outcome","future"].includes(entry.role));
 const pack=(reading_thesis,central_tension,main_movement,arcs)=>({strategy,domain:analysis.context.domain,mode:grammar.mode,reading_thesis,central_tension,main_movement,arcs,key_relationships:relationships,agency:{depends_on_consultant:agencyEntries.map(entry=>entry.interpretation),depends_on_others:entries.filter(entry=>entry.role==="other").map(entry=>entry.interpretation),depends_on_circumstances:externalEntries.map(entry=>entry.interpretation)},warning:grammarCaution(entries,lang),actionable_guidance:grammarAction(entries,lang),purpose:grammar.purpose,fallbackUsed:false});

 if(strategy==="focus")return pack(m("message"),m("message"),narrativeState(card("message")),{focus:`${cap("message")}. ${gt.focus_close}`});
 if(strategy==="weighted_answer")return pack(gt.weighted_thesis,m("warning"),movement("condition","answer"),{answer:gt.weighted_answer(m("answer")),conditions:gt.weighted_conditions(m("condition"),m("warning"))});
 if(strategy==="chronological"){
  if(grammar.id==="past_present_trend")return pack(gt.chron_ppt_thesis,m("present"),movement("past","trend"),{development:gt.chron_ppt_dev(cap("past"),m("present")),direction:gt.chron_ppt_dir(m("trend"))});
  return pack(gt.chron_thesis,m("obstacle"),movement("past","result"),{origin_and_present:gt.chron_origin(cap("past"),m("present"),m("hidden")),pressure:gt.chron_pressure(cap("obstacle"),m("environment")),response_and_result:gt.chron_response(cap("advice"),m("result"))});
 }
 if(strategy==="transition"){
  if(grammar.id==="cycle_ending_beginning")return pack(gt.trans_ceb_thesis,m("threshold"),movement("ending","beginning"),{ending_and_lesson:gt.trans_ending(cap("ending"),m("lesson")),threshold_and_beginning:gt.trans_threshold(m("threshold"),m("beginning")),first_step:gt.trans_first_step(cap("first_step"))});
  return pack(gt.trans_thesis,m("release"),movement("release","begin"),{selection:gt.trans_selection(cap("keep"),m("release")),beginning:gt.trans_beginning(cap("begin"))});
 }
 if(strategy==="diagnostic"){
  if(grammar.id==="opportunity_risk_strategy")return pack(gt.diag_ors_thesis(m("opportunity"),m("risk")),m("risk"),semanticMovement(card("risk"),card("strategy"),lang),{diagnosis:gt.diag_ors_diag(cap("opportunity"),m("risk")),response:gt.diag_ors_resp(cap("strategy"))});
  if(entries.length===2)return pack(gt.diag_two_thesis,m("situation"),semanticMovement(card("situation"),card("advice"),lang),{problem_and_response:gt.diag_two(m("situation"),m("advice"))});
  if(grammar.id==="economic_block")return pack(gt.diag_econ_thesis,m("pattern"),movement("origin","exit"),{origin_and_pattern:gt.diag_econ_origin(m("origin"),m("manifestation"),m("pattern")),resource_and_exit:gt.diag_econ_exit(m("resource"),m("exit"))});
  const situation=entries.find(entry=>["present","situation"].includes(entry.role))||entries[0],obstacle=entries.find(entry=>["obstacle","risk","shadow"].includes(entry.role))||entries[1],resource=entries.find(entry=>entry.role==="resource"),external=entries.find(entry=>entry.role==="external"),action=entries.find(entry=>["action","advice"].includes(entry.role))||entries.at(-1);
  return pack(gt.diag_thesis,obstacle.interpretation,semanticMovement(obstacle.cardData,action.cardData,lang),{situation:gt.diag_situation(situation.interpretation,resource?.interpretation),problem:gt.diag_problem(obstacle.interpretation,external?.interpretation),response:gt.diag_response(action.interpretation)});
 }
 if(strategy==="inner_process")return pack(gt.inner_thesis,m("emotion")||m("release"),semanticMovement(ordered[0].cardData,ordered.at(-1).cardData,lang),{inner_relation:gt.inner_relation(m("mind")||ordered[0].interpretation,m("emotion")||ordered[1]?.interpretation),action:gt.inner_action(m("action")||ordered.at(-1).interpretation)});
 if(strategy==="psychological"){
  if(grammar.id==="shadow_learning_resource")return pack(gt.psych_slr_thesis,m("shadow"),semanticMovement(card("shadow"),card("resource"),lang),{shadow_and_learning:gt.psych_shadow(cap("shadow"),m("learning")),resource:gt.psych_resource(m("resource"))});
  const first=ordered[0],middle=ordered[Math.floor(ordered.length/2)],last=ordered.at(-1);
  return pack(gt.psych_thesis,first.interpretation,semanticMovement(first.cardData,last.cardData,lang),{recognition:gt.psych_recognition(first.interpretation,middle.interpretation),integration:gt.psych_integration(last.interpretation)});
 }
 if(strategy==="relationship"){
  if(grammar.id==="feeling_thought_action"){
   const sameOrientation=at("feeling").orientation===at("thought").orientation&&at("thought").orientation===at("action").orientation,sharedIntent=at("feeling").themes.some(theme=>at("thought").themes.includes(theme))||at("thought").themes.some(theme=>at("action").themes.includes(theme)),alignment=sameOrientation&&sharedIntent?gt.rel_align_yes:gt.rel_align_no;
   return pack(gt.rel_fta_thesis,m("thought"),movement("feeling","action"),{feeling_and_thought:gt.rel_feeling_thought(m("feeling"),m("thought"),alignment),action:gt.rel_action(m("action"))});
  }
  if(grammar.id==="self_other_bond"){const professional=/trabajo|empleo|negocio|profesional/i.test(analysis.context.category),context=professional?gt.rel_prof:gt.rel_affective;return pack(gt.rel_bond_thesis,m("bond"),semanticMovement(card("self"),card("bond"),lang),{two_people:gt.rel_two_people(m("self"),m("other")),bond:gt.rel_bond(m("bond"),context)});}
  const tension=entries.find(entry=>["distance","obstacle","warning"].includes(entry.role)),future=entries.find(entry=>entry.role==="future")||entries.at(-1),self=entries.find(entry=>entry.role==="self")||entries[0],other=entries.find(entry=>entry.role==="other")||entries[1],bond=entries.find(entry=>entry.role==="bond")||entries[2];
  return pack(gt.rel_thesis,tension?.interpretation||bond.interpretation,semanticMovement(bond.cardData,future.cardData,lang),{participants:gt.rel_participants(self.interpretation,other.interpretation),bond_and_tension:gt.rel_bond_tension(bond.interpretation,tension?.interpretation),development:gt.rel_development(future.interpretation)});
 }
 if(strategy==="decision"){
  if(grammar.id==="advantages_risks_result")return pack(gt.dec_arr_thesis,m("risk"),semanticMovement(card("advantage"),card("result"),lang),{comparison:gt.dec_arr_comp(cap("advantage"),cap("risk")),result:gt.dec_arr_result(m("result"))});
  if(grammar.id==="traffic_light"){
   const optionScore=(entry,id)=>{const source=normalize(entry.themes.join(" ")),affinity=id==="advance"?/claridad|esperanza|libertad|movimiento|accion|confianza/:id==="wait"?/introspeccion|pausa|prudencia|paciencia|equilibrio/:/cierre|bloqueo|riesgo|conflicto|tension/;return (entry.orientation==="reversed"?-2:0)+(entry.polarity==="support"?2:entry.polarity==="mixed"?1:0)+(affinity.test(source)?2:0);},options=[["advance",gt.tl_advance],["wait",gt.tl_wait],["stop",gt.tl_stop]].map(([id,label])=>({id,label,entry:at(id),score:optionScore(at(id),id)})).sort((a,b)=>b.score-a.score),leader=options[0],condition=options[1];
   return pack(gt.dec_tl_thesis,m("stop"),movement("wait","advance"),{signals:gt.dec_tl_signals(m("advance"),m("wait"),m("stop")),criterion:gt.dec_tl_criterion(leader.label,leader.entry.interpretation,condition.label,condition.entry.interpretation)});
  }
  if(grammar.id==="job_change")return pack(gt.dec_job_thesis,m("risk"),semanticMovement(card("current"),card("result"),lang),{current_and_motive:gt.dec_job_current(m("current"),m("reason")),opportunity_and_risk:gt.dec_job_risk(m("opportunity"),m("risk")),result_and_advice:gt.dec_job_result(m("result"),m("advice"))});
  const situation=at("situation")||at("decision")||entries[0],pathA=at("path_a")||at("act"),resultA=at("result_a")||at("act_result"),pathB=at("path_b")||at("not_act"),resultB=at("result_b")||at("not_act_result");
  return pack(gt.dec_thesis,situation.interpretation,semanticMovement(resultA.cardData,resultB.cardData,lang),{starting_point:gt.dec_start(situation.interpretation,m("motivation")),path_a:gt.dec_path_a(pathA.interpretation,resultA.interpretation),path_b:gt.dec_path_b(pathB.interpretation,resultB.interpretation)});
 }
 if(strategy==="resource_flow")return pack(gt.res_thesis,m("leakage"),semanticMovement(card("origin"),card("trend"),lang),{origin_and_entry:gt.res_origin(cap("origin"),m("inflow")),leakage_and_reserve:gt.res_leak(cap("leakage"),m("reserve")),movement_and_trend:gt.res_move(cap("movement"),m("trend"))});
 if(strategy==="project_flow")return pack(gt.proj_thesis,m("obstacle"),semanticMovement(card("idea"),card("result"),lang),{idea_and_resources:gt.proj_idea(m("idea"),m("resources")),market_and_obstacle:gt.proj_obstacle(m("market"),m("obstacle")),strategy_and_result:gt.proj_strategy(m("strategy"),m("result"))});
 if(strategy==="celtic_cross")return pack(gt.celtic_thesis(m("past"),m("base"),m("cross"),m("trend")),m("cross"),movement("past","trend"),{origin_and_present:gt.celtic_origin(cap("past"),m("base"),m("situation")),conflict_and_opening:gt.celtic_conflict(cap("cross"),m("possibility"),m("near_future")),self_and_context:gt.celtic_self(m("attitude"),m("environment"),m("hopes_fears")),direction:gt.celtic_direction(m("trend"))});
 if(strategy==="houses")return pack(gt.houses_thesis,m("unconscious"),movement("resources","vocation"),{self_and_bonds:gt.houses_self(m("self"),m("bonds")),resources_and_direction:gt.houses_resources(m("resources"),m("routines"),m("vocation")),home_and_change:gt.houses_home(m("home"),m("transformation"),m("vision")),communication_and_inner_world:gt.houses_comm(m("communication"),m("community"),m("unconscious"))});
 if(strategy==="chakra_system")return pack(gt.chakra_thesis,m("root"),semanticMovement(card("root"),card("crown"),lang),{foundation:gt.chakra_foundation(m("root"),m("sacral"),m("solar")),heart_and_voice:gt.chakra_heart(m("heart"),m("throat")),vision_and_meaning:gt.chakra_vision(m("third_eye"),m("crown"))});
 if(strategy==="star_system")return pack(gt.star_thesis,m("challenge"),semanticMovement(card("center"),card("result"),lang),{center:gt.star_center(m("center"),m("awareness"),m("desire")),challenge:gt.star_challenge(m("resource"),m("challenge")),action_and_result:gt.star_action(m("action"),m("result"))});
 if(strategy==="mandala_system")return pack(gt.mandala_thesis,m("southwest"),semanticMovement(card("west"),card("east"),lang),{center_and_past:gt.mandala_center(m("center"),m("west"),m("south")),new_movement:gt.mandala_move(m("north"),m("northeast"),m("east"),m("southeast")),closure_and_learning:gt.mandala_close(m("southwest"),m("northwest"))});
 if(strategy==="tree_system")return pack(gt.tree_thesis,m("gevurah"),semanticMovement(card("keter"),card("malkuth"),lang),{origin:gt.tree_origin(m("keter"),m("chokmah"),m("binah")),balance:gt.tree_balance(m("chesed"),m("gevurah"),m("tiferet")),foundation:gt.tree_foundation(m("netzach"),m("hod"),m("yesod")),manifestation:gt.tree_manifestation(m("malkuth"))});
 if(strategy==="spiritual_path")return pack(gt.spirit_thesis,m("shadow"),movement("calling","destination"),{calling_and_origin:gt.spirit_calling(m("calling"),m("origin"),m("baggage")),guidance_and_threshold:gt.spirit_threshold(m("guide"),m("threshold")),trial_and_revelation:gt.spirit_trial(m("trial"),m("shadow"),m("revelation")),choice_and_integration:gt.spirit_choice(m("choice"),m("surrender"),m("integration")),destination:gt.spirit_destination(m("destination"))});
 if(strategy==="seasonal_cycle"){
  const SC_T={
   ES:{thesis:"El año avanza desde preparación y nacimiento hasta actividad, cosecha, aprendizaje y depuración.",preparation:(w,aw,sp)=>`En invierno, ${w}. Durante el despertar, ${aw}; en primavera, ${sp}.`,growth:(ex,su)=>`La expansión muestra que ${ex}. En verano, ${su}; ahí se concentra la actividad del ciclo.`,results:(h,au)=>`La cosecha trae que ${h}. El otoño pide comprender que ${au}.`,closure:(r,c)=>`Antes del siguiente ciclo será necesario depurar: ${r}. Todo se integra alrededor de este tema central: ${c}.`},
   EN:{thesis:"The year moves from preparation and birth through activity, harvest, learning, and clearing out.",preparation:(w,aw,sp)=>`In winter, ${w}. During the awakening, ${aw}; in spring, ${sp}.`,growth:(ex,su)=>`The expansion shows that ${ex}. In summer, ${su}; that's where the cycle's activity concentrates.`,results:(h,au)=>`The harvest brings ${h}. Autumn asks you to understand that ${au}.`,closure:(r,c)=>`Before the next cycle, it will be necessary to clear out: ${r}. Everything integrates around this central theme: ${c}.`},
   FR:{thesis:"L'année avance de la préparation et de la naissance vers l'activité, la récolte, l'apprentissage et l'épuration.",preparation:(w,aw,sp)=>`En hiver, ${w}. Pendant l'éveil, ${aw} ; au printemps, ${sp}.`,growth:(ex,su)=>`L'expansion montre que ${ex}. En été, ${su} ; c'est là que se concentre l'activité du cycle.`,results:(h,au)=>`La récolte apporte ${h}. L'automne demande de comprendre que ${au}.`,closure:(r,c)=>`Avant le prochain cycle, il faudra épurer : ${r}. Tout s'intègre autour de ce thème central : ${c}.`},
   DE:{thesis:"Das Jahr bewegt sich von Vorbereitung und Geburt über Aktivität, Ernte, Lernen bis zur Läuterung.",preparation:(w,aw,sp)=>`Im Winter, ${w}. Während des Erwachens, ${aw}; im Frühling, ${sp}.`,growth:(ex,su)=>`Die Expansion zeigt, dass ${ex}. Im Sommer, ${su}; dort konzentriert sich die Aktivität des Zyklus.`,results:(h,au)=>`Die Ernte bringt ${h}. Der Herbst verlangt zu verstehen, dass ${au}.`,closure:(r,c)=>`Vor dem nächsten Zyklus wird es nötig sein zu läutern: ${r}. Alles integriert sich um dieses zentrale Thema: ${c}.`},
   PT:{thesis:"O ano avança da preparação e nascimento até a atividade, colheita, aprendizado e depuração.",preparation:(w,aw,sp)=>`No inverno, ${w}. Durante o despertar, ${aw}; na primavera, ${sp}.`,growth:(ex,su)=>`A expansão mostra que ${ex}. No verão, ${su}; ali se concentra a atividade do ciclo.`,results:(h,au)=>`A colheita traz ${h}. O outono pede compreender que ${au}.`,closure:(r,c)=>`Antes do próximo ciclo será necessário depurar: ${r}. Tudo se integra em torno deste tema central: ${c}.`},
  };
  const sc=SC_T[lang]||SC_T.ES;
  return pack(sc.thesis,m("release"),semanticMovement(card("winter"),card("center"),lang),{preparation:sc.preparation(m("winter"),m("awakening"),m("spring")),growth:sc.growth(m("expansion"),m("summer")),results:sc.results(m("harvest"),m("autumn")),closure:sc.closure(m("release"),m("center"))});
 }

 const first=ordered[0],last=ordered.at(-1);
 return {...pack(gt.generic_thesis,first?.interpretation||"",first&&last?semanticMovement(first.cardData,last.cardData,lang):"",{sequence:ordered.map(entry=>`${entry.position}: ${entry.interpretation}`).join(" ")}),strategy:"generic_map",fallbackUsed:true};
}

function buildNarrativeSynthesis(analysis,cards,rawParagraphs){
 if(analysis.spreadGrammar?.known)return grammarSynthesis(analysis,cards);
 return strategySynthesis(analysis,cards,rawParagraphs);
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
// Cuando una sección combina el contenido ya enmarcado de dos posiciones distintas (p. ej. "Yo" + "Inconsciente"),
// ambas pueden haber elegido la misma plantilla de conector en MODE_TEMPLATES y repetir la misma frase puente.
// Esto detecta ese caso y deja la frase solo en la primera aparición.
function dedupeConnectors(text){
 const seen=[];
 return text.split(/(?<=[.!?])\s+/).map(sentence=>{
  const match=sentence.match(/^([^:]{4,140}):\s+([\s\S]+)$/);
  if(!match)return sentence;
  const key=normalize(match[1]);
  const isDup=seen.some(prior=>key.includes(prior)||prior.includes(key));
  if(isDup)return match[2].charAt(0).toUpperCase()+match[2].slice(1);
  seen.push(key);
  return sentence;
 }).join(" ");
}
const cleanEditorial=text=>{
 let edited=(text||"").replace(/\s+/g," ").trim();
 for(const [pattern,replacement] of EDITORIAL_REWRITES)edited=edited.replace(pattern,replacement);
 for(const [pattern,replacement] of SYMBOLIC_REWRITES)edited=edited.replace(pattern,replacement);
 edited=dedupeConnectors(edited);
 return edited.replace(/\b(positionAnswer|semanticRole|outputStrategy|fallback)\b/gi,"").replace(/bloquea o debilita la expresión de esta carta/gi,"dificulta que esa cualidad se exprese con claridad").replace(/\b(y|o)\s+\1\b/gi,"$1").replace(/([.!?])\s+(y|o|pero)\s+/gi,(_,mark,connector)=>`${mark} ${connector.charAt(0).toUpperCase()}${connector.slice(1)} `).replace(/\s+([,.;:])/g,"$1").replace(/\.{2,}/g,".").replace(/\s{2,}/g," ").trim();
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
const SINGLE_MESSAGE_T={
 ES:{identityLine:k=>`Esta carta trae al centro ${k}.`,symbolLine:s=>`Un detalle que vale la pena mirar: ${s}`,adviceLine:a=>`Lo que ayuda ahora: ${a}`,reasonUpright:"Es una señal para observar, no una confirmación cerrada. Antes de sacar una conclusión definitiva, distingue lo que ya puedes comprobar en los hechos de lo que todavía es solo una expectativa tuya. No le pidas a esta carta una certeza que solo la situación real puede darte.",reasonReversed:"Aparece invertida: lo que indica está bloqueado, demorado o vuelto hacia adentro. Reconoce esa parte antes de actuar, en vez de forzar un movimiento que la situación todavía no sostiene. Darle tiempo al bloqueo suele ser más útil que empujar contra él.",and:" y "},
 EN:{identityLine:k=>`This card brings ${k} to the center.`,symbolLine:s=>`One detail worth noticing: ${s}`,adviceLine:a=>`What helps now: ${a}`,reasonUpright:"This is a signal to watch, not a closed confirmation. Before drawing a final conclusion, separate what you can already verify in the facts from what is still only your own expectation. Don't ask this card for a certainty only the real situation can give you.",reasonReversed:"It appears reversed: what it points to is blocked, delayed, or turned inward. Recognize that part before acting, instead of forcing a movement the situation doesn't support yet. Giving the block some time is usually more useful than pushing against it.",and:" and "},
 FR:{identityLine:k=>`Cette carte met au centre ${k}.`,symbolLine:s=>`Un détail à observer : ${s}`,adviceLine:a=>`Ce qui aide maintenant : ${a}`,reasonUpright:"C'est un signal à observer, pas une confirmation définitive. Avant de tirer une conclusion, distingue ce que tu peux déjà vérifier dans les faits de ce qui reste une simple attente de ta part. Ne demande pas à cette carte une certitude que seule la situation réelle peut t'offrir.",reasonReversed:"Elle apparaît inversée : ce qu'elle indique est bloqué, retardé ou tourné vers l'intérieur. Reconnais cette part avant d'agir, plutôt que de forcer un mouvement que la situation ne soutient pas encore. Laisser du temps au blocage aide souvent plus que de le forcer.",and:" et "},
 DE:{identityLine:k=>`Diese Karte rückt ${k} in den Mittelpunkt.`,symbolLine:s=>`Ein Detail, das einen Blick wert ist: ${s}`,adviceLine:a=>`Was jetzt hilft: ${a}`,reasonUpright:"Das ist ein Signal, das man beobachten sollte, keine endgültige Bestätigung. Bevor du einen abschließenden Schluss ziehst, unterscheide, was du bereits an den Tatsachen überprüfen kannst, von dem, was noch bloße eigene Erwartung ist. Verlange von dieser Karte keine Gewissheit, die nur die wirkliche Situation geben kann.",reasonReversed:"Sie erscheint umgekehrt: Was sie zeigt, ist blockiert, verzögert oder nach innen gerichtet. Erkenne diesen Teil, bevor du handelst, statt eine Bewegung zu erzwingen, die die Situation noch nicht trägt. Der Blockade Zeit zu geben, hilft meist mehr, als gegen sie anzukämpfen.",and:" und "},
 PT:{identityLine:k=>`Esta carta traz ${k} para o centro.`,symbolLine:s=>`Um detalhe que vale observar: ${s}`,adviceLine:a=>`O que ajuda agora: ${a}`,reasonUpright:"É um sinal a observar, não uma confirmação fechada. Antes de tirar uma conclusão definitiva, distinga o que você já pode verificar nos fatos do que ainda é apenas uma expectativa sua. Não peça a esta carta uma certeza que só a situação real pode dar.",reasonReversed:"Aparece invertida: o que ela indica está bloqueado, atrasado ou voltado para dentro. Reconheça essa parte antes de agir, em vez de forçar um movimento que a situação ainda não sustenta. Dar tempo ao bloqueio costuma ajudar mais do que forçá-lo.",and:" e "},
};
// Compone el mensaje desde lo específico de la carta (claves y símbolos propios, ya localizados por
// rider-deck-translations) más una lectura de la orientación — nunca repite general/advice como párrafo
// genérico compartido entre cartas distintas, como hacía la versión anterior.
export function interpretSingleMessage(entry,category="Consulta general",language="ES"){
 const card=entry?.cardData||{},t=SINGLE_MESSAGE_T[language]||SINGLE_MESSAGE_T.ES;
 const keys=(card.keys||[]).slice(0,3).join(t.and),reversed=entry?.orientation==="reversed";
 const parts=[];
 if(keys)parts.push(t.identityLine(keys));
 if(card.symbols)parts.push(`${t.symbolLine(trimSentence(card.symbols))}.`);
 parts.push(reversed?t.reasonReversed:t.reasonUpright);
 const body=parts.filter(Boolean).join(" ");
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
const CHAKRA_FLOW_T={
 ES:{noTension:"El flujo general mantiene continuidad entre la base, el movimiento, la voluntad, el vínculo, la expresión, la percepción y el sentido. Esto no garantiza que todo sea sencillo: señala que las distintas funciones pueden apoyarse sin que una tensión domine el recorrido.",tension:(l,s)=>`La lectura señala tensión en ${l}; puede sentirse como una interrupción entre lo que necesitas, lo que expresas y la manera en que comprendes el proceso. No la presenta como una condición física ni como un hecho fijo. ${s?`El apoyo más disponible aparece en ${s}, y desde ahí puede recuperarse continuidad.`:"Conviene observar la tensión sin convertirla en una afirmación absoluta."}`,and:" y "},
 EN:{noTension:"The overall flow maintains continuity between the root, movement, will, bond, expression, perception, and meaning. This doesn't guarantee everything is simple: it signals that the different functions can support each other without one tension dominating the journey.",tension:(l,s)=>`The reading points to tension in ${l}; it can feel like a break between what you need, what you express, and how you understand the process. It isn't presented as a physical condition or a fixed fact. ${s?`The most available support appears in ${s}, and from there continuity can be recovered.`:"It's worth observing the tension without turning it into an absolute statement."}`,and:" and "},
 FR:{noTension:"Le flux général maintient une continuité entre la base, le mouvement, la volonté, le lien, l'expression, la perception et le sens. Cela ne garantit pas que tout soit simple : cela indique que les différentes fonctions peuvent se soutenir sans qu'une tension domine le parcours.",tension:(l,s)=>`La lecture signale une tension dans ${l} ; cela peut se ressentir comme une interruption entre ce dont tu as besoin, ce que tu exprimes et la façon dont tu comprends le processus. Elle n'est présentée ni comme une condition physique ni comme un fait figé. ${s?`Le soutien le plus disponible apparaît dans ${s}, et à partir de là, la continuité peut se rétablir.`:"Il convient d'observer la tension sans en faire une affirmation absolue."}`,and:" et "},
 DE:{noTension:"Der Gesamtfluss bewahrt Kontinuität zwischen Wurzel, Bewegung, Willen, Bindung, Ausdruck, Wahrnehmung und Sinn. Das garantiert nicht, dass alles einfach ist: es zeigt, dass sich die verschiedenen Funktionen stützen können, ohne dass eine Spannung den Verlauf beherrscht.",tension:(l,s)=>`Die Lesung zeigt Spannung in ${l}; das kann sich wie eine Unterbrechung zwischen dem anfühlen, was du brauchst, was du ausdrückst und wie du den Prozess verstehst. Sie wird weder als körperlicher Zustand noch als feststehende Tatsache dargestellt. ${s?`Die verfügbarste Unterstützung zeigt sich in ${s}, und von dort aus kann Kontinuität zurückgewonnen werden.`:"Es lohnt sich, die Spannung zu beobachten, ohne sie zu einer absoluten Aussage zu machen."}`,and:" und "},
 PT:{noTension:"O fluxo geral mantém continuidade entre a base, o movimento, a vontade, o vínculo, a expressão, a percepção e o sentido. Isso não garante que tudo seja simples: sinaliza que as diferentes funções podem se apoiar sem que uma tensão domine o percurso.",tension:(l,s)=>`A leitura sinaliza tensão em ${l}; pode ser sentida como uma interrupção entre o que você precisa, o que expressa e a forma como compreende o processo. Não é apresentada como uma condição física nem como um fato fixo. ${s?`O apoio mais disponível aparece em ${s}, e a partir daí pode-se recuperar continuidade.`:"Convém observar a tensão sem transformá-la em uma afirmação absoluta."}`,and:" e "},
};
function chakraFlow(entries,language="ES"){
 const tense=entries.filter(entry=>entry.orientation==="reversed"),steady=entries.filter(entry=>entry.orientation!=="reversed"),t=CHAKRA_FLOW_T[language]||CHAKRA_FLOW_T.ES;
 if(!tense.length)return t.noTension;
 const labels=tense.map(entry=>entry.spec.label).join(", "),support=steady.slice(0,2).map(entry=>entry.spec.label).join(t.and);
 return t.tension(labels,support);
}
const PAIR_OBSERVATION_T={
 ES:{different:"Los dos polos no avanzan al mismo ritmo; uno puede impulsar lo que el otro todavía necesita ordenar.",same:"Los dos polos pueden trabajarse como complemento: ninguno necesita imponerse para que el proceso avance."},
 EN:{different:"The two poles aren't moving at the same pace; one can drive what the other still needs to sort out.",same:"The two poles can work as complements: neither needs to dominate for the process to move forward."},
 FR:{different:"Les deux pôles n'avancent pas au même rythme ; l'un peut impulser ce que l'autre doit encore ordonner.",same:"Les deux pôles peuvent fonctionner en complément : aucun n'a besoin de s'imposer pour que le processus avance."},
 DE:{different:"Die beiden Pole bewegen sich nicht im gleichen Tempo; der eine kann antreiben, was der andere noch ordnen muss.",same:"Die beiden Pole können sich ergänzen: keiner muss sich durchsetzen, damit der Prozess vorankommt."},
 PT:{different:"Os dois polos não avançam no mesmo ritmo; um pode impulsionar o que o outro ainda precisa ordenar.",same:"Os dois polos podem trabalhar como complemento: nenhum precisa se impor para que o processo avance."},
};
function pairObservation(byId,first,second,firstLabel,secondLabel,language="ES"){
 const a=byId.get(first),b=byId.get(second),different=a?.orientation!==b?.orientation,t=PAIR_OBSERVATION_T[language]||PAIR_OBSERVATION_T.ES;
 return `${titledObservation(firstLabel,shortAnswerFor(byId,first))} ${titledObservation(secondLabel,shortAnswerFor(byId,second))} ${different?t.different:t.same}`;
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
const SECTION_LABELS={
 ES:{message:"Mensaje",reading:"Lectura",key:"Clave",continuation:"Continuación"},
 EN:{message:"Message",reading:"Reading",key:"Key",continuation:"Continuation"},
 FR:{message:"Message",reading:"Lecture",key:"Clé",continuation:"Suite"},
 DE:{message:"Botschaft",reading:"Lesung",key:"Schlüssel",continuation:"Fortsetzung"},
 PT:{message:"Mensagem",reading:"Leitura",key:"Chave",continuation:"Continuação"},
};
const SHORT_SEQUENCE_KEY_BODY={
 ES:t=>`La clave está en ${t}: ahí puedes modificar el paso entre lo vivido y la tendencia. No se trata de repetir el pasado ni de esperar que el desenlace ocurra solo; el presente es el punto donde puedes intervenir.`,
 EN:t=>`The key is in ${t}: that's where you can shift the step between what's been lived and the trend. It's not about repeating the past or waiting for the outcome to happen on its own; the present is the point where you can intervene.`,
 FR:t=>`La clé est dans ${t} : c'est là que tu peux modifier le passage entre ce qui a été vécu et la tendance. Il ne s'agit pas de répéter le passé ni d'attendre que le dénouement arrive tout seul ; le présent est le point où tu peux intervenir.`,
 DE:t=>`Der Schlüssel liegt in ${t}: dort kannst du den Übergang zwischen dem Erlebten und dem Trend verändern. Es geht nicht darum, die Vergangenheit zu wiederholen oder darauf zu warten, dass der Ausgang von selbst geschieht; die Gegenwart ist der Punkt, an dem du eingreifen kannst.`,
 PT:t=>`A chave está em ${t}: aí você pode modificar o passo entre o vivido e a tendência. Não se trata de repetir o passado nem de esperar que o desfecho aconteça sozinho; o presente é o ponto onde você pode intervir.`,
};
const SHORT_SEQUENCE_FALLBACK_THEME={ES:"la respuesta presente",EN:"the present response",FR:"la réponse présente",DE:"die gegenwärtige Antwort",PT:"a resposta presente"};
const SECTION_TITLE_MAP={
 "Lo que siente":{EN:"What they feel",FR:"Ce qu'ils ressentent",DE:"Was sie fühlen",PT:"O que sentem"},
 "Lo que piensa":{EN:"What they think",FR:"Ce qu'ils pensent",DE:"Was sie denken",PT:"O que pensam"},
 "Lo que probablemente hará":{EN:"What they'll probably do",FR:"Ce qu'ils feront probablement",DE:"Was sie wahrscheinlich tun werden",PT:"O que provavelmente farão"},
 "Síntesis":{EN:"Synthesis",FR:"Synthèse",DE:"Synthese",PT:"Síntese"},
 "Avanzar":{EN:"Move forward",FR:"Avancer",DE:"Vorangehen",PT:"Avançar"},
 "Esperar":{EN:"Wait",FR:"Attendre",DE:"Warten",PT:"Esperar"},
 "Detenerse":{EN:"Stop",FR:"S'arrêter",DE:"Innehalten",PT:"Parar"},
 "Señal dominante":{EN:"Dominant signal",FR:"Signal dominant",DE:"Dominierendes Signal",PT:"Sinal dominante"},
 "Punto de partida":{EN:"Starting point",FR:"Point de départ",DE:"Ausgangspunkt",PT:"Ponto de partida"},
 "Si actúas":{EN:"If you act",FR:"Si tu agis",DE:"Wenn du handelst",PT:"Se você agir"},
 "Camino A":{EN:"Path A",FR:"Chemin A",DE:"Weg A",PT:"Caminho A"},
 "Si no actúas":{EN:"If you don't act",FR:"Si tu n'agis pas",DE:"Wenn du nicht handelst",PT:"Se você não agir"},
 "Camino B":{EN:"Path B",FR:"Chemin B",DE:"Weg B",PT:"Caminho B"},
 "Comparación":{EN:"Comparison",FR:"Comparaison",DE:"Vergleich",PT:"Comparação"},
 "A favor":{EN:"In favor",FR:"En faveur",DE:"Dafür",PT:"A favor"},
 "Riesgo":{EN:"Risk",FR:"Risque",DE:"Risiko",PT:"Risco"},
 "Resultado probable":{EN:"Likely outcome",FR:"Résultat probable",DE:"Wahrscheinliches Ergebnis",PT:"Resultado provável"},
 "Conclusión":{EN:"Conclusion",FR:"Conclusion",DE:"Schlussfolgerung",PT:"Conclusão"},
 "Respuesta":{EN:"Answer",FR:"Réponse",DE:"Antwort",PT:"Resposta"},
 "Condición":{EN:"Condition",FR:"Condition",DE:"Bedingung",PT:"Condição"},
 "Lo que puede cambiarla":{EN:"What could change it",FR:"Ce qui pourrait la changer",DE:"Was sie ändern könnte",PT:"O que pode mudá-la"},
 "Lo que termina":{EN:"What's ending",FR:"Ce qui se termine",DE:"Was endet",PT:"O que termina"},
 "Lo que deja":{EN:"What it leaves behind",FR:"Ce que cela laisse",DE:"Was es hinterlässt",PT:"O que deixa"},
 "El umbral":{EN:"The threshold",FR:"Le seuil",DE:"Die Schwelle",PT:"O limiar"},
 "Lo que comienza":{EN:"What's beginning",FR:"Ce qui commence",DE:"Was beginnt",PT:"O que começa"},
 "Primer paso":{EN:"First step",FR:"Premier pas",DE:"Erster Schritt",PT:"Primeiro passo"},
 "Preparación":{EN:"Preparation",FR:"Préparation",DE:"Vorbereitung",PT:"Preparação"},
 "Crecimiento":{EN:"Growth",FR:"Croissance",DE:"Wachstum",PT:"Crescimento"},
 "Resultados":{EN:"Results",FR:"Résultats",DE:"Ergebnisse",PT:"Resultados"},
 "Depuración y tema central":{EN:"Clearing out and central theme",FR:"Épuration et thème central",DE:"Läuterung und zentrales Thema",PT:"Depuração e tema central"},
 "Llamado y origen":{EN:"Call and origin",FR:"Appel et origine",DE:"Ruf und Ursprung",PT:"Chamado e origem"},
 "Equipaje y guía":{EN:"Baggage and guidance",FR:"Bagage et guide",DE:"Gepäck und Führung",PT:"Bagagem e orientação"},
 "Umbral y prueba":{EN:"Threshold and trial",FR:"Seuil et épreuve",DE:"Schwelle und Prüfung",PT:"Limiar e prova"},
 "Revelación y elección":{EN:"Revelation and choice",FR:"Révélation et choix",DE:"Enthüllung und Wahl",PT:"Revelação e escolha"},
 "Integración y destino":{EN:"Integration and destination",FR:"Intégration et destination",DE:"Integration und Bestimmung",PT:"Integração e destino"},
 "BASE Y MOVIMIENTO":{EN:"ROOT AND MOVEMENT",FR:"BASE ET MOUVEMENT",DE:"WURZEL UND BEWEGUNG",PT:"BASE E MOVIMENTO"},
 "VOLUNTAD Y VÍNCULO":{EN:"WILL AND BOND",FR:"VOLONTÉ ET LIEN",DE:"WILLE UND BINDUNG",PT:"VONTADE E VÍNCULO"},
 "EXPRESIÓN Y PERCEPCIÓN":{EN:"EXPRESSION AND PERCEPTION",FR:"EXPRESSION ET PERCEPTION",DE:"AUSDRUCK UND WAHRNEHMUNG",PT:"EXPRESSÃO E PERCEPÇÃO"},
 "INTEGRACIÓN":{EN:"INTEGRATION",FR:"INTÉGRATION",DE:"INTEGRATION",PT:"INTEGRAÇÃO"},
 "FLUJO GENERAL":{EN:"OVERALL FLOW",FR:"FLUX GÉNÉRAL",DE:"GESAMTFLUSS",PT:"FLUXO GERAL"},
 "PRINCIPIO DEL PROCESO":{EN:"BEGINNING OF THE PROCESS",FR:"PRINCIPE DU PROCESSUS",DE:"BEGINN DES PROZESSES",PT:"PRINCÍPIO DO PROCESSO"},
 "POLARIDADES PRINCIPALES":{EN:"MAIN POLARITIES",FR:"POLARITÉS PRINCIPALES",DE:"HAUPTPOLARITÄTEN",PT:"POLARIDADES PRINCIPAIS"},
 "CENTRO DE INTEGRACIÓN":{EN:"CENTER OF INTEGRATION",FR:"CENTRE D'INTÉGRATION",DE:"ZENTRUM DER INTEGRATION",PT:"CENTRO DE INTEGRAÇÃO"},
 "PATRÓN SUBYACENTE":{EN:"UNDERLYING PATTERN",FR:"MODÈLE SOUS-JACENT",DE:"ZUGRUNDELIEGENDES MUSTER",PT:"PADRÃO SUBJACENTE"},
 "MANIFESTACIÓN":{EN:"MANIFESTATION",FR:"MANIFESTATION",DE:"MANIFESTATION",PT:"MANIFESTAÇÃO"},
 "PANORAMA GENERAL":{EN:"OVERALL PICTURE",FR:"VUE D'ENSEMBLE",DE:"GESAMTBILD",PT:"PANORAMA GERAL"},
 "Lo que te ha traído hasta aquí":{EN:"What's brought you here",FR:"Ce qui t'a mené jusqu'ici",DE:"Was dich hierher gebracht hat",PT:"O que trouxe você até aqui"},
 "El reto y la posibilidad":{EN:"The challenge and the possibility",FR:"Le défi et la possibilité",DE:"Die Herausforderung und die Möglichkeit",PT:"O desafio e a possibilidade"},
 "Lo que empieza a moverse":{EN:"What's starting to move",FR:"Ce qui commence à bouger",DE:"Was sich zu bewegen beginnt",PT:"O que começa a se mover"},
 "Tu respuesta y lo que te rodea":{EN:"Your response and what surrounds you",FR:"Ta réponse et ce qui t'entoure",DE:"Deine Antwort und was dich umgibt",PT:"Sua resposta e o que a cerca"},
 "Tendencia":{EN:"Trend",FR:"Tendance",DE:"Tendenz",PT:"Tendência"},
 "Eje personal":{EN:"Personal axis",FR:"Axe personnel",DE:"Persönliche Achse",PT:"Eixo pessoal"},
 "Eje práctico":{EN:"Practical axis",FR:"Axe pratique",DE:"Praktische Achse",PT:"Eixo prático"},
 "Eje relacional":{EN:"Relational axis",FR:"Axe relationnel",DE:"Beziehungsachse",PT:"Eixo relacional"},
 "Eje de cambio":{EN:"Axis of change",FR:"Axe de changement",DE:"Achse des Wandels",PT:"Eixo de mudança"},
 "La idea":{EN:"The idea",FR:"L'idée",DE:"Die Idee",PT:"A ideia"},
 "Recursos y mercado":{EN:"Resources and market",FR:"Ressources et marché",DE:"Ressourcen und Markt",PT:"Recursos e mercado"},
 "Obstáculo":{EN:"Obstacle",FR:"Obstacle",DE:"Hindernis",PT:"Obstáculo"},
 "Estrategia y resultado":{EN:"Strategy and outcome",FR:"Stratégie et résultat",DE:"Strategie und Ergebnis",PT:"Estratégia e resultado"},
 "Situación":{EN:"Situation",FR:"Situation",DE:"Situation",PT:"Situação"},
 "Factores clave":{EN:"Key factors",FR:"Facteurs clés",DE:"Schlüsselfaktoren",PT:"Fatores-chave"},
 "Dirección práctica":{EN:"Practical direction",FR:"Direction pratique",DE:"Praktische Richtung",PT:"Direção prática"},
 "Las dos partes":{EN:"The two sides",FR:"Les deux parties",DE:"Die beiden Seiten",PT:"As duas partes"},
 "El vínculo":{EN:"The bond",FR:"Le lien",DE:"Die Bindung",PT:"O vínculo"},
 "Evolución":{EN:"Evolution",FR:"Évolution",DE:"Entwicklung",PT:"Evolução"},
 "Lo que ocurre dentro":{EN:"What's happening inside",FR:"Ce qui se passe à l'intérieur",DE:"Was innen geschieht",PT:"O que ocorre dentro"},
 "Cómo integrarlo":{EN:"How to integrate it",FR:"Comment l'intégrer",DE:"Wie man es integriert",PT:"Como integrá-lo"},
 "Núcleo del mapa":{EN:"Core of the map",FR:"Noyau de la carte",DE:"Kern der Karte",PT:"Núcleo do mapa"},
 "Eje de apoyo":{EN:"Supporting axis",FR:"Axe de soutien",DE:"Unterstützende Achse",PT:"Eixo de apoio"},
 "Origen y presente":{EN:"Origin and present",FR:"Origine et présent",DE:"Ursprung und Gegenwart",PT:"Origem e presente"},
 "Dirección":{EN:"Direction",FR:"Direction",DE:"Richtung",PT:"Direção"},
 "Desarrollo":{EN:"Development",FR:"Développement",DE:"Entwicklung",PT:"Desenvolvimento"},
};
function outputSections(strategy,analysis,cards,narrativeSynthesis,legacyStory){
 const entries=orderedEntries(analysis,cards),byId=entryMap(entries),id=analysis.spreadGrammar.id,lang=analysis.context?.language||"ES",labels=SECTION_LABELS[lang]||SECTION_LABELS.ES;
 const tt=esTitle=>(lang==="ES"?esTitle:SECTION_TITLE_MAP[esTitle]?.[lang])||esTitle;
 if(strategy===TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE){
  const message=interpretSingleMessage(entries[0],analysis.context?.category,lang);
  return [{...section("message",labels.message,message.body),...message}];
 }
 const R3P_T={
  ES:{feeling:f=>`Emocionalmente, ${lowerFirst(f)} Esto describe una emoción posible, no una confesión comprobada.`,thought:t=>`Mentalmente, ${lowerFirst(t)} Su evaluación puede no tener la misma intensidad que lo que siente.`,action:k=>`La conducta probable estará marcada por ${k}. Necesita confirmarse en hechos.`,synMove:m=>`La alineación entre los tres planos se resume así: ${m}. La coherencia real dependerá de que emoción, pensamiento y conducta avancen en la misma dirección.`,synNone:"La alineación no puede darse por sentada: sentir, pensar y actuar no son lo mismo; observa si los hechos confirman la intención."},
  EN:{feeling:f=>`Emotionally, ${lowerFirst(f)} This describes a possible emotion, not a confirmed confession.`,thought:t=>`Mentally, ${lowerFirst(t)} Their assessment may not carry the same intensity as what they feel.`,action:k=>`The likely behavior will be marked by ${k}. It needs to be confirmed in actions.`,synMove:m=>`The alignment across the three levels can be summed up as: ${m}. Real coherence will depend on emotion, thought, and behavior moving in the same direction.`,synNone:"Alignment can't be assumed: feeling, thinking, and acting aren't the same thing; watch whether the facts confirm the intention."},
  FR:{feeling:f=>`Sur le plan émotionnel, ${lowerFirst(f)} Cela décrit une émotion possible, pas un aveu confirmé.`,thought:t=>`Sur le plan mental, ${lowerFirst(t)} Son évaluation peut ne pas avoir la même intensité que ce qu'il ressent.`,action:k=>`Le comportement probable sera marqué par ${k}. Il doit être confirmé par des faits.`,synMove:m=>`L'alignement entre les trois plans se résume ainsi : ${m}. La cohérence réelle dépendra du fait que l'émotion, la pensée et la conduite avancent dans la même direction.`,synNone:"L'alignement ne peut être tenu pour acquis : ressentir, penser et agir ne sont pas la même chose ; observe si les faits confirment l'intention."},
  DE:{feeling:f=>`Gefühlsmäßig, ${lowerFirst(f)} Das beschreibt eine mögliche Emotion, kein bestätigtes Geständnis.`,thought:t=>`Gedanklich, ${lowerFirst(t)} Seine Einschätzung hat vielleicht nicht dieselbe Intensität wie das Gefühl.`,action:k=>`Das wahrscheinliche Verhalten wird geprägt sein von ${k}. Es muss sich in Taten bestätigen.`,synMove:m=>`Die Ausrichtung zwischen den drei Ebenen lässt sich so zusammenfassen: ${m}. Echte Kohärenz hängt davon ab, dass Gefühl, Gedanke und Verhalten in dieselbe Richtung gehen.`,synNone:"Die Ausrichtung darf nicht als gegeben angenommen werden: fühlen, denken und handeln sind nicht dasselbe; beobachte, ob die Fakten die Absicht bestätigen."},
  PT:{feeling:f=>`Emocionalmente, ${lowerFirst(f)} Isso descreve uma emoção possível, não uma confissão comprovada.`,thought:t=>`Mentalmente, ${lowerFirst(t)} Sua avaliação pode não ter a mesma intensidade do que sente.`,action:k=>`A conduta provável será marcada por ${k}. Precisa ser confirmada em fatos.`,synMove:m=>`O alinhamento entre os três planos se resume assim: ${m}. A coerência real dependerá de que emoção, pensamento e conduta avancem na mesma direção.`,synNone:"O alinhamento não pode ser dado como certo: sentir, pensar e agir não são a mesma coisa; observe se os fatos confirmam a intenção."},
 };
 const r3p=R3P_T[lang]||R3P_T.ES;
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_THREE_PART)return [
  section("feeling",tt("Lo que siente"),r3p.feeling(answerFor(byId,"feeling"))),
  section("thought",tt("Lo que piensa"),r3p.thought(answerFor(byId,"thought"))),
  section("action",tt("Lo que probablemente hará"),r3p.action((byId.get("action")?.cardData?.keys||[]).slice(0,3).join(", ")||lowerFirst(answerFor(byId,"action")))),
  section("synthesis",tt("Síntesis"),narrativeSynthesis.main_movement?r3p.synMove(narrativeSynthesis.main_movement):r3p.synNone),
 ];
 const CS_T={
  ES:{advance:a=>`Avanzar tiene sentido cuando ${lowerFirst(a)}`,wait:w=>`Esperar conviene mientras ${lowerFirst(w)}`,stop:s=>`Detenerse se justifica si ${lowerFirst(s)}`,dominant:c=>`${c} Es la señal con mayor respaldo relativo y cambiaría si los hechos empiezan a coincidir con otra de las dos condiciones.`},
  EN:{advance:a=>`Moving forward makes sense when ${lowerFirst(a)}`,wait:w=>`Waiting is wise while ${lowerFirst(w)}`,stop:s=>`Stopping is justified if ${lowerFirst(s)}`,dominant:c=>`${c} This is the signal with the strongest relative backing, and it would change if the facts start matching one of the other two conditions.`},
  FR:{advance:a=>`Avancer a du sens quand ${lowerFirst(a)}`,wait:w=>`Il convient d'attendre tant que ${lowerFirst(w)}`,stop:s=>`S'arrêter se justifie si ${lowerFirst(s)}`,dominant:c=>`${c} C'est le signal avec le plus grand soutien relatif, et il changerait si les faits commençaient à correspondre à l'une des deux autres conditions.`},
  DE:{advance:a=>`Vorangehen ergibt Sinn, wenn ${lowerFirst(a)}`,wait:w=>`Warten lohnt sich, solange ${lowerFirst(w)}`,stop:s=>`Innehalten ist gerechtfertigt, wenn ${lowerFirst(s)}`,dominant:c=>`${c} Das ist das Signal mit der stärksten relativen Unterstützung, und es würde sich ändern, wenn die Fakten beginnen, einer der beiden anderen Bedingungen zu entsprechen.`},
  PT:{advance:a=>`Avançar faz sentido quando ${lowerFirst(a)}`,wait:w=>`Convém esperar enquanto ${lowerFirst(w)}`,stop:s=>`Parar se justifica se ${lowerFirst(s)}`,dominant:c=>`${c} É o sinal com maior respaldo relativo e mudaria se os fatos começassem a coincidir com uma das outras duas condições.`},
 };
 const cs=CS_T[lang]||CS_T.ES;
 if(strategy===TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL)return [
  section("advance",tt("Avanzar"),cs.advance(answerFor(byId,"advance"))),
  section("wait",tt("Esperar"),cs.wait(answerFor(byId,"wait"))),
  section("stop",tt("Detenerse"),cs.stop(answerFor(byId,"stop"))),
  section("dominant",tt("Señal dominante"),cs.dominant(comparisonInclination(entries))),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON){
  const TPC_T={
   ES:(x,y)=>`Si eliges el primer camino, ${lowerFirst(x)}. Con el segundo, ${lowerFirst(y)}. La decisión más coherente será la consecuencia que realmente puedas sostener.`,
   EN:(x,y)=>`If you choose the first path, ${lowerFirst(x)}. With the second, ${lowerFirst(y)}. The most coherent decision will be the consequence you can genuinely sustain.`,
   FR:(x,y)=>`Si tu choisis le premier chemin, ${lowerFirst(x)}. Avec le second, ${lowerFirst(y)}. La décision la plus cohérente sera la conséquence que tu peux vraiment soutenir.`,
   DE:(x,y)=>`Wenn du den ersten Weg wählst, ${lowerFirst(x)}. Beim zweiten, ${lowerFirst(y)}. Die stimmigste Entscheidung ist die Konsequenz, die du wirklich tragen kannst.`,
   PT:(x,y)=>`Se você escolher o primeiro caminho, ${lowerFirst(x)}. Com o segundo, ${lowerFirst(y)}. A decisão mais coerente será a consequência que você realmente possa sustentar.`,
  };
  const act=id==="act_or_not",current=answerFor(byId,act?"decision":"situation"),a=answerFor(byId,act?"act":"path_a"),ar=answerFor(byId,act?"act_result":"result_a"),b=answerFor(byId,act?"not_act":"path_b"),br=answerFor(byId,act?"not_act_result":"result_b");
  return [section("starting",tt("Punto de partida"),current),section("path_a",tt(act?"Si actúas":"Camino A"),`${a} ${ar}`),section("path_b",tt(act?"Si no actúas":"Camino B"),`${b} ${br}`),section("comparison",tt("Comparación"),(TPC_T[lang]||TPC_T.ES)(naturalClause(ar||a),naturalClause(br||b)))];
 }
 const DECISION_CONCLUSION={ES:"La ventaja puede aprovecharse, pero el resultado dependerá de atender el riesgo antes de comprometerte.",EN:"The advantage can be used, but the outcome will depend on addressing the risk before you commit.",FR:"L'avantage peut être exploité, mais le résultat dépendra de la prise en compte du risque avant de t'engager.",DE:"Der Vorteil kann genutzt werden, aber das Ergebnis hängt davon ab, das Risiko zu berücksichtigen, bevor du dich festlegst.",PT:"A vantagem pode ser aproveitada, mas o resultado dependerá de atender ao risco antes de se comprometer."};
 if(strategy===TAROT_OUTPUT_STRATEGIES.DECISION_ANALYSIS)return [section("advantage",tt("A favor"),answerFor(byId,"advantage")),section("risk",tt("Riesgo"),answerFor(byId,"risk")),section("result",tt("Resultado probable"),answerFor(byId,"result")),section("conclusion",tt("Conclusión"),DECISION_CONCLUSION[lang]||DECISION_CONCLUSION.ES)];
 if(strategy===TAROT_OUTPUT_STRATEGIES.CONDITIONAL_ANSWER)return [section("answer",tt("Respuesta"),answerFor(byId,"answer")),section("condition",tt("Condición"),answerFor(byId,"condition")),section("warning",tt("Lo que puede cambiarla"),answerFor(byId,"warning"))];
 const TRANS_T={
  ES:{ending:e=>`Termina una etapa en la que ${lowerFirst(e)}`,threshold:t=>`Antes de cruzar hacia lo nuevo, ${lowerFirst(t)}`},
  EN:{ending:e=>`A stage marked by ${lowerFirst(e)} is ending`,threshold:t=>`Before crossing into the new, ${lowerFirst(t)}`},
  FR:{ending:e=>`Une étape où ${lowerFirst(e)} se termine`,threshold:t=>`Avant de franchir le seuil vers le nouveau, ${lowerFirst(t)}`},
  DE:{ending:e=>`Eine Phase, in der ${lowerFirst(e)}, geht zu Ende`,threshold:t=>`Bevor du in das Neue übergehst, ${lowerFirst(t)}`},
  PT:{ending:e=>`Termina uma etapa em que ${lowerFirst(e)}`,threshold:t=>`Antes de atravessar rumo ao novo, ${lowerFirst(t)}`},
 };
 const trs=TRANS_T[lang]||TRANS_T.ES;
 if(strategy===TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY)return [section("ending",tt("Lo que termina"),trs.ending(answerFor(byId,"ending"))),section("lesson",tt("Lo que deja"),answerFor(byId,"lesson")),section("threshold",tt("El umbral"),trs.threshold(answerFor(byId,"threshold"))),section("beginning",tt("Lo que comienza"),answerFor(byId,"beginning")),section("first_step",tt("Primer paso"),answerFor(byId,"first_step"))];
 const TC_SPRING_PREFIX={ES:s=>`En primavera, ${lowerFirst(s)}`,EN:s=>`In spring, ${lowerFirst(s)}`,FR:s=>`Au printemps, ${lowerFirst(s)}`,DE:s=>`Im Frühling, ${lowerFirst(s)}`,PT:s=>`Na primavera, ${lowerFirst(s)}`};
 const TC_WINTER_FALLBACK={ES:(w,a)=>`En invierno, ${lowerFirst(w)} Durante el despertar, ${lowerFirst(a)}`,EN:(w,a)=>`In winter, ${lowerFirst(w)} During the awakening, ${lowerFirst(a)}`,FR:(w,a)=>`En hiver, ${lowerFirst(w)} Pendant l'éveil, ${lowerFirst(a)}`,DE:(w,a)=>`Im Winter, ${lowerFirst(w)} Während des Erwachens, ${lowerFirst(a)}`,PT:(w,a)=>`No inverno, ${lowerFirst(w)} Durante o despertar, ${lowerFirst(a)}`};
 const TC_SUMMER_FALLBACK={ES:s=>`En verano, ${lowerFirst(s)}`,EN:s=>`In summer, ${lowerFirst(s)}`,FR:s=>`En été, ${lowerFirst(s)}`,DE:s=>`Im Sommer, ${lowerFirst(s)}`,PT:s=>`No verão, ${lowerFirst(s)}`};
 const TC_HARVEST_FALLBACK={ES:(h,a)=>`La cosecha muestra que ${lowerFirst(h)} En otoño, ${lowerFirst(a)}`,EN:(h,a)=>`The harvest shows that ${lowerFirst(h)} In autumn, ${lowerFirst(a)}`,FR:(h,a)=>`La récolte montre que ${lowerFirst(h)} En automne, ${lowerFirst(a)}`,DE:(h,a)=>`Die Ernte zeigt, dass ${lowerFirst(h)} Im Herbst, ${lowerFirst(a)}`,PT:(h,a)=>`A colheita mostra que ${lowerFirst(h)} No outono, ${lowerFirst(a)}`};
 if(strategy===TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE)return [
  section("preparation",tt("Preparación"),narrativeSynthesis.arcs.preparation||(TC_WINTER_FALLBACK[lang]||TC_WINTER_FALLBACK.ES)(answerFor(byId,"winter"),answerFor(byId,"awakening"))),
  section("growth",tt("Crecimiento"),`${(TC_SPRING_PREFIX[lang]||TC_SPRING_PREFIX.ES)(answerFor(byId,"spring"))} ${narrativeSynthesis.arcs.growth||(TC_SUMMER_FALLBACK[lang]||TC_SUMMER_FALLBACK.ES)(answerFor(byId,"summer"))}`),
  section("harvest",tt("Resultados"),narrativeSynthesis.arcs.results||(TC_HARVEST_FALLBACK[lang]||TC_HARVEST_FALLBACK.ES)(answerFor(byId,"harvest"),answerFor(byId,"autumn"))),
  section("center",tt("Depuración y tema central"),narrativeSynthesis.arcs.closure||`${answerFor(byId,"release")} ${answerFor(byId,"center")}`),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.JOURNEY_STAGES)return [
  section("calling",tt("Llamado y origen"),`${answerFor(byId,"calling")} ${answerFor(byId,"origin")}`),
  section("support",tt("Equipaje y guía"),`${answerFor(byId,"baggage")} ${answerFor(byId,"guide")}`),
  section("trial",tt("Umbral y prueba"),`${answerFor(byId,"threshold")} ${answerFor(byId,"trial")} ${answerFor(byId,"shadow")}`),
  section("choice",tt("Revelación y elección"),`${answerFor(byId,"revelation")} ${answerFor(byId,"choice")} ${answerFor(byId,"surrender")}`),
  section("integration",tt("Integración y destino"),`${answerFor(byId,"integration")} ${answerFor(byId,"destination")}`),
 ];
 const CHAKRA_LABELS={
  ES:{root:"Seguridad y arraigo",sacral:"Deseo y creatividad",solar:"Voluntad personal",heart:"Afecto y apertura",throat:"Verdad y comunicación",thirdEye:"Percepción y comprensión",crown:"Sentido que integra el proceso"},
  EN:{root:"Security and grounding",sacral:"Desire and creativity",solar:"Personal will",heart:"Affection and openness",throat:"Truth and communication",thirdEye:"Perception and understanding",crown:"Meaning that integrates the process"},
  FR:{root:"Sécurité et ancrage",sacral:"Désir et créativité",solar:"Volonté personnelle",heart:"Affection et ouverture",throat:"Vérité et communication",thirdEye:"Perception et compréhension",crown:"Sens qui intègre le processus"},
  DE:{root:"Sicherheit und Verwurzelung",sacral:"Verlangen und Kreativität",solar:"Persönlicher Wille",heart:"Zuneigung und Offenheit",throat:"Wahrheit und Kommunikation",thirdEye:"Wahrnehmung und Verständnis",crown:"Sinn, der den Prozess integriert"},
  PT:{root:"Segurança e enraizamento",sacral:"Desejo e criatividade",solar:"Vontade pessoal",heart:"Afeto e abertura",throat:"Verdade e comunicação",thirdEye:"Percepção e compreensão",crown:"Sentido que integra o processo"},
 };
 const chl=CHAKRA_LABELS[lang]||CHAKRA_LABELS.ES;
 if(strategy===TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM)return [
  section("base_movement",tt("BASE Y MOVIMIENTO"),`${titledObservation(chl.root,answerFor(byId,"root"))} ${titledObservation(chl.sacral,answerFor(byId,"sacral"))}`),
  section("will_bond",tt("VOLUNTAD Y VÍNCULO"),`${titledObservation(chl.solar,answerFor(byId,"solar"))} ${titledObservation(chl.heart,answerFor(byId,"heart"))}`),
  section("expression_perception",tt("EXPRESIÓN Y PERCEPCIÓN"),`${titledObservation(chl.throat,answerFor(byId,"throat"))} ${titledObservation(chl.thirdEye,answerFor(byId,"third_eye"))}`),
  section("integration",tt("INTEGRACIÓN"),titledObservation(chl.crown,answerFor(byId,"crown"))),
  section("flow",tt("FLUJO GENERAL"),chakraFlow(entries,lang)),
 ];
 const TREE_LABELS={
  ES:{keter:"Kéter plantea la intención inicial",chokmah:"Jojmá aporta impulso",binah:"Biná le da forma",chesed:"Jésed permite expandir",gevurah:"Guevurá fija el límite",netzach:"Nétzaj sostiene el deseo",hod:"Hod ordena pensamiento y palabra",tiferet:"Tiféret reúne las fuerzas en el centro",yesod:"Yesod muestra la base interna",malkuth:"Maljut lleva el proceso a los hechos",centerNote:"Su función aquí no es borrar las diferencias, sino encontrar una medida que permita utilizarlas sin que un extremo gobierne todo el proceso.",patternNote:"Esta base prepara lo que podrá tomar forma; si permanece implícita, también puede condicionar el resultado sin que se advierta de inmediato.",manifestationNote:"Aquí se comprueba qué parte de la intención puede sostenerse en decisiones, hábitos y resultados observables.",panorama:"El recorrido conecta una intención con su forma concreta mediante tres polaridades que necesitan negociación, un centro que integra y una base interna que prepara la acción. No describe una verdad doctrinal ni un destino cerrado: ofrece un mapa simbólico para reconocer dónde existe impulso, dónde hace falta estructura y qué deberá cambiar para que la manifestación sea coherente con el principio inicial."},
  EN:{keter:"Keter sets out the initial intention",chokmah:"Chokmah brings impulse",binah:"Binah gives it form",chesed:"Chesed allows expansion",gevurah:"Gevurah sets the limit",netzach:"Netzach sustains desire",hod:"Hod orders thought and word",tiferet:"Tiferet gathers the forces at the center",yesod:"Yesod shows the inner foundation",malkuth:"Malkuth brings the process into facts",centerNote:"Its function here isn't to erase the differences, but to find a measure that allows them to be used without one extreme ruling the whole process.",patternNote:"This foundation prepares what will be able to take shape; if it stays implicit, it can also shape the outcome without being noticed right away.",manifestationNote:"Here you can check which part of the intention can be sustained through decisions, habits, and observable results.",panorama:"The journey connects an intention with its concrete form through three polarities that need negotiating, a center that integrates, and an inner foundation that prepares action. It doesn't describe a doctrinal truth or a fixed destiny: it offers a symbolic map for recognizing where impulse exists, where structure is needed, and what will need to change for the manifestation to stay coherent with the initial principle."},
  FR:{keter:"Kéter pose l'intention initiale",chokmah:"Hochmah apporte l'impulsion",binah:"Binah lui donne forme",chesed:"Hessed permet d'étendre",gevurah:"Guevourah fixe la limite",netzach:"Netzah soutient le désir",hod:"Hod ordonne la pensée et la parole",tiferet:"Tiféret rassemble les forces au centre",yesod:"Yesod montre la base intérieure",malkuth:"Malkhout mène le processus aux faits",centerNote:"Sa fonction ici n'est pas d'effacer les différences, mais de trouver une mesure qui permette de les utiliser sans qu'un extrême ne gouverne tout le processus.",patternNote:"Cette base prépare ce qui pourra prendre forme ; si elle reste implicite, elle peut aussi conditionner le résultat sans qu'on s'en aperçoive immédiatement.",manifestationNote:"C'est ici que l'on vérifie quelle part de l'intention peut se soutenir dans des décisions, des habitudes et des résultats observables.",panorama:"Le parcours relie une intention à sa forme concrète à travers trois polarités qui demandent à être négociées, un centre qui intègre et une base intérieure qui prépare l'action. Il ne décrit pas une vérité doctrinale ni un destin figé : il offre une carte symbolique pour reconnaître où existe l'élan, où la structure fait défaut et ce qui devra changer pour que la manifestation reste cohérente avec le principe initial."},
  DE:{keter:"Keter legt die anfängliche Absicht fest",chokmah:"Chochma bringt Antrieb",binah:"Binah gibt ihm Form",chesed:"Chessed ermöglicht Ausdehnung",gevurah:"Gewura setzt die Grenze",netzach:"Netzach trägt das Verlangen",hod:"Hod ordnet Gedanke und Wort",tiferet:"Tiferet vereint die Kräfte in der Mitte",yesod:"Jessod zeigt die innere Grundlage",malkuth:"Malchut bringt den Prozess in die Tat",centerNote:"Seine Funktion besteht hier nicht darin, die Unterschiede auszulöschen, sondern ein Maß zu finden, das ihre Nutzung erlaubt, ohne dass ein Extrem den ganzen Prozess beherrscht.",patternNote:"Diese Grundlage bereitet vor, was Form annehmen kann; bleibt sie unausgesprochen, kann sie das Ergebnis auch beeinflussen, ohne dass es sofort auffällt.",manifestationNote:"Hier zeigt sich, welcher Teil der Absicht sich in Entscheidungen, Gewohnheiten und beobachtbaren Ergebnissen halten kann.",panorama:"Der Weg verbindet eine Absicht mit ihrer konkreten Form durch drei Polaritäten, die Verhandlung brauchen, ein Zentrum, das integriert, und eine innere Grundlage, die das Handeln vorbereitet. Er beschreibt keine doktrinäre Wahrheit oder ein festgelegtes Schicksal: er bietet eine symbolische Karte, um zu erkennen, wo Antrieb besteht, wo Struktur fehlt und was sich ändern muss, damit die Manifestation mit dem anfänglichen Prinzip übereinstimmt."},
  PT:{keter:"Kéter estabelece a intenção inicial",chokmah:"Rochmá traz impulso",binah:"Biná dá forma a ele",chesed:"Chessed permite expandir",gevurah:"Guevurá fixa o limite",netzach:"Nétzach sustenta o desejo",hod:"Hod ordena pensamento e palavra",tiferet:"Tiféret reúne as forças no centro",yesod:"Yesod mostra a base interna",malkuth:"Malkut leva o processo aos fatos",centerNote:"Sua função aqui não é apagar as diferenças, mas encontrar uma medida que permita utilizá-las sem que um extremo governe todo o processo.",patternNote:"Essa base prepara o que poderá tomar forma; se permanecer implícita, também pode condicionar o resultado sem que se perceba de imediato.",manifestationNote:"Aqui se comprova que parte da intenção pode se sustentar em decisões, hábitos e resultados observáveis.",panorama:"O percurso conecta uma intenção com sua forma concreta mediante três polaridades que precisam de negociação, um centro que integra e uma base interna que prepara a ação. Não descreve uma verdade doutrinal nem um destino fechado: oferece um mapa simbólico para reconhecer onde existe impulso, onde falta estrutura e o que deverá mudar para que a manifestação seja coerente com o princípio inicial."},
 };
 const trl=TREE_LABELS[lang]||TREE_LABELS.ES;
 if(strategy===TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE)return [
  section("principle",tt("PRINCIPIO DEL PROCESO"),titledObservation(trl.keter,shortAnswerFor(byId,"keter"))),
  section("polarities",tt("POLARIDADES PRINCIPALES"),`${pairObservation(byId,"chokmah","binah",trl.chokmah,trl.binah,lang)} ${pairObservation(byId,"chesed","gevurah",trl.chesed,trl.gevurah,lang)} ${pairObservation(byId,"netzach","hod",trl.netzach,trl.hod,lang)}`),
  section("center_integration",tt("CENTRO DE INTEGRACIÓN"),`${titledObservation(trl.tiferet,shortAnswerFor(byId,"tiferet"))} ${trl.centerNote}`),
  section("underlying_pattern",tt("PATRÓN SUBYACENTE"),`${titledObservation(trl.yesod,shortAnswerFor(byId,"yesod"))} ${trl.patternNote}`),
  section("manifestation",tt("MANIFESTACIÓN"),`${titledObservation(trl.malkuth,shortAnswerFor(byId,"malkuth"))} ${trl.manifestationNote}`),
  section("panorama",tt("PANORAMA GENERAL"),trl.panorama),
 ];
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE&&id==="celtic_cross"){
  const CC_T={
   ES:{origin:(p,b,s)=>`${p} En el fondo, ${lowerFirst(b)} Ahora, ${lowerFirst(s)}`,challenge:(c,p)=>`${c} Aun así, ${lowerFirst(p)}`,development:nf=>`${nf} No es una conclusión cerrada: es el siguiente tramo si la dinámica se mantiene.`,response:(a,e,h)=>`${a} A tu alrededor, ${lowerFirst(e)} También pesan tus expectativas: ${lowerFirst(h)}`,direction:t=>`${t} La dirección puede fortalecerse o cambiar según cómo respondas al reto central y a los hechos que aparezcan.`},
   EN:{origin:(p,b,s)=>`${p} Underneath, ${lowerFirst(b)} Right now, ${lowerFirst(s)}`,challenge:(c,p)=>`${c} Even so, ${lowerFirst(p)}`,development:nf=>`${nf} This isn't a closed conclusion: it's the next stretch if the dynamic holds.`,response:(a,e,h)=>`${a} Around you, ${lowerFirst(e)} Your expectations also carry weight: ${lowerFirst(h)}`,direction:t=>`${t} The direction can strengthen or shift depending on how you respond to the central challenge and to what happens next.`},
   FR:{origin:(p,b,s)=>`${p} Au fond, ${lowerFirst(b)} Maintenant, ${lowerFirst(s)}`,challenge:(c,p)=>`${c} Malgré tout, ${lowerFirst(p)}`,development:nf=>`${nf} Ce n'est pas une conclusion fermée : c'est le prochain tronçon si la dynamique se maintient.`,response:(a,e,h)=>`${a} Autour de toi, ${lowerFirst(e)} Tes attentes pèsent aussi : ${lowerFirst(h)}`,direction:t=>`${t} La direction peut se renforcer ou changer selon la façon dont tu réponds au défi central et aux faits qui apparaissent.`},
   DE:{origin:(p,b,s)=>`${p} Im Grunde, ${lowerFirst(b)} Jetzt, ${lowerFirst(s)}`,challenge:(c,p)=>`${c} Trotzdem, ${lowerFirst(p)}`,development:nf=>`${nf} Das ist kein abgeschlossener Schluss: es ist der nächste Abschnitt, wenn die Dynamik anhält.`,response:(a,e,h)=>`${a} Um dich herum, ${lowerFirst(e)} Auch deine Erwartungen wiegen mit: ${lowerFirst(h)}`,direction:t=>`${t} Die Richtung kann sich verstärken oder ändern, je nachdem, wie du auf die zentrale Herausforderung und die kommenden Fakten reagierst.`},
   PT:{origin:(p,b,s)=>`${p} No fundo, ${lowerFirst(b)} Agora, ${lowerFirst(s)}`,challenge:(c,p)=>`${c} Ainda assim, ${lowerFirst(p)}`,development:nf=>`${nf} Não é uma conclusão fechada: é o próximo trecho se a dinâmica se mantiver.`,response:(a,e,h)=>`${a} Ao seu redor, ${lowerFirst(e)} Também pesam suas expectativas: ${lowerFirst(h)}`,direction:t=>`${t} A direção pode se fortalecer ou mudar conforme você responder ao desafio central e aos fatos que surgirem.`},
  };
  const ct=CC_T[lang]||CC_T.ES;
  return [
  section("origin",tt("Lo que te ha traído hasta aquí"),ct.origin(answerFor(byId,"past"),answerFor(byId,"base"),answerFor(byId,"situation"))),
  section("challenge",tt("El reto y la posibilidad"),ct.challenge(answerFor(byId,"cross"),answerFor(byId,"possibility"))),
  section("development",tt("Lo que empieza a moverse"),ct.development(answerFor(byId,"near_future"))),
  section("response",tt("Tu respuesta y lo que te rodea"),ct.response(answerFor(byId,"attitude"),answerFor(byId,"environment"),answerFor(byId,"hopes_fears"))),
  section("direction",tt("Tendencia"),ct.direction(answerFor(byId,"trend"))),
 ];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW&&id==="twelve_houses"){
  const HOUSE_LEADS={
   ES:{personal:"Tu identidad y tu vida interior muestran que",practical:"Recursos, hábitos y dirección profesional se relacionan así:",relational:"La comunicación y los vínculos señalan que",change:"La estructura de vida y el cambio profundo muestran que"},
   EN:{personal:"Your identity and inner life show that",practical:"Resources, habits, and professional direction relate like this:",relational:"Communication and bonds point to the fact that",change:"Life structure and deep change show that"},
   FR:{personal:"Ton identité et ta vie intérieure montrent que",practical:"Ressources, habitudes et direction professionnelle se rapportent ainsi :",relational:"La communication et les liens indiquent que",change:"La structure de vie et le changement profond montrent que"},
   DE:{personal:"Deine Identität und dein Innenleben zeigen, dass",practical:"Ressourcen, Gewohnheiten und berufliche Richtung stehen so in Beziehung:",relational:"Kommunikation und Bindungen zeigen, dass",change:"Lebensstruktur und tiefgreifender Wandel zeigen, dass"},
   PT:{personal:"Sua identidade e vida interior mostram que",practical:"Recursos, hábitos e direção profissional se relacionam assim:",relational:"A comunicação e os vínculos indicam que",change:"A estrutura de vida e a mudança profunda mostram que"},
  };
  const hl=HOUSE_LEADS[lang]||HOUSE_LEADS.ES;
  const axis=(ids,lead)=>`${lead} ${lowerFirst(ids.map(key=>answerFor(byId,key)).filter(Boolean).join(" "))}`;
  return [section("personal",tt("Eje personal"),axis(["self","unconscious"],hl.personal)),section("practical",tt("Eje práctico"),axis(["resources","routines","vocation"],hl.practical)),section("relational",tt("Eje relacional"),axis(["communication","bonds","community"],hl.relational)),section("change",tt("Eje de cambio"),axis(["home","creativity","transformation","vision"],hl.change))];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS&&id==="project_business")return [section("idea",tt("La idea"),answerFor(byId,"idea")),section("resources",tt("Recursos y mercado"),`${answerFor(byId,"resources")} ${answerFor(byId,"market")}`),section("obstacle",tt("Obstáculo"),answerFor(byId,"obstacle")),section("strategy",tt("Estrategia y resultado"),`${answerFor(byId,"strategy")} ${answerFor(byId,"result")}`)];
 if(strategy===TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,tt(index===0?"Situación":index===1?"Factores clave":"Dirección práctica"),body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,tt(index===0?"Las dos partes":index===1?"El vínculo":"Evolución"),body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.INNER_PROCESS)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,tt(index===0?"Lo que ocurre dentro":"Cómo integrarlo"),body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW)return Object.entries(narrativeSynthesis.arcs).map(([key,body],index)=>section(key,tt(index===0?"Núcleo del mapa":"Eje de apoyo"),body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE)return legacyStory.map((body,index)=>section(`stage_${index+1}`,tt(index===0?"Origen y presente":index===legacyStory.length-1?"Dirección":"Desarrollo"),body));
 if(strategy===TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE){
  const SEQ_CONNECTORS={ES:{two:[""," A partir de ahí, "],three:[""," Ahora, "," A partir de aquí, "]},EN:{two:[""," From there, "],three:[""," Now, "," From here, "]},FR:{two:[""," À partir de là, "],three:[""," Maintenant, "," À partir d'ici, "]},DE:{two:[""," Von dort aus, "],three:[""," Jetzt, "," Von hier aus, "]},PT:{two:[""," A partir daí, "],three:[""," Agora, "," A partir daqui, "]}};
  const seqT=SEQ_CONNECTORS[lang]||SEQ_CONNECTORS.ES,connectors=entries.length===2?seqT.two:seqT.three;
  const middle=entries[Math.floor(entries.length/2)],themes=middle?.cardData?.keys?.slice(0,2).join(AND_WORD[lang]||AND_WORD.ES)||(SHORT_SEQUENCE_FALLBACK_THEME[lang]||SHORT_SEQUENCE_FALLBACK_THEME.ES);
  const keyBody=(SHORT_SEQUENCE_KEY_BODY[lang]||SHORT_SEQUENCE_KEY_BODY.ES)(themes);
  return [section("reading",labels.reading,joinAnswers(entries,connectors)),section("key",labels.key,keyBody)];
 }
 return legacyStory.map((body,index)=>section(`reading_${index+1}`,index===0?labels.reading:labels.continuation,body));
}
const WARNING_PREFIX_T={ES:"No ignores este punto: ",EN:"Don't ignore this: ",FR:"Ne néglige pas ceci : ",DE:"Übersieh das nicht: ",PT:"Não ignore isto: "};
const WARNING_LEAD_RE={ES:/^no |^evita |^cuidado|^el riesgo|^detenerse|^puede |^hay /i,EN:/^don't |^avoid |^caution|^the risk|^stop |^it can |^there is |^there's /i,FR:/^ne |^évite |^attention|^le risque|^arrête|^cela peut |^il y a /i,DE:/^nicht |^vermeide|^vorsicht|^das risiko|^stoppe|^es kann |^es gibt /i,PT:/^não |^evite |^cuidado|^o risco|^pare |^pode |^há /i};
const WARNING_FALLBACK_T={
 ES:themes=>`Presta atención a esta tensión: ${themes} pueden convertirse en un problema si no se atienden a tiempo.`,
 EN:themes=>`Pay attention to this tension: ${themes} can become a problem if not addressed in time.`,
 FR:themes=>`Fais attention à cette tension : ${themes} peuvent devenir un problème si on ne s'en occupe pas à temps.`,
 DE:themes=>`Achte auf diese Spannung: ${themes} können zu einem Problem werden, wenn sie nicht rechtzeitig angegangen werden.`,
 PT:themes=>`Preste atenção a esta tensão: ${themes} podem se tornar um problema se não forem atendidos a tempo.`,
};
function warningFor(analysis,entries,sections=[],language="ES"){
 const explicit=entries.find(entry=>["risk","obstacle","warning","leakage","distance","cross","stop","trial"].includes(entry.spec.id)),reversed=entries.find(entry=>entry.orientation==="reversed"),semanticDanger=entries.find(entry=>DANGER_ROLES.has(entry.role)&&/riesgo|bloque|dificult|impide|prolong|evita|confusi|exceso|desigual|peligro|resistencia|aislamiento|risk|block|difficult|prevent|confus|excess|danger|resistance|isolat|risque|difficult|emp[êe]che|prolonge|confus|exc[èe]s|danger|r[ée]sistance|isolement|risiko|schwierig|verhindert|verwirrung|übermäßig|gefahr|widerstand|isolation|dificuldade|impede|confus|excesso|perigo|resist[êe]ncia|isolamento/i.test(entryAnswer(entry)));
 const source=explicit||reversed||semanticDanger;if(!source)return null;
 let body=entryAnswer(source);
 if(!body)return null;
 if(sections.some(item=>normalize(item.body).includes(normalize(body)))){
  const and=AND_WORD[language]||AND_WORD.ES,themes=source?.cardData?.keys?.slice(0,2).join(and)||source?.themes?.slice(0,2).join(and);
  if(!themes)return null;
  body=(WARNING_FALLBACK_T[language]||WARNING_FALLBACK_T.ES)(themes);
  return {id:"warning",title:"Lo que debes cuidar",body:capSentences(asSentence(body),2),sourcePositionIds:[source.positionId],sourceCardIds:[source.cardId],sourceRelationIds:[]};
 }
 const leadRe=WARNING_LEAD_RE[language]||WARNING_LEAD_RE.ES;
 if(!leadRe.test(body))body=`${WARNING_PREFIX_T[language]||WARNING_PREFIX_T.ES}${lowerFirst(body)}`;
 body=capSentences(asSentence(body),2);
 return {id:"warning",title:"Lo que debes cuidar",body,sourcePositionIds:[source.positionId],sourceCardIds:[source.cardId],sourceRelationIds:[]};
}
const ADVICE_FALLBACK_T={
 ES:themes=>`Actúa desde ${themes} y comprueba el efecto antes de sostener la siguiente decisión.`,
 EN:themes=>`Act from ${themes} and check the effect before locking in your next decision.`,
 FR:themes=>`Agis depuis ${themes} et vérifie l'effet avant d'arrêter ta prochaine décision.`,
 DE:themes=>`Handle aus ${themes} heraus und überprüfe die Wirkung, bevor du die nächste Entscheidung festlegst.`,
 PT:themes=>`Aja a partir de ${themes} e verifique o efeito antes de firmar a próxima decisão.`,
};
function adviceFor(strategy,entries,sections,cards,language="ES"){
 if([TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM,TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE].includes(strategy))return null;
 let source=ACTION_ROLES.map(role=>entries.find(entry=>entry.role===role)).find(Boolean);
 if(!source&&strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE)source=entries.find(entry=>["attitude","possibility","near_future"].includes(entry.spec.id));
 let body=source?entryAnswer(source):"";
 if(!body&&strategy===TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE&&cards[0]?.advice)body=asSentence(cards[0].advice);
 if(!body)return null;
 if(source&&entryAnswer(source)&&sections.some(item=>normalize(item.body).includes(normalize(entryAnswer(source))))){const and=AND_WORD[language]||AND_WORD.ES,themes=source?.cardData?.keys?.slice(0,2).join(and)||source?.themes?.slice(0,2).join(and);body=themes?(ADVICE_FALLBACK_T[language]||ADVICE_FALLBACK_T.ES)(themes):"";}
 if(!body)return null;
 const provenance=source||entries[0];
 return {id:"advice",title:OUTPUT_COPY[strategy]?.advice||"Orientación",body:capSentences(body,2),sourcePositionIds:[provenance.positionId],sourceCardIds:[provenance.cardId],sourceRelationIds:[]};
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
const FIT_LENGTH_T={
 ES:{singleCard:" Comprueba esta orientación con una acción pequeña antes de convertirla en una decisión definitiva.",overall:t=>`En conjunto, ${lowerFirst(t||"")}`,parts:"Las partes de la situación no actúan por separado: una puede reforzar, frenar o modificar a las demás.",weight:"No todo pesa igual: comprueba qué parte ya se refleja en hechos, cuál depende de tu respuesta y cuál todavía necesita tiempo.",noFixed:"La lectura no fija un resultado inevitable. Los siguientes hechos permitirán confirmar si la dirección se sostiene o necesita corregirse.",overallLabel:"En conjunto",readingLabel:"Lectura"},
 EN:{singleCard:" Check this guidance with a small action before turning it into a definitive decision.",overall:t=>`Overall, ${lowerFirst(t||"")}`,parts:"The parts of the situation don't act in isolation: one can reinforce, slow down, or change the others.",weight:"Not everything carries the same weight: check which part is already reflected in facts, which depends on your response, and which still needs time.",noFixed:"The reading doesn't fix an inevitable outcome. What happens next will confirm whether this direction holds or needs correcting.",overallLabel:"Overall",readingLabel:"Reading"},
 FR:{singleCard:" Vérifie cette orientation par une petite action avant d'en faire une décision définitive.",overall:t=>`Dans l'ensemble, ${lowerFirst(t||"")}`,parts:"Les parties de la situation n'agissent pas isolément : l'une peut renforcer, freiner ou modifier les autres.",weight:"Tout ne pèse pas de la même façon : vérifie quelle partie se reflète déjà dans les faits, laquelle dépend de ta réponse et laquelle a encore besoin de temps.",noFixed:"La lecture ne fixe pas un résultat inévitable. Les faits à venir permettront de confirmer si cette direction se maintient ou doit être corrigée.",overallLabel:"Dans l'ensemble",readingLabel:"Lecture"},
 DE:{singleCard:" Überprüfe diese Orientierung mit einer kleinen Handlung, bevor du sie in eine endgültige Entscheidung verwandelst.",overall:t=>`Insgesamt, ${lowerFirst(t||"")}`,parts:"Die Teile der Situation wirken nicht isoliert: einer kann die anderen verstärken, bremsen oder verändern.",weight:"Nicht alles wiegt gleich schwer: prüfe, welcher Teil sich bereits in Fakten widerspiegelt, welcher von deiner Antwort abhängt und welcher noch Zeit braucht.",noFixed:"Die Lesung legt kein unausweichliches Ergebnis fest. Die kommenden Fakten werden bestätigen, ob diese Richtung sich hält oder korrigiert werden muss.",overallLabel:"Insgesamt",readingLabel:"Lesung"},
 PT:{singleCard:" Verifique esta orientação com uma pequena ação antes de transformá-la numa decisão definitiva.",overall:t=>`Em conjunto, ${lowerFirst(t||"")}`,parts:"As partes da situação não agem isoladamente: uma pode reforçar, frear ou modificar as outras.",weight:"Nem tudo pesa igual: verifique qual parte já se reflete em fatos, qual depende da sua resposta e qual ainda precisa de tempo.",noFixed:"A leitura não fixa um resultado inevitável. Os próximos fatos permitirão confirmar se a direção se sustenta ou precisa ser corrigida.",overallLabel:"Em conjunto",readingLabel:"Leitura"},
};
function fitReadingLength(output,analysis,narrativeSynthesis){
 const bounds=readingBounds(analysis.positionDynamics.length,output.outputStrategy),sections=[...output.sections],lang=analysis.context?.language||"ES",flt=FIT_LENGTH_T[lang]||FIT_LENGTH_T.ES;
 let count=words(sections.map(item=>item.body).join(" "));
 if(count<bounds.min&&analysis.positionDynamics.length===1){sections[0]={...sections[0],body:cleanEditorial(`${sections[0].body}${flt.singleCard}`)};count=words(sections[0].body);}
 if([TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM,TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE].includes(output.outputStrategy))return {...output,sections,wordCount:count,lengthBounds:bounds};
 const additions=[
  cleanEditorial(flt.overall(narrativeSynthesis.reading_thesis)),
  flt.parts,
  flt.weight,
  flt.noFixed,
 ].filter(Boolean);
 for(const addition of additions){if(count>=bounds.min||analysis.positionDynamics.length===1)break;if(sections.some(item=>overlaps(addition,item.body)))continue;sections.push(section(`context_${sections.length}`,sections.length?flt.overallLabel:flt.readingLabel,addition));count=words(sections.map(item=>item.body).join(" "));}
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
 const lang=analysis.context?.language||"ES";
 const interpretiveSynthesis=buildInterpretiveSynthesis(analysis,cards),narrativeSynthesis=buildNarrativeSynthesis(analysis,cards,interpretiveSynthesis),paragraphs=Object.values(narrativeSynthesis.arcs).flat(),guidance={caution:narrativeSynthesis.warning,advice:narrativeSynthesis.actionable_guidance,reading:narrativeSynthesis.arcs.direction||""},edited=editorialNarrativeLayer({analysis,paragraphs,guidance});
 const outputStrategy=analysis.spreadGrammar.outputStrategy||TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE,entries=orderedEntries(analysis,cards),draftSections=outputSections(outputStrategy,analysis,cards,narrativeSynthesis,edited.story),warning=warningFor(analysis,entries,draftSections,lang),adviceBlock=adviceFor(outputStrategy,entries,draftSections,cards,lang),copy=OUTPUT_COPY[outputStrategy]||OUTPUT_COPY[TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],basePolished=polishReading({outputStrategy,title:copy.title,sections:draftSections,warning,adviceBlock}),polished=polishReading(fitReadingLength(basePolished,analysis,narrativeSynthesis));
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
