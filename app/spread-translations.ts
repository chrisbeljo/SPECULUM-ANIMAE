// Direct translation of spread names: ES → { EN, FR, DE, PT }
const spreadNameTranslations: Record<string, Record<string, string>> = {
  "Una carta — mensaje central": { EN: "One card — central message", FR: "Une carte — message central", DE: "Eine Karte — Zentralbotschaft", PT: "Uma carta — mensagem central" },
  "Dos cartas — situación y consejo": { EN: "Two cards — situation and advice", FR: "Deux cartes — situation et conseil", DE: "Zwei Karten — Situation und Rat", PT: "Duas cartas — situação e conselho" },
  "Sí / No razonado — respuesta, condición y advertencia": { EN: "Yes/No reasoned — answer, condition, warning", FR: "Oui/Non raisonné — réponse, condition, avertissement", DE: "Ja/Nein begründet — Antwort, Bedingung, Warnung", PT: "Sim/Não razoado — resposta, condição, aviso" },
  "Tres cartas — pasado, presente y tendencia": { EN: "Three cards — past, present, future", FR: "Trois cartes — passé, présent, tendance", DE: "Drei Karten — Vergangenheit, Gegenwart, Tendenz", PT: "Três cartas — passado, presente e tendência" },
  "Situación, obstáculo y consejo": { EN: "Situation, obstacle, and advice", FR: "Situation, obstacle et conseil", DE: "Situation, Hindernis und Rat", PT: "Situação, obstáculo e conselho" },
  "Mente, emoción y acción": { EN: "Mind, emotion, and action", FR: "Esprit, émotion et action", DE: "Verstand, Emotion und Handlung", PT: "Mente, emoção e ação" },
  "Qué conservar, qué soltar y qué iniciar": { EN: "What to keep, release, and begin", FR: "Ce qu'il faut garder, lâcher et commencer", DE: "Was zu halten, loszulassen und zu beginnen ist", PT: "O que manter, soltar e iniciar" },
  "Tú, la otra persona y el vínculo": { EN: "You, the other person, and the bond", FR: "Toi, l'autre personne et le lien", DE: "Du, die andere Person und die Bindung", PT: "Você, a outra pessoa e o vínculo" },
  "Relación de seis cartas": { EN: "Six-card relationship spread", FR: "Tirage de six cartes pour la relation", DE: "Sechskarten-Beziehungslegung", PT: "Tirada de seis cartas — relação" },
  "Qué siente, qué piensa y qué hará": { EN: "What they feel, think, and will do", FR: "Ce qu'ils ressentent, pensent et feront", DE: "Was sie fühlen, denken und tun werden", PT: "O que sentem, pensam e farão" },
  "Compatibilidad de la pareja": { EN: "Couple compatibility", FR: "Compatibilité du couple", DE: "Paarkompatibilität", PT: "Compatibilidade do casal" },
  "Evolución del vínculo": { EN: "Evolution of the bond", FR: "Évolution du lien", DE: "Entwicklung der Bindung", PT: "Evolução do vínculo" },
  "Reconciliación o cierre": { EN: "Reconciliation or closure", FR: "Réconciliation ou fermeture", DE: "Versöhnung oder Abschluss", PT: "Reconciliação ou encerramento" },
  "Persona nueva: intención, potencial y precaución": { EN: "New person: intention, potential, caution", FR: "Nouvelle personne: intention, potentiel, prudence", DE: "Neue Person: Absicht, Potenzial, Vorsicht", PT: "Pessoa nova: intenção, potencial, precaução" },
  "Camino A frente a Camino B": { EN: "Path A vs Path B", FR: "Chemin A vs Chemin B", DE: "Weg A gegen Weg B", PT: "Caminho A vs Caminho B" },
  "Ventajas, riesgos y resultado probable": { EN: "Advantages, risks, and likely outcome", FR: "Avantages, risques et résultat probable", DE: "Vorteile, Risiken und wahrscheinliches Ergebnis", PT: "Vantagens, riscos e resultado provável" },
  "Qué ocurre si actúo / si no actúo": { EN: "What happens if I act / if I wait", FR: "Que se passe-t-il si j'agis / si j'attends", DE: "Was geschieht, wenn ich handle / wenn ich warte", PT: "O que acontece se eu agir / se eu esperar" },
  "Decisión de seis cartas": { EN: "Six-card decision spread", FR: "Décision de six cartes", DE: "Sechskarten-Entscheidungslegung", PT: "Decisão de seis cartas" },
  "Semáforo: avanzar, esperar o detenerse": { EN: "Traffic light: advance, wait, or stop", FR: "Feu tricolore: avancer, attendre ou arrêter", DE: "Ampel: vorbei, warten oder stoppen", PT: "Semáforo: avançar, esperar ou parar" },
  "Situación laboral": { EN: "Work situation", FR: "Situation professionnelle", DE: "Berufliche Situation", PT: "Situação profissional" },
  "Cambio de empleo": { EN: "Job change", FR: "Changement d'emploi", DE: "Jobwechsel", PT: "Mudança de emprego" },
  "Proyecto o negocio": { EN: "Project or business", FR: "Projet ou entreprise", DE: "Projekt oder Geschäft", PT: "Projeto ou negócio" },
  "Bloqueo económico": { EN: "Financial blockage", FR: "Blocage économique", DE: "Finanzielle Blockierung", PT: "Bloqueio financeiro" },
  "Flujo de recursos": { EN: "Flow of resources", FR: "Flux des ressources", DE: "Ressourcentfluss", PT: "Fluxo de recursos" },
  "Oportunidad, riesgo y estrategia": { EN: "Opportunity, risk, and strategy", FR: "Opportunité, risque et stratégie", DE: "Gelegenheit, Risiko und Strategie", PT: "Oportunidade, risco e estratégia" },
  "Sombra, aprendizaje y recurso": { EN: "Shadow, learning, and resource", FR: "Ombre, apprentissage et ressource", DE: "Schatten, Lernen und Ressource", PT: "Sombra, aprendizado e recurso" },
  "Bloqueo emocional": { EN: "Emotional blockage", FR: "Blocage émotionnel", DE: "Emotionale Blockierung", PT: "Bloqueio emocional" },
  "Propósito del momento": { EN: "Purpose of the moment", FR: "Objectif du moment", DE: "Zweck des Moments", PT: "Propósito do momento" },
  "Ciclo que termina y ciclo que comienza": { EN: "Cycle ending and cycle beginning", FR: "Cycle qui se termine et cycle qui commence", DE: "Entzyklus und Neuzyklus", PT: "Ciclo terminando e ciclo começando" },
  "Herida, conciencia e integración": { EN: "Wound, awareness, and integration", FR: "Blessure, conscience et intégration", DE: "Wunde, Bewusstsein und Integration", PT: "Ferida, consciência e integração" },
  "Los siete chakras": { EN: "Seven chakras", FR: "Les sept chakras", DE: "Die sieben Chakren", PT: "Os sete chakras" },
  "Rueda del año personal": { EN: "Wheel of the year — personal", FR: "Roue de l'année personnelle", DE: "Jahresrad — persönlich", PT: "Roda do ano — pessoal" },
  "Cruz Celta — 10 cartas": { EN: "Celtic Cross — 10 cards", FR: "Croix Celtique — 10 cartes", DE: "Keltisches Kreuz — 10 Karten", PT: "Cruz Celta — 10 cartas" },
  "Herradura — 7 cartas": { EN: "Horseshoe — 7 cards", FR: "Fer à Cheval — 7 cartes", DE: "Hufeisen — 7 Karten", PT: "Ferradura — 7 cartas" },
  "Estrella de siete cartas": { EN: "Seven-card star", FR: "Étoile de sept cartes", DE: "Siebenkarten-Stern", PT: "Estrela de sete cartas" },
  "Mandala de nueve cartas": { EN: "Nine-card mandala", FR: "Mandala de neuf cartes", DE: "Neunkarten-Mandala", PT: "Mandala de nove cartas" },
  "Doce casas — 12 cartas": { EN: "Twelve houses — 12 cards", FR: "Douze maisons — 12 cartes", DE: "Zwölf Häuser — 12 Karten", PT: "Doze casas — 12 cartas" },
  "Árbol de la Vida — 10 cartas": { EN: "Tree of Life — 10 cards", FR: "Arbre de Vie — 10 cartes", DE: "Baum des Lebens — 10 Karten", PT: "Árvore da Vida — 10 cartas" },
  "Camino espiritual — 12 cartas": { EN: "Spiritual path — 12 cards", FR: "Chemin spirituel — 12 cartes", DE: "Spiritueller Pfad — 12 Karten", PT: "Caminho espiritual — 12 cartas" },
  "Una runa — mensaje central": { EN: "One rune — central message", FR: "Une rune — message central", DE: "Eine Rune — Zentralbotschaft", PT: "Uma runa — mensagem central" },
  "Dos runas — situación y orientación": { EN: "Two runes — situation and guidance", FR: "Deux runes — situation et orientation", DE: "Zwei Runen — Situation und Anleitung", PT: "Duas runas — situação e orientação" },
  "Sí / No razonado": { EN: "Yes/No reasoned", FR: "Oui/Non raisonné", DE: "Ja/Nein begründet", PT: "Sim/Não razoado" },
  "Las tres Nornas": { EN: "The three Norns", FR: "Les trois Nornes", DE: "Die drei Nornen", PT: "As três Nornas" },
  "Situación, obstáculo y consejo": { EN: "Situation, obstacle, and advice", FR: "Situation, obstacle et conseil", DE: "Situation, Hindernis und Rat", PT: "Situação, obstáculo e conselho" },
  "Mente, emoción y acción": { EN: "Mind, emotion, and action", FR: "Esprit, émotion et action", DE: "Verstand, Emotion und Handlung", PT: "Mente, emoção e ação" },
  "Conservar, soltar e iniciar": { EN: "Keep, release, and begin", FR: "Conserver, lâcher et commencer", DE: "Halten, loslassen und anfangen", PT: "Manter, soltar e começar" },
  "Tú, la otra persona y el vínculo": { EN: "You, the other person, and the bond", FR: "Toi, l'autre personne et le lien", DE: "Du, die andere Person und die Bindung", PT: "Você, a outra pessoa e o vínculo" },
  "Qué siente, qué piensa y cómo actuará": { EN: "What they feel, think, and will do", FR: "Ce qu'ils ressentent, pensent et feront", DE: "Was sie fühlen, denken und tun werden", PT: "O que sentem, pensam e farão" },
  "Estado y evolución de la relación": { EN: "State and evolution of the relationship", FR: "État et évolution de la relation", DE: "Zustand und Entwicklung der Beziehung", PT: "Estado e evolução do relacionamento" },
  "Reconciliación o cierre": { EN: "Reconciliation or closure", FR: "Réconciliation ou fermeture", DE: "Versöhnung oder Abschluss", PT: "Reconciliação ou encerramento" },
  "Nueva relación: intención, potencial y riesgo": { EN: "New relationship: intention, potential, and risk", FR: "Nouvelle relation: intention, potentiel et risque", DE: "Neue Beziehung: Absicht, Potenzial und Risiko", PT: "Novo relacionamento: intenção, potencial e risco" },
  "Camino A frente a Camino B": { EN: "Path A vs Path B", FR: "Chemin A vs Chemin B", DE: "Weg A gegen Weg B", PT: "Caminho A vs Caminho B" },
  "Qué ocurre si actúo o no actúo": { EN: "What happens if I act or wait", FR: "Que se passe-t-il si j'agis ou j'attends", DE: "Was geschieht, wenn ich handle oder warte", PT: "O que acontece se eu agir ou esperar" },
  "Oportunidad, riesgo y estrategia": { EN: "Opportunity, risk, and strategy", FR: "Opportunité, risque et stratégie", DE: "Gelegenheit, Risiko und Strategie", PT: "Oportunidade, risco e estratégia" },
  "Cruz rúnica — 5 runas": { EN: "Rune cross — 5 runes", FR: "Croix runique — 5 runes", DE: "Runenkreuz — 5 Runen", PT: "Cruz de runas — 5 runas" },
  "Decisión — 7 runas": { EN: "Decision — 7 runes", FR: "Décision — 7 runes", DE: "Entscheidung — 7 Runen", PT: "Decisão — 7 runas" },
  "Sombra, aprendizaje y recurso": { EN: "Shadow, learning, and resource", FR: "Ombre, apprentissage et ressource", DE: "Schatten, Lernen und Ressource", PT: "Sombra, aprendizado e recurso" },
  "Bloqueo, causa y liberación": { EN: "Block, cause, and release", FR: "Blocage, cause et libération", DE: "Blockade, Ursache und Freisetzung", PT: "Bloqueio, causa e liberação" },
  "Don, desafío y propósito": { EN: "Gift, challenge, and purpose", FR: "Don, défi et but", DE: "Geschenk, Herausforderung und Zweck", PT: "Dom, desafio e propósito" },
  "Ciclo que termina y ciclo que comienza": { EN: "Cycle ending and cycle beginning", FR: "Cycle qui se termine et cycle qui commence", DE: "Entzyklus und Neuzyklus", PT: "Ciclo terminando e ciclo começando" },
  "Cruz rúnica completa — 9 runas": { EN: "Complete rune cross — 9 runes", FR: "Croix runique complète — 9 runes", DE: "Vollständiges Runenkreuz — 9 Runen", PT: "Cruz de runas completa — 9 runas" },
  "Los nueve mundos — 9 runas": { EN: "The nine worlds — 9 runes", FR: "Les neuf mondes — 9 runes", DE: "Die neun Welten — 9 Runen", PT: "Os nove mundos — 9 runas" },
  "Rueda anual — 12 runas": { EN: "Annual wheel — 12 runes", FR: "Roue annuelle — 12 runes", DE: "Jahresrad — 12 Runen", PT: "Roda anual — 12 runas" },
};

