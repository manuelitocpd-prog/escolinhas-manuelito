import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, Sheet } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/PageHeader";
import { NewChargeDialog, RegisterPaymentDialog } from "@/components/PaymentDialogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { exportCsv, generateTablePdf } from "@/lib/pdf";
import { PAYMENT_SITUATION_LABEL, paymentSituation } from "@/lib/status";
import { useModalities, usePayments, useSettings, useStudents } from "@/lib/data";

const searchSchema = z.object({
  situacao: z.enum(["todas", "pago", "pendente", "a_vencer"]).optional(),
});

export const Route = createFileRoute("/_authenticated/financeiro")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Financeiro — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Mensalidades, pagamentos, inadimplência e histórico financeiro das escolinhas.",
      },
      { property: "og:title", content: "Financeiro — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Controle de mensalidades e pagamentos." },
    ],
  }),
  component: FinanceiroPage,
});

const ALL = "todas";

function FinanceiroPage() {
  const search = Route.useSearch();
  const payments = usePayments();
  const students = useStudents();
  const modalities = useModalities();
  const { data: settings } = useSettings();

  const [situation, setSituation] = useState<string>(search.situacao ?? ALL);
  const [month, setMonth] = useState("");
  const [modality, setModality] = useState(ALL);
  const [query, setQuery] = useState("");

  const studentById = useMemo(
    () => new Map((students.data ?? []).map((s) => [s.id, s])),
    [students.data],
  );

  const rows = (payments.data ?? []).filter((p) => {
    const situ = paymentSituation(p.paid_at, p.due_date);
    if (situation !== ALL && situ !== situation) return false;
    if (month && !p.reference_month.startsWith(month)) return false;
    const student = studentById.get(p.student_id);
    if (modality !== ALL && student?.modality_id !== modality) return false;
    if (query && !(student?.name ?? "").toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const totals = rows.reduce(
    (acc, p) => {
      const situ = paymentSituation(p.paid_at, p.due_date);
      acc.previstas += Number(p.amount);
      if (situ === "pago") {
        acc.pagas += 1;
        acc.recebido += Number(p.amount);
      } else {
        acc.pendentes += 1;
        acc.pendente += Number(p.amount);
      }
      return acc;
    },
    { previstas: 0, pagas: 0, pendentes: 0, recebido: 0, pendente: 0 },
  );

  const head = ["Aluno", "Modalidade", "Mês", "Valor", "Vencimento", "Pagamento", "Situação"];
  const body = rows.map((p) => {
    const student = studentById.get(p.student_id);
    return [
      student?.name ?? p.students?.name ?? "—",
      student?.modality_name ?? "—",
      formatMonth(p.reference_month),
      formatCurrency(p.amount),
      formatDate(p.due_date),
      p.paid_at ? formatDate(p.paid_at) : "—",
      PAYMENT_SITUATION_LABEL[paymentSituation(p.paid_at, p.due_date)]!.label,
    ];
  });

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Histórico financeiro completo — nunca apagado"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                generateTablePdf({
                  schoolName: settings?.school.name,
                  title: "Relação de mensalidades",
                  subtitle: `${rows.length} registro(s) · Recebido ${formatCurrency(
                    totals.recebido,
                  )} · Pendente ${formatCurrency(totals.pendente)}`,
                  head,
                  body,
                  fileName: "mensalidades.pdf",
                  landscape: true,
                })
              }
            >
              <FileDown className="mr-1 size-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => exportCsv("mensalidades.csv", head, body)}>
              <Sheet className="mr-1 size-4" /> CSV
            </Button>
            <NewChargeDialog />
          </>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Mensalidades previstas", value: formatCurrency(totals.previstas) },
          { label: "Pagas", value: String(totals.pagas) },
          { label: "Pendentes", value: String(totals.pendentes) },
          { label: "Total recebido", value: formatCurrency(totals.recebido) },
          { label: "Total pendente", value: formatCurrency(totals.pendente) },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-lg font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Pesquisar aluno"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={situation} onValueChange={setSituation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as situações</SelectItem>
              <SelectItem value="pago">Pagas</SelectItem>
              <SelectItem value="pendente">Pendentes (vencidas)</SelectItem>
              <SelectItem value="a_vencer">A vencer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modality} onValueChange={setModality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as modalidades</SelectItem>
              {(modalities.data ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </CardContent>
      </Card>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const student = studentById.get(p.student_id);
              const situ = paymentSituation(p.paid_at, p.due_date);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    <Link to="/alunos/$id" params={{ id: p.student_id }} className="hover:underline">
                      {student?.name ?? p.students?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{student?.modality_name ?? "—"}</td>
                  <td className="px-4 py-3">{formatMonth(p.reference_month)}</td>
                  <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3">{formatDate(p.due_date)}</td>
                  <td className="px-4 py-3">{p.paid_at ? formatDate(p.paid_at) : "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                        PAYMENT_SITUATION_LABEL[situ]!.className
                      }`}
                    >
                      {PAYMENT_SITUATION_LABEL[situ]!.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.paid_at ? null : <RegisterPaymentDialog payment={p} />}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma mensalidade encontrada com os filtros aplicados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((p) => {
          const student = studentById.get(p.student_id);
          const situ = paymentSituation(p.paid_at, p.due_date);
          return (
            <Card key={p.id}>
              <CardContent className="space-y-1 pt-6 text-sm">
                <p className="font-semibold">{student?.name ?? p.students?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMonth(p.reference_month)} · {formatCurrency(p.amount)} · vence{" "}
                  {formatDate(p.due_date)}
                </p>
                <span
                  className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    PAYMENT_SITUATION_LABEL[situ]!.className
                  }`}
                >
                  {PAYMENT_SITUATION_LABEL[situ]!.label}
                </span>
                {p.paid_at ? null : (
                  <div className="pt-2">
                    <RegisterPaymentDialog payment={p} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
