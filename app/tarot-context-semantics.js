const normalize=text=>(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const trim=text=>(text||"").trim().replace(/[.!?]+$/,"");
const lowerFirst=text=>text?text.charAt(0).toLowerCase()+text.slice(1):"";

export function resolveTarotDomain(primaryDomain,category="",questionContext=""){
 const source=normalize(`${category} ${questionContext}`);
 const inferred=/amor|pareja|relacion|vinculo|\bpersona\b/.test(source)?"AMOR_RELACIONES"
  :/dinero|econom|recurso|deuda|ahorro|ingreso/.test(source)?"DINERO_RECURSOS"
  :/trabajo|empleo|profesion|negocio|proyecto|cliente/.test(source)?"TRABAJO_PROFESION"
  :/espiritual|alma|medit|conciencia/.test(source)?"ESPIRITUAL"
  :/personal|emocion|proposito|crecimiento/.test(source)?"DESARROLLO_PERSONAL":null;
 if(primaryDomain==="GENERAL"||primaryDomain==="TEMPORAL")return inferred||primaryDomain;
 return primaryDomain||inferred||"GENERAL";
}

function domainMeaning(card,domain,category){
 if(domain==="AMOR_RELACIONES"&&card.love)return card.love;
 if(domain==="TRABAJO_PROFESION"&&card.work)return card.work;
 if(domain==="DINERO_RECURSOS"&&card.money)return card.money;
 if((domain==="DESARROLLO_PERSONAL"||domain==="ESPIRITUAL")&&card.growth)return card.growth;
 if(domain==="DECISION"&&card.advice)return card.advice;
 const source=normalize(category);
 if(/amor|relacion|pareja/.test(source)&&card.love)return card.love;
 if(/trabajo|empleo|negocio/.test(source)&&card.work)return card.work;
 if(/dinero|econom|recurso/.test(source)&&card.money)return card.money;
 if(/personal|crecimiento/.test(source)&&card.growth)return card.growth;
 return card.general;
}

function hasDomainSpecificMeaning(card,domain,category){
 if(domain==="AMOR_RELACIONES")return Boolean(card.love);
 if(domain==="TRABAJO_PROFESION")return Boolean(card.work);
 if(domain==="DINERO_RECURSOS")return Boolean(card.money);
 if(domain==="DESARROLLO_PERSONAL"||domain==="ESPIRITUAL")return Boolean(card.growth);
 if(domain==="DECISION")return Boolean(card.advice);
 const source=normalize(category);
 return (/amor|relacion|pareja/.test(source)&&Boolean(card.love))||(/trabajo|empleo|negocio/.test(source)&&Boolean(card.work))||(/dinero|econom|recurso/.test(source)&&Boolean(card.money))||(/personal|crecimiento/.test(source)&&Boolean(card.growth));
}

function domainPrefix(domain,semanticFunction){
 const area={AMOR_RELACIONES:"En el vínculo",TRABAJO_PROFESION:"En lo profesional",DINERO_RECURSOS:"En el manejo del dinero y los recursos",DESARROLLO_PERSONAL:"En tu desarrollo personal",ESPIRITUAL:"En el camino interior",DECISION:"Como criterio para decidir"}[domain];
 if(!area)return "";
 if(["ORIGIN","PAST"].includes(semanticFunction))return `${area}, este antecedente se concreta así:`;
 if(["OBSTACLE","RISK","FEAR"].includes(semanticFunction))return `${area}, el punto crítico es este:`;
 if(semanticFunction==="RESOURCE")return `${area}, esto funciona como recurso:`;
 if(["ACTION","ADVICE","DECISION","RELEASE"].includes(semanticFunction))return `${area}, la aplicación concreta es esta:`;
 if(["FUTURE","TREND","OUTCOME","CONSEQUENCE"].includes(semanticFunction))return `${area}, la dirección condicionada se expresa así:`;
 return `${area}, esto se manifiesta así:`;
}

function questionLens(questionContext=""){
 const question=normalize(questionContext);
 if(!question)return {type:"PURPOSE",clause:""};
 if(/por que|origen|causa/.test(question))return {type:"CAUSE",clause:"Se trata de una causa probable, no de la única explicación posible."};
 if(/cuando|cuanto tiempo/.test(question))return {type:"TIMING",clause:"Marca una condición de tiempo; no fija una fecha exacta."};
 if(/debo|conviene|elijo|elegir|opcion|camino/.test(question))return {type:"CHOICE",clause:"Úsalo como criterio para comparar consecuencias, no como una orden absoluta."};
 if(/como/.test(question))return {type:"METHOD",clause:"Lo importante será comprobar cómo se traduce en hechos observables."};
 if(/siente|piensa|hara|persona|relacion/.test(question))return {type:"RELATION",clause:"Describe una disposición probable; no confirma lo que la otra persona no haya expresado."};
 if(/pasara|futuro|resultado/.test(question))return {type:"OUTCOME",clause:"Describe una tendencia condicionada por lo que ocurra a partir de ahora."};
 return {type:"SUBJECT",clause:""};
}

function appliesQuestionLens(type,semanticFunction){
 const roles={CAUSE:["ORIGIN","PAST","OBSTACLE"],TIMING:["FUTURE","TREND","OUTCOME","CONSEQUENCE"],CHOICE:["DECISION","ACTION","ADVICE","RISK","OUTCOME"],METHOD:["ACTION","ADVICE","RESOURCE"],RELATION:["INTERNAL","RELATIONSHIP","ACTION"],OUTCOME:["FUTURE","TREND","OUTCOME","CONSEQUENCE"]};
 return (roles[type]||[]).includes(semanticFunction);
}

function reversalMode(card,semanticFunction,domain){
 const source=normalize(`${card.keys?.join(" ")} ${card.reversed||""}`);
 if(["INTERNAL","DESIRE"].includes(semanticFunction))return "INTERIORIZATION";
 if(["FUTURE","TREND","OUTCOME","CONSEQUENCE","BEGINNING"].includes(semanticFunction))return "DELAY";
 if(semanticFunction==="RESOURCE")return /exceso|impuls|confianza/.test(source)?"EXCESS":"DEFICIT";
 if(["OBSTACLE","RISK","FEAR"].includes(semanticFunction))return /equilibr|paciencia|prudencia|detalle|perfeccion/.test(source)?"EXCESS":"DISTORTION";
 if(domain==="DINERO_RECURSOS"&&/practica|detalle|recurso|accion|trabajo/.test(source))return "MISDIRECTED";
 if(["ACTION","ADVICE","DECISION"].includes(semanticFunction))return "MISDIRECTED";
 return /apego|resistencia|miedo/.test(source)?"RESISTANCE":"BLOCK";
}

function reversalClause(mode){
 return {INTERIORIZATION:"Al aparecer invertida, esa energía permanece en el interior y cuesta expresarla.",DELAY:"Al aparecer invertida, señala demora o una salida que todavía no consigue concretarse.",EXCESS:"Al aparecer invertida, lleva esa cualidad al exceso y puede agravar lo que debía resolver.",DEFICIT:"Al aparecer invertida, muestra una capacidad disponible, pero insuficiente o difícil de utilizar ahora.",DISTORTION:"Al aparecer invertida, esa cualidad se distorsiona y puede llevar a leer mal la situación.",MISDIRECTED:"Al aparecer invertida, muestra esfuerzo o intención mal canalizados, con poco resultado observable.",RESISTANCE:"Al aparecer invertida, señala resistencia a un cambio que ya pide respuesta.",BLOCK:"Al aparecer invertida, bloquea o debilita la expresión de esta carta."}[mode];
}

function reversalAnswerClause(mode){
 return {INTERIORIZATION:"La respuesta permanece contenida y cuesta expresarla de forma visible.",DELAY:"La consecuencia puede demorarse o no llegar a concretarse todavía.",EXCESS:"El exceso de esa cualidad puede agravar lo que debía resolver.",DEFICIT:"La capacidad existe, pero todavía resulta insuficiente o difícil de utilizar.",DISTORTION:"Esa cualidad puede distorsionarse y llevar a leer mal la situación.",MISDIRECTED:"El esfuerzo puede quedar mal canalizado y producir poco resultado observable.",RESISTANCE:"La resistencia a cambiar prolonga una dinámica que ya pide respuesta.",BLOCK:"La energía disponible encuentra un bloqueo y no consigue expresarse por completo."}[mode]||"";
}

function hasMeaningOverlap(base,domainCore){
 const baseWords=new Set(normalize(base).split(/\W+/).filter(word=>word.length>6));
 const coreWords=normalize(domainCore).split(/\W+/).filter(word=>word.length>6);
 const matches=coreWords.filter(word=>baseWords.has(word)).length;
 return matches>=2||Boolean(coreWords.length&&matches/coreWords.length>=.5);
}

const sentence=text=>{const clean=trim(text);return clean?clean.charAt(0).toUpperCase()+clean.slice(1):"";};
const answerSeed=(semanticRange,key,fallback)=>trim(semanticRange?.[key]||fallback||semanticRange?.general||"");

function answerForMode(answerMode,semanticRange,baseInterpretation){
 const oriented=answerSeed(semanticRange,"orientation",baseInterpretation);
 const constructive=answerSeed(semanticRange,"constructive",oriented);
 const challenging=answerSeed(semanticRange,"challenging",oriented);
 const actionable=answerSeed(semanticRange,"actionable",oriented);
 const outcome=answerSeed(semanticRange,"outcome",oriented);
 const antecedent=answerSeed(semanticRange,"past",oriented);
 const emotional=answerSeed(semanticRange,"emotional",oriented);
 const mental=answerSeed(semanticRange,"mental",oriented);
 const external=answerSeed(semanticRange,"external",oriented);
 const selected=(key,uprightSeed)=>semanticRange?.isReversed?oriented:answerSeed(semanticRange,key,uprightSeed);
 const modes={
  PRESERVE_CONSTRUCTIVE:()=>`Conviene conservar este aspecto valioso: ${sentence(selected("constructive",constructive))}.`,
  RELEASE_EXPRESSION:()=>`Conviene dejar atrás esta expresión: ${sentence(selected("challenging",challenging))}.`,
  ENDING_EXPRESSION:()=>`Termina una etapa marcada por esto: ${sentence(selected("past",antecedent))}.`,
  INITIATE_EXPRESSION:()=>`Lo nuevo empieza al responder de esta manera: ${sentence(selected("actionable",actionable))}.`,
  FIRST_ACTION:()=>`El primer paso es concreto: ${sentence(selected("actionable",actionable))}.`,
  FUNCTIONAL_ADVANTAGE:()=>`Esto juega a favor de la situación: ${sentence(selected("constructive",constructive))}.`,
  FUNCTIONAL_OPPORTUNITY:()=>`La posibilidad real consiste en esto: ${sentence(selected("opportunity",constructive))}.`,
  EXPOSE_RISK:()=>`El riesgo concreto es este: ${sentence(selected("challenging",challenging))}.`,
  EXPOSE_OBSTACLE:()=>`La situación se complica de esta manera: ${sentence(selected("challenging",challenging))}.`,
  EXPOSE_LEAKAGE:()=>`La pérdida o dispersión de recursos aparece aquí: ${sentence(selected("challenging",challenging))}.`,
  ACTIVATE_RESOURCE:()=>`Puedes utilizar constructivamente esta capacidad: ${sentence(selected("constructive",constructive))}.`,
  INTEGRATE_LEARNING:()=>`El aprendizaje que conviene integrar es este: ${sentence(selected("learning",constructive))}.`,
  ENABLE_INFLOW:()=>`La entrada de recursos se favorece de esta manera: ${sentence(selected("constructive",constructive))}.`,
  BUILD_RESERVE:()=>`Puedes conservar o acumular recursos de esta manera: ${sentence(selected("constructive",constructive))}.`,
  MOBILIZE_RESOURCES:()=>`Para poner los recursos en movimiento, el paso útil es este: ${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_STRATEGY:()=>`La estrategia concreta es esta: ${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_ADVICE:()=>`La respuesta útil consiste en esto: ${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_RESPONSE:()=>`La acción que responde a esta posición es la siguiente: ${sentence(selected("actionable",actionable))}.`,
  BEHAVIORAL_RESPONSE:()=>`La conducta más probable se expresa así: ${sentence(selected("actionable",actionable))}.`,
  CONDITIONAL_OUTCOME:()=>`Si la dinámica anterior continúa, puede desarrollarse este escenario: ${sentence(selected("outcome",outcome))}.`,
  CONDITIONAL_TREND:()=>`La dirección probable, si no cambian las condiciones, es esta: ${sentence(selected("outcome",outcome))}.`,
  PAST_INFLUENCE:()=>`Este antecedente todavía influye: ${sentence(selected("past",antecedent))}.`,
  ORIGIN_EXPLANATION:()=>`El origen o fundamento se explica de esta manera: ${sentence(selected("past",antecedent))}.`,
  EMOTIONAL_RESPONSE:()=>`En el plano emocional, la respuesta es esta: ${sentence(selected("emotional",emotional))}.`,
  MENTAL_RESPONSE:()=>`En el plano mental, la respuesta es esta: ${sentence(selected("mental",mental))}.`,
  INTERNAL_RESPONSE:()=>`La disposición interna se expresa así: ${sentence(oriented)}.`,
  EXTERNAL_RESPONSE:()=>`La respuesta del entorno se manifiesta así: ${sentence(selected("external",external))}.`,
  RELATIONAL_RESPONSE:()=>`La dinámica entre las partes se expresa así: ${sentence(oriented)}.`,
  ADVANCE_CONDITION:()=>`Avanzar recibe respaldo bajo esta condición: ${sentence(selected("constructive",constructive))}.`,
  WAIT_CONDITION:()=>`Conviene esperar mientras se mantenga esta condición: ${sentence(oriented)}.`,
  STOP_CONDITION:()=>`Detenerse se justifica si aparece esta condición: ${sentence(selected("challenging",challenging))}.`,
  DECISION_CONDITION:()=>`La decisión depende de comprobar esta condición: ${sentence(oriented)}.`,
  DESIRE_OR_FEAR:()=>`La expectativa o el temor que influye es este: ${sentence(oriented)}.`,
  ASSESS_IDEA:()=>`La idea muestra esta cualidad o problema central: ${sentence(oriented)}.`,
  ASSESS_RESOURCES:()=>`Los recursos disponibles o faltantes se describen así: ${sentence(oriented)}.`,
  CURRENT_STATE_ANSWER:()=>`La situación actual se expresa así: ${sentence(oriented)}.`,
  POSITION_SPECIFIC_ANSWER:()=>sentence(oriented)
 };
 return trim((modes[answerMode]||modes.POSITION_SPECIFIC_ANSWER)());
}

export function buildPositionAnswer({card,position,positionSpec,baseInterpretation,semanticRange={},spread,domain,secondaryDomains=[],mode,purpose="",questionContext,category,neighboringCards=[],themes=[],confidence="medium"}){
 const semanticFunction=positionSpec?.function||"CURRENT_STATE",effectiveDomain=resolveTarotDomain(domain,category,questionContext),core=trim(domainMeaning(card,effectiveDomain,category));
 const answerMode=positionSpec?.answerMode||"POSITION_SPECIFIC_ANSWER",positionQuestion=positionSpec?.question||"¿Cómo responde esta carta a la pregunta de esta posición?";
 const parts=[answerForMode(answerMode,{...semanticRange,isReversed:Boolean(card.isReversed)},baseInterpretation)];
 const prefix=domainPrefix(effectiveDomain,semanticFunction);
 if(prefix&&core&&hasDomainSpecificMeaning(card,effectiveDomain,category)&&!hasMeaningOverlap(parts[0],core))parts.push(`${prefix} ${lowerFirst(core)}`.trim());
 const lens=questionLens(questionContext);
 if(lens.clause&&appliesQuestionLens(lens.type,semanticFunction))parts.push(lens.clause);
 const reversedMode=card.isReversed?reversalMode(card,semanticFunction,effectiveDomain):null;
 if(reversedMode){const effect=reversalAnswerClause(reversedMode);if(effect&&!hasMeaningOverlap(parts.join(" "),effect))parts.push(effect);}
 const neighborThemes=new Set(neighboringCards.flatMap(item=>item.keys||[]).map(normalize));
 const supportingThemes=[...new Set(themes.filter(theme=>neighborThemes.has(normalize(theme))))];
 const joined=parts.map(trim).filter(Boolean).join(". ").replace(/\.\s*\./g,".").trim();
 const answer=joined&&/[.!?]$/.test(joined)?joined:`${joined}.`;
 return {
  id:positionSpec?.id||null,positionId:positionSpec?.id||null,positionLabel:positionSpec?.label||position,position,positionQuestion,question:positionQuestion,
  semanticRole:semanticFunction,positionFunction:semanticFunction,positionRole:positionSpec?.role||"general",answerMode,
  cardId:card.id,cardName:card.name,card:card.name,orientation:card.isReversed?"reversed":"upright",domain:effectiveDomain,secondaryDomains,mode,spread,purpose,
  answer,interpretation:answer,cardSemanticRange:semanticRange,supportingThemes,rejectedAlternatives:["significado general que no responde la posición","polaridad fija aplicada antes de la función"],
  questionContext:questionContext||"",questionLens:lens.type,coreMeaning:core,reversalMode:reversedMode,orientationEffect:reversedMode?reversalClause(reversedMode):"expresión directa",
  neighborCards:neighboringCards.map(item=>item.name),themes,confidence
 };
}

export function buildContextualProposition(input){
 return buildPositionAnswer(input);
}

const canonicalType=type=>{
 const value=normalize(type).replace(/_/g," ");
 if(/conflict|block|problem|tension/.test(value))return "blocks";
 if(/contradict|contrast|internal external|bias/.test(value))return "contradicts";
 if(/cause|explain|origin|underlies/.test(value))return "causes";
 if(/resolve|response|advice/.test(value))return "resolves";
 if(/enable|support|contribute|resource|inflow|condition/.test(value))return "enables";
 if(/transform|transition|learning|manifest|becomes/.test(value))return "transforms";
 if(/continue|develop|evolution|consequence|outcome|lead|shape/.test(value))return "continues";
 return "reinforces";
};

function relationSentence(from,to,type){
 const first=trim(from.answer||from.interpretation),second=trim(to.answer||to.interpretation);
 const bridges={
  reinforces:`${sentence(first)}. Esa respuesta refuerza que ${lowerFirst(second)}`,
  contradicts:`${sentence(first)}. Esta respuesta entra en tensión con el hecho de que ${lowerFirst(second)}`,
  causes:`${sentence(first)}. Ese antecedente ayuda a explicar que ${lowerFirst(second)}`,
  blocks:`${sentence(first)}. Esa dinámica limita que ${lowerFirst(second)}`,
  enables:`${sentence(first)}. Esto hace posible que ${lowerFirst(second)}`,
  transforms:`${sentence(first)}. Para continuar, esa respuesta necesita transformarse en que ${lowerFirst(second)}`,
  resolves:`${sentence(first)}. La respuesta concreta aparece cuando ${lowerFirst(second)}`,
  continues:`${sentence(first)}. A partir de ahí, la dinámica continúa hacia que ${lowerFirst(second)}`
 };
 return bridges[type]||bridges.reinforces;
}

export function buildPropositionRelations(grammar,propositions){
 const byId=new Map(propositions.map(item=>[item.id,item]));
 return grammar.relationships.map((definition,index)=>{
  const from=byId.get(definition.from),to=byId.get(definition.to);if(!from||!to)return null;
  let type=canonicalType(definition.type);
  if(grammar.id==="economic_block"){
   const causal={"origin>manifestation":"causes","manifestation>pattern":"continues","pattern>resource":"blocks","resource>exit":"enables"};
   type=causal[`${definition.from}>${definition.to}`]||type;
  }
  const shared=from.themes.filter(theme=>to.themes.includes(theme));
  if(from.orientation!==to.orientation&&type==="reinforces")type="contradicts";
  else if(shared.length&&type==="continues")type="reinforces";
  if(to.orientation==="reversed"&&["enables","continues","reinforces"].includes(type))type="blocks";
  const bridge=relationSentence(from,to,type);
  return {id:`relation_${index+1}`,from:from.positionId,to:to.positionId,type,relationType:type,sourceType:definition.type,
   sourcePositionIds:[from.positionId,to.positionId],sourceCardIds:[from.cardId,to.cardId],interpretation:bridge,effect:bridge,bridge,
   fromAnswer:from.answer,toAnswer:to.answer,sharedThemes:shared,confidence:shared.length||from.cardId===to.cardId?"high":"medium"};
 }).filter(Boolean);
}

export function contextualRelationMovement(from,to,relations=[]){
 if(!from||!to)return "";
 const relation=relations.find(item=>item.from===from.id&&item.to===to.id)||relations.find(item=>item.from===to.id&&item.to===from.id);
 if(!relation)return `${sentence(from.answer||from.interpretation)}. A partir de esa respuesta, ${lowerFirst(to.answer||to.interpretation)}; el resultado sigue condicionado por las decisiones y los hechos.`;
 if(relation.bridge)return relation.bridge;
 const endings={reinforces:"ambas posiciones se apoyan y hacen más consistente esa dirección",contradicts:"las dos posiciones no avanzan al mismo ritmo y exigen resolver la contradicción",causes:"el antecedente ayuda a explicar lo que aparece después",blocks:"el primer factor limita la expresión del segundo",enables:"el primer factor aporta una condición que permite desarrollar el segundo",transforms:"lo primero necesita cambiar para convertirse en lo segundo",resolves:"la segunda posición ofrece una respuesta concreta a la primera",continues:"lo primero prolonga sus efectos en lo que viene después"};
 return `${relation.effect}: ${trim(from.interpretation)}. Después, ${trim(to.interpretation)}; ${endings[relation.type]}.`;
}