// Mapping from Spanish position labels to translations: ES → { EN, FR, DE, PT }
const positionLabelTranslations: Record<string, Record<string, string>> = {
  "Centro": { EN: "Center", FR: "Centre", DE: "Zentrum", PT: "Centro" },
  "Conciencia": { EN: "Consciousness", FR: "Conscience", DE: "Bewusstsein", PT: "Consciência" },
  "Deseo": { EN: "Desire", FR: "Désir", DE: "Verlangen", PT: "Desejo" },
  "Destino interior": { EN: "Inner destiny", FR: "Destin intérieur", DE: "Inneres Schicksal", PT: "Destino interior" },
  "Elección": { EN: "Choice", FR: "Choix", DE: "Wahl", PT: "Escolha" },
  "Emoción visible": { EN: "Visible emotion", FR: "Émotion visible", DE: "Sichtbare Emotion", PT: "Emoção visível" },
  "Entrega": { EN: "Surrender", FR: "Abandon", DE: "Hingabe", PT: "Entrega" },
  "Equipaje": { EN: "Baggage", FR: "Bagages", DE: "Gepäck", PT: "Bagagem" },
  "Este": { EN: "East", FR: "Est", DE: "Osten", PT: "Leste" },
  "Guía": { EN: "Guide", FR: "Guide", DE: "Führung", PT: "Guia" },
  "Herida": { EN: "Wound", FR: "Blessure", DE: "Wunde", PT: "Ferida" },
  "Idea": { EN: "Idea", FR: "Idée", DE: "Idee", PT: "Ideia" },
  "Lección": { EN: "Lesson", FR: "Leçon", DE: "Lektion", PT: "Lição" },
  "Llamado": { EN: "Calling", FR: "Appel", DE: "Berufung", PT: "Chamado" },
  "Lo que comienza": { EN: "What begins", FR: "Ce qui commence", DE: "Was beginnt", PT: "O que começa" },
  "Lo que termina": { EN: "What ends", FR: "Ce qui se termine", DE: "Was endet", PT: "O que termina" },
  "Necesidad": { EN: "Need", FR: "Besoin", DE: "Bedürfnis", PT: "Necessidade" },
  "Noreste": { EN: "Northeast", FR: "Nord-Est", DE: "Nordosten", PT: "Nordeste" },
  "Noroeste": { EN: "Northwest", FR: "Nord-Ouest", DE: "Nordwesten", PT: "Noroeste" },
  "Norte": { EN: "North", FR: "Nord", DE: "Norden", PT: "Norte" },
  "Oeste": { EN: "West", FR: "Ouest", DE: "Westen", PT: "Oeste" },
  "Primer paso": { EN: "First step", FR: "Premier pas", DE: "Erster Schritt", PT: "Primeiro passo" },
  "Propósito": { EN: "Purpose", FR: "Objectif", DE: "Zweck", PT: "Propósito" },
  "Protección": { EN: "Protection", FR: "Protection", DE: "Schutz", PT: "Proteção" },
  "Prueba": { EN: "Trial", FR: "Épreuve", DE: "Prüfung", PT: "Prova" },
  "Resultado probable": { EN: "Probable outcome", FR: "Résultat probable", DE: "Wahrscheinliches Ergebnis", PT: "Resultado provável" },
  "Revelación": { EN: "Revelation", FR: "Révélation", DE: "Enthüllung", PT: "Revelação" },
  "Riesgos": { EN: "Risks", FR: "Risques", DE: "Risiken", PT: "Riscos" },
  "Sur": { EN: "South", FR: "Sud", DE: "Süden", PT: "Sul" },
  "Sureste": { EN: "Southeast", FR: "Sud-Est", DE: "Südosten", PT: "Sudeste" },
  "Suroeste": { EN: "Southwest", FR: "Sud-Ouest", DE: "Südwesten", PT: "Sudoeste" },
  "Talento": { EN: "Talent", FR: "Talent", DE: "Talent", PT: "Talento" },
  "Umbral": { EN: "Threshold", FR: "Seuil", DE: "Schwelle", PT: "Limiar" },
  "Ventajas": { EN: "Advantages", FR: "Avantages", DE: "Vorteile", PT: "Vantagens" },
  "Kéter": { EN: "Keter", FR: "Kéter", DE: "Keter", PT: "Kéter" },
  "Jojmá": { EN: "Chokmah", FR: "Chokmah", DE: "Chokmah", PT: "Chokmah" },
  "Biná": { EN: "Binah", FR: "Binah", DE: "Binah", PT: "Binah" },
  "Jésed": { EN: "Chesed", FR: "Chesed", DE: "Chesed", PT: "Chesed" },
  "Guevurá": { EN: "Gevurah", FR: "Gevurah", DE: "Gevurah", PT: "Gevurah" },
  "Tiféret": { EN: "Tiferet", FR: "Tiféret", DE: "Tiferet", PT: "Tiféret" },
  "Nétzaj": { EN: "Netzach", FR: "Netzach", DE: "Netzach", PT: "Netzach" },
  "Hod": { EN: "Hod", FR: "Hod", DE: "Hod", PT: "Hod" },
  "Yesod": { EN: "Yesod", FR: "Yesod", DE: "Yesod", PT: "Yesod" },
  "Maljut": { EN: "Malchut", FR: "Malchout", DE: "Malchut", PT: "Malchut" },
  "Mensaje central": { EN: "Central message", FR: "Message central", DE: "Zentralbotschaft", PT: "Mensagem central" },
  "Situación": { EN: "Situation", FR: "Situation", DE: "Situation", PT: "Situação" },
  "Consejo": { EN: "Advice", FR: "Conseil", DE: "Rat", PT: "Conselho" },
  "Respuesta": { EN: "Answer", FR: "Réponse", DE: "Antwort", PT: "Resposta" },
  "Condición": { EN: "Condition", FR: "Condition", DE: "Bedingung", PT: "Condição" },
  "Advertencia": { EN: "Warning", FR: "Avertissement", DE: "Warnung", PT: "Aviso" },
  "Pasado": { EN: "Past", FR: "Passé", DE: "Vergangenheit", PT: "Passado" },
  "Presente": { EN: "Present", FR: "Présent", DE: "Gegenwart", PT: "Presente" },
  "Tendencia": { EN: "Trend", FR: "Tendance", DE: "Tendenz", PT: "Tendência" },
  "Obstáculo": { EN: "Obstacle", FR: "Obstacle", DE: "Hindernis", PT: "Obstáculo" },
  "Mente": { EN: "Mind", FR: "Esprit", DE: "Verstand", PT: "Mente" },
  "Emoción": { EN: "Emotion", FR: "Émotion", DE: "Emotion", PT: "Emoção" },
  "Acción": { EN: "Action", FR: "Action", DE: "Handlung", PT: "Ação" },
  "Conservar": { EN: "Keep", FR: "Garder", DE: "Halten", PT: "Manter" },
  "Soltar": { EN: "Release", FR: "Lâcher", DE: "Loslassen", PT: "Soltar" },
  "Iniciar": { EN: "Begin", FR: "Commencer", DE: "Beginnen", PT: "Iniciar" },
  "Tú": { EN: "You", FR: "Toi", DE: "Du", PT: "Você" },
  "La otra persona": { EN: "The other person", FR: "L'autre personne", DE: "Die andere Person", PT: "A outra pessoa" },
  "El vínculo": { EN: "The bond", FR: "Le lien", DE: "Die Bindung", PT: "O vínculo" },
  "Tu energía": { EN: "Your energy", FR: "Votre énergie", DE: "Deine Energie", PT: "Sua energia" },
  "Su energía": { EN: "Their energy", FR: "Leur énergie", DE: "Ihre Energie", PT: "Sua energia" },
  "Lo que une": { EN: "What unites", FR: "Ce qui unit", DE: "Was verbindet", PT: "O que une" },
  "Lo que distancia": { EN: "What separates", FR: "Ce qui éloigne", DE: "Was trennt", PT: "O que distancia" },
  "Aprendizaje": { EN: "Learning", FR: "Apprentissage", DE: "Lernen", PT: "Aprendizado" },
  "Qué siente": { EN: "What they feel", FR: "Ce qu'ils ressentent", DE: "Was sie fühlen", PT: "O que sentem" },
  "Qué piensa": { EN: "What they think", FR: "Ce qu'ils pensent", DE: "Was sie denken", PT: "O que pensam" },
  "Qué hará": { EN: "What they'll do", FR: "Ce qu'ils feront", DE: "Was sie tun werden", PT: "O que farão" },
  "Tu esencia": { EN: "Your essence", FR: "Votre essence", DE: "Dein Wesen", PT: "Sua essência" },
  "Su esencia": { EN: "Their essence", FR: "Leur essence", DE: "Ihr Wesen", PT: "Sua essência" },
  "Afinidad": { EN: "Affinity", FR: "Affinité", DE: "Affinität", PT: "Afinidade" },
  "Diferencia": { EN: "Difference", FR: "Différence", DE: "Unterschied", PT: "Diferença" },
  "Potencial": { EN: "Potential", FR: "Potentiel", DE: "Potenzial", PT: "Potencial" },
  "Origen": { EN: "Origin", FR: "Origine", DE: "Herkunft", PT: "Origem" },
  "Estado actual": { EN: "Current state", FR: "État actuel", DE: "Aktueller Zustand", PT: "Estado atual" },
  "Desafío": { EN: "Challenge", FR: "Défi", DE: "Herausforderung", PT: "Desafio" },
  "Próximo paso": { EN: "Next step", FR: "Prochain pas", DE: "Nächster Schritt", PT: "Próximo passo" },
  "Evolución": { EN: "Evolution", FR: "Évolution", DE: "Entwicklung", PT: "Evolução" },
  "Lo que permanece": { EN: "What remains", FR: "Ce qui reste", DE: "Was bleibt", PT: "O que permanece" },
  "Lo que separa": { EN: "What separates", FR: "Ce qui sépare", DE: "Was trennt", PT: "O que separa" },
  "Posibilidad de diálogo": { EN: "Dialogue possibility", FR: "Possibilité de dialogue", DE: "Dialogmöglichkeit", PT: "Possibilidade de diálogo" },
  "Reconciliación": { EN: "Reconciliation", FR: "Réconciliation", DE: "Versöhnung", PT: "Reconciliação" },
  "Cierre consciente": { EN: "Conscious closure", FR: "Fermeture consciente", DE: "Bewusster Abschluss", PT: "Encerramento consciente" },
  "Intención": { EN: "Intention", FR: "Intention", DE: "Absicht", PT: "Intenção" },
  "Precaución": { EN: "Caution", FR: "Prudence", DE: "Vorsicht", PT: "Precaução" },
  "Camino A": { EN: "Path A", FR: "Chemin A", DE: "Weg A", PT: "Caminho A" },
  "Resultado A": { EN: "Result A", FR: "Résultat A", DE: "Ergebnis A", PT: "Resultado A" },
  "Camino B": { EN: "Path B", FR: "Chemin B", DE: "Weg B", PT: "Caminho B" },
  "Resultado B": { EN: "Result B", FR: "Résultat B", DE: "Ergebnis B", PT: "Resultado B" },
  "Punto de decisión": { EN: "Decision point", FR: "Point de décision", DE: "Entscheidungspunkt", PT: "Ponto de decisão" },
  "Si actúo": { EN: "If I act", FR: "Si j'agis", DE: "Wenn ich handle", PT: "Se eu agir" },
  "Consecuencia": { EN: "Consequence", FR: "Conséquence", DE: "Konsequenz", PT: "Consequência" },
  "Si no actúo": { EN: "If I wait", FR: "Si j'attends", DE: "Wenn ich warte", PT: "Se eu esperar" },
  "Motivación": { EN: "Motivation", FR: "Motivation", DE: "Motivation", PT: "Motivação" },
  "Avanzar": { EN: "Advance", FR: "Avancer", DE: "Vorbei", PT: "Avançar" },
  "Esperar": { EN: "Wait", FR: "Attendre", DE: "Warten", PT: "Esperar" },
  "Detenerse": { EN: "Stop", FR: "Arrêter", DE: "Stoppen", PT: "Parar" },
  "Fortaleza": { EN: "Strength", FR: "Force", DE: "Stärke", PT: "Força" },
  "Bloqueo": { EN: "Blockage", FR: "Blocage", DE: "Blockierung", PT: "Bloqueio" },
  "Entorno": { EN: "Environment", FR: "Environnement", DE: "Umgebung", PT: "Ambiente" },
  "Trabajo actual": { EN: "Current work", FR: "Travail actuel", DE: "Aktuelle Arbeit", PT: "Trabalho atual" },
  "Razón del cambio": { EN: "Reason for change", FR: "Raison du changement", DE: "Grund für die Änderung", PT: "Razão da mudança" },
  "Oportunidad": { EN: "Opportunity", FR: "Opportunité", DE: "Gelegenheit", PT: "Oportunidade" },
  "Riesgo": { EN: "Risk", FR: "Risque", DE: "Risiko", PT: "Risco" },
  "Resultado": { EN: "Result", FR: "Résultat", DE: "Ergebnis", PT: "Resultado" },
  "Idea": { EN: "Idea", FR: "Idée", DE: "Idee", PT: "Ideia" },
  "Recursos": { EN: "Resources", FR: "Ressources", DE: "Ressourcen", PT: "Recursos" },
  "Mercado": { EN: "Market", FR: "Marché", DE: "Markt", PT: "Mercado" },
  "Estrategia": { EN: "Strategy", FR: "Stratégie", DE: "Strategie", PT: "Estratégia" },
  "Manifestación": { EN: "Manifestation", FR: "Manifestation", DE: "Manifestation", PT: "Manifestação" },
  "Patrón": { EN: "Pattern", FR: "Modèle", DE: "Muster", PT: "Padrão" },
  "Recurso": { EN: "Resource", FR: "Ressource", DE: "Ressource", PT: "Recurso" },
  "Salida": { EN: "Exit", FR: "Sortie", DE: "Ausgang", PT: "Saída" },
  "Entrada": { EN: "Entrance", FR: "Entrée", DE: "Eingang", PT: "Entrada" },
  "Fuga": { EN: "Escape", FR: "Fuite", DE: "Flucht", PT: "Fuga" },
  "Reserva": { EN: "Reserve", FR: "Réserve", DE: "Reserve", PT: "Reserva" },
  "Movimiento": { EN: "Movement", FR: "Mouvement", DE: "Bewegung", PT: "Movimento" },
  "Sombra": { EN: "Shadow", FR: "Ombre", DE: "Schatten", PT: "Sombra" },
  "Integración": { EN: "Integration", FR: "Intégration", DE: "Integration", PT: "Integração" },
  "Raíz": { EN: "Root", FR: "Racine", DE: "Wurzel", PT: "Raiz" },
  "Sacro": { EN: "Sacral", FR: "Sacré", DE: "Sakral", PT: "Sacro" },
  "Plexo solar": { EN: "Solar Plexus", FR: "Plexus solaire", DE: "Solarplexus", PT: "Plexo solar" },
  "Corazón": { EN: "Heart", FR: "Cœur", DE: "Herz", PT: "Coração" },
  "Garganta": { EN: "Throat", FR: "Gorge", DE: "Kehle", PT: "Garganta" },
  "Tercer ojo": { EN: "Third eye", FR: "Troisième œil", DE: "Drittes Auge", PT: "Terceiro olho" },
  "Corona": { EN: "Crown", FR: "Couronne", DE: "Krone", PT: "Coroa" },
  "Invierno": { EN: "Winter", FR: "Hiver", DE: "Winter", PT: "Inverno" },
  "Despertar": { EN: "Awakening", FR: "Réveil", DE: "Erwachen", PT: "Despertar" },
  "Primavera": { EN: "Spring", FR: "Printemps", DE: "Frühling", PT: "Primavera" },
  "Expansión": { EN: "Expansion", FR: "Expansion", DE: "Ausdehnung", PT: "Expansão" },
  "Verano": { EN: "Summer", FR: "Été", DE: "Sommer", PT: "Verão" },
  "Cosecha": { EN: "Harvest", FR: "Récolte", DE: "Ernte", PT: "Colheita" },
  "Otoño": { EN: "Autumn", FR: "Automne", DE: "Herbst", PT: "Outono" },
  "Depuración": { EN: "Purification", FR: "Purification", DE: "Reinigung", PT: "Purificação" },
  "Centro del año": { EN: "Center of year", FR: "Centre de l'année", DE: "Jahresmitte", PT: "Centro do ano" },
  "Lo que cruza": { EN: "What crosses", FR: "Ce qui croise", DE: "Was kreuzt", PT: "O que cruza" },
  "Base": { EN: "Foundation", FR: "Base", DE: "Grundlage", PT: "Base" },
  "Posibilidad": { EN: "Possibility", FR: "Possibilité", DE: "Möglichkeit", PT: "Possibilidade" },
  "Futuro cercano": { EN: "Near future", FR: "Futur proche", DE: "Nahe Zukunft", PT: "Futuro próximo" },
  "Actitud": { EN: "Attitude", FR: "Attitude", DE: "Haltung", PT: "Atitude" },
  "Esperanzas y temores": { EN: "Hopes and fears", FR: "Espoirs et peurs", DE: "Hoffnungen und Ängste", PT: "Esperanças e medos" },
  "Influencia oculta": { EN: "Hidden influence", FR: "Influence cachée", DE: "Verborgener Einfluss", PT: "Influência oculta" },
  "Yo": { EN: "Self", FR: "Moi", DE: "Ich", PT: "Eu" },
  "Inconsciente": { EN: "Unconscious", FR: "Inconscient", DE: "Unbewusstes", PT: "Inconsciente" },
  "Comunidad": { EN: "Community", FR: "Communauté", DE: "Gemeinschaft", PT: "Comunidade" },
  "Vocación": { EN: "Vocation", FR: "Vocation", DE: "Berufung", PT: "Vocação" },
  "Visión": { EN: "Vision", FR: "Vision", DE: "Vision", PT: "Visão" },
  "Comunicación": { EN: "Communication", FR: "Communication", DE: "Kommunikation", PT: "Comunicação" },
  "Hogar": { EN: "Home", FR: "Foyer", DE: "Zuhause", PT: "Lar" },
  "Transformación": { EN: "Transformation", FR: "Transformation", DE: "Umwandlung", PT: "Transformação" },
  "Rutinas": { EN: "Routines", FR: "Routines", DE: "Routinen", PT: "Rotinas" },
  "Vínculos": { EN: "Bonds", FR: "Liens", DE: "Bindungen", PT: "Vínculos" },
  "Creatividad": { EN: "Creativity", FR: "Créativité", DE: "Kreativität", PT: "Criatividade" },
  "Support": { EN: "Support", FR: "Soutien", DE: "Unterstützung", PT: "Suporte" },
  "Hexagrama principal": { EN: "Primary hexagram", FR: "Hexagramme principal", DE: "Primäres Hexagramm", PT: "Hexagrama principal" },
  "Hexagrama resultante": { EN: "Resulting hexagram", FR: "Hexagramme résultant", DE: "Resultierendes Hexagramm", PT: "Hexagrama resultante" },
};

