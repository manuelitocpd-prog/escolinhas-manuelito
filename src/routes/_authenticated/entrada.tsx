import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APTITUDE } from "@/lib/status";
import { formatDays, formatTimeRange } from "@/lib/format";
import { useStudents } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/entrada")({
  head: () => ({
    meta: [
      { title: "Controle de Entrada — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Consulta rápida da situação do aluno na entrada das atividades.",
      },
      { property: "og:title", content: "Controle de Entrada — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Apto, não apto, suspenso ou inativo em um segundo." },
    ],
  }),
  component: EntradaPage,
});

function EntradaPage() {
  const students = useStudents();
  const [query, setQuery] = useState("");

  const results =
    query.trim().length < 2
      ? []
      : (students.data ?? []).filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Controle de Entrada"
        subtitle="Pesquise o aluno e veja a situação atual — mesmos dados do sistema, sem cadastro separado"
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
            <Input
              autoFocus
              className="h-12 pl-9 text-base"
              placeholder="Digite o nome do aluno"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {results.map((s) => {
          const info = APTITUDE[s.aptitude];
          return (
            <Card key={s.id} className={`border-2 ${info.className}`}>
              <CardContent className="pt-6">
                <p className="text-xl font-bold">{s.name}</p>
                <p className="text-sm text-muted-foreground">
                  {s.modality_name ?? "sem modalidade"} · {s.class_name ?? "sem turma"} ·{" "}
                  {formatDays(s.class_days)} {formatTimeRange(s.start_time, s.end_time)}
                </p>
                <p className="mt-4 text-2xl font-extrabold">{info.label}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Responsável: {s.guardian_name ?? "—"} · {s.guardian_phone ?? "sem telefone"}
                </p>
              </CardContent>
            </Card>
          );
        })}
        {query.trim().length >= 2 && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aluno encontrado com esse nome.</p>
        ) : null}
      </div>
    </div>
  );
}
