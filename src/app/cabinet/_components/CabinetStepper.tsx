import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Step = { id: number; label: string };

type CabinetStepperProps = {
  steps: Step[];
  current: number;
  className?: string;
};

export function CabinetStepper({ steps, current, className }: CabinetStepperProps) {
  return (
    <nav aria-label="Шаги регистрации" className={cn("mb-8", className)}>
      <ol className="flex items-center gap-2 sm:gap-0">
        {steps.map((step, i) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done && "bg-teal-500 text-white",
                    active && "bg-teal-500/20 text-teal-300 ring-2 ring-teal-500/50",
                    !done && !active && "bg-slate-800 text-slate-500 border border-white/10",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium truncate",
                    active ? "text-white" : done ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block flex-1 h-px mx-3",
                    done ? "bg-teal-500/50" : "bg-white/10",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
