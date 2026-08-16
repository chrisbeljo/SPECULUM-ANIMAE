"use client";

import { useState } from "react";
import type { Language } from "../translations";
import "./discipline-library.css";

export type DisciplineLibraryItem = { id: string; name: string; category: string; description: string; symbol?: string; image?: string };

const labels: Record<Language, { library: string; explore: string; all: string; choose: string }> = {
  ES: { library: "Biblioteca de la disciplina", explore: "Símbolos, imágenes y elementos de referencia", all: "Biblioteca completa", choose: "Buscar un elemento" },
  EN: { library: "Discipline library", explore: "Symbols, images, and reference elements", all: "Complete library", choose: "Find an element" },
  FR: { library: "Bibliothèque de la discipline", explore: "Symboles, images et éléments de référence", all: "Bibliothèque complète", choose: "Rechercher un élément" },
  DE: { library: "Bibliothek der Disziplin", explore: "Symbole, Bilder und Referenzelemente", all: "Vollständige Bibliothek", choose: "Element suchen" },
  PT: { library: "Biblioteca da disciplina", explore: "Símbolos, imagens e elementos de referência", all: "Biblioteca completa", choose: "Buscar um elemento" },
};

export function DisciplineLibrary({ lang, items, title }: { lang: Language; items: DisciplineLibraryItem[]; title?: string }) {
  const [selected, setSelected] = useState("");
  const text = labels[lang];
  const visible = selected ? items.filter((item) => item.id === selected) : items;

  return <section className="discipline-library" aria-labelledby="discipline-library-title">
    <header className="discipline-library-heading"><span>{title || text.library}</span><h2 id="discipline-library-title">{text.explore}</h2></header>
    <label className="discipline-library-menu"><span>{text.choose}</span><select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">{text.all}</option>{items.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    <div className={`discipline-library-grid ${selected ? "single" : ""}`}>
      {visible.map((item) => <article key={item.id}>{item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <i aria-hidden="true">{item.symbol}</i>}<div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p></div></article>)}
    </div>
  </section>;
}
