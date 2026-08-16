import type { Language } from "./translations";
import type { DisciplineLibraryItem } from "./components/DisciplineLibrary";

type Localized=Record<Language,string>;
type AstroEntry={id:string;symbol:string;name:Localized;meaning:Localized};
const l=(ES:string,EN:string,FR:string,DE:string,PT:string):Localized=>({ES,EN,FR,DE,PT});

const categories={
  zodiac:l("Signos zodiacales","Zodiac signs","Signes du zodiaque","Tierkreiszeichen","Signos zodiacais"),
  planets:l("Planetas y luminarias","Planets and luminaries","Planètes et luminaires","Planeten und Lichter","Planetas e luminares"),
  houses:l("Casas astrológicas","Astrological houses","Maisons astrologiques","Astrologische Häuser","Casas astrológicas"),
  aspects:l("Aspectos principales","Major aspects","Aspects majeurs","Hauptaspekte","Aspectos principais"),
  animals:l("Doce animales","Twelve animals","Douze animaux","Zwölf Tiere","Doze animais"),
  elements:l("Cinco elementos","Five elements","Cinq éléments","Fünf Elemente","Cinco elementos"),
  polarity:l("Polaridad","Polarity","Polarité","Polarität","Polaridade"),
};

const zodiac:AstroEntry[]=[
  {id:"aries",symbol:"♈",name:l("Aries","Aries","Bélier","Widder","Áries"),meaning:l("Inicio, impulso, valentía y afirmación del yo.","Beginnings, drive, courage, and self-assertion.","Commencement, élan, courage et affirmation de soi.","Anfang, Antrieb, Mut und Selbstbehauptung.","Início, impulso, coragem e afirmação do eu.")},
  {id:"taurus",symbol:"♉",name:l("Tauro","Taurus","Taureau","Stier","Touro"),meaning:l("Estabilidad, cuerpo, valores, recursos y permanencia.","Stability, embodiment, values, resources, and continuity.","Stabilité, corps, valeurs, ressources et continuité.","Stabilität, Körper, Werte, Ressourcen und Beständigkeit.","Estabilidade, corpo, valores, recursos e permanência.")},
  {id:"gemini",symbol:"♊",name:l("Géminis","Gemini","Gémeaux","Zwillinge","Gêmeos"),meaning:l("Curiosidad, lenguaje, intercambio y conexiones mentales.","Curiosity, language, exchange, and mental connections.","Curiosité, langage, échange et connexions mentales.","Neugier, Sprache, Austausch und geistige Verbindungen.","Curiosidade, linguagem, troca e conexões mentais.")},
  {id:"cancer",symbol:"♋",name:l("Cáncer","Cancer","Cancer","Krebs","Câncer"),meaning:l("Pertenencia, memoria, protección y nutrición emocional.","Belonging, memory, protection, and emotional nourishment.","Appartenance, mémoire, protection et nourriture émotionnelle.","Zugehörigkeit, Erinnerung, Schutz und emotionale Nahrung.","Pertencimento, memória, proteção e nutrição emocional.")},
  {id:"leo",symbol:"♌",name:l("Leo","Leo","Lion","Löwe","Leão"),meaning:l("Creatividad, expresión, identidad y brillo personal.","Creativity, expression, identity, and personal radiance.","Créativité, expression, identité et rayonnement personnel.","Kreativität, Ausdruck, Identität und persönliche Strahlkraft.","Criatividade, expressão, identidade e brilho pessoal.")},
  {id:"virgo",symbol:"♍",name:l("Virgo","Virgo","Vierge","Jungfrau","Virgem"),meaning:l("Discernimiento, método, servicio y mejora práctica.","Discernment, method, service, and practical refinement.","Discernement, méthode, service et amélioration pratique.","Unterscheidung, Methode, Dienst und praktische Verfeinerung.","Discernimento, método, serviço e aperfeiçoamento prático.")},
  {id:"libra",symbol:"♎",name:l("Libra","Libra","Balance","Waage","Libra"),meaning:l("Equilibrio, vínculo, negociación y sentido de justicia.","Balance, relationship, negotiation, and a sense of justice.","Équilibre, relation, négociation et sens de la justice.","Balance, Beziehung, Verhandlung und Gerechtigkeitssinn.","Equilíbrio, vínculo, negociação e senso de justiça.")},
  {id:"scorpio",symbol:"♏",name:l("Escorpio","Scorpio","Scorpion","Skorpion","Escorpião"),meaning:l("Intensidad, intimidad, poder y transformación profunda.","Intensity, intimacy, power, and profound transformation.","Intensité, intimité, pouvoir et transformation profonde.","Intensität, Intimität, Macht und tiefe Wandlung.","Intensidade, intimidade, poder e transformação profunda.")},
  {id:"sagittarius",symbol:"♐",name:l("Sagitario","Sagittarius","Sagittaire","Schütze","Sagitário"),meaning:l("Expansión, búsqueda de sentido, visión y aventura.","Expansion, search for meaning, vision, and adventure.","Expansion, quête de sens, vision et aventure.","Expansion, Sinnsuche, Vision und Abenteuer.","Expansão, busca de sentido, visão e aventura.")},
  {id:"capricorn",symbol:"♑",name:l("Capricornio","Capricorn","Capricorne","Steinbock","Capricórnio"),meaning:l("Estructura, responsabilidad, ambición y dominio del tiempo.","Structure, responsibility, ambition, and mastery of time.","Structure, responsabilité, ambition et maîtrise du temps.","Struktur, Verantwortung, Ehrgeiz und Meisterschaft der Zeit.","Estrutura, responsabilidade, ambição e domínio do tempo.")},
  {id:"aquarius",symbol:"♒",name:l("Acuario","Aquarius","Verseau","Wassermann","Aquário"),meaning:l("Innovación, comunidad, libertad y visión de futuro.","Innovation, community, freedom, and future vision.","Innovation, communauté, liberté et vision de l’avenir.","Innovation, Gemeinschaft, Freiheit und Zukunftsvision.","Inovação, comunidade, liberdade e visão de futuro.")},
  {id:"pisces",symbol:"♓",name:l("Piscis","Pisces","Poissons","Fische","Peixes"),meaning:l("Sensibilidad, imaginación, entrega y conciencia de unidad.","Sensitivity, imagination, surrender, and awareness of unity.","Sensibilité, imagination, abandon et conscience de l’unité.","Sensibilität, Vorstellungskraft, Hingabe und Einheitsbewusstsein.","Sensibilidade, imaginação, entrega e consciência de unidade.")},
];

