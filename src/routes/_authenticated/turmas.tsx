import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ClassDialog } from "@/components/ClassDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDays, formatTimeRange } from "@/lib/format";
import { useClasses, useModalities, useTeachers } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/turmas")({
  head: () => ({
    meta: [
      { title: "Turmas — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Turmas das escolinhas com dias, horários, professor, capacidade e vagas.",
      },
      { property: "og:title", content: "Turmas — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Capacidade, alunos atuais e vagas disponíveis." },
    ],
  }),
  component: TurmasPage,
});

const ALL = "todas";

function TurmasPage() {
  const classes = useClasses();
  const modalities = useModalities();
  const teachers = useTeachers();
  const [modality, setModality] = useState(ALL);
  const [teacher, setTeacher] = useState(ALL);

  const list = (classes.data ?? []).filter(
    (c) =>
      (modality === ALL || c.modality_id === modality) &&
      (teacher === ALL || c.teacher_id === teacher),
  );

  return (
    <div>
      <PageHeader
        title="Turmas"
        subtitle="Vagas calculadas automaticamente (capacidade − alunos ativos)"
        actions={<ClassDialog />}
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Professor</th>
              <th className="px-4 py-3">Dias</th>
              <th className="px-4 py-3">Horário</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Capacidade</th>
              <th className="px-4 py-3">Alunos</th>
              <th className="px-4 py-3">Vagas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.modality_name}</td>
                <td className="px-4 py-3">{c.teacher_name ?? "—"}</td>
                <td className="px-4 py-3">{formatDays(c.days)}</td>
                <td className="px-4 py-3">{formatTimeRange(c.start_time, c.end_time)}</td>
                <td className="px-4 py-3">{formatCurrency(c.price)}</td>
                <td className="px-4 py-3">{c.capacity}</td>
                <td className="px-4 py-3">{c.active_students}</td>
                <td className="px-4 py-3">
                  {c.available_spots <= 0 ? (
                    <span className="font-semibold text-destructive">🔴 LOTADA</span>
                  ) : (
                    c.available_spots
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <ClassDialog
                    klass={c}
                    trigger={
                      <Button size="sm" variant="ghost">
                        Editar
                      </Button>
                    }
                  />
                </td>
              </tr>
            ))}
            {list.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhuma turma cadastrada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {list.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-1 pt-6 text-sm">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.modality_name} · {c.teacher_name ?? "sem professor"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDays(c.days)} · {formatTimeRange(c.start_time, c.end_time)}
              </p>
              <p className="text-xs">
                {formatCurrency(c.price)} · {c.active_students}/{c.capacity} alunos ·{" "}
                {c.available_spots <= 0 ? (
                  <span className="font-semibold text-destructive">LOTADA</span>
                ) : (
                  `${c.available_spots} vagas`
                )}
              </p>
              <ClassDialog
                klass={c}
                trigger={
                  <Button size="sm" variant="outline" className="mt-2">
                    Editar
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
