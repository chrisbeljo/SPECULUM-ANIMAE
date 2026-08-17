export type ServiceStatus = "AVAILABLE" | "COMING_SOON";
export type ServiceCategory = "oracle" | "calculation" | "image-reading" | "library";
export type ServiceSubcategory = "wide-answer" | "guidance" | "direct-answer" | "astrology" | "numerology" | "body" | "space" | "learning";

export type ServiceDefinition = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  subcategory: ServiceSubcategory;
  description: string;
  icon: string;
  image?: string;
  status: ServiceStatus;
  route: string;
  inputType: "question" | "personal-data" | "image" | "none";
  responseType: "wide" | "guidance" | "direct" | "calculation" | "analysis" | "reference";
  method?: "tarot" | "runes" | "iching" | "numerology" | "angels";
};

export const services: ServiceDefinition[] = [
  {id:"rider-waite",slug:"rider-waite",name:"Tarot",category:"oracle",subcategory:"wide-answer",description:"Arquetipos, contexto y desarrollo de la consulta.",icon:"✧",image:"/cards/rws/00-fool.jpg",status:"AVAILABLE",route:"/#/consulta",inputType:"question",responseType:"wide",method:"tarot"},
  {id:"tarot-zen",slug:"tarot-zen",name:"Tarot Zen",category:"oracle",subcategory:"wide-answer",description:"Una mirada contemplativa sobre el momento presente.",icon:"◉",image:"/oracles/zen-oraculo/cards/zen-01.jpg",status:"COMING_SOON",route:"/#/oraculos",inputType:"question",responseType:"wide"},
  {id:"iching",slug:"i-ching",name:"I Ching",category:"oracle",subcategory:"wide-answer",description:"Cambio, equilibrio y evolución de la situación.",icon:"☰",image:"/oracles/iching-balance.png",status:"AVAILABLE",route:"/#/consulta",inputType:"question",responseType:"wide",method:"iching"},
  {id:"runes",slug:"runas",name:"Runas",category:"oracle",subcategory:"wide-answer",description:"Dirección, movimiento y fuerzas presentes.",icon:"ᛉ",image:"/oracles/rune-token-wood-v3.png",status:"AVAILABLE",route:"/#/consulta",inputType:"question",responseType:"wide",method:"runes"},
  {id:"angels",slug:"angeles",name:"Ángeles",category:"oracle",subcategory:"guidance",description:"Mensaje simbólico y reflexión relacionada con la consulta.",icon:"✦",image:"/oracles/angels/angel-01.webp",status:"AVAILABLE",route:"/#/consulta",inputType:"question",responseType:"guidance",method:"angels"},
  {id:"power-animals",slug:"animales-de-poder",name:"Animales de Poder",category:"oracle",subcategory:"guidance",description:"Cualidades y símbolos para orientar la reflexión.",icon:"◇",image:"/oracles/animals/animal-01.webp",status:"COMING_SOON",route:"/#/oraculos",inputType:"question",responseType:"guidance"},
  {id:"kabbalah",slug:"kabbalah",name:"Kabbalah",category:"oracle",subcategory:"guidance",description:"Correspondencias y estructuras de contemplación.",icon:"☷",status:"COMING_SOON",route:"/#/oraculos",inputType:"question",responseType:"guidance"},
  {id:"pendulum",slug:"radiestesia",name:"Radiestesia / Péndulo",category:"oracle",subcategory:"direct-answer",description:"Tablero para preguntas concretas y respuestas graduadas.",icon:"⌖",image:"/oracles/pendulum/silver-witness-pendulum-held.jpg",status:"COMING_SOON",route:"/#/oraculos",inputType:"question",responseType:"direct"},
  {id:"chamalongos",slug:"chamalongos",name:"Chamalongos",category:"oracle",subcategory:"direct-answer",description:"Respuesta breve según la configuración de las piezas.",icon:"◌",status:"COMING_SOON",route:"/#/oraculos",inputType:"question",responseType:"direct"},

  {id:"natal-chart",slug:"carta-natal",name:"Carta natal",category:"calculation",subcategory:"astrology",description:"Mapa del cielo para fecha, hora y lugar de nacimiento.",icon:"◉",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},
  {id:"solar-return",slug:"revolucion-solar",name:"Revolución solar",category:"calculation",subcategory:"astrology",description:"Temas del ciclo anual a partir del retorno solar.",icon:"☀",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},
  {id:"compatibility",slug:"compatibilidad",name:"Compatibilidad",category:"calculation",subcategory:"astrology",description:"Comparación estructurada entre dos cartas.",icon:"∞",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},
  {id:"transits",slug:"transitos",name:"Tránsitos",category:"calculation",subcategory:"astrology",description:"Relación entre el cielo actual y la carta natal.",icon:"☍",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},
  {id:"pythagorean",slug:"pitagorica",name:"Pitagórica",category:"calculation",subcategory:"numerology",description:"Camino de vida, expresión, alma y año personal.",icon:"#",status:"AVAILABLE",route:"/#/consulta",inputType:"personal-data",responseType:"calculation",method:"numerology"},
  {id:"kabbalistic-numerology",slug:"cabalistica",name:"Cabalística",category:"calculation",subcategory:"numerology",description:"Arquitectura preparada para el cálculo cabalístico.",icon:"א",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},
  {id:"name-numerology",slug:"numerologia-del-nombre",name:"Numerología del nombre",category:"calculation",subcategory:"numerology",description:"Análisis específico de letras y nombre de uso.",icon:"A",status:"COMING_SOON",route:"/#/calculos",inputType:"personal-data",responseType:"calculation"},

  {id:"palmistry",slug:"quiromancia",name:"Quiromancia",category:"image-reading",subcategory:"body",description:"Lectura futura mediante fotografías de las manos.",icon:"✋",status:"COMING_SOON",route:"/#/lecturas-imagen",inputType:"image",responseType:"analysis"},
  {id:"physiognomy",slug:"fisonomia",name:"Fisonomía",category:"image-reading",subcategory:"body",description:"Lectura futura mediante una fotografía del rostro.",icon:"◯",status:"COMING_SOON",route:"/#/lecturas-imagen",inputType:"image",responseType:"analysis"},
  {id:"aura",slug:"energia-aura",name:"Energía / Aura",category:"image-reading",subcategory:"body",description:"Estructura futura para fotografía y contexto personal.",icon:"✦",status:"COMING_SOON",route:"/#/lecturas-imagen",inputType:"image",responseType:"analysis"},
  {id:"feng-shui",slug:"feng-shui",name:"Feng Shui",category:"image-reading",subcategory:"space",description:"Fotografías del espacio acompañadas de información contextual.",icon:"☯",status:"COMING_SOON",route:"/#/lecturas-imagen",inputType:"image",responseType:"analysis"},
];

