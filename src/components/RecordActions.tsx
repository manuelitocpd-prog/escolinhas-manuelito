import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Archive, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";

export type RecordEntity =
  | "student"
  | "teacher"
  | "class"
  | "modality"
  | "lead"
  | "payment"
  | "payment_method"
  | "lead_source";

const LABEL: Record<RecordEntity, { noun: string; art: string; table: string }> = {
  student: { noun: "aluno", art: "o aluno", table: "students" },
  teacher: { noun: "professor", art: "o professor", table: "teachers" },
  class: { noun: "turma", art: "a turma", table: "classes" },
  modality: { noun: "modalidade", art: "a modalidade", table: "modalities" },
  lead: { noun: "cadastro", art: "o cadastro de interessado", table: "leads" },
  payment: { noun: "pagamento", art: "o pagamento", table: "monthly_payments" },
  payment_method: { noun: "forma de pagamento", art: "a forma de pagamento", table: "payment_methods" },
  lead_source: { noun: "origem", art: "a origem", table: "lead_sources" },
};

const ARCHIVE: Partial<Record<RecordEntity, { archive: Record<string, unknown>; restore: Record<string, unknown> }>> = {
  student: { archive: { status: "arquivado" }, restore: { status: "ativo" } },
  teacher: { archive: { active: false }, restore: { active: true } },
  class: { archive: { status: "arquivada" }, restore: { status: "ativa" } },
  modality: { archive: { archived: true }, restore: { archived: false } },
  payment_method: { archive: { active: false }, restore: { active: true } },
  lead_source: { archive: { active: false }, restore: { active: true } },
};

type Deps = { blocking: string[]; info: string[] };

async function count(table: string, col: string, id: string, extra?: (q: any) => any) {
  let q: any = supabase.from(table as never).select("id", { count: "exact", head: true }).eq(col, id);
  if (extra) q = extra(q);
  const { count: c } = await q;
  return c ?? 0;
}

async function checkDeps(entity: RecordEntity, id: string): Promise<Deps> {
  const blocking: string[] = [];
  const info: string[] = [];
  const add = (n: number, text: string) => n > 0 && blocking.push(`${n} ${text}`);
  if (entity === "student") {
    add(await count("monthly_payments", "student_id", id), "mensalidade(s)/pagamento(s)");
    add(await count("enrollments", "student_id", id), "matrícula(s) em turmas");
    add(await count("communication_logs", "student_id", id), "registro(s) de comunicação");
  } else if (entity === "teacher") {
    add(await count("classes", "teacher_id", id), "turma(s) vinculada(s)");
  } else if (entity === "class") {
    const active = await count("enrollments", "class_id", id, (q) => q.eq("active", true));
    add(active, "aluno(s) ativo(s) vinculado(s)");
    const old = (await count("enrollments", "class_id", id)) - active;
    add(old, "matrícula(s) antigas no histórico");
  } else if (entity === "modality") {
    add(await count("classes", "modality_id", id), "turma(s)");
    add(await count("enrollments", "modality_id", id), "matrícula(s) de alunos");
  } else if (entity === "payment_method") {
    add(await count("monthly_payments", "payment_method_id", id), "pagamento(s) registrados");
  } else if (entity === "payment") {
    info.push("A exclusão poderá alterar automaticamente a situação financeira e a aptidão do aluno.");
  }
  return { blocking, info };
}

export type RecordActionsProps = {
  entity: RecordEntity;
  id: string;
  name: string;
  archived?: boolean;
  onEdit?: () => void;
  editTrigger?: ReactNode;
  description?: ReactNode;
  onDeleted?: () => void;
  variant?: "menu" | "buttons";
  /** turma: modality id to suggest transfer targets */
  modalityId?: string | null;
};

