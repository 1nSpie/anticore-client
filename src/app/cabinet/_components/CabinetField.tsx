import { Label } from "@/shadcn/label";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { cabinetError, cabinetHint, cabinetLabel } from "../_lib/cabinetUi";

type CabinetFieldProps = {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
};

export function CabinetField({
  label,
  id,
  hint,
  error,
  icon: Icon,
  children,
  className,
}: CabinetFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cabinetLabel}>
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
        )}
        {children}
      </div>
      {error ? (
        <p className={cabinetError} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={cabinetHint}>{hint}</p>
      ) : null}
    </div>
  );
}