const planets:AstroEntry[]=[
  {id:"sun",symbol:"☉",name:l("Sol","Sun","Soleil","Sonne","Sol"),meaning:l("Centro consciente, vitalidad, propósito e identidad.","Conscious center, vitality, purpose, and identity.","Centre conscient, vitalité, but et identité.","Bewusstes Zentrum, Vitalität, Zweck und Identität.","Centro consciente, vitalidade, propósito e identidade.")},
  {id:"moon",symbol:"☽",name:l("Luna","Moon","Lune","Mond","Lua"),meaning:l("Necesidades emocionales, memoria, hábitos y seguridad.","Emotional needs, memory, habits, and security.","Besoins émotionnels, mémoire, habitudes et sécurité.","Emotionale Bedürfnisse, Erinnerung, Gewohnheiten und Sicherheit.","Necessidades emocionais, memória, hábitos e segurança.")},
  {id:"mercury",symbol:"☿",name:l("Mercurio","Mercury","Mercure","Merkur","Mercúrio"),meaning:l("Pensamiento, lenguaje, aprendizaje e intercambio.","Thought, language, learning, and exchange.","Pensée, langage, apprentissage et échange.","Denken, Sprache, Lernen und Austausch.","Pensamento, linguagem, aprendizagem e troca.")},
  {id:"venus",symbol:"♀",name:l("Venus","Venus","Vénus","Venus","Vênus"),meaning:l("Valores, atracción, placer, estética y manera de vincularse.","Values, attraction, pleasure, aesthetics, and relating.","Valeurs, attraction, plaisir, esthétique et manière de se lier.","Werte, Anziehung, Genuss, Ästhetik und Beziehung.","Valores, atração, prazer, estética e modo de se vincular.")},
  {id:"mars",symbol:"♂",name:l("Marte","Mars","Mars","Mars","Marte"),meaning:l("Deseo, iniciativa, impulso de acción y confrontación.","Desire, initiative, drive to act, and confrontation.","Désir, initiative, impulsion d’action et confrontation.","Verlangen, Initiative, Handlungsdrang und Konfrontation.","Desejo, iniciativa, impulso de ação e confronto.")},
  {id:"jupiter",symbol:"♃",name:l("Júpiter","Jupiter","Jupiter","Jupiter","Júpiter"),meaning:l("Expansión, confianza, sentido, visión y crecimiento.","Expansion, confidence, meaning, vision, and growth.","Expansion, confiance, sens, vision et croissance.","Expansion, Vertrauen, Sinn, Vision und Wachstum.","Expansão, confiança, sentido, visão e crescimento.")},
  {id:"saturn",symbol:"♄",name:l("Saturno","Saturn","Saturne","Saturn","Saturno"),meaning:l("Límite, responsabilidad, maduración y estructura.","Limits, responsibility, maturation, and structure.","Limites, responsabilité, maturation et structure.","Grenzen, Verantwortung, Reifung und Struktur.","Limites, responsabilidade, amadurecimento e estrutura.")},
  {id:"uranus",symbol:"♅",name:l("Urano","Uranus","Uranus","Uranus","Urano"),meaning:l("Ruptura, innovación, despertar y liberación.","Disruption, innovation, awakening, and liberation.","Rupture, innovation, éveil et libération.","Bruch, Innovation, Erwachen und Befreiung.","Ruptura, inovação, despertar e libertação.")},
  {id:"neptune",symbol:"♆",name:l("Neptuno","Neptune","Neptune","Neptun","Netuno"),meaning:l("Imaginación, sensibilidad, ideal, disolución y misterio.","Imagination, sensitivity, ideals, dissolution, and mystery.","Imagination, sensibilité, idéal, dissolution et mystère.","Vorstellungskraft, Sensibilität, Ideal, Auflösung und Mysterium.","Imaginação, sensibilidade, ideal, dissolução e mistério.")},
  {id:"pluto",symbol:"♇",name:l("Plutón","Pluto","Pluton","Pluto","Plutão"),meaning:l("Poder profundo, crisis, depuración y regeneración.","Deep power, crisis, purification, and regeneration.","Pouvoir profond, crise, purification et régénération.","Tiefe Macht, Krise, Reinigung und Regeneration.","Poder profundo, crise, depuração e regeneração.")},
];

