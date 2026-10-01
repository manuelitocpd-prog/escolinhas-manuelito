import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, Sheet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { APTITUDE, LEAD_STATUS, paymentSituation } from "@/lib/status";
import { useLeads, useModalities, usePayments, useSettings, useStudents, useTeachers } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content:
          "Relatórios de alunos, pagamentos, inadimplência, modalidades, professores e novas matrículas.",
      },
      { property: "og:title", content: "Relatórios — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Exportação em PDF e CSV respeitando os filtros." },
    ],
  }),
  component: RelatoriosPage,
});

const ALL = "todos";

type ReportKind =
  | "alunos_ativos"
  | "alunos_aptos"
  | "alunos_pendentes"
  | "pagamentos_mes"
  | "inadimplencia"
  | "por_modalidade"
  | "por_professor"
  | "novas_matriculas";

const REPORTS: { value: ReportKind; label: string }[] = [
  { value: "alunos_ativos", label: "Alunos ativos" },
  { value: "alunos_aptos", label: "Alunos aptos" },
  { value: "alunos_pendentes", label: "Alunos com pagamento pendente" },
  { value: "pagamentos_mes", label: "Pagamentos do mês" },
  { value: "inadimplencia", label: "Inadimplência" },
  { value: "por_modalidade", label: "Alunos por modalidade" },
  { value: "por_professor", label: "Alunos por professor" },
  { value: "novas_matriculas", label: "Novas matrículas" },
];

