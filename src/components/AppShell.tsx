import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useRole, useSession } from "@/hooks/useAuth";

const NAV = [
  { to: "/painel", label: "Dashboard", icon: Home },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/matriculas", label: "Novas Matrículas", icon: GraduationCap },
  { to: "/modalidades", label: "Modalidades", icon: Trophy },
  { to: "/professores", label: "Professores", icon: UserCheck },
  { to: "/turmas", label: "Turmas", icon: CalendarDays },
  { to: "/quadro", label: "Quadro de Escolinhas", icon: BarChart3 },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/comunicacao", label: "Comunicação", icon: MessageCircle },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/pdfs", label: "PDFs", icon: FileText },
  { to: "/entrada", label: "Controle de Entrada", icon: ShieldCheck },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { role } = useRole(user);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {open ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-5 py-5">
          <div>
            <p className="font-display text-base leading-tight font-bold">Escolinhas</p>
            <p className="text-sm leading-tight text-sidebar-foreground/70">Colégio Manuelito</p>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border px-4 py-4 text-xs text-sidebar-foreground/70">
          <p className="truncate font-medium text-sidebar-foreground">{user?.email}</p>
          <p className="capitalize">{role ?? "—"}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="mt-2 w-full justify-start px-0 text-sidebar-foreground/80 hover:bg-transparent hover:text-sidebar-foreground"
          >
            <LogOut className="mr-2 size-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary"
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">Pesquisar aluno, responsável, modalidade ou professor</span>
          </button>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
