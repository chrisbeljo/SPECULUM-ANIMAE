"use client";

import { useEffect, useState } from "react";
import type { Language } from "../translations";
import { DisciplineLibrary, type DisciplineLibraryItem } from "./DisciplineLibrary";
import "./astrology-sites.css";
import "./astrology-card-colors.css";

type AstrologyBranch = "western" | "eastern";
type AstrologySiteProps = { branch: AstrologyBranch; lang: Language; onBack: () => void };
type Focus = { symbol: string; title: string; level: string; description: string };
type SiteCopy = { back: string; eyebrow: string; title: string; subtitle: string; introduction: string; choose: string; pending: string; pendingDescription: string; focuses: Focus[] };

const content: Record<Language, Record<AstrologyBranch, SiteCopy>> = {
  ES: {
    western: { back: "Volver al inicio", eyebrow: "CIELO · CICLOS · EXPERIENCIA", title: "Astrología Occidental", subtitle: "Del mapa natal al movimiento del cielo", introduction: "La Carta Natal es el mapa raíz. Los tránsitos observan el presente, la Revolución Solar estudia el ciclo anual y los horóscopos ofrecen una orientación general por signo solar o ascendente.", choose: "Elige el enfoque", pending: "MÓDULO PENDIENTE", pendingDescription: "La interfaz del cálculo y la interpretación se desarrollará en la siguiente etapa.", focuses: [
      { symbol: "◎", title: "Carta Natal", level: "Raíz · Estática", description: "Mapa del cielo al nacer: base psicológica y predictiva del sistema occidental." },
      { symbol: "☍", title: "Tránsitos Astrológicos", level: "Dinámica · Actual", description: "Movimiento planetario actual en relación con la Carta Natal." },
      { symbol: "☀", title: "Revolución Solar", level: "Cíclica · Anual", description: "Carta calculada para el retorno exacto del Sol, de cumpleaños a cumpleaños." },
      { symbol: "✦", title: "Horóscopos", level: "Día · Semana · Mes", description: "Orientaciones generales basadas en el signo solar o el ascendente." },
    ] },
    eastern: { back: "Volver al inicio", eyebrow: "DESTINO · ELEMENTOS · EQUILIBRIO", title: "Astrología Oriental", subtitle: "Estructura natal y cosmología china", introduction: "BaZi —los Cuatro Pilares del Destino— ocupa el lugar estructural de la Carta Natal occidental. Los animales, los cinco elementos y las polaridades Yin/Yang no son categorías aisladas: forman el alfabeto con el que se construyen e interpretan los pilares.", choose: "Elige el enfoque", pending: "MÓDULO PENDIENTE", pendingDescription: "La interfaz del cálculo y la interpretación se desarrollará en la siguiente etapa.", focuses: [
      { symbol: "八", title: "BaZi · Cuatro Pilares", level: "Estructural · Natal", description: "Año, mes, día y hora expresados mediante Troncos Celestes y Ramas Terrestres." },
      { symbol: "陰", title: "Animales, elementos y polaridades", level: "Cosmología base", description: "Doce animales, cinco elementos y Yin/Yang: los bloques fundamentales que componen el BaZi." },
      { symbol: "紫", title: "Zi Wei Dou Shu", level: "Estelar · Destino", description: "Sistema avanzado basado en más de cien estrellas distribuidas en un mapa de doce palacios." },
    ] },
  },
  EN: {
    western: { back: "Back to home", eyebrow: "SKY · CYCLES · EXPERIENCE", title: "Western Astrology", subtitle: "From the natal map to the moving sky", introduction: "The Natal Chart is the root map. Transits observe the present, the Solar Return studies the annual cycle, and horoscopes offer general guidance by sun sign or rising sign.", choose: "Choose a focus", pending: "MODULE PENDING", pendingDescription: "The calculation and interpretation interface will be developed in the next stage.", focuses: [
      { symbol: "◎", title: "Natal Chart", level: "Root · Static", description: "A map of the sky at birth: the psychological and predictive foundation of Western astrology." },
      { symbol: "☍", title: "Astrological Transits", level: "Dynamic · Current", description: "Current planetary movement in relation to the Natal Chart." },
      { symbol: "☀", title: "Solar Return", level: "Cyclical · Annual", description: "A chart calculated for the Sun’s exact return, from birthday to birthday." },
      { symbol: "✦", title: "Horoscopes", level: "Day · Week · Month", description: "General guidance based on the sun sign or rising sign." },
    ] },
    eastern: { back: "Back to home", eyebrow: "DESTINY · ELEMENTS · BALANCE", title: "Eastern Astrology", subtitle: "Natal structure and Chinese cosmology", introduction: "BaZi—the Four Pillars of Destiny—holds the structural place of the Western Natal Chart. Animals, the five elements, and Yin/Yang polarities are not separate categories: they form the alphabet used to build and interpret the pillars.", choose: "Choose a focus", pending: "MODULE PENDING", pendingDescription: "The calculation and interpretation interface will be developed in the next stage.", focuses: [
      { symbol: "八", title: "BaZi · Four Pillars", level: "Structural · Natal", description: "Year, month, day, and hour expressed through Heavenly Stems and Earthly Branches." },
      { symbol: "陰", title: "Animals, elements, and polarities", level: "Core cosmology", description: "Twelve animals, five elements, and Yin/Yang: the fundamental building blocks of BaZi." },
      { symbol: "紫", title: "Zi Wei Dou Shu", level: "Stellar · Destiny", description: "An advanced system using more than one hundred stars across a twelve-palace chart." },
    ] },
  },
  FR: {
    western: { back: "Retour à l’accueil", eyebrow: "CIEL · CYCLES · EXPÉRIENCE", title: "Astrologie Occidentale", subtitle: "De la carte natale au mouvement du ciel", introduction: "La Carte Natale est la carte racine. Les transits observent le présent, la Révolution Solaire étudie le cycle annuel et les horoscopes proposent une orientation générale selon le signe solaire ou l’ascendant.", choose: "Choisissez l’approche", pending: "MODULE EN ATTENTE", pendingDescription: "L’interface de calcul et d’interprétation sera développée lors de la prochaine étape.", focuses: [
      { symbol: "◎", title: "Carte Natale", level: "Racine · Statique", description: "Carte du ciel à la naissance : fondement psychologique et prédictif de l’astrologie occidentale." },
      { symbol: "☍", title: "Transits Astrologiques", level: "Dynamique · Actuel", description: "Mouvement planétaire actuel en relation avec la Carte Natale." },
      { symbol: "☀", title: "Révolution Solaire", level: "Cyclique · Annuel", description: "Carte calculée pour le retour exact du Soleil, d’un anniversaire à l’autre." },
      { symbol: "✦", title: "Horoscopes", level: "Jour · Semaine · Mois", description: "Orientations générales fondées sur le signe solaire ou l’ascendant." },
    ] },
    eastern: { back: "Retour à l’accueil", eyebrow: "DESTIN · ÉLÉMENTS · ÉQUILIBRE", title: "Astrologie Orientale", subtitle: "Structure natale et cosmologie chinoise", introduction: "Le BaZi —les Quatre Piliers du Destin— occupe la place structurelle de la Carte Natale occidentale. Les animaux, les cinq éléments et les polarités Yin/Yang ne sont pas des catégories séparées : ils forment l’alphabet qui compose et interprète les piliers.", choose: "Choisissez l’approche", pending: "MODULE EN ATTENTE", pendingDescription: "L’interface de calcul et d’interprétation sera développée lors de la prochaine étape.", focuses: [
      { symbol: "八", title: "BaZi · Quatre Piliers", level: "Structurel · Natal", description: "Année, mois, jour et heure exprimés par les Troncs Célestes et les Branches Terrestres." },
      { symbol: "陰", title: "Animaux, éléments et polarités", level: "Cosmologie fondamentale", description: "Douze animaux, cinq éléments et Yin/Yang : les composants fondamentaux du BaZi." },
      { symbol: "紫", title: "Zi Wei Dou Shu", level: "Stellaire · Destin", description: "Système avancé fondé sur plus de cent étoiles dans une carte de douze palais." },
    ] },
  },
  DE: {
    western: { back: "Zurück zum Anfang", eyebrow: "HIMMEL · ZYKLEN · ERFAHRUNG", title: "Westliche Astrologie", subtitle: "Von der Geburtskarte zum bewegten Himmel", introduction: "Die Geburtskarte ist die Wurzelkarte. Transite betrachten die Gegenwart, die Solarrevolution untersucht den Jahreszyklus und Horoskope bieten allgemeine Orientierung nach Sonnenzeichen oder Aszendent.", choose: "Schwerpunkt wählen", pending: "MODUL AUSSTEHEND", pendingDescription: "Die Oberfläche für Berechnung und Deutung wird in der nächsten Phase entwickelt.", focuses: [
      { symbol: "◎", title: "Geburtskarte", level: "Wurzel · Statisch", description: "Karte des Himmels bei der Geburt: psychologische und prognostische Grundlage der westlichen Astrologie." },
      { symbol: "☍", title: "Astrologische Transite", level: "Dynamisch · Aktuell", description: "Aktuelle Planetenbewegungen in Beziehung zur Geburtskarte." },
      { symbol: "☀", title: "Solarrevolution", level: "Zyklisch · Jährlich", description: "Für die exakte Sonnenwiederkehr berechnete Karte, von Geburtstag zu Geburtstag." },
      { symbol: "✦", title: "Horoskope", level: "Tag · Woche · Monat", description: "Allgemeine Orientierung nach Sonnenzeichen oder Aszendent." },
    ] },
    eastern: { back: "Zurück zum Anfang", eyebrow: "SCHICKSAL · ELEMENTE · GLEICHGEWICHT", title: "Östliche Astrologie", subtitle: "Geburtsstruktur und chinesische Kosmologie", introduction: "BaZi —die Vier Säulen des Schicksals— nimmt strukturell den Platz der westlichen Geburtskarte ein. Tiere, fünf Elemente und Yin/Yang-Polaritäten sind keine getrennten Kategorien: Sie bilden das Alphabet, aus dem die Säulen aufgebaut und gedeutet werden.", choose: "Schwerpunkt wählen", pending: "MODUL AUSSTEHEND", pendingDescription: "Die Oberfläche für Berechnung und Deutung wird in der nächsten Phase entwickelt.", focuses: [
      { symbol: "八", title: "BaZi · Vier Säulen", level: "Strukturell · Geburt", description: "Jahr, Monat, Tag und Stunde durch Himmelsstämme und Erdzweige ausgedrückt." },
      { symbol: "陰", title: "Tiere, Elemente und Polaritäten", level: "Grundkosmologie", description: "Zwölf Tiere, fünf Elemente und Yin/Yang: die grundlegenden Bausteine des BaZi." },
      { symbol: "紫", title: "Zi Wei Dou Shu", level: "Stellar · Schicksal", description: "Fortgeschrittenes System mit mehr als hundert Sternen in einer Karte aus zwölf Palästen." },
    ] },
  },
  PT: {
    western: { back: "Voltar ao início", eyebrow: "CÉU · CICLOS · EXPERIÊNCIA", title: "Astrologia Ocidental", subtitle: "Do mapa natal ao movimento do céu", introduction: "O Mapa Natal é o mapa raiz. Os trânsitos observam o presente, a Revolução Solar estuda o ciclo anual e os horóscopos oferecem orientação geral pelo signo solar ou ascendente.", choose: "Escolha o enfoque", pending: "MÓDULO PENDENTE", pendingDescription: "A interface de cálculo e interpretação será desenvolvida na próxima etapa.", focuses: [
      { symbol: "◎", title: "Mapa Natal", level: "Raiz · Estático", description: "Mapa do céu no nascimento: base psicológica e preditiva da astrologia ocidental." },
      { symbol: "☍", title: "Trânsitos Astrológicos", level: "Dinâmico · Atual", description: "Movimento planetário atual em relação ao Mapa Natal." },
      { symbol: "☀", title: "Revolução Solar", level: "Cíclico · Anual", description: "Mapa calculado para o retorno exato do Sol, de aniversário a aniversário." },
      { symbol: "✦", title: "Horóscopos", level: "Dia · Semana · Mês", description: "Orientações gerais baseadas no signo solar ou ascendente." },
    ] },
    eastern: { back: "Voltar ao início", eyebrow: "DESTINO · ELEMENTOS · EQUILÍBRIO", title: "Astrologia Oriental", subtitle: "Estrutura natal e cosmologia chinesa", introduction: "BaZi —os Quatro Pilares do Destino— ocupa o lugar estrutural do Mapa Natal ocidental. Os animais, os cinco elementos e as polaridades Yin/Yang não são categorias separadas: formam o alfabeto usado para compor e interpretar os pilares.", choose: "Escolha o enfoque", pending: "MÓDULO PENDENTE", pendingDescription: "A interface de cálculo e interpretação será desenvolvida na próxima etapa.", focuses: [
      { symbol: "八", title: "BaZi · Quatro Pilares", level: "Estrutural · Natal", description: "Ano, mês, dia e hora expressos por Troncos Celestes e Ramos Terrestres." },
      { symbol: "陰", title: "Animais, elementos e polaridades", level: "Cosmologia básica", description: "Doze animais, cinco elementos e Yin/Yang: os blocos fundamentais que compõem o BaZi." },
      { symbol: "紫", title: "Zi Wei Dou Shu", level: "Estelar · Destino", description: "Sistema avançado baseado em mais de cem estrelas em um mapa de doze palácios." },
    ] },
  },
};

