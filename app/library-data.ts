const majorNames = [
  "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador", "El Hierofante",
  "Los Enamorados", "El Carro", "La Fuerza", "El Ermitaño", "La Rueda de la Fortuna", "La Justicia",
  "El Colgado", "La Muerte", "La Templanza", "El Diablo", "La Torre", "La Estrella", "La Luna",
  "El Sol", "El Juicio", "El Mundo",
];

const existingMajorImages: Record<number, string> = {
  0: "00-fool.jpg", 1: "01-magician.jpg", 2: "02-priestess.jpg", 6: "06-lovers.jpg",
  9: "09-hermit.jpg", 10: "10-wheel.jpg", 13: "13-death.jpg", 14: "14-temperance.jpg", 17: "17-star.jpg",
};

const ranks = ["As", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez", "Sota", "Caballero", "Reina", "Rey"];
const suits = [
  { name: "Bastos", slug: "wands" },
  { name: "Copas", slug: "cups" },
  { name: "Espadas", slug: "swords" },
  { name: "Oros", slug: "pentacles" },
];

export const tarotCatalog = [
  ...majorNames.map((name, number) => {
    const padded = String(number).padStart(2, "0");
    return {
      id: padded,
      name,
      arcana: "Arcano Mayor",
      suit: null,
      number,
      image: `/cards/rws/${existingMajorImages[number] ?? `major-${padded}.jpg`}`,
    };
  }),
  ...suits.flatMap((suit) => ranks.map((rank, index) => {
    const number = index + 1;
    const padded = String(number).padStart(2, "0");
    const id = suit.slug === "swords" && number === 1 ? "sw-ace"
      : suit.slug === "cups" && number === 2 ? "cu-2"
      : suit.slug === "pentacles" && number === 8 ? "pe-8"
      : `${suit.slug}-${padded}`;
    return {
      id,
      name: `${rank} de ${suit.name}`,
      arcana: "Arcano Menor",
      suit: suit.name,
      number,
      image: `/cards/rws/${suit.slug}-${padded}.jpg`,
    };
  })),
];

export const runeCatalog = [
  ["Fehu", "ᚠ"], ["Uruz", "ᚢ"], ["Thurisaz", "ᚦ"], ["Ansuz", "ᚨ"],
  ["Raidho", "ᚱ"], ["Kenaz", "ᚲ"], ["Gebo", "ᚷ"], ["Wunjo", "ᚹ"],
  ["Hagalaz", "ᚺ"], ["Nauthiz", "ᚾ"], ["Isa", "ᛁ"], ["Jera", "ᛃ"],
  ["Eihwaz", "ᛇ"], ["Perthro", "ᛈ"], ["Algiz", "ᛉ"], ["Sowilo", "ᛋ"],
  ["Tiwaz", "ᛏ"], ["Berkano", "ᛒ"], ["Ehwaz", "ᛖ"], ["Mannaz", "ᛗ"],
  ["Laguz", "ᛚ"], ["Ingwaz", "ᛜ"], ["Dagaz", "ᛞ"], ["Othala", "ᛟ"],
].map(([name, symbol]) => ({ name, symbol }));

const angelFamilies = [
  {
    family: "Arcángeles y tradición oriental",
    cards: [
      ["Arcángel Miguel", "Protección y valor", "Defiende lo esencial con firmeza, sin permitir que el miedo elija por ti.", "Espada y escudo", ["protección", "coraje"], "Tradición bíblica y cristiana"],
      ["Arcángel Gabriel", "Mensaje y comunicación", "Expresa con claridad lo que necesita ser escuchado y confirma que tu mensaje fue comprendido.", "Lirio y trompeta", ["mensaje", "claridad"], "Tradición bíblica, cristiana e islámica"],
      ["Arcángel Rafael", "Sanación y viaje", "Cuida el proceso de recuperación y acepta compañía competente durante el camino.", "Bastón y luz verde", ["sanación", "acompañamiento"], "Libro de Tobit y tradición cristiana"],
      ["Arcángel Uriel", "Sabiduría y luz", "Ilumina la situación con conocimiento antes de convertir una impresión en decisión.", "Libro y llama", ["sabiduría", "discernimiento"], "Tradición apócrifa y cristiana oriental"],
      ["Arcángel Raguel", "Justicia y armonía", "Busca un acuerdo justo que repare el equilibrio sin ocultar el conflicto.", "Balanza", ["justicia", "armonía"], "Tradición enoquiana"],
      ["Arcángel Sariel", "Conocimiento y orientación", "Observa el ciclo completo antes de juzgar un momento aislado.", "Luna y pergamino", ["conocimiento", "ciclos"], "Tradición enoquiana y apócrifa"],
      ["Arcángel Jeremiel", "Revisión y esperanza", "Mira lo vivido con honestidad para elegir qué aprendizaje llevar contigo.", "Espejo", ["revisión", "esperanza"], "Tradición apócrifa y cristiana oriental"],
      ["Arcángel Selaphiel", "Oración y recogimiento", "Reduce el ruido y formula con sinceridad aquello que necesitas pedir o comprender.", "Incensario", ["oración", "presencia"], "Tradición cristiana oriental"],
      ["Arcángel Jegudiel", "Esfuerzo y responsabilidad", "Honra tu trabajo mediante una acción bien hecha, no solamente mediante intención.", "Corona y bastón", ["esfuerzo", "responsabilidad"], "Tradición cristiana oriental"],
      ["Arcángel Barachiel", "Bendición y gratitud", "Reconoce lo que ya sostiene tu vida y compártelo de manera responsable.", "Rosas blancas", ["bendición", "gratitud"], "Tradición cristiana oriental"],
      ["Metatrón", "Orden y registro", "Organiza ideas, tiempos y compromisos hasta volver visible el patrón esencial.", "Geometría y escritura", ["orden", "integración"], "Mística judía posterior"],
    ],
  },
  {
    family: "Angelología mística posterior",
    cards: [
      ["Sandalphon", "Oración y música", "Convierte tu intención en una práctica concreta y permite que el ritmo sostenga el proceso.", "Música y tierra", ["oración", "arraigo"], "Mística judía posterior"],
      ["Raziel", "Misterio y conocimiento", "Estudia lo que no comprendes sin apresurarte a llenar los vacíos con fantasía.", "Libro y arcoíris", ["misterio", "estudio"], "Angelología medieval y mística judía"],
      ["Jophiel", "Belleza y sabiduría", "Ordena tu entorno y tus pensamientos para distinguir lo bello de lo meramente atractivo.", "Luz dorada y flores", ["belleza", "sabiduría"], "Angelología cristiana posterior"],
      ["Chamuel", "Paz y reconciliación", "Acércate al vínculo desde el respeto propio y la voluntad real de escuchar.", "Corazón y rosas", ["paz", "reconciliación"], "Devoción cristiana posterior"],
      ["Zadkiel", "Misericordia y perdón", "Suelta el peso que puedas soltar sin negar lo ocurrido ni abandonar tus límites.", "Copa y luz violeta", ["misericordia", "perdón"], "Mística judía y angelología posterior"],
      ["Haniel", "Gracia y alegría", "Permite que el bienestar sencillo tenga lugar sin exigir una razón extraordinaria.", "Luna y rosa plateada", ["gracia", "alegría"], "Angelología medieval y posterior"],
      ["Ariel", "Naturaleza y valentía", "Recupera fuerza mediante el cuerpo, la tierra y una acción valiente pero proporcionada.", "León y paisaje", ["naturaleza", "valor"], "Mística judía y angelología posterior"],
      ["Azrael", "Transición y consuelo", "Acompaña el cierre con compasión; terminar una etapa también requiere cuidado.", "Umbral", ["transición", "consuelo"], "Tradición islámica y folclore posterior"],
      ["Cassiel", "Tiempo y paciencia", "Acepta el ritmo real del proceso y utiliza la espera para prepararte.", "Reloj de arena", ["tiempo", "paciencia"], "Angelología medieval"],
      ["Anael", "Armonía y afecto", "Cultiva una relación donde el afecto y la dignidad puedan coexistir.", "Rosa cobriza", ["armonía", "afecto"], "Angelología medieval"],
      ["Sachiel", "Expansión y generosidad", "Administra la abundancia con criterio y deja que beneficie a más de una persona.", "Cornucopia", ["expansión", "generosidad"], "Angelología medieval"],
    ],
  },
  {
    family: "Tradiciones apócrifas y devocionales",
    cards: [
      ["Phanuel", "Esperanza y retorno", "Vuelve a aquello que te orienta y repara con hechos lo que todavía sea reparable.", "Linterna", ["esperanza", "retorno"], "Tradición enoquiana"],
      ["Ramiel", "Visión y expectativa", "Observa el horizonte sin abandonar las necesidades concretas del presente.", "Estrellas y pergamino", ["visión", "perspectiva"], "Tradición apócrifa"],
      ["Zaphkiel", "Contemplación y comprensión", "Permanece con la pregunta hasta que aparezca una comprensión más profunda.", "Vasija y agua", ["contemplación", "comprensión"], "Mística judía posterior"],
      ["Yahoel", "Presencia y consagración", "Trata este momento como algo digno de atención completa.", "Fuego e incienso", ["presencia", "dedicación"], "Apocalipsis de Abraham y tradición mística"],
      ["Radueriel", "Música y expresión", "Da forma audible o visible a lo que todavía vive sólo dentro de ti.", "Partitura y pluma", ["expresión", "creatividad"], "Tradición rabínica y mística"],
      ["Dumah", "Silencio y aceptación", "No fuerces palabras donde el silencio puede sostener una verdad difícil.", "Libro cerrado", ["silencio", "aceptación"], "Tradición judía y folclore posterior"],
      ["Lailah", "Noche y descanso", "Protege tu descanso; la mente fatigada convierte incertidumbre en amenaza.", "Velo estrellado", ["descanso", "protección"], "Tradición rabínica y folclore judío"],
      ["Nuriel", "Fuego y protección", "Usa tu intensidad para iluminar y proteger, no para reaccionar sin medida.", "Fuego y cristal", ["fuego", "protección"], "Tradición judía y mística"],
      ["Peliel", "Coraje moral", "Sostén lo correcto incluso cuando no produzca reconocimiento inmediato.", "Estandarte", ["coraje", "integridad"], "Angelología devocional posterior"],
      ["Puriel", "Purificación y revisión", "Limpia hábitos y compromisos que ya no son coherentes con tu dirección.", "Agua y cuenco", ["purificación", "revisión"], "Tradición apócrifa y mística"],
      ["Muriel", "Naturaleza y sensibilidad", "Escucha tu sensibilidad sin permitir que absorba todo lo que ocurre alrededor.", "Flores y agua", ["sensibilidad", "naturaleza"], "Angelología occidental posterior"],
    ],
  },
  {
    family: "Ángeles del Shem HaMephorash",
    cards: [
      ["Vehuiah", "Voluntad e inicio", "Convierte la intención en un primer paso claro y realizable.", "Llama inicial", ["voluntad", "inicio"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Jeliel", "Unión y reconciliación", "Busca el punto donde dos necesidades legítimas puedan encontrarse.", "Dos corrientes y palomas", ["unión", "reconciliación"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Sitael", "Construcción y refugio", "Fortalece la estructura antes de ampliar el proyecto.", "Arco de piedra", ["construcción", "seguridad"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Elemiah", "Dirección y descubrimiento", "Revisa el rumbo y corrige temprano cualquier desviación.", "Navío celeste", ["dirección", "descubrimiento"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Mahasiah", "Aprendizaje y reparación", "Corrige con paciencia y permite que el error se convierta en conocimiento.", "Manuscrito restaurado", ["aprendizaje", "reparación"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Lelahel", "Luz y creatividad", "Haz visible tu capacidad mediante una obra concreta.", "Disco solar", ["luz", "creatividad"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Achaiah", "Paciencia y comprensión", "Investiga lo pequeño; ahí puede estar la pieza que falta.", "Semilla y reloj", ["paciencia", "investigación"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Cahetel", "Gratitud y cosecha", "Reconoce lo recibido y cuida las condiciones que lo hicieron posible.", "Grano y campos", ["gratitud", "cosecha"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Haziel", "Misericordia y confianza", "Ofrece una oportunidad de reparación sin abandonar el criterio.", "Cadenas abiertas", ["misericordia", "confianza"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Aladiah", "Recuperación y equilibrio", "Atiéndete pronto y vuelve gradualmente a un ritmo sostenible.", "Cuenco sanador", ["recuperación", "equilibrio"], "Shem HaMephorash, tradición cabalística occidental"],
      ["Lauviah", "Sueño y revelación", "Registra lo que emerge del sueño y evalúalo con serenidad al despertar.", "Constelaciones y arpa", ["sueño", "revelación"], "Shem HaMephorash, tradición cabalística occidental"],
    ],
  },
] as const;

export const angelCatalog = angelFamilies.flatMap((group, familyIndex) => group.cards.map((card, cardIndex) => ({
  id: `angel-${String(familyIndex * 11 + cardIndex + 1).padStart(2, "0")}`,
  name: card[0],
  role: card[1],
  message: card[2],
  attribute: card[3],
  keys: [...card[4]],
  tradition: card[5],
  family: group.family,
  image: `/oracles/angels/angel-${String(familyIndex * 11 + cardIndex + 1).padStart(2, "0")}.webp`,
})));

const hexagramNames = [
  "Lo Creativo", "Lo Receptivo", "La Dificultad Inicial", "La Necedad Juvenil", "La Espera", "El Conflicto",
  "El Ejército", "La Solidaridad", "La Fuerza Domesticadora de lo Pequeño", "El Porte", "La Paz", "El Estancamiento",
  "Comunidad con los Hombres", "La Posesión de lo Grande", "La Modestia", "El Entusiasmo", "El Seguimiento",
  "El Trabajo en lo Echado a Perder", "El Acercamiento", "La Contemplación", "La Mordedura Tajante", "La Gracia",
  "La Desintegración", "El Retorno", "La Inocencia", "La Fuerza Domesticadora de lo Grande", "Las Comisuras de la Boca",
  "La Preponderancia de lo Grande", "Lo Abismal", "Lo Adherente", "El Influjo", "La Duración", "La Retirada",
  "El Poder de lo Grande", "El Progreso", "El Oscurecimiento de la Luz", "El Clan", "La Oposición", "El Impedimento",
  "La Liberación", "La Merma", "El Aumento", "El Desbordamiento", "Ir al Encuentro", "La Reunión", "La Subida",
  "La Desazón", "El Pozo", "La Revolución", "El Caldero", "Lo Suscitativo", "El Aquietamiento", "La Evolución",
  "La Muchacha que se Casa", "La Plenitud", "El Andariego", "Lo Suave", "Lo Sereno", "La Disolución",
  "La Restricción", "La Verdad Interior", "La Preponderancia de lo Pequeño", "Después de la Consumación", "Antes de la Consumación",
];

// Secuencia del Rey Wen. Cada patrón está ordenado de la línea superior a la inferior;
// 1 representa una línea yang continua y 0 una línea yin partida.
const kingWenPatterns = [
  "111111", "000000", "010001", "100010", "010111", "111010", "000010", "010000",
  "110111", "111011", "000111", "111000", "111101", "101111", "000100", "001000",
  "011001", "100110", "000011", "110000", "101001", "100101", "100000", "000001",
  "111001", "100111", "100001", "011110", "010010", "101101", "011100", "001110",
  "111100", "001111", "101000", "000101", "110101", "101011", "010100", "001010",
  "100011", "110001", "011111", "111110", "011000", "000110", "011010", "010110",
  "011101", "101110", "001001", "100100", "110100", "001011", "001101", "101100",
  "110110", "011011", "110010", "010011", "110011", "001100", "010101", "101010",
];

export const ichingCatalog = hexagramNames.map((name, index) => ({
  number: index + 1,
  symbol: String.fromCodePoint(0x4dc0 + index),
  pattern: kingWenPatterns[index],
  name,
}));
