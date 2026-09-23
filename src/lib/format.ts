export function formatCurrency(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return "—";
  return `${d}/${m}/${y}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatMonth(value: string | null | undefined): string {
  if (!value) return "—";
  const parts = value.slice(0, 10).split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m) return "—";
  return `${MONTHS[m - 1]}/${y}`;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start && !end) return "—";
  return `${formatTime(start)}${end ? ` às ${formatTime(end)}` : ""}`;
}

export function calcAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mdiff = today.getMonth() - birth.getMonth();
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export const WEEK_DAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export const SHORT_DAY: Record<string, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
};

export function formatDays(days: string[] | null | undefined): string {
  if (!days || days.length === 0) return "—";
  return days.map((d) => SHORT_DAY[d] ?? d).join("/");
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function whatsappLink(phone: string | null | undefined, message: string): string {
  let digits = onlyDigits(phone);
  if (digits.length <= 11) digits = `55${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
