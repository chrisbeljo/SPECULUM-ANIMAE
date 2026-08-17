import { jsPDF } from "jspdf";
import type { Language } from "../translations";
import type { AstroInterpretation } from "./astro-interpretation";
import type { AstroConsultationPayload } from "./AstroConsultationFlow";

const copy: Record<Language, { data: string; calculation: string; synthesis: string; guidance: string; method: string; disclaimer: string; rights: string; filename: string }> = {
  ES: { data: "Datos utilizados", calculation: "Cálculo base", synthesis: "Síntesis", guidance: "Orientación", method: "Método y alcance", disclaimer: "Las interpretaciones ofrecidas tienen fines de entretenimiento, reflexión personal y autoconocimiento. No predicen hechos ni sustituyen asesoramiento médico, psicológico, legal o financiero profesional.", rights: "Todos los derechos reservados", filename: "consulta" },
  EN: { data: "Data used", calculation: "Base calculation", synthesis: "Synthesis", guidance: "Guidance", method: "Method and scope", disclaimer: "The interpretations offered are for entertainment, personal reflection, and self-knowledge purposes. They do not predict facts or substitute professional medical, psychological, legal, or financial advice.", rights: "All rights reserved", filename: "consultation" },
  FR: { data: "Données utilisées", calculation: "Calcul de base", synthesis: "Synthèse", guidance: "Orientation", method: "Méthode et portée", disclaimer: "Les interprétations proposées ont un but de divertissement, de réflexion personnelle et de connaissance de soi. Elles ne prédisent pas de faits et ne remplacent pas un avis médical, psychologique, juridique ou financier professionnel.", rights: "Tous droits réservés", filename: "consultation" },
  DE: { data: "Verwendete Daten", calculation: "Grundberechnung", synthesis: "Synthese", guidance: "Orientierung", method: "Methode und Umfang", disclaimer: "Die angebotenen Deutungen dienen der Unterhaltung, persönlichen Reflexion und Selbsterkenntnis. Sie sagen keine Fakten voraus und ersetzen keine professionelle medizinische, psychologische, rechtliche oder finanzielle Beratung.", rights: "Alle Rechte vorbehalten", filename: "beratung" },
  PT: { data: "Dados utilizados", calculation: "Cálculo base", synthesis: "Síntese", guidance: "Orientação", method: "Método e escopo", disclaimer: "As interpretações oferecidas têm fins de entretenimento, reflexão pessoal e autoconhecimento. Não preveem fatos nem substituem aconselhamento médico, psicológico, legal ou financeiro profissional.", rights: "Todos os direitos reservados", filename: "consulta" },
};

let logoDataUrl: string | null = null;
async function loadLogo(): Promise<string | null> {
  if (logoDataUrl) return logoDataUrl;
  try {
    const response = await fetch("/speculum-animae-logo.png");
    const blob = await response.blob();
    logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return logoDataUrl;
  } catch {
    return null;
  }
}

export async function downloadAstroPdf(opts: {
  lang: Language;
  disciplineTitle: string;
  focus: string;
  interpretation: AstroInterpretation;
  submitted: AstroConsultationPayload;
}) {
  const { lang, disciplineTitle, focus, interpretation, submitted } = opts;
  const t = copy[lang];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size = 13) => {
    ensureSpace(10);
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(90, 70, 30);
    doc.text(text, margin, y);
    y += size * 0.55;
    doc.setTextColor(30, 25, 20);
  };

  const paragraph = (text: string, size = 10.5) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      ensureSpace(size * 0.5);
      doc.text(line, margin, y);
      y += size * 0.5;
    }
    y += 3;
  };

  const logo = await loadLogo();
  if (logo) {
    const logoSize = 22;
    doc.addImage(logo, "PNG", pageWidth / 2 - logoSize / 2, y, logoSize, logoSize);
    y += logoSize + 6;
  }

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 100, 60);
  doc.text("SPECULUM ANIMAE", pageWidth / 2, y, { align: "center" });
  y += 10;
  doc.setTextColor(30, 25, 20);

  heading(`${disciplineTitle} — ${focus}`, 16);
  y += 2;

  heading(t.data, 11);
  paragraph(submitted.birthName || submitted.name);
  paragraph([submitted.birthDate, submitted.birthTime].filter(Boolean).join(" · "));
  paragraph(submitted.birthPlace || "");
  if (submitted.question) paragraph(submitted.question);

  if (interpretation.keys?.length) {
    heading(t.calculation, 11);
    paragraph(interpretation.keys.map((k) => `${k.label}: ${k.value}`).join("   ·   "));
  }

  heading(t.synthesis, 11);
  paragraph(interpretation.summary);

  interpretation.sections?.forEach((section) => {
    heading(section.title, 11);
    paragraph(section.text);
  });

  heading(t.guidance, 11);
  paragraph(interpretation.guidance);

  heading(t.method, 11);
  paragraph(interpretation.method, 9);

  ensureSpace(20);
  y = pageHeight - margin - 14;
  doc.setDrawColor(200, 190, 170);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 100, 90);
  const disclaimerLines = doc.splitTextToSize(t.disclaimer, maxWidth);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 3.4 + 2;
  doc.setFont("helvetica", "normal");
  doc.text(`© ${new Date().getFullYear()} Speculum Animae · ${t.rights}`, margin, y);

  const datePart = submitted.birthDate || new Date().toISOString().slice(0, 10);
  doc.save(`speculum-animae-${t.filename}-${datePart}.pdf`);
}