// I Ching Consultation Translations: ES → { EN, FR, DE, PT }
const ichingConsultationTranslations: Record<string, Record<string, string>> = {
  "Mensaje del momento": { EN: "Message of the moment", FR: "Message du moment", DE: "Botschaft des Moments", PT: "Mensagem do momento" },
  "Respuesta razonada": { EN: "Reasoned answer", FR: "Réponse raisonnée", DE: "Begründete Antwort", PT: "Resposta razoada" },
  "Situación y evolución probable": { EN: "Situation and likely evolution", FR: "Situation et évolution probable", DE: "Situation und wahrscheinliche Entwicklung", PT: "Situação e evolução provável" },
  "Qué favorece y qué dificulta": { EN: "What supports and what hinders", FR: "Ce qui favorise et ce qui entrave", DE: "Was unterstützt und was behindert", PT: "O que favorece e o que dificulta" },
  "Decisión entre dos alternativas": { EN: "Decision between two alternatives", FR: "Décision entre deux alternatives", DE: "Entscheidung zwischen zwei Alternativen", PT: "Decisão entre duas alternativas" },
  "Qué sucede si actúo": { EN: "What happens if I act", FR: "Ce qui se passe si j'agis", DE: "Was geschieht, wenn ich handle", PT: "O que acontece se eu agir" },
  "Qué sucede si espero": { EN: "What happens if I wait", FR: "Ce qui se passe si j'attends", DE: "Was geschieht, wenn ich warte", PT: "O que acontece se eu esperar" },
  "Amor y evolución del vínculo": { EN: "Love and evolution of the bond", FR: "Amour et évolution du lien", DE: "Liebe und Entwicklung der Bindung", PT: "Amor e evolução do vínculo" },
  "Conflicto o reconciliación": { EN: "Conflict or reconciliation", FR: "Conflit ou réconciliation", DE: "Konflikt oder Versöhnung", PT: "Conflito ou reconciliação" },
  "Trabajo, proyecto o negocio": { EN: "Work, project or business", FR: "Travail, projet ou entreprise", DE: "Arbeit, Projekt oder Geschäft", PT: "Trabalho, projeto ou negócio" },
  "Obstáculo económico": { EN: "Financial obstacle", FR: "Obstacle économique", DE: "Finanzielle Blockade", PT: "Obstáculo econômico" },
  "Cambio personal": { EN: "Personal change", FR: "Changement personnel", DE: "Persönliche Veränderung", PT: "Mudança pessoal" },
  "Atravesar una transición": { EN: "Crossing a transition", FR: "Traverser une transition", DE: "Eine Transition durchqueren", PT: "Atravessar uma transição" },
  "Consulta profunda del proceso": { EN: "Deep consultation of process", FR: "Consultation profonde du processus", DE: "Tiefe Konsultation des Prozesses", PT: "Consulta profunda do processo" },
};

