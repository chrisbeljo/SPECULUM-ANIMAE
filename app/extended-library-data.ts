const zenMajors = [
  "Apertura", "Presencia", "Testigo interior", "Impulso creador", "Libertad consciente", "Vacío fértil", "Encuentro", "Claridad",
  "Valor sereno", "Soledad plena", "Movimiento", "Umbral", "Mirada nueva", "Metamorfosis", "Centro", "Máscaras",
  "Despertar súbito", "Quietud", "Huellas", "Frescura", "Velo transparente", "Círculo completo", "Guía interior",
];

const zenFamilies = [
  ["Fuego", "Semilla", "Horizonte", "Vivencia", "Círculo", "Entrega", "Cumbre", "Tensión", "Camino", "Reserva", "Contención", "Juego", "Pulso", "Ofrenda", "Artesano"],
  ["Agua", "Corriente", "Afinidad", "Júbilo", "Regreso", "Memoria", "Imaginación", "Espejo", "Desprendimiento", "Reposo", "Resonancia", "Comprensión", "Confianza", "Apertura receptiva", "Reparación"],
  ["Nubes", "Observador", "División", "Distancia", "Espera", "Medida", "Peso", "Estrategia", "Remordimiento", "Duelo", "Renacer", "Rumor mental", "Defensa", "Norma", "Dominio"],
  ["Arcoíris", "Cosecha", "Paso presente", "Brújula", "Acumulación", "Umbral exterior", "Acuerdo", "Gestación", "Sencillez", "Fruto", "Comunidad", "Exploración", "Pausa", "Expansión", "Prosperidad"],
] as const;

const zenPhases = [
  { phase: "Observar", message: "Mira el patrón sin corregirlo todavía.", question: "¿Qué está ocurriendo en ti antes de explicarlo?", action: "Nombra una sensación, un pensamiento y un hecho." },
  { phase: "Permitir", message: "Haz espacio para la experiencia sin convertirla en identidad.", question: "¿Qué cambia si dejas de luchar con este momento?", action: "Respira tres veces y permite una pausa deliberada." },
  { phase: "Integrar", message: "Convierte la comprensión en una acción pequeña y verificable.", question: "¿Qué gesto expresa esta conciencia en la vida cotidiana?", action: "Elige un paso concreto que puedas realizar hoy." },
] as const;
const zenSymbols = ["◯","△","≈","◇","✦","☾","☀","∞","◌","⌁","◈","✧"];

function makeZenCard(name:string, group:string, index:number, number:number|null){
  const process=zenPhases[index%zenPhases.length];
  const id=`zen-${String(index+1).padStart(2,"0")}`;
  return {id,name,group,number,...process,symbol:zenSymbols[index%zenSymbols.length],hue:(index*37)%360,image:`/oracles/zen-oraculo/cards/${id}.jpg`};
}

export const oshoZenReference = [
  ...zenMajors.map((name,index)=>makeZenCard(name,"Conciencia",index,index<22?index:null)),
  ...zenFamilies.flatMap(([family,...cards],familyIndex)=>cards.map((name,index)=>makeZenCard(name,family,23+familyIndex*14+index,index+1))),
];

const animalData = [
  ["Águila", "Visión", "Toma distancia para distinguir el panorama completo."], ["Lobo", "Instinto", "Escucha tu instinto y contrástalo con la experiencia de tu comunidad."],
  ["Oso", "Fortaleza", "Protege tu energía y actúa desde una fuerza serena."], ["Búho", "Observación", "Mira lo que ocurre cuando disminuye el ruido."],
  ["Jaguar", "Presencia", "Avanza con atención y reserva tu fuerza para el momento necesario."], ["Ciervo", "Sensibilidad", "Acércate con gentileza sin abandonar tus límites."],
  ["Zorro", "Adaptación", "Cambia de estrategia sin perder la intención."], ["Caballo", "Libertad", "Recupera movimiento mediante una decisión coherente."],
  ["Cuervo", "Inteligencia", "Utiliza lo disponible de una manera nueva."], ["León", "Liderazgo", "Asume responsabilidad sin convertir autoridad en dominio."],
  ["Mariposa", "Transformación", "Permite que una etapa cambie de forma."], ["Serpiente", "Renovación", "Suelta una capa que ya no protege tu crecimiento."],
  ["Tortuga", "Constancia", "Avanza a un ritmo que puedas sostener."], ["Colibrí", "Alegría", "Reconoce la fuente pequeña de energía que tienes cerca."],
  ["Elefante", "Memoria", "Aprende del pasado sin quedar atrapado en él."], ["Delfín", "Comunicación", "Haz espacio para el juego y la comunicación clara."],
  ["Ballena", "Profundidad", "Escucha lo que sólo aparece cuando permaneces en silencio."], ["Búfalo", "Sustento", "Honra los recursos y a quienes sostienen el camino."],
  ["Conejo", "Atención", "Distingue prudencia de miedo antes de reaccionar."], ["Rana", "Limpieza", "Renueva el entorno emocional con una acción sencilla."],
  ["Araña", "Creación", "Observa qué red estás construyendo con tus decisiones."], ["Libélula", "Claridad", "Mira más allá de la primera impresión."],
  ["Abeja", "Cooperación", "Aporta tu parte sin olvidar el bienestar del conjunto."], ["Hormiga", "Disciplina", "Divide el trabajo y confía en la suma de pasos pequeños."],
  ["Castor", "Construcción", "Crea una estructura útil antes de ampliar."], ["Nutria", "Juego", "La flexibilidad también puede ser una forma de inteligencia."],
  ["Salmón", "Perseverancia", "Recuerda tu dirección cuando el camino ofrezca resistencia."], ["Halcón", "Enfoque", "Elige un objetivo y reduce la dispersión."],
  ["Halcón peregrino", "Precisión", "Actúa cuando la intención y el momento estén alineados."], ["Cisne", "Gracia", "Permite que la transformación madure sin exhibir cada esfuerzo."],
  ["Pavo real", "Expresión", "Muéstrate con autenticidad sin depender de la aprobación."], ["Gallo", "Despertar", "Anuncia el comienzo mediante una acción visible."],
  ["Perro", "Lealtad", "Cuida los vínculos que también saben cuidarte."], ["Gato", "Autonomía", "Protege tu espacio y conserva la curiosidad."],
  ["Lince", "Discernimiento", "Observa los detalles antes de revelar tu posición."], ["Murciélago", "Transición", "Oriéntate con sentidos nuevos cuando la vía conocida no alcance."],
  ["Polilla", "Atracción", "Revisa si aquello que te atrae también te hace bien."], ["Gorila", "Protección familiar", "Usa la fuerza para cuidar, no para imponer."],
  ["Camaleón", "Flexibilidad", "Adáptate al contexto sin olvidar quién eres."], ["Cocodrilo", "Paciencia", "Permanece atento y evita gastar energía antes de tiempo."],
  ["Escorpión", "Límites", "Responde con medida y protege lo vulnerable."], ["Escarabajo", "Renacimiento", "Convierte lo difícil en materia para una etapa nueva."],
  ["Grulla", "Equilibrio", "Mantén estabilidad mientras el entorno cambia."], ["Cóndor", "Perspectiva", "Eleva la mirada y deja atrás una carga innecesaria."],
] as const;

