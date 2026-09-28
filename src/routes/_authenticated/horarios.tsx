import { createFileRoute } from "@tanstack/react-router";
import { FileDown } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEEK_DAYS, formatCurrency, formatTime, formatTimeRange } from "@/lib/format";
import { generateTablePdf } from "@/lib/pdf";
import { useClasses, useSettings } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/horarios")({
  head: () => ({
    meta: [
      { title: "Horários das Escolinhas — Colégio Manuelito" },
      {
        name: "description",
        content: "Quadro semanal de horários das escolinhas, gerado automaticamente das turmas.",
      },
      { property: "og:title", content: "Horários das Escolinhas — Colégio Manuelito" },
      { property: "og:description", content: "Quadro semanal por dia e horário." },
    ],
  }),
  component: HorariosPage,
});

function HorariosPage() {
  const classes = useClasses();
  const { data: settings } = useSettings();

  const active = (classes.data ?? []).filter((c) => c.status === "ativa");
  const slots = Array.from(
    new Set(active.map((c) => c.start_time ?? "").filter(Boolean)),
  ).sort();

  function pdfGeneral() {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: "Horários das escolinhas",
      head: ["Dia", "Horário", "Modalidade", "Turma", "Professor", "Valor"],
      body: WEEK_DAYS.flatMap((day) =>
        active
          .filter((c) => c.days.includes(day))
          .sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""))
          .map((c) => [
            day,
            formatTimeRange(c.start_time, c.end_time),
            c.modality_name ?? "—",
            c.name,
            c.teacher_name ?? "—",
            formatCurrency(c.price),
          ]),
      ),
      fileName: "horarios-escolinhas.pdf",
      landscape: true,
    });
  }

  return (
    <div>
      <PageHeader
        title="Horários"
        subtitle="Quadro semanal gerado automaticamente a partir das turmas ativas"
        actions={
          <Button variant="outline" onClick={pdfGeneral}>
            <FileDown className="mr-1 size-4" /> Baixar horários em PDF
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-3 py-3">Horário</th>
              {WEEK_DAYS.map((d) => (
                <th key={d} className="px-3 py-3">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot} className="border-t border-border align-top">
                <td className="px-3 py-3 font-semibold">{formatTime(slot)}</td>
                {WEEK_DAYS.map((day) => {
                  const cells = active.filter(
                    (c) => c.days.includes(day) && (c.start_time ?? "") === slot,
                  );
                  return (
                    <td key={day} className="px-3 py-3">
                      {cells.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        cells.map((c) => (
                          <div
                            key={c.id}
                            className="mb-2 rounded-lg border border-primary/20 bg-primary/5 p-2"
                          >
                            <p className="text-xs font-semibold text-primary">{c.modality_name}</p>
                            <p className="text-xs">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatTimeRange(c.start_time, c.end_time)} ·{" "}
                              {c.teacher_name ?? "sem professor"}
                            </p>
                          </div>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {slots.length === 0 ? (
              <tr>
                <td colSpan={WEEK_DAYS.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  Cadastre turmas com horário para montar o quadro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6 text-xs text-muted-foreground">
          O quadro é montado somente com as turmas ativas: ao alterar o horário de uma turma, esta
          página e os PDFs são atualizados automaticamente, sem duplicar informações.
        </CardContent>
      </Card>
    </div>
  );
}
