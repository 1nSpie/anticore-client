import { cn } from "@/lib/utils";
import { cabinetEyebrow, cabinetH1, cabinetMuted } from "../_lib/cabinetUi";

type CabinetPageHeaderProps = {
  eyebrow?: string;
  description?: string;
  className?: string;
};

export function CabinetPageHeader({
  eyebrow,
  description,
  className,
}: CabinetPageHeaderProps) {
  return (
    <header className={cn("mb-6 sm:mb-8", className)}>
      {eyebrow && <p className={`${cabinetEyebrow} mb-2`}>{eyebrow}</p>}
      {description && <p className={`${cabinetMuted} mt-2 max-w-xl`}>{description}</p>}
    </header>
  );
}