export const powerAnimals = animalData.map(([name, meaning, message], index) => ({
  id: `animal-${String(index + 1).padStart(2, "0")}`, name, meaning, message,
  image: `/oracles/animals/animal-${String(index + 1).padStart(2, "0")}.webp`,
}));

export const chamalongoOutcomes = [
  { name: "Alafia", up: 4, tone: "Afirmación", note: "Cuatro caras interiores hacia arriba. En registros comparativos se interpreta como sí o apertura favorable." },
  { name: "Etawa", up: 3, tone: "Sí condicionado", note: "Tres caras interiores. Suele pedir confirmación, cuidado o una segunda pregunta." },
  { name: "Eyeife", up: 2, tone: "Equilibrio", note: "Dos caras interiores y dos exteriores. Se asocia con estabilidad o afirmación firme en sistemas emparentados." },
  { name: "Okana", up: 1, tone: "Advertencia", note: "Una cara interior. Señala obstáculo, negativa o necesidad de precaución según la casa ritual." },
  { name: "Oyekun", up: 0, tone: "Cierre", note: "Todas las caras exteriores. Se trata con especial cautela; su lectura depende de la rama y del contexto ritual." },
];

const divineTriplets = `והו ילי סיט עלם מהש ללה אכא כהת
הזי אלד לאו ההע יזל מבה הרי הקם
לאו כלי לוו פהל נלך ייי מלה חהו
נתה האא ירת שאה ריי אום לכב ושר
יחו להח כוק מנד אני חעם רעה ייז
ההה מיכ וול ילה סאל ערי עשל מיה
והו דני החש עמם ננא נית מבה פוי
נמם ייל הרח מצר ומב יהה ענו מחי
דמב מנק איע חבו ראה יבמ היי מום`.split(/\s+/);

export const divineNames72 = divineTriplets.map((hebrew, index) => ({ number: index + 1, hebrew }));

export const sefirot = [
  ["Kéter", "כתר", "Corona"], ["Jojmá", "חכמה", "Sabiduría"], ["Biná", "בינה", "Entendimiento"],
  ["Jésed", "חסד", "Bondad"], ["Guevurá", "גבורה", "Rigor"], ["Tiféret", "תפארת", "Belleza"],
  ["Nétzaj", "נצח", "Permanencia"], ["Hod", "הוד", "Esplendor"], ["Yesod", "יסוד", "Fundamento"],
  ["Maljut", "מלכות", "Reino"],
].map(([name, hebrew, gloss], index) => ({ number: index + 1, name, hebrew, gloss }));

export const treePaths = [
  ["Álef", "א"], ["Bet", "ב"], ["Guímel", "ג"], ["Dálet", "ד"], ["He", "ה"], ["Vav", "ו"],
  ["Zayin", "ז"], ["Jet", "ח"], ["Tet", "ט"], ["Yod", "י"], ["Kaf", "כ"], ["Lámed", "ל"],
  ["Mem", "מ"], ["Nun", "נ"], ["Sámej", "ס"], ["Ayin", "ע"], ["Pe", "פ"], ["Tsadi", "צ"],
  ["Qof", "ק"], ["Resh", "ר"], ["Shin", "ש"], ["Tav", "ת"],
].map(([name, hebrew], index) => ({ number: index + 11, name, hebrew }));
