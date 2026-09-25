import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { AptitudeBadge } from "@/components/StatusBadge";
import { StudentDialog } from "@/components/StudentDialog";
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
import { formatCurrency, formatDays } from "@/lib/format";
import { exportCsv, generateTablePdf } from "@/lib/pdf";
import { useClasses, useModalities, useStudents, useTeachers } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/alunos/")({
  head: () => ({
    meta: [
      { title: "Alunos — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Lista de alunos das escolinhas com situação de aptidão, modalidade e turma.",
      },
      { property: "og:title", content: "Alunos — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Alunos, situação financeira e turmas." },
    ],
  }),
  component: AlunosPage,
});

const ALL = "todos";

function AlunosPage() {
  const students = useStudents();
  const modalities = useModalities();
  const classes = useClasses();
  const teachers = useTeachers();

  const [search, setSearch] = useState("");
  const [situation, setSituation] = useState(ALL);
  const [modality, setModality] = useState(ALL);
  const [klass, setKlass] = useState(ALL);
  const [teacher, setTeacher] = useState(ALL);

  const filtered = (students.data ?? []).filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) {
      if (!(s.guardian_name ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    }
    if (situation !== ALL && s.aptitude !== situation) return false;
    if (modality !== ALL && s.modality_id !== modality) return false;
    if (klass !== ALL && s.class_id !== klass) return false;
    if (teacher !== ALL && s.teacher_id !== teacher) return false;
    return true;
  });

  const head = ["Aluno", "Idade", "Modalidade", "Turma", "Responsável", "Telefone", "Situação"];
  const body = filtered.map((s) => [
    s.name,
    s.age ?? "—",
    s.modality_name ?? "—",
    s.class_name ? `${s.class_name} (${formatDays(s.class_days)})` : "—",
    s.guardian_name ?? "—",
    s.guardian_whatsapp ?? s.guardian_phone ?? "—",
    s.aptitude,
  ]);

  return (
    <div>
      <PageHeader
        title="Alunos"
        subtitle={`${filtered.length} aluno(s) listado(s)`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                generateTablePdf({
                  title: "Lista de alunos",
                  subtitle: `${filtered.length} aluno(s) — filtros aplicados`,
                  head,
                  body,
                  fileName: "alunos.pdf",
                  landscape: true,
                })
              }
            >
              <FileDown className="mr-1 size-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => exportCsv("alunos.csv", head, body)}>
              CSV
            </Button>
            <StudentDialog />
          </>
        }
      />

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={situation} onValueChange={setSituation}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as situações</SelectItem>
              <SelectItem value="apto">🟢 Aptos</SelectItem>
              <SelectItem value="nao_apto">🔴 Pendentes</SelectItem>
              <SelectItem value="a_vencer">🟡 A vencer</SelectItem>
              <SelectItem value="suspenso">⚪ Suspensos</SelectItem>
              <SelectItem value="inativo">⚫ Inativos</SelectItem>
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
          <Select value={klass} onValueChange={setKlass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as turmas</SelectItem>
              {(classes.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
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

      {/* Tabela em telas maiores */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Idade</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Mensalidade</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-border hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium">
                  <Link to="/alunos/$id" params={{ id: s.id }} className="hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{s.age ?? "—"}</td>
                <td className="px-4 py-3">{s.modality_name ?? "—"}</td>
                <td className="px-4 py-3">{formatDays(s.class_days)}</td>
                <td className="px-4 py-3">{s.guardian_name ?? "—"}</td>
                <td className="px-4 py-3">{formatCurrency(s.monthly_fee ?? 0)}</td>
                <td className="px-4 py-3">
                  <AptitudeBadge aptitude={s.aptitude} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Cards no celular */}
      <div className="space-y-3 md:hidden">
        {filtered.map((s) => (
          <Link key={s.id} to="/alunos/$id" params={{ id: s.id }} className="block">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.age != null ? `${s.age} anos · ` : ""}
                      {s.modality_name ?? "sem modalidade"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDays(s.class_days)} · {s.guardian_name ?? "sem responsável"}
                    </p>
                  </div>
                  <AptitudeBadge aptitude={s.aptitude} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>
        ) : null}
      </div>
    </div>
  );
}
