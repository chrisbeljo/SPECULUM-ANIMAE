const p=(id,label,question,role)=>({id,label,question,role});
const link=(from,to,type)=>({from,to,type});
const chain=(ids,type="leads_to")=>ids.slice(0,-1).map((id,index)=>link(id,ids[index+1],type));
const g=({id,purpose,narrativeStrategy,positions,narrativeOrder=positions.map(position=>position.id),relationships=chain(narrativeOrder),synthesisStrategy=narrativeStrategy})=>({id,purpose,positions,narrativeStrategy,narrativeOrder,relationships,synthesisStrategy,fallbackUsed:false});

const grammars=[
 ["Una carta — mensaje central",g({id:"single_message",purpose:"Reconocer el asunto central que merece atención ahora.",narrativeStrategy:"focus",positions:[p("message","Mensaje central","¿Qué mensaje concentra la lectura?","focus")]})],
 ["Dos cartas — situación y consejo",g({id:"situation_advice",purpose:"Comprender la situación y la respuesta más útil.",narrativeStrategy:"diagnostic",positions:[p("situation","Situación","¿Qué define la situación actual?","situation"),p("advice","Consejo","¿Qué respuesta ayuda a manejarla?","advice")],relationships:[link("situation","advice","problem_to_response")]})],
 ["Sí / No razonado — respuesta, condición y advertencia",g({id:"reasoned_answer",purpose:"Responder de forma condicionada, mostrando qué favorece o modifica el resultado.",narrativeStrategy:"weighted_answer",positions:[p("answer","Respuesta","¿Hacia qué respuesta se inclina la situación?","answer"),p("condition","Condición","¿Qué condición debe cumplirse?","condition"),p("warning","Advertencia","¿Qué puede cambiar o debilitar la respuesta?","warning")],relationships:[link("condition","answer","conditions"),link("warning","answer","modifies")]})],
 ["Tres cartas — pasado, presente y tendencia",g({id:"past_present_trend",purpose:"Comprender cómo el pasado desemboca en el presente y hacia dónde conduce la dinámica.",narrativeStrategy:"chronological",positions:[p("past","Pasado","¿Qué antecedente sigue influyendo?","past"),p("present","Presente","¿Qué ocurre ahora?","present"),p("trend","Tendencia","¿Hacia dónde conduce la dinámica actual?","future")],relationships:chain(["past","present","trend"],"temporal_transition")})],
 ["Situación, obstáculo y consejo",g({id:"situation_obstacle_advice",purpose:"Identificar el problema actual, su interferencia principal y la respuesta útil.",narrativeStrategy:"diagnostic",positions:[p("situation","Situación","¿Qué define el presente?","situation"),p("obstacle","Obstáculo","¿Qué impide o complica avanzar?","obstacle"),p("advice","Consejo","¿Cómo responder al obstáculo?","advice")],relationships:[link("situation","obstacle","problem"),link("obstacle","advice","problem_to_response")]})],
 ["Mente, emoción y acción",g({id:"mind_emotion_action",purpose:"Alinear lo que se piensa, lo que se siente y lo que finalmente se hace.",narrativeStrategy:"inner_process",positions:[p("mind","Mente","¿Qué está elaborando la mente?","thought"),p("emotion","Emoción","¿Qué se siente realmente?","feeling"),p("action","Acción","¿Cómo puede expresarse lo anterior en una conducta?","action")],relationships:[link("mind","emotion","internal_contrast"),link("emotion","action","becomes_action")]})],
 ["Qué conservar, qué soltar y qué iniciar",g({id:"keep_release_begin",purpose:"Distinguir lo que merece continuidad, lo que debe dejarse y lo nuevo que conviene iniciar.",narrativeStrategy:"transition",positions:[p("keep","Conservar","¿Qué sigue siendo valioso?","resource"),p("release","Soltar","¿Qué debe dejar de sostenerse?","ending"),p("begin","Iniciar","¿Qué nueva dirección puede comenzar?","beginning")],relationships:chain(["keep","release","begin"],"transition")})],

 ["Tú, la otra persona y el vínculo",g({id:"self_other_bond",purpose:"Comprender qué aporta cada persona y qué dinámica forman juntas.",narrativeStrategy:"relationship",positions:[p("self","Tú","¿Desde qué disposición participas?","self"),p("other","La otra persona","¿Desde qué disposición participa la otra persona?","other"),p("bond","El vínculo","¿Qué dinámica crean entre ambas?","bond")],relationships:[link("self","bond","contributes"),link("other","bond","contributes")]})],
 ["Relación de seis cartas",g({id:"six_card_relationship",purpose:"Comprender las energías de ambas partes, la unión, la distancia y la posible evolución.",narrativeStrategy:"relationship",positions:[p("self","Tu energía","¿Qué aportas al vínculo?","self"),p("other","Su energía","¿Qué aporta la otra parte?","other"),p("union","Lo que une","¿Qué sostiene el encuentro?","bond"),p("distance","Lo que distancia","¿Qué produce separación o tensión?","distance"),p("learning","Aprendizaje","¿Qué necesita comprenderse?","learning"),p("trend","Tendencia","¿Hacia dónde se dirige el vínculo?","future")],relationships:[link("self","union","contributes"),link("other","union","contributes"),link("distance","learning","problem_to_learning"),link("learning","trend","shapes_outcome")]})],
 ["Qué siente, qué piensa y qué hará",g({id:"feeling_thought_action",purpose:"Distinguir emoción, pensamiento y conducta probable sin confundirlos.",narrativeStrategy:"relationship",positions:[p("feeling","Qué siente","¿Qué emoción existe?","feeling"),p("thought","Qué piensa","¿Cómo interpreta mentalmente la situación?","thought"),p("action","Qué hará","¿Qué conducta es más probable?","action")],relationships:[link("feeling","thought","internal_contrast"),link("thought","action","becomes_action")]})],
 ["Compatibilidad de la pareja",g({id:"couple_compatibility",purpose:"Comparar dos formas de ser y reconocer afinidad, diferencia y potencial real.",narrativeStrategy:"relationship",positions:[p("self","Tu esencia","¿Qué necesitas y aportas?","self"),p("other","Su esencia","¿Qué necesita y aporta la otra parte?","other"),p("affinity","Afinidad","¿Dónde coinciden?","bond"),p("difference","Diferencia","¿Dónde aparece la fricción?","distance"),p("potential","Potencial","¿Qué puede construirse con estas condiciones?","future")],relationships:[link("self","affinity","supports"),link("other","affinity","supports"),link("difference","potential","conditions")]})],
 ["Evolución del vínculo",g({id:"bond_evolution",purpose:"Seguir el origen del vínculo, su estado, su desafío y el siguiente desarrollo.",narrativeStrategy:"relationship",positions:[p("origin","Origen","¿Cómo se formó esta dinámica?","past"),p("present","Estado actual","¿Cómo se encuentra ahora?","present"),p("challenge","Desafío","¿Qué debe resolverse?","obstacle"),p("next_step","Próximo paso","¿Qué movimiento puede darse después?","action"),p("evolution","Evolución","¿Hacia dónde conduce ese movimiento?","future")],relationships:chain(["origin","present","challenge","next_step","evolution"],"relationship_evolution")})],
 ["Reconciliación o cierre",g({id:"reconciliation_or_closure",purpose:"Distinguir lo que permanece, lo que separa y si existen condiciones para reconciliar o cerrar.",narrativeStrategy:"relationship",positions:[p("remains","Lo que permanece","¿Qué sigue vivo entre las partes?","bond"),p("separates","Lo que separa","¿Qué mantiene la distancia?","distance"),p("dialogue","Posibilidad de diálogo","¿Qué apertura real existe?","opportunity"),p("condition","Condición","¿Qué tendría que cumplirse?","condition"),p("reconciliation","Reconciliación","¿Qué forma podría tomar un reencuentro?","future"),p("closure","Cierre consciente","¿Qué permitiría cerrar con claridad?","ending")],relationships:[link("remains","dialogue","supports"),link("separates","condition","requires"),link("condition","reconciliation","enables"),link("condition","closure","alternative_outcome")]})],
 ["Persona nueva: intención, potencial y precaución",g({id:"new_person",purpose:"Examinar la intención de una persona nueva, el potencial del vínculo y la precaución necesaria.",narrativeStrategy:"relationship",positions:[p("intention","Intención","¿Con qué intención se acerca?","intention"),p("potential","Potencial","¿Qué podría construirse?","future"),p("caution","Precaución","¿Qué conviene observar antes de confiar?","warning")],relationships:[link("intention","potential","shapes_outcome"),link("caution","potential","conditions")]})],

 ["Camino A frente a Camino B",g({id:"two_paths",purpose:"Comparar dos caminos por sus procesos y consecuencias.",narrativeStrategy:"decision",positions:[p("situation","Situación","¿Desde qué punto se decide?","present"),p("path_a","Camino A","¿Qué exige o activa el camino A?","option"),p("result_a","Resultado A","¿A qué conduce el camino A?","outcome"),p("path_b","Camino B","¿Qué exige o activa el camino B?","option"),p("result_b","Resultado B","¿A qué conduce el camino B?","outcome")],relationships:[link("situation","path_a","opens_option"),link("path_a","result_a","consequence"),link("situation","path_b","opens_option"),link("path_b","result_b","consequence")]})],
 ["Ventajas, riesgos y resultado probable",g({id:"advantages_risks_result",purpose:"Evaluar lo favorable, el riesgo concreto y el resultado condicionado por ambos.",narrativeStrategy:"decision",positions:[p("advantage","Ventajas","¿Qué juega a favor?","opportunity"),p("risk","Riesgos","¿Qué puede debilitar el resultado?","risk"),p("result","Resultado probable","¿Qué resultado surge al combinar ambos factores?","future")],relationships:[link("advantage","result","supports"),link("risk","result","conditions")]})],
 ["Qué ocurre si actúo / si no actúo",g({id:"act_or_not",purpose:"Comparar las consecuencias de actuar con las de no actuar.",narrativeStrategy:"decision",positions:[p("decision","Punto de decisión","¿Qué obliga a elegir?","present"),p("act","Si actúo","¿Qué dinámica se activa al actuar?","option"),p("act_result","Consecuencia","¿A qué conduce actuar?","outcome"),p("not_act","Si no actúo","¿Qué dinámica se mantiene al no actuar?","option"),p("not_act_result","Consecuencia","¿A qué conduce no actuar?","outcome")],relationships:[link("decision","act","opens_option"),link("act","act_result","consequence"),link("decision","not_act","opens_option"),link("not_act","not_act_result","consequence")]})],
 ["Decisión de seis cartas",g({id:"six_card_decision",purpose:"Comprender la motivación y comparar dos caminos con sus resultados.",narrativeStrategy:"decision",positions:[p("situation","Situación","¿Qué define el punto de decisión?","present"),p("motivation","Motivación","¿Qué impulsa realmente la elección?","motivation"),p("path_a","Camino A","¿Qué exige el camino A?","option"),p("result_a","Resultado A","¿A qué conduce el camino A?","outcome"),p("path_b","Camino B","¿Qué exige el camino B?","option"),p("result_b","Resultado B","¿A qué conduce el camino B?","outcome")],relationships:[link("motivation","situation","influences"),link("path_a","result_a","consequence"),link("path_b","result_b","consequence")]})],
 ["Semáforo: avanzar, esperar o detenerse",g({id:"traffic_light",purpose:"Distinguir las condiciones para avanzar, esperar o detenerse.",narrativeStrategy:"decision",positions:[p("advance","Avanzar","¿Qué condición favorece avanzar?","action"),p("wait","Esperar","¿Qué necesita tiempo o confirmación?","condition"),p("stop","Detenerse","¿Qué señal justificaría detenerse?","warning")],relationships:[link("wait","advance","conditions"),link("stop","advance","blocks")]})],

 ["Situación laboral",g({id:"work_situation",purpose:"Diagnosticar el presente laboral, sus apoyos, bloqueos y respuesta útil.",narrativeStrategy:"diagnostic",positions:[p("situation","Situación","¿Qué define el presente laboral?","present"),p("strength","Fortaleza","¿Qué capacidad juega a favor?","resource"),p("block","Bloqueo","¿Qué impide avanzar?","obstacle"),p("environment","Entorno","¿Qué condiciones externas influyen?","external"),p("advice","Consejo","¿Qué conviene hacer?","advice")],relationships:[link("strength","block","responds_to"),link("environment","situation","influences"),link("block","advice","problem_to_response")]})],
 ["Cambio de empleo",g({id:"job_change",purpose:"Evaluar las razones, oportunidades, riesgos y resultado de cambiar de empleo.",narrativeStrategy:"decision",positions:[p("current","Trabajo actual","¿Qué caracteriza el empleo actual?","present"),p("reason","Razón del cambio","¿Qué impulsa el cambio?","motivation"),p("opportunity","Oportunidad","¿Qué puede ofrecer la alternativa?","opportunity"),p("risk","Riesgo","¿Qué debe medirse?","risk"),p("result","Resultado","¿A qué conduciría el cambio?","future"),p("advice","Consejo","¿Cómo tomar la decisión?","advice")],relationships:[link("current","reason","causes"),link("opportunity","result","supports"),link("risk","result","conditions"),link("result","advice","informs_action")]})],
 ["Proyecto o negocio",g({id:"project_business",purpose:"Evaluar una idea por sus recursos, mercado, obstáculo, estrategia y resultado.",narrativeStrategy:"project_flow",positions:[p("idea","Idea","¿Qué valor o impulso tiene la idea?","focus"),p("resources","Recursos","¿Con qué capacidades cuenta?","resource"),p("market","Mercado","¿Qué respuesta externa puede encontrar?","external"),p("obstacle","Obstáculo","¿Qué puede frenar el proyecto?","obstacle"),p("strategy","Estrategia","¿Cómo responder al obstáculo?","action"),p("result","Resultado","¿Qué puede producir la estrategia?","future")],relationships:[link("idea","resources","requires"),link("market","result","influences"),link("obstacle","strategy","problem_to_response"),link("strategy","result","shapes_outcome")]})],
 ["Bloqueo económico",g({id:"economic_block",purpose:"Encontrar el origen del bloqueo, cómo se manifiesta y qué permite salir de él.",narrativeStrategy:"diagnostic",positions:[p("origin","Origen","¿Qué originó el bloqueo?","past"),p("manifestation","Manifestación","¿Cómo aparece ahora?","present"),p("pattern","Patrón","¿Qué lo repite o sostiene?","obstacle"),p("resource","Recurso","¿Qué capacidad puede utilizarse?","resource"),p("exit","Salida","¿Qué permite romper el patrón?","action")],relationships:chain(["origin","manifestation","pattern","resource","exit"],"diagnostic_sequence")})],
 ["Flujo de recursos",g({id:"resource_flow",purpose:"Comprender de dónde provienen los recursos, cómo entran, dónde se pierden, qué se conserva y hacia dónde fluye.",narrativeStrategy:"resource_flow",positions:[p("origin","Origen","¿Qué originó la situación actual de recursos?","resource_origin"),p("inflow","Entrada","¿Qué permite que entren recursos?","inflow"),p("leakage","Fuga","¿Qué consume, desperdicia o bloquea recursos?","leakage"),p("reserve","Reserva","¿Qué puede conservarse o acumularse?","reserve"),p("movement","Movimiento","¿Qué permite poner los recursos a trabajar?","movement"),p("trend","Tendencia","¿Hacia dónde se dirige el flujo?","future")],relationships:chain(["origin","inflow","leakage","reserve","movement","trend"],"resource_transition")})],
 ["Oportunidad, riesgo y estrategia",g({id:"opportunity_risk_strategy",purpose:"Evaluar una oportunidad, su peligro concreto y la estrategia para manejarlo.",narrativeStrategy:"diagnostic",positions:[p("opportunity","Oportunidad","¿Qué posibilidad real aparece?","opportunity"),p("risk","Riesgo","¿Qué puede debilitarla?","risk"),p("strategy","Estrategia","¿Cómo responder a ese riesgo?","action")],relationships:[link("opportunity","risk","conditions"),link("risk","strategy","problem_to_response")]})],

 ["Sombra, aprendizaje y recurso",g({id:"shadow_learning_resource",purpose:"Reconocer un patrón interno, la transformación que exige y la capacidad disponible para atravesarlo.",narrativeStrategy:"psychological",positions:[p("shadow","Sombra","¿Qué patrón inconsciente o dificultad interna necesita reconocerse?","shadow"),p("learning","Aprendizaje","¿Qué transformación necesita aprender o aceptar?","learning"),p("resource","Recurso","¿Qué capacidad puede utilizar para atravesar el proceso?","resource")],relationships:[link("shadow","learning","requires_transformation"),link("learning","resource","activates_resource")]})],
 ["Bloqueo emocional",g({id:"emotional_block",purpose:"Comprender la emoción visible, su raíz, la defensa que la protege y cómo integrarla.",narrativeStrategy:"psychological",positions:[p("visible","Emoción visible","¿Qué emoción se reconoce primero?","feeling"),p("root","Raíz","¿Qué la origina?","foundation"),p("protection","Protección","¿Qué defensa intenta evitar dolor o exposición?","defense"),p("need","Necesidad","¿Qué necesita realmente esa emoción?","need"),p("integration","Integración","¿Cómo puede procesarse de forma más completa?","action")],relationships:[link("root","visible","causes"),link("protection","need","hides"),link("need","integration","problem_to_response")]})],
 ["Propósito del momento",g({id:"present_purpose",purpose:"Reconocer el llamado actual, los talentos disponibles y la acción que convierte todo en propósito.",narrativeStrategy:"psychological",positions:[p("calling","Llamado","¿Qué pide atención ahora?","calling"),p("talent","Talento","¿Qué capacidad está disponible?","resource"),p("learning","Aprendizaje","¿Qué necesita comprenderse?","learning"),p("action","Acción","¿Qué debe ponerse en práctica?","action"),p("purpose","Propósito","¿Qué sentido integra todo lo anterior?","future")],relationships:chain(["calling","talent","learning","action","purpose"],"purpose_development")})],
 ["Ciclo que termina y ciclo que comienza",g({id:"cycle_ending_beginning",purpose:"Comprender qué termina, qué aprendizaje deja y cómo comenzar la siguiente etapa.",narrativeStrategy:"transition",positions:[p("ending","Lo que termina","¿Qué está terminando?","ending"),p("lesson","Lección","¿Qué aprendizaje deja esa experiencia?","learning"),p("threshold","Umbral","¿Qué debe suceder para cruzar hacia lo nuevo?","threshold"),p("beginning","Lo que comienza","¿Qué empieza a surgir?","beginning"),p("first_step","Primer paso","¿Cuál es la primera acción, actitud o dirección?","action")],relationships:chain(["ending","lesson","threshold","beginning","first_step"],"transition")})],
 ["Herida, conciencia e integración",g({id:"wound_awareness_integration",purpose:"Reconocer una herida, comprenderla y encontrar una forma de integrarla.",narrativeStrategy:"psychological",positions:[p("wound","Herida","¿Qué dolor o vulnerabilidad necesita reconocerse?","shadow"),p("awareness","Conciencia","¿Qué verdad permite comprenderla?","learning"),p("integration","Integración","¿Cómo puede incorporarse sin seguir gobernando la respuesta?","action")],relationships:[link("wound","awareness","becomes_conscious"),link("awareness","integration","problem_to_response")]})],
 ["Los siete chakras",g({id:"seven_chakras",purpose:"Observar cómo se distribuyen seguridad, deseo, voluntad, afecto, expresión, visión y sentido.",narrativeStrategy:"chakra_system",positions:[p("root","Raíz","¿Cómo se encuentra la seguridad y el arraigo?","foundation"),p("sacral","Sacro","¿Cómo circulan deseo y creatividad?","feeling"),p("solar","Plexo solar","¿Cómo se expresa la voluntad?","action"),p("heart","Corazón","¿Cómo se vive el afecto y la apertura?","bond"),p("throat","Garganta","¿Cómo se expresa la verdad?","thought"),p("third_eye","Tercer ojo","¿Qué se percibe o comprende?","insight"),p("crown","Corona","¿Qué sentido integra el proceso?","future")],relationships:chain(["root","sacral","solar","heart","throat","third_eye","crown"],"energy_progression")})],
 ["Rueda del año personal",g({id:"personal_year_wheel",purpose:"Seguir un ciclo anual desde la preparación hasta la cosecha, la depuración y su tema central.",narrativeStrategy:"seasonal_cycle",positions:[p("winter","Invierno","¿Qué se prepara o permanece en reposo?","past"),p("awakening","Despertar","¿Qué empieza a activarse?","beginning"),p("spring","Primavera","¿Qué nace o se renueva?","beginning"),p("expansion","Expansión","¿Qué puede crecer?","opportunity"),p("summer","Verano","¿Dónde se concentra la actividad?","action"),p("harvest","Cosecha","¿Qué resultado puede recogerse?","outcome"),p("autumn","Otoño","¿Qué necesita evaluarse y madurar?","learning"),p("release","Depuración","¿Qué debe soltarse antes del siguiente ciclo?","ending"),p("center","Centro del año","¿Qué tema da sentido a todo el año?","focus")],relationships:chain(["winter","awakening","spring","expansion","summer","harvest","autumn","release"],"seasonal_transition")})],

 ["Cruz Celta — 10 cartas",g({id:"celtic_cross",purpose:"Comprender cómo pasado y base explican el presente, qué lo cruza, qué puede desarrollarse y cuál es la dirección probable.",narrativeStrategy:"celtic_cross",positions:[p("situation","Situación","¿Qué define el presente?","present"),p("cross","Lo que cruza","¿Qué interfiere o modifica la situación?","obstacle"),p("base","Base","¿Qué proceso subyacente sostiene lo ocurrido?","foundation"),p("past","Pasado","¿Qué antecedente condujo hasta aquí?","past"),p("possibility","Posibilidad","¿Qué puede desarrollarse?","opportunity"),p("near_future","Futuro cercano","¿Qué transición aparece primero?","future"),p("attitude","Actitud","¿Cómo responde la persona consultante?","self"),p("environment","Entorno","¿Qué condiciones externas influyen?","external"),p("hopes_fears","Esperanzas y temores","¿Qué expectativa o miedo sesga la mirada?","expectation"),p("trend","Tendencia","¿Qué dirección probable integra la lectura?","future")],narrativeOrder:["past","base","situation","cross","possibility","near_future","attitude","environment","hopes_fears","trend"],relationships:[link("past","base","explains"),link("base","situation","causes"),link("situation","cross","conflict"),link("possibility","near_future","develops"),link("attitude","environment","internal_external"),link("hopes_fears","trend","bias_vs_outcome")]})],
 ["Herradura — 7 cartas",g({id:"horseshoe",purpose:"Seguir antecedentes, presente, influencia oculta, obstáculo, entorno, consejo y resultado.",narrativeStrategy:"chronological",positions:[p("past","Pasado","¿Qué antecedente sigue actuando?","past"),p("present","Presente","¿Qué ocurre ahora?","present"),p("hidden","Influencia oculta","¿Qué factor todavía no se reconoce?","foundation"),p("obstacle","Obstáculo","¿Qué complica el avance?","obstacle"),p("environment","Entorno","¿Qué condiciones externas intervienen?","external"),p("advice","Consejo","¿Cómo conviene responder?","advice"),p("result","Resultado","¿A qué conduce la dinámica?","future")],relationships:chain(["past","present","hidden","obstacle","environment","advice","result"],"chronological_development")})],
 ["Estrella de siete cartas",g({id:"seven_card_star",purpose:"Relacionar el centro del asunto con conciencia, deseo, recurso, desafío, acción y resultado.",narrativeStrategy:"star_system",positions:[p("center","Centro","¿Cuál es el núcleo concreto del asunto?","present"),p("awareness","Conciencia","¿Qué se comprende?","insight"),p("desire","Deseo","¿Qué se busca o anhela?","expectation"),p("resource","Recurso","¿Qué capacidad está disponible?","resource"),p("challenge","Desafío","¿Qué debe resolverse?","obstacle"),p("action","Acción","¿Qué conviene hacer?","action"),p("result","Resultado","¿Qué puede producir esa respuesta?","future")],relationships:[link("awareness","center","clarifies"),link("desire","center","influences"),link("resource","challenge","responds_to"),link("challenge","action","problem_to_response"),link("action","result","shapes_outcome")]})],
 ["Mandala de nueve cartas",g({id:"nine_card_mandala",purpose:"Observar un centro y las fuerzas que lo rodean desde distintas direcciones.",narrativeStrategy:"mandala_system",positions:[p("center","Centro","¿Qué concentra el asunto?","present"),p("north","Norte","¿Qué orienta o da dirección?","insight"),p("northeast","Noreste","¿Qué empieza a acercarse?","opportunity"),p("east","Este","¿Qué necesita comenzar?","beginning"),p("southeast","Sureste","¿Qué puede ponerse en movimiento?","action"),p("south","Sur","¿Qué requiere fundamento?","foundation"),p("southwest","Suroeste","¿Qué pide revisión o cierre?","ending"),p("west","Oeste","¿Qué experiencia está quedando atrás?","past"),p("northwest","Noroeste","¿Qué aprendizaje integra el conjunto?","learning")],relationships:[link("west","center","influences"),link("south","center","supports"),link("center","east","opens"),link("northeast","southeast","becomes_action"),link("southwest","northwest","becomes_learning")]})],
 ["Doce casas — 12 cartas",g({id:"twelve_houses",purpose:"Comprender cómo interactúan doce áreas concretas de la vida sin perder el significado de cada casa.",narrativeStrategy:"houses",positions:[p("self","Yo","¿Cómo te posicionas?","self"),p("resources","Recursos","¿Cómo se administran seguridad y recursos?","resource"),p("communication","Comunicación","¿Cómo circula la información?","thought"),p("home","Hogar","¿Qué sostiene la base personal?","foundation"),p("creativity","Creatividad","¿Qué busca expresarse o disfrutarse?","beginning"),p("routines","Rutinas","¿Qué ocurre en hábitos y responsabilidades?","action"),p("bonds","Vínculos","¿Cómo se construyen los acuerdos cercanos?","bond"),p("transformation","Transformación","¿Qué debe cambiar de raíz?","ending"),p("vision","Visión","¿Qué horizonte da sentido?","insight"),p("vocation","Vocación","¿Qué dirección profesional se forma?","future"),p("community","Comunidad","¿Qué apoyos y grupos influyen?","external"),p("unconscious","Inconsciente","¿Qué se procesa sin expresarse plenamente?","shadow")],relationships:[link("self","bonds","self_other"),link("resources","vocation","supports"),link("communication","community","connects"),link("home","transformation","underlies"),link("routines","unconscious","reveals"),link("vision","vocation","guides")]})],
 ["Árbol de la Vida — 10 cartas",g({id:"tree_of_life",purpose:"Seguir cómo una intención desciende desde el sentido y la comprensión hasta una forma concreta.",narrativeStrategy:"tree_system",positions:[p("keter","Kéter","¿Qué principio o intención superior inicia el proceso?","focus"),p("chokmah","Jojmá","¿Qué impulso creativo aparece?","beginning"),p("binah","Biná","¿Qué forma, límite o comprensión lo organiza?","learning"),p("chesed","Jésed","¿Dónde existe expansión o apoyo?","opportunity"),p("gevurah","Guevurá","¿Qué límite o corrección es necesaria?","obstacle"),p("tiferet","Tiféret","¿Qué equilibrio integra las fuerzas?","bond"),p("netzach","Nétzaj","¿Qué deseo o persistencia impulsa?","motivation"),p("hod","Hod","¿Qué debe pensarse o comunicarse?","thought"),p("yesod","Yesod","¿Qué base interna prepara la manifestación?","foundation"),p("malkuth","Maljut","¿Cómo puede expresarse concretamente?","future")],relationships:[link("keter","chokmah","emanates"),link("keter","binah","emanates"),link("chokmah","binah","polarity"),link("chesed","gevurah","polarity"),link("chesed","tiferet","balances"),link("gevurah","tiferet","balances"),link("netzach","hod","polarity"),link("netzach","yesod","supports"),link("hod","yesod","supports"),link("yesod","malkuth","manifests")]})],
 ["Camino espiritual — 12 cartas",g({id:"spiritual_path",purpose:"Comprender un llamado, el equipaje, la guía, las pruebas y la integración de un camino interior.",narrativeStrategy:"spiritual_path",positions:[p("calling","Llamado","¿Qué invita a iniciar el camino?","calling"),p("origin","Origen","¿De dónde nace la búsqueda?","past"),p("baggage","Equipaje","¿Qué historia o recurso llevas contigo?","resource"),p("guide","Guía","¿Qué orientación está disponible?","advice"),p("threshold","Umbral","¿Qué debe cruzarse?","threshold"),p("trial","Prueba","¿Qué dificultad confronta el proceso?","obstacle"),p("shadow","Sombra","¿Qué patrón interno necesita reconocerse?","shadow"),p("revelation","Revelación","¿Qué verdad puede comprenderse?","insight"),p("choice","Elección","¿Qué decisión define el camino?","action"),p("surrender","Entrega","¿Qué debe soltarse o aceptarse?","ending"),p("integration","Integración","¿Cómo incorporar lo aprendido?","learning"),p("destination","Destino interior","¿Qué forma de conciencia puede alcanzarse?","future")],relationships:chain(["calling","origin","baggage","guide","threshold","trial","shadow","revelation","choice","surrender","integration","destination"],"spiritual_development")})],
];

