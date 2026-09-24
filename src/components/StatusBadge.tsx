import { cn } from "@/lib/utils";
import { APTITUDE, type Aptitude } from "@/lib/status";

export function AptitudeBadge({
  aptitude,
  full = false,
  className,
}: {
  aptitude: Aptitude;
  full?: boolean;
  className?: string;
}) {
  const info = APTITUDE[aptitude] ?? APTITUDE.inativo;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        info.className,
        className,
      )}
    >
      {full ? info.label : info.short}
    </span>
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        "bg-secondary text-secondary-foreground border-border",
        className,
      )}
    >
      {children}
    </span>
  );
}
