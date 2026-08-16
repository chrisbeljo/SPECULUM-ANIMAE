"use client";

import { useState } from "react";
import type { Language } from "../translations";
import { ChamalongoCast } from "./ChamalongoCast";

type ChamalongosSiteProps = { lang: Language; onBack: () => void };

const copy: Record<Language, { back: string; eyebrow: string; title: string; intro: string; instruction: string; result: string }> = {
  ES: { back: "Volver al inicio", eyebrow: "CUATRO PIEZAS · UNA CONFIGURACIÓN", title: "Chamalongos", intro: "Una práctica de consulta basada en la disposición visible de cuatro piezas.", instruction: "Respira, mantén tu pregunta presente y toca las manos para realizar la caída.", result: "Configuración obtenida" },
  EN: { back: "Back to home", eyebrow: "FOUR PIECES · ONE PATTERN", title: "Chamalongos", intro: "A consultation practice based on the visible arrangement of four pieces.", instruction: "Breathe, keep your question in mind, and touch the hands to cast.", result: "Pattern obtained" },
  FR: { back: "Retour à l’accueil", eyebrow: "QUATRE PIÈCES · UNE CONFIGURATION", title: "Chamalongos", intro: "Une pratique de consultation fondée sur la disposition visible de quatre pièces.", instruction: "Respirez, gardez votre question présente et touchez les mains pour lancer.", result: "Configuration obtenue" },
  DE: { back: "Zurück zum Anfang", eyebrow: "VIER STÜCKE · EIN MUSTER", title: "Chamalongos", intro: "Eine Beratungspraxis, die auf der sichtbaren Anordnung von vier Stücken beruht.", instruction: "Atmen Sie, behalten Sie Ihre Frage im Sinn und berühren Sie die Hände zum Werfen.", result: "Erhaltenes Muster" },
  PT: { back: "Voltar ao início", eyebrow: "QUATRO PEÇAS · UMA CONFIGURAÇÃO", title: "Chamalongos", intro: "Uma prática de consulta baseada na disposição visível de quatro peças.", instruction: "Respire, mantenha sua pergunta presente e toque as mãos para realizar a queda.", result: "Configuração obtida" },
};

export function ChamalongosSite({ lang, onBack }: ChamalongosSiteProps) {
  const [result, setResult] = useState<Array<"up" | "down"> | null>(null);
  const text = copy[lang];

  return <section className="chamalongos-site">
    <button type="button" className="chamalongos-back" onClick={onBack}>← {text.back}</button>
    <header className="chamalongos-heading"><span>{text.eyebrow}</span><h1>{text.title}</h1><p>{text.intro}</p></header>
    <div className="chamalongos-ritual-shell">
      <p className="chamalongos-guidance">{text.instruction}</p>
      <ChamalongoCast onCastComplete={setResult}/>
      {result&&<div className="chamalongos-result" aria-live="polite"><small>{text.result}</small><strong>{result.filter(face=>face==="up").length} / 4</strong></div>}
    </div>
  </section>;
}
