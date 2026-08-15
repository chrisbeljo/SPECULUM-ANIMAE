export type TarotSpreadLayout = "line" | "arc" | "grid" | "cross" | "branches" | "chakra" | "wheel" | "celtic" | "star" | "mandala" | "houses" | "tree" | "path";

export type TarotSpreadDefinition = {
  name: string;
  layout: TarotSpreadLayout;
  positions: string[];
};

const spread = (name:string, layout:TarotSpreadLayout, positions:string[]):TarotSpreadDefinition => ({name,layout,positions});

export const classicTarotSpreads:TarotSpreadDefinition[] = [
 spread("Una carta — mensaje central","line",["Mensaje central"]),
 spread("Dos cartas — situación y consejo","line",["Situación","Consejo"]),
 spread("Sí / No razonado — respuesta, condición y advertencia","line",["Respuesta","Condición","Advertencia"]),
 spread("Tres cartas — pasado, presente y tendencia","line",["Pasado","Presente","Tendencia"]),
 spread("Situación, obstáculo y consejo","line",["Situación","Obstáculo","Consejo"]),
 spread("Mente, emoción y acción","line",["Mente","Emoción","Acción"]),
 spread("Qué conservar, qué soltar y qué iniciar","line",["Conservar","Soltar","Iniciar"]),

 spread("Tú, la otra persona y el vínculo","branches",["Tú","La otra persona","El vínculo"]),
 spread("Relación de seis cartas","grid",["Tu energía","Su energía","Lo que une","Lo que distancia","Aprendizaje","Tendencia"]),
 spread("Qué siente, qué piensa y qué hará","line",["Qué siente","Qué piensa","Qué hará"]),
 spread("Compatibilidad de la pareja","cross",["Tu esencia","Su esencia","Afinidad","Diferencia","Potencial"]),
 spread("Evolución del vínculo","arc",["Origen","Estado actual","Desafío","Próximo paso","Evolución"]),
 spread("Reconciliación o cierre","branches",["Lo que permanece","Lo que separa","Posibilidad de diálogo","Condición","Reconciliación","Cierre consciente"]),
 spread("Persona nueva: intención, potencial y precaución","line",["Intención","Potencial","Precaución"]),

 spread("Camino A frente a Camino B","branches",["Situación","Camino A","Resultado A","Camino B","Resultado B"]),
 spread("Ventajas, riesgos y resultado probable","line",["Ventajas","Riesgos","Resultado probable"]),
 spread("Qué ocurre si actúo / si no actúo","branches",["Punto de decisión","Si actúo","Consecuencia","Si no actúo","Consecuencia"]),
 spread("Decisión de seis cartas","branches",["Situación","Motivación","Camino A","Resultado A","Camino B","Resultado B"]),
 spread("Semáforo: avanzar, esperar o detenerse","line",["Avanzar","Esperar","Detenerse"]),

 spread("Situación laboral","cross",["Situación","Fortaleza","Bloqueo","Entorno","Consejo"]),
 spread("Cambio de empleo","arc",["Trabajo actual","Razón del cambio","Oportunidad","Riesgo","Resultado","Consejo"]),
 spread("Proyecto o negocio","grid",["Idea","Recursos","Mercado","Obstáculo","Estrategia","Resultado"]),
 spread("Bloqueo económico","cross",["Origen","Manifestación","Patrón","Recurso","Salida"]),
 spread("Flujo de recursos","arc",["Origen","Entrada","Fuga","Reserva","Movimiento","Tendencia"]),
 spread("Oportunidad, riesgo y estrategia","line",["Oportunidad","Riesgo","Estrategia"]),

 spread("Sombra, aprendizaje y recurso","line",["Sombra","Aprendizaje","Recurso"]),
 spread("Bloqueo emocional","cross",["Emoción visible","Raíz","Protección","Necesidad","Integración"]),
 spread("Propósito del momento","cross",["Llamado","Talento","Aprendizaje","Acción","Propósito"]),
 spread("Ciclo que termina y ciclo que comienza","branches",["Lo que termina","Lección","Umbral","Lo que comienza","Primer paso"]),
 spread("Herida, conciencia e integración","line",["Herida","Conciencia","Integración"]),
 spread("Los siete chakras","chakra",["Raíz","Sacro","Plexo solar","Corazón","Garganta","Tercer ojo","Corona"]),
 spread("Rueda del año personal","wheel",["Invierno","Despertar","Primavera","Expansión","Verano","Cosecha","Otoño","Depuración","Centro del año"]),

 spread("Cruz Celta — 10 cartas","celtic",["Situación","Lo que cruza","Base","Pasado","Posibilidad","Futuro cercano","Actitud","Entorno","Esperanzas y temores","Tendencia"]),
 spread("Herradura — 7 cartas","arc",["Pasado","Presente","Influencia oculta","Obstáculo","Entorno","Consejo","Resultado"]),
 spread("Estrella de siete cartas","star",["Centro","Conciencia","Deseo","Recurso","Desafío","Acción","Resultado"]),
 spread("Mandala de nueve cartas","mandala",["Centro","Norte","Noreste","Este","Sureste","Sur","Suroeste","Oeste","Noroeste"]),
 spread("Doce casas — 12 cartas","houses",["Yo","Recursos","Comunicación","Hogar","Creatividad","Rutinas","Vínculos","Transformación","Visión","Vocación","Comunidad","Inconsciente"]),
 spread("Árbol de la Vida — 10 cartas","tree",["Kéter","Jojmá","Biná","Jésed","Guevurá","Tiféret","Nétzaj","Hod","Yesod","Maljut"]),
 spread("Camino espiritual — 12 cartas","path",["Llamado","Origen","Equipaje","Guía","Umbral","Prueba","Sombra","Revelación","Elección","Entrega","Integración","Destino interior"]),
];

export const classicSpreadByName = new Map(classicTarotSpreads.map(item=>[item.name,item]));
