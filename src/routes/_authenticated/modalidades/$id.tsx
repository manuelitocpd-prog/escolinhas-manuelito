import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileDown } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { AptitudeBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APTITUDE } from "@/lib/status";
import { formatCurrency, formatDays, formatTimeRange, whatsappLink } from "@/lib/format";
import { generateTablePdf } from "@/lib/pdf";
import { useClasses, useModalities, useSettings, useStudents } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/modalidades/$id")({
  head: () => ({
    meta: [
      { title: "Modalidade — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Detalhes da modalidade: turmas, professor, horários, valores e alunos.",
      },
      { property: "og:title", content: "Modalidade — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Turmas, alunos e situação financeira da modalidade." },
    ],
  }),
  component: ModalityDetail,
});

function ModalityDetail() {
  const { id } = Route.useParams();
  const modalities = useModalities();
  const classes = useClasses();
  const students = useStudents();
  const { data: settings } = useSettings();

  const modality = (modalities.data ?? []).find((m) => m.id === id);
  const mClasses = (classes.data ?? []).filter((c) => c.modality_id === id);
  const mStudents = (students.data ?? []).filter((s) => s.modality_id === id);
  const spots = mClasses.reduce((sum, c) => sum + Math.max(c.available_spots, 0), 0);

  if (!modality) return <p className="text-sm text-muted-foreground">Modalidade não encontrada.</p>;

  function exportPdf() {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: `Alunos — ${modality!.name}`,
      subtitle: `${mStudents.length} aluno(s)`,
      head: ["Aluno", "Idade", "Responsável", "Telefone", "Turma", "Situação"],
      body: mStudents.map((s) => [
        s.name,
        s.age ?? "—",
        s.guardian_name ?? "—",
        s.guardian_whatsapp ?? s.guardian_phone ?? "—",
        s.class_name ?? "—",
        APTITUDE[s.aptitude].short.replace(/[^\p{L} ]/gu, "").trim(),
      ]),
      fileName: `alunos-${modality!.name.toLowerCase()}.pdf`,
      landscape: true,
    });
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link to="/modalidades">
          <ArrowLeft className="mr-1 size-4" /> Voltar para modalidades
        </Link>
      </Button>

      <PageHeader
        title={modality.name}
        subtitle={modality.description ?? "Escolinha esportiva"}
        actions={
          <Button variant="outline" onClick={exportPdf}>
            <FileDown className="mr-1 size-4" /> Exportar lista em PDF
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Valor padrão</p>
            <p className="text-xl font-bold">{formatCurrency(modality.default_price)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Alunos</p>
            <p className="text-xl font-bold">{mStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Vagas disponíveis</p>
            <p className="text-xl font-bold">{spots}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Turmas</p>
            <p className="text-xl font-bold">{mClasses.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Turmas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {mClasses.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma turma cadastrada nesta modalidade.</p>
          ) : (
            mClasses.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDays(c.days)} · {formatTimeRange(c.start_time, c.end_time)} ·{" "}
                    {c.teacher_name ?? "sem professor"} · {formatCurrency(c.price)}
                  </p>
                </div>
                <span className="text-xs font-semibold">
                  {c.available_spots <= 0 ? (
                    <span className="text-destructive">🔴 TURMA LOTADA</span>
                  ) : (
                    `${c.available_spots} vaga(s)`
                  )}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Alunos</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-3 py-2">Aluno</th>
                <th className="px-3 py-2">Idade</th>
                <th className="px-3 py-2">Responsável</th>
                <th className="px-3 py-2">Telefone</th>
                <th className="px-3 py-2">Situação</th>
              </tr>
            </thead>
            <tbody>
              {mStudents.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">
                    <Link to="/alunos/$id" params={{ id: s.id }} className="hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{s.age ?? "—"}</td>
                  <td className="px-3 py-2">{s.guardian_name ?? "—"}</td>
                  <td className="px-3 py-2">
                    {s.guardian_whatsapp || s.guardian_phone ? (
                      <a
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener"
                        href={whatsappLink(s.guardian_whatsapp ?? s.guardian_phone, "Olá!")}
                      >
                        WhatsApp
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <AptitudeBadge aptitude={s.aptitude} />
                  </td>
                </tr>
              ))}
              {mStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhum aluno nesta modalidade.
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
