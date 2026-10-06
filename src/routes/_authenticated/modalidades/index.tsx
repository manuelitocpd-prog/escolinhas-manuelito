import { RecordActions } from "@/components/RecordActions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { formatCurrency, formatDays, formatTimeRange } from "@/lib/format";
import { useClasses, useModalities, useStudents } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/modalidades/")({
  head: () => ({
    meta: [
      { title: "Modalidades — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Modalidades das escolinhas: professores, turmas, horários, valores e vagas.",
      },
      { property: "og:title", content: "Modalidades — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Balé, futsal, natação, hidroginástica e vôlei." },
    ],
  }),
  component: ModalidadesPage,
});

type ModalityRow = {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
  archived: boolean;
};

export function ModalityDialog({
  modality,
  trigger,
}: {
  modality?: ModalityRow;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [archived, setArchived] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setName(modality?.name ?? "");
    setDescription(modality?.description ?? "");
    setPrice(modality ? String(modality.default_price) : "");
    setArchived(modality?.archived ?? false);
  }, [open, modality]);

  async function save() {
    if (!name.trim()) {
      toast.error("Informe o nome da modalidade.");
      return;
    }
    const payload = {
      name: name.trim(),
      description: description || null,
      default_price: Number(price || 0),
      archived,
    };
    const { error } = modality
      ? await supabase.from("modalities").update(payload).eq("id", modality.id)
      : await supabase.from("modalities").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar a modalidade.");
      return;
    }
    await logAudit({
      entity: "modalities",
      entityId: modality?.id,
      action: modality ? "modalidade_editada" : "modalidade_criada",
      description: `${modality ? "Alterou" : "Cadastrou"} a modalidade ${payload.name} — valor ${formatCurrency(
        payload.default_price,
      )}.`,
    });
    await queryClient.invalidateQueries();
    setOpen(false);
    toast.success("Modalidade salva.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Nova modalidade</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modality ? "Editar modalidade" : "Nova modalidade"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Valor padrão da mensalidade (R$)</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Arquivada</p>
              <p className="text-xs text-muted-foreground">Modalidades arquivadas ficam ocultas.</p>
            </div>
            <Switch checked={archived} onCheckedChange={setArchived} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModalidadesPage() {
  const modalities = useModalities();
  const classes = useClasses();
  const students = useStudents();
  const [showArchived, setShowArchived] = useState(false);

  const list = (modalities.data ?? []).filter((m) => showArchived || !m.archived);

  return (
    <div>
      <PageHeader
        title="Modalidades"
        subtitle="Modalidades oferecidas pelas escolinhas"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Ocultar arquivadas" : "Mostrar arquivadas"}
            </Button>
            <ModalityDialog />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((m) => {
          const mClasses = (classes.data ?? []).filter((c) => c.modality_id === m.id);
          const mStudents = (students.data ?? []).filter(
            (s) => s.modality_id === m.id && s.enrollment_status === "ativo",
          );
          const spots = mClasses.reduce((sum, c) => sum + Math.max(c.available_spots, 0), 0);
          return (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <Link to="/modalidades/$id" params={{ id: m.id }} className="hover:underline">
                    {m.name}
                  </Link>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatCurrency(m.default_price)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{m.description ?? "Sem descrição."}</p>
                <div className="space-y-1">
                  {mClasses.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma turma cadastrada.</p>
                  ) : (
                    mClasses.map((c) => (
                      <p key={c.id} className="text-xs">
                        <span className="font-medium">{c.name}</span> · {formatDays(c.days)} ·{" "}
                        {formatTimeRange(c.start_time, c.end_time)} · {c.teacher_name ?? "sem professor"}
                      </p>
                    ))
                  )}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Alunos: {mStudents.length}</span>
                  <span>Vagas: {spots}</span>
                  <span>Turmas: {mClasses.length}</span>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/modalidades/$id" params={{ id: m.id }}>
                      Abrir
                    </Link>
                  </Button>
                  <ModalityDialog
                    modality={m as ModalityRow}
                    trigger={
                      <Button size="sm" variant="ghost">
                        Editar
                      </Button>
                    }
                  />
                  <RecordActions entity="modality" id={m.id} name={m.name} archived={m.archived} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
