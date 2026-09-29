import { createFileRoute } from "@tanstack/react-router";
import { FileDown } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APTITUDE } from "@/lib/status";
import { WEEK_DAYS, formatCurrency, formatDays, formatTimeRange } from "@/lib/format";
import { generateTablePdf } from "@/lib/pdf";
import { useClasses, useModalities, useSettings, useStudents } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/pdfs")({
  head: () => ({
    meta: [
      { title: "PDFs — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Geração de PDFs: horários geral e por modalidade, turmas e listas de alunos.",
      },
      { property: "og:title", content: "PDFs — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Documentos prontos para impressão e divulgação." },
    ],
  }),
  component: PdfsPage,
});

function PdfsPage() {
  const classes = useClasses();
  const modalities = useModalities();
  const students = useStudents();
  const { data: settings } = useSettings();

  const active = (classes.data ?? []).filter((c) => c.status === "ativa");

  function scheduleRows(modalityId?: string) {
    return WEEK_DAYS.flatMap((day) =>
      active
        .filter((c) => c.days.includes(day) && (!modalityId || c.modality_id === modalityId))
        .sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""))
        .map((c) => [
          day,
          formatTimeRange(c.start_time, c.end_time),
          c.modality_name ?? "—",
          c.name,
          c.teacher_name ?? "—",
          formatCurrency(c.price),
        ]),
    );
  }

  function schedulePdf(modalityId?: string, modalityName?: string) {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: modalityName ? `Horários das escolinhas — ${modalityName}` : "Horários das escolinhas",
      head: ["Dia", "Horário", "Modalidade", "Turma", "Professor", "Valor"],
      body: scheduleRows(modalityId),
      fileName: modalityName
        ? `horarios-${modalityName.toLowerCase()}.pdf`
        : "horarios-escolinhas.pdf",
      landscape: true,
    });
  }

  function classesPdf() {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: "Turmas e vagas",
      head: ["Modalidade", "Turma", "Dias", "Horário", "Professor", "Capacidade", "Alunos", "Vagas"],
      body: active.map((c) => [
        c.modality_name ?? "—",
        c.name,
        formatDays(c.days),
        formatTimeRange(c.start_time, c.end_time),
        c.teacher_name ?? "—",
        c.capacity,
        c.active_students,
        Math.max(c.available_spots, 0),
      ]),
      fileName: "turmas-vagas.pdf",
      landscape: true,
    });
  }

  function studentsPdf() {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: "Relação geral de alunos",
      subtitle: `${(students.data ?? []).length} aluno(s)`,
      head: ["Aluno", "Idade", "Modalidade", "Turma", "Responsável", "Telefone", "Situação"],
      body: (students.data ?? []).map((s) => [
        s.name,
        s.age ?? "—",
        s.modality_name ?? "—",
        s.class_name ?? "—",
        s.guardian_name ?? "—",
        s.guardian_whatsapp ?? s.guardian_phone ?? "—",
        APTITUDE[s.aptitude].short,
      ]),
      fileName: "alunos-geral.pdf",
      landscape: true,
    });
  }

  return (
    <div>
      <PageHeader title="PDFs" subtitle="Documentos gerados com os dados atualizados do sistema" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horários das escolinhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Quadro completo com todos os dias, horários, modalidades e professores.
            </p>
            <Button onClick={() => schedulePdf()}>
              <FileDown className="mr-1 size-4" /> Baixar horários (geral)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horários por modalidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(modalities.data ?? [])
              .filter((m) => !m.archived)
              .map((m) => (
                <Button key={m.id} variant="outline" onClick={() => schedulePdf(m.id, m.name)}>
                  <FileDown className="mr-1 size-4" /> {m.name}
                </Button>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turmas e vagas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Capacidade, alunos matriculados e vagas disponíveis por turma.
            </p>
            <Button variant="outline" onClick={classesPdf}>
              <FileDown className="mr-1 size-4" /> Baixar turmas e vagas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relação geral de alunos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Lista de alunos com responsável, contato e situação atual.
            </p>
            <Button variant="outline" onClick={studentsPdf}>
              <FileDown className="mr-1 size-4" /> Baixar relação de alunos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