const houseThemes=[
  l("Identidad, cuerpo, presencia e iniciativa.","Identity, body, presence, and initiative.","Identité, corps, présence et initiative.","Identität, Körper, Präsenz und Initiative.","Identidade, corpo, presença e iniciativa."),
  l("Recursos, valores, posesiones y autoestima.","Resources, values, possessions, and self-worth.","Ressources, valeurs, possessions et estime de soi.","Ressourcen, Werte, Besitz und Selbstwert.","Recursos, valores, posses e autoestima."),
  l("Comunicación, aprendizaje, entorno y hermanos.","Communication, learning, environment, and siblings.","Communication, apprentissage, entourage et fratrie.","Kommunikation, Lernen, Umfeld und Geschwister.","Comunicação, aprendizagem, ambiente e irmãos."),
  l("Hogar, raíces, familia y mundo emocional privado.","Home, roots, family, and private emotional life.","Foyer, racines, famille et vie émotionnelle privée.","Zuhause, Wurzeln, Familie und privates Gefühlsleben.","Lar, raízes, família e mundo emocional privado."),
  l("Creatividad, placer, romance, hijos y expresión.","Creativity, pleasure, romance, children, and expression.","Créativité, plaisir, romance, enfants et expression.","Kreativität, Freude, Romantik, Kinder und Ausdruck.","Criatividade, prazer, romance, filhos e expressão."),
  l("Rutinas, trabajo cotidiano, cuidado y salud.","Routines, daily work, care, and health.","Routines, travail quotidien, soin et santé.","Routinen, tägliche Arbeit, Fürsorge und Gesundheit.","Rotinas, trabalho cotidiano, cuidado e saúde."),
  l("Pareja, acuerdos, alianzas y proyección.","Partnership, agreements, alliances, and projection.","Partenariat, accords, alliances et projection.","Partnerschaft, Vereinbarungen, Bündnisse und Projektion.","Parceria, acordos, alianças e projeção."),
  l("Intimidad, recursos compartidos, crisis y transformación.","Intimacy, shared resources, crisis, and transformation.","Intimité, ressources partagées, crise et transformation.","Intimität, gemeinsame Ressourcen, Krise und Wandlung.","Intimidade, recursos compartilhados, crise e transformação."),
  l("Creencias, viajes, estudios superiores y visión.","Beliefs, travel, higher learning, and vision.","Croyances, voyages, études supérieures et vision.","Überzeugungen, Reisen, höhere Bildung und Vision.","Crenças, viagens, estudos superiores e visão."),
  l("Vocación, autoridad, reputación y contribución pública.","Vocation, authority, reputation, and public contribution.","Vocation, autorité, réputation et contribution publique.","Berufung, Autorität, Ruf und öffentlicher Beitrag.","Vocação, autoridade, reputação e contribuição pública."),
  l("Comunidad, amistades, redes, ideales y proyectos.","Community, friendships, networks, ideals, and projects.","Communauté, amitiés, réseaux, idéaux et projets.","Gemeinschaft, Freundschaften, Netzwerke, Ideale und Projekte.","Comunidade, amizades, redes, ideais e projetos."),
  l("Inconsciente, retiro, cierre, compasión y trascendencia.","The unconscious, retreat, closure, compassion, and transcendence.","Inconscient, retrait, clôture, compassion et transcendance.","Unbewusstes, Rückzug, Abschluss, Mitgefühl und Transzendenz.","Inconsciente, recolhimento, encerramento, compaixão e transcendência."),
];

