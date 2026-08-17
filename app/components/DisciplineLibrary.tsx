"use client";

import { useId, useMemo, useState } from "react";
import type { Language } from "../translations";
import "./discipline-library.css";
import "./discipline-library-performance.css";
import "./discipline-library-ritual-visuals.css";
import "./astro-library-visuals.css";

export type DisciplineLibraryItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  symbol?: string;
  image?: string;
  visual?: "rune" | "hexagram" | "chamalongos" | "chamalongos-coconut" | "astro-medallion";
  tone?: "western" | "eastern" | "numerology";
  pattern?: string;
  up?: number;
};

function LibraryVisual({ item }: { item: DisciplineLibraryItem }) {
  if (item.visual === "rune") return <div className="discipline-library-rune" role="img" aria-label={item.name}><img src="/oracles/rune-token-wood-v3.png" alt="" loading="lazy" decoding="async" /><b>{item.symbol}</b></div>;
  if (item.visual === "hexagram") return <div className="discipline-library-hexagram" role="img" aria-label={item.name}><span>{[...(item.pattern || "")].map((line, index) => <i className={line === "1" ? "yang" : "yin"} key={index}>{line === "1" ? <b /> : <><b /><b /></>}</i>)}</span><em>易</em></div>;
  if (item.visual === "chamalongos") return <div className="discipline-library-chamalongos" role="img" aria-label={item.name}>{Array.from({ length: 4 }, (_, index) => <img src={`/oracles/chamalongos/tiger-cowrie-${index < (item.up || 0) ? "up" : "down"}.webp`} alt="" loading="lazy" decoding="async" key={index} />)}</div>;
  if (item.visual === "chamalongos-coconut") return <div className="discipline-library-coconut" role="img" aria-label={item.name}>{Array.from({ length: 4 }, (_, index) => <i className={index < (item.up || 0) ? "up" : "down"} key={index} />)}</div>;
  if (item.visual === "astro-medallion") return <div className={`discipline-library-astro ${item.tone || "western"}`} role="img" aria-label={item.name}><img src={item.image} alt="" loading="lazy" decoding="async"/><b>{item.symbol}</b></div>;
  if (item.image) return <img src={item.image} alt={item.name} loading="lazy" decoding="async" sizes="(max-width: 520px) 100vw, (max-width: 820px) 50vw, 33vw" />;
  return <i aria-hidden="true">{item.symbol}</i>;
}

const labels: Record<Language, { library: string; explore: string; all: string; choose: string; search: string; category: string; allCategories: string; empty: string }> = {
  ES: { library: "Biblioteca de la disciplina", explore: "Símbolos, imágenes y elementos de referencia", all: "Biblioteca completa", choose: "Mostrar un elemento", search: "Buscar por nombre o significado", category: "Filtrar por categoría", allCategories: "Todas las categorías", empty: "No encontramos elementos con esos filtros." },
  EN: { library: "Discipline library", explore: "Symbols, images, and reference elements", all: "Complete library", choose: "Show one element", search: "Search by name or meaning", category: "Filter by category", allCategories: "All categories", empty: "No elements match these filters." },
  FR: { library: "Bibliothèque de la discipline", explore: "Symboles, images et éléments de référence", all: "Bibliothèque complète", choose: "Afficher un élément", search: "Rechercher par nom ou signification", category: "Filtrer par catégorie", allCategories: "Toutes les catégories", empty: "Aucun élément ne correspond à ces filtres." },
  DE: { library: "Bibliothek der Disziplin", explore: "Symbole, Bilder und Referenzelemente", all: "Vollständige Bibliothek", choose: "Ein Element anzeigen", search: "Nach Name oder Bedeutung suchen", category: "Nach Kategorie filtern", allCategories: "Alle Kategorien", empty: "Keine Elemente entsprechen diesen Filtern." },
  PT: { library: "Biblioteca da disciplina", explore: "Símbolos, imagens e elementos de referência", all: "Biblioteca completa", choose: "Mostrar um elemento", search: "Buscar por nome ou significado", category: "Filtrar por categoria", allCategories: "Todas as categorias", empty: "Nenhum elemento corresponde a esses filtros." },
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function DisciplineLibrary({ lang, items, title }: { lang: Language; items: DisciplineLibraryItem[]; title?: string }) {
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const titleId = useId();
  const text = labels[lang];
  const categories = useMemo(() => [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, lang.toLowerCase())), [items, lang]);
  const visible = useMemo(() => {
    if (selected) return items.filter((item) => item.id === selected);
    const needle = normalize(query.trim());
    return items.filter((item) => (!category || item.category === category) && (!needle || normalize(`${item.name} ${item.category} ${item.description}`).includes(needle)));
  }, [items, selected, query, category]);

  return <section className="discipline-library" aria-labelledby={titleId}>
    <header className="discipline-library-heading"><span>{title || text.library}</span><h2 id={titleId}>{text.explore}</h2></header>
    <div className="discipline-library-tools">
      <label className="discipline-library-search"><span>{text.search}</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setSelected(""); }} placeholder={text.search} /></label>
      <label className="discipline-library-category"><span>{text.category}</span><select value={category} onChange={(event) => { setCategory(event.target.value); setSelected(""); }}><option value="">{text.allCategories}</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      <label className="discipline-library-menu"><span>{text.choose}</span><select value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">{text.all}</option>{items.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
    </div>
    <div className={`discipline-library-grid ${selected ? "single" : ""}`}>
      {visible.map((item) => <article key={item.id}><LibraryVisual item={item} /><div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p></div></article>)}
    </div>
    {!visible.length && <p className="discipline-library-empty" role="status">{text.empty}</p>}
  </section>;
}