const libraryCopy: Record<Language, { reference: string; westernWheel: string; westernDesc: string; easternWheel: string; easternDesc: string; planets: string; planetsDesc: string; elements: string; elementsDesc: string; polarity: string; polarityDesc: string }> = {
  ES: { reference: "Imagen de referencia", westernWheel: "Rueda celeste occidental", westernDesc: "Síntesis visual del zodiaco, las órbitas y la geometría astrológica.", easternWheel: "Rueda cosmológica oriental", easternDesc: "Síntesis visual de Yin/Yang, cinco elementos y doce animales.", planets: "Planetas", planetsDesc: "Funciones simbólicas que actúan dentro de signos, casas y aspectos.", elements: "Cinco elementos", elementsDesc: "Madera, Fuego, Tierra, Metal y Agua en sus ciclos.", polarity: "Yin y Yang", polarityDesc: "Polaridad complementaria presente en cada elemento y pilar." },
  EN: { reference: "Reference image", westernWheel: "Western celestial wheel", westernDesc: "A visual synthesis of the zodiac, planetary orbits, and astrological geometry.", easternWheel: "Eastern cosmological wheel", easternDesc: "A visual synthesis of Yin/Yang, five elements, and twelve animals.", planets: "Planets", planetsDesc: "Symbolic functions acting through signs, houses, and aspects.", elements: "Five elements", elementsDesc: "Wood, Fire, Earth, Metal, and Water in their cycles.", polarity: "Yin and Yang", polarityDesc: "Complementary polarity present in every element and pillar." },
  FR: { reference: "Image de référence", westernWheel: "Roue céleste occidentale", westernDesc: "Synthèse visuelle du zodiaque, des orbites et de la géométrie astrologique.", easternWheel: "Roue cosmologique orientale", easternDesc: "Synthèse visuelle du Yin/Yang, des cinq éléments et des douze animaux.", planets: "Planètes", planetsDesc: "Fonctions symboliques actives dans les signes, maisons et aspects.", elements: "Cinq éléments", elementsDesc: "Bois, Feu, Terre, Métal et Eau dans leurs cycles.", polarity: "Yin et Yang", polarityDesc: "Polarité complémentaire présente dans chaque élément et pilier." },
  DE: { reference: "Referenzbild", westernWheel: "Westliches Himmelsrad", westernDesc: "Visuelle Synthese von Tierkreis, Umlaufbahnen und astrologischer Geometrie.", easternWheel: "Östliches kosmologisches Rad", easternDesc: "Visuelle Synthese von Yin/Yang, fünf Elementen und zwölf Tieren.", planets: "Planeten", planetsDesc: "Symbolische Funktionen in Zeichen, Häusern und Aspekten.", elements: "Fünf Elemente", elementsDesc: "Holz, Feuer, Erde, Metall und Wasser in ihren Zyklen.", polarity: "Yin und Yang", polarityDesc: "Komplementäre Polarität in jedem Element und jeder Säule." },
  PT: { reference: "Imagem de referência", westernWheel: "Roda celeste ocidental", westernDesc: "Síntese visual do zodíaco, das órbitas e da geometria astrológica.", easternWheel: "Roda cosmológica oriental", easternDesc: "Síntese visual de Yin/Yang, cinco elementos e doze animais.", planets: "Planetas", planetsDesc: "Funções simbólicas que atuam em signos, casas e aspectos.", elements: "Cinco elementos", elementsDesc: "Madeira, Fogo, Terra, Metal e Água em seus ciclos.", polarity: "Yin e Yang", polarityDesc: "Polaridade complementar presente em cada elemento e pilar." },
};

