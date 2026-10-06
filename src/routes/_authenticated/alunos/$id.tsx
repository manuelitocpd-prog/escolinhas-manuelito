import { RecordActions } from "@/components/RecordActions";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { AptitudeBadge } from "@/components/StatusBadge";
import { StudentDialog } from "@/components/StudentDialog";
import { NewChargeDialog, RegisterPaymentDialog } from "@/components/PaymentDialogs";
import { WhatsAppActions } from "@/components/WhatsAppActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate, formatDateTime, formatDays, formatMonth, formatTimeRange } from "@/lib/format";
import { PAYMENT_SITUATION_LABEL, paymentSituation } from "@/lib/status";
import { usePayments, useStudent } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/alunos/$id")({
  head: () => ({
    meta: [
      { title: "Perfil do aluno — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Dados do aluno, responsável, escolinha, situação de aptidão e histórico financeiro.",
      },
      { property: "og:title", content: "Perfil do aluno — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Histórico completo do aluno em um único lugar." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const student = useStudent(id);
  const payments = usePayments(id);

  const history = useQuery({
    queryKey: ["audit_logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const comms = useQuery({
    queryKey: ["communication_logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_logs")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const s = student.data;
  if (student.isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!s) return <p className="text-sm text-muted-foreground">Aluno não encontrado.</p>;

  const list = payments.data ?? [];
  const current = list.find((p) => !p.paid_at) ?? list[0];

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/alunos">
          <ArrowLeft className="mr-1 size-4" /> Voltar para alunos
        </Link>
      </Button>

      <PageHeader
        title={s.name}
        subtitle={`${s.age != null ? `${s.age} anos · ` : ""}${s.modality_name ?? "sem modalidade"}`}
        actions={
          <>
            <StudentDialog student={s} trigger={<Button variant="outline">Editar aluno</Button>} />
            <NewChargeDialog studentId={s.id} />
            <RecordActions
              entity="student"
              id={s.id}
              name={s.name}
              archived={s.enrollment_status === "arquivado" || s.enrollment_status === "inativo"}
              variant="buttons"
              onDeleted={() => navigate({ to: "/alunos" })}
              description="O aluno possui informações cadastrais e poderá possuir histórico de matrículas e pagamentos."
            />
          </>
        }
      />

      <Card className="mb-6 border-2" style={{ borderColor: "var(--border)" }}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Situação atual</p>
            <div className="mt-1">
              <AptitudeBadge aptitude={s.aptitude} full className="text-sm" />
            </div>
          </div>
          {current && !current.paid_at ? (
            <RegisterPaymentDialog payment={current} trigger={<Button>+ Registrar pagamento</Button>} />
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Info label="Nome" value={s.name} />
            <Info label="Nascimento" value={formatDate(s.birth_date)} />
            <Info label="Idade" value={s.age != null ? `${s.age} anos` : "—"} />
            <Info label="Sexo" value={s.gender ?? "—"} />
            <Info label="Escola / série" value={s.school_grade ?? "—"} />
            <Info label="Matrícula em" value={formatDate(s.enrollment_date)} />
            <Info label="Status" value={s.enrollment_status} />
            <Info label="Observações" value={s.notes ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Info label="Nome" value={s.guardian_name ?? "—"} />
            <Info label="Parentesco" value={s.guardian_relationship ?? "—"} />
            <Info label="Telefone" value={s.guardian_phone ?? "—"} />
            <Info label="WhatsApp" value={s.guardian_whatsapp ?? "—"} />
            <Info label="E-mail" value={s.guardian_email ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escolinha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Info label="Modalidade" value={s.modality_name ?? "—"} />
            <Info label="Turma" value={s.class_name ?? "—"} />
            <Info label="Professor" value={s.teacher_name ?? "—"} />
            <Info label="Dias" value={formatDays(s.class_days)} />
            <Info label="Horário" value={formatTimeRange(s.start_time, s.end_time)} />
            <Info label="Valor" value={formatCurrency(s.monthly_fee ?? 0)} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="px-3 py-2">Mês</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Vencimento</th>
                  <th className="px-3 py-2">Pagamento</th>
                  <th className="px-3 py-2">Situação</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const sit = paymentSituation(p.paid_at, p.due_date);
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-3 py-2">{formatMonth(p.reference_month)}</td>
                      <td className="px-3 py-2">{formatCurrency(p.amount)}</td>
                      <td className="px-3 py-2">{formatDate(p.due_date)}</td>
                      <td className="px-3 py-2">{formatDate(p.paid_at)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${PAYMENT_SITUATION_LABEL[sit]!.className}`}
                        >
                          {PAYMENT_SITUATION_LABEL[sit]!.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                        {!p.paid_at ? <RegisterPaymentDialog payment={p} /> : null}
                        <RecordActions entity="payment" id={p.id} name={`${formatCurrency(p.amount)} — ${formatMonth(p.reference_month)} — ${s.name}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                      Nenhuma mensalidade lançada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {current ? (
            <div className="mt-4 rounded-lg border border-border p-4">
              <p className="mb-2 text-sm font-semibold">Comunicação com o responsável</p>
              <WhatsAppActions
                kind={current.paid_at ? "paid" : paymentSituation(current.paid_at, current.due_date) === "pendente" ? "overdue" : "due_soon"}
                target={{
                  studentId: s.id,
                  guardianId: s.guardian_id,
                  paymentId: current.id,
                  whatsapp: s.guardian_whatsapp ?? s.guardian_phone,
                  guardianName: s.guardian_name,
                  studentName: s.name,
                  modality: s.modality_name,
                  referenceMonth: current.reference_month,
                  dueDate: current.due_date,
                  amount: current.amount,
                }}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Histórico do aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(history.data ?? []).length === 0 ? (
              <p className="text-muted-foreground">Nenhum registro ainda.</p>
            ) : (
              (history.data ?? []).map((h) => (
                <div key={h.id} className="border-l-2 border-primary/40 pl-3">
                  <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                  <p>{h.description ?? h.action}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de comunicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(comms.data ?? []).length === 0 ? (
              <p className="text-muted-foreground">Nenhuma mensagem preparada ainda.</p>
            ) : (
              (comms.data ?? []).map((c) => (
                <div key={c.id} className="border-l-2 border-accent/40 pl-3">
                  <p className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
                  <p>{c.type} — mensagem preparada/enviada pelo WhatsApp.</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-border pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
