import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PageHeader } from "@/components/PageHeader";
import { AptitudeBadge } from "@/components/StatusBadge";
import { WhatsAppActions } from "@/components/WhatsAppActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatMonth, todayISO } from "@/lib/format";
import {
  useClasses,
  useLeads,
  useModalities,
  usePayments,
  useSettings,
  useStudents,
  useTeachers,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Dashboard — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Situação dos alunos, financeiro e próximos vencimentos das escolinhas esportivas.",
      },
      { property: "og:title", content: "Dashboard — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Gestão das escolinhas esportivas." },
    ],
  }),
  component: Painel,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: "primary" | "success" | "destructive" | "accent";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Painel() {
  const students = useStudents();
  const classes = useClasses();
  const modalities = useModalities();
  const teachers = useTeachers();
  const payments = usePayments();
  const leads = useLeads();
  const { data: settings } = useSettings();

  const list = students.data ?? [];
  const active = list.filter((s) => s.enrollment_status === "ativo");
  const apt = list.filter((s) => s.aptitude === "apto");
  const pending = list.filter((s) => s.aptitude === "nao_apto");

  const today = todayISO();
  const dueSoonDays = settings?.finance.due_soon_days ?? 7;
  const limit = new Date(Date.now() + dueSoonDays * 86400000).toISOString().slice(0, 10);

  const allPayments = payments.data ?? [];
  const monthPrefix = today.slice(0, 7);
  const monthPayments = allPayments.filter((p) => p.reference_month.startsWith(monthPrefix));
  const paidMonth = monthPayments.filter((p) => p.paid_at);
  const pendingMonth = monthPayments.filter((p) => !p.paid_at);
  const received = paidMonth.reduce((sum, p) => sum + Number(p.amount), 0);
  const toReceive = pendingMonth.reduce((sum, p) => sum + Number(p.amount), 0);

  const dueSoon = allPayments
    .filter((p) => !p.paid_at && p.due_date >= today && p.due_date <= limit)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const overdue = allPayments
    .filter((p) => !p.paid_at && p.due_date < today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const leadList = leads.data ?? [];
  const interested = leadList.filter((l) => l.status === "interessado").length;
  const waiting = leadList.filter((l) => l.status === "aguardando_pagamento").length;
  const confirmedMonth = leadList.filter(
    (l) => l.status === "confirmada" && l.updated_at?.startsWith(monthPrefix),
  ).length;

  const chartData = [
    { name: "Pagas", value: paidMonth.length, color: "#12875A" },
    {
      name: "A vencer",
      value: pendingMonth.filter((p) => p.due_date >= today).length,
      color: "#D9B405",
    },
    {
      name: "Vencidas",
      value: pendingMonth.filter((p) => p.due_date < today).length,
      color: "#D92D20",
    },
  ];

  function studentOf(id: string) {
    return list.find((s) => s.id === id);
  }

  return (
    <div>
      <PageHeader
        title="Escolinhas Colégio Manuelito"
        subtitle="Gestão das escolinhas esportivas"
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/alunos">Ver alunos</Link>
            </Button>
            <Button asChild>
              <Link to="/matriculas">+ Nova matrícula</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Alunos ativos" value={active.length} icon={Users} />
        <StatCard label="Alunos aptos" value={apt.length} icon={ShieldCheck} tone="success" />
        <StatCard
          label="Alunos pendentes"
          value={pending.length}
          icon={Bell}
          tone="destructive"
        />
        <StatCard label="Modalidades" value={(modalities.data ?? []).length} icon={Trophy} tone="accent" />
        <StatCard label="Turmas" value={(classes.data ?? []).length} icon={CalendarDays} />
        <StatCard
          label="Professores ativos"
          value={(teachers.data ?? []).filter((t) => t.active).length}
          icon={UserCheck}
          tone="accent"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Situação financeira atual — {formatMonth(`${monthPrefix}-01`)}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <Row label="Mensalidades previstas" value={String(monthPayments.length)} />
              <Row label="Mensalidades pagas" value={String(paidMonth.length)} />
              <Row label="Mensalidades pendentes" value={String(pendingMonth.length)} />
              <Row label="Valor recebido" value={formatCurrency(received)} strong />
              <Row label="Valor pendente" value={formatCurrency(toReceive)} strong />
            </div>
            <div className="h-48">
              {monthPayments.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensalidade lançada para este mês.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-4" /> Novas matrículas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Interessados" value={String(interested)} />
            <Row label="Aguardando confirmação" value={String(waiting)} />
            <Row label="Confirmadas este mês" value={String(confirmedMonth)} />
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link to="/matriculas">Ver novas matrículas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>🔔 Próximos vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dueSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma mensalidade vence nos próximos {dueSoonDays} dias.
              </p>
            ) : (
              dueSoon.slice(0, 6).map((p) => {
                const s = studentOf(p.student_id);
                return (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{s?.name ?? p.students?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {s?.modality_name ?? "—"} — {formatCurrency(p.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vencimento: {formatDate(p.due_date)}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/alunos/$id" params={{ id: p.student_id }}>
                          Ver aluno
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-2">
                      <WhatsAppActions
                        compact
                        showNotice={false}
                        kind="due_soon"
                        target={{
                          studentId: p.student_id,
                          guardianId: s?.guardian_id,
                          paymentId: p.id,
                          whatsapp: s?.guardian_whatsapp ?? s?.guardian_phone,
                          guardianName: s?.guardian_name,
                          studentName: s?.name,
                          modality: s?.modality_name,
                          referenceMonth: p.reference_month,
                          dueDate: p.due_date,
                          amount: p.amount,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔴 Pagamentos pendentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma mensalidade vencida. 🎉</p>
            ) : (
              <>
                {overdue.slice(0, 6).map((p) => {
                  const s = studentOf(p.student_id);
                  return (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                    >
                      <div>
                        <p className="font-semibold">{s?.name ?? p.students?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMonth(p.reference_month)} · venceu em {formatDate(p.due_date)} ·{" "}
                          {formatCurrency(p.amount)}
                        </p>
                      </div>
                      {s ? <AptitudeBadge aptitude={s.aptitude} /> : null}
                    </div>
                  );
                })}
                <Button asChild variant="destructive" className="w-full">
                  <Link to="/financeiro" search={{ situacao: "pendente" }}>
                    Ver pendências
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-border pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