export function AstrologySite({ branch, lang, onBack }: AstrologySiteProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const text = content[lang][branch];
  const lib = libraryCopy[lang];
  const astrologyLibrary = branch === "western" ? [
    { id: "western-wheel", name: lib.westernWheel, category: lib.reference, image: "/oracles/astrology/western-celestial-wheel.png", description: lib.westernDesc },
    ...text.focuses.map((item, index) => ({ id: `western-${index}`, name: item.title, category: item.level, symbol: ["◎", "☍", "☀", "✦"][index], description: item.description })),
    { id: "planets", name: lib.planets, category: text.eyebrow, symbol: "☿", description: lib.planetsDesc },
  ] : [
    { id: "eastern-wheel", name: lib.easternWheel, category: lib.reference, image: "/oracles/astrology/eastern-cosmology-wheel.png", description: lib.easternDesc },
    { id: "bazi", name: text.focuses[0].title, category: text.focuses[0].level, symbol: "八", description: text.focuses[0].description },
    { id: "animals", name: text.focuses[1].title, category: text.focuses[1].level, symbol: "子", description: text.focuses[1].description },
    { id: "elements", name: lib.elements, category: "Wu Xing", symbol: "木", description: lib.elementsDesc },
    { id: "polarity", name: lib.polarity, category: "Yin/Yang", symbol: "☯", description: lib.polarityDesc },
    { id: "ziwei", name: text.focuses[2].title, category: text.focuses[2].level, symbol: "紫", description: text.focuses[2].description },
  ] satisfies DisciplineLibraryItem[];
  const focus = selected === null ? null : text.focuses[selected];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return <section className={`astrology-site astrology-${branch}`}>
    <button type="button" className="astrology-back" onClick={onBack}>← {text.back}</button>
    <header className="astrology-heading"><span>{text.eyebrow}</span><h1>{text.title}</h1><strong>{text.subtitle}</strong><p>{text.introduction}</p></header>
    <section className="astrology-focus-panel" aria-labelledby={`${branch}-focus-title`}>
      <span className="astrology-mini-label" id={`${branch}-focus-title`}>{text.choose}</span>
      <div className="astrology-focus-grid">
        {text.focuses.map((item, index) => <button type="button" className={selected === index ? "selected" : ""} onClick={() => setSelected(index)} key={item.title}><i aria-hidden="true">{item.symbol}</i><span><small>{item.level}</small><b>{item.title}</b><em>{item.description}</em></span><strong aria-hidden="true">{selected === index ? "−" : "+"}</strong></button>)}
      </div>
      {focus && <article className="astrology-pending" aria-live="polite"><small>{text.pending}</small><h2>{focus.title}</h2><p>{text.pendingDescription}</p></article>}
    </section>
    <DisciplineLibrary lang={lang} items={astrologyLibrary} />
  </section>;
}
