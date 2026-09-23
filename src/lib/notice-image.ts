import { formatCurrency, formatDate, formatMonth } from "./format";

export type NoticeData = {
  guardianName: string;
  studentName: string;
  modality: string;
  referenceMonth: string | null;
  dueDate: string | null;
  amount: number | string | null;
  schoolName?: string;
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function buildNoticeImage(data: NoticeData): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 1080);

  const grad = ctx.createLinearGradient(0, 0, 1080, 320);
  grad.addColorStop(0, "#0592D9");
  grad.addColorStop(1, "#600DAD");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 300);

  ctx.fillStyle = "#F2EF72";
  ctx.fillRect(0, 300, 1080, 12);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px Sora, Arial, sans-serif";
  ctx.fillText((data.schoolName ?? "COLÉGIO MANUELITO").toUpperCase(), 540, 140);
  ctx.font = "30px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillText("ESCOLINHAS ESPORTIVAS", 540, 196);
  ctx.font = "bold 34px Sora, Arial, sans-serif";
  ctx.fillStyle = "#F2EF72";
  ctx.fillText("LEMBRETE DE MENSALIDADE", 540, 258);

  ctx.fillStyle = "#14213A";
  ctx.font = "bold 40px Sora, Arial, sans-serif";
  ctx.fillText(`Olá, ${data.guardianName}!`, 540, 400);

  ctx.font = "30px 'Plus Jakarta Sans', Arial, sans-serif";
  ctx.fillStyle = "#3D4C66";
  const intro = `A mensalidade da escolinha de ${data.modality}, referente a ${formatMonth(
    data.referenceMonth,
  )}, do(a) aluno(a) ${data.studentName}, tem vencimento em:`;
  let y = 470;
  for (const line of wrap(ctx, intro, 880)) {
    ctx.fillText(line, 540, y);
    y += 44;
  }

  ctx.fillStyle = "#EEF4FA";
  ctx.strokeStyle = "#0592D9";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(140, y + 20, 800, 220, 28);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0592D9";
  ctx.font = "bold 76px Sora, Arial, sans-serif";
  ctx.fillText(formatDate(data.dueDate), 540, y + 120);
  ctx.fillStyle = "#600DAD";
  ctx.font = "bold 46px Sora, Arial, sans-serif";
  ctx.fillText(`Valor: ${formatCurrency(data.amount)}`, 540, y + 195);

  ctx.fillStyle = "#3D4C66";
  ctx.font = "28px 'Plus Jakarta Sans', Arial, sans-serif";
  const footer = "Agradecemos pela parceria e confiança no Colégio Manuelito.";
  let fy = y + 320;
  for (const line of wrap(ctx, footer, 880)) {
    ctx.fillText(line, 540, fy);
    fy += 40;
  }

  const bottom = ctx.createLinearGradient(0, 1000, 1080, 1080);
  bottom.addColorStop(0, "#600DAD");
  bottom.addColorStop(1, "#0592D9");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 1000, 1080, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Sora, Arial, sans-serif";
  ctx.fillText("Escolinhas Colégio Manuelito", 540, 1050);

  return canvas.toDataURL("image/png");
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}
