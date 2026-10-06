import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { calcAge, formatCurrency, formatDays, formatTimeRange, todayISO } from "@/lib/format";
import { useClasses, useModalities, type StudentStatus } from "@/lib/data";

type Form = {
  name: string;
  birth_date: string;
  gender: string;
  school_grade: string;
  notes: string;
  enrollment_date: string;
  status: string;
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_whatsapp: string;
  guardian_email: string;
  modality_id: string;
  class_id: string;
  monthly_fee: string;
};

function emptyForm(): Form {
  return {
    name: "",
    birth_date: "",
    gender: "",
    school_grade: "",
    notes: "",
    enrollment_date: todayISO(),
    status: "ativo",
    guardian_name: "",
    guardian_relationship: "",
    guardian_phone: "",
    guardian_whatsapp: "",
    guardian_email: "",
    modality_id: "",
    class_id: "",
    monthly_fee: "",
  };
}

export function StudentDialog({
  student,
  trigger,
}: {
  student?: StudentStatus;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm());
  const [busy, setBusy] = useState(false);
  const modalities = useModalities();
  const classes = useClasses();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    if (student) {
      setForm({
        name: student.name,
        birth_date: student.birth_date ?? "",
        gender: student.gender ?? "",
        school_grade: student.school_grade ?? "",
        notes: student.notes ?? "",
        enrollment_date: student.enrollment_date,
        status: student.enrollment_status,
        guardian_name: student.guardian_name ?? "",
        guardian_relationship: student.guardian_relationship ?? "",
        guardian_phone: student.guardian_phone ?? "",
        guardian_whatsapp: student.guardian_whatsapp ?? "",
        guardian_email: student.guardian_email ?? "",
        modality_id: student.modality_id ?? "",
        class_id: student.class_id ?? "",
        monthly_fee: student.monthly_fee != null ? String(student.monthly_fee) : "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, student]);

  const availableClasses = (classes.data ?? []).filter(
    (c) => (!form.modality_id || c.modality_id === form.modality_id) && (c.status === "ativa" || c.id === form.class_id),
  );
  const selectedClass = availableClasses.find((c) => c.id === form.class_id);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Informe o nome do aluno.");
      return;
    }
    setBusy(true);
    try {
      // responsável
      let guardianId = student?.guardian_id ?? null;
      const guardianPayload = {
        name: form.guardian_name.trim(),
        relationship: form.guardian_relationship || null,
        phone: form.guardian_phone || null,
        whatsapp: form.guardian_whatsapp || form.guardian_phone || null,
        email: form.guardian_email || null,
      };
      if (form.guardian_name.trim()) {
        if (guardianId) {
          const { error } = await supabase
            .from("guardians")
            .update(guardianPayload)
            .eq("id", guardianId);
          if (error) throw error;
        } else {
          const { data: existing } = await supabase
            .from("guardians")
            .select("id")
            .ilike("name", form.guardian_name.trim())
            .maybeSingle();
          if (existing?.id) {
            guardianId = existing.id;
            await supabase.from("guardians").update(guardianPayload).eq("id", existing.id);
          } else {
            const { data, error } = await supabase
              .from("guardians")
              .insert(guardianPayload)
              .select("id")
              .single();
            if (error) throw error;
            guardianId = data.id;
          }
        }
      }

      const studentPayload = {
        name: form.name.trim(),
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        school_grade: form.school_grade || null,
        notes: form.notes || null,
        enrollment_date: form.enrollment_date || todayISO(),
        status: form.status,
        guardian_id: guardianId,
      };

      let studentId = student?.id ?? "";
      if (student) {
        const { error } = await supabase.from("students").update(studentPayload).eq("id", student.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert(studentPayload)
          .select("id")
          .single();
        if (error) throw error;
        studentId = data.id;
      }

      // matrícula (modalidade/turma) — preserva histórico
      const fee = Number(form.monthly_fee || selectedClass?.price || 0);
      if (form.modality_id) {
        const changed =
          !student?.enrollment_id ||
          student.modality_id !== form.modality_id ||
          student.class_id !== (form.class_id || null);
        if (changed) {
          if (student?.enrollment_id) {
            await supabase
              .from("enrollments")
              .update({ active: false, end_date: todayISO() })
              .eq("id", student.enrollment_id);
          }
          const { error } = await supabase.from("enrollments").insert({
            student_id: studentId,
            modality_id: form.modality_id,
            class_id: form.class_id || null,
            monthly_fee: fee,
          });
          if (error) throw error;
        } else if (student?.enrollment_id) {
          await supabase
            .from("enrollments")
            .update({ monthly_fee: fee })
            .eq("id", student.enrollment_id);
        }
      }

      await logAudit({
        entity: "students",
        entityId: studentId,
        action: student ? "aluno_editado" : "aluno_criado",
        description: `${student ? "Alterou" : "Cadastrou"} o aluno ${form.name.trim()}${
          form.monthly_fee ? ` — mensalidade ${formatCurrency(fee)}` : ""
        }.`,
      });

      await queryClient.invalidateQueries();
      setOpen(false);
      toast.success(student ? "Aluno atualizado." : "Aluno cadastrado com sucesso.");
    } catch {
      toast.error("Não foi possível salvar o aluno.");
    } finally {
      setBusy(false);
    }
  }

  const age = calcAge(form.birth_date);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Novo aluno</Button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Editar aluno" : "Novo aluno"}</DialogTitle>
          <DialogDescription>
            Dados pessoais, responsável e escolinha. A idade é calculada automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Dados do aluno</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nome completo</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set("birth_date", e.target.value)}
                />
                {age != null ? (
                  <p className="mt-1 text-xs text-muted-foreground">{age} anos</p>
                ) : null}
              </div>
              <div>
                <Label>Sexo</Label>
                <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Escola / série</Label>
                <Input
                  value={form.school_grade}
                  onChange={(e) => set("school_grade", e.target.value)}
                />
              </div>
              <div>
                <Label>Data da matrícula</Label>
                <Input
                  type="date"
                  value={form.enrollment_date}
                  onChange={(e) => set("enrollment_date", e.target.value)}
                />
              </div>
              <div>
                <Label>Status da matrícula</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="arquivado">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Responsável</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={form.guardian_name}
                  onChange={(e) => set("guardian_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Parentesco</Label>
                <Input
                  value={form.guardian_relationship}
                  onChange={(e) => set("guardian_relationship", e.target.value)}
                  placeholder="Mãe, pai, avó..."
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={form.guardian_phone}
                  onChange={(e) => set("guardian_phone", e.target.value)}
                />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input
                  value={form.guardian_whatsapp}
                  onChange={(e) => set("guardian_whatsapp", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.guardian_email}
                  onChange={(e) => set("guardian_email", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Escolinha</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Modalidade</Label>
                <Select
                  value={form.modality_id}
                  onValueChange={(v) => {
                    set("modality_id", v);
                    set("class_id", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(modalities.data ?? []).filter((m) => !m.archived || m.id === form.modality_id).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Turma</Label>
                <Select
                  value={form.class_id}
                  onValueChange={(v) => {
                    set("class_id", v);
                    const c = availableClasses.find((x) => x.id === v);
                    if (c && !form.monthly_fee) set("monthly_fee", String(c.price));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — {formatDays(c.days)} ({c.available_spots} vagas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDays(selectedClass.days)} ·{" "}
                    {formatTimeRange(selectedClass.start_time, selectedClass.end_time)} ·{" "}
                    {selectedClass.teacher_name ?? "sem professor"}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Valor da mensalidade (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.monthly_fee}
                  onChange={(e) => set("monthly_fee", e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
