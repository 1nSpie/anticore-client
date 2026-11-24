import { Suspense } from "react";
import { CrmCalendar } from "../../components/crm/CrmCalendar";

export default function AdminCalendarPage() {
  // Календарь читает вид, день и филиал из query string — для этого нужен Suspense
  return (
    <Suspense fallback={<div className="min-h-[50vh] animate-pulse rounded-xl border border-white/10 bg-[#111a27]" />}>
      <CrmCalendar />
    </Suspense>
  );
}
