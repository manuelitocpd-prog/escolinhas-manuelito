import { RecordActions } from "@/components/RecordActions";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Pencil, Plus } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { useClasses, useLeadSources, useLeads, useModalities, useSettings } from "@/lib/data";
import { calcAge, formatCurrency, formatDate, formatDays, formatTimeRange, todayISO } from "@/lib/format";
import { LEAD_STATUS, TRIAL_STATUS } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/matriculas")({
  head: () => ({
    meta: [
      { title: "Novas Matrículas — Escolinhas Colégio Manuelito" },
      { name: "description", content: "Acompanhe interessados e confirme novas matrículas nas escolinhas." },
      { property: "og:title", content: "Novas Matrículas — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Interessados, aula experimental e confirmação de matrícula." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatriculasPage,
});

const ALL = "todos";
const NONE = "nenhum";

type Lead = {
  id?: string;
  student_name: string;
  birth_date: string | null;
  gender: string | null;
  school_grade: string | null;
  student_notes: string | null;
  guardian_name: string | null;
  guardian_relationship: string | null;
  guardian_cpf: string | null;
  guardian_phone: string | null;
  guardian_whatsapp: string | null;
  guardian_email: string | null;
  guardian_address: string | null;
  modality_id: string | null;
  class_id: string | null;
  source: string | null;
  status: string;
  trial_status: string | null;
  trial_date: string | null;
  trial_notes: string | null;
  converted_student_id?: string | null;
  created_at?: string;
};

const EMPTY: Lead = {
  student_name: "", birth_date: null, gender: null, school_grade: null, student_notes: null,
  guardian_name: null, guardian_relationship: null, guardian_cpf: null, guardian_phone: null,
  guardian_whatsapp: null, guardian_email: null, guardian_address: null, modality_id: null,
  class_id: null, source: null, status: "interessado", trial_status: null, trial_date: null, trial_notes: null,
};

function MatriculasPage() {
  const leads = useLeads();
  const modalities = useModalities();
  const classes = useClasses();
  const qc = useQueryClient();
  const { data: settings } = useSettings();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [modality, setModality] = useState(ALL);
  const [klass, setKlass] = useState(ALL);
  const [month, setMonth] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      (leads.data ?? []).filter((l) => {
        if (search && !`${l.student_name} ${l.guardian_name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (status !== ALL && l.status !== status) return false;
        if (modality !== ALL && l.modality_id !== modality) return false;
        if (klass !== ALL && l.class_id !== klass) return false;
        if (month && !String(l.created_at).startsWith(month)) return false;
        return true;
      }),
    [leads.data, search, status, modality, klass, month],
  );

  const thisMonth = todayISO().slice(0, 7);
  const all = leads.data ?? [];
  const summary = {
    interessados: all.filter((l) => l.status === "interessado" || l.status === "iniciado").length,
    aguardando: all.filter((l) => l.status === "aguardando_pagamento").length,
    confirmadas: all.filter((l) => l.status === "confirmada" && String(l.updated_at).startsWith(thisMonth)).length,
  };

  async function confirm(lead: (typeof all)[number]) {
    if (!lead.modality_id) return toast.error("Escolha a modalidade antes de confirmar.");
    setConfirming(lead.id);
    try {
      // Reutiliza responsável existente (mesmo CPF ou mesmo nome + telefone)
      let guardianId: string | null = null;
      if (lead.guardian_name) {
        let q = supabase.from("guardians").select("id").limit(1);
        q = lead.guardian_cpf ? q.eq("cpf", lead.guardian_cpf) : q.ilike("name", lead.guardian_name);
        const { data: g } = await q;
        if (g && g[0]) guardianId = g[0].id;
        else {
          const { data: ng, error } = await supabase.from("guardians").insert({
            name: lead.guardian_name, relationship: lead.guardian_relationship, cpf: lead.guardian_cpf,
            phone: lead.guardian_phone, whatsapp: lead.guardian_whatsapp, email: lead.guardian_email,
            address: lead.guardian_address,
          }).select("id").single();
          if (error) throw error;
          guardianId = ng.id;
        }
      }
      // Reutiliza aluno existente (mesmo nome e nascimento)
      let studentId: string;
      let sq = supabase.from("students").select("id").ilike("name", lead.student_name).limit(1);
      if (lead.birth_date) sq = sq.eq("birth_date", lead.birth_date);
      const { data: s } = await sq;
      if (s && s[0]) {
        studentId = s[0].id;
        await supabase.from("students").update({ status: "ativo", guardian_id: guardianId }).eq("id", studentId);
      } else {
        const { data: ns, error } = await supabase.from("students").insert({
          name: lead.student_name, birth_date: lead.birth_date, gender: lead.gender,
          school_grade: lead.school_grade, notes: lead.student_notes, guardian_id: guardianId,
          enrollment_date: todayISO(), status: "ativo",
        }).select("id").single();
        if (error) throw error;
        studentId = ns.id;
      }
      const cls = (classes.data ?? []).find((c) => c.id === lead.class_id);
      const mod = (modalities.data ?? []).find((m) => m.id === lead.modality_id);
      const fee = Number(cls?.price ?? mod?.default_price ?? 0);
      await supabase.from("enrollments").update({ active: false, end_date: todayISO() }).eq("student_id", studentId).eq("active", true);
      const { data: en, error: enErr } = await supabase.from("enrollments").insert({
        student_id: studentId, modality_id: lead.modality_id, class_id: lead.class_id, monthly_fee: fee, start_date: todayISO(),
      }).select("id").single();
      if (enErr) throw enErr;
      const dueDay = settings?.finance.default_due_day ?? 10;
      const now = new Date();
      const due = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, 28));
      const pad = (n: number) => String(n).padStart(2, "0");
      const { error: pErr } = await supabase.from("monthly_payments").insert({
        student_id: studentId, enrollment_id: en.id,
        reference_month: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`,
        amount: fee, due_date: `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`,
      });
      if (pErr) throw pErr;
      await supabase.from("leads").update({ status: "confirmada", converted_student_id: studentId }).eq("id", lead.id);
      await logAudit({ entity: "students", entityId: studentId, action: "matricula_confirmada", description: `Matrícula confirmada a partir de interessado (${mod?.name ?? ""})` });
      toast.success("✅ Matrícula confirmada. Aluno cadastrado e mensalidade criada.");
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Novas Matrículas"
        subtitle="Interessados, aula experimental e confirmação"
        actions={<Button onClick={() => setEditing({ ...EMPTY })}><Plus className="mr-1 size-4" /> Nova matrícula</Button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[["🟡 Interessados", summary.interessados], ["🟠 Aguardando confirmação", summary.aguardando], ["🟢 Confirmadas este mês", summary.confirmadas]].map(([l, v]) => (
          <Card key={String(l)}><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{l}</p><p className="text-3xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-5">
          <Input placeholder="Buscar aluno ou responsável" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              {Object.entries(LEAD_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={modality} onValueChange={setModality}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as modalidades</SelectItem>
              {(modalities.data ?? []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={klass} onValueChange={setKlass}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as turmas</SelectItem>
              {(classes.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-secondary text-left">
              <tr>{["Aluno", "Responsável", "Modalidade / Turma", "Origem", "Aula experimental", "Status", "Cadastro", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{l.student_name}</td>
                  <td className="px-3 py-2">{l.guardian_name ?? "—"}</td>
                  <td className="px-3 py-2">{(l.modalities as { name: string } | null)?.name ?? "—"}{l.classes ? ` · ${(l.classes as { name: string }).name}` : ""}</td>
                  <td className="px-3 py-2">{l.source ?? "—"}</td>
                  <td className="px-3 py-2">{l.trial_status ? `${TRIAL_STATUS[l.trial_status] ?? l.trial_status}${l.trial_date ? ` · ${formatDate(l.trial_date)}` : ""}` : "—"}</td>
                  <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${LEAD_STATUS[l.status]?.className ?? ""}`}>{LEAD_STATUS[l.status]?.label ?? l.status}</span></td>
                  <td className="px-3 py-2">{formatDate(String(l.created_at).slice(0, 10))}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <RecordActions entity="lead" id={l.id} name={l.student_name} onEdit={() => setEditing(l as Lead)} />
                      {l.status !== "confirmada" ? (
                        <Button size="sm" disabled={confirming === l.id} onClick={() => confirm(l)}><CheckCircle2 className="mr-1 size-4" /> Confirmar matrícula</Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Nenhuma matrícula encontrada.</td></tr> : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editing ? <LeadDialog lead={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

function LeadDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [form, setForm] = useState<Lead>(lead);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const modalities = useModalities();
  const classes = useClasses();
  const sources = useLeadSources();
  const qc = useQueryClient();
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setForm((f) => ({ ...f, [k]: v }));
  const txt = (k: keyof Lead) => ({
    value: (form[k] as string | null) ?? "",
    onChange: (e: { target: { value: string } }) => set(k, (e.target.value || null) as never),
  });
  const available = (classes.data ?? []).filter((c) => c.modality_id === form.modality_id && c.status === "ativa");

  async function save() {
    if (!form.student_name.trim()) return toast.error("Informe o nome do aluno.");
    setSaving(true);
    const { id } = form;
    const keys = Object.keys(EMPTY) as (keyof Lead)[];
    const payload = Object.fromEntries(keys.map((k) => [k, form[k] ?? null])) as typeof EMPTY & { student_name: string; status: string };
    const res = id ? await supabase.from("leads").update(payload).eq("id", id) : await supabase.from("leads").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await logAudit({ entity: "leads", entityId: id ?? null, action: id ? "update" : "create", description: `Matrícula de ${form.student_name}` });
    toast.success("Matrícula salva.");
    qc.invalidateQueries({ queryKey: ["leads"] });
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{form.id ? "Editar matrícula" : "Nova matrícula"} — etapa {step} de 3</DialogTitle></DialogHeader>
        <div className="mb-2 flex gap-2">
          {["Aluno", "Responsável", "Escolinha"].map((s, i) => (
            <Button key={s} size="sm" variant={step === i + 1 ? "default" : "outline"} onClick={() => setStep(i + 1)}>{i + 1}. {s}</Button>
          ))}
        </div>

        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Nome do aluno *</Label><Input value={form.student_name} onChange={(e) => set("student_name", e.target.value)} /></div>
            <div><Label>Nascimento</Label><Input type="date" {...txt("birth_date")} /></div>
            <div><Label>Idade</Label><Input disabled value={calcAge(form.birth_date) ?? ""} /></div>
            <div><Label>Sexo</Label>
              <Select value={form.gender ?? NONE} onValueChange={(v) => set("gender", v === NONE ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>—</SelectItem><SelectItem value="feminino">Feminino</SelectItem><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Escola / série</Label><Input {...txt("school_grade")} /></div>
            <div className="sm:col-span-2"><Label>Observações</Label><Textarea {...txt("student_notes")} /></div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Nome do responsável</Label><Input {...txt("guardian_name")} /></div>
            <div><Label>Parentesco</Label><Input {...txt("guardian_relationship")} /></div>
            <div><Label>CPF</Label><Input {...txt("guardian_cpf")} /></div>
            <div><Label>Telefone</Label><Input {...txt("guardian_phone")} /></div>
            <div><Label>WhatsApp</Label><Input {...txt("guardian_whatsapp")} /></div>
            <div><Label>E-mail</Label><Input type="email" {...txt("guardian_email")} /></div>
            <div className="sm:col-span-2"><Label>Endereço</Label><Input {...txt("guardian_address")} /></div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Modalidade</Label>
              <Select value={form.modality_id ?? NONE} onValueChange={(v) => setForm((f) => ({ ...f, modality_id: v === NONE ? null : v, class_id: null }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>—</SelectItem>{(modalities.data ?? []).filter((m) => !m.archived).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Origem do interesse</Label>
              <Select value={form.source ?? NONE} onValueChange={(v) => set("source", v === NONE ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>—</SelectItem>{(sources.data ?? []).filter((s) => s.active).map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Turmas disponíveis</Label>
              <div className="mt-1 grid gap-2">
                {available.map((c) => (
                  <button type="button" key={c.id} onClick={() => set("class_id", c.id)}
                    className={`rounded-lg border p-3 text-left text-sm ${form.class_id === c.id ? "border-primary bg-primary/10" : "border-border"}`}>
                    <div className="font-semibold">{c.name} {c.available_spots <= 0 ? "· 🔴 TURMA LOTADA" : ""}</div>
                    <div className="text-muted-foreground">{formatDays(c.days)} · {formatTimeRange(c.start_time, c.end_time)} · {c.teacher_name ?? "Sem professor"} · {formatCurrency(c.price)} · {c.available_spots} vaga(s)</div>
                  </button>
                ))}
                {form.modality_id && available.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma turma ativa para esta modalidade.</p> : null}
              </div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(LEAD_STATUS).filter(([k]) => k !== "confirmada").map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Aula experimental</Label>
              <Select value={form.trial_status ?? NONE} onValueChange={(v) => set("trial_status", v === NONE ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={NONE}>Não solicitada</SelectItem>{Object.entries(TRIAL_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Data da aula experimental</Label><Input type="date" {...txt("trial_date")} /></div>
            <div><Label>Observação da aula</Label><Input {...txt("trial_notes")} /></div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          {step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Voltar</Button> : null}
          {step < 3 ? <Button variant="outline" onClick={() => setStep(step + 1)}>Próxima etapa</Button> : null}
          <Button disabled={saving} onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
