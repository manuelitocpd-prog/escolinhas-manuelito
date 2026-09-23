import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BLUE: [number, number, number] = [5, 146, 217];
const PURPLE: [number, number, number] = [96, 13, 173];

export type PdfOptions = {
  title: string;
  subtitle?: string;
  schoolName?: string;
  head: string[];
  body: (string | number)[][];
  fileName: string;
  landscape?: boolean;
};

export function generateTablePdf(options: PdfOptions) {
  const doc = new jsPDF({ orientation: options.landscape ? "landscape" : "portrait" });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(...BLUE);
  doc.rect(0, 0, width, 26, "F");
  doc.setFillColor(...PURPLE);
  doc.rect(0, 26, width, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text((options.schoolName ?? "COLÉGIO MANUELITO").toUpperCase(), 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("ESCOLINHAS ESPORTIVAS", 14, 19);

  doc.setTextColor(20, 33, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(options.title.toUpperCase(), 14, 40);

  let y = 46;
  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(options.subtitle, 14, y);
    y += 6;
  }

  doc.setFontSize(9);
  doc.setTextColor(110, 120, 140);
  doc.text(
    `Atualizado em ${new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`,
    14,
    y,
  );

  autoTable(doc, {
    startY: y + 6,
    head: [options.head],
    body: options.body.map((row) => row.map((cell) => String(cell ?? "—"))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [244, 248, 252] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 160);
    doc.text(
      `Escolinhas Colégio Manuelito — página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  doc.save(options.fileName);
}

export function exportCsv(fileName: string, head: string[], body: (string | number)[][]) {
  const escape = (v: string | number) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [head.map(escape).join(";"), ...body.map((r) => r.map(escape).join(";"))].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
