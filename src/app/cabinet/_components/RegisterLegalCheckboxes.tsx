"use client";

import Link from "next/link";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Checkbox } from "@/shadcn/checkbox";
import { Scale } from "lucide-react";
import { LEGAL_ROUTES } from "../_lib/legalConstants";
import {
  cabinetLink,
  cabinetCardSoft,
  cabinetLabel,
  cabinetError,
  cabinetHint,
} from "../_lib/cabinetUi";
import type { z } from "zod";
import type { registerSchema } from "../_lib/schemas";

type RegForm = z.infer<typeof registerSchema>;

type Props = {
  control: Control<RegForm>;
  errors: FieldErrors<RegForm>;
};

function LegalCheckbox({
  id,
  checked,
  onChange,
  children,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="flex items-start gap-3 cursor-pointer text-sm text-slate-300 leading-relaxed"
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onChange(v === true)}
          className="mt-0.5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-500 border-white/25 bg-slate-950/80"
        />
        <span>{children}</span>
      </label>
      {error && <p className={`${cabinetError} pl-7`}>{error}</p>}
    </div>
  );
}

export function RegisterLegalCheckboxes({ control, errors }: Props) {
  const hasError =
    errors.acceptPrivacyPolicy ||
    errors.acceptPersonalDataConsent ||
    errors.acceptTerms;

  return (
    <div className={`${cabinetCardSoft} space-y-4`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 border border-white/10">
          <Scale className="h-4 w-4 text-slate-400" />
        </span>
        <div>
          <p className={`text-sm font-medium ${cabinetLabel}`}>Юридические условия</p>
          <p className={cabinetHint}>Обязательно для регистрации (152-ФЗ)</p>
        </div>
      </div>

      <div className="space-y-3 pl-0 sm:pl-1">
        <Controller
          name="acceptPrivacyPolicy"
          control={control}
          render={({ field }) => (
            <LegalCheckbox
              id="acceptPrivacyPolicy"
              checked={field.value === true}
              onChange={field.onChange}
              error={errors.acceptPrivacyPolicy?.message}
            >
              Ознакомлен(а) с{" "}
              <Link
                href={LEGAL_ROUTES.privacyPolicy}
                target="_blank"
                className={cabinetLink}
              >
                Политикой конфиденциальности
              </Link>
            </LegalCheckbox>
          )}
        />

        <Controller
          name="acceptPersonalDataConsent"
          control={control}
          render={({ field }) => (
            <LegalCheckbox
              id="acceptPersonalDataConsent"
              checked={field.value === true}
              onChange={field.onChange}
              error={errors.acceptPersonalDataConsent?.message}
            >
              Даю{" "}
              <Link
                href={LEGAL_ROUTES.personalDataConsent}
                target="_blank"
                className={cabinetLink}
              >
                согласие на обработку персональных данных
              </Link>
            </LegalCheckbox>
          )}
        />

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <LegalCheckbox
              id="acceptTerms"
              checked={field.value === true}
              onChange={field.onChange}
              error={errors.acceptTerms?.message}
            >
              Принимаю{" "}
              <Link href={LEGAL_ROUTES.terms} target="_blank" className={cabinetLink}>
                Пользовательское соглашение
              </Link>
            </LegalCheckbox>
          )}
        />
      </div>

      {hasError && !errors.acceptPrivacyPolicy?.message && (
        <p className={cabinetError}>Отметьте все три пункта, чтобы продолжить</p>
      )}
    </div>
  );
}