export const TAROT_OUTPUT_STRATEGIES=Object.freeze({
 SINGLE_MESSAGE:"SINGLE_MESSAGE",
 SHORT_SEQUENCE:"SHORT_SEQUENCE",
 CONDITIONAL_ANSWER:"CONDITIONAL_ANSWER",
 RELATIONAL_THREE_PART:"RELATIONAL_THREE_PART",
 RELATIONAL_OVERVIEW:"RELATIONAL_OVERVIEW",
 COMPARATIVE_SIGNAL:"COMPARATIVE_SIGNAL",
 TWO_PATH_COMPARISON:"TWO_PATH_COMPARISON",
 DECISION_ANALYSIS:"DECISION_ANALYSIS",
 DOMAIN_ANALYSIS:"DOMAIN_ANALYSIS",
 INNER_PROCESS:"INNER_PROCESS",
 FULL_NARRATIVE:"FULL_NARRATIVE",
 SYSTEMIC_OVERVIEW:"SYSTEMIC_OVERVIEW",
 CHAKRA_SYSTEM:"CHAKRA_SYSTEM",
 TREE_OF_LIFE:"TREE_OF_LIFE",
 JOURNEY_STAGES:"JOURNEY_STAGES",
 TEMPORAL_CYCLE:"TEMPORAL_CYCLE",
 TRANSITION_STORY:"TRANSITION_STORY",
});

