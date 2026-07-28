"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CABINET_TOKEN_KEY } from "../_lib/api";
import { CabinetNav } from "../_components/CabinetNav";
import { PageSkeleton } from "../_components/PageSkeleton";
import { CabinetPageHeader } from "../_components/CabinetPageHeader";

export default function CabinetDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(CABINET_TOKEN_KEY)) {
      router.replace("/cabinet/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <CabinetPageHeader
        eyebrow="Личный кабинет"
        description="Управляйте профилем, следите за заявками, историей обслуживания и настройками уведомлений."
      />

      <div className="lg:hidden">
        <CabinetNav variant="bar" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside className="hidden lg:block w-full lg:w-60 xl:w-64 shrink-0">
          <CabinetNav variant="sidebar" />
        </aside>
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