export function RecordActions(props: RecordActionsProps) {
  const { entity, id, name, archived, onEdit, editTrigger, variant = "menu" } = props;
  const { user } = useSession();
  const { isAdmin } = useRole(user);
  const qc = useQueryClient();
  const [mode, setMode] = useState<null | "delete" | "archive" | "blocked">(null);
  const [deps, setDeps] = useState<Deps>({ blocking: [], info: [] });
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState<string>("");
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const L = LABEL[entity];
  const canArchive = !!ARCHIVE[entity];

  const refresh = () => qc.invalidateQueries();

  async function openDelete() {
    setBusy(true);
    const d = await checkDeps(entity, id);
    setDeps(d);
    setBusy(false);
    if (d.blocking.length) {
      if (entity === "teacher") {
        const { data } = await supabase.from("teachers").select("id, name").eq("active", true).neq("id", id).order("name");
        setOptions(data ?? []);
      } else if (entity === "class") {
        let q = supabase.from("classes").select("id, name").eq("status", "ativa").neq("id", id);
        if (props.modalityId) q = q.eq("modality_id", props.modalityId);
        const { data } = await q.order("name");
        setOptions(data ?? []);
      }
      setMode("blocked");
    } else setMode("delete");
  }

  async function doDelete() {
    setBusy(true);
    const { error } = await supabase.from(L.table as never).delete().eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(
        error.code === "23503"
          ? "⚠️ Não foi possível excluir este registro porque existem dados vinculados. Use Arquivar."
          : error.message,
      );
      return;
    }
    await logAudit({ entity: L.table, entityId: id, action: "delete", description: `Excluiu ${L.art} ${name}` });
    toast.success("✅ Registro excluído com sucesso.");
    setMode(null);
    refresh();
    props.onDeleted?.();
  }

  async function doArchive(restore = false) {
    const cfg = ARCHIVE[entity];
    if (!cfg) return;
    setBusy(true);
    const { error } = await supabase.from(L.table as never).update((restore ? cfg.restore : cfg.archive) as never).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await logAudit({
      entity: L.table,
      entityId: id,
      action: restore ? "restore" : "archive",
      description: `${restore ? "Reativou" : "Arquivou"} ${L.art} ${name}`,
    });
    toast.success(restore ? "✅ Registro reativado com sucesso." : "✅ Registro arquivado com sucesso.");
    setMode(null);
    refresh();
  }

  async function doTransfer() {
    if (!target) return toast.error("Escolha o destino.");
    setBusy(true);
    const res =
      entity === "teacher"
        ? await supabase.from("classes").update({ teacher_id: target }).eq("teacher_id", id)
        : await supabase.from("enrollments").update({ class_id: target }).eq("class_id", id).eq("active", true);
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    const dest = options.find((o) => o.id === target)?.name ?? "";
    await logAudit({
      entity: L.table,
      entityId: id,
      action: "transfer",
      description: entity === "teacher" ? `Substituiu o professor ${name} por ${dest} nas turmas` : `Transferiu os alunos da turma ${name} para ${dest}`,
    });
    toast.success("✅ Vínculos transferidos. Agora você pode excluir ou arquivar.");
    refresh();
    setTarget("");
    openDelete();
  }

  const dialogs = (
    <>
      <AlertDialog open={mode === "delete"} onOpenChange={(o) => !o && setMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {L.noun}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Tem certeza de que deseja excluir {L.art} <strong>{name}</strong>?
                </p>
                {props.description ? <div>{props.description}</div> : null}
                {deps.info.map((i) => <p key={i}>{i}</p>)}
                <p>Esta ação não pode ser desfeita.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" disabled={busy} onClick={doDelete}>
              <Trash2 className="mr-1 size-4" /> Excluir {L.noun}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={mode === "archive"} onOpenChange={(o) => !o && setMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar {L.noun}?</AlertDialogTitle>
            <AlertDialogDescription>
              {L.art.charAt(0).toUpperCase() + L.art.slice(1)} <strong>{name}</strong> sairá das listas de ativos, mas todo o histórico
              será mantido. Você poderá reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button disabled={busy} onClick={() => doArchive(false)}>
              <Archive className="mr-1 size-4" /> Arquivar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={mode === "blocked"} onOpenChange={(o) => !o && setMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Não é possível excluir diretamente</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  ⚠️ {L.art.charAt(0).toUpperCase() + L.art.slice(1)} <strong>{name}</strong> possui dados vinculados:
                </p>
                <ul className="list-disc pl-5">
                  {deps.blocking.map((b) => <li key={b}>{b}</li>)}
                </ul>
                <p>{canArchive ? "Recomendamos arquivar: o histórico é preservado." : "Remova os vínculos antes de excluir."}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(entity === "teacher" || entity === "class") && options.length > 0 ? (
            <div className="space-y-2 rounded-md border border-border p-3">
              <p className="text-sm font-medium">
                {entity === "teacher" ? "Substituir professor nas turmas" : "Transferir alunos ativos para outra turma"}
              </p>
              <div className="flex gap-2">
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>
                    {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" disabled={busy} onClick={doTransfer}>Transferir</Button>
              </div>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            {canArchive && !archived ? (
              <Button disabled={busy} onClick={() => doArchive(false)}>
                <Archive className="mr-1 size-4" /> Arquivar {L.noun}
              </Button>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (variant === "buttons") {
    return (
      <>
        {editTrigger ?? (onEdit ? <Button variant="outline" onClick={onEdit}><Pencil className="mr-1 size-4" /> Editar</Button> : null)}
        {canArchive ? (
          archived ? (
            <Button variant="outline" disabled={busy} onClick={() => doArchive(true)}><RotateCcw className="mr-1 size-4" /> Reativar</Button>
          ) : (
            <Button variant="outline" onClick={() => setMode("archive")}><Archive className="mr-1 size-4" /> Arquivar</Button>
          )
        ) : null}
        {isAdmin ? (
          <Button variant="outline" className="text-destructive" disabled={busy} onClick={openDelete}>
            <Trash2 className="mr-1 size-4" /> Excluir
          </Button>
        ) : null}
        {dialogs}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Ações"><MoreHorizontal className="size-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit ? <DropdownMenuItem onSelect={onEdit}><Pencil className="mr-2 size-4" /> Editar</DropdownMenuItem> : null}
          {canArchive ? (
            archived ? (
              <DropdownMenuItem onSelect={() => doArchive(true)}><RotateCcw className="mr-2 size-4" /> Reativar</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => setMode("archive")}><Archive className="mr-2 size-4" /> Arquivar</DropdownMenuItem>
            )
          ) : null}
          {isAdmin ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={openDelete}><Trash2 className="mr-2 size-4" /> Excluir</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogs}
    </>
  );
}