const aspects:AstroEntry[]=[
  {id:"conjunction",symbol:"☌",name:l("Conjunción","Conjunction","Conjonction","Konjunktion","Conjunção"),meaning:l("Dos funciones se unen, intensifican y actúan como una sola.","Two functions unite, intensify, and act as one.","Deux fonctions s’unissent, s’intensifient et agissent ensemble.","Zwei Funktionen verbinden und verstärken sich.","Duas funções se unem, intensificam e atuam como uma só.")},
  {id:"sextile",symbol:"⚹",name:l("Sextil","Sextile","Sextile","Sextil","Sextil"),meaning:l("Oportunidad cooperativa que requiere participación consciente.","A cooperative opportunity requiring conscious participation.","Une opportunité coopérative qui demande une participation consciente.","Eine kooperative Chance, die bewusste Beteiligung verlangt.","Oportunidade cooperativa que requer participação consciente.")},
  {id:"square",symbol:"□",name:l("Cuadratura","Square","Carré","Quadrat","Quadratura"),meaning:l("Tensión dinámica que impulsa ajuste, decisión y desarrollo.","Dynamic tension that drives adjustment, decision, and growth.","Tension dynamique qui pousse à l’ajustement et au développement.","Dynamische Spannung, die Anpassung und Entwicklung antreibt.","Tensão dinâmica que impulsiona ajuste, decisão e crescimento.")},
  {id:"trine",symbol:"△",name:l("Trígono","Trine","Trigone","Trigon","Trígono"),meaning:l("Flujo natural de capacidades que conviene activar conscientemente.","A natural flow of abilities best activated consciously.","Un flux naturel de capacités à activer consciemment.","Ein natürlicher Fluss von Fähigkeiten, der bewusst aktiviert werden sollte.","Fluxo natural de capacidades que convém ativar conscientemente.")},
  {id:"opposition",symbol:"☍",name:l("Oposición","Opposition","Opposition","Opposition","Oposição"),meaning:l("Polaridad que pide equilibrio, integración y perspectiva.","A polarity calling for balance, integration, and perspective.","Une polarité qui appelle équilibre, intégration et perspective.","Eine Polarität, die Balance, Integration und Perspektive verlangt.","Polaridade que pede equilíbrio, integração e perspectiva.")},
];

