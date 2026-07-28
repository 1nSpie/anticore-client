"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { Input } from "@/shadcn/input";
import {
  formatPhoneRuInput,
  PHONE_RU_INPUT_PREFIX,
} from "@/lib/phoneRu";
import { cn } from "src/lib/utils";

type Props = ComponentProps<typeof Input>;

const PREFIX_LEN = PHONE_RU_INPUT_PREFIX.length;

export const PhoneRuInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      className,
      onChange,
      onFocus,
      onKeyDown,
      onPaste,
      value,
      defaultValue,
      placeholder = "+79_________",
      disabled,
      ...props
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLInputElement | null>(null);

    const setRef = useCallback(
      (el: HTMLInputElement | null) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    const applyFormatted = (raw: string, cursorFromEnd?: number) => {
      const formatted = formatPhoneRuInput(raw);
      const el = innerRef.current;
      if (el) {
        el.value = formatted;
        const pos =
          cursorFromEnd !== undefined
            ? Math.max(PREFIX_LEN, formatted.length - cursorFromEnd)
            : Math.max(PREFIX_LEN, formatted.length);
        requestAnimationFrame(() => el.setSelectionRange(pos, pos));
      }
      return formatted;
    };

    const emitChange = (el: HTMLInputElement) => {
      onChange?.({
        target: el,
        currentTarget: el,
      } as ChangeEvent<HTMLInputElement>);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const before = e.target.value;
      const selStart = e.target.selectionStart ?? before.length;
      const cursorFromEnd = before.length - selStart;
      applyFormatted(before, cursorFromEnd);
      emitChange(e.target);
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      if (e.target.value.length < PREFIX_LEN) {
        e.target.value = PHONE_RU_INPUT_PREFIX;
        requestAnimationFrame(() =>
          e.target.setSelectionRange(PREFIX_LEN, PREFIX_LEN),
        );
      }
      onFocus?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;

      if (
        (e.key === "Backspace" && start <= PREFIX_LEN && end <= PREFIX_LEN) ||
        (e.key === "Delete" && start < PREFIX_LEN)
      ) {
        e.preventDefault();
        requestAnimationFrame(() => el.setSelectionRange(PREFIX_LEN, PREFIX_LEN));
      }

      if (e.key === "Home") {
        e.preventDefault();
        requestAnimationFrame(() => el.setSelectionRange(PREFIX_LEN, PREFIX_LEN));
      }

      onKeyDown?.(e);
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      const pasted = e.clipboardData.getData("text");
      const start = Math.max(el.selectionStart ?? PREFIX_LEN, PREFIX_LEN);
      const end = Math.max(el.selectionEnd ?? PREFIX_LEN, PREFIX_LEN);
      const next = el.value.slice(0, start) + pasted + el.value.slice(end);
      applyFormatted(next);
      emitChange(el);
      onPaste?.(e);
    };

    const isControlled = value !== undefined;
    const resolvedValue = isControlled
      ? formatPhoneRuInput(String(value ?? ""))
      : undefined;
    const resolvedDefault = !isControlled
      ? formatPhoneRuInput(String(defaultValue ?? PHONE_RU_INPUT_PREFIX))
      : undefined;

    return (
      <Input
        ref={setRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={placeholder}
        className={cn(className)}
        disabled={disabled}
        value={resolvedValue}
        defaultValue={resolvedDefault}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...props}
      />
    );
  },
);

PhoneRuInput.displayName = "PhoneRuInput";
