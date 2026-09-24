import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useClasses, useGuardians, useModalities, useStudents, useTeachers } from "@/lib/data";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const students = useStudents();
  const guardians = useGuardians();
  const modalities = useModalities();
  const teachers = useTeachers();
  const classes = useClasses();

  function go(to: string) {
    onOpenChange(false);
    navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar aluno, responsável, modalidade, professor ou turma..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Alunos">
          {(students.data ?? []).slice(0, 40).map((s) => (
            <CommandItem key={s.id} value={`aluno ${s.name}`} onSelect={() => go(`/alunos/${s.id}`)}>
              {s.name}
              <span className="ml-auto text-xs text-muted-foreground">
                {s.modality_name ?? "sem modalidade"}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Responsáveis">
          {(guardians.data ?? []).slice(0, 30).map((g) => (
            <CommandItem
              key={g.id}
              value={`responsavel ${g.name}`}
              onSelect={() => go("/alunos")}
            >
              {g.name}
              <span className="ml-auto text-xs text-muted-foreground">{g.phone ?? ""}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Modalidades">
          {(modalities.data ?? []).map((m) => (
            <CommandItem
              key={m.id}
              value={`modalidade ${m.name}`}
              onSelect={() => go(`/modalidades/${m.id}`)}
            >
              {m.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Professores">
          {(teachers.data ?? []).map((t) => (
            <CommandItem
              key={t.id}
              value={`professor ${t.name}`}
              onSelect={() => go("/professores")}
            >
              {t.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Turmas">
          {(classes.data ?? []).map((c) => (
            <CommandItem key={c.id} value={`turma ${c.name}`} onSelect={() => go("/turmas")}>
              {c.name}
              <span className="ml-auto text-xs text-muted-foreground">{c.modality_name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
