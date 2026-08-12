import {getSpreadGrammar,TAROT_OUTPUT_STRATEGIES} from "./tarot-spread-grammar.js";
import {getOracleSpreadOutputContract,ORACLE_VERDICTS,ORACLE_VERDICT_LABELS,validateOracleSpreadOutput} from "./oracle-output-contracts.js";

export const ORACLE_SYSTEMS=Object.freeze({ZEN:"zen",ANGELS:"angels",ANIMALS:"animals"});

const profiles={
 zen:{warningTitle:"Punto de atención",adviceTitle:"Práctica consciente"},
 angels:{warningTitle:"Lo que conviene proteger",adviceTitle:"Orientación práctica"},
 animals:{warningTitle:"Instinto que necesita medida",adviceTitle:"Movimiento recomendado"},
};

const normalize=value=>(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const clean=value=>(value||"").trim().replace(/\s+/g," ");
const trimEnd=value=>clean(value).replace(/[.!?]+$/g,"");
const lowerFirst=value=>{const text=trimEnd(value);return text?text.charAt(0).toLowerCase()+text.slice(1):""};
const sentence=value=>{const text=trimEnd(value);return text?text.charAt(0).toUpperCase()+text.slice(1)+".":""};
const unique=items=>[...new Set(items.filter(Boolean))];
const words=value=>clean(value).split(/\s+/).filter(Boolean);
const hash=value=>[...String(value)].reduce((sum,char)=>(sum*31+char.charCodeAt(0))>>>0,2166136261);

export function createOracleExpressionMemory(){return {usedExpressions:new Set(),usedOpenings:new Set(),usedClosings:new Set(),usedConceptPhrases:new Set()};}

function chooseVariant(memory,bucket,candidates,seed){
 const used=memory[bucket],start=hash(seed)%candidates.length;
 for(let offset=0;offset<candidates.length;offset++){const candidate=candidates[(start+offset)%candidates.length];if(!used.has(normalize(candidate))){used.add(normalize(candidate));return candidate;}}
 const fallback=candidates[start];used.add(normalize(fallback));return fallback;
}

function chooseOpeningVariant(memory,candidates,seed){
 const start=hash(seed)%candidates.length;
 for(let offset=0;offset<candidates.length;offset++){const candidate=candidates[(start+offset)%candidates.length],signature=normalize(candidate).split(/\s+/).slice(0,6).join(" ");if(!memory.usedOpenings.has(signature)){memory.usedOpenings.add(signature);return candidate;}}
 const fallback=candidates[start];memory.usedOpenings.add(normalize(fallback).split(/\s+/).slice(0,6).join(" "));return fallback;
}

function themeOf(card){
 const theme=clean((card.theme||"").split("·")[0])||"atención";
 return /^(conciencia|fuego|agua|nubes|arcoíris)$/i.test(theme)?card.name:theme;
}

function detailSentences(card){return clean(card.detail||"").split(/(?<=[.!?])\s+/).map(sentence).filter(Boolean);}

function expressedMessage(meaning,memory){
 const raw=meaning.message,normalized=normalize(raw),seed=`${meaning.system}:${meaning.cardId}:${meaning.positionId}`;
 if(meaning.system!==ORACLE_SYSTEMS.ZEN)return sentence(raw);
 let variants;
 if(/mira el patron|observar/.test(normalized))variants=[
  "Observa la forma que se repite antes de intervenir.","Tómate tiempo para distinguir el hecho de tu reacción.","Deja que aparezca más información antes de corregir lo que ves.","Haz una pausa suficiente para reconocer el patrón completo.","Mira lo que ocurre sin apresurarte a explicarlo."
 ];
 else if(/haz espacio|permit/.test(normalized))variants=[
  "Permite que la experiencia esté presente sin volverla una definición de ti.","Recibe lo que sientes sin aferrarte ni rechazarlo.","Deja de pelear por un momento con lo que ya está ocurriendo.","Da lugar a la experiencia sin convertirla en una identidad permanente.","Acepta este instante como información, no como una sentencia."
 ];
 else if(/convierte la comprension|accion pequena|integr/.test(normalized))variants=[
  "Lleva lo comprendido a una acción concreta que puedas revisar.","Expresa esta comprensión mediante un gesto visible y medible.","Pon a prueba lo aprendido con una decisión sencilla.","Integra lo visto en una conducta que puedas sostener hoy.","Haz que la comprensión se note en una respuesta concreta."
 ];
 else return sentence(raw);
 return chooseVariant(memory,"usedConceptPhrases",variants,seed);
}

function zenRisk(theme,card){
 const key=normalize(`${theme} ${card.name}`);
 if(/espera|pausa|quietud|soledad|observador|distancia|reserva/.test(key))return "la observación se convierta en demora, aislamiento o una excusa para no actuar";
 if(/impulso|fuego|movimiento|libertad|expansion|prosperidad/.test(key))return "el impulso se vuelva prisa y pase por alto consecuencias importantes";
 if(/mente|nube|estrategia|norma|dominio|medida/.test(key))return "el análisis o la necesidad de control sustituyan el contacto directo con la experiencia";
 if(/agua|emoc|afinidad|confianza|apertura|entrega/.test(key))return "la sensibilidad pierda límites y absorba problemas que no le corresponden";
 return `la búsqueda de ${theme.toLowerCase()} se vuelva automática y deje de responder a la realidad`;
}

function angelRisk(theme,card){
 const key=normalize(`${theme} ${card.name} ${card.message}`);
 if(/proteccion|coraje|firmeza|fuego|valor/.test(key))return "la protección termine convirtiéndose en rigidez, reacción o confrontación innecesaria";
 if(/mensaje|comunicacion|expresion|claridad/.test(key))return "supongas que el mensaje fue entendido sin comprobarlo o hables desde la urgencia";
 if(/perdon|misericordia|reconciliacion|confianza/.test(key))return "perdonar se confunda con tolerar lo que vulnera tus límites";
 if(/paciencia|tiempo|silencio|aceptacion/.test(key))return "la paciencia se convierta en inmovilidad frente a algo que ya exige respuesta";
 return `la búsqueda de ${theme.toLowerCase()} dependa de una señal externa en vez de una decisión responsable`;
}

function animalRisk(theme,card){
 const key=normalize(`${theme} ${card.name} ${card.message}`);
 if(/fuerza|liderazgo|proteccion|presencia|limites/.test(key))return "la firmeza se vuelva imposición, defensa permanente o desgaste";
 if(/vision|observacion|discernimiento|perspectiva|enfoque/.test(key))return "observar sustituya la decisión y termines esperando una certeza imposible";
 if(/adaptacion|flexibilidad|autonomia|libertad/.test(key))return "adaptarte implique ceder tu dirección o evitar un compromiso necesario";
 if(/paciencia|constancia|disciplina|perseverancia/.test(key))return "persistir te mantenga dentro de una estrategia que ya necesita corregirse";
 return `el impulso asociado con ${theme.toLowerCase()} se convierta en una reacción automática`;
}

function roleFamily(spec){
 const semantic=spec.semanticRole||spec.function||"CURRENT_STATE";
 if(["OBSTACLE","RISK","FEAR"].includes(semantic))return "risk";
 if(["ACTION","ADVICE","RELEASE","ENDING","BEGINNING"].includes(semantic))return "action";
 if(["TREND","OUTCOME","CONSEQUENCE","FUTURE"].includes(semantic))return "future";
 if(["PAST","ORIGIN"].includes(semantic))return "past";
 if(["RESOURCE","POTENTIAL"].includes(semantic))return "resource";
 if(["INTERNAL","DESIRE"].includes(semantic))return "internal";
 if(semantic==="EXTERNAL")return "external";
 if(semantic==="RELATIONSHIP")return "relationship";
 if(semantic==="DECISION")return "condition";
 return "present";
}

function signalFor(system,card){
 const key=normalize(`${card.name} ${themeOf(card)} ${card.message}`);
 const dictionaries={
  zen:{restrictive:/tension|contencion|division|distancia|peso|remordimiento|duelo|defensa|mascaras|dominio/,open:/espera|pausa|quietud|soledad|vacio|observador|huellas|velo|memoria/,supportive:/apertura|presencia|claridad|valor|encuentro|despertar|confianza|comprension|reparacion|expansion|prosperidad|creacion|integracion|juego|jubilo|cosecha/},
  angels:{restrictive:/purificacion|revision profunda|transicion y consuelo/,open:/tiempo y paciencia|silencio y aceptacion|noche y descanso|contemplacion|recogimiento|misterio/,supportive:/proteccion|valor|claridad|sanacion|sabiduria|justicia|armonia|esperanza|responsabilidad|gratitud|reconciliacion|coraje|construccion|direccion|creatividad/},
  animals:{restrictive:/atraccion|escorpion|cocodrilo/,open:/paciencia|atencion|observacion|transicion|profundidad|discernimiento|limpieza/,supportive:/vision|instinto|fortaleza|presencia|adaptacion|libertad|inteligencia|liderazgo|transformacion|renovacion|constancia|comunicacion|cooperacion|disciplina|construccion|equilibrio/},
 }[system];
 if(dictionaries.restrictive.test(key))return {kind:"restrictive",reason:"la carta contiene una señal de límite, tensión o cierre"};
 if(dictionaries.open.test(key))return {kind:"open",reason:"la carta pide tiempo, observación o una condición todavía abierta"};
 if(dictionaries.supportive.test(key))return {kind:"supportive",reason:"la carta ofrece una cualidad disponible para avanzar"};
 return {kind:"open",reason:"la carta mantiene la respuesta abierta y dependiente de la conducta"};
}

function buildPositionMeaning(system,card,position,spreadId){
 const theme=themeOf(card),family=roleFamily(position),risk=system===ORACLE_SYSTEMS.ZEN?zenRisk(theme,card):system===ORACLE_SYSTEMS.ANGELS?angelRisk(theme,card):animalRisk(theme,card);
 return {system,spreadId,cardId:card.id,cardName:card.name,card,theme,message:card.message,positionId:position.id,position:position.label,role:position.role,semanticRole:position.semanticRole,answerMode:position.answerMode,question:position.question,family,risk,signal:signalFor(system,card)};
}

function indicativeRisk(value){return value.replace(/\bse vuelva\b/g,"se vuelve").replace(/\btermine\b/g,"termina").replace(/\bsupongas\b/g,"supones").replace(/\bhables\b/g,"hablas").replace(/\bdependa\b/g,"depende").replace(/\bimplique\b/g,"implica").replace(/\bmantenga\b/g,"mantiene").replace(/\bsustituyan\b/g,"sustituyen").replace(/\bpierda\b/g,"pierde").replace(/\babsorba\b/g,"absorbe").replace(/\bpase\b/g,"pasa").replace(/\bdeje\b/g,"deja");}

function specialPlane(meaning,message){
 const {system,spreadId,positionId,theme}=meaning;if(spreadId!=="feeling_thought_action")return "";
 if(positionId==="feeling")return system===ORACLE_SYSTEMS.ZEN?`En lo afectivo aparece ${theme.toLowerCase()}. ${message}`:system===ORACLE_SYSTEMS.ANGELS?`La orientación de esta figura representa un estado afectivo que necesita ${theme.toLowerCase()}. ${message}`:`La respuesta emocional se organiza desde ${theme.toLowerCase()}. ${message}`;
 if(positionId==="thought")return system===ORACLE_SYSTEMS.ZEN?`Mentalmente se está interpretando la situación desde ${theme.toLowerCase()}. ${message}`:system===ORACLE_SYSTEMS.ANGELS?`La evaluación mental busca ${theme.toLowerCase()}; no describe emoción sino criterio e intención. ${message}`:`El pensamiento evalúa lo que ocurre mediante ${theme.toLowerCase()}. ${message}`;
 if(positionId==="action")return system===ORACLE_SYSTEMS.ZEN?`Si la dinámica continúa, probablemente responderá desde ${theme.toLowerCase()}: ${lowerFirst(message)}`:system===ORACLE_SYSTEMS.ANGELS?`La conducta más probable se orienta hacia ${theme.toLowerCase()}: ${lowerFirst(message)}`:`Probablemente actuará desde ${theme.toLowerCase()}: ${lowerFirst(message)}`;
 return "";
}

function openingFor(meaning,memory){
 const {system,family,theme,cardId,positionId}=meaning,seed=`${system}:${cardId}:${positionId}:${family}`;
 const variants={
  zen:{
   present:[`La experiencia pone en primer plano ${theme.toLowerCase()}.`,`Este punto ilumina ${theme.toLowerCase()}.`,`Aquí se reconoce un movimiento de ${theme.toLowerCase()}.`],
   past:[`Vienes de una etapa marcada por ${theme.toLowerCase()}.`,`El antecedente dejó una huella de ${theme.toLowerCase()}.`,`Lo vivido todavía activa ${theme.toLowerCase()}.`],
   risk:[`El punto ciego aparece cuando ${indicativeRisk(meaning.risk)}.`,`La dificultad aumenta cuando ${indicativeRisk(meaning.risk)}.`,`Conviene vigilar que ${meaning.risk}.`],
   action:[`La respuesta consciente necesita ${theme.toLowerCase()}.`,`Esta posición pide expresar ${theme.toLowerCase()} mediante hechos.`,`El movimiento útil consiste en encarnar ${theme.toLowerCase()}.`],
   future:[`Si la dinámica se mantiene, la tendencia apunta hacia ${theme.toLowerCase()}.`,`La dirección posible se organiza alrededor de ${theme.toLowerCase()}.`,`El proceso puede avanzar hacia una expresión más clara de ${theme.toLowerCase()}.`],
   resource:[`${theme} es la capacidad disponible.`,`Puedes apoyarte en ${theme.toLowerCase()}.`,`La lectura reconoce ${theme.toLowerCase()} como recurso.`],
   internal:[`Por dentro se mueve ${theme.toLowerCase()}.`,`La vivencia interna está atravesada por ${theme.toLowerCase()}.`,`En el plano íntimo aparece ${theme.toLowerCase()}.`],
   external:[`Las circunstancias reflejan una lección de ${theme.toLowerCase()}.`,`El entorno confronta la experiencia con ${theme.toLowerCase()}.`,`Fuera de ti aparece una condición de ${theme.toLowerCase()}.`],
   relationship:[`El vínculo se organiza alrededor de ${theme.toLowerCase()}.`,`La relación pone a prueba ${theme.toLowerCase()}.`,`Entre las partes aparece una dinámica de ${theme.toLowerCase()}.`],
   condition:[`La decisión necesita ${theme.toLowerCase()}.`,`La condición central se relaciona con ${theme.toLowerCase()}.`,`Antes de definir una respuesta hace falta ${theme.toLowerCase()}.`],
  },
  angels:{
   present:[`El mensaje simbólico centra la atención en ${theme.toLowerCase()}.`,`Esta figura representa ${theme.toLowerCase()} dentro de la situación.`,`La lectura propone mirar el asunto desde ${theme.toLowerCase()}.`],
   past:[`El antecedente deja una lección de ${theme.toLowerCase()}.`,`Lo vivido conserva una enseñanza ligada a ${theme.toLowerCase()}.`,`La historia previa pide revisar ${theme.toLowerCase()}.`],
   risk:[`La orientación pide evitar que ${meaning.risk}.`,`Conviene evitar que ${meaning.risk}.`,`El límite aparece cuando ${indicativeRisk(meaning.risk)}.`],
   action:[`La orientación pide una respuesta visible basada en ${theme.toLowerCase()}.`,`Esta carta propone ejercer ${theme.toLowerCase()} con hechos.`,`La conducta más coherente necesita ${theme.toLowerCase()}.`],
   future:[`Si la dinámica se mantiene, la lectura favorece ${theme.toLowerCase()}.`,`La tendencia abre una posibilidad de ${theme.toLowerCase()}, condicionada por tus actos.`,`La señal apunta hacia ${theme.toLowerCase()} sin convertirlo en promesa.`],
   resource:[`Cuentas con una cualidad de ${theme.toLowerCase()}.`,`La figura representa ${theme.toLowerCase()} como apoyo disponible.`,`La orientación permite apoyarte en ${theme.toLowerCase()}.`],
   internal:[`En el plano interior hace falta ${theme.toLowerCase()}.`,`La experiencia íntima necesita ${theme.toLowerCase()}.`,`Dentro de ti se busca una forma de ${theme.toLowerCase()}.`],
   external:[`El entorno pone a prueba ${theme.toLowerCase()}.`,`Las circunstancias exigen una aplicación realista de ${theme.toLowerCase()}.`,`La respuesta externa se relaciona con ${theme.toLowerCase()}.`],
   relationship:[`El vínculo necesita ${theme.toLowerCase()} para sostenerse.`,`Entre las partes se vuelve esencial ${theme.toLowerCase()}.`,`La relación pide una expresión madura de ${theme.toLowerCase()}.`],
   condition:[`La respuesta depende de una condición de ${theme.toLowerCase()}.`,`Antes de decidir debe existir ${theme.toLowerCase()}.`,`La posibilidad queda sujeta a ${theme.toLowerCase()}.`],
  },
  animals:{
   present:[`La situación pide la cualidad de ${theme.toLowerCase()}.`,`El recurso central es ${theme.toLowerCase()}.`,`Esta posición activa ${theme.toLowerCase()}.`],
   past:[`La experiencia previa desarrolló ${theme.toLowerCase()}.`,`El antecedente dejó como aprendizaje ${theme.toLowerCase()}.`,`Lo vivido todavía influye mediante ${theme.toLowerCase()}.`],
   risk:[`La precaución consiste en evitar que ${meaning.risk}.`,`El exceso aparece cuando ${indicativeRisk(meaning.risk)}.`,`Conviene vigilar que ${meaning.risk}.`],
   action:[`El movimiento útil aplica ${theme.toLowerCase()} de forma concreta.`,`La estrategia necesita ${theme.toLowerCase()} en la conducta.`,`La respuesta más funcional se apoya en ${theme.toLowerCase()}.`],
   future:[`Si la dinámica se mantiene, ${theme.toLowerCase()} orienta la tendencia.`,`La dirección probable requiere utilizar ${theme.toLowerCase()} con medida.`,`El resultado puede ganar solidez mediante ${theme.toLowerCase()}.`],
   resource:[`${theme} es el recurso disponible.`,`Puedes activar ${theme.toLowerCase()} a tu favor.`,`La cualidad que sostiene esta posición es ${theme.toLowerCase()}.`],
   internal:[`El instinto está pidiendo ${theme.toLowerCase()}.`,`La respuesta interna se organiza desde ${theme.toLowerCase()}.`,`Por dentro aparece una necesidad de ${theme.toLowerCase()}.`],
   external:[`El entorno exige ${theme.toLowerCase()}.`,`Las señales externas requieren ${theme.toLowerCase()}.`,`Las circunstancias ponen a prueba ${theme.toLowerCase()}.`],
   relationship:[`La dinámica entre las personas necesita ${theme.toLowerCase()}.`,`El vínculo se fortalece o debilita según ${theme.toLowerCase()}.`,`Entre las partes actúa una cualidad de ${theme.toLowerCase()}.`],
   condition:[`La elección funciona sólo si aplicas ${theme.toLowerCase()} con medida.`,`La condición práctica es ${theme.toLowerCase()}.`,`Antes de decidir necesitas comprobar ${theme.toLowerCase()}.`],
  },
 }[system][family]||[];
 return chooseOpeningVariant(memory,variants,seed);
}

function renderMeaning(meaning,memory){
 const message=expressedMessage(meaning,memory),special=specialPlane(meaning,message);
 const mainAnswer=sentence(special||`${openingFor(meaning,memory)} ${message}`);
 const detail=detailSentences(meaning.card)[0]||"";
 const warningText=meaning.family==="risk"?sentence(`Evita que ${meaning.risk}`):"";
 const orientationText=meaning.family==="action"?sentence(`${meaning.theme}: ${meaning.message}`):detail;
 return {mainAnswer,answer:mainAnswer,detail,warningText,orientationText};
}

export function interpretOracleCardInPosition({system,card,position,spreadId="unknown_spread",expressionMemory=createOracleExpressionMemory()}){
 const meaning=buildPositionMeaning(system,card,position,spreadId),rendered=renderMeaning(meaning,expressionMemory);
 return {...meaning,...rendered,sourceCardIds:[card.id],sourceMessageIds:[`message:${card.id}`],sourcePositionIds:[position.id],sourceRelationIds:[]};
}

const byId=(answers,...ids)=>answers.filter(answer=>ids.includes(answer.positionId));
const byFamily=(answers,...families)=>answers.filter(answer=>families.includes(answer.family));
const combine=answers=>answers.map(answer=>answer.mainAnswer).join(" ");
const relationId=relation=>`${relation.from}__${relation.type}__${relation.to}`;

function section(id,title,answers,answerKeys=answers.map(answer=>answer.positionId),body=combine(answers)){
 return {id,title,body,answerKeys:unique(answerKeys),sourceCardIds:unique(answers.flatMap(item=>item.sourceCardIds)),sourceMessageIds:unique(answers.flatMap(item=>item.sourceMessageIds)),sourcePositionIds:unique(answers.flatMap(item=>item.sourcePositionIds)),sourceRelationIds:unique(answers.flatMap(item=>item.sourceRelationIds))};
}

function syntheticSection(id,title,body,answers,answerKeys){return section(id,title,answers,answerKeys,body);}
const chunk=(answers,size)=>Array.from({length:Math.ceil(answers.length/size)},(_,index)=>answers.slice(index*size,index*size+size));

function verdictFor(answers){
 const response=answers.find(item=>item.positionId==="answer"),condition=answers.find(item=>item.positionId==="condition"),warning=answers.find(item=>item.positionId==="warning");
 const responseSignal=response.signal.kind,conditionState=condition.signal.kind==="supportive"?"viable":condition.signal.kind==="restrictive"?"blocking":"pending",warningState=warning.signal.kind==="restrictive"?"dominant":warning.signal.kind==="supportive"?"manageable":"notable";
 let code;
 if(responseSignal==="supportive"&&conditionState==="viable"&&warningState==="manageable")code=ORACLE_VERDICTS.YES;
 else if(responseSignal==="supportive"&&conditionState!=="blocking"&&warningState!=="dominant")code=ORACLE_VERDICTS.YES_CONDITIONAL;
 else if(responseSignal==="supportive")code=ORACLE_VERDICTS.NO_FOR_NOW;
 else if(responseSignal==="restrictive"&&conditionState==="blocking"&&warningState==="dominant")code=ORACLE_VERDICTS.NO;
 else if(responseSignal==="restrictive"||conditionState==="blocking"||warningState==="dominant")code=ORACLE_VERDICTS.NO_FOR_NOW;
 else code=ORACLE_VERDICTS.INDETERMINATE;
 return {code,label:ORACLE_VERDICT_LABELS[code],responseSignal,conditionState,warningState,sourceCardIds:unique(answers.flatMap(item=>item.sourceCardIds)),sourceMessageIds:unique(answers.flatMap(item=>item.sourceMessageIds)),sourcePositionIds:unique(answers.flatMap(item=>item.sourcePositionIds)),sourceRelationIds:unique(answers.flatMap(item=>item.sourceRelationIds))};
}

function verdictExplanation(system,verdict,answers){
 const response=answers.find(item=>item.positionId==="answer"),condition=answers.find(item=>item.positionId==="condition"),warning=answers.find(item=>item.positionId==="warning"),signal=verdict.responseSignal==="supportive"?"abre una posibilidad real":verdict.responseSignal==="restrictive"?"marca un límite claro":"mantiene la respuesta abierta";
 const state=verdict.conditionState==="viable"?"la condición puede cumplirse con los recursos mostrados":verdict.conditionState==="blocking"?"la condición todavía bloquea el avance":"la condición sigue pendiente de una confirmación concreta",risk=verdict.warningState==="manageable"?"la advertencia parece manejable":verdict.warningState==="dominant"?"la advertencia domina la respuesta":"la advertencia exige cautela";
 if(system===ORACLE_SYSTEMS.ZEN)return `La señal de ${response.theme.toLowerCase()} ${signal}. ${condition.theme} muestra si la respuesta puede integrarse ahora, mientras ${warning.theme.toLowerCase()} revela el patrón que podría desviarla. En conjunto, ${state} y ${risk}.`;
 if(system===ORACLE_SYSTEMS.ANGELS)return `La orientación simbólica de ${response.cardName} ${signal}. Su viabilidad depende de ${condition.theme.toLowerCase()}, y ${warning.cardName} señala aquello que conviene proteger. En conjunto, ${state} y ${risk}.`;
 return `${response.cardName} aporta ${response.theme.toLowerCase()} y ${signal}. ${condition.cardName} establece la condición práctica, mientras ${warning.cardName} muestra el exceso que puede cambiar el resultado. En conjunto, ${state} y ${risk}.`;
}

function triadSynthesis(system,kind,answers){
 const [first,second,third]=answers;
 if(kind==="temporal")return system===ORACLE_SYSTEMS.ZEN?`El paso de ${first.theme.toLowerCase()} hacia ${third.theme.toLowerCase()} atraviesa ahora ${second.theme.toLowerCase()}; la tendencia cambia en la medida en que esa experiencia se vuelve consciente.`:system===ORACLE_SYSTEMS.ANGELS?`${first.cardName} explica el antecedente, ${second.cardName} define la orientación actual y ${third.cardName} muestra una tendencia condicionada por la forma de responder hoy.`:`La cualidad de ${first.cardName} desemboca en ${second.theme.toLowerCase()}; si esa respuesta se sostiene con medida, ${third.cardName} indica la dirección probable.`;
 if(kind==="relational")return system===ORACLE_SYSTEMS.ZEN?`Lo que se siente desde ${first.theme.toLowerCase()} pasa por una interpretación de ${second.theme.toLowerCase()} y probablemente se vuelve una conducta de ${third.theme.toLowerCase()}. Emoción, pensamiento y acción no son equivalentes.`:system===ORACLE_SYSTEMS.ANGELS?`La emoción representada por ${first.cardName} se evalúa mentalmente desde ${second.theme.toLowerCase()}; la conducta probable toma la forma práctica de ${third.theme.toLowerCase()}.`:`${first.cardName} describe la respuesta emocional, ${second.cardName} el criterio mental y ${third.cardName} la conducta observable. La diferencia entre los tres planos evita confundir deseo con acción.`;
 return system===ORACLE_SYSTEMS.ZEN?`${first.theme} puede aprovecharse si ${third.theme.toLowerCase()} responde conscientemente al riesgo de ${second.theme.toLowerCase()}. La oportunidad pierde fuerza cuando se evita mirar esa tensión.`:system===ORACLE_SYSTEMS.ANGELS?`La posibilidad representada por ${first.cardName} se vuelve más viable cuando la orientación de ${third.cardName} protege el punto vulnerable señalado por ${second.cardName}.`:`${first.cardName} aporta la oportunidad, ${second.cardName} identifica el exceso y ${third.cardName} ofrece la cualidad que permite equilibrar ambos. Las tres funciones son necesarias para decidir.`;
}

function comparisonText(system,grammarId,answers){
 const isAct=grammarId==="act_or_not",a=byId(answers,isAct?"act":"path_a",isAct?"act_result":"result_a"),b=byId(answers,isAct?"not_act":"path_b",isAct?"not_act_result":"result_b"),endA=a.at(-1)||a[0],endB=b.at(-1)||b[0];
 const preference=endA.signal.kind===endB.signal.kind?"balanced":endA.signal.kind==="supportive"?"a":endB.signal.kind==="supportive"?"b":endA.signal.kind==="restrictive"?"b":"a";
 const names=isAct?["actuar","no actuar"]:["el camino A","el camino B"];
 let text;
 if(preference==="a")text=`La lectura favorece ${names[0]} porque desarrolla ${endA.theme.toLowerCase()}, mientras ${names[1]} deja mayor peso en ${endB.theme.toLowerCase()}.`;
 else if(preference==="b")text=`La lectura favorece ${names[1]} porque conserva ${endB.theme.toLowerCase()}, mientras ${names[0]} aumenta la exigencia asociada con ${endA.theme.toLowerCase()}.`;
 else text=`Ambas opciones permanecen abiertas, pero no ofrecen lo mismo: ${names[0]} pone el acento en ${endA.theme.toLowerCase()} y ${names[1]} en ${endB.theme.toLowerCase()}.`;
 const ending=system===ORACLE_SYSTEMS.ZEN?"La diferencia útil está en cuál respuesta puedes sostener con mayor conciencia.":system===ORACLE_SYSTEMS.ANGELS?"El criterio es elegir la opción que proteja mejor tus límites y responsabilidades.":"Compara cuál cualidad responde mejor a las condiciones reales, no sólo a la preferencia inmediata.";
 return `${text} ${ending}`;
}

function dynamicTitle(grammar,system){
 const byId={reasoned_answer:"Respuesta razonada",feeling_thought_action:"Lo que muestra el vínculo",opportunity_risk_strategy:"Oportunidad, riesgo y estrategia",two_paths:"Comparación entre dos caminos",act_or_not:"Consecuencias de actuar o no actuar",past_present_trend:"Del antecedente a la tendencia",seven_chakras:"Lectura de los siete centros",tree_of_life:"Recorrido del Árbol de la Vida",celtic_cross:system===ORACLE_SYSTEMS.ZEN?"Proceso completo de la experiencia":system===ORACLE_SYSTEMS.ANGELS?"Orientación para el conjunto de la situación":"Mapa de recursos, riesgos y movimiento",horseshoe:"De los antecedentes al resultado probable",seven_card_star:"Centro, desafío y dirección",nine_card_mandala:"Fuerzas alrededor del centro",twelve_houses:"Mapa de las doce áreas",spiritual_path:"Etapas del camino interior"};
 if(byId[grammar.id])return byId[grammar.id];
 const byStrategy={[TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW]:"Dinámica y evolución del vínculo",[TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON]:"Comparación de alternativas",[TAROT_OUTPUT_STRATEGIES.INNER_PROCESS]:"Comprensión e integración",[TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE]:"Movimiento del ciclo",[TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY]:"Del cierre al nuevo comienzo",[TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS]:"Diagnóstico y respuesta"};
 return byStrategy[grammar.outputStrategy]||grammar.purpose;
}

function singleMessageBody(system,answer){
 const details=detailSentences(answer.card).join(" "),base=answer.mainAnswer;
 if(system===ORACLE_SYSTEMS.ZEN)return `${base} ${details} ${answer.cardName} concentra la lectura en ${answer.theme.toLowerCase()}: reconoce cómo aparece en tu cuerpo, tus pensamientos y tu conducta. No describe un destino; muestra el movimiento interior que necesita conciencia para no repetirse de manera automática.`;
 if(system===ORACLE_SYSTEMS.ANGELS)return `${base} ${details} La figura de ${answer.cardName} se utiliza aquí como referencia simbólica de ${answer.theme.toLowerCase()}, no como una comunicación divina comprobada. Contrasta la orientación con los hechos y distingue qué responsabilidad, límite o reparación depende realmente de ti.`;
 return `${base} ${details} ${answer.cardName} representa la cualidad de ${answer.theme.toLowerCase()}. La lectura no atribuye conductas nuevas al animal: utiliza únicamente esa cualidad para señalar cómo responder a la situación, qué exceso evitar y qué resultado concreto observar después.`;
}

function sectionPlan(system,grammar,answers,verdict){
 const strategy=grammar.outputStrategy;
 if(grammar.id==="reasoned_answer"){
  const response=byId(answers,"answer"),condition=byId(answers,"condition"),warning=byId(answers,"warning"),all=[...response,...condition,...warning];
  return [syntheticSection("verdict","Respuesta",sentence(verdict.label),all,["verdict"]),syntheticSection("explanation","Por qué",verdictExplanation(system,verdict,answers),all,["explanation"]),section("condition","Condición",condition,["condition"]),section("warning","Advertencia",warning,["warning"])];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE)return [syntheticSection("message","Mensaje",singleMessageBody(system,answers[0]),answers,[answers[0].positionId])];
 if(grammar.id==="past_present_trend")return [section("past","Antecedente",byId(answers,"past"),["past"]),section("present","Presente",byId(answers,"present"),["present"]),section("trend","Tendencia",byId(answers,"trend"),["trend"]),syntheticSection("synthesis","Secuencia",triadSynthesis(system,"temporal",answers),answers,["synthesis"])];
 if(grammar.id==="feeling_thought_action")return [section("feeling","Qué siente",byId(answers,"feeling"),["feeling"]),section("thought","Qué piensa",byId(answers,"thought"),["thought"]),section("action","Qué probablemente hará",byId(answers,"action"),["probableAction"]),syntheticSection("synthesis","Cómo se relacionan",triadSynthesis(system,"relational",answers),answers,["synthesis"])];
 if(grammar.id==="opportunity_risk_strategy")return [section("opportunity","Oportunidad",byId(answers,"opportunity"),["opportunity"]),section("risk","Riesgo",byId(answers,"risk"),["risk"]),section("strategy","Estrategia",byId(answers,"strategy"),["strategy"]),syntheticSection("synthesis","Síntesis",triadSynthesis(system,"opportunity",answers),answers,["synthesis"])];
 if(grammar.id==="two_paths"||grammar.id==="act_or_not"){
  const isAct=grammar.id==="act_or_not",start=byId(answers,isAct?"decision":"situation"),a=byId(answers,isAct?"act":"path_a",isAct?"act_result":"result_a"),b=byId(answers,isAct?"not_act":"path_b",isAct?"not_act_result":"result_b"),all=[...a,...b];
  return [section("start",isAct?"Punto de decisión":"Situación",start,[isAct?"decision":"situation"]),section("path-a",isAct?"Si actúas":"Camino A",a,[isAct?"act":"pathA"]),section("path-b",isAct?"Si no actúas":"Camino B",b,[isAct?"notAct":"pathB"]),syntheticSection("comparison","Comparación",comparisonText(system,grammar.id,answers),all,["comparison"])];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL)return [section("advance","Cuándo avanzar",byId(answers,"advance")),section("wait","Cuándo esperar",byId(answers,"wait")),section("stop","Cuándo detenerse",byId(answers,"stop"))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM){
  const root=byId(answers,"root","sacral"),will=byId(answers,"solar"),bond=byId(answers,"heart"),expression=byId(answers,"throat","third_eye"),meaning=byId(answers,"crown"),flow=`El recorrido parte de ${answers[0].theme.toLowerCase()} y culmina en ${answers.at(-1).theme.toLowerCase()}. La articulación depende de cómo ${answers[2].theme.toLowerCase()} se expresa en la voluntad y ${answers[4].theme.toLowerCase()} encuentra una voz clara.`;
  return [section("foundation","Arraigo y deseo",root,["groundingDesire"]),section("will","Voluntad",will,["will"]),section("heart","Vínculo",bond,["bond"]),section("expression","Expresión y visión",expression,["expressionVision"]),section("meaning","Sentido",meaning,["meaning"]),syntheticSection("flow","Flujo general",flow,answers,["flow"])];
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE)return [section("principle","Principio, impulso y forma",byId(answers,"keter","chokmah","binah"),["principleForm"]),section("polarity","Expansión y límite",byId(answers,"chesed","gevurah"),["expansionLimit"]),section("center","Integración",byId(answers,"tiferet"),["integration"]),section("foundation","Deseo, pensamiento y fundamento",byId(answers,"netzach","hod","yesod"),["desireThoughtFoundation"]),section("manifestation","Manifestación",byId(answers,"malkuth"),["manifestation"])];
 if(strategy===TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE)return [section("preparation","Preparación",answers.slice(0,2)),section("growth","Desarrollo",answers.slice(2,5)),section("harvest","Cosecha y depuración",answers.slice(5,8)),section("center","Tema central",answers.slice(8))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.JOURNEY_STAGES)return [section("call","El llamado",answers.slice(0,3)),section("crossing","Guía y umbral",answers.slice(3,6)),section("trial","Prueba y elección",answers.slice(6,9)),section("integration","Entrega e integración",answers.slice(9))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE){
  if(grammar.id==="celtic_cross")return [section("current","El asunto y su tensión",byId(answers,"situation","cross","base")),section("development","De dónde viene y qué se abre",byId(answers,"past","possibility","near_future")),section("dynamics","Tu respuesta y el entorno",byId(answers,"attitude","environment","hopes_fears")),section("direction","Dirección probable",byId(answers,"trend"))];
  return chunk(answers,2).map((group,index)=>section(`stage-${index+1}`,["Antecedentes","Lo que actúa ahora","Respuesta posible","Dirección"][index]||`Etapa ${index+1}`,group));
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW){
  if(grammar.id==="twelve_houses")return [section("self-base","Identidad y base",answers.slice(0,4)),section("expression","Expresión y hábitos",answers.slice(4,7)),section("change","Cambio y dirección",answers.slice(7,10)),section("collective","Comunidad y mundo interior",answers.slice(10))];
  return chunk(answers,Math.ceil(answers.length/3)).map((group,index)=>section(`field-${index+1}`,["Núcleo","Fuerzas en movimiento","Integración"][index]||`Campo ${index+1}`,group));
 }
 if(strategy===TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW)return [section("participants","Lo que aporta cada parte",byFamily(answers,"internal","external")),section("bond","La dinámica",byFamily(answers,"relationship","present","resource")),section("challenge","Lo que necesita atención",byFamily(answers,"risk","condition")),section("direction","Posible evolución",byFamily(answers,"action","future"))].filter(item=>item.body);
 if(strategy===TAROT_OUTPUT_STRATEGIES.INNER_PROCESS)return [section("inside","Lo que ocurre por dentro",byFamily(answers,"internal","past","present")),section("understanding","Lo que necesita comprenderse",byFamily(answers,"risk","resource","condition")),section("integration","Cómo integrarlo",byFamily(answers,"action","future","relationship"))].filter(item=>item.body);
 if(strategy===TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY)return [section("ending","Lo que concluye",byId(answers,"ending")),section("lesson","Lo que deja",byId(answers,"lesson")),section("threshold","El cruce",byId(answers,"threshold")),section("beginning","Lo que comienza",byId(answers,"beginning","first_step"))];
 if(strategy===TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS||strategy===TAROT_OUTPUT_STRATEGIES.DECISION_ANALYSIS)return [section("diagnosis","Lo que ocurre",byFamily(answers,"past","present","internal","external","relationship")),section("factors","Recursos y dificultades",byFamily(answers,"resource","risk","condition")),section("response","Respuesta y dirección",byFamily(answers,"action","future"))].filter(item=>item.body);
 const groups=answers.length<=3?answers.map(answer=>[answer]):chunk(answers,Math.ceil(answers.length/3));
 return groups.map((group,index)=>section(`sequence-${index+1}`,group.length===1?group[0].position:["Lo que ocurre","Lo que modifica la situación","Cómo responder"][index]||`Etapa ${index+1}`,group));
}

export function oracleSemanticOverlap(a,b){
 const stop=new Set(["para","como","esta","este","esto","desde","hacia","entre","porque","puede","debe","tiene","sobre","segun","carta","lectura","situacion","respuesta"]),left=new Set(words(normalize(a)).filter(word=>word.length>3&&!stop.has(word))),right=new Set(words(normalize(b)).filter(word=>word.length>3&&!stop.has(word)));
 if(!left.size||!right.size)return 0;const shared=[...left].filter(word=>right.has(word)).length;return shared/Math.min(left.size,right.size);
}

function guidance(system,answers,sections,contractDefinition){
 const main=sections.map(item=>item.body).join(" "),risk=answers.find(item=>item.family==="risk"),action=answers.find(item=>item.family==="action"),riskAlreadyVisible=risk&&sections.some(item=>item.sourcePositionIds.includes(risk.positionId)),actionAlreadyVisible=action&&sections.some(item=>item.sourcePositionIds.includes(action.positionId));
 const zenPractice=!actionAlreadyVisible&&system===ORACLE_SYSTEMS.ZEN?detailSentences(answers[0]?.card||{}).at(-1)||"":"";
 let caution=risk&&!riskAlreadyVisible?risk.warningText:"",advice=action&&!actionAlreadyVisible?action.orientationText:zenPractice;
 if(oracleSemanticOverlap(caution,main)>.42)caution="";
 if(oracleSemanticOverlap(advice,main)>.42||oracleSemanticOverlap(advice,caution)>.34)advice="";
 return {showWarning:Boolean(caution),warningTitle:profiles[system].warningTitle,caution,showAdvice:Boolean(advice),adviceTitle:profiles[system].adviceTitle,advice,warningProvenance:risk?{sourceCardIds:risk.sourceCardIds,sourceMessageIds:risk.sourceMessageIds,sourcePositionIds:risk.sourcePositionIds,sourceRelationIds:risk.sourceRelationIds}:null,adviceProvenance:action?{sourceCardIds:action.sourceCardIds,sourceMessageIds:action.sourceMessageIds,sourcePositionIds:action.sourcePositionIds,sourceRelationIds:action.sourceRelationIds}:null};
}

export function buildOracleEditorialOutput({system,spread,cards,drawId=""}){
 if(!profiles[system])throw new Error(`Sistema de oráculo desconocido: ${system}`);
 const grammar=getSpreadGrammar(spread.name,spread.positions),contractDefinition=getOracleSpreadOutputContract(spread.name,spread.positions);
 if(cards.length<grammar.positions.length)throw new Error(`La lectura ${spread.name} requiere ${grammar.positions.length} cartas y recibió ${cards.length}.`);
 const expressionMemory=createOracleExpressionMemory(),relations=grammar.relationships.map(relation=>({...relation,id:relationId(relation)}));
 const answers=grammar.positions.map((position,index)=>interpretOracleCardInPosition({system,card:cards[index],position,spreadId:grammar.id,expressionMemory})).map(answer=>({...answer,sourceRelationIds:relations.filter(relation=>relation.from===answer.positionId||relation.to===answer.positionId).map(relation=>relation.id)}));
 const verdict=grammar.id==="reasoned_answer"?verdictFor(answers):null,sections=sectionPlan(system,grammar,answers,verdict).filter(item=>item.body);
 for(const item of sections)item.sourceRelationIds=unique(relations.filter(relation=>item.sourcePositionIds.includes(relation.from)&&item.sourcePositionIds.includes(relation.to)).map(relation=>relation.id).concat(item.sourceRelationIds));
 const covered=new Set(sections.flatMap(item=>item.sourcePositionIds)),uncovered=answers.filter(item=>!covered.has(item.positionId));if(uncovered.length)sections.push(section("other-factors","Otros factores",uncovered));
 const preliminary={sections,verdict},contractValidation=validateOracleSpreadOutput(contractDefinition,preliminary);if(!contractValidation.valid)throw new Error(`La salida de ${spread.name} no cumple su contrato: ${contractValidation.missing.join(", ")}`);
 const help=guidance(system,answers,sections,contractDefinition),story=sections.map(item=>item.body),sourceCardIds=unique(sections.flatMap(item=>item.sourceCardIds)),sourceMessageIds=unique(sections.flatMap(item=>item.sourceMessageIds)),sourcePositionIds=unique(sections.flatMap(item=>item.sourcePositionIds)),sourceRelationIds=unique(sections.flatMap(item=>item.sourceRelationIds));
 return {system,drawId:drawId||`${system}:${spread.name}:${cards.map(card=>card.id).join("|")}`,title:dynamicTitle(grammar,system),outputStrategy:grammar.outputStrategy,contract:contractDefinition,contractValidation,verdict,sections,story,wordCount:words(story.join(" ")).length,positionAnswers:answers,positionAnswersById:Object.fromEntries(answers.map(item=>[item.positionId,item])),...help,narrativeSynthesis:{reading_thesis:story[0]||"",main_movement:story.at(-1)||"",sourceCardIds,sourceMessageIds,sourcePositionIds,sourceRelationIds},debug:{grammarId:grammar.id,narrativeStrategy:grammar.narrativeStrategy,outputStrategy:grammar.outputStrategy,fallbackUsed:grammar.fallbackUsed,positionAnswers:answers,relationships:relations,expressionMemory:{usedExpressions:[...expressionMemory.usedExpressions],usedOpenings:[...expressionMemory.usedOpenings],usedClosings:[...expressionMemory.usedClosings],usedConceptPhrases:[...expressionMemory.usedConceptPhrases]}}};
}