// Rune Spread Group Titles: ES → { EN, FR, DE, PT }
const runeSpreadGroupTranslations: Record<string, Record<string, string>> = {
  "Tiradas rápidas": { EN: "Quick spreads", FR: "Tirages rapides", DE: "Schnelle Legungen", PT: "Tiradas rápidas" },
  "Amor y relaciones": { EN: "Love and relationships", FR: "Amour et relations", DE: "Liebe und Beziehungen", PT: "Amor e relações" },
  "Decisiones y proyectos": { EN: "Decisions and projects", FR: "Décisions et projets", DE: "Entscheidungen und Projekte", PT: "Decisões e projetos" },
  "Desarrollo personal": { EN: "Personal development", FR: "Développement personnel", DE: "Persönliche Entwicklung", PT: "Desenvolvimento pessoal" },
  "Tiradas profundas": { EN: "Deep spreads", FR: "Tirages profonds", DE: "Tiefe Legungen", PT: "Tiradas profundas" },
};

// Specific Rune Spreads: ES → { EN, FR, DE, PT }
const runeSpreadNameTranslations: Record<string, Record<string, string>> = {
  "Una runa — mensaje central": { EN: "One rune — central message", FR: "Une rune — message central", DE: "Eine Rune — Zentralbotschaft", PT: "Uma runa — mensagem central" },
  "Dos runas — situación y orientación": { EN: "Two runes — situation and guidance", FR: "Deux runes — situation et orientation", DE: "Zwei Runen — Situation und Orientierung", PT: "Duas runas — situação e orientação" },
  "Sí / No razonado": { EN: "Yes/No reasoned", FR: "Oui/Non raisonné", DE: "Ja/Nein begründet", PT: "Sim/Não razoado" },
  "Las tres Nornas": { EN: "The three Norns", FR: "Les trois Nornes", DE: "Die drei Nornen", PT: "As três Nornas" },
  "Situación, obstáculo y consejo": { EN: "Situation, obstacle, and advice", FR: "Situation, obstacle et conseil", DE: "Situation, Hindernis und Rat", PT: "Situação, obstáculo e conselho" },
  "Espíritu, emoción y acción": { EN: "Spirit, emotion, and action", FR: "Esprit, émotion et action", DE: "Geist, Emotion und Handlung", PT: "Espírito, emoção e ação" },
  "Tú, la otra persona y el vínculo": { EN: "You, the other person, and the bond", FR: "Toi, l'autre personne et le lien", DE: "Du, die andere Person und die Bindung", PT: "Você, a outra pessoa e o vínculo" },
  "Qué siente, qué piensa y qué hará": { EN: "What they feel, think, and will do", FR: "Ce qu'ils ressentent, pensent et feront", DE: "Was sie fühlen, denken und tun werden", PT: "O que sentem, pensam e farão" },
  "Compatibilidad": { EN: "Compatibility", FR: "Compatibilité", DE: "Kompatibilität", PT: "Compatibilidade" },
  "Estado y evolución de la relación": { EN: "State and evolution of the relationship", FR: "État et évolution de la relation", DE: "Zustand und Entwicklung der Beziehung", PT: "Estado e evolução do relacionamento" },
  "Reconciliación o cierre": { EN: "Reconciliation or closure", FR: "Réconciliation ou fermeture", DE: "Versöhnung oder Abschluss", PT: "Reconciliação ou encerramento" },
  "Nueva relación: intención, potencial y precaución": { EN: "New relationship: intention, potential, and caution", FR: "Nouvelle relation: intention, potentiel et prudence", DE: "Neue Beziehung: Absicht, Potenzial und Vorsicht", PT: "Novo relacionamento: intenção, potencial e precaução" },
  "Camino A frente a Camino B": { EN: "Path A vs Path B", FR: "Chemin A vs Chemin B", DE: "Weg A gegen Weg B", PT: "Caminho A vs Caminho B" },
  "Ventajas, riesgos y resultado probable": { EN: "Advantages, risks, and likely outcome", FR: "Avantages, risques et résultat probable", DE: "Vorteile, Risiken und wahrscheinliches Ergebnis", PT: "Vantagens, riscos e resultado provável" },
  "Qué ocurre si actúo / si espero": { EN: "What happens if I act / if I wait", FR: "Que se passe-t-il si j'agis / si j'attends", DE: "Was geschieht, wenn ich handle / wenn ich warte", PT: "O que acontece se eu agir / se eu esperar" },
  "Cruz rúnica — 5 runas": { EN: "Rune cross — 5 runes", FR: "Croix runique — 5 runes", DE: "Runisches Kreuz — 5 Runen", PT: "Cruz rúnica — 5 runas" },
  "Decisión — 7 runas": { EN: "Decision — 7 runes", FR: "Décision — 7 runes", DE: "Entscheidung — 7 Runen", PT: "Decisão — 7 runas" },
  "Sombra, aprendizaje y recurso": { EN: "Shadow, learning, and resource", FR: "Ombre, apprentissage et ressource", DE: "Schatten, Lernen und Ressource", PT: "Sombra, aprendizado e recurso" },
  "Bloqueo emocional": { EN: "Emotional blockage", FR: "Blocage émotionnel", DE: "Emotionale Blockierung", PT: "Bloqueio emocional" },
  "Propósito del momento": { EN: "Purpose of the moment", FR: "Objectif du moment", DE: "Zweck des Moments", PT: "Propósito do momento" },
  "Ciclo que termina y ciclo que comienza": { EN: "Cycle ending and cycle beginning", FR: "Cycle qui se termine et cycle qui commence", DE: "Endzyklus und Neuzyklus", PT: "Ciclo terminando e ciclo começando" },
  "Herida, conciencia e integración": { EN: "Wound, awareness, and integration", FR: "Blessure, conscience et intégration", DE: "Wunde, Bewusstsein und Integration", PT: "Ferida, consciência e integração" },
};

