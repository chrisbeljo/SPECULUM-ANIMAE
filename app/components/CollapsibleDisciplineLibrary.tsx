"use client";

import { useId, useState } from "react";
import type { Language } from "../translations";
import { DisciplineLibrary, type DisciplineLibraryItem } from "./DisciplineLibrary";
import "./collapsible-discipline-library.css";

const labels: Record<Language, { open: string; close: string; hint: string }> = {
  ES: { open: "Abrir biblioteca de la disciplina", close: "Cerrar biblioteca de la disciplina", hint: "Consulta símbolos, imágenes y elementos de referencia" },
  EN: { open: "Open discipline library", close: "Close discipline library", hint: "Explore symbols, images, and reference elements" },
  FR: { open: "Ouvrir la bibliothèque de la discipline", close: "Fermer la bibliothèque de la discipline", hint: "Consultez les symboles, images et éléments de référence" },
  DE: { open: "Bibliothek der Disziplin öffnen", close: "Bibliothek der Disziplin schließen", hint: "Symbole, Bilder und Referenzelemente ansehen" },
  PT: { open: "Abrir biblioteca da disciplina", close: "Fechar biblioteca da disciplina", hint: "Consulte símbolos, imagens e elementos de referência" },
};

export function CollapsibleDisciplineLibrary({ lang, items, title }: { lang: Language; items: DisciplineLibraryItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  const text = labels[lang];

  return <section className={`collapsible-discipline-library ${open ? "is-open" : ""}`}>
    <button type="button" className="discipline-library-toggle" aria-expanded={open} aria-controls={regionId} onClick={() => setOpen(value => !value)}>
      <span><small>{text.hint}</small><strong>{open ? text.close : text.open}</strong></span>
      <i aria-hidden="true">{open ? "−" : "+"}</i>
    </button>
    {open && <div id={regionId} className="collapsible-discipline-library-content"><DisciplineLibrary lang={lang} items={items} title={title} /></div>}
  </section>;
}
