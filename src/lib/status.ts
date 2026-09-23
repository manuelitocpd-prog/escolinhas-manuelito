export type Aptitude = "apto" | "nao_apto" | "a_vencer" | "suspenso" | "inativo";

export const APTITUDE: Record<Aptitude, { label: string; short: string; className: string }> = {
  apto: {
    label: "🟢 APTO A FREQUENTAR",
    short: "🟢 Apto",
    className: "bg-success/12 text-success border-success/30",
  },
  nao_apto: {
    label: "🔴 NÃO APTO — PAGAMENTO PENDENTE",
    short: "🔴 Pendente",
    className: "bg-destructive/12 text-destructive border-destructive/30",
  },
  a_vencer: {
    label: "🟡 PAGAMENTO A VENCER",
    short: "🟡 A vencer",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  suspenso: {
    label: "⚪ SUSPENSO",
    short: "⚪ Suspenso",
    className: "bg-muted text-muted-foreground border-border",
  },
  inativo: {
    label: "⚫ INATIVO",
    short: "⚫ Inativo",
    className: "bg-foreground/10 text-foreground border-border",
  },
};

export const ENROLLMENT_STATUS: Record<string, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  inativo: "Inativo",
  arquivado: "Arquivado",
};

export const LEAD_STATUS: Record<string, { label: string; className: string }> = {
  interessado: { label: "🟡 Interessado", className: "bg-warning/15 text-warning border-warning/30" },
  iniciado: { label: "🔵 Cadastro iniciado", className: "bg-primary/12 text-primary border-primary/30" },
  aguardando_pagamento: {
    label: "🟠 Aguardando pagamento",
    className: "bg-warning/20 text-warning border-warning/40",
  },
  confirmada: {
    label: "🟢 Matrícula confirmada",
    className: "bg-success/12 text-success border-success/30",
  },
  cancelado: {
    label: "🔴 Cancelado",
    className: "bg-destructive/12 text-destructive border-destructive/30",
  },
  sem_interesse: { label: "⚫ Sem interesse", className: "bg-muted text-muted-foreground border-border" },
};

export const TRIAL_STATUS: Record<string, string> = {
  solicitada: "Solicitada",
  agendada: "Agendada",
  realizada: "Realizada",
  nao_realizada: "Não realizada",
};

export function paymentSituation(paidAt: string | null, dueDate: string): "pago" | "pendente" | "a_vencer" {
  if (paidAt) return "pago";
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today ? "pendente" : "a_vencer";
}

export const PAYMENT_SITUATION_LABEL: Record<string, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-success/12 text-success border-success/30" },
  pendente: { label: "Pendente", className: "bg-destructive/12 text-destructive border-destructive/30" },
  a_vencer: { label: "A vencer", className: "bg-warning/15 text-warning border-warning/30" },
};
