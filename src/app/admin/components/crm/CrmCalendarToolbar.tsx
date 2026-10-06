"use client";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin } from "lucide-react";
import { Button } from "@/shadcn/button";
import { CRM_LOCATIONS, CRM_LOCATION_LABELS, type CrmLocationCode } from "../../_lib/crmLocations";
import type { CrmAppointment } from "../../_lib/crmTypes";
import { CalendarPhoneSearch } from "./CalendarPhoneSearch";

export type CalendarViewType = "timeGridDay" | "timeGridWeek" | "dayGridMonth";
const VIEWS: { id: CalendarViewType; label: string }[] = [
  { id: "timeGridDay", label: "День" }, { id: "timeGridWeek", label: "Неделя" }, { id: "dayGridMonth", label: "Месяц" },
];
type Props = {
  title: string; view: CalendarViewType; location: CrmLocationCode;
  onLocationChange: (location: CrmLocationCode) => void; mobile?: boolean;
  onToday: () => void; onPrev: () => void; onNext: () => void;
  onViewChange: (view: CalendarViewType) => void; onCreate: () => void; onPickDate?: () => void;
  /** Выбрана запись в результатах поиска по телефону. */
  onPickAppointment: (appointment: CrmAppointment) => void;
};

export function CrmCalendarToolbar({ title, view, location, onLocationChange, mobile = false, onToday, onPrev, onNext, onViewChange, onCreate, onPickDate, onPickAppointment }: Props) {
  return <div className="crm-cal-toolbar space-y-4 border-b border-white/[0.07] p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4 text-emerald-400" />
        <span className="sr-only">Филиал</span><select value={location} onChange={event => onLocationChange(event.target.value as CrmLocationCode)} className="min-h-10 rounded-lg border border-white/10 bg-[#182232] px-3 text-sm font-medium text-slate-100">
          {CRM_LOCATIONS.map(code => <option key={code} value={code}>{CRM_LOCATION_LABELS[code]}</option>)}
        </select>
      </label>
      <CalendarPhoneSearch onPick={onPickAppointment} className="order-last w-full sm:order-none sm:max-w-sm sm:flex-1" />
      <Button onClick={onCreate} className="h-10 rounded-xl bg-emerald-400 px-4 font-semibold text-slate-950 hover:bg-emerald-300"><Plus className="h-4 w-4" />Новая запись</Button>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button aria-label="Предыдущий период" variant="ghost" size="icon" onClick={onPrev} className="h-10 w-10 text-slate-400"><ChevronLeft className="h-5 w-5" /></Button>
          <Button aria-label="Следующий период" variant="ghost" size="icon" onClick={onNext} className="h-10 w-10 text-slate-400"><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <h2 className="!mb-0 text-base font-semibold capitalize tracking-tight text-slate-100 sm:text-lg" aria-live="polite">{title}</h2>
        <Button variant="outline" onClick={onToday} className="h-9 rounded-lg border-white/10 bg-transparent text-xs text-slate-300">Сегодня</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onPickDate && <Button variant="ghost" onClick={onPickDate} className="h-10 text-sm text-slate-400"><CalendarDays className="h-4 w-4" />{mobile ? "Выбрать дату" : "Обзор дня"}</Button>}
        {!mobile && <div role="group" aria-label="Вид календаря" className="flex rounded-xl bg-slate-950/50 p-1">
          {VIEWS.map(({id, label}) => <button key={id} type="button" aria-pressed={view === id} onClick={() => onViewChange(id)} className={`min-h-9 rounded-lg px-4 text-sm font-medium transition-colors ${view === id ? 'bg-[#263346] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>{label}</button>)}
        </div>}
      </div>
    </div>
  </div>;
}