function RelatoriosPage() {
  const students = useStudents();
  const payments = usePayments();
  const modalities = useModalities();
  const teachers = useTeachers();
  const leads = useLeads();
  const { data: settings } = useSettings();

  const [kind, setKind] = useState<ReportKind>("alunos_ativos");
  const [modality, setModality] = useState(ALL);
  const [teacher, setTeacher] = useState(ALL);
  const [month, setMonth] = useState("");

  const studentById = useMemo(
    () => new Map((students.data ?? []).map((s) => [s.id, s])),
    [students.data],
  );

  const report = useMemo(() => {
    const filterStudent = (s: import("@/lib/data").StudentStatus | undefined) =>
      !!s &&
      (modality === ALL || s.modality_id === modality) &&
      (teacher === ALL || s.teacher_id === teacher);

    const sList = (students.data ?? []).filter((s) => filterStudent(s));

    if (kind === "pagamentos_mes" || kind === "inadimplencia") {
      const rows = (payments.data ?? []).filter((p) => {
        const s = studentById.get(p.student_id);
        if (!filterStudent(s)) return false;
        if (month && !p.reference_month.startsWith(month)) return false;
        const situ = paymentSituation(p.paid_at, p.due_date);
        return kind === "pagamentos_mes" ? situ === "pago" : situ === "pendente";
      });
      return {
        head: ["Aluno", "Modalidade", "Mês", "Valor", "Vencimento", "Pagamento"],
        body: rows.map((p) => {
          const s = studentById.get(p.student_id);
          return [
            s?.name ?? p.students?.name ?? "—",
            s?.modality_name ?? "—",
            formatMonth(p.reference_month),
            formatCurrency(p.amount),
            formatDate(p.due_date),
            p.paid_at ? formatDate(p.paid_at) : "—",
          ];
        }),
        summary:
          kind === "pagamentos_mes"
            ? `Total recebido: ${formatCurrency(rows.reduce((t, p) => t + Number(p.amount), 0))}`
            : `Total pendente: ${formatCurrency(rows.reduce((t, p) => t + Number(p.amount), 0))}`,
      };
    }

    if (kind === "por_modalidade") {
      const rows = (modalities.data ?? []).map((m) => {
        const list = sList.filter((s) => s.modality_id === m.id);
        return [
          m.name,
          String(list.filter((s) => s.enrollment_status === "ativo").length),
          String(list.filter((s) => s.aptitude === "apto").length),
          String(list.filter((s) => s.aptitude === "nao_apto").length),
          formatCurrency(m.default_price),
        ];
      });
      return {
        head: ["Modalidade", "Alunos ativos", "Aptos", "Pendentes", "Valor padrão"],
        body: rows,
        summary: `${rows.length} modalidade(s)`,
      };
    }

    if (kind === "por_professor") {
      const rows = (teachers.data ?? []).map((t) => {
        const list = sList.filter((s) => s.teacher_id === t.id);
        return [
          t.name,
          String(list.length),
          String(list.filter((s) => s.aptitude === "apto").length),
          String(list.filter((s) => s.aptitude === "nao_apto").length),
        ];
      });
      return {
        head: ["Professor", "Alunos", "Aptos", "Pendentes"],
        body: rows,
        summary: `${rows.length} professor(es)`,
      };
    }

    if (kind === "novas_matriculas") {
      const rows = (leads.data ?? []).filter((l) => {
        if (month && !String(l.created_at).startsWith(month)) return false;
        if (modality !== ALL && l.modality_id !== modality) return false;
        return true;
      });
      const confirmed = rows.filter((l) => l.status === "confirmada").length;
      const canceled = rows.filter((l) => l.status === "cancelado" || l.status === "sem_interesse")
        .length;
      return {
        head: ["Aluno", "Responsável", "Modalidade", "Origem", "Status", "Cadastro"],
        body: rows.map((l) => [
          l.student_name,
          l.guardian_name ?? "—",
          (l.modalities as { name: string } | null)?.name ?? "—",
          l.source ?? "—",
          LEAD_STATUS[l.status]?.label ?? l.status,
          formatDate(String(l.created_at).slice(0, 10)),
        ]),
        summary: `Interessados: ${rows.length} · Confirmadas: ${confirmed} · Cancelamentos: ${canceled} · Conversão: ${
          rows.length ? Math.round((confirmed / rows.length) * 100) : 0
        }%`,
      };
    }

    const filtered = sList.filter((s) => {
      if (kind === "alunos_ativos") return s.enrollment_status === "ativo";
      if (kind === "alunos_aptos") return s.aptitude === "apto";
      return s.aptitude === "nao_apto";
    });
    return {
      head: ["Aluno", "Idade", "Modalidade", "Turma", "Professor", "Responsável", "Situação"],
      body: filtered.map((s) => [
        s.name,
        s.age ?? "—",
        s.modality_name ?? "—",
        s.class_name ?? "—",
        s.teacher_name ?? "—",
        s.guardian_name ?? "—",
        APTITUDE[s.aptitude].short,
      ]),
      summary: `${filtered.length} aluno(s)`,
    };
  }, [kind, modality, teacher, month, students.data, payments.data, modalities.data, teachers.data, leads.data, studentById]);

  const label = REPORTS.find((r) => r.value === kind)!.label;

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Escolha o relatório, aplique os filtros e exporte"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                generateTablePdf({
                  schoolName: settings?.school.name,
                  title: label,
                  subtitle: report.summary,
                  head: report.head,
                  body: report.body,
                  fileName: `relatorio-${kind}.pdf`,
                  landscape: true,
                })
              }
            >
              <FileDown className="mr-1 size-4" /> PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => exportCsv(`relatorio-${kind}.csv`, report.head, report.body)}
            >
              <Sheet className="mr-1 size-4" /> CSV
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <Select value={kind} onValueChange={(v) => setKind(v as ReportKind)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORTS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
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
          <Select value={teacher} onValueChange={setTeacher}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os professores</SelectItem>
              {(teachers.data ?? []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Período"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span>{label}</span>
            <span className="text-sm font-normal text-muted-foreground">{report.summary}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                {report.head.map((h) => (
                  <th key={h} className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.body.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {report.body.length === 0 ? (
                <tr>
                  <td
                    colSpan={report.head.length}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    Nenhum resultado com os filtros aplicados.
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
