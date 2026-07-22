"use client";

import { cabinetCard, cabinetSkeleton } from "../_lib/cabinetUi";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "auth" | "dashboard";
};

export function PageSkeleton({ variant = "auth" }: Props) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className={`h-3 w-24 ${cabinetSkeleton}`} />
          <div className={`h-9 w-64 max-w-full ${cabinetSkeleton}`} />
          <div className={`h-4 w-96 max-w-full ${cabinetSkeleton}`} />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`hidden lg:block w-64 h-72 ${cabinetCard}`}>
            <div className={`h-full ${cabinetSkeleton} m-4`} />
          </div>
          <div className={`flex-1 h-80 ${cabinetCard}`}>
            <div className={`h-full ${cabinetSkeleton} m-4`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(cabinetCard, "max-w-md mx-auto space-y-4 animate-pulse")}>
      <div className={`h-8 w-2/3 ${cabinetSkeleton}`} />
      <div className={`h-4 w-full ${cabinetSkeleton}`} />
      <div className={`h-11 w-full ${cabinetSkeleton}`} />
      <div className={`h-11 w-full ${cabinetSkeleton}`} />
      <div className={`h-11 w-full ${cabinetSkeleton}`} />
    </div>
  );
}