const animals:AstroEntry[]=[
  {id:"rat",symbol:"鼠",name:l("Rata","Rat","Rat","Ratte","Rato"),meaning:l("Ingenio, adaptación, estrategia y capacidad de iniciar ciclos.","Resourcefulness, adaptation, strategy, and cycle initiation.","Ingéniosité, adaptation, stratégie et début des cycles.","Einfallsreichtum, Anpassung, Strategie und Zyklusbeginn.","Engenho, adaptação, estratégia e início de ciclos.")},
  {id:"ox",symbol:"牛",name:l("Buey","Ox","Buffle","Büffel","Boi"),meaning:l("Constancia, paciencia, trabajo y fuerza sostenida.","Consistency, patience, work, and sustained strength.","Constance, patience, travail et force durable.","Beständigkeit, Geduld, Arbeit und ausdauernde Kraft.","Constância, paciência, trabalho e força sustentada.")},
  {id:"tiger",symbol:"虎",name:l("Tigre","Tiger","Tigre","Tiger","Tigre"),meaning:l("Valor, iniciativa, intensidad y respuesta ante el desafío.","Courage, initiative, intensity, and response to challenge.","Courage, initiative, intensité et réponse au défi.","Mut, Initiative, Intensität und Reaktion auf Herausforderungen.","Coragem, iniciativa, intensidade e resposta ao desafio.")},
  {id:"rabbit",symbol:"兔",name:l("Conejo","Rabbit","Lapin","Hase","Coelho"),meaning:l("Diplomacia, sensibilidad, refinamiento y protección.","Diplomacy, sensitivity, refinement, and protection.","Diplomatie, sensibilité, raffinement et protection.","Diplomatie, Sensibilität, Verfeinerung und Schutz.","Diplomacia, sensibilidade, refinamento e proteção.")},
  {id:"dragon",symbol:"龍",name:l("Dragón","Dragon","Dragon","Drache","Dragão"),meaning:l("Presencia, visión, transformación y potencia creadora.","Presence, vision, transformation, and creative power.","Présence, vision, transformation et puissance créatrice.","Präsenz, Vision, Wandlung und schöpferische Kraft.","Presença, visão, transformação e potência criadora.")},
  {id:"snake",symbol:"蛇",name:l("Serpiente","Snake","Serpent","Schlange","Serpente"),meaning:l("Percepción, profundidad, reserva y sabiduría estratégica.","Perception, depth, reserve, and strategic wisdom.","Perception, profondeur, réserve et sagesse stratégique.","Wahrnehmung, Tiefe, Zurückhaltung und strategische Weisheit.","Percepção, profundidade, reserva e sabedoria estratégica.")},
  {id:"horse",symbol:"馬",name:l("Caballo","Horse","Cheval","Pferd","Cavalo"),meaning:l("Movimiento, independencia, entusiasmo y expansión.","Movement, independence, enthusiasm, and expansion.","Mouvement, indépendance, enthousiasme et expansion.","Bewegung, Unabhängigkeit, Begeisterung und Expansion.","Movimento, independência, entusiasmo e expansão.")},
  {id:"goat",symbol:"羊",name:l("Cabra","Goat","Chèvre","Ziege","Cabra"),meaning:l("Sensibilidad, cooperación, belleza y cuidado del grupo.","Sensitivity, cooperation, beauty, and group care.","Sensibilité, coopération, beauté et soin du groupe.","Sensibilität, Zusammenarbeit, Schönheit und Gruppenfürsorge.","Sensibilidade, cooperação, beleza e cuidado do grupo.")},
  {id:"monkey",symbol:"猴",name:l("Mono","Monkey","Singe","Affe","Macaco"),meaning:l("Curiosidad, inventiva, flexibilidad y solución creativa.","Curiosity, inventiveness, flexibility, and creative solutions.","Curiosité, inventivité, souplesse et solution créative.","Neugier, Erfindungskraft, Flexibilität und kreative Lösung.","Curiosidade, inventividade, flexibilidade e solução criativa.")},
  {id:"rooster",symbol:"雞",name:l("Gallo","Rooster","Coq","Hahn","Galo"),meaning:l("Precisión, observación, expresión y sentido del orden.","Precision, observation, expression, and sense of order.","Précision, observation, expression et sens de l’ordre.","Präzision, Beobachtung, Ausdruck und Ordnungssinn.","Precisão, observação, expressão e senso de ordem.")},
  {id:"dog",symbol:"狗",name:l("Perro","Dog","Chien","Hund","Cão"),meaning:l("Lealtad, vigilancia, justicia y protección de vínculos.","Loyalty, vigilance, justice, and protection of bonds.","Loyauté, vigilance, justice et protection des liens.","Treue, Wachsamkeit, Gerechtigkeit und Schutz von Bindungen.","Lealdade, vigilância, justiça e proteção dos vínculos.")},
  {id:"pig",symbol:"豬",name:l("Cerdo","Pig","Cochon","Schwein","Porco"),meaning:l("Generosidad, disfrute, franqueza y capacidad de concluir.","Generosity, enjoyment, frankness, and ability to complete.","Générosité, plaisir, franchise et capacité d’achever.","Großzügigkeit, Genuss, Offenheit und Abschlusskraft.","Generosidade, prazer, franqueza e capacidade de concluir.")},
];

