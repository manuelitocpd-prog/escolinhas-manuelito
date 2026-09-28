import { createFileRoute } from "@tanstack/react-router";
import { FileDown } from "lucide-react";

import { ClassDialog } from "@/components/ClassDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDays, formatTimeRange } from "@/lib/format";
import { generateTablePdf } from "@/lib/pdf";
import { useClasses, useModalities, useSettings } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/quadro")({
  head: () => ({
    meta: [
      { title: "Quadro de Escolinhas — Colégio Manuelito" },
      {
        name: "description",
        content: "Quadro prático das escolinhas: modalidade, dias, horário, professor, valor e vagas.",
      },
      { property: "og:title", content: "Quadro de Escolinhas — Colégio Manuelito" },
      { property: "og:description", content: "Consulta rápida para a secretaria." },
    ],
  }),
  component: QuadroPage,
});

function QuadroPage() {
  const classes = useClasses();
  const modalities = useModalities();
  const { data: settings } = useSettings();

  const rows = (modalities.data ?? []).flatMap((m) => {
    const mClasses = (classes.data ?? []).filter((c) => c.modality_id === m.id);
    if (mClasses.length === 0) {
      return [{ modality: m.name, klass: null as (typeof mClasses)[number] | null }];
    }
    return mClasses.map((c) => ({ modality: m.name, klass: c }));
  });

  function exportPdf() {
    generateTablePdf({
      schoolName: settings?.school.name,
      title: "Quadro das escolinhas",
      head: ["Modalidade", "Turma", "Dias", "Horário", "Professor", "Valor", "Vagas"],
      body: rows.map((r) => [
        r.modality,
        r.klass?.name ?? "—",
        r.klass ? formatDays(r.klass.days) : "—",
        r.klass ? formatTimeRange(r.klass.start_time, r.klass.end_time) : "—",
        r.klass?.teacher_name ?? "—",
        r.klass ? formatCurrency(r.klass.price) : "—",
        r.klass ? String(Math.max(r.klass.available_spots, 0)) : "—",
      ]),
      fileName: "quadro-escolinhas.pdf",
      landscape: true,
    });
  }

  return (
    <div>
      <PageHeader
        title="Quadro de Escolinhas"
        subtitle="Consulta rápida de modalidades, horários, professores e vagas"
        actions={
          <>
            <Button variant="outline" onClick={exportPdf}>
              <FileDown className="mr-1 size-4" /> Baixar em PDF
            </Button>
            <ClassDialog />
          </>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Dias</th>
              <th className="px-4 py-3">Horário</th>
              <th className="px-4 py-3">Professor</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Vagas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, index) => (
              <tr key={`${r.modality}-${r.klass?.id ?? index}`} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.modality}</td>
                <td className="px-4 py-3">{r.klass?.name ?? "—"}</td>
                <td className="px-4 py-3">{r.klass ? formatDays(r.klass.days) : "—"}</td>
                <td className="px-4 py-3">
                  {r.klass ? formatTimeRange(r.klass.start_time, r.klass.end_time) : "—"}
                </td>
                <td className="px-4 py-3">{r.klass?.teacher_name ?? "—"}</td>
                <td className="px-4 py-3">{r.klass ? formatCurrency(r.klass.price) : "—"}</td>
                <td className="px-4 py-3">
                  {r.klass ? (
                    r.klass.available_spots <= 0 ? (
                      <span className="font-semibold text-destructive">🔴 LOTADA</span>
                    ) : (
                      r.klass.available_spots
                    )
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.klass ? (
                    <ClassDialog
                      klass={r.klass}
                      trigger={
                        <Button size="sm" variant="ghost">
                          Editar
                        </Button>
                      }
                    />
                  ) : (
                    <ClassDialog
                      trigger={
                        <Button size="sm" variant="ghost">
                          + Turma
                        </Button>
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6 text-xs text-muted-foreground">
          Todos os dados deste quadro vêm das turmas cadastradas. Alterar uma turma atualiza
          automaticamente este quadro, os horários e os PDFs.
        </CardContent>
      </Card>
    </div>
  );
}
