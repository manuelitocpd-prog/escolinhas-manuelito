import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Escolinhas Colégio Manuelito" },
      {
        name: "description",
        content: "Acesso restrito à equipe administrativa das escolinhas do Colégio Manuelito.",
      },
      { property: "og:title", content: "Entrar — Escolinhas Colégio Manuelito" },
      { property: "og:description", content: "Acesso restrito à equipe administrativa." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/painel", replace: true });
  }, [loading, session, navigate]);

  async function signIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Não foi possível entrar. Tente novamente.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0592D9] to-[#600DAD] px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary">COLÉGIO MANUELITO</p>
        <h1 className="mt-2 text-2xl font-bold">Escolinhas Colégio Manuelito</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestão de alunos, turmas, pagamentos e atividades
        </p>

        <Button className="mt-8 w-full" size="lg" onClick={signIn} disabled={busy}>
          {busy ? "Abrindo o Google..." : "Entrar com Google"}
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Acesso restrito à equipe autorizada. O primeiro acesso recebe perfil de administrador; os
          demais entram como colaboradores.
        </p>
      </div>
    </div>
  );
}
