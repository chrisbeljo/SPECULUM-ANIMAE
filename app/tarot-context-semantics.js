import {riderDeck} from "./rider-deck.ts";

const normalize=text=>(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const trim=text=>(text||"").trim().replace(/[.!?]+$/,"");
const lowerFirst=text=>text?text.charAt(0).toLowerCase()+text.slice(1):"";
const canonicalById=Object.fromEntries(riderDeck.map(card=>[card.id,card]));
const canonicalOf=card=>canonicalById[card?.id]||card;

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

const DOMAIN_AREA={
 ES:{AMOR_RELACIONES:"En el vínculo",TRABAJO_PROFESION:"En lo profesional",DINERO_RECURSOS:"En el manejo del dinero y los recursos",DESARROLLO_PERSONAL:"En tu desarrollo personal",ESPIRITUAL:"En el camino interior",DECISION:"Como criterio para decidir"},
 EN:{AMOR_RELACIONES:"In the relationship",TRABAJO_PROFESION:"Professionally",DINERO_RECURSOS:"In how money and resources are managed",DESARROLLO_PERSONAL:"In your personal development",ESPIRITUAL:"On the inner path",DECISION:"As a criterion for deciding"},
 FR:{AMOR_RELACIONES:"Dans le lien",TRABAJO_PROFESION:"Sur le plan professionnel",DINERO_RECURSOS:"Dans la gestion de l'argent et des ressources",DESARROLLO_PERSONAL:"Dans ton développement personnel",ESPIRITUAL:"Sur le chemin intérieur",DECISION:"Comme critère de décision"},
 DE:{AMOR_RELACIONES:"In der Beziehung",TRABAJO_PROFESION:"Beruflich",DINERO_RECURSOS:"Im Umgang mit Geld und Ressourcen",DESARROLLO_PERSONAL:"In deiner persönlichen Entwicklung",ESPIRITUAL:"Auf dem inneren Weg",DECISION:"Als Entscheidungskriterium"},
 PT:{AMOR_RELACIONES:"No vínculo",TRABAJO_PROFESION:"No âmbito profissional",DINERO_RECURSOS:"Na gestão do dinheiro e dos recursos",DESARROLLO_PERSONAL:"No seu desenvolvimento pessoal",ESPIRITUAL:"No caminho interior",DECISION:"Como critério para decidir"},
};
function domainPrefix(domain,semanticFunction,language="ES"){
 const areas=DOMAIN_AREA[language]||DOMAIN_AREA.ES,area=areas[domain];
 return area?`${area}:`:"";
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
 const canonical=canonicalOf(card),source=normalize(`${canonical.keys?.join(" ")} ${canonical.reversed||""}`);
 if(["INTERNAL","DESIRE"].includes(semanticFunction))return "INTERIORIZATION";
 if(["FUTURE","TREND","OUTCOME","CONSEQUENCE","BEGINNING"].includes(semanticFunction))return "DELAY";
 if(semanticFunction==="RESOURCE")return /exceso|impuls|confianza/.test(source)?"EXCESS":"DEFICIT";
 if(["OBSTACLE","RISK","FEAR"].includes(semanticFunction))return /equilibr|paciencia|prudencia|detalle|perfeccion/.test(source)?"EXCESS":"DISTORTION";
 if(domain==="DINERO_RECURSOS"&&/practica|detalle|recurso|accion|trabajo/.test(source))return "MISDIRECTED";
 if(["ACTION","ADVICE","DECISION"].includes(semanticFunction))return "MISDIRECTED";
 return /apego|resistencia|miedo/.test(source)?"RESISTANCE":"BLOCK";
}

const REVERSAL_CLAUSE={
 ES:{INTERIORIZATION:"Al aparecer invertida, esa energía permanece en el interior y cuesta expresarla.",DELAY:"Al aparecer invertida, señala demora o una salida que todavía no consigue concretarse.",EXCESS:"Al aparecer invertida, lleva esa cualidad al exceso y puede agravar lo que debía resolver.",DEFICIT:"Al aparecer invertida, muestra una capacidad disponible, pero insuficiente o difícil de utilizar ahora.",DISTORTION:"Al aparecer invertida, esa cualidad se distorsiona y puede llevar a leer mal la situación.",MISDIRECTED:"Al aparecer invertida, muestra esfuerzo o intención mal canalizados, con poco resultado observable.",RESISTANCE:"Al aparecer invertida, señala resistencia a un cambio que ya pide respuesta.",BLOCK:"Al aparecer invertida, bloquea o debilita la expresión de esta carta."},
 EN:{INTERIORIZATION:"Appearing reversed, that energy stays inward and struggles to express itself.",DELAY:"Appearing reversed, it signals delay or an outcome that hasn't yet taken shape.",EXCESS:"Appearing reversed, it pushes that quality into excess and can worsen what it was meant to resolve.",DEFICIT:"Appearing reversed, it shows an available capacity that's still insufficient or hard to use right now.",DISTORTION:"Appearing reversed, that quality becomes distorted and can lead to misreading the situation.",MISDIRECTED:"Appearing reversed, it shows effort or intention poorly channeled, with little observable result.",RESISTANCE:"Appearing reversed, it signals resistance to a change that's already asking for a response.",BLOCK:"Appearing reversed, it blocks or weakens the expression of this card."},
 FR:{INTERIORIZATION:"En apparaissant inversée, cette énergie reste à l'intérieur et peine à s'exprimer.",DELAY:"En apparaissant inversée, elle signale un retard ou une issue qui ne se concrétise pas encore.",EXCESS:"En apparaissant inversée, elle pousse cette qualité à l'excès et peut aggraver ce qu'elle devait résoudre.",DEFICIT:"En apparaissant inversée, elle montre une capacité disponible, mais insuffisante ou difficile à utiliser maintenant.",DISTORTION:"En apparaissant inversée, cette qualité se déforme et peut conduire à mal lire la situation.",MISDIRECTED:"En apparaissant inversée, elle montre un effort ou une intention mal canalisés, avec peu de résultat observable.",RESISTANCE:"En apparaissant inversée, elle signale une résistance à un changement qui demande déjà une réponse.",BLOCK:"En apparaissant inversée, elle bloque ou affaiblit l'expression de cette carte."},
 DE:{INTERIORIZATION:"Umgekehrt erscheinend bleibt diese Energie im Inneren und lässt sich nur schwer ausdrücken.",DELAY:"Umgekehrt erscheinend zeigt sie Verzögerung an oder einen Ausgang, der noch keine Form gefunden hat.",EXCESS:"Umgekehrt erscheinend treibt sie diese Eigenschaft ins Übermaß und kann verschlimmern, was sie lösen sollte.",DEFICIT:"Umgekehrt erscheinend zeigt sie eine verfügbare Fähigkeit, die aber noch unzureichend oder schwer nutzbar ist.",DISTORTION:"Umgekehrt erscheinend verzerrt sich diese Eigenschaft und kann zu einer falschen Lesart der Situation führen.",MISDIRECTED:"Umgekehrt erscheinend zeigt sie schlecht gelenkte Anstrengung oder Absicht mit wenig beobachtbarem Ergebnis.",RESISTANCE:"Umgekehrt erscheinend zeigt sie Widerstand gegen eine Veränderung, die bereits eine Antwort verlangt.",BLOCK:"Umgekehrt erscheinend blockiert oder schwächt sie den Ausdruck dieser Karte."},
 PT:{INTERIORIZATION:"Ao aparecer invertida, essa energia permanece no interior e custa a se expressar.",DELAY:"Ao aparecer invertida, sinaliza demora ou uma saída que ainda não consegue se concretizar.",EXCESS:"Ao aparecer invertida, leva essa qualidade ao excesso e pode agravar o que deveria resolver.",DEFICIT:"Ao aparecer invertida, mostra uma capacidade disponível, mas insuficiente ou difícil de utilizar agora.",DISTORTION:"Ao aparecer invertida, essa qualidade se distorce e pode levar a interpretar mal a situação.",MISDIRECTED:"Ao aparecer invertida, mostra esforço ou intenção mal canalizados, com pouco resultado observável.",RESISTANCE:"Ao aparecer invertida, sinaliza resistência a uma mudança que já pede resposta.",BLOCK:"Ao aparecer invertida, bloqueia ou enfraquece a expressão desta carta."},
};
const REVERSAL_ANSWER_CLAUSE={
 ES:{INTERIORIZATION:"La respuesta permanece contenida y cuesta expresarla de forma visible.",DELAY:"La consecuencia puede demorarse o no llegar a concretarse todavía.",EXCESS:"El exceso de esa cualidad puede agravar lo que debía resolver.",DEFICIT:"La capacidad existe, pero todavía resulta insuficiente o difícil de utilizar.",DISTORTION:"Esa cualidad puede distorsionarse y llevar a leer mal la situación.",MISDIRECTED:"El esfuerzo puede quedar mal canalizado y producir poco resultado observable.",RESISTANCE:"La resistencia a cambiar prolonga una dinámica que ya pide respuesta.",BLOCK:"La energía disponible encuentra un bloqueo y no consigue expresarse por completo."},
 EN:{INTERIORIZATION:"The response stays contained and struggles to express itself visibly.",DELAY:"The consequence may be delayed or not yet take shape.",EXCESS:"The excess of that quality can worsen what it was meant to resolve.",DEFICIT:"The capacity exists, but is still insufficient or hard to use.",DISTORTION:"That quality can become distorted and lead to misreading the situation.",MISDIRECTED:"The effort can end up poorly channeled and produce little observable result.",RESISTANCE:"Resistance to change prolongs a dynamic that's already asking for a response.",BLOCK:"The available energy runs into a block and can't fully express itself."},
 FR:{INTERIORIZATION:"La réponse reste contenue et peine à s'exprimer visiblement.",DELAY:"La conséquence peut se retarder ou ne pas encore se concrétiser.",EXCESS:"L'excès de cette qualité peut aggraver ce qu'elle devait résoudre.",DEFICIT:"La capacité existe, mais reste insuffisante ou difficile à utiliser.",DISTORTION:"Cette qualité peut se déformer et conduire à mal lire la situation.",MISDIRECTED:"L'effort peut être mal canalisé et produire peu de résultat observable.",RESISTANCE:"La résistance au changement prolonge une dynamique qui demande déjà une réponse.",BLOCK:"L'énergie disponible rencontre un blocage et ne parvient pas à s'exprimer pleinement."},
 DE:{INTERIORIZATION:"Die Antwort bleibt zurückgehalten und lässt sich nur schwer sichtbar ausdrücken.",DELAY:"Die Folge kann sich verzögern oder noch keine Form gefunden haben.",EXCESS:"Das Übermaß dieser Eigenschaft kann verschlimmern, was sie lösen sollte.",DEFICIT:"Die Fähigkeit existiert, ist aber noch unzureichend oder schwer nutzbar.",DISTORTION:"Diese Eigenschaft kann sich verzerren und zu einer falschen Lesart der Situation führen.",MISDIRECTED:"Die Anstrengung kann schlecht gelenkt werden und wenig beobachtbares Ergebnis bringen.",RESISTANCE:"Der Widerstand gegen Veränderung verlängert eine Dynamik, die bereits eine Antwort verlangt.",BLOCK:"Die verfügbare Energie stößt auf eine Blockade und kann sich nicht vollständig ausdrücken."},
 PT:{INTERIORIZATION:"A resposta permanece contida e custa a se expressar de forma visível.",DELAY:"A consequência pode se atrasar ou ainda não se concretizar.",EXCESS:"O excesso dessa qualidade pode agravar o que deveria resolver.",DEFICIT:"A capacidade existe, mas ainda é insuficiente ou difícil de utilizar.",DISTORTION:"Essa qualidade pode se distorcer e levar a interpretar mal a situação.",MISDIRECTED:"O esforço pode ficar mal canalizado e produzir pouco resultado observável.",RESISTANCE:"A resistência à mudança prolonga uma dinâmica que já pede resposta.",BLOCK:"A energia disponível encontra um bloqueio e não consegue se expressar por completo."},
};
function reversalClause(mode,language="ES"){
 return (REVERSAL_CLAUSE[language]||REVERSAL_CLAUSE.ES)[mode];
}

function reversalAnswerClause(mode,language="ES"){
 return (REVERSAL_ANSWER_CLAUSE[language]||REVERSAL_ANSWER_CLAUSE.ES)[mode]||"";
}

function hasMeaningOverlap(base,domainCore){
 const baseWords=new Set(normalize(base).split(/\W+/).filter(word=>word.length>6));
 const coreWords=normalize(domainCore).split(/\W+/).filter(word=>word.length>6);
 const matches=coreWords.filter(word=>baseWords.has(word)).length;
 return matches>=2||Boolean(coreWords.length&&matches/coreWords.length>=.5);
}

const sentence=text=>{const clean=trim(text);return clean?clean.charAt(0).toUpperCase()+clean.slice(1):"";};
const answerSeed=(semanticRange,key,fallback)=>trim(semanticRange?.[key]||fallback||semanticRange?.general||"");

// Antes cada modo envolvía el contenido con una frase puente ("X se expresa así:") repetida en cada posición;
// ahora el contenido queda directo, ya que el título de sección o la etiqueta que lo acompaña aporta el contexto.
const MODE_TEMPLATES={
 PRESERVE_CONSTRUCTIVE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 RELEASE_EXPRESSION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ENDING_EXPRESSION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 INITIATE_EXPRESSION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 FIRST_ACTION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 FUNCTIONAL_ADVANTAGE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 FUNCTIONAL_OPPORTUNITY:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 EXPOSE_RISK:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 EXPOSE_OBSTACLE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 EXPOSE_LEAKAGE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ACTIVATE_RESOURCE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 INTEGRATE_LEARNING:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ENABLE_INFLOW:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 BUILD_RESERVE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 MOBILIZE_RESOURCES:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ACTIONABLE_STRATEGY:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ACTIONABLE_ADVICE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ACTIONABLE_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 BEHAVIORAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 CONDITIONAL_OUTCOME:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 CONDITIONAL_TREND:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 PAST_INFLUENCE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ORIGIN_EXPLANATION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 EMOTIONAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 MENTAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 INTERNAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 EXTERNAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 RELATIONAL_RESPONSE:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ADVANCE_CONDITION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 WAIT_CONDITION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 STOP_CONDITION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 DECISION_CONDITION:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 DESIRE_OR_FEAR:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ASSESS_IDEA:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 ASSESS_RESOURCES:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
 CURRENT_STATE_ANSWER:{EN:s=>`${s}.`,FR:s=>`${s}.`,DE:s=>`${s}.`,PT:s=>`${s}.`},
};
function answerForMode(answerMode,semanticRange,baseInterpretation,language="ES"){
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
  PRESERVE_CONSTRUCTIVE:()=>`${sentence(selected("constructive",constructive))}.`,
  RELEASE_EXPRESSION:()=>`${sentence(selected("challenging",challenging))}.`,
  ENDING_EXPRESSION:()=>`${sentence(selected("past",antecedent))}.`,
  INITIATE_EXPRESSION:()=>`${sentence(selected("actionable",actionable))}.`,
  FIRST_ACTION:()=>`${sentence(selected("actionable",actionable))}.`,
  FUNCTIONAL_ADVANTAGE:()=>`${sentence(selected("constructive",constructive))}.`,
  FUNCTIONAL_OPPORTUNITY:()=>`${sentence(selected("opportunity",constructive))}.`,
  EXPOSE_RISK:()=>`${sentence(selected("challenging",challenging))}.`,
  EXPOSE_OBSTACLE:()=>`${sentence(selected("challenging",challenging))}.`,
  EXPOSE_LEAKAGE:()=>`${sentence(selected("challenging",challenging))}.`,
  ACTIVATE_RESOURCE:()=>`${sentence(selected("constructive",constructive))}.`,
  INTEGRATE_LEARNING:()=>`${sentence(selected("learning",constructive))}.`,
  ENABLE_INFLOW:()=>`${sentence(selected("constructive",constructive))}.`,
  BUILD_RESERVE:()=>`${sentence(selected("constructive",constructive))}.`,
  MOBILIZE_RESOURCES:()=>`${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_STRATEGY:()=>`${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_ADVICE:()=>`${sentence(selected("actionable",actionable))}.`,
  ACTIONABLE_RESPONSE:()=>`${sentence(selected("actionable",actionable))}.`,
  BEHAVIORAL_RESPONSE:()=>`${sentence(selected("actionable",actionable))}.`,
  CONDITIONAL_OUTCOME:()=>`${sentence(selected("outcome",outcome))}.`,
  CONDITIONAL_TREND:()=>`${sentence(selected("outcome",outcome))}.`,
  PAST_INFLUENCE:()=>`${sentence(selected("past",antecedent))}.`,
  ORIGIN_EXPLANATION:()=>`${sentence(selected("past",antecedent))}.`,
  EMOTIONAL_RESPONSE:()=>`${sentence(selected("emotional",emotional))}.`,
  MENTAL_RESPONSE:()=>`${sentence(selected("mental",mental))}.`,
  INTERNAL_RESPONSE:()=>`${sentence(oriented)}.`,
  EXTERNAL_RESPONSE:()=>`${sentence(selected("external",external))}.`,
  RELATIONAL_RESPONSE:()=>`${sentence(oriented)}.`,
  ADVANCE_CONDITION:()=>`${sentence(selected("constructive",constructive))}.`,
  WAIT_CONDITION:()=>`${sentence(oriented)}.`,
  STOP_CONDITION:()=>`${sentence(selected("challenging",challenging))}.`,
  DECISION_CONDITION:()=>`${sentence(oriented)}.`,
  DESIRE_OR_FEAR:()=>`${sentence(oriented)}.`,
  ASSESS_IDEA:()=>`${sentence(oriented)}.`,
  ASSESS_RESOURCES:()=>`${sentence(oriented)}.`,
  CURRENT_STATE_ANSWER:()=>`${sentence(oriented)}.`,
  POSITION_SPECIFIC_ANSWER:()=>sentence(oriented)
 };
 if(language&&language!=="ES"){
  const template=MODE_TEMPLATES[answerMode];
  if(template?.[language]){
   const contentMap={PRESERVE_CONSTRUCTIVE:()=>selected("constructive",constructive),RELEASE_EXPRESSION:()=>selected("challenging",challenging),ENDING_EXPRESSION:()=>selected("past",antecedent),INITIATE_EXPRESSION:()=>selected("actionable",actionable),FIRST_ACTION:()=>selected("actionable",actionable),FUNCTIONAL_ADVANTAGE:()=>selected("constructive",constructive),FUNCTIONAL_OPPORTUNITY:()=>selected("opportunity",constructive),EXPOSE_RISK:()=>selected("challenging",challenging),EXPOSE_OBSTACLE:()=>selected("challenging",challenging),EXPOSE_LEAKAGE:()=>selected("challenging",challenging),ACTIVATE_RESOURCE:()=>selected("constructive",constructive),INTEGRATE_LEARNING:()=>selected("learning",constructive),ENABLE_INFLOW:()=>selected("constructive",constructive),BUILD_RESERVE:()=>selected("constructive",constructive),MOBILIZE_RESOURCES:()=>selected("actionable",actionable),ACTIONABLE_STRATEGY:()=>selected("actionable",actionable),ACTIONABLE_ADVICE:()=>selected("actionable",actionable),ACTIONABLE_RESPONSE:()=>selected("actionable",actionable),BEHAVIORAL_RESPONSE:()=>selected("actionable",actionable),CONDITIONAL_OUTCOME:()=>selected("outcome",outcome),CONDITIONAL_TREND:()=>selected("outcome",outcome),PAST_INFLUENCE:()=>selected("past",antecedent),ORIGIN_EXPLANATION:()=>selected("past",antecedent),EMOTIONAL_RESPONSE:()=>selected("emotional",emotional),MENTAL_RESPONSE:()=>selected("mental",mental),INTERNAL_RESPONSE:()=>oriented,EXTERNAL_RESPONSE:()=>selected("external",external),RELATIONAL_RESPONSE:()=>oriented,ADVANCE_CONDITION:()=>selected("constructive",constructive),WAIT_CONDITION:()=>oriented,STOP_CONDITION:()=>selected("challenging",challenging),DECISION_CONDITION:()=>oriented,DESIRE_OR_FEAR:()=>oriented,ASSESS_IDEA:()=>oriented,ASSESS_RESOURCES:()=>oriented,CURRENT_STATE_ANSWER:()=>oriented};
   const contentFn=contentMap[answerMode];
   if(contentFn)return trim(template[language](sentence(contentFn())));
  }
 }
 return trim((modes[answerMode]||modes.POSITION_SPECIFIC_ANSWER)());
}

export function buildPositionAnswer({card,position,positionSpec,baseInterpretation,semanticRange={},spread,domain,secondaryDomains=[],mode,purpose="",questionContext,category,neighboringCards=[],themes=[],confidence="medium",language="ES"}){
 const semanticFunction=positionSpec?.function||"CURRENT_STATE",effectiveDomain=resolveTarotDomain(domain,category,questionContext),core=trim(domainMeaning(card,effectiveDomain,category));
 const answerMode=positionSpec?.answerMode||"POSITION_SPECIFIC_ANSWER",positionQuestion=positionSpec?.question||"¿Cómo responde esta carta a la pregunta de esta posición?";
 const parts=[answerForMode(answerMode,{...semanticRange,isReversed:Boolean(card.isReversed)},baseInterpretation,language)];
 const prefix=domainPrefix(effectiveDomain,semanticFunction,language);
 if(prefix&&core&&hasDomainSpecificMeaning(card,effectiveDomain,category)&&!hasMeaningOverlap(parts[0],core))parts.push(`${prefix} ${lowerFirst(core)}`.trim());
 const lens=questionLens(questionContext);
 if(lens.clause&&appliesQuestionLens(lens.type,semanticFunction))parts.push(lens.clause);
 const reversedMode=card.isReversed?reversalMode(card,semanticFunction,effectiveDomain):null;
 if(reversedMode){const effect=reversalAnswerClause(reversedMode,language);if(effect&&!hasMeaningOverlap(parts.join(" "),effect))parts.push(effect);}
 const neighborThemes=new Set(neighboringCards.flatMap(item=>item.keys||[]).map(normalize));
 const supportingThemes=[...new Set(themes.filter(theme=>neighborThemes.has(normalize(theme))))];
 const joined=parts.map(trim).filter(Boolean).join(". ").replace(/\.\s*\./g,".").trim();
 const answer=joined&&/[.!?]$/.test(joined)?joined:`${joined}.`;
 return {
  id:positionSpec?.id||null,positionId:positionSpec?.id||null,positionLabel:positionSpec?.label||position,position,positionQuestion,question:positionQuestion,
  semanticRole:semanticFunction,positionFunction:semanticFunction,positionRole:positionSpec?.role||"general",answerMode,
  cardId:card.id,cardName:card.name,card:card.name,orientation:card.isReversed?"reversed":"upright",domain:effectiveDomain,secondaryDomains,mode,spread,purpose,
  answer,interpretation:answer,cardSemanticRange:semanticRange,supportingThemes,rejectedAlternatives:["significado general que no responde la posición","polaridad fija aplicada antes de la función"],
  questionContext:questionContext||"",questionLens:lens.type,coreMeaning:core,reversalMode:reversedMode,orientationEffect:reversedMode?reversalClause(reversedMode,language):({ES:"expresión directa",EN:"direct expression",FR:"expression directe",DE:"direkter Ausdruck",PT:"expressão direta"}[language]||"expresión directa"),
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

const RELATION_BRIDGES={
 ES:{reinforces:(f,s)=>`${f}. Esa respuesta refuerza que ${s}`,contradicts:(f,s)=>`${f}. Esta respuesta entra en tensión con el hecho de que ${s}`,causes:(f,s)=>`${f}. Ese antecedente ayuda a explicar que ${s}`,blocks:(f,s)=>`${f}. Esa dinámica limita que ${s}`,enables:(f,s)=>`${f}. Esto hace posible que ${s}`,transforms:(f,s)=>`${f}. Para continuar, esa respuesta necesita transformarse en que ${s}`,resolves:(f,s)=>`${f}. La respuesta concreta aparece cuando ${s}`,continues:(f,s)=>`${f}. A partir de ahí, la dinámica continúa hacia que ${s}`},
 EN:{reinforces:(f,s)=>`${f}. This response reinforces that ${s}`,contradicts:(f,s)=>`${f}. This response is in tension with the fact that ${s}`,causes:(f,s)=>`${f}. That antecedent helps explain that ${s}`,blocks:(f,s)=>`${f}. That dynamic limits ${s}`,enables:(f,s)=>`${f}. This makes it possible that ${s}`,transforms:(f,s)=>`${f}. To continue, that response needs to transform into ${s}`,resolves:(f,s)=>`${f}. The concrete response appears when ${s}`,continues:(f,s)=>`${f}. From there, the dynamic continues toward ${s}`},
 FR:{reinforces:(f,s)=>`${f}. Cette réponse renforce le fait que ${s}`,contradicts:(f,s)=>`${f}. Cette réponse entre en tension avec le fait que ${s}`,causes:(f,s)=>`${f}. Cet antécédent aide à expliquer que ${s}`,blocks:(f,s)=>`${f}. Cette dynamique limite le fait que ${s}`,enables:(f,s)=>`${f}. Cela rend possible que ${s}`,transforms:(f,s)=>`${f}. Pour continuer, cette réponse doit se transformer en ${s}`,resolves:(f,s)=>`${f}. La réponse concrète apparaît quand ${s}`,continues:(f,s)=>`${f}. À partir de là, la dynamique continue vers le fait que ${s}`},
 DE:{reinforces:(f,s)=>`${f}. Diese Antwort bestärkt, dass ${s}`,contradicts:(f,s)=>`${f}. Diese Antwort steht in Spannung zu der Tatsache, dass ${s}`,causes:(f,s)=>`${f}. Dieser Vorläufer hilft zu erklären, dass ${s}`,blocks:(f,s)=>`${f}. Diese Dynamik schränkt ein, dass ${s}`,enables:(f,s)=>`${f}. Das macht es möglich, dass ${s}`,transforms:(f,s)=>`${f}. Um fortzufahren, muss sich diese Antwort verwandeln in ${s}`,resolves:(f,s)=>`${f}. Die konkrete Antwort erscheint, wenn ${s}`,continues:(f,s)=>`${f}. Von dort aus setzt sich die Dynamik fort in Richtung ${s}`},
 PT:{reinforces:(f,s)=>`${f}. Essa resposta reforça que ${s}`,contradicts:(f,s)=>`${f}. Essa resposta entra em tensão com o fato de que ${s}`,causes:(f,s)=>`${f}. Esse antecedente ajuda a explicar que ${s}`,blocks:(f,s)=>`${f}. Essa dinâmica limita que ${s}`,enables:(f,s)=>`${f}. Isso torna possível que ${s}`,transforms:(f,s)=>`${f}. Para continuar, essa resposta precisa se transformar em ${s}`,resolves:(f,s)=>`${f}. A resposta concreta aparece quando ${s}`,continues:(f,s)=>`${f}. A partir daí, a dinâmica continua rumo a ${s}`},
};
function relationSentence(from,to,type,language="ES"){
 const first=sentence(trim(firstClause(from.answer||from.interpretation))),second=lowerFirst(trim(firstClause(to.answer||to.interpretation)));
 const bridges=RELATION_BRIDGES[language]||RELATION_BRIDGES.ES;
 return (bridges[type]||bridges.reinforces)(first,second);
}

export function buildPropositionRelations(grammar,propositions,language="ES"){
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
  const bridge=relationSentence(from,to,type,language);
  return {id:`relation_${index+1}`,from:from.positionId,to:to.positionId,type,relationType:type,sourceType:definition.type,
   sourcePositionIds:[from.positionId,to.positionId],sourceCardIds:[from.cardId,to.cardId],interpretation:bridge,effect:bridge,bridge,
   fromAnswer:from.answer,toAnswer:to.answer,sharedThemes:shared,confidence:shared.length||from.cardId===to.cardId?"high":"medium"};
 }).filter(Boolean);
}

const RELATION_MOVEMENT_FALLBACK={
 ES:(f,s)=>`${f}. A partir de esa respuesta, ${s}; el resultado sigue condicionado por las decisiones y los hechos.`,
 EN:(f,s)=>`${f}. From that response, ${s}; the outcome remains conditioned by decisions and facts.`,
 FR:(f,s)=>`${f}. À partir de cette réponse, ${s} ; le résultat reste conditionné par les décisions et les faits.`,
 DE:(f,s)=>`${f}. Ausgehend von dieser Antwort, ${s}; das Ergebnis bleibt von Entscheidungen und Fakten abhängig.`,
 PT:(f,s)=>`${f}. A partir dessa resposta, ${s}; o resultado segue condicionado pelas decisões e pelos fatos.`,
};
const firstClause=text=>(text||"").split(/(?<=[.!?])\s+/)[0]||"";
export function contextualRelationMovement(from,to,relations=[],language="ES"){
 if(!from||!to)return "";
 const relation=relations.find(item=>item.from===from.id&&item.to===to.id)||relations.find(item=>item.from===to.id&&item.to===from.id);
 if(!relation){const fallback=RELATION_MOVEMENT_FALLBACK[language]||RELATION_MOVEMENT_FALLBACK.ES;return fallback(sentence(firstClause(from.answer||from.interpretation)),lowerFirst(firstClause(to.answer||to.interpretation)));}
 if(relation.bridge)return relation.bridge;
 const endings={reinforces:"ambas posiciones se apoyan y hacen más consistente esa dirección",contradicts:"las dos posiciones no avanzan al mismo ritmo y exigen resolver la contradicción",causes:"el antecedente ayuda a explicar lo que aparece después",blocks:"el primer factor limita la expresión del segundo",enables:"el primer factor aporta una condición que permite desarrollar el segundo",transforms:"lo primero necesita cambiar para convertirse en lo segundo",resolves:"la segunda posición ofrece una respuesta concreta a la primera",continues:"lo primero prolonga sus efectos en lo que viene después"};
 return `${relation.effect}: ${trim(from.interpretation)}. Después, ${trim(to.interpretation)}; ${endings[relation.type]}.`;
}
