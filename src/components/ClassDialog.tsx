import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { WEEK_DAYS, formatCurrency } from "@/lib/format";
import { useModalities, useTeachers, type ClassOverview } from "@/lib/data";

export function ClassDialog({
  klass,
  trigger,
}: {
  klass?: ClassOverview;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    modality_id: "",
    teacher_id: "",
    days: [] as string[],
    start_time: "",
    end_time: "",
    price: "",
    capacity: "20",
    notes: "",
    status: "ativa",
  });
  const modalities = useModalities();
  const teachers = useTeachers();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setForm({
      name: klass?.name ?? "",
      modality_id: klass?.modality_id ?? "",
      teacher_id: klass?.teacher_id ?? "",
      days: klass?.days ?? [],
      start_time: klass?.start_time?.slice(0, 5) ?? "",
      end_time: klass?.end_time?.slice(0, 5) ?? "",
      price: klass ? String(klass.price) : "",
      capacity: klass ? String(klass.capacity) : "20",
      notes: klass?.notes ?? "",
      status: klass?.status ?? "ativa",
    });
  }, [open, klass]);

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  }

  async function save() {
    if (!form.name.trim() || !form.modality_id) {
      toast.error("Informe o nome da turma e a modalidade.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      modality_id: form.modality_id,
      teacher_id: form.teacher_id || null,
      days: form.days,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      price: Number(form.price || 0),
      capacity: Number(form.capacity || 0),
      notes: form.notes || null,
      status: form.status,
    };
    const { error } = klass
      ? await supabase.from("classes").update(payload).eq("id", klass.id)
      : await supabase.from("classes").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar a turma.");
      return;
    }
    await logAudit({
      entity: "classes",
      entityId: klass?.id,
      action: klass ? "turma_editada" : "turma_criada",
      description: `${klass ? "Alterou" : "Cadastrou"} a turma ${payload.name} — ${formatCurrency(
        payload.price,
      )}, ${payload.days.join("/") || "sem dias"} ${form.start_time || ""}${
        form.end_time ? `-${form.end_time}` : ""
      }.`,
    });
    await queryClient.invalidateQueries();
    setOpen(false);
    toast.success("Turma salva. Quadro de horários atualizado.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Nova turma</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{klass ? "Editar turma" : "Nova turma"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nome da turma</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Futsal — Seg/Qua 11h"
              />
            </div>
            <div>
              <Label>Modalidade</Label>
              <Select
                value={form.modality_id}
                onValueChange={(v) => {
                  const m = (modalities.data ?? []).find((x) => x.id === v);
                  setForm((prev) => ({
                    ...prev,
                    modality_id: v,
                    price: prev.price || String(m?.default_price ?? ""),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(modalities.data ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Professor</Label>
              <Select
                value={form.teacher_id}
                onValueChange={(v) => setForm({ ...form, teacher_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(teachers.data ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Horário inicial</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Horário final</Label>
              <Input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Capacidade</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Dias da semana</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {WEEK_DAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.days.includes(day)} onCheckedChange={() => toggleDay(day)} />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