export type Language = "ES" | "EN" | "FR" | "DE" | "PT";

export function translateSpreadName(spanishName: string, t?: (key: string) => string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishName;
  // Try rune spreads first, then general spreads
  return runeSpreadNameTranslations[spanishName]?.[lang] || spreadNameTranslations[spanishName]?.[lang] || spanishName;
}

export function translatePositionLabel(spanishLabel: string, t?: (key: string) => string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishLabel;
  return positionLabelTranslations[spanishLabel]?.[lang] || spanishLabel;
}

export function translateIChingConsultation(spanishName: string, t?: (key: string) => string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishName;
  return ichingConsultationTranslations[spanishName]?.[lang] || spanishName;
}

export function translateRuneName(spanishName: string, t?: (key: string) => string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishName;
  return runeSpreadGroupTranslations[spanishName]?.[lang] || spanishName;
}

// Translations for rune spread descriptions
const runeSpreadDescriptionTranslations: Record<string, Record<string, string>> = {
  "La fuerza que merece atención ahora.": { EN: "The strength that deserves attention now.", FR: "La force qui mérite de l'attention maintenant.", DE: "Die Stärke, die jetzt Aufmerksamkeit verdient.", PT: "A força que merece atenção agora." },
  "Lo que ocurre y la respuesta más útil.": { EN: "What happens and the most useful response.", FR: "Ce qui se passe et la réponse la plus utile.", DE: "Was passiert und die nützlichste Antwort.", PT: "O que ocorre e a resposta mais útil." },
  "Respuesta, condición y advertencia.": { EN: "Answer, condition, and warning.", FR: "Réponse, condition et avertissement.", DE: "Antwort, Bedingung und Warnung.", PT: "Resposta, condição e aviso." },
  "Origen, presente y evolución probable.": { EN: "Origin, present, and likely evolution.", FR: "Origine, présent et évolution probable.", DE: "Ursprung, Gegenwart und wahrscheinliche Entwicklung.", PT: "Origem, presente e evolução provável." },
  "El asunto, su dificultad y una respuesta concreta.": { EN: "The matter, its difficulty, and a concrete response.", FR: "Le sujet, sa difficulté et une réponse concrète.", DE: "Die Angelegenheit, ihre Schwierigkeit und eine konkrete Antwort.", PT: "A questão, sua dificuldade e uma resposta concreta." },
  "Tres planos que no deben confundirse.": { EN: "Three planes that must not be confused.", FR: "Trois plans qui ne doivent pas être confondus.", DE: "Drei Ebenen, die nicht verwechselt werden dürfen.", PT: "Três planos que não devem ser confundidos." },
  "Qué sostener, qué dejar y qué poner en marcha.": { EN: "What to sustain, release, and set in motion.", FR: "Ce qu'il faut soutenir, lâcher et mettre en mouvement.", DE: "Was zu halten, loszulassen und in Bewegung zu setzen ist.", PT: "O que sustentar, soltar e colocar em movimento." },
  "Las partes y la dinámica que construyen.": { EN: "The parts and the dynamic they build.", FR: "Les parties et la dynamique qu'elles construisent.", DE: "Die Teile und die Dynamik, die sie aufbauen.", PT: "As partes e a dinâmica que constroem." },
  "Emoción, evaluación y conducta probable.": { EN: "Emotion, evaluation, and probable behavior.", FR: "Émotion, évaluation et comportement probable.", DE: "Emotion, Bewertung und wahrscheinliches Verhalten.", PT: "Emoção, avaliação e comportamento provável." },
  "Presente, dificultad, recurso, acción y tendencia.": { EN: "Present, difficulty, resource, action, and tendency.", FR: "Présent, difficulté, ressource, action et tendance.", DE: "Gegenwart, Schwierigkeit, Ressource, Handlung und Tendenz.", PT: "Presente, dificuldade, recurso, ação e tendência." },
  "Lo que une, lo que separa y el camino más sano.": { EN: "What unites, what separates, and the healthiest path.", FR: "Ce qui unit, ce qui sépare et le chemin le plus sain.", DE: "Was verbindet, was trennt und der gesündeste Weg.", PT: "O que une, o que separa e o caminho mais saudável." },
  "Una mirada concreta al inicio de un vínculo.": { EN: "A concrete look at the beginning of a bond.", FR: "Un regard concret sur le début d'un lien.", DE: "Ein konkreter Blick auf den Beginn einer Bindung.", PT: "Um olhar concreto no início de um vínculo." },
  "Condiciones y resultados de dos alternativas.": { EN: "Conditions and results of two alternatives.", FR: "Conditions et résultats de deux alternatives.", DE: "Bedingungen und Ergebnisse zweier Alternativen.", PT: "Condições e resultados de duas alternativas." },
  "Consecuencias probables de intervenir o esperar.": { EN: "Probable consequences of acting or waiting.", FR: "Conséquences probables d'agir ou d'attendre.", DE: "Wahrscheinliche Folgen des Handelns oder Wartens.", PT: "Consequências prováveis de agir ou esperar." },
  "Lo favorable, el exceso y la respuesta útil.": { EN: "What is favorable, the excess, and the useful response.", FR: "Ce qui est favorable, l'excès et la réponse utile.", DE: "Das Günstige, der Überschuss und die nützliche Antwort.", PT: "O que é favorável, o excesso e a resposta útil." },
  "Centro, causa, dificultad, recurso y dirección.": { EN: "Center, cause, difficulty, resource, and direction.", FR: "Centre, cause, difficulté, ressource et direction.", DE: "Zentrum, Ursache, Schwierigkeit, Ressource und Richtung.", PT: "Centro, causa, dificuldade, recurso e direção." },
  "Una evaluación amplia antes de comprometerte.": { EN: "A broad evaluation before committing.", FR: "Une évaluation large avant de s'engager.", DE: "Eine umfassende Bewertung vor der Verpflichtung.", PT: "Uma avaliação ampla antes de se comprometer." },
  "El patrón, su enseñanza y la capacidad disponible.": { EN: "The pattern, its teaching, and available capacity.", FR: "Le schéma, son enseignement et la capacité disponible.", DE: "Das Muster, seine Lehre und die verfügbare Kapazität.", PT: "O padrão, seu ensinamento e a capacidade disponível." },
  "Dónde se detiene el movimiento y cómo recuperarlo.": { EN: "Where movement stops and how to recover it.", FR: "Où le mouvement s'arrête et comment le récupérer.", DE: "Wo die Bewegung stoppiert und wie man sie wiederherstellt.", PT: "Onde o movimento para e como recuperá-lo." },
  "Capacidad, prueba y dirección significativa.": { EN: "Capacity, test, and meaningful direction.", FR: "Capacité, épreuve et direction significative.", DE: "Kapazität, Prüfung und bedeutungsvolle Richtung.", PT: "Capacidade, teste e direção significativa." },
  "El cierre, el umbral y el nuevo movimiento.": { EN: "The closure, the threshold, and the new movement.", FR: "La fermeture, le seuil et le nouveau mouvement.", DE: "Der Abschluss, die Schwelle und die neue Bewegung.", PT: "O fechamento, o limiar e o novo movimento." },
  "Un mapa del asunto, sus fuerzas y su desenlace condicionado.": { EN: "A map of the matter, its forces and its conditioned outcome.", FR: "Une carte de la question, ses forces et son résultat conditionné.", DE: "Eine Karte der Angelegenheit, ihrer Kräfte und ihres bedingten Ergebnisses.", PT: "Um mapa da questão, suas forças e seu resultado condicionado." },
  "Nueve niveles simbólicos de una misma situación.": { EN: "Nine symbolic levels of the same situation.", FR: "Neuf niveaux symboliques de la même situation.", DE: "Neun symbolische Ebenen der gleichen Situation.", PT: "Nove níveis simbólicos da mesma situação." },
  "Doce movimientos para observar el ritmo de un ciclo.": { EN: "Twelve movements to observe the rhythm of a cycle.", FR: "Douze mouvements pour observer le rythme d'un cycle.", DE: "Zwölf Bewegungen zur Beobachtung des Rhythmus eines Zyklus.", PT: "Doze movimentos para observar o ritmo de um ciclo." },
  "Qué sostener, qué dejar y qué poner en marcha.": { EN: "What to keep, release, and set in motion.", FR: "Ce qu'il faut garder, lâcher et mettre en mouvement.", DE: "Was zu halten, loszulassen und in Bewegung zu setzen ist.", PT: "O que manter, soltar e colocar em movimento." },
};

