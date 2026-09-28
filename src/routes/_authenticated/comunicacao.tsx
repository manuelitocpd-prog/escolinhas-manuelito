import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { PageHeader } from "@/components/PageHeader";
import { WhatsAppActions } from "@/components/WhatsAppActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate, formatDateTime, formatMonth, todayISO } from "@/lib/format";
import { paymentSituation } from "@/lib/status";
import { usePayments, useSettings, useStudents } from "@/lib/data";
import type { MessageKind } from "@/lib/messages";

export const Route = createFileRoute("/_authenticated/comunicacao")({
  head: () => ({
    meta: [
      { title: "Comunicação — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content:
          "Lembretes de vencimento, cobranças e confirmações por WhatsApp, com envio manual pela secretaria.",
      },
      { property: "og:title", content: "Comunicação — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Mensagens prontas para revisão e envio manual." },
    ],
  }),
  component: ComunicacaoPage,
});

function useCommunicationLogs() {
  return useQuery({
    queryKey: ["communication_logs", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_logs")
        .select("*, students(name), guardians(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function ComunicacaoPage() {
  const payments = usePayments();
  const students = useStudents();
  const { data: settings } = useSettings();
  const logs = useCommunicationLogs();

  const studentById = useMemo(
    () => new Map((students.data ?? []).map((s) => [s.id, s])),
    [students.data],
  );

  const today = todayISO();
  const dueSoonDays = settings?.finance.due_soon_days ?? 7;
  const limit = new Date(Date.now() + dueSoonDays * 86400000).toISOString().slice(0, 10);

  const all = payments.data ?? [];
  const dueSoon = all.filter((p) => !p.paid_at && p.due_date >= today && p.due_date <= limit);
  const overdue = all.filter((p) => paymentSituation(p.paid_at, p.due_date) === "pendente");
  const recent = all
    .filter((p) => p.paid_at)
    .sort((a, b) => (b.paid_at ?? "").localeCompare(a.paid_at ?? ""))
    .slice(0, 15);

  function Section({
    title,
    description,
    rows,
    kind,
  }: {
    title: string;
    description: string;
    rows: typeof all;
    kind: MessageKind;
  }) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum registro nesta lista.</p>
          ) : (
            rows.map((p) => {
              const s = studentById.get(p.student_id);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="text-sm">
                    <Link
                      to="/alunos/$id"
                      params={{ id: p.student_id }}
                      className="font-semibold hover:underline"
                    >
                      {s?.name ?? p.students?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {s?.modality_name ?? "—"} · {formatMonth(p.reference_month)} ·{" "}
                      {formatCurrency(p.amount)} ·{" "}
                      {p.paid_at ? `pago em ${formatDate(p.paid_at)}` : `vence ${formatDate(p.due_date)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Responsável: {s?.guardian_name ?? "—"}
                    </p>
                  </div>
                  <WhatsAppActions
                    compact
                    kind={kind}
                    showNotice={kind !== "paid"}
                    target={{
                      studentId: p.student_id,
                      guardianId: s?.guardian_id ?? null,
                      paymentId: p.id,
                      whatsapp: s?.guardian_whatsapp ?? s?.guardian_phone ?? null,
                      guardianName: s?.guardian_name,
                      studentName: s?.name ?? p.students?.name,
                      modality: s?.modality_name,
                      referenceMonth: p.reference_month,
                      dueDate: p.due_date,
                      amount: p.amount,
                    }}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Comunicação"
        subtitle="O sistema monta a mensagem e abre o WhatsApp — o envio é sempre manual, feito por você"
      />

      <Section
        title="🔔 Próximos vencimentos"
        description={`Mensalidades que vencem nos próximos ${dueSoonDays} dias.`}
        rows={dueSoon}
        kind="due_soon"
      />
      <Section
        title="🔴 Mensalidades vencidas"
        description="Mensalidades vencidas e ainda não pagas."
        rows={overdue}
        kind="overdue"
      />
      <Section
        title="🟢 Pagamentos recentes"
        description="Confirmações de pagamento para enviar ao responsável."
        rows={recent}
        kind="paid"
      />

      <Card>
        <CardHeader>
          <CardTitle>Histórico de comunicação</CardTitle>
          <p className="text-xs text-muted-foreground">
            Registramos apenas o acionamento do envio pela secretaria — não há confirmação de entrega
            ou leitura.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-3 py-2">Data e hora</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Aluno</th>
                <th className="px-3 py-2">Responsável</th>
                <th className="px-3 py-2">Canal</th>
              </tr>
            </thead>
            <tbody>
              {(logs.data ?? []).map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-3 py-2">{formatDateTime(log.created_at)}</td>
                  <td className="px-3 py-2">{log.type}</td>
                  <td className="px-3 py-2">
                    {(log.students as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {(log.guardians as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2">{log.channel}</td>
                </tr>
              ))}
              {(logs.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhuma comunicação registrada ainda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
