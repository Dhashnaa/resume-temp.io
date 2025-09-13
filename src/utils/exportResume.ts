import { jsPDF } from "jspdf";
import type { ResumeData } from "@/hooks/useResumes";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9\-\_\s]/gi, "").trim().replace(/\s+/g, "-").toLowerCase();
}

function buildTextResume(resume: ResumeData) {
  const lines: string[] = [];
  lines.push(`# ${resume.title || "My Resume"}`);
  const pi = resume.personal_info || { name: "", email: "", phone: "", location: "", summary: "" };
  if (pi.name) lines.push(`Name: ${pi.name}`);
  if (pi.email) lines.push(`Email: ${pi.email}`);
  if (pi.phone) lines.push(`Phone: ${pi.phone}`);
  if (pi.location) lines.push(`Location: ${pi.location}`);
  if (pi.summary) { lines.push("", "Summary:", pi.summary); }

  if (resume.experience?.length) {
    lines.push("", "Experience:");
    resume.experience.forEach((exp) => {
      lines.push(`- ${exp.position} @ ${exp.company} (${exp.duration})`);
      if (exp.description) lines.push(`  ${exp.description}`);
    });
  }

  if (resume.education?.length) {
    lines.push("", "Education:");
    resume.education.forEach((ed) => {
      lines.push(`- ${ed.degree} - ${ed.school} (${ed.year})`);
    });
  }

  if (resume.skills?.length) {
    lines.push("", `Skills: ${resume.skills.join(", ")}`);
  }

  return lines.join("\n");
}

export async function exportResume(resume: ResumeData, format: "pdf" | "txt" | "docx" = "pdf"): Promise<"pdf" | "txt"> {
  const safeTitle = sanitizeFileName(resume.title || "my-resume");

  // Fallback: treat DOCX as TXT to avoid corrupted files without heavy deps
  if (format === "txt" || format === "docx") {
    const actual: "txt" = "txt";
    const content = buildTextResume(resume);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}.${actual}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return actual;
  }

  // Default: PDF export
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const maxWidth = 515; // ~595pt page width - 2 * 40 margin
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(resume.title || "My Resume", marginX, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const pi = resume.personal_info || { name: "", email: "", phone: "", location: "", summary: "" };
  const headerLines: string[] = [];
  if (pi.name) headerLines.push(pi.name);
  const contactBits = [pi.email, pi.phone, pi.location].filter(Boolean).join("  •  ");
  if (contactBits) headerLines.push(contactBits);
  if (headerLines.length) {
    headerLines.forEach((line) => {
      doc.text(line, marginX, y);
      y += 16;
    });
  }

  if (pi.summary) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Summary", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(pi.summary, maxWidth);
    summaryLines.forEach((line: string) => {
      if (y > 780) { doc.addPage(); y = 60; }
      doc.text(line, marginX, y);
      y += 14;
    });
  }

  if (resume.experience?.length) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Experience", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");

    resume.experience.forEach((exp) => {
      const title = `${exp.position || ""}${exp.company ? " @ " + exp.company : ""}${exp.duration ? " (" + exp.duration + ")" : ""}`.trim();
      const titleLines = doc.splitTextToSize(title, maxWidth);
      titleLines.forEach((line: string) => {
        if (y > 780) { doc.addPage(); y = 60; }
        doc.text(line, marginX, y);
        y += 14;
      });
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, maxWidth);
        descLines.forEach((line: string) => {
          if (y > 780) { doc.addPage(); y = 60; }
          doc.text(line, marginX + 12, y);
          y += 14;
        });
      }
      y += 8;
    });
  }

  if (resume.education?.length) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Education", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");

    resume.education.forEach((ed) => {
      const line = `${ed.degree || ""}${ed.school ? " - " + ed.school : ""}${ed.year ? " (" + ed.year + ")" : ""}`.trim();
      const edLines = doc.splitTextToSize(line, maxWidth);
      edLines.forEach((l: string) => {
        if (y > 780) { doc.addPage(); y = 60; }
        doc.text(l, marginX, y);
        y += 14;
      });
    });
  }

  if (resume.skills?.length) {
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Skills", marginX, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const skillsText = resume.skills.join(", ");
    const skillLines = doc.splitTextToSize(skillsText, maxWidth);
    skillLines.forEach((line: string) => {
      if (y > 780) { doc.addPage(); y = 60; }
      doc.text(line, marginX, y);
      y += 14;
    });
  }

  doc.save(`${safeTitle}.pdf`);
  return "pdf";
}
