import { RecordActions } from "@/components/RecordActions";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSession, useRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/audit";
import { saveSetting, useLeadSources, usePaymentMethods, useSettings } from "@/lib/data";
import { MESSAGE_LABEL, type MessageKind } from "@/lib/messages";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Escolinhas Colégio Manuelito" },
      { name: "description", content: "Dados do colégio, mensagens de WhatsApp, formas de pagamento e usuários." },
      { property: "og:title", content: "Configurações — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Ajustes gerais do sistema das escolinhas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  const { data } = useSettings();
  const { user } = useSession();
  const { isAdmin } = useRole(user);
  const qc = useQueryClient();
  const [school, setSchool] = useState(data?.school);
  const [finance, setFinance] = useState(data?.finance);
  const [messages, setMessages] = useState(data?.messages);

  useEffect(() => {
    if (data) { setSchool(data.school); setFinance(data.finance); setMessages(data.messages); }
  }, [data]);

  async function save(key: string, value: unknown) {
    try {
      await saveSetting(key, value);
      await logAudit({ entity: "settings", action: "update", description: `Configuração "${key}" alterada` });
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configurações salvas.");
    } catch (e) { toast.error((e as Error).message); }
  }

  if (!school || !finance || !messages) return <p className="text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-4">
      <PageHeader title="Configurações" subtitle="Ajustes gerais do sistema" />

      <Card>
        <CardHeader><CardTitle>Dados do colégio</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Nome</Label><Input value={school.name} onChange={(e) => setSchool({ ...school, name: e.target.value })} /></div>
          <div><Label>Endereço da logo (URL)</Label><Input value={school.logo_url} onChange={(e) => setSchool({ ...school, logo_url: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={school.phone} onChange={(e) => setSchool({ ...school, phone: e.target.value })} /></div>
          <div><Label>E-mail</Label><Input value={school.email} onChange={(e) => setSchool({ ...school, email: e.target.value })} /></div>
          <div className="sm:col-span-2"><Button onClick={() => save("school", school)}>Salvar dados do colégio</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Dias de antecedência para “próximo vencimento”</Label><Input type="number" min={1} value={finance.due_soon_days} onChange={(e) => setFinance({ ...finance, due_soon_days: Number(e.target.value) })} /></div>
          <div><Label>Dia de vencimento padrão</Label><Input type="number" min={1} max={28} value={finance.default_due_day} onChange={(e) => setFinance({ ...finance, default_due_day: Number(e.target.value) })} /></div>
          <div className="sm:col-span-2"><Button onClick={() => save("finance", finance)}>Salvar financeiro</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens de WhatsApp</CardTitle>
          <p className="text-sm text-muted-foreground">Marcadores: [NOME DO RESPONSÁVEL], [NOME DO ALUNO], [MODALIDADE], [MÊS], [DATA], [VALOR]. O envio é sempre manual.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(MESSAGE_LABEL) as MessageKind[]).map((k) => (
            <div key={k}><Label>{MESSAGE_LABEL[k]}</Label><Textarea rows={8} value={messages[k]} onChange={(e) => setMessages({ ...messages, [k]: e.target.value })} /></div>
          ))}
          <Button onClick={() => save("messages", messages)}>Salvar mensagens</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimpleList title="Formas de pagamento" table="payment_methods" query={usePaymentMethods()} />
        <SimpleList title="Origens do interesse" table="lead_sources" query={useLeadSources()} />
      </div>

      <UsersCard isAdmin={isAdmin} currentUserId={user?.id ?? null} />
    </div>
  );
}

function SimpleList({ title, table, query }: { title: string; table: "payment_methods" | "lead_sources"; query: { data?: { id: string; name: string; active: boolean }[] | undefined } }) {
  const [name, setName] = useState("");
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: [table] });
  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from(table).insert({ name: name.trim() });
    if (error) return toast.error(error.message);
    setName(""); refresh();
  }
  async function toggle(id: string, active: boolean) {
    const { error } = await supabase.from(table).update({ active }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  }
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {(query.data ?? []).map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span className={r.active ? "" : "text-muted-foreground line-through"}>{r.name}</span>
            <div className="flex items-center gap-1">
              <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id, v)} />
              <RecordActions entity={table === "payment_methods" ? "payment_method" : "lead_source"} id={r.id} name={r.name} archived={!r.active} />
            </div>
          </div>
        ))}
        <div className="flex gap-2"><Input placeholder="Adicionar" value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={add}>Adicionar</Button></div>
      </CardContent>
    </Card>
  );
}

function UsersCard({ isAdmin, currentUserId }: { isAdmin: boolean; currentUserId: string | null }) {
  const qc = useQueryClient();
  const users = useQuery({
    queryKey: ["users_roles"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (error) throw error;
      return (profiles ?? []).map((p) => ({
        ...p,
        isAdmin: (roles ?? []).some((r) => r.user_id === p.id && r.role === "admin"),
      }));
    },
  });

  async function setAdmin(userId: string, admin: boolean) {
    const res = admin
      ? await supabase.from("user_roles").insert({ user_id: userId, role: "admin" })
      : await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (res.error) return toast.error(res.error.message);
    await logAudit({ entity: "user_roles", entityId: userId, action: admin ? "grant_admin" : "revoke_admin", description: admin ? "Tornou administrador" : "Removeu administrador" });
    toast.success("Permissão atualizada.");
    qc.invalidateQueries({ queryKey: ["users_roles"] });
    qc.invalidateQueries({ queryKey: ["role"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários e permissões</CardTitle>
        <p className="text-sm text-muted-foreground">Novos usuários entram como Colaborador. {isAdmin ? "" : "Somente administradores podem alterar permissões."}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {(users.data ?? []).map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <div><div className="font-medium">{u.full_name ?? u.email}</div><div className="text-muted-foreground">{u.email}</div></div>
            <div className="flex items-center gap-2">
              <span>{u.isAdmin ? "Administrador" : "Colaborador"}</span>
              <Switch disabled={!isAdmin || u.id === currentUserId} checked={u.isAdmin} onCheckedChange={(v) => setAdmin(u.id, v)} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