const elements:AstroEntry[]=[
  {id:"wood",symbol:"木",name:l("Madera","Wood","Bois","Holz","Madeira"),meaning:l("Crecimiento, dirección, flexibilidad y expansión orgánica.","Growth, direction, flexibility, and organic expansion.","Croissance, direction, souplesse et expansion organique.","Wachstum, Richtung, Flexibilität und organische Expansion.","Crescimento, direção, flexibilidade e expansão orgânica.")},
  {id:"fire",symbol:"火",name:l("Fuego","Fire","Feu","Feuer","Fogo"),meaning:l("Visibilidad, calor, entusiasmo y transformación activa.","Visibility, warmth, enthusiasm, and active transformation.","Visibilité, chaleur, enthousiasme et transformation active.","Sichtbarkeit, Wärme, Begeisterung und aktive Wandlung.","Visibilidade, calor, entusiasmo e transformação ativa.")},
  {id:"earth",symbol:"土",name:l("Tierra","Earth","Terre","Erde","Terra"),meaning:l("Centro, sustento, integración y estabilidad práctica.","Centering, support, integration, and practical stability.","Centrage, soutien, intégration et stabilité pratique.","Zentrierung, Halt, Integration und praktische Stabilität.","Centro, sustento, integração e estabilidade prática.")},
  {id:"metal",symbol:"金",name:l("Metal","Metal","Métal","Metall","Metal"),meaning:l("Orden, precisión, límites, depuración y valor.","Order, precision, boundaries, refinement, and value.","Ordre, précision, limites, épuration et valeur.","Ordnung, Präzision, Grenzen, Verfeinerung und Wert.","Ordem, precisão, limites, depuração e valor.")},
  {id:"water",symbol:"水",name:l("Agua","Water","Eau","Wasser","Água"),meaning:l("Profundidad, adaptación, intuición y reserva de energía.","Depth, adaptation, intuition, and energy reserves.","Profondeur, adaptation, intuition et réserve d’énergie.","Tiefe, Anpassung, Intuition und Energiereserve.","Profundidade, adaptação, intuição e reserva de energia.")},
];

const polarities:AstroEntry[]=[
  {id:"yin",symbol:"陰",name:l("Yin","Yin","Yin","Yin","Yin"),meaning:l("Cualidad receptiva, interior, concentrada y nutritiva.","Receptive, inward, concentrated, and nourishing quality.","Qualité réceptive, intérieure, concentrée et nourricière.","Empfangende, innere, konzentrierte und nährende Qualität.","Qualidade receptiva, interior, concentrada e nutritiva.")},
  {id:"yang",symbol:"陽",name:l("Yang","Yang","Yang","Yang","Yang"),meaning:l("Cualidad activa, exterior, expansiva y movilizadora.","Active, outward, expansive, and mobilizing quality.","Qualité active, extérieure, expansive et mobilisatrice.","Aktive, äußere, expansive und mobilisierende Qualität.","Qualidade ativa, exterior, expansiva e mobilizadora.")},
];

function medallions(entries:AstroEntry[],lang:Language,category:Localized,tone:"western"|"eastern",image:string,prefix:string):DisciplineLibraryItem[]{return entries.map(entry=>({id:`${prefix}-${entry.id}`,name:entry.name[lang],category:category[lang],description:entry.meaning[lang],symbol:entry.symbol,image,visual:"astro-medallion",tone}))}

export function westernAstroLibrary(lang:Language):DisciplineLibraryItem[]{
  const image="/oracles/astrology/zodiac-medallion-base-v1.webp";
  const houses:AstroEntry[]=houseThemes.map((meaning,index)=>({id:String(index+1),symbol:String(index+1),name:l(`Casa ${index+1}`,`House ${index+1}`,`Maison ${index+1}`,`Haus ${index+1}`,`Casa ${index+1}`),meaning}));
  return[
    ...medallions(zodiac,lang,categories.zodiac,"western",image,"zodiac"),
    ...medallions(planets,lang,categories.planets,"western",image,"planet"),
    ...medallions(houses,lang,categories.houses,"western",image,"house"),
    ...medallions(aspects,lang,categories.aspects,"western",image,"aspect"),
  ];
}

export function easternAstroLibrary(lang:Language):DisciplineLibraryItem[]{
  const image="/oracles/astrology/eastern-medallion-base-v1.webp";
  return[
    ...medallions(animals,lang,categories.animals,"eastern",image,"animal"),
    ...medallions(elements,lang,categories.elements,"eastern",image,"element"),
    ...medallions(polarities,lang,categories.polarity,"eastern",image,"polarity"),
  ];
}
