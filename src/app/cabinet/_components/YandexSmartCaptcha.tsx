"use client";

import { useEffect, useId, useRef, type MutableRefObject } from "react";

const SCRIPT_ID = "yandex-smartcaptcha-script";
const SCRIPT_SRC =
  "https://smartcaptcha.cloud.yandex.ru/captcha.js?render=onload";

type SmartCaptchaApi = {
  render: (
    container: HTMLElement | string,
    params: {
      sitekey: string;
      callback?: (token: string) => void;
      hl?: string;
      invisible?: boolean;
      hideShield?: boolean;
    },
  ) => number;
  reset: (widgetId?: number) => void;
  destroy: (widgetId?: number) => void;
  subscribe: (
    widgetId: number,
    event: string,
    callback: (...args: unknown[]) => void,
  ) => () => void;
};

declare global {
  interface Window {
    smartCaptcha?: SmartCaptchaApi;
  }
}

function loadSmartCaptchaScript(): Promise<SmartCaptchaApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window unavailable"));
  }
  if (window.smartCaptcha) {
    return Promise.resolve(window.smartCaptcha);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      const started = Date.now();
      const timer = window.setInterval(() => {
        if (window.smartCaptcha) {
          window.clearInterval(timer);
          resolve(window.smartCaptcha);
        } else if (Date.now() - started > 15000) {
          window.clearInterval(timer);
          reject(new Error("SmartCaptcha load timeout"));
        }
      }, 50);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.smartCaptcha) {
        resolve(window.smartCaptcha);
      } else {
        reject(new Error("SmartCaptcha API missing after load"));
      }
    };
    script.onerror = () => reject(new Error("SmartCaptcha script failed"));
    document.head.appendChild(script);
  });
}

type Props = {
  sitekey: string;
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  /** Imperative reset via ref callback from parent */
  resetRef?: MutableRefObject<(() => void) | null>;
};

export function YandexSmartCaptcha({
  sitekey,
  onSuccess,
  onExpire,
  onError,
  resetRef,
}: Props) {
  const reactId = useId();
  const containerId = `smartcaptcha-${reactId.replace(/:/g, "")}`;
  const widgetIdRef = useRef<number | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  onSuccessRef.current = onSuccess;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    const unsubs: Array<() => void> = [];

    void loadSmartCaptchaScript()
      .then((api) => {
        if (cancelled) return;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = "";
        const widgetId = api.render(container, {
          sitekey,
          hl: "ru",
          callback: (token) => {
            onSuccessRef.current(token);
          },
        });
        widgetIdRef.current = widgetId;

        if (resetRef) {
          resetRef.current = () => {
            api.reset(widgetId);
          };
        }

        unsubs.push(
          api.subscribe(widgetId, "token-expired", () => {
            onExpireRef.current?.();
          }),
        );
        unsubs.push(
          api.subscribe(widgetId, "network-error", () => {
            onErrorRef.current?.();
          }),
        );
        unsubs.push(
          api.subscribe(widgetId, "javascript-error", () => {
            onErrorRef.current?.();
          }),
        );
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current?.();
      });

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
      if (resetRef) resetRef.current = null;
      const id = widgetIdRef.current;
      if (id != null && window.smartCaptcha) {
        try {
          window.smartCaptcha.destroy(id);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = null;
    };
  }, [containerId, sitekey, resetRef]);

  return (
    <div
      className="smartcaptcha-host w-full overflow-hidden rounded-xl border border-white/10 bg-[#0f172a] leading-none [&_iframe]:!block [&_iframe]:!max-w-full [&_iframe]:!bg-[#0f172a]"
      style={{ colorScheme: "dark" }}
    >
      <div id={containerId} className="min-h-[100px] w-full bg-[#0f172a]" />
    </div>
  );
}
