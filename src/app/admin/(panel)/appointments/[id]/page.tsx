"use client";

import { Suspense } from "react";
import { notFound, useParams } from "next/navigation";
import { AppointmentPage } from "../../../components/crm/AppointmentPage";

/**
 * `/admin/appointments/new` — новая запись, `/admin/appointments/<id>` — существующая.
 * Вкладки и фокус задаются в query string, поэтому на любую часть записи можно дать прямую ссылку.
 */
export default function AdminAppointmentRoute() {
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const id = isNew ? null : Number(params.id);
  if (!isNew && (!Number.isInteger(id) || (id as number) < 1)) notFound();

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-white/10 bg-slate-900/60" />}>
      <AppointmentPage appointmentId={id} />
    </Suspense>
  );
}
