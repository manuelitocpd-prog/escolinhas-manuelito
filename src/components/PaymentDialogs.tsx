import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { formatCurrency, formatMonth, todayISO } from "@/lib/format";
import { usePaymentMethods, useSettings, useStudents, type PaymentRow } from "@/lib/data";

export function RegisterPaymentDialog({
  payment,
  trigger,
}: {
  payment: PaymentRow;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [paidAt, setPaidAt] = useState(todayISO());
  const [methodId, setMethodId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const methods = usePaymentMethods();
  const queryClient = useQueryClient();

  async function save() {
    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("monthly_payments")
      .update({
        paid_at: paidAt,
        payment_method_id: methodId || null,
        notes: notes || null,
        recorded_by: userData.user?.id ?? null,
      })
      .eq("id", payment.id);
    setBusy(false);
    if (error) {
      toast.error("Não foi possível registrar o pagamento.");
      return;
    }
    await logAudit({
      entity: "monthly_payments",
      entityId: payment.id,
      action: "pagamento_registrado",
      description: `Pagamento de ${formatCurrency(payment.amount)} (${formatMonth(
        payment.reference_month,
      )}) registrado para ${payment.students?.name ?? "aluno"}.`,
    });
    await queryClient.invalidateQueries();
    setOpen(false);
    toast.success("✅ Pagamento registrado com sucesso. Aluno liberado para frequentar as atividades.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button size="sm">Registrar pagamento</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            {payment.students?.name} — {formatMonth(payment.reference_month)} ·{" "}
            {formatCurrency(payment.amount)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="paidAt">Data do pagamento</Label>
            <Input id="paidAt" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div>
            <Label>Forma de pagamento</Label>
            <Select value={methodId} onValueChange={setMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {(methods.data ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="obs">Observação</Label>
            <Textarea id="obs" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Registrar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewChargeDialog({
  studentId,
  trigger,
}: {
  studentId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState(studentId ?? "");
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const students = useStudents();
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();

  const selected = (students.data ?? []).find((s) => s.id === student);

  function autoFill(nextMonth: string, studentValue: string) {
    const s = (students.data ?? []).find((x) => x.id === studentValue);
    if (s?.monthly_fee != null && !amount) setAmount(String(s.monthly_fee));
    const day = String(settings?.finance.default_due_day ?? 10).padStart(2, "0");
    setDueDate(`${nextMonth}-${day}`);
  }

  async function save() {
    if (!student || !month || !dueDate) {
      toast.error("Informe aluno, mês e vencimento.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("monthly_payments").insert({
      student_id: student,
      enrollment_id: selected?.enrollment_id ?? null,
      reference_month: `${month}-01`,
      amount: Number(amount || selected?.monthly_fee || 0),
      due_date: dueDate,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar a mensalidade.");
      return;
    }
    await logAudit({
      entity: "monthly_payments",
      action: "mensalidade_criada",
      description: `Mensalidade de ${formatMonth(`${month}-01`)} criada para ${selected?.name ?? "aluno"}.`,
    });
    await queryClient.invalidateQueries();
    setOpen(false);
    toast.success("Mensalidade criada.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) autoFill(month, student);
      }}
    >
      <DialogTrigger asChild>{trigger ?? <Button>+ Nova mensalidade</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova mensalidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!studentId ? (
            <div>
              <Label>Aluno</Label>
              <Select
                value={student}
                onValueChange={(v) => {
                  setStudent(v);
                  autoFill(month, v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {(students.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="mes">Mês de referência</Label>
              <Input
                id="mes"
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  autoFill(e.target.value, student);
                }}
              />
            </div>
            <div>
              <Label htmlFor="venc">Vencimento</Label>
              <Input
                id="venc"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={selected?.monthly_fee ? String(selected.monthly_fee) : "0,00"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Criar mensalidade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