const outputStrategyById=new Map([
 ["single_message",TAROT_OUTPUT_STRATEGIES.SINGLE_MESSAGE],
 ["situation_advice",TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],
 ["reasoned_answer",TAROT_OUTPUT_STRATEGIES.CONDITIONAL_ANSWER],
 ["past_present_trend",TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],
 ["situation_obstacle_advice",TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],
 ["mind_emotion_action",TAROT_OUTPUT_STRATEGIES.INNER_PROCESS],
 ["keep_release_begin",TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],
 ["self_other_bond",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["six_card_relationship",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["feeling_thought_action",TAROT_OUTPUT_STRATEGIES.RELATIONAL_THREE_PART],
 ["couple_compatibility",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["bond_evolution",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["reconciliation_or_closure",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["new_person",TAROT_OUTPUT_STRATEGIES.RELATIONAL_OVERVIEW],
 ["two_paths",TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON],
 ["advantages_risks_result",TAROT_OUTPUT_STRATEGIES.DECISION_ANALYSIS],
 ["act_or_not",TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON],
 ["six_card_decision",TAROT_OUTPUT_STRATEGIES.TWO_PATH_COMPARISON],
 ["traffic_light",TAROT_OUTPUT_STRATEGIES.COMPARATIVE_SIGNAL],
 ["work_situation",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["job_change",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["project_business",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["economic_block",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["resource_flow",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["opportunity_risk_strategy",TAROT_OUTPUT_STRATEGIES.DOMAIN_ANALYSIS],
 ["shadow_learning_resource",TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE],
 ["emotional_block",TAROT_OUTPUT_STRATEGIES.INNER_PROCESS],
 ["present_purpose",TAROT_OUTPUT_STRATEGIES.INNER_PROCESS],
 ["cycle_ending_beginning",TAROT_OUTPUT_STRATEGIES.TRANSITION_STORY],
 ["wound_awareness_integration",TAROT_OUTPUT_STRATEGIES.INNER_PROCESS],
 ["seven_chakras",TAROT_OUTPUT_STRATEGIES.CHAKRA_SYSTEM],
 ["personal_year_wheel",TAROT_OUTPUT_STRATEGIES.TEMPORAL_CYCLE],
 ["celtic_cross",TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE],
 ["horseshoe",TAROT_OUTPUT_STRATEGIES.FULL_NARRATIVE],
 ["seven_card_star",TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW],
 ["nine_card_mandala",TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW],
 ["twelve_houses",TAROT_OUTPUT_STRATEGIES.SYSTEMIC_OVERVIEW],
 ["tree_of_life",TAROT_OUTPUT_STRATEGIES.TREE_OF_LIFE],
 ["spiritual_path",TAROT_OUTPUT_STRATEGIES.JOURNEY_STAGES],
]);

const outputStrategyFor=grammar=>outputStrategyById.get(grammar.id)||TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE;

export const TAROT_DOMAINS=Object.freeze({
 LOVE_RELATIONSHIPS:"AMOR_RELACIONES",WORK_PROFESSION:"TRABAJO_PROFESION",MONEY_RESOURCES:"DINERO_RECURSOS",
 DECISION:"DECISION",PERSONAL_DEVELOPMENT:"DESARROLLO_PERSONAL",SPIRITUAL:"ESPIRITUAL",GENERAL:"GENERAL",
 TEMPORAL:"TEMPORAL",DIAGNOSTIC:"DIAGNOSTICO",COMPARATIVE:"COMPARATIVO"
});
export const TAROT_MODES=Object.freeze({
 NARRATIVE:"NARRATIVO",TEMPORAL:"TEMPORAL",COMPARATIVE:"COMPARATIVO",DIAGNOSTIC:"DIAGNOSTICO",
 RELATIONAL:"RELACIONAL",EVOLUTIONARY:"EVOLUTIVO",MAP:"MAPA"
});

const spreadContexts=new Map();
const registerContext=(names,domain,mode,secondaryDomains=[])=>names.forEach(name=>spreadContexts.set(name,{domain,mode,secondaryDomains}));
registerContext([
 "Una carta — mensaje central","Dos cartas — situación y consejo","Sí / No razonado — respuesta, condición y advertencia",
 "Situación, obstáculo y consejo","Mente, emoción y acción","Qué conservar, qué soltar y qué iniciar"
],TAROT_DOMAINS.GENERAL,TAROT_MODES.NARRATIVE);
registerContext(["Tres cartas — pasado, presente y tendencia","Herradura — 7 cartas"],TAROT_DOMAINS.TEMPORAL,TAROT_MODES.TEMPORAL,[TAROT_DOMAINS.GENERAL]);
registerContext([
 "Tú, la otra persona y el vínculo","Relación de seis cartas","Qué siente, qué piensa y qué hará","Compatibilidad de la pareja",
 "Evolución del vínculo","Reconciliación o cierre","Persona nueva: intención, potencial y precaución"
],TAROT_DOMAINS.LOVE_RELATIONSHIPS,TAROT_MODES.RELATIONAL);
registerContext([
 "Camino A frente a Camino B","Ventajas, riesgos y resultado probable","Qué ocurre si actúo / si no actúo",
 "Decisión de seis cartas","Semáforo: avanzar, esperar o detenerse"
],TAROT_DOMAINS.DECISION,TAROT_MODES.COMPARATIVE);
registerContext(["Situación laboral"],TAROT_DOMAINS.WORK_PROFESSION,TAROT_MODES.DIAGNOSTIC);
registerContext(["Cambio de empleo"],TAROT_DOMAINS.WORK_PROFESSION,TAROT_MODES.COMPARATIVE,[TAROT_DOMAINS.DECISION]);
registerContext(["Proyecto o negocio","Oportunidad, riesgo y estrategia"],TAROT_DOMAINS.WORK_PROFESSION,TAROT_MODES.DIAGNOSTIC,[TAROT_DOMAINS.MONEY_RESOURCES]);
registerContext(["Bloqueo económico","Flujo de recursos"],TAROT_DOMAINS.MONEY_RESOURCES,TAROT_MODES.DIAGNOSTIC);
registerContext([
 "Sombra, aprendizaje y recurso","Bloqueo emocional","Propósito del momento","Ciclo que termina y ciclo que comienza",
 "Herida, conciencia e integración"
],TAROT_DOMAINS.PERSONAL_DEVELOPMENT,TAROT_MODES.EVOLUTIONARY);
registerContext(["Los siete chakras"],TAROT_DOMAINS.SPIRITUAL,TAROT_MODES.MAP,[TAROT_DOMAINS.PERSONAL_DEVELOPMENT]);
registerContext(["Rueda del año personal"],TAROT_DOMAINS.TEMPORAL,TAROT_MODES.EVOLUTIONARY,[TAROT_DOMAINS.PERSONAL_DEVELOPMENT]);
registerContext(["Cruz Celta — 10 cartas"],TAROT_DOMAINS.GENERAL,TAROT_MODES.DIAGNOSTIC);
registerContext(["Estrella de siete cartas","Mandala de nueve cartas","Doce casas — 12 cartas"],TAROT_DOMAINS.GENERAL,TAROT_MODES.MAP);
registerContext(["Árbol de la Vida — 10 cartas","Camino espiritual — 12 cartas"],TAROT_DOMAINS.SPIRITUAL,TAROT_MODES.EVOLUTIONARY);

const semanticFunction=spec=>{
 const byId={origin:"ORIGIN",manifestation:"CURRENT_STATE",pattern:"OBSTACLE",exit:"ACTION",past:"PAST",present:"CURRENT_STATE",
  trend:"TREND",result:"OUTCOME",result_a:"OUTCOME",result_b:"OUTCOME",act_result:"CONSEQUENCE",not_act_result:"CONSEQUENCE",
  near_future:"FUTURE",advance:"ACTION",wait:"DECISION",stop:"RISK",feeling:"INTERNAL",thought:"INTERNAL",action:"ACTION",
  release:"RELEASE",ending:"ENDING",begin:"BEGINNING",beginning:"BEGINNING",bond:"RELATIONSHIP",potential:"POTENTIAL",
  opportunity:"POTENTIAL",risk:"RISK",obstacle:"OBSTACLE",cross:"OBSTACLE",resource:"RESOURCE",advice:"ADVICE",
  environment:"EXTERNAL",desire:"DESIRE",hopes_fears:"FEAR",choice:"DECISION",transformation:"ENDING"};
 if(byId[spec.id])return byId[spec.id];
 const byRole={past:"PAST",present:"CURRENT_STATE",obstacle:"OBSTACLE",risk:"RISK",resource:"RESOURCE",action:"ACTION",
  advice:"ADVICE",future:"TREND",opportunity:"POTENTIAL",foundation:"ORIGIN",shadow:"INTERNAL",learning:"RESOURCE",
  feeling:"INTERNAL",thought:"INTERNAL",external:"EXTERNAL",expectation:"DESIRE",condition:"DECISION",ending:"ENDING",
  beginning:"BEGINNING",threshold:"DECISION",bond:"RELATIONSHIP",distance:"OBSTACLE",outcome:"OUTCOME",option:"DECISION",
  self:"INTERNAL",other:"EXTERNAL",intention:"INTERNAL",motivation:"DESIRE",warning:"RISK",leakage:"RISK",inflow:"RESOURCE",
  reserve:"RESOURCE",movement:"ACTION",resource_origin:"ORIGIN",calling:"BEGINNING",insight:"RESOURCE",focus:"CURRENT_STATE"};
 return byRole[spec.role]||"CURRENT_STATE";
};

const POSITION_QUESTION_BY_ID=Object.freeze({
 keep:"¿Qué aspecto positivo, cualidad, recurso o aprendizaje representado por esta carta conviene conservar?",
 release:"¿Qué expresión, patrón, expectativa o forma de actuar representada por esta carta conviene dejar atrás?",
 begin:"¿Qué nueva conducta, etapa, actitud o movimiento propone esta carta iniciar?",
 ending:"¿Qué manifestación de esta carta está llegando al final, perdiendo vigencia o necesitando transformarse?",
 beginning:"¿Qué nueva etapa, conducta o disposición representada por esta carta empieza a surgir?",
 first_step:"¿Qué acción o actitud inicial sugiere esta carta?",
 advantage:"¿Qué aporta esta carta a favor de la situación?",
 risk:"¿Cuál es la expresión problemática, excesiva, ingenua o contraproducente de esta carta en esta situación?",
 obstacle:"¿Cómo puede la energía de esta carta estar bloqueando, complicando o distorsionando la situación?",
 cross:"¿Cómo puede la energía de esta carta interferir, modificar o complicar la situación central?",
 resource:"¿Cómo puede utilizarse constructivamente la energía de esta carta?",
 strength:"¿Qué capacidad representada por esta carta juega a favor?",
 result:"¿Qué escenario puede desarrollarse si continúa la dinámica anterior?",
 result_a:"¿Qué escenario puede desarrollarse si se sostiene el camino A?",
 result_b:"¿Qué escenario puede desarrollarse si se sostiene el camino B?",
 act_result:"¿Qué escenario puede desarrollarse como consecuencia de actuar?",
 not_act_result:"¿Qué escenario puede desarrollarse como consecuencia de no actuar?",
 past:"¿Qué manifestación de esta carta describe el antecedente que todavía influye?",
 feeling:"¿Qué experiencia emocional describe esta carta?",
 thought:"¿Qué proceso mental, intención o evaluación describe esta carta?",
 action:"¿Qué conducta observable o acción probable describe esta carta?",
 advance:"¿Qué condición representada por esta carta respalda avanzar?",
 wait:"¿Qué razón o condición aporta esta carta para esperar?",
 stop:"¿Qué condición representada por esta carta justificaría detenerse?",
 idea:"¿Qué calidad, fortaleza o problema de la idea revela esta carta?",
 resources:"¿Qué recurso existe, falta o necesita organizarse según esta carta?",
 market:"¿Cómo parece responder el entorno o el mercado a lo representado por esta carta?",
 strategy:"¿Qué enfoque concreto propone esta carta para responder al riesgo u obstáculo?",
 advice:"¿Qué respuesta concreta propone esta carta ante lo que muestra la tirada?",
 outcome:"¿Qué escenario condicionado describe esta carta como consecuencia?",
 opportunity:"¿Qué posibilidad real aporta esta carta y qué permite aprovecharla?",
 leakage:"¿Cómo muestra esta carta que se pierden, dispersan o bloquean los recursos?",
 inflow:"¿Cómo muestra esta carta que pueden entrar o recuperarse recursos?",
 reserve:"¿Cómo muestra esta carta que pueden conservarse o acumularse recursos?",
 movement:"¿Qué acción permite poner los recursos en movimiento según esta carta?"
});

const answerModeForPosition=spec=>{
 const byId={
  keep:"PRESERVE_CONSTRUCTIVE",release:"RELEASE_EXPRESSION",begin:"INITIATE_EXPRESSION",ending:"ENDING_EXPRESSION",
  beginning:"INITIATE_EXPRESSION",first_step:"FIRST_ACTION",advantage:"FUNCTIONAL_ADVANTAGE",risk:"EXPOSE_RISK",
  obstacle:"EXPOSE_OBSTACLE",cross:"EXPOSE_OBSTACLE",resource:"ACTIVATE_RESOURCE",strength:"ACTIVATE_RESOURCE",
  result:"CONDITIONAL_OUTCOME",result_a:"CONDITIONAL_OUTCOME",result_b:"CONDITIONAL_OUTCOME",act_result:"CONDITIONAL_OUTCOME",
  not_act_result:"CONDITIONAL_OUTCOME",past:"PAST_INFLUENCE",feeling:"EMOTIONAL_RESPONSE",thought:"MENTAL_RESPONSE",
  action:"BEHAVIORAL_RESPONSE",advance:"ADVANCE_CONDITION",wait:"WAIT_CONDITION",stop:"STOP_CONDITION",idea:"ASSESS_IDEA",
  resources:"ASSESS_RESOURCES",market:"EXTERNAL_RESPONSE",strategy:"ACTIONABLE_STRATEGY",advice:"ACTIONABLE_ADVICE",
  opportunity:"FUNCTIONAL_OPPORTUNITY",leakage:"EXPOSE_LEAKAGE",inflow:"ENABLE_INFLOW",reserve:"BUILD_RESERVE",
  movement:"MOBILIZE_RESOURCES"
 };
 if(byId[spec.id])return byId[spec.id];
 if(spec.role==="learning")return "INTEGRATE_LEARNING";
 const byFunction={
  PAST:"PAST_INFLUENCE",ORIGIN:"ORIGIN_EXPLANATION",OBSTACLE:"EXPOSE_OBSTACLE",RISK:"EXPOSE_RISK",RESOURCE:"ACTIVATE_RESOURCE",
  ACTION:"ACTIONABLE_RESPONSE",ADVICE:"ACTIONABLE_ADVICE",FUTURE:"CONDITIONAL_OUTCOME",TREND:"CONDITIONAL_TREND",
  OUTCOME:"CONDITIONAL_OUTCOME",CONSEQUENCE:"CONDITIONAL_OUTCOME",POTENTIAL:"FUNCTIONAL_OPPORTUNITY",ENDING:"ENDING_EXPRESSION",
  RELEASE:"RELEASE_EXPRESSION",BEGINNING:"INITIATE_EXPRESSION",INTERNAL:"INTERNAL_RESPONSE",EXTERNAL:"EXTERNAL_RESPONSE",
  RELATIONSHIP:"RELATIONAL_RESPONSE",DESIRE:"DESIRE_OR_FEAR",FEAR:"DESIRE_OR_FEAR",DECISION:"DECISION_CONDITION",
  CURRENT_STATE:"CURRENT_STATE_ANSWER"
 };
 return byFunction[semanticFunction(spec)]||"POSITION_SPECIFIC_ANSWER";
};

const positionQuestion=spec=>POSITION_QUESTION_BY_ID[spec.id]||spec.question;

export const spreadGrammar=new Map(grammars.map(([name,grammar])=>{
 const context=spreadContexts.get(name)||{domain:TAROT_DOMAINS.GENERAL,mode:TAROT_MODES.NARRATIVE,secondaryDomains:[]};
 return [name,{...grammar,...context,outputStrategy:outputStrategyFor(grammar),positions:grammar.positions.map(spec=>{const semanticRole=semanticFunction(spec);return {...spec,question:positionQuestion(spec),answerMode:answerModeForPosition(spec),semanticRole,function:semanticRole};})}];
}));

export function getSpreadGrammar(name,actualPositions=[]){
 const known=spreadGrammar.get(name);
 if(known)return {...known,known:true,positions:known.positions.map((position,index)=>({...position,label:actualPositions[index]||position.label}))};
 const positions=actualPositions.map((label,index)=>({...p(`position_${index+1}`,label,`¿Cómo responde esta carta a lo que representa ${label.toLowerCase()}?`,"general"),answerMode:"POSITION_SPECIFIC_ANSWER",semanticRole:"CURRENT_STATE",function:"CURRENT_STATE"}));
 return {...g({id:"unknown_spread",purpose:"Interpretar una tirada no registrada respetando el orden de sus posiciones.",narrativeStrategy:"generic_map",positions,narrativeOrder:positions.map(position=>position.id),relationships:chain(positions.map(position=>position.id)),synthesisStrategy:"generic_fallback"}),outputStrategy:TAROT_OUTPUT_STRATEGIES.SHORT_SEQUENCE,domain:TAROT_DOMAINS.GENERAL,mode:TAROT_MODES.NARRATIVE,secondaryDomains:[],known:false,fallbackUsed:true};
}

export function isKnownSpread(name){return spreadGrammar.has(name);}
export function listSpreadGrammars(){return [...spreadGrammar.entries()];}