export function translateSpreadDescription(spanishDescription: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishDescription;
  return runeSpreadDescriptionTranslations[spanishDescription]?.[lang] || spanishDescription;
}

// I Ching consultation descriptions
const ichingConsultDescriptionTranslations: Record<string, Record<string, string>> = {
  "La cualidad central del presente y cómo responder.": { EN: "The central quality of the present and how to respond.", FR: "La qualité centrale du présent et comment répondre.", DE: "Die zentrale Qualität der Gegenwart und wie man reagiert.", PT: "A qualidade central do presente e como responder." },
  "Orientación, condición y advertencia para una pregunta concreta.": { EN: "Guidance, condition, and warning for a specific question.", FR: "Orientation, condition et avertissement pour une question précise.", DE: "Orientierung, Bedingung und Warnung für eine bestimmte Frage.", PT: "Orientação, condição e aviso para uma pergunta específica." },
  "Estado actual, cambio activo y dirección resultante.": { EN: "Current state, active change, and resulting direction.", FR: "État actuel, changement actif et direction résultante.", DE: "Aktueller Zustand, aktive Veränderung und resultierende Richtung.", PT: "Estado atual, mudança ativa e direção resultante." },
  "Recursos, resistencias y punto de ajuste.": { EN: "Resources, resistances, and point of adjustment.", FR: "Ressources, résistances et point d'ajustement.", DE: "Ressourcen, Widerstände und Anpassungspunkt.", PT: "Recursos, resistências e ponto de ajuste." },
  "El criterio que permite comparar sin forzar una respuesta binaria.": { EN: "The criterion that allows comparison without forcing a binary answer.", FR: "Le critère qui permet la comparaison sans forcer une réponse binaire.", DE: "Das Kriterium, das einen Vergleich ermöglicht, ohne eine binäre Antwort zu erzwingen.", PT: "O critério que permite comparação sem forçar uma resposta binária." },
  "Consecuencias de intervenir en las condiciones actuales.": { EN: "Consequences of intervening in current conditions.", FR: "Conséquences d'intervenir dans les conditions actuelles.", DE: "Folgen der Einmischung in aktuelle Bedingungen.", PT: "Consequências de intervir nas condições atuais." },
  "Lo que puede madurar y lo que podría estancarse.": { EN: "What can mature and what might stagnate.", FR: "Ce qui peut mûrir et ce qui pourrait stagner.", DE: "Was reifen kann und was stagnieren könnte.", PT: "O que pode amadurecer e o que poderia estagnar." },
  "Dinámica presente, cambio y cuidado necesario.": { EN: "Present dynamics, change, and necessary care.", FR: "Dynamique présente, changement et soin nécessaire.", DE: "Gegenwärtige Dynamik, Veränderung und notwendige Pflege.", PT: "Dinâmica presente, mudança e cuidado necessário." },
  "Qué mantiene la tensión y qué permitiría repararla.": { EN: "What maintains tension and what would allow repair.", FR: "Ce qui maintient la tension et ce qui permettrait la réparation.", DE: "Was die Spannung aufrechterhält und was eine Reparatur ermöglichen würde.", PT: "O que mantém a tensão e o que permitiria o reparo." },
  "Condiciones, desarrollo y estrategia práctica.": { EN: "Conditions, development, and practical strategy.", FR: "Conditions, développement et stratégie pratique.", DE: "Bedingungen, Entwicklung und praktische Strategie.", PT: "Condições, desenvolvimento e estratégia prática." },
  "La restricción, su origen y el movimiento posible.": { EN: "The restriction, its origin, and possible movement.", FR: "La restriction, son origine et le mouvement possible.", DE: "Die Einschränkung, ihr Ursprung und mögliche Bewegung.", PT: "A restrição, sua origem e o movimento possível." },
  "Qué identidad cambia y qué actitud necesita nacer.": { EN: "What identity changes and what attitude needs to be born.", FR: "Quelle identité change et quelle attitude doit naître.", DE: "Welche Identität sich ändert und welche Haltung geboren werden muss.", PT: "Que identidade muda e que atitude precisa nascer." },
  "Umbral, riesgo y conducta que ayuda a cruzarlo.": { EN: "Threshold, risk, and behavior that helps cross it.", FR: "Seuil, risque et comportement qui aide à le franchir.", DE: "Schwelle, Risiko und Verhalten, das dabei hilft, sie zu überschreiten.", PT: "Limiar, risco e comportamento que ajuda a cruzá-lo." },
  "Hexagrama principal, núcleo, líneas mutantes y transformación.": { EN: "Primary hexagram, core, changing lines, and transformation.", FR: "Hexagramme principal, noyau, lignes changeantes et transformation.", DE: "Primäres Hexagramm, Kern, veränder Linien und Transformation.", PT: "Hexagrama primário, núcleo, linhas mutáveis e transformação." },
};

export function translateIChingConsultDescription(spanishDescription: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishDescription;
  return ichingConsultDescriptionTranslations[spanishDescription]?.[lang] || spanishDescription;
}

