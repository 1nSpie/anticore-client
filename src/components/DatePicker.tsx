"use client";

import { cn } from "src/lib/utils";
import { Input } from "@/shadcn/input";

/** ISO date string YYYY-MM-DD */
export type IsoDateString = string;

function dateToIso(d: Date): IsoDateString {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DatePickerProps = {
  value?: IsoDateString;
  onChange: (value: IsoDateString) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  toDate?: Date;
  fromDate?: Date;
  id?: string;
  theme?: "light" | "dark" | "cabinet";
};

export function DatePicker({
  value = "",
  onChange,
  disabled,
  className,
  triggerClassName,
  toDate,
  fromDate,
  id,
  theme,
}: DatePickerProps) {
  const isLight = theme === "light";

  return (
    <Input
      type="date"
      id={id}
      value={value}
      disabled={disabled}
      min={fromDate ? dateToIso(fromDate) : undefined}
      max={toDate ? dateToIso(toDate) : undefined}
      onChange={(e) => onChange(e.target.value)}
      style={{ colorScheme: isLight ? "light" : "dark" }}
      className={cn(
        "native-date-picker block w-full",
        "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
        !isLight &&
          "[&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:invert",
        triggerClassName,
        className,
      )}
    />
  );
}

export const BIRTH_DATE_FROM = new Date(1920, 0, 1);
export const BIRTH_DATE_TO = new Date();