export const serviceGroups = {
  "wide-answer": {title:"Respuesta amplia", description:"Para preguntas que requieren contexto, interpretación y desarrollo."},
  guidance: {title:"Orientación / mensaje", description:"Para recibir una sugerencia, reflexión o símbolo relacionado con la consulta."},
  "direct-answer": {title:"Respuesta directa", description:"Para preguntas concretas que buscan una respuesta breve."},
  astrology: {title:"Astrología", description:"Arquitectura preparada para cálculos basados en datos natales."},
  numerology: {title:"Numerología", description:"Patrones calculados a partir del nombre y la fecha."},
} as const;

export const systemCategories = [
  {
    title: "ORÁCULOS",
    description: "Arquetipos, mensajes simbólicos y dirección de cambios.",
    systems: [
      ["Tarot", "Disponible"],
      ["Tarot Zen", "Disponible"],
      ["Ángeles", "Disponible"],
      ["Animales de Poder", "Disponible"],
      ["Runas", "Disponible"],
      ["I Ching", "Disponible"],
      ["Radiestesia", "Próximamente"],
      ["Chamalongos", "Próximamente"],
    ],
  },
  {
    title: "ASTROS",
    description: "Cálculos basados en datos de nacimiento y fechas.",
    systems: [
      ["Astrología Occidental", "Disponible"],
      ["Astrología Oriental", "Disponible"],
      ["Numerología", "Disponible"],
      ["Eneagramas", "Próximamente"],
    ],
  },
  {
    title: "INTERPRETACIÓN",
    description: "Lecturas de imágenes corporales y espacios.",
    systems: [
      ["Quiromancia", "Próximamente"],
      ["Fisonomía", "Próximamente"],
      ["Energía / Aura", "Próximamente"],
      ["Feng Shui", "Próximamente"],
    ],
  },
  {
    title: "SONIDOS DEL ALMA",
    description: "Vibración, resonancia y transformación a través del sonido.",
    systems: [
      ["Cuencos", "Próximamente"],
      ["Frecuencias sanadoras", "Próximamente"],
      ["Meditaciones", "Próximamente"],
    ],
  },
  {
    title: "CITAS",
    description: "Encuentros especiales con maestras y guías.",
    systems: [
      ["Cita con Madame Meraki", "Próximamente"],
    ],
  },
] as const;

