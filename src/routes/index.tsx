import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Escolinhas Colégio Manuelito — Gestão das escolinhas esportivas" },
      {
        name: "description",
        content:
          "Sistema de gestão das escolinhas esportivas do Colégio Manuelito: alunos, turmas, mensalidades e aptidão para frequentar.",
      },
      { property: "og:title", content: "Escolinhas Colégio Manuelito" },
      {
        property: "og:description",
        content: "Gestão de alunos, turmas, pagamentos e atividades das escolinhas esportivas.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/painel", replace: true });
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-[#0592D9] to-[#600DAD] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#F2EF72]">
            COLÉGIO MANUELITO
          </p>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Escolinhas Colégio Manuelito</h1>
          <p className="mt-4 text-lg text-white/85">
            Gestão de alunos, turmas, pagamentos e atividades
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="bg-white text-[#0b2340] hover:bg-white/90">
              <Link to="/auth">Entrar no sistema</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Quem pode frequentar",
            text: "Situação de aptidão calculada automaticamente a partir das mensalidades.",
          },
          {
            icon: CalendarDays,
            title: "Turmas e horários",
            text: "Modalidades, professores, vagas e quadro semanal sempre atualizados.",
          },
          {
            icon: Wallet,
            title: "Mensalidades",
            text: "Histórico financeiro completo, lembretes e registro de pagamentos.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-6">
            <item.icon className="size-6 text-primary" />
            <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
