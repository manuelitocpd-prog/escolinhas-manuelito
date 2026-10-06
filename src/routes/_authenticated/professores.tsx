import { RecordActions } from "@/components/RecordActions";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDays, formatTimeRange } from "@/lib/format";
import { useClasses, useTeachers } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/professores")({
  head: () => ({
    meta: [
      { title: "Professores — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Professores das escolinhas esportivas, turmas e horários atribuídos.",
      },
      { property: "og:title", content: "Professores — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Cadastro e turmas dos professores." },
    ],
  }),
  component: ProfessoresPage,
});

type Teacher = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
};

function TeacherDialog({ teacher, trigger }: { teacher?: Teacher; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", active: true });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setForm({
      name: teacher?.name ?? "",
      phone: teacher?.phone ?? "",
      email: teacher?.email ?? "",
      notes: teacher?.notes ?? "",
      active: teacher?.active ?? true,
    });
  }, [open, teacher]);

  async function save() {
    if (!form.name.trim()) {
      toast.error("Informe o nome do professor.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      notes: form.notes || null,
      active: form.active,
    };
    const { error } = teacher
      ? await supabase.from("teachers").update(payload).eq("id", teacher.id)
      : await supabase.from("teachers").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar o professor.");
      return;
    }
    await logAudit({
      entity: "teachers",
      entityId: teacher?.id,
      action: teacher ? "professor_editado" : "professor_criado",
      description: `${teacher ? "Alterou" : "Cadastrou"} o professor ${payload.name}.`,
    });
    await queryClient.invalidateQueries();
    setOpen(false);
    toast.success("Professor salvo.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Novo professor</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teacher ? "Editar professor" : "Novo professor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Professor ativo</p>
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfessoresPage() {
  const teachers = useTeachers();
  const classes = useClasses();

  return (
    <div>
      <PageHeader
        title="Professores"
        subtitle="Equipe das escolinhas esportivas"
        actions={<TeacherDialog />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(teachers.data ?? []).map((t) => {
          const tClasses = (classes.data ?? []).filter((c) => c.teacher_id === t.id);
          return (
            <Card key={t.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.phone ?? "sem telefone"}</p>
                    <p className="text-xs text-muted-foreground">{t.email ?? "sem e-mail"}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      t.active
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  {tClasses.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma turma vinculada.</p>
                  ) : (
                    tClasses.map((c) => (
                      <p key={c.id}>
                        {c.modality_name} — {c.name} · {formatDays(c.days)} ·{" "}
                        {formatTimeRange(c.start_time, c.end_time)}
                      </p>
                    ))
                  )}
                </div>
                {t.notes ? <p className="text-xs text-muted-foreground">{t.notes}</p> : null}
                <div className="flex flex-wrap gap-2">
                <TeacherDialog
                  teacher={t as Teacher}
                  trigger={
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  }
                />
                <RecordActions entity="teacher" id={t.id} name={t.name} archived={!t.active} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(teachers.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum professor cadastrado ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