// I Ching hexagram names translations (64 hexagrams)
const ichingHexagramTranslations: Record<string, Record<string, string>> = {
  "Lo Creativo": { EN: "The Creative", FR: "Le Créatif", DE: "Das Schöpferische", PT: "O Criativo" },
  "Lo Receptivo": { EN: "The Receptive", FR: "Le Réceptif", DE: "Das Empfangende", PT: "O Receptivo" },
  "La Dificultad Inicial": { EN: "Difficulty at the Beginning", FR: "La Difficulté Initiale", DE: "Schwierigkeit am Anfang", PT: "Dificuldade no Início" },
  "La Necedad Juvenil": { EN: "Youthful Folly", FR: "La Folie Juvénile", DE: "Jugendliche Dummheit", PT: "Ingenuidade Juvenil" },
  "La Espera": { EN: "Waiting", FR: "L'Attente", DE: "Das Warten", PT: "A Espera" },
  "El Conflicto": { EN: "Conflict", FR: "Le Conflit", DE: "Der Konflikt", PT: "O Conflito" },
  "El Ejército": { EN: "The Army", FR: "L'Armée", DE: "Die Armee", PT: "O Exército" },
  "La Solidaridad": { EN: "Holding Together", FR: "La Solidarité", DE: "Zusammenhalt", PT: "A Solidariedade" },
  "La Fuerza Domesticadora de lo Pequeño": { EN: "The Taming Power of the Small", FR: "La Force Domesticatrice du Petit", DE: "Die Zähmungskraft des Kleinen", PT: "O Poder Domesticador do Pequeno" },
  "El Porte": { EN: "Treading", FR: "La Foulée", DE: "Das Schreiten", PT: "O Passo" },
  "La Paz": { EN: "Peace", FR: "La Paix", DE: "Der Frieden", PT: "A Paz" },
  "El Estancamiento": { EN: "Standstill", FR: "La Stagnation", DE: "Der Stillstand", PT: "A Estagnação" },
  "Comunidad con los Hombres": { EN: "Fellowship with Men", FR: "Communauté avec les Hommes", DE: "Gemeinschaft mit Menschen", PT: "Comunidade com os Homens" },
  "La Posesión de lo Grande": { EN: "Possession of the Great", FR: "La Possession du Grand", DE: "Der Besitz des Großen", PT: "A Posse do Grande" },
  "La Modestia": { EN: "Modesty", FR: "La Modestie", DE: "Die Bescheidenheit", PT: "A Modéstia" },
  "El Entusiasmo": { EN: "Enthusiasm", FR: "L'Enthousiasme", DE: "Die Begeisterung", PT: "O Entusiasmo" },
  "El Seguimiento": { EN: "Following", FR: "Le Suivi", DE: "Das Folgen", PT: "O Seguimento" },
  "El Trabajo en lo Echado a Perder": { EN: "Work on the Spoilt", FR: "Le Travail sur le Gâché", DE: "Arbeit am Verdorbenen", PT: "Trabalho no Estrago" },
  "El Acercamiento": { EN: "Approach", FR: "L'Approche", DE: "Die Annäherung", PT: "A Aproximação" },
  "La Contemplación": { EN: "Contemplation", FR: "La Contemplation", DE: "Die Betrachtung", PT: "A Contemplação" },
  "La Mordedura Tajante": { EN: "Biting Through", FR: "La Morsure Tranchante", DE: "Das Beißen durch", PT: "A Mordida Cortante" },
  "La Gracia": { EN: "Grace", FR: "La Grâce", DE: "Die Anmut", PT: "A Graça" },
  "La Desintegración": { EN: "Splitting Apart", FR: "La Désintégration", DE: "Der Zerfall", PT: "A Desintegração" },
  "El Retorno": { EN: "Return", FR: "Le Retour", DE: "Die Rückkehr", PT: "O Retorno" },
  "La Inocencia": { EN: "Innocence", FR: "L'Innocence", DE: "Die Unschuld", PT: "A Inocência" },
  "La Fuerza Domesticadora de lo Grande": { EN: "The Taming Power of the Great", FR: "La Force Domesticatrice du Grand", DE: "Die Zähmungskraft des Großen", PT: "O Poder Domesticador do Grande" },
  "Las Comisuras de la Boca": { EN: "Nourishment", FR: "Les Coins de la Bouche", DE: "Die Mundwinkel", PT: "Os Cantos da Boca" },
  "La Preponderancia de lo Grande": { EN: "Preponderance of the Great", FR: "La Prédominance du Grand", DE: "Das Übergewicht des Großen", PT: "A Preponderância do Grande" },
  "Lo Abismal": { EN: "The Abysmal", FR: "L'Abyssal", DE: "Das Abgründige", PT: "O Abissal" },
  "Lo Adherente": { EN: "The Clinging", FR: "L'Adhérent", DE: "Das Haftende", PT: "O Aderente" },
  "El Influjo": { EN: "Influence", FR: "L'Influence", DE: "Der Einfluss", PT: "A Influência" },
  "La Duración": { EN: "Duration", FR: "La Durée", DE: "Die Dauer", PT: "A Duração" },
  "La Retirada": { EN: "Retreat", FR: "La Retraite", DE: "Der Rückzug", PT: "A Retirada" },
  "El Poder de lo Grande": { EN: "Power of the Great", FR: "Le Pouvoir du Grand", DE: "Die Kraft des Großen", PT: "O Poder do Grande" },
  "El Progreso": { EN: "Progress", FR: "Le Progrès", DE: "Der Fortschritt", PT: "O Progresso" },
  "El Oscurecimiento de la Luz": { EN: "Darkening of the Light", FR: "L'Obscurcissement de la Lumière", DE: "Die Verdunkelung des Lichts", PT: "O Escurecimento da Luz" },
  "El Clan": { EN: "The Family", FR: "Le Clan", DE: "Die Familie", PT: "O Clã" },
  "La Oposición": { EN: "Opposition", FR: "L'Opposition", DE: "Der Gegensatz", PT: "A Oposição" },
  "El Impedimento": { EN: "Obstruction", FR: "L'Obstruction", DE: "Die Behinderung", PT: "O Impedimento" },
  "La Liberación": { EN: "Deliverance", FR: "La Libération", DE: "Die Befreiung", PT: "A Libertação" },
  "La Merma": { EN: "Decrease", FR: "La Réduction", DE: "Die Verminderung", PT: "A Redução" },
  "El Aumento": { EN: "Increase", FR: "L'Augmentation", DE: "Die Vermehrung", PT: "O Aumento" },
  "El Desbordamiento": { EN: "Breaking Through", FR: "Le Débordement", DE: "Der Durchbruch", PT: "O Transbordamento" },
  "Ir al Encuentro": { EN: "Coming to Meet", FR: "Aller à la Rencontre", DE: "Entgegenkommen", PT: "Ir ao Encontro" },
  "La Reunión": { EN: "Gathering Together", FR: "La Réunion", DE: "Versammlung", PT: "A Reunião" },
  "La Subida": { EN: "Ascending", FR: "La Montée", DE: "Das Aufsteigen", PT: "A Ascensão" },
  "La Desazón": { EN: "Oppression", FR: "Le Malaise", DE: "Die Bedrängnis", PT: "O Incômodo" },
  "El Pozo": { EN: "The Well", FR: "Le Puits", DE: "Der Brunnen", PT: "O Poço" },
  "La Revolución": { EN: "Revolution", FR: "La Révolution", DE: "Die Revolution", PT: "A Revolução" },
  "El Caldero": { EN: "The Cauldron", FR: "Le Chaudron", DE: "Der Kessel", PT: "O Caldeirão" },
  "Lo Suscitativo": { EN: "The Arousing", FR: "Le Suscitant", DE: "Das Erregende", PT: "O Suscitante" },
  "El Aquietamiento": { EN: "Keeping Still", FR: "L'Apaisement", DE: "Das Stillehalten", PT: "O Acalmar" },
  "La Evolución": { EN: "Development", FR: "L'Évolution", DE: "Die Entwicklung", PT: "A Evolução" },
  "La Muchacha que se Casa": { EN: "The Marrying Maiden", FR: "La Jeune Fille qui se Marie", DE: "Das heiratende Mädchen", PT: "A Rapariga que se Casa" },
  "La Plenitud": { EN: "Abundance", FR: "La Plénitude", DE: "Die Fülle", PT: "A Plenitude" },
  "El Andariego": { EN: "The Wanderer", FR: "L'Andariego", DE: "Der Wanderer", PT: "O Andarilho" },
  "Lo Suave": { EN: "The Gentle", FR: "Le Doux", DE: "Das Sanfte", PT: "O Suave" },
  "Lo Sereno": { EN: "The Joyous", FR: "Le Serein", DE: "Das Heitere", PT: "O Sereno" },
  "La Disolución": { EN: "Dissolution", FR: "La Dissolution", DE: "Die Auflösung", PT: "A Dissolução" },
  "La Restricción": { EN: "Limitation", FR: "La Restriction", DE: "Die Begrenzung", PT: "A Restrição" },
  "La Verdad Interior": { EN: "Inner Truth", FR: "La Vérité Intérieure", DE: "Die innere Wahrheit", PT: "A Verdade Interior" },
  "La Preponderancia de lo Pequeño": { EN: "Preponderance of the Small", FR: "La Prédominance du Petit", DE: "Das Übergewicht des Kleinen", PT: "A Preponderância do Pequeno" },
  "Después de la Consumación": { EN: "After Completion", FR: "Après la Consommation", DE: "Nach der Erfüllung", PT: "Depois da Consumação" },
  "Antes de la Consumación": { EN: "Before Completion", FR: "Avant la Consommation", DE: "Vor der Erfüllung", PT: "Antes da Consumação" },
};

export function translateIChingHexagram(spanishName: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishName;
  return ichingHexagramTranslations[spanishName]?.[lang] || spanishName;
}

// Tarot reading intro messages
const tarotIntroTranslations: Record<string, Record<string, string>> = {
  "Tomando en cuenta lo que compartiste, la lectura organiza la situación así:": { EN: "Taking into account what you shared, the reading organizes the situation like this:", FR: "En tenant compte de ce que vous avez partagé, la lecture organise la situation comme ceci :", DE: "Unter Berücksichtigung dessen, was Sie mitgeteilt haben, organisiert die Lesung die Situation folgendermaßen:", PT: "Levando em conta o que você compartilhou, a leitura organiza a situação assim:" },
  "La lectura organiza la situación así:": { EN: "The reading organizes the situation like this:", FR: "La lecture organise la situation comme ceci :", DE: "Die Lesung organisiert die Situation folgendermaßen:", PT: "A leitura organiza a situação assim:" },
  "Tarot": { EN: "Tarot", FR: "Tarot", DE: "Tarot", PT: "Tarô" },
  "cartas": { EN: "cards", FR: "cartes", DE: "Karten", PT: "cartas" },
  "carta": { EN: "card", FR: "carte", DE: "Karte", PT: "carta" },
};