export const librarySystems = systemCategories.flatMap(cat => cat.systems) as const;

export const librarySites = [
  {slug:"tarot",name:"Tarot Rider–Waite–Smith",shortName:"Tarot",icon:"✧",description:"Arquetipos, símbolos y las 78 cartas de la baraja Rider–Waite–Smith.",image:"/cards/rws/00-fool.jpg",route:"/#/biblioteca/tarot"},
  {slug:"tarot-zen",name:"Tarot Zen ORÁCULO",shortName:"Tarot Zen",icon:"◉",description:"Baraja contemplativa original de 79 cartas organizada por conciencia y cuatro familias.",image:"/oracles/zen-oraculo/cards/zen-01.jpg",route:"/#/biblioteca/tarot-zen"},
  {slug:"angeles",name:"Mensajes de los Ángeles",shortName:"Ángeles",icon:"✦",description:"Colección ilustrada de 44 mensajes, atributos y tradiciones de referencia.",image:"/oracles/angels/angel-01.webp",route:"/#/biblioteca/angeles"},
  {slug:"animales-de-poder",name:"Animales de Poder",shortName:"Animales de Poder",icon:"◇",description:"Cuarenta y cuatro animales con cualidades, símbolos y mensajes reflexivos.",image:"/oracles/animals/animal-01.webp",route:"/#/biblioteca/animales-de-poder"},
  {slug:"runas",name:"Runas Elder Futhark",shortName:"Runas",icon:"ᛉ",description:"Las 24 runas presentadas como fichas de madera tallada.",image:"/oracles/rune-token-wood-v3.png",route:"/#/biblioteca/runas"},
  {slug:"i-ching",name:"I Ching",shortName:"I Ching",icon:"☰",description:"Los 64 hexagramas y sus estructuras tradicionales de líneas yin y yang.",image:"/oracles/iching-balance.png",route:"/#/biblioteca/i-ching"},
  {slug:"radiestesia",name:"Radiestesia",shortName:"Radiestesia",icon:"⌖",description:"Péndulo de plata con testigo y tablero graduado para la práctica simbólica.",image:"/oracles/pendulum/silver-witness-pendulum-held.jpg",route:"/#/biblioteca/radiestesia"},
  {slug:"chamalongos",name:"Chamalongos",shortName:"Chamalongos",icon:"◌",description:"Referencia cultural de configuraciones con coco y caracoles tigre.",image:"/oracles/chamalongos/tiger-cowrie-up.webp",route:"/#/biblioteca/chamalongos"},
  {slug:"kabbalah",name:"Kabbalah",shortName:"Kabbalah",icon:"☷",description:"Los 72 tripletes, el Árbol de la Vida y sus 22 senderos.",route:"/#/biblioteca/kabbalah"},
] as const;
