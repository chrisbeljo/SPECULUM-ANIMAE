// Traducciones de labels para ExtendedCollections y componentes

export const extendedCollectionsLabels: Record<"ES"|"EN"|"FR"|"DE"|"PT", {
  zenOracleTitle: string;
  powerAnimalsTitle: string;
  radiestesiaTitle: string;
  chamalongosTitle: string;
  divineNamesTitle: string;
  treeOfLifeTitle: string;
  pathsGrid: string;
  chooseApproach: string;
  version1: string;
  version2: string;
}> = {
  ES: {
    zenOracleTitle: "Tarot Zen ORÁCULO · 79 cartas originales",
    powerAnimalsTitle: "Oráculo original de Animales de Poder · 44 cartas",
    radiestesiaTitle: "Radiestesia · péndulo con testigo y tablero",
    chamalongosTitle: "Chamalongos · referencia cultural",
    divineNamesTitle: "Los 72 Nombres de Dios · tripletes hebreos",
    treeOfLifeTitle: "Árbol de la Vida · 10 sefirot y 22 senderos",
    pathsGrid: "Los 22 senderos",
    chooseApproach: "ELIGE EL ENFOQUE",
    version1: "Versión 1 · Cáscaras de coco",
    version2: "Versión 2 · Caracoles tigre",
  },
  EN: {
    zenOracleTitle: "Zen Tarot ORACLE · 79 original cards",
    powerAnimalsTitle: "Original Power Animals Oracle · 44 cards",
    radiestesiaTitle: "Radiesthesia · pendulum with witness and board",
    chamalongosTitle: "Chamalongos · cultural reference",
    divineNamesTitle: "The 72 Names of God · Hebrew triplets",
    treeOfLifeTitle: "Tree of Life · 10 sefirot and 22 paths",
    pathsGrid: "The 22 Paths",
    chooseApproach: "CHOOSE YOUR APPROACH",
    version1: "Version 1 · Coconut shells",
    version2: "Version 2 · Tiger cowries",
  },
  FR: {
    zenOracleTitle: "Oracle Tarot Zen · 79 cartes originales",
    powerAnimalsTitle: "Oracle original des Animaux de Pouvoir · 44 cartes",
    radiestesiaTitle: "Radiesthésie · pendule avec témoin et tableau",
    chamalongosTitle: "Chamalongos · référence culturelle",
    divineNamesTitle: "Les 72 Noms de Dieu · triplets hébreux",
    treeOfLifeTitle: "Arbre de Vie · 10 séphirot et 22 chemins",
    pathsGrid: "Les 22 chemins",
    chooseApproach: "CHOISISSEZ VOTRE APPROCHE",
    version1: "Version 1 · Coquilles de noix de coco",
    version2: "Version 2 · Escargots tigre",
  },
  DE: {
    zenOracleTitle: "Zen Tarot ORAKEL · 79 Originalkarten",
    powerAnimalsTitle: "Krafttiere Orakel · 44 Karten",
    radiestesiaTitle: "Radiästhesie · Pendel mit Zeuge und Tafel",
    chamalongosTitle: "Chamalongos · Kulturelle Referenz",
    divineNamesTitle: "Die 72 Namen Gottes · hebräische Tripletts",
    treeOfLifeTitle: "Baum des Lebens · 10 Sefiroth und 22 Pfade",
    pathsGrid: "Die 22 Pfade",
    chooseApproach: "WÄHLEN SIE IHREN ANSATZ",
    version1: "Version 1 · Kokosnussschalen",
    version2: "Version 2 · Tigerschnecken",
  },
  PT: {
    zenOracleTitle: "Oracle Tarot Zen · 79 cartas originais",
    powerAnimalsTitle: "Oracle original de Animais de Poder · 44 cartas",
    radiestesiaTitle: "Radiestesia · pêndulo com testemunha e tabuleiro",
    chamalongosTitle: "Chamalongos · referência cultural",
    divineNamesTitle: "Os 72 Nomes de Deus · tripletes hebraicos",
    treeOfLifeTitle: "Árvore da Vida · 10 sefirot e 22 caminhos",
    pathsGrid: "Os 22 caminhos",
    chooseApproach: "ESCOLHA SUA ABORDAGEM",
    version1: "Versão 1 · Cascas de coco",
    version2: "Versão 2 · Caramujos-tigre",
  },
};

export function getTarotName(cardKey: string, lang: "ES"|"EN"|"FR"|"DE"|"PT"): string {
  return tarotTranslations[cardKey]?.[lang]?.name || cardKey;
}

export function getExtendedLabel(key: keyof typeof extendedCollectionsLabels.ES, lang: "ES"|"EN"|"FR"|"DE"|"PT"): string {
  return extendedCollectionsLabels[lang]?.[key] || key;
}