// Rune system messages
const runeSystemTranslations: Record<string, Record<string, string>> = {
  "Antes de tocar la bolsa de las Runas, concéntrate en qué quieres saber.": { EN: "Before touching the rune bag, focus on what you want to know.", FR: "Avant de toucher le sac des Runes, concentrez-vous sur ce que vous voulez savoir.", DE: "Bevor Sie den Runensack berühren, konzentrieren Sie sich auf das, was Sie wissen möchten.", PT: "Antes de tocar o saco de Runas, concentre-se no que você quer saber." },
  "Toca de nuevo para tomar las runas": { EN: "Touch again to draw the runes", FR: "Touchez à nouveau pour tirer les runes", DE: "Erneut berühren, um die Runen zu ziehen", PT: "Toque novamente para desenhar as runas" },
  "Toca la bolsa para mezclar las runas": { EN: "Touch the bag to shuffle the runes", FR: "Touchez le sac pour mélanger les runes", DE: "Berühren Sie den Sack, um die Runen zu mischen", PT: "Toque o saco para embaralhar as runas" },
  "Runas · Situación / obstáculo / consejo": { EN: "Runes · Situation / obstacle / advice", FR: "Runes · Situation / obstacle / conseil", DE: "Runen · Situation / Hindernis / Rat", PT: "Runas · Situação / obstáculo / conselho" },
};

export function translateTarotIntro(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return tarotIntroTranslations[spanishText]?.[lang] || spanishText;
}

export function translateRuneSystem(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return runeSystemTranslations[spanishText]?.[lang] || spanishText;
}

// Angels interpretation messages
const angelInterpretationTranslations: Record<string, Record<string, string>> = {
  "Para tu pregunta": { EN: "For your question", FR: "Pour votre question", DE: "Für Ihre Frage", PT: "Para sua pergunta" },
  "en": { EN: "in", FR: "en", DE: "in", PT: "em" },
  "aparece": { EN: "appears", FR: "apparaît", DE: "erscheint", PT: "aparece" },
  "el mensaje invita a explorar": { EN: "the message invites you to explore", FR: "le message vous invite à explorer", DE: "die Botschaft lädt Sie ein, zu erforschen", PT: "a mensagem convida você a explorar" },
  "Esta orientación es simbólica": { EN: "This guidance is symbolic", FR: "Cette orientation est symbolique", DE: "Diese Orientierung ist symbolisch", PT: "Esta orientação é simbólica" },
  "úsala como una pregunta de reflexión y contrástala con tu situación real": { EN: "use it as a question for reflection and contrast it with your real situation", FR: "utilisez-la comme une question de réflexion et contrастez-la avec votre situation réelle", DE: "verwenden Sie sie als Reflexionsfrage und vergleichen Sie sie mit Ihrer realen Situation", PT: "use-a como uma questão de reflexão e contraste com sua situação real" },
};

// Numerology interpretation messages
const numerologyInterpretationTranslations: Record<string, Record<string, string>> = {
  "Perfil numerológico": { EN: "Numerological Profile", FR: "Profil numérologigue", DE: "Numerologisches Profil", PT: "Perfil Numerológico" },
  "Cálculo determinista basado en el nombre y fecha proporcionados": { EN: "Deterministic calculation based on the name and date provided", FR: "Calcul déterministe basé sur le nom et la date fournis", DE: "Deterministische Berechnung auf Basis des angegebenen Namens und Datums", PT: "Cálculo determinístico baseado no nome e data fornecidos" },
  "Camino de Vida": { EN: "Life Path", FR: "Chemin de Vie", DE: "Lebensweg", PT: "Caminho de Vida" },
  "Expresión": { EN: "Expression", FR: "Expression", DE: "Ausdruck", PT: "Expressão" },
  "Alma": { EN: "Soul", FR: "Âme", DE: "Seele", PT: "Alma" },
};

// IChing interpretation messages
const ichingInterpretationTranslations: Record<string, Record<string, string>> = {
  "El hexagrama": { EN: "The hexagram", FR: "L'hexagramme", DE: "Das Hexagramm", PT: "O hexagrama" },
  "transforma hacia el": { EN: "transforms toward the", FR: "se transforme vers le", DE: "verwandelt sich zum", PT: "se transforma para o" },
  "permanece estable": { EN: "remains stable", FR: "reste stable", DE: "bleibt stabil", PT: "permanece estável" },
  "La lectura funciona como orientación simbólica sobre": { EN: "The reading works as symbolic guidance about", FR: "La lecture fonctionne comme orientation symbolique sur", DE: "Die Lesung funktioniert als symbolische Orientierung über", PT: "A leitura funciona como orientação simbólica sobre" },
};

// Radiesthesia interpretation messages
const radiesthesiaInterpretationTranslations: Record<string, Record<string, string>> = {
  "El péndulo responde a tu pregunta con": { EN: "The pendulum responds to your question with", FR: "Le pendule répond à votre question avec", DE: "Das Pendel antwortet auf Ihre Frage mit", PT: "O pêndulo responde à sua pergunta com" },
  "a una intensidad del": { EN: "at an intensity of", FR: "à une intensité de", DE: "mit einer Intensität von", PT: "com uma intensidade de" },
  "En la radiestesia, el movimiento es un reflejo del campo energético": { EN: "In radiesthesia, movement is a reflection of the energetic field", FR: "En radiesthésie, le mouvement est un reflet du champ énergétique", DE: "In der Radiästhesie ist Bewegung eine Reflexion des energetischen Feldes", PT: "Em radiestesia, o movimento é um reflexo do campo energético" },
  "usa esta información como orientación simbólica para reflexionar sobre tu pregunta": { EN: "use this information as symbolic guidance to reflect on your question", FR: "utilisez cette information comme orientation symbolique pour réfléchir à votre question", DE: "verwenden Sie diese Information als symbolische Orientierung, um über Ihre Frage nachzudenken", PT: "use esta informação como orientação simbólica para refletir sobre sua pergunta" },
};

export function translateAngelInterpretation(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return angelInterpretationTranslations[spanishText]?.[lang] || spanishText;
}

export function translateNumerologyInterpretation(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return numerologyInterpretationTranslations[spanishText]?.[lang] || spanishText;
}

export function translateIChingInterpretation(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return ichingInterpretationTranslations[spanishText]?.[lang] || spanishText;
}

export function translateRadiesthesiaInterpretation(spanishText: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishText;
  return radiesthesiaInterpretationTranslations[spanishText]?.[lang] || spanishText;
}

// Reading title translations (from interpretRuneSpread, analyzeTarotReading, etc)
const readingTitleTranslations: Record<string, Record<string, string>> = {
  "Lo que esta tirada muestra": { EN: "What this spread shows", FR: "Ce que montre cette tirada", DE: "Was dieser Spread zeigt", PT: "O que este spread mostra" },
  "La historia que forman las runas": { EN: "The story the runes tell", FR: "L'histoire que racontent les runes", DE: "Die Geschichte, die die Runen erzählen", PT: "A história que as runas contam" },
  "Del patrón a la respuesta": { EN: "From pattern to answer", FR: "Du schéma à la réponse", DE: "Vom Muster zur Antwort", PT: "Do padrão à resposta" },
  "La situación y su posible salida": { EN: "The situation and its possible way out", FR: "La situation et sa sortie possible", DE: "Die Situation und ein möglicher Ausweg", PT: "A situação e sua possível saída" },
  "Comparación de alternativas": { EN: "Comparison of alternatives", FR: "Comparaison des alternatives", DE: "Vergleich von Alternativen", PT: "Comparação de alternativas" },
  "La oportunidad y cómo aprovecharla": { EN: "The opportunity and how to seize it", FR: "L'opportunité et comment en profiter", DE: "Die Gelegenheit und wie man sie nutzt", PT: "A oportunidade e como aproveitá-la" },
  "Emoción, pensamiento y conducta": { EN: "Emotion, thought, and behavior", FR: "Émotion, pensée et comportement", DE: "Emotion, Gedanke und Verhalten", PT: "Emoção, pensamento e comportamento" },
  "Respuesta razonada": { EN: "Reasoned answer", FR: "Réponse raisonnée", DE: "Begründete Antwort", PT: "Resposta razoada" },
  "Mensaje central": { EN: "Central message", FR: "Message central", DE: "Zentralbotschaft", PT: "Mensagem central" },
  "La lectura": { EN: "The reading", FR: "La lecture", DE: "Die Lesung", PT: "A leitura" },
  "Lectura profunda": { EN: "Deep reading", FR: "Lecture profonde", DE: "Tiefes Lesen", PT: "Leitura profunda" },
  "Consejo de las Runas": { EN: "Rune counsel", FR: "Conseil des Runes", DE: "Runenrat", PT: "Conselho das Runas" },
  "La sabiduría del cambio": { EN: "The wisdom of change", FR: "La sagesse du changement", DE: "Die Weisheit der Veränderung", PT: "A sabedoria da mudança" },
  "Interpretación": { EN: "Interpretation", FR: "Interprétation", DE: "Interpretation", PT: "Interpretação" },
};

export function translateReadingTitle(spanishTitle: string, lang: Language = "ES"): string {
  if (lang === "ES") return spanishTitle;
  return readingTitleTranslations[spanishTitle]?.[lang] || spanishTitle;
}
